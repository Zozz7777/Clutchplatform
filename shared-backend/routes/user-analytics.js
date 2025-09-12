const express = require('express');
const router = express.Router();
const { getCollection } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ==================== USER ANALYTICS ROUTES ====================

// GET /api/v1/user-analytics/overview - Get user analytics overview
router.get('/overview', authenticateToken, requireRole(['admin', 'analyst']), async (req, res) => {
  try {
    console.log('📊 Fetching user analytics overview');
    
    const { startDate, endDate, period = '30d' } = req.query;
    const collection = await getCollection('users');
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }
    
    // Get user analytics
    const [
      totalUsers,
      activeUsers,
      newUsers,
      usersByRole,
      usersByStatus,
      usersByLocation,
      userGrowth,
      retentionRate
    ] = await Promise.all([
      // Total users
      collection.countDocuments(dateFilter),
      
      // Active users (logged in within last 30 days)
      collection.countDocuments({
        ...dateFilter,
        lastLoginAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }),
      
      // New users (created within period)
      collection.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }),
      
      // Users by role
      collection.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]).toArray(),
      
      // Users by status
      collection.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]).toArray(),
      
      // Users by location
      collection.aggregate([
        { $match: { ...dateFilter, location: { $exists: true } } },
        { $group: { _id: '$location.country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]).toArray(),
      
      // User growth over time
      collection.aggregate([
        { $match: dateFilter },
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
      ]).toArray(),
      
      // Retention rate calculation
      collection.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            retainedUsers: {
              $sum: {
                $cond: [
                  { $gte: ['$lastLoginAt', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]).toArray()
    ]);
    
    const retention = retentionRate[0];
    const retentionPercentage = retention ? 
      Math.round((retention.retainedUsers / retention.totalUsers) * 100 * 100) / 100 : 0;
    
    const analytics = {
      total: totalUsers,
      active: activeUsers,
      new: newUsers,
      byRole: usersByRole,
      byStatus: usersByStatus,
      byLocation: usersByLocation,
      growth: userGrowth,
      retentionRate: retentionPercentage
    };
    
    res.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching user analytics:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_ANALYTICS_FAILED',
      message: 'Failed to fetch user analytics'
    });
  }
});

// GET /api/v1/user-analytics/behavior - Get user behavior analytics
router.get('/behavior', authenticateToken, requireRole(['admin', 'analyst']), async (req, res) => {
  try {
    console.log('📈 Fetching user behavior analytics');
    
    const { startDate, endDate } = req.query;
    const collection = await getCollection('user_activities');
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) dateFilter.timestamp.$gte = new Date(startDate);
      if (endDate) dateFilter.timestamp.$lte = new Date(endDate);
    }
    
    // Get behavior analytics
    const [
      totalActivities,
      activitiesByType,
      activitiesByHour,
      activitiesByDay,
      topUsers,
      sessionDuration,
      pageViews,
      conversionRate
    ] = await Promise.all([
      // Total activities
      collection.countDocuments(dateFilter),
      
      // Activities by type
      collection.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]).toArray(),
      
      // Activities by hour
      collection.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: { $hour: '$timestamp' },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]).toArray(),
      
      // Activities by day
      collection.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: { $dayOfWeek: '$timestamp' },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]).toArray(),
      
      // Top active users
      collection.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$userId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]).toArray(),
      
      // Average session duration
      collection.aggregate([
        { $match: { ...dateFilter, type: 'session_end' } },
        {
          $group: {
            _id: null,
            avgDuration: { $avg: '$duration' }
          }
        }
      ]).toArray(),
      
      // Page views
      collection.aggregate([
        { $match: { ...dateFilter, type: 'page_view' } },
        { $group: { _id: '$page', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]).toArray(),
      
      // Conversion rate
      collection.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            totalSessions: { $sum: { $cond: [{ $eq: ['$type', 'session_start'] }, 1, 0] } },
            conversions: { $sum: { $cond: [{ $eq: ['$type', 'conversion'] }, 1, 0] } }
          }
        }
      ]).toArray()
    ]);
    
    const conversion = conversionRate[0];
    const conversionPercentage = conversion && conversion.totalSessions > 0 ? 
      Math.round((conversion.conversions / conversion.totalSessions) * 100 * 100) / 100 : 0;
    
    const analytics = {
      total: totalActivities,
      byType: activitiesByType,
      byHour: activitiesByHour,
      byDay: activitiesByDay,
      topUsers: topUsers,
      avgSessionDuration: sessionDuration[0]?.avgDuration || 0,
      pageViews: pageViews,
      conversionRate: conversionPercentage
    };
    
    res.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching behavior analytics:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_BEHAVIOR_ANALYTICS_FAILED',
      message: 'Failed to fetch behavior analytics'
    });
  }
});

