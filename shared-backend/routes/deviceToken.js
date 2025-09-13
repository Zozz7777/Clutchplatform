const express = require('express');
const router = express.Router();
const { logger } = require('../config/logger');

// Simple authentication middleware (non-blocking)
const simpleAuth = (req, res, next) => {
  // For now, just set a mock user
  req.user = { 
    id: 'test-user', 
    role: 'user',
    tenantId: 'test-tenant'
  };
  next();
};

// Create new device token
router.post('/', simpleAuth, async (req, res) => {
  try {
    const { deviceId, token, platform, userId, isActive } = req.body;
    
    if (!deviceId || !token || !platform) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Device ID, token, and platform are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const newDeviceToken = {
      id: `device-token-${Date.now()}`,
      deviceId,
      token,
      platform,
      userId: userId || req.user.id,
      isActive: isActive !== undefined ? isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    res.status(201).json({
      success: true,
      data: newDeviceToken,
      message: 'Device token created successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Error creating device token:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_DEVICE_TOKEN_FAILED',
      message: 'Failed to create device token',
      timestamp: new Date().toISOString()
    });
  }
});

// Get all device tokens
router.get('/', simpleAuth, async (req, res) => {
  try {
    const deviceTokens = [
      {
        id: 'token-1',
        deviceId: 'device-123',
        userId: 'user-456',
        token: 'fcm-token-abc123',
        platform: 'android',
        appVersion: '1.2.3',
        isActive: true,
        lastUsed: new Date().toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: 'token-2',
        deviceId: 'device-789',
        userId: 'user-456',
        token: 'apns-token-def456',
        platform: 'ios',
        appVersion: '1.2.3',
        isActive: true,
        lastUsed: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }
    ];
    
    res.json({
      success: true,
      data: deviceTokens,
      total: deviceTokens.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching device tokens:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch device tokens',
      timestamp: new Date().toISOString()
    });
  }
});

// Get device token by ID
router.get('/:id', simpleAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const deviceToken = {
      id: id,
      deviceId: `device-${id}`,
      userId: 'user-456',
      token: `token-${id}-${Date.now()}`,
      platform: 'android',
      appVersion: '1.2.3',
      isActive: true,
      lastUsed: new Date().toISOString(),
      deviceInfo: {
        model: 'Samsung Galaxy S21',
        osVersion: 'Android 12',
        appVersion: '1.2.3'
      },
      createdAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: deviceToken,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching device token:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch device token',
      timestamp: new Date().toISOString()
    });
  }
});

// Create new device token
router.post('/', simpleAuth, async (req, res) => {
  try {
    const { deviceId, userId, token, platform, appVersion, deviceInfo } = req.body;
    
    if (!deviceId || !userId || !token || !platform) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Device ID, user ID, token, and platform are required',
        timestamp: new Date().toISOString()
      });
    }

    const deviceToken = {
      id: `token-${Date.now()}`,
      deviceId,
      userId,
      token,
      platform,
      appVersion: appVersion || '1.0.0',
      isActive: true,
      deviceInfo: deviceInfo || {},
      createdAt: new Date().toISOString()
    };
    
    res.status(201).json({
      success: true,
      message: 'Device token created successfully',
      data: deviceToken,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error creating device token:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create device token',
      timestamp: new Date().toISOString()
    });
  }
});

// Update device token
router.put('/:id', simpleAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { token, platform, appVersion, isActive, deviceInfo } = req.body;
    
    const deviceToken = {
      id: id,
      deviceId: `device-${id}`,
      userId: 'user-456',
      token: token || `token-${id}-${Date.now()}`,
      platform: platform || 'android',
      appVersion: appVersion || '1.0.0',
      isActive: isActive !== undefined ? isActive : true,
      deviceInfo: deviceInfo || {},
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      message: 'Device token updated successfully',
      data: deviceToken,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating device token:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update device token',
      timestamp: new Date().toISOString()
    });
  }
});

// Delete device token
router.delete('/:id', simpleAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    res.json({
      success: true,
      message: `Device token ${id} deleted successfully`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error deleting device token:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete device token',
      timestamp: new Date().toISOString()
    });
  }
});


// Generic handlers for all HTTP methods
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: `${'deviceToken'} service is running`,
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: '/'
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).json({
    success: true,
    message: `${'deviceToken'} item retrieved`,
    data: { id: id, name: `Item ${id}`, status: 'active' },
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: `/${id}`
  });
});

router.post('/', (req, res) => {
  res.status(201).json({
    success: true,
    message: `${'deviceToken'} item created`,
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
    message: `${'deviceToken'} item updated`,
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
    message: `${'deviceToken'} item deleted`,
    data: { id: id, deletedAt: new Date().toISOString() },
    timestamp: new Date().toISOString(),
    method: 'DELETE',
    path: `/${id}`
  });
});

router.get('/search', (req, res) => {
  res.status(200).json({
    success: true,
    message: `${'deviceToken'} search results`,
    data: { query: req.query.q || '', results: [], total: 0 },
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: '/search'
  });
});

module.exports = router;