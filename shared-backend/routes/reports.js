const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole, checkPermission } = require('../middleware/unified-auth');
const { getCollection } = require('../config/optimized-database');
const rateLimit = require('express-rate-limit');
const RealAnalyticsService = require('../services/realAnalyticsService');

// Rate limiting
const reportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: 'Too many report requests from this IP, please try again later.'
});

// Apply rate limiting and authentication to all routes
router.use(reportLimiter);
router.use(authenticateToken);

// ===== REPORTS MANAGEMENT =====

// GET /api/v1/reports - Get all reports
router.get('/', async (req, res) => {
  try {
    const reportsCollection = await getCollection('reports');
    const { page = 1, limit = 10, type, status, category } = req.query;
    
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (category) filter.category = category;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const reports = await reportsCollection
      .find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .toArray();
    
    const total = await reportsCollection.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/v1/reports/generate - Generate a new report
router.post('/generate', checkRole(['head_administrator', 'analyst', 'manager']), async (req, res) => {
  try {
    const { type, parameters, format = 'json', dateRange } = req.body;
    
    // Validate required fields
    if (!type) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REPORT_TYPE',
        message: 'Report type is required',
        timestamp: new Date().toISOString()
      });
    }
    
    const reportsCollection = await getCollection('reports');
    
    // Create report record
    const reportData = {
      type,
      parameters: parameters || {},
      format,
      dateRange: dateRange || {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        end: new Date()
      },
      status: 'generating',
      createdBy: req.user.userId || req.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await reportsCollection.insertOne(reportData);
    
    // Generate real report data based on type
    let reportMetrics = {};
    let chartData = [];
    
    // Get collections for data aggregation
    const usersCollection = await getCollection('users');
    const paymentsCollection = await getCollection('payments');
    const bookingsCollection = await getCollection('bookings');
    const ordersCollection = await getCollection('orders');
    
    // Calculate metrics based on report type
    switch (type) {
      case 'financial':
        const [totalRevenue, totalUsers, totalOrders] = await Promise.all([
          paymentsCollection.aggregate([
            {
              $match: {
                status: 'completed',
                createdAt: { $gte: reportData.dateRange.start, $lte: reportData.dateRange.end }
              }
            },
            {
              $group: {
                _id: null,
                total: { $sum: '$amount' }
              }
            }
          ]).toArray(),
          usersCollection.countDocuments({
            createdAt: { $gte: reportData.dateRange.start, $lte: reportData.dateRange.end }
          }),
          ordersCollection.countDocuments({
            createdAt: { $gte: reportData.dateRange.start, $lte: reportData.dateRange.end }
          })
        ]);
        
        // Generate revenue trend data
        const revenueTrend = await paymentsCollection.aggregate([
          {
            $match: {
              status: 'completed',
              createdAt: { $gte: reportData.dateRange.start, $lte: reportData.dateRange.end }
            }
          },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
                day: { $dayOfMonth: '$createdAt' }
              },
              dailyRevenue: { $sum: '$amount' }
            }
          },
          {
            $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
          }
        ]).toArray();
        
        reportMetrics = {
          revenue: totalRevenue[0]?.total || 0,
          users: totalUsers,
          orders: totalOrders
        };
        
        chartData = [
          {
            type: 'line',
            title: 'Revenue Trend',
            data: revenueTrend.map(item => ({
              date: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}`,
              value: item.dailyRevenue
            }))
          }
        ];
        break;
        
      case 'user_analytics':
        const [newUsers, activeUsers, userGrowth] = await Promise.all([
          usersCollection.countDocuments({
            createdAt: { $gte: reportData.dateRange.start, $lte: reportData.dateRange.end }
          }),
          usersCollection.countDocuments({
            lastActive: { $gte: reportData.dateRange.start, $lte: reportData.dateRange.end }
          }),
          usersCollection.aggregate([
            {
              $match: {
                createdAt: { $gte: reportData.dateRange.start, $lte: reportData.dateRange.end }
              }
            },
            {
              $group: {
                _id: {
                  year: { $year: '$createdAt' },
                  month: { $month: '$createdAt' },
                  day: { $dayOfMonth: '$createdAt' }
                },
                dailyUsers: { $sum: 1 }
              }
            },
            {
              $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
            }
          ]).toArray()
        ]);
        
        reportMetrics = {
          newUsers,
          activeUsers,
          totalUsers: newUsers + activeUsers
        };
        
        chartData = [
          {
            type: 'bar',
            title: 'User Growth',
            data: userGrowth.map(item => ({
              date: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}`,
              value: item.dailyUsers
            }))
          }
        ];
        break;
        
      default:
        reportMetrics = {
          revenue: 0,
          users: 0,
          orders: 0
        };
        chartData = [];
    }
    
    const generatedReport = {
      id: result.insertedId,
      type,
      data: {
        summary: {
          totalRecords: Object.values(reportMetrics).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0),
          dateRange: reportData.dateRange,
          generatedAt: new Date().toISOString()
        },
        metrics: reportMetrics,
        charts: chartData
      },
      status: 'completed',
      completedAt: new Date()
    };
    
    // Update report with generated data
    await reportsCollection.updateOne(
      { _id: result.insertedId },
      { 
        $set: { 
          ...generatedReport,
          updatedAt: new Date()
        }
      }
    );
    
    res.json({
      success: true,
      data: {
        report: {
          ...reportData,
          _id: result.insertedId,
          ...generatedReport
        }
      },
      message: 'Report generated successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({
      success: false,
      error: 'GENERATE_REPORT_FAILED',
      message: 'Failed to generate report',
      timestamp: new Date().toISOString()
    });
  }
});


