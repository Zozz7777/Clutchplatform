const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole } = require('../middleware/unified-auth');
const { connectToDatabase } = require('../config/database-unified');

// GET /api/v1/analytics/metrics - Get analytics metrics
router.get('/metrics', authenticateToken, async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    
    // Get various metrics from different collections
    const [
      totalUsers,
      activeUsers,
      totalVehicles,
      activeVehicles,
      totalOrders,
      pendingOrders,
      totalRevenue,
      monthlyRevenue
    ] = await Promise.all([
      db.collection('users').countDocuments(),
      db.collection('users').countDocuments({ status: 'active' }),
      db.collection('fleet_vehicles').countDocuments(),
      db.collection('fleet_vehicles').countDocuments({ status: 'active' }),
      db.collection('orders').countDocuments(),
      db.collection('orders').countDocuments({ status: 'pending' }),
      db.collection('payments').aggregate([
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).toArray(),
      db.collection('payments').aggregate([
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

    // Calculate growth rates (compare current month vs previous month)
    const currentMonth = new Date();
    const previousMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    
    const [
      currentMonthUsers,
      previousMonthUsers,
      currentMonthRevenue,
      previousMonthRevenue
    ] = await Promise.all([
      db.collection('users').countDocuments({ createdAt: { $gte: currentMonthStart } }),
      db.collection('users').countDocuments({ createdAt: { $gte: previousMonth, $lt: currentMonthStart } }),
      db.collection('payments').aggregate([
        { $match: { createdAt: { $gte: currentMonthStart } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).toArray(),
      db.collection('payments').aggregate([
        { $match: { createdAt: { $gte: previousMonth, $lt: currentMonthStart } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).toArray()
    ]);

    const currentRevenue = currentMonthRevenue[0]?.total || 0;
    const prevRevenue = previousMonthRevenue[0]?.total || 0;
    const userGrowth = previousMonthUsers > 0 ? ((currentMonthUsers - previousMonthUsers) / previousMonthUsers * 100) : 0;
    const revenueGrowth = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue * 100) : 0;

    const metrics = {
      users: {
        total: totalUsers,
        active: activeUsers,
        growth: Math.round(userGrowth * 10) / 10
      },
      vehicles: {
        total: totalVehicles,
        active: activeVehicles,
        utilization: totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles * 100) * 10) / 10 : 0
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        completionRate: totalOrders > 0 ? Math.round(((totalOrders - pendingOrders) / totalOrders * 100) * 10) / 10 : 0
      },
      revenue: {
        total: totalRevenue[0]?.total || 0,
        monthly: monthlyRevenue[0]?.total || 0,
        growth: Math.round(revenueGrowth * 10) / 10
      }
    };

    res.json({
      success: true,
      data: metrics,
      message: 'Analytics metrics retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching analytics metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics metrics',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/analytics/performance - Get performance analytics
router.get('/performance', authenticateToken, async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const { period = '7d', metric = 'all' } = req.query;
    
    // Calculate date range based on period
    const now = new Date();
    let startDate;
    switch (period) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const performanceData = {
      period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      metrics: {}
    };

    // Get different metrics based on the requested metric type
    if (metric === 'all' || metric === 'users') {
      const userMetrics = await db.collection('users').aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]).toArray();
      
      performanceData.metrics.users = userMetrics;
    }

    if (metric === 'all' || metric === 'vehicles') {
      const vehicleMetrics = await db.collection('fleet_vehicles').aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]).toArray();
      
      performanceData.metrics.vehicles = vehicleMetrics;
    }

    if (metric === 'all' || metric === 'revenue') {
      const revenueMetrics = await db.collection('payments').aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, total: { $sum: '$amount' } } },
        { $sort: { _id: 1 } }
      ]).toArray();
      
      performanceData.metrics.revenue = revenueMetrics;
    }

    res.json({
      success: true,
      data: performanceData,
      message: 'Performance analytics retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching performance analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch performance analytics',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/analytics/trends - Get trend analysis
router.get('/trends', authenticateToken, async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const { type = 'all' } = req.query;
    
    const trends = {};
    
    if (type === 'all' || type === 'user_growth') {
      // Calculate user growth trend
      const userGrowth = await db.collection('users').aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]).toArray();
      
      trends.userGrowth = userGrowth;
    }
    
    if (type === 'all' || type === 'revenue_trend') {
      // Calculate revenue trend
      const revenueTrend = await db.collection('payments').aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            total: { $sum: '$amount' }
          }
        },
        { $sort: { _id: 1 } }
      ]).toArray();
      
      trends.revenueTrend = revenueTrend;
    }
    
    if (type === 'all' || type === 'vehicle_utilization') {
      // Calculate vehicle utilization trend
      const vehicleUtilization = await db.collection('fleet_vehicles').aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            total: { $sum: 1 },
            active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } }
          }
        },
        {
          $addFields: {
            utilization: { $multiply: [{ $divide: ['$active', '$total'] }, 100] }
          }
        },
        { $sort: { _id: 1 } }
      ]).toArray();
      
      trends.vehicleUtilization = vehicleUtilization;
    }

    res.json({
      success: true,
      data: trends,
      message: 'Trend analysis retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching trend analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trend analysis',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/analytics/dashboard - Get dashboard analytics
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    
    // Get comprehensive dashboard data
    const dashboardData = await Promise.all([
      // Recent activity
      db.collection('users').find().sort({ lastLogin: -1 }).limit(5).toArray(),
      db.collection('fleet_vehicles').find().sort({ updatedAt: -1 }).limit(5).toArray(),
      db.collection('orders').find().sort({ createdAt: -1 }).limit(5).toArray(),
      
      // Top performing metrics
      db.collection('fleet_vehicles').aggregate([
        { $group: { _id: '$make', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]).toArray(),
      
      // Revenue by month
      db.collection('payments').aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            total: { $sum: '$amount' }
          }
        },
        { $sort: { _id: -1 } },
        { $limit: 12 }
      ]).toArray()
    ]);

    const [recentUsers, recentVehicles, recentOrders, topMakes, monthlyRevenue] = dashboardData;

    res.json({
      success: true,
      data: {
        recentActivity: {
          users: recentUsers,
          vehicles: recentVehicles,
          orders: recentOrders
        },
        topMetrics: {
          vehicleMakes: topMakes
        },
        revenue: {
          monthly: monthlyRevenue
        }
      },
      message: 'Dashboard analytics retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard analytics',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/analytics/custom - Get custom analytics
router.post('/custom', authenticateToken, checkRole(['head_administrator', 'admin']), async (req, res) => {
  try {
    const { metrics, dateRange, filters } = req.body;
    const { db } = await connectToDatabase();
    
    if (!metrics || !Array.isArray(metrics)) {
      return res.status(400).json({
        success: false,
        error: 'Metrics array is required',
        timestamp: new Date().toISOString()
      });
    }

    const startDate = dateRange?.start ? new Date(dateRange.start) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = dateRange?.end ? new Date(dateRange.end) : new Date();

    const customData = {};
    
    for (const metric of metrics) {
      switch (metric) {
        case 'user_registrations':
          customData.userRegistrations = await db.collection('users').countDocuments({
            createdAt: { $gte: startDate, $lte: endDate },
            ...filters
          });
          break;
          
        case 'vehicle_additions':
          customData.vehicleAdditions = await db.collection('fleet_vehicles').countDocuments({
            createdAt: { $gte: startDate, $lte: endDate },
            ...filters
          });
          break;
          
        case 'total_revenue':
          const revenueData = await db.collection('payments').aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: endDate }, ...filters } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
          ]).toArray();
          customData.totalRevenue = revenueData[0]?.total || 0;
          break;
          
        default:
          console.warn(`Unknown metric: ${metric}`);
      }
    }

    res.json({
      success: true,
      data: customData,
      message: 'Custom analytics retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching custom analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch custom analytics',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/analytics/upsell-opportunities - Get upsell opportunities
router.get('/upsell-opportunities', authenticateToken, async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    
    // Get customers and their payment history
    const [customers, payments] = await Promise.all([
      db.collection('users').find({ role: { $in: ['user', 'customer'] } }).toArray(),
      db.collection('payments').find({}).toArray()
    ]);
    
    const opportunities = customers.map(customer => {
      const customerPayments = payments.filter(p => 
        p.customerId === customer._id.toString() || 
        p.userId === customer._id.toString()
      );
      
      const totalSpent = customerPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const avgPayment = customerPayments.length > 0 ? totalSpent / customerPayments.length : 0;
      
      // Calculate opportunity score based on spending patterns
      let opportunityScore = 0;
      let potentialRevenue = 0;
      let confidence = 0.5;
      
      if (totalSpent > 1000 && customerPayments.length > 3) {
        opportunityScore = 85;
        potentialRevenue = totalSpent * 1.5; // 50% increase potential
        confidence = 0.8;
      } else if (totalSpent > 500 && customerPayments.length > 2) {
        opportunityScore = 70;
        potentialRevenue = totalSpent * 1.3; // 30% increase potential
        confidence = 0.7;
      } else if (totalSpent > 100) {
        opportunityScore = 55;
        potentialRevenue = totalSpent * 1.2; // 20% increase potential
        confidence = 0.6;
      }
      
      return {
        customerId: customer._id.toString(),
        customerName: customer.name || customer.email,
        currentRevenue: totalSpent,
        potentialRevenue: Math.round(potentialRevenue),
        opportunityScore: opportunityScore,
        confidence: Math.round(confidence * 100) / 100,
        segment: customer.segment || 'Standard',
        lastPayment: customerPayments.length > 0 ? 
          customerPayments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0].createdAt : 
          customer.createdAt,
        paymentCount: customerPayments.length,
        avgPaymentAmount: Math.round(avgPayment)
      };
    }).filter(opp => opp.opportunityScore > 50).sort((a, b) => b.opportunityScore - a.opportunityScore);
    
    res.json({
      success: true,
      data: opportunities,
      message: 'Upsell opportunities retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching upsell opportunities:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch upsell opportunities',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/analytics/engagement-heatmap - Get engagement heatmap data
router.get('/engagement-heatmap', authenticateToken, async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    
    // Get user activity data
    const users = await db.collection('users').find({}).toArray();
    const bookings = await db.collection('bookings').find({}).toArray();
    const payments = await db.collection('payments').find({}).toArray();
    
    // Group users by segment
    const segments = ['Enterprise', 'SMB', 'Individual'];
    const features = ['Dashboard', 'Bookings', 'Payments', 'Support', 'Reports'];
    
    const heatmapData = segments.map(segment => {
      const segmentUsers = users.filter(user => 
        (user.segment || 'Individual') === segment
      );
      
      const featuresUsage = {};
      features.forEach(feature => {
        let usage = 0;
        
        switch (feature) {
          case 'Dashboard':
            usage = segmentUsers.filter(u => u.lastLogin && 
              new Date(u.lastLogin) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            ).length / segmentUsers.length * 100;
            break;
          case 'Bookings':
            const segmentBookings = bookings.filter(b => 
              segmentUsers.some(u => u._id.toString() === b.userId)
            );
            usage = segmentBookings.length / segmentUsers.length * 10; // Normalize
            break;
          case 'Payments':
            const segmentPayments = payments.filter(p => 
              segmentUsers.some(u => u._id.toString() === p.userId)
            );
            usage = segmentPayments.length / segmentUsers.length * 10; // Normalize
            break;
          case 'Support':
            usage = Math.random() * 30 + 20; // Mock support usage
            break;
          case 'Reports':
            usage = Math.random() * 20 + 10; // Mock reports usage
            break;
        }
        
        featuresUsage[feature] = Math.min(100, Math.max(0, Math.round(usage)));
      });
      
      return {
        segment,
        features: featuresUsage
      };
    });
    
    res.json({
      success: true,
      data: { segments: heatmapData },
      message: 'Engagement heatmap retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching engagement heatmap:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch engagement heatmap',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/analytics/active-sessions - Get active sessions count
router.get('/active-sessions', authenticateToken, async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    
    // Count active sessions (sessions created in last 30 minutes)
    const activeSessionTime = new Date(Date.now() - 30 * 60 * 1000);
    const activeSessions = await db.collection('sessions').countDocuments({
      createdAt: { $gte: activeSessionTime }
    });
    
    res.json({
      success: true,
      data: { count: activeSessions },
      message: 'Active sessions retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching active sessions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch active sessions',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
