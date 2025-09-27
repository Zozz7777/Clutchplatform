import { DatabaseManager } from '../../main/database';

export interface RevenueData {
  id: string;
  partnerId: string;
  date: string;
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  paymentMethods: {
    cash: number;
    card: number;
    visa: number;
    instapay: number;
    wallet: number;
  };
  categories: {
    [category: string]: {
      sales: number;
      orders: number;
    };
  };
  hourlyBreakdown: {
    [hour: string]: number;
  };
  topProducts: {
    productId: string;
    productName: string;
    sales: number;
    quantity: number;
  }[];
  createdAt: string;
  syncedAt?: string;
  syncStatus: 'pending' | 'synced' | 'failed';
}

export class RevenueSyncService {
  private database: DatabaseManager;
  private apiUrl: string = process.env.REACT_APP_API_BASE_URL || 'https://api.clutch.com/v1';
  private syncInterval: NodeJS.Timeout | null = null;
  private isOnline: boolean = false;

  constructor() {
    this.database = new DatabaseManager();
  }

  async initialize() {
    // Check online status
    this.isOnline = await this.checkOnlineStatus();
    
    // Start sync interval (every 30 minutes)
    this.syncInterval = setInterval(async () => {
      await this.syncPendingRevenue();
    }, 30 * 60 * 1000);

    // Initial sync
    await this.syncPendingRevenue();
  }

