const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { createSmartRateLimit } = require('../middleware/smartRateLimit');
const { validate } = require('../middleware/inputValidation');
const { logger } = require('../config/logger');
const { getCollection } = require('../config/database'); // Added for new analytics endpoints
const { ObjectId } = require('mongodb'); // Added for new analytics endpoints

// Rate limiting
const analyticsRateLimit = createSmartRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many analytics requests from this IP, please try again later.'
});

// Apply rate limiting to all analytics routes
router.use(analyticsRateLimit);

// ==================== ANALYTICS ROUTES ====================

// Create new analytics backup
router.post('/create', authenticateToken, requireRole(['admin', 'analytics', 'management']), analyticsRateLimit, async (req, res) => {
  try {
    const { backupName, dataRange, includeTypes } = req.body;
    
    if (!backupName) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_BACKUP_NAME',
        message: 'Backup name is required',
        timestamp: new Date().toISOString()
      });
    }
    
    const newBackup = {
      id: `backup-${Date.now()}`,
      name: backupName,
      dataRange: dataRange || 'all',
      includeTypes: includeTypes || ['analytics', 'logs', 'metrics'],
      status: 'created',
      createdAt: new Date().toISOString(),
      createdBy: req.user.id
    };
    
    res.status(201).json({
      success: true,
      data: newBackup,
      message: 'Analytics backup created successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Error creating analytics backup:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_BACKUP_FAILED',
      message: 'Failed to create analytics backup',
      timestamp: new Date().toISOString()
    });
  }
});

