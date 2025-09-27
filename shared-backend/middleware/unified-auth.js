const jwt = require('jsonwebtoken');
const { getCollection } = require('../config/optimized-database');
const { getBackendRoles, canAccessRole } = require('../config/standardized-roles');
const { ObjectId } = require('mongodb');
const logger = require('../utils/logger');

/**
 * Unified authentication middleware that combines auth.js and rbac.js functionality
 * This eliminates conflicts between different authentication systems
 */

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    // Skip auth for public endpoints
    const publicPaths = ['/login', '/register', '/employee-login', '/create-employee', '/health', '/test', '/ping', '/webhook/github'];
    if (publicPaths.includes(req.path) || req.path.includes('/test') || req.path.includes('/health')) {
      // Skipping auth for public endpoint
      return next();
    }
    
    // Debug authentication attempt
    // Authentication attempt
    
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No valid Authorization header found
      return res.status(401).json({ 
        success: false,
        error: 'NO_TOKEN_PROVIDED',
        message: 'No token provided',
        timestamp: new Date().toISOString()
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Handle session tokens
    if (token.startsWith('session_')) {
      try {
        // Validate session token against database
        const Employee = require('../models/Employee');
        const employee = await Employee.findOne({ 
          sessionToken: token,
          sessionExpiry: { $gt: new Date() }
        });
        
        if (!employee) {
          return res.status(401).json({ 
            success: false,
            error: 'INVALID_SESSION_TOKEN',
            message: 'Invalid or expired session token',
            timestamp: new Date().toISOString()
          });
        }
        
        // Update session expiry
        employee.sessionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        await employee.save();
        
        req.user = {
          id: employee._id,
          userId: employee._id, // Add userId for RBAC compatibility
          email: employee.email,
          role: employee.role,
          websitePermissions: employee.websitePermissions,
          type: 'employee'
        };
        
        return next();
      } catch (error) {
        logger.error('Session token validation error:', error);
        return res.status(401).json({ 
          success: false,
          error: 'SESSION_VALIDATION_FAILED',
          message: 'Session validation failed',
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // Handle JWT tokens
    try {
      // Attempting JWT token validation
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // JWT token validated successfully
      
      // Ensure both id and userId are set for compatibility
      req.user = {
        ...decoded,
        id: decoded.userId || decoded.id,
        userId: decoded.userId || decoded.id
      };
      
      next();
    } catch (error) {
      logger.warn('❌ JWT token validation failed:', {
        error: error.message,
        tokenLength: token?.length || 0,
        tokenStart: token?.substring(0, 20) + '...'
      });
      return res.status(401).json({ 
        success: false,
        error: 'INVALID_TOKEN',
        message: 'Invalid token',
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'AUTHENTICATION_FAILED',
      message: 'Authentication failed',
      timestamp: new Date().toISOString()
    });
  }
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
          success: false,
          error: 'AUTHENTICATION_REQUIRED',
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        });
      }

      logger.debug('🔍 RBAC checkRole - User:', req.user.userId || req.user.id);
      logger.debug('🔍 RBAC checkRole - Current role:', req.user.role);
      logger.debug('🔍 RBAC checkRole - Required roles:', roles);

      // Handle fallback users (CEO, admin) who don't exist in Employee database
      if (req.user.userId === 'fallback_ziad_ceo' || req.user.userId === 'admin-001') {
        // For fallback users, check role directly from JWT token
        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        
        // Map executive role to head_administrator for backward compatibility
        const userRole = req.user.role === 'executive' ? 'head_administrator' : req.user.role;
        const mappedAllowedRoles = allowedRoles.map(role => 
          role === 'head_administrator' ? ['head_administrator', 'executive'] : [role]
        ).flat();
        
        if (mappedAllowedRoles.includes(userRole) || allowedRoles.includes(req.user.role)) {
          logger.debug('✅ Fallback user role check passed');
          return next();
        } else {
          logger.warn('❌ Fallback user role check failed');
          return res.status(403).json({ 
            success: false,
            error: 'INSUFFICIENT_ROLE_PERMISSIONS',
            message: `You need one of these roles: ${allowedRoles.join(', ')}`,
            required: allowedRoles,
            current: req.user.role,
            timestamp: new Date().toISOString()
          });
        }
      }

      // For regular users, check against database
      try {
        const employeesCollection = await getCollection('employees');
        const userId = req.user.id || req.user.userId;
        
        // Handle ObjectId conversion
        let query = {};
        try {
          query._id = new ObjectId(userId);
        } catch (error) {
          query._id = userId;
        }
        
        const employee = await employeesCollection.findOne(query);
        
        if (!employee) {
          logger.warn('❌ Employee not found in database');
          return res.status(401).json({ 
            success: false,
            error: 'EMPLOYEE_NOT_FOUND',
            message: 'Employee not found',
            timestamp: new Date().toISOString()
          });
        }

        if (!employee.isActive) {
          logger.warn('❌ Employee account is deactivated');
          return res.status(403).json({ 
            success: false,
            error: 'ACCOUNT_DEACTIVATED',
            message: 'Account is deactivated',
            timestamp: new Date().toISOString()
          });
        }

        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        
        // Map executive, admin, and super_admin roles to have broader access
        const userRole = employee.role === 'super_admin' ? 'head_administrator' :
                        employee.role === 'executive' ? 'head_administrator' : 
                        employee.role === 'admin' ? 'head_administrator' : employee.role;
        const mappedAllowedRoles = allowedRoles.map(role => {
          if (role === 'head_administrator') {
            return ['head_administrator', 'super_admin', 'executive', 'admin'];
          } else if (role === 'fleet_manager') {
            return ['fleet_manager', 'head_administrator', 'super_admin', 'executive', 'admin'];
          } else if (role === 'asset_manager') {
            return ['asset_manager', 'head_administrator', 'super_admin', 'executive', 'admin'];
          } else if (role === 'system_admin') {
            return ['system_admin', 'head_administrator', 'super_admin', 'executive', 'admin'];
          }
          return [role];
        }).flat();
        
        if (mappedAllowedRoles.includes(userRole) || allowedRoles.includes(employee.role)) {
          logger.debug('✅ Database user role check passed');
          return next();
        } else {
          logger.warn('❌ Database user role check failed');
          return res.status(403).json({ 
            success: false,
            error: 'INSUFFICIENT_ROLE_PERMISSIONS',
            message: `You need one of these roles: ${allowedRoles.join(', ')}`,
            required: allowedRoles,
            current: employee.role,
            timestamp: new Date().toISOString()
          });
        }
      } catch (dbError) {
        logger.error('Database error during role check:', dbError);
        // Fallback to JWT role check if database fails
        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        
        // Map executive, admin, and super_admin roles to have broader access
        const userRole = req.user.role === 'super_admin' ? 'head_administrator' :
                        req.user.role === 'executive' ? 'head_administrator' : 
                        req.user.role === 'admin' ? 'head_administrator' : req.user.role;
        const mappedAllowedRoles = allowedRoles.map(role => {
          if (role === 'head_administrator') {
            return ['head_administrator', 'super_admin', 'executive', 'admin'];
          } else if (role === 'fleet_manager') {
            return ['fleet_manager', 'head_administrator', 'super_admin', 'executive', 'admin'];
          } else if (role === 'asset_manager') {
            return ['asset_manager', 'head_administrator', 'super_admin', 'executive', 'admin'];
          } else if (role === 'system_admin') {
            return ['system_admin', 'head_administrator', 'super_admin', 'executive', 'admin'];
          }
          return [role];
        }).flat();
        
        if (mappedAllowedRoles.includes(userRole) || allowedRoles.includes(req.user.role)) {
          logger.debug('✅ Fallback JWT role check passed');
          return next();
        } else {
          logger.warn('❌ Fallback JWT role check failed');
          return res.status(403).json({ 
            success: false,
            error: 'INSUFFICIENT_ROLE_PERMISSIONS',
            message: `You need one of these roles: ${allowedRoles.join(', ')}`,
            required: allowedRoles,
            current: req.user.role,
            timestamp: new Date().toISOString()
          });
        }
      }
      
    } catch (error) {
      logger.error('Role check error:', error);
      return res.status(500).json({ 
        success: false,
        error: 'ROLE_VALIDATION_FAILED',
        message: 'Role validation failed',
        timestamp: new Date().toISOString()
      });
    }
  };
};

