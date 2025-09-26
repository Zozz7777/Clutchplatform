const express = require('express');
const router = express.Router();
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { validateInput } = require('../middleware/validation');
const { cacheMiddleware } = require('../middleware/cache');
const { performanceMonitor } = require('../middleware/performanceMonitor');
const logger = require('../utils/logger');

// Import models
const User = require('../models/User');
const FleetVehicle = require('../models/FleetVehicle');
const Payment = require('../models/Payment');
const Notification = require('../models/notification');
const AuditLog = require('../models/auditLog');

/**
 * @route GET /api/v1/dashboard/kpis
 * @desc Get KPI metrics for dashboard
 * @access Private (requires view_dashboard permission)
 */
router.get('/kpis', 
  authenticateToken,
  requirePermission('view_dashboard'),
  cacheMiddleware(300), // Cache for 5 minutes
  performanceMonitor,
  async (req, res) => {
    try {
      const startTime = Date.now();
      
      // Get current date range (last 30 days)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      // Parallel data fetching for better performance
      const [
        totalUsers,
        activeUsers,
        totalVehicles,
        activeVehicles,
        totalRevenue,
        totalPayments,
        newUsersThisMonth,
        systemHealth
      ] = await Promise.all([
        // User metrics
        User.countDocuments(),
        User.countDocuments({ 
          status: 'active',
          lastLogin: { $gte: startDate }
        }),
        
        // Fleet metrics
        FleetVehicle.countDocuments(),
        FleetVehicle.countDocuments({ status: 'active' }),
        
        // Revenue metrics
        Payment.aggregate([
          { $match: { createdAt: { $gte: startDate } } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        
        // Payment count
        Payment.countDocuments({ createdAt: { $gte: startDate } }),
        
        // New users this month
        User.countDocuments({ 
          createdAt: { $gte: startDate }
        }),
        
        // System health (mock for now)
        Promise.resolve({ status: 'healthy', uptime: 99.9 })
      ]);

      // Calculate growth metrics
      const previousMonthStart = new Date();
      previousMonthStart.setMonth(previousMonthStart.getMonth() - 1);
      previousMonthStart.setDate(1);
      
      const previousMonthEnd = new Date();
      previousMonthEnd.setMonth(previousMonthEnd.getMonth() - 1);
      previousMonthEnd.setDate(0);

      const [previousMonthUsers, previousMonthRevenue] = await Promise.all([
        User.countDocuments({ 
          createdAt: { 
            $gte: previousMonthStart, 
            $lte: previousMonthEnd 
          }
        }),
        Payment.aggregate([
          { 
            $match: { 
              createdAt: { 
                $gte: previousMonthStart, 
                $lte: previousMonthEnd 
              } 
            } 
          },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ])
      ]);

      const userGrowth = previousMonthUsers > 0 
        ? ((newUsersThisMonth - previousMonthUsers) / previousMonthUsers) * 100 
        : 0;

      const currentRevenue = totalRevenue[0]?.total || 0;
      const previousRevenue = previousMonthRevenue[0]?.total || 0;
      const revenueGrowth = previousRevenue > 0 
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
        : 0;

      // Calculate utilization rate
      const utilizationRate = totalVehicles > 0 
        ? (activeVehicles / totalVehicles) * 100 
        : 0;

      // Calculate conversion rate
      const conversionRate = totalUsers > 0 
        ? (activeUsers / totalUsers) * 100 
        : 0;

      const kpiData = {
        users: {
          total: totalUsers,
          active: activeUsers,
          new: newUsersThisMonth,
          growth: Math.round(userGrowth * 10) / 10
        },
        fleet: {
          total: totalVehicles,
          active: activeVehicles,
          utilization: Math.round(utilizationRate * 10) / 10
        },
        revenue: {
          total: currentRevenue,
          monthly: currentRevenue,
          growth: Math.round(revenueGrowth * 10) / 10,
          transactions: totalPayments
        },
        system: {
          health: systemHealth.status,
          uptime: systemHealth.uptime,
          conversion: Math.round(conversionRate * 10) / 10
        },
        performance: {
          responseTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        }
      };

      logger.info('KPI metrics retrieved successfully', {
        userId: req.user?.id,
        responseTime: Date.now() - startTime
      });

      res.json({
        success: true,
        data: kpiData,
        message: 'KPI metrics retrieved successfully'
      });

    } catch (error) {
      logger.error('Error fetching KPI metrics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch KPI metrics',
        message: error.message
      });
    }
  }
);

/**
 * @route GET /api/v1/dashboard/metrics
 * @desc Get detailed dashboard metrics
 * @access Private (requires view_dashboard permission)
 */
router.get('/metrics',
  authenticateToken,
  requirePermission('view_dashboard'),
  cacheMiddleware(180), // Cache for 3 minutes
  performanceMonitor,
  async (req, res) => {
    try {
      const startTime = Date.now();
      const { timeRange = '30d' } = req.query;

      // Calculate date range based on timeRange parameter
      let days = 30;
      switch (timeRange) {
        case '7d': days = 7; break;
        case '30d': days = 30; break;
        case '90d': days = 90; break;
        case '1y': days = 365; break;
      }

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get detailed metrics
      const [
        userMetrics,
        fleetMetrics,
        revenueMetrics,
        activityMetrics
      ] = await Promise.all([
        // User metrics
        User.aggregate([
          {
            $match: { createdAt: { $gte: startDate } }
          },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
                day: { $dayOfMonth: '$createdAt' }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]),

        // Fleet metrics
        FleetVehicle.aggregate([
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]),

        // Revenue metrics
        Payment.aggregate([
          {
            $match: { 
              createdAt: { $gte: startDate },
              status: 'completed'
            }
          },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
                day: { $dayOfMonth: '$createdAt' }
              },
              total: { $sum: '$amount' },
              count: { $sum: 1 }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]),

        // Activity metrics
        AuditLog.aggregate([
          {
            $match: { createdAt: { $gte: startDate } }
          },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
                day: { $dayOfMonth: '$createdAt' }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ])
      ]);

      const metricsData = {
        timeRange,
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          days
        },
        users: {
          timeline: userMetrics,
          summary: {
            total: userMetrics.reduce((sum, item) => sum + item.count, 0),
            average: userMetrics.length > 0 
              ? Math.round(userMetrics.reduce((sum, item) => sum + item.count, 0) / userMetrics.length)
              : 0
          }
        },
        fleet: {
          status: fleetMetrics,
          summary: {
            total: fleetMetrics.reduce((sum, item) => sum + item.count, 0),
            active: fleetMetrics.find(item => item._id === 'active')?.count || 0
          }
        },
        revenue: {
          timeline: revenueMetrics,
          summary: {
            total: revenueMetrics.reduce((sum, item) => sum + item.total, 0),
            transactions: revenueMetrics.reduce((sum, item) => sum + item.count, 0),
            average: revenueMetrics.length > 0 
              ? Math.round(revenueMetrics.reduce((sum, item) => sum + item.total, 0) / revenueMetrics.length)
              : 0
          }
        },
        activity: {
          timeline: activityMetrics,
          summary: {
            total: activityMetrics.reduce((sum, item) => sum + item.count, 0),
            average: activityMetrics.length > 0 
              ? Math.round(activityMetrics.reduce((sum, item) => sum + item.count, 0) / activityMetrics.length)
              : 0
          }
        },
        performance: {
          responseTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        }
      };

      logger.info('Dashboard metrics retrieved successfully', {
        userId: req.user?.id,
        timeRange,
        responseTime: Date.now() - startTime
      });

      res.json({
        success: true,
        data: metricsData,
        message: 'Dashboard metrics retrieved successfully'
      });

    } catch (error) {
      logger.error('Error fetching dashboard metrics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch dashboard metrics',
        message: error.message
      });
    }
  }
);

