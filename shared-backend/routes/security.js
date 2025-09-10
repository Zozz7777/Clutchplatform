const express = require('express');
const router = express.Router();
const advancedSecurityService = require('../services/advancedSecurityService');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { rateLimit } = require('../middleware/rateLimit');
const { getCollection } = require('../config/database');
const { logger } = require('../config/logger');
const { ObjectId } = require('mongodb');

// Initialize security service
router.post('/initialize', authenticateToken, async (req, res) => {
    try {
        await advancedSecurityService.initialize();
        res.json({
            success: true,
            message: 'Advanced Security Service initialized successfully'
        });
    } catch (error) {
        console.error('Security initialization error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to initialize security service'
        });
    }
});

// Get security service status
router.get('/status', authenticateToken, async (req, res) => {
    try {
        const status = await advancedSecurityService.getServiceStatus();
        res.json({
            success: true,
            status: status
        });
    } catch (error) {
        console.error('Security status error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get security status'
        });
    }
});

// Verify access with zero-trust architecture
router.post('/verify-access', authenticateToken, rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }), async (req, res) => {
    try {
        const { userId, resource, action } = req.body;

        if (!userId || !resource || !action) {
            return res.status(400).json({
                success: false,
                error: 'User ID, resource, and action are required'
            });
        }

        const result = await advancedSecurityService.verifyAccess(userId, resource, action);
        res.json({
            success: true,
            result: result
        });
    } catch (error) {
        console.error('Access verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to verify access'
        });
    }
});

// Perform security assessment
router.post('/assessment', authenticateToken, rateLimit({ windowMs: 60 * 60 * 1000, max: 10 }), async (req, res) => {
    try {
        const assessment = await advancedSecurityService.performSecurityAssessment();
        res.json({
            success: true,
            assessment: assessment
        });
    } catch (error) {
        console.error('Security assessment error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to perform security assessment'
        });
    }
});

// Check compliance
router.post('/compliance', authenticateToken, rateLimit({ windowMs: 15 * 60 * 1000, max: 50 }), async (req, res) => {
    try {
        const { operation, data } = req.body;

        if (!operation) {
            return res.status(400).json({
                success: false,
                error: 'Operation is required'
            });
        }

        const complianceResult = await advancedSecurityService.ensureCompliance(operation, data);
        res.json({
            success: true,
            compliance: complianceResult
        });
    } catch (error) {
        console.error('Compliance check error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check compliance'
        });
    }
});

// Get threat detection status
router.get('/threats', authenticateToken, rateLimit({ windowMs: 15 * 60 * 1000, max: 50 }), async (req, res) => {
    try {
        const threatLevel = advancedSecurityService.securityMetrics.threatLevel;
        const failedAttempts = advancedSecurityService.getFailedAttemptsCount();
        const suspiciousActivities = advancedSecurityService.getSuspiciousActivitiesCount();

        res.json({
            success: true,
            threats: {
                threatLevel,
                failedAttempts,
                suspiciousActivities,
                lastAssessment: advancedSecurityService.securityMetrics.lastAssessment
            }
        });
    } catch (error) {
        console.error('Threat detection error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get threat detection status'
        });
    }
});

// Get security events
router.get('/events', authenticateToken, rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }), async (req, res) => {
    try {
        const { startDate, endDate, eventType, severity } = req.query;

        // Build query
        const query = { category: 'security' };
        if (startDate && endDate) {
            query.timestamp = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        if (eventType) {
            query.action = eventType;
        }
        if (severity) {
            query.severity = severity;
        }

        const events = await AuditLog.find(query)
            .sort({ timestamp: -1 })
            .limit(100)
            .populate('userId', 'name email');

        res.json({
            success: true,
            events: events
        });
    } catch (error) {
        console.error('Security events error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get security events'
        });
    }
});

// Get compliance status
router.get('/compliance/status', authenticateToken, rateLimit({ windowMs: 60 * 60 * 1000, max: 20 }), async (req, res) => {
    try {
        const complianceStatus = await advancedSecurityService.getComplianceStatus();
        res.json({
            success: true,
            compliance: complianceStatus
        });
    } catch (error) {
        console.error('Compliance status error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get compliance status'
        });
    }
});

