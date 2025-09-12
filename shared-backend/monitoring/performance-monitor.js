const os = require('os');
const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

/**
 * 🚀 Advanced Performance Monitoring System for Clutch Platform
 * Real-time monitoring, alerting, and performance tracking
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      system: {
        cpu: { usage: 0, load: [] },
        memory: { used: 0, total: 0, free: 0 },
        disk: { used: 0, total: 0, free: 0 }
      },
      application: {
        requests: { total: 0, successful: 0, failed: 0 },
        responseTime: { avg: 0, min: 0, max: 0, p95: 0, p99: 0 },
        errors: { total: 0, rate: 0 },
        throughput: { requestsPerSecond: 0 }
      },
      database: {
        connections: { active: 0, idle: 0, total: 0 },
        queries: { total: 0, slow: 0, avgTime: 0 },
        performance: { hitRate: 0, missRate: 0 }
      }
    };
    
    this.alerts = [];
    this.thresholds = {
      cpu: { warning: 70, critical: 90 },
      memory: { warning: 80, critical: 95 },
      responseTime: { warning: 500, critical: 1000 },
      errorRate: { warning: 5, critical: 10 },
      disk: { warning: 85, critical: 95 }
    };
    
    this.isMonitoring = false;
    this.monitoringInterval = null;
    this.alertCallbacks = [];
  }

  start() {
    if (this.isMonitoring) {
      console.log('Performance monitoring is already running');
      return;
    }

    console.log('🚀 Starting Performance Monitoring System');
    this.isMonitoring = true;
    
    // Start system monitoring
    this.startSystemMonitoring();
    
    // Start application monitoring
    this.startApplicationMonitoring();
    
    // Start database monitoring
    this.startDatabaseMonitoring();
    
    // Start alerting system
    this.startAlertingSystem();
    
    console.log('✅ Performance monitoring started successfully');
  }

  stop() {
    if (!this.isMonitoring) {
      console.log('Performance monitoring is not running');
      return;
    }

    console.log('🛑 Stopping Performance Monitoring System');
    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    console.log('✅ Performance monitoring stopped');
  }

  startSystemMonitoring() {
    this.monitoringInterval = setInterval(() => {
      this.collectSystemMetrics();
      this.checkSystemThresholds();
    }, 5000); // Collect metrics every 5 seconds
  }

  startApplicationMonitoring() {
    // Monitor HTTP requests
    this.monitorHttpRequests();
    
    // Monitor response times
    this.monitorResponseTimes();
    
    // Monitor error rates
    this.monitorErrorRates();
  }

  startDatabaseMonitoring() {
    // Monitor database connections
    this.monitorDatabaseConnections();
    
    // Monitor query performance
    this.monitorQueryPerformance();
  }

  startAlertingSystem() {
    setInterval(() => {
      this.checkAlerts();
    }, 10000); // Check alerts every 10 seconds
  }

  collectSystemMetrics() {
    // CPU metrics
    const cpuUsage = this.getCpuUsage();
    this.metrics.system.cpu.usage = cpuUsage;
    this.metrics.system.cpu.load = os.loadavg();

    // Memory metrics
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    
    this.metrics.system.memory = {
      used: usedMem,
      total: totalMem,
      free: freeMem,
      usage: (usedMem / totalMem) * 100
    };

    // Disk metrics
    this.collectDiskMetrics();
  }

  getCpuUsage() {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });

    return 100 - ~~(100 * totalIdle / totalTick);
  }

  collectDiskMetrics() {
    try {
      const stats = fs.statSync('/');
      // Mock disk metrics - in real implementation, use a library like 'diskusage'
      this.metrics.system.disk = {
        used: 50000000000, // 50GB
        total: 100000000000, // 100GB
        free: 50000000000, // 50GB
        usage: 50
      };
    } catch (error) {
      console.error('Error collecting disk metrics:', error);
    }
  }

  monitorHttpRequests() {
    // This would be integrated with Express middleware
    // For now, we'll simulate request monitoring
    setInterval(() => {
      this.metrics.application.requests.total += Math.floor(Math.random() * 10);
      this.metrics.application.requests.successful += Math.floor(Math.random() * 8);
      this.metrics.application.requests.failed += Math.floor(Math.random() * 2);
    }, 1000);
  }

  monitorResponseTimes() {
    // Simulate response time monitoring
    setInterval(() => {
      const responseTime = Math.random() * 1000; // 0-1000ms
      
      this.metrics.application.responseTime.avg = 
        (this.metrics.application.responseTime.avg + responseTime) / 2;
      
      if (responseTime > this.metrics.application.responseTime.max) {
        this.metrics.application.responseTime.max = responseTime;
      }
      
      if (this.metrics.application.responseTime.min === 0 || 
          responseTime < this.metrics.application.responseTime.min) {
        this.metrics.application.responseTime.min = responseTime;
      }
    }, 2000);
  }

  monitorErrorRates() {
    setInterval(() => {
      const totalRequests = this.metrics.application.requests.total;
      const failedRequests = this.metrics.application.requests.failed;
      
      if (totalRequests > 0) {
        this.metrics.application.errors.rate = (failedRequests / totalRequests) * 100;
      }
    }, 5000);
  }

  monitorDatabaseConnections() {
    // Mock database connection monitoring
    setInterval(() => {
      this.metrics.database.connections = {
        active: Math.floor(Math.random() * 20) + 5,
        idle: Math.floor(Math.random() * 10) + 2,
        total: Math.floor(Math.random() * 30) + 7
      };
    }, 3000);
  }

  monitorQueryPerformance() {
    // Mock query performance monitoring
    setInterval(() => {
      this.metrics.database.queries.total += Math.floor(Math.random() * 50);
      this.metrics.database.queries.slow += Math.floor(Math.random() * 5);
      this.metrics.database.queries.avgTime = Math.random() * 100; // 0-100ms
      
      // Calculate hit rate
      this.metrics.database.performance.hitRate = 95 + Math.random() * 5; // 95-100%
      this.metrics.database.performance.missRate = 100 - this.metrics.database.performance.hitRate;
    }, 4000);
  }

  checkSystemThresholds() {
    // Check CPU threshold
    if (this.metrics.system.cpu.usage > this.thresholds.cpu.critical) {
      this.triggerAlert('CRITICAL', 'CPU', `CPU usage is ${this.metrics.system.cpu.usage.toFixed(2)}%`);
    } else if (this.metrics.system.cpu.usage > this.thresholds.cpu.warning) {
      this.triggerAlert('WARNING', 'CPU', `CPU usage is ${this.metrics.system.cpu.usage.toFixed(2)}%`);
    }

    // Check memory threshold
    if (this.metrics.system.memory.usage > this.thresholds.memory.critical) {
      this.triggerAlert('CRITICAL', 'MEMORY', `Memory usage is ${this.metrics.system.memory.usage.toFixed(2)}%`);
    } else if (this.metrics.system.memory.usage > this.thresholds.memory.warning) {
      this.triggerAlert('WARNING', 'MEMORY', `Memory usage is ${this.metrics.system.memory.usage.toFixed(2)}%`);
    }

    // Check response time threshold
    if (this.metrics.application.responseTime.avg > this.thresholds.responseTime.critical) {
      this.triggerAlert('CRITICAL', 'RESPONSE_TIME', `Average response time is ${this.metrics.application.responseTime.avg.toFixed(2)}ms`);
    } else if (this.metrics.application.responseTime.avg > this.thresholds.responseTime.warning) {
      this.triggerAlert('WARNING', 'RESPONSE_TIME', `Average response time is ${this.metrics.application.responseTime.avg.toFixed(2)}ms`);
    }

    // Check error rate threshold
    if (this.metrics.application.errors.rate > this.thresholds.errorRate.critical) {
      this.triggerAlert('CRITICAL', 'ERROR_RATE', `Error rate is ${this.metrics.application.errors.rate.toFixed(2)}%`);
    } else if (this.metrics.application.errors.rate > this.thresholds.errorRate.warning) {
      this.triggerAlert('WARNING', 'ERROR_RATE', `Error rate is ${this.metrics.application.errors.rate.toFixed(2)}%`);
    }
  }

  triggerAlert(severity, type, message) {
    const alert = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      severity,
      type,
      message,
      metrics: { ...this.metrics }
    };

    this.alerts.push(alert);
    
    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }

    // Trigger alert callbacks
    this.alertCallbacks.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('Error in alert callback:', error);
      }
    });

    console.log(`🚨 ${severity} ALERT: ${type} - ${message}`);
  }

  checkAlerts() {
    // Check for alert conditions and trigger notifications
    this.checkSystemThresholds();
  }

  onAlert(callback) {
    this.alertCallbacks.push(callback);
  }

  getMetrics() {
    return {
      ...this.metrics,
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
  }

  getAlerts() {
    return this.alerts;
  }

  getHealthStatus() {
    const criticalAlerts = this.alerts.filter(alert => alert.severity === 'CRITICAL');
    const warningAlerts = this.alerts.filter(alert => alert.severity === 'WARNING');
    
    let status = 'HEALTHY';
    if (criticalAlerts.length > 0) {
      status = 'CRITICAL';
    } else if (warningAlerts.length > 0) {
      status = 'WARNING';
    }

    return {
      status,
      criticalAlerts: criticalAlerts.length,
      warningAlerts: warningAlerts.length,
      totalAlerts: this.alerts.length,
      metrics: this.metrics
    };
  }

  // Express middleware for request monitoring
  requestMonitoringMiddleware() {
    return (req, res, next) => {
      const startTime = performance.now();
      
      res.on('finish', () => {
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        // Update metrics
        this.metrics.application.requests.total++;
        
        if (res.statusCode >= 200 && res.statusCode < 400) {
          this.metrics.application.requests.successful++;
        } else {
          this.metrics.application.requests.failed++;
        }
        
        // Update response time metrics
        this.metrics.application.responseTime.avg = 
          (this.metrics.application.responseTime.avg + responseTime) / 2;
        
        if (responseTime > this.metrics.application.responseTime.max) {
          this.metrics.application.responseTime.max = responseTime;
        }
        
        if (this.metrics.application.responseTime.min === 0 || 
            responseTime < this.metrics.application.responseTime.min) {
          this.metrics.application.responseTime.min = responseTime;
        }
      });
      
      next();
    };
  }

  // Generate performance report
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        status: this.getHealthStatus().status,
        uptime: process.uptime(),
        totalRequests: this.metrics.application.requests.total,
        errorRate: this.metrics.application.errors.rate,
        avgResponseTime: this.metrics.application.responseTime.avg
      },
      metrics: this.metrics,
      alerts: this.alerts.slice(-10), // Last 10 alerts
      recommendations: this.generateRecommendations()
    };

    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.metrics.system.cpu.usage > 80) {
      recommendations.push('Consider scaling up CPU resources or optimizing CPU-intensive operations');
    }
    
    if (this.metrics.system.memory.usage > 85) {
      recommendations.push('Consider increasing memory allocation or optimizing memory usage');
    }
    
    if (this.metrics.application.responseTime.avg > 500) {
      recommendations.push('Optimize database queries and consider caching strategies');
    }
    
    if (this.metrics.application.errors.rate > 5) {
      recommendations.push('Investigate and fix application errors to improve reliability');
    }
    
    if (this.metrics.database.queries.slow > 10) {
      recommendations.push('Optimize slow database queries and consider adding indexes');
    }
    
    return recommendations;
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

module.exports = performanceMonitor;
