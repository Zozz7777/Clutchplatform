import * as path from 'path';
import * as fs from 'fs';

export class DatabaseManager {
  private db: any = null;
  private dbPath: string;

  constructor() {
    const userDataPath = path.join(process.env.APPDATA || '', 'ClutchPartners');
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }
    this.dbPath = path.join(userDataPath, 'partners.db');
  }

  async initialize() {
    try {
      // Simple in-memory database for now
      this.db = {
        data: new Map(),
        query: (sql: string, params: any[] = []) => {
          // Mock database implementation
          return [];
        },
        exec: (sql: string, params: any[] = []) => {
          // Mock database implementation
          return { lastInsertRowid: 1 };
        }
      };
      
      await this.createTables();
      // Database initialized successfully
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  private async createTables() {
    if (!this.db) throw new Error('Database not initialized');

    // Users table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        partner_id TEXT NOT NULL,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'cashier',
        permissions TEXT NOT NULL DEFAULT '[]',
        is_active BOOLEAN NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Products table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sku TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        brand TEXT,
        model TEXT,
        cost_price REAL NOT NULL,
        sale_price REAL NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 0,
        min_quantity INTEGER NOT NULL DEFAULT 5,
        barcode TEXT UNIQUE,
        images TEXT DEFAULT '[]',
        specifications TEXT DEFAULT '{}',
        is_active BOOLEAN NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Orders table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id TEXT UNIQUE NOT NULL,
        customer_id INTEGER,
        customer_name TEXT,
        customer_phone TEXT,
        customer_email TEXT,
        items TEXT NOT NULL DEFAULT '[]',
        subtotal REAL NOT NULL,
        tax REAL NOT NULL DEFAULT 0,
        discount REAL NOT NULL DEFAULT 0,
        total REAL NOT NULL,
        payment_method TEXT,
        payment_status TEXT NOT NULL DEFAULT 'pending',
        order_status TEXT NOT NULL DEFAULT 'pending',
        notes TEXT,
        created_by INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users (id)
      )
    `);

    // Payments table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        payment_id TEXT UNIQUE NOT NULL,
        order_id TEXT NOT NULL,
        amount REAL NOT NULL,
        method TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        reference TEXT,
        processed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders (order_id)
      )
    `);

    // Sync operations table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sync_operations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        operation_id TEXT UNIQUE NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        operation_type TEXT NOT NULL,
        data TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        error_message TEXT,
        retry_count INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Enhanced sync operations table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sync_operations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        operation_id TEXT UNIQUE NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        operation_type TEXT NOT NULL,
        data TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        timestamp DATETIME NOT NULL,
        retry_count INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Sync conflicts table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sync_conflicts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        operation_id TEXT UNIQUE NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        local_data TEXT NOT NULL,
        server_data TEXT NOT NULL,
        local_timestamp DATETIME NOT NULL,
        server_timestamp DATETIME NOT NULL,
        resolution TEXT NOT NULL DEFAULT 'pending',
        resolved_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Audit log table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        old_data TEXT,
        new_data TEXT,
        ip_address TEXT,
        user_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Notifications table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        icon TEXT,
        sound BOOLEAN NOT NULL DEFAULT 1,
        urgency TEXT NOT NULL DEFAULT 'normal',
        actions TEXT DEFAULT '[]',
        data TEXT DEFAULT '{}',
        category TEXT NOT NULL DEFAULT 'system',
        tag TEXT,
        timestamp DATETIME NOT NULL,
        read BOOLEAN NOT NULL DEFAULT 0,
        persistent BOOLEAN NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Notification log table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS notification_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        notification_id TEXT NOT NULL,
        status TEXT NOT NULL,
        error_message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Settings table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
      CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
      CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
      CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
      CREATE INDEX IF NOT EXISTS idx_sync_operations_status ON sync_operations(status);
      CREATE INDEX IF NOT EXISTS idx_sync_operations_entity ON sync_operations(entity_type, entity_id);
    `);

    // Insert default settings
    this.db.exec(`
      INSERT OR IGNORE INTO settings (key, value) VALUES 
      ('partner_id', ''),
      ('business_name', ''),
      ('currency', 'EGP'),
      ('language', 'ar'),
      ('theme', 'light'),
      ('sync_interval', '30'),
      ('auto_sync', '1'),
      ('offline_mode', '1')
    `);
  }

  async query(sql: string, params: any[] = []): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      return this.db.query(sql, params);
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  async exec(sql: string, params: any[] = []): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      return this.db.exec(sql, params);
    } catch (error) {
      console.error('Database exec error:', error);
      throw error;
    }
  }

  async getSetting(key: string): Promise<string | null> {
    const result = await this.query('SELECT value FROM settings WHERE key = ?', [key]);
    return result.length > 0 ? result[0].value : null;
  }

  async setSetting(key: string, value: string): Promise<void> {
    await this.exec(
      'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
      [key, value]
    );
  }

  // Audit logging methods
  async logAuditEvent(
    userId: number,
    action: string,
    entityType: string,
    entityId: string,
    oldData?: any,
    newData?: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      await this.exec(
        `INSERT INTO audit_log (
          user_id, action, entity_type, entity_id, old_data, new_data, 
          ip_address, user_agent, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          userId,
          action,
          entityType,
          entityId,
          oldData ? JSON.stringify(oldData) : null,
          newData ? JSON.stringify(newData) : null,
          ipAddress,
          userAgent
        ]
      );
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  }

  async getAuditLog(
    entityType?: string,
    entityId?: string,
    userId?: number,
    limit: number = 100,
    offset: number = 0
  ): Promise<any[]> {
    try {
      let query = `
        SELECT al.*, u.username, u.email 
        FROM audit_log al 
        LEFT JOIN users u ON al.user_id = u.id 
        WHERE 1=1
      `;
      const params: any[] = [];

      if (entityType) {
        query += ' AND al.entity_type = ?';
        params.push(entityType);
      }

      if (entityId) {
        query += ' AND al.entity_id = ?';
        params.push(entityId);
      }

      if (userId) {
        query += ' AND al.user_id = ?';
        params.push(userId);
      }

      query += ' ORDER BY al.created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      return await this.query(query, params);
    } catch (error) {
      console.error('Failed to get audit log:', error);
      return [];
    }
  }

  async close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}
