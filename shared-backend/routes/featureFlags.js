const express = require('express');
const router = express.Router();
const { logger } = require('../config/logger');

// Simple feature flags service (in-memory for now)
const featureFlagsService = {
  features: {
    'new-dashboard': { enabled: true, rollout: 100 },
    'advanced-analytics': { enabled: false, rollout: 0 },
    'real-time-notifications': { enabled: true, rollout: 50 },
    'ai-recommendations': { enabled: true, rollout: 25 },
    'mobile-app': { enabled: true, rollout: 100 },
    'beta-features': { enabled: false, rollout: 0 }
  },
  
  getAllFeatures() {
    return this.features;
  },
  
  getEnabledFeatures(user, context) {
    const enabled = {};
    for (const [key, config] of Object.entries(this.features)) {
      if (config.enabled && config.rollout > 0) {
        enabled[key] = config;
      }
    }
    return enabled;
  },
  
  isFeatureEnabled(featureName, user, context) {
    const feature = this.features[featureName];
    if (!feature) return false;
    if (!feature.enabled) return false;
    return feature.rollout > 0;
  },
  
  getFeature(featureName) {
    return this.features[featureName] || null;
  }
};

// Simple authentication middleware (non-blocking)
const simpleAuth = (req, res, next) => {
  // For now, just set a mock user
  req.user = { id: 'test-user', role: 'user' };
  next();
};

// Create new feature flag
router.post('/', simpleAuth, async (req, res) => {
  try {
    const { name, description, isEnabled, rolloutPercentage, targetUsers, conditions } = req.body;
    
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Name and description are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const newFeatureFlag = {
      id: `flag-${Date.now()}`,
      name,
      description,
      isEnabled: isEnabled !== undefined ? isEnabled : false,
      rolloutPercentage: rolloutPercentage || 0,
      targetUsers: targetUsers || [],
      conditions: conditions || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    res.status(201).json({
      success: true,
      data: newFeatureFlag,
      message: 'Feature flag created successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Error creating feature flag:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_FEATURE_FLAG_FAILED',
      message: 'Failed to create feature flag',
      timestamp: new Date().toISOString()
    });
  }
});

// Get all feature flags
router.get('/', simpleAuth, async (req, res) => {
  try {
    const features = featureFlagsService.getAllFeatures();
    
    res.json({
      success: true,
      data: features,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Error fetching feature flags:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch feature flags',
      timestamp: new Date().toISOString()
    });
  }
});

// Get enabled features for current user
router.get('/enabled', simpleAuth, async (req, res) => {
  try {
    const user = req.user;
    const context = {
      region: req.headers['x-user-region'],
      userId: user?.id
    };

    const enabledFeatures = featureFlagsService.getEnabledFeatures(user, context);
    
    res.json({
      success: true,
      data: enabledFeatures,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Error fetching enabled features:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch enabled features',
      timestamp: new Date().toISOString()
    });
  }
});

// Check if specific feature is enabled
router.get('/check/:featureName', simpleAuth, async (req, res) => {
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
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Error checking feature flag:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check feature flag',
      timestamp: new Date().toISOString()
    });
  }
});

// Create new feature flag
router.post('/', simpleAuth, async (req, res) => {
  try {
    const { name, enabled, rolloutPercentage } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Feature name is required',
        timestamp: new Date().toISOString()
      });
    }

    featureFlagsService.features[name] = {
      enabled: enabled || false,
      rollout: rolloutPercentage || 0
    };
    
    res.status(201).json({
      success: true,
      message: 'Feature flag created successfully',
      data: featureFlagsService.features[name],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Error creating feature flag:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create feature flag',
      timestamp: new Date().toISOString()
    });
  }
});