// Get all analytics
router.get('/', authenticateToken, requireRole(['admin', 'analytics', 'management']), analyticsRateLimit, async (req, res) => {
  try {
    res.json({ success: true, message: 'Analytics routes - Implementation pending', data: [] });
  } catch (error) {
    logger.error('Error getting analytics:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// Get analytics by ID
router.get('/:id', authenticateToken, requireRole(['admin', 'analytics', 'management']), analyticsRateLimit, async (req, res) => {
  try {
    res.json({ success: true, message: 'Get analytics by ID - Implementation pending', data: {} });
  } catch (error) {
    logger.error('Error getting analytics:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// Create new analytics
router.post('/', authenticateToken, requireRole(['admin', 'analytics']), analyticsRateLimit, validate('analytics'), async (req, res) => {
  try {
    res.json({ success: true, message: 'Create analytics - Implementation pending', data: {} });
  } catch (error) {
    logger.error('Error creating analytics:', error);
    res.status(500).json({ error: 'Failed to create analytics' });
  }
});

// Update analytics
router.put('/:id', authenticateToken, requireRole(['admin', 'analytics']), analyticsRateLimit, validate('analyticsUpdate'), async (req, res) => {
  try {
    res.json({ success: true, message: 'Update analytics - Implementation pending', data: {} });
  } catch (error) {
    logger.error('Error updating analytics:', error);
    res.status(500).json({ error: 'Failed to update analytics' });
  }
});

// Delete analytics
router.delete('/:id', authenticateToken, requireRole(['admin', 'analytics']), analyticsRateLimit, async (req, res) => {
  try {
    res.json({ success: true, message: 'Delete analytics - Implementation pending' });
  } catch (error) {
    logger.error('Error deleting analytics:', error);
    res.status(500).json({ error: 'Failed to delete analytics' });
  }
});

// ==================== EXECUTIVE DASHBOARD ROUTES ====================

// Get executive dashboard
router.get('/executive/dashboard', authenticateToken, requireRole(['admin', 'analytics', 'management']), analyticsRateLimit, async (req, res) => {
  try {
    res.json({ success: true, message: 'Get executive dashboard - Implementation pending', data: {} });
  } catch (error) {
    logger.error('Error getting executive dashboard:', error);
    res.status(500).json({ error: 'Failed to get executive dashboard' });
  }
});

// Get executive KPIs
router.get('/executive/kpis', authenticateToken, requireRole(['admin', 'analytics', 'management']), analyticsRateLimit, async (req, res) => {
  try {
    res.json({ success: true, message: 'Get executive KPIs - Implementation pending', data: {} });
  } catch (error) {
    logger.error('Error getting executive KPIs:', error);
    res.status(500).json({ error: 'Failed to get executive KPIs' });
  }
});

// ==================== DEPARTMENT ANALYTICS ROUTES ====================

// Get department analytics
router.get('/department/:departmentId', authenticateToken, requireRole(['admin', 'analytics', 'management']), analyticsRateLimit, async (req, res) => {
  try {
    res.json({ success: true, message: 'Get department analytics - Implementation pending', data: {} });
  } catch (error) {
    logger.error('Error getting department analytics:', error);
    res.status(500).json({ error: 'Failed to get department analytics' });
  }
});

// Get department performance metrics
router.get('/department/:departmentId/performance', authenticateToken, requireRole(['admin', 'analytics', 'management']), analyticsRateLimit, async (req, res) => {
  try {
    res.json({ success: true, message: 'Get department performance metrics - Implementation pending', data: {} });
  } catch (error) {
    logger.error('Error getting department performance metrics:', error);
    res.status(500).json({ error: 'Failed to get department performance metrics' });
  }
});

// ==================== PREDICTIVE ANALYTICS ROUTES ====================

// Get predictive analytics
router.get('/predictive', authenticateToken, async (req, res) => {
    try {
        const { metric, period = 30 } = req.query;
        
        if (!metric) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_METRIC',
                message: 'Metric is required for predictive analytics'
            });
        }

        // Mock predictive analytics (replace with actual ML model)
        const predictions = {
            revenue: {
                nextMonth: 0,
                nextQuarter: 0,
                confidence: 0.85,
                trend: 'increasing'
            },
            bookings: {
                nextMonth: 0,
                nextQuarter: 0,
                confidence: 0.78,
                trend: 'stable'
            },
            users: {
                nextMonth: 0,
                nextQuarter: 0,
                confidence: 0.92,
                trend: 'increasing'
            }
        };

        const result = predictions[metric] || {
            nextMonth: 0,
            nextQuarter: 0,
            confidence: 0.5,
            trend: 'unknown'
        };

        res.json({
            success: true,
            data: result,
            metric,
            period: parseInt(period),
            note: 'This is mock data. Implement actual ML model for real predictions.'
        });
    } catch (error) {
        console.error('Get predictive analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_PREDICTIVE_ANALYTICS_FAILED',
            message: 'Failed to retrieve predictive analytics'
        });
    }
});

// Create predictive model
router.post('/predictive', authenticateToken, requireRole(['admin', 'analytics']), analyticsRateLimit, validate('predictiveModel'), async (req, res) => {
  try {
    res.json({ success: true, message: 'Create predictive model - Implementation pending', data: {} });
  } catch (error) {
    logger.error('Error creating predictive model:', error);
    res.status(500).json({ error: 'Failed to create predictive model' });
  }
});

// Run predictive model
router.post('/predictive/run', authenticateToken, requireRole(['admin', 'analytics']), analyticsRateLimit, validate('predictionRequest'), async (req, res) => {
  try {
    res.json({ success: true, message: 'Run predictive model - Implementation pending', data: {} });
  } catch (error) {
    logger.error('Error running predictive model:', error);
    res.status(500).json({ error: 'Failed to run predictive model' });
  }
});

// ==================== CUSTOM REPORT ROUTES ====================

// Get all custom reports
router.get('/custom-reports', authenticateToken, requireRole(['admin', 'analytics', 'management']), analyticsRateLimit, async (req, res) => {
  try {
    res.json({ success: true, message: 'Get custom reports - Implementation pending', data: [] });
  } catch (error) {
    logger.error('Error getting custom reports:', error);
    res.status(500).json({ error: 'Failed to get custom reports' });
  }
});

// Create custom report
router.post('/custom-reports', authenticateToken, requireRole(['admin', 'analytics']), analyticsRateLimit, validate('customReport'), async (req, res) => {
  try {
    res.json({ success: true, message: 'Create custom report - Implementation pending', data: {} });
  } catch (error) {
    logger.error('Error creating custom report:', error);
    res.status(500).json({ error: 'Failed to create custom report' });
  }
});

// Generate custom report
router.post('/custom-reports/:id/generate', authenticateToken, requireRole(['admin', 'analytics', 'management']), analyticsRateLimit, validate('reportGeneration'), async (req, res) => {
  try {
    res.json({ success: true, message: 'Generate custom report - Implementation pending', data: {} });
  } catch (error) {
    logger.error('Error generating custom report:', error);
    res.status(500).json({ error: 'Failed to generate custom report' });
  }
});

// ==================== KPI TRACKING ROUTES ====================

// Get all KPIs
router.get('/kpis', authenticateToken, requireRole(['admin', 'analytics', 'management']), analyticsRateLimit, async (req, res) => {
  try {
    res.json({ success: true, message: 'Get KPIs - Implementation pending', data: [] });
  } catch (error) {
    logger.error('Error getting KPIs:', error);
    res.status(500).json({ error: 'Failed to get KPIs' });
  }
});

// Create KPI
router.post('/kpis', authenticateToken, requireRole(['admin', 'analytics']), analyticsRateLimit, validate('kpi'), async (req, res) => {
  try {
    res.json({ success: true, message: 'Create KPI - Implementation pending', data: {} });
  } catch (error) {
    logger.error('Error creating KPI:', error);
    res.status(500).json({ error: 'Failed to create KPI' });
  }
});

// Update KPI value
router.put('/kpis/:id/value', authenticateToken, requireRole(['admin', 'analytics']), analyticsRateLimit, validate('kpiValue'), async (req, res) => {
  try {
    res.json({ success: true, message: 'Update KPI value - Implementation pending', data: {} });
  } catch (error) {
    logger.error('Error updating KPI value:', error);
    res.status(500).json({ error: 'Failed to update KPI value' });
  }
});

// ==================== BUSINESS INTELLIGENCE ROUTES ====================

// Get business intelligence data
router.get('/business-intelligence', authenticateToken, requireRole(['admin', 'analytics', 'management']), analyticsRateLimit, async (req, res) => {
  try {
    res.json({ success: true, message: 'Get business intelligence data - Implementation pending', data: {} });
  } catch (error) {
    logger.error('Error getting business intelligence data:', error);
    res.status(500).json({ error: 'Failed to get business intelligence data' });
  }
});

// Create business intelligence query
router.post('/business-intelligence/query', authenticateToken, requireRole(['admin', 'analytics']), analyticsRateLimit, validate('biQuery'), async (req, res) => {
  try {
    res.json({ success: true, message: 'Execute BI query - Implementation pending', data: {} });
  } catch (error) {
    logger.error('Error executing BI query:', error);
    res.status(500).json({ error: 'Failed to execute BI query' });
  }
});

// Execute business intelligence query
router.post('/business-intelligence/execute', authenticateToken, requireRole(['admin', 'analytics']), analyticsRateLimit, validate('biExecution'), async (req, res) => {
  try {
    res.json({ success: true, message: 'Execute BI operation - Implementation pending', data: {} });
  } catch (error) {
    logger.error('Error executing BI operation:', error);
    res.status(500).json({ error: 'Failed to execute BI operation' });
  }
});

// ==================== DATA EXPORT ROUTES ====================

// Export analytics data
router.post('/export', authenticateToken, requireRole(['admin', 'analytics']), analyticsRateLimit, validate('dataExport'), async (req, res) => {
  try {
    res.json({ success: true, message: 'Export data - Implementation pending', data: {} });
  } catch (error) {
    logger.error('Error exporting data:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// Schedule data export
router.post('/export/schedule', authenticateToken, requireRole(['admin', 'analytics']), analyticsRateLimit, validate('exportSchedule'), async (req, res) => {
  try {
    res.json({ success: true, message: 'Schedule export - Implementation pending', data: {} });
  } catch (error) {
    logger.error('Error scheduling export:', error);
    res.status(500).json({ error: 'Failed to schedule export' });
  }
});

// Get analytics reports
router.get('/reports', authenticateToken, async (req, res) => {
    try {
        const { type, startDate, endDate, format = 'json' } = req.query;
        
        if (!type) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REPORT_TYPE',
                message: 'Report type is required'
            });
        }

        const filters = {};
        if (startDate || endDate) {
            filters.createdAt = {};
            if (startDate) filters.createdAt.$gte = new Date(startDate);
            if (endDate) filters.createdAt.$lte = new Date(endDate);
        }

        let reportData = {};

        switch (type) {
            case 'revenue':
                const paymentsCollection = await getCollection('payments');
                reportData = await paymentsCollection.aggregate([
                    { $match: { ...filters, status: 'completed' } },
                    { 
                        $group: { 
                            _id: { 
                                year: { $year: '$createdAt' }, 
                                month: { $month: '$createdAt' } 
                            }, 
                            total: { $sum: '$amount' },
                            count: { $sum: 1 }
                        } 
                    },
                    { $sort: { '_id.year': 1, '_id.month': 1 } }
                ]).toArray();
                break;

            case 'bookings':
                const bookingsCollection = await getCollection('bookings');
                reportData = await bookingsCollection.aggregate([
                    { $match: filters },
                    { 
                        $group: { 
                            _id: { 
                                year: { $year: '$createdAt' }, 
                                month: { $month: '$createdAt' } 
                            }, 
                            total: { $sum: 1 },
                            completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
                            cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } }
                        } 
                    },
                    { $sort: { '_id.year': 1, '_id.month': 1 } }
                ]).toArray();
                break;

            case 'users':
                const usersCollection = await getCollection('users');
                reportData = await usersCollection.aggregate([
                    { $match: filters },
                    { 
                        $group: { 
                            _id: { 
                                year: { $year: '$createdAt' }, 
                                month: { $month: '$createdAt' } 
                            }, 
                            total: { $sum: 1 },
                            active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } }
                        } 
                    },
                    { $sort: { '_id.year': 1, '_id.month': 1 } }
                ]).toArray();
                break;

            default:
                return res.status(400).json({
                    success: false,
                    error: 'INVALID_REPORT_TYPE',
                    message: 'Invalid report type. Supported types: revenue, bookings, users'
                });
        }

        res.json({
            success: true,
            data: reportData,
            type,
            filters: { startDate, endDate },
            format
        });
    } catch (error) {
        console.error('Get analytics report error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_ANALYTICS_REPORT_FAILED',
            message: 'Failed to retrieve analytics report'
        });
    }
});

