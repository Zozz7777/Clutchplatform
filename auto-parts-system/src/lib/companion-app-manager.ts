import { logger } from './logger';
import { DatabaseManager } from './database';
import { AuthManager } from './auth';

export interface CompanionAppStats {
  total_sales: number;
  total_revenue: number;
  total_customers: number;
  total_products: number;
  low_stock_items: number;
  pending_orders: number;
  today_sales: number;
  today_revenue: number;
  monthly_sales: number;
  monthly_revenue: number;
  top_products: Array<{
    product_id: number;
    product_name: string;
    quantity_sold: number;
    revenue: number;
  }>;
  top_customers: Array<{
    customer_id: number;
    customer_name: string;
    total_spent: number;
    total_orders: number;
  }>;
  recent_activities: Array<{
    id: number;
    type: 'sale' | 'purchase' | 'stock_movement' | 'customer' | 'supplier';
    description: string;
    amount?: number;
    created_at: string;
  }>;
  alerts: Array<{
    id: number;
    type: 'low_stock' | 'payment_due' | 'order_overdue' | 'system';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    message: string;
    created_at: string;
  }>;
}

export interface CompanionAppSettings {
  notifications_enabled: boolean;
  push_notifications: boolean;
  email_notifications: boolean;
  daily_reports: boolean;
  weekly_reports: boolean;
  monthly_reports: boolean;
  low_stock_alerts: boolean;
  payment_reminders: boolean;
  system_alerts: boolean;
  report_recipients: string[];
  alert_thresholds: {
    low_stock_percentage: number;
    payment_due_days: number;
    order_overdue_days: number;
  };
}

export interface CompanionAppReport {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  period_start: string;
  period_end: string;
  generated_at: string;
  data: any;
  format: 'json' | 'pdf' | 'excel';
  status: 'generating' | 'ready' | 'failed';
  download_url?: string;
}

export class CompanionAppManager {
  private db: DatabaseManager;
  private authManager: AuthManager;

  constructor() {
    this.db = new DatabaseManager();
    this.authManager = new AuthManager();
  }

  async initialize(): Promise<void> {
    logger.info('Companion App Manager initialized');
    await this.createCompanionTables();
  }

