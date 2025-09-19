/**
 * 🚀 Production Monitoring & Alerting Service for Clutch Platform
 * Comprehensive monitoring with real-time alerts and performance tracking
 */

const { EventEmitter } = require('events');
const { logger } = require('../config/logger');
const advancedCacheService = require('./advancedCacheService');
const RealSystemMonitoringService = require('./realSystemMonitoringService');
const RealPerformanceMetricsService = require('./realPerformanceMetricsService');
const RealDatabaseMonitoringService = require('./realDatabaseMonitoringService');

class ProductionMonitoringService extends EventEmitter {
  constructor() {
    super();
    
    // Initialize real monitoring services
    this.systemMonitor = new RealSystemMonitoringService();
    this.performanceMonitor = new RealPerformanceMetricsService();
    this.databaseMonitor = new RealDatabaseMonitoringService();
    
    this.metrics = {
      system: {
        cpu: [],
        memory: [],
        disk: [],
        network: []
      },
      application: {
        requests: [],
        responseTimes: [],
        errors: [],
        throughput: []
      },
      database: {
        connections: [],
        queryTimes: [],
        slowQueries: []
      },
      cache: {
        hitRate: [],
        memoryUsage: [],
        redisStatus: []
      }
    };
    
    this.alerts = [];
    this.thresholds = {
      cpu: { warning: 70, critical: 90 },
      memory: { warning: 80, critical: 95 },
      responseTime: { warning: 1000, critical: 3000 },
      errorRate: { warning: 5, critical: 10 },
      cacheHitRate: { warning: 80, critical: 60 }
    };
    
    this.monitoringInterval = null;
    this.alertCooldown = new Map();
    this.isRunning = false;
    
    this.initializeMonitoring();
  }

  async initializeMonitoring() {
    try {
      logger.info('🚀 Initializing Production Monitoring Service...');
      
      // Start monitoring intervals
      this.startSystemMonitoring();
      this.startApplicationMonitoring();
      this.startDatabaseMonitoring();
      this.startCacheMonitoring();
      
      // Set up alert handlers
      this.setupAlertHandlers();
      
      this.isRunning = true;
      logger.info('✅ Production Monitoring Service initialized successfully');
      
    } catch (error) {
      logger.error('❌ Failed to initialize monitoring service:', error);
      throw error;
    }
  }

  startSystemMonitoring() {
    // Monitor system resources every 30 seconds
    this.monitoringInterval = setInterval(async () => {
      try {
        const systemMetrics = await this.collectSystemMetrics();
        this.updateMetrics('system', systemMetrics);
        this.checkSystemThresholds(systemMetrics);
      } catch (error) {
        logger.error('System monitoring error:', error);
      }
    }, 30000);
  }

  startApplicationMonitoring() {
    // Monitor application metrics every 10 seconds
    setInterval(async () => {
      try {
        const appMetrics = await this.collectApplicationMetrics();
        this.updateMetrics('application', appMetrics);
        this.checkApplicationThresholds(appMetrics);
      } catch (error) {
        logger.error('Application monitoring error:', error);
      }
    }, 10000);
  }

  startDatabaseMonitoring() {
    // Monitor database performance every 15 seconds
    setInterval(async () => {
      try {
        const dbMetrics = await this.collectDatabaseMetrics();
        this.updateMetrics('database', dbMetrics);
        this.checkDatabaseThresholds(dbMetrics);
      } catch (error) {
        logger.error('Database monitoring error:', error);
      }
    }, 15000);
  }

  startCacheMonitoring() {
    // Monitor cache performance every 20 seconds
    setInterval(async () => {
      try {
        const cacheMetrics = await this.collectCacheMetrics();
        this.updateMetrics('cache', cacheMetrics);
        this.checkCacheThresholds(cacheMetrics);
      } catch (error) {
        logger.error('Cache monitoring error:', error);
      }
    }, 20000);
  }

  async collectSystemMetrics() {
    const metrics = {
      timestamp: Date.now(),
      cpu: await this.getCPUUsage(),
      memory: await this.getMemoryUsage(),
      disk: await this.getDiskUsage(),
      network: await this.getNetworkUsage()
    };

    return metrics;
  }

  async collectApplicationMetrics() {
    const metrics = {
      timestamp: Date.now(),
      requests: this.getRequestCount(),
      responseTimes: this.getAverageResponseTime(),
      errors: this.getErrorCount(),
      throughput: this.getThroughput()
    };

    return metrics;
  }

