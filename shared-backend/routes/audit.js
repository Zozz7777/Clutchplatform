/**
 * Audit Trail Routes
 * Complete audit trail system for logging all user actions and system events
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole } = require('../middleware/auth');
const { checkRole, checkPermission } = require('../middleware/rbac');
const { getCollection } = require('../config/optimized-database');
const { rateLimit: createRateLimit } = require('../middleware/rateLimit');
const { ObjectId } = require('mongodb');

// Apply rate limiting
const auditRateLimit = createRateLimit({ windowMs: 60 * 1000, max: 100 });

// ==================== AUDIT LOG MANAGEMENT ====================

// GET /api/v1/audit/logs - Get audit logs
router.get('/logs', authenticateToken, checkRole(['head_administrator', 'auditor']), auditRateLimit, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      userId, 
      action, 
      resource, 
      startDate, 
      endDate, 
      search 
    } = req.query;
    const skip = (page - 1) * limit;
    
    const auditLogsCollection = await getCollection('audit_logs');
    
    // Build query
    const query = {};
    if (userId) query.userId = userId;
    if (action) query.action = action;
    if (resource) query.resource = resource;
    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (search) {
      query.$or = [
        { action: { $regex: search, $options: 'i' } },
        { resource: { $regex: search, $options: 'i' } },
        { details: { $regex: search, $options: 'i' } },
        { ipAddress: { $regex: search, $options: 'i' } }
      ];
    }
    
    const auditLogs = await auditLogsCollection
      .find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await auditLogsCollection.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        auditLogs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Audit logs retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_AUDIT_LOGS_FAILED',
      message: 'Failed to retrieve audit logs',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/audit/logs/:id - Get audit log by ID
router.get('/logs/:id', authenticateToken, checkRole(['head_administrator', 'auditor']), auditRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const auditLogsCollection = await getCollection('audit_logs');
    
    const auditLog = await auditLogsCollection.findOne({ _id: new ObjectId(id) });
    
    if (!auditLog) {
      return res.status(404).json({
        success: false,
        error: 'AUDIT_LOG_NOT_FOUND',
        message: 'Audit log not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: { auditLog },
      message: 'Audit log retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get audit log error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_AUDIT_LOG_FAILED',
      message: 'Failed to retrieve audit log',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/audit/logs - Create audit log (internal use)
router.post('/logs', authenticateToken, checkRole(['head_administrator', 'system']), auditRateLimit, async (req, res) => {
  try {
    const {
      userId,
      action,
      resource,
      resourceId,
      details,
      ipAddress,
      userAgent,
      sessionId,
      metadata
    } = req.body;
    
    if (!userId || !action || !resource) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'User ID, action, and resource are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const auditLogsCollection = await getCollection('audit_logs');
    
    const newAuditLog = {
      userId,
      action,
      resource,
      resourceId: resourceId || null,
      details: details || null,
      ipAddress: ipAddress || req.ip,
      userAgent: userAgent || req.get('User-Agent'),
      sessionId: sessionId || null,
      metadata: metadata || {},
      timestamp: new Date(),
      createdAt: new Date()
    };
    
    const result = await auditLogsCollection.insertOne(newAuditLog);
    
    res.status(201).json({
      success: true,
      data: { auditLog: { ...newAuditLog, _id: result.insertedId } },
      message: 'Audit log created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create audit log error:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_AUDIT_LOG_FAILED',
      message: 'Failed to create audit log',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== USER ACTIVITY TRACKING ====================

// GET /api/v1/audit/user-activity/:userId - Get user activity
router.get('/user-activity/:userId', authenticateToken, checkRole(['head_administrator', 'auditor']), auditRateLimit, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;
    
    const auditLogsCollection = await getCollection('audit_logs');
    
    // Build query
    const query = { userId };
    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const userActivity = await auditLogsCollection
      .find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await auditLogsCollection.countDocuments(query);
    
    // Get activity summary
    const activitySummary = await auditLogsCollection.aggregate([
      { $match: { userId } },
      { $group: { 
        _id: '$action', 
        count: { $sum: 1 },
        lastActivity: { $max: '$timestamp' }
      }},
      { $sort: { count: -1 } }
    ]).toArray();
    
    res.json({
      success: true,
      data: {
        userActivity,
        activitySummary,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'User activity retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_USER_ACTIVITY_FAILED',
      message: 'Failed to retrieve user activity',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== SECURITY EVENTS ====================

// GET /api/v1/audit/security-events - Get security events
router.get('/security-events', authenticateToken, checkRole(['head_administrator', 'security']), auditRateLimit, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      severity, 
      type, 
      startDate, 
      endDate 
    } = req.query;
    const skip = (page - 1) * limit;
    
    const securityEventsCollection = await getCollection('security_events');
    
    // Build query
    const query = {};
    if (severity) query.severity = severity;
    if (type) query.type = type;
    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const securityEvents = await securityEventsCollection
      .find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await securityEventsCollection.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        securityEvents,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Security events retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get security events error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_SECURITY_EVENTS_FAILED',
      message: 'Failed to retrieve security events',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/audit/security-events - Create security event
router.post('/security-events', authenticateToken, checkRole(['head_administrator', 'system']), auditRateLimit, async (req, res) => {
  try {
    const {
      type,
      severity,
      description,
      userId,
      ipAddress,
      userAgent,
      metadata,
      resolved
    } = req.body;
    
    if (!type || !severity || !description) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Type, severity, and description are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const securityEventsCollection = await getCollection('security_events');
    
    const newSecurityEvent = {
      type,
      severity,
      description,
      userId: userId || null,
      ipAddress: ipAddress || req.ip,
      userAgent: userAgent || req.get('User-Agent'),
      metadata: metadata || {},
      resolved: resolved || false,
      timestamp: new Date(),
      createdAt: new Date()
    };
    
    const result = await securityEventsCollection.insertOne(newSecurityEvent);
    
    res.status(201).json({
      success: true,
      data: { securityEvent: { ...newSecurityEvent, _id: result.insertedId } },
      message: 'Security event created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create security event error:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_SECURITY_EVENT_FAILED',
      message: 'Failed to create security event',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== COMPLIANCE REPORTING ====================

// GET /api/v1/audit/compliance-report - Generate compliance report
router.get('/compliance-report', authenticateToken, checkRole(['head_administrator', 'compliance']), auditRateLimit, async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      reportType = 'general',
      format = 'json'
    } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_DATE_RANGE',
        message: 'Start date and end date are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const auditLogsCollection = await getCollection('audit_logs');
    const securityEventsCollection = await getCollection('security_events');
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Get audit logs for the period
    const auditLogs = await auditLogsCollection.find({
      timestamp: { $gte: start, $lte: end }
    }).toArray();
    
    // Get security events for the period
    const securityEvents = await securityEventsCollection.find({
      timestamp: { $gte: start, $lte: end }
    }).toArray();
    
    // Generate compliance metrics
    const totalActivities = auditLogs.length;
    const uniqueUsers = [...new Set(auditLogs.map(log => log.userId))].length;
    const securityIncidents = securityEvents.filter(event => event.severity === 'high' || event.severity === 'critical').length;
    
    // Action distribution
    const actionDistribution = auditLogs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {});
    
    // Resource distribution
    const resourceDistribution = auditLogs.reduce((acc, log) => {
      acc[log.resource] = (acc[log.resource] || 0) + 1;
      return acc;
    }, {});
    
    // Security event distribution
    const securityEventDistribution = securityEvents.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {});
    
    const complianceReport = {
      reportType,
      period: {
        startDate: start,
        endDate: end
      },
      summary: {
        totalActivities,
        uniqueUsers,
        securityIncidents,
        complianceScore: Math.max(0, 100 - (securityIncidents * 10)) // Simple scoring
      },
      distributions: {
        actions: actionDistribution,
        resources: resourceDistribution,
        securityEvents: securityEventDistribution
      },
      generatedAt: new Date(),
      generatedBy: req.user.userId
    };
    
    res.json({
      success: true,
      data: complianceReport,
      message: 'Compliance report generated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Generate compliance report error:', error);
    res.status(500).json({
      success: false,
      error: 'GENERATE_COMPLIANCE_REPORT_FAILED',
      message: 'Failed to generate compliance report',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== AUDIT ANALYTICS ====================

// GET /api/v1/audit/analytics - Get audit analytics
router.get('/analytics', authenticateToken, checkRole(['head_administrator', 'auditor']), auditRateLimit, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    const auditLogsCollection = await getCollection('audit_logs');
    const securityEventsCollection = await getCollection('security_events');
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(period.replace('d', '')));
    
    // Audit log statistics
    const totalAuditLogs = await auditLogsCollection.countDocuments();
    const recentAuditLogs = await auditLogsCollection.countDocuments({
      timestamp: { $gte: startDate, $lte: endDate }
    });
    
    // Security event statistics
    const totalSecurityEvents = await securityEventsCollection.countDocuments();
    const recentSecurityEvents = await securityEventsCollection.countDocuments({
      timestamp: { $gte: startDate, $lte: endDate }
    });
    
    // Most active users
    const activeUsers = await auditLogsCollection.aggregate([
      { $match: { timestamp: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$userId', activityCount: { $sum: 1 } } },
      { $sort: { activityCount: -1 } },
      { $limit: 10 }
    ]).toArray();
    
    // Most common actions
    const commonActions = await auditLogsCollection.aggregate([
      { $match: { timestamp: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]).toArray();
    
    // Most accessed resources
    const accessedResources = await auditLogsCollection.aggregate([
      { $match: { timestamp: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$resource', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]).toArray();
    
    // Security event types
    const securityEventTypes = await securityEventsCollection.aggregate([
      { $match: { timestamp: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    // Daily activity trend
    const dailyActivity = await auditLogsCollection.aggregate([
      { $match: { timestamp: { $gte: startDate, $lte: endDate } } },
      { $group: { 
        _id: { 
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' }
        },
        count: { $sum: 1 }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]).toArray();
    
    const analytics = {
      overview: {
        totalAuditLogs,
        recentAuditLogs,
        totalSecurityEvents,
        recentSecurityEvents
      },
      topUsers: activeUsers,
      topActions: commonActions,
      topResources: accessedResources,
      securityEvents: securityEventTypes,
      dailyActivity,
      period,
      generatedAt: new Date()
    };
    
    res.json({
      success: true,
      data: analytics,
      message: 'Audit analytics retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get audit analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_AUDIT_ANALYTICS_FAILED',
      message: 'Failed to retrieve audit analytics',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== GENERIC HANDLERS ====================

// GET /api/v1/audit - Get audit overview
router.get('/', authenticateToken, checkRole(['head_administrator', 'auditor']), auditRateLimit, async (req, res) => {
  res.json({
    success: true,
    message: 'Audit Trail API is running',
    endpoints: {
      logs: '/api/v1/audit/logs',
      userActivity: '/api/v1/audit/user-activity/:userId',
      securityEvents: '/api/v1/audit/security-events',
      complianceReport: '/api/v1/audit/compliance-report',
      analytics: '/api/v1/audit/analytics'
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
