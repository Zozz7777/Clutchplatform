import express from 'express';
import { DatabaseManager } from '../../lib/database';
import { AuthManager } from '../../lib/auth';
import { logger } from '../../lib/logger';

const router = express.Router();
const databaseManager = new DatabaseManager();
const authManager = new AuthManager();

// Middleware to check authentication
const requireAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const currentUser = await authManager.getCurrentUser();
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        error: 'NOT_AUTHENTICATED',
        message: 'Authentication required',
        timestamp: new Date().toISOString()
      });
    }
    req.user = currentUser;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'AUTHENTICATION_FAILED',
      message: 'Authentication failed',
      timestamp: new Date().toISOString()
    });
  }
};

// GET /api/reports/sales - Generate sales report
router.get('/sales', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!authManager.hasPermission(currentUser, 'reports.view')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'Insufficient permissions to view reports',
        timestamp: new Date().toISOString()
      });
    }

    const { date_from, date_to, report_type = 'internal' } = req.query;

    let dateFilter = '';
    const params: any[] = [];

    if (date_from && date_to) {
      dateFilter = 'AND DATE(s.created_at) BETWEEN ? AND ?';
      params.push(date_from, date_to);
    }

    // Get sales summary
    const salesSummary = await databaseManager.query(`
      SELECT 
        COUNT(*) as total_sales,
        SUM(total_amount) as total_revenue,
        SUM(tax_amount) as total_tax,
        SUM(discount_amount) as total_discounts,
        AVG(total_amount) as average_sale
      FROM sales s
      WHERE s.payment_status = 'completed' ${dateFilter}
    `, params);

    // Get sales by payment method
    const salesByPayment = await databaseManager.query(`
      SELECT 
        payment_method,
        COUNT(*) as count,
        SUM(total_amount) as total
      FROM sales s
      WHERE s.payment_status = 'completed' ${dateFilter}
      GROUP BY payment_method
    `, params);

    // Get top products
    const topProducts = await databaseManager.query(`
      SELECT 
        p.name, p.name_ar, p.sku,
        SUM(si.quantity) as total_sold,
        SUM(si.total_price) as total_revenue
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
      JOIN products p ON si.product_id = p.id
      WHERE s.payment_status = 'completed' ${dateFilter}
      GROUP BY p.id, p.name, p.name_ar, p.sku
      ORDER BY total_sold DESC
      LIMIT 10
    `, params);

    res.json({
      success: true,
      data: {
        summary: salesSummary[0],
        sales_by_payment: salesByPayment,
        top_products: topProducts,
        report_type,
        date_range: { from: date_from, to: date_to }
      },
      message: 'Sales report generated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Generate sales report error:', error);
    res.status(500).json({
      success: false,
      error: 'SALES_REPORT_FAILED',
      message: 'Failed to generate sales report',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/reports/inventory - Generate inventory report
router.get('/inventory', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!authManager.hasPermission(currentUser, 'reports.view')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'Insufficient permissions to view reports',
        timestamp: new Date().toISOString()
      });
    }

    // Get inventory summary
    const inventorySummary = await databaseManager.query(`
      SELECT 
        COUNT(*) as total_products,
        SUM(current_stock) as total_stock_value,
        SUM(cost_price * current_stock) as total_cost_value,
        SUM(selling_price * current_stock) as total_selling_value
      FROM products
      WHERE is_active = 1
    `);

    // Get low stock products
    const lowStockProducts = await databaseManager.query(`
      SELECT p.*, c.name as category_name, b.name as brand_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.is_active = 1 AND p.current_stock <= p.min_stock
      ORDER BY (p.current_stock - p.min_stock) ASC
    `);

    // Get stock movements
    const stockMovements = await databaseManager.query(`
      SELECT 
        sm.movement_type,
        COUNT(*) as count,
        SUM(sm.quantity) as total_quantity
      FROM stock_movements sm
      WHERE DATE(sm.created_at) >= DATE('now', '-30 days')
      GROUP BY sm.movement_type
    `);

    res.json({
      success: true,
      data: {
        summary: inventorySummary[0],
        low_stock_products: lowStockProducts,
        stock_movements: stockMovements
      },
      message: 'Inventory report generated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Generate inventory report error:', error);
    res.status(500).json({
      success: false,
      error: 'INVENTORY_REPORT_FAILED',
      message: 'Failed to generate inventory report',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
