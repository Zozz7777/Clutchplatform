const express = require('express');
const router = express.Router();
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { validateInput } = require('../middleware/validation');
const { cacheMiddleware } = require('../middleware/cache');
const { performanceMonitor } = require('../middleware/performanceMonitor');
const logger = require('../utils/logger');

// Import models
const Payment = require('../models/Payment');
const User = require('../models/User');
const FleetVehicle = require('../models/FleetVehicle');
const MaintenanceRecord = require('../models/Maintenance');

/**
 * @route GET /api/v1/finance/payments
 * @desc Get all payments with filtering and pagination
 * @access Private (requires view_finance permission)
 */
router.get('/payments',
  authenticateToken,
  requirePermission('view_finance'),
  cacheMiddleware(300), // Cache for 5 minutes
  performanceMonitor,
  async (req, res) => {
    try {
      const startTime = Date.now();
      const {
        page = 1,
        limit = 20,
        status,
        currency,
        customerId,
        startDate,
        endDate
      } = req.query;

      // Build filter object
      const filter = {};
      if (status) filter.status = status;
      if (currency) filter.currency = currency;
      if (customerId) filter.customerId = customerId;
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
      }

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Get payments with pagination
      const [payments, totalCount] = await Promise.all([
        Payment.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .select('amount currency status customerId description createdAt updatedAt'),
        Payment.countDocuments(filter)
      ]);

      // Get summary statistics
      const [totalAmount, statusCounts] = await Promise.all([
        Payment.aggregate([
          { $match: filter },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        Payment.aggregate([
          { $match: filter },
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ])
      ]);

      const paymentsData = {
        payments: payments.map(payment => ({
          id: payment._id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          customerId: payment.customerId,
          description: payment.description,
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / parseInt(limit))
        },
        summary: {
          totalAmount: totalAmount[0]?.total || 0,
          totalCount,
          statusCounts: statusCounts.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {})
        },
        performance: {
          responseTime: Date.now() - startTime
        }
      };

      logger.info('Payments retrieved successfully', {
        userId: req.user?.id,
        page,
        limit,
        responseTime: Date.now() - startTime
      });

      res.json({
        success: true,
        data: paymentsData,
        message: 'Payments retrieved successfully'
      });

    } catch (error) {
      logger.error('Error fetching payments:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch payments',
        message: error.message
      });
    }
  }
);

/**
 * @route GET /api/v1/finance/subscriptions
 * @desc Get subscription data and analytics
 * @access Private (requires view_finance permission)
 */
router.get('/subscriptions',
  authenticateToken,
  requirePermission('view_finance'),
  cacheMiddleware(600), // Cache for 10 minutes
  performanceMonitor,
  async (req, res) => {
    try {
      const startTime = Date.now();

      // Mock subscription data (in production, integrate with subscription service)
      const subscriptionsData = {
        summary: {
          totalSubscriptions: 1250,
          activeSubscriptions: 1180,
          cancelledSubscriptions: 70,
          monthlyRecurringRevenue: 45000,
          annualRecurringRevenue: 540000
        },
        breakdown: {
          byPlan: [
            { plan: 'Basic', count: 800, revenue: 16000 },
            { plan: 'Professional', count: 350, revenue: 21000 },
            { plan: 'Enterprise', count: 30, revenue: 8000 }
          ],
          byStatus: [
            { status: 'active', count: 1180, percentage: 94.4 },
            { status: 'cancelled', count: 70, percentage: 5.6 }
          ]
        },
        trends: {
          growth: {
            monthly: '+8%',
            quarterly: '+25%',
            yearly: '+120%'
          },
          churn: {
            rate: 2.1,
            trend: 'down',
            change: '-0.3%'
          }
        },
        metrics: {
          averageRevenuePerUser: 38.1,
          customerLifetimeValue: 1250,
          churnRate: 2.1,
          retentionRate: 97.9
        },
        performance: {
          responseTime: Date.now() - startTime
        }
      };

      logger.info('Subscriptions data retrieved successfully', {
        userId: req.user?.id,
        responseTime: Date.now() - startTime
      });

      res.json({
        success: true,
        data: subscriptionsData,
        message: 'Subscriptions data retrieved successfully'
      });

    } catch (error) {
      logger.error('Error fetching subscriptions data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch subscriptions data',
        message: error.message
      });
    }
  }
);

