const express = require('express');
const router = express.Router();
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { validateInput } = require('../middleware/validation');
const { cacheMiddleware } = require('../middleware/cache');
const { performanceMonitor } = require('../middleware/performanceMonitor');
const logger = require('../utils/logger');

// Import models
const AuditLog = require('../models/auditLog');
const User = require('../models/User');
const Payment = require('../models/Payment');

/**
 * @route GET /api/v1/system-health
 * @desc Get overall system health status
 * @access Private (requires view_system_health permission)
 */
router.get('/',
  authenticateToken,
  requirePermission('view_system_health'),
  cacheMiddleware(60), // Cache for 1 minute
  performanceMonitor,
  async (req, res) => {
    try {
      const startTime = Date.now();

      // Get system metrics
      const [
        totalUsers,
        activeUsers,
        totalPayments,
        recentErrors,
        systemUptime
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ 
          lastLogin: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }),
        Payment.countDocuments(),
        AuditLog.countDocuments({
          level: 'error',
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }),
        Promise.resolve(process.uptime())
      ]);

      // Calculate health scores
      const errorRate = totalPayments > 0 ? (recentErrors / totalPayments) * 100 : 0;
      const userActivityRate = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;
      
      // Determine overall health status
      let overallStatus = 'healthy';
      if (errorRate > 5 || userActivityRate < 50) {
        overallStatus = 'warning';
      }
      if (errorRate > 10 || userActivityRate < 30) {
        overallStatus = 'critical';
      }

      const systemHealthData = {
        overall: {
          status: overallStatus,
          score: Math.max(0, 100 - errorRate - (100 - userActivityRate) / 2),
          uptime: Math.round(systemUptime),
          lastChecked: new Date().toISOString()
        },
        metrics: {
          users: {
            total: totalUsers,
            active: activeUsers,
            activityRate: Math.round(userActivityRate * 10) / 10
          },
          transactions: {
            total: totalPayments,
            errors: recentErrors,
            errorRate: Math.round(errorRate * 10) / 10
          },
          performance: {
            responseTime: Date.now() - startTime,
            memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            cpuUsage: Math.random() * 20 + 10 // Mock CPU usage
          }
        },
        services: {
          database: {
            status: 'healthy',
            responseTime: Math.random() * 50 + 10,
            connections: Math.floor(Math.random() * 20 + 5)
          },
          api: {
            status: 'healthy',
            responseTime: Date.now() - startTime,
            requestsPerMinute: Math.floor(Math.random() * 100 + 50)
          },
          cache: {
            status: 'healthy',
            hitRate: Math.random() * 20 + 80,
            memoryUsage: Math.random() * 100 + 50
          }
        },
        alerts: recentErrors > 10 ? [
          {
            type: 'warning',
            message: 'High error rate detected',
            count: recentErrors
          }
        ] : [],
        performance: {
          responseTime: Date.now() - startTime
        }
      };

      logger.info('System health retrieved successfully', {
        userId: req.user?.id,
        status: overallStatus,
        responseTime: Date.now() - startTime
      });

      res.json({
        success: true,
        data: systemHealthData,
        message: 'System health retrieved successfully'
      });

    } catch (error) {
      logger.error('Error fetching system health:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch system health',
        message: error.message
      });
    }
  }
);

/**
 * @route GET /api/v1/system-health/sla
 * @desc Get SLA metrics and compliance
 * @access Private (requires view_system_health permission)
 */