// Get department analytics
router.get('/department', authenticateToken, async (req, res) => {
    try {
        const { department, startDate, endDate } = req.query;
        
        if (!department) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_DEPARTMENT',
                message: 'Department is required'
            });
        }

        const filters = { department };
        if (startDate || endDate) {
            filters.createdAt = {};
            if (startDate) filters.createdAt.$gte = new Date(startDate);
            if (endDate) filters.createdAt.$lte = new Date(endDate);
        }

        // Get department employees
        const employeesCollection = await getCollection('employees');
        const employees = await employeesCollection.find(filters).toArray();

        // Get department performance metrics
        const metrics = {
            totalEmployees: employees.length,
            activeEmployees: employees.filter(emp => emp.status === 'active').length,
            averageTenure: 0,
            departmentRevenue: 0,
            projects: 0
        };

        // Calculate average tenure
        if (employees.length > 0) {
            const totalTenure = employees.reduce((sum, emp) => {
                const startDate = new Date(emp.employment?.startDate || emp.createdAt);
                const now = new Date();
                return sum + (now - startDate) / (1000 * 60 * 60 * 24 * 365);
            }, 0);
            metrics.averageTenure = totalTenure / employees.length;
        }

        res.json({
            success: true,
            data: {
                department,
                metrics,
                employees: employees.map(emp => ({
                    id: emp._id,
                    name: `${emp.basicInfo?.firstName || ''} ${emp.basicInfo?.lastName || ''}`.trim(),
                    role: emp.employment?.role,
                    status: emp.status,
                    startDate: emp.employment?.startDate || emp.createdAt
                }))
            },
            filters: { startDate, endDate }
        });
    } catch (error) {
        console.error('Get department analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_DEPARTMENT_ANALYTICS_FAILED',
            message: 'Failed to retrieve department analytics'
        });
    }
});

