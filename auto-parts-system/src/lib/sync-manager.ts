import axios from 'axios';
import { logger } from './logger';
import { DatabaseManager } from './database';
import { getDataPath } from './utils';

export interface SyncConfig {
  clutchBackendUrl: string;
  apiKey?: string;
  syncInterval: number; // in minutes
  autoSyncEnabled: boolean;
  conflictResolution: 'local' | 'remote' | 'manual';
  batchSize: number;
  retryAttempts: number;
  retryDelay: number; // in milliseconds
}

export interface SyncStatus {
  isRunning: boolean;
  lastSync: string | null;
  nextSync: string | null;
  totalRecords: number;
  syncedRecords: number;
  failedRecords: number;
  errors: string[];
  currentOperation: string | null;
}

export interface SyncRecord {
  id: string;
  table: string;
  action: 'create' | 'update' | 'delete';
  localData: any;
  remoteData?: any;
  status: 'pending' | 'syncing' | 'synced' | 'failed' | 'conflict';
  error?: string;
  createdAt: string;
  updatedAt: string;
  retryCount: number;
}

export interface ConflictResolution {
  recordId: string;
  table: string;
  localData: any;
  remoteData: any;
  resolution: 'local' | 'remote' | 'merge';
  mergedData?: any;
  resolvedBy: number;
  resolvedAt: string;
}

export class SyncManager {
  private db: DatabaseManager;
  private config: SyncConfig;
  private syncInterval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private status: SyncStatus;

  constructor(databaseManager?: DatabaseManager) {
    this.db = databaseManager || new DatabaseManager();
    this.config = {
      clutchBackendUrl: 'https://clutch-main-nk7x.onrender.com',
      syncInterval: 30, // 30 minutes
      autoSyncEnabled: true,
      conflictResolution: 'local',
      batchSize: 100,
      retryAttempts: 3,
      retryDelay: 5000
    };
    this.status = {
      isRunning: false,
      lastSync: null,
      nextSync: null,
      totalRecords: 0,
      syncedRecords: 0,
      failedRecords: 0,
      errors: [],
      currentOperation: null
    };
  }

  async initialize(): Promise<void> {
    try {
      logger.info('Sync Manager initializing...');
      await this.createSyncTables();
      await this.loadConfig();
      await this.startAutoSync();
      logger.info('Sync Manager initialized successfully');
    } catch (error) {
      logger.error('Sync Manager initialization failed:', error);
      // Don't throw error, just log it and continue
    }
  }

  /**
   * Create sync-related tables
   */
  private async createSyncTables(): Promise<void> {
    const tables = [
      // Sync queue table
      `CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY,
        table_name TEXT NOT NULL,
        action TEXT NOT NULL,
        local_data TEXT NOT NULL,
        remote_data TEXT,
        status TEXT DEFAULT 'pending',
        error_message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        retry_count INTEGER DEFAULT 0
      )`,

      // Sync log table
      `CREATE TABLE IF NOT EXISTS sync_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sync_id TEXT NOT NULL,
        table_name TEXT NOT NULL,
        record_id TEXT NOT NULL,
        action TEXT NOT NULL,
        status TEXT NOT NULL,
        error_message TEXT,
        sync_duration_ms INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Conflict resolution table
      `CREATE TABLE IF NOT EXISTS sync_conflicts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        record_id TEXT NOT NULL,
        table_name TEXT NOT NULL,
        local_data TEXT NOT NULL,
        remote_data TEXT NOT NULL,
        resolution TEXT,
        merged_data TEXT,
        resolved_by INTEGER,
        resolved_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (resolved_by) REFERENCES users (id)
      )`,

      // Sync configuration table
      `CREATE TABLE IF NOT EXISTS sync_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    for (const table of tables) {
      try {
        await this.db.exec(table);
      } catch (error) {
        logger.error('Error creating sync table:', error);
        throw error;
      }
    }

    logger.info('Sync tables created successfully');
  }