/**
 * @route GET /api/v1/dashboard/overview
 * @desc Get dashboard overview data
 * @access Private (requires view_dashboard permission)
 */
router.get('/overview',
  authenticateToken,
  requirePermission('view_dashboard'),
  cacheMiddleware(120), // Cache for 2 minutes
  performanceMonitor,
  async (req, res) => {
    try {
      const startTime = Date.now();

      // Get overview data
      const [
        recentUsers,
        recentVehicles,
        recentPayments,
        systemAlerts,
        notifications
      ] = await Promise.all([
        // Recent users
        User.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .select('name email role status createdAt'),

        // Recent vehicles
        FleetVehicle.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .select('name type status location createdAt'),

        // Recent payments
        Payment.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .select('amount currency status customer createdAt'),

        // System alerts (mock for now)
        Promise.resolve([
          { id: 1, type: 'info', message: 'System running normally', timestamp: new Date() },
          { id: 2, type: 'warning', message: 'High memory usage detected', timestamp: new Date() }
        ]),

        // Recent notifications
        Notification.find()
          .sort({ createdAt: -1 })
          .limit(10)
          .select('title message type read createdAt')
      ]);

      const overviewData = {
        recent: {
          users: recentUsers,
          vehicles: recentVehicles,
          payments: recentPayments
        },
        alerts: systemAlerts,
        notifications,
        summary: {
          totalUsers: await User.countDocuments(),
          totalVehicles: await FleetVehicle.countDocuments(),
          totalRevenue: await Payment.aggregate([
            { $group: { _id: null, total: { $sum: '$amount' } } }
          ]).then(result => result[0]?.total || 0),
          unreadNotifications: await Notification.countDocuments({ read: false })
        },
        performance: {
          responseTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        }
      };

      logger.info('Dashboard overview retrieved successfully', {
        userId: req.user?.id,
        responseTime: Date.now() - startTime
      });

      res.json({
        success: true,
        data: overviewData,
        message: 'Dashboard overview retrieved successfully'
      });

    } catch (error) {
      logger.error('Error fetching dashboard overview:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch dashboard overview',
        message: error.message
      });
    }
  }
);

module.exports = router;
