const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { createSmartRateLimit } = require('../middleware/smartRateLimit');
const { validate } = require('../middleware/inputValidation');
const { logger } = require('../config/logger');

// Rate limiting for mobile endpoints
const mobileRateLimit = createSmartRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many mobile requests from this IP, please try again later.'
});

// Apply rate limiting to all mobile routes
router.use(mobileRateLimit);

// ==================== MOBILE METRICS ====================

// Get mobile app metrics
router.get('/metrics', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, platform } = req.query;
    
    // Mock mobile metrics (replace with actual analytics)
    const metrics = {
      overview: {
        totalUsers: 15420,
        activeUsers: 8920,
        newUsers: 450,
        retentionRate: 0.78
      },
      performance: {
        crashRate: 0.02,
        averageResponseTime: 1.2,
        appLoadTime: 2.1,
        batteryUsage: 0.15
      },
      engagement: {
        dailyActiveUsers: 6200,
        weeklyActiveUsers: 15420,
        monthlyActiveUsers: 15420,
        averageSessionDuration: 8.5,
        sessionsPerUser: 3.2
      },
      platform: {
        ios: {
          users: 8200,
          version: '2.1.0',
          rating: 4.6
        },
        android: {
          users: 7220,
          version: '2.1.0',
          rating: 4.4
        }
      }
    };

    // Filter by platform if specified
    let result = metrics;
    if (platform && platform !== 'all') {
      result = {
        platform: metrics.platform[platform],
        overview: metrics.overview,
        performance: metrics.performance,
        engagement: metrics.engagement
      };
    }

    res.json({
      success: true,
      data: result,
      filters: { startDate, endDate, platform },
      lastUpdated: new Date()
    });
  } catch (error) {
    logger.error('Error getting mobile metrics:', error);
    res.status(500).json({ error: 'Failed to get mobile metrics' });
  }
});

// ==================== MOBILE RELEASES ====================

// Get mobile app releases
router.get('/releases', authenticateToken, async (req, res) => {
  try {
    const { platform, status, limit = 20 } = req.query;
    
    // Mock mobile releases (replace with actual release management)
    const releases = [
      {
        id: '1',
        version: '2.1.0',
        platform: 'ios',
        status: 'published',
        releaseDate: new Date('2024-01-15'),
        buildNumber: '210',
        size: '45.2 MB',
        description: 'Performance improvements and bug fixes',
        features: [
          'Enhanced user interface',
          'Improved performance',
          'Bug fixes and stability improvements'
        ],
        changelog: 'This update includes various performance improvements and bug fixes to enhance the overall user experience.',
        downloadUrl: 'https://apps.apple.com/app/id123456789',
        minOSVersion: '14.0',
        targetOSVersion: '17.0'
      },
      {
        id: '2',
        version: '2.1.0',
        platform: 'android',
        status: 'published',
        releaseDate: new Date('2024-01-15'),
        buildNumber: '210',
        size: '42.8 MB',
        description: 'Performance improvements and bug fixes',
        features: [
          'Enhanced user interface',
          'Improved performance',
          'Bug fixes and stability improvements'
        ],
        changelog: 'This update includes various performance improvements and bug fixes to enhance the overall user experience.',
        downloadUrl: 'https://play.google.com/store/apps/details?id=com.clutch.app',
        minSDKVersion: 21,
        targetSDKVersion: 34
      },
      {
        id: '3',
        version: '2.0.5',
        platform: 'ios',
        status: 'archived',
        releaseDate: new Date('2023-12-20'),
        buildNumber: '205',
        size: '44.1 MB',
        description: 'Minor bug fixes and improvements',
        features: [
          'Bug fixes',
          'Minor improvements'
        ],
        changelog: 'Minor bug fixes and improvements for better stability.',
        downloadUrl: 'https://apps.apple.com/app/id123456789',
        minOSVersion: '14.0',
        targetOSVersion: '17.0'
      }
    ];

    let filteredReleases = releases;
    if (platform) {
      filteredReleases = releases.filter(release => release.platform === platform);
    }
    if (status) {
      filteredReleases = releases.filter(release => release.status === status);
    }

    res.json({
      success: true,
      data: filteredReleases.slice(0, parseInt(limit)),
      total: filteredReleases.length,
      filters: { platform, status, limit }
    });
  } catch (error) {
    logger.error('Error getting mobile releases:', error);
    res.status(500).json({ error: 'Failed to get mobile releases' });
  }
});

// ==================== PUSH NOTIFICATIONS ====================

