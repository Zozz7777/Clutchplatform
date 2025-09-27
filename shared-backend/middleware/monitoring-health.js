const logger = require('../utils/logger');
const os = require('os');
const fs = require('fs').promises;
const path = require('path');

// Health Check System
class HealthCheckSystem {
  constructor() {
    this.checks = new Map();
    this.metrics = {
      uptime: process.uptime(),
      startTime: new Date().toISOString(),
      totalRequests: 0,
      errorCount: 0,
      averageResponseTime: 0,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    };
    
    this.startMetricsCollection();
  }
  
  // Register a health check
  registerCheck(name, checkFunction, interval = 30000) {
    this.checks.set(name, {
      function: checkFunction,
      interval,
      lastCheck: null,
      status: 'unknown',
      error: null,
      responseTime: 0
    });
    
    // Run initial check
    this.runCheck(name);
    
    // Schedule periodic checks
    setInterval(() => {
      this.runCheck(name);
    }, interval);
  }
  
  // Run a specific health check
  async runCheck(name) {
    const check = this.checks.get(name);
    if (!check) return;
    
    const startTime = Date.now();
    
    try {
      await check.function();
      check.status = 'healthy';
      check.error = null;
      check.responseTime = Date.now() - startTime;
    } catch (error) {
      check.status = 'unhealthy';
      check.error = error.message;
      check.responseTime = Date.now() - startTime;
      logger.error(`Health check failed: ${name}`, error);
    }
    
    check.lastCheck = new Date().toISOString();
  }
  
  // Get overall health status
  getHealthStatus() {
    const checks = Array.from(this.checks.entries()).map(([name, check]) => ({
      name,
      status: check.status,
      lastCheck: check.lastCheck,
      responseTime: check.responseTime,
      error: check.error
    }));
    
    const overallStatus = checks.every(check => check.status === 'healthy') ? 'healthy' : 'unhealthy';
    
    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks,
      metrics: this.metrics
    };
  }
  
  // Start metrics collection
  startMetricsCollection() {
    setInterval(() => {
      this.updateMetrics();
    }, 10000); // Update every 10 seconds
  }
  
  // Update system metrics
  updateMetrics() {
    this.metrics.uptime = process.uptime();
    this.metrics.memoryUsage = process.memoryUsage();
    this.metrics.cpuUsage = process.cpuUsage();
    
    // Calculate system load
    this.metrics.systemLoad = {
      loadAverage: os.loadavg(),
      freeMemory: os.freemem(),
      totalMemory: os.totalmem(),
      cpuCount: os.cpus().length
    };
  }
  
  // Record request metrics
  recordRequest(responseTime, statusCode) {
    this.metrics.totalRequests++;
    
    if (statusCode >= 400) {
      this.metrics.errorCount++;
    }
    
    // Update average response time
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) + responseTime) / 
      this.metrics.totalRequests;
  }
}

// Initialize health check system
const healthSystem = new HealthCheckSystem();

// Database Health Check
const databaseHealthCheck = async () => {
  const db = require('../config/database');
  await db.admin().ping();
};

// Redis Health Check
const redisHealthCheck = async () => {
  const { redisClient } = require('./performance-optimization');
  if (redisClient) {
    await redisClient.ping();
  } else {
    throw new Error('Redis client not available');
  }
};

// File System Health Check
const fileSystemHealthCheck = async () => {
  const tempDir = path.join(__dirname, '../temp');
  await fs.access(tempDir, fs.constants.W_OK);
};

// External API Health Check
const externalApiHealthCheck = async () => {
  const axios = require('axios');
  const response = await axios.get('https://httpbin.org/status/200', { timeout: 5000 });
  if (response.status !== 200) {
    throw new Error('External API check failed');
  }
};

// Register health checks
healthSystem.registerCheck('database', databaseHealthCheck, 30000);
healthSystem.registerCheck('redis', redisHealthCheck, 60000);
healthSystem.registerCheck('filesystem', fileSystemHealthCheck, 60000);
healthSystem.registerCheck('external-api', externalApiHealthCheck, 120000);

