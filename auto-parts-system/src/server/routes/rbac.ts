import express from 'express';
import { DatabaseManager } from '../../lib/database';
import { AuthManager } from '../../lib/auth';
import { RBACManager, UserRole } from '../../lib/rbac-manager';
import { logger } from '../../lib/logger';
import { User } from '../../types';

const router = express.Router();
const databaseManager = new DatabaseManager();
const authManager = new AuthManager();
const rbacManager = new RBACManager();

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

// GET /api/rbac/permissions - Get all permissions
router.get('/permissions', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !await rbacManager.hasPermission(currentUser.id, 'users.view')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to view permissions.',
        timestamp: new Date().toISOString()
      });
    }

    const permissions = await rbacManager.getAllPermissions();

    res.json({
      success: true,
      data: permissions,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get permissions error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_PERMISSIONS_FAILED',
      message: 'Failed to get permissions',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/rbac/roles - Get all roles
router.get('/roles', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !await rbacManager.hasPermission(currentUser.id, 'users.view')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to view roles.',
        timestamp: new Date().toISOString()
      });
    }

    const roles = await rbacManager.getAllRoles();

    res.json({
      success: true,
      data: roles,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get roles error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_ROLES_FAILED',
      message: 'Failed to get roles',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/rbac/users/:id/roles - Get user roles
router.get('/users/:id/roles', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !await rbacManager.hasPermission(currentUser.id, 'users.view')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to view user roles.',
        timestamp: new Date().toISOString()
      });
    }

    const userId = parseInt(req.params.id);
    const roles = await rbacManager.getUserRoles(userId);

    res.json({
      success: true,
      data: roles,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get user roles error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_USER_ROLES_FAILED',
      message: 'Failed to get user roles',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/rbac/users/:id/roles - Assign role to user
router.post('/users/:id/roles', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !await rbacManager.hasPermission(currentUser.id, 'users.update')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to assign roles.',
        timestamp: new Date().toISOString()
      });
    }

    const userId = parseInt(req.params.id);
    const { role_id, expires_at } = req.body;

    if (!role_id) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Role ID is required',
        timestamp: new Date().toISOString()
      });
    }

    const validRoles: UserRole[] = ['owner', 'manager', 'accountant', 'cashier', 'auditor', 'sysadmin'];
    if (!validRoles.includes(role_id)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_ROLE',
        message: `Role must be one of: ${validRoles.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }

    await rbacManager.assignRoleToUser(userId, role_id, currentUser.id, expires_at);

    res.status(201).json({
      success: true,
      message: 'Role assigned successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Assign role error:', error);
    res.status(500).json({
      success: false,
      error: 'ASSIGN_ROLE_FAILED',
      message: 'Failed to assign role',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/rbac/users/:id/roles/:roleId - Remove role from user
router.delete('/users/:id/roles/:roleId', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !await rbacManager.hasPermission(currentUser.id, 'users.update')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to remove roles.',
        timestamp: new Date().toISOString()
      });
    }

    const userId = parseInt(req.params.id);
    const roleId = req.params.roleId as UserRole;

    const validRoles: UserRole[] = ['owner', 'manager', 'accountant', 'cashier', 'auditor', 'sysadmin'];
    if (!validRoles.includes(roleId)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_ROLE',
        message: `Role must be one of: ${validRoles.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }

    await rbacManager.removeRoleFromUser(userId, roleId, currentUser.id);

    res.json({
      success: true,
      message: 'Role removed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Remove role error:', error);
    res.status(500).json({
      success: false,
      error: 'REMOVE_ROLE_FAILED',
      message: 'Failed to remove role',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/rbac/users/:id/permissions - Grant permission override
router.post('/users/:id/permissions', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !await rbacManager.hasPermission(currentUser.id, 'users.update')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to grant permission overrides.',
        timestamp: new Date().toISOString()
      });
    }

    const userId = parseInt(req.params.id);
    const { permission_id, reason, expires_at } = req.body;

    if (!permission_id) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Permission ID is required',
        timestamp: new Date().toISOString()
      });
    }

    await rbacManager.grantPermissionOverride(userId, permission_id, currentUser.id, reason, expires_at);

    res.status(201).json({
      success: true,
      message: 'Permission override granted successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Grant permission override error:', error);
    res.status(500).json({
      success: false,
      error: 'GRANT_PERMISSION_OVERRIDE_FAILED',
      message: 'Failed to grant permission override',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/rbac/users/:id/permissions/:permissionId - Revoke permission override
router.delete('/users/:id/permissions/:permissionId', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !await rbacManager.hasPermission(currentUser.id, 'users.update')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to revoke permission overrides.',
        timestamp: new Date().toISOString()
      });
    }

    const userId = parseInt(req.params.id);
    const permissionId = req.params.permissionId;
    const { reason } = req.body;

    await rbacManager.revokePermissionOverride(userId, permissionId, currentUser.id, reason);

    res.json({
      success: true,
      message: 'Permission override revoked successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Revoke permission override error:', error);
    res.status(500).json({
      success: false,
      error: 'REVOKE_PERMISSION_OVERRIDE_FAILED',
      message: 'Failed to revoke permission override',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/rbac/check/:permissionId - Check if current user has permission
router.get('/check/:permissionId', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    const permissionId = req.params.permissionId;

    const hasPermission = await rbacManager.hasPermission(currentUser.id, permissionId);

    res.json({
      success: true,
      data: {
        has_permission: hasPermission,
        user_id: currentUser.id,
        permission_id: permissionId
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Check permission error:', error);
    res.status(500).json({
      success: false,
      error: 'CHECK_PERMISSION_FAILED',
      message: 'Failed to check permission',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/rbac/audit - Get RBAC audit log
router.get('/audit', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !await rbacManager.hasPermission(currentUser.id, 'users.view')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to view RBAC audit log.',
        timestamp: new Date().toISOString()
      });
    }

    const { limit = 100, offset = 0 } = req.query;
    const auditLog = await rbacManager.getRBACAuditLog(
      parseInt(limit as string),
      parseInt(offset as string)
    );

    res.json({
      success: true,
      data: auditLog,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get RBAC audit log error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_RBAC_AUDIT_LOG_FAILED',
      message: 'Failed to get RBAC audit log',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/rbac/dashboard - Get RBAC dashboard data
router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !await rbacManager.hasPermission(currentUser.id, 'users.view')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to view RBAC dashboard.',
        timestamp: new Date().toISOString()
      });
    }

    // Get comprehensive RBAC data
    const [roles, permissions, userRoles, auditLog] = await Promise.all([
      rbacManager.getAllRoles(),
      rbacManager.getAllPermissions(),
      rbacManager.getUserRoles(currentUser.id),
      rbacManager.getRBACAuditLog(10, 0)
    ]);

    // Get user statistics
    const userStats = await databaseManager.query(`
      SELECT 
        r.id as role_id,
        r.name as role_name,
        COUNT(ura.user_id) as user_count
      FROM roles r
      LEFT JOIN user_role_assignments ura ON r.id = ura.role_id AND ura.is_active = 1
      GROUP BY r.id, r.name
    `);

    const dashboard = {
      current_user: {
        id: currentUser.id,
        username: currentUser.username,
        roles: userRoles
      },
      roles: roles.map(role => ({
        id: role.id,
        name: role.name,
        name_ar: role.name_ar,
        description: role.description,
        permission_count: role.permissions.length,
        is_system_role: role.is_system_role
      })),
      permissions: permissions.map(permission => ({
        id: permission.id,
        name: permission.name,
        resource: permission.resource,
        action: permission.action
      })),
      user_statistics: userStats,
      recent_audit_log: auditLog,
      total_roles: roles.length,
      total_permissions: permissions.length,
      last_updated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: dashboard,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get RBAC dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_RBAC_DASHBOARD_FAILED',
      message: 'Failed to get RBAC dashboard',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/rbac/users - Get all users with their roles
router.get('/users', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !await rbacManager.hasPermission(currentUser.id, 'users.view')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to view users.',
        timestamp: new Date().toISOString()
      });
    }

    const { limit = 50, offset = 0 } = req.query;
    
    const users = await databaseManager.query(`
      SELECT 
        u.id, u.username, u.email, u.first_name, u.last_name, u.role, u.is_active, u.created_at,
        GROUP_CONCAT(r.name) as roles,
        GROUP_CONCAT(r.id) as role_ids
      FROM users u
      LEFT JOIN user_role_assignments ura ON u.id = ura.user_id AND ura.is_active = 1
      LEFT JOIN roles r ON ura.role_id = r.id
      GROUP BY u.id, u.username, u.email, u.first_name, u.last_name, u.role, u.is_active, u.created_at
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `, [parseInt(limit as string), parseInt(offset as string)]);

    const usersWithRoles = users.map((user: any) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at,
      roles: user.roles ? user.roles.split(',') : [],
      role_ids: user.role_ids ? user.role_ids.split(',') : []
    }));

    res.json({
      success: true,
      data: usersWithRoles,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get users with roles error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_USERS_WITH_ROLES_FAILED',
      message: 'Failed to get users with roles',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
