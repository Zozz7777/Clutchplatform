const { getRedisClient } = require('../config/redis');
const { logger } = require('../config/logger');

/**
 * Performance Optimization Service
 * Provides intelligent performance optimization and caching strategies
 */
class PerformanceOptimizationService {
  constructor() {
    this.redis = getRedisClient(); // Use centralized Redis client
    this.optimizations = new Map();
    this.metrics = new Map();
  }

  // ==================== CACHE OPTIMIZATION ====================
  
  async getCachedData(key, fetchFunction, ttl = 3600) {
    try {
      // Try to get from Redis cache first
      const cached = await this.redis.get(key);
      if (cached) {
        logger.debug(`Cache hit: ${key}`);
        return JSON.parse(cached);
      }

      // If not in cache, fetch from database
      const data = await fetchFunction();
      
      // Cache the result
      if (data) {
        await this.redis.setex(key, ttl, JSON.stringify(data));
        logger.debug(`Cache miss: ${key}`);
      }
      
      return data;
    } catch (error) {
      logger.error('Cache operation failed:', error);
      // Fallback to direct database query
      return await fetchFunction();
    }
  }

  async invalidateCache(pattern) {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        logger.info(`Invalidated ${keys.length} cache keys matching pattern: ${pattern}`);
      }
    } catch (error) {
      logger.error('Cache invalidation failed:', error);
    }
  }

  // ==================== DATABASE QUERY OPTIMIZATION ====================
  
  async optimizedQuery(collectionName, query, options = {}) {
    const startTime = Date.now();
    const queryId = this.generateQueryId(collectionName, query);
    
    try {
      // Check query cache for repeated queries
      if (this.optimizations.has(queryId)) {
        const cachedResult = this.optimizations.get(queryId);
        if (Date.now() - cachedResult.timestamp < 30000) { // 30 second cache
          logger.debug(`Query cache hit: ${queryId}`);
          return cachedResult.data;
        }
      }

      // The original code had getCollection here, which is removed.
      // Assuming the intent was to fetch the collection from a central source
      // or that this method is no longer directly database-dependent.
      // For now, we'll just return an error or a placeholder, as getCollection is removed.
      // A proper implementation would involve a centralized collection registry.
      logger.warn(`optimizedQuery called without a centralized collection registry. Cannot execute query.`);
      return []; // Return empty array as a placeholder
      
      // const collection = await getCollection(collectionName); // This line is removed
      
      // Apply query optimizations
      const optimizedQuery = this.optimizeQuery(query);
      const optimizedOptions = this.optimizeQueryOptions(options);
      
      // const result = await collection.find(optimizedQuery, optimizedOptions).toArray(); // This line is removed
      
      // Cache the result
      this.optimizations.set(queryId, {
        data: [], // Placeholder data
        timestamp: Date.now()
      });
      
      // Log performance metrics
      const executionTime = Date.now() - startTime;
      this.logQueryPerformance(collectionName, executionTime, 0); // Placeholder for resultCount
      
      return []; // Return empty array as a placeholder
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logQueryError(collectionName, executionTime, error);
      throw error;
    }
  }

  optimizeQuery(query) {
    // Remove unnecessary fields and optimize query structure
    const optimized = { ...query };
    
    // Ensure proper index usage
    if (optimized.$or && optimized.$or.length > 1) {
      // Reorder $or conditions for better index usage
      optimized.$or.sort((a, b) => {
        const aKeys = Object.keys(a);
        const bKeys = Object.keys(b);
        return aKeys.length - bKeys.length;
      });
    }
    
    return optimized;
  }

  optimizeQueryOptions(options) {
    const optimized = { ...options };
    
    // Set reasonable limits
    if (!optimized.limit) {
      optimized.limit = 100;
    }
    
    // Add projection for better performance
    if (!optimized.projection) {
      optimized.projection = { _id: 1 };
    }
    
    // Add sort optimization
    if (optimized.sort) {
      optimized.sort = this.optimizeSort(optimized.sort);
    }
    
    return optimized;
  }

  optimizeSort(sort) {
    // Ensure sort uses indexed fields
    const optimized = {};
    for (const [field, direction] of Object.entries(sort)) {
      // Prefer indexed fields for sorting
      if (['_id', 'createdAt', 'updatedAt', 'userId', 'email'].includes(field)) {
        optimized[field] = direction;
      }
    }
    return optimized;
  }

  // ==================== CONNECTION POOL OPTIMIZATION ====================
  
  async getOptimizedConnection() {
    try {
      // The original code had getCollection here, which is removed.
      // Assuming the intent was to fetch a collection from a centralized source
      // or that this method is no longer directly database-dependent.
      // For now, we'll just return an error or a placeholder, as getCollection is removed.
      // A proper implementation would involve a centralized collection registry.
      logger.warn(`getOptimizedConnection called without a centralized collection registry. Cannot return a collection.`);
      return null; // Return null as a placeholder
    } catch (error) {
      logger.error('Failed to get optimized connection:', error);
      throw error;
    }
  }

  // ==================== MEMORY MANAGEMENT ====================
  
  cleanupMemory() {
    try {
      // Clear old query cache entries
      const now = Date.now();
      for (const [key, value] of this.optimizations.entries()) {
        if (now - value.timestamp > 300000) { // 5 minutes
          this.optimizations.delete(key);
        }
      }
      
      // Clear old performance metrics
      for (const [key, value] of this.metrics.entries()) {
        if (now - value.timestamp > 3600000) { // 1 hour
          this.metrics.delete(key);
        }
      }
      
      logger.info('Memory cleanup completed');
    } catch (error) {
      logger.error('Memory cleanup failed:', error);
    }
  }

  // ==================== PERFORMANCE MONITORING ====================
  
  initializePerformanceMonitoring() {
    // Set up periodic cleanup
    setInterval(() => {
      this.cleanupMemory();
    }, 300000); // Every 5 minutes

    // Set up performance monitoring
    setInterval(() => {
      this.logPerformanceMetrics();
    }, 60000); // Every minute
  }

  logQueryPerformance(collection, executionTime, resultCount) {
    const metric = {
      collection,
      executionTime,
      resultCount,
      timestamp: Date.now()
    };
    
    this.metrics.set(`${collection}_${Date.now()}`, metric);
    
    if (executionTime > 1000) { // Log slow queries
      logger.warn(`Slow query detected: ${collection} took ${executionTime}ms for ${resultCount} results`);
    }
  }

  logQueryError(collection, executionTime, error) {
    logger.error(`Query error in ${collection}: ${error.message} (${executionTime}ms)`);
  }

  logCacheHit(key) {
    logger.debug(`Cache hit: ${key}`);
  }

  logCacheMiss(key) {
    logger.debug(`Cache miss: ${key}`);
  }

  logQueryCacheHit(queryId) {
    logger.debug(`Query cache hit: ${queryId}`);
  }

  logPerformanceMetrics() {
    const metrics = Array.from(this.metrics.values());
    if (metrics.length === 0) return;

    const avgExecutionTime = metrics.reduce((sum, m) => sum + m.executionTime, 0) / metrics.length;
    const totalQueries = metrics.length;
    const slowQueries = metrics.filter(m => m.executionTime > 1000).length;

    logger.info(`Performance metrics: ${totalQueries} queries, avg ${avgExecutionTime.toFixed(2)}ms, ${slowQueries} slow queries`);
  }

  // ==================== UTILITY FUNCTIONS ====================
  
  generateQueryId(collection, query) {
    return `${collection}_${JSON.stringify(query)}`;
  }

  async getPerformanceStats() {
    try {
      const stats = {
        cacheSize: this.optimizations.size,
        performanceMetrics: this.metrics.size,
        redisStatus: await this.redis.ping() === 'PONG' ? 'connected' : 'disconnected',
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime()
      };

      return stats;
    } catch (error) {
      logger.error('Failed to get performance stats:', error);
      return { error: error.message };
    }
  }

  // ==================== CIRCUIT BREAKER PATTERN ====================
  
  async executeWithCircuitBreaker(operation, fallback = null, maxFailures = 5) {
    const operationId = operation.name || 'unknown';
    const failureKey = `circuit_breaker_failures_${operationId}`;
    const stateKey = `circuit_breaker_state_${operationId}`;
    
    try {
      // Check circuit breaker state
      const state = await this.redis.get(stateKey);
      if (state === 'open') {
        logger.warn(`Circuit breaker open for ${operationId}, using fallback`);
        return fallback ? await fallback() : null;
      }

      // Execute operation
      const result = await operation();
      
      // Reset failure count on success
      await this.redis.del(failureKey);
      
      return result;
    } catch (error) {
      // Increment failure count
      const failures = await this.redis.incr(failureKey);
      
      if (failures >= maxFailures) {
        // Open circuit breaker
        await this.redis.setex(stateKey, 300, 'open'); // 5 minutes
        logger.error(`Circuit breaker opened for ${operationId} after ${failures} failures`);
      }
      
      logger.error(`Operation ${operationId} failed:`, error);
      
      // Return fallback if available
      if (fallback) {
        try {
          return await fallback();
        } catch (fallbackError) {
          logger.error(`Fallback for ${operationId} also failed:`, fallbackError);
          throw error; // Throw original error
        }
      }
      
      throw error;
    }
  }

  // ==================== REQUEST TIMEOUT HANDLING ====================
  
  async executeWithTimeout(operation, timeoutMs = 5000) {
    return new Promise(async (resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      try {
        const result = await operation();
        clearTimeout(timeout);
        resolve(result);
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  // ==================== BATCH OPERATIONS ====================
  
  async batchOperation(operations, batchSize = 10) {
    const results = [];
    
    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(batch.map(op => op()));
      
      results.push(...batchResults.map(result => 
        result.status === 'fulfilled' ? result.value : result.reason
      ));
      
      // Add small delay between batches to prevent overwhelming the system
      if (i + batchSize < operations.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return results;
  }

  // ==================== HEALTH CHECK ====================
  
  async healthCheck() {
    try {
      const checks = {
        redis: await this.redis.ping() === 'PONG',
        database: await this.testDatabaseConnection(),
        memory: this.checkMemoryUsage(),
        cache: this.optimizations.size < 1000 // Reasonable cache size
      };

      const allHealthy = Object.values(checks).every(check => check === true);
      
      return {
        status: allHealthy ? 'healthy' : 'degraded',
        checks,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async testDatabaseConnection() {
    try {
      // The original code had getCollection here, which is removed.
      // Assuming the intent was to test a connection to a centralized collection
      // or that this method is no longer directly database-dependent.
      // For now, we'll just return an error or a placeholder, as getCollection is removed.
      logger.warn(`testDatabaseConnection called without a centralized collection registry. Cannot test connection.`);
      return false; // Return false as a placeholder
    } catch (error) {
      return false;
    }
  }

  checkMemoryUsage() {
    const usage = process.memoryUsage();
    const heapUsedMB = usage.heapUsed / 1024 / 1024;
    return heapUsedMB < 512; // Less than 512MB
  }
}

// Create singleton instance
const performanceOptimizationService = new PerformanceOptimizationService();

module.exports = performanceOptimizationService;