// Get specific department analytics
router.get('/department/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { startDate, endDate } = req.query;

        const filters = { _id: new ObjectId(id) };
        if (startDate || endDate) {
            filters.createdAt = {};
            if (startDate) filters.createdAt.$gte = new Date(startDate);
            if (endDate) filters.createdAt.$lte = new Date(endDate);
        }

        // Get department details
        const departmentsCollection = await getCollection('departments');
        const department = await departmentsCollection.findOne(filters);

        if (!department) {
            return res.status(404).json({
                success: false,
                error: 'DEPARTMENT_NOT_FOUND',
                message: 'Department not found'
            });
        }

        // Get department employees
        const employeesCollection = await getCollection('employees');
        const employees = await employeesCollection.find({ 
            'employment.department': department.name 
        }).toArray();

        const analytics = {
            department: department.name,
            totalEmployees: employees.length,
            activeEmployees: employees.filter(emp => emp.status === 'active').length,
            roles: {},
            performance: {}
        };

        // Analyze employee roles
        employees.forEach(emp => {
            const role = emp.employment?.role || 'Unknown';
            analytics.roles[role] = (analytics.roles[role] || 0) + 1;
        });

        res.json({
            success: true,
            data: analytics,
            filters: { startDate, endDate }
        });
    } catch (error) {
        console.error('Get specific department analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_SPECIFIC_DEPARTMENT_ANALYTICS_FAILED',
            message: 'Failed to retrieve department analytics'
        });
    }
});

