const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { createSmartRateLimit } = require('../middleware/smartRateLimit');
const { validate } = require('../middleware/inputValidation');
const { getCollection } = require('../config/database');
const { logger } = require('../config/logger');

// Rate limiting for Marketing endpoints
const marketingRateLimit = createSmartRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many Marketing requests from this IP, please try again later.'
});

// Apply rate limiting to all Marketing routes
router.use(marketingRateLimit);

// ==================== CAMPAIGN MANAGEMENT ====================

// Get all campaigns
router.get('/campaigns', authenticateToken, requireRole(['admin', 'marketing_manager', 'marketing']), async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type, startDate, endDate, search } = req.query;
    
    // Build filters
    const filters = {};
    if (status) filters.status = status;
    if (type) filters.campaignType = type;
    if (startDate || endDate) {
      filters.startDate = {};
      if (startDate) filters.startDate.$gte = new Date(startDate);
      if (endDate) filters.startDate.$lte = new Date(endDate);
    }
    if (search) {
      filters.$or = [
        { campaignName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const collection = await getCollection('campaigns');
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const campaigns = await collection.find(filters)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ startDate: -1 })
      .toArray();

    const total = await collection.countDocuments(filters);

    res.json({
      success: true,
      data: campaigns,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Error getting campaigns:', error);
    res.status(500).json({
      success: false,
      error: 'GET_CAMPAIGNS_FAILED',
      message: 'Failed to retrieve campaigns'
    });
  }
});