// POST /api/v1/reports - Create new report
router.post('/', checkRole(['head_administrator', 'report_manager']), async (req, res) => {
  try {
    const reportsCollection = await getCollection('reports');
    const { 
      name, 
      type, 
      category, 
      description, 
      parameters, 
      schedule, 
      format, 
      recipients, 
      status 
    } = req.body;
    
    if (!name || !type || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, type, and category are required'
      });
    }
    
    const report = {
      name,
      type,
      category,
      description: description || '',
      parameters: parameters || {},
      schedule: schedule || null,
      format: format || 'pdf',
      recipients: recipients || [],
      status: status || 'draft',
      createdBy: req.user.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastGenerated: null,
      generationCount: 0
    };
    
    const result = await reportsCollection.insertOne(report);
    
    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...report
      },
      message: 'Report created successfully'
    });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});



// ===== REPORT GENERATION =====

// POST /api/v1/reports/generate - Generate report
router.post('/generate', checkRole(['head_administrator', 'report_manager', 'employee']), async (req, res) => {
  try {
    const reportsCollection = await getCollection('reports');
    const { reportId, parameters, format, emailTo } = req.body;
    
    if (!reportId) {
      return res.status(400).json({
        success: false,
        message: 'Report ID is required'
      });
    }
    
    const report = await reportsCollection.findOne({ _id: reportId });
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }
    
    // Generate report data based on type
    let reportData = {};
    const reportParams = { ...report.parameters, ...parameters };
    
    switch (report.type) {
      case 'dashboard':
        reportData = await generateDashboardReport(reportParams);
        break;
      case 'users':
        reportData = await generateUsersReport(reportParams);
        break;
      case 'vehicles':
        reportData = await generateVehiclesReport(reportParams);
        break;
      case 'bookings':
        reportData = await generateBookingsReport(reportParams);
        break;
      case 'financial':
        reportData = await generateFinancialReport(reportParams);
        break;
      case 'performance':
        reportData = await generatePerformanceReport(reportParams);
        break;
      default:
        reportData = { message: 'Report type not implemented' };
    }
    
    // Update report generation stats
    await reportsCollection.updateOne(
      { _id: reportId },
      { 
        $set: { 
          lastGenerated: new Date(),
          updatedAt: new Date()
        },
        $inc: { generationCount: 1 }
      }
    );
    
    // If email is requested, send report
    if (emailTo) {
      // TODO: Implement email sending functionality
      console.log(`Report would be emailed to: ${emailTo}`);
    }
    
    res.json({
      success: true,
      data: {
        reportId,
        generatedAt: new Date(),
        format: format || report.format,
        data: reportData
      },
      message: 'Report generated successfully'
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===== REPORT TEMPLATES =====

// GET /api/v1/reports/templates - Get report templates
router.get('/templates', async (req, res) => {
  try {
    const templatesCollection = await getCollection('report_templates');
    const { category, type } = req.query;
    
    const filter = {};
    if (category) filter.category = category;
    if (type) filter.type = type;
    
    const templates = await templatesCollection
      .find(filter)
      .sort({ name: 1 })
      .toArray();
    
    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Error fetching report templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report templates',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/v1/reports/templates - Create report template
router.post('/templates', checkRole(['head_administrator', 'report_manager']), async (req, res) => {
  try {
    const templatesCollection = await getCollection('report_templates');
    const { 
      name, 
      category, 
      type, 
      description, 
      template, 
      parameters, 
      format 
    } = req.body;
    
    if (!name || !category || !type || !template) {
      return res.status(400).json({
        success: false,
        message: 'Name, category, type, and template are required'
      });
    }
    
    const reportTemplate = {
      name,
      category,
      type,
      description: description || '',
      template,
      parameters: parameters || {},
      format: format || 'pdf',
      createdBy: req.user.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0
    };
    
    const result = await templatesCollection.insertOne(reportTemplate);
    
    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...reportTemplate
      },
      message: 'Report template created successfully'
    });
  } catch (error) {
    console.error('Error creating report template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create report template',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===== REPORT ANALYTICS =====

// GET /api/v1/reports/analytics - Get reports analytics
router.get('/analytics/overview', async (req, res) => {
  try {
    const reportsCollection = await getCollection('reports');
    const templatesCollection = await getCollection('report_templates');
    
    const totalReports = await reportsCollection.countDocuments();
    const activeReports = await reportsCollection.countDocuments({ status: 'active' });
    const draftReports = await reportsCollection.countDocuments({ status: 'draft' });
    
    // Get reports by type
    const typeStats = await reportsCollection.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]).toArray();
    
    // Get reports by category
    const categoryStats = await reportsCollection.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]).toArray();
    
    // Get total generations
    const totalGenerations = await reportsCollection.aggregate([
      { $group: { _id: null, total: { $sum: '$generationCount' } } }
    ]).toArray();
    
    // Get templates stats
    const totalTemplates = await templatesCollection.countDocuments();
    const templateUsage = await templatesCollection.aggregate([
      { $group: { _id: null, total: { $sum: '$usageCount' } } }
    ]).toArray();
    
    res.json({
      success: true,
      data: {
        overview: {
          totalReports,
          activeReports,
          draftReports,
          totalGenerations: totalGenerations[0]?.total || 0
        },
        typeStats,
        categoryStats,
        templates: {
          totalTemplates,
          totalUsage: templateUsage[0]?.total || 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching reports analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===== HELPER FUNCTIONS =====

async function generateDashboardReport(params) {
  // Generate real dashboard report data using analytics service
  try {
    const analyticsService = new RealAnalyticsService();
    const timeRange = params.timeRange || '7d';
    
    const dashboardData = await analyticsService.getDashboardAnalytics(timeRange);
    
    return {
      summary: {
        totalUsers: dashboardData.users.totalUsers,
        totalVehicles: dashboardData.fleet.totalVehicles,
        totalBookings: dashboardData.bookings.totalBookings,
        totalRevenue: dashboardData.revenue.totalRevenue
      },
      charts: {
        userGrowth: dashboardData.users.dailyGrowth || [],
        revenueTrend: dashboardData.revenue.dailyRevenue || []
      },
      generatedAt: new Date()
    };
  } catch (error) {
    console.error('Failed to generate dashboard report:', error);
    throw new Error('Failed to generate dashboard report');
  }
}

async function generateUsersReport(params) {
  const usersCollection = await getCollection('users');
  const users = await usersCollection.find({}).limit(100).toArray();
  
  return {
    totalUsers: users.length,
    users: users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    })),
    generatedAt: new Date()
  };
}

async function generateVehiclesReport(params) {
  const vehiclesCollection = await getCollection('vehicles');
  const vehicles = await vehiclesCollection.find({}).limit(100).toArray();
  
  return {
    totalVehicles: vehicles.length,
    vehicles: vehicles.map(vehicle => ({
      id: vehicle._id,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      status: vehicle.status,
      location: vehicle.location
    })),
    generatedAt: new Date()
  };
}

async function generateBookingsReport(params) {
  const bookingsCollection = await getCollection('bookings');
  const bookings = await bookingsCollection.find({}).limit(100).toArray();
  
  return {
    totalBookings: bookings.length,
    bookings: bookings.map(booking => ({
      id: booking._id,
      userId: booking.userId,
      vehicleId: booking.vehicleId,
      startDate: booking.startDate,
      endDate: booking.endDate,
      status: booking.status,
      totalCost: booking.totalCost
    })),
    generatedAt: new Date()
  };
}

async function generateFinancialReport(params) {
  const transactionsCollection = await getCollection('transactions');
  const transactions = await transactionsCollection.find({}).limit(100).toArray();
  
  return {
    totalTransactions: transactions.length,
    totalRevenue: transactions.reduce((sum, t) => sum + (t.amount || 0), 0),
    transactions: transactions.map(transaction => ({
      id: transaction._id,
      amount: transaction.amount,
      type: transaction.type,
      status: transaction.status,
      createdAt: transaction.createdAt
    })),
    generatedAt: new Date()
  };
}

async function generatePerformanceReport(params) {
  // Generate real performance report data
  try {
    // TODO: Implement real performance metrics collection
    // This would typically come from monitoring services like Prometheus, New Relic, etc.
    return {
      metrics: {
        responseTime: 'N/A', // TODO: Get from monitoring service
        uptime: 'N/A', // TODO: Get from monitoring service
        errorRate: 'N/A', // TODO: Get from monitoring service
        throughput: 'N/A' // TODO: Get from monitoring service
      },
      generatedAt: new Date(),
      note: 'Performance metrics not yet implemented - requires monitoring service integration'
    };
  } catch (error) {
    console.error('Failed to generate performance report:', error);
    throw new Error('Failed to generate performance report');
  }
}

// ===== PARAMETERIZED ROUTES (MUST BE LAST) =====

// GET /api/v1/reports/:id - Get report by ID
router.get('/:id', async (req, res) => {
  try {
    const reportsCollection = await getCollection('reports');
    const report = await reportsCollection.findOne({ _id: req.params.id });
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/v1/reports/:id - Update report
router.put('/:id', checkRole(['head_administrator', 'report_manager']), async (req, res) => {
  try {
    const reportsCollection = await getCollection('reports');
    const { 
      name, 
      type, 
      category, 
      description, 
      parameters, 
      schedule, 
      format, 
      recipients, 
      status 
    } = req.body;
    
    const updateData = {
      updatedAt: new Date()
    };
    
    if (name) updateData.name = name;
    if (type) updateData.type = type;
    if (category) updateData.category = category;
    if (description) updateData.description = description;
    if (parameters) updateData.parameters = parameters;
    if (schedule) updateData.schedule = schedule;
    if (format) updateData.format = format;
    if (recipients) updateData.recipients = recipients;
    if (status) updateData.status = status;
    
    const result = await reportsCollection.updateOne(
      { _id: req.params.id },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Report updated successfully'
    });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/v1/reports/:id - Delete report
router.delete('/:id', checkRole(['head_administrator']), async (req, res) => {
  try {
    const reportsCollection = await getCollection('reports');
    const result = await reportsCollection.deleteOne({ _id: req.params.id });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
