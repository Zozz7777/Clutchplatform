const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole, checkPermission } = require('../middleware/unified-auth');
const RealSystemMonitoringService = require('../services/realSystemMonitoringService');
const RealPerformanceMetricsService = require('../services/realPerformanceMetricsService');
const rateLimit = require('express-rate-limit');

// Rate limiting
const performanceLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per windowMs
  message: 'Too many performance requests, please try again later.'
});

// Initialize monitoring services
const systemMonitor = new RealSystemMonitoringService();
const performanceMonitor = new RealPerformanceMetricsService();

// GET /api/v1/system/performance - Get system performance metrics
router.get('/performance', performanceLimiter, authenticateToken, async (req, res) => {
  try {
    const systemMetrics = await systemMonitor.getSystemMetrics();
    const performanceMetrics = performanceMonitor.getPerformanceMetrics();
    
    const combinedMetrics = {
      system: systemMetrics,
      performance: performanceMetrics,
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: combinedMetrics
    });
  } catch (error) {
    console.error('Error getting system performance metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get system performance metrics',
      message: error.message
    });
  }
});

// GET /api/v1/system/performance/cpu - Get CPU usage
router.get('/performance/cpu', performanceLimiter, authenticateToken, async (req, res) => {
  try {
    const cpuUsage = await systemMonitor.getCPUUsage();
    const memoryUsage = systemMonitor.getMemoryUsage();
    
    res.json({
      success: true,
      data: {
        cpu: cpuUsage,
        memory: memoryUsage,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting CPU metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get CPU metrics',
      message: error.message
    });
  }
});

// GET /api/v1/system/performance/network - Get network usage
router.get('/performance/network', performanceLimiter, authenticateToken, async (req, res) => {
  try {
    const networkUsage = await systemMonitor.getNetworkUsage();
    const diskUsage = await systemMonitor.getDiskUsage();
    
    res.json({
      success: true,
      data: {
        network: networkUsage,
        disk: diskUsage,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting network metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get network metrics',
      message: error.message
    });
  }
});

// GET /api/v1/system/performance/requests - Get request metrics
router.get('/performance/requests', performanceLimiter, authenticateToken, async (req, res) => {
  try {
    const requestMetrics = performanceMonitor.getPerformanceMetrics();
    const timeWindowMetrics = performanceMonitor.getMetricsForTimeWindow(5); // 5 minutes
    
    res.json({
      success: true,
      data: {
        overall: requestMetrics,
        recent: timeWindowMetrics,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting request metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get request metrics',
      message: error.message
    });
  }
});

// GET /api/v1/system/performance/health - Get system health status
router.get('/performance/health', performanceLimiter, authenticateToken, async (req, res) => {
  try {
    const healthStatus = performanceMonitor.getHealthStatus();
    const systemMetrics = await systemMonitor.getSystemMetrics();
    
    res.json({
      success: true,
      data: {
        health: healthStatus,
        system: systemMetrics,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting system health:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get system health',
      message: error.message
    });
  }
});

module.exports = router;
