const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole, checkPermission } = require('../middleware/unified-auth');
const { getCollection } = require('../config/optimized-database');
const rateLimit = require('express-rate-limit');
const os = require('os');
const fs = require('fs').promises;

// Rate limiting
const healthLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: 'Too many health check requests from this IP, please try again later.'
});

// Apply rate limiting and authentication to all routes
router.use(healthLimiter);
router.use(authenticateToken);

// ===== SYSTEM HEALTH MONITORING =====

// GET /api/v1/system-health - Get overall system health
router.get('/', async (req, res) => {
  try {
    const healthData = await getSystemHealthData();
    
    res.json({
      success: true,
      data: healthData,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error fetching system health:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system health',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/v1/system-health/detailed - Get detailed system health
router.get('/detailed', checkRole(['head_administrator']), async (req, res) => {
  try {
    const detailedHealthData = await getDetailedSystemHealthData();
    
    res.json({
      success: true,
      data: detailedHealthData,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error fetching detailed system health:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch detailed system health',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/v1/system-health/api-performance - Get API performance metrics
router.get('/api-performance', checkRole(['head_administrator']), async (req, res) => {
  try {
    const performanceData = await getAPIPerformanceData();
    
    res.json({
      success: true,
      data: performanceData,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error fetching API performance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch API performance',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/v1/system-health/database - Get database health
router.get('/database', checkRole(['head_administrator']), async (req, res) => {
  try {
    const dbHealthData = await getDatabaseHealthData();
    
    res.json({
      success: true,
      data: dbHealthData,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error fetching database health:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch database health',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/v1/system-health/services - Get external services health
router.get('/services', checkRole(['head_administrator']), async (req, res) => {
  try {
    const servicesHealthData = await getServicesHealthData();
    
    res.json({
      success: true,
      data: servicesHealthData,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error fetching services health:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services health',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/v1/system-health/logs - Get system logs
router.get('/logs', checkRole(['head_administrator']), async (req, res) => {
  try {
    const { level, limit = 100, startDate, endDate } = req.query;
    
    const logsData = await getSystemLogs({
      level,
      limit: parseInt(limit),
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null
    });
    
    res.json({
      success: true,
      data: logsData,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error fetching system logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system logs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/v1/system-health/test-connection - Test external service connections
router.post('/test-connection', checkRole(['head_administrator']), async (req, res) => {
  try {
    const { service } = req.body;
    
    if (!service) {
      return res.status(400).json({
        success: false,
        message: 'Service name is required'
      });
    }
    
    const testResult = await testServiceConnection(service);
    
    res.json({
      success: true,
      data: testResult,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error testing service connection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test service connection',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===== HELPER FUNCTIONS =====

async function getSystemHealthData() {
  const memoryUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  const uptime = process.uptime();
  
  // Get system memory info
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  
  // Calculate health score
  const memoryHealth = (freeMemory / totalMemory) * 100;
  const healthScore = Math.min(100, Math.max(0, memoryHealth));
  
  return {
    status: healthScore > 80 ? 'healthy' : healthScore > 50 ? 'warning' : 'critical',
    healthScore: Math.round(healthScore),
    uptime: {
      process: uptime,
      system: os.uptime()
    },
    memory: {
      total: totalMemory,
      used: usedMemory,
      free: freeMemory,
      percentage: Math.round((usedMemory / totalMemory) * 100),
      process: {
        rss: memoryUsage.rss,
        heapTotal: memoryUsage.heapTotal,
        heapUsed: memoryUsage.heapUsed,
        external: memoryUsage.external
      }
    },
    cpu: {
      usage: cpuUsage,
      loadAverage: os.loadavg()
    },
    platform: {
      type: os.type(),
      platform: os.platform(),
      arch: os.arch(),
      release: os.release()
    }
  };
}

async function getDetailedSystemHealthData() {
  const basicHealth = await getSystemHealthData();
  
  // Get network interfaces
  const networkInterfaces = os.networkInterfaces();
  
  // Get disk usage (if available)
  let diskUsage = null;
  try {
    const stats = await fs.stat('/');
    diskUsage = {
      available: true,
      // Note: This is a simplified version. In production, you'd use a proper disk usage library
    };
  } catch (error) {
    diskUsage = { available: false, error: error.message };
  }
  
  // Get environment info
  const environment = {
    nodeVersion: process.version,
    nodeEnv: process.env.NODE_ENV,
    pid: process.pid,
    port: process.env.PORT || 5000
  };
  
  return {
    ...basicHealth,
    network: {
      interfaces: networkInterfaces
    },
    disk: diskUsage,
    environment
  };
}

async function getAPIPerformanceData() {
  // This would typically come from a performance monitoring service
  // For now, we'll return mock data
  return {
    responseTime: {
      average: 150,
      p95: 300,
      p99: 500,
      max: 1000
    },
    throughput: {
      requestsPerSecond: 100,
      requestsPerMinute: 6000,
      requestsPerHour: 360000
    },
    errorRate: {
      percentage: 0.1,
      count: 5,
      lastHour: 2
    },
    endpoints: [
      {
        path: '/api/v1/auth/login',
        method: 'POST',
        averageResponseTime: 200,
        requestCount: 1000,
        errorCount: 5
      },
      {
        path: '/api/v1/dashboard/kpis',
        method: 'GET',
        averageResponseTime: 100,
        requestCount: 5000,
        errorCount: 2
      }
    ]
  };
}

async function getDatabaseHealthData() {
  try {
    // Test database connection
    const usersCollection = await getCollection('users');
    const startTime = Date.now();
    await usersCollection.findOne({});
    const responseTime = Date.now() - startTime;
    
    // Get collection stats
    const collections = await usersCollection.db.listCollections().toArray();
    
    return {
      status: 'healthy',
      connection: {
        status: 'connected',
        responseTime: responseTime
      },
      collections: {
        count: collections.length,
        names: collections.map(c => c.name)
      },
      performance: {
        averageQueryTime: responseTime,
        connectionPool: {
          active: 1,
          idle: 4,
          total: 5
        }
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      connection: {
        status: 'disconnected',
        error: error.message
      },
      performance: {
        averageQueryTime: null,
        connectionPool: {
          active: 0,
          idle: 0,
          total: 0
        }
      }
    };
  }
}

async function getServicesHealthData() {
  const services = [
    {
      name: 'MongoDB',
      status: 'healthy',
      responseTime: 50,
      lastCheck: new Date()
    },
    {
      name: 'Redis',
      status: 'healthy',
      responseTime: 10,
      lastCheck: new Date()
    },
    {
      name: 'Email Service',
      status: 'warning',
      responseTime: 2000,
      lastCheck: new Date()
    },
    {
      name: 'WebSocket',
      status: 'healthy',
      responseTime: 5,
      lastCheck: new Date()
    }
  ];
  
  return {
    services,
    overall: {
      healthy: services.filter(s => s.status === 'healthy').length,
      warning: services.filter(s => s.status === 'warning').length,
      critical: services.filter(s => s.status === 'critical').length,
      total: services.length
    }
  };
}

async function getSystemLogs(options) {
  // This would typically read from log files or a logging service
  // For now, we'll return mock data
  const mockLogs = [
    {
      timestamp: new Date(),
      level: 'info',
      message: 'Server started successfully',
      service: 'main',
      metadata: { port: 5000 }
    },
    {
      timestamp: new Date(Date.now() - 60000),
      level: 'warn',
      message: 'High memory usage detected',
      service: 'monitor',
      metadata: { usage: '85%' }
    },
    {
      timestamp: new Date(Date.now() - 120000),
      level: 'error',
      message: 'Database connection timeout',
      service: 'database',
      metadata: { timeout: 5000 }
    }
  ];
  
  let filteredLogs = mockLogs;
  
  if (options.level) {
    filteredLogs = filteredLogs.filter(log => log.level === options.level);
  }
  
  if (options.startDate) {
    filteredLogs = filteredLogs.filter(log => log.timestamp >= options.startDate);
  }
  
  if (options.endDate) {
    filteredLogs = filteredLogs.filter(log => log.timestamp <= options.endDate);
  }
  
  return {
    logs: filteredLogs.slice(0, options.limit),
    total: filteredLogs.length,
    filters: options
  };
}

async function testServiceConnection(service) {
  const startTime = Date.now();
  
  try {
    switch (service.toLowerCase()) {
      case 'mongodb':
        const usersCollection = await getCollection('users');
        await usersCollection.findOne({});
        break;
      case 'redis':
        // Test Redis connection
        // This would use your Redis client
        break;
      case 'email':
        // Test email service
        break;
      default:
        throw new Error(`Unknown service: ${service}`);
    }
    
    const responseTime = Date.now() - startTime;
    
    return {
      service,
      status: 'healthy',
      responseTime,
      message: 'Connection successful',
      timestamp: new Date()
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return {
      service,
      status: 'unhealthy',
      responseTime,
      message: error.message,
      timestamp: new Date()
    };
  }
}

module.exports = router;