// Update feature flag
router.put('/:featureName', simpleAuth, async (req, res) => {
  try {
    const { featureName } = req.params;
    const { enabled, rolloutPercentage } = req.body;
    
    if (!featureFlagsService.features[featureName]) {
      return res.status(404).json({
        success: false,
        error: 'Feature flag not found',
        timestamp: new Date().toISOString()
      });
    }

    if (enabled !== undefined) {
      featureFlagsService.features[featureName].enabled = enabled;
    }
    if (rolloutPercentage !== undefined) {
      featureFlagsService.features[featureName].rollout = rolloutPercentage;
    }
    
    res.json({
      success: true,
      message: 'Feature flag updated successfully',
      data: featureFlagsService.features[featureName],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Error updating feature flag:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update feature flag',
      timestamp: new Date().toISOString()
    });
  }
});

// Enable feature flag
router.post('/:featureName/enable', simpleAuth, async (req, res) => {
  try {
    const { featureName } = req.params;
    
    if (!featureFlagsService.features[featureName]) {
      return res.status(404).json({
        success: false,
        error: 'Feature flag not found',
        timestamp: new Date().toISOString()
      });
    }

    featureFlagsService.features[featureName].enabled = true;
    
    res.json({
      success: true,
      message: 'Feature flag enabled successfully',
      data: featureFlagsService.features[featureName],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Error enabling feature flag:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to enable feature flag',
      timestamp: new Date().toISOString()
    });
  }
});

// Disable feature flag
router.post('/:featureName/disable', simpleAuth, async (req, res) => {
  try {
    const { featureName } = req.params;
    
    if (!featureFlagsService.features[featureName]) {
      return res.status(404).json({
        success: false,
        error: 'Feature flag not found',
        timestamp: new Date().toISOString()
      });
    }

    featureFlagsService.features[featureName].enabled = false;
    
    res.json({
      success: true,
      message: 'Feature flag disabled successfully',
      data: featureFlagsService.features[featureName],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Error disabling feature flag:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to disable feature flag',
      timestamp: new Date().toISOString()
    });
  }
});

// Rollout feature flag
router.post('/:featureName/rollout', simpleAuth, async (req, res) => {
  try {
    const { featureName } = req.params;
    const { percentage } = req.body;
    
    if (!featureFlagsService.features[featureName]) {
      return res.status(404).json({
        success: false,
        error: 'Feature flag not found',
        timestamp: new Date().toISOString()
      });
    }

    featureFlagsService.features[featureName].rollout = percentage || 0;
    
    res.json({
      success: true,
      message: 'Feature flag rollout updated successfully',
      data: featureFlagsService.features[featureName],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Error updating feature flag rollout:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update feature flag rollout',
      timestamp: new Date().toISOString()
    });
  }
});

// Rollback feature flag
router.post('/:featureName/rollback', simpleAuth, async (req, res) => {
  try {
    const { featureName } = req.params;
    
    if (!featureFlagsService.features[featureName]) {
      return res.status(404).json({
        success: false,
        error: 'Feature flag not found',
        timestamp: new Date().toISOString()
      });
    }

    featureFlagsService.features[featureName].rollout = 0;
    
    res.json({
      success: true,
      message: 'Feature flag rolled back successfully',
      data: featureFlagsService.features[featureName],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Error rolling back feature flag:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to rollback feature flag',
      timestamp: new Date().toISOString()
    });
  }
});

// Get feature flag analytics
router.get('/:featureName/analytics', simpleAuth, async (req, res) => {
  try {
    const { featureName } = req.params;
    
    if (!featureFlagsService.features[featureName]) {
      return res.status(404).json({
        success: false,
        error: 'Feature flag not found',
        timestamp: new Date().toISOString()
      });
    }

    const analytics = {
      featureName,
      enabled: featureFlagsService.features[featureName].enabled,
      rollout: featureFlagsService.features[featureName].rollout,
      usage: Math.floor(Math.random() * 1000), // Mock data
      lastUpdated: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Error fetching feature flag analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch feature flag analytics',
      timestamp: new Date().toISOString()
    });
  }
});

// Add users to feature flag group
router.post('/groups/:groupName/users', simpleAuth, async (req, res) => {
  try {
    const { groupName } = req.params;
    const { userIds } = req.body;
    
    res.json({
      success: true,
      message: `Users added to group ${groupName} successfully`,
      data: { groupName, userIds: userIds || [] },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Error adding users to group:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add users to group',
      timestamp: new Date().toISOString()
    });
  }
});

