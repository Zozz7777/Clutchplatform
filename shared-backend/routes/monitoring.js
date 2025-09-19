/**
 * Monitoring Routes
 * Handles system monitoring, health checks, and performance metrics
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole, checkPermission } = require('../middleware/unified-auth');
const { getCollection } = require('../config/optimized-database');

// GET /api/v1/monitoring/health - Get system health status
router.get('/health', authenticateToken, async (req, res) => {
  try {
    const healthCollection = await getCollection('system_health');
    const recentHealth = await healthCollection
      .findOne({}, { sort: { timestamp: -1 } });
    
    const status = recentHealth?.status || 'healthy';
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    res.json({
      success: true,
      data: {
        status,
        uptime: Math.floor(uptime),
        memory: {
          used: memoryUsage.heapUsed,
          total: memoryUsage.heapTotal,
          external: memoryUsage.external
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching system health:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch system health' });
  }
});

// GET /api/v1/monitoring/performance - Get performance metrics
router.get('/performance', authenticateToken, async (req, res) => {
  try {
    const performanceCollection = await getCollection('performance_metrics');
    const recentMetrics = await performanceCollection
      .find({})
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();
    
    const avgResponseTime = recentMetrics.reduce((sum, metric) => sum + (metric.responseTime || 0), 0) / recentMetrics.length;
    const avgCpuUsage = recentMetrics.reduce((sum, metric) => sum + (metric.cpuUsage || 0), 0) / recentMetrics.length;
    const avgMemoryUsage = recentMetrics.reduce((sum, metric) => sum + (metric.memoryUsage || 0), 0) / recentMetrics.length;
    
    res.json({
      success: true,
      data: {
        responseTime: Math.round(avgResponseTime * 100) / 100,
        cpuUsage: Math.round(avgCpuUsage * 100) / 100,
        memoryUsage: Math.round(avgMemoryUsage * 100) / 100,
        requestsPerSecond: recentMetrics.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch performance metrics' });
  }
});

// GET /api/v1/monitoring/alerts - Get system alerts
router.get('/alerts', authenticateToken, async (req, res) => {
  try {
    const alertsCollection = await getCollection('system_alerts');
    const alerts = await alertsCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();
    
    res.json({
      success: true,
      data: alerts.map(alert => ({
        id: alert._id.toString(),
        type: alert.type || 'info',
        severity: alert.severity || 'medium',
        message: alert.message || 'System alert',
        timestamp: alert.createdAt || new Date().toISOString(),
        status: alert.status || 'active'
      }))
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch alerts' });
  }
});

// GET /api/v1/monitoring/logs - Get system logs
router.get('/logs', authenticateToken, async (req, res) => {
  try {
    const logsCollection = await getCollection('system_logs');
    const { level, limit = 100 } = req.query;
    
    const query = level ? { level } : {};
    const logs = await logsCollection
      .find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .toArray();
    
    res.json({
      success: true,
      data: logs.map(log => ({
        id: log._id.toString(),
        level: log.level || 'info',
        message: log.message || 'Log entry',
        timestamp: log.timestamp || new Date().toISOString(),
        source: log.source || 'system'
      }))
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch logs' });
  }
});

// GET /api/v1/monitoring/alerts - Get system alerts
router.get('/alerts', authenticateToken, async (req, res) => {
  try {
    const alertsCollection = await getCollection('system_alerts');
    const { page = 1, limit = 50, status, severity, type } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (type) filter.type = type;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const alerts = await alertsCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await alertsCollection.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        alerts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching system alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system alerts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/v1/monitoring/logs - Get system logs
router.get('/logs', authenticateToken, async (req, res) => {
  try {
    const logsCollection = await getCollection('system_logs');
    const { page = 1, limit = 50, level, source, startDate, endDate } = req.query;
    
    const filter = {};
    if (level) filter.level = level;
    if (source) filter.source = source;
    if (startDate && endDate) {
      filter.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const logs = await logsCollection
      .find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await logsCollection.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
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

module.exports = router;
