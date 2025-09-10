const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { createSmartRateLimit } = require('../middleware/smartRateLimit');
const { validate } = require('../middleware/inputValidation');
const { logger } = require('../config/logger');

// Rate limiting for user endpoints
const userRateLimit = createSmartRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many user requests from this IP, please try again later.'
});

// Apply rate limiting to all user routes
router.use(userRateLimit);

// ==================== USER ANALYTICS ====================

// Get user analytics
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, department, role } = req.query;
    
    // Mock user analytics (replace with actual analytics system)
    const analytics = {
      overview: {
        totalUsers: 15420,
        activeUsers: 12890,
        newUsers: 450,
        churnedUsers: 23,
        growthRate: 0.035
      },
      engagement: {
        dailyActiveUsers: 6200,
        weeklyActiveUsers: 15420,
        monthlyActiveUsers: 15420,
        averageSessionDuration: 8.5,
        sessionsPerUser: 3.2,
        retentionRate: 0.78
      },
      demographics: {
        ageGroups: {
          '18-24': 0.15,
          '25-34': 0.35,
          '35-44': 0.28,
          '45-54': 0.15,
          '55+': 0.07
        },
        locations: {
          'North America': 0.45,
          'Europe': 0.28,
          'Asia Pacific': 0.18,
          'Other': 0.09
        },
        devices: {
          'Desktop': 0.65,
          'Mobile': 0.30,
          'Tablet': 0.05
        }
      },
      behavior: {
        topFeatures: [
          { name: 'Dashboard', usage: 0.89 },
          { name: 'Reports', usage: 0.76 },
          { name: 'Settings', usage: 0.68 },
          { name: 'Analytics', usage: 0.54 }
        ],
        userJourney: [
          { step: 'Login', completion: 0.98 },
          { step: 'Dashboard', completion: 0.89 },
          { step: 'First Action', completion: 0.76 },
          { step: 'Return Visit', completion: 0.68 }
        ]
      },
      performance: {
        userSatisfaction: 4.6,
        supportTickets: 156,
        featureAdoption: 0.72,
        timeToValue: 2.3 // days
      }
    };

    res.json({
      success: true,
      data: analytics,
      filters: { startDate, endDate, department, role },
      lastUpdated: new Date()
    });
  } catch (error) {
    logger.error('Error getting user analytics:', error);
    res.status(500).json({ error: 'Failed to get user analytics' });
  }
});

// ==================== USER SEGMENTS ====================

// Get user segments
router.get('/segments', authenticateToken, async (req, res) => {
  try {
    const { type, status, limit = 20 } = req.query;
    
    // Mock user segments (replace with actual segmentation system)
    const segments = [
      {
        id: '1',
        name: 'Power Users',
        description: 'Users with high engagement and feature usage',
        type: 'behavioral',
        criteria: {
          loginFrequency: 'daily',
          featureUsage: 'high',
          sessionDuration: '>10min',
          lastActivity: '<7days'
        },
        userCount: 2340,
        status: 'active',
        createdAt: new Date('2024-01-01T09:00:00Z'),
        lastUpdated: new Date('2024-01-15T14:30:00Z')
      },
      {
        id: '2',
        name: 'New Users',
        description: 'Users who joined in the last 30 days',
        type: 'demographic',
        criteria: {
          joinDate: '>30days',
          firstLogin: 'completed',
          onboarding: 'in_progress'
        },
        userCount: 450,
        status: 'active',
        createdAt: new Date('2024-01-10T10:00:00Z'),
        lastUpdated: new Date('2024-01-15T16:00:00Z')
      },
      {
        id: '3',
        name: 'At Risk Users',
        description: 'Users showing signs of churn',
        type: 'behavioral',
        criteria: {
          loginFrequency: 'declining',
          featureUsage: 'low',
          lastActivity: '>30days',
          supportTickets: '>0'
        },
        userCount: 156,
        status: 'active',
        createdAt: new Date('2024-01-05T11:00:00Z'),
        lastUpdated: new Date('2024-01-15T12:00:00Z')
      },
      {
        id: '4',
        name: 'Enterprise Users',
        description: 'Users from enterprise accounts',
        type: 'demographic',
        criteria: {
          accountType: 'enterprise',
          userRole: 'admin',
          teamSize: '>10'
        },
        userCount: 890,
        status: 'active',
        createdAt: new Date('2024-01-03T14:00:00Z'),
        lastUpdated: new Date('2024-01-15T15:00:00Z')
      }
    ];

    let filteredSegments = segments;
    
    if (type) {
      filteredSegments = segments.filter(segment => segment.type === type);
    }
    
    if (status) {
      filteredSegments = segments.filter(segment => segment.status === status);
    }

    res.json({
      success: true,
      data: filteredSegments.slice(0, parseInt(limit)),
      total: filteredSegments.length,
      filters: { type, status, limit }
    });
  } catch (error) {
    logger.error('Error getting user segments:', error);
    res.status(500).json({ error: 'Failed to get user segments' });
  }
});