// Health Check Middleware
const healthCheckMiddleware = (req, res, next) => {
  if (req.originalUrl === '/health' || req.originalUrl === '/health/status') {
    const healthStatus = healthSystem.getHealthStatus();
    
    res.status(healthStatus.status === 'healthy' ? 200 : 503).json({
      success: true,
      data: healthStatus,
      message: `System is ${healthStatus.status}`,
      timestamp: new Date().toISOString()
    });
  } else {
    next();
  }
};

// Detailed Health Check Endpoint
const detailedHealthCheck = (req, res) => {
  const healthStatus = healthSystem.getHealthStatus();
  
  // Add detailed system information
  const detailedStatus = {
    ...healthStatus,
    system: {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development',
      pid: process.pid,
      uptime: process.uptime()
    },
    performance: {
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      loadAverage: os.loadavg(),
      freeMemory: os.freemem(),
      totalMemory: os.totalmem()
    },
    network: {
      hostname: os.hostname(),
      networkInterfaces: os.networkInterfaces()
    }
  };
  
  res.status(healthStatus.status === 'healthy' ? 200 : 503).json({
    success: true,
    data: detailedStatus,
    message: `Detailed system status: ${healthStatus.status}`,
    timestamp: new Date().toISOString()
  });
};

// Error Tracking System
class ErrorTrackingSystem {
  constructor() {
    this.errors = new Map();
    this.errorCounts = new Map();
    this.maxErrors = 1000; // Keep last 1000 errors
  }
  
  // Track an error
  trackError(error, context = {}) {
    const errorId = this.generateErrorId();
    const errorEntry = {
      id: errorId,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context,
      count: 1
    };
    
    // Store error
    this.errors.set(errorId, errorEntry);
    
    // Update error count
    const errorKey = `${error.name}:${error.message}`;
    this.errorCounts.set(errorKey, (this.errorCounts.get(errorKey) || 0) + 1);
    
    // Clean up old errors
    if (this.errors.size > this.maxErrors) {
      const oldestError = this.errors.keys().next().value;
      this.errors.delete(oldestError);
    }
    
    // Log error
    logger.error('Error tracked:', errorEntry);
    
    return errorId;
  }
  
  // Get error statistics
  getErrorStats() {
    const stats = {
      totalErrors: this.errors.size,
      errorCounts: Object.fromEntries(this.errorCounts),
      recentErrors: Array.from(this.errors.values())
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10)
    };
    
    return stats;
  }
  
  // Generate unique error ID
  generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Initialize error tracking system
const errorTracking = new ErrorTrackingSystem();

// Error Tracking Middleware
const errorTrackingMiddleware = (error, req, res, next) => {
  // Track the error
  const errorId = errorTracking.trackError(error, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.userId
  });
  
  // Add error ID to response
  res.setHeader('X-Error-ID', errorId);
  
  next(error);
};

// Uptime Monitoring
class UptimeMonitoring {
  constructor() {
    this.startTime = Date.now();
    this.restartCount = 0;
    this.lastRestart = null;
  }
  
  // Record application restart
  recordRestart() {
    this.restartCount++;
    this.lastRestart = new Date().toISOString();
    this.startTime = Date.now();
  }
  
  // Get uptime statistics
  getUptimeStats() {
    return {
      startTime: new Date(this.startTime).toISOString(),
      uptime: Date.now() - this.startTime,
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      restartCount: this.restartCount,
      lastRestart: this.lastRestart,
      processUptime: process.uptime()
    };
  }
}

// Initialize uptime monitoring
const uptimeMonitoring = new UptimeMonitoring();

// Alert System
class AlertSystem {
  constructor() {
    this.alerts = new Map();
    this.alertThresholds = {
      errorRate: 0.1, // 10% error rate
      responseTime: 5000, // 5 seconds
      memoryUsage: 0.9, // 90% memory usage
      cpuUsage: 0.8 // 80% CPU usage
    };
  }
  