  /**
   * Create tables for companion app functionality
   */
  private async createCompanionTables(): Promise<void> {
    const tables = [
      // Companion app settings
      `CREATE TABLE IF NOT EXISTS companion_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        settings TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,

      // Companion app reports
      `CREATE TABLE IF NOT EXISTS companion_reports (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        period_start TEXT NOT NULL,
        period_end TEXT NOT NULL,
        generated_at TEXT NOT NULL,
        data TEXT,
        format TEXT NOT NULL,
        status TEXT DEFAULT 'generating',
        download_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,

      // Companion app notifications
      `CREATE TABLE IF NOT EXISTS companion_notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        data TEXT,
        is_read BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,

      // Companion app activity log
      `CREATE TABLE IF NOT EXISTS companion_activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        activity_type TEXT NOT NULL,
        description TEXT NOT NULL,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`
    ];

    for (const table of tables) {
      try {
        await this.db.exec(table);
      } catch (error) {
        logger.error('Error creating companion table:', error);
        throw error;
      }
    }

    logger.info('Companion app tables created successfully');
  }

  /**
   * Get comprehensive stats for companion app
   */
  async getCompanionStats(userId: number): Promise<CompanionAppStats> {
    try {
      // Get basic stats
      const totalSales = await this.db.get('SELECT COUNT(*) as count FROM sales') || { count: 0 };
      const totalRevenue = await this.db.get('SELECT SUM(total_amount) as total FROM sales') || { total: 0 };
      const totalCustomers = await this.db.get('SELECT COUNT(*) as count FROM customers') || { count: 0 };
      const totalProducts = await this.db.get('SELECT COUNT(*) as count FROM products') || { count: 0 };
      const lowStockItems = await this.db.get(`
        SELECT COUNT(*) as count FROM products 
        WHERE stock_quantity <= min_stock
      `) || { count: 0 };
      const pendingOrders = await this.db.get(`
        SELECT COUNT(*) as count FROM purchase_orders 
        WHERE status = 'pending'
      `) || { count: 0 };

      // Get today's stats
      const todayStats = await this.db.get(`
        SELECT 
          COUNT(*) as sales_count,
          SUM(total_amount) as revenue
        FROM sales 
        WHERE DATE(created_at) = DATE('now')
      `) || { sales_count: 0, revenue: 0 };

      // Get monthly stats
      const monthlyStats = await this.db.get(`
        SELECT 
          COUNT(*) as sales_count,
          SUM(total_amount) as revenue
        FROM sales 
        WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
      `) || { sales_count: 0, revenue: 0 };

      // Get top products
      const topProducts = await this.db.query(`
        SELECT 
          si.product_id,
          p.name as product_name,
          SUM(si.quantity) as quantity_sold,
          SUM(si.total_price) as revenue
        FROM sale_items si
        JOIN products p ON si.product_id = p.id
        JOIN sales s ON si.sale_id = s.id
        WHERE DATE(s.created_at) >= DATE('now', '-30 days')
        GROUP BY si.product_id, p.name
        ORDER BY quantity_sold DESC
        LIMIT 5
      `);

      // Get top customers
      const topCustomers = await this.db.query(`
        SELECT 
          s.customer_id,
          c.name as customer_name,
          SUM(s.total_amount) as total_spent,
          COUNT(s.id) as total_orders
        FROM sales s
        JOIN customers c ON s.customer_id = c.id
        WHERE DATE(s.created_at) >= DATE('now', '-30 days')
        GROUP BY s.customer_id, c.name
        ORDER BY total_spent DESC
        LIMIT 5
      `);

      // Get recent activities
      const recentActivities = await this.db.query(`
        SELECT 
          'sale' as type,
          'New sale: ' || s.sale_number as description,
          s.total_amount as amount,
          s.created_at
        FROM sales s
        ORDER BY s.created_at DESC
        LIMIT 10
      `);

      // Get alerts
      const alerts = await this.getCompanionAlerts(userId);

      return {
        total_sales: totalSales.count,
        total_revenue: totalRevenue.total || 0,
        total_customers: totalCustomers.count,
        total_products: totalProducts.count,
        low_stock_items: lowStockItems.count,
        pending_orders: pendingOrders.count,
        today_sales: todayStats.sales_count,
        today_revenue: todayStats.revenue || 0,
        monthly_sales: monthlyStats.sales_count,
        monthly_revenue: monthlyStats.revenue || 0,
        top_products: topProducts,
        top_customers: topCustomers,
        recent_activities: recentActivities,
        alerts: alerts
      };

    } catch (error) {
      logger.error('Failed to get companion stats:', error);
      throw error;
    }
  }

  /**
   * Get companion app settings
   */
  async getCompanionSettings(userId: number): Promise<CompanionAppSettings> {
    try {
      const settings = await this.db.get(
        'SELECT settings FROM companion_settings WHERE user_id = ?',
        [userId]
      );

      if (settings) {
        return JSON.parse(settings.settings);
      }

      // Return default settings
      return {
        notifications_enabled: true,
        push_notifications: true,
        email_notifications: true,
        daily_reports: true,
        weekly_reports: true,
        monthly_reports: true,
        low_stock_alerts: true,
        payment_reminders: true,
        system_alerts: true,
        report_recipients: [],
        alert_thresholds: {
          low_stock_percentage: 20,
          payment_due_days: 7,
          order_overdue_days: 3
        }
      };

    } catch (error) {
      logger.error('Failed to get companion settings:', error);
      throw error;
    }
  }

  /**
   * Update companion app settings
   */
  async updateCompanionSettings(userId: number, settings: Partial<CompanionAppSettings>): Promise<void> {
    try {
      const currentSettings = await this.getCompanionSettings(userId);
      const updatedSettings = { ...currentSettings, ...settings };

      await this.db.exec(
        `INSERT OR REPLACE INTO companion_settings (user_id, settings, updated_at)
         VALUES (?, ?, CURRENT_TIMESTAMP)`,
        [userId, JSON.stringify(updatedSettings)]
      );

      logger.info(`Companion settings updated for user ${userId}`);

    } catch (error) {
      logger.error('Failed to update companion settings:', error);
      throw error;
    }
  }

  /**
   * Generate companion app report
   */
  async generateCompanionReport(
    userId: number,
    type: 'daily' | 'weekly' | 'monthly' | 'custom',
    periodStart?: string,
    periodEnd?: string
  ): Promise<CompanionAppReport> {
    try {
      const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Calculate period dates
      let startDate: string;
      let endDate: string;

      switch (type) {
        case 'daily':
          startDate = new Date().toISOString().split('T')[0];
          endDate = startDate;
          break;
        case 'weekly':
          const today = new Date();
          const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
          startDate = startOfWeek.toISOString().split('T')[0];
          endDate = new Date().toISOString().split('T')[0];
          break;
        case 'monthly':
          const now = new Date();
          startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
          endDate = new Date().toISOString().split('T')[0];
          break;
        case 'custom':
          if (!periodStart || !periodEnd) {
            throw new Error('Custom reports require period start and end dates');
          }
          startDate = periodStart;
          endDate = periodEnd;
          break;
        default:
          throw new Error(`Invalid report type: ${type}`);
      }

      // Create report record
      await this.db.exec(
        `INSERT INTO companion_reports (id, user_id, type, period_start, period_end, generated_at, format, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [reportId, userId, type, startDate, endDate, new Date().toISOString(), 'json', 'generating']
      );

      // Generate report data (simplified for now)
      const reportData = await this.generateReportData(startDate, endDate);

      // Update report with data
      await this.db.exec(
        'UPDATE companion_reports SET data = ?, status = ? WHERE id = ?',
        [JSON.stringify(reportData), 'ready', reportId]
      );

      const report: CompanionAppReport = {
        id: reportId,
        type,
        period_start: startDate,
        period_end: endDate,
        generated_at: new Date().toISOString(),
        data: reportData,
        format: 'json',
        status: 'ready'
      };

      logger.info(`Companion report generated: ${reportId}`);
      return report;

    } catch (error) {
      logger.error('Failed to generate companion report:', error);
      throw error;
    }
  }

  /**
   * Get companion app reports
   */
  async getCompanionReports(userId: number, limit: number = 20): Promise<CompanionAppReport[]> {
    try {
      const reports = await this.db.query(`
        SELECT * FROM companion_reports 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ?
      `, [userId, limit]);

      return reports.map((report: any) => ({
        id: report.id,
        type: report.type,
        period_start: report.period_start,
        period_end: report.period_end,
        generated_at: report.generated_at,
        data: report.data ? JSON.parse(report.data) : null,
        format: report.format,
        status: report.status,
        download_url: report.download_url
      }));

    } catch (error) {
      logger.error('Failed to get companion reports:', error);
      throw error;
    }
  }

  /**
   * Get companion app notifications
   */
  async getCompanionNotifications(userId: number, unreadOnly: boolean = false): Promise<any[]> {
    try {
      let query = `
        SELECT * FROM companion_notifications 
        WHERE user_id = ?
      `;
      const params = [userId];

      if (unreadOnly) {
        query += ' AND is_read = 0';
      }

      query += ' ORDER BY created_at DESC LIMIT 50';

      const notifications = await this.db.query(query, params);
      return notifications;

    } catch (error) {
      logger.error('Failed to get companion notifications:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(userId: number, notificationId: number): Promise<void> {
    try {
      await this.db.exec(
        'UPDATE companion_notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
        [notificationId, userId]
      );

      logger.info(`Notification ${notificationId} marked as read for user ${userId}`);

    } catch (error) {
      logger.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  /**
   * Create companion app notification
   */
  async createCompanionNotification(
    userId: number,
    type: string,
    title: string,
    message: string,
    data?: any
  ): Promise<void> {
    try {
      await this.db.exec(
        `INSERT INTO companion_notifications (user_id, type, title, message, data)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, type, title, message, data ? JSON.stringify(data) : null]
      );

      logger.info(`Companion notification created for user ${userId}: ${title}`);

    } catch (error) {
      logger.error('Failed to create companion notification:', error);
      throw error;
    }
  }

  /**
   * Log companion app activity
   */
  async logCompanionActivity(
    userId: number,
    activityType: string,
    description: string,
    metadata?: any
  ): Promise<void> {
    try {
      await this.db.exec(
        `INSERT INTO companion_activities (user_id, activity_type, description, metadata)
         VALUES (?, ?, ?, ?)`,
        [userId, activityType, description, metadata ? JSON.stringify(metadata) : null]
      );

      logger.info(`Companion activity logged for user ${userId}: ${activityType}`);

    } catch (error) {
      logger.error('Failed to log companion activity:', error);
      throw error;
    }
  }

  // Helper methods
  private async getCompanionAlerts(userId: number): Promise<any[]> {
    const alerts = [];

    try {
      // Low stock alerts
      const lowStockProducts = await this.db.query(`
        SELECT name, stock_quantity, min_stock 
        FROM products 
        WHERE stock_quantity <= min_stock
        LIMIT 5
      `);

      for (const product of lowStockProducts) {
        alerts.push({
          id: `low_stock_${product.name}`,
          type: 'low_stock',
          severity: 'medium',
          title: 'Low Stock Alert',
          message: `${product.name} is running low (${product.stock_quantity}/${product.min_stock})`,
          created_at: new Date().toISOString()
        });
      }

      // Payment due alerts
      const overduePayments = await this.db.query(`
        SELECT COUNT(*) as count 
        FROM purchase_orders 
        WHERE status = 'pending' AND due_date < DATE('now')
      `);

      if (overduePayments[0]?.count > 0) {
        alerts.push({
          id: 'overdue_payments',
          type: 'payment_due',
          severity: 'high',
          title: 'Overdue Payments',
          message: `${overduePayments[0].count} purchase orders are overdue`,
          created_at: new Date().toISOString()
        });
      }

    } catch (error) {
      logger.error('Failed to get companion alerts:', error);
    }

    return alerts;
  }

  private async generateReportData(startDate: string, endDate: string): Promise<any> {
    try {
      // Get sales data for the period
      const salesData = await this.db.query(`
        SELECT 
          COUNT(*) as total_sales,
          SUM(total_amount) as total_revenue,
          AVG(total_amount) as avg_sale_amount
        FROM sales 
        WHERE DATE(created_at) BETWEEN ? AND ?
      `, [startDate, endDate]);

      // Get top products for the period
      const topProducts = await this.db.query(`
        SELECT 
          p.name,
          SUM(si.quantity) as quantity_sold,
          SUM(si.total_price) as revenue
        FROM sale_items si
        JOIN products p ON si.product_id = p.id
        JOIN sales s ON si.sale_id = s.id
        WHERE DATE(s.created_at) BETWEEN ? AND ?
        GROUP BY p.id, p.name
        ORDER BY quantity_sold DESC
        LIMIT 10
      `, [startDate, endDate]);

      // Get customer data for the period
      const customerData = await this.db.query(`
        SELECT 
          COUNT(DISTINCT customer_id) as unique_customers,
          COUNT(*) as total_orders
        FROM sales 
        WHERE DATE(created_at) BETWEEN ? AND ?
      `, [startDate, endDate]);

      return {
        period: { start: startDate, end: endDate },
        sales: salesData[0] || { total_sales: 0, total_revenue: 0, avg_sale_amount: 0 },
        top_products: topProducts,
        customers: customerData[0] || { unique_customers: 0, total_orders: 0 },
        generated_at: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Failed to generate report data:', error);
      throw error;
    }
  }
}
