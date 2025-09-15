/**
 * System Health & Monitoring Routes
 * Complete system health monitoring with real-time metrics and alerts
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { getCollection } = require('../config/optimized-database');
const { rateLimit: createRateLimit } = require('../middleware/rateLimit');
const { ObjectId } = require('mongodb');
const os = require('os');
const fs = require('fs').promises;

// Apply rate limiting
const systemHealthRateLimit = createRateLimit({ windowMs: 60 * 1000, max: 100 });

// ==================== SYSTEM HEALTH MONITORING ====================

// GET /api/v1/system-health/status - Get system health status
router.get('/status', authenticateToken, requireRole(['admin', 'devops']), systemHealthRateLimit, async (req, res) => {
  try {
    // Get system metrics
    const systemMetrics = {
      uptime: process.uptime(),
      memory: {
        used: process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal,
        external: process.memoryUsage().external,
        rss: process.memoryUsage().rss
      },
      cpu: {
        loadAverage: os.loadavg(),
        cpuCount: os.cpus().length,
        platform: os.platform(),
        arch: os.arch()
      },
      node: {
        version: process.version,
        pid: process.pid,
        title: process.title
      }
    };
    
    // Calculate health score
    const memoryUsagePercent = (systemMetrics.memory.used / systemMetrics.memory.total) * 100;
    const loadAverage = systemMetrics.cpu.loadAverage[0];
    const cpuUsagePercent = (loadAverage / systemMetrics.cpu.cpuCount) * 100;
    
    let healthScore = 100;
    if (memoryUsagePercent > 80) healthScore -= 20;
    if (memoryUsagePercent > 90) healthScore -= 30;
    if (cpuUsagePercent > 80) healthScore -= 20;
    if (cpuUsagePercent > 90) healthScore -= 30;
    
    const healthStatus = healthScore >= 80 ? 'healthy' : healthScore >= 60 ? 'warning' : 'critical';
    
    const systemHealth = {
      status: healthStatus,
      score: Math.max(0, healthScore),
      metrics: systemMetrics,
      timestamp: new Date()
    };
    
    res.json({
      success: true,
      data: systemHealth,
      message: 'System health status retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get system health status error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_SYSTEM_HEALTH_STATUS_FAILED',
      message: 'Failed to retrieve system health status',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/system-health/metrics - Get detailed system metrics
router.get('/metrics', authenticateToken, requireRole(['admin', 'devops']), systemHealthRateLimit, async (req, res) => {
  try {
    const { period = '1h' } = req.query;
    
    // Get current metrics
    const currentMetrics = {
      timestamp: new Date(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: {
        loadAverage: os.loadavg(),
        cpuCount: os.cpus().length
      },
      network: {
        interfaces: os.networkInterfaces()
      },
      disk: await getDiskUsage(),
      database: await getDatabaseMetrics(),
      redis: await getRedisMetrics()
    };
    
    // Get historical metrics if available
    const metricsCollection = await getCollection('system_metrics');
    const endDate = new Date();
    const startDate = new Date();
    startDate.setHours(endDate.getHours() - parseInt(period.replace('h', '')));
    
    const historicalMetrics = await metricsCollection
      .find({
        timestamp: { $gte: startDate, $lte: endDate }
      })
      .sort({ timestamp: 1 })
      .toArray();
    
    // Store current metrics
    await metricsCollection.insertOne(currentMetrics);
    
    res.json({
      success: true,
      data: {
        current: currentMetrics,
        historical: historicalMetrics,
        period
      },
      message: 'System metrics retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get system metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_SYSTEM_METRICS_FAILED',
      message: 'Failed to retrieve system metrics',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== PERFORMANCE MONITORING ====================

// GET /api/v1/system-health/performance - Get performance metrics
router.get('/performance', authenticateToken, requireRole(['admin', 'devops']), systemHealthRateLimit, async (req, res) => {
  try {
    const { period = '24h' } = req.query;
    
    const performanceCollection = await getCollection('performance_metrics');
    const endDate = new Date();
    const startDate = new Date();
    startDate.setHours(endDate.getHours() - parseInt(period.replace('h', '')));
    
    const performanceMetrics = await performanceCollection
      .find({
        timestamp: { $gte: startDate, $lte: endDate }
      })
      .sort({ timestamp: -1 })
      .toArray();
    
    // Calculate performance statistics
    const responseTimes = performanceMetrics.map(m => m.responseTime).filter(t => t);
    const throughput = performanceMetrics.map(m => m.requestsPerSecond).filter(t => t);
    const errorRates = performanceMetrics.map(m => m.errorRate).filter(r => r);
    
    const performanceStats = {
      averageResponseTime: responseTimes.length > 0 ? 
        responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0,
      maxResponseTime: responseTimes.length > 0 ? Math.max(...responseTimes) : 0,
      minResponseTime: responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
      averageThroughput: throughput.length > 0 ? 
        throughput.reduce((a, b) => a + b, 0) / throughput.length : 0,
      averageErrorRate: errorRates.length > 0 ? 
        errorRates.reduce((a, b) => a + b, 0) / errorRates.length : 0,
      totalRequests: performanceMetrics.reduce((sum, m) => sum + (m.totalRequests || 0), 0),
      totalErrors: performanceMetrics.reduce((sum, m) => sum + (m.totalErrors || 0), 0)
    };
    
    res.json({
      success: true,
      data: {
        metrics: performanceMetrics,
        statistics: performanceStats,
        period
      },
      message: 'Performance metrics retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get performance metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_PERFORMANCE_METRICS_FAILED',
      message: 'Failed to retrieve performance metrics',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/system-health/performance - Record performance metric
router.post('/performance', authenticateToken, requireRole(['admin', 'system']), systemHealthRateLimit, async (req, res) => {
  try {
    const {
      endpoint,
      method,
      responseTime,
      statusCode,
      requestsPerSecond,
      errorRate,
      totalRequests,
      totalErrors
    } = req.body;
    
    if (!endpoint || !method || responseTime === undefined) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Endpoint, method, and response time are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const performanceCollection = await getCollection('performance_metrics');
    
    const performanceMetric = {
      endpoint,
      method,
      responseTime: parseFloat(responseTime),
      statusCode: statusCode || 200,
      requestsPerSecond: requestsPerSecond || 0,
      errorRate: errorRate || 0,
      totalRequests: totalRequests || 1,
      totalErrors: totalErrors || 0,
      timestamp: new Date(),
      createdAt: new Date()
    };
    
    const result = await performanceCollection.insertOne(performanceMetric);
    
    res.status(201).json({
      success: true,
      data: { performanceMetric: { ...performanceMetric, _id: result.insertedId } },
      message: 'Performance metric recorded successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Record performance metric error:', error);
    res.status(500).json({
      success: false,
      error: 'RECORD_PERFORMANCE_METRIC_FAILED',
      message: 'Failed to record performance metric',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== ALERT MANAGEMENT ====================

// GET /api/v1/system-health/alerts - Get system alerts
router.get('/alerts', authenticateToken, requireRole(['admin', 'devops']), systemHealthRateLimit, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      severity, 
      status, 
      startDate, 
      endDate 
    } = req.query;
    const skip = (page - 1) * limit;
    
    const alertsCollection = await getCollection('system_alerts');
    
    // Build query
    const query = {};
    if (severity) query.severity = severity;
    if (status) query.status = status;
    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const alerts = await alertsCollection
      .find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await alertsCollection.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        alerts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'System alerts retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get system alerts error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_SYSTEM_ALERTS_FAILED',
      message: 'Failed to retrieve system alerts',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/system-health/alerts - Create system alert
router.post('/alerts', authenticateToken, requireRole(['admin', 'system']), systemHealthRateLimit, async (req, res) => {
  try {
    const {
      type,
      severity,
      title,
      description,
      source,
      metadata,
      acknowledged
    } = req.body;
    
    if (!type || !severity || !title || !description) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Type, severity, title, and description are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const alertsCollection = await getCollection('system_alerts');
    
    const newAlert = {
      type,
      severity,
      title,
      description,
      source: source || 'system',
      metadata: metadata || {},
      status: acknowledged ? 'acknowledged' : 'active',
      acknowledged: acknowledged || false,
      acknowledgedBy: acknowledged ? req.user.userId : null,
      acknowledgedAt: acknowledged ? new Date() : null,
      timestamp: new Date(),
      createdAt: new Date()
    };
    
    const result = await alertsCollection.insertOne(newAlert);
    
    res.status(201).json({
      success: true,
      data: { alert: { ...newAlert, _id: result.insertedId } },
      message: 'System alert created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create system alert error:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_SYSTEM_ALERT_FAILED',
      message: 'Failed to create system alert',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/v1/system-health/alerts/:id/acknowledge - Acknowledge alert
router.put('/alerts/:id/acknowledge', authenticateToken, requireRole(['admin', 'devops']), systemHealthRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    
    const alertsCollection = await getCollection('system_alerts');
    
    const updateData = {
      status: 'acknowledged',
      acknowledged: true,
      acknowledgedBy: req.user.userId,
      acknowledgedAt: new Date(),
      notes: notes || null,
      updatedAt: new Date()
    };
    
    const result = await alertsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'ALERT_NOT_FOUND',
        message: 'Alert not found',
        timestamp: new Date().toISOString()
      });
    }
    
    const updatedAlert = await alertsCollection.findOne({ _id: new ObjectId(id) });
    
    res.json({
      success: true,
      data: { alert: updatedAlert },
      message: 'Alert acknowledged successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Acknowledge alert error:', error);
    res.status(500).json({
      success: false,
      error: 'ACKNOWLEDGE_ALERT_FAILED',
      message: 'Failed to acknowledge alert',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== LOG MONITORING ====================

// GET /api/v1/system-health/logs - Get system logs
router.get('/logs', authenticateToken, requireRole(['admin', 'devops']), systemHealthRateLimit, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 100, 
      level, 
      startDate, 
      endDate, 
      search 
    } = req.query;
    const skip = (page - 1) * limit;
    
    const logsCollection = await getCollection('system_logs');
    
    // Build query
    const query = {};
    if (level) query.level = level;
    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (search) {
      query.$or = [
        { message: { $regex: search, $options: 'i' } },
        { service: { $regex: search, $options: 'i' } }
      ];
    }
    
    const logs = await logsCollection
      .find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await logsCollection.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'System logs retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get system logs error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_SYSTEM_LOGS_FAILED',
      message: 'Failed to retrieve system logs',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== SYSTEM ANALYTICS ====================

// GET /api/v1/system-health/analytics - Get system analytics
router.get('/analytics', authenticateToken, requireRole(['admin', 'devops']), systemHealthRateLimit, async (req, res) => {
  try {
    const { period = '24h' } = req.query;
    
    const metricsCollection = await getCollection('system_metrics');
    const performanceCollection = await getCollection('performance_metrics');
    const alertsCollection = await getCollection('system_alerts');
    const logsCollection = await getCollection('system_logs');
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setHours(endDate.getHours() - parseInt(period.replace('h', '')));
    
    // System metrics analytics
    const systemMetrics = await metricsCollection
      .find({ timestamp: { $gte: startDate, $lte: endDate } })
      .sort({ timestamp: 1 })
      .toArray();
    
    // Performance analytics
    const performanceMetrics = await performanceCollection
      .find({ timestamp: { $gte: startDate, $lte: endDate } })
      .sort({ timestamp: 1 })
      .toArray();
    
    // Alert analytics
    const totalAlerts = await alertsCollection.countDocuments({
      timestamp: { $gte: startDate, $lte: endDate }
    });
    const criticalAlerts = await alertsCollection.countDocuments({
      timestamp: { $gte: startDate, $lte: endDate },
      severity: 'critical'
    });
    const acknowledgedAlerts = await alertsCollection.countDocuments({
      timestamp: { $gte: startDate, $lte: endDate },
      status: 'acknowledged'
    });
    
    // Log analytics
    const totalLogs = await logsCollection.countDocuments({
      timestamp: { $gte: startDate, $lte: endDate }
    });
    const errorLogs = await logsCollection.countDocuments({
      timestamp: { $gte: startDate, $lte: endDate },
      level: 'error'
    });
    
    // Calculate trends
    const memoryTrend = systemMetrics.map(m => ({
      timestamp: m.timestamp,
      memoryUsage: (m.memory.used / m.memory.total) * 100
    }));
    
    const responseTimeTrend = performanceMetrics.map(m => ({
      timestamp: m.timestamp,
      responseTime: m.responseTime
    }));
    
    const analytics = {
      overview: {
        totalAlerts,
        criticalAlerts,
        acknowledgedAlerts,
        totalLogs,
        errorLogs,
        systemUptime: process.uptime()
      },
      trends: {
        memory: memoryTrend,
        responseTime: responseTimeTrend
      },
      period,
      generatedAt: new Date()
    };
    
    res.json({
      success: true,
      data: analytics,
      message: 'System analytics retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get system analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_SYSTEM_ANALYTICS_FAILED',
      message: 'Failed to retrieve system analytics',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== HELPER FUNCTIONS ====================

async function getDiskUsage() {
  try {
    const stats = await fs.stat('/');
    return {
      total: stats.size || 0,
      free: stats.size || 0,
      used: 0
    };
  } catch (error) {
    return {
      total: 0,
      free: 0,
      used: 0
    };
  }
}

async function getDatabaseMetrics() {
  try {
    const db = require('../config/optimized-database');
    const collections = await db.getCollection('users').db.listCollections().toArray();
    return {
      connected: true,
      collections: collections.length,
      status: 'healthy'
    };
  } catch (error) {
    return {
      connected: false,
      collections: 0,
      status: 'error',
      error: error.message
    };
  }
}

async function getRedisMetrics() {
  try {
    const redis = require('../config/optimized-redis');
    if (redis.isConnected) {
      return {
        connected: true,
        status: 'healthy'
      };
    } else {
      return {
        connected: false,
        status: 'disconnected'
      };
    }
  } catch (error) {
    return {
      connected: false,
      status: 'error',
      error: error.message
    };
  }
}

// ==================== GENERIC HANDLERS ====================

// GET /api/v1/system-health - Get system health overview
router.get('/', authenticateToken, requireRole(['admin', 'devops']), systemHealthRateLimit, async (req, res) => {
  res.json({
    success: true,
    message: 'System Health & Monitoring API is running',
    endpoints: {
      status: '/api/v1/system-health/status',
      metrics: '/api/v1/system-health/metrics',
      performance: '/api/v1/system-health/performance',
      alerts: '/api/v1/system-health/alerts',
      logs: '/api/v1/system-health/logs',
      analytics: '/api/v1/system-health/analytics'
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
