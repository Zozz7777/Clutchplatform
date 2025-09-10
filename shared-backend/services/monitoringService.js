const { logger } = require('../config/logger');
const { getRedisClient } = require('../config/redis');
const { getDb } = require('../config/database');
const os = require('os');

class MonitoringService {
  constructor() {
    this.metrics = new Map();
    this.alerts = [];
    this.isRunning = false;
    this.monitoringInterval = null;
  }

  /**
   * Initialize monitoring service
   */
  async initialize() {
    try {
      this.isRunning = true;
      this.startMonitoring();
      logger.info('Monitoring service initialized successfully');
      return true;
    } catch (error) {
      logger.error('Failed to initialize monitoring service:', error);
      return false;
    }
  }

  /**
   * Start monitoring
   */
  startMonitoring() {
    // Monitor every 30 seconds
    this.monitoringInterval = setInterval(async () => {
      await this.collectMetrics();
      await this.checkThresholds();
      await this.generateAlerts();
    }, 30000);

    logger.info('Monitoring started - collecting metrics every 30 seconds');
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isRunning = false;
    logger.info('Monitoring stopped');
  }

  /**
   * Collect system metrics
   */
  async collectMetrics() {
    try {
      const timestamp = new Date();
      
      // System metrics
      const systemMetrics = {
        timestamp,
        cpu: {
          loadAverage: os.loadavg(),
          cores: os.cpus().length,
          usage: process.cpuUsage()
        },
        memory: {
          total: os.totalmem(),
          free: os.freemem(),
          used: os.totalmem() - os.freemem(),
          usagePercentage: ((os.totalmem() - os.freemem()) / os.totalmem()) * 100
        },
        uptime: os.uptime(),
        processUptime: process.uptime()
      };

      // Database metrics
      const dbMetrics = await this.getDatabaseMetrics();

      // Redis metrics
      const redisMetrics = await this.getRedisMetrics();

      // Application metrics
      const appMetrics = {
        timestamp,
        memoryUsage: process.memoryUsage(),
        activeConnections: this.getActiveConnections(),
        requestCount: this.getRequestCount(),
        errorCount: this.getErrorCount()
      };

      // Store metrics
      this.metrics.set('system', systemMetrics);
      this.metrics.set('database', dbMetrics);
      this.metrics.set('redis', redisMetrics);
      this.metrics.set('application', appMetrics);

      // Store in Redis for persistence
      await this.storeMetricsInRedis({
        system: systemMetrics,
        database: dbMetrics,
        redis: redisMetrics,
        application: appMetrics
      });

    } catch (error) {
      logger.error('Error collecting metrics:', error);
    }
  }

  /**
   * Get database metrics
   */
  async getDatabaseMetrics() {
    try {
      const db = await getDb();
      const stats = await db.stats();
      
      return {
        timestamp: new Date(),
        collections: stats.collections,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        indexes: stats.indexes,
        indexSize: stats.indexSize,
        avgObjSize: stats.avgObjSize,
        documents: stats.objects
      };
    } catch (error) {
      logger.error('Error getting database metrics:', error);
      return { timestamp: new Date(), error: error.message };
    }
  }

  /**
   * Get Redis metrics
   */
  async getRedisMetrics() {
    try {
      const redisClient = getRedisClient();
      if (!redisClient) {
        return { timestamp: new Date(), status: 'unavailable' };
      }

      const info = await redisClient.info();
      const memory = await redisClient.info('memory');
      
      // Parse Redis info
      const parseInfo = (infoStr, key) => {
        const match = infoStr.match(new RegExp(`${key}:(\\d+)`));
        return match ? parseInt(match[1]) : 0;
      };

      return {
        timestamp: new Date(),
        connectedClients: parseInfo(info, 'connected_clients'),
        usedMemory: parseInfo(memory, 'used_memory'),
        usedMemoryPeak: parseInfo(memory, 'used_memory_peak'),
        keyspaceHits: parseInfo(info, 'keyspace_hits'),
        keyspaceMisses: parseInfo(info, 'keyspace_misses'),
        totalCommandsProcessed: parseInfo(info, 'total_commands_processed'),
        hitRate: this.calculateHitRate(
          parseInfo(info, 'keyspace_hits'),
          parseInfo(info, 'keyspace_misses')
        )
      };
    } catch (error) {
      logger.error('Error getting Redis metrics:', error);
      return { timestamp: new Date(), error: error.message };
    }
  }

