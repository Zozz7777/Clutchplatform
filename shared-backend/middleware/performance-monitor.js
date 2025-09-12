const performanceObserver = require('perf_hooks').PerformanceObserver;
const { performance } = require('perf_hooks');
const { getCollection } = require('../config/database');

// ==================== PERFORMANCE MONITORING MIDDLEWARE ====================

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        avgResponseTime: 0,
        responseTimes: []
      },
      database: {
        queries: 0,
        avgQueryTime: 0,
        slowQueries: [],
        connectionPool: {
          active: 0,
          idle: 0,
          total: 0
        }
      },
      memory: {
        heapUsed: 0,
        heapTotal: 0,
        external: 0,
        rss: 0
      },
      cpu: {
        usage: 0,
        loadAverage: [0, 0, 0]
      },
      errors: {
        total: 0,
        byType: {},
        recent: []
      }
    };
    
    this.startTime = Date.now();
    this.observers = new Map();
    this.setupPerformanceObservers();
    this.startSystemMonitoring();
  }

  // Setup performance observers
  setupPerformanceObservers() {
    // Monitor function calls
    const functionObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.entryType === 'function') {
          this.trackFunctionPerformance(entry);
        }
      });
    });
    functionObserver.observe({ entryTypes: ['function'] });

    // Monitor HTTP requests
    const httpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.entryType === 'measure') {
          this.trackHttpPerformance(entry);
        }
      });
    });
    httpObserver.observe({ entryTypes: ['measure'] });

    this.observers.set('function', functionObserver);
    this.observers.set('http', httpObserver);
  }

  // Start system monitoring
  startSystemMonitoring() {
    // Monitor memory usage every 30 seconds
    setInterval(() => {
      this.updateMemoryMetrics();
    }, 30000);

    // Monitor CPU usage every 60 seconds
    setInterval(() => {
      this.updateCpuMetrics();
    }, 60000);

    // Monitor database connections every 10 seconds
    setInterval(() => {
      this.updateDatabaseMetrics();
    }, 10000);

    // Clean up old metrics every 5 minutes
    setInterval(() => {
      this.cleanupOldMetrics();
    }, 300000);
  }

  // Track function performance
  trackFunctionPerformance(entry) {
    const duration = entry.duration;
    const functionName = entry.name;
    
    if (duration > 100) { // Log slow functions (>100ms)
      console.log(`🐌 Slow function detected: ${functionName} took ${duration.toFixed(2)}ms`);
      
      this.metrics.database.slowQueries.push({
        function: functionName,
        duration,
        timestamp: new Date()
      });
    }
  }

  // Track HTTP performance
  trackHttpPerformance(entry) {
    const duration = entry.duration;
    const endpoint = entry.name;
    
    this.metrics.requests.total++;
    this.metrics.requests.responseTimes.push(duration);
    
    // Keep only last 1000 response times for average calculation
    if (this.metrics.requests.responseTimes.length > 1000) {
      this.metrics.requests.responseTimes.shift();
    }
    
    // Update average response time
    this.metrics.requests.avgResponseTime = 
      this.metrics.requests.responseTimes.reduce((a, b) => a + b, 0) / 
      this.metrics.requests.responseTimes.length;
    
    // Log slow requests (>500ms)
    if (duration > 500) {
      console.log(`🐌 Slow request detected: ${endpoint} took ${duration.toFixed(2)}ms`);
    }
  }

  // Update memory metrics
  updateMemoryMetrics() {
    const memUsage = process.memoryUsage();
    this.metrics.memory = {
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      external: Math.round(memUsage.external / 1024 / 1024), // MB
      rss: Math.round(memUsage.rss / 1024 / 1024) // MB
    };
  }

  // Update CPU metrics
  updateCpuMetrics() {
    const cpuUsage = process.cpuUsage();
    this.metrics.cpu.usage = Math.round((cpuUsage.user + cpuUsage.system) / 1000); // Convert to ms
    
    // Get load average (if available)
    if (process.platform !== 'win32') {
      const os = require('os');
      this.metrics.cpu.loadAverage = os.loadavg();
    }
  }

  // Update database metrics
  async updateDatabaseMetrics() {
    try {
      const { client } = require('../config/database');
      const dbClient = client();
      
      if (dbClient && dbClient.db) {
        const database = dbClient.db();
        if (database && database.admin) {
          const serverStatus = await database.admin().serverStatus();
          this.metrics.database.connectionPool = {
            active: serverStatus.connections?.current || 0,
            idle: serverStatus.connections?.available || 0,
            total: (serverStatus.connections?.current || 0) + (serverStatus.connections?.available || 0)
          };
        } else {
          // Fallback if admin() is not available
          this.metrics.database.connectionPool = {
            active: 0,
            idle: 0,
            total: 0
          };
        }
      } else {
        // Fallback if client is not available
        this.metrics.database.connectionPool = {
          active: 0,
          idle: 0,
          total: 0
        };
      }
    } catch (error) {
      console.error('Error updating database metrics:', error);
      // Set fallback values on error
      this.metrics.database.connectionPool = {
        active: 0,
        idle: 0,
        total: 0
      };
    }
  }

  // Track database query
  trackDatabaseQuery(query, duration) {
    this.metrics.database.queries++;
    
    if (duration > 1000) { // Log slow queries (>1s)
      console.log(`🐌 Slow database query detected: ${query} took ${duration.toFixed(2)}ms`);
      
      this.metrics.database.slowQueries.push({
        query,
        duration,
        timestamp: new Date()
      });
    }
  }

  // Track error
  trackError(error, context = {}) {
    this.metrics.errors.total++;
    
    const errorType = error.constructor.name;
    this.metrics.errors.byType[errorType] = (this.metrics.errors.byType[errorType] || 0) + 1;
    
    this.metrics.errors.recent.push({
      type: errorType,
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date()
    });
    
    // Keep only last 100 errors
    if (this.metrics.errors.recent.length > 100) {
      this.metrics.errors.recent.shift();
    }
  }

  // Clean up old metrics
  cleanupOldMetrics() {
    const now = Date.now();
    const fiveMinutesAgo = now - (5 * 60 * 1000);
    
    // Clean up old slow queries
    this.metrics.database.slowQueries = this.metrics.database.slowQueries.filter(
      query => query.timestamp.getTime() > fiveMinutesAgo
    );
    
    // Clean up old errors
    this.metrics.errors.recent = this.metrics.errors.recent.filter(
      error => error.timestamp.getTime() > fiveMinutesAgo
    );
  }

  // Get performance metrics
  getMetrics() {
    const uptime = Date.now() - this.startTime;
    
    return {
      ...this.metrics,
      system: {
        uptime: Math.round(uptime / 1000), // seconds
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid
      },
      timestamp: new Date().toISOString()
    };
  }

  // Get performance summary
  getSummary() {
    const metrics = this.getMetrics();
    
    return {
      health: this.calculateHealthScore(metrics),
      performance: {
        avgResponseTime: Math.round(metrics.requests.avgResponseTime),
        totalRequests: metrics.requests.total,
        successRate: metrics.requests.total > 0 ? 
          Math.round((metrics.requests.successful / metrics.requests.total) * 100) : 100,
        errorRate: metrics.requests.total > 0 ? 
          Math.round((metrics.requests.failed / metrics.requests.total) * 100) : 0
      },
      resources: {
        memoryUsage: metrics.memory.heapUsed,
        memoryTotal: metrics.memory.heapTotal,
        memoryPercentage: Math.round((metrics.memory.heapUsed / metrics.memory.heapTotal) * 100),
        cpuUsage: metrics.cpu.usage
      },
      database: {
        totalQueries: metrics.database.queries,
        avgQueryTime: Math.round(metrics.database.avgQueryTime),
        slowQueries: metrics.database.slowQueries.length,
        activeConnections: metrics.database.connectionPool.active
      }
    };
  }

  // Calculate health score
  calculateHealthScore(metrics) {
    let score = 100;
    
    // Deduct points for slow response times
    if (metrics.requests.avgResponseTime > 1000) score -= 20;
    else if (metrics.requests.avgResponseTime > 500) score -= 10;
    
    // Deduct points for high error rate
    const errorRate = metrics.requests.total > 0 ? 
      (metrics.requests.failed / metrics.requests.total) * 100 : 0;
    if (errorRate > 10) score -= 30;
    else if (errorRate > 5) score -= 15;
    
    // Deduct points for high memory usage
    const memoryPercentage = (metrics.memory.heapUsed / metrics.memory.heapTotal) * 100;
    if (memoryPercentage > 90) score -= 25;
    else if (memoryPercentage > 80) score -= 15;
    
    // Deduct points for many slow queries
    if (metrics.database.slowQueries.length > 50) score -= 20;
    else if (metrics.database.slowQueries.length > 20) score -= 10;
    
    return Math.max(0, Math.round(score));
  }

  // Start performance measurement
  startMeasurement(name) {
    performance.mark(`${name}-start`);
  }

  // End performance measurement
  endMeasurement(name) {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
  }

  // Middleware for request performance tracking
  requestPerformanceMiddleware() {
    return (req, res, next) => {
      const startTime = Date.now();
      const requestId = `${req.method}-${req.path}-${Date.now()}`;
      
      // Start measurement
      this.startMeasurement(requestId);
      
      // Override res.end to track response time
      const originalEnd = res.end;
      res.end = function(...args) {
        const duration = Date.now() - startTime;
        
        // Track request metrics
        if (res.statusCode >= 200 && res.statusCode < 400) {
          this.metrics.requests.successful++;
        } else {
          this.metrics.requests.failed++;
        }
        
        // End measurement
        this.endMeasurement(requestId);
        
        // Call original end
        originalEnd.apply(res, args);
      }.bind(this);
      
      next();
    };
  }

  // Middleware for database query tracking
  databaseQueryMiddleware() {
    return (req, res, next) => {
      const originalQuery = require('mongodb').Collection.prototype.find;
      
      // Override find method to track queries
      require('mongodb').Collection.prototype.find = function(...args) {
        const startTime = Date.now();
        const query = JSON.stringify(args[0] || {});
        
        const result = originalQuery.apply(this, args);
        
        // Track query performance
        result.then(() => {
          const duration = Date.now() - startTime;
          this.trackDatabaseQuery(query, duration);
        }).catch((error) => {
          const duration = Date.now() - startTime;
          this.trackDatabaseQuery(query, duration);
          this.trackError(error, { query, type: 'database' });
        });
        
        return result;
      }.bind(this);
      
      next();
    };
  }

  // Cleanup observers
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// Create global instance
const performanceMonitor = new PerformanceMonitor();

// Export middleware functions
module.exports = {
  performanceMonitor,
  requestPerformanceMiddleware: () => performanceMonitor.requestPerformanceMiddleware(),
  databaseQueryMiddleware: () => performanceMonitor.databaseQueryMiddleware(),
  trackError: (error, context) => performanceMonitor.trackError(error, context),
  trackDatabaseQuery: (query, duration) => performanceMonitor.trackDatabaseQuery(query, duration),
  getMetrics: () => performanceMonitor.getMetrics(),
  getSummary: () => performanceMonitor.getSummary(),
  startMeasurement: (name) => performanceMonitor.startMeasurement(name),
  endMeasurement: (name) => performanceMonitor.endMeasurement(name)
};
