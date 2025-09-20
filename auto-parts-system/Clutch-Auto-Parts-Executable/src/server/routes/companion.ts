import express from 'express';
import { DatabaseManager } from '../../lib/database';
import { AuthManager } from '../../lib/auth';
import { CompanionAppManager } from '../../lib/companion-app-manager';
import { logger } from '../../lib/logger';
import { User } from '../../types';

const router = express.Router();
const databaseManager = new DatabaseManager();
const authManager = new AuthManager();
const companionAppManager = new CompanionAppManager();

// Middleware to check authentication
const requireAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const currentUser = await authManager.getCurrentUser();
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        error: 'NOT_AUTHENTICATED',
        message: 'Authentication required',
        timestamp: new Date().toISOString()
      });
    }
    req.user = currentUser as User;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'AUTHENTICATION_FAILED',
      message: 'Authentication failed',
      timestamp: new Date().toISOString()
    });
  }
};

// GET /api/companion/stats - Get companion app stats
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'companion.view')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to view companion app stats.',
        timestamp: new Date().toISOString()
      });
    }

    const stats = await companionAppManager.getCompanionStats(currentUser.id);

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get companion stats error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_COMPANION_STATS_FAILED',
      message: 'Failed to get companion app stats',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/companion/settings - Get companion app settings
router.get('/settings', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'companion.settings')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to view companion app settings.',
        timestamp: new Date().toISOString()
      });
    }

    const settings = await companionAppManager.getCompanionSettings(currentUser.id);

    res.json({
      success: true,
      data: settings,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get companion settings error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_COMPANION_SETTINGS_FAILED',
      message: 'Failed to get companion app settings',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/companion/settings - Update companion app settings
router.put('/settings', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'companion.settings')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to update companion app settings.',
        timestamp: new Date().toISOString()
      });
    }

    const settings = req.body;
    await companionAppManager.updateCompanionSettings(currentUser.id, settings);

    res.json({
      success: true,
      message: 'Companion app settings updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Update companion settings error:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_COMPANION_SETTINGS_FAILED',
      message: 'Failed to update companion app settings',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/companion/reports - Generate companion app report
router.post('/reports', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'companion.reports')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to generate companion app reports.',
        timestamp: new Date().toISOString()
      });
    }

    const { type, period_start, period_end } = req.body;

    if (!type) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Report type is required',
        timestamp: new Date().toISOString()
      });
    }

    const validTypes = ['daily', 'weekly', 'monthly', 'custom'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_REPORT_TYPE',
        message: `Report type must be one of: ${validTypes.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }

    const report = await companionAppManager.generateCompanionReport(
      currentUser.id,
      type,
      period_start,
      period_end
    );

    res.status(201).json({
      success: true,
      data: report,
      message: 'Companion app report generated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Generate companion report error:', error);
    res.status(500).json({
      success: false,
      error: 'GENERATE_COMPANION_REPORT_FAILED',
      message: 'Failed to generate companion app report',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/companion/reports - Get companion app reports
router.get('/reports', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'companion.reports')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to view companion app reports.',
        timestamp: new Date().toISOString()
      });
    }

    const { limit = 20 } = req.query;
    const reports = await companionAppManager.getCompanionReports(
      currentUser.id,
      parseInt(limit as string)
    );

    res.json({
      success: true,
      data: reports,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get companion reports error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_COMPANION_REPORTS_FAILED',
      message: 'Failed to get companion app reports',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/companion/notifications - Get companion app notifications
router.get('/notifications', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'companion.view')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to view companion app notifications.',
        timestamp: new Date().toISOString()
      });
    }

    const { unread_only = false } = req.query;
    const notifications = await companionAppManager.getCompanionNotifications(
      currentUser.id,
      unread_only === 'true'
    );

    res.json({
      success: true,
      data: notifications,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get companion notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_COMPANION_NOTIFICATIONS_FAILED',
      message: 'Failed to get companion app notifications',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/companion/notifications/:id/read - Mark notification as read
router.put('/notifications/:id/read', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'companion.view')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to update companion app notifications.',
        timestamp: new Date().toISOString()
      });
    }

    const notificationId = parseInt(req.params.id);
    await companionAppManager.markNotificationAsRead(currentUser.id, notificationId);

    res.json({
      success: true,
      message: 'Notification marked as read',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      error: 'MARK_NOTIFICATION_READ_FAILED',
      message: 'Failed to mark notification as read',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/companion/notifications - Create companion app notification
router.post('/notifications', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'companion.create')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to create companion app notifications.',
        timestamp: new Date().toISOString()
      });
    }

    const { type, title, message, data } = req.body;

    if (!type || !title || !message) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Type, title, and message are required',
        timestamp: new Date().toISOString()
      });
    }

    await companionAppManager.createCompanionNotification(
      currentUser.id,
      type,
      title,
      message,
      data
    );

    res.status(201).json({
      success: true,
      message: 'Companion app notification created successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Create companion notification error:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_COMPANION_NOTIFICATION_FAILED',
      message: 'Failed to create companion app notification',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/companion/activities - Log companion app activity
router.post('/activities', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'companion.create')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to log companion app activities.',
        timestamp: new Date().toISOString()
      });
    }

    const { activity_type, description, metadata } = req.body;

    if (!activity_type || !description) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Activity type and description are required',
        timestamp: new Date().toISOString()
      });
    }

    await companionAppManager.logCompanionActivity(
      currentUser.id,
      activity_type,
      description,
      metadata
    );

    res.status(201).json({
      success: true,
      message: 'Companion app activity logged successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Log companion activity error:', error);
    res.status(500).json({
      success: false,
      error: 'LOG_COMPANION_ACTIVITY_FAILED',
      message: 'Failed to log companion app activity',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/companion/dashboard - Get companion app dashboard data
router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'companion.view')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to view companion app dashboard.',
        timestamp: new Date().toISOString()
      });
    }

    // Get comprehensive dashboard data
    const [stats, notifications, recentReports] = await Promise.all([
      companionAppManager.getCompanionStats(currentUser.id),
      companionAppManager.getCompanionNotifications(currentUser.id, true),
      companionAppManager.getCompanionReports(currentUser.id, 5)
    ]);

    const dashboard = {
      stats,
      notifications: notifications.slice(0, 10), // Latest 10 notifications
      recent_reports: recentReports,
      last_updated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: dashboard,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get companion dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_COMPANION_DASHBOARD_FAILED',
      message: 'Failed to get companion app dashboard',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/companion/health - Get companion app health status
router.get('/health', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        error: 'NOT_AUTHENTICATED',
        message: 'Authentication required',
        timestamp: new Date().toISOString()
      });
    }

    // Check system health
    const healthChecks = await Promise.allSettled([
      databaseManager.query('SELECT 1'),
      companionAppManager.getCompanionStats(currentUser.id)
    ]);

    const isHealthy = healthChecks.every(check => check.status === 'fulfilled');

    res.json({
      success: true,
      data: {
        status: isHealthy ? 'healthy' : 'unhealthy',
        checks: {
          database: healthChecks[0].status === 'fulfilled',
          companion_app: healthChecks[1].status === 'fulfilled'
        },
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get companion health error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_COMPANION_HEALTH_FAILED',
      message: 'Failed to get companion app health status',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
