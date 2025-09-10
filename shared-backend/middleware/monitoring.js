const { logger } = require('../config/logger');

// Monitoring system class
class MonitoringSystem {
  constructor() {
    this.metrics = {
      requests: 0,
      errors: 0,
      responseTime: [],
      memoryUsage: [],
      cpuUsage: []
    };
    this.alerts = [];
  }

  async initialize() {
    console.log('📊 Initializing monitoring system...');
    
    // Start monitoring intervals
    this.startMemoryMonitoring();
    this.startCPUMonitoring();
    this.startResponseTimeMonitoring();
    
    console.log('✅ Monitoring system initialized');
  }

  startMemoryMonitoring() {
    setInterval(() => {
      const memUsage = process.memoryUsage();
      this.metrics.memoryUsage.push({
        timestamp: Date.now(),
        rss: memUsage.rss,
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external
      });

      // Keep only last 100 measurements
      if (this.metrics.memoryUsage.length > 100) {
        this.metrics.memoryUsage.shift();
      }

      // Alert if memory usage is high
      const memoryUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
      if (memoryUsagePercent > 80) {
        this.createAlert('HIGH_MEMORY_USAGE', `Memory usage: ${memoryUsagePercent.toFixed(2)}%`);
      }
    }, 30000); // Every 30 seconds
  }

  startCPUMonitoring() {
    setInterval(() => {
      const cpuUsage = process.cpuUsage();
      this.metrics.cpuUsage.push({
        timestamp: Date.now(),
        user: cpuUsage.user,
        system: cpuUsage.system
      });

      // Keep only last 100 measurements
      if (this.metrics.cpuUsage.length > 100) {
        this.metrics.cpuUsage.shift();
      }
    }, 30000); // Every 30 seconds
  }

  startResponseTimeMonitoring() {
    // This will be called by the performance middleware
  }

  recordRequest(duration) {
    this.metrics.requests++;
    this.metrics.responseTime.push({
      timestamp: Date.now(),
      duration
    });

    // Keep only last 1000 measurements
    if (this.metrics.responseTime.length > 1000) {
      this.metrics.responseTime.shift();
    }

    // Alert if response time is slow
    if (duration > 2000) {
      this.createAlert('SLOW_RESPONSE', `Response time: ${duration}ms`);
    }
  }

  recordError(error) {
    this.metrics.errors++;
    this.createAlert('ERROR', error.message);
  }

  createAlert(type, message) {
    const alert = {
      id: Date.now(),
      type,
      message,
      timestamp: new Date().toISOString(),
      severity: this.getSeverity(type)
    };

    this.alerts.push(alert);
    
    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts.shift();
    }

    logger.warning(`Alert: ${type} - ${message}`);
  }

  getSeverity(type) {
    const severityMap = {
      'HIGH_MEMORY_USAGE': 'warning',
      'SLOW_RESPONSE': 'warning',
      'ERROR': 'error',
      'CRITICAL': 'critical'
    };
    return severityMap[type] || 'info';
  }

  getMetrics() {
    const avgResponseTime = this.metrics.responseTime.length > 0 
      ? this.metrics.responseTime.reduce((sum, rt) => sum + rt.duration, 0) / this.metrics.responseTime.length
      : 0;

    const errorRate = this.metrics.requests > 0 
      ? (this.metrics.errors / this.metrics.requests) * 100
      : 0;

    return {
      requests: this.metrics.requests,
      errors: this.metrics.errors,
      errorRate: errorRate.toFixed(2),
      avgResponseTime: avgResponseTime.toFixed(2),
      memoryUsage: this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1] || null,
      alerts: this.alerts.slice(-10) // Last 10 alerts
    };
  }
}

// APM middleware
const apmMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Record metrics if monitoring system is available
    if (global.monitoringSystem) {
      global.monitoringSystem.recordRequest(duration);
    }
  });
  
  next();
};

// Create global monitoring system instance
const monitoringSystem = new MonitoringSystem();

module.exports = {
  monitoringSystem,
  apmMiddleware
};
