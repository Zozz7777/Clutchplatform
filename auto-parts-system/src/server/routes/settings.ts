import express from 'express';
import { DatabaseManager } from '../../lib/database';
import { AuthManager } from '../../lib/auth';
import { logger } from '../../lib/logger';
import { User } from '../../types';

const router = express.Router();
const databaseManager = new DatabaseManager();
const authManager = new AuthManager();

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

// GET /api/settings - Get all settings
router.get('/', requireAuth, async (req, res) => {
  try {
    const settings = await databaseManager.query('SELECT * FROM settings ORDER BY key');

    const settingsObject = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});

    res.json({
      success: true,
      data: { settings: settingsObject },
      message: 'Settings retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_SETTINGS_FAILED',
      message: 'Failed to retrieve settings',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/settings - Update settings
router.put('/', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'settings.edit')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'Insufficient permissions to edit settings',
        timestamp: new Date().toISOString()
      });
    }

    const settings = req.body;

    for (const [key, value] of Object.entries(settings)) {
      await databaseManager.exec(
        'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
        [key, value]
      );
    }

    res.json({
      success: true,
      message: 'Settings updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_SETTINGS_FAILED',
      message: 'Failed to update settings',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
