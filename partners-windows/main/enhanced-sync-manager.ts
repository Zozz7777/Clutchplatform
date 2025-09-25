import { io, Socket } from 'socket.io-client';
import { DatabaseManager } from './database';

interface SyncOperation {
  operationId: string;
  entityType: string;
  entityId: string;
  operationType: 'create' | 'update' | 'delete' | 'sync';
  data: any;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'conflict';
  timestamp: string;
  retryCount: number;
}

interface ConflictData {
  operationId: string;
  entityType: string;
  entityId: string;
  localData: any;
  serverData: any;
  localTimestamp: string;
  serverTimestamp: string;
  resolution: 'pending' | 'local_wins' | 'server_wins' | 'merged';
}

export class EnhancedSyncManager {
  private socket: Socket | null = null;
  private database: DatabaseManager;
  private syncInterval: NodeJS.Timeout | null = null;
  private isOnline: boolean = false;
  private partnerId: string = '';
  private deviceId: string = '';
  private apiUrl: string = 'https://clutch-main-nk7x.onrender.com';
  private syncQueue: SyncOperation[] = [];
  private isSyncing: boolean = false;
  private lastSyncTimestamp: string | null = null;
  private retryCount: number = 0;
  private maxRetries: number = 3;
  private conflictResolutionStrategy: 'local_wins' | 'server_wins' | 'manual' = 'local_wins';
  private pendingOperations: SyncOperation[] = [];
  private conflicts: ConflictData[] = [];

  constructor() {
    this.database = new DatabaseManager();
  }

  async initialize() {
    // Get partner and device info from settings
    this.partnerId = await this.database.getSetting('partner_id') || '';
    this.deviceId = await this.database.getSetting('device_id') || '';
    this.lastSyncTimestamp = await this.database.getSetting('last_sync_timestamp') || null;

    if (this.partnerId && this.deviceId) {
      await this.connectToSyncServer();
      await this.startSyncInterval();
      await this.loadPendingOperations();
      await this.loadConflicts();
    }
  }

