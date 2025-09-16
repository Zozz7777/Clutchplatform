/**
 * Feature Flags Routes
 * Complete feature flag management system with A/B testing and geographic rollouts
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { getCollection } = require('../config/optimized-database');
const { rateLimit: createRateLimit } = require('../middleware/rateLimit');
const { ObjectId } = require('mongodb');

// Apply rate limiting
const featureFlagRateLimit = createRateLimit({ windowMs: 60 * 1000, max: 100 });

// ==================== FEATURE FLAG MANAGEMENT ====================

// GET /api/v1/feature-flags - Get all feature flags
router.get('/', authenticateToken, requireRole(['admin', 'developer', 'super_admin']), featureFlagRateLimit, async (req, res) => {
  try {
    const { page = 1, limit = 50, status, environment, search } = req.query;
    const skip = (page - 1) * limit;
    
    const featureFlagsCollection = await getCollection('feature_flags');
    
    // Build query
    const query = {};
    if (status) query.status = status;
    if (environment) query.environment = environment;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { key: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const featureFlags = await featureFlagsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await featureFlagsCollection.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        featureFlags,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Feature flags retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get feature flags error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_FEATURE_FLAGS_FAILED',
      message: 'Failed to retrieve feature flags',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/feature-flags/:id - Get feature flag by ID
router.get('/:id', authenticateToken, requireRole(['admin', 'developer', 'super_admin']), featureFlagRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const featureFlagsCollection = await getCollection('feature_flags');
    
    const featureFlag = await featureFlagsCollection.findOne({ _id: new ObjectId(id) });
    
    if (!featureFlag) {
      return res.status(404).json({
        success: false,
        error: 'FEATURE_FLAG_NOT_FOUND',
        message: 'Feature flag not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: { featureFlag },
      message: 'Feature flag retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get feature flag error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_FEATURE_FLAG_FAILED',
      message: 'Failed to retrieve feature flag',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/feature-flags - Create new feature flag
router.post('/', authenticateToken, requireRole(['admin', 'developer', 'super_admin']), featureFlagRateLimit, async (req, res) => {
  try {
    const {
      name,
      key,
      description,
      environment,
      type,
      defaultValue,
      rolloutPercentage,
      targetUsers,
      targetGroups,
      conditions,
      variants
    } = req.body;
    
    if (!name || !key || !environment || !type) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Name, key, environment, and type are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const featureFlagsCollection = await getCollection('feature_flags');
    
    // Check if feature flag key already exists for this environment
    const existingFlag = await featureFlagsCollection.findOne({ 
      key: key, 
      environment: environment 
    });
    if (existingFlag) {
      return res.status(409).json({
        success: false,
        error: 'FEATURE_FLAG_EXISTS',
        message: 'Feature flag with this key already exists in this environment',
        timestamp: new Date().toISOString()
      });
    }
    
    const newFeatureFlag = {
      name,
      key,
      description: description || null,
      environment,
      type, // boolean, string, number, json
      defaultValue: defaultValue || false,
      rolloutPercentage: rolloutPercentage || 0,
      targetUsers: targetUsers || [],
      targetGroups: targetGroups || [],
      conditions: conditions || [],
      variants: variants || [],
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: req.user.userId
    };
    
    const result = await featureFlagsCollection.insertOne(newFeatureFlag);
    
    res.status(201).json({
      success: true,
      data: { featureFlag: { ...newFeatureFlag, _id: result.insertedId } },
      message: 'Feature flag created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create feature flag error:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_FEATURE_FLAG_FAILED',
      message: 'Failed to create feature flag',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/v1/feature-flags/:id - Update feature flag
router.put('/:id', authenticateToken, requireRole(['admin', 'developer', 'super_admin']), featureFlagRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };
    
    const featureFlagsCollection = await getCollection('feature_flags');
    
    const result = await featureFlagsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'FEATURE_FLAG_NOT_FOUND',
        message: 'Feature flag not found',
        timestamp: new Date().toISOString()
      });
    }
    
    const updatedFeatureFlag = await featureFlagsCollection.findOne({ _id: new ObjectId(id) });
    
    res.json({
      success: true,
      data: { featureFlag: updatedFeatureFlag },
      message: 'Feature flag updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Update feature flag error:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_FEATURE_FLAG_FAILED',
      message: 'Failed to update feature flag',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/feature-flags/:id/toggle - Toggle feature flag
router.post('/:id/toggle', authenticateToken, requireRole(['admin', 'developer', 'super_admin']), featureFlagRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['active', 'inactive', 'draft'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_STATUS',
        message: 'Status must be active, inactive, or draft',
        timestamp: new Date().toISOString()
      });
    }
    
    const featureFlagsCollection = await getCollection('feature_flags');
    
    const result = await featureFlagsCollection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status: status,
          updatedAt: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'FEATURE_FLAG_NOT_FOUND',
        message: 'Feature flag not found',
        timestamp: new Date().toISOString()
      });
    }
    
    const updatedFeatureFlag = await featureFlagsCollection.findOne({ _id: new ObjectId(id) });
    
    res.json({
      success: true,
      data: { featureFlag: updatedFeatureFlag },
      message: 'Feature flag status updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Toggle feature flag error:', error);
    res.status(500).json({
      success: false,
      error: 'TOGGLE_FEATURE_FLAG_FAILED',
      message: 'Failed to toggle feature flag',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== A/B TESTING ====================

// GET /api/v1/feature-flags/:id/ab-tests - Get A/B tests for feature flag
router.get('/:id/ab-tests', authenticateToken, requireRole(['admin', 'developer', 'super_admin']), featureFlagRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const abTestsCollection = await getCollection('ab_tests');
    
    const abTests = await abTestsCollection
      .find({ featureFlagId: new ObjectId(id) })
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json({
      success: true,
      data: { abTests },
      message: 'A/B tests retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get A/B tests error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_AB_TESTS_FAILED',
      message: 'Failed to retrieve A/B tests',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/feature-flags/:id/ab-tests - Create A/B test
router.post('/:id/ab-tests', authenticateToken, requireRole(['admin', 'developer', 'super_admin']), featureFlagRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      variants,
      trafficAllocation,
      startDate,
      endDate,
      successMetrics,
      hypothesis
    } = req.body;
    
    if (!name || !variants || !trafficAllocation) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Name, variants, and traffic allocation are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const abTestsCollection = await getCollection('ab_tests');
    
    const newABTest = {
      featureFlagId: new ObjectId(id),
      name,
      description: description || null,
      variants,
      trafficAllocation,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      successMetrics: successMetrics || [],
      hypothesis: hypothesis || null,
      status: 'draft',
      results: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: req.user.userId
    };
    
    const result = await abTestsCollection.insertOne(newABTest);
    
    res.status(201).json({
      success: true,
      data: { abTest: { ...newABTest, _id: result.insertedId } },
      message: 'A/B test created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create A/B test error:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_AB_TEST_FAILED',
      message: 'Failed to create A/B test',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== GEOGRAPHIC ROLLOUTS ====================

// GET /api/v1/feature-flags/:id/rollouts - Get geographic rollouts
router.get('/:id/rollouts', authenticateToken, requireRole(['admin', 'developer', 'super_admin']), featureFlagRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const rolloutsCollection = await getCollection('feature_rollouts');
    
    const rollouts = await rolloutsCollection
      .find({ featureFlagId: new ObjectId(id) })
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json({
      success: true,
      data: { rollouts },
      message: 'Geographic rollouts retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get rollouts error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_ROLLOUTS_FAILED',
      message: 'Failed to retrieve geographic rollouts',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/feature-flags/:id/rollouts - Create geographic rollout
router.post('/:id/rollouts', authenticateToken, requireRole(['admin', 'developer', 'super_admin']), featureFlagRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      countries,
      regions,
      cities,
      rolloutPercentage,
      startDate,
      endDate
    } = req.body;
    
    if (!name || !countries || !rolloutPercentage) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Name, countries, and rollout percentage are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const rolloutsCollection = await getCollection('feature_rollouts');
    
    const newRollout = {
      featureFlagId: new ObjectId(id),
      name,
      description: description || null,
      countries,
      regions: regions || [],
      cities: cities || [],
      rolloutPercentage: parseFloat(rolloutPercentage),
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      status: 'scheduled',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: req.user.userId
    };
    
    const result = await rolloutsCollection.insertOne(newRollout);
    
    res.status(201).json({
      success: true,
      data: { rollout: { ...newRollout, _id: result.insertedId } },
      message: 'Geographic rollout created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create rollout error:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_ROLLOUT_FAILED',
      message: 'Failed to create geographic rollout',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== FEATURE FLAG EVALUATION ====================

// POST /api/v1/feature-flags/evaluate - Evaluate feature flags for user
router.post('/evaluate', authenticateToken, featureFlagRateLimit, async (req, res) => {
  try {
    const { userId, environment, context } = req.body;
    
    if (!userId || !environment) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'User ID and environment are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const featureFlagsCollection = await getCollection('feature_flags');
    
    // Get active feature flags for the environment
    const featureFlags = await featureFlagsCollection.find({
      environment,
      status: 'active'
    }).toArray();
    
    const evaluations = [];
    
    for (const flag of featureFlags) {
      let shouldEnable = false;
      let value = flag.defaultValue;
      
      // Check rollout percentage
      if (flag.rolloutPercentage > 0) {
        // Simple hash-based rollout (in production, use a proper hash function)
        const hash = (userId + flag.key).split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0);
        const percentage = Math.abs(hash) % 100;
        shouldEnable = percentage < flag.rolloutPercentage;
      }
      
      // Check target users
      if (flag.targetUsers.includes(userId)) {
        shouldEnable = true;
      }
      
      // Check target groups (simplified)
      if (flag.targetGroups.length > 0 && context && context.groups) {
        const hasMatchingGroup = flag.targetGroups.some(group => 
          context.groups.includes(group)
        );
        if (hasMatchingGroup) {
          shouldEnable = true;
        }
      }
      
      // Check conditions
      if (flag.conditions.length > 0 && context) {
        const conditionsMet = flag.conditions.every(condition => {
          // Simplified condition evaluation
          return context[condition.field] === condition.value;
        });
        if (conditionsMet) {
          shouldEnable = true;
        }
      }
      
      if (shouldEnable) {
        // Select variant if available
        if (flag.variants && flag.variants.length > 0) {
          const variantIndex = Math.abs(hash) % flag.variants.length;
          value = flag.variants[variantIndex].value;
        } else {
          value = true;
        }
      }
      
      evaluations.push({
        key: flag.key,
        name: flag.name,
        enabled: shouldEnable,
        value: value,
        type: flag.type
      });
    }
    
    res.json({
      success: true,
      data: {
        userId,
        environment,
        evaluations,
        evaluatedAt: new Date()
      },
      message: 'Feature flags evaluated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Evaluate feature flags error:', error);
    res.status(500).json({
      success: false,
      error: 'EVALUATE_FEATURE_FLAGS_FAILED',
      message: 'Failed to evaluate feature flags',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== FEATURE FLAG ANALYTICS ====================

// GET /api/v1/feature-flags/:id/analytics - Get feature flag analytics
router.get('/:id/analytics', authenticateToken, requireRole(['admin', 'developer', 'super_admin']), featureFlagRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    
    const featureFlagsCollection = await getCollection('feature_flags');
    const featureFlagEventsCollection = await getCollection('feature_flag_events');
    
    // Get feature flag
    const featureFlag = await featureFlagsCollection.findOne({ _id: new ObjectId(id) });
    if (!featureFlag) {
      return res.status(404).json({
        success: false,
        error: 'FEATURE_FLAG_NOT_FOUND',
        message: 'Feature flag not found',
        timestamp: new Date().toISOString()
      });
    }
    
    // Build date query
    const dateQuery = {};
    if (startDate && endDate) {
      dateQuery.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Get events for this feature flag
    const events = await featureFlagEventsCollection.find({
      featureFlagId: new ObjectId(id),
      ...dateQuery
    }).toArray();
    
    // Calculate analytics
    const totalEvents = events.length;
    const enabledEvents = events.filter(e => e.enabled).length;
    const disabledEvents = totalEvents - enabledEvents;
    
    // Group by variant
    const variantStats = {};
    events.forEach(event => {
      const variant = event.variant || 'default';
      if (!variantStats[variant]) {
        variantStats[variant] = { count: 0, enabled: 0 };
      }
      variantStats[variant].count++;
      if (event.enabled) {
        variantStats[variant].enabled++;
      }
    });
    
    // Group by date
    const dailyStats = {};
    events.forEach(event => {
      const date = event.timestamp.toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { total: 0, enabled: 0 };
      }
      dailyStats[date].total++;
      if (event.enabled) {
        dailyStats[date].enabled++;
      }
    });
    
    const analytics = {
      featureFlag: {
        id: featureFlag._id,
        name: featureFlag.name,
        key: featureFlag.key,
        status: featureFlag.status
      },
      overview: {
        totalEvents,
        enabledEvents,
        disabledEvents,
        enableRate: totalEvents > 0 ? Math.round((enabledEvents / totalEvents) * 100) : 0
      },
      variantStats,
      dailyStats,
      period: {
        startDate: startDate || null,
        endDate: endDate || null
      },
      generatedAt: new Date()
    };
    
    res.json({
      success: true,
      data: analytics,
      message: 'Feature flag analytics retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get feature flag analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_FEATURE_FLAG_ANALYTICS_FAILED',
      message: 'Failed to retrieve feature flag analytics',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== GENERIC HANDLERS ====================

// GET /api/v1/feature-flags/analytics/overview - Get feature flags overview analytics
router.get('/analytics/overview', authenticateToken, requireRole(['admin', 'developer', 'super_admin']), featureFlagRateLimit, async (req, res) => {
  try {
    const featureFlagsCollection = await getCollection('feature_flags');
    const abTestsCollection = await getCollection('ab_tests');
    const rolloutsCollection = await getCollection('feature_rollouts');
    
    // Feature flag statistics
    const totalFlags = await featureFlagsCollection.countDocuments();
    const activeFlags = await featureFlagsCollection.countDocuments({ status: 'active' });
    const draftFlags = await featureFlagsCollection.countDocuments({ status: 'draft' });
    
    // Environment distribution
    const environmentStats = await featureFlagsCollection.aggregate([
      { $group: { _id: '$environment', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    // Type distribution
    const typeStats = await featureFlagsCollection.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    // A/B test statistics
    const totalABTests = await abTestsCollection.countDocuments();
    const activeABTests = await abTestsCollection.countDocuments({ status: 'active' });
    
    // Rollout statistics
    const totalRollouts = await rolloutsCollection.countDocuments();
    const activeRollouts = await rolloutsCollection.countDocuments({ status: 'active' });
    
    const overview = {
      featureFlags: {
        total: totalFlags,
        active: activeFlags,
        draft: draftFlags,
        environmentDistribution: environmentStats,
        typeDistribution: typeStats
      },
      abTests: {
        total: totalABTests,
        active: activeABTests
      },
      rollouts: {
        total: totalRollouts,
        active: activeRollouts
      },
      generatedAt: new Date()
    };
    
    res.json({
      success: true,
      data: overview,
      message: 'Feature flags overview analytics retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get feature flags overview analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_FEATURE_FLAGS_OVERVIEW_ANALYTICS_FAILED',
      message: 'Failed to retrieve feature flags overview analytics',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== TOP-LEVEL A/B TESTS ENDPOINTS ====================

// GET /api/v1/ab-tests - Get all A/B tests
router.get('/ab-tests', authenticateToken, requireRole(['admin', 'developer', 'super_admin']), featureFlagRateLimit, async (req, res) => {
  try {
    const { page = 1, limit = 50, status, featureFlagId } = req.query;
    const skip = (page - 1) * limit;
    
    const abTestsCollection = await getCollection('ab_tests');
    
    // Build query
    const query = {};
    if (status) query.status = status;
    if (featureFlagId) query.featureFlagId = featureFlagId;
    
    const abTests = await abTestsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await abTestsCollection.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        abTests,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'A/B tests retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get A/B tests error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_AB_TESTS_FAILED',
      message: 'Failed to retrieve A/B tests',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/ab-tests - Create new A/B test
router.post('/ab-tests', authenticateToken, requireRole(['admin', 'developer', 'super_admin']), featureFlagRateLimit, async (req, res) => {
  try {
    const {
      name,
      description,
      featureFlagId,
      variants,
      trafficAllocation,
      startDate,
      endDate,
      successMetrics
    } = req.body;
    
    if (!name || !featureFlagId || !variants) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Name, feature flag ID, and variants are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const abTestsCollection = await getCollection('ab_tests');
    
    const newABTest = {
      name,
      description: description || null,
      featureFlagId,
      variants,
      trafficAllocation: trafficAllocation || 50,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      successMetrics: successMetrics || [],
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: req.user.userId
    };
    
    const result = await abTestsCollection.insertOne(newABTest);
    
    res.status(201).json({
      success: true,
      data: { abTest: { ...newABTest, _id: result.insertedId } },
      message: 'A/B test created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create A/B test error:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_AB_TEST_FAILED',
      message: 'Failed to create A/B test',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== TOP-LEVEL ROLLOUTS ENDPOINTS ====================

// GET /api/v1/rollouts - Get all rollouts
router.get('/rollouts', authenticateToken, requireRole(['admin', 'developer', 'super_admin']), featureFlagRateLimit, async (req, res) => {
  try {
    const { page = 1, limit = 50, status, featureFlagId } = req.query;
    const skip = (page - 1) * limit;
    
    const rolloutsCollection = await getCollection('feature_rollouts');
    
    // Build query
    const query = {};
    if (status) query.status = status;
    if (featureFlagId) query.featureFlagId = featureFlagId;
    
    const rollouts = await rolloutsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await rolloutsCollection.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        rollouts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Rollouts retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get rollouts error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_ROLLOUTS_FAILED',
      message: 'Failed to retrieve rollouts',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/rollouts - Create new rollout
router.post('/rollouts', authenticateToken, requireRole(['admin', 'developer', 'super_admin']), featureFlagRateLimit, async (req, res) => {
  try {
    const {
      name,
      description,
      featureFlagId,
      targetRegions,
      targetCountries,
      rolloutPercentage,
      startDate,
      endDate
    } = req.body;
    
    if (!name || !featureFlagId) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Name and feature flag ID are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const rolloutsCollection = await getCollection('feature_rollouts');
    
    const newRollout = {
      name,
      description: description || null,
      featureFlagId,
      targetRegions: targetRegions || [],
      targetCountries: targetCountries || [],
      rolloutPercentage: rolloutPercentage || 100,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: req.user.userId
    };
    
    const result = await rolloutsCollection.insertOne(newRollout);
    
    res.status(201).json({
      success: true,
      data: { rollout: { ...newRollout, _id: result.insertedId } },
      message: 'Rollout created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create rollout error:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_ROLLOUT_FAILED',
      message: 'Failed to create rollout',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
