const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { createSmartRateLimit } = require('../middleware/smartRateLimit');
const { validate } = require('../middleware/inputValidation');
const { logger } = require('../config/logger');
const { getCollection } = require('../config/database');
const { ObjectId } = require('mongodb');

// Rate limiting
const analyticsRateLimit = createSmartRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many analytics requests from this IP, please try again later.'
});

// Apply rate limiting to all analytics routes
router.use(analyticsRateLimit);

// ==================== ANALYTICS SYSTEM ====================

// Get all analytics
router.get('/', authenticateToken, requireRole(['admin', 'analytics', 'management']), async (req, res) => {
  try {
    const { page = 1, limit = 20, type, category, search } = req.query;
    const skip = (page - 1) * limit;
    
    const collection = await getCollection('analytics_reports');
    
    // Build query
    const query = {};
    if (type) query.type = type;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const [reports, total] = await Promise.all([
      collection
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray(),
      collection.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting analytics:', error);
    res.status(500).json({ 
      success: false,
      error: 'FETCH_ANALYTICS_FAILED',
      message: 'Failed to get analytics' 
    });
  }
});

// Get analytics by ID
router.get('/:id', authenticateToken, requireRole(['admin', 'analytics', 'management']), async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await getCollection('analytics_reports');
    
    const report = await collection.findOne({ _id: new ObjectId(id) });
    
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'ANALYTICS_REPORT_NOT_FOUND',
        message: 'Analytics report not found'
      });
    }
    
    res.json({
      success: true,
      data: report,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting analytics report:', error);
    res.status(500).json({ 
      success: false,
      error: 'FETCH_ANALYTICS_REPORT_FAILED',
      message: 'Failed to get analytics report' 
    });
  }
});

// Create new analytics report
router.post('/', authenticateToken, requireRole(['admin', 'analytics']), validate('analytics'), async (req, res) => {
  try {
    const { 
      name, 
      description, 
      type, 
      category, 
      metrics, 
      filters = {},
      schedule = null,
      status = 'draft'
    } = req.body;
    
    if (!name || !type || !metrics) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Name, type, and metrics are required'
      });
    }
    
    const collection = await getCollection('analytics_reports');
    
    const report = {
      name,
      description: description || '',
      type,
      category: category || 'general',
      metrics,
      filters,
      schedule,
      status,
      createdBy: req.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastRun: null,
      runCount: 0
    };
    
    const result = await collection.insertOne(report);
    
    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...report
      },
      message: 'Analytics report created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error creating analytics report:', error);
    res.status(500).json({ 
      success: false,
      error: 'CREATE_ANALYTICS_REPORT_FAILED',
      message: 'Failed to create analytics report' 
    });
  }
});

// Update analytics report
router.put('/:id', authenticateToken, requireRole(['admin', 'analytics']), validate('analyticsUpdate'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date(),
      updatedBy: req.user.id
    };
    
    const collection = await getCollection('analytics_reports');
    
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'ANALYTICS_REPORT_NOT_FOUND',
        message: 'Analytics report not found'
      });
    }
    
    const updatedReport = await collection.findOne({ _id: new ObjectId(id) });
    
    res.json({
      success: true,
      data: updatedReport,
      message: 'Analytics report updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating analytics report:', error);
    res.status(500).json({ 
      success: false,
      error: 'UPDATE_ANALYTICS_REPORT_FAILED',
      message: 'Failed to update analytics report' 
    });
  }
});

// Delete analytics report
router.delete('/:id', authenticateToken, requireRole(['admin', 'analytics']), async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await getCollection('analytics_reports');
    
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'ANALYTICS_REPORT_NOT_FOUND',
        message: 'Analytics report not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Analytics report deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error deleting analytics report:', error);
    res.status(500).json({ 
      success: false,
      error: 'DELETE_ANALYTICS_REPORT_FAILED',
      message: 'Failed to delete analytics report' 
    });
  }
});

// Run analytics report
router.post('/:id/run', authenticateToken, requireRole(['admin', 'analytics']), async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await getCollection('analytics_reports');
    
    const report = await collection.findOne({ _id: new ObjectId(id) });
    
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'ANALYTICS_REPORT_NOT_FOUND',
        message: 'Analytics report not found'
      });
    }
    
    // Simulate running the analytics report
    const analyticsData = await generateAnalyticsData(report);
    
    // Update report with last run info
    await collection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          lastRun: new Date(),
          updatedAt: new Date()
        },
        $inc: { runCount: 1 }
      }
    );
    
    res.json({
      success: true,
      data: {
        reportId: id,
        data: analyticsData,
        runAt: new Date()
      },
      message: 'Analytics report executed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error running analytics report:', error);
    res.status(500).json({ 
      success: false,
      error: 'RUN_ANALYTICS_REPORT_FAILED',
      message: 'Failed to run analytics report' 
    });
  }
});

