import express from 'express';
import { DatabaseManager } from '../../lib/database';
import { AuthManager } from '../../lib/auth';
import { MultiBranchManager } from '../../lib/multi-branch-manager';
import { logger } from '../../lib/logger';
import { User } from '../../types';

const router = express.Router();
const databaseManager = new DatabaseManager();
const authManager = new AuthManager();
const multiBranchManager = new MultiBranchManager();

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

// GET /api/branches - Get all branches
router.get('/', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'branches.view')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to view branches.',
        timestamp: new Date().toISOString()
      });
    }

    const branches = await multiBranchManager.getBranches();

    res.json({
      success: true,
      data: branches,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get branches error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_BRANCHES_FAILED',
      message: 'Failed to get branches',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/branches/:id - Get branch by ID
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'branches.view')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to view branches.',
        timestamp: new Date().toISOString()
      });
    }

    const branchId = parseInt(req.params.id);
    const branch = await multiBranchManager.getBranch(branchId);

    if (!branch) {
      return res.status(404).json({
        success: false,
        error: 'BRANCH_NOT_FOUND',
        message: 'Branch not found',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: branch,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get branch error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_BRANCH_FAILED',
      message: 'Failed to get branch',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/branches - Create new branch
router.post('/', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'branches.create')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to create branches.',
        timestamp: new Date().toISOString()
      });
    }

    const { name, name_ar, code, address, city, phone, email, manager_name } = req.body;

    if (!name || !name_ar || !code || !address || !city) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Name, name_ar, code, address, and city are required',
        timestamp: new Date().toISOString()
      });
    }

    const branch = await multiBranchManager.createBranch({
      name,
      name_ar,
      code,
      address,
      city,
      phone,
      email,
      manager_name,
      is_active: true,
      is_main_branch: false
    });

    res.status(201).json({
      success: true,
      data: branch,
      message: 'Branch created successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Create branch error:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_BRANCH_FAILED',
      message: 'Failed to create branch',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/branches/:id - Update branch
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'branches.update')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to update branches.',
        timestamp: new Date().toISOString()
      });
    }

    const branchId = parseInt(req.params.id);
    const branchData = req.body;

    const branch = await multiBranchManager.updateBranch(branchId, branchData);

    res.json({
      success: true,
      data: branch,
      message: 'Branch updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Update branch error:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_BRANCH_FAILED',
      message: 'Failed to update branch',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/branches/:id/stock - Get branch stock
router.get('/:id/stock', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'branches.view')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to view branch stock.',
        timestamp: new Date().toISOString()
      });
    }

    const branchId = parseInt(req.params.id);
    const { product_id } = req.query;

    const stock = await multiBranchManager.getBranchStock(
      branchId, 
      product_id ? parseInt(product_id as string) : undefined
    );

    res.json({
      success: true,
      data: stock,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get branch stock error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_BRANCH_STOCK_FAILED',
      message: 'Failed to get branch stock',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/branches/:id/stock - Update branch stock
router.put('/:id/stock', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'branches.update')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to update branch stock.',
        timestamp: new Date().toISOString()
      });
    }

    const branchId = parseInt(req.params.id);
    const { product_id, quantity, reserved_quantity } = req.body;

    if (!product_id || quantity === undefined) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'product_id and quantity are required',
        timestamp: new Date().toISOString()
      });
    }

    await multiBranchManager.updateBranchStock(
      branchId, 
      product_id, 
      quantity, 
      reserved_quantity || 0
    );

    res.json({
      success: true,
      message: 'Branch stock updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Update branch stock error:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_BRANCH_STOCK_FAILED',
      message: 'Failed to update branch stock',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/branches/:id/dashboard - Get branch dashboard
router.get('/:id/dashboard', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'branches.view')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to view branch dashboard.',
        timestamp: new Date().toISOString()
      });
    }

    const branchId = parseInt(req.params.id);
    const dashboard = await multiBranchManager.getBranchDashboard(branchId);

    res.json({
      success: true,
      data: dashboard,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get branch dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_BRANCH_DASHBOARD_FAILED',
      message: 'Failed to get branch dashboard',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/branches/:id/transfers - Get branch transfers
router.get('/:id/transfers', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'branches.view')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to view branch transfers.',
        timestamp: new Date().toISOString()
      });
    }

    const branchId = parseInt(req.params.id);
    const { status } = req.query;

    const transfers = await multiBranchManager.getBranchTransfers(
      branchId, 
      status as string
    );

    res.json({
      success: true,
      data: transfers,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get branch transfers error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_BRANCH_TRANSFERS_FAILED',
      message: 'Failed to get branch transfers',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/branches/transfers - Create transfer
router.post('/transfers', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'branches.transfer')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to create transfers.',
        timestamp: new Date().toISOString()
      });
    }

    const { from_branch_id, to_branch_id, product_id, quantity, notes } = req.body;

    if (!from_branch_id || !to_branch_id || !product_id || !quantity) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'from_branch_id, to_branch_id, product_id, and quantity are required',
        timestamp: new Date().toISOString()
      });
    }

    if (from_branch_id === to_branch_id) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_TRANSFER',
        message: 'Source and destination branches cannot be the same',
        timestamp: new Date().toISOString()
      });
    }

    const transfer = await multiBranchManager.createTransfer({
      from_branch_id,
      to_branch_id,
      product_id,
      quantity,
      status: 'pending',
      requested_by: currentUser.id,
      notes
    });

    res.status(201).json({
      success: true,
      data: transfer,
      message: 'Transfer created successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Create transfer error:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_TRANSFER_FAILED',
      message: error instanceof Error ? error.message : 'Failed to create transfer',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/branches/transfers/:id/approve - Approve transfer
router.put('/transfers/:id/approve', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'branches.approve')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to approve transfers.',
        timestamp: new Date().toISOString()
      });
    }

    const transferId = parseInt(req.params.id);
    await multiBranchManager.approveTransfer(transferId, currentUser.id);

    res.json({
      success: true,
      message: 'Transfer approved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Approve transfer error:', error);
    res.status(500).json({
      success: false,
      error: 'APPROVE_TRANSFER_FAILED',
      message: error instanceof Error ? error.message : 'Failed to approve transfer',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/branches/transfers/:id/complete - Complete transfer
router.put('/transfers/:id/complete', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'branches.transfer')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to complete transfers.',
        timestamp: new Date().toISOString()
      });
    }

    const transferId = parseInt(req.params.id);
    const { status } = req.body;

    if (!status || !['shipped', 'received'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_STATUS',
        message: 'Status must be either "shipped" or "received"',
        timestamp: new Date().toISOString()
      });
    }

    await multiBranchManager.completeTransfer(transferId, status);

    res.json({
      success: true,
      message: `Transfer ${status} successfully`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Complete transfer error:', error);
    res.status(500).json({
      success: false,
      error: 'COMPLETE_TRANSFER_FAILED',
      message: error instanceof Error ? error.message : 'Failed to complete transfer',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/branches/performance - Get branch performance comparison
router.get('/performance/comparison', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'branches.view')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to view branch performance.',
        timestamp: new Date().toISOString()
      });
    }

    const performance = await multiBranchManager.getBranchPerformanceComparison();

    res.json({
      success: true,
      data: performance,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get branch performance error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_BRANCH_PERFORMANCE_FAILED',
      message: 'Failed to get branch performance',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
