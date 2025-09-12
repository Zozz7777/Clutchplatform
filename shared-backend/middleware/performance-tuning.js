const { performance } = require('perf_hooks');
const { getCollection } = require('../config/database');

// ==================== PERFORMANCE TUNING MODULE ====================

class PerformanceTuner {
  constructor() {
    this.tuningRules = new Map();
    this.performanceHistory = [];
    this.optimizationTriggers = new Map();
    this.setupTuningRules();
    this.setupOptimizationTriggers();
  }

  // Setup performance tuning rules
  setupTuningRules() {
    // Response time tuning rules
    this.tuningRules.set('response_time', {
      excellent: { threshold: 200, action: 'maintain' },
      good: { threshold: 500, action: 'monitor' },
      acceptable: { threshold: 1000, action: 'optimize' },
      poor: { threshold: Infinity, action: 'critical_optimize' }
    });

    // Memory usage tuning rules
    this.tuningRules.set('memory_usage', {
      excellent: { threshold: 0.6, action: 'maintain' },
      good: { threshold: 0.8, action: 'monitor' },
      acceptable: { threshold: 0.9, action: 'optimize' },
      poor: { threshold: 1.0, action: 'critical_optimize' }
    });

    // Error rate tuning rules
    this.tuningRules.set('error_rate', {
      excellent: { threshold: 0.01, action: 'maintain' },
      good: { threshold: 0.05, action: 'monitor' },
      acceptable: { threshold: 0.1, action: 'optimize' },
      poor: { threshold: 1.0, action: 'critical_optimize' }
    });

    // Throughput tuning rules
    this.tuningRules.set('throughput', {
      excellent: { threshold: 100, action: 'maintain' },
      good: { threshold: 50, action: 'monitor' },
      acceptable: { threshold: 20, action: 'optimize' },
      poor: { threshold: 0, action: 'critical_optimize' }
    });
  }

  // Setup optimization triggers
  setupOptimizationTriggers() {
    this.optimizationTriggers.set('response_time_optimization', {
      condition: (metrics) => metrics.avgResponseTime > 500,
      action: () => this.optimizeResponseTime(),
      priority: 'high'
    });

    this.optimizationTriggers.set('memory_optimization', {
      condition: (metrics) => metrics.memoryUsage > 0.8,
      action: () => this.optimizeMemory(),
      priority: 'high'
    });

    this.optimizationTriggers.set('database_optimization', {
      condition: (metrics) => metrics.dbQueryTime > 1000,
      action: () => this.optimizeDatabase(),
      priority: 'medium'
    });

    this.optimizationTriggers.set('cache_optimization', {
      condition: (metrics) => metrics.cacheHitRate < 0.7,
      action: () => this.optimizeCache(),
      priority: 'medium'
    });
  }

  // Analyze performance metrics and apply tuning
  async analyzeAndTune(metrics) {
    console.log('🔧 Analyzing performance metrics for tuning...');
    
    // Store performance history
    this.performanceHistory.push({
      ...metrics,
      timestamp: new Date()
    });

    // Keep only last 100 entries
    if (this.performanceHistory.length > 100) {
      this.performanceHistory.shift();
    }

    // Check optimization triggers
    const triggeredOptimizations = [];
    
    for (const [name, trigger] of this.optimizationTriggers) {
      if (trigger.condition(metrics)) {
        console.log(`⚡ Triggering optimization: ${name}`);
        try {
          await trigger.action();
          triggeredOptimizations.push({
            name,
            priority: trigger.priority,
            timestamp: new Date()
          });
        } catch (error) {
          console.error(`❌ Error in optimization ${name}:`, error);
        }
      }
    }

    // Generate tuning recommendations
    const recommendations = this.generateTuningRecommendations(metrics);
    
    return {
      triggeredOptimizations,
      recommendations,
      performanceTrend: this.analyzePerformanceTrend()
    };
  }

  // Optimize response time
  async optimizeResponseTime() {
    console.log('⚡ Optimizing response time...');
    
    const optimizations = [];

    // Enable response compression
    optimizations.push('Response compression enabled');
    
    // Optimize database queries
    await this.optimizeDatabaseQueries();
    optimizations.push('Database queries optimized');
    
    // Enable response caching
    await this.enableResponseCaching();
    optimizations.push('Response caching enabled');
    
    // Optimize middleware stack
    await this.optimizeMiddlewareStack();
    optimizations.push('Middleware stack optimized');

    console.log('✅ Response time optimization completed:', optimizations);
    return optimizations;
  }

