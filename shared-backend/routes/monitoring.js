const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { createSmartRateLimit } = require('../middleware/smartRateLimit');
const { validate } = require('../middleware/inputValidation');
const { logger } = require('../config/logger');

// Rate limiting for monitoring endpoints
const monitoringRateLimit = createSmartRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many monitoring requests from this IP, please try again later.'
});

// Apply rate limiting to all monitoring routes
router.use(monitoringRateLimit);

// Consolidated monitoring alerts dashboard endpoint - replaces multiple separate calls
router.get('/dashboard', authenticateToken, requireRole(['admin', 'monitoring']), async (req, res) => {
  try {
    console.log('📊 MONITORING_ALERTS_DASHBOARD_REQUEST:', {
      user: req.user.email,
      timestamp: new Date().toISOString()
    });

    // Get monitoring alerts
    const alerts = [
      {
        id: '1',
        title: 'High CPU Usage',
        description: 'Server CPU usage exceeded 90%',
        severity: 'high',
        status: 'active',
        timestamp: new Date(Date.now() - Math.random() * 86400000 * 2).toISOString(),
        source: 'server-01',
        category: 'performance'
      },
      {
        id: '2',
        title: 'Database Connection Pool Exhausted',
        description: 'Database connection pool is at 95% capacity',
        severity: 'critical',
        status: 'active',
        timestamp: new Date(Date.now() - Math.random() * 86400000 * 1).toISOString(),
        source: 'database-01',
        category: 'database'
      },
      {
        id: '3',
        title: 'Memory Usage Warning',
        description: 'Memory usage is above 85%',
        severity: 'medium',
        status: 'resolved',
        timestamp: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
        source: 'server-02',
        category: 'performance'
      }
    ];

    // Get monitoring metrics
    const metrics = {
      systemHealth: {
        uptime: 99.9 + Math.random() * 0.1,
        responseTime: 150 + Math.random() * 100,
        errorRate: Math.random() * 0.5,
        throughput: Math.floor(Math.random() * 1000) + 500
      },
      alerts: {
        total: Math.floor(Math.random() * 50) + 20,
        active: Math.floor(Math.random() * 10) + 5,
        resolved: Math.floor(Math.random() * 40) + 15,
        critical: Math.floor(Math.random() * 5) + 1
      },
      performance: {
        cpuUsage: 60 + Math.random() * 30,
        memoryUsage: 70 + Math.random() * 20,
        diskUsage: 45 + Math.random() * 25,
        networkLatency: 50 + Math.random() * 100
      }
    };

    // Get incidents
    const incidents = [
      {
        id: '1',
        title: 'Service Outage - API Gateway',
        description: 'API Gateway experienced downtime for 15 minutes',
        status: 'resolved',
        severity: 'critical',
        startTime: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
        endTime: new Date(Date.now() - Math.random() * 86400000 * 7 + 15 * 60 * 1000).toISOString(),
        impact: 'high',
        affectedServices: ['api-gateway', 'user-service', 'payment-service']
      },
      {
        id: '2',
        title: 'Database Performance Degradation',
        description: 'Database queries were slower than usual',
        status: 'investigating',
        severity: 'medium',
        startTime: new Date(Date.now() - Math.random() * 86400000 * 2).toISOString(),
        endTime: null,
        impact: 'medium',
        affectedServices: ['database', 'user-service']
      }
    ];

    const consolidatedData = {
      alerts,
      metrics,
      incidents,
      lastUpdated: new Date().toISOString()
    };

    console.log('✅ MONITORING_ALERTS_DASHBOARD_SUCCESS:', {
      user: req.user.email,
      dataSize: JSON.stringify(consolidatedData).length,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      data: consolidatedData,
      message: 'Monitoring alerts dashboard data retrieved successfully',
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('❌ MONITORING_ALERTS_DASHBOARD_ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve monitoring alerts dashboard data',
      message: error.message,
      timestamp: Date.now()
    });
  }
});

// Individual endpoints for backward compatibility (but these should be avoided)
router.get('/alerts', authenticateToken, async (req, res) => {
  try {
    const alerts = [
      {
        id: '1',
        title: 'High CPU Usage',
        description: 'Server CPU usage exceeded 90%',
        severity: 'high',
        status: 'active',
        timestamp: new Date(Date.now() - Math.random() * 86400000 * 2).toISOString(),
        source: 'server-01',
        category: 'performance'
      },
      {
        id: '2',
        title: 'Database Connection Pool Exhausted',
        description: 'Database connection pool is at 95% capacity',
        severity: 'critical',
        status: 'active',
        timestamp: new Date(Date.now() - Math.random() * 86400000 * 1).toISOString(),
        source: 'database-01',
        category: 'database'
      }
    ];

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve monitoring alerts',
      message: error.message
    });
  }
});

router.get('/metrics', authenticateToken, async (req, res) => {
  try {
    const metrics = {
      systemHealth: {
        uptime: 99.9 + Math.random() * 0.1,
        responseTime: 150 + Math.random() * 100,
        errorRate: Math.random() * 0.5,
        throughput: Math.floor(Math.random() * 1000) + 500
      },
      alerts: {
        total: Math.floor(Math.random() * 50) + 20,
        active: Math.floor(Math.random() * 10) + 5,
        resolved: Math.floor(Math.random() * 40) + 15,
        critical: Math.floor(Math.random() * 5) + 1
      },
      performance: {
        cpuUsage: 60 + Math.random() * 30,
        memoryUsage: 70 + Math.random() * 20,
        diskUsage: 45 + Math.random() * 25,
        networkLatency: 50 + Math.random() * 100
      }
    };

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve monitoring metrics',
      message: error.message
    });
  }
});

router.get('/incidents', authenticateToken, async (req, res) => {
  try {
    const incidents = [
      {
        id: '1',
        title: 'Service Outage - API Gateway',
        description: 'API Gateway experienced downtime for 15 minutes',
        status: 'resolved',
        severity: 'critical',
        startTime: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
        endTime: new Date(Date.now() - Math.random() * 86400000 * 7 + 15 * 60 * 1000).toISOString(),
        impact: 'high',
        affectedServices: ['api-gateway', 'user-service', 'payment-service']
      },
      {
        id: '2',
        title: 'Database Performance Degradation',
        description: 'Database queries were slower than usual',
        status: 'investigating',
        severity: 'medium',
        startTime: new Date(Date.now() - Math.random() * 86400000 * 2).toISOString(),
        endTime: null,
        impact: 'medium',
        affectedServices: ['database', 'user-service']
      }
    ];

    res.json({
      success: true,
      data: incidents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve monitoring incidents',
      message: error.message
    });
  }
});

module.exports = router;
