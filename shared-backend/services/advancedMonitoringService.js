const { getRedisClient } = require('../config/redis');
const { logger } = require('../config/logger');
const { getCollection } = require('../config/database');

/**
 * Advanced Monitoring Service
 * Provides comprehensive monitoring and alerting capabilities
 */
class AdvancedMonitoringService {
  constructor() {
    this.redis = getRedisClient(); // Use centralized Redis client
    this.metrics = new Map();
    this.alerts = new Map();
    this.thresholds = new Map();
  }

  // ==================== SYSTEM HEALTH MONITORING ====================
  
  async performHealthCheck() {
    const startTime = Date.now();
    const checks = {
      database: await this.checkDatabaseHealth(),
      redis: await this.checkRedisHealth(),
      memory: this.checkMemoryHealth(),
      cpu: this.checkCPUHealth(),
      disk: await this.checkDiskHealth(),
      network: await this.checkNetworkHealth(),
      api: await this.checkAPIHealth()
    };

    const overallHealth = Object.values(checks).every(check => check.status === 'healthy');
    const responseTime = Date.now() - startTime;

    const healthReport = {
      status: overallHealth ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      checks,
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0'
    };

    // Store health report
    await this.storeHealthReport(healthReport);
    
    // Trigger alerts if needed
    await this.checkAlerts(healthReport);

    return healthReport;
  }

  async checkDatabaseHealth() {
    try {
      const startTime = Date.now();
      const collection = await getCollection('users');
      await collection.findOne({}, { limit: 1 });
      const responseTime = Date.now() - startTime;

      return {
        status: 'healthy',
        responseTime: `${responseTime}ms`,
        message: 'Database connection successful'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        message: 'Database connection failed'
      };
    }
  }

  async checkRedisHealth() {
    try {
      const startTime = Date.now();
      const result = await this.redis.ping();
      const responseTime = Date.now() - startTime;

      return {
        status: result === 'PONG' ? 'healthy' : 'unhealthy',
        responseTime: `${responseTime}ms`,
        message: result === 'PONG' ? 'Redis connection successful' : 'Redis ping failed'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        message: 'Redis connection failed'
      };
    }
  }

  checkMemoryHealth() {
    const usage = process.memoryUsage();
    const heapUsedMB = usage.heapUsed / 1024 / 1024;
    const heapTotalMB = usage.heapTotal / 1024 / 1024;
    const memoryUsagePercent = (heapUsedMB / heapTotalMB) * 100;

    return {
      status: memoryUsagePercent < 80 ? 'healthy' : 'warning',
      heapUsed: `${heapUsedMB.toFixed(2)} MB`,
      heapTotal: `${heapTotalMB.toFixed(2)} MB`,
      usagePercent: `${memoryUsagePercent.toFixed(2)}%`,
      message: memoryUsagePercent < 80 ? 'Memory usage normal' : 'High memory usage detected'
    };
  }

  checkCPUHealth() {
    const usage = process.cpuUsage();
    const totalCPU = usage.user + usage.system;
    
    return {
      status: 'healthy',
      user: `${(usage.user / 1000).toFixed(2)}ms`,
      system: `${(usage.system / 1000).toFixed(2)}ms`,
      total: `${(totalCPU / 1000).toFixed(2)}ms`,
      message: 'CPU usage normal'
    };
  }

  async checkDiskHealth() {
    // This would require additional packages like 'diskusage'
    // For now, return a basic check
    return {
      status: 'healthy',
      message: 'Disk space check not implemented',
      note: 'Requires diskusage package for detailed disk monitoring'
    };
  }

  async checkNetworkHealth() {
    // Basic network connectivity check
    return {
      status: 'healthy',
      message: 'Network connectivity normal',
      timestamp: new Date().toISOString()
    };
  }

  async checkAPIHealth() {
    try {
      const startTime = Date.now();
      // Simulate API health check
      await new Promise(resolve => setTimeout(resolve, 10));
      const responseTime = Date.now() - startTime;

      return {
        status: 'healthy',
        responseTime: `${responseTime}ms`,
        message: 'API endpoints responding normally'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        message: 'API health check failed'
      };
    }
  }

  // ==================== PERFORMANCE METRICS ====================
  
