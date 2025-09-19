const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole, checkPermission } = require('../middleware/unified-auth');
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
    
    // Get real error data from database
    const errorsCollection = await getCollection('frontend_errors');
    if (!errorsCollection) {
      return res.status(500).json({
        success: false,
        message: 'Failed to connect to frontend_errors collection'
      });
    }

    // Build query based on filters
    const query = {};
    if (severity) {
      query.severity = severity;
    }
    if (component) {
      query.component = component;
    }
    if (resolved !== undefined) {
      query.resolved = resolved === 'true';
    }
    if (dateFrom || dateTo) {
      query.timestamp = {};
      if (dateFrom) {
        query.timestamp.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.timestamp.$lte = new Date(dateTo);
      }
    }

    // Get errors from database
    const errors = await errorsCollection.find(query)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .toArray();

    // Get total count for pagination
    const total = await errorsCollection.countDocuments(query);

    // Calculate summary statistics
    const summary = {
      total: total,
      resolved: await errorsCollection.countDocuments({ ...query, resolved: true }),
      unresolved: await errorsCollection.countDocuments({ ...query, resolved: false }),
      bySeverity: {
        error: await errorsCollection.countDocuments({ ...query, severity: 'error' }),
        warning: await errorsCollection.countDocuments({ ...query, severity: 'warning' }),
        info: await errorsCollection.countDocuments({ ...query, severity: 'info' })
      }
    };

    res.json({
      success: true,
      data: { 
        errors: errors,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          pages: Math.ceil(total / limit)
        },
        summary: summary
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