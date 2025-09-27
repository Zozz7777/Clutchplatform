/**
 * Optimized Redis Configuration
 * Intelligent caching with cache invalidation and monitoring
 * Implements cache hit/miss tracking and automatic cleanup
 */

const Redis = require('ioredis');
const winston = require('winston');
const logger = require('../utils/logger');

class OptimizedRedisCache {
  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/redis-cache.log' }),
        new winston.transports.Console()
      ]
    });

    // Redis configuration - Render compatible
    this.config = {
      host: process.env.REDIS_HOST || process.env.REDIS_URL?.split('://')[1]?.split(':')[0] || 'localhost',
      port: process.env.REDIS_PORT || process.env.REDIS_URL?.split(':').pop()?.split('/')[0] || 6379,
      password: process.env.REDIS_PASSWORD || process.env.REDIS_URL?.split('://')[1]?.split('@')[0]?.split(':')[1] || null,
      db: process.env.REDIS_DB || 0,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 1, // Reduced for Render
      lazyConnect: true,
      keepAlive: 30000,
      connectTimeout: 5000, // Reduced for Render
      commandTimeout: 3000, // Reduced for Render
      maxMemoryPolicy: 'allkeys-lru',
      // Render-specific optimizations
      enableOfflineQueue: true, // Enable offline queue for better reliability
      maxLoadingTimeout: 2000
    };

    // Cache statistics
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
      totalRequests: 0,
      startTime: Date.now()
    };

    // Cache key patterns
    this.keyPatterns = {
      user: 'user:',
      session: 'session:',
      analytics: 'analytics:',
      booking: 'booking:',
      vehicle: 'vehicle:',
      product: 'product:',
      service: 'service:',
      notification: 'notification:',
      api: 'api:'
    };

    // Default TTL values (in seconds)
    this.defaultTTL = {
      user: 3600,        // 1 hour
      session: 86400,    // 24 hours
      analytics: 1800,   // 30 minutes
      booking: 1800,     // 30 minutes
      vehicle: 7200,     // 2 hours
      product: 3600,     // 1 hour
      service: 1800,     // 30 minutes
      notification: 300, // 5 minutes
      api: 600          // 10 minutes
    };

    this.client = null;
    this.isConnected = false;
  }

  /**
   * Initialize Redis connection - Render compatible
   */
  async initialize() {
    try {
      // Check if Redis is available in environment
      if (!process.env.REDIS_URL && !process.env.REDIS_HOST) {
        this.logger.warn('⚠️ Redis not configured - running without cache');
        this.isConnected = false;
        return false;
      }

      this.client = new Redis(this.config);
      
      this.client.on('connect', () => {
        this.logger.info('✅ Redis connected successfully');
        this.isConnected = true;
      });

      this.client.on('error', (error) => {
        this.logger.error('❌ Redis connection error:', error);
        this.stats.errors++;
        this.isConnected = false;
      });

      this.client.on('close', () => {
        this.logger.warn('⚠️ Redis connection closed');
        this.isConnected = false;
      });

      // Test connection with timeout
      const pingPromise = this.client.ping();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Redis connection timeout')), 3000)
      );
      
      await Promise.race([pingPromise, timeoutPromise]);
      this.logger.info('🚀 Optimized Redis cache initialized');
      
      return true;
    } catch (error) {
      this.logger.error('❌ Failed to initialize Redis:', error);
      this.isConnected = false;
      // Don't throw error - allow server to continue without Redis
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const uptime = Date.now() - this.stats.startTime;
    const hitRate = this.stats.totalRequests > 0 
      ? (this.stats.hits / this.stats.totalRequests) * 100 
      : 0;

    return {
      ...this.stats,
      hitRate: Math.round(hitRate * 100) / 100,
      uptime: Math.round(uptime / 1000),
      isConnected: this.isConnected,
      memoryUsage: this.getMemoryUsage()
    };
  }

  /**
   * Get memory usage (if available)
   */
  async getMemoryUsage() {
    try {
      if (!this.isConnected) return null;
      
      const info = await this.client.info('memory');
      const lines = info.split('\r\n');
      const memory = {};
      
      lines.forEach(line => {
        if (line.includes(':')) {
          const [key, value] = line.split(':');
          memory[key] = value;
        }
      });
      
      return {
        used: memory.used_memory_human,
        peak: memory.used_memory_peak_human,
        fragmentation: memory.mem_fragmentation_ratio
      };
    } catch (error) {
      this.logger.error('Error getting Redis memory usage:', error);
      return null;
    }
  }

  /**
   * Generate cache key
   */
  generateKey(type, identifier, suffix = '') {
    const pattern = this.keyPatterns[type] || 'cache:';
    return `${pattern}${identifier}${suffix ? ':' + suffix : ''}`;
  }

  /**
   * Get value from cache
   */
  async get(type, identifier, suffix = '') {
    try {
      if (!this.isConnected) {
        this.stats.misses++;
        this.stats.totalRequests++;
        return null;
      }

      const key = this.generateKey(type, identifier, suffix);
      const value = await this.client.get(key);
      
      this.stats.totalRequests++;
      
      if (value) {
        this.stats.hits++;
        this.logger.debug(`Cache HIT: ${key}`);
        return JSON.parse(value);
      } else {
        this.stats.misses++;
        this.logger.debug(`Cache MISS: ${key}`);
        return null;
      }
    } catch (error) {
      this.logger.error('Cache GET error:', error);
      this.stats.errors++;
      this.stats.misses++;
      this.stats.totalRequests++;
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set(type, identifier, value, ttl = null, suffix = '') {
    try {
      if (!this.isConnected) {
        this.stats.sets++;
        return false;
      }

      const key = this.generateKey(type, identifier, suffix);
      const cacheValue = JSON.stringify(value);
      const cacheTTL = ttl || this.defaultTTL[type] || 3600;

      await this.client.setex(key, cacheTTL, cacheValue);
      this.stats.sets++;
      
      this.logger.debug(`Cache SET: ${key} (TTL: ${cacheTTL}s)`);
      return true;
    } catch (error) {
      this.logger.error('Cache SET error:', error);
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async delete(type, identifier, suffix = '') {
    try {
      if (!this.isConnected) {
        this.stats.deletes++;
        return false;
      }

      const key = this.generateKey(type, identifier, suffix);
      const result = await this.client.del(key);
      this.stats.deletes++;
      
      this.logger.debug(`Cache DELETE: ${key}`);
      return result > 0;
    } catch (error) {
      this.logger.error('Cache DELETE error:', error);
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  async deletePattern(pattern) {
    try {
      if (!this.isConnected) return 0;

      const keys = await this.client.keys(pattern);
      if (keys.length === 0) return 0;

      const result = await this.client.del(...keys);
      this.stats.deletes += keys.length;
      
      this.logger.info(`Cache DELETE PATTERN: ${pattern} (${keys.length} keys)`);
      return result;
    } catch (error) {
      this.logger.error('Cache DELETE PATTERN error:', error);
      this.stats.errors++;
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(type, identifier, suffix = '') {
    try {
      if (!this.isConnected) return false;

      const key = this.generateKey(type, identifier, suffix);
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error('Cache EXISTS error:', error);
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Get TTL for key
   */
  async getTTL(type, identifier, suffix = '') {
    try {
      if (!this.isConnected) return -1;

      const key = this.generateKey(type, identifier, suffix);
      return await this.client.ttl(key);
    } catch (error) {
      this.logger.error('Cache TTL error:', error);
      this.stats.errors++;
      return -1;
    }
  }

  /**
   * Set TTL for key
   */
  async setTTL(type, identifier, ttl, suffix = '') {
    try {
      if (!this.isConnected) return false;

      const key = this.generateKey(type, identifier, suffix);
      const result = await this.client.expire(key, ttl);
      return result === 1;
    } catch (error) {
      this.logger.error('Cache SET TTL error:', error);
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Cache middleware for Express routes
   */
  cacheMiddleware(type, ttl = null, keyGenerator = null) {
    return async (req, res, next) => {
      try {
        // Generate cache key
        const identifier = keyGenerator ? keyGenerator(req) : req.params.id || req.user?.userId;
        const suffix = req.query.cache ? `:${req.query.cache}` : '';
        
        // Try to get from cache
        const cachedData = await this.get(type, identifier, suffix);
        
        if (cachedData) {
          res.json({
            success: true,
            data: cachedData,
            cached: true,
            timestamp: new Date().toISOString()
          });
          return;
        }
        
        // Store original res.json
        const originalJson = res.json.bind(res);
        
        // Override res.json to cache the response
        res.json = (data) => {
          // Cache the response
          this.set(type, identifier, data, ttl, suffix);
          
          // Add cache info to response
          if (data && typeof data === 'object') {
            data.cached = false;
          }
          
          // Call original res.json
          originalJson(data);
        };
        
        next();
      } catch (error) {
        this.logger.error('Cache middleware error:', error);
        next();
      }
    };
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidatePattern(pattern) {
    try {
      const deletedCount = await this.deletePattern(pattern);
      this.logger.info(`Cache invalidated: ${pattern} (${deletedCount} keys)`);
      return deletedCount;
    } catch (error) {
      this.logger.error('Cache invalidation error:', error);
      return 0;
    }
  }

  /**
   * Invalidate user-related cache
   */
  async invalidateUser(userId) {
    const patterns = [
      `user:${userId}*`,
      `session:${userId}*`,
      `analytics:${userId}*`,
      `booking:${userId}*`
    ];
    
    let totalDeleted = 0;
    for (const pattern of patterns) {
      totalDeleted += await this.invalidatePattern(pattern);
    }
    
    return totalDeleted;
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      if (!this.isConnected) {
        return {
          status: 'disconnected',
          message: 'Redis not connected'
        };
      }

      const startTime = Date.now();
      await this.client.ping();
      const responseTime = Date.now() - startTime;

      const stats = this.getStats();
      const memory = await this.getMemoryUsage();

      return {
        status: 'healthy',
        responseTime: `${responseTime}ms`,
        stats,
        memory,
        uptime: Math.round((Date.now() - this.stats.startTime) / 1000)
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message
      };
    }
  }

  /**
   * Close Redis connection
   */
  async close() {
    try {
      if (this.client) {
        await this.client.quit();
        this.logger.info('✅ Redis connection closed gracefully');
      }
    } catch (error) {
      this.logger.error('❌ Error closing Redis connection:', error);
    }
  }
}

// Create singleton instance
const redisCache = new OptimizedRedisCache();

module.exports = {
  redisCache,
  OptimizedRedisCache
};
