const { logger } = require('../config/logger');

class FeatureFlagsService {
  constructor() {
    this.features = new Map();
    this.userGroups = new Map();
    this.geographicRules = new Map();
    this.initialized = false;
    this.initializeDefaultFeatures();
    this.loadFromDatabase().catch(() => {});
  }

  // Initialize default feature flags
  initializeDefaultFeatures() {
    // Core features
    this.setFeature('ai_recommendations', {
      enabled: true,
      rolloutPercentage: 100,
      userGroups: ['all'],
      regions: ['all'],
      description: 'AI-powered service recommendations'
    });

    this.setFeature('predictive_maintenance', {
      enabled: true,
      rolloutPercentage: 100,
      userGroups: ['all'],
      regions: ['all'],
      description: 'Predictive maintenance alerts'
    });

    this.setFeature('real_time_tracking', {
      enabled: true,
      rolloutPercentage: 100,
      userGroups: ['all'],
      regions: ['all'],
      description: 'Real-time service tracking'
    });

    this.setFeature('advanced_analytics', {
      enabled: true,
      rolloutPercentage: 50,
      userGroups: ['premium', 'enterprise'],
      regions: ['all'],
      description: 'Advanced analytics dashboard'
    });

    this.setFeature('voice_commands', {
      enabled: false,
      rolloutPercentage: 10,
      userGroups: ['beta_testers'],
      regions: ['us', 'uk'],
      description: 'Voice command interface'
    });

    this.setFeature('ar_vehicle_inspection', {
      enabled: false,
      rolloutPercentage: 5,
      userGroups: ['beta_testers'],
      regions: ['us'],
      description: 'AR-powered vehicle inspection'
    });

    this.setFeature('blockchain_service_history', {
      enabled: false,
      rolloutPercentage: 0,
      userGroups: ['none'],
      regions: ['none'],
      description: 'Blockchain-based service history'
    });

    logger.info('✅ Feature flags initialized');
  }

