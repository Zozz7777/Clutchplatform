const { getCollection } = require('../config/database');

// ==================== PERFORMANCE OPTIMIZATION MIDDLEWARE ====================
// Performance metrics and monitoring system

class PerformanceOptimizer {
  constructor() {
    this.cache = new Map();
    this.cacheStats = {
      hits: 0,
      misses: 0,
      size: 0,
      maxSize: 1000
    };
    this.optimizationRules = new Map();
    this.setupOptimizationRules();
  }

  // Setup optimization rules
  setupOptimizationRules() {
    // Database query optimization rules
    this.optimizationRules.set('database', {
      maxQueryTime: 1000, // 1 second
      maxResultSize: 1000,
      enableIndexing: true,
      enableAggregation: true,
      enableProjection: true
    });

    // Memory optimization rules
    this.optimizationRules.set('memory', {
      maxHeapUsage: 0.8, // 80% of available memory
      gcThreshold: 0.7, // 70% threshold for garbage collection
      cacheMaxSize: 1000,
      enableCompression: true
    });

    // Response optimization rules
    this.optimizationRules.set('response', {
      maxResponseSize: 1024 * 1024, // 1MB
      enableCompression: true,
      enablePagination: true,
      defaultPageSize: 20,
      maxPageSize: 100
    });
  }

  // Cache management
  setCache(key, value, ttl = 300000) { // 5 minutes default TTL
    if (this.cache.size >= this.cacheStats.maxSize) {
      this.evictOldestCacheEntry();
    }

    const cacheEntry = {
      value,
      timestamp: Date.now(),
      ttl,
      accessCount: 0
    };

    this.cache.set(key, cacheEntry);
    this.cacheStats.size = this.cache.size;
  }

  getCache(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.cacheStats.misses++;
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.cacheStats.misses++;
      this.cacheStats.size = this.cache.size;
      return null;
    }

    // Update access count and timestamp
    entry.accessCount++;
    entry.timestamp = Date.now();
    this.cacheStats.hits++;
    