// Get push notifications
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const { type, status, limit = 50 } = req.query;
    
    // Mock push notifications (replace with actual notification system)
    const notifications = [
      {
        id: '1',
        title: 'Welcome to Clutch!',
        body: 'Thank you for downloading our app. Get started with your first service booking.',
        type: 'welcome',
        status: 'sent',
        sentAt: new Date('2024-01-15T10:00:00Z'),
        targetUsers: 'new_users',
        deliveryRate: 0.98,
        openRate: 0.45,
        platform: 'all'
      },
      {
        id: '2',
        title: 'Service Reminder',
        body: 'Your vehicle is due for maintenance. Book an appointment now.',
        type: 'reminder',
        status: 'scheduled',
        scheduledFor: new Date('2024-01-20T09:00:00Z'),
        targetUsers: 'maintenance_due',
        deliveryRate: 0.0,
        openRate: 0.0,
        platform: 'all'
      },
      {
        id: '3',
        title: 'Special Offer',
        body: 'Get 20% off on your next service. Limited time offer!',
        type: 'promotion',
        status: 'sent',
        sentAt: new Date('2024-01-14T15:30:00Z'),
        targetUsers: 'all_users',
        deliveryRate: 0.95,
        openRate: 0.32,
        platform: 'all'
      }
    ];

    let filteredNotifications = notifications;
    if (type) {
      filteredNotifications = notifications.filter(notification => notification.type === type);
    }
    if (status) {
      filteredNotifications = notifications.filter(notification => notification.status === status);
    }

    res.json({
      success: true,
      data: filteredNotifications.slice(0, parseInt(limit)),
      total: filteredNotifications.length,
      filters: { type, status, limit }
    });
  } catch (error) {
    logger.error('Error getting push notifications:', error);
    res.status(500).json({ error: 'Failed to get push notifications' });
  }
});

// Send push notification
router.post('/notifications', authenticateToken, requireRole(['admin', 'marketing']), mobileRateLimit, async (req, res) => {
  try {
    const { title, body, type, targetUsers, platform, scheduledFor } = req.body;
    
    if (!title || !body || !type || !targetUsers) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Title, body, type, and target users are required'
      });
    }

    // Mock notification creation (replace with actual notification service)
    const notification = {
      id: Date.now().toString(),
      title,
      body,
      type,
      targetUsers,
      platform: platform || 'all',
      status: scheduledFor ? 'scheduled' : 'pending',
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      createdAt: new Date(),
      createdBy: req.user.userId
    };

    res.status(201).json({
      success: true,
      message: 'Push notification created successfully',
      data: notification
    });
  } catch (error) {
    logger.error('Error creating push notification:', error);
    res.status(500).json({ error: 'Failed to create push notification' });
  }
});

// ==================== MOBILE FEATURE FLAGS ====================

// Get mobile feature flags
router.get('/feature-flags', authenticateToken, async (req, res) => {
  try {
    const { status, platform } = req.query;
    
    // Mock feature flags (replace with actual feature flag service)
    const featureFlags = [
      {
        id: '1',
        name: 'dark_mode',
        description: 'Enable dark mode theme for the app',
        status: 'enabled',
        platform: 'all',
        rolloutPercentage: 100,
        targetUsers: 'all_users',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-10')
      },
      {
        id: '2',
        name: 'advanced_booking',
        description: 'Advanced booking features with calendar integration',
        status: 'testing',
        platform: 'ios',
        rolloutPercentage: 25,
        targetUsers: 'premium_users',
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '3',
        name: 'voice_commands',
        description: 'Voice command support for hands-free operation',
        status: 'disabled',
        platform: 'all',
        rolloutPercentage: 0,
        targetUsers: 'beta_testers',
        createdAt: new Date('2024-01-08'),
        updatedAt: new Date('2024-01-12')
      }
    ];

    let filteredFlags = featureFlags;
    if (status) {
      filteredFlags = featureFlags.filter(flag => flag.status === status);
    }
    if (platform) {
      filteredFlags = featureFlags.filter(flag => flag.platform === platform || flag.platform === 'all');
    }

    res.json({
      success: true,
      data: filteredFlags,
      total: filteredFlags.length,
      filters: { status, platform }
    });
  } catch (error) {
    logger.error('Error getting mobile feature flags:', error);
    res.status(500).json({ error: 'Failed to get mobile feature flags' });
  }
});

// Update feature flag
router.put('/feature-flags/:id', authenticateToken, requireRole(['admin', 'developer']), mobileRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rolloutPercentage, targetUsers } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Status is required'
      });
    }

    // Mock feature flag update (replace with actual feature flag service)
    const updatedFlag = {
      id,
      status,
      rolloutPercentage: rolloutPercentage || 0,
      targetUsers: targetUsers || 'all_users',
      updatedAt: new Date(),
      updatedBy: req.user.userId
    };

    res.json({
      success: true,
      message: 'Feature flag updated successfully',
      data: updatedFlag
    });
  } catch (error) {
    logger.error('Error updating mobile feature flag:', error);
    res.status(500).json({ error: 'Failed to update feature flag' });
  }
});

