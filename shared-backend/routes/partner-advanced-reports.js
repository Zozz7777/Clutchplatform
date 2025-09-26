const express = require('express');
const { body, validationResult } = require('express-validator');
const PartnerUser = require('../models/PartnerUser');
const { authenticateToken: auth } = require('../middleware/auth');
const logger = require('../config/logger');

const router = express.Router();

// Report Types
const REPORT_TYPES = {
  SALES_SUMMARY: 'sales_summary',
  REVENUE_ANALYSIS: 'revenue_analysis',
  INVENTORY_ANALYSIS: 'inventory_analysis',
  CUSTOMER_ANALYSIS: 'customer_analysis',
  STAFF_PERFORMANCE: 'staff_performance',
  PAYMENT_ANALYSIS: 'payment_analysis',
  WARRANTY_ANALYSIS: 'warranty_analysis',
  DISPUTE_ANALYSIS: 'dispute_analysis',
  CUSTOM_REPORT: 'custom_report'
};

// Time Periods
const TIME_PERIODS = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly',
  CUSTOM: 'custom'
};

// Chart Types
const CHART_TYPES = {
  LINE: 'line',
  BAR: 'bar',
  PIE: 'pie',
  DOUGHNUT: 'doughnut',
  AREA: 'area',
  SCATTER: 'scatter'
};

// Generate sales summary report
router.post('/reports/sales-summary', [
  auth,
  body('period').isIn(Object.values(TIME_PERIODS)).withMessage('Invalid time period'),
  body('startDate').optional().isISO8601().withMessage('Start date must be valid ISO date'),
  body('endDate').optional().isISO8601().withMessage('End date must be valid ISO date'),
  body('includeCharts').optional().isBoolean().withMessage('Include charts must be boolean'),
  body('groupBy').optional().isIn(['day', 'week', 'month', 'category', 'service']).withMessage('Invalid group by option')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { period, startDate, endDate, includeCharts, groupBy } = req.body;
    const userId = req.user._id;

    // Check user permissions
    const user = await PartnerUser.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userRole = user.role || 'staff';
    if (!['owner', 'manager', 'accountant'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to view sales reports'
      });
    }

    // Calculate date range
    const dateRange = calculateDateRange(period, startDate, endDate);

    // Generate sales summary data
    const salesData = await generateSalesSummaryData(userId, dateRange, groupBy);

    // Generate charts if requested
    let charts = [];
    if (includeCharts) {
      charts = await generateSalesCharts(salesData, groupBy);
    }

    logger.info(`Sales summary report generated for user ${userId}`, {
      period: period,
      dateRange: dateRange,
      groupBy: groupBy,
      includeCharts: includeCharts
    });

    res.json({
      success: true,
      data: {
        reportType: REPORT_TYPES.SALES_SUMMARY,
        period: period,
        dateRange: dateRange,
        summary: salesData.summary,
        data: salesData.data,
        charts: charts,
        generatedAt: new Date()
      }
    });

  } catch (error) {
    logger.error('Failed to generate sales summary report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate sales summary report'
    });
  }
});