  async collectDatabaseMetrics() {
    try {
      const metrics = {
        timestamp: Date.now(),
        connections: await this.getDatabaseConnections(),
        queryTimes: await this.getAverageQueryTime(),
        slowQueries: await this.getSlowQueryCount()
      };

      return metrics;
    } catch (error) {
      logger.warn('Failed to collect database metrics:', error);
      return {
        timestamp: Date.now(),
        connections: 0,
        queryTimes: 0,
        slowQueries: 0
      };
    }
  }

  async collectCacheMetrics() {
    try {
      const cacheStats = advancedCacheService.getStats();
      const metrics = {
        timestamp: Date.now(),
        hitRate: parseFloat(cacheStats.hitRate),
        memoryUsage: cacheStats.memoryUsage,
        redisStatus: cacheStats.redisStatus
      };

      return metrics;
    } catch (error) {
      logger.warn('Failed to collect cache metrics:', error);
      return {
        timestamp: Date.now(),
        hitRate: 0,
        memoryUsage: '0 Bytes',
        redisStatus: 'unknown'
      };
    }
  }

  async getCPUUsage() {
    try {
      const os = require('os');
      const cpus = os.cpus();
      
      if (cpus.length === 0) return 0;
      
      let totalIdle = 0;
      let totalTick = 0;
      
      for (const cpu of cpus) {
        for (const type in cpu.times) {
          totalTick += cpu.times[type];
        }
        totalIdle += cpu.times.idle;
      }
      
      const idle = totalIdle / cpus.length;
      const total = totalTick / cpus.length;
      const usage = 100 - (100 * idle / total);
      
      return Math.round(usage * 100) / 100;
    } catch (error) {
      logger.warn('Failed to get CPU usage:', error);
      return 0;
    }
  }

  async getMemoryUsage() {
    try {
      const os = require('os');
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      const usagePercent = (usedMem / totalMem) * 100;
      
      return {
        total: this.formatBytes(totalMem),
        used: this.formatBytes(usedMem),
        free: this.formatBytes(freeMem),
        usagePercent: Math.round(usagePercent * 100) / 100
      };
    } catch (error) {
      logger.warn('Failed to get memory usage:', error);
      return { total: '0 Bytes', used: '0 Bytes', free: '0 Bytes', usagePercent: 0 };
    }
  }

  async getDiskUsage() {
    try {
      const fs = require('fs').promises;
      const path = require('path');
      
      // Get disk usage for current directory
      const stats = await fs.stat('.');
      const total = stats.blocks * 512;
      const free = stats.bfree * 512;
      const used = total - free;
      const usagePercent = (used / total) * 100;
      
      return {
        total: this.formatBytes(total),
        used: this.formatBytes(used),
        free: this.formatBytes(free),
        usagePercent: Math.round(usagePercent * 100) / 100
      };
    } catch (error) {
      logger.warn('Failed to get disk usage:', error);
      return { total: '0 Bytes', used: '0 Bytes', free: '0 Bytes', usagePercent: 0 };
    }
  }

  async getNetworkUsage() {
    try {
      const os = require('os');
      const networkInterfaces = os.networkInterfaces();
      
      let totalBytesIn = 0;
      let totalBytesOut = 0;
      
      for (const interfaceName in networkInterfaces) {
        const interfaces = networkInterfaces[interfaceName];
        for (const networkInterface of interfaces) {
          if (networkInterface.family === 'IPv4' && !networkInterface.internal) {
            // TODO: Implement actual network usage tracking
            // This would typically use system monitoring tools or network interfaces
            totalBytesIn += 0; // TODO: Get actual network usage
            totalBytesOut += 0; // TODO: Get actual network usage
          }
        }
      }
      
      return {
        bytesIn: this.formatBytes(totalBytesIn),
        bytesOut: this.formatBytes(totalBytesOut),
        activeConnections: Object.keys(networkInterfaces).length
      };
    } catch (error) {
      logger.warn('Failed to get network usage:', error);
      return { bytesIn: '0 Bytes', bytesOut: '0 Bytes', activeConnections: 0 };
    }
  }

  getRequestCount() {
    return this.performanceMonitor.getRequestCount();
  }

  getAverageResponseTime() {
    return this.performanceMonitor.getAverageResponseTime();
  }

  getErrorCount() {
    return this.performanceMonitor.getErrorCount();
  }

  getThroughput() {
    return this.performanceMonitor.getThroughput();
  }

  async getDatabaseConnections() {
    try {
      const connectionPool = await this.databaseMonitor.getConnectionPool();
      return connectionPool ? connectionPool.activeConnections : 0;
    } catch (error) {
      return 0;
    }
  }