    return entry.value;
  }

  evictOldestCacheEntry() {
    let oldestKey = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.cacheStats.size = this.cache.size;
    }
  }

  // Database query optimization
  optimizeQuery(query, options = {}) {
    const optimizedQuery = { ...query };
    const optimizedOptions = { ...options };

    // Add projection to limit returned fields
    if (!optimizedOptions.projection && this.optimizationRules.get('database').enableProjection) {
      optimizedOptions.projection = this.getOptimalProjection(query);
    }

    // Add pagination if not present
    if (!optimizedOptions.limit && this.optimizationRules.get('response').enablePagination) {
      optimizedOptions.limit = this.optimizationRules.get('response').defaultPageSize;
    }

    // Optimize sort operations
    if (optimizedOptions.sort) {
      optimizedOptions.sort = this.optimizeSort(optimizedOptions.sort);
    }

    return { query: optimizedQuery, options: optimizedOptions };
  }

  // Get optimal projection based on query
  getOptimalProjection(query) {
    const projection = {};
    
    // Always include _id
    projection._id = 1;
    
    // Add common fields based on collection type
    if (query.collection === 'auto_parts_inventory') {
      projection.name = 1;
      projection.partNumber = 1;
      projection.price = 1;
      projection.quantity = 1;
      projection.category = 1;
      projection.brand = 1;
    } else if (query.collection === 'auto_parts_orders') {
      projection.orderNumber = 1;
      projection.totalAmount = 1;
      projection.status = 1;
      projection.createdAt = 1;
      projection.customerInfo = 1;
    }
    
    return projection;
  }

  // Optimize sort operations
  optimizeSort(sort) {
    // Ensure sort operations are indexed
    const optimizedSort = {};
    
    for (const [field, direction] of Object.entries(sort)) {
      // Check if field is commonly indexed
      if (this.isIndexedField(field)) {
        optimizedSort[field] = direction;
      } else {
        // Use compound index if available
        const compoundIndex = this.getCompoundIndex(field);
        if (compoundIndex) {
          Object.assign(optimizedSort, compoundIndex);
        } else {
          optimizedSort[field] = direction;
        }
      }
    }
    
    return optimizedSort;
  }

  // Check if field is commonly indexed
  isIndexedField(field) {
    const indexedFields = [
      '_id', 'createdAt', 'updatedAt', 'status', 'category', 'brand',
      'partNumber', 'orderNumber', 'userId', 'shopId'
    ];
    return indexedFields.includes(field);
  }

  // Get compound index for field
  getCompoundIndex(field) {
    const compoundIndexes = {
      'category': { category: 1, brand: 1 },
      'brand': { brand: 1, category: 1 },
      'status': { status: 1, createdAt: -1 },
      'createdAt': { createdAt: -1, status: 1 }
    };
    return compoundIndexes[field] || null;
  }

  // Response optimization
  optimizeResponse(data, options = {}) {
    let optimizedData = data;

    // Compress large responses
    if (this.shouldCompress(data, options)) {
      optimizedData = this.compressResponse(data);
    }

    // Paginate large datasets
    if (this.shouldPaginate(data, options)) {
      optimizedData = this.paginateResponse(data, options);
    }

    // Remove sensitive fields
    if (options.removeSensitive) {
      optimizedData = this.removeSensitiveFields(optimizedData);
    }

    return optimizedData;
  }

  // Check if response should be compressed
  shouldCompress(data, options) {
    const dataSize = JSON.stringify(data).length;
    const maxSize = this.optimizationRules.get('response').maxResponseSize;
    return dataSize > maxSize && this.optimizationRules.get('response').enableCompression;
  }

  // Compress response data
  compressResponse(data) {
    // Remove unnecessary fields
    const compressed = JSON.parse(JSON.stringify(data));
    
    // Remove null/undefined values
    this.removeNullValues(compressed);
    
    // Shorten field names for large objects
    if (Array.isArray(compressed) && compressed.length > 100) {
      return compressed.map(item => this.shortenFieldNames(item));
    }
    
    return compressed;
  }

  // Remove null values from object
  removeNullValues(obj) {
    if (Array.isArray(obj)) {
      return obj.map(item => this.removeNullValues(item));
    } else if (obj && typeof obj === 'object') {
      const cleaned = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value !== null && value !== undefined) {
          cleaned[key] = this.removeNullValues(value);
        }
      }
      return cleaned;
    }
    return obj;
  }

  // Shorten field names for large objects
  shortenFieldNames(obj) {
    const fieldMap = {
      'createdAt': 'cAt',
      'updatedAt': 'uAt',
      'partNumber': 'pNum',
      'totalAmount': 'tAmt',
      'customerInfo': 'cInfo',
      'orderNumber': 'oNum'
    };

    const shortened = {};
    for (const [key, value] of Object.entries(obj)) {
      const shortKey = fieldMap[key] || key;
      shortened[shortKey] = value;
    }
    return shortened;
  }

  // Check if response should be paginated
  shouldPaginate(data, options) {
    const isArray = Array.isArray(data);
    const isLarge = isArray && data.length > this.optimizationRules.get('response').defaultPageSize;
    return isLarge && this.optimizationRules.get('response').enablePagination;
  }

  // Paginate response data
  paginateResponse(data, options) {
    const page = parseInt(options.page) || 1;
    const limit = Math.min(
      parseInt(options.limit) || this.optimizationRules.get('response').defaultPageSize,
      this.optimizationRules.get('response').maxPageSize
    );
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return {
      data: data.slice(startIndex, endIndex),
      pagination: {
        page,
        limit,
        total: data.length,
        pages: Math.ceil(data.length / limit),
        hasNext: endIndex < data.length,
        hasPrev: page > 1
      }
    };
  }

  // Remove sensitive fields
  removeSensitiveFields(data) {
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth'];
    
    if (Array.isArray(data)) {
      return data.map(item => this.removeSensitiveFields(item));
    } else if (data && typeof data === 'object') {
      const cleaned = {};
      for (const [key, value] of Object.entries(data)) {
        if (!sensitiveFields.some(field => key.toLowerCase().includes(field))) {
          cleaned[key] = this.removeSensitiveFields(value);
        }
      }
      return cleaned;
    }
    return data;
  }

  // Memory optimization
  optimizeMemory() {
    const { getRenderCompatibleMemoryUsage, getV8HeapUsage } = require('../utils/memory-monitor');
    
    const renderMemory = getRenderCompatibleMemoryUsage();
    const v8Heap = getV8HeapUsage();
    
    // Use Render-compatible memory usage for optimization decisions
    const renderMemoryPercent = renderMemory.usagePercentage;
    const heapUsagePercent = v8Heap.heapUsagePercentage;
    
    // Log both Render-compatible and heap usage for clarity
    console.log(`🧹 Memory Status - Render Compatible: ${renderMemoryPercent}%, Node.js Heap: ${heapUsagePercent}%`);
    
    // Only optimize if Render-compatible memory is actually high
    if (renderMemoryPercent > 80) {
      console.log(`🧹 High RENDER memory usage: ${renderMemoryPercent}% - monitoring...`);
      
      // Level 1: Clear cache at 80% memory
      if (renderMemoryPercent > 80) {
        this.cache.clear();
        this.cacheStats = {
          hits: 0,
          misses: 0,
          size: 0,
          maxSize: 1000
        };
        console.log('🧹 Cache cleared due to high memory usage');
      }
      
      // Level 2: Force garbage collection at 85% memory
      if (global.gc && renderMemoryPercent > 85) {
        global.gc();
        console.log('🧹 Forced garbage collection');
      }
      
      // Level 3: Emergency cleanup at 90% memory
      if (renderMemoryPercent > 90) {
        this.emergencyMemoryCleanup();
      }
      
      // Level 4: Critical cleanup at 95% memory
      if (renderMemoryPercent > 95) {
        this.criticalMemoryCleanup();
      }
    } else if (heapUsagePercent > 90) {
      // Only optimize heap if it's extremely high (90%+) and memory is fine
      console.log(`🧹 High Node.js heap usage: ${heapUsagePercent}% - optimizing heap only`);
      
      if (global.gc) {
        global.gc();
        console.log('🧹 Forced garbage collection for heap optimization');
      }
    } else {
      // Memory is healthy
      console.log(`✅ Memory healthy - Render Compatible: ${renderMemoryPercent}%, Heap: ${heapUsagePercent}%`);
    }
  }

  // Emergency memory cleanup procedures
  emergencyMemoryCleanup() {
    console.log('🚨 EMERGENCY: Performing emergency memory cleanup');
    
    try {
      // Clear all caches
      this.cache.clear();
      
      // Clear any global caches if they exist
      if (global.cache) {
        global.cache.clear();
      }
      
      // Force multiple garbage collection cycles
      if (global.gc) {
        for (let i = 0; i < 3; i++) {
          global.gc();
        }
      }
      
      // Reset cache stats
      this.cacheStats = {
        hits: 0,
        misses: 0,
        size: 0,
        maxSize: 500 // Reduce max cache size
      };
      
      console.log('✅ Emergency memory cleanup completed');
    } catch (error) {
      console.error('❌ Emergency memory cleanup failed:', error);
    }
  }

  // Critical memory cleanup procedures
  criticalMemoryCleanup() {
    console.log('🚨 CRITICAL: Performing critical memory cleanup');
    
    try {
      // Emergency cleanup first
      this.emergencyMemoryCleanup();
      
      // Clear any remaining references
      this.optimizationRules.clear();
      
      // Force aggressive garbage collection
      if (global.gc) {
        for (let i = 0; i < 5; i++) {
          global.gc();
        }
      }
      
      // Reinitialize with minimal settings
      this.setupOptimizationRules();
      this.cacheStats.maxSize = 100; // Drastically reduce cache size
      
      console.log('✅ Critical memory cleanup completed');
    } catch (error) {
      console.error('❌ Critical memory cleanup failed:', error);
    }
  }

  // Clear old cache entries
  clearOldCacheEntries() {
    const now = Date.now();
    const maxAge = 300000; // 5 minutes
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > maxAge) {
        this.cache.delete(key);
      }
    }
    
    this.cacheStats.size = this.cache.size;
  }

  // Database connection optimization
  async optimizeDatabaseConnections() {
    try {
      const { db } = require('../config/database');
      const database = db();
      if (db && db.admin) {
        // Get current connection stats
        const serverStatus = await db.admin().serverStatus();
        const connections = serverStatus.connections;
        
        // Optimize connection pool if needed
        if (connections.current > connections.available * 2) {
          console.log('ðŸ”§ Optimizing database connections');
          // In a real implementation, you would adjust connection pool settings
        }
      }
    } catch (error) {
      console.error('Error optimizing database connections:', error);
    }
  }

  // Get optimization recommendations
  getOptimizationRecommendations() {
    const recommendations = [];
    
    // Memory recommendations
    const memUsage = process.memoryUsage();
    const heapUsageRatio = memUsage.heapUsed / memUsage.heapTotal;
    
    if (heapUsageRatio > 0.8) {
      recommendations.push({
        type: 'memory',
        priority: 'high',
        message: 'High memory usage detected. Consider increasing memory or optimizing data structures.',
        action: 'optimizeMemory'
      });
    }
    
    // Cache recommendations
    const cacheHitRate = this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses);
    if (cacheHitRate < 0.7) {
      recommendations.push({
        type: 'cache',
        priority: 'medium',
        message: 'Low cache hit rate. Consider adjusting cache strategy.',
        action: 'optimizeCache'
      });
    }
    
    // Database recommendations
    if (this.cacheStats.size > this.cacheStats.maxSize * 0.9) {
      recommendations.push({
        type: 'database',
        priority: 'medium',
        message: 'Cache size approaching limit. Consider increasing cache size or implementing cache eviction.',
        action: 'optimizeCacheSize'
      });
    }
    
    return recommendations;
  }

  // Get cache statistics
  getCacheStats() {
    const hitRate = this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses) || 0;
    
    return {
      ...this.cacheStats,
      hitRate: Math.round(hitRate * 100),
      memoryUsage: this.cache.size * 1024, // Approximate memory usage in bytes
      recommendations: this.getOptimizationRecommendations()
    };
  }

  // Middleware for automatic optimization
  optimizationMiddleware() {
    return (req, res, next) => {
      // Disable automatic memory optimization to prevent restarts
      this.optimizeMemory();
      
      // Add optimization headers
      res.setHeader('X-Optimization-Enabled', 'true');
      res.setHeader('X-Cache-Status', 'enabled');
      
      next();
    };
  }

  // Cleanup
  cleanup() {
    this.cache.clear();
    this.cacheStats = {
      hits: 0,
      misses: 0,
      size: 0,
      maxSize: 1000
    };
  }
}

// Create global instance
const performanceOptimizer = new PerformanceOptimizer();

// Export functions
module.exports = {
  performanceOptimizer,
  setCache: (key, value, ttl) => performanceOptimizer.setCache(key, value, ttl),
  getCache: (key) => performanceOptimizer.getCache(key),
  optimizeQuery: (query, options) => performanceOptimizer.optimizeQuery(query, options),
  optimizeResponse: (data, options) => performanceOptimizer.optimizeResponse(data, options),
  optimizeMemory: () => performanceOptimizer.optimizeMemory(),
  optimizeDatabaseConnections: () => performanceOptimizer.optimizeDatabaseConnections(),
  getOptimizationRecommendations: () => performanceOptimizer.getOptimizationRecommendations(),
  getCacheStats: () => performanceOptimizer.getCacheStats(),
  optimizationMiddleware: () => performanceOptimizer.optimizationMiddleware()
};

// Performance metrics and monitoring