  private async checkOnlineStatus(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/health`, {
        method: 'GET',
        timeout: 5000
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async generateDailyRevenue(date: string): Promise<RevenueData> {
    try {
      // Get sales data for the day
      const salesData = await this.database.query(`
        SELECT 
          o.*,
          oi.product_id,
          oi.product_name,
          oi.quantity,
          oi.price,
          oi.total,
          p.category
        FROM orders o
        LEFT JOIN order_items oi ON o.order_id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE DATE(o.created_at) = ?
        AND o.order_status = 'completed'
      `, [date]);

      // Calculate totals
      let totalSales = 0;
      let totalOrders = 0;
      const paymentMethods = {
        cash: 0,
        card: 0,
        visa: 0,
        instapay: 0,
        wallet: 0
      };
      const categories: { [key: string]: { sales: number; orders: number } } = {};
      const hourlyBreakdown: { [key: string]: number } = {};
      const productSales: { [key: string]: { name: string; sales: number; quantity: number } } = {};

      // Process each order
      const processedOrders = new Set<string>();
      
      for (const order of salesData) {
        if (!processedOrders.has(order.order_id)) {
          totalOrders++;
          totalSales += order.total;
          processedOrders.add(order.order_id);

          // Payment method breakdown
          if (paymentMethods.hasOwnProperty(order.payment_method)) {
            paymentMethods[order.payment_method as keyof typeof paymentMethods] += order.total;
          }

          // Hourly breakdown
          const hour = new Date(order.created_at).getHours().toString().padStart(2, '0');
          hourlyBreakdown[hour] = (hourlyBreakdown[hour] || 0) + order.total;
        }

        // Category breakdown
        if (order.category) {
          if (!categories[order.category]) {
            categories[order.category] = { sales: 0, orders: 0 };
          }
          categories[order.category].sales += order.total;
          categories[order.category].orders += 1;
        }

        // Product sales
        if (order.product_id) {
          if (!productSales[order.product_id]) {
            productSales[order.product_id] = {
              name: order.product_name || 'Unknown Product',
              sales: 0,
              quantity: 0
            };
          }
          productSales[order.product_id].sales += order.total;
          productSales[order.product_id].quantity += order.quantity || 1;
        }
      }

      // Get top products
      const topProducts = Object.entries(productSales)
        .map(([productId, data]) => ({
          productId,
          productName: data.name,
          sales: data.sales,
          quantity: data.quantity
        }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 10);

      const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

      const revenueData: RevenueData = {
        id: `revenue_${date}_${Date.now()}`,
        partnerId: await this.database.getSetting('partner_id') || '',
        date,
        totalSales,
        totalOrders,
        averageOrderValue,
        paymentMethods,
        categories,
        hourlyBreakdown,
        topProducts,
        createdAt: new Date().toISOString(),
        syncStatus: 'pending'
      };

      // Save to local database
      await this.saveRevenueData(revenueData);

      return revenueData;
    } catch (error) {
      console.error('Error generating daily revenue:', error);
      throw error;
    }
  }

  private async saveRevenueData(revenueData: RevenueData): Promise<void> {
    try {
      await this.database.exec(`
        INSERT OR REPLACE INTO revenue_data (
          id, partner_id, date, total_sales, total_orders, 
          average_order_value, payment_methods, categories, 
          hourly_breakdown, top_products, created_at, 
          synced_at, sync_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        revenueData.id,
        revenueData.partnerId,
        revenueData.date,
        revenueData.totalSales,
        revenueData.totalOrders,
        revenueData.averageOrderValue,
        JSON.stringify(revenueData.paymentMethods),
        JSON.stringify(revenueData.categories),
        JSON.stringify(revenueData.hourlyBreakdown),
        JSON.stringify(revenueData.topProducts),
        revenueData.createdAt,
        revenueData.syncedAt || null,
        revenueData.syncStatus
      ]);
    } catch (error) {
      console.error('Error saving revenue data:', error);
      throw error;
    }
  }

  async syncPendingRevenue(): Promise<void> {
    if (!this.isOnline) {
      this.isOnline = await this.checkOnlineStatus();
      if (!this.isOnline) return;
    }

    try {
      // Get pending revenue data
      const pendingRevenue = await this.database.query(`
        SELECT * FROM revenue_data 
        WHERE sync_status = 'pending' 
        ORDER BY created_at ASC
        LIMIT 10
      `);

      for (const revenue of pendingRevenue) {
        await this.syncRevenueToServer(revenue);
      }
    } catch (error) {
      console.error('Error syncing pending revenue:', error);
    }
  }

  private async syncRevenueToServer(revenueData: any): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/api/v1/partners/${revenueData.partner_id}/revenue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.database.getSetting('auth_token')}`
        },
        body: JSON.stringify({
          id: revenueData.id,
          date: revenueData.date,
          totalSales: revenueData.total_sales,
          totalOrders: revenueData.total_orders,
          averageOrderValue: revenueData.average_order_value,
          paymentMethods: JSON.parse(revenueData.payment_methods),
          categories: JSON.parse(revenueData.categories),
          hourlyBreakdown: JSON.parse(revenueData.hourly_breakdown),
          topProducts: JSON.parse(revenueData.top_products),
          createdAt: revenueData.created_at
        })
      });

      if (response.ok) {
        // Update sync status
        await this.database.exec(`
          UPDATE revenue_data 
          SET sync_status = 'synced', synced_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `, [revenueData.id]);
      } else {
        // Mark as failed
        await this.database.exec(`
          UPDATE revenue_data 
          SET sync_status = 'failed' 
          WHERE id = ?
        `, [revenueData.id]);
      }
    } catch (error) {
      console.error('Error syncing revenue to server:', error);
      // Mark as failed
      await this.database.exec(`
        UPDATE revenue_data 
        SET sync_status = 'failed' 
        WHERE id = ?
      `, [revenueData.id]);
    }
  }

  async getRevenueReport(startDate: string, endDate: string): Promise<RevenueData[]> {
    try {
      const revenueData = await this.database.query(`
        SELECT * FROM revenue_data 
        WHERE date BETWEEN ? AND ?
        ORDER BY date DESC
      `, [startDate, endDate]);

      return revenueData.map((revenue: any) => ({
        id: revenue.id,
        partnerId: revenue.partner_id,
        date: revenue.date,
        totalSales: revenue.total_sales,
        totalOrders: revenue.total_orders,
        averageOrderValue: revenue.average_order_value,
        paymentMethods: JSON.parse(revenue.payment_methods),
        categories: JSON.parse(revenue.categories),
        hourlyBreakdown: JSON.parse(revenue.hourly_breakdown),
        topProducts: JSON.parse(revenue.top_products),
        createdAt: revenue.created_at,
        syncedAt: revenue.synced_at,
        syncStatus: revenue.sync_status
      }));
    } catch (error) {
      console.error('Error getting revenue report:', error);
      throw error;
    }
  }

  async createRevenueTables(): Promise<void> {
    try {
      await this.database.exec(`
        CREATE TABLE IF NOT EXISTS revenue_data (
          id TEXT PRIMARY KEY,
          partner_id TEXT NOT NULL,
          date TEXT NOT NULL,
          total_sales REAL NOT NULL,
          total_orders INTEGER NOT NULL,
          average_order_value REAL NOT NULL,
          payment_methods TEXT NOT NULL,
          categories TEXT NOT NULL,
          hourly_breakdown TEXT NOT NULL,
          top_products TEXT NOT NULL,
          created_at TEXT NOT NULL,
          synced_at TEXT,
          sync_status TEXT DEFAULT 'pending',
          UNIQUE(partner_id, date)
        )
      `);
    } catch (error) {
      console.error('Error creating revenue tables:', error);
      throw error;
    }
  }

  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}
