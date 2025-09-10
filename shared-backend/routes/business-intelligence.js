const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { createSmartRateLimit } = require('../middleware/smartRateLimit');
const { validate } = require('../middleware/inputValidation');
const { logger } = require('../config/logger');

// Rate limiting for BI endpoints
const biRateLimit = createSmartRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit each IP to 30 requests per windowMs
  message: 'Too many BI requests from this IP, please try again later.'
});

// Apply rate limiting to all BI routes
router.use(biRateLimit);

// ==================== BI METRICS ====================

// Get business intelligence metrics
router.get('/metrics', authenticateToken, async (req, res) => {
  try {
    const { category, timeframe, department } = req.query;
    
    // Mock BI metrics (replace with actual BI system)
    const metrics = {
      financial: {
        revenue: {
          current: 125000,
          previous: 118000,
          change: 0.059,
          trend: 'increasing',
          forecast: 132000
        },
        profit: {
          current: 45000,
          previous: 42000,
          change: 0.071,
          trend: 'increasing',
          forecast: 48000
        },
        expenses: {
          current: 80000,
          previous: 76000,
          change: 0.053,
          trend: 'increasing',
          forecast: 84000
        }
      },
      operational: {
        efficiency: {
          current: 0.78,
          previous: 0.75,
          change: 0.04,
          trend: 'improving',
          target: 0.85
        },
        productivity: {
          current: 0.82,
          previous: 0.79,
          change: 0.038,
          trend: 'improving',
          target: 0.90
        },
        quality: {
          current: 0.94,
          previous: 0.92,
          change: 0.022,
          trend: 'improving',
          target: 0.95
        }
      },
      customer: {
        satisfaction: {
          current: 4.6,
          previous: 4.4,
          change: 0.045,
          trend: 'improving',
          target: 4.8
        },
        retention: {
          current: 0.78,
          previous: 0.75,
          change: 0.04,
          trend: 'improving',
          target: 0.85
        },
        acquisition: {
          current: 450,
          previous: 420,
          change: 0.071,
          trend: 'increasing',
          target: 500
        }
      },
      market: {
        share: {
          current: 0.15,
          previous: 0.14,
          change: 0.071,
          trend: 'increasing',
          target: 0.20
        },
        growth: {
          current: 0.12,
          previous: 0.10,
          change: 0.20,
          trend: 'increasing',
          target: 0.15
        },
        competition: {
          current: 0.08,
          previous: 0.09,
          change: -0.111,
          trend: 'decreasing',
          target: 0.05
        }
      }
    };

    let result = metrics;
    if (category && metrics[category]) {
      result = { [category]: metrics[category] };
    }

    res.json({
      success: true,
      data: result,
      filters: { category, timeframe, department },
      lastUpdated: new Date()
    });
  } catch (error) {
    logger.error('Error getting BI metrics:', error);
    res.status(500).json({ error: 'Failed to get BI metrics' });
  }
});

// ==================== KPI TARGETS ====================

