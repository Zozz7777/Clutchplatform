import { logger } from './logger';
import { DatabaseManager } from './database';

export interface Branch {
  id: number;
  name: string;
  name_ar: string;
  code: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  manager_name: string;
  is_active: boolean;
  is_main_branch: boolean;
  created_at: string;
  updated_at: string;
}

export interface BranchTransfer {
  id: number;
  from_branch_id: number;
  to_branch_id: number;
  product_id: number;
  quantity: number;
  status: 'pending' | 'approved' | 'shipped' | 'received' | 'cancelled';
  requested_by: number;
  approved_by?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BranchStock {
  branch_id: number;
  product_id: number;
  quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  last_updated: string;
}

export interface BranchDashboard {
  branch_id: number;
  branch_name: string;
  total_products: number;
  total_value: number;
  low_stock_items: number;
  pending_transfers: number;
  today_sales: number;
  today_revenue: number;
  top_products: Array<{
    product_id: number;
    product_name: string;
    quantity_sold: number;
    revenue: number;
  }>;
}

export class MultiBranchManager {
  private db: DatabaseManager;
  private currentBranchId: number;

  constructor() {
    this.db = new DatabaseManager();
    this.currentBranchId = 1; // Default to main branch
  }

  async initialize(): Promise<void> {
    logger.info('Multi-Branch Manager initialized');
    await this.createBranchTables();
    await this.createDefaultBranch();
  }