// GET /api/v1/user-analytics/engagement - Get user engagement metrics
router.get('/engagement', authenticateToken, requireRole(['admin', 'analyst']), async (req, res) => {
  try {
    console.log('🎯 Fetching user engagement metrics');
    
    const { startDate, endDate } = req.query;
    const collection = await getCollection('user_activities');
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) dateFilter.timestamp.$gte = new Date(startDate);
      if (endDate) dateFilter.timestamp.$lte = new Date(endDate);
    }
    
    // Get engagement metrics
    const [
      dailyActiveUsers,
      weeklyActiveUsers,
      monthlyActiveUsers,
      engagementScore,
      featureUsage,
      userSegments,
      churnRate,
      lifetimeValue
    ] = await Promise.all([
      // Daily Active Users
      collection.aggregate([
        { $match: dateFilter },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } } } },
        { $count: 'dau' }
      ]).toArray(),
      
      // Weekly Active Users
      collection.aggregate([
        { $match: dateFilter },
        { $group: { _id: { $week: '$timestamp' } } },
        { $count: 'wau' }
      ]).toArray(),
      
      // Monthly Active Users
      collection.aggregate([
        { $match: dateFilter },
        { $group: { _id: { $month: '$timestamp' } } },
        { $count: 'mau' }
      ]).toArray(),
      
      // Engagement score calculation
      collection.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$userId',
            activityCount: { $sum: 1 },
            uniqueDays: { $addToSet: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } } }
          }
        },
        {
          $project: {
            userId: '$_id',
            activityCount: 1,
            uniqueDays: { $size: '$uniqueDays' },
            engagementScore: { $multiply: ['$activityCount', { $size: '$uniqueDays' }] }
          }
        },
        { $sort: { engagementScore: -1 } },
        { $limit: 100 }
      ]).toArray(),
      
      // Feature usage
      collection.aggregate([
        { $match: { ...dateFilter, type: 'feature_usage' } },
        { $group: { _id: '$feature', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]).toArray(),
      
      // User segments
      collection.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$userId',
            activityCount: { $sum: 1 },
            lastActivity: { $max: '$timestamp' }
          }
        },
        {
          $project: {
            userId: '$_id',
            activityCount: 1,
            daysSinceLastActivity: {
              $divide: [
                { $subtract: [new Date(), '$lastActivity'] },
                1000 * 60 * 60 * 24
              ]
            },
            segment: {
              $cond: [
                { $lte: ['$daysSinceLastActivity', 7] },
                'active',
                {
                  $cond: [
                    { $lte: ['$daysSinceLastActivity', 30] },
                    'at_risk',
                    'inactive'
                  ]
                }
              ]
            }
          }
        },
        { $group: { _id: '$segment', count: { $sum: 1 } } }
      ]).toArray(),
      
      // Churn rate
      collection.aggregate([
        {
          $match: {
            timestamp: { $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: '$userId',
            lastActivity: { $max: '$timestamp' }
          }
        },
        {
          $project: {
            userId: '$_id',
            daysSinceLastActivity: {
              $divide: [
                { $subtract: [new Date(), '$lastActivity'] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            churnedUsers: {
              $sum: {
                $cond: [{ $gte: ['$daysSinceLastActivity', 30] }, 1, 0]
              }
            }
          }
        }
      ]).toArray(),
      
      // Lifetime value calculation
      collection.aggregate([
        { $match: { ...dateFilter, type: 'purchase' } },
        {
          $group: {
            _id: '$userId',
            totalSpent: { $sum: '$amount' },
            purchaseCount: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: null,
            avgLifetimeValue: { $avg: '$totalSpent' },
            avgPurchases: { $avg: '$purchaseCount' }
          }
        }
      ]).toArray()
    ]);
    
    const churn = churnRate[0];
    const churnPercentage = churn && churn.totalUsers > 0 ? 
      Math.round((churn.churnedUsers / churn.totalUsers) * 100 * 100) / 100 : 0;
    
    const analytics = {
      dau: dailyActiveUsers[0]?.dau || 0,
      wau: weeklyActiveUsers[0]?.wau || 0,
      mau: monthlyActiveUsers[0]?.mau || 0,
      engagementScore: engagementScore,
      featureUsage: featureUsage,
      userSegments: userSegments,
      churnRate: churnPercentage,
      lifetimeValue: lifetimeValue[0] || { avgLifetimeValue: 0, avgPurchases: 0 }
    };
    
    res.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching engagement metrics:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_ENGAGEMENT_FAILED',
      message: 'Failed to fetch engagement metrics'
    });
  }
});

