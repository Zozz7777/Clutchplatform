const express = require('express');
const router = express.Router();
const { featureFlagsService } = require('../middleware/featureFlags');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { logger } = require('../config/logger');

// Apply authentication to all feature flag routes
router.use(authenticateToken);

// Get all feature flags (admin only)
router.get('/', requireRole(['admin', 'cto']), async (req, res) => {
  try {
    const features = featureFlagsService.getAllFeatures();
    
    res.json({
      success: true,
      data: features
    });
  } catch (error) {
    logger.error('❌ Error fetching feature flags:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch feature flags'
    });
  }
});

// Get enabled features for current user
router.get('/enabled', async (req, res) => {
  try {
    const user = req.user;
    const context = {
      region: req.headers['x-user-region'],
      userId: user?.id
    };

    const enabledFeatures = featureFlagsService.getEnabledFeatures(user, context);
    
    res.json({
      success: true,
      data: enabledFeatures
    });
  } catch (error) {
    logger.error('❌ Error fetching enabled features:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch enabled features'
    });
  }
});

// Check if specific feature is enabled
router.get('/check/:featureName', async (req, res) => {
  try {
    const { featureName } = req.params;
    const user = req.user;
    const context = {
      region: req.headers['x-user-region'],
      userId: user?.id
    };

    const isEnabled = featureFlagsService.isFeatureEnabled(featureName, user, context);
    const feature = featureFlagsService.getFeature(featureName);
    
    res.json({
      success: true,
      data: {
        featureName,
        isEnabled,
        feature: feature || null
      }
    });
  } catch (error) {
    logger.error('❌ Error checking feature flag:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check feature flag'
    });
  }
});

// Create new feature flag (admin only)
router.post('/', requireRole(['admin', 'cto']), async (req, res) => {
  try {
    const { name, enabled, rolloutPercentage, userGroups, regions, description } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Feature name is required'
      });
    }

    featureFlagsService.setFeature(name, {
      enabled: enabled || false,
      rolloutPercentage: rolloutPercentage || 0,
      userGroups: userGroups || ['all'],
      regions: regions || ['all'],
      description: description || ''
    });

    logger.info(`✅ Feature flag created: ${name}`);
    
    res.json({
      success: true,
      data: featureFlagsService.getFeature(name)
    });
  } catch (error) {
    logger.error('❌ Error creating feature flag:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create feature flag'
    });
  }
});

// Update feature flag (admin only)
router.put('/:featureName', requireRole(['admin', 'cto']), async (req, res) => {
  try {
    const { featureName } = req.params;
    const updates = req.body;

    const updatedFeature = featureFlagsService.updateFeature(featureName, updates);
    
    res.json({
      success: true,
      data: updatedFeature
    });
  } catch (error) {
    logger.error('❌ Error updating feature flag:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update feature flag'
    });
  }
});

// Enable feature flag (admin only)
router.post('/:featureName/enable', requireRole(['admin', 'cto']), async (req, res) => {
  try {
    const { featureName } = req.params;
    
    const updatedFeature = featureFlagsService.enableFeature(featureName);
    
    res.json({
      success: true,
      data: updatedFeature
    });
  } catch (error) {
    logger.error('❌ Error enabling feature flag:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to enable feature flag'
    });
  }
});

// Disable feature flag (admin only)
router.post('/:featureName/disable', requireRole(['admin', 'cto']), async (req, res) => {
  try {
    const { featureName } = req.params;
    
    const updatedFeature = featureFlagsService.disableFeature(featureName);
    
    res.json({
      success: true,
      data: updatedFeature
    });
  } catch (error) {
    logger.error('❌ Error disabling feature flag:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to disable feature flag'
    });
  }
});

// Set rollout percentage (admin only)
router.post('/:featureName/rollout', requireRole(['admin', 'cto']), async (req, res) => {
  try {
    const { featureName } = req.params;
    const { percentage } = req.body;
    
    if (percentage === undefined || percentage < 0 || percentage > 100) {
      return res.status(400).json({
        success: false,
        error: 'Rollout percentage must be between 0 and 100'
      });
    }

    const updatedFeature = featureFlagsService.setRolloutPercentage(featureName, percentage);
    
    res.json({
      success: true,
      data: updatedFeature
    });
  } catch (error) {
    logger.error('❌ Error setting rollout percentage:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to set rollout percentage'
    });
  }
});