  /**
   * Calculate Redis hit rate
   */
  calculateHitRate(hits, misses) {
    const total = hits + misses;
    return total > 0 ? (hits / total) * 100 : 0;
  }

  /**
   * Get active connections (placeholder)
   */
  getActiveConnections() {
    // This would be implemented based on your connection tracking
    return 0;
  }

  /**
   * Get request count (placeholder)
   */
  getRequestCount() {
    // This would be implemented based on your request tracking
    return 0;
  }

  /**
   * Get error count (placeholder)
   */
  getErrorCount() {
    // This would be implemented based on your error tracking
    return 0;
  }

  /**
   * Store metrics in Redis
   */
  async storeMetricsInRedis(metrics) {
    try {
      const redisClient = getRedisClient();
      if (!redisClient) return;

      const key = `metrics:${new Date().toISOString().slice(0, 10)}`;
      await redisClient.hset(key, Date.now().toString(), JSON.stringify(metrics));
      await redisClient.expire(key, 7 * 24 * 60 * 60); // 7 days
    } catch (error) {
      logger.error('Error storing metrics in Redis:', error);
    }
  }

  /**
   * Check thresholds and generate alerts
   */
  async checkThresholds() {
    const systemMetrics = this.metrics.get('system');
    const redisMetrics = this.metrics.get('redis');
    const appMetrics = this.metrics.get('application');

    if (!systemMetrics || !redisMetrics || !appMetrics) return;

    // Memory threshold check
    if (systemMetrics.memory.usagePercentage > 80) {
      this.createAlert('HIGH_MEMORY_USAGE', {
        current: systemMetrics.memory.usagePercentage,
        threshold: 80,
        message: 'Memory usage is above 80%'
      });
    }

    // CPU threshold check
    if (systemMetrics.cpu.loadAverage[0] > 5) {
      this.createAlert('HIGH_CPU_USAGE', {
        current: systemMetrics.cpu.loadAverage[0],
        threshold: 5,
        message: 'CPU load is above 5'
      });
    }

    // Redis hit rate check
    if (redisMetrics.hitRate < 80) {
      this.createAlert('LOW_REDIS_HIT_RATE', {
        current: redisMetrics.hitRate,
        threshold: 80,
        message: 'Redis hit rate is below 80%'
      });
    }

    // Database connection check
    if (systemMetrics.uptime < 3600) { // Less than 1 hour
      this.createAlert('RECENT_RESTART', {
        uptime: systemMetrics.uptime,
        message: 'System was restarted recently'
      });
    }
  }

  /**
   * Create alert
   */
  createAlert(type, data) {
    const alert = {
      id: Date.now().toString(),
      type,
      timestamp: new Date(),
      data,
      acknowledged: false
    };

    this.alerts.push(alert);
    logger.warn(`Alert created: ${type}`, data);
  }

  /**
   * Generate alerts
   */
  async generateAlerts() {
    // Send alerts to external monitoring systems
    // This could integrate with services like PagerDuty, Slack, etc.
    
    const unacknowledgedAlerts = this.alerts.filter(alert => !alert.acknowledged);
    
    if (unacknowledgedAlerts.length > 0) {
      logger.warn(`${unacknowledgedAlerts.length} unacknowledged alerts`);
    }
  }

  /**
   * Get current metrics
   */
  getMetrics() {
    return Object.fromEntries(this.metrics);
  }

  /**
   * Get alerts
   */
  getAlerts() {
    return this.alerts;
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * Get health status
   */
  getHealthStatus() {
    const systemMetrics = this.metrics.get('system');
    const redisMetrics = this.metrics.get('redis');

    if (!systemMetrics || !redisMetrics) {
      return { status: 'unknown', message: 'No metrics available' };
    }

    const issues = [];

    if (systemMetrics.memory.usagePercentage > 90) {
      issues.push('Critical memory usage');
    }

    if (systemMetrics.cpu.loadAverage[0] > 10) {
      issues.push('Critical CPU usage');
    }

    if (redisMetrics.error) {
      issues.push('Redis connection issues');
    }

    if (issues.length === 0) {
      return { status: 'healthy', message: 'All systems operational' };
    } else {
      return { 
        status: 'degraded', 
        message: 'System issues detected',
        issues 
      };
    }
  }
}

module.exports = new MonitoringService();
