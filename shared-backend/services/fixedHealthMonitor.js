const axios = require('axios');

class FixedHealthMonitor {
  constructor() {
    this.logger = require('./logger');
    this.healthChecks = new Map();
    this.healthStatus = {
      overall: 'unknown',
      percentage: 0,
      healthyChecks: 0,
      totalChecks: 0,
      lastCheck: null
    };
    this.checkInterval = 30000; // 30 seconds
    this.isMonitoring = false;
    this.initializeHealthChecks();
  }

  initializeHealthChecks() {
    // Database health check
    this.healthChecks.set('database', {
      name: 'Database Connection',
      check: this.checkDatabaseHealth.bind(this),
      weight: 25,
      enabled: true
    });

    // API health check
    this.healthChecks.set('api', {
      name: 'API Endpoints',
      check: this.checkAPIHealth.bind(this),
      weight: 25,
      enabled: true
    });

    // Memory health check
    this.healthChecks.set('memory', {
      name: 'Memory Usage',
      check: this.checkMemoryHealth.bind(this),
      weight: 20,
      enabled: true
    });

    // System resources check
    this.healthChecks.set('system', {
      name: 'System Resources',
      check: this.checkSystemResources.bind(this),
      weight: 15,
      enabled: true
    });

    // External services check
    this.healthChecks.set('external', {
      name: 'External Services',
      check: this.checkExternalServices.bind(this),
      weight: 15,
      enabled: true
    });
  }

