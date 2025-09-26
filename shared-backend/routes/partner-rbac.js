const express = require('express');
const { body, validationResult } = require('express-validator');
const PartnerUser = require('../models/PartnerUser');
const { authenticateToken: auth } = require('../middleware/auth');
const logger = require('../config/logger');

const router = express.Router();

// RBAC Roles and Permissions
const ROLES = {
  OWNER: 'owner',
  MANAGER: 'manager', 
  STAFF: 'staff',
  ACCOUNTANT: 'accountant',
  HR: 'hr'
};

const PERMISSIONS = {
  // Orders
  VIEW_ORDERS: 'view_orders',
  MANAGE_ORDERS: 'manage_orders',
  UPDATE_ORDER_STATUS: 'update_order_status',
  
  // Invoices
  VIEW_INVOICES: 'view_invoices',
  MANAGE_INVOICES: 'manage_invoices',
  UPDATE_INVOICE_STATUS: 'update_invoice_status',
  
  // Payments
  VIEW_PAYMENTS: 'view_payments',
  MANAGE_PAYMENTS: 'manage_payments',
  REQUEST_PAYOUTS: 'request_payouts',
  
  // Settings
  VIEW_SETTINGS: 'view_settings',
  MANAGE_SETTINGS: 'manage_settings',
  
  // Staff Management
  VIEW_STAFF: 'view_staff',
  MANAGE_STAFF: 'manage_staff',
  
  // Reports
  VIEW_REPORTS: 'view_reports',
  EXPORT_DATA: 'export_data',
  
  // Inventory
  VIEW_INVENTORY: 'view_inventory',
  MANAGE_INVENTORY: 'manage_inventory',
  
  // POS
  USE_POS: 'use_pos',
  MANAGE_POS: 'manage_pos',
  
  // Admin
  ADMIN_OVERRIDE: 'admin_override'
};

const ROLE_PERMISSIONS = {
  [ROLES.OWNER]: Object.values(PERMISSIONS), // Full access
  [ROLES.MANAGER]: [
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.MANAGE_ORDERS,
    PERMISSIONS.UPDATE_ORDER_STATUS,
    PERMISSIONS.VIEW_INVOICES,
    PERMISSIONS.MANAGE_INVOICES,
    PERMISSIONS.UPDATE_INVOICE_STATUS,
    PERMISSIONS.VIEW_PAYMENTS,
    PERMISSIONS.VIEW_SETTINGS,
    PERMISSIONS.MANAGE_SETTINGS,
    PERMISSIONS.VIEW_STAFF,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.MANAGE_INVENTORY,
    PERMISSIONS.USE_POS,
    PERMISSIONS.MANAGE_POS
  ],
  [ROLES.STAFF]: [
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.UPDATE_ORDER_STATUS,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.USE_POS
  ],
  [ROLES.ACCOUNTANT]: [
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.VIEW_INVOICES,
    PERMISSIONS.VIEW_PAYMENTS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_DATA
  ],
  [ROLES.HR]: [
    PERMISSIONS.VIEW_STAFF,
    PERMISSIONS.MANAGE_STAFF,
    PERMISSIONS.VIEW_REPORTS
  ]
};

// Middleware to check permissions
const checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const userRole = user.role || ROLES.STAFF;
      const userPermissions = ROLE_PERMISSIONS[userRole] || [];

      if (!userPermissions.includes(permission)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          required: permission,
          userRole: userRole
        });
      }

      next();
    } catch (error) {
      logger.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        message: 'Permission check failed'
      });
    }
  };
};

// Get all roles
router.get('/roles', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        roles: Object.values(ROLES),
        permissions: PERMISSIONS,
        rolePermissions: ROLE_PERMISSIONS
      }
    });
  } catch (error) {
    logger.error('Failed to get roles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get roles'
    });
  }
});