/**
 * @route GET /api/v1/finance/payouts
 * @desc Get payout data and analytics
 * @access Private (requires view_finance permission)
 */
router.get('/payouts',
  authenticateToken,
  requirePermission('view_finance'),
  cacheMiddleware(600),
  performanceMonitor,
  async (req, res) => {
    try {
      const startTime = Date.now();
      const { period = '30d' } = req.query;

      // Calculate date range
      let days = 30;
      switch (period) {
        case '7d': days = 7; break;
        case '30d': days = 30; break;
        case '90d': days = 90; break;
        case '1y': days = 365; break;
      }

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Mock payout data (in production, integrate with payout service)
      const payoutsData = {
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          days
        },
        summary: {
          totalPayouts: Math.floor(Math.random() * 50 + 20),
          totalAmount: Math.random() * 100000 + 50000,
          averagePayout: Math.random() * 2000 + 1000,
          pendingPayouts: Math.floor(Math.random() * 10 + 5)
        },
        breakdown: {
          byStatus: [
            { status: 'completed', count: 35, amount: 75000 },
            { status: 'pending', count: 8, amount: 15000 },
            { status: 'failed', count: 2, amount: 3000 }
          ],
          byMethod: [
            { method: 'bank_transfer', count: 25, amount: 50000 },
            { method: 'paypal', count: 15, amount: 30000 },
            { method: 'stripe', count: 5, amount: 13000 }
          ]
        },
        trends: {
          volume: {
            trend: 'up',
            change: '+12%'
          },
          amount: {
            trend: 'up',
            change: '+8%'
          }
        },
        performance: {
          responseTime: Date.now() - startTime
        }
      };

      logger.info('Payouts data retrieved successfully', {
        userId: req.user?.id,
        period,
        responseTime: Date.now() - startTime
      });

      res.json({
        success: true,
        data: payoutsData,
        message: 'Payouts data retrieved successfully'
      });

    } catch (error) {
      logger.error('Error fetching payouts data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch payouts data',
        message: error.message
      });
    }
  }
);

/**
 * @route GET /api/v1/finance/expenses
 * @desc Get expense tracking and analytics
 * @access Private (requires view_finance permission)
 */
router.get('/expenses',
  authenticateToken,
  requirePermission('view_finance'),
  cacheMiddleware(600),
  performanceMonitor,
  async (req, res) => {
    try {
      const startTime = Date.now();
      const { period = '30d' } = req.query;

      // Calculate date range
      let days = 30;
      switch (period) {
        case '7d': days = 7; break;
        case '30d': days = 30; break;
        case '90d': days = 90; break;
        case '1y': days = 365; break;
      }

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get maintenance costs from database
      const maintenanceCosts = await MaintenanceRecord.aggregate([
        {
          $match: {
            date: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$cost' },
            count: { $sum: 1 },
            average: { $avg: '$cost' }
          }
        }
      ]);

      const maintenanceData = maintenanceCosts[0] || { total: 0, count: 0, average: 0 };

      // Mock other expense categories
      const expensesData = {
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          days
        },
        summary: {
          totalExpenses: maintenanceData.total + Math.random() * 50000 + 25000,
          totalTransactions: maintenanceData.count + Math.floor(Math.random() * 100 + 50),
          averageExpense: Math.round((maintenanceData.average + Math.random() * 200 + 100) * 100) / 100
        },
        breakdown: {
          maintenance: {
            amount: maintenanceData.total,
            count: maintenanceData.count,
            percentage: 25
          },
          operational: {
            amount: Math.random() * 20000 + 15000,
            count: Math.floor(Math.random() * 50 + 30),
            percentage: 35
          },
          marketing: {
            amount: Math.random() * 15000 + 10000,
            count: Math.floor(Math.random() * 30 + 20),
            percentage: 20
          },
          personnel: {
            amount: Math.random() * 30000 + 20000,
            count: Math.floor(Math.random() * 20 + 10),
            percentage: 15
          },
          infrastructure: {
            amount: Math.random() * 10000 + 5000,
            count: Math.floor(Math.random() * 15 + 10),
            percentage: 5
          }
        },
        trends: {
          total: {
            trend: 'up',
            change: '+5%'
          },
          maintenance: {
            trend: 'stable',
            change: '+1%'
          },
          operational: {
            trend: 'up',
            change: '+8%'
          }
        },
        budget: {
          allocated: 100000,
          spent: maintenanceData.total + Math.random() * 50000 + 25000,
          remaining: 100000 - (maintenanceData.total + Math.random() * 50000 + 25000),
          utilization: Math.round(((maintenanceData.total + Math.random() * 50000 + 25000) / 100000) * 100)
        },
        performance: {
          responseTime: Date.now() - startTime
        }
      };

      logger.info('Expenses data retrieved successfully', {
        userId: req.user?.id,
        period,
        responseTime: Date.now() - startTime
      });

      res.json({
        success: true,
        data: expensesData,
        message: 'Expenses data retrieved successfully'
      });

    } catch (error) {
      logger.error('Error fetching expenses data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch expenses data',
        message: error.message
      });
    }
  }
);

