/**
 * Cache Middleware for Express Routes
 * Intelligent caching with automatic invalidation
 */

const { redisCache } = require('../config/optimized-redis');

/**
 * Cache middleware factory
 */
const createCacheMiddleware = (options = {}) => {
  const {
    type = 'api',
    ttl = 600, // 10 minutes default
    keyGenerator = null,
    skipCache = false,
    invalidateOn = ['POST', 'PUT', 'DELETE']
  } = options;

  return async (req, res, next) => {
    try {
      // Skip cache for certain methods
      if (invalidateOn.includes(req.method)) {
        // Invalidate related cache
        await invalidateRelatedCache(req, type);
        return next();
      }

      // Skip cache if requested
      if (skipCache || req.query.skipCache === 'true') {
        return next();
      }

      // Generate cache key
      const cacheKey = keyGenerator ? keyGenerator(req) : generateDefaultKey(req, type);
      
      // Try to get from cache
      const cachedData = await redisCache.get(type, cacheKey);
      
      if (cachedData) {
        res.json({
          success: true,
          data: cachedData,
          cached: true,
          cacheKey: cacheKey,
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Store original res.json
      const originalJson = res.json.bind(res);
      
      // Override res.json to cache the response
      res.json = (data) => {
        // Only cache successful responses
        if (data && data.success !== false) {
          redisCache.set(type, cacheKey, data, ttl);
        }
        
        // Add cache info to response
        if (data && typeof data === 'object') {
          data.cached = false;
          data.cacheKey = cacheKey;
        }
        
        // Call original res.json
        originalJson(data);
      };
      
      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

/**
 * Generate default cache key
 */
const generateDefaultKey = (req, type) => {
  const userId = req.user?.userId || 'anonymous';
  const path = req.path;
  const query = Object.keys(req.query).length > 0 ? JSON.stringify(req.query) : '';
  
  return `${userId}:${path}:${query}`;
};

/**
 * Invalidate related cache
 */
const invalidateRelatedCache = async (req, type) => {
  try {
    const userId = req.user?.userId;
    const path = req.path;
    
    // Invalidate user-specific cache
    if (userId) {
      await redisCache.invalidateUser(userId);
    }
    
    // Invalidate path-specific cache
    const pathPattern = `${type}:*${path}*`;
    await redisCache.invalidatePattern(pathPattern);
    
    console.log(`Cache invalidated for: ${path} (user: ${userId})`);
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
};

/**
 * Predefined cache middlewares
 */
const cacheMiddlewares = {
  // User data cache (1 hour)
  user: createCacheMiddleware({
    type: 'user',
    ttl: 3600,
    keyGenerator: (req) => req.user?.userId || req.params.id
  }),

  // Analytics cache (30 minutes)
  analytics: createCacheMiddleware({
    type: 'analytics',
    ttl: 1800,
    keyGenerator: (req) => {
      const userId = req.user?.userId || 'global';
      const period = req.query.period || '30d';
      return `${userId}:${period}`;
    }
  }),

  // Booking cache (30 minutes)
  booking: createCacheMiddleware({
    type: 'booking',
    ttl: 1800,
    keyGenerator: (req) => req.params.id || req.user?.userId
  }),

  // Vehicle cache (2 hours)
  vehicle: createCacheMiddleware({
    type: 'vehicle',
    ttl: 7200,
    keyGenerator: (req) => req.params.id || req.user?.userId
  }),

  // Product cache (1 hour)
  product: createCacheMiddleware({
    type: 'product',
    ttl: 3600,
    keyGenerator: (req) => req.params.id || 'list'
  }),

  // Service cache (30 minutes)
  service: createCacheMiddleware({
    type: 'service',
    ttl: 1800,
    keyGenerator: (req) => req.params.id || 'list'
  }),

  // API response cache (10 minutes)
  api: createCacheMiddleware({
    type: 'api',
    ttl: 600,
    keyGenerator: (req) => {
      const userId = req.user?.userId || 'anonymous';
      const path = req.path;
      const query = Object.keys(req.query).length > 0 ? JSON.stringify(req.query) : '';
      return `${userId}:${path}:${query}`;
    }
  }),

  // Short-term cache (5 minutes)
  short: createCacheMiddleware({
    type: 'api',
    ttl: 300
  }),

  // Long-term cache (24 hours)
  long: createCacheMiddleware({
    type: 'api',
    ttl: 86400
  })
};

/**
 * Cache invalidation helpers
 */
const cacheInvalidation = {
  // Invalidate user cache
  invalidateUser: async (userId) => {
    return await redisCache.invalidateUser(userId);
  },

  // Invalidate by pattern
  invalidatePattern: async (pattern) => {
    return await redisCache.invalidatePattern(pattern);
  },

  // Invalidate all cache
  invalidateAll: async () => {
    return await redisCache.invalidatePattern('*');
  },

  // Invalidate API cache
  invalidateAPI: async (path) => {
    const pattern = `api:*${path}*`;
    return await redisCache.invalidatePattern(pattern);
  }
};

/**
 * Cache statistics middleware
 */
const cacheStats = async (req, res, next) => {
  try {
    const stats = redisCache.getStats();
    const health = await redisCache.healthCheck();
    
    res.json({
      success: true,
      data: {
        stats,
        health,
        recommendations: generateCacheRecommendations(stats)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'CACHE_STATS_FAILED',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Generate cache recommendations
 */
const generateCacheRecommendations = (stats) => {
  const recommendations = [];
  
  if (stats.hitRate < 50) {
    recommendations.push('Consider increasing cache TTL for better hit rates');
  }
  
  if (stats.hitRate > 90) {
    recommendations.push('Cache is performing well - consider optimizing TTL for memory usage');
  }
  
  if (stats.errors > 0) {
    recommendations.push('Check Redis connection and configuration');
  }
  
  if (stats.memoryUsage && stats.memoryUsage.fragmentation > 1.5) {
    recommendations.push('Consider Redis memory optimization');
  }
  
  return recommendations;
};

module.exports = {
  createCacheMiddleware,
  cacheMiddlewares,
  cacheInvalidation,
  cacheStats,
  generateDefaultKey,
  invalidateRelatedCache
};