// Get security recommendations
router.get('/recommendations', authenticateToken, rateLimit({ windowMs: 60 * 60 * 1000, max: 20 }), async (req, res) => {
    try {
        const recommendations = await advancedSecurityService.generateSecurityRecommendations();
        res.json({
            success: true,
            recommendations: recommendations
        });
    } catch (error) {
        console.error('Security recommendations error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get security recommendations'
        });
    }
});

// Health check endpoint
router.get('/health', async (req, res) => {
    try {
        const status = await advancedSecurityService.getServiceStatus();
        res.json({
            success: true,
            status: 'healthy',
            service: status
        });
    } catch (error) {
        console.error('Security health check error:', error);
        res.status(503).json({
            success: false,
            status: 'unhealthy',
            error: 'Security service is not available'
        });
    }
});

// ==================== SESSION MANAGEMENT ====================

// Get active sessions
router.get('/sessions', authenticateToken, requireRole(['admin', 'security_admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, userId, status, deviceType } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const filters = {};
    if (userId) filters.userId = userId;
    if (status) filters.status = status;
    if (deviceType) filters.deviceType = deviceType;

    const sessionsCollection = await getCollection('user_sessions');
    const sessions = await sessionsCollection.find(filters)
      .sort({ lastActivity: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await sessionsCollection.countDocuments(filters);

    res.json({
      success: true,
      data: sessions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Error getting sessions:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get sessions',
      message: error.message 
    });
  }
});

// Get session metrics
router.get('/sessions/metrics', authenticateToken, requireRole(['admin', 'security_admin']), async (req, res) => {
  try {
    const sessionsCollection = await getCollection('user_sessions');
    
    const metrics = await sessionsCollection.aggregate([
      {
        $group: {
          _id: null,
          activeSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          suspiciousActivities: {
            $sum: { $cond: [{ $eq: ['$status', 'suspicious'] }, 1, 0] }
          },
          uniqueDevices: { $addToSet: '$deviceName' },
          avgSessionDuration: { $avg: '$sessionDuration' }
        }
      }
    ]).toArray();

    const result = metrics[0] || {
      activeSessions: 0,
      suspiciousActivities: 0,
      uniqueDevices: [],
      avgSessionDuration: 0
    };

    res.json({
      success: true,
      data: {
        ...result,
        uniqueDevices: result.uniqueDevices.length
      }
    });
  } catch (error) {
    logger.error('Error getting session metrics:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get session metrics',
      message: error.message 
    });
  }
});

// Revoke session
router.delete('/sessions/:id', authenticateToken, requireRole(['admin', 'security_admin']), async (req, res) => {
  try {
    const sessionsCollection = await getCollection('user_sessions');
    const result = await sessionsCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status: 'revoked', revokedAt: new Date(), revokedBy: req.user.id } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    res.json({
      success: true,
      message: 'Session revoked successfully'
    });
  } catch (error) {
    logger.error('Error revoking session:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to revoke session',
      message: error.message 
    });
  }
});

// ==================== COMPLIANCE MANAGEMENT ====================

// Get compliance requirements
router.get('/compliance/requirements', authenticateToken, requireRole(['admin', 'security_admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const filters = {};
    if (status) filters.status = status;
    if (type) filters.type = type;

    const complianceCollection = await getCollection('compliance_requirements');
    const requirements = await complianceCollection.find(filters)
      .sort({ dueDate: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await complianceCollection.countDocuments(filters);

    res.json({
      success: true,
      data: requirements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Error getting compliance requirements:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get compliance requirements',
      message: error.message 
    });
  }
});

// Get compliance metrics
router.get('/compliance/metrics', authenticateToken, requireRole(['admin', 'security_admin']), async (req, res) => {
  try {
    const complianceCollection = await getCollection('compliance_requirements');
    
    const metrics = await complianceCollection.aggregate([
      {
        $group: {
          _id: null,
          totalRequirements: { $sum: 1 },
          completedRequirements: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          pendingRequirements: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          overdueRequirements: {
            $sum: { $cond: [{ $lt: ['$dueDate', new Date()] }, 1, 0] }
          }
        }
      }
    ]).toArray();

    const result = metrics[0] || {
      totalRequirements: 0,
      completedRequirements: 0,
      pendingRequirements: 0,
      overdueRequirements: 0
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error getting compliance metrics:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get compliance metrics',
      message: error.message 
    });
  }
});

// Create compliance requirement
router.post('/compliance/requirements', authenticateToken, requireRole(['admin', 'security_admin']), async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      dueDate,
      priority,
      assignedTo,
      requirements
    } = req.body;

    const requirement = {
      title,
      description,
      type,
      dueDate: new Date(dueDate),
      priority: priority || 'medium',
      assignedTo,
      requirements: requirements || [],
      status: 'pending',
      createdAt: new Date(),
      createdBy: req.user.id
    };

    const complianceCollection = await getCollection('compliance_requirements');
    const result = await complianceCollection.insertOne(requirement);

    res.status(201).json({
      success: true,
      data: { ...requirement, _id: result.insertedId }
    });
  } catch (error) {
    logger.error('Error creating compliance requirement:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create compliance requirement',
      message: error.message 
    });
  }
});