// Get KPI targets
router.get('/kpi-targets', authenticateToken, async (req, res) => {
  try {
    const { category, status, priority } = req.query;
    
    // Mock KPI targets (replace with actual KPI management system)
    const kpiTargets = [
      {
        id: '1',
        name: 'Revenue Growth',
        category: 'financial',
        current: 125000,
        target: 150000,
        unit: 'USD',
        timeframe: '2024',
        status: 'on_track',
        priority: 'high',
        progress: 0.83,
        trend: 'increasing',
        lastUpdated: new Date('2024-01-15')
      },
      {
        id: '2',
        name: 'Customer Satisfaction',
        category: 'customer',
        current: 4.6,
        target: 4.8,
        unit: 'rating',
        timeframe: '2024',
        status: 'on_track',
        priority: 'high',
        progress: 0.92,
        trend: 'improving',
        lastUpdated: new Date('2024-01-15')
      },
      {
        id: '3',
        name: 'Operational Efficiency',
        category: 'operational',
        current: 0.78,
        target: 0.85,
        unit: 'ratio',
        timeframe: '2024',
        status: 'at_risk',
        priority: 'medium',
        progress: 0.92,
        trend: 'improving',
        lastUpdated: new Date('2024-01-15')
      },
      {
        id: '4',
        name: 'Market Share',
        category: 'market',
        current: 0.15,
        target: 0.20,
        unit: 'percentage',
        timeframe: '2024',
        status: 'behind',
        priority: 'high',
        progress: 0.75,
        trend: 'increasing',
        lastUpdated: new Date('2024-01-15')
      },
      {
        id: '5',
        name: 'Employee Retention',
        category: 'operational',
        current: 0.88,
        target: 0.90,
        unit: 'ratio',
        timeframe: '2024',
        status: 'on_track',
        priority: 'medium',
        progress: 0.98,
        trend: 'stable',
        lastUpdated: new Date('2024-01-15')
      }
    ];

    let filteredTargets = kpiTargets;
    if (category) {
      filteredTargets = kpiTargets.filter(target => target.category === category);
    }
    if (status) {
      filteredTargets = kpiTargets.filter(target => target.status === status);
    }
    if (priority) {
      filteredTargets = kpiTargets.filter(target => target.priority === priority);
    }

    res.json({
      success: true,
      data: filteredTargets,
      total: filteredTargets.length,
      filters: { category, status, priority }
    });
  } catch (error) {
    logger.error('Error getting KPI targets:', error);
    res.status(500).json({ error: 'Failed to get KPI targets' });
  }
});

// Create KPI target
router.post('/kpi-targets', authenticateToken, requireRole(['admin', 'manager']), biRateLimit, async (req, res) => {
  try {
    const { name, category, current, target, unit, timeframe, priority } = req.body;
    
    if (!name || !category || !target || !unit || !timeframe) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Name, category, target, unit, and timeframe are required'
      });
    }

    // Mock KPI target creation (replace with actual KPI management system)
    const kpiTarget = {
      id: Date.now().toString(),
      name,
      category,
      current: current || 0,
      target,
      unit,
      timeframe,
      status: 'new',
      priority: priority || 'medium',
      progress: 0,
      trend: 'stable',
      createdAt: new Date(),
      createdBy: req.user.userId,
      lastUpdated: new Date()
    };

    res.status(201).json({
      success: true,
      message: 'KPI target created successfully',
      data: kpiTarget
    });
  } catch (error) {
    logger.error('Error creating KPI target:', error);
    res.status(500).json({ error: 'Failed to create KPI target' });
  }
});

// Update KPI target
router.put('/kpi-targets/:id', authenticateToken, requireRole(['admin', 'manager']), biRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const { current, target, status, priority } = req.body;
    
    if (!current && !target && !status && !priority) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_UPDATE_FIELDS',
        message: 'At least one field to update is required'
      });
    }

    // Mock KPI target update (replace with actual KPI management system)
    const updateData = {
      id,
      ...(current !== undefined && { current }),
      ...(target !== undefined && { target }),
      ...(status !== undefined && { status }),
      ...(priority !== undefined && { priority }),
      lastUpdated: new Date(),
      updatedBy: req.user.userId
    };

    // Calculate progress if current and target are provided
    if (current !== undefined && target !== undefined) {
      updateData.progress = Math.min(current / target, 1);
    }

    res.json({
      success: true,
      message: 'KPI target updated successfully',
      data: updateData
    });
  } catch (error) {
    logger.error('Error updating KPI target:', error);
    res.status(500).json({ error: 'Failed to update KPI target' });
  }
});

// ==================== BI REPORTS ====================