// Get analytics dashboard data
router.get('/dashboard/overview', authenticateToken, requireRole(['admin', 'analytics', 'management']), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }
    
    const [
      totalReports,
      activeReports,
      reportsByType,
      reportsByCategory,
      recentRuns
    ] = await Promise.all([
      getCollection('analytics_reports').then(col => col.countDocuments(dateFilter)),
      getCollection('analytics_reports').then(col => col.countDocuments({ ...dateFilter, status: 'active' })),
      getCollection('analytics_reports').then(col => col.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]).toArray()),
      getCollection('analytics_reports').then(col => col.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]).toArray()),
      getCollection('analytics_reports').then(col => col.find({
        ...dateFilter,
        lastRun: { $exists: true }
      }).sort({ lastRun: -1 }).limit(10).toArray())
    ]);
    
    res.json({
      success: true,
      data: {
        overview: {
          totalReports,
          activeReports,
          inactiveReports: totalReports - activeReports
        },
        breakdown: {
          byType: reportsByType,
          byCategory: reportsByCategory
        },
        recentActivity: recentRuns
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting analytics dashboard:', error);
    res.status(500).json({ 
      success: false,
      error: 'FETCH_ANALYTICS_DASHBOARD_FAILED',
      message: 'Failed to get analytics dashboard' 
    });
  }
});

// Get analytics metrics
router.get('/metrics/:type', authenticateToken, requireRole(['admin', 'analytics', 'management']), async (req, res) => {
  try {
    const { type } = req.params;
    const { startDate, endDate, granularity = 'day' } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }
    
    let metricsData;
    
    switch (type) {
      case 'user-activity':
        metricsData = await getUserActivityMetrics(dateFilter, granularity);
        break;
      case 'system-performance':
        metricsData = await getSystemPerformanceMetrics(dateFilter, granularity);
        break;
      case 'business-metrics':
        metricsData = await getBusinessMetrics(dateFilter, granularity);
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'INVALID_METRICS_TYPE',
          message: 'Invalid metrics type'
        });
    }
    
    res.json({
      success: true,
      data: {
        type,
        granularity,
        metrics: metricsData,
        period: { startDate, endDate }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting analytics metrics:', error);
    res.status(500).json({ 
      success: false,
      error: 'FETCH_ANALYTICS_METRICS_FAILED',
      message: 'Failed to get analytics metrics' 
    });
  }
});

// Export analytics data
router.get('/export/:id', authenticateToken, requireRole(['admin', 'analytics']), async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'json' } = req.query;
    
    const collection = await getCollection('analytics_reports');
    const report = await collection.findOne({ _id: new ObjectId(id) });
    
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'ANALYTICS_REPORT_NOT_FOUND',
        message: 'Analytics report not found'
      });
    }
    
    const analyticsData = await generateAnalyticsData(report);
    
    if (format === 'csv') {
      const csvData = convertToCSV(analyticsData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=analytics-${id}.csv`);
      res.send(csvData);
    } else {
      res.json({
        success: true,
        data: {
          report,
          data: analyticsData,
          exportedAt: new Date()
        },
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    logger.error('Error exporting analytics data:', error);
    res.status(500).json({ 
      success: false,
      error: 'EXPORT_ANALYTICS_DATA_FAILED',
      message: 'Failed to export analytics data' 
    });
  }
});

// Helper functions
async function generateAnalyticsData(report) {
  // Simulate generating analytics data based on report configuration
  const data = {
    summary: {
      totalRecords: Math.floor(Math.random() * 10000) + 1000,
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date()
      }
    },
    metrics: report.metrics.map(metric => ({
      name: metric,
      value: Math.floor(Math.random() * 1000),
      change: (Math.random() - 0.5) * 20 // -10% to +10% change
    })),
    trends: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
      value: Math.floor(Math.random() * 100) + 50
    }))
  };
  
  return data;
}

async function getUserActivityMetrics(dateFilter, granularity) {
  // Simulate user activity metrics
  return {
    totalUsers: Math.floor(Math.random() * 1000) + 500,
    activeUsers: Math.floor(Math.random() * 500) + 200,
    newUsers: Math.floor(Math.random() * 100) + 50,
    userEngagement: Math.random() * 100
  };
}

async function getSystemPerformanceMetrics(dateFilter, granularity) {
  // Simulate system performance metrics
  return {
    responseTime: Math.random() * 500 + 100,
    uptime: 99.9,
    errorRate: Math.random() * 2,
    throughput: Math.floor(Math.random() * 1000) + 500
  };
}

async function getBusinessMetrics(dateFilter, granularity) {
  // Simulate business metrics
  return {
    revenue: Math.floor(Math.random() * 100000) + 50000,
    conversions: Math.floor(Math.random() * 1000) + 500,
    conversionRate: Math.random() * 10 + 2,
    customerSatisfaction: Math.random() * 2 + 3 // 3-5 rating
  };
}

function convertToCSV(data) {
  // Simple CSV conversion
  const headers = Object.keys(data.summary).join(',');
  const values = Object.values(data.summary).join(',');
  return `${headers}\n${values}`;
}

module.exports = router;
