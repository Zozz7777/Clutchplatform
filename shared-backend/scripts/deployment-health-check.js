#!/usr/bin/env node

/**
 * Deployment Health Check
 * Comprehensive health check for the deployed system
 */

const axios = require('axios');
const winston = require('winston');

class DeploymentHealthCheck {
  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/deployment-health.log' }),
        new winston.transports.Console()
      ]
    });

    this.baseUrl = process.env.RENDER_URL || 'https://clutch-main-nk7x.onrender.com';
    this.endpoints = [
      '/health',
      '/health',
      '/api/v1/auth/employee-login',
      '/api/v1/admin/dashboard/consolidated',
      '/api/v1/autonomous-dashboard/status'
    ];
  }

  async runHealthCheck() {
    this.logger.info('🏥 Starting deployment health check...');

    const results = {
      timestamp: new Date().toISOString(),
      baseUrl: this.baseUrl,
      endpoints: {},
      overall: 'healthy'
    };

    for (const endpoint of this.endpoints) {
      try {
        const response = await axios.get(`${this.baseUrl}${endpoint}`, {
          timeout: 10000,
          validateStatus: (status) => status < 500 // Accept 4xx as healthy (expected auth errors)
        });

        results.endpoints[endpoint] = {
          status: 'healthy',
          statusCode: response.status,
          responseTime: response.headers['x-response-time'] || 'unknown'
        };

        this.logger.info(`✅ ${endpoint}: ${response.status}`);

      } catch (error) {
        results.endpoints[endpoint] = {
          status: 'unhealthy',
          error: error.message,
          statusCode: error.response?.status || 'timeout'
        };

        this.logger.error(`❌ ${endpoint}: ${error.message}`);
        results.overall = 'unhealthy';
      }
    }

    this.logger.info(`🏥 Health check completed. Overall status: ${results.overall}`);
    return results;
  }
}

// Run health check if called directly
if (require.main === module) {
  const healthCheck = new DeploymentHealthCheck();
  healthCheck.runHealthCheck()
    .then(results => {
      console.log('Health Check Results:', JSON.stringify(results, null, 2));
      process.exit(results.overall === 'healthy' ? 0 : 1);
    })
    .catch(error => {
      console.error('Health check failed:', error);
      process.exit(1);
    });
}

module.exports = DeploymentHealthCheck;