// Remove user from feature flag group
router.delete('/groups/:groupName/users/:userId', simpleAuth, async (req, res) => {
  try {
    const { groupName, userId } = req.params;
    
    res.json({
      success: true,
      message: `User ${userId} removed from group ${groupName} successfully`,
      data: { groupName, userId },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Error removing user from group:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove user from group',
      timestamp: new Date().toISOString()
    });
  }
});

// Get feature flag groups
router.get('/groups', simpleAuth, async (req, res) => {
  try {
    const groups = [
      { name: 'beta-users', description: 'Beta testing users' },
      { name: 'premium-users', description: 'Premium subscribers' },
      { name: 'enterprise-users', description: 'Enterprise customers' }
    ];
    
    res.json({
      success: true,
      data: groups,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Error fetching feature flag groups:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch feature flag groups',
      timestamp: new Date().toISOString()
    });
  }
});

// Bulk update feature flags
router.post('/bulk-update', simpleAuth, async (req, res) => {
  try {
    const { updates } = req.body;
    
    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({
        success: false,
        error: 'Updates array is required',
        timestamp: new Date().toISOString()
      });
    }

    const results = [];
    for (const update of updates) {
      if (update.name && featureFlagsService.features[update.name]) {
        if (update.enabled !== undefined) {
          featureFlagsService.features[update.name].enabled = update.enabled;
        }
        if (update.rollout !== undefined) {
          featureFlagsService.features[update.name].rollout = update.rollout;
        }
        results.push({ name: update.name, success: true });
      } else {
        results.push({ name: update.name, success: false, error: 'Feature not found' });
      }
    }
    
    res.json({
      success: true,
      message: 'Bulk update completed',
      data: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Error performing bulk update:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform bulk update',
      timestamp: new Date().toISOString()
    });
  }
});

// Export feature flag configuration
router.get('/export/configuration', simpleAuth, async (req, res) => {
  try {
    const config = {
      features: featureFlagsService.features,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };
    
    res.json({
      success: true,
      data: config,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Error exporting configuration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export configuration',
      timestamp: new Date().toISOString()
    });
  }
});

// Import feature flag configuration
router.post('/import/configuration', simpleAuth, async (req, res) => {
  try {
    const { features } = req.body;
    
    if (features && typeof features === 'object') {
      featureFlagsService.features = { ...featureFlagsService.features, ...features };
    }
    
    res.json({
      success: true,
      message: 'Configuration imported successfully',
      data: featureFlagsService.features,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Error importing configuration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to import configuration',
      timestamp: new Date().toISOString()
    });
  }
});

// Get feature flag status
router.get('/status', simpleAuth, async (req, res) => {
  try {
    const status = {
      totalFeatures: Object.keys(featureFlagsService.features).length,
      enabledFeatures: Object.values(featureFlagsService.features).filter(f => f.enabled).length,
      activeRollouts: Object.values(featureFlagsService.features).filter(f => f.rollout > 0).length,
      lastUpdated: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Error fetching feature flag status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch feature flag status',
      timestamp: new Date().toISOString()
    });
  }
});

// Get feature flag dashboard
router.get('/dashboard', simpleAuth, async (req, res) => {
  try {
    const dashboard = {
      overview: {
        totalFeatures: Object.keys(featureFlagsService.features).length,
        enabledFeatures: Object.values(featureFlagsService.features).filter(f => f.enabled).length,
        activeRollouts: Object.values(featureFlagsService.features).filter(f => f.rollout > 0).length
      },
      features: featureFlagsService.features,
      recentActivity: [
        { action: 'Feature enabled', feature: 'new-dashboard', timestamp: new Date().toISOString() },
        { action: 'Rollout updated', feature: 'ai-recommendations', timestamp: new Date().toISOString() }
      ]
    };
    
    res.json({
      success: true,
      data: dashboard,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Error fetching feature flag dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch feature flag dashboard',
      timestamp: new Date().toISOString()
    });
  }
});

