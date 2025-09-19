const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { logger } = require('../config/logger');
const { connectToDatabase } = require('../config/database-unified');

// GET /api/v1/mobile-apps/versions - Get mobile app versions
router.get('/versions', authenticateToken, async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const versionsCollection = db.collection('mobile_app_versions');
    
    const versions = await versionsCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

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
    const { db } = await connectToDatabase();
    const crashesCollection = db.collection('mobile_app_crashes');
    
    const { limit = 50, status, severity } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    
    const crashes = await crashesCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .toArray();

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
    const { db } = await connectToDatabase();
    const analyticsCollection = db.collection('mobile_app_analytics');
    
    const { period = '30d', metric } = req.query;
    
    const filter = {};
    if (metric) filter.metric = metric;
    
    const analytics = await analyticsCollection
      .find(filter)
      .sort({ date: -1 })
      .toArray();

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
    const { db } = await connectToDatabase();
    const storesCollection = db.collection('mobile_app_stores');
    
    const { platform, status } = req.query;
    
    const filter = {};
    if (platform) filter.platform = platform;
    if (status) filter.status = status;
    
    const stores = await storesCollection
      .find(filter)
      .sort({ updatedAt: -1 })
      .toArray();

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

module.exports = router;
