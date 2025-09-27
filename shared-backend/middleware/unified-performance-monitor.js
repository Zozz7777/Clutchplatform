const logger = require('../utils/logger');
const os = require('os');

/**
 * Unified Performance Monitoring System
 * Consolidates all performance monitoring functionality into a single, efficient system
 */
class UnifiedPerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: new Map(),
      errors: new Map(),
      memory: {
        heapUsed: 0,
        heapTotal: 0,
        external: 0,
        rss: 0
      },
      cpu: {
        user: 0,
        system: 0
      },
      system: {
        loadAverage: [0, 0, 0],
        freeMemory: 0,
        totalMemory: 0,
        cpuCount: 0
      },
      application: {
        uptime: 0,
        totalRequests: 0,
        errorCount: 0,
        averageResponseTime: 0
      }
    };
    
    this.alerts = [];
    this.startTime = Date.now();
    this.startMetricsCollection();
  }
  
  // Start metrics collection
  startMetricsCollection() {
    // Update metrics every 30 seconds
    setInterval(() => {
      this.updateSystemMetrics();
      this.cleanupOldMetrics();
    }, 30000);
    
    // Memory optimization every 5 minutes
    setInterval(() => {
      this.optimizeMemory();
    }, 300000);
  }
  
  // Update system metrics
  updateSystemMetrics() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    this.metrics.memory = {
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      rss: memUsage.rss
    };
    
    this.metrics.cpu = {
      user: cpuUsage.user,
      system: cpuUsage.system
    };
    
    this.metrics.system = {
      loadAverage: os.loadavg(),
      freeMemory: os.freemem(),
      totalMemory: os.totalmem(),
      cpuCount: os.cpus().length
    };
    
    this.metrics.application = {
      uptime: process.uptime(),
      totalRequests: this.metrics.application.totalRequests,
      errorCount: this.metrics.application.errorCount,
      averageResponseTime: this.calculateAverageResponseTime()
    };
  }
  
  // Track request performance
  trackRequest(req, res, next) {
    const startTime = process.hrtime.bigint();
    const requestId = req.requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    req.requestId = requestId;
    
    // Increment total requests
    this.metrics.application.totalRequests++;
    
    res.on('finish', () => {
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
      
      // Store request metrics
      this.metrics.requests.set(requestId, {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        responseTime: duration,
        timestamp: new Date().toISOString(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage()
      });
      
      // Log performance metrics
      logger.info('Request Performance', {
        requestId,
        endpoint: req.path,
        method: req.method,
        duration: `${duration.toFixed(2)}ms`,
        statusCode: res.statusCode,
        timestamp: new Date().toISOString()
      });
      
      // Alert on performance issues
      if (duration > 10000) { // 10 seconds
        this.addAlert('performance', 'critical', `Very slow request: ${duration.toFixed(2)}ms`, {
          requestId,
          endpoint: req.path,
          duration
        });
      } else if (duration > 5000) { // 5 seconds
        this.addAlert('performance', 'high', `Slow request: ${duration.toFixed(2)}ms`, {
          requestId,
          endpoint: req.path,
          duration
        });
      }
      
      // Track errors
      if (res.statusCode >= 400) {
        this.metrics.application.errorCount++;
        this.metrics.errors.set(requestId, {
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          responseTime: duration,
          timestamp: new Date().toISOString()
        });
      }
    });
    
    next();
  }
  
  // Track errors
  trackError(error, context = {}) {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.metrics.errors.set(errorId, {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context
    });
    
    this.metrics.application.errorCount++;
    
    logger.error('Error Tracked', {
      errorId,
      message: error.message,
      context,
      timestamp: new Date().toISOString()
    });
    
    return errorId;
  }
  
  // Add alert
  addAlert(type, severity, message, context = {}) {
    const alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      message,
      context,
      timestamp: new Date().toISOString(),
      resolved: false
    };
    
    this.alerts.push(alert);
    
    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
    
    logger.warn(`🚨 ${severity.toUpperCase()} ALERT [${type}]: ${message}`, {
      alertId: alert.id,
      context,
      timestamp: alert.timestamp
    });
    
    return alert.id;
  }
  
  // Calculate average response time
  calculateAverageResponseTime() {
    if (this.metrics.requests.size === 0) return 0;
    
    let totalTime = 0;
    let count = 0;
    
    for (const [_, request] of this.metrics.requests) {
      totalTime += request.responseTime;
      count++;
    }
    
    return count > 0 ? totalTime / count : 0;
  }
  
  // Clean up old metrics
  cleanupOldMetrics() {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    // Clean up old requests
    for (const [id, request] of this.metrics.requests) {
      if (new Date(request.timestamp).getTime() < oneHourAgo) {
        this.metrics.requests.delete(id);
      }
    }
    
    // Clean up old errors
    for (const [id, error] of this.metrics.errors) {
      if (new Date(error.timestamp).getTime() < oneHourAgo) {
        this.metrics.errors.delete(id);
      }
    }
    
    // Clean up old alerts
    this.alerts = this.alerts.filter(alert => 
      new Date(alert.timestamp).getTime() > oneHourAgo
    );
  }
  
  // Optimize memory
  optimizeMemory() {
    const memUsage = process.memoryUsage();
    const heapUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    
    if (heapUsagePercent > 80) {
      logger.warn(`High memory usage: ${heapUsagePercent.toFixed(1)}%`);
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
        logger.info('Forced garbage collection');
      }
      
      // Clear old metrics
      this.cleanupOldMetrics();
      
      this.addAlert('memory', 'high', `High memory usage: ${heapUsagePercent.toFixed(1)}%`, {
        heapUsagePercent,
        memoryUsage: memUsage
      });
    }
  }
  
  // Get performance metrics
  getMetrics() {
    return {
      ...this.metrics,
      requests: Array.from(this.metrics.requests.values()),
      errors: Array.from(this.metrics.errors.values()),
      alerts: this.alerts
    };
  }
  
  // Get health status
  getHealthStatus() {
    const memUsage = process.memoryUsage();
    const heapUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    const avgResponseTime = this.calculateAverageResponseTime();
    const errorRate = this.metrics.application.totalRequests > 0 ? 
      (this.metrics.application.errorCount / this.metrics.application.totalRequests) * 100 : 0;
    
    let status = 'healthy';
    let issues = [];
    
    if (heapUsagePercent > 90) {
      status = 'critical';
      issues.push('Critical memory usage');
    } else if (heapUsagePercent > 80) {
      status = 'warning';
      issues.push('High memory usage');
    }
    
    if (avgResponseTime > 5000) {
      status = status === 'healthy' ? 'warning' : status;
      issues.push('Slow response times');
    }
    
    if (errorRate > 10) {
      status = status === 'healthy' ? 'warning' : status;
      issues.push('High error rate');
    }
    
    return {
      status,
      issues,
      metrics: {
        memoryUsage: heapUsagePercent,
        averageResponseTime: avgResponseTime,
        errorRate: errorRate,
        uptime: process.uptime(),
        totalRequests: this.metrics.application.totalRequests,
        errorCount: this.metrics.application.errorCount
      },
      timestamp: new Date().toISOString()
    };
  }
}

// Create singleton instance
const performanceMonitor = new UnifiedPerformanceMonitor();

// Middleware function
const performanceMiddleware = (req, res, next) => {
  performanceMonitor.trackRequest(req, res, next);
};

// Error tracking middleware
const errorTrackingMiddleware = (err, req, res, next) => {
  performanceMonitor.trackError(err, {
    endpoint: req.path,
    method: req.method,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });
  
  next(err);
};

module.exports = {
  performanceMonitor,
  performanceMiddleware,
  errorTrackingMiddleware,
  getPerformanceMetrics: () => performanceMonitor.getMetrics(),
  getHealthStatus: () => performanceMonitor.getHealthStatus(),
  addAlert: (type, severity, message, context) => performanceMonitor.addAlert(type, severity, message, context),
  trackError: (error, context) => performanceMonitor.trackError(error, context)
};