// Generate revenue analysis report
router.post('/reports/revenue-analysis', [
  auth,
  body('period').isIn(Object.values(TIME_PERIODS)).withMessage('Invalid time period'),
  body('startDate').optional().isISO8601().withMessage('Start date must be valid ISO date'),
  body('endDate').optional().isISO8601().withMessage('End date must be valid ISO date'),
  body('includeCharts').optional().isBoolean().withMessage('Include charts must be boolean'),
  body('breakdownBy').optional().isIn(['service', 'category', 'payment_method', 'customer']).withMessage('Invalid breakdown option')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { period, startDate, endDate, includeCharts, breakdownBy } = req.body;
    const userId = req.user._id;

    // Check user permissions
    const user = await PartnerUser.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userRole = user.role || 'staff';
    if (!['owner', 'manager', 'accountant'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to view revenue reports'
      });
    }

    // Calculate date range
    const dateRange = calculateDateRange(period, startDate, endDate);

    // Generate revenue analysis data
    const revenueData = await generateRevenueAnalysisData(userId, dateRange, breakdownBy);

    // Generate charts if requested
    let charts = [];
    if (includeCharts) {
      charts = await generateRevenueCharts(revenueData, breakdownBy);
    }

    logger.info(`Revenue analysis report generated for user ${userId}`, {
      period: period,
      dateRange: dateRange,
      breakdownBy: breakdownBy,
      includeCharts: includeCharts
    });

    res.json({
      success: true,
      data: {
        reportType: REPORT_TYPES.REVENUE_ANALYSIS,
        period: period,
        dateRange: dateRange,
        summary: revenueData.summary,
        breakdown: revenueData.breakdown,
        trends: revenueData.trends,
        charts: charts,
        generatedAt: new Date()
      }
    });

  } catch (error) {
    logger.error('Failed to generate revenue analysis report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate revenue analysis report'
    });
  }
});

// Generate inventory analysis report
router.post('/reports/inventory-analysis', [
  auth,
  body('includeCharts').optional().isBoolean().withMessage('Include charts must be boolean'),
  body('analysisType').optional().isIn(['stock_levels', 'movement', 'valuation', 'turnover']).withMessage('Invalid analysis type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { includeCharts, analysisType } = req.body;
    const userId = req.user._id;

    // Check user permissions
    const user = await PartnerUser.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userRole = user.role || 'staff';
    if (!['owner', 'manager'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to view inventory reports'
      });
    }

    // Generate inventory analysis data
    const inventoryData = await generateInventoryAnalysisData(userId, analysisType);

    // Generate charts if requested
    let charts = [];
    if (includeCharts) {
      charts = await generateInventoryCharts(inventoryData, analysisType);
    }

    logger.info(`Inventory analysis report generated for user ${userId}`, {
      analysisType: analysisType,
      includeCharts: includeCharts
    });

    res.json({
      success: true,
      data: {
        reportType: REPORT_TYPES.INVENTORY_ANALYSIS,
        analysisType: analysisType,
        summary: inventoryData.summary,
        data: inventoryData.data,
        charts: charts,
        generatedAt: new Date()
      }
    });

  } catch (error) {
    logger.error('Failed to generate inventory analysis report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate inventory analysis report'
    });
  }
});

// Generate customer analysis report
router.post('/reports/customer-analysis', [
  auth,
  body('period').isIn(Object.values(TIME_PERIODS)).withMessage('Invalid time period'),
  body('startDate').optional().isISO8601().withMessage('Start date must be valid ISO date'),
  body('endDate').optional().isISO8601().withMessage('End date must be valid ISO date'),
  body('includeCharts').optional().isBoolean().withMessage('Include charts must be boolean'),
  body('analysisType').optional().isIn(['demographics', 'behavior', 'loyalty', 'segmentation']).withMessage('Invalid analysis type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { period, startDate, endDate, includeCharts, analysisType } = req.body;
    const userId = req.user._id;

    // Check user permissions
    const user = await PartnerUser.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userRole = user.role || 'staff';
    if (!['owner', 'manager'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to view customer reports'
      });
    }

    // Calculate date range
    const dateRange = calculateDateRange(period, startDate, endDate);

    // Generate customer analysis data
    const customerData = await generateCustomerAnalysisData(userId, dateRange, analysisType);

    // Generate charts if requested
    let charts = [];
    if (includeCharts) {
      charts = await generateCustomerCharts(customerData, analysisType);
    }

    logger.info(`Customer analysis report generated for user ${userId}`, {
      period: period,
      dateRange: dateRange,
      analysisType: analysisType,
      includeCharts: includeCharts
    });

    res.json({
      success: true,
      data: {
        reportType: REPORT_TYPES.CUSTOMER_ANALYSIS,
        period: period,
        dateRange: dateRange,
        analysisType: analysisType,
        summary: customerData.summary,
        data: customerData.data,
        charts: charts,
        generatedAt: new Date()
      }
    });

  } catch (error) {
    logger.error('Failed to generate customer analysis report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate customer analysis report'
    });
  }
});