// Get feature flag statistics
router.get('/stats', simpleAuth, async (req, res) => {
  try {
    const stats = {
      totalFeatures: Object.keys(featureFlagsService.features).length,
      enabledFeatures: Object.values(featureFlagsService.features).filter(f => f.enabled).length,
      disabledFeatures: Object.values(featureFlagsService.features).filter(f => !f.enabled).length,
      activeRollouts: Object.values(featureFlagsService.features).filter(f => f.rollout > 0).length,
      averageRollout: Object.values(featureFlagsService.features).reduce((sum, f) => sum + f.rollout, 0) / Object.keys(featureFlagsService.features).length
    };
    
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Error fetching feature flag statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch feature flag statistics',
      timestamp: new Date().toISOString()
    });
  }
});

// Get user groups
router.get('/user-groups', simpleAuth, async (req, res) => {
  try {
    const userGroups = [
      { id: 'beta-users', name: 'Beta Users', description: 'Users participating in beta testing' },
      { id: 'premium-users', name: 'Premium Users', description: 'Premium subscribers' },
      { id: 'enterprise-users', name: 'Enterprise Users', description: 'Enterprise customers' }
    ];
    
    res.json({
      success: true,
      data: userGroups,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Error fetching user groups:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user groups',
      timestamp: new Date().toISOString()
    });
  }
});

// Get geographic regions
router.get('/geographic-regions', simpleAuth, async (req, res) => {
  try {
    const regions = [
      { id: 'us-east', name: 'US East', description: 'United States East Coast' },
      { id: 'us-west', name: 'US West', description: 'United States West Coast' },
      { id: 'europe', name: 'Europe', description: 'European Union' },
      { id: 'asia', name: 'Asia', description: 'Asia Pacific' }
    ];
    
    res.json({
      success: true,
      data: regions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Error fetching geographic regions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch geographic regions',
      timestamp: new Date().toISOString()
    });
  }
});

// Get recent activity
router.get('/recent-activity', simpleAuth, async (req, res) => {
  try {
    const activity = [
      { action: 'Feature enabled', feature: 'new-dashboard', user: 'admin', timestamp: new Date().toISOString() },
      { action: 'Rollout updated', feature: 'ai-recommendations', user: 'admin', timestamp: new Date().toISOString() },
      { action: 'Feature disabled', feature: 'beta-features', user: 'admin', timestamp: new Date().toISOString() }
    ];
    
    res.json({
      success: true,
      data: activity,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Error fetching recent activity:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent activity',
      timestamp: new Date().toISOString()
    });
  }
});


// Generic handlers for all HTTP methods
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: `${'featureFlags'} service is running`,
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: '/'
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).json({
    success: true,
    message: `${'featureFlags'} item retrieved`,
    data: { id: id, name: `Item ${id}`, status: 'active' },
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: `/${id}`
  });
});

router.post('/', (req, res) => {
  res.status(201).json({
    success: true,
    message: `${'featureFlags'} item created`,
    data: { id: Date.now(), ...req.body, createdAt: new Date().toISOString() },
    timestamp: new Date().toISOString(),
    method: 'POST',
    path: '/'
  });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).json({
    success: true,
    message: `${'featureFlags'} item updated`,
    data: { id: id, ...req.body, updatedAt: new Date().toISOString() },
    timestamp: new Date().toISOString(),
    method: 'PUT',
    path: `/${id}`
  });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).json({
    success: true,
    message: `${'featureFlags'} item deleted`,
    data: { id: id, deletedAt: new Date().toISOString() },
    timestamp: new Date().toISOString(),
    method: 'DELETE',
    path: `/${id}`
  });
});

router.get('/search', (req, res) => {
  res.status(200).json({
    success: true,
    message: `${'featureFlags'} search results`,
    data: { query: req.query.q || '', results: [], total: 0 },
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: '/search'
  });
});

module.exports = router;