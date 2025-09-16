/**
 * Settings Management Routes
 * Complete settings system with configuration management and system preferences
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { getCollection } = require('../config/optimized-database');
const { rateLimit: createRateLimit } = require('../middleware/rateLimit');
const { ObjectId } = require('mongodb');

// Apply rate limiting
const settingsRateLimit = createRateLimit({ windowMs: 60 * 1000, max: 50 });

// ==================== SYSTEM SETTINGS ====================

// GET /api/settings - Get all settings
router.get('/', authenticateToken, requireRole(['admin', 'super_admin']), settingsRateLimit, async (req, res) => {
  try {
    const { category, key } = req.query;
    
    const settingsCollection = await getCollection('settings');
    
    // Build query
    const query = {};
    if (category) query.category = category;
    if (key) query.key = key;
    
    const settings = await settingsCollection
      .find(query)
      .sort({ category: 1, key: 1 })
      .toArray();
    
    // Group settings by category
    const groupedSettings = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = {};
      }
      acc[setting.category][setting.key] = setting.value;
      return acc;
    }, {});
    
    res.json({
      success: true,
      data: { settings: groupedSettings },
      message: 'Settings retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_SETTINGS_FAILED',
      message: 'Failed to retrieve settings',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/settings/:category - Get settings by category
router.get('/:category', authenticateToken, requireRole(['admin', 'super_admin']), settingsRateLimit, async (req, res) => {
  try {
    const { category } = req.params;
    
    const settingsCollection = await getCollection('settings');
    
    const settings = await settingsCollection
      .find({ category })
      .sort({ key: 1 })
      .toArray();
    
    // Convert to key-value object
    const settingsObject = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
    
    res.json({
      success: true,
      data: { settings: settingsObject },
      message: `Settings for category '${category}' retrieved successfully`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get settings by category error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_SETTINGS_CATEGORY_FAILED',
      message: 'Failed to retrieve settings by category',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/settings - Update settings
router.put('/', authenticateToken, requireRole(['admin', 'super_admin']), settingsRateLimit, async (req, res) => {
  try {
    const { settings } = req.body;
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Settings object is required',
        timestamp: new Date().toISOString()
      });
    }
    
    const settingsCollection = await getCollection('settings');
    const updatedSettings = [];
    
    // Update each setting
    for (const [category, categorySettings] of Object.entries(settings)) {
      if (typeof categorySettings === 'object') {
        for (const [key, value] of Object.entries(categorySettings)) {
          const result = await settingsCollection.updateOne(
            { category, key },
            {
              $set: {
                value,
                updatedAt: new Date(),
                updatedBy: req.user.userId
              }
            },
            { upsert: true }
          );
          
          updatedSettings.push({ category, key, value });
        }
      }
    }
    
    res.json({
      success: true,
      data: { updatedSettings },
      message: 'Settings updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_SETTINGS_FAILED',
      message: 'Failed to update settings',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/settings/:category/:key - Update specific setting
router.put('/:category/:key', authenticateToken, requireRole(['admin', 'super_admin']), settingsRateLimit, async (req, res) => {
  try {
    const { category, key } = req.params;
    const { value, description } = req.body;
    
    if (value === undefined) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Setting value is required',
        timestamp: new Date().toISOString()
      });
    }
    
    const settingsCollection = await getCollection('settings');
    
    const updateData = {
      value,
      updatedAt: new Date(),
      updatedBy: req.user.userId
    };
    
    if (description !== undefined) {
      updateData.description = description;
    }
    
    const result = await settingsCollection.updateOne(
      { category, key },
      { $set: updateData },
      { upsert: true }
    );
    
    res.json({
      success: true,
      data: { category, key, value },
      message: 'Setting updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_SETTING_FAILED',
      message: 'Failed to update setting',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== USER PREFERENCES ====================

// GET /api/settings/user/preferences - Get user preferences
router.get('/user/preferences', authenticateToken, requireRole(['admin', 'user', 'super_admin']), settingsRateLimit, async (req, res) => {
  try {
    const preferencesCollection = await getCollection('user_preferences');
    
    const preferences = await preferencesCollection.findOne({ userId: req.user.userId });
    
    res.json({
      success: true,
      data: { preferences: preferences?.preferences || {} },
      message: 'User preferences retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get user preferences error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_USER_PREFERENCES_FAILED',
      message: 'Failed to retrieve user preferences',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/settings/user/preferences - Update user preferences
router.put('/user/preferences', authenticateToken, requireRole(['admin', 'user', 'super_admin']), settingsRateLimit, async (req, res) => {
  try {
    const { preferences } = req.body;
    
    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Preferences object is required',
        timestamp: new Date().toISOString()
      });
    }
    
    const preferencesCollection = await getCollection('user_preferences');
    
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
      data: { preferences },
      message: 'User preferences updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Update user preferences error:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_USER_PREFERENCES_FAILED',
      message: 'Failed to update user preferences',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== SYSTEM CONFIGURATION ====================

// GET /api/settings/system/config - Get system configuration
router.get('/system/config', authenticateToken, requireRole(['admin', 'super_admin']), settingsRateLimit, async (req, res) => {
  try {
    const config = {
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      features: {
        chat: true,
        notifications: true,
        analytics: true,
        reporting: true,
        integrations: true
      },
      limits: {
        maxFileSize: '10MB',
        maxUsers: 1000,
        maxProjects: 100,
        maxStorage: '1GB'
      },
      integrations: {
        email: !!process.env.EMAIL_SERVICE,
        sms: !!process.env.SMS_SERVICE,
        webhook: !!process.env.WEBHOOK_URL
      }
    };
    
    res.json({
      success: true,
      data: { config },
      message: 'System configuration retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get system config error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_SYSTEM_CONFIG_FAILED',
      message: 'Failed to retrieve system configuration',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== SETTINGS ANALYTICS ====================

// GET /api/settings/analytics - Get settings analytics
router.get('/analytics', authenticateToken, requireRole(['admin', 'super_admin']), settingsRateLimit, async (req, res) => {
  try {
    const settingsCollection = await getCollection('settings');
    const preferencesCollection = await getCollection('user_preferences');
    
    // Settings statistics
    const totalSettings = await settingsCollection.countDocuments();
    const settingsByCategory = await settingsCollection.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    // User preferences statistics
    const totalUsersWithPreferences = await preferencesCollection.countDocuments();
    
    const analytics = {
      settings: {
        total: totalSettings,
        byCategory: settingsByCategory
      },
      preferences: {
        totalUsers: totalUsersWithPreferences
      },
      generatedAt: new Date()
    };
    
    res.json({
      success: true,
      data: analytics,
      message: 'Settings analytics retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get settings analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_SETTINGS_ANALYTICS_FAILED',
      message: 'Failed to retrieve settings analytics',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