  async startMonitoring() {
    if (this.isMonitoring) {
      this.logger.warn('⚠️ Health monitoring already running');
      return;
    }

    this.isMonitoring = true;
    this.logger.info('🏥 Starting health monitoring...');

    // Initial health check
    await this.performHealthCheck();

    // Set up interval
    this.monitoringInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, this.checkInterval);
  }

  async stopMonitoring() {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    this.logger.info('🛑 Health monitoring stopped');
  }

  async performHealthCheck() {
    try {
      const results = {};
      let totalWeight = 0;
      let healthyWeight = 0;

      for (const [key, check] of this.healthChecks) {
        if (!check.enabled) continue;

        try {
          const result = await check.check();
          results[key] = result;
          
          totalWeight += check.weight;
          if (result.status === 'healthy') {
            healthyWeight += check.weight;
          }
        } catch (error) {
          results[key] = {
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date()
          };
        }
      }

      // Calculate overall health
      const healthPercentage = totalWeight > 0 ? (healthyWeight / totalWeight) * 100 : 0;
      const overallStatus = this.determineOverallStatus(healthPercentage);

      this.healthStatus = {
        overall: overallStatus,
        percentage: Math.round(healthPercentage),
        healthyChecks: Object.values(results).filter(r => r.status === 'healthy').length,
        totalChecks: Object.keys(results).length,
        lastCheck: new Date(),
        details: results
      };

      this.logger.info(`📊 Health Check Complete: ${overallStatus} (${Math.round(healthPercentage)}%)`);
      
      return this.healthStatus;
    } catch (error) {
      this.logger.error('❌ Health check failed:', error);
      return {
        overall: 'unhealthy',
        percentage: 0,
        healthyChecks: 0,
        totalChecks: 0,
        lastCheck: new Date(),
        error: error.message
      };
    }
  }

  determineOverallStatus(percentage) {
    if (percentage >= 90) return 'healthy';
    if (percentage >= 70) return 'degraded';
    if (percentage >= 50) return 'poor';
    return 'unhealthy';
  }

  async checkDatabaseHealth() {
    try {
      // Check MongoDB connection
      const { MongoClient } = require('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI);
      
      await client.connect();
      await client.db().admin().ping();
      await client.close();

      return {
        status: 'healthy',
        responseTime: Date.now(),
        details: 'Database connection successful',
        timestamp: new Date()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        details: 'Database connection failed',
        timestamp: new Date()
      };
    }
  }

  async checkAPIHealth() {
    try {
      const port = process.env.PORT || 5000;
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://clutch-main-nk7x.onrender.com'
        : `http://localhost:${port}`;

      // Check main health endpoint
      const response = await axios.get(`${baseUrl}/health`, {
        timeout: 5000,
        validateStatus: (status) => status < 500
      });

      if (response.status === 200) {
        return {
          status: 'healthy',
          responseTime: response.headers['x-response-time'] || 'unknown',
          details: 'API endpoints responding',
          timestamp: new Date()
        };
      } else {
        return {
          status: 'degraded',
          statusCode: response.status,
          details: 'API endpoints responding with errors',
          timestamp: new Date()
        };
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        details: 'API endpoints not responding',
        timestamp: new Date()
      };
    }
  }

  async checkMemoryHealth() {
    try {
      const memUsage = process.memoryUsage();
      const totalMem = memUsage.heapTotal;
      const usedMem = memUsage.heapUsed;
      const usagePercentage = (usedMem / totalMem) * 100;

      let status = 'healthy';
      if (usagePercentage > 90) status = 'unhealthy';
      else if (usagePercentage > 80) status = 'degraded';
      else if (usagePercentage > 70) status = 'poor';

      return {
        status,
        usagePercentage: Math.round(usagePercentage),
        heapUsed: Math.round(usedMem / 1024 / 1024), // MB
        heapTotal: Math.round(totalMem / 1024 / 1024), // MB
        details: `Memory usage: ${Math.round(usagePercentage)}%`,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        details: 'Memory check failed',
        timestamp: new Date()
      };
    }
  }

  async checkSystemResources() {
    try {
      const cpuUsage = process.cpuUsage();
      const uptime = process.uptime();
      
      // Simple system resource check
      const status = uptime > 3600 ? 'healthy' : 'degraded'; // Running for more than 1 hour

      return {
        status,
        uptime: Math.round(uptime),
        cpuUsage: cpuUsage,
        details: `System uptime: ${Math.round(uptime)}s`,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        details: 'System resource check failed',
        timestamp: new Date()
      };
    }
  }

  async checkExternalServices() {
    try {
      // Check external services that the system depends on
      const services = [
        { name: 'MongoDB Atlas', url: 'https://cloud.mongodb.com' },
        { name: 'Render', url: 'https://render.com' }
      ];

      let healthyServices = 0;
      const results = [];

      for (const service of services) {
        try {
          const response = await axios.get(service.url, { timeout: 5000 });
          if (response.status < 500) {
            healthyServices++;
            results.push({ name: service.name, status: 'healthy' });
          } else {
            results.push({ name: service.name, status: 'degraded' });
          }
        } catch (error) {
          results.push({ name: service.name, status: 'unhealthy', error: error.message });
        }
      }

      const healthPercentage = (healthyServices / services.length) * 100;
      let status = 'healthy';
      if (healthPercentage < 50) status = 'unhealthy';
      else if (healthPercentage < 80) status = 'degraded';

      return {
        status,
        healthyServices,
        totalServices: services.length,
        details: results,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        details: 'External services check failed',
        timestamp: new Date()
      };
    }
  }

  getHealthStatus() {
    return this.healthStatus;
  }

  getDetailedHealthReport() {
    return {
      summary: this.healthStatus,
      checks: Object.fromEntries(this.healthChecks),
      monitoring: {
        isActive: this.isMonitoring,
        interval: this.checkInterval,
        lastCheck: this.healthStatus.lastCheck
      }
    };
  }

  updateCheckWeight(checkName, weight) {
    if (this.healthChecks.has(checkName)) {
      this.healthChecks.get(checkName).weight = weight;
      this.logger.info(`⚖️ Updated weight for ${checkName} to ${weight}`);
    }
  }

  enableCheck(checkName) {
    if (this.healthChecks.has(checkName)) {
      this.healthChecks.get(checkName).enabled = true;
      this.logger.info(`✅ Enabled health check: ${checkName}`);
    }
  }

  disableCheck(checkName) {
    if (this.healthChecks.has(checkName)) {
      this.healthChecks.get(checkName).enabled = false;
      this.logger.info(`❌ Disabled health check: ${checkName}`);
    }
  }
}

module.exports = FixedHealthMonitor;
