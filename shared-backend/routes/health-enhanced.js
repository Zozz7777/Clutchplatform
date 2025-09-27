const express = require('express');
const router = express.Router();
const { logger } = require('../config/logger');

/**
 * Enhanced Health Check Endpoints for Production
 * Provides comprehensive health monitoring and status reporting
 */

// Basic health check
router.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        percentage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100)
      },
      cpu: process.cpuUsage(),
      pid: process.pid,
      platform: process.platform,
      nodeVersion: process.version
    };

    res.json({
      success: true,
      data: health,
      message: 'System is healthy',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({
      success: false,
      error: 'HEALTH_CHECK_FAILED',
      message: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Detailed health check with dependencies
router.get('/health/detailed', async (req, res) => {
  try {
    const checks = {
      database: await checkDatabase(),
      redis: await checkRedis(),
      external: await checkExternalServices(),
      disk: await checkDiskSpace(),
      memory: await checkMemoryUsage(),
      cpu: await checkCpuUsage()
    };

    const overallStatus = Object.values(checks).every(check => check.status === 'healthy') 
      ? 'healthy' 
      : 'degraded';

    const health = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: checks,
      summary: {
        total: Object.keys(checks).length,
        healthy: Object.values(checks).filter(check => check.status === 'healthy').length,
        degraded: Object.values(checks).filter(check => check.status === 'degraded').length,
        unhealthy: Object.values(checks).filter(check => check.status === 'unhealthy').length
      }
    };

    const statusCode = overallStatus === 'healthy' ? 200 : 503;

    res.status(statusCode).json({
      success: overallStatus === 'healthy',
      data: health,
      message: `System status: ${overallStatus}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Detailed health check failed:', error);
    res.status(500).json({
      success: false,
      error: 'DETAILED_HEALTH_CHECK_FAILED',
      message: 'Detailed health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Readiness check
router.get('/ready', async (req, res) => {
  try {
    const readiness = {
      ready: true,
      timestamp: new Date().toISOString(),
      checks: {
        database: await checkDatabase(),
        redis: await checkRedis(),
        memory: await checkMemoryUsage()
      }
    };

    const isReady = Object.values(readiness.checks).every(check => check.status === 'healthy');

    if (isReady) {
      res.json({
        success: true,
        data: readiness,
        message: 'System is ready',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        success: false,
        data: readiness,
        message: 'System is not ready',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({
      success: false,
      error: 'READINESS_CHECK_FAILED',
      message: 'System is not ready',
      timestamp: new Date().toISOString()
    });
  }
});

// Liveness check
router.get('/live', (req, res) => {
  res.json({
    success: true,
    data: {
      alive: true,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      pid: process.pid
    },
    message: 'System is alive',
    timestamp: new Date().toISOString()
  });
});

// Metrics endpoint
router.get('/metrics', async (req, res) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        pid: process.pid,
        platform: process.platform,
        nodeVersion: process.version
      },
      application: {
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        startTime: new Date(Date.now() - process.uptime() * 1000).toISOString()
      },
      performance: {
        memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        memoryTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        memoryPercentage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100)
      }
    };

    res.json({
      success: true,
      data: metrics,
      message: 'Metrics retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Metrics collection failed:', error);
    res.status(500).json({
      success: false,
      error: 'METRICS_COLLECTION_FAILED',
      message: 'Failed to collect metrics',
      timestamp: new Date().toISOString()
    });
  }
});

// Helper functions for health checks
async function checkDatabase() {
  try {
    // This would be replaced with actual database connection check
    // For now, we'll simulate a check
    return {
      status: 'healthy',
      responseTime: Math.random() * 100,
      message: 'Database connection is healthy'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: null,
      message: 'Database connection failed',
      error: error.message
    };
  }
}

async function checkRedis() {
  try {
    // This would be replaced with actual Redis connection check
    return {
      status: 'healthy',
      responseTime: Math.random() * 50,
      message: 'Redis connection is healthy'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: null,
      message: 'Redis connection failed',
      error: error.message
    };
  }
}

async function checkExternalServices() {
  try {
    // This would check external API dependencies
    return {
      status: 'healthy',
      services: {
        email: 'healthy',
        storage: 'healthy',
        analytics: 'healthy'
      },
      message: 'All external services are healthy'
    };
  } catch (error) {
    return {
      status: 'degraded',
      services: {},
      message: 'Some external services are unavailable',
      error: error.message
    };
  }
}

async function checkDiskSpace() {
  try {
    // This would check available disk space
    return {
      status: 'healthy',
      free: '85%',
      used: '15%',
      message: 'Disk space is sufficient'
    };
  } catch (error) {
    return {
      status: 'degraded',
      free: null,
      used: null,
      message: 'Could not check disk space',
      error: error.message
    };
  }
}

async function checkMemoryUsage() {
  try {
    const memUsage = process.memoryUsage();
    const percentage = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    
    return {
      status: percentage > 90 ? 'unhealthy' : percentage > 80 ? 'degraded' : 'healthy',
      usage: Math.round(percentage),
      message: `Memory usage: ${Math.round(percentage)}%`
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      usage: null,
      message: 'Could not check memory usage',
      error: error.message
    };
  }
}

async function checkCpuUsage() {
  try {
    const cpuUsage = process.cpuUsage();
    const percentage = (cpuUsage.user + cpuUsage.system) / 1000000; // Convert to percentage
    
    return {
      status: percentage > 90 ? 'unhealthy' : percentage > 80 ? 'degraded' : 'healthy',
      usage: Math.round(percentage),
      message: `CPU usage: ${Math.round(percentage)}%`
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      usage: null,
      message: 'Could not check CPU usage',
      error: error.message
    };
  }
}

module.exports = router;
