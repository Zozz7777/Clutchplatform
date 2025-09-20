/**
 * System Routes
 * System information and version endpoints
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/unified-auth');
const packageJson = require('../package.json');

// ==================== SYSTEM INFORMATION ====================

// GET /api/v1/system/version - Get system version information
router.get('/version', (req, res) => {
  try {
    const systemInfo = {
      name: packageJson.name || 'Clutch Backend',
      version: packageJson.version || '1.0.0',
      description: packageJson.description || 'Clutch Shared Backend API',
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: systemInfo,
      message: 'System version information retrieved successfully'
    });
  } catch (error) {
    console.error('Get system version error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_SYSTEM_VERSION_FAILED',
      message: 'Failed to retrieve system version information'
    });
  }
});

// GET /api/v1/system/info - Get detailed system information
router.get('/info', authenticateToken, (req, res) => {
  try {
    const systemInfo = {
      application: {
        name: packageJson.name || 'Clutch Backend',
        version: packageJson.version || '1.0.0',
        description: packageJson.description || 'Clutch Shared Backend API',
        author: packageJson.author || 'Clutch Team',
        license: packageJson.license || 'MIT'
      },
      runtime: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
        uptime: process.uptime(),
        memory: process.memoryUsage()
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 5000,
        database: process.env.MONGODB_URI ? 'Connected' : 'Not configured',
        redis: process.env.REDIS_URL ? 'Connected' : 'Not configured'
      },
      features: {
        ai: true,
        realtime: true,
        analytics: true,
        monitoring: true,
        caching: true,
        authentication: true,
        authorization: true
      },
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: systemInfo,
      message: 'System information retrieved successfully'
    });
  } catch (error) {
    console.error('Get system info error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_SYSTEM_INFO_FAILED',
      message: 'Failed to retrieve system information'
    });
  }
});

// GET /api/v1/system/status - Get system status
router.get('/status', (req, res) => {
  try {
    const status = {
      status: 'operational',
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        percentage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100)
      },
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: status,
      message: 'System status retrieved successfully'
    });
  } catch (error) {
    console.error('Get system status error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_SYSTEM_STATUS_FAILED',
      message: 'Failed to retrieve system status'
    });
  }
});

// GET /api/v1/system/health - Simple health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// GET /api/v1/system/ping - Simple ping endpoint
router.get('/ping', (req, res) => {
  res.json({
    success: true,
    message: 'pong',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