  /**
   * Create tables for multi-branch support
   */
  private async createBranchTables(): Promise<void> {
    const tables = [
      // Branches table
      `CREATE TABLE IF NOT EXISTS branches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        name_ar TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        manager_name TEXT,
        is_active BOOLEAN DEFAULT 1,
        is_main_branch BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Branch stock table
      `CREATE TABLE IF NOT EXISTS branch_stock (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        branch_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER DEFAULT 0,
        reserved_quantity INTEGER DEFAULT 0,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (branch_id) REFERENCES branches (id),
        FOREIGN KEY (product_id) REFERENCES products (id),
        UNIQUE(branch_id, product_id)
      )`,

      // Branch transfers table
      `CREATE TABLE IF NOT EXISTS branch_transfers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transfer_number TEXT UNIQUE NOT NULL,
        from_branch_id INTEGER NOT NULL,
        to_branch_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        status TEXT DEFAULT 'pending',
        requested_by INTEGER NOT NULL,
        approved_by INTEGER,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (from_branch_id) REFERENCES branches (id),
        FOREIGN KEY (to_branch_id) REFERENCES branches (id),
        FOREIGN KEY (product_id) REFERENCES products (id),
        FOREIGN KEY (requested_by) REFERENCES users (id),
        FOREIGN KEY (approved_by) REFERENCES users (id)
      )`,

      // Branch sales table (extends existing sales table)
      `ALTER TABLE sales ADD COLUMN branch_id INTEGER DEFAULT 1`,
      `ALTER TABLE stock_movements ADD COLUMN branch_id INTEGER DEFAULT 1`
    ];

    for (const table of tables) {
      try {
        await this.db.exec(table);
      } catch (error) {
        // Ignore errors for ALTER TABLE statements that might already exist
        if (!table.startsWith('ALTER TABLE')) {
          logger.error('Error creating branch table:', error);
          throw error;
        }
      }
    }

    logger.info('Branch tables created successfully');
  }

  /**
   * Create default main branch
   */
  private async createDefaultBranch(): Promise<void> {
    const existingBranch = await this.db.get('SELECT id FROM branches WHERE is_main_branch = 1');
    
    if (!existingBranch) {
      await this.db.exec(
        `INSERT INTO branches (name, name_ar, code, address, city, is_main_branch)
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['Main Branch', 'الفرع الرئيسي', 'MAIN', 'Main Street, Riyadh', 'Riyadh', 1]
      );
      logger.info('Default main branch created');
    }
  }

  /**
   * Get all branches
   */
  async getBranches(): Promise<Branch[]> {
    const branches = await this.db.query(`
      SELECT * FROM branches 
      WHERE is_active = 1 
      ORDER BY is_main_branch DESC, name ASC
    `);
    return branches;
  }

  /**
   * Get branch by ID
   */
  async getBranch(branchId: number): Promise<Branch | null> {
    const branch = await this.db.get('SELECT * FROM branches WHERE id = ?', [branchId]);
    return branch || null;
  }

  /**
   * Create new branch
   */
  async createBranch(branchData: Omit<Branch, 'id' | 'created_at' | 'updated_at'>): Promise<Branch> {
    const result = await this.db.exec(
      `INSERT INTO branches (name, name_ar, code, address, city, phone, email, manager_name, is_active, is_main_branch)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        branchData.name, branchData.name_ar, branchData.code, branchData.address,
        branchData.city, branchData.phone, branchData.email, branchData.manager_name,
        branchData.is_active, branchData.is_main_branch
      ]
    );

    const branch = await this.getBranch(result.lastID);
    if (!branch) {
      throw new Error('Failed to create branch');
    }

    logger.info(`Created new branch: ${branch.name} (ID: ${branch.id})`);
    return branch;
  }

  /**
   * Update branch
   */
  async updateBranch(branchId: number, branchData: Partial<Branch>): Promise<Branch> {
    const fields = [];
    const values = [];

    Object.entries(branchData).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at' && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(branchId);
    await this.db.exec(
      `UPDATE branches SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    const branch = await this.getBranch(branchId);
    if (!branch) {
      throw new Error('Branch not found');
    }

    logger.info(`Updated branch: ${branch.name} (ID: ${branch.id})`);
    return branch;
  }

  /**
   * Get branch stock for a product
   */
  async getBranchStock(branchId: number, productId?: number): Promise<BranchStock[]> {
    let query = `
      SELECT 
        bs.branch_id, bs.product_id, bs.quantity, bs.reserved_quantity,
        (bs.quantity - bs.reserved_quantity) as available_quantity,
        bs.last_updated,
        p.name as product_name
      FROM branch_stock bs
      JOIN products p ON bs.product_id = p.id
      WHERE bs.branch_id = ?
    `;
    const params = [branchId];

    if (productId) {
      query += ' AND bs.product_id = ?';
      params.push(productId);
    }

    query += ' ORDER BY p.name ASC';

    const stock = await this.db.query(query, params);
    return stock;
  }

  /**
   * Update branch stock
   */
  async updateBranchStock(branchId: number, productId: number, quantity: number, reservedQuantity: number = 0): Promise<void> {
    await this.db.exec(
      `INSERT OR REPLACE INTO branch_stock (branch_id, product_id, quantity, reserved_quantity, last_updated)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [branchId, productId, quantity, reservedQuantity]
    );

    logger.info(`Updated stock for branch ${branchId}, product ${productId}: ${quantity} (reserved: ${reservedQuantity})`);
  }

  /**
   * Transfer stock between branches
   */
  async createTransfer(transferData: Omit<BranchTransfer, 'id' | 'created_at' | 'updated_at'>): Promise<BranchTransfer> {
    // Generate transfer number
    const transferNumber = `TR-${Date.now()}`;

    // Check if source branch has enough stock
    const sourceStock = await this.db.get(
      'SELECT quantity FROM branch_stock WHERE branch_id = ? AND product_id = ?',
      [transferData.from_branch_id, transferData.product_id]
    );

    if (!sourceStock || sourceStock.quantity < transferData.quantity) {
      throw new Error('Insufficient stock in source branch');
    }

    // Create transfer record
    const result = await this.db.exec(
      `INSERT INTO branch_transfers (transfer_number, from_branch_id, to_branch_id, product_id, quantity, status, requested_by, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        transferNumber, transferData.from_branch_id, transferData.to_branch_id,
        transferData.product_id, transferData.quantity, 'pending',
        transferData.requested_by, transferData.notes
      ]
    );

    // Reserve stock in source branch
    await this.db.exec(
      'UPDATE branch_stock SET reserved_quantity = reserved_quantity + ? WHERE branch_id = ? AND product_id = ?',
      [transferData.quantity, transferData.from_branch_id, transferData.product_id]
    );

    const transfer = await this.getTransfer(result.lastID);
    if (!transfer) {
      throw new Error('Failed to create transfer');
    }

    logger.info(`Created transfer: ${transferNumber} from branch ${transferData.from_branch_id} to ${transferData.to_branch_id}`);
    return transfer;
  }

  /**
   * Get transfer by ID
   */
  async getTransfer(transferId: number): Promise<BranchTransfer | null> {
    const transfer = await this.db.get('SELECT * FROM branch_transfers WHERE id = ?', [transferId]);
    return transfer || null;
  }

  /**
   * Get transfers for a branch
   */
  async getBranchTransfers(branchId: number, status?: string): Promise<BranchTransfer[]> {
    let query = `
      SELECT bt.*, p.name as product_name,
             fb.name as from_branch_name, tb.name as to_branch_name
      FROM branch_transfers bt
      JOIN products p ON bt.product_id = p.id
      JOIN branches fb ON bt.from_branch_id = fb.id
      JOIN branches tb ON bt.to_branch_id = tb.id
      WHERE (bt.from_branch_id = ? OR bt.to_branch_id = ?)
    `;
    const params = [branchId, branchId];

    if (status) {
      query += ' AND bt.status = ?';
      params.push(status);
    }

    query += ' ORDER BY bt.created_at DESC';

    const transfers = await this.db.query(query, params);
    return transfers;
  }

  /**
   * Approve transfer
   */
  async approveTransfer(transferId: number, approvedBy: number): Promise<void> {
    const transfer = await this.getTransfer(transferId);
    if (!transfer) {
      throw new Error('Transfer not found');
    }

    if (transfer.status !== 'pending') {
      throw new Error('Transfer is not pending');
    }

    // Update transfer status
    await this.db.exec(
      'UPDATE branch_transfers SET status = ?, approved_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['approved', approvedBy, transferId]
    );

    logger.info(`Approved transfer: ${transfer.transfer_number}`);
  }

  /**
   * Complete transfer (mark as shipped/received)
   */
  async completeTransfer(transferId: number, status: 'shipped' | 'received'): Promise<void> {
    const transfer = await this.getTransfer(transferId);
    if (!transfer) {
      throw new Error('Transfer not found');
    }

    if (transfer.status !== 'approved' && transfer.status !== 'shipped') {
      throw new Error('Transfer is not approved');
    }

    // Update transfer status
    await this.db.exec(
      'UPDATE branch_transfers SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, transferId]
    );

    // If received, update stock in destination branch
    if (status === 'received') {
      // Remove reserved stock from source branch
      await this.db.exec(
        'UPDATE branch_stock SET quantity = quantity - ?, reserved_quantity = reserved_quantity - ? WHERE branch_id = ? AND product_id = ?',
        [transfer.quantity, transfer.quantity, transfer.from_branch_id, transfer.product_id]
      );

      // Add stock to destination branch
      await this.updateBranchStock(transfer.to_branch_id, transfer.product_id, transfer.quantity);
    }

    logger.info(`Completed transfer: ${transfer.transfer_number} - ${status}`);
  }

  /**
   * Get branch dashboard data
   */
  async getBranchDashboard(branchId: number): Promise<BranchDashboard> {
    const branch = await this.getBranch(branchId);
    if (!branch) {
      throw new Error('Branch not found');
    }

    // Get total products and value
    const stockData = await this.db.get(`
      SELECT 
        COUNT(*) as total_products,
        SUM(bs.quantity * p.cost_price) as total_value
      FROM branch_stock bs
      JOIN products p ON bs.product_id = p.id
      WHERE bs.branch_id = ? AND bs.quantity > 0
    `, [branchId]);

    // Get low stock items
    const lowStockData = await this.db.get(`
      SELECT COUNT(*) as low_stock_items
      FROM branch_stock bs
      JOIN products p ON bs.product_id = p.id
      WHERE bs.branch_id = ? AND bs.quantity <= p.min_stock
    `, [branchId]);

    // Get pending transfers
    const pendingTransfers = await this.db.get(`
      SELECT COUNT(*) as pending_transfers
      FROM branch_transfers
      WHERE (from_branch_id = ? OR to_branch_id = ?) AND status = 'pending'
    `, [branchId, branchId]);

    // Get today's sales
    const todaySales = await this.db.get(`
      SELECT 
        COUNT(*) as today_sales,
        SUM(total_amount) as today_revenue
      FROM sales
      WHERE branch_id = ? AND DATE(created_at) = DATE('now')
    `, [branchId]);

    // Get top products
    const topProducts = await this.db.query(`
      SELECT 
        si.product_id,
        p.name as product_name,
        SUM(si.quantity) as quantity_sold,
        SUM(si.total_price) as revenue
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
      JOIN products p ON si.product_id = p.id
      WHERE s.branch_id = ? AND DATE(s.created_at) = DATE('now')
      GROUP BY si.product_id, p.name
      ORDER BY quantity_sold DESC
      LIMIT 5
    `, [branchId]);

    return {
      branch_id: branchId,
      branch_name: branch.name,
      total_products: stockData?.total_products || 0,
      total_value: stockData?.total_value || 0,
      low_stock_items: lowStockData?.low_stock_items || 0,
      pending_transfers: pendingTransfers?.pending_transfers || 0,
      today_sales: todaySales?.today_sales || 0,
      today_revenue: todaySales?.today_revenue || 0,
      top_products: topProducts
    };
  }

  /**
   * Set current branch
   */
  setCurrentBranch(branchId: number): void {
    this.currentBranchId = branchId;
    logger.info(`Current branch set to: ${branchId}`);
  }

  /**
   * Get current branch ID
   */
  getCurrentBranchId(): number {
    return this.currentBranchId;
  }

  /**
   * Get branch performance comparison
   */
  async getBranchPerformanceComparison(): Promise<any[]> {
    const performance = await this.db.query(`
      SELECT 
        b.id, b.name, b.code,
        COUNT(DISTINCT s.id) as total_sales,
        SUM(s.total_amount) as total_revenue,
        AVG(s.total_amount) as avg_sale_amount,
        COUNT(DISTINCT bs.product_id) as total_products,
        SUM(bs.quantity * p.cost_price) as inventory_value
      FROM branches b
      LEFT JOIN sales s ON b.id = s.branch_id
      LEFT JOIN branch_stock bs ON b.id = bs.branch_id
      LEFT JOIN products p ON bs.product_id = p.id
      WHERE b.is_active = 1
      GROUP BY b.id, b.name, b.code
      ORDER BY total_revenue DESC
    `);

    return performance;
  }
}
