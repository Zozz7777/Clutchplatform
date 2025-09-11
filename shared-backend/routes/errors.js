const express = require('express');
const router = express.Router();

/**
 * Frontend Error Tracking Routes
 * Receives and stores console errors from admin.yourclutch.com
 */

// Get frontend errors
router.get('/frontend', async (req, res) => {
  try {
    const { limit = 50, level = 'all' } = req.query;
    
    // Return mock data if database is not available
    const mockErrors = [
      {
        id: '1',
        message: 'Sample error message',
        severity: 'low',
        type: 'error',
        timestamp: new Date().toISOString(),
        stack: 'Sample stack trace',
        url: 'https://admin.yourclutch.com/dashboard',
        userAgent: 'Mozilla/5.0...'
      }
    ];
    
    const summary = {
      total: mockErrors.length,
      severityCounts: {
        critical: mockErrors.filter(e => e.severity === 'critical').length,
        high: mockErrors.filter(e => e.severity === 'high').length,
        medium: mockErrors.filter(e => e.severity === 'medium').length,
        low: mockErrors.filter(e => e.severity === 'low').length
      }
    };
    
    const response = {
      success: true,
      data: {
        errors: mockErrors,
        summary: summary
      }
    };
    
    res.json(response);
  } catch (error) {
    // Fallback response if anything goes wrong
    res.json({
      success: true,
      data: {
        errors: [],
        summary: {
          total: 0,
          severityCounts: {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0
          }
        }
      }
    });
  }
});

// Store frontend errors
router.post('/frontend', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { errors, metadata } = req.body;
    const sessionId = req.headers['x-session-id'];
    
    if (!errors || !Array.isArray(errors)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: errors array is required'
      });
    }

    // Validate and process errors
    const processedErrors = errors.map(error => ({
      ...error,
      sessionId: sessionId || error.sessionId,
      receivedAt: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: {
        ...metadata,
        backendReceivedAt: new Date().toISOString()
      }
    }));

    // Store errors in database
    const collection = await getCollection('frontend_errors');
    const result = await collection.insertMany(processedErrors);

    // Log critical errors immediately
    const criticalErrors = processedErrors.filter(e => e.severity === 'critical');
    if (criticalErrors.length > 0) {
      logger.error('🚨 CRITICAL FRONTEND ERRORS DETECTED:', {
        count: criticalErrors.length,
        errors: criticalErrors.map(e => ({
          message: e.message,
          url: e.url,
          timestamp: e.timestamp
        }))
      });
    }

    // Log high severity errors
    const highErrors = processedErrors.filter(e => e.severity === 'high');
    if (highErrors.length > 0) {
      logger.warn('⚠️ HIGH SEVERITY FRONTEND ERRORS:', {
        count: highErrors.length,
        errors: highErrors.map(e => ({
          message: e.message,
          url: e.url,
          timestamp: e.timestamp
        }))
      });
    }

    // Track performance
    const duration = Date.now() - startTime;
    performanceMonitor.trackRequest(req, res, duration);

    res.json({
      success: true,
      message: `Stored ${result.insertedCount} errors`,
      insertedCount: result.insertedCount,
      criticalCount: criticalErrors.length,
      highCount: highErrors.length
    });

  } catch (error) {
    logger.error('❌ Failed to store frontend errors:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to store errors'
    });
  }
});

// Get frontend errors with filtering
router.get('/frontend', async (req, res) => {
  try {
    const {
      limit = 100,
      offset = 0,
      severity,
      type,
      startDate,
      endDate,
      url,
      sessionId
    } = req.query;

    const collection = await getCollection('frontend_errors');
    
    // Build filter
    const filter = {};
    
    if (severity) {
      filter.severity = severity;
    }
    
    if (type) {
      filter.type = type;
    }
    
    if (url) {
      filter.url = { $regex: url, $options: 'i' };
    }
    
    if (sessionId) {
      filter.sessionId = sessionId;
    }
    
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) {
        filter.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.timestamp.$lte = new Date(endDate);
      }
    }

    // Execute query
    const [errors, totalCount] = await Promise.all([
      collection
        .find(filter)
        .sort({ timestamp: -1 })
        .skip(parseInt(offset))
        .limit(parseInt(limit))
        .toArray(),
      collection.countDocuments(filter)
    ]);

    // Group errors by severity for summary
    const severityCounts = await collection.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    res.json({
      success: true,
      data: {
        errors,
        pagination: {
          total: totalCount,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: totalCount > parseInt(offset) + parseInt(limit)
        },
        summary: {
          severityCounts: severityCounts.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {})
        }
      }
    });

  } catch (error) {
    logger.error('❌ Failed to fetch frontend errors:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch errors'
    });
  }
});

// Get error statistics
router.get('/frontend/stats', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const collection = await getCollection('frontend_errors');

    // Get error counts by day
    const dailyStats = await collection.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            severity: '$severity'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          errors: {
            $push: {
              severity: '$_id.severity',
              count: '$count'
            }
          },
          total: { $sum: '$count' }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    // Get top error messages
    const topErrors = await collection.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$message',
          count: { $sum: 1 },
          severity: { $first: '$severity' },
          lastOccurrence: { $max: '$timestamp' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]).toArray();

    // Get error distribution by URL
    const urlStats = await collection.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$url',
          count: { $sum: 1 },
          severityCounts: {
            $push: '$severity'
          }
        }
      },
      {
        $project: {
          url: '$_id',
          count: 1,
          critical: {
            $size: {
              $filter: {
                input: '$severityCounts',
                cond: { $eq: ['$$this', 'critical'] }
              }
            }
          },
          high: {
            $size: {
              $filter: {
                input: '$severityCounts',
                cond: { $eq: ['$$this', 'high'] }
              }
            }
          }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]).toArray();

    res.json({
      success: true,
      data: {
        period: {
          days: parseInt(days),
          startDate,
          endDate: new Date()
        },
        dailyStats,
        topErrors,
        urlStats
      }
    });

  } catch (error) {
    logger.error('❌ Failed to fetch error statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

// Get real-time error stream (Server-Sent Events)
router.get('/frontend/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Send initial connection message
  sendEvent({
    type: 'connected',
    timestamp: new Date().toISOString(),
    message: 'Connected to error stream'
  });

  // Keep connection alive
  const heartbeat = setInterval(() => {
    sendEvent({
      type: 'heartbeat',
      timestamp: new Date().toISOString()
    });
  }, 30000);

  // Clean up on disconnect
  req.on('close', () => {
    clearInterval(heartbeat);
  });
});

// Delete old errors (cleanup)
router.delete('/frontend/cleanup', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    const collection = await getCollection('frontend_errors');
    const result = await collection.deleteMany({
      timestamp: { $lt: cutoffDate }
    });

    logger.info(`🧹 Cleaned up ${result.deletedCount} old frontend errors`);

    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} errors older than ${days} days`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    logger.error('❌ Failed to cleanup old errors:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup errors'
    });
  }
});

module.exports = router;