// Emergency rollback (admin only)
router.post('/:featureName/rollback', requireRole(['admin', 'cto']), async (req, res) => {
  try {
    const { featureName } = req.params;
    
    const updatedFeature = featureFlagsService.emergencyRollback(featureName);
    
    res.json({
      success: true,
      data: updatedFeature,
      message: 'Feature rolled back successfully'
    });
  } catch (error) {
    logger.error('❌ Error rolling back feature:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to rollback feature'
    });
  }
});

// Get feature analytics (admin only)
router.get('/:featureName/analytics', requireRole(['admin', 'cto']), async (req, res) => {
  try {
    const { featureName } = req.params;
    
    const analytics = featureFlagsService.getFeatureAnalytics(featureName);
    
    if (!analytics) {
      return res.status(404).json({
        success: false,
        error: 'Feature not found'
      });
    }
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    logger.error('❌ Error fetching feature analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch feature analytics'
    });
  }
});

// Add user to group (admin only)
router.post('/groups/:groupName/users', requireRole(['admin', 'cto']), async (req, res) => {
  try {
    const { groupName } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    featureFlagsService.addUserToGroup(userId, groupName);
    
    res.json({
      success: true,
      message: `User ${userId} added to group ${groupName}`
    });
  } catch (error) {
    logger.error('❌ Error adding user to group:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add user to group'
    });
  }
});

// Remove user from group (admin only)
router.delete('/groups/:groupName/users/:userId', requireRole(['admin', 'cto']), async (req, res) => {
  try {
    const { groupName, userId } = req.params;

    featureFlagsService.removeUserFromGroup(userId, groupName);
    
    res.json({
      success: true,
      message: `User ${userId} removed from group ${groupName}`
    });
  } catch (error) {
    logger.error('❌ Error removing user from group:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove user from group'
    });
  }
});

// Get all user groups (admin only)
router.get('/groups', requireRole(['admin', 'cto']), async (req, res) => {
  try {
    const groups = Array.from(featureFlagsService.userGroups.entries()).map(([groupName, users]) => ({
      name: groupName,
      userCount: users.size,
      users: Array.from(users)
    }));
    
    res.json({
      success: true,
      data: groups
    });
  } catch (error) {
    logger.error('❌ Error fetching user groups:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user groups'
    });
  }
});

// Bulk update features (admin only)
router.post('/bulk-update', requireRole(['admin', 'cto']), async (req, res) => {
  try {
    const { updates } = req.body;
    
    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Updates object is required'
      });
    }

    const results = featureFlagsService.bulkUpdateFeatures(updates);
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    logger.error('❌ Error bulk updating features:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to bulk update features'
    });
  }
});

// Export feature configuration (admin only)
router.get('/export/configuration', requireRole(['admin', 'cto']), async (req, res) => {
  try {
    const configuration = featureFlagsService.exportConfiguration();
    
    res.json({
      success: true,
      data: configuration
    });
  } catch (error) {
    logger.error('❌ Error exporting configuration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export configuration'
    });
  }
});

// Import feature configuration (admin only)
router.post('/import/configuration', requireRole(['admin', 'cto']), async (req, res) => {
  try {
    const { configuration } = req.body;
    
    if (!configuration) {
      return res.status(400).json({
        success: false,
        error: 'Configuration is required'
      });
    }

    featureFlagsService.importConfiguration(configuration);
    
    res.json({
      success: true,
      message: 'Configuration imported successfully'
    });
  } catch (error) {
    logger.error('❌ Error importing configuration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to import configuration'
    });
  }
});

