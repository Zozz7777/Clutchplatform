/**
 * 🚀 Advanced Caching Service for Clutch Platform
 * Multi-layer caching with intelligent invalidation and performance optimization
 */

const Redis = require('ioredis');
const { logger } = require('../config/logger');

class AdvancedCacheService {
  constructor() {
    this.redis = null;
    this.memoryCache = new Map();
    this.cacheStats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      memoryUsage: 0
    };
    this.cacheConfig = {
      memoryCacheSize: 1000,
      defaultTTL: 300, // 5 minutes
      maxMemoryUsage: 100 * 1024 * 1024, // 100MB
      compressionThreshold: 1024, // 1KB
      enableCompression: true,
      enableMetrics: true
    };
    
    this.initializeRedis();
    this.startCleanupInterval();
  }

  async initializeRedis() {
    try {
      if (process.env.REDIS_URL) {
        this.redis = new Redis(process.env.REDIS_URL, {
          retryDelayOnFailover: 100,
          enableReadyCheck: false,
          maxRetriesPerRequest: 3,
          lazyConnect: true,
          keepAlive: 30000,
          family: 4,
          connectTimeout: 10000,
          commandTimeout: 5000
        });

        this.redis.on('connect', () => {
          logger.info('✅ Redis connected successfully');
        });

        this.redis.on('error', (error) => {
          logger.error('❌ Redis connection error:', error);
          this.redis = null;
        });

        this.redis.on('ready', () => {
          logger.info('🚀 Redis ready for operations');
        });

      } else {
        logger.warn('⚠️ Redis not configured, using in-memory cache only');
      }
    } catch (error) {
      logger.error('❌ Failed to initialize Redis:', error);
      this.redis = null;
    }
  }

  /**
   * Set cache value with intelligent TTL and compression
   */
  async set(key, value, options = {}) {
    try {
      const ttl = options.ttl || this.cacheConfig.defaultTTL;
      const compress = options.compress !== false && this.cacheConfig.enableCompression;
      const tags = options.tags || [];
      const priority = options.priority || 'normal';

      // Prepare cache entry
      const cacheEntry = {
        value: value,
        timestamp: Date.now(),
        ttl: ttl,
        tags: tags,
        priority: priority,
        accessCount: 0,
        lastAccessed: Date.now()
      };

      // Compress if needed
      if (compress && JSON.stringify(value).length > this.cacheConfig.compressionThreshold) {
        cacheEntry.value = await this.compressData(value);
        cacheEntry.compressed = true;
      }

      // Set in memory cache
      this.setMemoryCache(key, cacheEntry, ttl);

      // Set in Redis if available
      if (this.redis && this.redis.status === 'ready') {
        await this.redis.setex(key, ttl, JSON.stringify(cacheEntry));
      }

      this.cacheStats.sets++;
      this.updateMemoryUsage();

      // Set tag associations for invalidation
      if (tags.length > 0) {
        await this.setTagAssociations(key, tags);
      }

      logger.debug(`Cache SET: ${key} (TTL: ${ttl}s, Tags: ${tags.join(',')})`);
      return true;

    } catch (error) {
      logger.error(`Cache SET error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get cache value with intelligent fallback
   */
  async get(key, options = {}) {
    try {
      let cacheEntry = null;
      let source = '';

      // Try memory cache first
      cacheEntry = this.getMemoryCache(key);
      if (cacheEntry) {
        source = 'memory';
      }

      // Fallback to Redis if memory cache miss
      if (!cacheEntry && this.redis && this.redis.status === 'ready') {
        try {
          const redisValue = await this.redis.get(key);
          if (redisValue) {
            cacheEntry = JSON.parse(redisValue);
            source = 'redis';
            
            // Update memory cache for future access
            this.setMemoryCache(key, cacheEntry, cacheEntry.ttl);
          }
        } catch (redisError) {
          logger.warn(`Redis GET error for key ${key}:`, redisError);
        }
      }

      if (cacheEntry) {
        // Check if expired
        if (this.isExpired(cacheEntry)) {
          await this.delete(key);
          this.cacheStats.misses++;
          return null;
        }

        // Update access statistics
        cacheEntry.accessCount++;
        cacheEntry.lastAccessed = Date.now();

        // Decompress if needed
        let value = cacheEntry.value;
        if (cacheEntry.compressed) {
          value = await this.decompressData(value);
        }

        this.cacheStats.hits++;
        logger.debug(`Cache HIT: ${key} (Source: ${source}, Access Count: ${cacheEntry.accessCount})`);
        
        return value;
      }

      this.cacheStats.misses++;
      logger.debug(`Cache MISS: ${key}`);
      return null;

    } catch (error) {
      logger.error(`Cache GET error for key ${key}:`, error);
      this.cacheStats.misses++;
      return null;
    }
  }

  /**
   * Delete cache entry and related data
   */
  async delete(key) {
    try {
      // Remove from memory cache
      this.memoryCache.delete(key);

      // Remove from Redis
      if (this.redis && this.redis.status === 'ready') {
        await this.redis.del(key);
      }

      // Remove tag associations
      await this.removeTagAssociations(key);

      this.cacheStats.deletes++;
      this.updateMemoryUsage();

      logger.debug(`Cache DELETE: ${key}`);
      return true;

    } catch (error) {
      logger.error(`Cache DELETE error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Invalidate cache by tags
   */
  async invalidateByTags(tags) {
    try {
      if (!Array.isArray(tags)) {
        tags = [tags];
      }

      const keysToDelete = await this.getKeysByTags(tags);
      let deletedCount = 0;

      for (const key of keysToDelete) {
        if (await this.delete(key)) {
          deletedCount++;
        }
      }

      logger.info(`Cache invalidation by tags [${tags.join(',')}]: ${deletedCount} keys deleted`);
      return deletedCount;

    } catch (error) {
      logger.error(`Cache invalidation error for tags [${tags.join(',')}]:`, error);
      return 0;
    }
  }

  /**
   * Clear all cache entries
   */
  async clear() {
    try {
      // Clear memory cache
      this.memoryCache.clear();

      // Clear Redis cache
      if (this.redis && this.redis.status === 'ready') {
        await this.redis.flushdb();
      }

      // Clear tag associations
      await this.clearTagAssociations();

      // Reset statistics
      this.cacheStats.hits = 0;
      this.cacheStats.misses = 0;
      this.cacheStats.sets = 0;
      this.cacheStats.deletes = 0;
      this.updateMemoryUsage();

      logger.info('Cache cleared successfully');
      return true;

    } catch (error) {
      logger.error('Cache clear error:', error);
      return false;
    }
  }

  /**
   * Get cache statistics and health
   */
  getStats() {
    const hitRate = this.cacheStats.hits + this.cacheStats.misses > 0 
      ? (this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses) * 100).toFixed(2)
      : 0;

    return {
      ...this.cacheStats,
      hitRate: `${hitRate}%`,
      memoryCacheSize: this.memoryCache.size,
      redisStatus: this.redis ? this.redis.status : 'not_configured',
      memoryUsage: this.formatBytes(this.cacheStats.memoryUsage)
    };
  }

  /**
   * Warm up cache with frequently accessed data
   */
  async warmup(patterns = []) {
    try {
      logger.info('🔥 Starting cache warmup...');
      let warmedCount = 0;

      for (const pattern of patterns) {
        if (this.redis && this.redis.status === 'ready') {
          const keys = await this.redis.keys(pattern);
          
          for (const key of keys) {
            try {
              const value = await this.redis.get(key);
              if (value) {
                const cacheEntry = JSON.parse(value);
                this.setMemoryCache(key, cacheEntry, cacheEntry.ttl);
                warmedCount++;
              }
            } catch (error) {
              logger.warn(`Failed to warmup key ${key}:`, error);
            }
          }
        }
      }

      logger.info(`Cache warmup completed: ${warmedCount} keys loaded`);
      return warmedCount;

    } catch (error) {
      logger.error('Cache warmup error:', error);
      return 0;
    }
  }

  // Private helper methods

  setMemoryCache(key, value, ttl) {
    // Implement LRU eviction if memory cache is full
    if (this.memoryCache.size >= this.cacheConfig.memoryCacheSize) {
      this.evictLRU();
    }

    this.memoryCache.set(key, {
      ...value,
      expiresAt: Date.now() + (ttl * 1000)
    });
  }

  getMemoryCache(key) {
    const entry = this.memoryCache.get(key);
    if (entry && !this.isExpired(entry)) {
      return entry;
    }
    
    if (entry) {
      this.memoryCache.delete(key);
    }
    return null;
  }

  isExpired(entry) {
    return entry.expiresAt && Date.now() > entry.expiresAt;
  }

  evictLRU() {
    let oldestKey = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.memoryCache.delete(oldestKey);
      logger.debug(`LRU eviction: ${oldestKey}`);
    }
  }

  async setTagAssociations(key, tags) {
    if (!this.redis || this.redis.status !== 'ready') return;

    try {
      for (const tag of tags) {
        const tagKey = `tag:${tag}`;
        await this.redis.sadd(tagKey, key);
        await this.redis.expire(tagKey, 86400); // 24 hours
      }
    } catch (error) {
      logger.warn('Failed to set tag associations:', error);
    }
  }

  async removeTagAssociations(key) {
    if (!this.redis || this.redis.status !== 'ready') return;

    try {
      const tagKeys = await this.redis.keys('tag:*');
      for (const tagKey of tagKeys) {
        await this.redis.srem(tagKey, key);
      }
    } catch (error) {
      logger.warn('Failed to remove tag associations:', error);
    }
  }

  async getKeysByTags(tags) {
    if (!this.redis || this.redis.status !== 'ready') return [];

    try {
      const keys = new Set();
      for (const tag of tags) {
        const tagKey = `tag:${tag}`;
        const tagKeys = await this.redis.smembers(tagKey);
        tagKeys.forEach(key => keys.add(key));
      }
      return Array.from(keys);
    } catch (error) {
      logger.warn('Failed to get keys by tags:', error);
      return [];
    }
  }

  async clearTagAssociations() {
    if (!this.redis || this.redis.status !== 'ready') return;

    try {
      const tagKeys = await this.redis.keys('tag:*');
      if (tagKeys.length > 0) {
        await this.redis.del(...tagKeys);
      }
    } catch (error) {
      logger.warn('Failed to clear tag associations:', error);
    }
  }

  async compressData(data) {
    // Simple compression for demonstration
    // In production, use proper compression libraries like zlib
    return Buffer.from(JSON.stringify(data)).toString('base64');
  }

  async decompressData(compressedData) {
    try {
      const decoded = Buffer.from(compressedData, 'base64').toString();
      return JSON.parse(decoded);
    } catch (error) {
      logger.warn('Failed to decompress data:', error);
      return compressedData;
    }
  }

  updateMemoryUsage() {
    let totalSize = 0;
    for (const [key, value] of this.memoryCache.entries()) {
      totalSize += key.length + JSON.stringify(value).length;
    }
    this.cacheStats.memoryUsage = totalSize;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  startCleanupInterval() {
    // Clean up expired entries every minute
    setInterval(() => {
      this.cleanupExpired();
    }, 60000);
  }

  cleanupExpired() {
    let cleanedCount = 0;
    for (const [key, entry] of this.memoryCache.entries()) {
      if (this.isExpired(entry)) {
        this.memoryCache.delete(key);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      logger.debug(`Cache cleanup: ${cleanedCount} expired entries removed`);
      this.updateMemoryUsage();
    }
  }

  /**
   * Health check for the cache service
   */
  async healthCheck() {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      memoryCache: {
        status: 'healthy',
        size: this.memoryCache.size,
        maxSize: this.cacheConfig.memoryCacheSize
      },
      redis: {
        status: 'not_configured',
        connected: false
      },
      statistics: this.getStats()
    };

    // Check memory cache health
    if (this.memoryCache.size > this.cacheConfig.memoryCacheSize * 0.9) {
      health.memoryCache.status = 'warning';
    }

    // Check Redis health
    if (this.redis) {
      try {
        await this.redis.ping();
        health.redis.status = 'healthy';
        health.redis.connected = true;
      } catch (error) {
        health.redis.status = 'unhealthy';
        health.redis.error = error.message;
        health.status = 'degraded';
      }
    }

    return health;
  }
}

// Export singleton instance
const advancedCacheService = new AdvancedCacheService();
module.exports = advancedCacheService;
