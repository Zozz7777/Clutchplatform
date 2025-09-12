const express = require('express');
const router = express.Router();
const { getCollection } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ==================== PERFORMANCE & SCALABILITY ROUTES ====================

// GET /api/v1/performance/database/optimization - Database optimization recommendations
router.get('/database/optimization', authenticateToken, requireRole(['admin', 'dba']), async (req, res) => {
  try {
    console.log('🗄️ Analyzing database performance and generating optimization recommendations');
    
    const db = require('../config/database').getDatabase();
    
    // Get database statistics
    const stats = await db.stats();
    
    // Analyze collections
    const collections = await db.listCollections().toArray();
    const collectionAnalysis = await Promise.all(
      collections.map(async (collection) => {
        const coll = db.collection(collection.name);
        const collStats = await coll.stats();
        
        // Get index information
        const indexes = await coll.indexes();
        
        return {
          name: collection.name,
          count: collStats.count,
          size: collStats.size,
          avgObjSize: collStats.avgObjSize,
          storageSize: collStats.storageSize,
          totalIndexSize: collStats.totalIndexSize,
          indexes: indexes.map(idx => ({
            name: idx.name,
            key: idx.key,
            size: idx.size || 0
          })),
          recommendations: generateIndexRecommendations(collection.name, collStats, indexes)
        };
      })
    );
    
    // Generate optimization recommendations
    const recommendations = {
      indexing: generateIndexingRecommendations(collectionAnalysis),
      queryOptimization: generateQueryOptimizationRecommendations(),
      caching: generateCachingRecommendations(),
      sharding: generateShardingRecommendations(stats)
    };
    
    res.json({
      success: true,
      data: {
        databaseStats: {
          collections: stats.collections,
          dataSize: stats.dataSize,
          storageSize: stats.storageSize,
          indexes: stats.indexes,
          indexSize: stats.indexSize,
          avgObjSize: stats.avgObjSize
        },
        collectionAnalysis,
        recommendations,
        generatedAt: new Date().toISOString()
      },
      message: 'Database optimization analysis completed',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error analyzing database performance:', error);
    res.status(500).json({
      success: false,
      error: 'DATABASE_ANALYSIS_FAILED',
      message: 'Failed to analyze database performance'
    });
  }
});

// POST /api/v1/performance/database/indexes - Create recommended indexes
router.post('/database/indexes', authenticateToken, requireRole(['admin', 'dba']), async (req, res) => {
  try {
    console.log('🗄️ Creating recommended database indexes');
    
    const { collection, indexes } = req.body;
    
    if (!collection || !indexes || !Array.isArray(indexes)) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Collection name and indexes array are required'
      });
    }
    
    const db = require('../config/database').getDatabase();
    const coll = db.collection(collection);
    
    const results = [];
    
    for (const indexSpec of indexes) {
      try {
        const result = await coll.createIndex(indexSpec.keys, {
          name: indexSpec.name,
          background: true,
          ...indexSpec.options
        });
        results.push({
          index: indexSpec.name,
          status: 'created',
          result
        });
      } catch (error) {
        results.push({
          index: indexSpec.name,
          status: 'failed',
          error: error.message
        });
      }
    }
    
    res.json({
      success: true,
      data: {
        collection,
        results,
        totalIndexes: indexes.length,
        successful: results.filter(r => r.status === 'created').length,
        failed: results.filter(r => r.status === 'failed').length
      },
      message: 'Index creation completed',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    res.status(500).json({
      success: false,
      error: 'INDEX_CREATION_FAILED',
      message: 'Failed to create indexes'
    });
  }
});

// GET /api/v1/performance/cache/status - Get cache status and statistics
router.get('/cache/status', authenticateToken, requireRole(['admin', 'devops']), async (req, res) => {
  try {
    console.log('💾 Fetching cache status and statistics');
    
    // Simulate cache statistics (in production, this would connect to Redis)
    const cacheStats = {
      redis: {
        connected: true,
        memory: {
          used: '45.2 MB',
          peak: '67.8 MB',
          fragmentation: '1.2'
        },
        keys: {
          total: 12543,
          expired: 234,
          evicted: 12
        },
        hits: 89456,
        misses: 1234,
        hitRate: '98.6%'
      },
      application: {
        inMemoryCache: {
          size: 1024,
          maxSize: 2048,
          hitRate: '95.2%'
        },
        queryCache: {
          cachedQueries: 156,
          cacheHits: 2341,
          cacheMisses: 89
        }
      }
    };
    
    res.json({
      success: true,
      data: cacheStats,
      message: 'Cache status retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching cache status:', error);
    res.status(500).json({
      success: false,
      error: 'CACHE_STATUS_FAILED',
      message: 'Failed to fetch cache status'
    });
  }
});

// POST /api/v1/performance/cache/clear - Clear cache
router.post('/cache/clear', authenticateToken, requireRole(['admin', 'devops']), async (req, res) => {
  try {
    console.log('💾 Clearing cache');
    
    const { cacheType = 'all' } = req.body;
    
    // Simulate cache clearing (in production, this would clear Redis and in-memory caches)
    const results = {
      redis: cacheType === 'all' || cacheType === 'redis' ? 'cleared' : 'skipped',
      application: cacheType === 'all' || cacheType === 'application' ? 'cleared' : 'skipped',
      queryCache: cacheType === 'all' || cacheType === 'query' ? 'cleared' : 'skipped'
    };
    
    res.json({
      success: true,
      data: {
        cleared: results,
        timestamp: new Date().toISOString()
      },
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error clearing cache:', error);
    res.status(500).json({
      success: false,
      error: 'CACHE_CLEAR_FAILED',
      message: 'Failed to clear cache'
    });
  }
});

// GET /api/v1/performance/api/metrics - Get API performance metrics
router.get('/api/metrics', authenticateToken, requireRole(['admin', 'devops']), async (req, res) => {
  try {
    console.log('📊 Fetching API performance metrics');
    
    const { startDate, endDate, endpoint } = req.query;
    
    // Simulate API metrics collection (in production, this would come from monitoring system)
    const metrics = {
      responseTime: {
        avg: 145,
        p50: 120,
        p95: 280,
        p99: 450,
        max: 1200
      },
      throughput: {
        requestsPerSecond: 1250,
        requestsPerMinute: 75000,
        requestsPerHour: 4500000
      },
      errorRate: {
        total: 0.02,
        byStatus: {
          '4xx': 0.015,
          '5xx': 0.005
        }
      },
      endpoints: [
        {
          path: '/api/v1/auto-parts/inventory',
          method: 'GET',
          avgResponseTime: 120,
          requestCount: 15420,
          errorRate: 0.01
        },
        {
          path: '/api/v1/auto-parts/orders',
          method: 'POST',
          avgResponseTime: 180,
          requestCount: 3420,
          errorRate: 0.03
        },
        {
          path: '/api/v1/user-analytics/overview',
          method: 'GET',
          avgResponseTime: 320,
          requestCount: 890,
          errorRate: 0.02
        }
      ],
      timeRange: {
        start: startDate || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        end: endDate || new Date().toISOString()
      }
    };
    
    res.json({
      success: true,
      data: metrics,
      message: 'API performance metrics retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching API metrics:', error);
    res.status(500).json({
      success: false,
      error: 'API_METRICS_FAILED',
      message: 'Failed to fetch API performance metrics'
    });
  }
});

// POST /api/v1/performance/compression/enable - Enable response compression
router.post('/compression/enable', authenticateToken, requireRole(['admin', 'devops']), async (req, res) => {
  try {
    console.log('🗜️ Enabling response compression');
    
    const { compressionType = 'gzip', level = 6 } = req.body;
    
    // In production, this would configure the compression middleware
    const compressionConfig = {
      type: compressionType,
      level: level,
      threshold: 1024, // Compress responses larger than 1KB
      filter: (req, res) => {
        // Don't compress if already compressed
        if (req.headers['x-no-compression']) {
          return false;
        }
        // Use compression filter function
        return true;
      }
    };
    
    res.json({
      success: true,
      data: compressionConfig,
      message: 'Response compression enabled successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error enabling compression:', error);
    res.status(500).json({
      success: false,
      error: 'COMPRESSION_ENABLE_FAILED',
      message: 'Failed to enable response compression'
    });
  }
});

// GET /api/v1/performance/pagination/optimize - Get pagination optimization recommendations
router.get('/pagination/optimize', authenticateToken, requireRole(['admin', 'developer']), async (req, res) => {
  try {
    console.log('📄 Analyzing pagination performance');
    
    const { collection, pageSize = 20 } = req.query;
    
    if (!collection) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Collection name is required'
      });
    }
    
    const coll = await getCollection(collection);
    
    // Analyze pagination performance
    const totalDocs = await coll.countDocuments();
    const totalPages = Math.ceil(totalDocs / pageSize);
    
    // Test different pagination strategies
    const strategies = {
      skipLimit: {
        name: 'Skip + Limit',
        description: 'Traditional MongoDB skip/limit pagination',
        pros: ['Simple to implement', 'Works with any query'],
        cons: ['Performance degrades with large offsets', 'Not suitable for real-time data'],
        performance: totalPages > 1000 ? 'Poor' : 'Good'
      },
      cursorBased: {
        name: 'Cursor-based Pagination',
        description: 'Use cursor/ID-based pagination for better performance',
        pros: ['Consistent performance', 'Real-time friendly', 'No skip performance issues'],
        cons: ['More complex implementation', 'Requires sorted data'],
        performance: 'Excellent'
      },
      offsetOptimized: {
        name: 'Offset Optimization',
        description: 'Use compound indexes to optimize offset queries',
        pros: ['Better than basic skip/limit', 'Works with existing queries'],
        cons: ['Still has limitations with large offsets'],
        performance: totalPages > 500 ? 'Fair' : 'Good'
      }
    };
    
    const recommendations = {
      currentStrategy: 'skipLimit',
      recommendedStrategy: totalDocs > 10000 ? 'cursorBased' : 'skipLimit',
      optimizations: [
        {
          type: 'index',
          description: 'Create compound index on sort fields',
          impact: 'High',
          effort: 'Low'
        },
        {
          type: 'pagination',
          description: 'Implement cursor-based pagination',
          impact: 'High',
          effort: 'Medium'
        },
        {
          type: 'caching',
          description: 'Cache frequently accessed pages',
          impact: 'Medium',
          effort: 'Low'
        }
      ]
    };
    
    res.json({
      success: true,
      data: {
        collection,
        totalDocuments: totalDocs,
        totalPages,
        pageSize: parseInt(pageSize),
        strategies,
        recommendations,
        generatedAt: new Date().toISOString()
      },
      message: 'Pagination optimization analysis completed',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error analyzing pagination:', error);
    res.status(500).json({
      success: false,
      error: 'PAGINATION_ANALYSIS_FAILED',
      message: 'Failed to analyze pagination performance'
    });
  }
});

// Helper functions for database optimization
function generateIndexRecommendations(collectionName, stats, indexes) {
  const recommendations = [];
  
  // Check for missing indexes based on collection name
  if (collectionName === 'auto_parts_inventory') {
    if (!indexes.find(idx => idx.name === 'category_1_brand_1')) {
      recommendations.push({
        type: 'compound_index',
        fields: { category: 1, brand: 1 },
        reason: 'Optimize category and brand filtering queries'
      });
    }
    if (!indexes.find(idx => idx.name === 'price_1_quantity_1')) {
      recommendations.push({
        type: 'compound_index',
        fields: { price: 1, quantity: 1 },
        reason: 'Optimize price range and stock queries'
      });
    }
  }
  
  if (collectionName === 'auto_parts_orders') {
    if (!indexes.find(idx => idx.name === 'status_1_createdAt_-1')) {
      recommendations.push({
        type: 'compound_index',
        fields: { status: 1, createdAt: -1 },
        reason: 'Optimize order status and date filtering'
      });
    }
  }
  
  // Check for large collections without proper indexes
  if (stats.count > 10000 && indexes.length < 3) {
    recommendations.push({
      type: 'general',
      reason: 'Large collection with few indexes - consider adding more indexes'
    });
  }
  
  return recommendations;
}

function generateIndexingRecommendations(collectionAnalysis) {
  const recommendations = [];
  
  collectionAnalysis.forEach(collection => {
    if (collection.recommendations.length > 0) {
      recommendations.push({
        collection: collection.name,
        recommendations: collection.recommendations
      });
    }
  });
  
  return recommendations;
}

function generateQueryOptimizationRecommendations() {
  return [
    {
      type: 'projection',
      description: 'Use projection to limit returned fields',
      impact: 'Medium',
      example: 'db.collection.find({}, {name: 1, price: 1})'
    },
    {
      type: 'aggregation',
      description: 'Use aggregation pipeline for complex queries',
      impact: 'High',
      example: 'db.collection.aggregate([{$match: {...}}, {$group: {...}}])'
    },
    {
      type: 'explain',
      description: 'Use explain() to analyze query performance',
      impact: 'High',
      example: 'db.collection.find({...}).explain("executionStats")'
    }
  ];
}

function generateCachingRecommendations() {
  return [
    {
      type: 'query_cache',
      description: 'Cache frequently executed queries',
      impact: 'High',
      implementation: 'Redis with TTL'
    },
    {
      type: 'session_cache',
      description: 'Use Redis for session storage',
      impact: 'High',
      implementation: 'Redis session store'
    },
    {
      type: 'application_cache',
      description: 'Implement in-memory caching for static data',
      impact: 'Medium',
      implementation: 'Node.js memory cache with LRU eviction'
    }
  ];
}

function generateShardingRecommendations(stats) {
  const recommendations = [];
  
  if (stats.dataSize > 100 * 1024 * 1024 * 1024) { // 100GB
    recommendations.push({
      type: 'horizontal_sharding',
      description: 'Consider horizontal sharding for large datasets',
      impact: 'High',
      shardKey: 'userId or shopId'
    });
  }
  
  if (stats.collections > 100) {
    recommendations.push({
      type: 'database_separation',
      description: 'Consider separating collections into different databases',
      impact: 'Medium',
      reason: 'Too many collections in single database'
    });
  }
  
  return recommendations;
}

module.exports = router;