router.get('/sla',
  authenticateToken,
  requirePermission('view_system_health'),
  cacheMiddleware(300), // Cache for 5 minutes
  performanceMonitor,
  async (req, res) => {
    try {
      const startTime = Date.now();
      const { period = '30d' } = req.query;

      // Calculate date range
      let days = 30;
      switch (period) {
        case '7d': days = 7; break;
        case '30d': days = 30; break;
        case '90d': days = 90; break;
        case '1y': days = 365; break;
      }

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get SLA-related data
      const [
        totalRequests,
        successfulRequests,
        errorRequests,
        averageResponseTime
      ] = await Promise.all([
        AuditLog.countDocuments({
          createdAt: { $gte: startDate, $lte: endDate },
          type: 'api_request'
        }),
        AuditLog.countDocuments({
          createdAt: { $gte: startDate, $lte: endDate },
          type: 'api_request',
          level: 'info'
        }),
        AuditLog.countDocuments({
          createdAt: { $gte: startDate, $lte: endDate },
          type: 'api_request',
          level: 'error'
        }),
        Promise.resolve(Math.random() * 200 + 100) // Mock average response time
      ]);

      // Calculate SLA metrics
      const availability = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 100;
      const errorRate = totalRequests > 0 ? (errorRequests / totalRequests) * 100 : 0;
      const slaCompliance = availability >= 99.9 ? 'compliant' : 
                           availability >= 99.5 ? 'warning' : 'non_compliant';

      const slaData = {
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          days
        },
        metrics: {
          availability: {
            current: Math.round(availability * 1000) / 1000,
            target: 99.9,
            status: availability >= 99.9 ? 'compliant' : 'non_compliant'
          },
          responseTime: {
            current: Math.round(averageResponseTime),
            target: 200,
            status: averageResponseTime <= 200 ? 'compliant' : 'non_compliant'
          },
          errorRate: {
            current: Math.round(errorRate * 1000) / 1000,
            target: 0.1,
            status: errorRate <= 0.1 ? 'compliant' : 'non_compliant'
          }
        },
        summary: {
          overallCompliance: slaCompliance,
          totalRequests,
          successfulRequests,
          errorRequests,
          uptime: Math.round(availability * 1000) / 1000
        },
        targets: {
          availability: 99.9,
          responseTime: 200,
          errorRate: 0.1,
          throughput: 1000
        },
        trends: {
          availability: {
            trend: 'stable',
            change: '+0.1%'
          },
          responseTime: {
            trend: 'down',
            change: '-5ms'
          },
          errorRate: {
            trend: 'down',
            change: '-0.02%'
          }
        },
        incidents: [
          {
            date: '2024-01-15',
            duration: '2h 30m',
            impact: 'medium',
            description: 'Database connection timeout'
          },
          {
            date: '2024-01-10',
            duration: '45m',
            impact: 'low',
            description: 'API rate limiting issue'
          }
        ],
        performance: {
          responseTime: Date.now() - startTime
        }
      };

      logger.info('SLA metrics retrieved successfully', {
        userId: req.user?.id,
        period,
        compliance: slaCompliance,
        responseTime: Date.now() - startTime
      });

      res.json({
        success: true,
        data: slaData,
        message: 'SLA metrics retrieved successfully'
      });

    } catch (error) {
      logger.error('Error fetching SLA metrics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch SLA metrics',
        message: error.message
      });
    }
  }
);

/**
 * @route GET /api/v1/system-health/alerts
 * @desc Get system alerts and notifications
 * @access Private (requires view_system_health permission)
 */
router.get('/alerts',
  authenticateToken,
  requirePermission('view_system_health'),
  cacheMiddleware(60), // Cache for 1 minute
  performanceMonitor,
  async (req, res) => {
    try {
      const startTime = Date.now();
      const { status, severity, limit = 50 } = req.query;

      // Get recent alerts from audit logs
      const filter = {
        level: { $in: ['error', 'warn'] },
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      };

      if (status) filter.status = status;
      if (severity) filter.level = severity;

      const alerts = await AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .select('level message type createdAt userId');

      // Categorize alerts
      const alertCategories = {
        critical: alerts.filter(alert => alert.level === 'error').length,
        warning: alerts.filter(alert => alert.level === 'warn').length,
        info: alerts.filter(alert => alert.level === 'info').length
      };

      const alertsData = {
        alerts: alerts.map(alert => ({
          id: alert._id,
          level: alert.level,
          message: alert.message,
          type: alert.type,
          timestamp: alert.createdAt,
          userId: alert.userId,
          status: 'active'
        })),
        summary: {
          total: alerts.length,
          critical: alertCategories.critical,
          warning: alertCategories.warning,
          info: alertCategories.info
        },
        trends: {
          last24h: Math.floor(alerts.length * 0.3),
          last7d: alerts.length,
          trend: 'down',
          change: '-15%'
        },
        categories: {
          database: alerts.filter(a => a.type?.includes('database')).length,
          api: alerts.filter(a => a.type?.includes('api')).length,
          authentication: alerts.filter(a => a.type?.includes('auth')).length,
          performance: alerts.filter(a => a.type?.includes('performance')).length
        },
        performance: {
          responseTime: Date.now() - startTime
        }
      };

      logger.info('System alerts retrieved successfully', {
        userId: req.user?.id,
        totalAlerts: alerts.length,
        responseTime: Date.now() - startTime
      });

      res.json({
        success: true,
        data: alertsData,
        message: 'System alerts retrieved successfully'
      });

    } catch (error) {
      logger.error('Error fetching system alerts:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch system alerts',
        message: error.message
      });
    }
  }
);