// Get BI reports
router.get('/reports', authenticateToken, async (req, res) => {
  try {
    const { type, status, limit = 20 } = req.query;
    
    // Mock BI reports (replace with actual reporting system)
    const reports = [
      {
        id: '1',
        name: 'Monthly Financial Performance',
        type: 'financial',
        status: 'completed',
        format: 'pdf',
        size: '2.4 MB',
        generatedAt: new Date('2024-01-15T10:00:00Z'),
        generatedBy: 'system',
        downloadUrl: '/reports/monthly-financial-2024-01.pdf',
        parameters: {
          month: 'January 2024',
          department: 'all',
          includeCharts: true
        }
      },
      {
        id: '2',
        name: 'Customer Satisfaction Analysis',
        type: 'customer',
        status: 'completed',
        format: 'excel',
        size: '1.8 MB',
        generatedAt: new Date('2024-01-14T15:30:00Z'),
        generatedBy: 'analytics_team',
        downloadUrl: '/reports/customer-satisfaction-2024-01.xlsx',
        parameters: {
          period: 'Q4 2023',
          segments: 'all',
          includeTrends: true
        }
      },
      {
        id: '3',
        name: 'Operational Efficiency Report',
        type: 'operational',
        status: 'processing',
        format: 'pdf',
        size: null,
        generatedAt: null,
        generatedBy: null,
        downloadUrl: null,
        parameters: {
          quarter: 'Q1 2024',
          departments: ['hr', 'operations', 'finance'],
          includeBenchmarks: true
        }
      }
    ];

    let filteredReports = reports;
    if (type) {
      filteredReports = reports.filter(report => report.type === type);
    }
    if (status) {
      filteredReports = reports.filter(report => report.status === status);
    }

    res.json({
      success: true,
      data: filteredReports.slice(0, parseInt(limit)),
      total: filteredReports.length,
      filters: { type, status, limit }
    });
  } catch (error) {
    logger.error('Error getting BI reports:', error);
    res.status(500).json({ error: 'Failed to get BI reports' });
  }
});

// Generate BI report
router.post('/reports', authenticateToken, requireRole(['admin', 'analyst']), biRateLimit, async (req, res) => {
  try {
    const { name, type, format, parameters } = req.body;
    
    if (!name || !type || !format) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Name, type, and format are required'
      });
    }

    // Mock report generation (replace with actual reporting system)
    const report = {
      id: Date.now().toString(),
      name,
      type,
      status: 'processing',
      format,
      size: null,
      generatedAt: null,
      generatedBy: req.user.userId,
      downloadUrl: null,
      parameters: parameters || {},
      createdAt: new Date()
    };

    res.status(201).json({
      success: true,
      message: 'Report generation started',
      data: report
    });
  } catch (error) {
    logger.error('Error generating BI report:', error);
    res.status(500).json({ error: 'Failed to generate BI report' });
  }
});

// ==================== BI DASHBOARDS ====================

// Get BI dashboards
router.get('/dashboards', authenticateToken, async (req, res) => {
  try {
    const { category, access } = req.query;
    
    // Mock BI dashboards (replace with actual dashboard system)
    const dashboards = [
      {
        id: '1',
        name: 'Executive Overview',
        category: 'executive',
        access: 'admin',
        description: 'High-level business metrics and KPIs for executives',
        widgets: 12,
        lastUpdated: new Date('2024-01-15T09:00:00Z'),
        url: '/dashboards/executive-overview',
        thumbnail: '/thumbnails/executive-dashboard.png'
      },
      {
        id: '2',
        name: 'Financial Performance',
        category: 'financial',
        access: 'finance',
        description: 'Detailed financial metrics and analysis',
        widgets: 8,
        lastUpdated: new Date('2024-01-15T08:30:00Z'),
        url: '/dashboards/financial-performance',
        thumbnail: '/thumbnails/financial-dashboard.png'
      },
      {
        id: '3',
        name: 'Customer Insights',
        category: 'customer',
        access: 'marketing',
        description: 'Customer behavior and satisfaction metrics',
        widgets: 10,
        lastUpdated: new Date('2024-01-15T07:45:00Z'),
        url: '/dashboards/customer-insights',
        thumbnail: '/thumbnails/customer-dashboard.png'
      },
      {
        id: '4',
        name: 'Operational Metrics',
        category: 'operational',
        access: 'operations',
        description: 'Operational efficiency and productivity metrics',
        widgets: 6,
        lastUpdated: new Date('2024-01-15T06:15:00Z'),
        url: '/dashboards/operational-metrics',
        thumbnail: '/thumbnails/operational-dashboard.png'
      }
    ];

    let filteredDashboards = dashboards;
    if (category) {
      filteredDashboards = dashboards.filter(dashboard => dashboard.category === category);
    }
    if (access) {
      filteredDashboards = dashboards.filter(dashboard => 
        dashboard.access === access || dashboard.access === 'admin'
      );
    }

    res.json({
      success: true,
      data: filteredDashboards,
      total: filteredDashboards.length,
      filters: { category, access }
    });
  } catch (error) {
    logger.error('Error getting BI dashboards:', error);
    res.status(500).json({ error: 'Failed to get BI dashboards' });
  }
});

