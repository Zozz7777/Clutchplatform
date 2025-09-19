const { getCollection } = require('../utils/databaseUtils');
const { MongoClient } = require('mongodb');

class RealDatabaseMonitoringService {
  constructor() {
    this.connectionPool = null;
    this.queryMetrics = [];
    this.maxHistorySize = 1000;
  }

  /**
   * Initialize database monitoring
   */
  async initialize() {
    try {
      // Get the MongoDB connection from the existing database utils
      this.connectionPool = await this.getConnectionPool();
      console.log('Database monitoring service initialized');
    } catch (error) {
      console.error('Failed to initialize database monitoring:', error);
    }
  }

  /**
   * Get database connection pool information
   */
  async getConnectionPool() {
    try {
      // This would typically get the actual connection pool from your database utils
      // For now, we'll return basic connection info
      return {
        totalConnections: 10, // TODO: Get actual pool size
        activeConnections: 5, // TODO: Get actual active connections
        idleConnections: 5,   // TODO: Get actual idle connections
        maxConnections: 20    // TODO: Get actual max connections
      };
    } catch (error) {
      console.error('Failed to get connection pool info:', error);
      return null;
    }
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats() {
    try {
      const db = await this.getDatabase();
      if (!db) return null;

      const stats = await db.stats();
      return {
        collections: stats.collections,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        indexes: stats.indexes,
        indexSize: stats.indexSize,
        objects: stats.objects,
        avgObjSize: stats.avgObjSize
      };
    } catch (error) {
      console.error('Failed to get database stats:', error);
      return null;
    }
  }

  /**
   * Get collection statistics
   */
  async getCollectionStats(collectionName) {
    try {
      const collection = await getCollection(collectionName);
      const stats = await collection.stats();
      
      return {
        count: stats.count,
        size: stats.size,
        avgObjSize: stats.avgObjSize,
        storageSize: stats.storageSize,
        totalIndexSize: stats.totalIndexSize,
        indexSizes: stats.indexSizes
      };
    } catch (error) {
      console.error(`Failed to get stats for collection ${collectionName}:`, error);
      return null;
    }
  }

  /**
   * Monitor query performance
   */
  async monitorQuery(collectionName, operation, query, options = {}) {
    const startTime = Date.now();
    
    try {
      const collection = await getCollection(collectionName);
      let result;
      
      switch (operation) {
        case 'find':
          result = await collection.find(query, options).toArray();
          break;
        case 'findOne':
          result = await collection.findOne(query, options);
          break;
        case 'count':
          result = await collection.countDocuments(query, options);
          break;
        case 'aggregate':
          result = await collection.aggregate(query, options).toArray();
          break;
        case 'insertOne':
          result = await collection.insertOne(query, options);
          break;
        case 'updateOne':
          result = await collection.updateOne(query, options);
          break;
        case 'deleteOne':
          result = await collection.deleteOne(query, options);
          break;
        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      // Record query metrics
      this.recordQueryMetric({
        collection: collectionName,
        operation,
        executionTime,
        timestamp: new Date(),
        success: true,
        resultSize: Array.isArray(result) ? result.length : 1
      });
      
      return result;
    } catch (error) {
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      // Record failed query
      this.recordQueryMetric({
        collection: collectionName,
        operation,
        executionTime,
        timestamp: new Date(),
        success: false,
        error: error.message
      });
      
      throw error;
    }
  }

  /**
   * Record query metrics
   */
  recordQueryMetric(metric) {
    this.queryMetrics.push(metric);
    
    // Keep only recent metrics
    if (this.queryMetrics.length > this.maxHistorySize) {
      this.queryMetrics = this.queryMetrics.slice(-this.maxHistorySize);
    }
  }

  /**
   * Get query performance metrics
   */
  getQueryMetrics(timeWindow = 300000) { // 5 minutes default
    const cutoffTime = new Date(Date.now() - timeWindow);
    const recentMetrics = this.queryMetrics.filter(m => m.timestamp >= cutoffTime);
    
    if (recentMetrics.length === 0) {
      return {
        totalQueries: 0,
        averageExecutionTime: 0,
        slowQueries: 0,
        errorRate: 0,
        queriesByOperation: {},
        queriesByCollection: {}
      };
    }

    const totalQueries = recentMetrics.length;
    const successfulQueries = recentMetrics.filter(m => m.success);
    const failedQueries = recentMetrics.filter(m => !m.success);
    const slowQueries = recentMetrics.filter(m => m.executionTime > 1000); // > 1 second
    
    const averageExecutionTime = recentMetrics.reduce((sum, m) => sum + m.executionTime, 0) / totalQueries;
    const errorRate = (failedQueries.length / totalQueries) * 100;

    // Group by operation
    const queriesByOperation = recentMetrics.reduce((acc, m) => {
      acc[m.operation] = (acc[m.operation] || 0) + 1;
      return acc;
    }, {});

    // Group by collection
    const queriesByCollection = recentMetrics.reduce((acc, m) => {
      acc[m.collection] = (acc[m.collection] || 0) + 1;
      return acc;
    }, {});

    return {
      totalQueries,
      averageExecutionTime: Math.round(averageExecutionTime * 100) / 100,
      slowQueries: slowQueries.length,
      errorRate: Math.round(errorRate * 100) / 100,
      queriesByOperation,
      queriesByCollection,
      timeWindow: timeWindow
    };
  }

  /**
   * Get slow queries
   */
  getSlowQueries(threshold = 1000, limit = 10) {
    return this.queryMetrics
      .filter(m => m.executionTime > threshold)
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, limit);
  }

  /**
   * Get database health status
   */
  async getDatabaseHealth() {
    try {
      const [connectionPool, dbStats, queryMetrics] = await Promise.all([
        this.getConnectionPool(),
        this.getDatabaseStats(),
        Promise.resolve(this.getQueryMetrics())
      ]);

      let status = 'healthy';
      const issues = [];

      // Check connection pool
      if (connectionPool) {
        const connectionUtilization = (connectionPool.activeConnections / connectionPool.maxConnections) * 100;
        if (connectionUtilization > 80) {
          status = 'degraded';
          issues.push('High connection pool utilization');
        }
      }

      // Check query performance
      if (queryMetrics.averageExecutionTime > 500) {
        status = 'degraded';
        issues.push('Slow query performance');
      }

      if (queryMetrics.errorRate > 5) {
        status = 'unhealthy';
        issues.push('High query error rate');
      }

      return {
        status,
        issues,
        metrics: {
          connectionPool,
          databaseStats: dbStats,
          queryMetrics
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to get database health:', error);
      return {
        status: 'unhealthy',
        issues: ['Database health check failed'],
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get database instance (helper method)
   */
  async getDatabase() {
    try {
      // This would typically get the database instance from your connection
      // For now, we'll return null as we're using the existing database utils
      return null;
    } catch (error) {
      console.error('Failed to get database instance:', error);
      return null;
    }
  }

  /**
   * Clear query metrics
   */
  clearMetrics() {
    this.queryMetrics = [];
  }

  /**
   * Get comprehensive database monitoring report
   */
  async getMonitoringReport() {
    try {
      const [health, queryMetrics, slowQueries] = await Promise.all([
        this.getDatabaseHealth(),
        Promise.resolve(this.getQueryMetrics()),
        Promise.resolve(this.getSlowQueries())
      ]);

      return {
        timestamp: new Date().toISOString(),
        health,
        performance: queryMetrics,
        slowQueries,
        recommendations: this.generateRecommendations(health, queryMetrics)
      };
    } catch (error) {
      console.error('Failed to generate monitoring report:', error);
      throw error;
    }
  }

  /**
   * Generate performance recommendations
   */
  generateRecommendations(health, queryMetrics) {
    const recommendations = [];

    if (queryMetrics.averageExecutionTime > 500) {
      recommendations.push('Consider adding database indexes for frequently queried fields');
    }

    if (queryMetrics.slowQueries > 10) {
      recommendations.push('Review and optimize slow queries');
    }

    if (queryMetrics.errorRate > 5) {
      recommendations.push('Investigate and fix database connection issues');
    }

    if (health.metrics?.connectionPool?.activeConnections > 15) {
      recommendations.push('Consider increasing database connection pool size');
    }

    return recommendations;
  }
}

module.exports = RealDatabaseMonitoringService;
