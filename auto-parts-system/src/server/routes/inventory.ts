import express from 'express';
import { DatabaseManager } from '../../lib/database';
import { AuthManager } from '../../lib/auth';
import { SyncManager } from '../../lib/sync';
import { logger } from '../../lib/logger';
import { generateSKU, generateBarcode } from '../../lib/utils';
import { User } from '../../types';

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

// GET /api/inventory/products - Get all products
router.get('/products', requireAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category_id, brand_id, stock_status } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let query = `
      SELECT p.*, c.name as category_name, c.name_ar as category_name_ar,
             b.name as brand_name, b.name_ar as brand_name_ar
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      query += ` AND (p.name LIKE ? OR p.name_ar LIKE ? OR p.sku LIKE ? OR p.barcode LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (category_id) {
      query += ` AND p.category_id = ?`;
      params.push(category_id);
    }

    if (brand_id) {
      query += ` AND p.brand_id = ?`;
      params.push(brand_id);
    }

    if (stock_status) {
      switch (stock_status) {
        case 'low_stock':
          query += ` AND p.current_stock <= p.min_stock`;
          break;
        case 'out_of_stock':
          query += ` AND p.current_stock = 0`;
          break;
        case 'in_stock':
          query += ` AND p.current_stock > p.min_stock`;
          break;
      }
    }

    query += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit as string), offset);

    const products = await databaseManager.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM products p WHERE 1=1`;
    const countParams: any[] = [];

    if (search) {
      countQuery += ` AND (p.name LIKE ? OR p.name_ar LIKE ? OR p.sku LIKE ? OR p.barcode LIKE ?)`;
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (category_id) {
      countQuery += ` AND p.category_id = ?`;
      countParams.push(category_id);
    }

    if (brand_id) {
      countQuery += ` AND p.brand_id = ?`;
      countParams.push(brand_id);
    }

    if (stock_status) {
      switch (stock_status) {
        case 'low_stock':
          countQuery += ` AND p.current_stock <= p.min_stock`;
          break;
        case 'out_of_stock':
          countQuery += ` AND p.current_stock = 0`;
          break;
        case 'in_stock':
          countQuery += ` AND p.current_stock > p.min_stock`;
          break;
      }
    }

    const countResult = await databaseManager.query(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      },
      message: 'Products retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get products error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_PRODUCTS_FAILED',
      message: 'Failed to retrieve products',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/inventory/products/:id - Get product by ID
router.get('/products/:id', requireAuth, async (req, res) => {
  try {
    const productId = parseInt(req.params.id);

    const product = await databaseManager.get(`
      SELECT p.*, c.name as category_name, c.name_ar as category_name_ar,
             b.name as brand_name, b.name_ar as brand_name_ar
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.id = ?
    `, [productId]);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'PRODUCT_NOT_FOUND',
        message: 'Product not found',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: { product },
      message: 'Product retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get product error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_PRODUCT_FAILED',
      message: 'Failed to retrieve product',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/inventory/products - Create new product
router.post('/products', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'inventory.create')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'Insufficient permissions to create products',
        timestamp: new Date().toISOString()
      });
    }

    const {
      name, name_ar, description, description_ar, category_id, brand_id,
      cost_price, selling_price, min_stock, max_stock, unit, weight, dimensions
    } = req.body;

    // Generate SKU and barcode if not provided
    const category = await databaseManager.get('SELECT name FROM categories WHERE id = ?', [category_id]);
    const brand = await databaseManager.get('SELECT name FROM brands WHERE id = ?', [brand_id]);
    
    const sku = generateSKU(category?.name || 'GEN', brand?.name || 'GEN');
    const barcode = generateBarcode();

    const result = await databaseManager.exec(`
      INSERT INTO products (
        sku, name, name_ar, description, description_ar, category_id, brand_id,
        barcode, cost_price, selling_price, min_stock, max_stock, unit, weight, dimensions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      sku, name, name_ar, description, description_ar, category_id, brand_id,
      barcode, cost_price, selling_price, min_stock, max_stock, unit, weight, dimensions
    ]);

    // Log sync change
    await syncManager.logChange('products', result.lastID, 'create');

    // Get the created product
    const newProduct = await databaseManager.get('SELECT * FROM products WHERE id = ?', [result.lastID]);

    res.status(201).json({
      success: true,
      data: { product: newProduct },
      message: 'Product created successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Create product error:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_PRODUCT_FAILED',
      message: 'Failed to create product',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/inventory/products/:id - Update product
router.put('/products/:id', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'inventory.edit')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'Insufficient permissions to edit products',
        timestamp: new Date().toISOString()
      });
    }

    const productId = parseInt(req.params.id);
    const updateData = req.body;

    // Build dynamic update query
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(updateData[key]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'NO_UPDATE_DATA',
        message: 'No update data provided',
        timestamp: new Date().toISOString()
      });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(productId);

    await databaseManager.exec(
      `UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Log sync change
    await syncManager.logChange('products', productId, 'update');

    // Get updated product
    const updatedProduct = await databaseManager.get('SELECT * FROM products WHERE id = ?', [productId]);

    res.json({
      success: true,
      data: { product: updatedProduct },
      message: 'Product updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Update product error:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_PRODUCT_FAILED',
      message: 'Failed to update product',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/inventory/products/:id - Delete product
router.delete('/products/:id', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'inventory.delete')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'Insufficient permissions to delete products',
        timestamp: new Date().toISOString()
      });
    }

    const productId = parseInt(req.params.id);

    // Check if product exists
    const product = await databaseManager.get('SELECT id FROM products WHERE id = ?', [productId]);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'PRODUCT_NOT_FOUND',
        message: 'Product not found',
        timestamp: new Date().toISOString()
      });
    }

    // Soft delete (set is_active to false)
    await databaseManager.exec(
      'UPDATE products SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [productId]
    );

    // Log sync change
    await syncManager.logChange('products', productId, 'delete');

    res.json({
      success: true,
      message: 'Product deleted successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      error: 'DELETE_PRODUCT_FAILED',
      message: 'Failed to delete product',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/inventory/categories - Get all categories
router.get('/categories', requireAuth, async (req, res) => {
  try {
    const categories = await databaseManager.query(`
      SELECT c.*, 
             (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.is_active = 1) as product_count
      FROM categories c
      WHERE c.is_active = 1
      ORDER BY c.name
    `);

    res.json({
      success: true,
      data: { categories },
      message: 'Categories retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_CATEGORIES_FAILED',
      message: 'Failed to retrieve categories',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/inventory/brands - Get all brands
router.get('/brands', requireAuth, async (req, res) => {
  try {
    const brands = await databaseManager.query(`
      SELECT b.*, 
             (SELECT COUNT(*) FROM products p WHERE p.brand_id = b.id AND p.is_active = 1) as product_count
      FROM brands b
      WHERE b.is_active = 1
      ORDER BY b.name
    `);

    res.json({
      success: true,
      data: { brands },
      message: 'Brands retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get brands error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_BRANDS_FAILED',
      message: 'Failed to retrieve brands',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/inventory/stock-movement - Record stock movement
router.post('/stock-movement', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'inventory.edit')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'Insufficient permissions to record stock movements',
        timestamp: new Date().toISOString()
      });
    }

    const { product_id, movement_type, quantity, reference_type, reference_id, notes } = req.body;

    // Validate movement type
    if (!['in', 'out', 'adjustment'].includes(movement_type)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_MOVEMENT_TYPE',
        message: 'Invalid movement type',
        timestamp: new Date().toISOString()
      });
    }

    // Get current stock
    const product = await databaseManager.get('SELECT current_stock FROM products WHERE id = ?', [product_id]);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'PRODUCT_NOT_FOUND',
        message: 'Product not found',
        timestamp: new Date().toISOString()
      });
    }

    // Calculate new stock
    let newStock = product.current_stock;
    if (movement_type === 'in') {
      newStock += quantity;
    } else if (movement_type === 'out') {
      newStock -= quantity;
      if (newStock < 0) {
        return res.status(400).json({
          success: false,
          error: 'INSUFFICIENT_STOCK',
          message: 'Insufficient stock for this movement',
          timestamp: new Date().toISOString()
        });
      }
    } else if (movement_type === 'adjustment') {
      newStock = quantity;
    }

    // Record stock movement
    const result = await databaseManager.exec(`
      INSERT INTO stock_movements (
        product_id, movement_type, quantity, reference_type, reference_id, notes, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [product_id, movement_type, quantity, reference_type, reference_id, notes, currentUser!.id]);

    // Update product stock
    await databaseManager.exec(
      'UPDATE products SET current_stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newStock, product_id]
    );

    // Log sync changes
    await syncManager.logChange('stock_movements', result.lastID, 'create');
    await syncManager.logChange('products', product_id, 'update');

    res.status(201).json({
      success: true,
      data: {
        movement_id: result.lastID,
        new_stock: newStock
      },
      message: 'Stock movement recorded successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Stock movement error:', error);
    res.status(500).json({
      success: false,
      error: 'STOCK_MOVEMENT_FAILED',
      message: 'Failed to record stock movement',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/inventory/stock-alerts - Get low stock alerts
router.get('/stock-alerts', requireAuth, async (req, res) => {
  try {
    const alerts = await databaseManager.query(`
      SELECT p.id, p.sku, p.name, p.name_ar, p.current_stock, p.min_stock,
             c.name as category_name, b.name as brand_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.is_active = 1 AND p.current_stock <= p.min_stock
      ORDER BY (p.current_stock - p.min_stock) ASC
    `);

    res.json({
      success: true,
      data: { alerts },
      message: 'Stock alerts retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get stock alerts error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_STOCK_ALERTS_FAILED',
      message: 'Failed to retrieve stock alerts',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
