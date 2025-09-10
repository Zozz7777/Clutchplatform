const compression = require('compression');

// Compression middleware
const compressionMiddleware = compression({
  level: parseInt(process.env.COMPRESSION_LEVEL) || 6,
  threshold: parseInt(process.env.COMPRESSION_THRESHOLD) || 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
});

// Response optimization middleware
const optimizeResponse = (req, res, next) => {
  // Set cache headers for static assets
  if (req.url.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
  }
  
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  next();
};

// Response formatting middleware
const formatResponse = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    if (typeof data === 'object' && !data.success && !data.error) {
      data = {
        success: true,
        data: data,
        timestamp: new Date().toISOString()
      };
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

// Error formatting middleware
const formatError = (req, res, next) => {
  res.sendError = function(statusCode, message, details = null) {
    const error = {
      success: false,
      message: message,
      timestamp: new Date().toISOString()
    };
    
    if (details) {
      error.details = details;
    }
    
    if (process.env.NODE_ENV === 'development') {
      error.stack = new Error().stack;
    }
    
    return this.status(statusCode).json(error);
  };
  
  next();
};

// Performance monitoring middleware
const performanceMonitor = (req, res, next) => {
  const start = process.hrtime();
  
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000;
    
    // Log performance metrics
    console.log(`📊 ${req.method} ${req.url} - ${duration.toFixed(2)}ms`);
    
    // Alert on slow requests
    if (duration > 1000) {
      console.warn(`⚠️  Slow request: ${req.method} ${req.url} took ${duration.toFixed(2)}ms`);
    }
  });
  
  next();
};

// Request size limiting middleware
const requestSizeLimit = (req, res, next) => {
  const maxSize = parseInt(process.env.MAX_REQUEST_SIZE) || 10 * 1024 * 1024; // 10MB
  
  if (req.headers && req.headers['content-length'] && parseInt(req.headers['content-length']) > maxSize) {
    return res.status(413).json({
      success: false,
      message: 'Request entity too large',
      maxSize: `${maxSize / (1024 * 1024)}MB`
    });
  }
  
  next();
};

module.exports = {
  compressionMiddleware,
  optimizeResponse,
  formatResponse,
  formatError,
  performanceMonitor,
  requestSizeLimit
};
