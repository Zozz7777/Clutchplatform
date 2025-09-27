const NodeCache = require('node-cache');
const logger = require('../utils/logger');

// Initialize cache
const cache = new NodeCache({ 
  stdTTL: 300, // 5 minutes default TTL
  checkperiod: 120, // Check for expired keys every 2 minutes
  useClones: false // Don't clone objects for better performance
});

// Redis client for distributed caching (if available)
let redisClient = null;
try {
  const redis = require('redis');
  if (process.env.REDIS_URL) {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL,
      retry_strategy: (options) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          logger.warn('Redis connection refused, falling back to memory cache');
          return undefined; // Don't retry
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          logger.error('Redis retry time exhausted');
          return new Error('Retry time exhausted');
        }
        if (options.attempt > 10) {
          logger.error('Redis max retry attempts reached');
          return undefined;
        }
        return Math.min(options.attempt * 100, 3000);
      }
    });
    
    redisClient.on('error', (err) => {
      logger.error('Redis client error:', err);
      redisClient = null; // Fall back to memory cache
    });
    
    redisClient.on('connect', () => {
      logger.info('✅ Redis connected successfully');
    });
  }
} catch (error) {
  logger.warn('Redis not available, using memory cache only');
}

// Response Caching Middleware
const responseCaching = (ttl = 300) => {
  return async (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    // Skip caching for authenticated requests with sensitive data
    if (req.user && (req.originalUrl.includes('/admin') || req.originalUrl.includes('/users'))) {
      return next();
    }
    
    const cacheKey = `cache:${req.originalUrl}:${JSON.stringify(req.query)}`;
    
    try {
      // Try to get from cache
      let cachedData = null;
      
      if (redisClient) {
        try {
          const redisData = await redisClient.get(cacheKey);
          cachedData = redisData ? JSON.parse(redisData) : null;
        } catch (redisError) {
          logger.warn('Redis get error, falling back to memory cache:', redisError);
          cachedData = cache.get(cacheKey);
        }
      } else {
        cachedData = cache.get(cacheKey);
      }
      
      if (cachedData) {
        logger.debug(`Cache hit for key: ${cacheKey}`);
        return res.json({
          ...cachedData,
          cached: true,
          cacheTimestamp: new Date().toISOString()
        });
      }
      
      // Cache miss - intercept response
      const originalSend = res.send;
      res.send = function(data) {
        try {
          const responseData = JSON.parse(data);
          
          // Only cache successful responses
          if (responseData.success) {
            if (redisClient) {
              redisClient.setex(cacheKey, ttl, data).catch(err => {
                logger.warn('Redis set error:', err);
                cache.set(cacheKey, responseData, ttl);
              });
            } else {
              cache.set(cacheKey, responseData, ttl);
            }
            
            logger.debug(`Cached response for key: ${cacheKey}`);
          }
        } catch (error) {
          logger.warn('Failed to cache response:', error);
        }
        
        originalSend.call(this, data);
      };
      
      next();
    } catch (error) {
      logger.error('Caching middleware error:', error);
      next();
    }
  };
};

// Database Query Optimization
const queryOptimization = (req, res, next) => {
  // Add query optimization hints
  req.queryOptimization = {
    limit: Math.min(parseInt(req.query.limit) || 50, 1000), // Max 1000 records
    skip: Math.max(parseInt(req.query.skip) || 0, 0),
    sort: req.query.sort || { createdAt: -1 },
    projection: req.query.fields ? req.query.fields.split(',') : null
  };
  
  next();
};

// Compression Middleware
const compression = require('compression');
const compressionMiddleware = compression({
  level: 6, // Compression level (1-9)
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    // Don't compress if client doesn't support it
    if (req.headers['x-no-compression']) {
      return false;
    }
    
    // Use compression for all responses
    return compression.filter(req, res);
  }
});

// Rate Limiting
const rateLimit = require('express-rate-limit');