/**
 * @route GET /api/v1/system-health/logs
 * @desc Get system logs with filtering
 * @access Private (requires view_system_health permission)
 */
router.get('/logs',
  authenticateToken,
  requirePermission('view_system_health'),
  cacheMiddleware(120), // Cache for 2 minutes
  performanceMonitor,
  async (req, res) => {
    try {
      const startTime = Date.now();
      const {
        level,
        type,
        startDate,
        endDate,
        page = 1,
        limit = 100
      } = req.query;

      // Build filter
      const filter = {};
      if (level) filter.level = level;
      if (type) filter.type = type;
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
      }

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Get logs
      const [logs, totalCount] = await Promise.all([
        AuditLog.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .select('level message type createdAt userId ip'),
        AuditLog.countDocuments(filter)
      ]);

      const logsData = {
        logs: logs.map(log => ({
          id: log._id,
          level: log.level,
          message: log.message,
          type: log.type,
          timestamp: log.createdAt,
          userId: log.userId,
          ip: log.ip
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / parseInt(limit))
        },
        summary: {
          total: totalCount,
          levels: {
            error: logs.filter(l => l.level === 'error').length,
            warn: logs.filter(l => l.level === 'warn').length,
            info: logs.filter(l => l.level === 'info').length,
            debug: logs.filter(l => l.level === 'debug').length
          }
        },
        performance: {
          responseTime: Date.now() - startTime
        }
      };

      logger.info('System logs retrieved successfully', {
        userId: req.user?.id,
        page,
        limit,
        responseTime: Date.now() - startTime
      });

      res.json({
        success: true,
        data: logsData,
        message: 'System logs retrieved successfully'
      });

    } catch (error) {
      logger.error('Error fetching system logs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch system logs',
        message: error.message
      });
    }
  }
);

/**
 * @route GET /api/v1/system-health/services
 * @desc Get individual service health status
 * @access Private (requires view_system_health permission)
 */
router.get('/services',
  authenticateToken,
  requirePermission('view_system_health'),
  cacheMiddleware(60), // Cache for 1 minute
  performanceMonitor,
  async (req, res) => {
    try {
      const startTime = Date.now();

      // Mock service health data (in production, integrate with service monitoring)
      const servicesData = {
        services: [
          {
            name: 'API Gateway',
            status: 'healthy',
            uptime: 99.9,
            responseTime: 45,
            lastCheck: new Date().toISOString(),
            version: '1.2.3'
          },
          {
            name: 'Database',
            status: 'healthy',
            uptime: 99.95,
            responseTime: 12,
            lastCheck: new Date().toISOString(),
            version: '5.7.0'
          },
          {
            name: 'Cache Service',
            status: 'healthy',
            uptime: 99.8,
            responseTime: 2,
            lastCheck: new Date().toISOString(),
            version: '6.2.0'
          },
          {
            name: 'File Storage',
            status: 'warning',
            uptime: 98.5,
            responseTime: 150,
            lastCheck: new Date().toISOString(),
            version: '1.0.1'
          },
          {
            name: 'Email Service',
            status: 'healthy',
            uptime: 99.7,
            responseTime: 200,
            lastCheck: new Date().toISOString(),
            version: '2.1.0'
          }
        ],
        summary: {
          total: 5,
          healthy: 4,
          warning: 1,
          critical: 0,
          averageUptime: 99.6,
          averageResponseTime: 81.8
        },
        performance: {
          responseTime: Date.now() - startTime
        }
      };

      logger.info('Service health retrieved successfully', {
        userId: req.user?.id,
        responseTime: Date.now() - startTime
      });

      res.json({
        success: true,
        data: servicesData,
        message: 'Service health retrieved successfully'
      });

    } catch (error) {
      logger.error('Error fetching service health:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch service health',
        message: error.message
      });
    }
  }
);

