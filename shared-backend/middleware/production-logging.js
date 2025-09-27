const { logger } = require('../config/logger');
const fs = require('fs').promises;
const path = require('path');

/**
 * Comprehensive Production Logging Middleware
 * Implements structured logging for production monitoring and debugging
 */

// Request logging middleware
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const requestId = generateRequestId();
  
  // Add request ID to request object
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  
  // Log incoming request
  logger.info('Incoming request', {
    requestId,
    method: req.method,
    url: req.url,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    contentType: req.get('Content-Type'),
    contentLength: req.get('Content-Length'),
    timestamp: new Date().toISOString(),
    userId: req.user?.userId || 'anonymous',
    role: req.user?.role || 'guest'
  });
  
  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - startTime;
    
    // Log response
    logger.info('Response sent', {
      requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length'),
      timestamp: new Date().toISOString(),
      userId: req.user?.userId || 'anonymous',
      role: req.user?.role || 'guest'
    });
    
    // Log slow requests
    if (duration > 5000) { // 5 seconds
      logger.warn('Slow request detected', {
        requestId,
        method: req.method,
        url: req.url,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      });
    }
    
    // Log error responses
    if (res.statusCode >= 400) {
      logger.error('Error response', {
        requestId,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
        userId: req.user?.userId || 'anonymous'
      });
    }
    
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

// Database query logging
const databaseLogger = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    // Log database queries if they exist
    if (req.dbQueries && req.dbQueries.length > 0) {
      logger.info('Database queries executed', {
        requestId: req.requestId,
        queryCount: req.dbQueries.length,
        totalDuration: req.dbQueries.reduce((sum, q) => sum + q.duration, 0),
        queries: req.dbQueries.map(q => ({
          operation: q.operation,
          collection: q.collection,
          duration: `${q.duration}ms`,
          resultCount: q.resultCount
        })),
        timestamp: new Date().toISOString()
      });
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

// Authentication logging
const authLogger = (req, res, next) => {
  // Log authentication attempts
  if (req.path.includes('/login') || req.path.includes('/auth')) {
    logger.info('Authentication attempt', {
      requestId: req.requestId,
      endpoint: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
  }
  
  // Log successful authentications
  if (req.user && req.user.userId) {
    logger.info('User authenticated', {
      requestId: req.requestId,
      userId: req.user.userId,
      role: req.user.role,
      email: req.user.email,
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

// Business logic logging
const businessLogger = (req, res, next) => {
  // Log important business operations
  const businessEndpoints = [
    '/api/v1/users',
    '/api/v1/fleet',
    '/api/v1/partners',
    '/api/v1/orders',
    '/api/v1/payments',
    '/api/v1/analytics'
  ];
  
  const isBusinessEndpoint = businessEndpoints.some(endpoint => 
    req.path.startsWith(endpoint)
  );
  
  if (isBusinessEndpoint && req.method !== 'GET') {
    logger.info('Business operation', {
      requestId: req.requestId,
      operation: `${req.method} ${req.path}`,
      userId: req.user?.userId || 'anonymous',
      role: req.user?.role || 'guest',
      body: sanitizeRequestBody(req.body),
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

// Performance monitoring logging
const performanceLogger = (req, res, next) => {
  const startTime = process.hrtime.bigint();
  
  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    
    // Log performance metrics
    logger.info('Performance metrics', {
      requestId: req.requestId,
      endpoint: req.path,
      method: req.method,
      duration: `${duration.toFixed(2)}ms`,
      statusCode: res.statusCode,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      timestamp: new Date().toISOString()
    });
    
    // Alert on performance issues
    if (duration > 10000) { // 10 seconds
      logger.error('Performance alert: Very slow request', {
        requestId: req.requestId,
        endpoint: req.path,
        duration: `${duration.toFixed(2)}ms`,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  next();
};

// Security logging
const securityLogger = (req, res, next) => {
  // Log potential security issues
  const suspiciousPatterns = [
    /\.\./, // Directory traversal
    /<script/i, // XSS attempts
    /union.*select/i, // SQL injection
    /javascript:/i, // JavaScript injection
    /eval\(/i, // Code injection
  ];
  
  const requestString = JSON.stringify({
    url: req.url,
    body: req.body,
    query: req.query,
    headers: req.headers
  });
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(requestString)) {
      logger.warn('Potential security threat detected', {
        requestId: req.requestId,
        pattern: pattern.toString(),
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.url,
        timestamp: new Date().toISOString()
      });
      break;
    }
  }
  
  next();
};

// Error logging with context
const errorLogger = (err, req, res, next) => {
  logger.error('Application error', {
    requestId: req.requestId,
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack
    },
    request: {
      method: req.method,
      url: req.url,
      body: sanitizeRequestBody(req.body),
      query: req.query,
      headers: req.headers
    },
    user: {
      id: req.user?.userId || 'anonymous',
      role: req.user?.role || 'guest',
      email: req.user?.email || 'unknown'
    },
    timestamp: new Date().toISOString()
  });
  
  next(err);
};

// System health logging
const systemHealthLogger = () => {
  setInterval(() => {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    logger.info('System health check', {
      memory: {
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
        external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system
      },
      uptime: `${Math.round(process.uptime())}s`,
      timestamp: new Date().toISOString()
    });
    
    // Alert on high memory usage
    if (memUsage.heapUsed / memUsage.heapTotal > 0.9) {
      logger.warn('High memory usage detected', {
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
        usage: `${Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)}%`,
        timestamp: new Date().toISOString()
      });
    }
  }, 60000); // Every minute
};

// Utility functions
function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function sanitizeRequestBody(body) {
  if (!body || typeof body !== 'object') return body;
  
  const sanitized = { ...body };
  
  // Remove sensitive fields
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth'];
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }
  
  return sanitized;
}

// Combine all logging middleware
const productionLogging = [
  requestLogger,
  databaseLogger,
  authLogger,
  businessLogger,
  performanceLogger,
  securityLogger
];

module.exports = {
  productionLogging,
  requestLogger,
  databaseLogger,
  authLogger,
  businessLogger,
  performanceLogger,
  securityLogger,
  errorLogger,
  systemHealthLogger
};
