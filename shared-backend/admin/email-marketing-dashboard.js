const express = require('express');
const router = express.Router();
const { logger } = require('../config/logger');
const EmailMarketingService = require('../services/email-marketing-service');

// Initialize email marketing service
const emailMarketingService = new EmailMarketingService();

// ==================== ADMIN DASHBOARD ROUTES ====================

// Get comprehensive dashboard overview
router.get('/dashboard/overview', async (req, res) => {
  try {
    const { getCollection } = require('../config/database');
    
    // Get collections
    const subscribersCollection = await getCollection('email_subscribers');
    const campaignsCollection = await getCollection('email_campaigns');
    const automationsCollection = await getCollection('email_automations');
    const analyticsCollection = await getCollection('email_analytics');
    
    // Calculate metrics
    const totalSubscribers = await subscribersCollection.countDocuments();
    const activeSubscribers = await subscribersCollection.countDocuments({ status: 'active' });
    const totalCampaigns = await campaignsCollection.countDocuments();
    const activeCampaigns = await campaignsCollection.countDocuments({ status: 'active' });
    const totalAutomations = await automationsCollection.countDocuments();
    const activeAutomations = await automationsCollection.countDocuments({ status: 'active' });
    
    // Get recent analytics
    const recentAnalytics = await analyticsCollection
      .find({})
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();
    
    // Calculate engagement rates
    const totalOpens = recentAnalytics.filter(a => a.action === 'open').length;
    const totalClicks = recentAnalytics.filter(a => a.action === 'click').length;
    const totalUnsubscribes = recentAnalytics.filter(a => a.action === 'unsubscribe').length;
    
    const openRate = totalSubscribers > 0 ? (totalOpens / totalSubscribers * 100).toFixed(2) : 0;
    const clickRate = totalSubscribers > 0 ? (totalClicks / totalSubscribers * 100).toFixed(2) : 0;
    const unsubscribeRate = totalSubscribers > 0 ? (totalUnsubscribes / totalSubscribers * 100).toFixed(2) : 0;
    
    // Get subscriber growth trend (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newSubscribers = await subscribersCollection.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    // Get top performing campaigns
    const topCampaigns = await campaignsCollection
      .aggregate([
        {
          $lookup: {
            from: 'email_analytics',
            localField: '_id',
            foreignField: 'campaignId',
            as: 'analytics'
          }
        },
        {
          $addFields: {
            openCount: { $size: { $filter: { input: '$analytics', cond: { $eq: ['$$this.action', 'open'] } } } },
            clickCount: { $size: { $filter: { input: '$analytics', cond: { $eq: ['$$this.action', 'click'] } } } }
          }
        },
        {
          $sort: { openCount: -1 }
        },
        {
          $limit: 5
        }
      ]).toArray();
    
    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalSubscribers,
          activeSubscribers,
          totalCampaigns,
          activeCampaigns,
          totalAutomations,
          activeAutomations,
          newSubscribersLast30Days: newSubscribers
        },
        engagement: {
          openRate: parseFloat(openRate),
          clickRate: parseFloat(clickRate),
          unsubscribeRate: parseFloat(unsubscribeRate),
          totalOpens,
          totalClicks,
          totalUnsubscribes
        },
        topCampaigns,
        recentActivity: recentAnalytics.slice(0, 5)
      }
    });
  } catch (error) {
    logger.error('Error getting dashboard overview:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get detailed analytics report
router.get('/dashboard/analytics', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const { getCollection } = require('../config/database');
    
    const analyticsCollection = await getCollection('email_analytics');
    const campaignsCollection = await getCollection('email_campaigns');
    const subscribersCollection = await getCollection('email_subscribers');
    
    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
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
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    // Get analytics data
    const analytics = await analyticsCollection
      .find({
        timestamp: { $gte: startDate }
      })
      .toArray();
    
    // Group by date
    const dailyStats = {};
    analytics.forEach(analytic => {
      const date = new Date(analytic.timestamp).toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { opens: 0, clicks: 0, unsubscribes: 0 };
      }
      dailyStats[date][analytic.action + 's']++;
    });
    
    // Get campaign performance
    const campaignPerformance = await campaignsCollection
      .aggregate([
        {
          $lookup: {
            from: 'email_analytics',
            localField: '_id',
            foreignField: 'campaignId',
            as: 'analytics'
          }
        },
        {
          $addFields: {
            openCount: { $size: { $filter: { input: '$analytics', cond: { $eq: ['$$this.action', 'open'] } } } },
            clickCount: { $size: { $filter: { input: '$analytics', cond: { $eq: ['$$this.action', 'click'] } } } },
            unsubscribeCount: { $size: { $filter: { input: '$analytics', cond: { $eq: ['$$this.action', 'unsubscribe'] } } } }
          }
        },
        {
          $project: {
            name: 1,
            subject: 1,
            status: 1,
            openCount: 1,
            clickCount: 1,
            unsubscribeCount: 1,
            openRate: { $multiply: [{ $divide: ['$openCount', { $max: ['$sentCount', 1] }] }, 100] },
            clickRate: { $multiply: [{ $divide: ['$clickCount', { $max: ['$sentCount', 1] }] }, 100] }
          }
        }
      ]).toArray();
    
    // Get subscriber demographics
    const subscriberDemographics = await subscribersCollection
      .aggregate([
        {
          $group: {
            _id: '$signupSource',
            count: { $sum: 1 }
          }
        }
      ]).toArray();
    
    // Get device/platform statistics
    const deviceStats = await analyticsCollection
      .aggregate([
        {
          $match: {
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$deviceInfo.platform',
            count: { $sum: 1 }
          }
        }
      ]).toArray();
    
    res.status(200).json({
      success: true,
      data: {
        period,
        dailyStats: Object.entries(dailyStats).map(([date, stats]) => ({
          date,
          ...stats
        })),
        campaignPerformance,
        subscriberDemographics,
        deviceStats,
        summary: {
          totalAnalytics: analytics.length,
          totalOpens: analytics.filter(a => a.action === 'open').length,
          totalClicks: analytics.filter(a => a.action === 'click').length,
          totalUnsubscribes: analytics.filter(a => a.action === 'unsubscribe').length
        }
      }
    });
  } catch (error) {
    logger.error('Error getting analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get subscriber insights
router.get('/dashboard/subscribers', async (req, res) => {
  try {
    const { getCollection } = require('../config/database');
    const subscribersCollection = await getCollection('email_subscribers');
    
    // Get subscriber growth over time
    const growthData = await subscribersCollection
      .aggregate([
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
        {
          $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
        }
      ]).toArray();
    
    // Get subscriber segments
    const segmentStats = await subscribersCollection
      .aggregate([
        {
          $unwind: '$tags'
        },
        {
          $group: {
            _id: '$tags',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]).toArray();
    
    // Get subscriber preferences
    const preferenceStats = await subscribersCollection
      .aggregate([
        {
          $project: {
            newsletter: '$preferences.newsletter',
            promotions: '$preferences.promotions',
            serviceReminders: '$preferences.serviceReminders',
            maintenanceAlerts: '$preferences.maintenanceAlerts'
          }
        },
        {
          $group: {
            _id: null,
            newsletterSubscribers: { $sum: { $cond: ['$newsletter', 1, 0] } },
            promotionSubscribers: { $sum: { $cond: ['$promotions', 1, 0] } },
            serviceReminderSubscribers: { $sum: { $cond: ['$serviceReminders', 1, 0] } },
            maintenanceAlertSubscribers: { $sum: { $cond: ['$maintenanceAlerts', 1, 0] } }
          }
        }
      ]).toArray();
    
    // Get recent subscribers
    const recentSubscribers = await subscribersCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();
    
    // Get subscriber engagement scores
    const engagementScores = await subscribersCollection
      .aggregate([
        {
          $lookup: {
            from: 'email_analytics',
            localField: 'email',
            foreignField: 'subscriberEmail',
            as: 'analytics'
          }
        },
        {
          $addFields: {
            engagementScore: {
              $add: [
                { $multiply: [{ $size: { $filter: { input: '$analytics', cond: { $eq: ['$$this.action', 'open'] } } } }, 1] },
                { $multiply: [{ $size: { $filter: { input: '$analytics', cond: { $eq: ['$$this.action', 'click'] } } } }, 2] },
                { $multiply: [{ $size: { $filter: { input: '$analytics', cond: { $eq: ['$$this.action', 'unsubscribe'] } } } }, -5] }
              ]
            }
          }
        },
        {
          $sort: { engagementScore: -1 }
        },
        {
          $limit: 10
        }
      ]).toArray();
    
    res.status(200).json({
      success: true,
      data: {
        growthData,
        segmentStats,
        preferenceStats: preferenceStats[0] || {},
        recentSubscribers,
        topEngagedSubscribers: engagementScores
      }
    });
  } catch (error) {
    logger.error('Error getting subscriber insights:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get campaign performance dashboard
router.get('/dashboard/campaigns', async (req, res) => {
  try {
    const { getCollection } = require('../config/database');
    const campaignsCollection = await getCollection('email_campaigns');
    const analyticsCollection = await getCollection('email_analytics');
    
    // Get all campaigns with performance metrics
    const campaigns = await campaignsCollection
      .aggregate([
        {
          $lookup: {
            from: 'email_analytics',
            localField: '_id',
            foreignField: 'campaignId',
            as: 'analytics'
          }
        },
        {
          $addFields: {
            openCount: { $size: { $filter: { input: '$analytics', cond: { $eq: ['$$this.action', 'open'] } } } },
            clickCount: { $size: { $filter: { input: '$analytics', cond: { $eq: ['$$this.action', 'click'] } } } },
            unsubscribeCount: { $size: { $filter: { input: '$analytics', cond: { $eq: ['$$this.action', 'unsubscribe'] } } } },
            totalSent: { $ifNull: ['$sentCount', 0] }
          }
        },
        {
          $addFields: {
            openRate: {
              $cond: [
                { $gt: ['$totalSent', 0] },
                { $multiply: [{ $divide: ['$openCount', '$totalSent'] }, 100] },
                0
              ]
            },
            clickRate: {
              $cond: [
                { $gt: ['$totalSent', 0] },
                { $multiply: [{ $divide: ['$clickCount', '$totalSent'] }, 100] },
                0
              ]
            },
            unsubscribeRate: {
              $cond: [
                { $gt: ['$totalSent', 0] },
                { $multiply: [{ $divide: ['$unsubscribeCount', '$totalSent'] }, 100] },
                0
              ]
            }
          }
        },
        {
          $sort: { createdAt: -1 }
        }
      ]).toArray();
    
    // Get campaign performance by template type
    const templatePerformance = await campaignsCollection
      .aggregate([
        {
          $group: {
            _id: '$templateType',
            count: { $sum: 1 },
            avgOpenRate: { $avg: '$openRate' },
            avgClickRate: { $avg: '$clickRate' }
          }
        }
      ]).toArray();
    
    // Get campaign status distribution
    const statusDistribution = await campaignsCollection
      .aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]).toArray();
    
    // Get recent campaign activity
    const recentActivity = await analyticsCollection
      .aggregate([
        {
          $lookup: {
            from: 'email_campaigns',
            localField: 'campaignId',
            foreignField: '_id',
            as: 'campaign'
          }
        },
        {
          $unwind: '$campaign'
        },
        {
          $sort: { timestamp: -1 }
        },
        {
          $limit: 20
        }
      ]).toArray();
    
    res.status(200).json({
      success: true,
      data: {
        campaigns,
        templatePerformance,
        statusDistribution,
        recentActivity
      }
    });
  } catch (error) {
    logger.error('Error getting campaign dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get automation workflow dashboard
router.get('/dashboard/automations', async (req, res) => {
  try {
    const { getCollection } = require('../config/database');
    const automationsCollection = await getCollection('email_automations');
    const analyticsCollection = await getCollection('email_analytics');
    
    // Get all automations with performance metrics
    const automations = await automationsCollection
      .aggregate([
        {
          $lookup: {
            from: 'email_analytics',
            localField: '_id',
            foreignField: 'automationId',
            as: 'analytics'
          }
        },
        {
          $addFields: {
            totalExecutions: { $size: '$analytics' },
            openCount: { $size: { $filter: { input: '$analytics', cond: { $eq: ['$$this.action', 'open'] } } } },
            clickCount: { $size: { $filter: { input: '$analytics', cond: { $eq: ['$$this.action', 'click'] } } } },
            unsubscribeCount: { $size: { $filter: { input: '$analytics', cond: { $eq: ['$$this.action', 'unsubscribe'] } } } }
          }
        },
        {
          $addFields: {
            openRate: {
              $cond: [
                { $gt: ['$totalExecutions', 0] },
                { $multiply: [{ $divide: ['$openCount', '$totalExecutions'] }, 100] },
                0
              ]
            },
            clickRate: {
              $cond: [
                { $gt: ['$totalExecutions', 0] },
                { $multiply: [{ $divide: ['$clickCount', '$totalExecutions'] }, 100] },
                0
              ]
            }
          }
        },
        {
          $sort: { createdAt: -1 }
        }
      ]).toArray();
    
    // Get automation execution trends
    const executionTrends = await analyticsCollection
      .aggregate([
        {
          $match: {
            automationId: { $exists: true }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$timestamp' },
              month: { $month: '$timestamp' },
              day: { $dayOfMonth: '$timestamp' }
            },
            executions: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
        }
      ]).toArray();
    
    // Get automation status distribution
    const statusDistribution = await automationsCollection
      .aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]).toArray();
    
    // Get top performing automations
    const topAutomations = automations
      .sort((a, b) => b.openRate - a.openRate)
      .slice(0, 5);
    
    res.status(200).json({
      success: true,
      data: {
        automations,
        executionTrends,
        statusDistribution,
        topAutomations
      }
    });
  } catch (error) {
    logger.error('Error getting automation dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get system health and performance metrics
router.get('/dashboard/health', async (req, res) => {
  try {
    const { getCollection } = require('../config/database');
    
    // Check database connections
    const subscribersCollection = await getCollection('email_subscribers');
    const campaignsCollection = await getCollection('email_campaigns');
    const automationsCollection = await getCollection('email_automations');
    const analyticsCollection = await getCollection('email_analytics');
    
    // Test database operations
    const dbHealth = {
      subscribers: await subscribersCollection.countDocuments(),
      campaigns: await campaignsCollection.countDocuments(),
      automations: await automationsCollection.countDocuments(),
      analytics: await analyticsCollection.countDocuments()
    };
    
    // Check email service status
    const emailServiceStatus = emailMarketingService.isInitialized ? 'operational' : 'initializing';
    
    // Get system metrics
    const systemMetrics = {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      nodeVersion: process.version,
      platform: process.platform
    };
    
    // Get recent errors
    const recentErrors = await analyticsCollection
      .find({ action: 'error' })
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();
    
    res.status(200).json({
      success: true,
      data: {
        database: {
          status: 'healthy',
          collections: dbHealth
        },
        emailService: {
          status: emailServiceStatus,
          initialized: emailMarketingService.isInitialized
        },
        system: systemMetrics,
        recentErrors
      }
    });
  } catch (error) {
    logger.error('Error getting health metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