  /**
   * Load sync configuration from database
   */
  private async loadConfig(): Promise<void> {
    try {
      // Check if database is initialized
      if (!this.db) {
        logger.warn('Database not initialized, skipping config load');
        return;
      }

      // Check if sync_config table exists, if not create it
      await this.db.exec(`
        CREATE TABLE IF NOT EXISTS sync_config (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      const configRecords = await this.db.query('SELECT key, value FROM sync_config');
      
      for (const record of configRecords) {
        switch (record.key) {
          case 'clutch_backend_url':
            this.config.clutchBackendUrl = record.value;
            break;
          case 'api_key':
            this.config.apiKey = record.value;
            break;
          case 'sync_interval':
            this.config.syncInterval = parseInt(record.value);
            break;
          case 'auto_sync_enabled':
            this.config.autoSyncEnabled = record.value === 'true';
            break;
          case 'conflict_resolution':
            this.config.conflictResolution = record.value as 'local' | 'remote' | 'manual';
            break;
          case 'batch_size':
            this.config.batchSize = parseInt(record.value);
            break;
          case 'retry_attempts':
            this.config.retryAttempts = parseInt(record.value);
            break;
          case 'retry_delay':
            this.config.retryDelay = parseInt(record.value);
            break;
        }
      }

      logger.info('Sync configuration loaded');

    } catch (error) {
      logger.error('Failed to load sync configuration:', error);
    }
  }

  /**
   * Save sync configuration to database
   */
  async saveConfig(config: Partial<SyncConfig>): Promise<void> {
    try {
      const configUpdates = [
        { key: 'clutch_backend_url', value: config.clutchBackendUrl || this.config.clutchBackendUrl },
        { key: 'api_key', value: config.apiKey || this.config.apiKey || '' },
        { key: 'sync_interval', value: (config.syncInterval || this.config.syncInterval).toString() },
        { key: 'auto_sync_enabled', value: (config.autoSyncEnabled !== undefined ? config.autoSyncEnabled : this.config.autoSyncEnabled).toString() },
        { key: 'conflict_resolution', value: config.conflictResolution || this.config.conflictResolution },
        { key: 'batch_size', value: (config.batchSize || this.config.batchSize).toString() },
        { key: 'retry_attempts', value: (config.retryAttempts || this.config.retryAttempts).toString() },
        { key: 'retry_delay', value: (config.retryDelay || this.config.retryDelay).toString() }
      ];

      for (const update of configUpdates) {
        await this.db.exec(
          'INSERT OR REPLACE INTO sync_config (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
          [update.key, update.value]
        );
      }

      // Update local config
      Object.assign(this.config, config);

      // Restart auto sync if interval changed
      if (config.syncInterval || config.autoSyncEnabled !== undefined) {
        await this.stopAutoSync();
        await this.startAutoSync();
      }

      logger.info('Sync configuration saved');

    } catch (error) {
      logger.error('Failed to save sync configuration:', error);
      throw error;
    }
  }

  /**
   * Start automatic sync
   */
  private async startAutoSync(): Promise<void> {
    if (!this.config.autoSyncEnabled) {
      return;
    }

    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    const intervalMs = this.config.syncInterval * 60 * 1000;
    this.syncInterval = setInterval(async () => {
      try {
        await this.sync();
      } catch (error) {
        logger.error('Auto sync failed:', error);
      }
    }, intervalMs);

    // Calculate next sync time
    this.status.nextSync = new Date(Date.now() + intervalMs).toISOString();

    logger.info(`Auto sync started with ${this.config.syncInterval} minute interval`);
  }

  /**
   * Stop automatic sync
   */
  async stopAutoSync(): Promise<void> {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.status.nextSync = null;
    logger.info('Auto sync stopped');
  }

  /**
   * Perform full sync
   */
  async sync(): Promise<SyncStatus> {
    if (this.isRunning) {
      logger.warn('Sync already running, skipping');
      return this.status;
    }

    this.isRunning = true;
    this.status.isRunning = true;
    this.status.currentOperation = 'Starting sync';
    this.status.errors = [];

    const startTime = Date.now();

    try {
      logger.info('Starting sync process');

      // 1. Upload local changes to remote
      await this.uploadLocalChanges();

      // 2. Download remote changes
      await this.downloadRemoteChanges();

      // 3. Process conflicts
      await this.processConflicts();

      // 4. Update sync status
      this.status.lastSync = new Date().toISOString();
      this.status.isRunning = false;
      this.status.currentOperation = null;

      const duration = Date.now() - startTime;
      logger.info(`Sync completed successfully in ${duration}ms`);

    } catch (error) {
      this.status.isRunning = false;
      this.status.currentOperation = null;
      this.status.errors.push(error instanceof Error ? error.message : String(error));
      logger.error('Sync failed:', error);
    }

    return this.status;
  }

  /**
   * Upload local changes to remote server
   */
  private async uploadLocalChanges(): Promise<void> {
    this.status.currentOperation = 'Uploading local changes';

    const pendingRecords = await this.db.query(`
      SELECT * FROM sync_queue 
      WHERE status = 'pending' 
      ORDER BY created_at ASC 
      LIMIT ?
    `, [this.config.batchSize]);

    for (const record of pendingRecords) {
      try {
        await this.db.exec(
          'UPDATE sync_queue SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          ['syncing', record.id]
        );

        const localData = JSON.parse(record.local_data);
        let result;

        switch (record.action) {
          case 'create':
            result = await this.createRemoteRecord(record.table_name, localData);
            break;
          case 'update':
            result = await this.updateRemoteRecord(record.table_name, record.id, localData);
            break;
          case 'delete':
            result = await this.deleteRemoteRecord(record.table_name, record.id);
            break;
        }

        await this.db.exec(
          'UPDATE sync_queue SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          ['synced', record.id]
        );

        this.status.syncedRecords++;

      } catch (error) {
        await this.db.exec(
          'UPDATE sync_queue SET status = ?, error_message = ?, retry_count = retry_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          ['failed', error instanceof Error ? error.message : String(error), record.id]
        );

        this.status.failedRecords++;
        this.status.errors.push(`Failed to sync ${record.table_name}:${record.id} - ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  /**
   * Download remote changes
   */
  private async downloadRemoteChanges(): Promise<void> {
    this.status.currentOperation = 'Downloading remote changes';

    try {
      // Get last sync timestamp
      const lastSync = await this.db.get(
        'SELECT MAX(created_at) as last_sync FROM sync_log WHERE status = "synced"'
      );

      const lastSyncTime = lastSync?.last_sync || new Date(0).toISOString();

      // Fetch remote changes
      const response = await axios.get(`${this.config.clutchBackendUrl}/api/sync/changes`, {
        params: {
          since: lastSyncTime,
          limit: this.config.batchSize
        },
        headers: this.getAuthHeaders()
      });

      const remoteChanges = response.data.data || [];

      for (const change of remoteChanges) {
        try {
          await this.applyRemoteChange(change);
          this.status.syncedRecords++;
        } catch (error) {
          this.status.failedRecords++;
          this.status.errors.push(`Failed to apply remote change ${change.table}:${change.id} - ${error instanceof Error ? error.message : String(error)}`);
        }
      }

    } catch (error) {
      logger.error('Failed to download remote changes:', error);
      throw error;
    }
  }

  /**
   * Process sync conflicts
   */
  private async processConflicts(): Promise<void> {
    this.status.currentOperation = 'Processing conflicts';

    const conflicts = await this.db.query(`
      SELECT * FROM sync_conflicts 
      WHERE resolution IS NULL
    `);

    for (const conflict of conflicts) {
      try {
        const resolution = await this.resolveConflict(conflict);
        await this.applyConflictResolution(conflict, resolution);
      } catch (error) {
        logger.error('Failed to resolve conflict:', error);
        this.status.errors.push(`Failed to resolve conflict ${conflict.record_id}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  /**
   * Resolve a conflict based on configuration
   */
  private async resolveConflict(conflict: any): Promise<ConflictResolution> {
    const localData = JSON.parse(conflict.local_data);
    const remoteData = JSON.parse(conflict.remote_data);

    let resolution: 'local' | 'remote' | 'merge';
    let mergedData;

    switch (this.config.conflictResolution) {
      case 'local':
        resolution = 'local';
        break;
      case 'remote':
        resolution = 'remote';
        break;
      case 'manual':
        // For manual resolution, we'll default to local for now
        // In a real implementation, this would require user intervention
        resolution = 'local';
        break;
      default:
        resolution = 'local';
    }

    return {
      recordId: conflict.record_id,
      table: conflict.table_name,
      localData,
      remoteData,
      resolution,
      mergedData,
      resolvedBy: 1, // System user
      resolvedAt: new Date().toISOString()
    };
  }

  /**
   * Apply conflict resolution
   */
  private async applyConflictResolution(conflict: any, resolution: ConflictResolution): Promise<void> {
    const dataToApply = resolution.resolution === 'local' ? resolution.localData : resolution.remoteData;

    // Update local database
    await this.updateLocalRecord(conflict.table_name, conflict.record_id, dataToApply);

    // Update conflict record
    await this.db.exec(
      `UPDATE sync_conflicts 
       SET resolution = ?, merged_data = ?, resolved_by = ?, resolved_at = ?
       WHERE id = ?`,
      [
        resolution.resolution,
        resolution.mergedData ? JSON.stringify(resolution.mergedData) : null,
        resolution.resolvedBy,
        resolution.resolvedAt,
        conflict.id
      ]
    );
  }

  /**
   * Queue a record for sync
   */
  async queueForSync(table: string, action: 'create' | 'update' | 'delete', data: any, recordId?: string): Promise<void> {
    try {
      const syncId = recordId || `${table}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await this.db.exec(
        `INSERT INTO sync_queue (id, table_name, action, local_data, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [syncId, table, action, JSON.stringify(data), 'pending']
      );

      this.status.totalRecords++;

      logger.info(`Queued ${action} for ${table}:${syncId}`);

    } catch (error) {
      logger.error('Failed to queue record for sync:', error);
      throw error;
    }
  }

  /**
   * Get sync status
   */
  async getSyncStatus(): Promise<SyncStatus> {
    try {
      // Get queue statistics
      const queueStats = await this.db.get(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'synced' THEN 1 ELSE 0 END) as synced,
          SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
        FROM sync_queue
      `);

      this.status.totalRecords = queueStats?.total || 0;
      this.status.syncedRecords = queueStats?.synced || 0;
      this.status.failedRecords = queueStats?.failed || 0;

      return this.status;

    } catch (error) {
      logger.error('Failed to get sync status:', error);
      return this.status;
    }
  }

  /**
   * Get sync queue
   */
  async getSyncQueue(limit: number = 100, offset: number = 0): Promise<SyncRecord[]> {
    try {
      const records = await this.db.query(`
        SELECT * FROM sync_queue 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `, [limit, offset]);

      return records.map((record: any) => ({
        id: record.id,
        table: record.table_name,
        action: record.action,
        localData: JSON.parse(record.local_data),
        remoteData: record.remote_data ? JSON.parse(record.remote_data) : undefined,
        status: record.status,
        error: record.error_message,
        createdAt: record.created_at,
        updatedAt: record.updated_at,
        retryCount: record.retry_count
      }));

    } catch (error) {
      logger.error('Failed to get sync queue:', error);
      return [];
    }
  }

  /**
   * Get sync conflicts
   */
  async getSyncConflicts(): Promise<any[]> {
    try {
      const conflicts = await this.db.query(`
        SELECT * FROM sync_conflicts 
        WHERE resolution IS NULL
        ORDER BY created_at DESC
      `);

      return conflicts.map((conflict: any) => ({
        id: conflict.id,
        recordId: conflict.record_id,
        table: conflict.table_name,
        localData: JSON.parse(conflict.local_data),
        remoteData: JSON.parse(conflict.remote_data),
        resolution: conflict.resolution,
        mergedData: conflict.merged_data ? JSON.parse(conflict.merged_data) : undefined,
        resolvedBy: conflict.resolved_by,
        resolvedAt: conflict.resolved_at,
        createdAt: conflict.created_at
      }));

    } catch (error) {
      logger.error('Failed to get sync conflicts:', error);
      return [];
    }
  }

  // Helper methods for remote operations
  private async createRemoteRecord(table: string, data: any): Promise<any> {
    const response = await axios.post(
      `${this.config.clutchBackendUrl}/api/sync/${table}`,
      data,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  private async updateRemoteRecord(table: string, id: string, data: any): Promise<any> {
    const response = await axios.put(
      `${this.config.clutchBackendUrl}/api/sync/${table}/${id}`,
      data,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  private async deleteRemoteRecord(table: string, id: string): Promise<any> {
    const response = await axios.delete(
      `${this.config.clutchBackendUrl}/api/sync/${table}/${id}`,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  private async applyRemoteChange(change: any): Promise<void> {
    const { table, action, data, id } = change;

    switch (action) {
      case 'create':
        await this.createLocalRecord(table, data);
        break;
      case 'update':
        await this.updateLocalRecord(table, id, data);
        break;
      case 'delete':
        await this.deleteLocalRecord(table, id);
        break;
    }

    // Log the sync operation
    await this.db.exec(
      `INSERT INTO sync_log (sync_id, table_name, record_id, action, status, created_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [id, table, id, action, 'synced']
    );
  }

  private async createLocalRecord(table: string, data: any): Promise<void> {
    // Implementation depends on table structure
    // This is a simplified version
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = columns.map(() => '?').join(', ');

    await this.db.exec(
      `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`,
      values
    );
  }

  private async updateLocalRecord(table: string, id: string, data: any): Promise<void> {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const setClause = columns.map(col => `${col} = ?`).join(', ');

    await this.db.exec(
      `UPDATE ${table} SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
  }

  private async deleteLocalRecord(table: string, id: string): Promise<void> {
    await this.db.exec(`DELETE FROM ${table} WHERE id = ?`, [id]);
  }

  private getAuthHeaders(): any {
    const headers: any = {
      'Content-Type': 'application/json'
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    return headers;
  }

  /**
   * Test connection to remote server
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.config.clutchBackendUrl}/api/health`, {
        headers: this.getAuthHeaders(),
        timeout: 10000
      });

      return response.status === 200;

    } catch (error) {
      logger.error('Connection test failed:', error);
      return false;
    }
  }

  /**
   * Stop sync manager
   */
  async stop(): Promise<void> {
    await this.stopAutoSync();
    this.isRunning = false;
    logger.info('Sync manager stopped');
  }
}