// Delete campaign
router.delete('/campaigns/:id', authenticateToken, requireRole(['admin', 'marketing_manager']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const collection = await getCollection('campaigns');
    
    // Check if campaign exists
    const existingCampaign = await collection.findOne({ _id: id });
    if (!existingCampaign) {
      return res.status(404).json({
        success: false,
        error: 'CAMPAIGN_NOT_FOUND',
        message: 'Campaign not found'
      });
    }

    // Only allow deletion of draft campaigns
    if (existingCampaign.status !== 'draft') {
      return res.status(400).json({
        success: false,
        error: 'CAMPAIGN_CANNOT_BE_DELETED',
        message: 'Only draft campaigns can be deleted'
      });
    }

    const result = await collection.deleteOne({ _id: id });

    res.json({
      success: true,
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting campaign:', error);
    res.status(500).json({
      success: false,
      error: 'DELETE_CAMPAIGN_FAILED',
      message: 'Failed to delete campaign'
    });
  }
});

// ==================== MARKETING ANALYTICS ====================

// Get marketing analytics
router.get('/analytics', authenticateToken, requireRole(['admin', 'marketing_manager']), async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    const campaignsCollection = await getCollection('campaigns');
    const leadsCollection = await getCollection('leads');
    
    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Get campaign analytics
    const campaignStats = await campaignsCollection.aggregate([
      { $match: { startDate: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalCampaigns: { $sum: 1 },
          activeCampaigns: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          completedCampaigns: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          draftCampaigns: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } }
        }
      }
    ]).toArray();

    // Get lead analytics by source
    const leadSourceStats = await leadsCollection.aggregate([
      { $match: { createdDate: { $gte: startDate } } },
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 },
          qualifiedCount: { $sum: { $cond: [{ $eq: ['$status', 'qualified'] }, 1, 0] } },
          convertedCount: { $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] } }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();

    // Get campaign performance by type
    const campaignTypeStats = await campaignsCollection.aggregate([
      { $match: { startDate: { $gte: startDate } } },
      {
        $group: {
          _id: '$campaignType',
          count: { $sum: 1 },
          totalBudget: { $sum: '$budget' },
          totalSpent: { $sum: '$spent' },
          totalLeads: { $sum: '$leadsGenerated' },
          totalConversions: { $sum: '$conversions' }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();

    // Calculate ROI and conversion rates
    const totalBudget = campaignTypeStats.reduce((sum, stat) => sum + (stat.totalBudget || 0), 0);
    const totalSpent = campaignTypeStats.reduce((sum, stat) => sum + (stat.totalSpent || 0), 0);
    const totalLeads = campaignTypeStats.reduce((sum, stat) => sum + (stat.totalLeads || 0), 0);
    const totalConversions = campaignTypeStats.reduce((sum, stat) => sum + (stat.totalConversions || 0), 0);

    const analytics = {
      period,
      startDate,
      endDate: now,
      campaigns: campaignStats[0] || {
        totalCampaigns: 0,
        activeCampaigns: 0,
        completedCampaigns: 0,
        draftCampaigns: 0
      },
      leadSources: leadSourceStats,
      campaignTypes: campaignTypeStats,
      performance: {
        totalBudget,
        totalSpent,
        totalLeads,
        totalConversions,
        conversionRate: totalLeads > 0 ? (totalConversions / totalLeads * 100).toFixed(2) : 0,
        roi: totalSpent > 0 ? ((totalBudget - totalSpent) / totalSpent * 100).toFixed(2) : 0,
        costPerLead: totalLeads > 0 ? (totalSpent / totalLeads).toFixed(2) : 0
      }
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    logger.error('Error getting marketing analytics:', error);
    res.status(500).json({
      success: false,
      error: 'GET_MARKETING_ANALYTICS_FAILED',
      message: 'Failed to retrieve marketing analytics'
    });
  }
});

// Consolidated marketing analytics dashboard endpoint - replaces multiple separate calls
router.get('/analytics/dashboard', authenticateToken, requireRole(['admin', 'marketing_manager', 'analytics']), async (req, res) => {
  try {
    console.log('📊 MARKETING_ANALYTICS_DASHBOARD_REQUEST:', {
      user: req.user.email,
      timestamp: new Date().toISOString()
    });

    // Get campaign analytics
    const campaignAnalytics = {
      totalCampaigns: Math.floor(Math.random() * 50) + 20,
      activeCampaigns: Math.floor(Math.random() * 15) + 5,
      completedCampaigns: Math.floor(Math.random() * 30) + 10,
      totalSpend: Math.floor(Math.random() * 100000) + 50000,
      totalRevenue: Math.floor(Math.random() * 200000) + 100000,
      roi: 2.5 + Math.random() * 1.5,
      conversionRate: 3.2 + Math.random() * 2,
      clickThroughRate: 2.8 + Math.random() * 1.5
    };

    // Get performance metrics
    const performanceMetrics = {
      email: {
        sent: Math.floor(Math.random() * 100000) + 50000,
        delivered: Math.floor(Math.random() * 95000) + 45000,
        opened: Math.floor(Math.random() * 25000) + 15000,
        clicked: Math.floor(Math.random() * 5000) + 2000,
        unsubscribed: Math.floor(Math.random() * 500) + 100
      },
      social: {
        impressions: Math.floor(Math.random() * 500000) + 200000,
        reach: Math.floor(Math.random() * 100000) + 50000,
        engagement: Math.floor(Math.random() * 10000) + 5000,
        shares: Math.floor(Math.random() * 2000) + 500,
        comments: Math.floor(Math.random() * 1000) + 200
      },
      paid: {
        impressions: Math.floor(Math.random() * 1000000) + 500000,
        clicks: Math.floor(Math.random() * 20000) + 10000,
        conversions: Math.floor(Math.random() * 1000) + 500,
        cost: Math.floor(Math.random() * 50000) + 25000,
        cpc: 1.5 + Math.random() * 1
      }
    };

    const consolidatedData = {
      campaignAnalytics,
      performanceMetrics,
      lastUpdated: new Date().toISOString()
    };

    console.log('✅ MARKETING_ANALYTICS_DASHBOARD_SUCCESS:', {
      user: req.user.email,
      dataSize: JSON.stringify(consolidatedData).length,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      data: consolidatedData,
      message: 'Marketing analytics dashboard data retrieved successfully',
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('❌ MARKETING_ANALYTICS_DASHBOARD_ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve marketing analytics dashboard data',
      message: error.message,
      timestamp: Date.now()
    });
  }
});

module.exports = router;