// Create user segment
router.post('/segments', authenticateToken, requireRole(['admin', 'analyst']), userRateLimit, async (req, res) => {
  try {
    const { name, description, type, criteria } = req.body;
    
    if (!name || !type || !criteria) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Name, type, and criteria are required'
      });
    }

    // Mock segment creation (replace with actual segmentation system)
    const segment = {
      id: Date.now().toString(),
      name,
      description: description || '',
      type,
      criteria,
      userCount: 0,
      status: 'active',
      createdAt: new Date(),
      createdBy: req.user.userId,
      lastUpdated: new Date()
    };

    res.status(201).json({
      success: true,
      message: 'User segment created successfully',
      data: segment
    });
  } catch (error) {
    logger.error('Error creating user segment:', error);
    res.status(500).json({ error: 'Failed to create user segment' });
  }
});

// ==================== TOP USERS ====================

// Get top users
router.get('/top-users', authenticateToken, async (req, res) => {
  try {
    const { metric, limit = 20, timeframe } = req.query;
    
    if (!metric) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_METRIC',
        message: 'Metric is required (engagement, activity, value, etc.)'
      });
    }

    // Mock top users data (replace with actual analytics system)
    const topUsers = {
      engagement: [
        {
          id: 'user_1',
          name: 'John Smith',
          email: 'john.smith@company.com',
          department: 'Engineering',
          role: 'Senior Developer',
          metric: 'engagement',
          value: 0.95,
          rank: 1,
          details: {
            loginFrequency: 'daily',
            sessionDuration: 12.5,
            featuresUsed: 15,
            lastActivity: '2 hours ago'
          }
        },
        {
          id: 'user_2',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@company.com',
          department: 'Marketing',
          role: 'Marketing Manager',
          metric: 'engagement',
          value: 0.89,
          rank: 2,
          details: {
            loginFrequency: 'daily',
            sessionDuration: 10.2,
            featuresUsed: 12,
            lastActivity: '4 hours ago'
          }
        }
      ],
      activity: [
        {
          id: 'user_3',
          name: 'Mike Chen',
          email: 'mike.chen@company.com',
          department: 'Sales',
          role: 'Sales Director',
          metric: 'activity',
          value: 156,
          rank: 1,
          details: {
            actionsPerDay: 25.3,
            reportsGenerated: 45,
            dataExports: 12,
            lastActivity: '1 hour ago'
          }
        }
      ],
      value: [
        {
          id: 'user_4',
          name: 'Emily Davis',
          email: 'emily.davis@company.com',
          department: 'Finance',
          role: 'Finance Manager',
          metric: 'value',
          value: 125000,
          rank: 1,
          details: {
            revenueGenerated: 125000,
            dealsClosed: 8,
            customerRetention: 0.92,
            lastActivity: '3 hours ago'
          }
        }
      ]
    };

    const result = topUsers[metric] || [];
    const limitedResult = result.slice(0, parseInt(limit));

    res.json({
      success: true,
      data: limitedResult,
      metric,
      total: result.length,
      filters: { metric, limit, timeframe }
    });
  } catch (error) {
    logger.error('Error getting top users:', error);
    res.status(500).json({ error: 'Failed to get top users' });
  }
});

// ==================== USER INSIGHTS ====================

// Get user insights
router.get('/insights', authenticateToken, async (req, res) => {
  try {
    const { type, timeframe } = req.query;
    
    // Mock user insights (replace with actual insights system)
    const insights = {
      trends: {
        userGrowth: {
          trend: 'increasing',
          rate: 0.035,
          forecast: 'Continued growth expected',
          factors: ['Product improvements', 'Marketing campaigns', 'Word of mouth']
        },
        engagement: {
          trend: 'improving',
          rate: 0.12,
          forecast: 'Engagement will continue to improve',
          factors: ['New features', 'Better onboarding', 'Performance improvements']
        },
        retention: {
          trend: 'stable',
          rate: 0.78,
          forecast: 'Retention expected to remain stable',
          factors: ['Customer success', 'Product quality', 'Support quality']
        }
      },
      patterns: {
        peakUsage: 'Tuesday and Thursday, 10 AM - 2 PM',
        featureAdoption: 'Dashboard and Reports are most adopted features',
        userJourney: 'Most users complete onboarding in 2-3 days',
        churnSignals: 'Users who don\'t log in within 7 days are at risk'
      },
      recommendations: [
        {
          type: 'engagement',
          title: 'Improve Onboarding Experience',
          description: 'Users who complete onboarding are 3x more likely to become active',
          priority: 'high',
          impact: 'Increase user activation by 25%'
        },
        {
          type: 'retention',
          title: 'Implement Re-engagement Campaigns',
          description: 'Target users who haven\'t logged in for 7+ days',
          priority: 'medium',
          impact: 'Reduce churn by 15%'
        },
        {
          type: 'growth',
          title: 'Optimize Feature Discovery',
          description: 'Many users are unaware of key features',
          priority: 'medium',
          impact: 'Increase feature adoption by 20%'
        }
      ]
    };

    let result = insights;
    if (type && insights[type]) {
      result = { [type]: insights[type] };
    }

    res.json({
      success: true,
      data: result,
      filters: { type, timeframe },
      lastUpdated: new Date()
    });
  } catch (error) {
    logger.error('Error getting user insights:', error);
    res.status(500).json({ error: 'Failed to get user insights' });
  }
});

