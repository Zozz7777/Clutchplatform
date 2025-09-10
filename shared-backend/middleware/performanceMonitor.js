/**
 * Performance Monitoring Middleware
 * Tracks response times, memory usage, and other performance metrics
 */

const { logger } = require('../config/logger');

// Performance metrics storage
const performanceMetrics = {
  requestCount: 0,
  totalResponseTime: 0,
  averageResponseTime: 0,
  slowestRequests: [],
  memoryUsage: [],
  startTime: Date.now()
};

// Memory usage tracking
const trackMemoryUsage = () => {
  const memUsage = process.memoryUsage();
  performanceMetrics.memoryUsage.push({
    timestamp: Date.now(),
    rss: memUsage.rss,
    heapTotal: memUsage.heapTotal,
    heapUsed: memUsage.heapUsed,
    external: memUsage.external
  });
  
  // Keep only last 100 memory snapshots
  if (performanceMetrics.memoryUsage.length > 100) {
    performanceMetrics.memoryUsage.shift();
  }
};

// Performance monitoring middleware
const performanceMonitor = (req, res, next) => {
  const startTime = Date.now();
  
  // Track memory usage every 10 requests
  if (performanceMetrics.requestCount % 10 === 0) {
    trackMemoryUsage();
  }
  
  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const responseTime = Date.now() - startTime;
    
    // Update metrics
    performanceMetrics.requestCount++;
    performanceMetrics.totalResponseTime += responseTime;
    performanceMetrics.averageResponseTime = performanceMetrics.totalResponseTime / performanceMetrics.requestCount;
    
    // Track slow requests (> 1 second)
    if (responseTime > 1000) {
      performanceMetrics.slowestRequests.push({
        method: req.method,
        url: req.url,
        responseTime,
        timestamp: Date.now(),
        userAgent: req.headers['user-agent']
      });
      
      // Keep only last 50 slow requests
      if (performanceMetrics.slowestRequests.length > 50) {
        performanceMetrics.slowestRequests.shift();
      }
      
      // Log slow requests
      if (logger) {
        logger.warn('Slow request detected', {
          method: req.method,
          url: req.url,
          responseTime,
          userAgent: req.headers['user-agent']
        });
      }
    }
    
    // Add performance headers only if response hasn't been sent
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', `${responseTime}ms`);
      res.setHeader('X-Request-Count', performanceMetrics.requestCount);
    }
    
    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

// Get performance metrics
const getPerformanceMetrics = () => {
  const uptime = Date.now() - performanceMetrics.startTime;
  const currentMemory = process.memoryUsage();
  
  return {
    ...performanceMetrics,
    uptime,
    currentMemory,
    requestsPerSecond: performanceMetrics.requestCount / (uptime / 1000),
    memoryUsage: performanceMetrics.memoryUsage.slice(-10) // Last 10 memory snapshots
  };
};

// Reset performance metrics
const resetPerformanceMetrics = () => {
  performanceMetrics.requestCount = 0;
  performanceMetrics.totalResponseTime = 0;
  performanceMetrics.averageResponseTime = 0;
  performanceMetrics.slowestRequests = [];
  performanceMetrics.memoryUsage = [];
  performanceMetrics.startTime = Date.now();
};

// Log performance summary every 5 minutes
setInterval(() => {
  const metrics = getPerformanceMetrics();
  
  if (logger) {
    logger.info('Performance Summary', {
      requestCount: metrics.requestCount,
      averageResponseTime: Math.round(metrics.averageResponseTime),
      requestsPerSecond: Math.round(metrics.requestsPerSecond * 100) / 100,
      memoryUsage: {
        rss: Math.round(metrics.currentMemory.rss / 1024 / 1024),
        heapUsed: Math.round(metrics.currentMemory.heapUsed / 1024 / 1024),
        heapTotal: Math.round(metrics.currentMemory.heapTotal / 1024 / 1024)
      },
      slowRequests: metrics.slowestRequests.length
    });
  }
}, 5 * 60 * 1000); // 5 minutes

module.exports = {
  performanceMonitor,
  getPerformanceMetrics,
  resetPerformanceMetrics
};
