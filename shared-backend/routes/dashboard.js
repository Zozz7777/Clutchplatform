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
    // Get real data from database
    const usersCollection = await getCollection('users');
    const vehiclesCollection = await getCollection('vehicles');
    const bookingsCollection = await getCollection('bookings');
    const transactionsCollection = await getCollection('transactions');
    const reviewsCollection = await getCollection('reviews');
    
    // Calculate real analytics from database
    const [
      totalUsers,
      totalVehicles,
      totalBookings,
      totalRevenueResult,
      completedBookings,
      totalReviews,
      averageRatingResult
    ] = await Promise.all([
      usersCollection.countDocuments(),
      vehiclesCollection.countDocuments(),
      bookingsCollection.countDocuments(),
      transactionsCollection.aggregate([
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).toArray(),
      bookingsCollection.countDocuments({ status: 'completed' }),
      reviewsCollection.countDocuments(),
      reviewsCollection.aggregate([
        { $group: { _id: null, average: { $avg: '$rating' } } }
      ]).toArray()
    ]);

    const totalRevenue = totalRevenueResult[0]?.total || 0;
    const averageRating = averageRatingResult[0]?.average || 0;
    const serviceCompletionRate = totalBookings > 0 ? (completedBookings / totalBookings * 100) : 0;
    
    // Calculate fleet utilization (active vehicles / total vehicles)
    const activeVehicles = await vehiclesCollection.countDocuments({ status: 'active' });
    const fleetUtilization = totalVehicles > 0 ? (activeVehicles / totalVehicles * 100) : 0;
    
    // Calculate customer satisfaction (based on reviews)
    const customerSatisfaction = averageRating > 0 ? (averageRating / 5 * 100) : 0;

    // Calculate trends (compare current month vs previous month)
    const currentMonth = new Date();
    const previousMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    
    const [
      currentMonthRevenue,
      previousMonthRevenue,
      currentMonthUsers,
      previousMonthUsers,
      currentMonthBookings,
      previousMonthBookings
    ] = await Promise.all([
      transactionsCollection.aggregate([
        { $match: { createdAt: { $gte: currentMonthStart } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).toArray(),
      transactionsCollection.aggregate([
        { $match: { createdAt: { $gte: previousMonth, $lt: currentMonthStart } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).toArray(),
      usersCollection.countDocuments({ createdAt: { $gte: currentMonthStart } }),
      usersCollection.countDocuments({ createdAt: { $gte: previousMonth, $lt: currentMonthStart } }),
      bookingsCollection.countDocuments({ createdAt: { $gte: currentMonthStart } }),
      bookingsCollection.countDocuments({ createdAt: { $gte: previousMonth, $lt: currentMonthStart } })
    ]);

    const currentRevenue = currentMonthRevenue[0]?.total || 0;
    const prevRevenue = previousMonthRevenue[0]?.total || 0;
    const revenueGrowth = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue * 100) : 0;
    
    const userGrowth = previousMonthUsers > 0 ? ((currentMonthUsers - previousMonthUsers) / previousMonthUsers * 100) : 0;
    const bookingGrowth = previousMonthBookings > 0 ? ((currentMonthBookings - previousMonthBookings) / previousMonthBookings * 100) : 0;

    const analytics = {
      overview: {
        totalRevenue: Math.round(totalRevenue),
        totalBookings: totalBookings,
        totalUsers: totalUsers,
        totalVehicles: totalVehicles
      },
      performance: {
        averageResponseTime: '2.5 minutes', // TODO: Calculate from actual response times
        serviceCompletionRate: Math.round(serviceCompletionRate * 10) / 10,
        customerSatisfaction: Math.round(customerSatisfaction * 10) / 10,
        fleetUtilization: Math.round(fleetUtilization * 10) / 10
      },
      trends: {
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
        userGrowth: Math.round(userGrowth * 10) / 10,
        bookingGrowth: Math.round(bookingGrowth * 10) / 10,
        satisfactionGrowth: 0 // TODO: Calculate satisfaction trend
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