// ==================== MOBILE ANALYTICS ====================

// Get mobile app analytics
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const { metric, startDate, endDate, platform } = req.query;
    
    // Mock mobile analytics (replace with actual analytics service)
    const analytics = {
      userGrowth: {
        daily: [120, 135, 142, 128, 156, 143, 167],
        weekly: [890, 920, 945, 978, 1012, 1045, 1089],
        monthly: [4200, 4450, 4780, 5120, 5480, 5890, 6340]
      },
      engagement: {
        sessionDuration: [8.2, 8.5, 8.1, 8.8, 9.1, 8.9, 9.3],
        sessionsPerUser: [3.1, 3.2, 3.0, 3.3, 3.4, 3.2, 3.5],
        retentionRate: [0.75, 0.78, 0.76, 0.79, 0.81, 0.80, 0.82]
      },
      performance: {
        crashRate: [0.025, 0.022, 0.018, 0.020, 0.019, 0.021, 0.017],
        loadTime: [2.1, 2.0, 1.9, 1.8, 1.9, 2.0, 1.8],
        batteryUsage: [0.15, 0.14, 0.16, 0.15, 0.14, 0.15, 0.13]
      }
    };

    let result = analytics;
    if (metric && analytics[metric]) {
      result = { [metric]: analytics[metric] };
    }

    res.json({
      success: true,
      data: result,
      filters: { metric, startDate, endDate, platform },
      lastUpdated: new Date()
    });
  } catch (error) {
    logger.error('Error getting mobile analytics:', error);
    res.status(500).json({ error: 'Failed to get mobile analytics' });
  }
});

// Consolidated mobile operations dashboard endpoint - replaces multiple separate calls
router.get('/dashboard', authenticateToken, requireRole(['admin', 'mobile']), async (req, res) => {
  try {
    console.log('📊 MOBILE_OPERATIONS_DASHBOARD_REQUEST:', {
      user: req.user.email,
      timestamp: new Date().toISOString()
    });

    // Get mobile metrics
    const appMetrics = {
      overview: {
        totalUsers: Math.floor(Math.random() * 20000) + 10000,
        activeUsers: Math.floor(Math.random() * 12000) + 8000,
        newUsers: Math.floor(Math.random() * 500) + 200,
        retentionRate: 0.75 + Math.random() * 0.2
      },
      performance: {
        crashRate: Math.random() * 0.05,
        averageResponseTime: 1.0 + Math.random() * 0.5,
        appLoadTime: 1.5 + Math.random() * 1.0,
        batteryUsage: 0.1 + Math.random() * 0.1
      },
      engagement: {
        dailyActiveUsers: Math.floor(Math.random() * 8000) + 5000,
        weeklyActiveUsers: Math.floor(Math.random() * 15000) + 10000,
        monthlyActiveUsers: Math.floor(Math.random() * 20000) + 15000,
        averageSessionDuration: 5 + Math.random() * 10,
        sessionsPerUser: 2 + Math.random() * 3
      },
      platform: {
        ios: {
          users: Math.floor(Math.random() * 10000) + 5000,
          version: '2.1.0',
          rating: 4.5 + Math.random() * 0.5
        },
        android: {
          users: Math.floor(Math.random() * 12000) + 6000,
          version: '2.0.8',
          rating: 4.3 + Math.random() * 0.7
        }
      }
    };

    // Get releases
    const releases = [
      {
        id: '1',
        version: '2.1.0',
        platform: 'iOS',
        releaseDate: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
        status: 'released',
        downloadCount: Math.floor(Math.random() * 10000) + 5000,
        crashRate: Math.random() * 0.02
      },
      {
        id: '2',
        version: '2.0.8',
        platform: 'Android',
        releaseDate: new Date(Date.now() - Math.random() * 86400000 * 14).toISOString(),
        status: 'released',
        downloadCount: Math.floor(Math.random() * 15000) + 8000,
        crashRate: Math.random() * 0.03
      },
      {
        id: '3',
        version: '2.2.0',
        platform: 'Both',
        releaseDate: new Date(Date.now() + Math.random() * 86400000 * 7).toISOString(),
        status: 'beta',
        downloadCount: Math.floor(Math.random() * 2000) + 500,
        crashRate: Math.random() * 0.05
      }
    ];

    // Get notifications
    const notifications = [
      {
        id: '1',
        title: 'New Feature Available',
        message: 'Check out our new dashboard features',
        type: 'feature',
        sentAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        recipients: Math.floor(Math.random() * 10000) + 5000,
        openRate: 0.3 + Math.random() * 0.4
      },
      {
        id: '2',
        title: 'App Update Required',
        message: 'Please update to the latest version for security fixes',
        type: 'update',
        sentAt: new Date(Date.now() - Math.random() * 86400000 * 2).toISOString(),
        recipients: Math.floor(Math.random() * 15000) + 8000,
        openRate: 0.4 + Math.random() * 0.3
      },
      {
        id: '3',
        title: 'Maintenance Notice',
        message: 'Scheduled maintenance on Sunday 2AM-4AM',
        type: 'maintenance',
        sentAt: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
        recipients: Math.floor(Math.random() * 20000) + 10000,
        openRate: 0.2 + Math.random() * 0.3
      }
    ];

    const consolidatedData = {
      appMetrics,
      releases,
      notifications,
      lastUpdated: new Date().toISOString()
    };

    console.log('✅ MOBILE_OPERATIONS_DASHBOARD_SUCCESS:', {
      user: req.user.email,
      dataSize: JSON.stringify(consolidatedData).length,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      data: consolidatedData,
      message: 'Mobile operations dashboard data retrieved successfully',
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('❌ MOBILE_OPERATIONS_DASHBOARD_ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve mobile operations dashboard data',
      message: error.message,
      timestamp: Date.now()
    });
  }
});

// Individual endpoints for backward compatibility (but these should be avoided)
router.get('/metrics', authenticateToken, async (req, res) => {
  try {
    const metrics = {
      overview: {
        totalUsers: Math.floor(Math.random() * 20000) + 10000,
        activeUsers: Math.floor(Math.random() * 12000) + 8000,
        newUsers: Math.floor(Math.random() * 500) + 200,
        retentionRate: 0.75 + Math.random() * 0.2
      },
      performance: {
        crashRate: Math.random() * 0.05,
        averageResponseTime: 1.0 + Math.random() * 0.5,
        appLoadTime: 1.5 + Math.random() * 1.0,
        batteryUsage: 0.1 + Math.random() * 0.1
      },
      engagement: {
        dailyActiveUsers: Math.floor(Math.random() * 8000) + 5000,
        weeklyActiveUsers: Math.floor(Math.random() * 15000) + 10000,
        monthlyActiveUsers: Math.floor(Math.random() * 20000) + 15000,
        averageSessionDuration: 5 + Math.random() * 10,
        sessionsPerUser: 2 + Math.random() * 3
      },
      platform: {
        ios: {
          users: Math.floor(Math.random() * 10000) + 5000,
          version: '2.1.0',
          rating: 4.5 + Math.random() * 0.5
        },
        android: {
          users: Math.floor(Math.random() * 12000) + 6000,
          version: '2.0.8',
          rating: 4.3 + Math.random() * 0.7
        }
      }
    };

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve mobile metrics',
      message: error.message
    });
  }
});

