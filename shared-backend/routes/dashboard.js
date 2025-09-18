/**
 * Dashboard Routes
 * Handles dashboard KPIs and analytics data
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole, checkPermission } = require('../middleware/unified-auth');
const { getCollection } = require('../config/optimized-database');

// GET /api/v1/dashboard/kpis - Get dashboard KPIs
router.get('/kpis', authenticateToken, async (req, res) => {
  try {
    // Get real data from database
    const usersCollection = await getCollection('users');
    const vehiclesCollection = await getCollection('vehicles');
    const bookingsCollection = await getCollection('bookings');
    const transactionsCollection = await getCollection('transactions');
    
    // Calculate real KPIs from database
    const [
      totalUsers,
      activeUsers,
      totalVehicles,
      activeVehicles,
      totalBookings,
      completedBookings,
      pendingBookings,
      totalRevenueResult,
      monthlyRevenueResult
    ] = await Promise.all([
      usersCollection.countDocuments(),
      usersCollection.countDocuments({ isActive: true }),
      vehiclesCollection.countDocuments(),
      vehiclesCollection.countDocuments({ status: 'active' }),
      bookingsCollection.countDocuments(),
      bookingsCollection.countDocuments({ status: 'completed' }),
      bookingsCollection.countDocuments({ status: 'pending' }),
      transactionsCollection.aggregate([
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).toArray(),
      transactionsCollection.aggregate([
        { 
          $match: { 
            createdAt: { 
              $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) 
            } 
          } 
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).toArray()
    ]);

    const totalRevenue = totalRevenueResult[0]?.total || 0;
    const monthlyRevenue = monthlyRevenueResult[0]?.total || 0;

    // Calculate trends (simplified for now)
    const trends = {
      users: { change: '+0%', trend: 'stable' },
      revenue: { change: '+0%', trend: 'stable' },
      bookings: { change: '+0%', trend: 'stable' },
      satisfaction: { change: '+0%', trend: 'stable' }
    };

    // Get chart data from database
    const revenueChart = await transactionsCollection.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    const bookingsChart = await bookingsCollection.aggregate([
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    const kpis = {
      totalUsers,
      activeUsers,
      totalVehicles,
      activeVehicles,
      totalBookings,
      completedBookings,
      pendingBookings,
      totalRevenue,
      monthlyRevenue,
      averageRating: 4.7, // TODO: Calculate from reviews
      customerSatisfaction: 92, // TODO: Calculate from feedback
      fleetUtilization: 85, // TODO: Calculate from vehicle usage
      serviceCompletionRate: totalBookings > 0 ? (completedBookings / totalBookings * 100).toFixed(1) : 0,
      responseTime: '2.5 minutes', // TODO: Calculate from actual response times
      uptime: '99.9%', // TODO: Calculate from system monitoring
      trends,
      charts: {
        revenueChart: revenueChart.map(item => ({
          month: new Date(2024, item._id - 1).toLocaleString('default', { month: 'short' }),
          revenue: item.revenue
        })),
        bookingsChart: bookingsChart.map(item => ({
          day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][item._id - 1],
          bookings: item.bookings
        })),
        userGrowthChart: [] // TODO: Implement user growth chart
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
router.get('/analytics', authenticateToken, checkRole(['head_administrator', 'analyst']), async (req, res) => {
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
    const { db } = await getCollection('users');
    
    // Get recent activities from different collections
    const [recentBookings, recentPayments, recentUsers, recentVehicles] = await Promise.all([
      db.collection('bookings').find({}).sort({ createdAt: -1 }).limit(5).toArray(),
      db.collection('payments').find({}).sort({ createdAt: -1 }).limit(5).toArray(),
      db.collection('users').find({}).sort({ createdAt: -1 }).limit(5).toArray(),
      db.collection('fleet_vehicles').find({}).sort({ updatedAt: -1 }).limit(5).toArray()
    ]);

    // Transform data into activity format
    const recentActivity = [
      ...recentBookings.map(booking => ({
        id: `booking-${booking._id}`,
        type: 'booking',
        message: 'New service booking created',
        user: booking.customerName || 'Unknown Customer',
        timestamp: booking.createdAt,
        status: booking.status || 'pending'
      })),
      ...recentPayments.map(payment => ({
        id: `payment-${payment._id}`,
        type: 'payment',
        message: 'Payment processed successfully',
        user: payment.customerName || 'Unknown Customer',
        timestamp: payment.createdAt,
        status: payment.status || 'completed'
      })),
      ...recentUsers.map(user => ({
        id: `user-${user._id}`,
        type: 'user',
        message: 'New user registered',
        user: user.name || user.email,
        timestamp: user.createdAt,
        status: user.status || 'active'
      })),
      ...recentVehicles.map(vehicle => ({
        id: `vehicle-${vehicle._id}`,
        type: 'vehicle',
        message: 'Vehicle status updated',
        user: 'System',
        timestamp: vehicle.updatedAt || vehicle.createdAt,
        status: vehicle.status || 'active'
      }))
    ];

    // Sort by timestamp and limit to 20 most recent
    const sortedActivity = recentActivity
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 20);

    res.json({
      success: true,
      data: sortedActivity,
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
