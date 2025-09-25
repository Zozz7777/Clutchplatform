/**
 * Optimized Middleware Stack
 * Consolidated and optimized middleware for better memory management
 * Removed redundant layers and implemented proper memory monitoring
 */

const express = require('express');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');

// Memory monitoring
let memoryStats = {
  initialMemory: process.memoryUsage(),
  peakMemory: process.memoryUsage(),
  requestCount: 0,
  averageMemoryUsage: 0
};

/**
 * Memory monitoring middleware
 */
const memoryMonitor = (req, res, next) => {
  const startMemory = process.memoryUsage();
  memoryStats.requestCount++;
  
  // Update peak memory
  if (startMemory.heapUsed > memoryStats.peakMemory.heapUsed) {
    memoryStats.peakMemory = startMemory;
  }
  
  // Calculate average memory usage
  memoryStats.averageMemoryUsage = 
    (memoryStats.averageMemoryUsage * (memoryStats.requestCount - 1) + startMemory.heapUsed) / 
    memoryStats.requestCount;
  
  // Add memory info to response headers in development
  if (process.env.NODE_ENV === 'development') {
    res.setHeader('X-Memory-Usage', `${Math.round(startMemory.heapUsed / 1024 / 1024)}MB`);
    res.setHeader('X-Memory-Peak', `${Math.round(memoryStats.peakMemory.heapUsed / 1024 / 1024)}MB`);
  }
  
  next();
};

/**
 * Optimized security headers middleware
 */
const optimizedSecurityHeaders = (req, res, next) => {
  // Essential security headers only
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Remove unnecessary headers to save memory
  next();
};

/**
 * Optimized CORS middleware
 */
const optimizedCORS = cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://admin.yourclutch.com',
        'https://yourclutch.com',
        'https://www.yourclutch.com',
        'https://clutch-main-nk7x.onrender.com', // Add the actual frontend URL
        'https://clutch-platform-frontend.onrender.com', // Alternative frontend URL
        'http://localhost:3000', // Development frontend
        'http://localhost:3001', // Alternative development port
        process.env.ADMIN_URL,
        process.env.BACKEND_URL,
        process.env.FRONTEND_URL
      ].filter(Boolean)
    : [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://admin.yourclutch.com',
        'https://yourclutch.com',
        'https://www.yourclutch.com',
        'https://clutch-main-nk7x.onrender.com'
      ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'X-CSRF-Token'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400 // 24 hours cache
});

/**
 * Optimized rate limiting
 */
const optimizedRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 2000 : 200, // Increased limits
  message: { 
    success: false,
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests, please try again later.' 
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health endpoints
    return req.path.includes('/health') || req.path.includes('/ping');
  }
});

/**
 * Optimized compression middleware
 */
const optimizedCompression = compression({
  level: 6, // Balanced compression level
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    // Don't compress if already compressed
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
});

/**
 * Request timeout middleware
 */
const requestTimeout = (timeout = 30000) => {
  return (req, res, next) => {
    req.setTimeout(timeout, () => {
      if (!res.headersSent) {
        res.status(408).json({
          success: false,
          error: 'REQUEST_TIMEOUT',
          message: 'Request timeout. Please try again.',
          timestamp: new Date().toISOString()
        });
      }
    });
    next();
  };
};

/**
 * Input sanitization middleware
 */
