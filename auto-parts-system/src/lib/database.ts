import * as sqlite3 from 'sqlite3';
import * as path from 'path';
import { getDataPath } from './utils';
import { logger } from './logger';

export interface DatabaseConfig {
  filename: string;
  mode: number;
}

export class DatabaseManager {
  private db: sqlite3.Database | null = null;
  private config: DatabaseConfig;

  constructor() {
    this.config = {
      filename: path.join(getDataPath(), 'clutch_auto_parts.db'),
      mode: sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE
    };
  }

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.config.filename, this.config.mode, (err) => {
        if (err) {
          logger.error('Failed to open database:', err);
          reject(err);
        } else {
          logger.info('Database opened successfully');
          this.createTables()
            .then(() => resolve())
            .catch(reject);
        }
      });
    });
  }

  private async createTables(): Promise<void> {
    const tables = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'cashier',
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        phone TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Categories table
      `CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        name_ar TEXT NOT NULL,
        description TEXT,
        description_ar TEXT,
        parent_id INTEGER,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES categories (id)
      )`,

      // Brands table
      `CREATE TABLE IF NOT EXISTS brands (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        name_ar TEXT NOT NULL,
        logo_url TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Products table
      `CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sku TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        name_ar TEXT NOT NULL,
        description TEXT,
        description_ar TEXT,
        category_id INTEGER NOT NULL,
        brand_id INTEGER NOT NULL,
        barcode TEXT UNIQUE,
        cost_price DECIMAL(10,2) NOT NULL,
        selling_price DECIMAL(10,2) NOT NULL,
        min_stock INTEGER DEFAULT 0,
        current_stock INTEGER DEFAULT 0,
        max_stock INTEGER,
        unit TEXT DEFAULT 'piece',
        weight DECIMAL(8,2),
        dimensions TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories (id),
        FOREIGN KEY (brand_id) REFERENCES brands (id)
      )`,

      // Customers table
      `CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_code TEXT UNIQUE NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        city TEXT,
        loyalty_points INTEGER DEFAULT 0,
        credit_limit DECIMAL(10,2) DEFAULT 0,
        current_balance DECIMAL(10,2) DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Suppliers table
      `CREATE TABLE IF NOT EXISTS suppliers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        name_ar TEXT NOT NULL,
        contact_person TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
        city TEXT,
        payment_terms TEXT,
        credit_limit DECIMAL(10,2) DEFAULT 0,
        current_balance DECIMAL(10,2) DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Sales table
      `CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sale_number TEXT UNIQUE NOT NULL,
        customer_id INTEGER,
        user_id INTEGER NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        discount_amount DECIMAL(10,2) DEFAULT 0,
        tax_amount DECIMAL(10,2) DEFAULT 0,
        total_amount DECIMAL(10,2) NOT NULL,
        payment_method TEXT NOT NULL,
        payment_status TEXT DEFAULT 'completed',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,

      // Sale items table
      `CREATE TABLE IF NOT EXISTS sale_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sale_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        discount_amount DECIMAL(10,2) DEFAULT 0,
        total_price DECIMAL(10,2) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sale_id) REFERENCES sales (id),
        FOREIGN KEY (product_id) REFERENCES products (id)
      )`,

      // Purchase orders table
      `CREATE TABLE IF NOT EXISTS purchase_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        po_number TEXT UNIQUE NOT NULL,
        supplier_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        tax_amount DECIMAL(10,2) DEFAULT 0,
        total_amount DECIMAL(10,2) NOT NULL,
        status TEXT DEFAULT 'pending',
        order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        expected_date DATETIME,
        received_date DATETIME,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (supplier_id) REFERENCES suppliers (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,

      // Purchase order items table
      `CREATE TABLE IF NOT EXISTS purchase_order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        po_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        unit_cost DECIMAL(10,2) NOT NULL,
        total_cost DECIMAL(10,2) NOT NULL,
        received_quantity INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (po_id) REFERENCES purchase_orders (id),
        FOREIGN KEY (product_id) REFERENCES products (id)
      )`,

      // Stock movements table
      `CREATE TABLE IF NOT EXISTS stock_movements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        movement_type TEXT NOT NULL, -- 'in', 'out', 'adjustment'
        quantity INTEGER NOT NULL,
        reference_type TEXT, -- 'sale', 'purchase', 'adjustment'
        reference_id INTEGER,
        notes TEXT,
        user_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,

      // Settings table
      `CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        description TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Sync log table
      `CREATE TABLE IF NOT EXISTS sync_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_name TEXT NOT NULL,
        record_id INTEGER NOT NULL,
        operation TEXT NOT NULL, -- 'create', 'update', 'delete'
        status TEXT NOT NULL, -- 'pending', 'synced', 'failed'
        error_message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        synced_at DATETIME
      )`
    ];

    for (const table of tables) {
      await this.exec(table);
    }

    // Create indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku)',
      'CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode)',
      'CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id)',
      'CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id)',
      'CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_id)',
      'CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id)',
      'CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON stock_movements(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_sync_log_status ON sync_log(status)'
    ];

    for (const index of indexes) {
      await this.exec(index);
    }

    // Insert default data
    await this.insertDefaultData();

    logger.info('Database tables created successfully');
  }

  private async insertDefaultData(): Promise<void> {
    // Check if default data already exists
    const userCount = await this.query('SELECT COUNT(*) as count FROM users');
    if (userCount[0].count > 0) return;

    // Insert default admin user
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await this.exec(
      'INSERT INTO users (username, email, password_hash, role, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?)',
      ['admin', 'admin@clutch.com', hashedPassword, 'owner', 'System', 'Administrator']
    );

    // Insert default categories
    const categories = [
      ['Engine Parts', 'قطع المحرك', 'Engine components and accessories', 'مكونات المحرك وملحقاته'],
      ['Brake System', 'نظام الفرامل', 'Brake pads, discs, and related parts', 'أقراص الفرامل والقطع المرتبطة'],
      ['Suspension', 'نظام التعليق', 'Shocks, struts, and suspension components', 'ممتصات الصدمات ومكونات التعليق'],
      ['Electrical', 'النظام الكهربائي', 'Batteries, alternators, and electrical parts', 'البطاريات والمولدات والقطع الكهربائية'],
      ['Body Parts', 'قطع الهيكل', 'Body panels, bumpers, and exterior parts', 'ألواح الهيكل والمصدات والقطع الخارجية']
    ];

    for (const [name, nameAr, desc, descAr] of categories) {
      await this.exec(
        'INSERT INTO categories (name, name_ar, description, description_ar) VALUES (?, ?, ?, ?)',
        [name, nameAr, desc, descAr]
      );
    }

    // Insert default brands
    const brands = [
      ['Toyota', 'تويوتا'],
      ['Honda', 'هوندا'],
      ['Nissan', 'نيسان'],
      ['BMW', 'بي إم دبليو'],
      ['Mercedes', 'مرسيدس'],
      ['Audi', 'أودي'],
      ['Ford', 'فورد'],
      ['Chevrolet', 'شيفروليه']
    ];

    for (const [name, nameAr] of brands) {
      await this.exec(
        'INSERT INTO brands (name, name_ar) VALUES (?, ?)',
        [name, nameAr]
      );
    }

    // Insert default settings
    const settings = [
      ['shop_name', 'Clutch Auto Parts', 'Shop name'],
      ['shop_name_ar', 'قطع غيار كلتش', 'Shop name in Arabic'],
      ['currency', 'SAR', 'Default currency'],
      ['tax_rate', '0.15', 'Default tax rate'],
      ['language', 'ar', 'Default language'],
      ['sync_interval', '30', 'Sync interval in minutes'],
      ['backup_interval', '24', 'Backup interval in hours']
    ];

    for (const [key, value, description] of settings) {
      await this.exec(
        'INSERT INTO settings (key, value, description) VALUES (?, ?, ?)',
        [key, value, description]
      );
    }

    logger.info('Default data inserted successfully');
  }

  async query(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.all(sql, params, (err, rows) => {
        if (err) {
          logger.error('Database query error:', err);
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  async exec(sql: string, params: any[] = []): Promise<sqlite3.RunResult> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.run(sql, params, function(err) {
        if (err) {
          logger.error('Database exec error:', err);
          reject(err);
        } else {
          resolve(this);
        }
      });
    });
  }

  async get(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.get(sql, params, (err, row) => {
        if (err) {
          logger.error('Database get error:', err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve();
        return;
      }

      this.db.close((err) => {
        if (err) {
          logger.error('Failed to close database:', err);
          reject(err);
        } else {
          logger.info('Database closed successfully');
          resolve();
        }
      });
    });
  }

  async backup(backupPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.backup(backupPath, (err) => {
        if (err) {
          logger.error('Database backup error:', err);
          reject(err);
        } else {
          logger.info('Database backup completed successfully');
          resolve();
        }
      });
    });
  }
}
