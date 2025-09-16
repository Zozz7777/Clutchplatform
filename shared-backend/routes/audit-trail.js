/**
 * Audit Trail Routes
 * Complete audit trail system with activity logging and compliance tracking
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { getCollection } = require('../config/optimized-database');
const { rateLimit: createRateLimit } = require('../middleware/rateLimit');
const { ObjectId } = require('mongodb');

// Apply rate limiting
const auditRateLimit = createRateLimit({ windowMs: 60 * 1000, max: 100 });

// ==================== AUDIT LOG MANAGEMENT ====================

// GET /api/audit-trail - Get audit trail logs
router.get('/', authenticateToken, requireRole(['admin', 'auditor', 'super_admin']), auditRateLimit, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      userId, 
      action, 
      resource, 
      dateFrom, 
      dateTo,
      severity,
      search 
    } = req.query;
    const skip = (page - 1) * limit;
    
    const auditCollection = await getCollection('audit_logs');
    
    // Build query
    const query = {};
    if (userId) query.userId = userId;
    if (action) query.action = action;
    if (resource) query.resource = resource;
    if (severity) query.severity = severity;
    if (dateFrom || dateTo) {
      query.timestamp = {};
      if (dateFrom) query.timestamp.$gte = new Date(dateFrom);
      if (dateTo) query.timestamp.$lte = new Date(dateTo);
    }
    if (search) {
      query.$or = [
        { action: { $regex: search, $options: 'i' } },
        { resource: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } }
      ];
    }
    
    const auditLogs = await auditCollection
      .find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await auditCollection.countDocuments(query);
    
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
      message: 'Audit trail retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get audit trail error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_AUDIT_TRAIL_FAILED',
      message: 'Failed to retrieve audit trail',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/audit-trail/:id - Get audit log by ID
router.get('/:id', authenticateToken, requireRole(['admin', 'auditor', 'super_admin']), auditRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const auditCollection = await getCollection('audit_logs');
    
    const auditLog = await auditCollection.findOne({ _id: new ObjectId(id) });
    
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

// POST /api/audit-trail - Create audit log entry
router.post('/', authenticateToken, requireRole(['admin', 'auditor', 'super_admin']), auditRateLimit, async (req, res) => {
  try {
    const {
      action,
      resource,
      resourceId,
      description,
      severity = 'info',
      metadata = {},
      ipAddress,
      userAgent
    } = req.body;
    
    if (!action || !resource) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Action and resource are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const auditCollection = await getCollection('audit_logs');
    
    const auditLog = {
      action,
      resource,
      resourceId: resourceId || null,
      description: description || null,
      severity,
      userId: req.user.userId,
      userEmail: req.user.email,
      userName: req.user.name,
      metadata,
      ipAddress: ipAddress || req.ip,
      userAgent: userAgent || req.get('User-Agent'),
      timestamp: new Date()
    };
    
    const result = await auditCollection.insertOne(auditLog);
    
    res.status(201).json({
      success: true,
      data: { auditLog: { ...auditLog, _id: result.insertedId } },
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

// ==================== AUDIT ANALYTICS ====================

// GET /api/audit-trail/analytics - Get audit analytics
router.get('/analytics', authenticateToken, requireRole(['admin', 'auditor', 'super_admin']), auditRateLimit, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    const auditCollection = await getCollection('audit_logs');
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(period.replace('d', '')));
    
    // Total audit logs
    const totalLogs = await auditCollection.countDocuments();
    const periodLogs = await auditCollection.countDocuments({
      timestamp: { $gte: startDate, $lte: endDate }
    });
    
    // Logs by action
    const logsByAction = await auditCollection.aggregate([
      { $match: { timestamp: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    // Logs by resource
    const logsByResource = await auditCollection.aggregate([
      { $match: { timestamp: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$resource', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    // Logs by severity
    const logsBySeverity = await auditCollection.aggregate([
      { $match: { timestamp: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$severity', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    // Most active users
    const mostActiveUsers = await auditCollection.aggregate([
      { $match: { timestamp: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$userId', userEmail: { $first: '$userEmail' }, userName: { $first: '$userName' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]).toArray();
    
    // Daily activity
    const dailyActivity = await auditCollection.aggregate([
      { $match: { timestamp: { $gte: startDate, $lte: endDate } } },
      { 
        $group: { 
          _id: { 
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' },
            day: { $dayOfMonth: '$timestamp' }
          }, 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]).toArray();
    
    const analytics = {
      overview: {
        total: totalLogs,
        period: periodLogs
      },
      byAction: logsByAction,
      byResource: logsByResource,
      bySeverity: logsBySeverity,
      mostActiveUsers,
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

// ==================== COMPLIANCE REPORTS ====================

// GET /api/audit-trail/compliance - Get compliance report
router.get('/compliance', authenticateToken, requireRole(['admin', 'auditor', 'compliance_officer', 'super_admin']), auditRateLimit, async (req, res) => {
  try {
    const { period = '90d', format = 'json' } = req.query;
    
    const auditCollection = await getCollection('audit_logs');
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(period.replace('d', '')));
    
    // Critical actions (security-related)
    const criticalActions = await auditCollection.countDocuments({
      timestamp: { $gte: startDate, $lte: endDate },
      $or: [
        { action: { $regex: /login|logout|password|auth/i } },
        { action: { $regex: /delete|remove|destroy/i } },
        { action: { $regex: /permission|role|access/i } },
        { severity: 'critical' }
      ]
    });
    
    // Failed actions
    const failedActions = await auditCollection.countDocuments({
      timestamp: { $gte: startDate, $lte: endDate },
      severity: 'error'
    });
    
    // Data access logs
    const dataAccessLogs = await auditCollection.countDocuments({
      timestamp: { $gte: startDate, $lte: endDate },
      action: { $regex: /read|view|access|export/i }
    });
    
    // User activity summary
    const userActivity = await auditCollection.aggregate([
      { $match: { timestamp: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$userId', userEmail: { $first: '$userEmail' }, userName: { $first: '$userName' }, actions: { $sum: 1 } } },
      { $sort: { actions: -1 } }
    ]).toArray();
    
    const complianceReport = {
      period: {
        start: startDate,
        end: endDate,
        days: parseInt(period.replace('d', ''))
      },
      summary: {
        totalLogs: await auditCollection.countDocuments({ timestamp: { $gte: startDate, $lte: endDate } }),
        criticalActions,
        failedActions,
        dataAccessLogs,
        uniqueUsers: userActivity.length
      },
      userActivity,
      generatedAt: new Date(),
      generatedBy: req.user.userId
    };
    
    res.json({
      success: true,
      data: { complianceReport },
      message: 'Compliance report generated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get compliance report error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_COMPLIANCE_REPORT_FAILED',
      message: 'Failed to generate compliance report',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== AUDIT EXPORT ====================

// GET /api/audit-trail/export - Export audit logs
router.get('/export', authenticateToken, requireRole(['admin', 'auditor', 'super_admin']), auditRateLimit, async (req, res) => {
  try {
    const { format = 'json', dateFrom, dateTo, action, resource } = req.query;
    
    const auditCollection = await getCollection('audit_logs');
    
    // Build query
    const query = {};
    if (dateFrom || dateTo) {
      query.timestamp = {};
      if (dateFrom) query.timestamp.$gte = new Date(dateFrom);
      if (dateTo) query.timestamp.$lte = new Date(dateTo);
    }
    if (action) query.action = action;
    if (resource) query.resource = resource;
    
    const auditLogs = await auditCollection
      .find(query)
      .sort({ timestamp: -1 })
      .toArray();
    
    if (format === 'csv') {
      // Convert to CSV format
      const csvHeaders = 'Timestamp,Action,Resource,User,Severity,Description,IP Address\n';
      const csvData = auditLogs.map(log => 
        `${log.timestamp},${log.action},${log.resource},${log.userEmail},${log.severity},"${log.description || ''}",${log.ipAddress}`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=audit-trail.csv');
      res.send(csvHeaders + csvData);
    } else {
      // JSON format
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=audit-trail.json');
      res.json({
        success: true,
        data: { auditLogs },
        exportedAt: new Date(),
        totalRecords: auditLogs.length
      });
    }
  } catch (error) {
    console.error('Export audit trail error:', error);
    res.status(500).json({
      success: false,
      error: 'EXPORT_AUDIT_TRAIL_FAILED',
      message: 'Failed to export audit trail',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
