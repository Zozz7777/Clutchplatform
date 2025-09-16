/**
 * Performance Monitoring Routes
 * Handles system performance metrics and monitoring
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { checkRole, checkPermission } = require('../middleware/rbac');
const { getCollection } = require('../config/optimized-database');

// GET /api/v1/performance/monitor - Get performance metrics
router.get('/monitor', authenticateToken, checkRole(['head_administrator', 'system_admin']), async (req, res) => {
  try {
    const analyticsCollection = await getCollection('analytics');
    
    // Get real-time system metrics
    const systemMetrics = {
      uptime: process.uptime(),
      memory: {
        used: process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal,
        percentage: (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal * 100).toFixed(2)
      },
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    };
    
    // Get database performance metrics
    const dbMetrics = await analyticsCollection.aggregate([
      {
        $match: {
          type: 'performance',
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
        }
      },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: '$responseTime' },
          totalRequests: { $sum: '$requestCount' },
          errorRate: { $avg: '$errorRate' }
        }
      }
    ]).toArray();
    
    // Get application metrics from database
    const [userStats, bookingStats, transactionStats] = await Promise.all([
      analyticsCollection.countDocuments({ type: 'user_activity' }),
      analyticsCollection.countDocuments({ type: 'booking_activity' }),
      analyticsCollection.countDocuments({ type: 'transaction_activity' })
    ]);
    
    const metrics = {
      system: systemMetrics,
      database: dbMetrics[0] || { avgResponseTime: 0, totalRequests: 0, errorRate: 0 },
      application: {
        totalUsers: userStats,
        totalBookings: bookingStats,
        totalTransactions: transactionStats
      },
      timestamp: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: { metrics },
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

// GET /api/v1/performance/analytics - Get detailed analytics
router.get('/analytics', authenticateToken, checkRole(['head_administrator', 'system_admin']), async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    const analyticsCollection = await getCollection('analytics');
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }
    
    if (type) dateFilter.type = type;
    
    // Get analytics data
    const analytics = await analyticsCollection
      .find(dateFilter)
      .sort({ createdAt: -1 })
      .limit(1000)
      .toArray();
    
    res.json({
      success: true,
      data: { analytics },
      message: 'Analytics data retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_ANALYTICS_FAILED',
      message: 'Failed to retrieve analytics data',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/performance/metrics - Record performance metric
router.post('/metrics', authenticateToken, async (req, res) => {
  try {
    const { 
      type, 
      responseTime, 
      requestCount = 1, 
      errorRate = 0, 
      endpoint,
      method,
      statusCode
    } = req.body;
    
    if (!type) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_TYPE',
        message: 'Type is required',
        timestamp: new Date().toISOString()
      });
    }
    
    const analyticsCollection = await getCollection('analytics');
    
    const metric = {
      type,
      responseTime: parseFloat(responseTime) || 0,
      requestCount: parseInt(requestCount),
      errorRate: parseFloat(errorRate),
      endpoint: endpoint || null,
      method: method || null,
      statusCode: parseInt(statusCode) || null,
      recordedBy: req.user.userId,
      createdAt: new Date()
    };
    
    const result = await analyticsCollection.insertOne(metric);
    
    res.status(201).json({
      success: true,
      data: {
        metric: {
          ...metric,
          _id: result.insertedId
        }
      },
      message: 'Performance metric recorded successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Record performance metric error:', error);
    res.status(500).json({
      success: false,
      error: 'RECORD_METRIC_FAILED',
      message: 'Failed to record performance metric',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/performance/health - Get system health status
router.get('/health', authenticateToken, checkRole(['head_administrator', 'system_admin']), async (req, res) => {
  try {
    const analyticsCollection = await getCollection('analytics');
    
    // Check database connectivity
    let dbHealth = 'healthy';
    try {
      await analyticsCollection.findOne({});
    } catch (error) {
      dbHealth = 'unhealthy';
    }
    
    // Check memory usage
    const memoryUsage = process.memoryUsage();
    const memoryHealth = memoryUsage.heapUsed / memoryUsage.heapTotal > 0.9 ? 'warning' : 'healthy';
    
    // Check uptime
    const uptime = process.uptime();
    const uptimeHealth = uptime < 60 ? 'warning' : 'healthy'; // Less than 1 minute uptime
    
    const health = {
      status: dbHealth === 'healthy' && memoryHealth === 'healthy' && uptimeHealth === 'healthy' ? 'healthy' : 'warning',
      checks: {
        database: dbHealth,
        memory: memoryHealth,
        uptime: uptimeHealth
      },
      details: {
        uptime: uptime,
        memory: {
          used: memoryUsage.heapUsed,
          total: memoryUsage.heapTotal,
          percentage: (memoryUsage.heapUsed / memoryUsage.heapTotal * 100).toFixed(2)
        },
        timestamp: new Date().toISOString()
      }
    };
    
    res.json({
      success: true,
      data: { health },
      message: 'System health status retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get system health error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_SYSTEM_HEALTH_FAILED',
      message: 'Failed to retrieve system health status',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/performance/reports - Get performance reports
router.get('/reports', authenticateToken, checkRole(['head_administrator', 'system_admin']), async (req, res) => {
  try {
    const { period = '24h' } = req.query;
    
    // Calculate time range based on period
    let timeRange;
    switch (period) {
      case '1h':
        timeRange = 60 * 60 * 1000; // 1 hour
        break;
      case '24h':
        timeRange = 24 * 60 * 60 * 1000; // 24 hours
        break;
      case '7d':
        timeRange = 7 * 24 * 60 * 60 * 1000; // 7 days
        break;
      case '30d':
        timeRange = 30 * 24 * 60 * 60 * 1000; // 30 days
        break;
      default:
        timeRange = 24 * 60 * 60 * 1000; // Default to 24 hours
    }
    
    const startDate = new Date(Date.now() - timeRange);
    const analyticsCollection = await getCollection('analytics');
    
    // Get performance summary
    const performanceSummary = await analyticsCollection.aggregate([
      {
        $match: {
          type: 'performance',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: '$responseTime' },
          maxResponseTime: { $max: '$responseTime' },
          minResponseTime: { $min: '$responseTime' },
          totalRequests: { $sum: '$requestCount' },
          avgErrorRate: { $avg: '$errorRate' },
          maxErrorRate: { $max: '$errorRate' }
        }
      }
    ]).toArray();
    
    // Get hourly performance data
    const hourlyData = await analyticsCollection.aggregate([
      {
        $match: {
          type: 'performance',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d %H:00:00',
              date: '$createdAt'
            }
          },
          avgResponseTime: { $avg: '$responseTime' },
          totalRequests: { $sum: '$requestCount' },
          avgErrorRate: { $avg: '$errorRate' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]).toArray();
    
    const report = {
      period,
      summary: performanceSummary[0] || {
        avgResponseTime: 0,
        maxResponseTime: 0,
        minResponseTime: 0,
        totalRequests: 0,
        avgErrorRate: 0,
        maxErrorRate: 0
      },
      hourlyData,
      generatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: { report },
      message: 'Performance report generated successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get performance report error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_PERFORMANCE_REPORT_FAILED',
      message: 'Failed to generate performance report',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;