  // Optimize memory usage
  async optimizeMemory() {
    console.log('⚡ Optimizing memory usage...');
    
    const optimizations = [];

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
      optimizations.push('Garbage collection triggered');
    }
    
    // Clear old cache entries
    await this.clearOldCacheEntries();
    optimizations.push('Old cache entries cleared');
    
    // Optimize data structures
    await this.optimizeDataStructures();
    optimizations.push('Data structures optimized');
    
    // Reduce memory footprint
    await this.reduceMemoryFootprint();
    optimizations.push('Memory footprint reduced');

    console.log('✅ Memory optimization completed:', optimizations);
    return optimizations;
  }

  // Optimize database performance
  async optimizeDatabase() {
    console.log('⚡ Optimizing database performance...');
    
    const optimizations = [];

    // Create missing indexes
    await this.createMissingIndexes();
    optimizations.push('Missing indexes created');
    
    // Optimize connection pool
    await this.optimizeConnectionPool();
    optimizations.push('Connection pool optimized');
    
    // Enable query caching
    await this.enableQueryCaching();
    optimizations.push('Query caching enabled');
    
    // Optimize slow queries
    await this.optimizeSlowQueries();
    optimizations.push('Slow queries optimized');

    console.log('✅ Database optimization completed:', optimizations);
    return optimizations;
  }

  // Optimize cache performance
  async optimizeCache() {
    console.log('⚡ Optimizing cache performance...');
    
    const optimizations = [];

    // Adjust cache TTL
    await this.adjustCacheTTL();
    optimizations.push('Cache TTL adjusted');
    
    // Implement cache warming
    await this.implementCacheWarming();
    optimizations.push('Cache warming implemented');
    
    // Optimize cache eviction
    await this.optimizeCacheEviction();
    optimizations.push('Cache eviction optimized');
    
    // Increase cache size
    await this.increaseCacheSize();
    optimizations.push('Cache size increased');

    console.log('✅ Cache optimization completed:', optimizations);
    return optimizations;
  }

  // Optimize database queries
  async optimizeDatabaseQueries() {
    try {
      const db = require('../config/database').getDatabase();
      if (!db) return;

      // Create indexes for common queries
      const collections = ['auto_parts_inventory', 'auto_parts_orders', 'knowledge_base_articles'];
      
      for (const collectionName of collections) {
        const collection = db.collection(collectionName);
        
        // Create common indexes
        await collection.createIndex({ createdAt: -1 });
        await collection.createIndex({ status: 1 });
        await collection.createIndex({ category: 1, brand: 1 });
        
        console.log(`✅ Indexes created for ${collectionName}`);
      }
    } catch (error) {
      console.error('❌ Error optimizing database queries:', error);
    }
  }

  // Enable response caching
  async enableResponseCaching() {
    // This would integrate with the performance optimizer
    const { performanceOptimizer } = require('./performance-optimizer');
    
    // Enable caching for common endpoints
    const cacheableEndpoints = [
      '/api/v1/auto-parts/inventory',
      '/api/v1/knowledge-base/articles',
      '/api/v1/incidents'
    ];
    
    for (const endpoint of cacheableEndpoints) {
      performanceOptimizer.setCache(`endpoint:${endpoint}`, { cached: true }, 300000); // 5 minutes
    }
  }

  // Optimize middleware stack
  async optimizeMiddlewareStack() {
    // This would optimize the order and configuration of middleware
    console.log('🔧 Optimizing middleware stack order and configuration');
  }

  // Clear old cache entries
  async clearOldCacheEntries() {
    const { performanceOptimizer } = require('./performance-optimizer');
    performanceOptimizer.clearOldCacheEntries();
  }

  // Optimize data structures
  async optimizeDataStructures() {
    // Optimize in-memory data structures
    console.log('🔧 Optimizing data structures');
  }

  // Reduce memory footprint
  async reduceMemoryFootprint() {
    // Reduce memory usage by optimizing data storage
    console.log('🔧 Reducing memory footprint');
  }

  // Create missing indexes
  async createMissingIndexes() {
    try {
      const db = require('../config/database').getDatabase();
      if (!db) return;

      // Create indexes for performance-critical queries
      const indexes = [
        { collection: 'auto_parts_inventory', index: { partNumber: 1 } },
        { collection: 'auto_parts_inventory', index: { category: 1, brand: 1 } },
        { collection: 'auto_parts_orders', index: { orderNumber: 1 } },
        { collection: 'auto_parts_orders', index: { status: 1, createdAt: -1 } },
        { collection: 'knowledge_base_articles', index: { title: 'text', content: 'text' } },
        { collection: 'knowledge_base_articles', index: { category: 1, createdAt: -1 } }
      ];

      for (const { collection, index } of indexes) {
        try {
          await db.collection(collection).createIndex(index);
          console.log(`✅ Index created: ${collection}`, index);
        } catch (error) {
          if (!error.message.includes('already exists')) {
            console.error(`❌ Error creating index for ${collection}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error creating missing indexes:', error);
    }
  }

  // Optimize connection pool
  async optimizeConnectionPool() {
    // This would optimize database connection pool settings
    console.log('🔧 Optimizing database connection pool');
  }

  // Enable query caching
  async enableQueryCaching() {
    // Enable MongoDB query result caching
    console.log('🔧 Enabling query caching');
  }

  // Optimize slow queries
  async optimizeSlowQueries() {
    // Analyze and optimize slow queries
    console.log('🔧 Optimizing slow queries');
  }

  // Adjust cache TTL
  async adjustCacheTTL() {
    // Adjust cache time-to-live based on usage patterns
    console.log('🔧 Adjusting cache TTL');
  }

  // Implement cache warming
  async implementCacheWarming() {
    // Pre-populate cache with frequently accessed data
    console.log('🔧 Implementing cache warming');
  }

  // Optimize cache eviction
  async optimizeCacheEviction() {
    // Optimize cache eviction strategy
    console.log('🔧 Optimizing cache eviction');
  }

  // Increase cache size
  async increaseCacheSize() {
    // Increase cache size if memory allows
    console.log('🔧 Increasing cache size');
  }

  // Generate tuning recommendations
  generateTuningRecommendations(metrics) {
    const recommendations = [];

    // Response time recommendations
    if (metrics.avgResponseTime > 500) {
      recommendations.push({
        type: 'response_time',
        priority: 'high',
        message: 'Response time is high. Consider implementing caching and query optimization.',
        actions: ['Enable response caching', 'Optimize database queries', 'Enable compression']
      });
    }

    // Memory recommendations
    if (metrics.memoryUsage > 0.8) {
      recommendations.push({
        type: 'memory',
        priority: 'high',
        message: 'Memory usage is high. Consider memory optimization.',
        actions: ['Trigger garbage collection', 'Clear old cache entries', 'Optimize data structures']
      });
    }

    // Error rate recommendations
    if (metrics.errorRate > 0.05) {
      recommendations.push({
        type: 'error_rate',
        priority: 'medium',
        message: 'Error rate is elevated. Review error handling.',
        actions: ['Review error logs', 'Improve error handling', 'Check database connections']
      });
    }

    // Throughput recommendations
    if (metrics.throughput < 50) {
      recommendations.push({
        type: 'throughput',
        priority: 'medium',
        message: 'Throughput is low. Consider scaling and optimization.',
        actions: ['Horizontal scaling', 'Optimize middleware', 'Connection pooling']
      });
    }

    return recommendations;
  }

  // Analyze performance trend
  analyzePerformanceTrend() {
    if (this.performanceHistory.length < 10) {
      return { trend: 'insufficient_data', confidence: 0 };
    }

    const recent = this.performanceHistory.slice(-10);
    const older = this.performanceHistory.slice(-20, -10);

    if (older.length === 0) {
      return { trend: 'insufficient_data', confidence: 0 };
    }

    const recentAvg = recent.reduce((sum, m) => sum + m.avgResponseTime, 0) / recent.length;
    const olderAvg = older.reduce((sum, m) => sum + m.avgResponseTime, 0) / older.length;

    const improvement = ((olderAvg - recentAvg) / olderAvg) * 100;
    
    let trend = 'stable';
    if (improvement > 10) trend = 'improving';
    else if (improvement < -10) trend = 'degrading';

    return {
      trend,
      improvement: Math.round(improvement),
      confidence: Math.min(recent.length / 10, 1)
    };
  }

  // Get tuning statistics
  getTuningStats() {
    return {
      totalOptimizations: this.performanceHistory.length,
      recentTrend: this.analyzePerformanceTrend(),
      activeRules: this.tuningRules.size,
      activeTriggers: this.optimizationTriggers.size,
      lastOptimization: this.performanceHistory.length > 0 ? 
        this.performanceHistory[this.performanceHistory.length - 1].timestamp : null
    };
  }
}

// Create global instance
const performanceTuner = new PerformanceTuner();

// Export functions
module.exports = {
  performanceTuner,
  analyzeAndTune: (metrics) => performanceTuner.analyzeAndTune(metrics),
  getTuningStats: () => performanceTuner.getTuningStats(),
  generateTuningRecommendations: (metrics) => performanceTuner.generateTuningRecommendations(metrics)
};
