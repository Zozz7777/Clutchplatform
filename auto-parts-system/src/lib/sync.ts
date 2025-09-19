import { DatabaseManager } from './database';
import { logger } from './logger';
import axios, { AxiosInstance } from 'axios';

export interface SyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  pendingChanges: number;
  syncInProgress: boolean;
  errorMessage?: string;
}

export interface SyncConfig {
  backendUrl: string;
  apiKey: string;
  syncInterval: number; // in minutes
  retryAttempts: number;
  retryDelay: number; // in seconds
}

export class SyncManager {
  private db: DatabaseManager;
  private config: SyncConfig;
  private httpClient: AxiosInstance;
  private syncInterval: NodeJS.Timeout | null = null;
  private isOnline: boolean = false;
  private lastSync: Date | null = null;
  private pendingChanges: number = 0;
  private syncInProgress: boolean = false;

  constructor() {
    this.db = new DatabaseManager();
    this.config = {
      backendUrl: 'https://clutch-main-nk7x.onrender.com',
      apiKey: '',
      syncInterval: 30,
      retryAttempts: 3,
      retryDelay: 5
    };

    this.httpClient = axios.create({
      baseURL: this.config.backendUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Clutch-Auto-Parts-System/1.0.0'
      }
    });
  }

  async initialize(): Promise<void> {
    try {
      // Load configuration from database
      await this.loadConfig();
      
      // Check initial connection
      await this.checkConnection();
      
      // Start sync interval
      this.startSyncInterval();
      
      logger.info('Sync manager initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize sync manager:', error);
    }
  }

  private async loadConfig(): Promise<void> {
    try {
      const settings = await this.db.query('SELECT key, value FROM settings WHERE key IN (?, ?, ?)', [
        'clutch_api_key',
        'sync_interval',
        'backend_url'
      ]);

      for (const setting of settings) {
        switch (setting.key) {
          case 'clutch_api_key':
            this.config.apiKey = setting.value;
            break;
          case 'sync_interval':
            this.config.syncInterval = parseInt(setting.value) || 30;
            break;
          case 'backend_url':
            this.config.backendUrl = setting.value || this.config.backendUrl;
            break;
        }
      }

      // Update HTTP client base URL
      this.httpClient.defaults.baseURL = this.config.backendUrl;
      
      if (this.config.apiKey) {
        this.httpClient.defaults.headers.common['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

    } catch (error) {
      logger.error('Failed to load sync configuration:', error);
    }
  }

  private async checkConnection(): Promise<boolean> {
    try {
      const response = await this.httpClient.get('/health');
      this.isOnline = response.status === 200;
      
      if (this.isOnline) {
        logger.info('Connected to Clutch backend successfully');
      } else {
        logger.warn('Clutch backend is not responding');
      }
      
      return this.isOnline;
    } catch (error) {
      this.isOnline = false;
      logger.error('Failed to connect to Clutch backend:', error);
      return false;
    }
  }

  private startSyncInterval(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(async () => {
      if (!this.syncInProgress) {
        await this.syncNow();
      }
    }, this.config.syncInterval * 60 * 1000);

    logger.info(`Sync interval started: ${this.config.syncInterval} minutes`);
  }

  async syncNow(): Promise<boolean> {
    if (this.syncInProgress) {
      logger.warn('Sync already in progress');
      return false;
    }

    this.syncInProgress = true;
    
    try {
      // Check connection first
      const isConnected = await this.checkConnection();
      if (!isConnected) {
        logger.warn('Cannot sync: Backend is offline');
        return false;
      }

      // Count pending changes
      this.pendingChanges = await this.getPendingChangesCount();

      if (this.pendingChanges === 0) {
        logger.info('No pending changes to sync');
        this.lastSync = new Date();
        return true;
      }

      logger.info(`Starting sync: ${this.pendingChanges} pending changes`);

      // Sync pending changes
      await this.syncPendingChanges();

      // Sync from backend to local
      await this.syncFromBackend();

      this.lastSync = new Date();
      this.pendingChanges = 0;

      logger.info('Sync completed successfully');
      return true;

    } catch (error) {
      logger.error('Sync failed:', error);
      return false;
    } finally {
      this.syncInProgress = false;
    }
  }

  private async getPendingChangesCount(): Promise<number> {
    try {
      const result = await this.db.query('SELECT COUNT(*) as count FROM sync_log WHERE status = ?', ['pending']);
      return result[0].count;
    } catch (error) {
      logger.error('Failed to get pending changes count:', error);
      return 0;
    }
  }

  private async syncPendingChanges(): Promise<void> {
    try {
      const pendingChanges = await this.db.query(
        'SELECT * FROM sync_log WHERE status = ? ORDER BY created_at ASC',
        ['pending']
      );

      for (const change of pendingChanges) {
        try {
          await this.syncChange(change);
          
          // Mark as synced
          await this.db.exec(
            'UPDATE sync_log SET status = ?, synced_at = CURRENT_TIMESTAMP WHERE id = ?',
            ['synced', change.id]
          );

        } catch (error) {
          logger.error(`Failed to sync change ${change.id}:`, error);
          
          // Mark as failed
          await this.db.exec(
            'UPDATE sync_log SET status = ?, error_message = ? WHERE id = ?',
            ['failed', (error as Error).message, change.id]
          );
        }
      }

    } catch (error) {
      logger.error('Failed to sync pending changes:', error);
      throw error;
    }
  }

  private async syncChange(change: any): Promise<void> {
    const { table_name, record_id, operation } = change;

    // Get the record data
    const record = await this.db.get(`SELECT * FROM ${table_name} WHERE id = ?`, [record_id]);
    if (!record) {
      throw new Error(`Record not found: ${table_name}:${record_id}`);
    }

    // Map to Clutch API endpoint
    const endpoint = this.getEndpointForTable(table_name);
    if (!endpoint) {
      throw new Error(`No endpoint mapping for table: ${table_name}`);
    }

    // Send to backend
    switch (operation) {
      case 'create':
        await this.httpClient.post(endpoint, record);
        break;
      case 'update':
        await this.httpClient.put(`${endpoint}/${record_id}`, record);
        break;
      case 'delete':
        await this.httpClient.delete(`${endpoint}/${record_id}`);
        break;
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  private getEndpointForTable(tableName: string): string | null {
    const endpointMap: Record<string, string> = {
      'products': '/api/v1/parts',
      'customers': '/api/v1/customers',
      'suppliers': '/api/v1/suppliers',
      'sales': '/api/v1/transactions',
      'users': '/api/v1/users'
    };

    return endpointMap[tableName] || null;
  }

  private async syncFromBackend(): Promise<void> {
    try {
      // Sync products/parts
      await this.syncProductsFromBackend();
      
      // Sync customers
      await this.syncCustomersFromBackend();
      
      // Sync suppliers
      await this.syncSuppliersFromBackend();

    } catch (error) {
      logger.error('Failed to sync from backend:', error);
      throw error;
    }
  }

  private async syncProductsFromBackend(): Promise<void> {
    try {
      const response = await this.httpClient.get('/api/v1/parts');
      const remoteProducts = response.data.data || [];

      for (const remoteProduct of remoteProducts) {
        // Check if product exists locally
        const localProduct = await this.db.get(
          'SELECT id FROM products WHERE sku = ?',
          [remoteProduct.sku]
        );

        if (localProduct) {
          // Update existing product
          await this.db.exec(
            `UPDATE products SET 
             name = ?, name_ar = ?, description = ?, description_ar = ?,
             cost_price = ?, selling_price = ?, current_stock = ?,
             updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [
              remoteProduct.name,
              remoteProduct.name_ar || remoteProduct.name,
              remoteProduct.description,
              remoteProduct.description_ar || remoteProduct.description,
              remoteProduct.cost_price,
              remoteProduct.selling_price,
              remoteProduct.current_stock || 0,
              localProduct.id
            ]
          );
        } else {
          // Insert new product
          await this.db.exec(
            `INSERT INTO products (sku, name, name_ar, description, description_ar,
             cost_price, selling_price, current_stock, category_id, brand_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              remoteProduct.sku,
              remoteProduct.name,
              remoteProduct.name_ar || remoteProduct.name,
              remoteProduct.description,
              remoteProduct.description_ar || remoteProduct.description,
              remoteProduct.cost_price,
              remoteProduct.selling_price,
              remoteProduct.current_stock || 0,
              1, // Default category
              1  // Default brand
            ]
          );
        }
      }

      logger.info(`Synced ${remoteProducts.length} products from backend`);

    } catch (error) {
      logger.error('Failed to sync products from backend:', error);
    }
  }

  private async syncCustomersFromBackend(): Promise<void> {
    try {
      const response = await this.httpClient.get('/api/v1/customers');
      const remoteCustomers = response.data.data || [];

      for (const remoteCustomer of remoteCustomers) {
        const localCustomer = await this.db.get(
          'SELECT id FROM customers WHERE customer_code = ?',
          [remoteCustomer.customer_code]
        );

        if (localCustomer) {
          await this.db.exec(
            `UPDATE customers SET 
             first_name = ?, last_name = ?, email = ?, phone = ?,
             address = ?, city = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [
              remoteCustomer.first_name,
              remoteCustomer.last_name,
              remoteCustomer.email,
              remoteCustomer.phone,
              remoteCustomer.address,
              remoteCustomer.city,
              localCustomer.id
            ]
          );
        } else {
          await this.db.exec(
            `INSERT INTO customers (customer_code, first_name, last_name, email, phone, address, city)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              remoteCustomer.customer_code,
              remoteCustomer.first_name,
              remoteCustomer.last_name,
              remoteCustomer.email,
              remoteCustomer.phone,
              remoteCustomer.address,
              remoteCustomer.city
            ]
          );
        }
      }

      logger.info(`Synced ${remoteCustomers.length} customers from backend`);

    } catch (error) {
      logger.error('Failed to sync customers from backend:', error);
    }
  }

  private async syncSuppliersFromBackend(): Promise<void> {
    try {
      const response = await this.httpClient.get('/api/v1/suppliers');
      const remoteSuppliers = response.data.data || [];

      for (const remoteSupplier of remoteSuppliers) {
        const localSupplier = await this.db.get(
          'SELECT id FROM suppliers WHERE name = ?',
          [remoteSupplier.name]
        );

        if (localSupplier) {
          await this.db.exec(
            `UPDATE suppliers SET 
             name_ar = ?, contact_person = ?, email = ?, phone = ?,
             address = ?, city = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [
              remoteSupplier.name_ar || remoteSupplier.name,
              remoteSupplier.contact_person,
              remoteSupplier.email,
              remoteSupplier.phone,
              remoteSupplier.address,
              remoteSupplier.city,
              localSupplier.id
            ]
          );
        } else {
          await this.db.exec(
            `INSERT INTO suppliers (name, name_ar, contact_person, email, phone, address, city)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              remoteSupplier.name,
              remoteSupplier.name_ar || remoteSupplier.name,
              remoteSupplier.contact_person,
              remoteSupplier.email,
              remoteSupplier.phone,
              remoteSupplier.address,
              remoteSupplier.city
            ]
          );
        }
      }

      logger.info(`Synced ${remoteSuppliers.length} suppliers from backend`);

    } catch (error) {
      logger.error('Failed to sync suppliers from backend:', error);
    }
  }

  async logChange(tableName: string, recordId: number, operation: 'create' | 'update' | 'delete'): Promise<void> {
    try {
      await this.db.exec(
        'INSERT INTO sync_log (table_name, record_id, operation, status) VALUES (?, ?, ?, ?)',
        [tableName, recordId, operation, 'pending']
      );
    } catch (error) {
      logger.error('Failed to log change:', error);
    }
  }

  async getStatus(): Promise<SyncStatus> {
    return {
      isOnline: this.isOnline,
      lastSync: this.lastSync,
      pendingChanges: this.pendingChanges,
      syncInProgress: this.syncInProgress
    };
  }

  async stop(): Promise<void> {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    logger.info('Sync manager stopped');
  }

  async updateConfig(newConfig: Partial<SyncConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };
    
    // Update HTTP client
    this.httpClient.defaults.baseURL = this.config.backendUrl;
    if (this.config.apiKey) {
      this.httpClient.defaults.headers.common['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    // Save to database
    for (const [key, value] of Object.entries(newConfig)) {
      if (key === 'backendUrl') {
        await this.db.exec(
          'INSERT OR REPLACE INTO settings (key, value, description) VALUES (?, ?, ?)',
          ['backend_url', value, 'Clutch backend URL']
        );
      } else if (key === 'apiKey') {
        await this.db.exec(
          'INSERT OR REPLACE INTO settings (key, value, description) VALUES (?, ?, ?)',
          ['clutch_api_key', value, 'Clutch API key']
        );
      } else if (key === 'syncInterval') {
        await this.db.exec(
          'INSERT OR REPLACE INTO settings (key, value, description) VALUES (?, ?, ?)',
          ['sync_interval', value.toString(), 'Sync interval in minutes']
        );
      }
    }

    // Restart sync interval if needed
    if (newConfig.syncInterval) {
      this.startSyncInterval();
    }

    logger.info('Sync configuration updated');
  }
}