  // Check for alerts
  checkAlerts(metrics) {
    const alerts = [];
    
    // Check error rate
    if (metrics.errorCount / metrics.totalRequests > this.alertThresholds.errorRate) {
      alerts.push({
        type: 'error_rate',
        severity: 'high',
        message: `High error rate: ${(metrics.errorCount / metrics.totalRequests * 100).toFixed(2)}%`,
        threshold: this.alertThresholds.errorRate,
        current: metrics.errorCount / metrics.totalRequests
      });
    }
    
    // Check response time
    if (metrics.averageResponseTime > this.alertThresholds.responseTime) {
      alerts.push({
        type: 'response_time',
        severity: 'medium',
        message: `High response time: ${metrics.averageResponseTime}ms`,
        threshold: this.alertThresholds.responseTime,
        current: metrics.averageResponseTime
      });
    }
    
    // Check memory usage
    const memoryUsagePercent = metrics.memoryUsage.heapUsed / metrics.memoryUsage.heapTotal;
    if (memoryUsagePercent > this.alertThresholds.memoryUsage) {
      alerts.push({
        type: 'memory_usage',
        severity: 'high',
        message: `High memory usage: ${(memoryUsagePercent * 100).toFixed(2)}%`,
        threshold: this.alertThresholds.memoryUsage,
        current: memoryUsagePercent
      });
    }
    
    return alerts;
  }
  
  // Send alert
  async sendAlert(alert) {
    // Store alert
    this.alerts.set(alert.id || Date.now(), {
      ...alert,
      timestamp: new Date().toISOString()
    });
    
    // Log alert
    logger.alert(`ALERT: ${alert.message}`, alert);
    
    // Send to external monitoring service if configured
    if (process.env.ALERT_WEBHOOK_URL) {
      try {
        const axios = require('axios');
        await axios.post(process.env.ALERT_WEBHOOK_URL, {
          text: `🚨 ${alert.severity.toUpperCase()}: ${alert.message}`,
          attachments: [{
            color: alert.severity === 'high' ? 'danger' : 'warning',
            fields: [
              { title: 'Type', value: alert.type, short: true },
              { title: 'Severity', value: alert.severity, short: true },
              { title: 'Threshold', value: alert.threshold, short: true },
              { title: 'Current', value: alert.current, short: true }
            ]
          }]
        });
      } catch (error) {
        logger.error('Failed to send alert to webhook:', error);
      }
    }
  }
}

// Initialize alert system
const alertSystem = new AlertSystem();

// Monitoring Dashboard Data
const getMonitoringDashboard = (req, res) => {
  const healthStatus = healthSystem.getHealthStatus();
  const errorStats = errorTracking.getErrorStats();
  const uptimeStats = uptimeMonitoring.getUptimeStats();
  const alerts = Array.from(alertSystem.alerts.values());
  
  const dashboard = {
    health: healthStatus,
    errors: errorStats,
    uptime: uptimeStats,
    alerts: alerts.slice(-10), // Last 10 alerts
    system: {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development'
    }
  };
  
  res.json({
    success: true,
    data: dashboard,
    message: 'Monitoring dashboard data retrieved successfully',
    timestamp: new Date().toISOString()
  });
};

// Performance Metrics Endpoint
const getPerformanceMetrics = (req, res) => {
  const metrics = healthSystem.metrics;
  const systemMetrics = {
    memory: {
      used: metrics.memoryUsage.heapUsed,
      total: metrics.memoryUsage.heapTotal,
      external: metrics.memoryUsage.external,
      rss: metrics.memoryUsage.rss
    },
    cpu: {
      user: metrics.cpuUsage.user,
      system: metrics.cpuUsage.system
    },
    system: {
      loadAverage: os.loadavg(),
      freeMemory: os.freemem(),
      totalMemory: os.totalmem(),
      cpuCount: os.cpus().length
    },
    application: {
      uptime: metrics.uptime,
      totalRequests: metrics.totalRequests,
      errorCount: metrics.errorCount,
      averageResponseTime: metrics.averageResponseTime
    }
  };
  
  res.json({
    success: true,
    data: systemMetrics,
    message: 'Performance metrics retrieved successfully',
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  healthCheckMiddleware,
  detailedHealthCheck,
  errorTrackingMiddleware,
  getMonitoringDashboard,
  getPerformanceMetrics,
  healthSystem,
  errorTracking,
  uptimeMonitoring,
  alertSystem
};