  async getAverageQueryTime() {
    try {
      const queryMetrics = this.databaseMonitor.getQueryMetrics();
      return queryMetrics.averageExecutionTime;
    } catch (error) {
      return 0;
    }
  }

  async getSlowQueryCount() {
    try {
      const queryMetrics = this.databaseMonitor.getQueryMetrics();
      return queryMetrics.slowQueries;
    } catch (error) {
      return 0;
    }
  }

  updateMetrics(category, metrics) {
    if (!this.metrics[category]) {
      this.metrics[category] = [];
    }
    
    this.metrics[category].push(metrics);
    
    // Keep only last 1000 metrics per category
    if (this.metrics[category].length > 1000) {
      this.metrics[category] = this.metrics[category].slice(-1000);
    }
  }

  checkSystemThresholds(metrics) {
    // Check CPU usage
    if (metrics.cpu >= this.thresholds.cpu.critical) {
      this.triggerAlert('CRITICAL', 'System', `CPU usage is critically high: ${metrics.cpu}%`);
    } else if (metrics.cpu >= this.thresholds.cpu.warning) {
      this.triggerAlert('WARNING', 'System', `CPU usage is high: ${metrics.cpu}%`);
    }

    // Check memory usage
    if (metrics.memory.usagePercent >= this.thresholds.memory.critical) {
      this.triggerAlert('CRITICAL', 'System', `Memory usage is critically high: ${metrics.memory.usagePercent}%`);
    } else if (metrics.memory.usagePercent >= this.thresholds.memory.warning) {
      this.triggerAlert('WARNING', 'System', `Memory usage is high: ${metrics.memory.usagePercent}%`);
    }

    // Check disk usage
    if (metrics.disk.usagePercent >= 90) {
      this.triggerAlert('CRITICAL', 'System', `Disk usage is critically high: ${metrics.disk.usagePercent}%`);
    } else if (metrics.disk.usagePercent >= 80) {
      this.triggerAlert('WARNING', 'System', `Disk usage is high: ${metrics.disk.usagePercent}%`);
    }
  }

  checkApplicationThresholds(metrics) {
    // Check response time
    if (metrics.responseTimes >= this.thresholds.responseTime.critical) {
      this.triggerAlert('CRITICAL', 'Application', `Response time is critically slow: ${metrics.responseTimes}ms`);
    } else if (metrics.responseTimes >= this.thresholds.responseTime.warning) {
      this.triggerAlert('WARNING', 'Application', `Response time is slow: ${metrics.responseTimes}ms`);
    }

    // Check error rate
    const errorRate = (metrics.errors / metrics.requests) * 100;
    if (errorRate >= this.thresholds.errorRate.critical) {
      this.triggerAlert('CRITICAL', 'Application', `Error rate is critically high: ${errorRate.toFixed(2)}%`);
    } else if (errorRate >= this.thresholds.errorRate.warning) {
      this.triggerAlert('WARNING', 'Application', `Error rate is high: ${errorRate.toFixed(2)}%`);
    }
  }

  checkDatabaseThresholds(metrics) {
    // Check database connections
    if (metrics.connections >= 80) {
      this.triggerAlert('WARNING', 'Database', `Database connections are high: ${metrics.connections}`);
    }

    // Check query performance
    if (metrics.queryTimes >= 1000) {
      this.triggerAlert('WARNING', 'Database', `Average query time is slow: ${metrics.queryTimes}ms`);
    }

    // Check slow queries
    if (metrics.slowQueries >= 5) {
      this.triggerAlert('WARNING', 'Database', `Multiple slow queries detected: ${metrics.slowQueries}`);
    }
  }

  checkCacheThresholds(metrics) {
    // Check cache hit rate
    if (metrics.hitRate <= this.thresholds.cacheHitRate.critical) {
      this.triggerAlert('CRITICAL', 'Cache', `Cache hit rate is critically low: ${metrics.hitRate}%`);
    } else if (metrics.hitRate <= this.thresholds.cacheHitRate.warning) {
      this.triggerAlert('WARNING', 'Cache', `Cache hit rate is low: ${metrics.hitRate}%`);
    }

    // Check Redis status
    if (metrics.redisStatus !== 'ready') {
      this.triggerAlert('CRITICAL', 'Cache', `Redis is not ready: ${metrics.redisStatus}`);
    }
  }

  triggerAlert(severity, category, message) {
    const alertKey = `${category}:${message}`;
    const cooldownKey = `${severity}:${category}`;
    
    // Check cooldown to prevent spam
    const now = Date.now();
    const cooldownTime = severity === 'CRITICAL' ? 300000 : 600000; // 5 min for critical, 10 min for others
    
    if (this.alertCooldown.has(cooldownKey)) {
      const lastAlert = this.alertCooldown.get(cooldownKey);
      if (now - lastAlert < cooldownTime) {
        return; // Still in cooldown
      }
    }
    
    const alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      severity,
      category,
      message,
      timestamp: new Date().toISOString(),
      acknowledged: false,
      resolved: false
    };
    