// POST /api/v1/user-analytics/track - Track user activity
router.post('/track', authenticateToken, async (req, res) => {
  try {
    console.log('📊 Tracking user activity:', req.body);
    
    const { 
      type, 
      page, 
      feature, 
      duration, 
      metadata = {},
      sessionId
    } = req.body;
    
    if (!type) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Activity type is required'
      });
    }
    
    const collection = await getCollection('user_activities');
    
    const activity = {
      userId: req.user.id,
      sessionId: sessionId || req.sessionID,
      type,
      page: page || null,
      feature: feature || null,
      duration: duration || null,
      metadata,
      timestamp: new Date(),
      userAgent: req.headers['user-agent'] || '',
      ip: req.ip || req.connection.remoteAddress
    };
    
    const result = await collection.insertOne(activity);
    
    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...activity
      },
      message: 'Activity tracked successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error tracking activity:', error);
    res.status(500).json({
      success: false,
      error: 'TRACK_ACTIVITY_FAILED',
      message: 'Failed to track activity'
    });
  }
});

// GET /api/v1/user-analytics/user/:id - Get specific user analytics
router.get('/user/:id', authenticateToken, requireRole(['admin', 'analyst']), async (req, res) => {
  try {
    console.log('👤 Fetching user analytics for:', req.params.id);
    
    const { ObjectId } = require('mongodb');
    const { startDate, endDate } = req.query;
    
    const userCollection = await getCollection('users');
    const activityCollection = await getCollection('user_activities');
    
    // Get user info
    const user = await userCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User not found'
      });
    }
    
    // Build date filter
    const dateFilter = { userId: req.params.id };
    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) dateFilter.timestamp.$gte = new Date(startDate);
      if (endDate) dateFilter.timestamp.$lte = new Date(endDate);
    }
    
    // Get user analytics
    const [
      totalActivities,
      activitiesByType,
      recentActivities,
      sessionData,
      featureUsage,
      engagementScore
    ] = await Promise.all([
      // Total activities
      activityCollection.countDocuments(dateFilter),
      
      // Activities by type
      activityCollection.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]).toArray(),
      
      // Recent activities
      activityCollection
        .find(dateFilter)
        .sort({ timestamp: -1 })
        .limit(20)
        .toArray(),
      
      // Session data
      activityCollection.aggregate([
        { $match: { ...dateFilter, type: 'session_end' } },
        {
          $group: {
            _id: null,
            avgDuration: { $avg: '$duration' },
            totalSessions: { $sum: 1 }
          }
        }
      ]).toArray(),
      
      // Feature usage
      activityCollection.aggregate([
        { $match: { ...dateFilter, type: 'feature_usage' } },
        { $group: { _id: '$feature', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]).toArray(),
      
      // Engagement score
      activityCollection.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            activityCount: { $sum: 1 },
            uniqueDays: { $addToSet: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } } }
          }
        },
        {
          $project: {
            activityCount: 1,
            uniqueDays: { $size: '$uniqueDays' },
            engagementScore: { $multiply: ['$activityCount', { $size: '$uniqueDays' }] }
          }
        }
      ]).toArray()
    ]);
    
    const analytics = {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      },
      activities: {
        total: totalActivities,
        byType: activitiesByType,
        recent: recentActivities
      },
      sessions: sessionData[0] || { avgDuration: 0, totalSessions: 0 },
      features: featureUsage,
      engagement: engagementScore[0] || { activityCount: 0, uniqueDays: 0, engagementScore: 0 }
    };
    
    res.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching user analytics:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_USER_ANALYTICS_FAILED',
      message: 'Failed to fetch user analytics'
    });
  }
});

