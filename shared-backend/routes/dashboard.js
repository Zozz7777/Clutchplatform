/**
 * Dashboard Routes
 * Handles dashboard KPIs and analytics data
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');

// GET /api/v1/dashboard/kpis - Get dashboard KPIs
router.get('/kpis', authenticateToken, async (req, res) => {
  try {
    // Mock dashboard KPIs data
    const kpis = {
      totalUsers: 1250,
      activeUsers: 1100,
      totalVehicles: 850,
      activeVehicles: 780,
      totalBookings: 2100,
      completedBookings: 1950,
      pendingBookings: 150,
      totalRevenue: 125000,
      monthlyRevenue: 45000,
      averageRating: 4.7,
      customerSatisfaction: 92,
      fleetUtilization: 85,
      serviceCompletionRate: 95,
      responseTime: '2.5 minutes',
      uptime: '99.9%',
      trends: {
        users: { change: '+12%', trend: 'up' },
        revenue: { change: '+8%', trend: 'up' },
        bookings: { change: '+15%', trend: 'up' },
        satisfaction: { change: '+2%', trend: 'up' }
      },
      charts: {
        revenueChart: [
          { month: 'Jan', revenue: 35000 },
          { month: 'Feb', revenue: 42000 },
          { month: 'Mar', revenue: 38000 },
          { month: 'Apr', revenue: 45000 }
        ],
        bookingsChart: [
          { day: 'Mon', bookings: 45 },
          { day: 'Tue', bookings: 52 },
          { day: 'Wed', bookings: 48 },
          { day: 'Thu', bookings: 61 },
          { day: 'Fri', bookings: 55 },
          { day: 'Sat', bookings: 38 },
          { day: 'Sun', bookings: 42 }
        ],
        userGrowthChart: [
          { week: 'Week 1', users: 1200 },
          { week: 'Week 2', users: 1250 },
          { week: 'Week 3', users: 1300 },
          { week: 'Week 4', users: 1350 }
        ]
      }
    };

    res.json({
      success: true,
      data: kpis,
      message: 'Dashboard KPIs retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Dashboard KPIs error:', error);
    res.status(500).json({
      success: false,
      error: 'DASHBOARD_KPIS_ERROR',
      message: 'Failed to retrieve dashboard KPIs',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/dashboard/analytics - Get dashboard analytics
router.get('/analytics', authenticateToken, requireRole(['admin', 'analyst']), async (req, res) => {
  try {
    const analytics = {
      overview: {
        totalRevenue: 125000,
        totalBookings: 2100,
        totalUsers: 1250,
        totalVehicles: 850
      },
      performance: {
        averageResponseTime: '2.5 minutes',
        serviceCompletionRate: 95,
        customerSatisfaction: 4.7,
        fleetUtilization: 85
      },
      trends: {
        revenueGrowth: 8.5,
        userGrowth: 12.3,
        bookingGrowth: 15.2,
        satisfactionGrowth: 2.1
      }
    };

    res.json({
      success: true,
      data: analytics,
      message: 'Dashboard analytics retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'DASHBOARD_ANALYTICS_ERROR',
      message: 'Failed to retrieve dashboard analytics',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/dashboard/recent-activity - Get recent activity
router.get('/recent-activity', authenticateToken, async (req, res) => {
  try {
    const recentActivity = [
      {
        id: 'activity-001',
        type: 'booking',
        message: 'New service booking created',
        user: 'Ahmed Al-Rashid',
        timestamp: '2024-01-15T10:30:00Z',
        status: 'completed'
      },
      {
        id: 'activity-002',
        type: 'payment',
        message: 'Payment processed successfully',
        user: 'Sarah Johnson',
        timestamp: '2024-01-15T09:45:00Z',
        status: 'completed'
      },
      {
        id: 'activity-003',
        type: 'vehicle',
        message: 'Vehicle maintenance completed',
        user: 'System',
        timestamp: '2024-01-15T08:20:00Z',
        status: 'completed'
      },
      {
        id: 'activity-004',
        type: 'user',
        message: 'New user registered',
        user: 'Mohammed Hassan',
        timestamp: '2024-01-15T07:15:00Z',
        status: 'completed'
      }
    ];

    res.json({
      success: true,
      data: recentActivity,
      message: 'Recent activity retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({
      success: false,
      error: 'RECENT_ACTIVITY_ERROR',
      message: 'Failed to retrieve recent activity',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