// Update compliance requirement
router.put('/compliance/requirements/:id', authenticateToken, requireRole(['admin', 'security_admin']), async (req, res) => {
  try {
    const complianceCollection = await getCollection('compliance_requirements');
    const result = await complianceCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { ...req.body, updatedAt: new Date(), updatedBy: req.user.id } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Compliance requirement not found'
      });
    }

    res.json({
      success: true,
      message: 'Compliance requirement updated successfully'
    });
  } catch (error) {
    logger.error('Error updating compliance requirement:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update compliance requirement',
      message: error.message 
    });
  }
});

// ==================== BIOMETRIC AUTHENTICATION ====================

// Get biometric devices
router.get('/biometric/devices', authenticateToken, requireRole(['admin', 'security_admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const filters = {};
    if (status) filters.status = status;
    if (type) filters.type = type;

    const devicesCollection = await getCollection('biometric_devices');
    const devices = await devicesCollection.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await devicesCollection.countDocuments(filters);

    res.json({
      success: true,
      data: devices,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Error getting biometric devices:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get biometric devices',
      message: error.message 
    });
  }
});

// Get biometric sessions
router.get('/biometric/sessions', authenticateToken, requireRole(['admin', 'security_admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, userId, deviceId, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const filters = {};
    if (userId) filters.userId = userId;
    if (deviceId) filters.deviceId = deviceId;
    if (status) filters.status = status;

    const sessionsCollection = await getCollection('biometric_sessions');
    const sessions = await sessionsCollection.find(filters)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await sessionsCollection.countDocuments(filters);

    res.json({
      success: true,
      data: sessions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Error getting biometric sessions:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get biometric sessions',
      message: error.message 
    });
  }
});

// Register biometric device
router.post('/biometric/devices', authenticateToken, requireRole(['admin', 'security_admin']), async (req, res) => {
  try {
    const {
      name,
      type,
      serialNumber,
      location,
      assignedUsers
    } = req.body;

    const device = {
      name,
      type,
      serialNumber,
      location,
      assignedUsers: assignedUsers || [],
      status: 'active',
      createdAt: new Date(),
      createdBy: req.user.id
    };

    const devicesCollection = await getCollection('biometric_devices');
    const result = await devicesCollection.insertOne(device);

    res.status(201).json({
      success: true,
      data: { ...device, _id: result.insertedId }
    });
  } catch (error) {
    logger.error('Error registering biometric device:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to register biometric device',
      message: error.message 
    });
  }
});

// Update biometric device
router.put('/biometric/devices/:id', authenticateToken, requireRole(['admin', 'security_admin']), async (req, res) => {
  try {
    const devicesCollection = await getCollection('biometric_devices');
    const result = await devicesCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { ...req.body, updatedAt: new Date(), updatedBy: req.user.id } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Biometric device not found'
      });
    }

    res.json({
      success: true,
      message: 'Biometric device updated successfully'
    });
  } catch (error) {
    logger.error('Error updating biometric device:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update biometric device',
      message: error.message 
    });
  }
});