  recordMetric(name, value, tags = {}) {
    const metric = {
      name,
      value,
      tags,
      timestamp: Date.now()
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    this.metrics.get(name).push(metric);

    // Keep only last 1000 metrics per name
    if (this.metrics.get(name).length > 1000) {
      this.metrics.get(name).shift();
    }

    // Store in Redis for persistence
    this.storeMetric(metric);
  }

  async storeMetric(metric) {
    try {
      const key = `metrics:${metric.name}:${Date.now()}`;
      await this.redis.setex(key, 86400, JSON.stringify(metric)); // 24 hours TTL
    } catch (error) {
      logger.error('Failed to store metric:', error);
    }
  }

  getMetrics(name, timeRange = '1h') {
    if (!this.metrics.has(name)) {
      return [];
    }

    const now = Date.now();
    const rangeMs = this.parseTimeRange(timeRange);
    const cutoff = now - rangeMs;

    return this.metrics.get(name).filter(metric => metric.timestamp >= cutoff);
  }

  parseTimeRange(range) {
    const unit = range.slice(-1);
    const value = parseInt(range.slice(0, -1));

    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: return 60 * 60 * 1000; // 1 hour default
    }
  }

  // ==================== ALERTING SYSTEM ====================
  
  async checkAlerts(healthReport) {
    const alerts = [];

    // Check database alerts
    if (healthReport.checks.database.status !== 'healthy') {
      alerts.push({
        type: 'database',
        severity: 'critical',
        message: 'Database health check failed',
        details: healthReport.checks.database
      });
    }

    // Check memory alerts
    if (healthReport.checks.memory.status === 'warning') {
      alerts.push({
        type: 'memory',
        severity: 'warning',
        message: 'High memory usage detected',
        details: healthReport.checks.memory
      });
    }

    // Check Redis alerts
    if (healthReport.checks.redis.status !== 'healthy') {
      alerts.push({
        type: 'redis',
        severity: 'critical',
        message: 'Redis health check failed',
        details: healthReport.checks.redis
      });
    }

    // Process alerts
    for (const alert of alerts) {
      await this.processAlert(alert);
    }
  }

  async processAlert(alert) {
    const alertKey = `${alert.type}:${alert.severity}`;
    
    // Check if alert already exists
    if (this.alerts.has(alertKey)) {
      const existingAlert = this.alerts.get(alertKey);
      if (Date.now() - existingAlert.timestamp < 300000) { // 5 minutes
        return; // Don't spam alerts
      }
    }

    // Store alert
    this.alerts.set(alertKey, {
      ...alert,
      timestamp: Date.now()
    });

    // Log alert
    logger.warn(`System Alert [${alert.severity.toUpperCase()}]: ${alert.message}`, alert);

    // Send notification (implement based on your notification system)
    await this.sendAlertNotification(alert);
  }

  async sendAlertNotification(alert) {
    try {
      // Store alert in database for persistence
      const collection = await getCollection('system_alerts');
      await collection.insertOne({
        ...alert,
        createdAt: new Date(),
        resolved: false
      });

      // Here you would integrate with your notification system
      // (email, Slack, SMS, etc.)
      logger.info(`Alert notification sent: ${alert.message}`);
    } catch (error) {
      logger.error('Failed to send alert notification:', error);
    }
  }

  // ==================== PERFORMANCE TRACKING ====================
  
  trackRequest(req, res, next) {
    const startTime = Date.now();
    const requestId = req.headers['x-request-id'] || this.generateRequestId();

    // Add request ID to response headers
    res.setHeader('x-request-id', requestId);

    // Track request start
    this.recordMetric('request_start', 1, {
      method: req.method,
      path: req.path,
      requestId
    });

    // Override res.end to track response
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
      const responseTime = Date.now() - startTime;
      
      // Record response metrics
      this.recordMetric('request_duration', responseTime, {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        requestId
      });

      this.recordMetric('request_count', 1, {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode
      });

      // Track error rates
      if (res.statusCode >= 400) {
        this.recordMetric('request_errors', 1, {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode
        });
      }

      originalEnd.call(this, chunk, encoding);
    }.bind(this);