// GET /api/v1/user-analytics/export - Export analytics data
router.get('/export', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    console.log('📤 Exporting analytics data');
    
    const { startDate, endDate, format = 'json' } = req.query;
    const collection = await getCollection('user_activities');
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) dateFilter.timestamp.$gte = new Date(startDate);
      if (endDate) dateFilter.timestamp.$lte = new Date(endDate);
    }
    
    // Get data for export
    const data = await collection
      .find(dateFilter)
      .sort({ timestamp: -1 })
      .limit(10000) // Limit to prevent memory issues
      .toArray();
    
    if (format === 'csv') {
      // Convert to CSV format
      const csvHeaders = 'userId,sessionId,type,page,feature,duration,timestamp,userAgent,ip\n';
      const csvData = data.map(activity => 
        `${activity.userId},${activity.sessionId},${activity.type},${activity.page || ''},${activity.feature || ''},${activity.duration || ''},${activity.timestamp},${activity.userAgent},${activity.ip}`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=user-analytics.csv');
      res.send(csvHeaders + csvData);
    } else {
      // Return JSON format
      res.json({
        success: true,
        data: {
          exportDate: new Date().toISOString(),
          recordCount: data.length,
          records: data
        },
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('❌ Error exporting analytics:', error);
    res.status(500).json({
      success: false,
      error: 'EXPORT_ANALYTICS_FAILED',
      message: 'Failed to export analytics data'
    });
  }
});

module.exports = router;
const router = express.Router();
const { getCollection } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ==================== USER ANALYTICS ROUTES ====================

// GET /api/v1/user-analytics/overview - Get user analytics overview
router.get('/overview', authenticateToken, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    console.log('📊 Fetching user analytics overview');
    
    const { startDate, endDate } = req.query;
    const usersCollection = await getCollection('users');
    const sessionsCollection = await getCollection('user_sessions');
    const activitiesCollection = await getCollection('user_activities');
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }
    
    // Get analytics
    const [
      totalUsers,
      activeUsers,
      newUsers,
      userGrowth,
      topCountries,
      userRoles,
      sessionStats,
      activityStats
    ] = await Promise.all([
      // Total users
      usersCollection.countDocuments(),
      
      // Active users (last 30 days)
      usersCollection.countDocuments({
        lastActiveAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }),
      
      // New users in period
      usersCollection.countDocuments(dateFilter),
      
      // User growth over time
      usersCollection.aggregate([
        { $match: dateFilter },
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
      ]).toArray(),
      
      // Top countries
      usersCollection.aggregate([
        { $match: { country: { $exists: true, $ne: null } } },
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]).toArray(),
      
      // User roles distribution
      usersCollection.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]).toArray(),
      
      // Session statistics
      sessionsCollection.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            totalSessions: { $sum: 1 },
            avgSessionDuration: { $avg: '$duration' },
            totalDuration: { $sum: '$duration' }
          }
        }
      ]).toArray(),
      
      // Activity statistics
      activitiesCollection.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$action',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]).toArray()
    ]);
    
    const overview = {
      users: {
        total: totalUsers,
        active: activeUsers,
        new: newUsers,
        growth: userGrowth
      },
      demographics: {
        topCountries,
        roles: userRoles
      },
      sessions: sessionStats[0] || {
        totalSessions: 0,
        avgSessionDuration: 0,
        totalDuration: 0
      },
      activities: activityStats
    };
    
    res.json({
      success: true,
      data: overview,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching user analytics overview:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_OVERVIEW_FAILED',
      message: 'Failed to fetch user analytics overview'
    });
  }
});