// ==================== BI ALERTS ====================

// Get BI alerts
router.get('/alerts', authenticateToken, async (req, res) => {
  try {
    const { severity, status, limit = 50 } = req.query;
    
    // Mock BI alerts (replace with actual alerting system)
    const alerts = [
      {
        id: '1',
        title: 'Revenue Target at Risk',
        message: 'Current revenue is 15% below target for this quarter',
        severity: 'high',
        status: 'active',
        category: 'financial',
        metric: 'revenue',
        currentValue: 125000,
        targetValue: 150000,
        threshold: 0.85,
        triggeredAt: new Date('2024-01-15T08:00:00Z'),
        acknowledgedAt: null,
        acknowledgedBy: null
      },
      {
        id: '2',
        title: 'Customer Satisfaction Improving',
        message: 'Customer satisfaction score increased by 15% this month',
        severity: 'low',
        status: 'acknowledged',
        category: 'customer',
        metric: 'satisfaction',
        currentValue: 4.6,
        previousValue: 4.0,
        change: 0.15,
        triggeredAt: new Date('2024-01-14T14:30:00Z'),
        acknowledgedAt: new Date('2024-01-14T15:00:00Z'),
        acknowledgedBy: 'marketing_team'
      }
    ];

    let filteredAlerts = alerts;
    if (severity) {
      filteredAlerts = alerts.filter(alert => alert.severity === severity);
    }
    if (status) {
      filteredAlerts = alerts.filter(alert => alert.status === status);
    }

    res.json({
      success: true,
      data: filteredAlerts.slice(0, parseInt(limit)),
      total: filteredAlerts.length,
      filters: { severity, status, limit }
    });
  } catch (error) {
    logger.error('Error getting BI alerts:', error);
    res.status(500).json({ error: 'Failed to get BI alerts' });
  }
});

// Acknowledge BI alert
router.post('/alerts/:id/acknowledge', authenticateToken, biRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    // Mock alert acknowledgment (replace with actual alerting system)
    const acknowledgment = {
      id,
      acknowledgedAt: new Date(),
      acknowledgedBy: req.user.userId,
      notes: notes || null,
      status: 'acknowledged'
    };

    res.json({
      success: true,
      message: 'Alert acknowledged successfully',
      data: acknowledgment
    });
  } catch (error) {
    logger.error('Error acknowledging BI alert:', error);
    res.status(500).json({ error: 'Failed to acknowledge alert' });
  }
});

