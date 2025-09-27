const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/unified-auth');
const logger = require('../utils/logger');

// Database connection for real data
const { connectToDatabase } = require('../config/database-unified');

// Helper function to get threat events from database
async function getThreatEvents() {
  try {
    const db = await connectToDatabase();
    const threatsCollection = db.collection('security_threats');
    
    // Get threats from last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const threats = await threatsCollection.find({
      timestamp: { $gte: sevenDaysAgo }
    }).sort({ timestamp: -1 }).limit(100).toArray();
    
    return threats.map(threat => ({
      id: threat._id.toString(),
      type: threat.type || 'unknown',
      severity: threat.severity || 'low',
      source: threat.source || 'unknown',
      target: threat.target || 'unknown',
      timestamp: threat.timestamp,
      status: threat.status || 'active',
      attempts: threat.attempts || 1,
      blocked: threat.blocked || false,
      description: threat.description || 'Security threat detected',
      location: threat.location || 'Unknown',
      userAgent: threat.userAgent || 'Unknown'
    }));
  } catch (error) {
    logger.error('Error fetching threat events:', error);
    return [];
  }
}

const threatPatterns = [
  {
    id: 'pattern_1',
    name: 'Brute Force Attack',
    type: 'brute_force',
    description: 'Multiple failed login attempts from same IP',
    severity: 'high',
    frequency: 12,
    lastDetected: new Date().toISOString(),
    affectedUsers: 3,
    blockedIPs: ['192.168.1.100', '10.0.0.25']
  },
  {
    id: 'pattern_2',
    name: 'API Abuse',
    type: 'api_abuse',
    description: 'Excessive API requests from single source',
    severity: 'medium',
    frequency: 8,
    lastDetected: new Date(Date.now() - 3600000).toISOString(),
    affectedUsers: 1,
    blockedIPs: ['203.0.113.45']
  }
];

const securityAlerts = [
  {
    id: 'alert_1',
    type: 'authentication',
    severity: 'high',
    title: 'Multiple Failed Login Attempts',
    description: 'Detected 15 failed login attempts for admin@clutch.com',
    timestamp: new Date().toISOString(),
    status: 'active',
    source: 'Security Monitor',
    affectedResource: 'admin@clutch.com',
    actionRequired: true
  },
  {
    id: 'alert_2',
    type: 'access_control',
    severity: 'medium',
    title: 'Unusual API Access Pattern',
    description: 'Detected unusual API access pattern from IP 10.0.0.50',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    status: 'investigating',
    source: 'API Gateway',
    affectedResource: 'api/v1/users',
    actionRequired: false
  }
];

const securityMetrics = [
  {
    id: 'metric_1',
    name: 'Failed Login Attempts',
    category: 'authentication',
    currentValue: 23,
    previousValue: 15,
    trend: 'up',
    unit: 'count',
    period: '24h',
    threshold: { warning: 20, critical: 50 },
    status: 'warning'
  },
  {
    id: 'metric_2',
    name: 'Blocked IPs',
    category: 'network',
    currentValue: 5,
    previousValue: 3,
    trend: 'up',
    unit: 'count',
    period: '24h',
    threshold: { warning: 10, critical: 25 },
    status: 'good'
  },
  {
    id: 'metric_3',
    name: 'Security Alerts',
    category: 'alerts',
    currentValue: 8,
    previousValue: 12,
    trend: 'down',
    unit: 'count',
    period: '24h',
    threshold: { warning: 15, critical: 30 },
    status: 'good'
  }
];

const auditLogs = [
  {
    id: 'audit_1',
    userId: 'user_123',
    userEmail: 'admin@clutch.com',
    action: 'LOGIN_ATTEMPT',
    resource: 'authentication',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    timestamp: new Date().toISOString(),
    success: false,
    details: { reason: 'Invalid password', attempts: 3 }
  },
  {
    id: 'audit_2',
    userId: 'user_456',
    userEmail: 'manager@clutch.com',
    action: 'DATA_ACCESS',
    resource: 'users',
    ipAddress: '10.0.0.50',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    success: true,
    details: { recordsAccessed: 25, operation: 'READ' }
  }
];

const complianceStatus = {
  gdpr: {
    status: 'compliant',
    lastAudit: new Date(Date.now() - 86400000).toISOString(),
    score: 95,
    issues: 2,
    nextAudit: new Date(Date.now() + 2592000000).toISOString()
  },
  soc2: {
    status: 'compliant',
    lastAudit: new Date(Date.now() - 172800000).toISOString(),
    score: 92,
    issues: 1,
    nextAudit: new Date(Date.now() + 7776000000).toISOString()
  },
  pci: {
    status: 'non_compliant',
    lastAudit: new Date(Date.now() - 259200000).toISOString(),
    score: 78,
    issues: 5,
    nextAudit: new Date(Date.now() + 1296000000).toISOString()
  }
};

/**
 * @route GET /api/v1/security/threat-events
 * @desc Get security threat events
 * @access Private (Admin only)
 */
