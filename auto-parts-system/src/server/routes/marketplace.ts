import express from 'express';
import { DatabaseManager } from '../../lib/database';
import { AuthManager } from '../../lib/auth';
import { MarketplaceConnector } from '../../lib/marketplace-connector';
import { logger } from '../../lib/logger';
import { User } from '../../types';

const router = express.Router();
const databaseManager = new DatabaseManager();
const authManager = new AuthManager();
const marketplaceConnector = new MarketplaceConnector();

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
    req.user = currentUser as User;
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

// GET /api/marketplace/status - Get marketplace connection status
router.get('/status', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'marketplace.view')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to view marketplace status.',
        timestamp: new Date().toISOString()
      });
    }

    const stats = await marketplaceConnector.getMarketplaceStats();

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get marketplace status error:', error);
    res.status(500).json({
      success: false,
      error: 'MARKETPLACE_STATUS_FAILED',
      message: 'Failed to get marketplace status',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/marketplace/sync/products - Sync products to marketplace
router.post('/sync/products', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'marketplace.sync')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to sync products.',
        timestamp: new Date().toISOString()
      });
    }

    const result = await marketplaceConnector.syncProductsToMarketplace();

    res.json({
      success: result.success,
      data: result,
      message: result.success ? 'Products synced successfully' : 'Product sync completed with errors',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Sync products error:', error);
    res.status(500).json({
      success: false,
      error: 'PRODUCT_SYNC_FAILED',
      message: 'Failed to sync products to marketplace',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/marketplace/sync/orders - Sync orders from marketplace
router.post('/sync/orders', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'marketplace.sync')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to sync orders.',
        timestamp: new Date().toISOString()
      });
    }

    const result = await marketplaceConnector.syncOrdersFromMarketplace();

    res.json({
      success: result.success,
      data: result,
      message: result.success ? 'Orders synced successfully' : 'Order sync completed with errors',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Sync orders error:', error);
    res.status(500).json({
      success: false,
      error: 'ORDER_SYNC_FAILED',
      message: 'Failed to sync orders from marketplace',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/marketplace/products/:id/stock - Update product stock on marketplace
router.put('/products/:id/stock', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'marketplace.update')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to update marketplace products.',
        timestamp: new Date().toISOString()
      });
    }

    const productId = parseInt(req.params.id);
    const { stock_quantity } = req.body;

    if (!stock_quantity || stock_quantity < 0) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_STOCK_QUANTITY',
        message: 'Valid stock quantity is required',
        timestamp: new Date().toISOString()
      });
    }

    const success = await marketplaceConnector.updateProductStock(productId, stock_quantity);

    res.json({
      success,
      message: success ? 'Product stock updated successfully' : 'Failed to update product stock',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Update product stock error:', error);
    res.status(500).json({
      success: false,
      error: 'STOCK_UPDATE_FAILED',
      message: 'Failed to update product stock on marketplace',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/marketplace/orders/:id/status - Update order status on marketplace
router.put('/orders/:id/status', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'marketplace.update')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to update marketplace orders.',
        timestamp: new Date().toISOString()
      });
    }

    const orderId = req.params.id;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_STATUS',
        message: `Valid status is required. Must be one of: ${validStatuses.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }

    const success = await marketplaceConnector.updateOrderStatus(orderId, status);

    res.json({
      success,
      message: success ? 'Order status updated successfully' : 'Failed to update order status',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      error: 'STATUS_UPDATE_FAILED',
      message: 'Failed to update order status on marketplace',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/marketplace/settings - Update marketplace settings
router.post('/settings', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'marketplace.settings')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to update marketplace settings.',
        timestamp: new Date().toISOString()
      });
    }

    const { enabled, api_key } = req.body;

    if (typeof enabled === 'boolean') {
      await marketplaceConnector.setEnabled(enabled);
    }

    if (api_key && typeof api_key === 'string') {
      await marketplaceConnector.setApiKey(api_key);
    }

    res.json({
      success: true,
      message: 'Marketplace settings updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Update marketplace settings error:', error);
    res.status(500).json({
      success: false,
      error: 'SETTINGS_UPDATE_FAILED',
      message: 'Failed to update marketplace settings',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/marketplace/orders - Get marketplace orders
router.get('/orders', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'marketplace.view')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to view marketplace orders.',
        timestamp: new Date().toISOString()
      });
    }

    const { status, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT 
        s.id, s.sale_number, s.total_amount, s.payment_status, s.created_at,
        s.notes, s.payment_method
      FROM sales s
      WHERE s.payment_method = 'marketplace'
    `;

    const params: any[] = [];

    if (status) {
      query += ' AND s.payment_status = ?';
      params.push(status);
    }

    query += ' ORDER BY s.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit as string), parseInt(offset as string));

    const orders = await databaseManager.query(query, params);

    // Get order items for each order
    for (const order of orders) {
      const items = await databaseManager.query(`
        SELECT 
          si.product_id, si.quantity, si.unit_price, si.total_price,
          p.name, p.sku
        FROM sale_items si
        JOIN products p ON si.product_id = p.id
        WHERE si.sale_id = ?
      `, [order.id]);

      order.items = items;
    }

    res.json({
      success: true,
      data: orders,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get marketplace orders error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_ORDERS_FAILED',
      message: 'Failed to get marketplace orders',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
