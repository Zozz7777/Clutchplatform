const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { checkRole, checkPermission } = require('../middleware/rbac');
const { getCollection } = require('../config/optimized-database');
const rateLimit = require('express-rate-limit');

// Rate limiting
const settingsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: 'Too many settings requests from this IP, please try again later.'
});

// Apply rate limiting and authentication to all routes
router.use(settingsLimiter);
router.use(authenticateToken);

// ===== SYSTEM SETTINGS =====

// GET /api/settings - Get all settings
router.get('/', async (req, res) => {
  try {
    const settingsCollection = await getCollection('settings');
    const { category } = req.query;
    
    const filter = {};
    if (category) filter.category = category;
    
    const settings = await settingsCollection
      .find(filter)
      .sort({ category: 1, key: 1 })
      .toArray();
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/settings - Update settings
router.put('/', checkRole(['head_administrator', 'head_administrator']), async (req, res) => {
  try {
    const settingsCollection = await getCollection('settings');
    const { settings } = req.body;
    
    if (!settings || !Array.isArray(settings)) {
      return res.status(400).json({
        success: false,
        message: 'Settings array is required'
      });
    }
    
    const updatePromises = settings.map(setting => {
      return settingsCollection.updateOne(
        { category: setting.category, key: setting.key },
        { 
          $set: {
            value: setting.value,
            updatedBy: req.user.userId,
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );
    });
    
    await Promise.all(updatePromises);
    
    res.json({
      success: true,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/settings/:category - Get settings by category
router.get('/:category', async (req, res) => {
  try {
    const settingsCollection = await getCollection('settings');
    const settings = await settingsCollection
      .find({ category: req.params.category })
      .sort({ key: 1 })
      .toArray();
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching settings by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/settings/:category/:key - Update specific setting
router.put('/:category/:key', checkRole(['head_administrator', 'head_administrator']), async (req, res) => {
  try {
    const settingsCollection = await getCollection('settings');
    const { value } = req.body;
    
    if (value === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Value is required'
      });
    }
    
    const result = await settingsCollection.updateOne(
      { category: req.params.category, key: req.params.key },
      { 
        $set: {
          value,
          updatedBy: req.user.userId,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
    
    res.json({
      success: true,
      message: 'Setting updated successfully'
    });
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update setting',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===== USER PREFERENCES =====

// GET /api/settings/user/preferences - Get user preferences
router.get('/user/preferences', async (req, res) => {
  try {
    const preferencesCollection = await getCollection('user_preferences');
    const preferences = await preferencesCollection.findOne({ userId: req.user.userId });
    
    res.json({
      success: true,
      data: preferences || { userId: req.user.userId, preferences: {} }
    });
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user preferences',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/settings/user/preferences - Update user preferences
router.put('/user/preferences', async (req, res) => {
  try {
    const preferencesCollection = await getCollection('user_preferences');
    const { preferences } = req.body;
    
    if (!preferences) {
      return res.status(400).json({
        success: false,
        message: 'Preferences object is required'
      });
    }
    
    const result = await preferencesCollection.updateOne(
      { userId: req.user.userId },
      { 
        $set: {
          preferences,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
    
    res.json({
      success: true,
      message: 'User preferences updated successfully'
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user preferences',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===== SYSTEM CONFIGURATION =====

// GET /api/settings/system/config - Get system configuration
router.get('/system/config', checkRole(['head_administrator', 'head_administrator']), async (req, res) => {
  try {
    const configCollection = await getCollection('system_config');
    const config = await configCollection.findOne({ type: 'main' });
    
    res.json({
      success: true,
      data: config || { type: 'main', config: {} }
    });
  } catch (error) {
    console.error('Error fetching system configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system configuration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/settings/system/config - Update system configuration
router.put('/system/config', checkRole(['head_administrator', 'head_administrator']), async (req, res) => {
  try {
    const configCollection = await getCollection('system_config');
    const { config } = req.body;
    
    if (!config) {
      return res.status(400).json({
        success: false,
        message: 'Config object is required'
      });
    }
    
    const result = await configCollection.updateOne(
      { type: 'main' },
      { 
        $set: {
          config,
          updatedBy: req.user.userId,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
    
    res.json({
      success: true,
      message: 'System configuration updated successfully'
    });
  } catch (error) {
    console.error('Error updating system configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update system configuration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===== SETTINGS ANALYTICS =====

// GET /api/settings/analytics - Get settings analytics
router.get('/analytics', checkRole(['head_administrator', 'head_administrator']), async (req, res) => {
  try {
    const settingsCollection = await getCollection('settings');
    const preferencesCollection = await getCollection('user_preferences');
    
    const totalSettings = await settingsCollection.countDocuments();
    const totalUserPreferences = await preferencesCollection.countDocuments();
    
    // Get settings by category
    const categoryStats = await settingsCollection.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]).toArray();
    
    res.json({
      success: true,
      data: {
        overview: {
          totalSettings,
          totalUserPreferences
        },
        categoryStats
      }
    });
  } catch (error) {
    console.error('Error fetching settings analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;