// ==================== USER ACTIVITY ====================

// Get user activity
router.get('/activity', authenticateToken, async (req, res) => {
  try {
    const { userId, type, startDate, endDate, limit = 50 } = req.query;
    
    // Mock user activity (replace with actual activity tracking)
    const activities = [
      {
        id: '1',
        userId: 'user_1',
        type: 'login',
        description: 'User logged in successfully',
        timestamp: new Date('2024-01-15T10:00:00Z'),
        metadata: {
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          location: 'New York, NY'
        }
      },
      {
        id: '2',
        userId: 'user_1',
        type: 'feature_usage',
        description: 'User accessed Analytics dashboard',
        timestamp: new Date('2024-01-15T10:05:00Z'),
        metadata: {
          feature: 'analytics',
          duration: 300,
          actions: 15
        }
      },
      {
        id: '3',
        userId: 'user_1',
        type: 'data_export',
        description: 'User exported monthly report',
        timestamp: new Date('2024-01-15T10:30:00Z'),
        metadata: {
          report: 'monthly_analytics',
          format: 'pdf',
          size: '2.4 MB'
        }
      }
    ];

    let filteredActivities = activities;
    
    if (userId) {
      filteredActivities = activities.filter(activity => activity.userId === userId);
    }
    
    if (type) {
      filteredActivities = activities.filter(activity => activity.type === type);
    }

    // Apply date filtering if provided
    if (startDate || endDate) {
      filteredActivities = filteredActivities.filter(activity => {
        const activityDate = new Date(activity.timestamp);
        if (startDate && activityDate < new Date(startDate)) return false;
        if (endDate && activityDate > new Date(endDate)) return false;
        return true;
      });
    }

    res.json({
      success: true,
      data: filteredActivities.slice(0, parseInt(limit)),
      total: filteredActivities.length,
      filters: { userId, type, startDate, endDate, limit }
    });
  } catch (error) {
    logger.error('Error getting user activity:', error);
    res.status(500).json({ error: 'Failed to get user activity' });
  }
});

// ==================== USER FEEDBACK ====================

// Get user feedback
router.get('/feedback', authenticateToken, async (req, res) => {
  try {
    const { type, sentiment, limit = 20 } = req.query;
    
    // Mock user feedback (replace with actual feedback system)
    const feedback = [
      {
        id: '1',
        userId: 'user_1',
        type: 'feature_request',
        sentiment: 'positive',
        title: 'Dark Mode Request',
        content: 'Would love to have a dark mode option for the admin panel.',
        rating: 5,
        category: 'ui',
        status: 'under_review',
        createdAt: new Date('2024-01-15T09:00:00Z'),
        updatedAt: new Date('2024-01-15T14:00:00Z')
      },
      {
        id: '2',
        userId: 'user_2',
        type: 'bug_report',
        sentiment: 'negative',
        title: 'Chart Loading Issue',
        content: 'Analytics charts are not loading properly in Firefox.',
        rating: 2,
        category: 'technical',
        status: 'in_progress',
        createdAt: new Date('2024-01-14T16:00:00Z'),
        updatedAt: new Date('2024-01-15T11:00:00Z')
      },
      {
        id: '3',
        userId: 'user_3',
        type: 'general',
        sentiment: 'positive',
        title: 'Great Product Experience',
        content: 'Really enjoying the new dashboard features. Much more intuitive now.',
        rating: 5,
        category: 'general',
        status: 'acknowledged',
        createdAt: new Date('2024-01-13T12:00:00Z'),
        updatedAt: new Date('2024-01-13T12:00:00Z')
      }
    ];

    let filteredFeedback = feedback;
    
    if (type) {
      filteredFeedback = feedback.filter(item => item.type === type);
    }
    
    if (sentiment) {
      filteredFeedback = feedback.filter(item => item.sentiment === sentiment);
    }

    res.json({
      success: true,
      data: filteredFeedback.slice(0, parseInt(limit)),
      total: filteredFeedback.length,
      filters: { type, sentiment, limit }
    });
  } catch (error) {
    logger.error('Error getting user feedback:', error);
    res.status(500).json({ error: 'Failed to get user feedback' });
  }
});

module.exports = router;
