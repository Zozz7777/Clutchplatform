import express from 'express';
import { DatabaseManager } from '../../lib/database';
import { AuthManager } from '../../lib/auth';
import { SyncManager } from '../../lib/sync';
import { logger } from '../../lib/logger';
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

// GET /api/suppliers - Get all suppliers
router.get('/', requireAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, city } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let query = `
      SELECT s.*, 
             (SELECT COUNT(*) FROM purchase_orders po WHERE po.supplier_id = s.id) as total_orders,
             (SELECT SUM(po.total_amount) FROM purchase_orders po WHERE po.supplier_id = s.id AND po.status = 'received') as total_spent
      FROM suppliers s
      WHERE s.is_active = 1
    `;
    const params: any[] = [];

    if (search) {
      query += ` AND (s.name LIKE ? OR s.name_ar LIKE ? OR s.contact_person LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (city) {
      query += ` AND s.city = ?`;
      params.push(city);
    }

    query += ` ORDER BY s.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit as string), offset);

    const suppliers = await databaseManager.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM suppliers s WHERE s.is_active = 1`;
    const countParams: any[] = [];

    if (search) {
      countQuery += ` AND (s.name LIKE ? OR s.name_ar LIKE ? OR s.contact_person LIKE ?)`;
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    if (city) {
      countQuery += ` AND s.city = ?`;
      countParams.push(city);
    }

    const countResult = await databaseManager.query(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        suppliers,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      },
      message: 'Suppliers retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get suppliers error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_SUPPLIERS_FAILED',
      message: 'Failed to retrieve suppliers',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/suppliers - Create new supplier
router.post('/', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'suppliers.create')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'Insufficient permissions to create suppliers',
        timestamp: new Date().toISOString()
      });
    }

    const { name, name_ar, contact_person, email, phone, address, city, payment_terms, credit_limit = 0 } = req.body;

    const result = await databaseManager.exec(`
      INSERT INTO suppliers (
        name, name_ar, contact_person, email, phone, address, city, payment_terms, credit_limit
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, name_ar, contact_person, email, phone, address, city, payment_terms, credit_limit]);

    // Log sync change
    await syncManager.logChange('suppliers', result.lastID, 'create');

    // Get the created supplier
    const newSupplier = await databaseManager.get('SELECT * FROM suppliers WHERE id = ?', [result.lastID]);

    res.status(201).json({
      success: true,
      data: { supplier: newSupplier },
      message: 'Supplier created successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Create supplier error:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_SUPPLIER_FAILED',
      message: 'Failed to create supplier',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
