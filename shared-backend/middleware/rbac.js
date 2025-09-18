const Employee = require('../models/Employee');
const Role = require('../models/Role');
const Permission = require('../models/Permission');

/**
 * Check if user has specific permission
 * @param {string} permissionName - The permission to check
 * @returns {Function} Express middleware function
 */
const checkPermission = (permissionName) => {
  return async (req, res, next) => {
    try {
      if (!req.user || (!req.user.id && !req.user.userId)) {
        return res.status(401).json({ 
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      // Get employee from database - handle both id and userId
      const userId = req.user.id || req.user.userId;
      const employee = await Employee.findById(userId);
      if (!employee) {
        return res.status(401).json({ 
          error: 'Employee not found',
          code: 'EMPLOYEE_NOT_FOUND'
        });
      }

      // Check if employee is active
      if (!employee.isActive) {
        return res.status(403).json({ 
          error: 'Account is deactivated',
          code: 'ACCOUNT_DEACTIVATED'
        });
      }

      // Check permission
      const hasPermission = await employee.hasPermission(permissionName);
      
      if (hasPermission) {
        // Add employee info to request for use in route handlers
        req.employee = employee;
        next();
      } else {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS',
          required: permissionName,
          message: `You need the '${permissionName}' permission to access this resource`
        });
      }
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({ 
        error: 'Permission validation failed',
        code: 'PERMISSION_CHECK_ERROR'
      });
    }
  };
};

/**
 * Check if user has any of the specified permissions
 * @param {string[]} permissions - Array of permissions to check
 * @returns {Function} Express middleware function
 */
const checkAnyPermission = (permissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user || (!req.user.id && !req.user.userId)) {
        return res.status(401).json({ 
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      // Get employee from database - handle both id and userId
      const userId = req.user.id || req.user.userId;
      const employee = await Employee.findById(userId);
      if (!employee) {
        return res.status(401).json({ 
          error: 'Employee not found',
          code: 'EMPLOYEE_NOT_FOUND'
        });
      }

      if (!employee.isActive) {
        return res.status(403).json({ 
          error: 'Account is deactivated',
          code: 'ACCOUNT_DEACTIVATED'
        });
      }

      // Check if user has any of the required permissions
      for (const permission of permissions) {
        const hasPermission = await employee.hasPermission(permission);
        if (hasPermission) {
          req.employee = employee;
          return next();
        }
      }

      return res.status(403).json({ 
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: permissions,
        message: `You need one of these permissions: ${permissions.join(', ')}`
      });
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({ 
        error: 'Permission validation failed',
        code: 'PERMISSION_CHECK_ERROR'
      });
    }
  };
};

/**
 * Check if user has all of the specified permissions
 * @param {string[]} permissions - Array of permissions to check
 * @returns {Function} Express middleware function
 */
const checkAllPermissions = (permissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user || (!req.user.id && !req.user.userId)) {
        return res.status(401).json({ 
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      // Get employee from database - handle both id and userId
      const userId = req.user.id || req.user.userId;
      const employee = await Employee.findById(userId);
      if (!employee) {
        return res.status(401).json({ 
          error: 'Employee not found',
          code: 'EMPLOYEE_NOT_FOUND'
        });
      }

      if (!employee.isActive) {
        return res.status(403).json({ 
          error: 'Account is deactivated',
          code: 'ACCOUNT_DEACTIVATED'
        });
      }

      // Check if user has all required permissions
      for (const permission of permissions) {
        const hasPermission = await employee.hasPermission(permission);
        if (!hasPermission) {
          return res.status(403).json({ 
            error: 'Insufficient permissions',
            code: 'INSUFFICIENT_PERMISSIONS',
            required: permissions,
            missing: permission,
            message: `You need all of these permissions: ${permissions.join(', ')}`
          });
        }
      }

      req.employee = employee;
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({ 
        error: 'Permission validation failed',
        code: 'PERMISSION_CHECK_ERROR'
      });
    }
  };
};

/**
 * Check if user has specific role
 * @param {string|string[]} roles - Role name(s) to check
 * @returns {Function} Express middleware function
 */
const checkRole = (roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user || (!req.user.id && !req.user.userId)) {
        return res.status(401).json({ 
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      console.log('🔍 RBAC checkRole - User:', req.user.userId || req.user.id);
      console.log('🔍 RBAC checkRole - Current role:', req.user.role);
      console.log('🔍 RBAC checkRole - Required roles:', roles);

      // Handle fallback users (CEO, admin) who don't exist in Employee database
      if (req.user.userId === 'fallback_ziad_ceo' || req.user.userId === 'admin-001') {
        // For fallback users, check role directly from JWT token
        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        if (allowedRoles.includes(req.user.role)) {
          return next();
        } else {
          return res.status(403).json({ 
            error: 'Insufficient role permissions',
            code: 'INSUFFICIENT_ROLE',
            required: allowedRoles,
            current: req.user.role,
            message: `You need one of these roles: ${allowedRoles.join(', ')}`
          });
        }
      }

      // Get employee from database - handle both id and userId
      const userId = req.user.id || req.user.userId;
      const employee = await Employee.findById(userId);
      if (!employee) {
        return res.status(401).json({ 
          error: 'Employee not found',
          code: 'EMPLOYEE_NOT_FOUND'
        });
      }

      if (!employee.isActive) {
        return res.status(403).json({ 
          error: 'Account is deactivated',
          code: 'ACCOUNT_DEACTIVATED'
        });
      }

      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      
      // Check primary role (backward compatibility)
      if (employee.role && allowedRoles.includes(employee.role)) {
        req.employee = employee;
        return next();
      }

      // Check multiple roles
      const userRoles = await Role.find({ 
        _id: { $in: employee.roles }, 
        isActive: true 
      });

      const userRoleNames = userRoles.map(role => role.name);
      const hasAllowedRole = allowedRoles.some(role => userRoleNames.includes(role));

      if (hasAllowedRole) {
        req.employee = employee;
        next();
      } else {
        return res.status(403).json({ 
          error: 'Insufficient role privileges',
          code: 'INSUFFICIENT_ROLE',
          required: allowedRoles,
          current: employee.role,
          userRoles: userRoleNames,
          message: `You need one of these roles: ${allowedRoles.join(', ')}`
        });
      }
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({ 
        error: 'Role validation failed',
        code: 'ROLE_CHECK_ERROR'
      });
    }
  };
};

/**
 * Check if user has permission from specific group
 * @param {string} groupName - Permission group to check
 * @returns {Function} Express middleware function
 */
const checkGroupPermission = (groupName) => {
  return async (req, res, next) => {
    try {
      if (!req.user || (!req.user.id && !req.user.userId)) {
        return res.status(401).json({ 
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      // Get employee from database - handle both id and userId
      const userId = req.user.id || req.user.userId;
      const employee = await Employee.findById(userId);
      if (!employee) {
        return res.status(401).json({ 
          error: 'Employee not found',
          code: 'EMPLOYEE_NOT_FOUND'
        });
      }

      if (!employee.isActive) {
        return res.status(403).json({ 
          error: 'Account is deactivated',
          code: 'ACCOUNT_DEACTIVATED'
        });
      }

      // Get all permissions for the user
      const userPermissions = await employee.getAllPermissions();
      
      // Check if user has any permission from the specified group
      const hasGroupPermission = userPermissions.some(permission => 
        permission.groupName === groupName
      );

      if (hasGroupPermission) {
        req.employee = employee;
        next();
      } else {
        return res.status(403).json({ 
          error: 'Insufficient group permissions',
          code: 'INSUFFICIENT_GROUP_PERMISSIONS',
          required: groupName,
          message: `You need permissions from the '${groupName}' group`
        });
      }
    } catch (error) {
      console.error('Group permission check error:', error);
      return res.status(500).json({ 
        error: 'Group permission validation failed',
        code: 'GROUP_PERMISSION_CHECK_ERROR'
      });
    }
  };
};

/**
 * Optional permission check - doesn't fail if no permission, but adds employee info
 * @param {string} permissionName - The permission to check
 * @returns {Function} Express middleware function
 */
const optionalPermission = (permissionName) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return next(); // Continue without employee info
      }

      const employee = await Employee.findById(req.user.id);
      if (employee && employee.isActive) {
        const hasPermission = await employee.hasPermission(permissionName);
        if (hasPermission) {
          req.employee = employee;
        }
      }
      
      next();
    } catch (error) {
      console.error('Optional permission check error:', error);
      next(); // Continue even if check fails
    }
  };
};

/**
 * Get user permissions for frontend
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserPermissions = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const employee = await Employee.findById(req.user.id);
    if (!employee) {
      return res.status(401).json({ 
        error: 'Employee not found',
        code: 'EMPLOYEE_NOT_FOUND'
      });
    }

    const permissions = await employee.getAllPermissions();
    
    // Group permissions by group name
    const groupedPermissions = permissions.reduce((groups, permission) => {
      if (!groups[permission.groupName]) {
        groups[permission.groupName] = [];
      }
      groups[permission.groupName].push({
        name: permission.name,
        description: permission.description
      });
      return groups;
    }, {});

    res.json({
      success: true,
      permissions: groupedPermissions,
      totalPermissions: permissions.length
    });
  } catch (error) {
    console.error('Get user permissions error:', error);
    res.status(500).json({ 
      error: 'Failed to get user permissions',
      code: 'GET_PERMISSIONS_ERROR'
    });
  }
};

module.exports = {
  checkPermission,
  checkAnyPermission,
  checkAllPermissions,
  checkRole,
  checkGroupPermission,
  optionalPermission,
  getUserPermissions
};
