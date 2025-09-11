/**
 * Request Caching Middleware
 * Provides intelligent caching for frequently accessed endpoints
 */

const NodeCache = require('node-cache');

class CacheMiddleware {
  constructor() {
    this.cache = new NodeCache({
      stdTTL: 300, // 5 minutes default TTL
      checkperiod: 60, // Check for expired keys every minute
      useClones: false // Don't clone objects for better performance
    });
    
    // Cache configuration for different endpoints
    this.cacheConfig = {
      '/api/v1/auth/employee-me': { ttl: 300 }, // 5 minutes
      '/api/v1/admin/dashboard/consolidated': { ttl: 120 }, // 2 minutes
      '/api/v1/autonomous-dashboard/status': { ttl: 60 }, // 1 minute
      '/api/v1/autonomous-dashboard/data': { ttl: 60 }, // 1 minute
    };
  }

  /**
   * Generate cache key from request
   */
  generateCacheKey(req) {
    const userId = req.user?.id || 'anonymous';
    return `${req.method}:${req.originalUrl}:${userId}`;
  }

  /**
   * Get cache configuration for endpoint
   */
  getCacheConfig(path) {
    return this.cacheConfig[path] || { ttl: 300 };
  }

  /**
   * Cache middleware
   */
  middleware() {
    return (req, res, next) => {
      // Only cache GET requests
      if (req.method !== 'GET') {
        return next();
      }

      const cacheKey = this.generateCacheKey(req);
      const cached = this.cache.get(cacheKey);

      if (cached) {
        res.set('X-Cache', 'HIT');
        return res.json(cached);
      }

      // Store original res.json
      const originalJson = res.json.bind(res);
      
      res.json = (data) => {
        // Cache the response
        const config = this.getCacheConfig(req.originalUrl);
        this.cache.set(cacheKey, data, config.ttl);
        
        res.set('X-Cache', 'MISS');
        return originalJson(data);
      };

      next();
    };
  }

  /**
   * Clear cache for specific pattern
   */
  clearCache(pattern) {
    const keys = this.cache.keys();
    const regex = new RegExp(pattern);
    
    keys.forEach(key => {
      if (regex.test(key)) {
        this.cache.del(key);
      }
    });
  }

  /**
   * Clear all cache
   */
  clearAllCache() {
    this.cache.flushAll();
  }

  /**
   * Get cache stats
   */
  getStats() {
    return {
      keys: this.cache.keys().length,
      hits: this.cache.getStats().hits,
      misses: this.cache.getStats().misses,
      ksize: this.cache.getStats().ksize,
      vsize: this.cache.getStats().vsize
    };
  }
}

module.exports = new CacheMiddleware();
