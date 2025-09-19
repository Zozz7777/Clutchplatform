import express from 'express';
import { DatabaseManager } from '../../lib/database';
import { AuthManager } from '../../lib/auth';
import { SyncManager } from '../../lib/sync';
import { logger } from '../../lib/logger';

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

// GET /api/customers - Get all customers
router.get('/', requireAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, city, has_credit } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let query = `
      SELECT c.*, 
             (SELECT COUNT(*) FROM sales s WHERE s.customer_id = c.id) as total_purchases,
             (SELECT SUM(s.total_amount) FROM sales s WHERE s.customer_id = c.id AND s.payment_status = 'completed') as total_spent,
             (SELECT MAX(s.created_at) FROM sales s WHERE s.customer_id = c.id) as last_purchase
      FROM customers c
      WHERE c.is_active = 1
    `;
    const params: any[] = [];

    if (search) {
      query += ` AND (c.first_name LIKE ? OR c.last_name LIKE ? OR c.customer_code LIKE ? OR c.phone LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (city) {
      query += ` AND c.city = ?`;
      params.push(city);
    }

    if (has_credit === 'true') {
      query += ` AND c.credit_limit > 0`;
    }

    query += ` ORDER BY c.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit as string), offset);

    const customers = await databaseManager.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM customers c WHERE c.is_active = 1`;
    const countParams: any[] = [];

    if (search) {
      countQuery += ` AND (c.first_name LIKE ? OR c.last_name LIKE ? OR c.customer_code LIKE ? OR c.phone LIKE ?)`;
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (city) {
      countQuery += ` AND c.city = ?`;
      countParams.push(city);
    }

    if (has_credit === 'true') {
      countQuery += ` AND c.credit_limit > 0`;
    }

    const countResult = await databaseManager.query(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        customers,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      },
      message: 'Customers retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_CUSTOMERS_FAILED',
      message: 'Failed to retrieve customers',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/customers/:id - Get customer by ID
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const customerId = parseInt(req.params.id);

    const customer = await databaseManager.get(`
      SELECT c.*, 
             (SELECT COUNT(*) FROM sales s WHERE s.customer_id = c.id) as total_purchases,
             (SELECT SUM(s.total_amount) FROM sales s WHERE s.customer_id = c.id AND s.payment_status = 'completed') as total_spent,
             (SELECT MAX(s.created_at) FROM sales s WHERE s.customer_id = c.id) as last_purchase
      FROM customers c
      WHERE c.id = ? AND c.is_active = 1
    `, [customerId]);

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'CUSTOMER_NOT_FOUND',
        message: 'Customer not found',
        timestamp: new Date().toISOString()
      });
    }

    // Get purchase history
    const purchaseHistory = await databaseManager.query(`
      SELECT s.*, u.first_name as user_first_name, u.last_name as user_last_name
      FROM sales s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.customer_id = ?
      ORDER BY s.created_at DESC
      LIMIT 20
    `, [customerId]);

    res.json({
      success: true,
      data: {
        customer: {
          ...customer,
          purchase_history: purchaseHistory
        }
      },
      message: 'Customer retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get customer error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_CUSTOMER_FAILED',
      message: 'Failed to retrieve customer',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/customers - Create new customer
router.post('/', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!authManager.hasPermission(currentUser, 'customers.create')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'Insufficient permissions to create customers',
        timestamp: new Date().toISOString()
      });
    }

    const { first_name, last_name, email, phone, address, city, loyalty_points = 0, credit_limit = 0 } = req.body;

    // Generate customer code
    const customerCode = `C${Date.now().toString().slice(-6)}`;

    const result = await databaseManager.exec(`
      INSERT INTO customers (
        customer_code, first_name, last_name, email, phone, address, city, loyalty_points, credit_limit
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [customerCode, first_name, last_name, email, phone, address, city, loyalty_points, credit_limit]);

    // Log sync change
    await syncManager.logChange('customers', result.lastID, 'create');

    // Get the created customer
    const newCustomer = await databaseManager.get('SELECT * FROM customers WHERE id = ?', [result.lastID]);

    res.status(201).json({
      success: true,
      data: { customer: newCustomer },
      message: 'Customer created successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Create customer error:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_CUSTOMER_FAILED',
      message: 'Failed to create customer',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/customers/:id - Update customer
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!authManager.hasPermission(currentUser, 'customers.edit')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'Insufficient permissions to edit customers',
        timestamp: new Date().toISOString()
      });
    }

    const customerId = parseInt(req.params.id);
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
    updateValues.push(customerId);

    await databaseManager.exec(
      `UPDATE customers SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Log sync change
    await syncManager.logChange('customers', customerId, 'update');

    // Get updated customer
    const updatedCustomer = await databaseManager.get('SELECT * FROM customers WHERE id = ?', [customerId]);

    res.json({
      success: true,
      data: { customer: updatedCustomer },
      message: 'Customer updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Update customer error:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_CUSTOMER_FAILED',
      message: 'Failed to update customer',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/customers/:id - Delete customer
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!authManager.hasPermission(currentUser, 'customers.delete')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'Insufficient permissions to delete customers',
        timestamp: new Date().toISOString()
      });
    }

    const customerId = parseInt(req.params.id);

    // Check if customer exists
    const customer = await databaseManager.get('SELECT id FROM customers WHERE id = ?', [customerId]);
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'CUSTOMER_NOT_FOUND',
        message: 'Customer not found',
        timestamp: new Date().toISOString()
      });
    }

    // Soft delete (set is_active to false)
    await databaseManager.exec(
      'UPDATE customers SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [customerId]
    );

    // Log sync change
    await syncManager.logChange('customers', customerId, 'delete');

    res.json({
      success: true,
      message: 'Customer deleted successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Delete customer error:', error);
    res.status(500).json({
      success: false,
      error: 'DELETE_CUSTOMER_FAILED',
      message: 'Failed to delete customer',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