// GET /api/v1/user-analytics/users - Get detailed user analytics
router.get('/users', authenticateToken, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    console.log('👥 Fetching detailed user analytics');
    
    const { 
      page = 1, 
      limit = 20, 
      role, 
      country, 
      status,
      startDate,
      endDate
    } = req.query;
    
    const skip = (page - 1) * limit;
    const usersCollection = await getCollection('users');
    
    // Build query
    const query = {};
    if (role) query.role = role;
    if (country) query.country = country;
    if (status) query.status = status;
    
    // Date filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    // Get users with pagination
    const users = await usersCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    // Get total count
    const total = await usersCollection.countDocuments(query);
    
    // Get additional user stats
    const userStats = await Promise.all(
      users.map(async (user) => {
        const sessionsCollection = await getCollection('user_sessions');
        const activitiesCollection = await getCollection('user_activities');
        
        const [sessionCount, lastSession, activityCount] = await Promise.all([
          sessionsCollection.countDocuments({ userId: user._id }),
          sessionsCollection.findOne(
            { userId: user._id },
            { sort: { createdAt: -1 } }
          ),
          activitiesCollection.countDocuments({ userId: user._id })
        ]);
        
        return {
          ...user,
          stats: {
            sessionCount,
            lastSession: lastSession?.createdAt || null,
            activityCount
          }
        };
      })
    );
    
    res.json({
      success: true,
      data: {
        users: userStats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching user analytics:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_USERS_FAILED',
      message: 'Failed to fetch user analytics'
    });
  }
});

// GET /api/v1/user-analytics/sessions - Get session analytics
router.get('/sessions', authenticateToken, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    console.log('🔄 Fetching session analytics');
    
    const { 
      page = 1, 
      limit = 20, 
      userId,
      startDate,
      endDate
    } = req.query;
    
    const skip = (page - 1) * limit;
    const sessionsCollection = await getCollection('user_sessions');
    
    // Build query
    const query = {};
    if (userId) query.userId = userId;
    
    // Date filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    // Get sessions with pagination
    const sessions = await sessionsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    // Get total count
    const total = await sessionsCollection.countDocuments(query);
    
    // Get session statistics
    const sessionStats = await sessionsCollection.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          avgDuration: { $avg: '$duration' },
          totalDuration: { $sum: '$duration' },
          uniqueUsers: { $addToSet: '$userId' }
        }
      }
    ]).toArray();
    
    const stats = sessionStats[0] || {
      totalSessions: 0,
      avgDuration: 0,
      totalDuration: 0,
      uniqueUsers: []
    };
    
    res.json({
      success: true,
      data: {
        sessions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        statistics: {
          ...stats,
          uniqueUserCount: stats.uniqueUsers.length
        }
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching session analytics:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_SESSIONS_FAILED',
      message: 'Failed to fetch session analytics'
    });
  }
});

// GET /api/v1/user-analytics/activities - Get user activity analytics
router.get('/activities', authenticateToken, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    console.log('📈 Fetching user activity analytics');
    
    const { 
      page = 1, 
      limit = 20, 
      userId,
      action,
      startDate,
      endDate
    } = req.query;
    
    const skip = (page - 1) * limit;
    const activitiesCollection = await getCollection('user_activities');
    
    // Build query
    const query = {};
    if (userId) query.userId = userId;
    if (action) query.action = action;
    
    // Date filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    // Get activities with pagination
    const activities = await activitiesCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    // Get total count
    const total = await activitiesCollection.countDocuments(query);
    
    // Get activity statistics
    const activityStats = await activitiesCollection.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();
    
    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        statistics: activityStats.map(stat => ({
          action: stat._id,
          count: stat.count,
          uniqueUsers: stat.uniqueUsers.length
        }))
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching activity analytics:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_ACTIVITIES_FAILED',
      message: 'Failed to fetch activity analytics'
    });
  }
});