const inputSanitization = (req, res, next) => {
  // Basic XSS protection
  const sanitizeInput = (obj) => {
    if (typeof obj === 'string') {
      return obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
    if (typeof obj === 'object' && obj !== null) {
      for (let key in obj) {
        obj[key] = sanitizeInput(obj[key]);
      }
    }
    return obj;
  };
  
  if (req.body) {
    req.body = sanitizeInput(req.body);
  }
  if (req.query) {
    req.query = sanitizeInput(req.query);
  }
  
  next();
};

/**
 * Async error handler middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Optimized error handling middleware
 */
const optimizedErrorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Handle different types of errors
  let statusCode = err.status || 500;
  let errorMessage = 'Internal server error';
  
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorMessage = 'Validation error';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    errorMessage = 'Invalid ID format';
  } else if (err.name === 'MongoError' && err.code === 11000) {
    statusCode = 409;
    errorMessage = 'Duplicate entry';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorMessage = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorMessage = 'Token expired';
  }
  
  res.status(statusCode).json({
    success: false,
    error: err.name || 'INTERNAL_SERVER_ERROR',
    message: isDevelopment ? err.message : errorMessage,
    timestamp: new Date().toISOString(),
    ...(isDevelopment && { stack: err.stack })
  });
};

/**
 * Memory cleanup middleware
 */
const memoryCleanup = (req, res, next) => {
  // Force garbage collection if available
  if (global.gc && memoryStats.requestCount % 100 === 0) {
    global.gc();
  }
  
  // Clear request-specific data
  req.cleanup = () => {
    delete req.user;
    delete req.body;
    delete req.query;
    delete req.params;
  };
  
  res.on('finish', () => {
    req.cleanup();
  });
  
  next();
};

/**
 * Get memory statistics
 */
const getMemoryStats = () => {
  const currentMemory = process.memoryUsage();
  return {
    current: {
      heapUsed: Math.round(currentMemory.heapUsed / 1024 / 1024),
      heapTotal: Math.round(currentMemory.heapTotal / 1024 / 1024),
      external: Math.round(currentMemory.external / 1024 / 1024),
      rss: Math.round(currentMemory.rss / 1024 / 1024)
    },
    peak: {
      heapUsed: Math.round(memoryStats.peakMemory.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memoryStats.peakMemory.heapTotal / 1024 / 1024)
    },
    average: Math.round(memoryStats.averageMemoryUsage / 1024 / 1024),
    requestCount: memoryStats.requestCount,
    memoryPressure: currentMemory.heapUsed / currentMemory.heapTotal
  };
};

/**
 * Memory health check
 */
const memoryHealthCheck = () => {
  const stats = getMemoryStats();
  const isHealthy = stats.memoryPressure < 0.8; // Less than 80% memory usage
  
  return {
    healthy: isHealthy,
    stats,
    recommendations: isHealthy ? [] : [
      'Consider restarting the application',
      'Check for memory leaks',
      'Optimize database queries',
      'Reduce concurrent requests'
    ]
  };
};

/**
 * Apply optimized middleware stack
 */
const applyOptimizedMiddleware = (app) => {
  // Applying optimized middleware stack
  
  // Trust proxy
  app.set('trust proxy', 1);
  
  // Memory monitoring (first)
  app.use(memoryMonitor);
  
  // Security headers
  app.use(optimizedSecurityHeaders);
  
  // Compression
  app.use(optimizedCompression);
  
  // CORS with error handling
  app.use((req, res, next) => {
    console.log(`CORS: ${req.method} ${req.url} from origin: ${req.get('Origin')}`);
    next();
  });
  app.use(optimizedCORS);
  
  // Body parsing with limits
  app.use(express.json({ limit: '5mb' })); // Reduced from 10mb
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));
  
  // Input sanitization
  app.use(inputSanitization);
  
  // Rate limiting
  app.use(optimizedRateLimit);
  
  // Request timeout
  app.use(requestTimeout(30000));
  
  // Memory cleanup
  app.use(memoryCleanup);
  
  // Make asyncHandler available globally
  app.use((req, res, next) => {
    req.asyncHandler = asyncHandler;
    next();
  });
  
  // Optimized middleware stack applied
};

module.exports = {
  applyOptimizedMiddleware,
  getMemoryStats,
  memoryHealthCheck,
  optimizedErrorHandler,
  memoryMonitor,
  optimizedSecurityHeaders,
  optimizedCORS,
  optimizedRateLimit,
  optimizedCompression,
  requestTimeout,
  inputSanitization,
  asyncHandler,
  memoryCleanup
};