// Create custom report
router.post('/reports/custom', [
  auth,
  body('name').notEmpty().withMessage('Report name is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('dataSource').isIn(['orders', 'invoices', 'payments', 'inventory', 'customers']).withMessage('Invalid data source'),
  body('filters').isObject().withMessage('Filters must be an object'),
  body('columns').isArray().withMessage('Columns must be an array'),
  body('groupBy').optional().isString().withMessage('Group by must be a string'),
  body('sortBy').optional().isString().withMessage('Sort by must be a string'),
  body('includeCharts').optional().isBoolean().withMessage('Include charts must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, description, dataSource, filters, columns, groupBy, sortBy, includeCharts } = req.body;
    const userId = req.user._id;

    // Check user permissions
    const user = await PartnerUser.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userRole = user.role || 'staff';
    if (!['owner', 'manager'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to create custom reports'
      });
    }

    // Generate custom report data
    const customData = await generateCustomReportData(userId, dataSource, filters, columns, groupBy, sortBy);

    // Generate charts if requested
    let charts = [];
    if (includeCharts) {
      charts = await generateCustomCharts(customData, groupBy);
    }

    // Save custom report template
    const customReport = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
      name: name,
      description: description || null,
      dataSource: dataSource,
      filters: filters,
      columns: columns,
      groupBy: groupBy || null,
      sortBy: sortBy || null,
      includeCharts: includeCharts || false,
      createdBy: userId,
      createdAt: new Date(),
      lastRun: new Date()
    };

    // Save to user's custom reports
    if (!user.customReports) {
      user.customReports = [];
    }
    user.customReports.push(customReport);
    await user.save();

    logger.info(`Custom report created: ${customReport.id}`, {
      userId: userId,
      name: name,
      dataSource: dataSource,
      includeCharts: includeCharts
    });

    res.json({
      success: true,
      data: {
        reportType: REPORT_TYPES.CUSTOM_REPORT,
        reportId: customReport.id,
        name: name,
        data: customData.data,
        charts: charts,
        generatedAt: new Date()
      }
    });

  } catch (error) {
    logger.error('Failed to create custom report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create custom report'
    });
  }
});

// Get available report templates
router.get('/reports/templates', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await PartnerUser.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userRole = user.role || 'staff';

    res.json({
      success: true,
      data: {
        reportTypes: Object.values(REPORT_TYPES),
        timePeriods: Object.values(TIME_PERIODS),
        chartTypes: Object.values(CHART_TYPES),
        permissions: {
          canViewSalesReports: ['owner', 'manager', 'accountant'].includes(userRole),
          canViewRevenueReports: ['owner', 'manager', 'accountant'].includes(userRole),
          canViewInventoryReports: ['owner', 'manager'].includes(userRole),
          canViewCustomerReports: ['owner', 'manager'].includes(userRole),
          canCreateCustomReports: ['owner', 'manager'].includes(userRole)
        },
        customReports: user.customReports || []
      }
    });

  } catch (error) {
    logger.error('Failed to get report templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get report templates'
    });
  }
});

// Helper functions
function calculateDateRange(period, startDate, endDate) {
  const now = new Date();
  let start, end;

  switch (period) {
    case TIME_PERIODS.DAILY:
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      break;
    case TIME_PERIODS.WEEKLY:
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      start = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate());
      end = new Date(now);
      break;
    case TIME_PERIODS.MONTHLY:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now);
      break;
    case TIME_PERIODS.QUARTERLY:
      const quarter = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), quarter * 3, 1);
      end = new Date(now);
      break;
    case TIME_PERIODS.YEARLY:
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now);
      break;
    case TIME_PERIODS.CUSTOM:
      start = new Date(startDate);
      end = new Date(endDate);
      break;
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now);
  }

  return { start, end };
}

