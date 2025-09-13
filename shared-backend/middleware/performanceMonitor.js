/**
 * Enhanced Performance Monitoring Middleware
 */

const performanceMetrics = {
  requestCount: 0,
  totalResponseTime: 0,
  averageResponseTime: 0,
  slowRequests: 0,
  errorCount: 0,
  memoryUsage: process.memoryUsage(),
  cpuUsage: process.cpuUsage(),
  activeConnections: 0,
  peakMemoryUsage: 0,
  responseTimeHistory: [],
  errorHistory: []
};

const performanceMonitor = (req, res, next) => {
  const startTime = Date.now();
  performanceMetrics.activeConnections++;
  
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    performanceMetrics.activeConnections--;
    
    // Update metrics
    performanceMetrics.requestCount++;
    performanceMetrics.totalResponseTime += responseTime;
    performanceMetrics.averageResponseTime = performanceMetrics.totalResponseTime / performanceMetrics.requestCount;
    
    // Track slow requests
    if (responseTime > 1000) {
      performanceMetrics.slowRequests++;
    }
    
    // Track errors
    if (res.statusCode >= 400) {
      performanceMetrics.errorCount++;
      performanceMetrics.errorHistory.push({
        timestamp: new Date().toISOString(),
        statusCode: res.statusCode,
        path: req.path,
        method: req.method,
        responseTime
      });
    }
    
    // Update memory usage
    const currentMemory = process.memoryUsage();
    performanceMetrics.memoryUsage = currentMemory;
    if (currentMemory.heapUsed > performanceMetrics.peakMemoryUsage) {
      performanceMetrics.peakMemoryUsage = currentMemory.heapUsed;
    }
    
    // Update CPU usage
    performanceMetrics.cpuUsage = process.cpuUsage();
    
    // Keep response time history (last 100 requests)
    performanceMetrics.responseTimeHistory.push(responseTime);
    if (performanceMetrics.responseTimeHistory.length > 100) {
      performanceMetrics.responseTimeHistory.shift();
    }
    
    // Keep error history (last 50 errors)
    if (performanceMetrics.errorHistory.length > 50) {
      performanceMetrics.errorHistory.shift();
    }
  });
  
  next();
};

const getPerformanceMetrics = () => {
  const memoryUsage = process.memoryUsage();
  const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
  
  return {
    ...performanceMetrics,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memoryUsagePercent: Math.round(memoryUsagePercent * 100) / 100,
    requestsPerSecond: performanceMetrics.requestCount / (process.uptime() || 1),
    errorRate: performanceMetrics.requestCount > 0 ? (performanceMetrics.errorCount / performanceMetrics.requestCount) * 100 : 0,
    slowRequestRate: performanceMetrics.requestCount > 0 ? (performanceMetrics.slowRequests / performanceMetrics.requestCount) * 100 : 0
  };
};

const resetMetrics = () => {
  performanceMetrics.requestCount = 0;
  performanceMetrics.totalResponseTime = 0;
  performanceMetrics.averageResponseTime = 0;
  performanceMetrics.slowRequests = 0;
  performanceMetrics.errorCount = 0;
  performanceMetrics.responseTimeHistory = [];
  performanceMetrics.errorHistory = [];
};

module.exports = {
  performanceMonitor,
  getPerformanceMetrics,
  resetMetrics
};