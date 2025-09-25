import { DatabaseManager } from './database';

export class LocalServer {
  private app: any;
  private server: any;
  private port: number = 3001;
  private database: DatabaseManager;

  constructor() {
    this.app = {
      get: (path: string, handler: Function) => {
        console.log(`GET ${path} registered`);
      },
      post: (path: string, handler: Function) => {
        console.log(`POST ${path} registered`);
      },
      use: (middleware: any) => {
        console.log('Middleware registered');
      }
    };
    this.database = new DatabaseManager();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    // Mock middleware setup
    console.log('Middleware setup completed');
  }

  private setupRoutes() {
    // Health check
    this.app.get('/health', (req: any, res: any) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Products API
    this.app.get('/api/products', async (req: any, res: any) => {
      try {
        const products = await this.database.query(
          'SELECT * FROM products WHERE is_active = 1 ORDER BY name'
        );
        res.json({ success: true, data: products });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
      }
    });

    this.app.get('/api/products/:sku', async (req: any, res: any) => {
      try {
        const products = await this.database.query(
          'SELECT * FROM products WHERE sku = ? AND is_active = 1',
          [req.params.sku]
        );
        if (products.length === 0) {
          return res.status(404).json({ success: false, error: 'Product not found' });
        }
        res.json({ success: true, data: products[0] });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
      }
    });

    this.app.get('/api/products/barcode/:barcode', async (req: any, res: any) => {
      try {
        const products = await this.database.query(
          'SELECT * FROM products WHERE barcode = ? AND is_active = 1',
          [req.params.barcode]
        );
        if (products.length === 0) {
          return res.status(404).json({ success: false, error: 'Product not found' });
        }
        res.json({ success: true, data: products[0] });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
      }
    });

    // Orders API
    this.app.get('/api/orders', async (req: any, res: any) => {
      try {
        const { status, limit = 50, offset = 0 } = req.query;
        let sql = 'SELECT * FROM orders';
        const params: any[] = [];

        if (status) {
          sql += ' WHERE order_status = ?';
          params.push(status);
        }

        sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit as string), parseInt(offset as string));

        const orders = await this.database.query(sql, params);
        res.json({ success: true, data: orders });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
      }
    });

    this.app.post('/api/orders', async (req: any, res: any) => {
      try {
        const {
          order_id,
          customer_name,
          customer_phone,
          customer_email,
          items,
          subtotal,
          tax,
          discount,
          total,
          payment_method,
          notes,
          created_by
        } = req.body;

        const result = await this.database.exec(
          `INSERT INTO orders (
            order_id, customer_name, customer_phone, customer_email,
            items, subtotal, tax, discount, total, payment_method,
            notes, created_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            order_id, customer_name, customer_phone, customer_email,
            JSON.stringify(items), subtotal, tax, discount, total,
            payment_method, notes, created_by
          ]
        );

        res.json({ success: true, data: { id: result.lastInsertRowid } });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
      }
    });

    // Payments API
    this.app.post('/api/payments', async (req: any, res: any) => {
      try {
        const {
          payment_id,
          order_id,
          amount,
          method,
          reference
        } = req.body;

        const result = await this.database.exec(
          `INSERT INTO payments (payment_id, order_id, amount, method, reference)
           VALUES (?, ?, ?, ?, ?)`,
          [payment_id, order_id, amount, method, reference]
        );

        // Update order payment status
        await this.database.exec(
          'UPDATE orders SET payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE order_id = ?',
          ['paid', order_id]
        );

        res.json({ success: true, data: { id: result.lastInsertRowid } });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
      }
    });

    // Settings API
    this.app.get('/api/settings', async (req: any, res: any) => {
      try {
        const settings = await this.database.query('SELECT key, value FROM settings');
        const settingsObj = settings.reduce((acc, setting) => {
          acc[setting.key] = setting.value;
          return acc;
        }, {});
        res.json({ success: true, data: settingsObj });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
      }
    });

    this.app.post('/api/settings', async (req: any, res: any) => {
      try {
        const { key, value } = req.body;
        await this.database.setSetting(key, value);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
      }
    });

    // Sync operations API
    this.app.get('/api/sync/operations', async (req: any, res: any) => {
      try {
        const { status = 'pending' } = req.query;
        const operations = await this.database.query(
          'SELECT * FROM sync_operations WHERE status = ? ORDER BY created_at',
          [status]
        );
        res.json({ success: true, data: operations });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
      }
    });

    this.app.post('/api/sync/operations', async (req: any, res: any) => {
      try {
        const {
          operation_id,
          entity_type,
          entity_id,
          operation_type,
          data
        } = req.body;

        const result = await this.database.exec(
          `INSERT INTO sync_operations (operation_id, entity_type, entity_id, operation_type, data)
           VALUES (?, ?, ?, ?, ?)`,
          [operation_id, entity_type, entity_id, operation_type, JSON.stringify(data)]
        );

        res.json({ success: true, data: { id: result.lastInsertRowid } });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
      }
    });
  }

  async start() {
    return new Promise<void>((resolve, reject) => {
      this.server = this.app.listen(this.port, (error: any) => {
        if (error) {
          reject(error);
        } else {
          console.log(`Local server started on port ${this.port}`);
          resolve();
        }
      });
    });
  }

  async stop() {
    return new Promise<void>((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('Local server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}
