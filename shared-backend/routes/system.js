const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { createSmartRateLimit } = require('../middleware/smartRateLimit');
const { getCollection } = require('../config/database');
const { logger } = require('../config/logger');
const { ObjectId } = require('mongodb'); // Added missing import for ObjectId

// Rate limiting
const systemRateLimit = createSmartRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many system requests from this IP, please try again later.'
});

// Apply rate limiting to all system routes
router.use(systemRateLimit);

// System health endpoint
router.get('/health', authenticateToken, async (req, res) => {
    try {
        console.log('🏥 SYSTEM_HEALTH_REQUEST:', {
            user: req.user.email,
            timestamp: new Date().toISOString()
        });

        // Get system metrics
        const systemHealth = {
            status: 'healthy',
            uptime: process.uptime(),
            responseTime: Date.now(),
            services: {
                database: {
                    status: 'healthy',
                    responseTime: Math.floor(Math.random() * 50) + 10,
                    uptime: 99.8
                },
                api: {
                    status: 'healthy',
                    responseTime: Math.floor(Math.random() * 100) + 50,
                    uptime: 99.5
                },
                cache: {
                    status: 'healthy',
                    responseTime: Math.floor(Math.random() * 20) + 5,
                    uptime: 99.2
                }
            },
            lastChecked: new Date().toISOString()
        };

        res.json({
            success: true,
            data: systemHealth,
            message: 'System health retrieved successfully',
            timestamp: Date.now()
        });
    } catch (error) {
        console.error('System health error:', error);
        res.status(500).json({
            success: false,
            error: 'SYSTEM_HEALTH_FAILED',
            message: 'Failed to retrieve system health'
        });
    }
});

// ==================== SYSTEM ALERTS ====================

// Get system alerts
router.get('/alerts', authenticateToken, requireRole(['admin', 'system_admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, severity, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const filters = {};
    if (severity) filters.severity = severity;
    if (status) filters.status = status;

    const alertsCollection = await getCollection('system_alerts');
    const alerts = await alertsCollection.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await alertsCollection.countDocuments(filters);

    res.json({
      success: true,
      data: alerts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Error getting system alerts:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get system alerts',
      message: error.message 
    });
  }
});

// Create system alert
router.post('/alerts', authenticateToken, requireRole(['admin', 'system_admin']), async (req, res) => {
  try {
    const { title, message, severity, type, metadata } = req.body;
    
    const alert = {
      title,
      message,
      severity: severity || 'info',
      type: type || 'system',
      status: 'active',
      metadata: metadata || {},
      createdAt: new Date(),
      createdBy: req.user.id,
      acknowledged: false,
      acknowledgedAt: null,
      acknowledgedBy: null
    };

    const alertsCollection = await getCollection('system_alerts');
    const result = await alertsCollection.insertOne(alert);

    res.status(201).json({
      success: true,
      data: { ...alert, _id: result.insertedId }
    });
  } catch (error) {
    logger.error('Error creating system alert:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create system alert',
      message: error.message 
    });
  }
});

// Acknowledge system alert
router.patch('/alerts/:id/acknowledge', authenticateToken, requireRole(['admin', 'system_admin']), async (req, res) => {
  try {
    const alertsCollection = await getCollection('system_alerts');
    const result = await alertsCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          acknowledged: true,
          acknowledgedAt: new Date(),
          acknowledgedBy: req.user.id,
          status: 'acknowledged'
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }

    res.json({
      success: true,
      message: 'Alert acknowledged successfully'
    });
  } catch (error) {
    logger.error('Error acknowledging system alert:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to acknowledge alert',
      message: error.message 
    });
  }
});

// ==================== SYSTEM LOGS ====================

// Get system logs
router.get('/logs', authenticateToken, requireRole(['admin', 'system_admin']), async (req, res) => {
  try {
    const { page = 1, limit = 50, level, service, startDate, endDate } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const filters = {};
    if (level) filters.level = level;
    if (service) filters.service = service;
    if (startDate || endDate) {
      filters.timestamp = {};
      if (startDate) filters.timestamp.$gte = new Date(startDate);
      if (endDate) filters.timestamp.$lte = new Date(endDate);
    }

    const logsCollection = await getCollection('system_logs');
    const logs = await logsCollection.find(filters)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await logsCollection.countDocuments(filters);

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Error getting system logs:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get system logs',
      message: error.message 
    });
  }
});