// GET /api/v1/user-analytics/retention - Get user retention analytics
router.get('/retention', authenticateToken, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    console.log('📊 Fetching user retention analytics');
    
    const { period = '30d' } = req.query;
    const usersCollection = await getCollection('users');
    const sessionsCollection = await getCollection('user_sessions');
    
    // Calculate period in days
    const periodDays = parseInt(period.replace('d', ''));
    const periodMs = periodDays * 24 * 60 * 60 * 1000;
    
    // Get retention data
    const retentionData = await usersCollection.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - periodMs) }
        }
      },
      {
        $lookup: {
          from: 'user_sessions',
          localField: '_id',
          foreignField: 'userId',
          as: 'sessions'
        }
      },
      {
        $project: {
          userId: '$_id',
          createdAt: 1,
          sessions: 1,
          hasReturned: {
            $gt: [{ $size: '$sessions' }, 1]
          },
          daysSinceFirstSession: {
            $divide: [
              { $subtract: ['$$NOW', '$createdAt'] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      {
        $group: {
          _id: {
            $floor: '$daysSinceFirstSession'
          },
          totalUsers: { $sum: 1 },
          returningUsers: {
            $sum: { $cond: ['$hasReturned', 1, 0] }
          }
        }
      },
      { $sort: { '_id': 1 } }
    ]).toArray();
    
    // Calculate retention rates
    const retentionRates = retentionData.map(day => ({
      day: day._id,
      totalUsers: day.totalUsers,
      returningUsers: day.returningUsers,
      retentionRate: day.totalUsers > 0 ? 
        Math.round((day.returningUsers / day.totalUsers) * 100 * 100) / 100 : 0
    }));
    
    res.json({
      success: true,
      data: {
        period: period,
        retentionRates,
        summary: {
          totalUsers: retentionData.reduce((sum, day) => sum + day.totalUsers, 0),
          totalReturning: retentionData.reduce((sum, day) => sum + day.returningUsers, 0),
          avgRetentionRate: retentionRates.length > 0 ? 
            Math.round((retentionRates.reduce((sum, day) => sum + day.retentionRate, 0) / retentionRates.length) * 100) / 100 : 0
        }
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching retention analytics:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_RETENTION_FAILED',
      message: 'Failed to fetch retention analytics'
    });
  }
});

// GET /api/v1/user-analytics/engagement - Get user engagement metrics
router.get('/engagement', authenticateToken, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    console.log('📈 Fetching user engagement metrics');
    
    const { startDate, endDate } = req.query;
    const usersCollection = await getCollection('users');
    const activitiesCollection = await getCollection('user_activities');
    const sessionsCollection = await getCollection('user_sessions');
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }
    
    // Get engagement metrics
    const [
      dailyActiveUsers,
      weeklyActiveUsers,
      monthlyActiveUsers,
      avgSessionDuration,
      avgActivitiesPerUser,
      topActions,
      engagementByHour
    ] = await Promise.all([
      // Daily Active Users
      sessionsCollection.distinct('userId', {
        ...dateFilter,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }),
      
      // Weekly Active Users
      sessionsCollection.distinct('userId', {
        ...dateFilter,
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }),
      
      // Monthly Active Users
      sessionsCollection.distinct('userId', {
        ...dateFilter,
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }),
      
      // Average session duration
      sessionsCollection.aggregate([
        { $match: dateFilter },
        { $group: { _id: null, avgDuration: { $avg: '$duration' } } }
      ]).toArray(),
      
      // Average activities per user
      activitiesCollection.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$userId', activityCount: { $sum: 1 } } },
        { $group: { _id: null, avgActivities: { $avg: '$activityCount' } } }
      ]).toArray(),
      
      // Top actions
      activitiesCollection.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]).toArray(),
      
      // Engagement by hour
      activitiesCollection.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: { $hour: '$createdAt' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id': 1 } }
      ]).toArray()
    ]);
    
    const engagement = {
      activeUsers: {
        daily: dailyActiveUsers.length,
        weekly: weeklyActiveUsers.length,
        monthly: monthlyActiveUsers.length
      },
      sessionMetrics: {
        avgDuration: avgSessionDuration[0]?.avgDuration || 0
      },
      activityMetrics: {
        avgPerUser: avgActivitiesPerUser[0]?.avgActivities || 0,
        topActions,
        byHour: engagementByHour
      }
    };
    
    res.json({
      success: true,
      data: engagement,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching engagement metrics:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_ENGAGEMENT_FAILED',
      message: 'Failed to fetch engagement metrics'
    });
  }
});

// POST /api/v1/user-analytics/track - Track user activity
router.post('/track', authenticateToken, async (req, res) => {
  try {
    console.log('📊 Tracking user activity:', req.body);
    
    const { action, details = {}, metadata = {} } = req.body;
    
    if (!action) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Action is required'
      });
    }
    
    const activitiesCollection = await getCollection('user_activities');
    
    const activity = {
      userId: req.user.id,
      action,
      details,
      metadata,
      userAgent: req.headers['user-agent'] || '',
      ip: req.ip || req.connection.remoteAddress,
      createdAt: new Date()
    };
    
    const result = await activitiesCollection.insertOne(activity);
    
    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...activity
      },
      message: 'Activity tracked successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error tracking activity:', error);
    res.status(500).json({
      success: false,
      error: 'TRACK_ACTIVITY_FAILED',
      message: 'Failed to track activity'
    });
  }
});

module.exports = router;
