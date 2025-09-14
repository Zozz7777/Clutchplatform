const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const logger = require('../utils/logger');

// ============================================================================
// DASHBOARD ENDPOINTS
// ============================================================================

// GET /api/v1/dashboard/admin/overview - Get admin dashboard overview
router.get('/admin/overview', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const overviewData = {
      users: {
        total: 1250,
        active: 980,
        new: 45,
        growth: 12.5
      },
      bookings: {
        total: 2847,
        pending: 23,
        completed: 2824,
        cancelled: 12,
        growth: 8.2
      },
      revenue: {
        total: 125000,
        monthly: 25000,
        weekly: 6250,
        daily: 892,
        growth: 15.3
      },
      vehicles: {
        total: 150,
        available: 142,
        inService: 8,
        maintenance: 3
      },
      services: {
        total: 89,
        active: 67,
        completed: 22,
        pending: 5
      },
      partners: {
        total: 45,
        active: 38,
        pending: 7,
        growth: 5.2
      }
    };

    res.json({
      success: true,
      data: overviewData,
      message: 'Admin dashboard overview retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Get admin overview error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_ADMIN_OVERVIEW_FAILED',
      message: 'Failed to get admin dashboard overview',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/dashboard/stats - Get dashboard statistics by type
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { type } = req.query;
    
    let statsData = {};
    
    switch (type) {
      case 'revenue':
        statsData = {
          totalRevenue: 125000,
          monthlyRevenue: 25000,
          weeklyRevenue: 6250,
          dailyRevenue: 892,
          growth: 15.3,
          chartData: [
            { month: 'Jan', revenue: 20000 },
            { month: 'Feb', revenue: 22000 },
            { month: 'Mar', revenue: 25000 },
            { month: 'Apr', revenue: 23000 },
            { month: 'May', revenue: 25000 }
          ]
        };
        break;
        
      case 'users':
        statsData = {
          total: 1250,
          active: 980,
          new: 45,
          growth: 12.5,
          chartData: [
            { month: 'Jan', users: 1000 },
            { month: 'Feb', users: 1100 },
            { month: 'Mar', users: 1200 },
            { month: 'Apr', users: 1180 },
            { month: 'May', users: 1250 }
          ]
        };
        break;
        
      case 'bookings':
        statsData = {
          total: 2847,
          pending: 23,
          completed: 2824,
          cancelled: 12,
          growth: 8.2,
          chartData: [
            { month: 'Jan', bookings: 2000 },
            { month: 'Feb', bookings: 2200 },
            { month: 'Mar', bookings: 2500 },
            { month: 'Apr', bookings: 2400 },
            { month: 'May', bookings: 2847 }
          ]
        };
        break;
        
      default:
        return res.status(400).json({
          success: false,
          error: 'INVALID_TYPE',
          message: 'Invalid stats type. Use: revenue, users, or bookings',
          timestamp: new Date().toISOString()
        });
    }

    res.json({
      success: true,
      data: statsData,
      message: `${type} statistics retrieved successfully`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_STATS_FAILED',
      message: 'Failed to get dashboard statistics',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/dashboard/consolidated - Get consolidated dashboard data
router.get('/consolidated', authenticateToken, async (req, res) => {
  try {
    const dashboardData = {
      overview: {
        totalUsers: 1250,
        activeUsers: 980,
        totalRevenue: 125000,
        monthlyGrowth: 12.5,
        systemHealth: 98.5
      },
      metrics: {
        userEngagement: 85.2,
        conversionRate: 3.4,
        averageSessionTime: 8.5,
        bounceRate: 25.1
      },
      recentActivity: [
        { id: 1, type: 'user_registration', message: 'New user registered', timestamp: new Date().toISOString() },
        { id: 2, type: 'payment_received', message: 'Payment of $150 received', timestamp: new Date().toISOString() },
        { id: 3, type: 'system_alert', message: 'High CPU usage detected', timestamp: new Date().toISOString() }
      ],
      charts: {
        revenue: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'], data: [10000, 12000, 15000, 18000, 20000] },
        users: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'], data: [100, 150, 200, 250, 300] }
      }
    };

    res.json({
      success: true,
      data: { dashboard: dashboardData },
      message: 'Consolidated dashboard data retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Get consolidated dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_DASHBOARD_FAILED',
      message: 'Failed to get consolidated dashboard data',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /dashboard/activity - Get dashboard activity
router.get('/activity', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, dateFrom, dateTo } = req.query;
    
    const activities = [
      {
        id: 'activity-1',
        type: 'user_action',
        user: 'john.doe@example.com',
        action: 'profile_updated',
        timestamp: new Date().toISOString(),
        details: 'Updated profile information',
        metadata: { field: 'phone', oldValue: '+1234567890', newValue: '+1987654321' }
      },
      {
        id: 'activity-2',
        type: 'system_event',
        action: 'backup_completed',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        details: 'Daily backup completed successfully',
        metadata: { size: '2.5GB', duration: '15 minutes' }
      }
    ];

    res.json({
      success: true,
      data: { 
        activities,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: activities.length,
          pages: Math.ceil(activities.length / limit)
        }
      },
      message: 'Dashboard activity retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Get dashboard activity error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_DASHBOARD_ACTIVITY_FAILED',
      message: 'Failed to get dashboard activity',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /dashboard/analytics - Get dashboard analytics
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const { period = '30d', metric } = req.query;
    
    const analytics = {
      period: period,
      metrics: {
        pageViews: { total: 125000, change: 12.5, trend: 'up' },
        uniqueVisitors: { total: 45000, change: 8.3, trend: 'up' },
        conversionRate: { total: 3.4, change: -0.2, trend: 'down' },
        averageSessionDuration: { total: 245, change: 15.2, trend: 'up' }
      },
      topPages: [
        { page: '/dashboard', views: 15000, uniqueVisitors: 8500 },
        { page: '/analytics', views: 12000, uniqueVisitors: 7200 },
        { page: '/users', views: 9800, uniqueVisitors: 5600 }
      ],
      trafficSources: [
        { source: 'Direct', percentage: 45.2, visitors: 20340 },
        { source: 'Google', percentage: 32.1, visitors: 14445 },
        { source: 'Social Media', percentage: 15.8, visitors: 7110 }
      ]
    };

    res.json({
      success: true,
      data: { analytics },
      message: 'Dashboard analytics retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Get dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_DASHBOARD_ANALYTICS_FAILED',
      message: 'Failed to get dashboard analytics',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /dashboard/finance - Get finance dashboard
router.get('/finance', authenticateToken, requireRole(['admin', 'finance']), async (req, res) => {
  try {
    const financeData = {
      summary: {
        totalRevenue: 125000,
        totalExpenses: 85000,
        netProfit: 40000,
        profitMargin: 32.0
      },
      revenue: { current: 125000, previous: 110000, change: 13.6, trend: 'up' },
      expenses: { current: 85000, previous: 78000, change: 9.0, trend: 'up' },
      categories: [
        { category: 'Sales', amount: 125000, percentage: 100.0 },
        { category: 'Marketing', amount: 15000, percentage: 12.0 },
        { category: 'Operations', amount: 25000, percentage: 20.0 }
      ]
    };

    res.json({
      success: true,
      data: { finance: financeData },
      message: 'Finance dashboard data retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Get finance dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_FINANCE_DASHBOARD_FAILED',
      message: 'Failed to get finance dashboard data',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /dashboard/fleet - Get fleet dashboard
router.get('/fleet', authenticateToken, requireRole(['admin', 'fleet_manager']), async (req, res) => {
  try {
    const fleetData = {
      overview: {
        totalVehicles: 150,
        activeVehicles: 142,
        maintenanceDue: 8,
        fuelEfficiency: 28.5
      },
      status: { inService: 142, maintenance: 5, outOfService: 3 },
      metrics: {
        averageMileage: 45000,
        fuelConsumption: 1250,
        maintenanceCost: 15000,
        utilizationRate: 85.2
      }
    };

    res.json({
      success: true,
      data: { fleet: fleetData },
      message: 'Fleet dashboard data retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Get fleet dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_FLEET_DASHBOARD_FAILED',
      message: 'Failed to get fleet dashboard data',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /dashboard/hr - Get HR dashboard
router.get('/hr', authenticateToken, requireRole(['admin', 'hr']), async (req, res) => {
  try {
    const hrData = {
      overview: {
        totalEmployees: 85,
        activeEmployees: 82,
        newHires: 3,
        departures: 1
      },
      departments: [
        { name: 'Engineering', count: 25, percentage: 29.4 },
        { name: 'Sales', count: 20, percentage: 23.5 },
        { name: 'Marketing', count: 15, percentage: 17.6 }
      ],
      metrics: {
        averageTenure: 2.5,
        turnoverRate: 8.2,
        satisfactionScore: 4.2,
        trainingCompletion: 78.5
      }
    };

    res.json({
      success: true,
      data: { hr: hrData },
      message: 'HR dashboard data retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Get HR dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_HR_DASHBOARD_FAILED',
      message: 'Failed to get HR dashboard data',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /dashboard/hr/employees - Get HR employees dashboard
router.get('/hr/employees', authenticateToken, requireRole(['admin', 'hr']), async (req, res) => {
  try {
    const { page = 1, limit = 20, department, status } = req.query;
    
    const employees = [
      {
        id: 'emp-1',
        name: 'John Doe',
        email: 'john.doe@company.com',
        department: 'Engineering',
        position: 'Senior Developer',
        status: 'active',
        hireDate: '2022-01-15',
        salary: 95000,
        performance: 4.5
      },
      {
        id: 'emp-2',
        name: 'Jane Smith',
        email: 'jane.smith@company.com',
        department: 'Sales',
        position: 'Sales Manager',
        status: 'active',
        hireDate: '2021-08-20',
        salary: 85000,
        performance: 4.8
      }
    ];

    res.json({
      success: true,
      data: { 
        employees,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: employees.length,
          pages: Math.ceil(employees.length / limit)
        }
      },
      message: 'HR employees data retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Get HR employees error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_HR_EMPLOYEES_FAILED',
      message: 'Failed to get HR employees data',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /dashboard/partners - Get partners dashboard
router.get('/partners', authenticateToken, requireRole(['admin', 'partnerships']), async (req, res) => {
  try {
    const partnersData = {
      overview: {
        totalPartners: 25,
        activePartners: 22,
        newPartners: 2,
        revenueGenerated: 45000
      },
      categories: [
        { category: 'Suppliers', count: 12, revenue: 25000 },
        { category: 'Technology', count: 8, revenue: 15000 },
        { category: 'Marketing', count: 5, revenue: 5000 }
      ],
      topPartners: [
        { name: 'AutoParts Plus', revenue: 15000, orders: 125, rating: 4.8 },
        { name: 'Tech Solutions Inc', revenue: 12000, orders: 98, rating: 4.6 }
      ]
    };

    res.json({
      success: true,
      data: { partners: partnersData },
      message: 'Partners dashboard data retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Get partners dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_PARTNERS_DASHBOARD_FAILED',
      message: 'Failed to get partners dashboard data',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /dashboard/security - Get security dashboard
router.get('/security', authenticateToken, requireRole(['admin', 'security']), async (req, res) => {
  try {
    const securityData = {
      overview: {
        totalThreats: 15,
        resolvedThreats: 12,
        activeThreats: 3,
        securityScore: 92.5
      },
      threats: [
        { id: 1, type: 'suspicious_login', severity: 'medium', status: 'investigating', timestamp: new Date().toISOString() },
        { id: 2, type: 'brute_force_attempt', severity: 'high', status: 'blocked', timestamp: new Date(Date.now() - 3600000).toISOString() }
      ],
      metrics: {
        loginAttempts: 1250,
        failedLogins: 45,
        blockedIPs: 12,
        securityIncidents: 3
      }
    };

    res.json({
      success: true,
      data: { security: securityData },
      message: 'Security dashboard data retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Get security dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_SECURITY_DASHBOARD_FAILED',
      message: 'Failed to get security dashboard data',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /dashboard/settings - Get dashboard settings
router.get('/settings', authenticateToken, async (req, res) => {
  try {
    const settings = {
      user: {
        theme: 'light',
        language: 'en',
        timezone: 'UTC',
        notifications: { email: true, push: true, sms: false }
      },
      dashboard: {
        defaultView: 'overview',
        refreshInterval: 30,
        widgets: [
          { id: 'revenue', position: 1, enabled: true },
          { id: 'users', position: 2, enabled: true },
          { id: 'activity', position: 3, enabled: true }
        ]
      },
      permissions: {
        canViewFinance: req.user.role === 'admin' || req.user.role === 'finance',
        canViewHR: req.user.role === 'admin' || req.user.role === 'hr',
        canViewSecurity: req.user.role === 'admin' || req.user.role === 'security'
      }
    };

    res.json({
      success: true,
      data: { settings },
      message: 'Dashboard settings retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Get dashboard settings error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_DASHBOARD_SETTINGS_FAILED',
      message: 'Failed to get dashboard settings',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /dashboard/users - Get users dashboard
router.get('/users', authenticateToken, requireRole(['admin', 'user_manager']), async (req, res) => {
  try {
    const usersData = {
      overview: {
        totalUsers: 1250,
        activeUsers: 980,
        newUsers: 45,
        churnedUsers: 12
      },
      metrics: {
        averageSessionTime: 8.5,
        retentionRate: 78.5,
        conversionRate: 3.4,
        satisfactionScore: 4.2
      },
      topUsers: [
        { id: 'user-1', name: 'John Doe', email: 'john@example.com', activity: 95, lastActive: new Date().toISOString() },
        { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com', activity: 92, lastActive: new Date(Date.now() - 3600000).toISOString() }
      ]
    };

    res.json({
      success: true,
      data: { users: usersData },
      message: 'Users dashboard data retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Get users dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_USERS_DASHBOARD_FAILED',
      message: 'Failed to get users dashboard data',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /dashboard/admin/overview - Get admin overview dashboard
router.get('/admin/overview', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const adminOverview = {
      systemHealth: {
        status: 'healthy',
        uptime: 99.9,
        responseTime: 245,
        errorRate: 0.1
      },
      userMetrics: {
        totalUsers: 1250,
        activeUsers: 980,
        newRegistrations: 45,
        userGrowth: 12.5
      },
      businessMetrics: {
        totalRevenue: 125000,
        monthlyRevenue: 15000,
        revenueGrowth: 15.2,
        profitMargin: 32.0
      },
      alerts: [
        { id: 1, type: 'warning', message: 'High CPU usage detected', timestamp: new Date().toISOString() },
        { id: 2, type: 'info', message: 'Scheduled maintenance in 2 hours', timestamp: new Date(Date.now() + 7200000).toISOString() }
      ]
    };

    res.json({
      success: true,
      data: { adminOverview },
      message: 'Admin overview dashboard retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Get admin overview error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_ADMIN_OVERVIEW_FAILED',
      message: 'Failed to get admin overview dashboard',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;