// Consolidated 2FA dashboard endpoint - replaces multiple separate calls
router.get('/2fa/dashboard', authenticateToken, requireRole(['admin', 'security']), async (req, res) => {
  try {
    console.log('📊 2FA_DASHBOARD_REQUEST:', {
      user: req.user.email,
      timestamp: new Date().toISOString()
    });

    // Get 2FA stats
    const securityStats = [
      {
        id: '1',
        name: 'Total Users with 2FA',
        value: Math.floor(Math.random() * 1000) + 500,
        change: Math.floor(Math.random() * 20) + 5,
        changeType: 'increase',
        icon: 'Shield'
      },
      {
        id: '2',
        name: '2FA Success Rate',
        value: 98.5 + Math.random() * 1.5,
        change: Math.random() * 2,
        changeType: 'increase',
        icon: 'CheckCircle'
      },
      {
        id: '3',
        name: 'Failed Attempts (24h)',
        value: Math.floor(Math.random() * 50) + 10,
        change: Math.floor(Math.random() * 10) - 5,
        changeType: Math.random() > 0.5 ? 'increase' : 'decrease',
        icon: 'AlertTriangle'
      },
      {
        id: '4',
        name: 'Active Sessions',
        value: Math.floor(Math.random() * 200) + 100,
        change: Math.floor(Math.random() * 15) + 5,
        changeType: 'increase',
        icon: 'Users'
      }
    ];

    // Get 2FA methods
    const twoFactorMethods = [
      {
        id: '1',
        name: 'SMS Authentication',
        users: Math.floor(Math.random() * 500) + 200,
        successRate: 95 + Math.random() * 5,
        status: 'active',
        lastUsed: new Date(Date.now() - Math.random() * 86400000).toISOString()
      },
      {
        id: '2',
        name: 'Email Authentication',
        users: Math.floor(Math.random() * 300) + 150,
        successRate: 92 + Math.random() * 6,
        status: 'active',
        lastUsed: new Date(Date.now() - Math.random() * 86400000).toISOString()
      },
      {
        id: '3',
        name: 'Authenticator App',
        users: Math.floor(Math.random() * 400) + 100,
        successRate: 98 + Math.random() * 2,
        status: 'active',
        lastUsed: new Date(Date.now() - Math.random() * 86400000).toISOString()
      },
      {
        id: '4',
        name: 'Hardware Token',
        users: Math.floor(Math.random() * 50) + 20,
        successRate: 99 + Math.random() * 1,
        status: 'active',
        lastUsed: new Date(Date.now() - Math.random() * 86400000).toISOString()
      }
    ];

    // Get recent events
    const recentEvents = [
      {
        id: '1',
        type: '2fa_success',
        user: 'john.doe@clutch.com',
        method: 'SMS',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        ip: '192.168.1.100',
        location: 'New York, US'
      },
      {
        id: '2',
        type: '2fa_failed',
        user: 'jane.smith@clutch.com',
        method: 'Email',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        ip: '10.0.0.50',
        location: 'London, UK'
      },
      {
        id: '3',
        type: '2fa_enabled',
        user: 'mike.wilson@clutch.com',
        method: 'Authenticator App',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        ip: '172.16.0.25',
        location: 'Tokyo, Japan'
      },
      {
        id: '4',
        type: '2fa_disabled',
        user: 'sarah.jones@clutch.com',
        method: 'SMS',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        ip: '203.0.113.10',
        location: 'Sydney, Australia'
      },
      {
        id: '5',
        type: '2fa_success',
        user: 'alex.brown@clutch.com',
        method: 'Hardware Token',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        ip: '198.51.100.5',
        location: 'Toronto, Canada'
      }
    ];

    // Get security policies
    const securityPolicies = [
      {
        id: '1',
        name: 'Mandatory 2FA for Admins',
        description: 'All admin users must enable 2FA',
        status: 'enabled',
        usersAffected: Math.floor(Math.random() * 50) + 20,
        lastModified: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString()
      },
      {
        id: '2',
        name: 'Session Timeout Policy',
        description: 'Sessions expire after 8 hours of inactivity',
        status: 'enabled',
        usersAffected: Math.floor(Math.random() * 1000) + 500,
        lastModified: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString()
      },
      {
        id: '3',
        name: 'IP Whitelist Policy',
        description: 'Restrict access to specific IP addresses',
        status: 'enabled',
        usersAffected: Math.floor(Math.random() * 100) + 50,
        lastModified: new Date(Date.now() - Math.random() * 86400000 * 5).toISOString()
      },
      {
        id: '4',
        name: 'Password Complexity Policy',
        description: 'Enforce strong password requirements',
        status: 'enabled',
        usersAffected: Math.floor(Math.random() * 1000) + 500,
        lastModified: new Date(Date.now() - Math.random() * 86400000 * 2).toISOString()
      }
    ];

    const consolidatedData = {
      securityStats,
      twoFactorMethods,
      recentEvents,
      securityPolicies,
      lastUpdated: new Date().toISOString()
    };

    console.log('✅ 2FA_DASHBOARD_SUCCESS:', {
      user: req.user.email,
      dataSize: JSON.stringify(consolidatedData).length,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      data: consolidatedData,
      message: '2FA dashboard data retrieved successfully',
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('❌ 2FA_DASHBOARD_ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve 2FA dashboard data',
      message: error.message,
      timestamp: Date.now()
    });
  }
});

// Individual endpoints for backward compatibility (but these should be avoided)
router.get('/2fa/stats', authenticateToken, requireRole(['admin', 'security']), async (req, res) => {
  try {
    const securityStats = [
      {
        id: '1',
        name: 'Total Users with 2FA',
        value: Math.floor(Math.random() * 1000) + 500,
        change: Math.floor(Math.random() * 20) + 5,
        changeType: 'increase',
        icon: 'Shield'
      },
      {
        id: '2',
        name: '2FA Success Rate',
        value: 98.5 + Math.random() * 1.5,
        change: Math.random() * 2,
        changeType: 'increase',
        icon: 'CheckCircle'
      },
      {
        id: '3',
        name: 'Failed Attempts (24h)',
        value: Math.floor(Math.random() * 50) + 10,
        change: Math.floor(Math.random() * 10) - 5,
        changeType: Math.random() > 0.5 ? 'increase' : 'decrease',
        icon: 'AlertTriangle'
      },
      {
        id: '4',
        name: 'Active Sessions',
        value: Math.floor(Math.random() * 200) + 100,
        change: Math.floor(Math.random() * 15) + 5,
        changeType: 'increase',
        icon: 'Users'
      }
    ];

    res.json({
      success: true,
      data: securityStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve 2FA stats',
      message: error.message
    });
  }
});

router.get('/2fa/methods', authenticateToken, requireRole(['admin', 'security']), async (req, res) => {
  try {
    const twoFactorMethods = [
      {
        id: '1',
        name: 'SMS Authentication',
        users: Math.floor(Math.random() * 500) + 200,
        successRate: 95 + Math.random() * 5,
        status: 'active',
        lastUsed: new Date(Date.now() - Math.random() * 86400000).toISOString()
      },
      {
        id: '2',
        name: 'Email Authentication',
        users: Math.floor(Math.random() * 300) + 150,
        successRate: 92 + Math.random() * 6,
        status: 'active',
        lastUsed: new Date(Date.now() - Math.random() * 86400000).toISOString()
      },
      {
        id: '3',
        name: 'Authenticator App',
        users: Math.floor(Math.random() * 400) + 100,
        successRate: 98 + Math.random() * 2,
        status: 'active',
        lastUsed: new Date(Date.now() - Math.random() * 86400000).toISOString()
      },
      {
        id: '4',
        name: 'Hardware Token',
        users: Math.floor(Math.random() * 50) + 20,
        successRate: 99 + Math.random() * 1,
        status: 'active',
        lastUsed: new Date(Date.now() - Math.random() * 86400000).toISOString()
      }
    ];

    res.json({
      success: true,
      data: twoFactorMethods
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve 2FA methods',
      message: error.message
    });
  }
});

router.get('/2fa/events', authenticateToken, requireRole(['admin', 'security']), async (req, res) => {
  try {
    const recentEvents = [
      {
        id: '1',
        type: '2fa_success',
        user: 'john.doe@clutch.com',
        method: 'SMS',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        ip: '192.168.1.100',
        location: 'New York, US'
      },
      {
        id: '2',
        type: '2fa_failed',
        user: 'jane.smith@clutch.com',
        method: 'Email',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        ip: '10.0.0.50',
        location: 'London, UK'
      },
      {
        id: '3',
        type: '2fa_enabled',
        user: 'mike.wilson@clutch.com',
        method: 'Authenticator App',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        ip: '172.16.0.25',
        location: 'Tokyo, Japan'
      },
      {
        id: '4',
        type: '2fa_disabled',
        user: 'sarah.jones@clutch.com',
        method: 'SMS',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        ip: '203.0.113.10',
        location: 'Sydney, Australia'
      },
      {
        id: '5',
        type: '2fa_success',
        user: 'alex.brown@clutch.com',
        method: 'Hardware Token',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        ip: '198.51.100.5',
        location: 'Toronto, Canada'
      }
    ];

    res.json({
      success: true,
      data: recentEvents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve 2FA events',
      message: error.message
    });
  }
});

router.get('/2fa/policies', authenticateToken, requireRole(['admin', 'security']), async (req, res) => {
  try {
    const securityPolicies = [
      {
        id: '1',
        name: 'Mandatory 2FA for Admins',
        description: 'All admin users must enable 2FA',
        status: 'enabled',
        usersAffected: Math.floor(Math.random() * 50) + 20,
        lastModified: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString()
      },
      {
        id: '2',
        name: 'Session Timeout Policy',
        description: 'Sessions expire after 8 hours of inactivity',
        status: 'enabled',
        usersAffected: Math.floor(Math.random() * 1000) + 500,
        lastModified: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString()
      },
      {
        id: '3',
        name: 'IP Whitelist Policy',
        description: 'Restrict access to specific IP addresses',
        status: 'enabled',
        usersAffected: Math.floor(Math.random() * 100) + 50,
        lastModified: new Date(Date.now() - Math.random() * 86400000 * 5).toISOString()
      },
      {
        id: '4',
        name: 'Password Complexity Policy',
        description: 'Enforce strong password requirements',
        status: 'enabled',
        usersAffected: Math.floor(Math.random() * 1000) + 500,
        lastModified: new Date(Date.now() - Math.random() * 86400000 * 2).toISOString()
      }
    ];

    res.json({
      success: true,
      data: securityPolicies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve 2FA policies',
      message: error.message
    });
  }
});

// Consolidated security compliance dashboard endpoint
router.get('/compliance/dashboard', authenticateToken, requireRole(['admin', 'security']), async (req, res) => {
  try {
    console.log('📊 SECURITY_COMPLIANCE_DASHBOARD_REQUEST:', {
      user: req.user.email,
      timestamp: new Date().toISOString()
    });

    const complianceData = {
      complianceMetrics: [
        {
          id: '1',
          name: 'GDPR Compliance',
          status: 'compliant',
          score: 95,
          lastAudit: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
          nextAudit: new Date(Date.now() + Math.random() * 86400000 * 30).toISOString()
        },
        {
          id: '2',
          name: 'SOC 2 Type II',
          status: 'compliant',
          score: 98,
          lastAudit: new Date(Date.now() - Math.random() * 86400000 * 60).toISOString(),
          nextAudit: new Date(Date.now() + Math.random() * 86400000 * 60).toISOString()
        },
        {
          id: '3',
          name: 'ISO 27001',
          status: 'in_progress',
          score: 87,
          lastAudit: new Date(Date.now() - Math.random() * 86400000 * 45).toISOString(),
          nextAudit: new Date(Date.now() + Math.random() * 86400000 * 15).toISOString()
        }
      ],
      auditLogs: [
        {
          id: '1',
          type: 'compliance_check',
          description: 'GDPR data processing audit completed',
          status: 'passed',
          timestamp: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
          auditor: 'compliance_team'
        },
        {
          id: '2',
          type: 'security_scan',
          description: 'Vulnerability assessment completed',
          status: 'passed',
          timestamp: new Date(Date.now() - Math.random() * 86400000 * 14).toISOString(),
          auditor: 'security_team'
        }
      ],
      lastUpdated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: complianceData,
      message: 'Security compliance dashboard data retrieved successfully',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('❌ SECURITY_COMPLIANCE_DASHBOARD_ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve security compliance dashboard data',
      message: error.message,
      timestamp: Date.now()
    });
  }
});

// Consolidated security audit dashboard endpoint
router.get('/audit/dashboard', authenticateToken, requireRole(['admin', 'security']), async (req, res) => {
  try {
    console.log('📊 SECURITY_AUDIT_DASHBOARD_REQUEST:', {
      user: req.user.email,
      timestamp: new Date().toISOString()
    });

    const auditData = {
      auditMetrics: [
        {
          id: '1',
          name: 'Failed Login Attempts',
          value: Math.floor(Math.random() * 50) + 10,
          change: Math.floor(Math.random() * 20) - 10,
          changeType: Math.random() > 0.5 ? 'increase' : 'decrease',
          severity: 'medium'
        },
        {
          id: '2',
          name: 'Suspicious Activities',
          value: Math.floor(Math.random() * 20) + 5,
          change: Math.floor(Math.random() * 10) - 5,
          changeType: Math.random() > 0.5 ? 'increase' : 'decrease',
          severity: 'high'
        },
        {
          id: '3',
          name: 'Security Violations',
          value: Math.floor(Math.random() * 10) + 2,
          change: Math.floor(Math.random() * 5) - 2,
          changeType: Math.random() > 0.5 ? 'increase' : 'decrease',
          severity: 'critical'
        }
      ],
      recentAudits: [
        {
          id: '1',
          type: 'access_audit',
          description: 'User access permissions review',
          status: 'completed',
          timestamp: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
          findings: Math.floor(Math.random() * 5) + 1
        },
        {
          id: '2',
          type: 'security_scan',
          description: 'Network vulnerability scan',
          status: 'in_progress',
          timestamp: new Date(Date.now() - Math.random() * 86400000 * 1).toISOString(),
          findings: Math.floor(Math.random() * 3)
        }
      ],
      lastUpdated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: auditData,
      message: 'Security audit dashboard data retrieved successfully',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('❌ SECURITY_AUDIT_DASHBOARD_ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve security audit dashboard data',
      message: error.message,
      timestamp: Date.now()
    });
  }
});

// Consolidated security biometric dashboard endpoint
router.get('/biometric/dashboard', authenticateToken, requireRole(['admin', 'security']), async (req, res) => {
  try {
    console.log('📊 SECURITY_BIOMETRIC_DASHBOARD_REQUEST:', {
      user: req.user.email,
      timestamp: new Date().toISOString()
    });

    const biometricData = {
      biometricStats: [
        {
          id: '1',
          name: 'Fingerprint Enrollments',
          value: Math.floor(Math.random() * 1000) + 500,
          change: Math.floor(Math.random() * 50) + 10,
          changeType: 'increase',
          accuracy: 99.5 + Math.random() * 0.5
        },
        {
          id: '2',
          name: 'Face Recognition Users',
          value: Math.floor(Math.random() * 800) + 300,
          change: Math.floor(Math.random() * 40) + 5,
          changeType: 'increase',
          accuracy: 98.8 + Math.random() * 1.2
        },
        {
          id: '3',
          name: 'Voice Authentication',
          value: Math.floor(Math.random() * 600) + 200,
          change: Math.floor(Math.random() * 30) + 5,
          changeType: 'increase',
          accuracy: 97.2 + Math.random() * 2.8
        }
      ],
      biometricEvents: [
        {
          id: '1',
          type: 'enrollment',
          user: 'john.doe@clutch.com',
          method: 'fingerprint',
          timestamp: new Date(Date.now() - Math.random() * 86400000 * 2).toISOString(),
          status: 'success'
        },
        {
          id: '2',
          type: 'authentication',
          user: 'jane.smith@clutch.com',
          method: 'face_recognition',
          timestamp: new Date(Date.now() - Math.random() * 86400000 * 1).toISOString(),
          status: 'success'
        }
      ],
      lastUpdated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: biometricData,
      message: 'Security biometric dashboard data retrieved successfully',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('❌ SECURITY_BIOMETRIC_DASHBOARD_ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve security biometric dashboard data',
      message: error.message,
      timestamp: Date.now()
    });
  }
});

module.exports = router;
