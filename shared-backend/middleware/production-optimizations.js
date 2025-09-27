const { logger } = require('../config/logger');

/**
 * Production Performance Optimizations Middleware
 * Implements comprehensive performance optimizations for production deployment
 */

// Response compression optimization
const compressionOptimization = (req, res, next) => {
  // Set optimal compression headers
  res.setHeader('Vary', 'Accept-Encoding');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  next();
};

// Database query optimization
const queryOptimization = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    // Optimize response size
    if (data && typeof data === 'object') {
      // Remove unnecessary fields
      if (data.data && Array.isArray(data.data)) {
        data.data = data.data.map(item => {
          if (item._id) {
            item.id = item._id;
            delete item._id;
          }
          if (item.__v !== undefined) {
            delete item.__v;
          }
          return item;
        });
      }
      
      // Limit array sizes for performance
      if (data.data && Array.isArray(data.data) && data.data.length > 100) {
        data.data = data.data.slice(0, 100);
        data.pagination = {
          total: data.data.length,
          limit: 100,
          hasMore: true
        };
      }
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

// Memory usage optimization
const memoryOptimization = (req, res, next) => {
  // Clean up request body if it's too large
  if (req.body && JSON.stringify(req.body).length > 1000000) { // 1MB limit
    logger.warn('Large request body detected, cleaning up', {
      size: JSON.stringify(req.body).length,
      endpoint: req.path
    });
    req.body = { error: 'Request body too large' };
  }
  
  next();
};

// Connection pooling optimization
const connectionOptimization = (req, res, next) => {
  // Set connection keep-alive headers
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Keep-Alive', 'timeout=5, max=1000');
  
  next();
};

// Rate limiting optimization
const rateLimitOptimization = (req, res, next) => {
  // Implement smart rate limiting based on endpoint
  const endpoint = req.path;
  const method = req.method;
  
  // Different limits for different endpoints
  const limits = {
    '/api/v1/auth/login': { windowMs: 15 * 60 * 1000, max: 5 }, // 5 attempts per 15 minutes
    '/api/v1/auth/refresh': { windowMs: 60 * 1000, max: 10 }, // 10 refreshes per minute
    '/api/v1/dashboard': { windowMs: 60 * 1000, max: 60 }, // 60 requests per minute
    '/api/v1/analytics': { windowMs: 60 * 1000, max: 30 }, // 30 requests per minute
    default: { windowMs: 60 * 1000, max: 100 } // 100 requests per minute
  };
  
  const limit = limits[endpoint] || limits.default;
  
  // Simple in-memory rate limiting (in production, use Redis)
  if (!global.rateLimitStore) {
    global.rateLimitStore = new Map();
  }
  
  const key = `${req.ip}-${endpoint}`;
  const now = Date.now();
  const windowStart = now - limit.windowMs;
  
  if (!global.rateLimitStore.has(key)) {
    global.rateLimitStore.set(key, []);
  }
  
  const requests = global.rateLimitStore.get(key);
  const validRequests = requests.filter(time => time > windowStart);
  
  if (validRequests.length >= limit.max) {
    return res.status(429).json({
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
      retryAfter: Math.ceil(limit.windowMs / 1000)
    });
  }
  
  validRequests.push(now);
  global.rateLimitStore.set(key, validRequests);
  
  next();
};

// Error handling optimization
const errorOptimization = (err, req, res, next) => {
  // Log error with context
  logger.error('Production error:', {
    error: err.message,
    stack: err.stack,
    endpoint: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    success: false,
    error: err.name || 'INTERNAL_SERVER_ERROR',
    message: isDevelopment ? err.message : 'An error occurred',
    timestamp: new Date().toISOString(),
    ...(isDevelopment && { stack: err.stack })
  });
};

// Health check optimization
const healthCheckOptimization = (req, res, next) => {
  if (req.path === '/health' || req.path === '/ping') {
    // Quick health check without database queries
    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0'
    });
    return;
  }
  next();
};

// Security headers optimization
const securityOptimization = (req, res, next) => {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Remove server header
  res.removeHeader('X-Powered-By');
  
  next();
};

// Combine all optimizations
const productionOptimizations = [
  compressionOptimization,
  queryOptimization,
  memoryOptimization,
  connectionOptimization,
  rateLimitOptimization,
  healthCheckOptimization,
  securityOptimization
];

module.exports = {
  productionOptimizations,
  compressionOptimization,
  queryOptimization,
  memoryOptimization,
  connectionOptimization,
  rateLimitOptimization,
  errorOptimization,
  healthCheckOptimization,
  securityOptimization
};