  // Set feature flag
  setFeature(featureName, config) {
    this.features.set(featureName, {
      ...config,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    // Persist to DB
    this.saveFeatureToDatabase(featureName, this.features.get(featureName)).catch(() => {});
  }

  // Get feature flag
  getFeature(featureName) {
    return this.features.get(featureName);
  }

  // Check if feature is enabled for user
  isFeatureEnabled(featureName, user = null, context = {}) {
    const feature = this.getFeature(featureName);
    
    if (!feature) {
      return false;
    }

    if (!feature.enabled) {
      return false;
    }

    // Check user group restrictions
    if (feature.userGroups && feature.userGroups.length > 0) {
      if (!feature.userGroups.includes('all')) {
        if (!user || !this.isUserInGroup(user, feature.userGroups)) {
          return false;
        }
      }
    }

    // Check geographic restrictions
    if (feature.regions && feature.regions.length > 0) {
      if (!feature.regions.includes('all')) {
        const userRegion = context.region || user?.region || 'unknown';
        if (!feature.regions.includes(userRegion)) {
          return false;
        }
      }
    }

    // Check rollout percentage
    if (feature.rolloutPercentage < 100) {
      const userId = user?.id || context.userId || 'anonymous';
      const hash = this.hashUserId(userId);
      const percentage = hash % 100;
      
      if (percentage >= feature.rolloutPercentage) {
        return false;
      }
    }

    return true;
  }

  // Check multiple features
  getEnabledFeatures(user = null, context = {}) {
    const enabledFeatures = [];
    
    for (const [featureName, feature] of this.features) {
      if (this.isFeatureEnabled(featureName, user, context)) {
        enabledFeatures.push({
          name: featureName,
          description: feature.description,
          rolloutPercentage: feature.rolloutPercentage
        });
      }
    }
    
    return enabledFeatures;
  }

  // Update feature flag
  updateFeature(featureName, updates) {
    const feature = this.getFeature(featureName);
    if (!feature) {
      throw new Error(`Feature ${featureName} not found`);
    }

    const updatedFeature = {
      ...feature,
      ...updates,
      updatedAt: new Date()
    };

    this.features.set(featureName, updatedFeature);
    this.saveFeatureToDatabase(featureName, updatedFeature).catch(() => {});
    logger.info(`✅ Feature ${featureName} updated`);
    
    return updatedFeature;
  }

  // Enable feature
  enableFeature(featureName) {
    return this.updateFeature(featureName, { enabled: true });
  }

  // Disable feature
  disableFeature(featureName) {
    return this.updateFeature(featureName, { enabled: false });
  }

  // Set rollout percentage
  setRolloutPercentage(featureName, percentage) {
    if (percentage < 0 || percentage > 100) {
      throw new Error('Rollout percentage must be between 0 and 100');
    }
    
    return this.updateFeature(featureName, { rolloutPercentage: percentage });
  }

  // Add user to group
  addUserToGroup(userId, groupName) {
    if (!this.userGroups.has(groupName)) {
      this.userGroups.set(groupName, new Set());
    }
    
    this.userGroups.get(groupName).add(userId);
    logger.info(`✅ User ${userId} added to group ${groupName}`);
  }

  // Remove user from group
  removeUserFromGroup(userId, groupName) {
    const group = this.userGroups.get(groupName);
    if (group) {
      group.delete(userId);
      logger.info(`✅ User ${userId} removed from group ${groupName}`);
    }
  }

  // Check if user is in group
  isUserInGroup(user, groups) {
    if (!user) return false;
    
    const userId = user.id || user.userId;
    
    for (const group of groups) {
      const userGroup = this.userGroups.get(group);
      if (userGroup && userGroup.has(userId)) {
        return true;
      }
      
      // Check user role-based groups
      if (group === 'premium' && user.role === 'premium') {
        return true;
      }
      
      if (group === 'enterprise' && user.role === 'enterprise') {
        return true;
      }
      
      if (group === 'beta_testers' && user.isBetaTester) {
        return true;
      }
    }
    
    return false;
  }

  // Hash user ID for consistent rollout
  hashUserId(userId) {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Get feature analytics
  getFeatureAnalytics(featureName) {
    const feature = this.getFeature(featureName);
    if (!feature) {
      return null;
    }

    return {
      name: featureName,
      enabled: feature.enabled,
      rolloutPercentage: feature.rolloutPercentage,
      userGroups: feature.userGroups,
      regions: feature.regions,
      createdAt: feature.createdAt,
      updatedAt: feature.updatedAt,
      usage: this.getFeatureUsage(featureName)
    };
  }

  // Get feature usage (mock data)
  getFeatureUsage(featureName) {
    // This would integrate with analytics service
    return {
      totalUsers: Math.floor(Math.random() * 1000) + 100,
      activeUsers: Math.floor(Math.random() * 500) + 50,
      usageRate: Math.random() * 0.8 + 0.2,
      lastUsed: new Date()
    };
  }

  // Emergency rollback
  emergencyRollback(featureName) {
    logger.warn(`🚨 Emergency rollback for feature: ${featureName}`);
    return this.disableFeature(featureName);
  }

  // Bulk feature operations
  bulkUpdateFeatures(updates) {
    const results = [];
    
    for (const [featureName, update] of Object.entries(updates)) {
      try {
        const result = this.updateFeature(featureName, update);
        results.push({ featureName, success: true, result });
      } catch (error) {
        results.push({ featureName, success: false, error: error.message });
      }
    }
    
    return results;
  }

  // Get all features
  getAllFeatures() {
    const features = [];
    
    for (const [name, config] of this.features) {
      features.push({
        name,
        ...config
      });
    }
    
    return features;
  }

  // Export feature configuration
  exportConfiguration() {
    return {
      features: this.getAllFeatures(),
      userGroups: Object.fromEntries(
        Array.from(this.userGroups.entries()).map(([group, users]) => [
          group, 
          Array.from(users)
        ])
      ),
      exportedAt: new Date()
    };
  }

  // Import feature configuration
  importConfiguration(config) {
    if (config.features) {
      for (const feature of config.features) {
        const { name, ...config } = feature;
        this.setFeature(name, config);
      }
    }
    
    if (config.userGroups) {
      for (const [group, users] of Object.entries(config.userGroups)) {
        for (const userId of users) {
          this.addUserToGroup(userId, group);
        }
      }
    }
    
    logger.info('✅ Feature configuration imported');
  }

  async loadFromDatabase() {
    try {
      const { getCollection } = require('../config/database');
      const coll = await getCollection('feature_flags');
      const docs = await coll.find({}).toArray();
      for (const doc of docs) {
        const { name, ...cfg } = doc;
        this.features.set(name, cfg);
      }
      this.initialized = true;
      logger.info('✅ Feature flags loaded from database');
    } catch (err) {
      logger.error('Error loading feature flags from DB:', err.message);
    }
  }

  async saveFeatureToDatabase(name, cfg) {
    try {
      const { getCollection } = require('../config/database');
      const coll = await getCollection('feature_flags');
      await coll.updateOne({ name }, { $set: { name, ...cfg } }, { upsert: true });
    } catch (err) {
      logger.error('Error saving feature flag to DB:', err.message);
    }
  }
}

// Create singleton instance
const featureFlagsService = new FeatureFlagsService();

// Middleware for checking feature flags
const featureFlagMiddleware = (featureName) => {
  return (req, res, next) => {
    const user = req.user;
    const context = {
      region: req.headers['x-user-region'],
      userId: user?.id
    };

    if (!featureFlagsService.isFeatureEnabled(featureName, user, context)) {
      return res.status(404).json({
        success: false,
        error: 'Feature not available',
        feature: featureName
      });
    }

    next();
  };
};

// Middleware for adding feature flags to response
const addFeatureFlagsMiddleware = (req, res, next) => {
  const user = req.user;
  const context = {
    region: req.headers['x-user-region'],
    userId: user?.id
  };

  const enabledFeatures = featureFlagsService.getEnabledFeatures(user, context);
  
  res.locals.featureFlags = enabledFeatures;
  res.locals.isFeatureEnabled = (featureName) => 
    featureFlagsService.isFeatureEnabled(featureName, user, context);

  next();
};

module.exports = {
  featureFlagsService,
  featureFlagMiddleware,
  addFeatureFlagsMiddleware
};