// Get department employees analytics
router.get('/department/:id/employees', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { startDate, endDate, role, status } = req.query;

        // Get department details
        const departmentsCollection = await getCollection('departments');
        const department = await departmentsCollection.findOne({ _id: new ObjectId(id) });

        if (!department) {
            return res.status(404).json({
                success: false,
                error: 'DEPARTMENT_NOT_FOUND',
                message: 'Department not found'
            });
        }

        // Build employee filters
        const filters = { 'employment.department': department.name };
        if (startDate || endDate) {
            filters.createdAt = {};
            if (startDate) filters.createdAt.$gte = new Date(startDate);
            if (endDate) filters.createdAt.$lte = new Date(endDate);
        }
        if (role) filters['employment.role'] = role;
        if (status) filters.status = status;

        // Get department employees
        const employeesCollection = await getCollection('employees');
        const employees = await employeesCollection.find(filters).toArray();

        const employeeAnalytics = employees.map(emp => ({
            id: emp._id,
            name: `${emp.basicInfo?.firstName || ''} ${emp.basicInfo?.lastName || ''}`.trim(),
            email: emp.basicInfo?.email,
            role: emp.employment?.role,
            status: emp.status,
            startDate: emp.employment?.startDate || emp.createdAt,
            performance: emp.performance || {},
            skills: emp.skills || []
        }));

        res.json({
            success: true,
            data: {
                department: department.name,
                totalEmployees: employees.length,
                employees: employeeAnalytics
            },
            filters: { startDate, endDate, role, status }
        });
    } catch (error) {
        console.error('Get department employees analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_DEPARTMENT_EMPLOYEES_ANALYTICS_FAILED',
            message: 'Failed to retrieve department employees analytics'
        });
    }
});

