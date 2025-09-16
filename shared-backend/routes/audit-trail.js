const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { getCollection } = require('../config/optimized-database');
const rateLimit = require('express-rate-limit');

// Rate limiting
const auditLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: 'Too many audit requests from this IP, please try again later.'
});

// Apply rate limiting and authentication to all routes
router.use(auditLimiter);
router.use(authenticateToken);

// ===== AUDIT TRAIL MANAGEMENT =====

// GET /api/audit-trail - Get all audit logs
router.get('/', async (req, res) => {
  try {
    const auditCollection = await getCollection('audit_logs');
    const { 
      page = 1, 
      limit = 50, 
      action, 
      userId, 
      resource, 
      dateFrom, 
      dateTo 
    } = req.query;
    
    const filter = {};
    if (action) filter.action = action;
    if (userId) filter.userId = userId;
    if (resource) filter.resource = resource;
    if (dateFrom || dateTo) {
      filter.timestamp = {};
      if (dateFrom) filter.timestamp.$gte = new Date(dateFrom);
      if (dateTo) filter.timestamp.$lte = new Date(dateTo);
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const auditLogs = await auditCollection
      .find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ timestamp: -1 })
      .toArray();
    
    const total = await auditCollection.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        auditLogs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/audit-trail/:id - Get audit log by ID
router.get('/:id', async (req, res) => {
  try {
    const auditCollection = await getCollection('audit_logs');
    const auditLog = await auditCollection.findOne({ _id: req.params.id });
    
    if (!auditLog) {
      return res.status(404).json({
        success: false,
        message: 'Audit log not found'
      });
    }
    
    res.json({
      success: true,
      data: auditLog
    });
  } catch (error) {
    console.error('Error fetching audit log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit log',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/audit-trail - Create audit log entry
router.post('/', requireRole(['admin', 'super_admin']), async (req, res) => {
  try {
    const auditCollection = await getCollection('audit_logs');
    const { 
      action, 
      resource, 
      resourceId, 
      details, 
      userId, 
      ipAddress, 
      userAgent 
    } = req.body;
    
    if (!action || !resource) {
      return res.status(400).json({
        success: false,
        message: 'Action and resource are required'
      });
    }
    
    const auditLog = {
      action,
      resource,
      resourceId: resourceId || null,
      details: details || {},
      userId: userId || req.user.userId,
      ipAddress: ipAddress || req.ip,
      userAgent: userAgent || req.get('User-Agent'),
      timestamp: new Date()
    };
    
    const result = await auditCollection.insertOne(auditLog);
    
    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...auditLog
      },
      message: 'Audit log created successfully'
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create audit log',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===== SECURITY AUDIT =====

// GET /api/audit-trail/security - Get security audit logs
router.get('/security', requireRole(['admin', 'super_admin']), async (req, res) => {
  try {
    const auditCollection = await getCollection('audit_logs');
    const { page = 1, limit = 50, dateFrom, dateTo } = req.query;
    
    const filter = {
      action: { $in: ['login', 'logout', 'failed_login', 'password_change', 'permission_change'] }
    };
    
    if (dateFrom || dateTo) {
      filter.timestamp = {};
      if (dateFrom) filter.timestamp.$gte = new Date(dateFrom);
      if (dateTo) filter.timestamp.$lte = new Date(dateTo);
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const securityLogs = await auditCollection
      .find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ timestamp: -1 })
      .toArray();
    
    const total = await auditCollection.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        securityLogs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching security audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch security audit logs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===== USER ACTIVITY AUDIT =====

// GET /api/audit-trail/user-activity - Get user activity audit logs
router.get('/user-activity', requireRole(['admin', 'super_admin']), async (req, res) => {
  try {
    const auditCollection = await getCollection('audit_logs');
    const { page = 1, limit = 50, userId, dateFrom, dateTo } = req.query;
    
    const filter = {};
    if (userId) filter.userId = userId;
    if (dateFrom || dateTo) {
      filter.timestamp = {};
      if (dateFrom) filter.timestamp.$gte = new Date(dateFrom);
      if (dateTo) filter.timestamp.$lte = new Date(dateTo);
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const userActivityLogs = await auditCollection
      .find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ timestamp: -1 })
      .toArray();
    
    const total = await auditCollection.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        userActivityLogs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user activity audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user activity audit logs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===== AUDIT ANALYTICS =====

// GET /api/audit-trail/analytics - Get audit analytics
router.get('/analytics', requireRole(['admin', 'super_admin']), async (req, res) => {
  try {
    const auditCollection = await getCollection('audit_logs');
    
    const totalLogs = await auditCollection.countDocuments();
    
    // Get logs by action
    const actionStats = await auditCollection.aggregate([
      { $group: { _id: '$action', count: { $sum: 1 } } }
    ]).toArray();
    
    // Get logs by resource
    const resourceStats = await auditCollection.aggregate([
      { $group: { _id: '$resource', count: { $sum: 1 } } }
    ]).toArray();
    
    // Get logs by user
    const userStats = await auditCollection.aggregate([
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]).toArray();
    
    // Get recent activity (last 24 hours)
    const recentActivity = await auditCollection.countDocuments({
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    
    res.json({
      success: true,
      data: {
        overview: {
          totalLogs,
          recentActivity
        },
        actionStats,
        resourceStats,
        topUsers: userStats
      }
    });
  } catch (error) {
    console.error('Error fetching audit analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===== COMPLIANCE AUDIT =====

// GET /api/audit-trail/compliance - Get compliance audit logs
router.get('/compliance', requireRole(['admin', 'super_admin']), async (req, res) => {
  try {
    const auditCollection = await getCollection('audit_logs');
    const { page = 1, limit = 50, dateFrom, dateTo } = req.query;
    
    const filter = {
      action: { $in: ['data_access', 'data_export', 'data_deletion', 'permission_change', 'role_change'] }
    };
    
    if (dateFrom || dateTo) {
      filter.timestamp = {};
      if (dateFrom) filter.timestamp.$gte = new Date(dateFrom);
      if (dateTo) filter.timestamp.$lte = new Date(dateTo);
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const complianceLogs = await auditCollection
      .find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ timestamp: -1 })
      .toArray();
    
    const total = await auditCollection.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        complianceLogs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching compliance audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch compliance audit logs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===== AUDIT EXPORT =====

// GET /api/audit-trail/export - Export audit logs
router.get('/export', requireRole(['admin', 'super_admin']), async (req, res) => {
  try {
    const auditCollection = await getCollection('audit_logs');
    const { format = 'json', dateFrom, dateTo } = req.query;
    
    const filter = {};
    if (dateFrom || dateTo) {
      filter.timestamp = {};
      if (dateFrom) filter.timestamp.$gte = new Date(dateFrom);
      if (dateTo) filter.timestamp.$lte = new Date(dateTo);
    }
    
    const auditLogs = await auditCollection
      .find(filter)
      .sort({ timestamp: -1 })
      .toArray();
    
    if (format === 'csv') {
      // Convert to CSV format
      const csv = auditLogs.map(log => 
        `${log.timestamp},${log.action},${log.resource},${log.userId},${log.ipAddress}`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.csv');
      res.send(csv);
    } else {
      res.json({
        success: true,
        data: auditLogs,
        exportedAt: new Date(),
        totalRecords: auditLogs.length
      });
    }
  } catch (error) {
    console.error('Error exporting audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export audit logs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;