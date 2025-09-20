const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole } = require('../middleware/unified-auth');
const { getCollection } = require('../config/optimized-database');
const { ObjectId } = require('mongodb');

// Helper to generate mock mobile app settings (for development/testing)
const generateMockMobileAppSettings = () => ({
  _id: new ObjectId(),
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
  lastUpdated: new Date().toISOString()
});

// GET mobile app settings
router.get('/settings', authenticateToken, checkRole(['head_administrator', 'mobile_manager', 'cms_manager']), async (req, res) => {
  try {
    const settingsCollection = await getCollection('mobile_app_settings');
    if (!settingsCollection) {
      return res.status(500).json({ success: false, error: 'DATABASE_CONNECTION_FAILED', message: 'Database connection failed' });
    }

    let settings = await settingsCollection.findOne({});

    if (!settings) {
      // Seed with mock data if collection is empty
      settings = generateMockMobileAppSettings();
      await settingsCollection.insertOne(settings);
      return res.json({ success: true, data: settings, message: 'Mock Mobile App Settings retrieved successfully' });
    }

    res.json({ success: true, data: settings, message: 'Mobile App Settings retrieved successfully' });
  } catch (error) {
    console.error('Get mobile app settings error:', error);
    res.status(500).json({ success: false, error: 'GET_SETTINGS_FAILED', message: 'Failed to get mobile app settings' });
  }
});

// POST save mobile app settings
router.post('/settings', authenticateToken, checkRole(['head_administrator', 'mobile_manager', 'cms_manager']), async (req, res) => {
  try {
    const settingsCollection = await getCollection('mobile_app_settings');
    if (!settingsCollection) {
      return res.status(500).json({ success: false, error: 'DATABASE_CONNECTION_FAILED', message: 'Database connection failed' });
    }

    const { appSettings, content } = req.body;

    const settingsData = {
      appSettings: appSettings || {},
      content: content || {},
      lastUpdated: new Date().toISOString()
    };

    // Update or insert settings
    const result = await settingsCollection.updateOne(
      {},
      { $set: settingsData },
      { upsert: true }
    );

    res.json({ 
      success: true, 
      data: { ...settingsData, _id: result.upsertedId || new ObjectId() }, 
      message: 'Mobile App Settings saved successfully' 
    });
  } catch (error) {
    console.error('Save mobile app settings error:', error);
    res.status(500).json({ success: false, error: 'SAVE_SETTINGS_FAILED', message: 'Failed to save mobile app settings' });
  }
});

// GET mobile app preview
router.get('/preview', authenticateToken, checkRole(['head_administrator', 'mobile_manager', 'cms_manager']), async (req, res) => {
  try {
    // For now, return a mock preview URL
    // In a real implementation, this would generate a preview URL
    const previewData = {
      previewUrl: 'https://preview.clutch.com/mobile-app',
      status: 'ready',
      generatedAt: new Date().toISOString()
    };

    res.json({ success: true, data: previewData, message: 'Mobile App Preview generated successfully' });
  } catch (error) {
    console.error('Generate mobile app preview error:', error);
    res.status(500).json({ success: false, error: 'PREVIEW_FAILED', message: 'Failed to generate mobile app preview' });
  }
});

module.exports = router;