const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message: message || 'Too many requests, please try again later',
      timestamp: new Date().toISOString()
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}, Path: ${req.originalUrl}`);
      res.status(429).json({
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        message: message || 'Too many requests, please try again later',
        timestamp: new Date().toISOString()
      });
    }
  });
};

// Different rate limits for different endpoints
const rateLimits = {
  // General API rate limit
  general: createRateLimit(15 * 60 * 1000, 100, 'Too many API requests'),
  
  // Authentication rate limit
  auth: createRateLimit(15 * 60 * 1000, 5, 'Too many authentication attempts'),
  
  // Admin endpoints rate limit
  admin: createRateLimit(15 * 60 * 1000, 50, 'Too many admin requests'),
  
  // File upload rate limit
  upload: createRateLimit(60 * 60 * 1000, 10, 'Too many file uploads'),
  
  // Search rate limit
  search: createRateLimit(1 * 60 * 1000, 20, 'Too many search requests')
};

// Connection Pooling
const connectionPooling = (req, res, next) => {
  // Add connection pooling hints to request
  req.connectionPool = {
    maxConnections: 10,
    minConnections: 2,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 200
  };
  
  next();
};

// Memory Management
const memoryManagement = (req, res, next) => {
  // Monitor memory usage
  const memUsage = process.memoryUsage();
  const memUsageMB = {
    rss: Math.round(memUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
    external: Math.round(memUsage.external / 1024 / 1024)
  };
  
  // Log memory usage if it's high
  if (memUsageMB.heapUsed > 500) { // 500MB threshold
    logger.warn('High memory usage detected:', memUsageMB);
  }
  
  // Force garbage collection if memory is very high
  if (memUsageMB.heapUsed > 1000 && global.gc) { // 1GB threshold
    logger.warn('Forcing garbage collection due to high memory usage');
    global.gc();
  }
  
  req.memoryUsage = memUsageMB;
  next();
};

// Response Time Optimization
const responseTimeOptimization = (req, res, next) => {
  const startTime = Date.now();
  
  // Add response time tracking
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    
    // Log slow requests
    if (responseTime > 1000) { // 1 second threshold
      logger.warn(`Slow request detected: ${req.method} ${req.originalUrl} - ${responseTime}ms`);
    }
    
    // Add response time header
    res.setHeader('X-Response-Time', `${responseTime}ms`);
  });
  
  next();
};

// Image Optimization
const imageOptimization = (req, res, next) => {
  // Add image optimization hints for file uploads
  if (req.file || req.files) {
    req.imageOptimization = {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 85,
      format: 'webp', // Prefer WebP for better compression
      fallbackFormat: 'jpeg'
    };
  }
  
  next();
};

// Bundle Optimization
const bundleOptimization = (req, res, next) => {
  // Add bundle optimization headers for static assets
  if (req.originalUrl.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2)$/)) {
    // Set long cache headers for static assets
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
    res.setHeader('Expires', new Date(Date.now() + 31536000000).toUTCString());
    
    // Enable compression for text assets
    if (req.originalUrl.match(/\.(js|css)$/)) {
      res.setHeader('Content-Encoding', 'gzip');
    }
  }
  
  next();
};

// Code Splitting Hints
const codeSplitting = (req, res, next) => {
  // Add code splitting hints for frontend
  if (req.originalUrl.includes('/dashboard')) {
    res.setHeader('X-Code-Split', 'dashboard');
  } else if (req.originalUrl.includes('/admin')) {
    res.setHeader('X-Code-Split', 'admin');
  } else if (req.originalUrl.includes('/users')) {
    res.setHeader('X-Code-Split', 'users');
  }
  
  next();
};

// Cache Invalidation
const cacheInvalidation = (patterns) => {
  return (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Invalidate cache for write operations
      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
        try {
          if (redisClient) {
            // Invalidate Redis cache
            patterns.forEach(pattern => {
              redisClient.keys(pattern).then(keys => {
                if (keys.length > 0) {
                  redisClient.del(keys);
                  logger.debug(`Invalidated Redis cache keys: ${keys.join(', ')}`);
                }
              }).catch(err => {
                logger.warn('Redis cache invalidation error:', err);
              });
            });
          } else {
            // Invalidate memory cache
            patterns.forEach(pattern => {
              const keys = cache.keys();
              const matchingKeys = keys.filter(key => key.match(pattern));
              cache.del(matchingKeys);
              logger.debug(`Invalidated memory cache keys: ${matchingKeys.join(', ')}`);
            });
          }
        } catch (error) {
          logger.warn('Cache invalidation error:', error);
        }
      }
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

// Performance Monitoring
const performanceMonitoring = (req, res, next) => {
  const startTime = process.hrtime.bigint();
  
  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    
    // Log performance metrics
    const metrics = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: duration,
      memoryUsage: req.memoryUsage,
      timestamp: new Date().toISOString()
    };
    
    logger.performance('REQUEST_PERFORMANCE', metrics);
    
    // Send metrics to monitoring service if available
    if (process.env.MONITORING_ENDPOINT) {
      // Send to external monitoring service
      require('axios').post(process.env.MONITORING_ENDPOINT, metrics).catch(err => {
        logger.warn('Failed to send metrics to monitoring service:', err);
      });
    }
  });
  
  next();
};

module.exports = {
  responseCaching,
  queryOptimization,
  compressionMiddleware,
  rateLimits,
  connectionPooling,
  memoryManagement,
  responseTimeOptimization,
  imageOptimization,
  bundleOptimization,
  codeSplitting,
  cacheInvalidation,
  performanceMonitoring,
  cache, // Export cache instance for manual operations
  redisClient // Export Redis client for manual operations
};