  // Connect to WebSocket for real-time sync
  private async connectToSyncServer() {
    try {
      this.socket = io(`${this.apiUrl}/ws/partners/${this.partnerId}`, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        auth: {
          deviceId: this.deviceId,
          token: await this.database.getSetting('auth_token')
        }
      });

      this.socket.on('connect', () => {
        console.log('Connected to sync server');
        this.isOnline = true;
        this.retryCount = 0;
        // Trigger immediate sync when connection is restored
        this.syncPendingOperations();
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from sync server');
        this.isOnline = false;
      });

      this.socket.on('new_order', (order) => {
        this.handleNewOrder(order);
      });

      this.socket.on('payment_update', (payment) => {
        this.handlePaymentUpdate(payment);
      });

      this.socket.on('sync_conflict', (conflict) => {
        this.handleSyncConflict(conflict);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Sync connection error:', error instanceof Error ? error.message : String(error));
        this.isOnline = false;
      });

    } catch (error) {
      console.error('Failed to connect to sync server:', error instanceof Error ? error.message : String(error));
      this.isOnline = false;
    }
  }

  // Load pending operations from database
  private async loadPendingOperations() {
    try {
      const operations = await this.database.query(
        'SELECT * FROM sync_operations WHERE status IN (?, ?) ORDER BY created_at ASC',
        ['pending', 'failed']
      );
      this.pendingOperations = (operations || []).map(op => ({
        ...op,
        data: JSON.parse(op.data || '{}'),
        retryCount: op.retry_count || 0
      }));
    } catch (error) {
      console.error('Failed to load pending operations:', error instanceof Error ? error.message : String(error));
    }
  }

  // Load unresolved conflicts
  private async loadConflicts() {
    try {
      const conflicts = await this.database.query(
        'SELECT * FROM sync_conflicts WHERE resolution = ? ORDER BY created_at ASC',
        ['pending']
      );
      this.conflicts = (conflicts || []).map(conflict => ({
        ...conflict,
        localData: JSON.parse(conflict.local_data || '{}'),
        serverData: JSON.parse(conflict.server_data || '{}')
      }));
    } catch (error) {
      console.error('Failed to load conflicts:', error instanceof Error ? error.message : String(error));
    }
  }

  // Queue operation for sync
  async queueOperation(operation: Omit<SyncOperation, 'operationId' | 'status' | 'timestamp' | 'retryCount'>) {
    const syncOp: SyncOperation = {
      ...operation,
      operationId: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      timestamp: new Date().toISOString(),
      retryCount: 0
    };

    try {
      // Save to database
      await this.database.exec(
        `INSERT INTO sync_operations (
          operation_id, entity_type, entity_id, operation_type, 
          data, status, timestamp, retry_count, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          syncOp.operationId,
          syncOp.entityType,
          syncOp.entityId,
          syncOp.operationType,
          JSON.stringify(syncOp.data),
          syncOp.status,
          syncOp.timestamp,
          syncOp.retryCount
        ]
      );

      this.pendingOperations.push(syncOp);
      
      // Try immediate sync if online
      if (this.isOnline && !this.isSyncing) {
        await this.syncPendingOperations();
      }
    } catch (error) {
      console.error('Failed to queue operation:', error instanceof Error ? error.message : String(error));
    }
  }

  // Enhanced sync with conflict resolution
  async syncPendingOperations() {
    if (this.isSyncing || this.pendingOperations.length === 0) {
      return;
    }

    this.isSyncing = true;

    try {
      while (this.pendingOperations.length > 0 && this.isOnline) {
        const operation = this.pendingOperations[0];
        
        try {
          await this.processOperation(operation);
          this.pendingOperations.shift();
        } catch (error) {
          console.error('Failed to process operation:', error instanceof Error ? error.message : String(error));
          
          if (operation.retryCount < this.maxRetries) {
            operation.retryCount++;
            await this.updateOperationRetryCount(operation.operationId, operation.retryCount);
            await this.delay(1000 * operation.retryCount); // Exponential backoff
            continue;
          } else {
            // Mark as failed and move to next
            await this.markOperationFailed(operation);
            this.pendingOperations.shift();
          }
        }
      }

      // Update last sync timestamp
      this.lastSyncTimestamp = new Date().toISOString();
      await this.database.setSetting('last_sync_timestamp', this.lastSyncTimestamp);
      
    } finally {
      this.isSyncing = false;
    }
  }

  // Process individual operation with conflict detection
  private async processOperation(operation: SyncOperation) {
    try {
      // Mark as processing
      await this.updateOperationStatus(operation.operationId, 'processing');

      // Check for conflicts
      const conflict = await this.detectConflict(operation);
      if (conflict) {
        await this.resolveConflict(operation, conflict);
        return;
      }

      // Push to server
      const response = await this.pushOperationToServer(operation);
      
      if (response.success) {
        await this.updateOperationStatus(operation.operationId, 'completed');
      } else {
        throw new Error(response.error || 'Unknown error');
      }
    } catch (error) {
      await this.updateOperationStatus(operation.operationId, 'failed');
      throw error;
    }
  }

  // Detect conflicts by comparing timestamps and versions
  private async detectConflict(operation: SyncOperation): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/api/v1/partners/${this.partnerId}/sync/check-conflict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.database.getSetting('auth_token')}`
        },
        body: JSON.stringify({
          entityType: operation.entityType,
          entityId: operation.entityId,
          localTimestamp: operation.data.updated_at || operation.data.created_at,
          operationType: operation.operationType
        })
      });

      if (response.ok) {
        const result = await response.json();
        return result.data?.conflict || null;
      }
    } catch (error) {
      console.error('Failed to check for conflicts:', error instanceof Error ? error.message : String(error));
    }
    return null;
  }

  // Resolve conflicts based on strategy
  private async resolveConflict(operation: SyncOperation, conflict: any) {
    switch (this.conflictResolutionStrategy) {
      case 'local_wins':
        await this.resolveConflictLocalWins(operation, conflict);
        break;
      case 'server_wins':
        await this.resolveConflictServerWins(operation, conflict);
        break;
      case 'manual':
        await this.resolveConflictManual(operation, conflict);
        break;
    }
  }

  private async resolveConflictLocalWins(operation: SyncOperation, conflict: any) {
    // Force push local changes
    const response = await this.pushOperationToServer(operation, true);
    if (response.success) {
      await this.updateOperationStatus(operation.operationId, 'completed');
    } else {
      throw new Error('Failed to resolve conflict with local wins strategy');
    }
  }

  private async resolveConflictServerWins(operation: SyncOperation, conflict: any) {
    // Accept server version and update local
    await this.applyServerChanges(conflict.serverData);
    await this.updateOperationStatus(operation.operationId, 'completed');
  }

  private async resolveConflictManual(operation: SyncOperation, conflict: any) {
    // Mark for manual resolution
    await this.updateOperationStatus(operation.operationId, 'conflict');
    
    // Store conflict details
    const conflictData: ConflictData = {
      operationId: operation.operationId,
      entityType: operation.entityType,
      entityId: operation.entityId,
      localData: operation.data,
      serverData: conflict.serverData,
      localTimestamp: operation.timestamp,
      serverTimestamp: conflict.serverTimestamp,
      resolution: 'pending'
    };

    await this.database.exec(
      `INSERT INTO sync_conflicts (
        operation_id, entity_type, entity_id, local_data, server_data,
        local_timestamp, server_timestamp, resolution, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        conflictData.operationId,
        conflictData.entityType,
        conflictData.entityId,
        JSON.stringify(conflictData.localData),
        JSON.stringify(conflictData.serverData),
        conflictData.localTimestamp,
        conflictData.serverTimestamp,
        conflictData.resolution
      ]
    );

    this.conflicts.push(conflictData);
  }

  // Manual conflict resolution
  async resolveConflictManually(operationId: string, resolution: 'local_wins' | 'server_wins' | 'merged', mergedData?: any) {
    const conflict = this.conflicts.find(c => c.operationId === operationId);
    if (!conflict) {
      throw new Error('Conflict not found');
    }

    try {
      switch (resolution) {
        case 'local_wins':
          await this.pushOperationToServer({
            operationId,
            entityType: conflict.entityType,
            entityId: conflict.entityId,
            operationType: 'update',
            data: conflict.localData,
            status: 'pending',
            timestamp: new Date().toISOString(),
            retryCount: 0
          }, true);
          break;
        case 'server_wins':
          await this.applyServerChanges(conflict.serverData);
          break;
        case 'merged':
          if (mergedData) {
            await this.pushOperationToServer({
              operationId,
              entityType: conflict.entityType,
              entityId: conflict.entityId,
              operationType: 'update',
              data: mergedData,
              status: 'pending',
              timestamp: new Date().toISOString(),
              retryCount: 0
            }, true);
          }
          break;
      }

      // Update conflict resolution
      await this.database.exec(
        'UPDATE sync_conflicts SET resolution = ?, resolved_at = CURRENT_TIMESTAMP WHERE operation_id = ?',
        [resolution, operationId]
      );

      // Remove from conflicts array
      this.conflicts = this.conflicts.filter(c => c.operationId !== operationId);
      
    } catch (error) {
      console.error('Failed to resolve conflict manually:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  // Helper methods
  private async updateOperationStatus(operationId: string, status: string) {
    await this.database.exec(
      'UPDATE sync_operations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE operation_id = ?',
      [status, operationId]
    );
  }

  private async updateOperationRetryCount(operationId: string, retryCount: number) {
    await this.database.exec(
      'UPDATE sync_operations SET retry_count = ?, updated_at = CURRENT_TIMESTAMP WHERE operation_id = ?',
      [retryCount, operationId]
    );
  }

  private async markOperationFailed(operation: SyncOperation) {
    await this.updateOperationStatus(operation.operationId, 'failed');
  }

  private async pushOperationToServer(operation: SyncOperation, force: boolean = false) {
    const response = await fetch(`${this.apiUrl}/api/v1/partners/${this.partnerId}/sync/push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await this.database.getSetting('auth_token')}`
      },
      body: JSON.stringify({
        deviceId: this.deviceId,
        operation,
        force
      })
    });

    return await response.json();
  }

  private async applyServerChanges(serverData: any) {
    // Apply server changes to local database based on entity type
    try {
      switch (serverData.entityType) {
        case 'order':
          await this.database.exec(
            `INSERT OR REPLACE INTO orders (
              order_id, customer_id, customer_name, customer_phone, customer_email,
              items, subtotal, tax, discount, total, payment_method, payment_status,
              order_status, notes, created_by, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              serverData.order_id, serverData.customer_id, serverData.customer_name,
              serverData.customer_phone, serverData.customer_email, serverData.items,
              serverData.subtotal, serverData.tax, serverData.discount, serverData.total,
              serverData.payment_method, serverData.payment_status, serverData.order_status,
              serverData.notes, serverData.created_by, serverData.created_at, serverData.updated_at
            ]
          );
          break;
        case 'product':
          await this.database.exec(
            `INSERT OR REPLACE INTO products (
              sku, name, description, category, cost_price, sale_price,
              stock_quantity, min_stock, barcode, is_active, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              serverData.sku, serverData.name, serverData.description, serverData.category,
              serverData.cost_price, serverData.sale_price, serverData.stock_quantity,
              serverData.min_stock, serverData.barcode, serverData.is_active,
              serverData.created_at, serverData.updated_at
            ]
          );
          break;
      }
    } catch (error) {
      console.error('Failed to apply server changes:', error instanceof Error ? error.message : String(error));
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Start periodic sync
  private async startSyncInterval() {
    const interval = parseInt(await this.database.getSetting('sync_interval') || '30') * 60 * 1000;
    
    this.syncInterval = setInterval(async () => {
      if (this.isOnline) {
        await this.syncPendingOperations();
      }
    }, interval);
  }

  // Handle real-time events
  private async handleNewOrder(order: any) {
    try {
      await this.applyServerChanges({ ...order, entityType: 'order' });
      console.log('New order received and applied:', order.order_id);
    } catch (error) {
      console.error('Handle new order error:', error instanceof Error ? error.message : String(error));
    }
  }

  private async handlePaymentUpdate(payment: any) {
    try {
      await this.applyServerChanges({ ...payment, entityType: 'payment' });
      console.log('Payment update received and applied:', payment.payment_id);
    } catch (error) {
      console.error('Handle payment update error:', error instanceof Error ? error.message : String(error));
    }
  }

  private async handleSyncConflict(conflict: any) {
    try {
      await this.database.exec(
        `INSERT INTO sync_conflicts (
          operation_id, entity_type, entity_id, local_data, server_data,
          local_timestamp, server_timestamp, resolution, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          conflict.operationId, conflict.entityType, conflict.entityId,
          JSON.stringify(conflict.localData), JSON.stringify(conflict.serverData),
          conflict.localTimestamp, conflict.serverTimestamp, 'pending'
        ]
      );
      console.log('Sync conflict detected:', conflict.operationId);
    } catch (error) {
      console.error('Handle sync conflict error:', error instanceof Error ? error.message : String(error));
    }
  }

  // Get sync status
  async getStatus() {
    const pendingCount = this.pendingOperations.length;
    const conflictCount = this.conflicts.length;
    const lastSync = this.lastSyncTimestamp;

    return {
      isOnline: this.isOnline,
      pendingOperations: pendingCount,
      conflicts: conflictCount,
      lastSync: lastSync,
      partnerId: this.partnerId,
      deviceId: this.deviceId
    };
  }

  // Get conflicts for manual resolution
  getConflicts(): ConflictData[] {
    return this.conflicts;
  }

  // Set conflict resolution strategy
  setConflictResolutionStrategy(strategy: 'local_wins' | 'server_wins' | 'manual') {
    this.conflictResolutionStrategy = strategy;
  }

  // Stop sync manager
  async stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.isOnline = false;
  }
}