/**
 * Check if user has specific permission
 * @param {string} permission - Permission to check
 * @returns {Function} Express middleware function
 */
const checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user || (!req.user.id && !req.user.userId)) {
        return res.status(401).json({ 
          success: false,
          error: 'AUTHENTICATION_REQUIRED',
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        });
      }

      // Handle fallback users (CEO, admin) and executive users - they have all permissions
      if (req.user.userId === 'fallback_ziad_ceo' || req.user.userId === 'admin-001' || req.user.role === 'executive') {
        logger.debug('✅ Fallback/executive user permission check passed (all permissions)');
        return next();
      }

      // For regular users, check permissions
      if (!req.user.websitePermissions || !Array.isArray(req.user.websitePermissions)) {
        return res.status(403).json({ 
          success: false,
          error: 'USER_PERMISSIONS_NOT_DEFINED',
          message: 'User permissions not defined',
          timestamp: new Date().toISOString()
        });
      }

      // Convert permission format (e.g., 'read_user' -> 'users:read')
      let convertedPermission = permission;
      
      // Handle common permission format conversions
      if (permission === 'read_user') convertedPermission = 'users:read';
      if (permission === 'write_user') convertedPermission = 'users:write';
      if (permission === 'delete_user') convertedPermission = 'users:delete';
      if (permission === 'read_mechanic') convertedPermission = 'mechanics:read';
      if (permission === 'write_mechanic') convertedPermission = 'mechanics:write';
      if (permission === 'delete_mechanic') convertedPermission = 'mechanics:delete';
      if (permission === 'read_dashboard') convertedPermission = 'dashboard:read';
      if (permission === 'write_dashboard') convertedPermission = 'dashboard:write';
      if (permission === 'read_analytics') convertedPermission = 'analytics:read';
      if (permission === 'write_analytics') convertedPermission = 'analytics:write';
      
      // Check if user has the required permission
      const hasPermission = req.user.websitePermissions.includes(convertedPermission);
      
      if (!hasPermission) {
        console.log(`❌ [checkPermission] Insufficient permissions`);
        console.log(`🔐 [checkPermission] User: ${req.user.email}, Role: ${req.user.role}`);
        console.log(`🔐 [checkPermission] Required permission: ${permission} (converted to: ${convertedPermission})`);
        console.log(`🔐 [checkPermission] User permissions: [${req.user.websitePermissions.join(', ')}]`);
        
        return res.status(403).json({ 
          success: false,
          error: 'INSUFFICIENT_PERMISSIONS',
          message: `You need the '${permission}' permission to access this resource`,
          required: convertedPermission,
          current: req.user.websitePermissions,
          timestamp: new Date().toISOString()
        });
      }
      
      console.log('✅ Permission check passed');
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({ 
        success: false,
        error: 'PERMISSION_VALIDATION_FAILED',
        message: 'Permission validation failed',
        timestamp: new Date().toISOString()
      });
    }
  };
};

module.exports = {
  authenticateToken,
  checkRole,
  checkPermission
};
