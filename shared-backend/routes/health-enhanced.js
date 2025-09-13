const express = require('express');
const router = express.Router();

// Import database utilities
const { connectToDatabase, getCollection } = require('../config/database');
const { getEnvironmentInfo } = require('../utils/envValidator');
const { getPerformanceMetrics } = require('../middleware/performanceMonitor');

// Enhanced health check endpoint
router.get('/health', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Get environment information
    const envInfo = getEnvironmentInfo();
    
    // Test database connection
    let dbStatus = 'unknown';
    let dbResponseTime = 0;
    try {
      const dbStartTime = Date.now();
      const db = await connectToDatabase();
      if (db) {
        // Test a simple query
        const testCollection = await getCollection('health_check');
        await testCollection.findOne({ test: true });
        dbResponseTime = Date.now() - dbStartTime;
        dbStatus = 'healthy';
      }
    } catch (error) {
      dbStatus = 'unhealthy';
      console.error('Database health check failed:', error.message);
    }
    
    // Get performance metrics
    let performanceMetrics = null;
    try {
      performanceMetrics = getPerformanceMetrics();
    } catch (error) {
      console.warn('Failed to get performance metrics:', error.message);
    }
    
    const responseTime = Date.now() - startTime;
    
    const healthData = {
      status: dbStatus === 'healthy' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: envInfo.environment,
      version: process.env.npm_package_version || '1.0.0',
      responseTime: `${responseTime}ms`,
      services: {
        database: {
          status: dbStatus,
          responseTime: `${dbResponseTime}ms`
        },
        api: {
          status: 'healthy',
          responseTime: `${responseTime}ms`
        }
      },
      system: {
        nodeVersion: envInfo.nodeVersion,
        platform: envInfo.platform,
        arch: envInfo.arch,
        memoryUsage: {
          rss: Math.round(envInfo.memoryUsage.rss / 1024 / 1024),
          heapUsed: Math.round(envInfo.memoryUsage.heapUsed / 1024 / 1024),
          heapTotal: Math.round(envInfo.memoryUsage.heapTotal / 1024 / 1024),
          external: Math.round(envInfo.memoryUsage.external / 1024 / 1024)
        }
      }
    };
    
    // Add performance metrics if available
    if (performanceMetrics) {
      healthData.performance = {
        requestCount: performanceMetrics.requestCount,
        averageResponseTime: Math.round(performanceMetrics.averageResponseTime),
        requestsPerSecond: Math.round(performanceMetrics.requestsPerSecond * 100) / 100,
        slowRequests: performanceMetrics.slowestRequests.length
      };
    }
    
    const statusCode = healthData.status === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json({
      success: true,
      data: healthData
    });
    
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Detailed health check endpoint
router.get('/health/detailed', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Get comprehensive system information
    const envInfo = getEnvironmentInfo();
    const performanceMetrics = getPerformanceMetrics();
    
    // Test all major services
    const serviceChecks = {
      database: await checkDatabaseHealth(),
      redis: await checkRedisHealth(),
      external: await checkExternalServices()
    };
    
    const responseTime = Date.now() - startTime;
    
    const detailedHealth = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: `${responseTime}ms`,
      environment: envInfo,
      services: serviceChecks,
      performance: performanceMetrics,
      configuration: {
        nodeEnv: process.env.NODE_ENV,
        port: process.env.PORT,
        corsEnabled: process.env.ENABLE_CORS === 'true',
        rateLimitingEnabled: process.env.ENABLE_RATE_LIMITING === 'true',
        helmetEnabled: process.env.ENABLE_HELMET === 'true'
      }
    };
    
    // Determine overall status
    const unhealthyServices = Object.values(serviceChecks).filter(service => service.status !== 'healthy');
    if (unhealthyServices.length > 0) {
      detailedHealth.status = 'degraded';
    }
    
    const statusCode = detailedHealth.status === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json({
      success: true,
      data: detailedHealth
    });
    
  } catch (error) {
    console.error('Detailed health check error:', error);
    res.status(500).json({
      success: false,
      error: 'Detailed health check failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Database health check
async function checkDatabaseHealth() {
  try {
    const startTime = Date.now();
    const db = await connectToDatabase();
    
    if (!db) {
      return { status: 'unhealthy', error: 'Database connection failed' };
    }
    
    // Test a simple query
    const testCollection = await getCollection('health_check');
    await testCollection.findOne({ test: true });
    
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'healthy',
      responseTime: `${responseTime}ms`,
      connectionPool: 'active'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      responseTime: 'timeout'
    };
  }
}

// Redis health check
async function checkRedisHealth() {
  try {
    // Redis is optional, so we'll just check if it's configured
    if (!process.env.REDIS_URL) {
      return { status: 'not_configured', message: 'Redis not configured' };
    }
    
    // TODO: Add actual Redis connection test when Redis is implemented
    return { status: 'not_implemented', message: 'Redis health check not implemented' };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
}

// External services health check
async function checkExternalServices() {
  const services = {
    mongodb: { status: 'healthy' }, // Already checked in database health
    email: { status: 'not_implemented' },
    ai: { status: 'not_implemented' }
  };
  
  return services;
}


// Generic handlers for all HTTP methods
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: `${'health-enhanced'} service is running`,
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: '/'
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).json({
    success: true,
    message: `${'health-enhanced'} item retrieved`,
    data: { id: id, name: `Item ${id}`, status: 'active' },
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: `/${id}`
  });
});

router.post('/', (req, res) => {
  res.status(201).json({
    success: true,
    message: `${'health-enhanced'} item created`,
    data: { id: Date.now(), ...req.body, createdAt: new Date().toISOString() },
    timestamp: new Date().toISOString(),
    method: 'POST',
    path: '/'
  });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).json({
    success: true,
    message: `${'health-enhanced'} item updated`,
    data: { id: id, ...req.body, updatedAt: new Date().toISOString() },
    timestamp: new Date().toISOString(),
    method: 'PUT',
    path: `/${id}`
  });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).json({
    success: true,
    message: `${'health-enhanced'} item deleted`,
    data: { id: id, deletedAt: new Date().toISOString() },
    timestamp: new Date().toISOString(),
    method: 'DELETE',
    path: `/${id}`
  });
});

router.get('/search', (req, res) => {
  res.status(200).json({
    success: true,
    message: `${'health-enhanced'} search results`,
    data: { query: req.query.q || '', results: [], total: 0 },
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: '/search'
  });
});

module.exports = router;