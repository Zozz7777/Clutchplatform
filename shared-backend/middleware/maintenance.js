const { logger } = require('../config/logger');

// Maintenance mode middleware
const maintenanceMode = (req, res, next) => {
  if (process.env.MAINTENANCE_MODE === 'true') {
    return res.status(503).json({
      success: false,
      message: 'Service temporarily unavailable for maintenance',
      estimatedRestart: process.env.MAINTENANCE_ESTIMATED_RESTART || '30 minutes'
    });
  }
  next();
};

// API version middleware
const apiVersion = (req, res, next) => {
  const version = req.headers['api-version'] || 'v1';
  req.apiVersion = version;
  next();
};

// Request validation middleware
const validateRequest = (req, res, next) => {
  // Basic request validation
  if (req.method === 'POST' || req.method === 'PUT') {
    if (!req.headers['content-type'] || !req.headers['content-type'].includes('application/json')) {
      return res.status(400).json({
        success: false,
        message: 'Content-Type must be application/json'
      });
    }
  }
  next();
};

// Performance monitoring middleware
const performanceMonitor = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Log slow requests
    if (duration > 1000) {
      logger.warning('Slow request detected', {
        method: req.method,
        url: req.url,
        duration: `${duration}ms`,
        ip: req.ip
      });
    }
    
    // Log performance metrics
    logger.info('Request performance', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`
    });
  });
  
  next();
};

module.exports = {
  maintenanceMode,
  apiVersion,
  validateRequest,
  performanceMonitor
};