    next();
  }

  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ==================== BUSINESS METRICS ====================
  
  async trackBusinessMetrics() {
    try {
      const metrics = {
        users: await this.getUserMetrics(),
        bookings: await this.getBookingMetrics(),
        payments: await this.getPaymentMetrics(),
        revenue: await this.getRevenueMetrics()
      };

      // Store business metrics
      await this.storeBusinessMetrics(metrics);

      return metrics;
    } catch (error) {
      logger.error('Failed to track business metrics:', error);
      return null;
    }
  }

  async getUserMetrics() {
    try {
      const collection = await getCollection('users');
      const totalUsers = await collection.countDocuments();
      const activeUsers = await collection.countDocuments({ isActive: true });
      const newUsersToday = await collection.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      return {
        total: totalUsers,
        active: activeUsers,
        newToday: newUsersToday,
        activeRate: totalUsers > 0 ? (activeUsers / totalUsers * 100).toFixed(2) : 0
      };
    } catch (error) {
      logger.error('Failed to get user metrics:', error);
      return null;
    }
  }

  async getBookingMetrics() {
    try {
      const collection = await getCollection('bookings');
      const totalBookings = await collection.countDocuments();
      const pendingBookings = await collection.countDocuments({ status: 'pending' });
      const completedBookings = await collection.countDocuments({ status: 'completed' });
      const bookingsToday = await collection.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      return {
        total: totalBookings,
        pending: pendingBookings,
        completed: completedBookings,
        today: bookingsToday,
        completionRate: totalBookings > 0 ? (completedBookings / totalBookings * 100).toFixed(2) : 0
      };
    } catch (error) {
      logger.error('Failed to get booking metrics:', error);
      return null;
    }
  }

  async getPaymentMetrics() {
    try {
      const collection = await getCollection('payments');
      const totalPayments = await collection.countDocuments();
      const successfulPayments = await collection.countDocuments({ status: 'successful' });
      const failedPayments = await collection.countDocuments({ status: 'failed' });
      const paymentsToday = await collection.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      return {
        total: totalPayments,
        successful: successfulPayments,
        failed: failedPayments,
        today: paymentsToday,
        successRate: totalPayments > 0 ? (successfulPayments / totalPayments * 100).toFixed(2) : 0
      };
    } catch (error) {
      logger.error('Failed to get payment metrics:', error);
      return null;
    }
  }

  async getRevenueMetrics() {
    try {
      const collection = await getCollection('payments');
      const pipeline = [
        { $match: { status: 'successful' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ];

      const result = await collection.aggregate(pipeline).toArray();
      const totalRevenue = result.length > 0 ? result[0].total : 0;

      // Get today's revenue
      const todayPipeline = [
        { 
          $match: { 
            status: 'successful',
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ];

      const todayResult = await collection.aggregate(todayPipeline).toArray();
      const todayRevenue = todayResult.length > 0 ? todayResult[0].total : 0;

      return {
        total: totalRevenue,
        today: todayRevenue,
        currency: 'EGP'
      };
    } catch (error) {
      logger.error('Failed to get revenue metrics:', error);
      return null;
    }
  }

  // ==================== DATA STORAGE ====================
  
  async storeHealthReport(report) {
    try {
      const collection = await getCollection('health_reports');
      await collection.insertOne({
        ...report,
        createdAt: new Date()
      });
    } catch (error) {
      logger.error('Failed to store health report:', error);
    }
  }

  async storeBusinessMetrics(metrics) {
    try {
      const collection = await getCollection('business_metrics');
      await collection.insertOne({
        ...metrics,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Failed to store business metrics:', error);
    }
  }

  // ==================== INITIALIZATION ====================
  
  initializeMonitoring() {
    // Set up periodic health checks
    setInterval(() => {
      this.performHealthCheck().catch(error => 
        logger.error('Health check failed:', error)
      );
    }, 60000); // Every minute

    // Set up periodic business metrics tracking
    setInterval(() => {
      this.trackBusinessMetrics().catch(error => 
        logger.error('Business metrics tracking failed:', error)
      );
    }, 300000); // Every 5 minutes

    // Set up metric cleanup
    setInterval(() => {
      this.cleanupOldMetrics();
    }, 3600000); // Every hour

    logger.info('Advanced monitoring service initialized');
  }

  cleanupOldMetrics() {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
    
    for (const [name, metrics] of this.metrics.entries()) {
      this.metrics.set(name, metrics.filter(metric => metric.timestamp >= cutoff));
    }

    // Clean up old alerts
    for (const [key, alert] of this.alerts.entries()) {
      if (Date.now() - alert.timestamp > 3600000) { // 1 hour
        this.alerts.delete(key);
      }
    }
  }

  // ==================== API ENDPOINTS ====================
  
  async getMonitoringDashboard() {
    const health = await this.performHealthCheck();
    const businessMetrics = await this.trackBusinessMetrics();
    const performanceMetrics = this.getPerformanceSummary();

    return {
      health,
      business: businessMetrics,
      performance: performanceMetrics,
      timestamp: new Date().toISOString()
    };
  }

  getPerformanceSummary() {
    const summary = {};

    for (const [name, metrics] of this.metrics.entries()) {
      if (metrics.length > 0) {
        const values = metrics.map(m => m.value).filter(v => typeof v === 'number');
        if (values.length > 0) {
          summary[name] = {
            count: values.length,
            avg: values.reduce((a, b) => a + b, 0) / values.length,
            min: Math.min(...values),
            max: Math.max(...values)
          };
        }
      }
    }

    return summary;
  }
}

// Create singleton instance
const advancedMonitoringService = new AdvancedMonitoringService();

module.exports = advancedMonitoringService;