/**
 * @route GET /api/v1/finance/budgets
 * @desc Get budget management data
 * @access Private (requires view_finance permission)
 */
router.get('/budgets',
  authenticateToken,
  requirePermission('view_finance'),
  cacheMiddleware(600),
  performanceMonitor,
  async (req, res) => {
    try {
      const startTime = Date.now();

      // Mock budget data (in production, integrate with budget management system)
      const budgetsData = {
        summary: {
          totalBudget: 500000,
          totalSpent: 320000,
          totalRemaining: 180000,
          utilizationRate: 64
        },
        categories: [
          {
            category: 'Operations',
            budget: 200000,
            spent: 150000,
            remaining: 50000,
            utilization: 75,
            status: 'on_track'
          },
          {
            category: 'Marketing',
            budget: 100000,
            spent: 80000,
            remaining: 20000,
            utilization: 80,
            status: 'over_budget'
          },
          {
            category: 'Technology',
            budget: 150000,
            spent: 60000,
            remaining: 90000,
            utilization: 40,
            status: 'under_budget'
          },
          {
            category: 'Personnel',
            budget: 50000,
            spent: 30000,
            remaining: 20000,
            utilization: 60,
            status: 'on_track'
          }
        ],
        trends: {
          spending: {
            trend: 'up',
            change: '+12%'
          },
          efficiency: {
            trend: 'stable',
            change: '+2%'
          }
        },
        alerts: [
          {
            type: 'warning',
            message: 'Marketing budget 80% utilized',
            category: 'Marketing'
          },
          {
            type: 'info',
            message: 'Technology budget underutilized',
            category: 'Technology'
          }
        ],
        performance: {
          responseTime: Date.now() - startTime
        }
      };

      logger.info('Budgets data retrieved successfully', {
        userId: req.user?.id,
        responseTime: Date.now() - startTime
      });

      res.json({
        success: true,
        data: budgetsData,
        message: 'Budgets data retrieved successfully'
      });

    } catch (error) {
      logger.error('Error fetching budgets data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch budgets data',
        message: error.message
      });
    }
  }
);

/**
 * @route GET /api/v1/assets/maintenance-costs
 * @desc Get asset maintenance costs
 * @access Private (requires view_finance permission)
 */
