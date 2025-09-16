const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole } = require('../middleware/auth');
const { checkRole, checkPermission } = require('../middleware/rbac');
const logger = require('../utils/logger');

// ============================================================================
// ERROR TRACKING ENDPOINTS
// ============================================================================

// POST /errors/frontend - Track frontend errors
router.post('/frontend', async (req, res) => {
  try {
    const { 
      error, 
      stack, 
      url, 
      userAgent, 
      userId, 
      sessionId, 
      timestamp, 
      severity,
      component,
      action,
      metadata 
    } = req.body;

    // Validate required fields
    if (!error || !stack || !url) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Error, stack, and url are required fields',
        timestamp: new Date().toISOString()
      });
    }

    // Create error record
    const errorRecord = {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      error: error,
      stack: stack,
      url: url,
      userAgent: userAgent || req.get('User-Agent'),
      userId: userId || null,
      sessionId: sessionId || null,
      timestamp: timestamp || new Date().toISOString(),
      severity: severity || 'error',
      component: component || 'unknown',
      action: action || 'unknown',
      metadata: metadata || {},
      ip: req.ip,
      resolved: false,
      createdAt: new Date().toISOString()
    };

    // Log the error for monitoring
    logger.error('Frontend Error Captured:', {
      id: errorRecord.id,
      error: error,
      url: url,
      userId: userId,
      severity: severity,
      component: component
    });

    // In a real application, you would save this to a database
    // For now, we'll just return success
    res.json({
      success: true,
      data: { 
        errorId: errorRecord.id,
        error: errorRecord
      },
      message: 'Frontend error tracked successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Track frontend error failed:', error);
    res.status(500).json({
      success: false,
      error: 'TRACK_FRONTEND_ERROR_FAILED',
      message: 'Failed to track frontend error',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /errors/frontend - Get frontend errors (admin only)
router.get('/frontend', authenticateToken, checkRole(['head_administrator', 'technology_admin']), async (req, res) => {
  try {
    const { page = 1, limit = 20, severity, component, resolved, dateFrom, dateTo } = req.query;
    
    // Mock error data - in real app, fetch from database
    const errors = [
      {
        id: 'error-1',
        error: 'TypeError: Cannot read property "length" of undefined',
        stack: 'at Component.render (Component.js:45:12)\n  at ReactDOM.render (ReactDOM.js:123:45)',
        url: 'https://clutch-admin.com/dashboard',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        userId: 'user-123',
        sessionId: 'session-456',
        timestamp: new Date().toISOString(),
        severity: 'error',
        component: 'Dashboard',
        action: 'render',
        metadata: { 
          props: { userId: 'user-123' },
          state: { loading: false }
        },
        ip: '192.168.1.100',
        resolved: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'error-2',
        error: 'NetworkError: Failed to fetch',
        stack: 'at fetch (fetch.js:23:15)\n  at apiCall (api.js:67:8)',
        url: 'https://clutch-admin.com/users',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        userId: 'user-456',
        sessionId: 'session-789',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        severity: 'warning',
        component: 'UserList',
        action: 'fetchUsers',
        metadata: { 
          endpoint: '/api/v1/users',
          method: 'GET'
        },
        ip: '192.168.1.101',
        resolved: true,
        createdAt: new Date(Date.now() - 3600000).toISOString()
      }
    ];

    // Filter errors based on query parameters
    let filteredErrors = errors;
    
    if (severity) {
      filteredErrors = filteredErrors.filter(e => e.severity === severity);
    }
    
    if (component) {
      filteredErrors = filteredErrors.filter(e => e.component.toLowerCase().includes(component.toLowerCase()));
    }
    
    if (resolved !== undefined) {
      filteredErrors = filteredErrors.filter(e => e.resolved === (resolved === 'true'));
    }

    res.json({
      success: true,
      data: { 
        errors: filteredErrors,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredErrors.length,
          pages: Math.ceil(filteredErrors.length / limit)
        },
        summary: {
          total: errors.length,
          resolved: errors.filter(e => e.resolved).length,
          unresolved: errors.filter(e => !e.resolved).length,
          bySeverity: {
            error: errors.filter(e => e.severity === 'error').length,
            warning: errors.filter(e => e.severity === 'warning').length,
            info: errors.filter(e => e.severity === 'info').length
          }
        }
      },
      message: 'Frontend errors retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Get frontend errors error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_FRONTEND_ERRORS_FAILED',
      message: 'Failed to get frontend errors',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /errors/frontend/:id/resolve - Mark error as resolved
router.put('/frontend/:id/resolve', authenticateToken, checkRole(['head_administrator', 'technology_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution, notes } = req.body;

    // In a real app, update the error in database
    const resolvedError = {
      id: id,
      resolved: true,
      resolvedAt: new Date().toISOString(),
      resolvedBy: req.user.email,
      resolution: resolution || 'Marked as resolved',
      notes: notes || '',
      updatedAt: new Date().toISOString()
    };

    logger.info('Frontend Error Resolved:', {
      errorId: id,
      resolvedBy: req.user.email,
      resolution: resolution
    });

    res.json({
      success: true,
      data: { error: resolvedError },
      message: 'Frontend error marked as resolved',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Resolve frontend error error:', error);
    res.status(500).json({
      success: false,
      error: 'RESOLVE_FRONTEND_ERROR_FAILED',
      message: 'Failed to resolve frontend error',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /errors/frontend/stats - Get error statistics
router.get('/frontend/stats', authenticateToken, checkRole(['head_administrator', 'technology_admin']), async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    const stats = {
      period: period,
      overview: {
        totalErrors: 1250,
        resolvedErrors: 1100,
        unresolvedErrors: 150,
        errorRate: 2.5,
        averageResolutionTime: '4.2 hours'
      },
      trends: {
        daily: [
          { date: '2024-09-08', errors: 45, resolved: 42 },
          { date: '2024-09-09', errors: 38, resolved: 35 },
          { date: '2024-09-10', errors: 52, resolved: 48 },
          { date: '2024-09-11', errors: 41, resolved: 39 },
          { date: '2024-09-12', errors: 47, resolved: 44 },
          { date: '2024-09-13', errors: 39, resolved: 36 },
          { date: '2024-09-14', errors: 43, resolved: 40 }
        ]
      },
      bySeverity: {
        error: { count: 850, percentage: 68.0 },
        warning: { count: 300, percentage: 24.0 },
        info: { count: 100, percentage: 8.0 }
      },
      byComponent: [
        { component: 'Dashboard', count: 320, percentage: 25.6 },
        { component: 'UserList', count: 280, percentage: 22.4 },
        { component: 'OrderForm', count: 200, percentage: 16.0 },
        { component: 'Analytics', count: 180, percentage: 14.4 },
        { component: 'Settings', count: 150, percentage: 12.0 },
        { component: 'Other', count: 120, percentage: 9.6 }
      ],
      topErrors: [
        { error: 'TypeError: Cannot read property "length" of undefined', count: 45 },
        { error: 'NetworkError: Failed to fetch', count: 38 },
        { error: 'ReferenceError: variable is not defined', count: 32 },
        { error: 'SyntaxError: Unexpected token', count: 28 },
        { error: 'RangeError: Maximum call stack exceeded', count: 25 }
      ]
    };

    res.json({
      success: true,
      data: { stats },
      message: 'Frontend error statistics retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Get frontend error stats error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_FRONTEND_ERROR_STATS_FAILED',
      message: 'Failed to get frontend error statistics',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;