// Get feature flags status (public endpoint)
router.get('/status', async (req, res) => {
  try {
    const user = req.user;
    const context = {
      region: req.headers['x-user-region'],
      userId: user?.id
    };

    const enabledFeatures = featureFlagsService.getEnabledFeatures(user, context);
    const totalFeatures = featureFlagsService.getAllFeatures().length;
    
    res.json({
      success: true,
      data: {
        enabledFeatures: enabledFeatures.length,
        totalFeatures,
        enabledFeaturesList: enabledFeatures.map(f => f.name)
      }
    });
  } catch (error) {
    logger.error('❌ Error fetching feature status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch feature status'
    });
  }
});

// Consolidated feature flags dashboard endpoint - replaces multiple separate calls
router.get('/dashboard', requireRole(['admin', 'cto']), async (req, res) => {
  try {
    console.log('📊 FEATURE_FLAGS_DASHBOARD_REQUEST:', {
      user: req.user.email,
      timestamp: new Date().toISOString()
    });

    // Get feature flags stats
    const allFeatures = featureFlagsService.getAllFeatures();
    const enabledFeatures = allFeatures.filter(f => f.enabled);
    const disabledFeatures = allFeatures.filter(f => !f.enabled);
    const featuresInRollout = allFeatures.filter(f => f.rolloutPercentage > 0 && f.rolloutPercentage < 100);

    const featureStats = {
      total: allFeatures.length,
      enabled: enabledFeatures.length,
      disabled: disabledFeatures.length,
      inRollout: featuresInRollout.length,
      rolloutPercentage: allFeatures.length > 0 ? Math.round((enabledFeatures.length / allFeatures.length) * 100) : 0
    };

    // Get user groups
    const userGroups = Array.from(featureFlagsService.userGroups.entries()).map(([groupName, users]) => ({
      name: groupName,
      userCount: users.size,
      users: Array.from(users)
    }));

    // Get geographic regions (mock data for now)
    const geographicRegions = [
      { name: 'North America', userCount: Math.floor(Math.random() * 1000) + 500, enabledFeatures: Math.floor(Math.random() * 20) + 10 },
      { name: 'Europe', userCount: Math.floor(Math.random() * 800) + 400, enabledFeatures: Math.floor(Math.random() * 18) + 8 },
      { name: 'Asia Pacific', userCount: Math.floor(Math.random() * 600) + 300, enabledFeatures: Math.floor(Math.random() * 15) + 5 },
      { name: 'Middle East', userCount: Math.floor(Math.random() * 200) + 100, enabledFeatures: Math.floor(Math.random() * 12) + 3 },
      { name: 'Africa', userCount: Math.floor(Math.random() * 150) + 50, enabledFeatures: Math.floor(Math.random() * 10) + 2 }
    ];

    // Get recent activity (mock data for now)
    const recentActivity = [
      {
        id: '1',
        type: 'feature_enabled',
        featureName: 'New Dashboard UI',
        user: 'admin@clutch.com',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        details: 'Feature enabled for all users'
      },
      {
        id: '2',
        type: 'rollout_updated',
        featureName: 'AI Recommendations',
        user: 'cto@clutch.com',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        details: 'Rollout percentage increased to 50%'
      },
      {
        id: '3',
        type: 'feature_disabled',
        featureName: 'Beta Analytics',
        user: 'admin@clutch.com',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        details: 'Feature disabled due to performance issues'
      },
      {
        id: '4',
        type: 'group_created',
        featureName: 'Premium Users',
        user: 'admin@clutch.com',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
        details: 'New user group created for premium features'
      },
      {
        id: '5',
        type: 'region_updated',
        featureName: 'Mobile App V2',
        user: 'cto@clutch.com',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
        details: 'Feature enabled for European users'
      }
    ];

    // Get all feature flags
    const featureFlags = allFeatures.map(feature => ({
      id: feature.name,
      name: feature.name,
      enabled: feature.enabled,
      rolloutPercentage: feature.rolloutPercentage,
      userGroups: feature.userGroups || ['all'],
      regions: feature.regions || ['all'],
      description: feature.description || '',
      createdAt: feature.createdAt || new Date().toISOString(),
      updatedAt: feature.updatedAt || new Date().toISOString()
    }));

    const consolidatedData = {
      featureStats,
      userGroups,
      geographicRegions,
      recentActivity,
      featureFlags,
      lastUpdated: new Date().toISOString()
    };

    console.log('✅ FEATURE_FLAGS_DASHBOARD_SUCCESS:', {
      user: req.user.email,
      dataSize: JSON.stringify(consolidatedData).length,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      data: consolidatedData,
      message: 'Feature flags dashboard data retrieved successfully',
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('❌ FEATURE_FLAGS_DASHBOARD_ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve feature flags dashboard data',
      message: error.message,
      timestamp: Date.now()
    });
  }
});

// Individual endpoints for backward compatibility (but these should be avoided)
router.get('/stats', requireRole(['admin', 'cto']), async (req, res) => {
  try {
    const allFeatures = featureFlagsService.getAllFeatures();
    const enabledFeatures = allFeatures.filter(f => f.enabled);
    const disabledFeatures = allFeatures.filter(f => !f.enabled);
    const featuresInRollout = allFeatures.filter(f => f.rolloutPercentage > 0 && f.rolloutPercentage < 100);

    const stats = {
      total: allFeatures.length,
      enabled: enabledFeatures.length,
      disabled: disabledFeatures.length,
      inRollout: featuresInRollout.length,
      rolloutPercentage: allFeatures.length > 0 ? Math.round((enabledFeatures.length / allFeatures.length) * 100) : 0
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve feature flags stats',
      message: error.message
    });
  }
});