// Assign role to user
router.post('/users/:userId/assign-role', [
  auth,
  checkPermission(PERMISSIONS.MANAGE_STAFF),
  body('role').isIn(Object.values(ROLES)).withMessage('Invalid role'),
  body('assignedBy').notEmpty().withMessage('Assigned by is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { userId } = req.params;
    const { role, assignedBy } = req.body;
    const currentUser = req.user;

    // Check if current user can assign this role
    const currentUserRole = currentUser.role || ROLES.STAFF;
    const currentUserPermissions = ROLE_PERMISSIONS[currentUserRole] || [];

    if (!currentUserPermissions.includes(PERMISSIONS.MANAGE_STAFF)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to assign roles'
      });
    }

    // Update user role
    const updatedUser = await PartnerUser.findByIdAndUpdate(
      userId,
      { 
        role: role,
        roleAssignedBy: assignedBy,
        roleAssignedAt: new Date()
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    logger.info(`User ${currentUser._id} assigned role ${role} to user ${userId}`);

    res.json({
      success: true,
      message: 'Role assigned successfully',
      data: {
        user: {
          id: updatedUser._id,
          email: updatedUser.email,
          role: updatedUser.role
        }
      }
    });

  } catch (error) {
    logger.error('Failed to assign role:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign role'
    });
  }
});

// Get user permissions
router.get('/users/:userId/permissions', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user;

    // Users can only check their own permissions unless they have admin access
    if (currentUser._id.toString() !== userId && 
        !ROLE_PERMISSIONS[currentUser.role || ROLES.STAFF]?.includes(PERMISSIONS.ADMIN_OVERRIDE)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    const user = await PartnerUser.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userRole = user.role || ROLES.STAFF;
    const userPermissions = ROLE_PERMISSIONS[userRole] || [];

    res.json({
      success: true,
      data: {
        userId: user._id,
        role: userRole,
        permissions: userPermissions
      }
    });

  } catch (error) {
    logger.error('Failed to get user permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user permissions'
    });
  }
});

// Admin override action
router.post('/admin/override/:action', [
  auth,
  checkPermission(PERMISSIONS.ADMIN_OVERRIDE),
  body('reason').notEmpty().withMessage('Reason is required'),
  body('targetId').notEmpty().withMessage('Target ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { action } = req.params;
    const { reason, targetId, data } = req.body;
    const currentUser = req.user;

    // Log admin override action
    logger.warn(`Admin override action: ${action}`, {
      adminId: currentUser._id,
      targetId: targetId,
      reason: reason,
      data: data,
      timestamp: new Date()
    });

    // Handle different override actions
    switch (action) {
      case 'force_order_status':
        // Force update order status
        // Implementation would go here
        break;
      case 'force_payment':
        // Force payment processing
        // Implementation would go here
        break;
      case 'override_inventory':
        // Override inventory levels
        // Implementation would go here
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid override action'
        });
    }

    res.json({
      success: true,
      message: 'Admin override action completed',
      data: {
        action: action,
        targetId: targetId,
        reason: reason,
        timestamp: new Date()
      }
    });

  } catch (error) {
    logger.error('Admin override failed:', error);
    res.status(500).json({
      success: false,
      message: 'Admin override failed'
    });
  }
});

// Get audit log for RBAC actions
router.get('/audit-log', [
  auth,
  checkPermission(PERMISSIONS.VIEW_REPORTS)
], async (req, res) => {
  try {
    const { page = 1, limit = 50, action, userId } = req.query;
    const currentUser = req.user;

    // Build query
    const query = {};
    if (action) query.action = action;
    if (userId) query.userId = userId;

    // Get audit logs (this would be from an audit log collection)
    // For now, return mock data
    const auditLogs = [
      {
        id: '1',
        action: 'role_assigned',
        userId: 'user123',
        targetUserId: 'user456',
        details: { role: 'manager', assignedBy: 'owner123' },
        timestamp: new Date().toISOString(),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    ];

    res.json({
      success: true,
      data: {
        logs: auditLogs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: auditLogs.length
        }
      }
    });

  } catch (error) {
    logger.error('Failed to get audit log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get audit log'
    });
  }
});

module.exports = router;