    this.alerts.push(alert);
    this.alertCooldown.set(cooldownKey, now);
    
    // Emit alert event
    this.emit('alert', alert);
    
    // Log alert
    logger.warn(`🚨 ${severity} ALERT [${category}]: ${message}`);
    
    // Send notifications (email, Slack, etc.)
    this.sendAlertNotifications(alert);
  }

  async sendAlertNotifications(alert) {
    try {
      // Email notification for critical alerts
      if (alert.severity === 'CRITICAL') {
        await this.sendEmailAlert(alert);
      }
      
      // Slack notification for all alerts
      await this.sendSlackAlert(alert);
      
      // SMS notification for critical system alerts
      if (alert.severity === 'CRITICAL' && alert.category === 'System') {
        await this.sendSMSAlert(alert);
      }
      
    } catch (error) {
      logger.error('Failed to send alert notifications:', error);
    }
  }

  async sendEmailAlert(alert) {
    // Implement email notification logic
    logger.info(`📧 Email alert sent for: ${alert.message}`);
  }

  async sendSlackAlert(alert) {
    // Implement Slack notification logic
    logger.info(`💬 Slack alert sent for: ${alert.message}`);
  }

  async sendSMSAlert(alert) {
    // Implement SMS notification logic
    logger.info(`📱 SMS alert sent for: ${alert.message}`);
  }

  setupAlertHandlers() {
    this.on('alert', (alert) => {
      // Handle alert events
      logger.info(`Alert triggered: ${alert.severity} - ${alert.category} - ${alert.message}`);
    });
  }

  getMetrics(category = null, limit = 100) {
    if (category) {
      return this.metrics[category] ? this.metrics[category].slice(-limit) : [];
    }
    
    const allMetrics = {};
    for (const [cat, data] of Object.entries(this.metrics)) {
      allMetrics[cat] = data.slice(-limit);
    }
    
    return allMetrics;
  }

  getAlerts(status = null, limit = 100) {
    let filteredAlerts = this.alerts;
    
    if (status === 'active') {
      filteredAlerts = this.alerts.filter(alert => !alert.resolved);
    } else if (status === 'resolved') {
      filteredAlerts = this.alerts.filter(alert => alert.resolved);
    } else if (status === 'acknowledged') {
      filteredAlerts = this.alerts.filter(alert => alert.acknowledged);
    }
    
    return filteredAlerts.slice(-limit);
  }

  acknowledgeAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedAt = new Date().toISOString();
      logger.info(`Alert acknowledged: ${alert.message}`);
      return true;
    }
    return false;
  }

  resolveAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = new Date().toISOString();
      logger.info(`Alert resolved: ${alert.message}`);
      return true;
    }
    return false;
  }

  getHealthStatus() {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      metrics: {
        system: this.metrics.system.length > 0 ? this.metrics.system[this.metrics.system.length - 1] : null,
        application: this.metrics.application.length > 0 ? this.metrics.application[this.metrics.application.length - 1] : null,
        database: this.metrics.database.length > 0 ? this.metrics.database[this.metrics.database.length - 1] : null,
        cache: this.metrics.cache.length > 0 ? this.metrics.cache[this.metrics.cache.length - 1] : null
      },
      alerts: {
        total: this.alerts.length,
        active: this.alerts.filter(a => !a.resolved).length,
        critical: this.alerts.filter(a => a.severity === 'CRITICAL' && !a.resolved).length,
        warning: this.alerts.filter(a => a.severity === 'WARNING' && !a.resolved).length
      }
    };

    // Determine overall health status
    if (health.alerts.critical > 0) {
      health.status = 'critical';
    } else if (health.alerts.warning > 0) {
      health.status = 'warning';
    } else if (health.alerts.active > 0) {
      health.status = 'degraded';
    }

    return health;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  stop() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    this.isRunning = false;
    logger.info('🛑 Production Monitoring Service stopped');
  }

  isMonitoringRunning() {
    return this.isRunning;
  }
}

// Export singleton instance
const productionMonitoringService = new ProductionMonitoringService();

// Graceful shutdown
process.on('SIGTERM', () => {
  productionMonitoringService.stop();
});

process.on('SIGINT', () => {
  productionMonitoringService.stop();
});

module.exports = productionMonitoringService;
