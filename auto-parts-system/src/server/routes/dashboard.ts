import express from 'express';
import { DatabaseManager } from '../../lib/database';
import { AuthManager } from '../../lib/auth';
import { logger } from '../../lib/logger';

const router = express.Router();
const db = new DatabaseManager();
const authManager = new AuthManager();

// Middleware to require authentication
const requireAuth = async (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'NO_TOKEN',
        message: 'Authentication token required',
        timestamp: new Date().toISOString()
      });
    }

    const authResult = await authManager.verifyToken(token);
    if (!authResult.success || !authResult.user) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_TOKEN',
        message: 'Invalid or expired token',
        timestamp: new Date().toISOString()
      });
    }

    req.user = authResult.user;
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'AUTH_ERROR',
      message: 'Authentication error',
      timestamp: new Date().toISOString()
    });
  }
};

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'User not authenticated',
        timestamp: new Date().toISOString()
      });
    }

    // Get total products
    const totalProducts = await db.query('SELECT COUNT(*) as count FROM products');
    const totalProductsCount = totalProducts[0]?.count || 0;

    // Get total sales (last 30 days)
    const totalSales = await db.query(`
      SELECT SUM(total_amount) as total 
      FROM sales 
      WHERE created_at >= datetime('now', '-30 days')
    `);
    const totalSalesAmount = totalSales[0]?.total || 0;

    // Get total customers
    const totalCustomers = await db.query('SELECT COUNT(*) as count FROM customers');
    const totalCustomersCount = totalCustomers[0]?.count || 0;

    // Get low stock items
    const lowStockItems = await db.query(`
      SELECT COUNT(*) as count 
      FROM products 
      WHERE stock_quantity <= min_stock
    `);
    const lowStockCount = lowStockItems[0]?.count || 0;

    // Get recent sales (last 10)
    const recentSales = await db.query(`
      SELECT s.id, s.total_amount, s.created_at, c.name as customer_name
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      ORDER BY s.created_at DESC
      LIMIT 10
    `);

    // Get top products (by sales count)
    const topProducts = await db.query(`
      SELECT p.id, p.name, p.stock_quantity, COUNT(si.id) as sales_count
      FROM products p
      LEFT JOIN sale_items si ON p.id = si.product_id
      LEFT JOIN sales s ON si.sale_id = s.id
      WHERE s.created_at >= datetime('now', '-30 days')
      GROUP BY p.id, p.name, p.stock_quantity
      ORDER BY sales_count DESC
      LIMIT 10
    `);

    // Get stock alerts
    const stockAlerts = await db.query(`
      SELECT name as product_name, stock_quantity as current_stock, min_stock
      FROM products
      WHERE stock_quantity <= min_stock
      ORDER BY stock_quantity ASC
      LIMIT 10
    `);

    const dashboardStats = {
      totalProducts: totalProductsCount,
      totalSales: totalSalesAmount,
      totalCustomers: totalCustomersCount,
      lowStockItems: lowStockCount,
      recentSales: recentSales,
      topProducts: topProducts,
      stockAlerts: stockAlerts
    };

    res.json({
      success: true,
      data: dashboardStats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'DASHBOARD_STATS_FAILED',
      message: 'Failed to fetch dashboard statistics',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/dashboard/overview - Get business overview
router.get('/overview', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'User not authenticated',
        timestamp: new Date().toISOString()
      });
    }

    // Get sales trend (last 7 days)
    const salesTrend = await db.query(`
      SELECT DATE(created_at) as date, SUM(total_amount) as daily_sales
      FROM sales
      WHERE created_at >= datetime('now', '-7 days')
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    // Get top categories
    const topCategories = await db.query(`
      SELECT c.name, COUNT(p.id) as product_count, SUM(p.stock_quantity) as total_stock
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id, c.name
      ORDER BY product_count DESC
      LIMIT 5
    `);

    // Get monthly comparison
    const currentMonth = await db.query(`
      SELECT SUM(total_amount) as total
      FROM sales
      WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
    `);

    const lastMonth = await db.query(`
      SELECT SUM(total_amount) as total
      FROM sales
      WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', datetime('now', '-1 month'))
    `);

    const currentMonthTotal = currentMonth[0]?.total || 0;
    const lastMonthTotal = lastMonth[0]?.total || 0;
    const growthRate = lastMonthTotal > 0 ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;

    const overview = {
      salesTrend: salesTrend,
      topCategories: topCategories,
      monthlyGrowth: {
        current: currentMonthTotal,
        previous: lastMonthTotal,
        growthRate: Math.round(growthRate * 100) / 100
      }
    };

    res.json({
      success: true,
      data: overview,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Dashboard overview error:', error);
    res.status(500).json({
      success: false,
      error: 'DASHBOARD_OVERVIEW_FAILED',
      message: 'Failed to fetch dashboard overview',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/dashboard/alerts - Get system alerts
router.get('/alerts', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'User not authenticated',
        timestamp: new Date().toISOString()
      });
    }

    const alerts: any[] = [];

    // Low stock alerts
    const lowStockProducts = await db.query(`
      SELECT name, stock_quantity, min_stock
      FROM products
      WHERE stock_quantity <= min_stock
      LIMIT 5
    `);

    lowStockProducts.forEach(product => {
      alerts.push({
        type: 'warning',
        title: 'Low Stock Alert',
        message: `${product.name} is running low (${product.stock_quantity}/${product.min_stock})`,
        timestamp: new Date().toISOString()
      });
    });

    // Overdue payments
    const overduePayments = await db.query(`
      SELECT c.name, s.total_amount, s.created_at
      FROM sales s
      JOIN customers c ON s.customer_id = c.id
      WHERE s.payment_status = 'pending'
      AND s.created_at < datetime('now', '-30 days')
      LIMIT 5
    `);

    overduePayments.forEach(payment => {
      alerts.push({
        type: 'error',
        title: 'Overdue Payment',
        message: `${payment.name} has an overdue payment of ${payment.total_amount}`,
        timestamp: new Date().toISOString()
      });
    });

    // System alerts
    alerts.push({
      type: 'info',
      title: 'System Status',
      message: 'All systems operational',
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      data: {
        alerts: alerts,
        totalAlerts: alerts.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Dashboard alerts error:', error);
    res.status(500).json({
      success: false,
      error: 'DASHBOARD_ALERTS_FAILED',
      message: 'Failed to fetch dashboard alerts',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
