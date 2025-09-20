const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { logger } = require('../config/logger');
const { getCollection } = require('../config/optimized-database');
const rateLimit = require('express-rate-limit');

// Rate limiting for mobile apps endpoints
const mobileAppsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'TOO_MANY_REQUESTS',
    message: 'Too many mobile apps requests from this IP, please try again later.',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes
router.use(mobileAppsLimiter);

// GET /api/v1/mobile-apps/versions - Get mobile app versions
router.get('/versions', authenticateToken, async (req, res) => {
  try {
    const versionsCollection = await getCollection('mobile_app_versions');
    
    if (!versionsCollection) {
      return res.status(500).json({
        success: false,
        error: 'DATABASE_CONNECTION_FAILED',
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
    
    // Check if collection exists and has data
    const collectionExists = await versionsCollection.countDocuments({});
    
    let versions = [];
    
    if (collectionExists > 0) {
      versions = await versionsCollection
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
    }

    res.json({
      success: true,
      data: versions,
      message: 'Mobile app versions retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Get mobile app versions error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_MOBILE_APP_VERSIONS_FAILED',
      message: 'Failed to get mobile app versions',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/mobile-apps/crashes - Get mobile app crash reports
router.get('/crashes', authenticateToken, async (req, res) => {
  try {
    const crashesCollection = await getCollection('mobile_app_crashes');
    
    if (!crashesCollection) {
      return res.status(500).json({
        success: false,
        error: 'DATABASE_CONNECTION_FAILED',
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
    
    const { limit = 50, status, severity } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    
    // Check if collection exists and has data
    const collectionExists = await crashesCollection.countDocuments({});
    
    let crashes = [];
    
    if (collectionExists > 0) {
      crashes = await crashesCollection
        .find(filter)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .toArray();
    }

    res.json({
      success: true,
      data: crashes,
      message: 'Mobile app crashes retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Get mobile app crashes error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_MOBILE_APP_CRASHES_FAILED',
      message: 'Failed to get mobile app crashes',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/mobile-apps/analytics - Get mobile app analytics
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const analyticsCollection = await getCollection('mobile_app_analytics');
    
    if (!analyticsCollection) {
      return res.status(500).json({
        success: false,
        error: 'DATABASE_CONNECTION_FAILED',
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
    
    const { period = '30d', metric } = req.query;
    
    const filter = {};
    if (metric) filter.metric = metric;
    
    // Check if collection exists and has data
    const collectionExists = await analyticsCollection.countDocuments({});
    
    let analytics = [];
    
    if (collectionExists > 0) {
      analytics = await analyticsCollection
        .find(filter)
        .sort({ date: -1 })
        .toArray();
    }

    res.json({
      success: true,
      data: analytics,
      message: 'Mobile app analytics retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Get mobile app analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_MOBILE_APP_ANALYTICS_FAILED',
      message: 'Failed to get mobile app analytics',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/mobile-apps/stores - Get mobile app store listings
router.get('/stores', authenticateToken, async (req, res) => {
  try {
    const storesCollection = await getCollection('mobile_app_stores');
    
    if (!storesCollection) {
      return res.status(500).json({
        success: false,
        error: 'DATABASE_CONNECTION_FAILED',
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
    
    const { platform, status } = req.query;
    
    const filter = {};
    if (platform) filter.platform = platform;
    if (status) filter.status = status;
    
    // Check if collection exists and has data
    const collectionExists = await storesCollection.countDocuments({});
    
    let stores = [];
    
    if (collectionExists > 0) {
      stores = await storesCollection
        .find(filter)
        .sort({ updatedAt: -1 })
        .toArray();
    }

    res.json({
      success: true,
      data: stores,
      message: 'Mobile app stores retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Get mobile app stores error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_MOBILE_APP_STORES_FAILED',
      message: 'Failed to get mobile app stores',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/mobile-apps/versions - Create new mobile app version
router.post('/versions', authenticateToken, async (req, res) => {
  try {
    const { version, buildNumber, platform, releaseNotes, features, bugFixes } = req.body;
    
    if (!version || !buildNumber || !platform) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Version, build number, and platform are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const { db } = await connectToDatabase();
    const versionsCollection = db.collection('mobile_app_versions');
    
    const versionData = {
      version,
      buildNumber,
      platform,
      releaseNotes: releaseNotes || '',
      features: features || [],
      bugFixes: bugFixes || [],
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: req.user.userId || req.user.id
    };
    
    const result = await versionsCollection.insertOne(versionData);
    
    res.status(201).json({
      success: true,
      data: { id: result.insertedId, ...versionData },
      message: 'Mobile app version created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Create mobile app version error:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_MOBILE_APP_VERSION_FAILED',
      message: 'Failed to create mobile app version',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/v1/mobile-apps/versions/:id - Update mobile app version
router.put('/versions/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const { db } = await connectToDatabase();
    const versionsCollection = db.collection('mobile_app_versions');
    
    updateData.updatedAt = new Date();
    updateData.updatedBy = req.user.userId || req.user.id;
    
    const result = await versionsCollection.updateOne(
      { _id: id },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'VERSION_NOT_FOUND',
        message: 'Mobile app version not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: { id, ...updateData },
      message: 'Mobile app version updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Update mobile app version error:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_MOBILE_APP_VERSION_FAILED',
      message: 'Failed to update mobile app version',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/mobile-apps/settings - Get mobile app settings
router.get('/settings', authenticateToken, async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const settingsCollection = db.collection('mobile_app_settings');
    
    let settings = await settingsCollection.findOne({});
    
    // If no settings exist, create default settings
    if (!settings) {
      const defaultSettings = {
        appSettings: {
          appName: 'Clutch',
          version: '1.2.0',
          primaryColor: '#3B82F6',
          secondaryColor: '#10B981',
          logo: '',
          splashScreen: '',
          welcomeMessage: 'Welcome to Clutch - Your Fleet Management Solution'
        },
        content: {
          homeScreen: {
            title: 'Dashboard',
            subtitle: 'Manage your fleet efficiently',
            features: ['Real-time tracking', 'Maintenance alerts', 'Fuel monitoring']
          },
          aboutScreen: {
            title: 'About Clutch',
            description: 'Clutch is a comprehensive fleet management solution designed to help businesses optimize their vehicle operations.'
          }
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await settingsCollection.insertOne(defaultSettings);
      settings = { _id: result.insertedId, ...defaultSettings };
    }

    res.json({
      success: true,
      data: settings,
      message: 'Mobile app settings retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Get mobile app settings error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_MOBILE_APP_SETTINGS_FAILED',
      message: 'Failed to get mobile app settings',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/mobile-apps/settings - Save mobile app settings
router.post('/settings', authenticateToken, async (req, res) => {
  try {
    const { appSettings, content } = req.body;
    
    if (!appSettings || !content) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'App settings and content are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const { db } = await connectToDatabase();
    const settingsCollection = db.collection('mobile_app_settings');
    
    const settingsData = {
      appSettings,
      content,
      updatedAt: new Date(),
      updatedBy: req.user.userId || req.user.id
    };
    
    // Upsert the settings (update if exists, create if not)
    const result = await settingsCollection.replaceOne(
      {},
      { ...settingsData, createdAt: new Date() },
      { upsert: true }
    );
    
    res.json({
      success: true,
      data: { id: result.upsertedId, ...settingsData },
      message: 'Mobile app settings saved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Save mobile app settings error:', error);
    res.status(500).json({
      success: false,
      error: 'SAVE_MOBILE_APP_SETTINGS_FAILED',
      message: 'Failed to save mobile app settings',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/mobile-apps/preview - Preview mobile app
router.get('/preview', authenticateToken, async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const settingsCollection = db.collection('mobile_app_settings');
    
    const settings = await settingsCollection.findOne({});
    
    // Generate preview URL (in a real implementation, this would generate a preview build)
    const previewUrl = `https://preview.clutch.com/mobile-app?t=${Date.now()}`;
    
    // Log preview generation
    logger.info(`📱 Mobile app preview generated by user ${req.user.userId || req.user.id}`);
    
    res.json({
      success: true,
      data: {
        previewUrl,
        status: 'ready',
        settings: settings || null,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      },
      message: 'Mobile app preview generated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Preview mobile app error:', error);
    res.status(500).json({
      success: false,
      error: 'PREVIEW_MOBILE_APP_FAILED',
      message: 'Failed to generate mobile app preview',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/mobile-apps/settings - Get mobile app settings
router.get('/settings', authenticateToken, async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const settingsCollection = db.collection('mobile_app_settings');
    
    const settings = await settingsCollection.findOne({});
    
    const defaultSettings = {
      appSettings: {
        appName: 'Clutch',
        version: '1.2.0',
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981',
        logo: '',
        splashScreen: '',
        welcomeMessage: 'Welcome to Clutch - Your Fleet Management Solution'
      },
      content: {
        homeScreen: {
          title: 'Dashboard',
          subtitle: 'Manage your fleet efficiently',
          features: ['Real-time tracking', 'Maintenance alerts', 'Fuel monitoring']
        },
        aboutScreen: {
          title: 'About Clutch',
          description: 'Clutch is a comprehensive fleet management solution designed to help businesses optimize their vehicle operations.'
        }
      }
    };

    res.json({
      success: true,
      data: settings || defaultSettings,
      message: 'Mobile app settings retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Get mobile app settings error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_MOBILE_APP_SETTINGS_FAILED',
      message: 'Failed to get mobile app settings',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/mobile-apps/settings - Save mobile app settings
router.post('/settings', authenticateToken, async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const settingsCollection = db.collection('mobile_app_settings');
    
    const settings = req.body;
    
    // Upsert settings (update if exists, insert if not)
    await settingsCollection.replaceOne(
      { _id: 'default' },
      {
        _id: 'default',
        ...settings,
        updatedAt: new Date(),
        updatedBy: req.user?.userId || req.user?.id
      },
      { upsert: true }
    );

    res.json({
      success: true,
      data: { success: true },
      message: 'Mobile app settings saved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Save mobile app settings error:', error);
    res.status(500).json({
      success: false,
      error: 'SAVE_MOBILE_APP_SETTINGS_FAILED',
      message: 'Failed to save mobile app settings',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
