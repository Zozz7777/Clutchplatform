import * as path from 'path';
import { getDataPath } from './utils';
import { logger } from './logger';

export interface DatabaseConfig {
  filename: string;
}

// Simple in-memory database for now (will be replaced with SQLite later)
export class DatabaseManager {
  private data: Map<string, any[]> = new Map();
  private config: DatabaseConfig;

  constructor() {
    this.config = {
      filename: path.join(getDataPath(), 'clutch_auto_parts.db')
    };
  }

  async initialize(): Promise<void> {
    try {
      logger.info('In-memory database initialized');
      await this.createTables();
    } catch (err) {
      logger.error('Failed to initialize database:', err);
      throw err;
    }
  }

  private async createTables(): Promise<void> {
    // Initialize in-memory tables
    const tables = [
      'users', 'categories', 'brands', 'products', 'customers', 'suppliers',
      'sales', 'sale_items', 'purchase_orders', 'purchase_order_items',
      'stock_movements', 'settings', 'sync_log'
    ];

    for (const table of tables) {
      this.data.set(table, []);
    }

    // Insert default data
    await this.insertDefaultData();

    logger.info('In-memory database tables created successfully');
  }

  private async insertDefaultData(): Promise<void> {
    // Check if default data already exists
    const users = this.data.get('users') || [];
    if (users.length > 0) return;

    // Insert default admin user
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const adminUser = {
      id: 1,
      username: 'admin',
      email: 'admin@clutch.com',
      password_hash: hashedPassword,
      role: 'owner',
      first_name: 'System',
      last_name: 'Administrator',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    users.push(adminUser);
    this.data.set('users', users);

    // Insert default categories
    const categories = [
      { id: 1, name: 'Engine Parts', name_ar: 'قطع المحرك', description: 'Engine components and accessories', description_ar: 'مكونات المحرك وملحقاته', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 2, name: 'Brake System', name_ar: 'نظام الفرامل', description: 'Brake pads, discs, and related parts', description_ar: 'أقراص الفرامل والقطع المرتبطة', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 3, name: 'Suspension', name_ar: 'نظام التعليق', description: 'Shocks, struts, and suspension components', description_ar: 'ممتصات الصدمات ومكونات التعليق', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 4, name: 'Electrical', name_ar: 'النظام الكهربائي', description: 'Batteries, alternators, and electrical parts', description_ar: 'البطاريات والمولدات والقطع الكهربائية', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 5, name: 'Body Parts', name_ar: 'قطع الهيكل', description: 'Body panels, bumpers, and exterior parts', description_ar: 'ألواح الهيكل والمصدات والقطع الخارجية', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    ];
    this.data.set('categories', categories);

    // Insert default brands
    const brands = [
      { id: 1, name: 'Toyota', name_ar: 'تويوتا', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 2, name: 'Honda', name_ar: 'هوندا', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 3, name: 'Nissan', name_ar: 'نيسان', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 4, name: 'BMW', name_ar: 'بي إم دبليو', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 5, name: 'Mercedes', name_ar: 'مرسيدس', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 6, name: 'Audi', name_ar: 'أودي', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 7, name: 'Ford', name_ar: 'فورد', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 8, name: 'Chevrolet', name_ar: 'شيفروليه', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    ];
    this.data.set('brands', brands);

    // Insert default settings
    const settings = [
      { id: 1, key: 'shop_name', value: 'Clutch Auto Parts', description: 'Shop name', updated_at: new Date().toISOString() },
      { id: 2, key: 'shop_name_ar', value: 'قطع غيار كلتش', description: 'Shop name in Arabic', updated_at: new Date().toISOString() },
      { id: 3, key: 'currency', value: 'SAR', description: 'Default currency', updated_at: new Date().toISOString() },
      { id: 4, key: 'tax_rate', value: '0.15', description: 'Default tax rate', updated_at: new Date().toISOString() },
      { id: 5, key: 'language', value: 'ar', description: 'Default language', updated_at: new Date().toISOString() },
      { id: 6, key: 'sync_interval', value: '30', description: 'Sync interval in minutes', updated_at: new Date().toISOString() },
      { id: 7, key: 'backup_interval', value: '24', description: 'Backup interval in hours', updated_at: new Date().toISOString() }
    ];
    this.data.set('settings', settings);

    logger.info('Default data inserted successfully');
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    // Simple in-memory query implementation
    // For now, just return empty arrays for most queries
    logger.info(`In-memory query: ${sql}`);
    return [];
  }

  async exec(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
    // Simple in-memory exec implementation
    logger.info(`In-memory exec: ${sql}`);
    return { lastID: 1, changes: 1 };
  }

  async get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    // Simple in-memory get implementation
    logger.info(`In-memory get: ${sql}`);
    
    // Handle specific queries for authentication
    if (sql.includes('SELECT * FROM users WHERE') && sql.includes('username')) {
      const users = this.data.get('users') || [];
      const user = users.find((u: any) => u.username === params[0] || u.email === params[0]);
      return user as T;
    }
    
    if (sql.includes('SELECT * FROM users WHERE') && sql.includes('id')) {
      const users = this.data.get('users') || [];
      const user = users.find((u: any) => u.id === params[0]);
      return user as T;
    }
    
    return undefined;
  }

  async close(): Promise<void> {
    try {
      logger.info('In-memory database closed successfully');
    } catch (err) {
      logger.error('Failed to close database:', err);
      throw err;
    }
  }

  async backup(backupPath: string): Promise<void> {
    try {
      // Simple JSON backup for in-memory database
      const fs = require('fs');
      const backupData = Object.fromEntries(this.data);
      fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
      logger.info('Database backup completed successfully');
    } catch (err) {
      logger.error('Database backup error:', err);
      throw err;
    }
  }
}
