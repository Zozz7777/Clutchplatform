/**
 * Security Routes
 * Handle security alerts, monitoring, and threat detection
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole, checkPermission } = require('../middleware/unified-auth');
const { getCollection } = require('../config/optimized-database');
const { rateLimit: createRateLimit } = require('../middleware/rateLimit');
const { ObjectId } = require('mongodb');

// Apply rate limiting - more lenient for security endpoints
const securityRateLimit = createRateLimit({ windowMs: 60 * 1000, max: 200 });

// ==================== SECURITY ALERTS ====================

// GET /api/v1/security/alerts - Get security alerts
router.get('/alerts', authenticateToken, checkRole(['head_administrator', 'security_team', 'admin']), securityRateLimit, async (req, res) => {
  try {
    const { page = 1, limit = 50, severity, status, type, search } = req.query;
    const skip = (page - 1) * limit;
    
    const alertsCollection = await getCollection('security_alerts');
    
    // Build query
    const query = {};
    if (severity) query.severity = severity;
    if (status) query.status = status;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { type: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { source: { $regex: search, $options: 'i' } }
      ];
    }
    
    const alerts = await alertsCollection
      .find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await alertsCollection.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        alerts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Security alerts retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get security alerts error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_SECURITY_ALERTS_FAILED',
      message: 'Failed to retrieve security alerts',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/security/alerts/:id - Get security alert by ID
router.get('/alerts/:id', authenticateToken, checkRole(['head_administrator', 'security_team', 'admin']), securityRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const alertsCollection = await getCollection('security_alerts');
    
    const alert = await alertsCollection.findOne({ _id: new ObjectId(id) });
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'ALERT_NOT_FOUND',
        message: 'Security alert not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: { alert },
      message: 'Security alert retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get security alert error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_SECURITY_ALERT_FAILED',
      message: 'Failed to retrieve security alert',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/security/alerts - Create security alert
router.post('/alerts', authenticateToken, checkRole(['head_administrator', 'security_team']), securityRateLimit, async (req, res) => {
  try {
    const {
      type,
      severity,
      description,
      source,
      status,
      metadata
    } = req.body;
    
    if (!type || !severity || !description) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Type, severity, and description are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const alertsCollection = await getCollection('security_alerts');
    
    const newAlert = {
      type,
      severity,
      description,
      source: source || 'system',
      status: status || 'active',
      metadata: metadata || {},
      count: 1,
      firstSeen: new Date(),
      lastSeen: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await alertsCollection.insertOne(newAlert);
    
    res.status(201).json({
      success: true,
      data: { alert: { ...newAlert, _id: result.insertedId } },
      message: 'Security alert created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create security alert error:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_SECURITY_ALERT_FAILED',
      message: 'Failed to create security alert',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/v1/security/alerts/:id - Update security alert
router.put('/alerts/:id', authenticateToken, checkRole(['head_administrator', 'security_team']), securityRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };
    
    const alertsCollection = await getCollection('security_alerts');
    
    const result = await alertsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'ALERT_NOT_FOUND',
        message: 'Security alert not found',
        timestamp: new Date().toISOString()
      });
    }
    
    const updatedAlert = await alertsCollection.findOne({ _id: new ObjectId(id) });
    
    res.json({
      success: true,
      data: { alert: updatedAlert },
      message: 'Security alert updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Update security alert error:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_SECURITY_ALERT_FAILED',
      message: 'Failed to update security alert',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/v1/security/alerts/:id - Delete security alert
router.delete('/alerts/:id', authenticateToken, checkRole(['head_administrator']), securityRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const alertsCollection = await getCollection('security_alerts');
    
    const result = await alertsCollection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'ALERT_NOT_FOUND',
        message: 'Security alert not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: { id },
      message: 'Security alert deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Delete security alert error:', error);
    res.status(500).json({
      success: false,
      error: 'DELETE_SECURITY_ALERT_FAILED',
      message: 'Failed to delete security alert',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== SECURITY STATS ====================

// GET /api/v1/security/stats - Get security statistics
router.get('/stats', authenticateToken, checkRole(['head_administrator', 'security_team', 'admin']), securityRateLimit, async (req, res) => {
  try {
    const alertsCollection = await getCollection('security_alerts');
    
    const totalAlerts = await alertsCollection.countDocuments();
    const activeAlerts = await alertsCollection.countDocuments({ status: 'active' });
    const criticalAlerts = await alertsCollection.countDocuments({ severity: 'critical' });
    const resolvedToday = await alertsCollection.countDocuments({
      status: 'resolved',
      updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    
    // Alert types distribution
    const alertTypes = await alertsCollection.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    // Severity distribution
    const severityDistribution = await alertsCollection.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    const stats = {
      totalAlerts,
      activeAlerts,
      criticalAlerts,
      resolvedToday,
      alertTypes,
      severityDistribution
    };
    
    res.json({
      success: true,
      data: stats,
      message: 'Security statistics retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get security stats error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_SECURITY_STATS_FAILED',
      message: 'Failed to retrieve security statistics',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== GENERIC HANDLERS ====================

// GET /api/v1/security - Get security overview
router.get('/', authenticateToken, checkRole(['head_administrator', 'security_team', 'admin']), securityRateLimit, async (req, res) => {
  res.json({
    success: true,
    message: 'Security API is running',
    endpoints: {
      alerts: '/api/v1/security/alerts',
      stats: '/api/v1/security/stats'
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