// Consolidated business intelligence dashboard endpoint - replaces multiple separate calls
router.get('/dashboard', authenticateToken, requireRole(['admin', 'management', 'analytics']), async (req, res) => {
  try {
    console.log('📊 BUSINESS_INTELLIGENCE_DASHBOARD_REQUEST:', {
      user: req.user.email,
      timestamp: new Date().toISOString()
    });

    // Get BI metrics
    const biMetrics = {
      financial: {
        revenue: {
          current: Math.floor(Math.random() * 200000) + 100000,
          previous: Math.floor(Math.random() * 180000) + 90000,
          change: 0.05 + Math.random() * 0.1,
          trend: 'increasing',
          forecast: Math.floor(Math.random() * 220000) + 110000
        },
        profit: {
          current: Math.floor(Math.random() * 80000) + 40000,
          previous: Math.floor(Math.random() * 75000) + 35000,
          change: 0.05 + Math.random() * 0.1,
          trend: 'increasing',
          forecast: Math.floor(Math.random() * 90000) + 45000
        }
      },
      operational: {
        efficiency: {
          current: 85 + Math.random() * 10,
          previous: 80 + Math.random() * 10,
          change: 0.02 + Math.random() * 0.05,
          trend: 'increasing'
        },
        productivity: {
          current: 92 + Math.random() * 5,
          previous: 88 + Math.random() * 5,
          change: 0.03 + Math.random() * 0.04,
          trend: 'increasing'
        }
      }
    };

    // Get BI reports
    const biReports = [
      {
        id: '1',
        title: 'Monthly Financial Report',
        type: 'financial',
        status: 'completed',
        generatedAt: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
        insights: [
          'Revenue increased by 12% compared to last month',
          'Cost optimization initiatives showing positive results',
          'Customer acquisition cost decreased by 8%'
        ]
      },
      {
        id: '2',
        title: 'Operational Efficiency Analysis',
        type: 'operational',
        status: 'in_progress',
        generatedAt: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
        insights: [
          'Process automation reduced manual work by 25%',
          'Resource utilization improved across all departments',
          'Quality metrics showing consistent improvement'
        ]
      }
    ];

    const consolidatedData = {
      biMetrics,
      biReports,
      lastUpdated: new Date().toISOString()
    };

    console.log('✅ BUSINESS_INTELLIGENCE_DASHBOARD_SUCCESS:', {
      user: req.user.email,
      dataSize: JSON.stringify(consolidatedData).length,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      data: consolidatedData,
      message: 'Business intelligence dashboard data retrieved successfully',
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('❌ BUSINESS_INTELLIGENCE_DASHBOARD_ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve business intelligence dashboard data',
      message: error.message,
      timestamp: Date.now()
    });
  }
});

// Individual endpoints for backward compatibility (but these should be avoided)
router.get('/metrics', authenticateToken, async (req, res) => {
  try {
    const metrics = {
      financial: {
        revenue: {
          current: Math.floor(Math.random() * 200000) + 100000,
          previous: Math.floor(Math.random() * 180000) + 90000,
          change: 0.05 + Math.random() * 0.1,
          trend: 'increasing',
          forecast: Math.floor(Math.random() * 220000) + 110000
        },
        profit: {
          current: Math.floor(Math.random() * 80000) + 40000,
          previous: Math.floor(Math.random() * 75000) + 35000,
          change: 0.05 + Math.random() * 0.1,
          trend: 'increasing',
          forecast: Math.floor(Math.random() * 90000) + 45000
        }
      },
      operational: {
        efficiency: {
          current: 85 + Math.random() * 10,
          previous: 80 + Math.random() * 10,
          change: 0.02 + Math.random() * 0.05,
          trend: 'increasing'
        },
        productivity: {
          current: 92 + Math.random() * 5,
          previous: 88 + Math.random() * 5,
          change: 0.03 + Math.random() * 0.04,
          trend: 'increasing'
        }
      }
    };

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve BI metrics',
      message: error.message
    });
  }
});

router.get('/reports', authenticateToken, async (req, res) => {
  try {
    const reports = [
      {
        id: '1',
        title: 'Monthly Financial Report',
        type: 'financial',
        status: 'completed',
        generatedAt: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
        insights: [
          'Revenue increased by 12% compared to last month',
          'Cost optimization initiatives showing positive results',
          'Customer acquisition cost decreased by 8%'
        ]
      },
      {
        id: '2',
        title: 'Operational Efficiency Analysis',
        type: 'operational',
        status: 'in_progress',
        generatedAt: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
        insights: [
          'Process automation reduced manual work by 25%',
          'Resource utilization improved across all departments',
          'Quality metrics showing consistent improvement'
        ]
      }
    ];

    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve BI reports',
      message: error.message
    });
  }
});

module.exports = router;