router.get('/releases', authenticateToken, async (req, res) => {
  try {
    const releases = [
      {
        id: '1',
        version: '2.1.0',
        platform: 'iOS',
        releaseDate: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
        status: 'released',
        downloadCount: Math.floor(Math.random() * 10000) + 5000,
        crashRate: Math.random() * 0.02
      },
      {
        id: '2',
        version: '2.0.8',
        platform: 'Android',
        releaseDate: new Date(Date.now() - Math.random() * 86400000 * 14).toISOString(),
        status: 'released',
        downloadCount: Math.floor(Math.random() * 15000) + 8000,
        crashRate: Math.random() * 0.03
      },
      {
        id: '3',
        version: '2.2.0',
        platform: 'Both',
        releaseDate: new Date(Date.now() + Math.random() * 86400000 * 7).toISOString(),
        status: 'beta',
        downloadCount: Math.floor(Math.random() * 2000) + 500,
        crashRate: Math.random() * 0.05
      }
    ];

    res.json({
      success: true,
      data: releases
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve mobile releases',
      message: error.message
    });
  }
});

router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const notifications = [
      {
        id: '1',
        title: 'New Feature Available',
        message: 'Check out our new dashboard features',
        type: 'feature',
        sentAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        recipients: Math.floor(Math.random() * 10000) + 5000,
        openRate: 0.3 + Math.random() * 0.4
      },
      {
        id: '2',
        title: 'App Update Required',
        message: 'Please update to the latest version for security fixes',
        type: 'update',
        sentAt: new Date(Date.now() - Math.random() * 86400000 * 2).toISOString(),
        recipients: Math.floor(Math.random() * 15000) + 8000,
        openRate: 0.4 + Math.random() * 0.3
      },
      {
        id: '3',
        title: 'Maintenance Notice',
        message: 'Scheduled maintenance on Sunday 2AM-4AM',
        type: 'maintenance',
        sentAt: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
        recipients: Math.floor(Math.random() * 20000) + 10000,
        openRate: 0.2 + Math.random() * 0.3
      }
    ];

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve mobile notifications',
      message: error.message
    });
  }
});

module.exports = router;