router.get('/assets/maintenance-costs',
  authenticateToken,
  requirePermission('view_finance'),
  cacheMiddleware(600),
  performanceMonitor,
  async (req, res) => {
    try {
      const startTime = Date.now();
      const { period = '30d' } = req.query;

      // Calculate date range
      let days = 30;
      switch (period) {
        case '7d': days = 7; break;
        case '30d': days = 30; break;
        case '90d': days = 90; break;
        case '1y': days = 365; break;
      }

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get maintenance costs from database
      const maintenanceCosts = await MaintenanceRecord.aggregate([
        {
          $match: {
            date: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$cost' },
            count: { $sum: 1 },
            average: { $avg: '$cost' }
          }
        },
        { $sort: { total: -1 } }
      ]);

      const totalMaintenanceCost = maintenanceCosts.reduce((sum, item) => sum + item.total, 0);

      const maintenanceCostsData = {
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          days
        },
        summary: {
          totalCost: totalMaintenanceCost,
          totalRecords: maintenanceCosts.reduce((sum, item) => sum + item.count, 0),
          averageCost: totalMaintenanceCost > 0 ? 
            Math.round((totalMaintenanceCost / maintenanceCosts.reduce((sum, item) => sum + item.count, 0)) * 100) / 100 : 0
        },
        breakdown: maintenanceCosts.map(item => ({
          type: item._id,
          total: item.total,
          count: item.count,
          average: Math.round(item.average * 100) / 100,
          percentage: totalMaintenanceCost > 0 ? 
            Math.round((item.total / totalMaintenanceCost) * 100 * 10) / 10 : 0
        })),
        trends: {
          total: {
            trend: 'up',
            change: '+8%'
          },
          preventive: {
            trend: 'up',
            change: '+15%'
          },
          corrective: {
            trend: 'down',
            change: '-5%'
          }
        },
        recommendations: [
          'Increase preventive maintenance to reduce corrective costs',
          'Implement predictive maintenance for critical assets',
          'Negotiate better rates with maintenance providers',
          'Track maintenance costs by asset type for better budgeting'
        ],
        performance: {
          responseTime: Date.now() - startTime
        }
      };

      logger.info('Asset maintenance costs retrieved successfully', {
        userId: req.user?.id,
        period,
        responseTime: Date.now() - startTime
      });

      res.json({
        success: true,
        data: maintenanceCostsData,
        message: 'Asset maintenance costs retrieved successfully'
      });

    } catch (error) {
      logger.error('Error fetching asset maintenance costs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch asset maintenance costs',
        message: error.message
      });
    }
  }
);

/**
 * @route GET /api/v1/assets/operational-costs
 * @desc Get asset operational costs
 * @access Private (requires view_finance permission)
 */
router.get('/assets/operational-costs',
  authenticateToken,
  requirePermission('view_finance'),
  cacheMiddleware(600),
  performanceMonitor,
  async (req, res) => {
    try {
      const startTime = Date.now();
      const { period = '30d' } = req.query;

      // Calculate date range
      let days = 30;
      switch (period) {
        case '7d': days = 7; break;
        case '30d': days = 30; break;
        case '90d': days = 90; break;
        case '1y': days = 365; break;
      }

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Mock operational costs data (in production, integrate with operational systems)
      const operationalCostsData = {
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          days
        },
        summary: {
          totalCost: Math.random() * 100000 + 50000,
          totalAssets: 150,
          costPerAsset: Math.random() * 500 + 200
        },
        breakdown: {
          utilities: {
            amount: Math.random() * 20000 + 15000,
            percentage: 25,
            trend: 'up',
            change: '+5%'
          },
          insurance: {
            amount: Math.random() * 15000 + 10000,
            percentage: 20,
            trend: 'stable',
            change: '0%'
          },
          depreciation: {
            amount: Math.random() * 25000 + 20000,
            percentage: 30,
            trend: 'stable',
            change: '0%'
          },
          security: {
            amount: Math.random() * 10000 + 5000,
            percentage: 15,
            trend: 'up',
            change: '+3%'
          },
          other: {
            amount: Math.random() * 10000 + 5000,
            percentage: 10,
            trend: 'down',
            change: '-2%'
          }
        },
        byAsset: [
          {
            assetId: '1',
            name: 'Office Building A',
            cost: 15000,
            utilization: 85
          },
          {
            assetId: '2',
            name: 'Warehouse B',
            cost: 12000,
            utilization: 70
          },
          {
            assetId: '3',
            name: 'Data Center C',
            cost: 18000,
            utilization: 95
          }
        ],
        trends: {
          total: {
            trend: 'up',
            change: '+4%'
          },
          efficiency: {
            trend: 'up',
            change: '+2%'
          }
        },
        performance: {
          responseTime: Date.now() - startTime
        }
      };

      logger.info('Asset operational costs retrieved successfully', {
        userId: req.user?.id,
        period,
        responseTime: Date.now() - startTime
      });

      res.json({
        success: true,
        data: operationalCostsData,
        message: 'Asset operational costs retrieved successfully'
      });

    } catch (error) {
      logger.error('Error fetching asset operational costs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch asset operational costs',
        message: error.message
      });
    }
  }
);

module.exports = router;