router.get('/user-groups', requireRole(['admin', 'cto']), async (req, res) => {
  try {
    const userGroups = Array.from(featureFlagsService.userGroups.entries()).map(([groupName, users]) => ({
      name: groupName,
      userCount: users.size,
      users: Array.from(users)
    }));

    res.json({
      success: true,
      data: userGroups
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user groups',
      message: error.message
    });
  }
});

router.get('/geographic-regions', requireRole(['admin', 'cto']), async (req, res) => {
  try {
    const geographicRegions = [
      { name: 'North America', userCount: Math.floor(Math.random() * 1000) + 500, enabledFeatures: Math.floor(Math.random() * 20) + 10 },
      { name: 'Europe', userCount: Math.floor(Math.random() * 800) + 400, enabledFeatures: Math.floor(Math.random() * 18) + 8 },
      { name: 'Asia Pacific', userCount: Math.floor(Math.random() * 600) + 300, enabledFeatures: Math.floor(Math.random() * 15) + 5 },
      { name: 'Middle East', userCount: Math.floor(Math.random() * 200) + 100, enabledFeatures: Math.floor(Math.random() * 12) + 3 },
      { name: 'Africa', userCount: Math.floor(Math.random() * 150) + 50, enabledFeatures: Math.floor(Math.random() * 10) + 2 }
    ];

    res.json({
      success: true,
      data: geographicRegions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve geographic regions',
      message: error.message
    });
  }
});

router.get('/recent-activity', requireRole(['admin', 'cto']), async (req, res) => {
  try {
    const recentActivity = [
      {
        id: '1',
        type: 'feature_enabled',
        featureName: 'New Dashboard UI',
        user: 'admin@clutch.com',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        details: 'Feature enabled for all users'
      },
      {
        id: '2',
        type: 'rollout_updated',
        featureName: 'AI Recommendations',
        user: 'cto@clutch.com',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        details: 'Rollout percentage increased to 50%'
      },
      {
        id: '3',
        type: 'feature_disabled',
        featureName: 'Beta Analytics',
        user: 'admin@clutch.com',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        details: 'Feature disabled due to performance issues'
      },
      {
        id: '4',
        type: 'group_created',
        featureName: 'Premium Users',
        user: 'admin@clutch.com',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
        details: 'New user group created for premium features'
      },
      {
        id: '5',
        type: 'region_updated',
        featureName: 'Mobile App V2',
        user: 'cto@clutch.com',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
        details: 'Feature enabled for European users'
      }
    ];

    res.json({
      success: true,
      data: recentActivity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve recent activity',
      message: error.message
    });
  }
});

module.exports = router;
