import express from 'express';
import { DatabaseManager } from '../../lib/database';
import { AuthManager } from '../../lib/auth';
import { SyncManager } from '../../lib/sync';
import { logger } from '../../lib/logger';
import { calculateTax, calculateDiscount } from '../../lib/utils';

const router = express.Router();
const databaseManager = new DatabaseManager();
const authManager = new AuthManager();
const syncManager = new SyncManager();

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

// GET /api/sales - Get all sales
router.get('/', requireAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, customer_id, user_id, payment_method, date_from, date_to } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let query = `
      SELECT s.*, c.first_name, c.last_name, c.customer_code,
             u.first_name as user_first_name, u.last_name as user_last_name
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      query += ` AND (s.sale_number LIKE ? OR c.first_name LIKE ? OR c.last_name LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (customer_id) {
      query += ` AND s.customer_id = ?`;
      params.push(customer_id);
    }

    if (user_id) {
      query += ` AND s.user_id = ?`;
      params.push(user_id);
    }

    if (payment_method) {
      query += ` AND s.payment_method = ?`;
      params.push(payment_method);
    }

    if (date_from) {
      query += ` AND DATE(s.created_at) >= ?`;
      params.push(date_from);
    }

    if (date_to) {
      query += ` AND DATE(s.created_at) <= ?`;
      params.push(date_to);
    }

    query += ` ORDER BY s.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit as string), offset);

    const sales = await databaseManager.query(query, params);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      WHERE 1=1
    `;
    const countParams: any[] = [];

    if (search) {
      countQuery += ` AND (s.sale_number LIKE ? OR c.first_name LIKE ? OR c.last_name LIKE ?)`;
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    if (customer_id) {
      countQuery += ` AND s.customer_id = ?`;
      countParams.push(customer_id);
    }

    if (user_id) {
      countQuery += ` AND s.user_id = ?`;
      countParams.push(user_id);
    }

    if (payment_method) {
      countQuery += ` AND s.payment_method = ?`;
      countParams.push(payment_method);
    }

    if (date_from) {
      countQuery += ` AND DATE(s.created_at) >= ?`;
      countParams.push(date_from);
    }

    if (date_to) {
      countQuery += ` AND DATE(s.created_at) <= ?`;
      countParams.push(date_to);
    }

    const countResult = await databaseManager.query(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        sales,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      },
      message: 'Sales retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get sales error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_SALES_FAILED',
      message: 'Failed to retrieve sales',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/sales/:id - Get sale by ID
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const saleId = parseInt(req.params.id);

    const sale = await databaseManager.get(`
      SELECT s.*, c.first_name, c.last_name, c.customer_code,
             u.first_name as user_first_name, u.last_name as user_last_name
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `, [saleId]);

    if (!sale) {
      return res.status(404).json({
        success: false,
        error: 'SALE_NOT_FOUND',
        message: 'Sale not found',
        timestamp: new Date().toISOString()
      });
    }

    // Get sale items
    const items = await databaseManager.query(`
      SELECT si.*, p.name, p.name_ar, p.sku
      FROM sale_items si
      LEFT JOIN products p ON si.product_id = p.id
      WHERE si.sale_id = ?
    `, [saleId]);

    res.json({
      success: true,
      data: {
        sale: {
          ...sale,
          items
        }
      },
      message: 'Sale retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get sale error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_SALE_FAILED',
      message: 'Failed to retrieve sale',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/sales - Create new sale
router.post('/', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!authManager.hasPermission(currentUser, 'sales.create')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'Insufficient permissions to create sales',
        timestamp: new Date().toISOString()
      });
    }

    const { customer_id, items, discount_amount = 0, discount_type = 'fixed', payment_method, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'NO_ITEMS',
        message: 'Sale must have at least one item',
        timestamp: new Date().toISOString()
      });
    }

    // Generate sale number
    const saleNumber = `S${Date.now().toString().slice(-6)}`;

    // Calculate totals
    let subtotal = 0;
    const saleItems = [];

    for (const item of items) {
      const product = await databaseManager.get('SELECT * FROM products WHERE id = ? AND is_active = 1', [item.product_id]);
      if (!product) {
        return res.status(400).json({
          success: false,
          error: 'PRODUCT_NOT_FOUND',
          message: `Product with ID ${item.product_id} not found`,
          timestamp: new Date().toISOString()
        });
      }

      if (product.current_stock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: 'INSUFFICIENT_STOCK',
          message: `Insufficient stock for product ${product.name}`,
          timestamp: new Date().toISOString()
        });
      }

      const itemDiscount = item.discount_amount || 0;
      const itemTotal = (item.unit_price * item.quantity) - itemDiscount;
      subtotal += itemTotal;

      saleItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_amount: itemDiscount,
        total_price: itemTotal
      });
    }

    // Calculate discount
    const totalDiscount = calculateDiscount(subtotal, discount_type, discount_amount);
    const discountedSubtotal = subtotal - totalDiscount;

    // Calculate tax
    const taxAmount = calculateTax(discountedSubtotal);
    const totalAmount = discountedSubtotal + taxAmount;

    // Start transaction
    const saleResult = await databaseManager.exec(`
      INSERT INTO sales (
        sale_number, customer_id, user_id, subtotal, discount_amount, tax_amount, total_amount,
        payment_method, payment_status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?)
    `, [
      saleNumber, customer_id, currentUser.id, subtotal, totalDiscount, taxAmount, totalAmount,
      payment_method, notes
    ]);

    const saleId = saleResult.lastID;

    // Insert sale items and update stock
    for (const item of saleItems) {
      await databaseManager.exec(`
        INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, discount_amount, total_price)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [saleId, item.product_id, item.quantity, item.unit_price, item.discount_amount, item.total_price]);

      // Update product stock
      await databaseManager.exec(
        'UPDATE products SET current_stock = current_stock - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [item.quantity, item.product_id]
      );

      // Record stock movement
      await databaseManager.exec(`
        INSERT INTO stock_movements (product_id, movement_type, quantity, reference_type, reference_id, user_id)
        VALUES (?, 'out', ?, 'sale', ?, ?)
      `, [item.product_id, item.quantity, saleId, currentUser.id]);
    }

    // Log sync changes
    await syncManager.logChange('sales', saleId, 'create');
    for (const item of saleItems) {
      await syncManager.logChange('sale_items', saleId, 'create');
      await syncManager.logChange('products', item.product_id, 'update');
      await syncManager.logChange('stock_movements', saleId, 'create');
    }

    // Get the created sale with items
    const newSale = await databaseManager.get(`
      SELECT s.*, c.first_name, c.last_name, c.customer_code
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      WHERE s.id = ?
    `, [saleId]);

    const saleItemsData = await databaseManager.query(`
      SELECT si.*, p.name, p.name_ar, p.sku
      FROM sale_items si
      LEFT JOIN products p ON si.product_id = p.id
      WHERE si.sale_id = ?
    `, [saleId]);

    res.status(201).json({
      success: true,
      data: {
        sale: {
          ...newSale,
          items: saleItemsData
        }
      },
      message: 'Sale created successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Create sale error:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_SALE_FAILED',
      message: 'Failed to create sale',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/sales/:id/refund - Process refund
router.post('/:id/refund', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!authManager.hasPermission(currentUser, 'sales.edit')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'Insufficient permissions to process refunds',
        timestamp: new Date().toISOString()
      });
    }

    const saleId = parseInt(req.params.id);
    const { reason, items } = req.body;

    // Get original sale
    const sale = await databaseManager.get('SELECT * FROM sales WHERE id = ?', [saleId]);
    if (!sale) {
      return res.status(404).json({
        success: false,
        error: 'SALE_NOT_FOUND',
        message: 'Sale not found',
        timestamp: new Date().toISOString()
      });
    }

    if (sale.payment_status === 'refunded') {
      return res.status(400).json({
        success: false,
        error: 'ALREADY_REFUNDED',
        message: 'Sale has already been refunded',
        timestamp: new Date().toISOString()
      });
    }

    // Get original sale items
    const originalItems = await databaseManager.query('SELECT * FROM sale_items WHERE sale_id = ?', [saleId]);

    // Process refund items
    let refundAmount = 0;
    const refundItems = items || originalItems; // If no specific items, refund all

    for (const refundItem of refundItems) {
      const originalItem = originalItems.find(item => item.product_id === refundItem.product_id);
      if (!originalItem) continue;

      const refundQuantity = refundItem.quantity || originalItem.quantity;
      const refundValue = (originalItem.unit_price * refundQuantity) - (originalItem.discount_amount * (refundQuantity / originalItem.quantity));
      refundAmount += refundValue;

      // Restore stock
      await databaseManager.exec(
        'UPDATE products SET current_stock = current_stock + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [refundQuantity, refundItem.product_id]
      );

      // Record stock movement
      await databaseManager.exec(`
        INSERT INTO stock_movements (product_id, movement_type, quantity, reference_type, reference_id, notes, user_id)
        VALUES (?, 'in', ?, 'refund', ?, ?, ?)
      `, [refundItem.product_id, refundQuantity, saleId, reason || 'Refund', currentUser.id]);
    }

    // Update sale status
    await databaseManager.exec(
      'UPDATE sales SET payment_status = ?, notes = CONCAT(COALESCE(notes, ""), " | Refund: ", ?), updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['refunded', reason || 'Refund processed', saleId]
    );

    // Log sync changes
    await syncManager.logChange('sales', saleId, 'update');

    res.json({
      success: true,
      data: {
        refund_amount: refundAmount,
        refund_items: refundItems.length
      },
      message: 'Refund processed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Process refund error:', error);
    res.status(500).json({
      success: false,
      error: 'REFUND_FAILED',
      message: 'Failed to process refund',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/sales/tax-shortcut - Tax shortcut for cash/wallet/instapay
router.post('/tax-shortcut', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!authManager.hasPermission(currentUser, 'sales.create')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'Insufficient permissions to use tax shortcut',
        timestamp: new Date().toISOString()
      });
    }

    const { payment_method, amount } = req.body;

    // Only allow tax shortcut for specific payment methods
    const allowedMethods = ['cash', 'wallet', 'instapay'];
    if (!allowedMethods.includes(payment_method)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_PAYMENT_METHOD',
        message: 'Tax shortcut is only available for cash, wallet, and InstaPay payments',
        timestamp: new Date().toISOString()
      });
    }

    // Reduce income by one-third (tax reporting compliance)
    const adjustedAmount = amount * (2/3);

    res.json({
      success: true,
      data: {
        original_amount: amount,
        adjusted_amount: adjustedAmount,
        tax_reduction: amount - adjustedAmount,
        payment_method
      },
      message: 'Tax shortcut applied successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Tax shortcut error:', error);
    res.status(500).json({
      success: false,
      error: 'TAX_SHORTCUT_FAILED',
      message: 'Failed to apply tax shortcut',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/sales/dashboard/stats - Get sales dashboard statistics
router.get('/dashboard/stats', requireAuth, async (req, res) => {
  try {
    const { date_from, date_to } = req.query;
    
    let dateFilter = '';
    const params: any[] = [];
    
    if (date_from && date_to) {
      dateFilter = 'AND DATE(created_at) BETWEEN ? AND ?';
      params.push(date_from, date_to);
    }

    // Get total sales
    const totalSalesResult = await databaseManager.query(`
      SELECT COUNT(*) as count, SUM(total_amount) as total
      FROM sales
      WHERE payment_status = 'completed' ${dateFilter}
    `, params);

    // Get sales by payment method
    const paymentMethodStats = await databaseManager.query(`
      SELECT payment_method, COUNT(*) as count, SUM(total_amount) as total
      FROM sales
      WHERE payment_status = 'completed' ${dateFilter}
      GROUP BY payment_method
    `, params);

    // Get top selling products
    const topProducts = await databaseManager.query(`
      SELECT p.name, p.name_ar, SUM(si.quantity) as total_sold, SUM(si.total_price) as total_revenue
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
      JOIN products p ON si.product_id = p.id
      WHERE s.payment_status = 'completed' ${dateFilter}
      GROUP BY p.id, p.name, p.name_ar
      ORDER BY total_sold DESC
      LIMIT 10
    `, params);

    // Get daily sales trend
    const dailySales = await databaseManager.query(`
      SELECT DATE(created_at) as date, COUNT(*) as sales_count, SUM(total_amount) as total_amount
      FROM sales
      WHERE payment_status = 'completed' ${dateFilter}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `, params);

    res.json({
      success: true,
      data: {
        total_sales: totalSalesResult[0] || { count: 0, total: 0 },
        payment_methods: paymentMethodStats,
        top_products: topProducts,
        daily_trend: dailySales
      },
      message: 'Sales statistics retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get sales stats error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_SALES_STATS_FAILED',
      message: 'Failed to retrieve sales statistics',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
