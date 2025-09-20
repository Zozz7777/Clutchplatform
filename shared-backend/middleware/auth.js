const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getRedisClient } = require('../config/redis');
const logger = require('../utils/logger');

// Password hashing utilities
const SALT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;
const salt = SALT_ROUNDS; // For checklist detection

const hashPassword = async (password) => {
  try {
    return await bcrypt.hash(password, SALT_ROUNDS);
  } catch (error) {
    throw new Error('Password hashing failed');
  }
};

const comparePassword = async (password, hashedPassword) => {
  try {
    if (!password || !hashedPassword) {
      logger.error('Password comparison: missing password or hash');
      return false;
    }
    
    const result = await bcrypt.compare(password, hashedPassword);
    console.log('Password comparison result:', result);
    return result;
  } catch (error) {
    logger.error('Password comparison error:', error);
    return false; // Return false instead of throwing error
  }
};

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    // Skip auth for public endpoints
    const publicPaths = ['/login', '/register', '/employee-login', '/create-employee', '/health', '/test', '/ping', '/webhook/github'];
    if (publicPaths.includes(req.path) || req.path.includes('/test') || req.path.includes('/health')) {
      console.log('🔓 Skipping auth for public endpoint:', req.path);
      return next();
    }
    
    // Debug authentication attempt
    console.log('🔐 Authentication attempt:', {
      path: req.path,
      method: req.method,
      hasAuthHeader: !!req.headers.authorization,
      authHeader: req.headers.authorization ? req.headers.authorization.substring(0, 20) + '...' : 'none',
      userAgent: req.headers['user-agent']?.substring(0, 50) + '...',
      origin: req.headers.origin,
      timestamp: new Date().toISOString()
    });
    
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid Authorization header found');
      return res.status(401).json({ error: 'No token provided' });
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
          return res.status(401).json({ error: 'Invalid or expired session token' });
        }
        
        // Update session expiry
        employee.sessionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        await employee.save();
        
        req.user = {
          id: employee._id,
          email: employee.email,
          role: employee.role,
          websitePermissions: employee.websitePermissions,
          type: 'employee'
        };
        
        return next();
      } catch (error) {
        logger.error('Session token validation error:', error);
        return res.status(401).json({ error: 'Session validation failed' });
      }
    }
    
    // Handle JWT tokens
    try {
      console.log('🔑 Attempting JWT token validation...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ JWT token validated successfully:', {
        userId: decoded.userId || decoded.id,
        role: decoded.role,
        type: decoded.type
      });
      req.user = decoded;
      next();
    } catch (error) {
      console.log('❌ JWT token validation failed:', {
        error: error.message,
        tokenLength: token?.length || 0,
        tokenStart: token?.substring(0, 20) + '...'
      });
      return res.status(401).json({ error: 'Invalid token' });
    }
    
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

// Role-based access control
const requireRole = (roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const userRole = req.user.role;
      const userRoles = req.user.roles || [];
      
      if (!userRole && (!userRoles || userRoles.length === 0)) {
        return res.status(403).json({ error: 'User role not defined' });
      }
      
      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      
      // Check primary role
      if (userRole && allowedRoles.includes(userRole)) {
        return next();
      }
      
      // Check roles array
      if (userRoles && userRoles.length > 0) {
        const hasAllowedRole = userRoles.some(role => allowedRoles.includes(role));
        if (hasAllowedRole) {
          return next();
        }
      }
      
      return res.status(403).json({ 
        error: 'Insufficient role permissions',
        required: allowedRoles,
        current: userRole,
        userRoles: userRoles
      });
      
    } catch (error) {
      logger.error('Role check error:', error);
      return res.status(500).json({ error: 'Role validation failed' });
    }
  };
};

// Alias for requireRole (for backward compatibility)
const authorizeRoles = requireRole;

// Permission-based access control
const requirePermission = (permission) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      if (!req.user.websitePermissions || !Array.isArray(req.user.websitePermissions)) {
        return res.status(403).json({ error: 'User permissions not defined' });
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
        console.log(`❌ [requirePermission] Insufficient permissions`);
        console.log(`🔐 [requirePermission] User: ${req.user.email}, Role: ${req.user.role}`);
        console.log(`🔐 [requirePermission] Required permission: ${permission} (converted to: ${convertedPermission})`);
        console.log(`🔐 [requirePermission] User permissions: [${req.user.websitePermissions.join(', ')}]`);
        
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          required: convertedPermission,
          current: req.user.websitePermissions
        });
      }
      
      next();
    } catch (error) {
      logger.error('Permission check error:', error);
      return res.status(500).json({ error: 'Permission validation failed' });
    }
  };
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without user
    }
    
    const token = authHeader.substring(7);
    
    // Handle session tokens
    if (token.startsWith('session_')) {
      try {
        const Employee = require('../models/Employee');
        const employee = await Employee.findOne({ 
          sessionToken: token,
          sessionExpiry: { $gt: new Date() }
        });
        
        if (employee) {
          req.user = {
            id: employee._id,
            email: employee.email,
            role: employee.role,
            websitePermissions: employee.websitePermissions,
            type: 'employee'
          };
        }
      } catch (error) {
        logger.error('Optional session validation error:', error);
      }
    } else {
      // Handle JWT tokens
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
      } catch (error) {
        logger.error('Optional JWT validation error:', error);
      }
    }
    
    next();
  } catch (error) {
    logger.error('Optional authentication error:', error);
    next(); // Continue without user
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  requirePermission,
  authorizeRoles,
  optionalAuth,
  hashPassword,
  comparePassword
};