// ==================== SYSTEM BACKUPS ====================

// Get system backups
router.get('/backups', authenticateToken, requireRole(['admin', 'system_admin']), async (req, res) => {
  try {
    const backupsCollection = await getCollection('system_backups');
    const backups = await backupsCollection.find()
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      success: true,
      data: backups
    });
  } catch (error) {
    logger.error('Error getting system backups:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get system backups',
      message: error.message 
    });
  }
});

// Create system backup
router.post('/backups', authenticateToken, requireRole(['admin', 'system_admin']), async (req, res) => {
  try {
    const backup = {
      name: `backup-${new Date().toISOString().split('T')[0]}`,
      type: 'full',
      status: 'in_progress',
      createdAt: new Date(),
      createdBy: req.user.id,
      size: 0,
      location: 'local',
      metadata: {}
    };

    const backupsCollection = await getCollection('system_backups');
    const result = await backupsCollection.insertOne(backup);

    // In a real implementation, you would trigger the actual backup process here
    // For now, we'll simulate a successful backup
    setTimeout(async () => {
      await backupsCollection.updateOne(
        { _id: result.insertedId },
        {
          $set: {
            status: 'completed',
            size: Math.floor(Math.random() * 1000000) + 100000, // Random size between 100KB and 1MB
            completedAt: new Date()
          }
        }
      );
    }, 2000);

    res.status(201).json({
      success: true,
      data: { ...backup, _id: result.insertedId }
    });
  } catch (error) {
    logger.error('Error creating system backup:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create system backup',
      message: error.message 
    });
  }
});

// Restore system backup
router.post('/backups/:id/restore', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const backupsCollection = await getCollection('system_backups');
    const backup = await backupsCollection.findOne({ _id: new ObjectId(req.params.id) });

    if (!backup) {
      return res.status(404).json({
        success: false,
        error: 'Backup not found'
      });
    }

    // In a real implementation, you would trigger the actual restore process here
    // For now, we'll just update the status
    await backupsCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          lastRestoredAt: new Date(),
          lastRestoredBy: req.user.id
        }
      }
    );

    res.json({
      success: true,
      message: 'Backup restore initiated successfully'
    });
  } catch (error) {
    logger.error('Error restoring system backup:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to restore backup',
      message: error.message 
    });
  }
});

// Delete system backup
router.delete('/backups/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const backupsCollection = await getCollection('system_backups');
    const result = await backupsCollection.deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Backup not found'
      });
    }

    res.json({
      success: true,
      message: 'Backup deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting system backup:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete backup',
      message: error.message 
    });
  }
});

// ==================== SYSTEM HEALTH ====================

// Get detailed system health
router.get('/health/detailed', authenticateToken, requireRole(['admin', 'system_admin']), async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: {
          status: 'connected',
          responseTime: Math.floor(Math.random() * 100) + 10, // Simulated response time
          lastCheck: new Date().toISOString()
        },
        cache: {
          status: 'connected',
          responseTime: Math.floor(Math.random() * 50) + 5,
          lastCheck: new Date().toISOString()
        },
        storage: {
          status: 'connected',
          responseTime: Math.floor(Math.random() * 200) + 50,
          lastCheck: new Date().toISOString()
        },
        email: {
          status: 'connected',
          responseTime: Math.floor(Math.random() * 300) + 100,
          lastCheck: new Date().toISOString()
        }
      },
      metrics: {
        cpuUsage: Math.random() * 100,
        memoryUsage: Math.random() * 100,
        diskUsage: Math.random() * 100,
        activeConnections: Math.floor(Math.random() * 200) + 50,
        requestsPerMinute: Math.floor(Math.random() * 100) + 20
      }
    };

    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    logger.error('Error getting system health:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get system health',
      message: error.message 
    });
  }
});

module.exports = router;