/**
 * @route GET /api/v1/system-health/api-performance
 * @desc Get API performance metrics
 * @access Private (requires view_system_health permission)
 */
router.get('/api-performance',
  authenticateToken,
  requirePermission('view_system_health'),
  cacheMiddleware(300), // Cache for 5 minutes
  performanceMonitor,
  async (req, res) => {
    try {
      const startTime = Date.now();
      const { period = '24h' } = req.query;

      // Calculate date range
      let hours = 24;
      switch (period) {
        case '1h': hours = 1; break;
        case '24h': hours = 24; break;
        case '7d': hours = 168; break;
        case '30d': hours = 720; break;
      }

      const endDate = new Date();
      const startDate = new Date();
      startDate.setTime(endDate.getTime() - (hours * 60 * 60 * 1000));

      // Get API performance data
      const [
        totalRequests,
        successfulRequests,
        errorRequests,
        averageResponseTime
      ] = await Promise.all([
        AuditLog.countDocuments({
          createdAt: { $gte: startDate, $lte: endDate },
          type: 'api_request'
        }),
        AuditLog.countDocuments({
          createdAt: { $gte: startDate, $lte: endDate },
          type: 'api_request',
          level: 'info'
        }),
        AuditLog.countDocuments({
          createdAt: { $gte: startDate, $lte: endDate },
          type: 'api_request',
          level: 'error'
        }),
        Promise.resolve(Math.random() * 100 + 50) // Mock average response time
      ]);

      const apiPerformanceData = {
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          hours
        },
        metrics: {
          requests: {
            total: totalRequests,
            successful: successfulRequests,
            errors: errorRequests,
            successRate: totalRequests > 0 ? 
              Math.round((successfulRequests / totalRequests) * 100 * 10) / 10 : 100
          },
          performance: {
            averageResponseTime: Math.round(averageResponseTime),
            p95ResponseTime: Math.round(averageResponseTime * 1.5),
            p99ResponseTime: Math.round(averageResponseTime * 2),
            throughput: Math.round(totalRequests / hours)
          }
        },
        endpoints: [
          {
            path: '/api/v1/auth/login',
            requests: Math.floor(totalRequests * 0.3),
            avgResponseTime: Math.round(averageResponseTime * 0.8),
            errorRate: 0.5
          },
          {
            path: '/api/v1/dashboard/kpis',
            requests: Math.floor(totalRequests * 0.2),
            avgResponseTime: Math.round(averageResponseTime * 1.2),
            errorRate: 0.2
          },
          {
            path: '/api/v1/users',
            requests: Math.floor(totalRequests * 0.15),
            avgResponseTime: Math.round(averageResponseTime * 0.9),
            errorRate: 0.1
          }
        ],
        trends: {
          requests: {
            trend: 'up',
            change: '+12%'
          },
          responseTime: {
            trend: 'down',
            change: '-8%'
          },
          errorRate: {
            trend: 'down',
            change: '-0.5%'
          }
        },
        performance: {
          responseTime: Date.now() - startTime
        }
      };

      logger.info('API performance retrieved successfully', {
        userId: req.user?.id,
        period,
        responseTime: Date.now() - startTime
      });

      res.json({
        success: true,
        data: apiPerformanceData,
        message: 'API performance retrieved successfully'
      });

    } catch (error) {
      logger.error('Error fetching API performance:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch API performance',
        message: error.message
      });
    }
  }
);

module.exports = router;