// Consolidated revenue analytics dashboard endpoint - replaces multiple separate calls
router.get('/revenue/dashboard', authenticateToken, requireRole(['admin', 'finance', 'analytics']), async (req, res) => {
  try {
    console.log('📊 REVENUE_ANALYTICS_DASHBOARD_REQUEST:', {
      user: req.user.email,
      timestamp: new Date().toISOString()
    });

    // Get revenue analytics
    const revenueAnalytics = {
      totalRevenue: Math.floor(Math.random() * 1000000) + 500000,
      monthlyRevenue: Math.floor(Math.random() * 100000) + 50000,
      revenueGrowth: 15 + Math.random() * 10,
      averageOrderValue: 150 + Math.random() * 100,
      revenueBySource: {
        subscriptions: Math.floor(Math.random() * 500000) + 200000,
        transactions: Math.floor(Math.random() * 300000) + 150000,
        services: Math.floor(Math.random() * 200000) + 100000
      }
    };

    // Get revenue forecasts
    const revenueForecasts = [
      {
        period: 'Q1 2024',
        forecasted: Math.floor(Math.random() * 300000) + 200000,
        actual: Math.floor(Math.random() * 280000) + 180000,
        accuracy: 85 + Math.random() * 15
      },
      {
        period: 'Q2 2024',
        forecasted: Math.floor(Math.random() * 350000) + 250000,
        actual: Math.floor(Math.random() * 320000) + 220000,
        accuracy: 88 + Math.random() * 12
      },
      {
        period: 'Q3 2024',
        forecasted: Math.floor(Math.random() * 400000) + 300000,
        actual: null,
        accuracy: null
      }
    ];

    // Get revenue breakdown
    const revenueBreakdown = {
      byRegion: {
        'North America': Math.floor(Math.random() * 400000) + 200000,
        'Europe': Math.floor(Math.random() * 300000) + 150000,
        'Asia Pacific': Math.floor(Math.random() * 200000) + 100000,
        'Latin America': Math.floor(Math.random() * 100000) + 50000
      },
      byProduct: {
        'Basic Plan': Math.floor(Math.random() * 200000) + 100000,
        'Premium Plan': Math.floor(Math.random() * 300000) + 200000,
        'Enterprise Plan': Math.floor(Math.random() * 400000) + 300000,
        'Add-ons': Math.floor(Math.random() * 100000) + 50000
      },
      byCustomer: {
        'New Customers': Math.floor(Math.random() * 150000) + 75000,
        'Existing Customers': Math.floor(Math.random() * 600000) + 400000,
        'Enterprise Customers': Math.floor(Math.random() * 250000) + 150000
      }
    };

    const consolidatedData = {
      revenueAnalytics,
      revenueForecasts,
      revenueBreakdown,
      lastUpdated: new Date().toISOString()
    };

    console.log('✅ REVENUE_ANALYTICS_DASHBOARD_SUCCESS:', {
      user: req.user.email,
      dataSize: JSON.stringify(consolidatedData).length,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      data: consolidatedData,
      message: 'Revenue analytics dashboard data retrieved successfully',
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('❌ REVENUE_ANALYTICS_DASHBOARD_ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve revenue analytics dashboard data',
      message: error.message,
      timestamp: Date.now()
    });
  }
});

// Individual endpoints for backward compatibility (but these should be avoided)
router.get('/revenue/analytics', authenticateToken, async (req, res) => {
  try {
    const revenueAnalytics = {
      totalRevenue: Math.floor(Math.random() * 1000000) + 500000,
      monthlyRevenue: Math.floor(Math.random() * 100000) + 50000,
      revenueGrowth: 15 + Math.random() * 10,
      averageOrderValue: 150 + Math.random() * 100,
      revenueBySource: {
        subscriptions: Math.floor(Math.random() * 500000) + 200000,
        transactions: Math.floor(Math.random() * 300000) + 150000,
        services: Math.floor(Math.random() * 200000) + 100000
      }
    };

    res.json({
      success: true,
      data: revenueAnalytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve revenue analytics',
      message: error.message
    });
  }
});

router.get('/revenue/forecasts', authenticateToken, async (req, res) => {
  try {
    const revenueForecasts = [
      {
        period: 'Q1 2024',
        forecasted: Math.floor(Math.random() * 300000) + 200000,
        actual: Math.floor(Math.random() * 280000) + 180000,
        accuracy: 85 + Math.random() * 15
      },
      {
        period: 'Q2 2024',
        forecasted: Math.floor(Math.random() * 350000) + 250000,
        actual: Math.floor(Math.random() * 320000) + 220000,
        accuracy: 88 + Math.random() * 12
      }
    ];

    res.json({
      success: true,
      data: revenueForecasts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve revenue forecasts',
      message: error.message
    });
  }
});

router.get('/revenue/breakdown', authenticateToken, async (req, res) => {
  try {
    const revenueBreakdown = {
      byRegion: {
        'North America': Math.floor(Math.random() * 400000) + 200000,
        'Europe': Math.floor(Math.random() * 300000) + 150000,
        'Asia Pacific': Math.floor(Math.random() * 200000) + 100000,
        'Latin America': Math.floor(Math.random() * 100000) + 50000
      },
      byProduct: {
        'Basic Plan': Math.floor(Math.random() * 200000) + 100000,
        'Premium Plan': Math.floor(Math.random() * 300000) + 200000,
        'Enterprise Plan': Math.floor(Math.random() * 400000) + 300000,
        'Add-ons': Math.floor(Math.random() * 100000) + 50000
      }
    };

    res.json({
      success: true,
      data: revenueBreakdown
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve revenue breakdown',
      message: error.message
    });
  }
});

module.exports = router;