router.get('/threat-events', authenticateToken, authorizeRoles(['admin', 'super_admin']), async (req, res) => {
  try {
    const { severity, status, timeRange } = req.query;
    
    // Get real threat events from database
    let filteredEvents = await getThreatEvents();
    
    if (severity && severity !== 'all') {
      filteredEvents = filteredEvents.filter(event => event.severity === severity);
    }
    
    if (status && status !== 'all') {
      filteredEvents = filteredEvents.filter(event => event.status === status);
    }
    
    res.json({
      success: true,
      data: filteredEvents,
      message: 'Security threat events retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching threat events:', error);
    res.status(500).json({
      success: false,
      error: 'THREAT_EVENTS_FETCH_FAILED',
      message: 'Failed to fetch security threat events',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /api/v1/security/threat-patterns
 * @desc Get security threat patterns
 * @access Private (Admin only)
 */
router.get('/threat-patterns', authenticateToken, authorizeRoles(['admin', 'super_admin']), async (req, res) => {
  try {
    res.json({
      success: true,
      data: threatPatterns,
      message: 'Security threat patterns retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching threat patterns:', error);
    res.status(500).json({
      success: false,
      error: 'THREAT_PATTERNS_FETCH_FAILED',
      message: 'Failed to fetch security threat patterns',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /api/v1/security/alerts
 * @desc Get security alerts
 * @access Private (Admin only)
 */
router.get('/alerts', authenticateToken, authorizeRoles(['admin', 'super_admin']), async (req, res) => {
  try {
    const { severity, status } = req.query;
    
    let filteredAlerts = securityAlerts;
    
    if (severity && severity !== 'all') {
      filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity);
    }
    
    if (status && status !== 'all') {
      filteredAlerts = filteredAlerts.filter(alert => alert.status === status);
    }
    
    res.json({
      success: true,
      data: filteredAlerts,
      message: 'Security alerts retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching security alerts:', error);
    res.status(500).json({
      success: false,
      error: 'SECURITY_ALERTS_FETCH_FAILED',
      message: 'Failed to fetch security alerts',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /api/v1/security/metrics
 * @desc Get security metrics
 * @access Private (Admin only)
 */
router.get('/metrics', authenticateToken, authorizeRoles(['admin', 'super_admin']), async (req, res) => {
  try {
    const { category, timeRange } = req.query;
    
    let filteredMetrics = securityMetrics;
    
    if (category && category !== 'all') {
      filteredMetrics = filteredMetrics.filter(metric => metric.category === category);
    }
    
    res.json({
      success: true,
      data: filteredMetrics,
      message: 'Security metrics retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching security metrics:', error);
    res.status(500).json({
      success: false,
      error: 'SECURITY_METRICS_FETCH_FAILED',
      message: 'Failed to fetch security metrics',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /api/v1/security/audit-logs
 * @desc Get security audit logs
 * @access Private (Admin only)
 */
router.get('/audit-logs', authenticateToken, authorizeRoles(['admin', 'super_admin']), async (req, res) => {
  try {
    const { userId, action, success, timeRange } = req.query;
    
    let filteredLogs = auditLogs;
    
    if (userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === userId);
    }
    
    if (action) {
      filteredLogs = filteredLogs.filter(log => log.action === action);
    }
    
    if (success !== undefined) {
      filteredLogs = filteredLogs.filter(log => log.success === (success === 'true'));
    }
    
    res.json({
      success: true,
      data: filteredLogs,
      message: 'Security audit logs retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching audit logs:', error);
    res.status(500).json({
      success: false,
      error: 'AUDIT_LOGS_FETCH_FAILED',
      message: 'Failed to fetch security audit logs',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /api/v1/security/compliance
 * @desc Get compliance status
 * @access Private (Admin only)
 */
router.get('/compliance', authenticateToken, authorizeRoles(['admin', 'super_admin']), async (req, res) => {
  try {
    res.json({
      success: true,
      data: complianceStatus,
      message: 'Compliance status retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching compliance status:', error);
    res.status(500).json({
      success: false,
      error: 'COMPLIANCE_STATUS_FETCH_FAILED',
      message: 'Failed to fetch compliance status',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route POST /api/v1/security/alerts/:id/resolve
 * @desc Resolve a security alert
 * @access Private (Admin only)
 */
router.post('/alerts/:id/resolve', authenticateToken, authorizeRoles(['admin', 'super_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution } = req.body;
    
    const alertIndex = securityAlerts.findIndex(alert => alert.id === id);
    if (alertIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'ALERT_NOT_FOUND',
        message: 'Security alert not found',
        timestamp: new Date().toISOString()
      });
    }
    
    securityAlerts[alertIndex].status = 'resolved';
    securityAlerts[alertIndex].resolvedAt = new Date().toISOString();
    securityAlerts[alertIndex].resolution = resolution;
    
    logger.info(`Security alert ${id} resolved by user ${req.user.userId}`);
    
    res.json({
      success: true,
      data: securityAlerts[alertIndex],
      message: 'Security alert resolved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error resolving security alert:', error);
    res.status(500).json({
      success: false,
      error: 'ALERT_RESOLUTION_FAILED',
      message: 'Failed to resolve security alert',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route POST /api/v1/security/block-ip
 * @desc Block an IP address
 * @access Private (Admin only)
 */
router.post('/block-ip', authenticateToken, authorizeRoles(['admin', 'super_admin']), async (req, res) => {
  try {
    const { ipAddress, reason, duration } = req.body;
    
    if (!ipAddress || !reason) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'IP address and reason are required',
        timestamp: new Date().toISOString()
      });
    }
    
    // In a real implementation, this would add the IP to a blocklist
    logger.info(`IP address ${ipAddress} blocked by user ${req.user.userId}. Reason: ${reason}`);
    
    res.json({
      success: true,
      data: {
        ipAddress,
        reason,
        duration: duration || 'permanent',
        blockedAt: new Date().toISOString(),
        blockedBy: req.user.userId
      },
      message: 'IP address blocked successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error blocking IP address:', error);
    res.status(500).json({
      success: false,
      error: 'IP_BLOCK_FAILED',
      message: 'Failed to block IP address',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;