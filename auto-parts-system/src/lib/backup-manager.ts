import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';
import { promisify } from 'util';
import { logger } from './logger';
import { DatabaseManager } from './database';
import { getDataPath, getLogsPath } from './utils';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

export interface BackupInfo {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'manual';
  size: number;
  created_at: string;
  description?: string;
  tables: string[];
  record_count: number;
}

export interface RestoreResult {
  success: boolean;
  restored_tables: string[];
  restored_records: number;
  errors: string[];
  duration_ms: number;
}

export interface ExportOptions {
  format: 'json' | 'csv' | 'excel';
  tables?: string[];
  include_media?: boolean;
  compress?: boolean;
}

export interface ImportOptions {
  format: 'json' | 'csv' | 'excel';
  merge_mode: 'replace' | 'merge' | 'skip_existing';
  validate_data?: boolean;
}

export class BackupManager {
  private db: DatabaseManager;
  private backupPath: string;
  private autoBackupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.db = new DatabaseManager();
    this.backupPath = path.join(getDataPath(), 'backups');
    this.ensureBackupDirectory();
  }

  async initialize(): Promise<void> {
    logger.info('Backup Manager initialized');
    await this.startAutoBackup();
  }

  /**
   * Ensure backup directory exists
   */
  private ensureBackupDirectory(): void {
    if (!fs.existsSync(this.backupPath)) {
      fs.mkdirSync(this.backupPath, { recursive: true });
      logger.info(`Created backup directory: ${this.backupPath}`);
    }
  }

  /**
   * Start automatic backup process
   */
  private async startAutoBackup(): Promise<void> {
    const interval = 24 * 60 * 60 * 1000; // 24 hours
    this.autoBackupInterval = setInterval(async () => {
      try {
        await this.createBackup('auto', 'full', 'Automatic daily backup');
        logger.info('Automatic backup completed');
      } catch (error) {
        logger.error('Automatic backup failed:', error);
      }
    }, interval);

    logger.info('Auto backup started (24-hour interval)');
  }

  /**
   * Stop automatic backup process
   */
  stopAutoBackup(): void {
    if (this.autoBackupInterval) {
      clearInterval(this.autoBackupInterval);
      this.autoBackupInterval = null;
      logger.info('Auto backup stopped');
    }
  }

  /**
   * Create a backup
   */
  async createBackup(
    name: string, 
    type: 'full' | 'incremental' | 'manual' = 'manual',
    description?: string
  ): Promise<BackupInfo> {
    const startTime = Date.now();
    const backupId = `backup_${Date.now()}`;
    const backupFileName = `${backupId}.json.gz`;
    const backupFilePath = path.join(this.backupPath, backupFileName);

    try {
      logger.info(`Creating ${type} backup: ${name}`);

      // Get all tables
      const tables = await this.getDatabaseTables();
      const backupData: any = {
        metadata: {
          id: backupId,
          name,
          type,
          description,
          created_at: new Date().toISOString(),
          version: '1.0.0',
          tables: tables
        },
        data: {}
      };

      let totalRecords = 0;

      // Export data from each table
      for (const table of tables) {
        try {
          const records = await this.db.query(`SELECT * FROM ${table}`);
          backupData.data[table] = records;
          totalRecords += records.length;
          logger.debug(`Exported ${records.length} records from ${table}`);
        } catch (error) {
          logger.warn(`Failed to export table ${table}:`, error);
          backupData.data[table] = [];
        }
      }

      // Compress and save backup
      const jsonData = JSON.stringify(backupData, null, 2);
      const compressedData = await gzip(Buffer.from(jsonData, 'utf8'));
      fs.writeFileSync(backupFilePath, compressedData);

      const backupInfo: BackupInfo = {
        id: backupId,
        name,
        type,
        size: compressedData.length,
        created_at: backupData.metadata.created_at,
        description,
        tables: tables,
        record_count: totalRecords
      };

      // Save backup metadata
      await this.saveBackupMetadata(backupInfo);

      const duration = Date.now() - startTime;
      logger.info(`Backup created successfully: ${name} (${totalRecords} records, ${(compressedData.length / 1024 / 1024).toFixed(2)} MB, ${duration}ms)`);

      return backupInfo;

    } catch (error) {
      logger.error('Backup creation failed:', error);
      throw error;
    }
  }

  /**
   * Restore from backup
   */
  async restoreBackup(backupId: string, options: { skip_errors?: boolean } = {}): Promise<RestoreResult> {
    const startTime = Date.now();
    const result: RestoreResult = {
      success: false,
      restored_tables: [],
      restored_records: 0,
      errors: [],
      duration_ms: 0
    };

    try {
      logger.info(`Restoring backup: ${backupId}`);

      // Find backup file
      const backupInfo = await this.getBackupInfo(backupId);
      if (!backupInfo) {
        throw new Error('Backup not found');
      }

      const backupFileName = `${backupId}.json.gz`;
      const backupFilePath = path.join(this.backupPath, backupFileName);

      if (!fs.existsSync(backupFilePath)) {
        throw new Error('Backup file not found');
      }

      // Read and decompress backup
      const compressedData = fs.readFileSync(backupFilePath);
      const decompressedData = await gunzip(compressedData);
      const backupData = JSON.parse(decompressedData.toString('utf8'));

      // Validate backup format
      if (!backupData.metadata || !backupData.data) {
        throw new Error('Invalid backup format');
      }

      // Restore data table by table
      for (const table of backupData.metadata.tables) {
        try {
          const records = backupData.data[table] || [];
          
          if (records.length === 0) {
            continue;
          }

          // Clear existing data (for full restore)
          if (backupData.metadata.type === 'full') {
            await this.db.exec(`DELETE FROM ${table}`);
          }

          // Insert records
          for (const record of records) {
            try {
              const columns = Object.keys(record);
              const values = Object.values(record);
              const placeholders = columns.map(() => '?').join(', ');
              
              await this.db.exec(
                `INSERT OR REPLACE INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`,
                values
              );
            } catch (error) {
              if (options.skip_errors) {
                result.errors.push(`Failed to restore record in ${table}: ${error instanceof Error ? error.message : String(error)}`);
              } else {
                throw error;
              }
            }
          }

          result.restored_tables.push(table);
          result.restored_records += records.length;
          logger.debug(`Restored ${records.length} records to ${table}`);

        } catch (error) {
          const errorMsg = `Failed to restore table ${table}: ${error instanceof Error ? error.message : String(error)}`;
          logger.error(errorMsg);
          result.errors.push(errorMsg);
          
          if (!options.skip_errors) {
            throw error;
          }
        }
      }

      result.success = result.errors.length === 0;
      result.duration_ms = Date.now() - startTime;

      logger.info(`Backup restore completed: ${result.restored_tables.length} tables, ${result.restored_records} records, ${result.duration_ms}ms`);

      return result;

    } catch (error) {
      result.duration_ms = Date.now() - startTime;
      result.errors.push(error instanceof Error ? error.message : String(error));
      logger.error('Backup restore failed:', error);
      return result;
    }
  }

  /**
   * Get list of available backups
   */
  async getBackups(): Promise<BackupInfo[]> {
    try {
      const backups = await this.db.query(`
        SELECT * FROM backup_metadata 
        ORDER BY created_at DESC
      `);
      return backups;
    } catch (error) {
      logger.error('Failed to get backups:', error);
      return [];
    }
  }

  /**
   * Get backup information
   */
  async getBackupInfo(backupId: string): Promise<BackupInfo | null> {
    try {
      const backup = await this.db.get(
        'SELECT * FROM backup_metadata WHERE id = ?',
        [backupId]
      );
      return backup || null;
    } catch (error) {
      logger.error('Failed to get backup info:', error);
      return null;
    }
  }

  /**
   * Delete backup
   */
  async deleteBackup(backupId: string): Promise<boolean> {
    try {
      // Delete backup file
      const backupFileName = `${backupId}.json.gz`;
      const backupFilePath = path.join(this.backupPath, backupFileName);
      
      if (fs.existsSync(backupFilePath)) {
        fs.unlinkSync(backupFilePath);
      }

      // Delete metadata
      await this.db.exec('DELETE FROM backup_metadata WHERE id = ?', [backupId]);

      logger.info(`Backup deleted: ${backupId}`);
      return true;

    } catch (error) {
      logger.error('Failed to delete backup:', error);
      return false;
    }
  }

  /**
   * Export data to file
   */
  async exportData(options: ExportOptions): Promise<string> {
    const exportId = `export_${Date.now()}`;
    const fileName = `${exportId}.${options.format}${options.compress ? '.gz' : ''}`;
    const filePath = path.join(this.backupPath, fileName);

    try {
      logger.info(`Exporting data to ${options.format} format`);

      const tables = options.tables || await this.getDatabaseTables();
      const exportData: any = {};

      for (const table of tables) {
        const records = await this.db.query(`SELECT * FROM ${table}`);
        exportData[table] = records;
      }

      let fileContent: string | Buffer;

      switch (options.format) {
        case 'json':
          fileContent = JSON.stringify(exportData, null, 2);
          break;
        case 'csv':
          fileContent = this.convertToCSV(exportData);
          break;
        case 'excel':
          // For Excel export, we'll use JSON format for now
          // In a real implementation, you'd use a library like xlsx
          fileContent = JSON.stringify(exportData, null, 2);
          break;
        default:
          throw new Error(`Unsupported export format: ${options.format}`);
      }

      if (options.compress) {
        fileContent = await gzip(Buffer.from(fileContent, 'utf8'));
      } else {
        fileContent = Buffer.from(fileContent, 'utf8');
      }

      fs.writeFileSync(filePath, fileContent);

      logger.info(`Data exported successfully: ${fileName}`);
      return filePath;

    } catch (error) {
      logger.error('Data export failed:', error);
      throw error;
    }
  }

  /**
   * Import data from file
   */
  async importData(filePath: string, options: ImportOptions): Promise<RestoreResult> {
    const startTime = Date.now();
    const result: RestoreResult = {
      success: false,
      restored_tables: [],
      restored_records: 0,
      errors: [],
      duration_ms: 0
    };

    try {
      logger.info(`Importing data from: ${filePath}`);

      if (!fs.existsSync(filePath)) {
        throw new Error('Import file not found');
      }

      let fileContent = fs.readFileSync(filePath);

      // Decompress if needed
      if (filePath.endsWith('.gz')) {
        fileContent = Buffer.from(await gunzip(fileContent));
      }

      let importData: any;

      switch (options.format) {
        case 'json':
          importData = JSON.parse(fileContent.toString('utf8'));
          break;
        case 'csv':
          importData = this.parseCSV(fileContent.toString('utf8'));
          break;
        case 'excel':
          // For Excel import, we'll expect JSON format for now
          importData = JSON.parse(fileContent.toString('utf8'));
          break;
        default:
          throw new Error(`Unsupported import format: ${options.format}`);
      }

      // Import data table by table
      for (const [tableName, records] of Object.entries(importData)) {
        try {
          if (!Array.isArray(records)) {
            continue;
          }

          for (const record of records) {
            try {
              const columns = Object.keys(record);
              const values = Object.values(record);
              const placeholders = columns.map(() => '?').join(', ');

              let query: string;
              switch (options.merge_mode) {
                case 'replace':
                  query = `INSERT OR REPLACE INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
                  break;
                case 'merge':
                  query = `INSERT OR IGNORE INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
                  break;
                case 'skip_existing':
                  query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
                  break;
                default:
                  throw new Error(`Invalid merge mode: ${options.merge_mode}`);
              }

              await this.db.exec(query, values);
            } catch (error) {
              if (options.merge_mode === 'skip_existing' && error instanceof Error && error.message.includes('UNIQUE constraint')) {
                // Skip duplicate records
                continue;
              }
              throw error;
            }
          }

          result.restored_tables.push(tableName);
          result.restored_records += records.length;

        } catch (error) {
          const errorMsg = `Failed to import table ${tableName}: ${error instanceof Error ? error.message : String(error)}`;
          logger.error(errorMsg);
          result.errors.push(errorMsg);
        }
      }

      result.success = result.errors.length === 0;
      result.duration_ms = Date.now() - startTime;

      logger.info(`Data import completed: ${result.restored_tables.length} tables, ${result.restored_records} records, ${result.duration_ms}ms`);

      return result;

    } catch (error) {
      result.duration_ms = Date.now() - startTime;
      result.errors.push(error.message);
      logger.error('Data import failed:', error);
      return result;
    }
  }

  // Helper methods
  private async getDatabaseTables(): Promise<string[]> {
    const tables = await this.db.query(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `);
    return tables.map((table: any) => table.name);
  }

  private async saveBackupMetadata(backupInfo: BackupInfo): Promise<void> {
    // Create backup metadata table if it doesn't exist
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS backup_metadata (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        size INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        description TEXT,
        tables TEXT NOT NULL,
        record_count INTEGER NOT NULL
      )
    `);

    await this.db.exec(
      `INSERT OR REPLACE INTO backup_metadata (id, name, type, size, created_at, description, tables, record_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        backupInfo.id, backupInfo.name, backupInfo.type, backupInfo.size,
        backupInfo.created_at, backupInfo.description, 
        JSON.stringify(backupInfo.tables), backupInfo.record_count
      ]
    );
  }

  private convertToCSV(data: any): string {
    const csvLines: string[] = [];
    
    for (const [tableName, records] of Object.entries(data)) {
      if (!Array.isArray(records) || records.length === 0) {
        continue;
      }

      csvLines.push(`# Table: ${tableName}`);
      const columns = Object.keys(records[0]);
      csvLines.push(columns.join(','));
      
      for (const record of records) {
        const values = columns.map(col => {
          const value = record[col];
          if (value === null || value === undefined) {
            return '';
          }
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        });
        csvLines.push(values.join(','));
      }
      
      csvLines.push(''); // Empty line between tables
    }

    return csvLines.join('\n');
  }

  private parseCSV(csvContent: string): any {
    const data: any = {};
    const lines = csvContent.split('\n');
    let currentTable = '';
    let headers: string[] = [];

    for (const line of lines) {
      if (line.startsWith('# Table: ')) {
        currentTable = line.substring(9);
        data[currentTable] = [];
        headers = [];
      } else if (line.trim() === '') {
        // Empty line, skip
        continue;
      } else if (currentTable && headers.length === 0) {
        // First data line is headers
        headers = line.split(',').map(h => h.trim());
      } else if (currentTable && headers.length > 0) {
        // Data line
        const values = line.split(',');
        const record: any = {};
        
        for (let i = 0; i < headers.length && i < values.length; i++) {
          let value = values[i].trim();
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1).replace(/""/g, '"');
          }
          record[headers[i]] = value || null;
        }
        
        data[currentTable].push(record);
      }
    }

    return data;
  }

  /**
   * Get backup statistics
   */
  async getBackupStats(): Promise<any> {
    try {
      const backups = await this.getBackups();
      const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0);
      const totalRecords = backups.reduce((sum, backup) => sum + backup.record_count, 0);

      return {
        total_backups: backups.length,
        total_size_mb: Math.round(totalSize / 1024 / 1024 * 100) / 100,
        total_records: totalRecords,
        oldest_backup: backups.length > 0 ? backups[backups.length - 1].created_at : null,
        newest_backup: backups.length > 0 ? backups[0].created_at : null,
        auto_backup_enabled: this.autoBackupInterval !== null
      };
    } catch (error) {
      logger.error('Failed to get backup stats:', error);
      return {
        total_backups: 0,
        total_size_mb: 0,
        total_records: 0,
        oldest_backup: null,
        newest_backup: null,
        auto_backup_enabled: false
      };
    }
  }
}