// Mock data generation functions
async function generateSalesSummaryData(userId, dateRange, groupBy) {
  // Mock implementation - in real app, this would query the orders collection
  return {
    summary: {
      totalOrders: 150,
      totalRevenue: 45000,
      averageOrderValue: 300,
      topService: 'Oil Change',
      topCategory: 'Maintenance'
    },
    data: [
      { period: '2024-01-01', orders: 25, revenue: 7500 },
      { period: '2024-01-02', orders: 30, revenue: 9000 },
      { period: '2024-01-03', orders: 20, revenue: 6000 }
    ]
  };
}

async function generateRevenueAnalysisData(userId, dateRange, breakdownBy) {
  return {
    summary: {
      totalRevenue: 45000,
      growthRate: 15.5,
      topRevenueSource: 'Oil Change',
      averageTransactionValue: 300
    },
    breakdown: [
      { category: 'Oil Change', revenue: 15000, percentage: 33.3 },
      { category: 'Brake Repair', revenue: 12000, percentage: 26.7 },
      { category: 'Engine Repair', revenue: 18000, percentage: 40.0 }
    ],
    trends: [
      { period: 'Week 1', revenue: 10000 },
      { period: 'Week 2', revenue: 12000 },
      { period: 'Week 3', revenue: 11000 },
      { period: 'Week 4', revenue: 12000 }
    ]
  };
}

async function generateInventoryAnalysisData(userId, analysisType) {
  return {
    summary: {
      totalProducts: 150,
      totalValue: 75000,
      lowStockItems: 12,
      outOfStockItems: 3
    },
    data: [
      { sku: 'SKU001', name: 'Engine Oil', quantity: 50, value: 1250, status: 'In Stock' },
      { sku: 'SKU002', name: 'Brake Pads', quantity: 5, value: 600, status: 'Low Stock' }
    ]
  };
}

async function generateCustomerAnalysisData(userId, dateRange, analysisType) {
  return {
    summary: {
      totalCustomers: 250,
      newCustomers: 25,
      returningCustomers: 225,
      averageCustomerValue: 180
    },
    data: [
      { segment: 'High Value', count: 50, revenue: 25000 },
      { segment: 'Medium Value', count: 150, revenue: 15000 },
      { segment: 'Low Value', count: 50, revenue: 5000 }
    ]
  };
}

async function generateCustomReportData(userId, dataSource, filters, columns, groupBy, sortBy) {
  return {
    data: [
      { column1: 'Value 1', column2: 'Value 2', column3: 'Value 3' },
      { column1: 'Value 4', column2: 'Value 5', column3: 'Value 6' }
    ]
  };
}

async function generateSalesCharts(salesData, groupBy) {
  return [
    {
      type: 'line',
      title: 'Sales Trend',
      data: salesData.data,
      xAxis: 'period',
      yAxis: 'revenue'
    },
    {
      type: 'bar',
      title: 'Orders by Period',
      data: salesData.data,
      xAxis: 'period',
      yAxis: 'orders'
    }
  ];
}

async function generateRevenueCharts(revenueData, breakdownBy) {
  return [
    {
      type: 'pie',
      title: 'Revenue Breakdown',
      data: revenueData.breakdown,
      label: 'category',
      value: 'revenue'
    },
    {
      type: 'line',
      title: 'Revenue Trend',
      data: revenueData.trends,
      xAxis: 'period',
      yAxis: 'revenue'
    }
  ];
}

async function generateInventoryCharts(inventoryData, analysisType) {
  return [
    {
      type: 'bar',
      title: 'Inventory Value by Product',
      data: inventoryData.data,
      xAxis: 'name',
      yAxis: 'value'
    }
  ];
}

async function generateCustomerCharts(customerData, analysisType) {
  return [
    {
      type: 'doughnut',
      title: 'Customer Segments',
      data: customerData.data,
      label: 'segment',
      value: 'count'
    }
  ];
}

async function generateCustomCharts(customData, groupBy) {
  return [
    {
      type: 'bar',
      title: 'Custom Report Chart',
      data: customData.data
    }
  ];
}

module.exports = router;
