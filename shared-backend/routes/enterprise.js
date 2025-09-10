const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const { ObjectId } = require('mongodb');
const { logger } = require('../config/logger');

// ==================== WHITE-LABEL ROUTES ====================

// Get white-label configuration
router.get('/white-label/config', authenticateToken, requireRole(['admin', 'enterprise_manager']), async (req, res) => {
  try {
    const collection = await getCollection('white_label_configs');
    const config = await collection.findOne({ organization: req.user.organization });
    
    if (!config) {
      // Return default configuration
      const defaultConfig = {
        companyName: '',
        brandName: '',
        primaryColor: '#2563eb',
        secondaryColor: '#1e40af',
        accentColor: '#3b82f6',
        logo: {
          light: '',
          dark: '',
          favicon: ''
        },
        customDomain: '',
        emailDomain: '',
        contactInfo: {
          email: '',
          phone: '',
          address: ''
        },
        features: {
          customBranding: false,
          customDomain: false,
          customEmail: false,
          apiAccess: false,
          prioritySupport: false,
          advancedAnalytics: false
        },
        status: 'pending',
        lastUpdated: new Date().toISOString(),
        subscription: {
          plan: '',
          startDate: '',
          endDate: '',
          users: 0,
          vehicles: 0
        }
      };
      
      return res.json({
        success: true,
        data: defaultConfig
      });
    }
    
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    logger.error('Error getting white-label config:', error);
    res.status(500).json({
      success: false,
      error: 'GET_WHITE_LABEL_CONFIG_FAILED',
      message: 'Failed to retrieve white-label configuration'
    });
  }
});

// Update white-label configuration
router.put('/white-label/config', authenticateToken, requireRole(['admin', 'enterprise_manager']), async (req, res) => {
  try {
    const collection = await getCollection('white_label_configs');
    const configData = {
      ...req.body,
      organization: req.user.organization,
      lastUpdated: new Date().toISOString()
    };
    
    const result = await collection.updateOne(
      { organization: req.user.organization },
      { $set: configData },
      { upsert: true }
    );
    
    res.json({
      success: true,
      data: configData,
      message: 'White-label configuration updated successfully'
    });
  } catch (error) {
    logger.error('Error updating white-label config:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_WHITE_LABEL_CONFIG_FAILED',
      message: 'Failed to update white-label configuration'
    });
  }
});

// ==================== API MANAGEMENT ROUTES ====================

// Get API keys
router.get('/api-keys', authenticateToken, requireRole(['admin', 'enterprise_manager']), async (req, res) => {
  try {
    const collection = await getCollection('api_keys');
    const apiKeys = await collection.find({ organization: req.user.organization })
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json({
      success: true,
      data: apiKeys
    });
  } catch (error) {
    logger.error('Error getting API keys:', error);
    res.status(500).json({
      success: false,
      error: 'GET_API_KEYS_FAILED',
      message: 'Failed to retrieve API keys'
    });
  }
});

// Create API key
router.post('/api-keys', authenticateToken, requireRole(['admin', 'enterprise_manager']), async (req, res) => {
  try {
    const { name, permissions, expiresAt } = req.body;
    
    const apiKey = {
      name,
      key: `clutch_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      permissions: permissions || ['read'],
      organization: req.user.organization,
      createdBy: req.user.id,
      createdAt: new Date(),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      isActive: true
    };
    
    const collection = await getCollection('api_keys');
    await collection.insertOne(apiKey);
    
    res.status(201).json({
      success: true,
      data: apiKey,
      message: 'API key created successfully'
    });
  } catch (error) {
    logger.error('Error creating API key:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_API_KEY_FAILED',
      message: 'Failed to create API key'
    });
  }
});

// ==================== WEBHOOK MANAGEMENT ROUTES ====================

// Get webhooks
router.get('/webhooks', authenticateToken, requireRole(['admin', 'enterprise_manager']), async (req, res) => {
  try {
    const collection = await getCollection('webhooks');
    const webhooks = await collection.find({ organization: req.user.organization })
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json({
      success: true,
      data: webhooks
    });
  } catch (error) {
    logger.error('Error getting webhooks:', error);
    res.status(500).json({
      success: false,
      error: 'GET_WEBHOOKS_FAILED',
      message: 'Failed to retrieve webhooks'
    });
  }
});

// Create webhook
router.post('/webhooks', authenticateToken, requireRole(['admin', 'enterprise_manager']), async (req, res) => {
  try {
    const { name, url, events, secret } = req.body;
    
    const webhook = {
      name,
      url,
      events: events || ['all'],
      secret: secret || `webhook_${Math.random().toString(36).substring(2, 15)}`,
      organization: req.user.organization,
      createdBy: req.user.id,
      createdAt: new Date(),
      isActive: true,
      lastTriggered: null,
      failureCount: 0
    };
    
    const collection = await getCollection('webhooks');
    await collection.insertOne(webhook);
    
    res.status(201).json({
      success: true,
      data: webhook,
      message: 'Webhook created successfully'
    });
  } catch (error) {
    logger.error('Error creating webhook:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_WEBHOOK_FAILED',
      message: 'Failed to create webhook'
    });
  }
});

module.exports = router;
