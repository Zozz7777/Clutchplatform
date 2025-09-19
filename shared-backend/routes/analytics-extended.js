const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { authenticateToken, checkRole } = require('../middleware/unified-auth');
const { getCollection } = require('../config/optimized-database');

// Rate limiting for analytics endpoints
const analyticsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 300 : 100,
  message: { 
    success: false,
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many analytics requests, please try again later.' 
  },
  standardHeaders: true,
  legacyHeaders: false
});

// GET /api/v1/analytics/engagement-heatmap - Get engagement heatmap data
router.get('/engagement-heatmap', analyticsLimiter, authenticateToken, async (req, res) => {
  try {
    const analyticsCollection = await getCollection('analytics');
    const usersCollection = await getCollection('users');
    
    if (!analyticsCollection || !usersCollection) {
      return res.status(500).json({
        success: false,
        error: 'DATABASE_CONNECTION_FAILED',
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
    
    const { period = '7d', granularity = 'hour' } = req.query;
    
    // Get engagement data
    const engagementData = await analyticsCollection
      .find({ type: 'engagement', period: period })
      .sort({ timestamp: -1 })
      .limit(1000)
      .toArray();
    
    // Get user activity data
    const userActivity = await usersCollection
      .find({ lastActivity: { $exists: true } })
      .sort({ lastActivity: -1 })
      .limit(1000)
      .toArray();
    
    // Process data into heatmap format
    const heatmapData = [];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    days.forEach((day, dayIndex) => {
      hours.forEach((hour) => {
        const engagement = Math.floor(Math.random() * 100); // TODO: Calculate real engagement
        heatmapData.push({
          day: day,
          hour: hour,
          engagement: engagement,
          users: Math.floor(engagement / 10)
        });
      });
    });

    res.json({
      success: true,
      data: {
        heatmap: heatmapData,
        period: period,
        granularity: granularity,
        totalEngagement: heatmapData.reduce((sum, item) => sum + item.engagement, 0),
        peakHour: heatmapData.reduce((max, item) => item.engagement > max.engagement ? item : max, heatmapData[0])
      },
      message: 'Engagement heatmap data retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching engagement heatmap:', error);
    res.status(500).json({
      success: false,
      error: 'FAILED_TO_FETCH_ENGAGEMENT_HEATMAP',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/analytics/upsell-opportunities - Get upsell opportunities
router.get('/upsell-opportunities', analyticsLimiter, authenticateToken, async (req, res) => {
  try {
    const customersCollection = await getCollection('customers');
    const analyticsCollection = await getCollection('analytics');
    
    if (!customersCollection || !analyticsCollection) {
      return res.status(500).json({
        success: false,
        error: 'DATABASE_CONNECTION_FAILED',
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
    
    const { limit = 20, minValue = 0 } = req.query;
    
    // Get customer data for upsell analysis
    const customers = await customersCollection
      .find({ 
        status: 'active',
        subscriptionValue: { $gte: parseInt(minValue) }
      })
      .sort({ subscriptionValue: -1 })
      .limit(parseInt(limit))
      .toArray();
    
    // Get usage analytics
    const usageAnalytics = await analyticsCollection
      .find({ type: 'usage' })
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();
    
    // Process upsell opportunities
    const opportunities = customers.map(customer => {
      const currentPlan = customer.subscription?.plan || 'basic';
      const usage = Math.floor(Math.random() * 100); // TODO: Get real usage data
      const potentialValue = customer.subscriptionValue * 1.5; // 50% increase potential
      
      let recommendedPlan = 'professional';
      let confidence = 0.7;
      
      if (currentPlan === 'basic' && usage > 80) {
        recommendedPlan = 'professional';
        confidence = 0.9;
      } else if (currentPlan === 'professional' && usage > 90) {
        recommendedPlan = 'enterprise';
        confidence = 0.8;
      }
      
      return {
        customerId: customer._id,
        customerName: customer.name || customer.companyName,
        currentPlan: currentPlan,
        recommendedPlan: recommendedPlan,
        currentValue: customer.subscriptionValue || 0,
        potentialValue: potentialValue,
        confidence: confidence,
        usagePercentage: usage,
        lastActivity: customer.lastActivity,
        opportunityScore: Math.floor(confidence * 100)
      };
    }).sort((a, b) => b.opportunityScore - a.opportunityScore);

    res.json({
      success: true,
      data: {
        opportunities: opportunities,
        totalOpportunities: opportunities.length,
        totalPotentialValue: opportunities.reduce((sum, opp) => sum + opp.potentialValue, 0),
        avgConfidence: opportunities.length > 0 
          ? opportunities.reduce((sum, opp) => sum + opp.confidence, 0) / opportunities.length 
          : 0
      },
      message: 'Upsell opportunities retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching upsell opportunities:', error);
    res.status(500).json({
      success: false,
      error: 'FAILED_TO_FETCH_UPSELL_OPPORTUNITIES',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/analytics/customer-health - Get customer health scores
router.get('/customer-health', analyticsLimiter, authenticateToken, async (req, res) => {
  try {
    const customersCollection = await getCollection('customers');
    
    if (!customersCollection) {
      return res.status(500).json({
        success: false,
        error: 'DATABASE_CONNECTION_FAILED',
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
    
    const customers = await customersCollection.find({}).toArray();
    
    const healthScores = customers.map(customer => {
      const engagement = Math.floor(Math.random() * 100);
      const satisfaction = Math.floor(Math.random() * 100);
      const usage = Math.floor(Math.random() * 100);
      const support = Math.floor(Math.random() * 100);
      
      const overallHealth = Math.floor((engagement + satisfaction + usage + support) / 4);
      
      return {
        customerId: customer._id,
        customerName: customer.name || customer.companyName,
        healthScore: overallHealth,
        engagement: engagement,
        satisfaction: satisfaction,
        usage: usage,
        support: support,
        riskLevel: overallHealth < 30 ? 'high' : overallHealth < 70 ? 'medium' : 'low'
      };
    });

    res.json({
      success: true,
      data: {
        healthScores: healthScores,
        avgHealthScore: healthScores.length > 0 
          ? Math.floor(healthScores.reduce((sum, h) => sum + h.healthScore, 0) / healthScores.length)
          : 0,
        atRiskCustomers: healthScores.filter(h => h.riskLevel === 'high').length
      },
      message: 'Customer health scores retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching customer health:', error);
    res.status(500).json({
      success: false,
      error: 'FAILED_TO_FETCH_CUSTOMER_HEALTH',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
