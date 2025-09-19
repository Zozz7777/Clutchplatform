const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole, checkPermission } = require('../middleware/unified-auth');
const RealAnalyticsService = require('../services/realAnalyticsService');
const { getCollection } = require('../config/optimized-database');
const { logger } = require('../config/logger');
const rateLimit = require('express-rate-limit');

// Rate limiting
const revenueLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 requests per windowMs
  message: 'Too many revenue requests, please try again later.'
});

// Initialize analytics service
const analyticsService = new RealAnalyticsService();

// GET /api/v1/revenue/metrics - Get revenue metrics
router.get('/metrics', revenueLimiter, authenticateToken, async (req, res) => {
  try {
    const timeRange = req.query.timeRange || '7d';
    const revenueAnalytics = await analyticsService.getRevenueAnalytics(timeRange);
    
    res.json({
      success: true,
      data: revenueAnalytics
    });
  } catch (error) {
    console.error('Error getting revenue metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get revenue metrics',
      message: error.message
    });
  }
});

// GET /api/v1/revenue/forecast - Get revenue forecast
router.get('/forecast', revenueLimiter, authenticateToken, async (req, res) => {
  try {
    const timeRange = req.query.timeRange || '30d';
    
    // Get historical revenue data for forecasting
    const revenueAnalytics = await analyticsService.getRevenueAnalytics(timeRange);
    
    // Simple forecasting based on historical data
    const forecast = generateRevenueForecast(revenueAnalytics);
    
    res.json({
      success: true,
      data: {
        historical: revenueAnalytics,
        forecast: forecast,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting revenue forecast:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get revenue forecast',
      message: error.message
    });
  }
});

// GET /api/v1/revenue/trends - Get revenue trends
router.get('/trends', revenueLimiter, authenticateToken, async (req, res) => {
  try {
    const timeRange = req.query.timeRange || '30d';
    const revenueAnalytics = await analyticsService.getRevenueAnalytics(timeRange);
    
    // Calculate trends
    const trends = calculateRevenueTrends(revenueAnalytics);
    
    res.json({
      success: true,
      data: {
        trends: trends,
        dailyRevenue: revenueAnalytics.dailyRevenue,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting revenue trends:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get revenue trends',
      message: error.message
    });
  }
});

// GET /api/v1/revenue/breakdown - Get revenue breakdown by category
router.get('/breakdown', revenueLimiter, authenticateToken, async (req, res) => {
  try {
    const timeRange = req.query.timeRange || '30d';
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }
    
    // Get collections
    const paymentsCollection = await getCollection('payments');
    const subscriptionsCollection = await getCollection('subscriptions');
    const bookingsCollection = await getCollection('bookings');
    const servicesCollection = await getCollection('services');
    
    // Query revenue by category
    const [subscriptionsRevenue, bookingsRevenue, servicesRevenue, otherRevenue] = await Promise.all([
      // Subscription revenue
      subscriptionsCollection.aggregate([
        {
          $match: {
            status: 'active',
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $lookup: {
            from: 'payments',
            localField: '_id',
            foreignField: 'subscriptionId',
            as: 'payments'
          }
        },
        {
          $unwind: '$payments'
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$payments.amount' }
          }
        }
      ]).toArray(),
      
      // Booking revenue
      bookingsCollection.aggregate([
        {
          $match: {
            status: { $in: ['completed', 'confirmed'] },
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $lookup: {
            from: 'payments',
            localField: '_id',
            foreignField: 'bookingId',
            as: 'payments'
          }
        },
        {
          $unwind: '$payments'
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$payments.amount' }
          }
        }
      ]).toArray(),
      
      // Service revenue
      servicesCollection.aggregate([
        {
          $match: {
            status: 'completed',
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $lookup: {
            from: 'payments',
            localField: '_id',
            foreignField: 'serviceId',
            as: 'payments'
          }
        },
        {
          $unwind: '$payments'
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$payments.amount' }
          }
        }
      ]).toArray(),
      
      // Other revenue (direct payments not categorized)
      paymentsCollection.aggregate([
        {
          $match: {
            status: 'completed',
            createdAt: { $gte: startDate, $lte: endDate },
            $or: [
              { subscriptionId: { $exists: false } },
              { bookingId: { $exists: false } },
              { serviceId: { $exists: false } }
            ]
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]).toArray()
    ]);
    
    const breakdown = {
      subscriptions: subscriptionsRevenue[0]?.total || 0,
      bookings: bookingsRevenue[0]?.total || 0,
      services: servicesRevenue[0]?.total || 0,
      other: otherRevenue[0]?.total || 0
    };
    
    const totalRevenue = breakdown.subscriptions + breakdown.bookings + breakdown.services + breakdown.other;
    
    res.json({
      success: true,
      data: {
        breakdown,
        totalRevenue,
        timeRange,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        percentages: {
          subscriptions: totalRevenue > 0 ? (breakdown.subscriptions / totalRevenue * 100).toFixed(2) : 0,
          bookings: totalRevenue > 0 ? (breakdown.bookings / totalRevenue * 100).toFixed(2) : 0,
          services: totalRevenue > 0 ? (breakdown.services / totalRevenue * 100).toFixed(2) : 0,
          other: totalRevenue > 0 ? (breakdown.other / totalRevenue * 100).toFixed(2) : 0
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error getting revenue breakdown:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get revenue breakdown',
      message: error.message
    });
  }
});

// Helper function to generate revenue forecast
function generateRevenueForecast(revenueData) {
  const dailyRevenue = revenueData.dailyRevenue || [];
  
  if (dailyRevenue.length === 0) {
    return {
      next7Days: [],
      next30Days: [],
      confidence: 0
    };
  }

  // Simple linear regression for forecasting
  const values = dailyRevenue.map(item => item.revenue);
  const n = values.length;
  
  if (n < 2) {
    return {
      next7Days: [],
      next30Days: [],
      confidence: 0
    };
  }

  // Calculate trend
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumXX += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Generate forecast for next 7 and 30 days
  const next7Days = [];
  const next30Days = [];
  
  for (let i = 1; i <= 7; i++) {
    const forecastValue = Math.max(0, slope * (n + i - 1) + intercept);
    next7Days.push({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      revenue: Math.round(forecastValue)
    });
  }

  for (let i = 1; i <= 30; i++) {
    const forecastValue = Math.max(0, slope * (n + i - 1) + intercept);
    next30Days.push({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      revenue: Math.round(forecastValue)
    });
  }

  // Calculate confidence based on data consistency
  const avgRevenue = values.reduce((sum, val) => sum + val, 0) / n;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - avgRevenue, 2), 0) / n;
  const confidence = Math.max(0, Math.min(100, 100 - (Math.sqrt(variance) / avgRevenue) * 100));

  return {
    next7Days,
    next30Days,
    confidence: Math.round(confidence)
  };
}

// Helper function to calculate revenue trends
function calculateRevenueTrends(revenueData) {
  const dailyRevenue = revenueData.dailyRevenue || [];
  
  if (dailyRevenue.length < 2) {
    return {
      trend: 'stable',
      change: 0,
      period: 'insufficient_data'
    };
  }

  const firstWeek = dailyRevenue.slice(0, 7);
  const lastWeek = dailyRevenue.slice(-7);
  
  const firstWeekAvg = firstWeek.reduce((sum, item) => sum + item.revenue, 0) / firstWeek.length;
  const lastWeekAvg = lastWeek.reduce((sum, item) => sum + item.revenue, 0) / lastWeek.length;
  
  const change = ((lastWeekAvg - firstWeekAvg) / firstWeekAvg) * 100;
  
  let trend = 'stable';
  if (change > 5) trend = 'increasing';
  else if (change < -5) trend = 'decreasing';
  
  return {
    trend,
    change: Math.round(change * 100) / 100,
    period: 'weekly',
    firstWeekAvg: Math.round(firstWeekAvg),
    lastWeekAvg: Math.round(lastWeekAvg)
  };
}

// ==================== PRICING ENDPOINTS ====================

// GET /api/v1/revenue/pricing/scenarios - Get pricing scenarios
router.get('/pricing/scenarios', revenueLimiter, authenticateToken, async (req, res) => {
  try {
    const scenariosCollection = await getCollection('pricing_scenarios');
    
    // Get all pricing scenarios
    const scenarios = await scenariosCollection.find({}).toArray();
    
    // If no data exists, return empty array (no mock data)
    res.json({
      success: true,
      data: scenarios,
      message: 'Pricing scenarios retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Get pricing scenarios error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_PRICING_SCENARIOS_FAILED',
      message: 'Failed to get pricing scenarios',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/revenue/pricing/tests - Get pricing tests
router.get('/pricing/tests', revenueLimiter, authenticateToken, async (req, res) => {
  try {
    const testsCollection = await getCollection('pricing_tests');
    
    // Get all pricing tests
    const tests = await testsCollection.find({}).toArray();
    
    // If no data exists, return empty array (no mock data)
    res.json({
      success: true,
      data: tests,
      message: 'Pricing tests retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Get pricing tests error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_PRICING_TESTS_FAILED',
      message: 'Failed to get pricing tests',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/revenue/pricing/market-analysis - Get market analysis
router.get('/pricing/market-analysis', revenueLimiter, authenticateToken, async (req, res) => {
  try {
    const marketAnalysisCollection = await getCollection('market_analysis');
    
    // Get all market analysis data
    const marketAnalysis = await marketAnalysisCollection.find({}).toArray();
    
    // If no data exists, return empty array (no mock data)
    res.json({
      success: true,
      data: marketAnalysis,
      message: 'Market analysis retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Get market analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_MARKET_ANALYSIS_FAILED',
      message: 'Failed to get market analysis',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;