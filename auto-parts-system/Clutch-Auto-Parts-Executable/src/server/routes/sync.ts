import express from 'express';
import { DatabaseManager } from '../../lib/database';
import { AuthManager } from '../../lib/auth';
import { SyncManager } from '../../lib/sync-manager';
import { logger } from '../../lib/logger';
import { User } from '../../types';

const router = express.Router();
const databaseManager = new DatabaseManager();
const authManager = new AuthManager();
const syncManager = new SyncManager();

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

// GET /api/sync/status - Get sync status
router.get('/status', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !await authManager.hasPermission(currentUser, 'sync.view')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to view sync status.',
        timestamp: new Date().toISOString()
      });
    }

    const status = await syncManager.getSyncStatus();

    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get sync status error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_SYNC_STATUS_FAILED',
      message: 'Failed to get sync status',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/sync/start - Start manual sync
router.post('/start', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !await authManager.hasPermission(currentUser, 'sync.start')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to start sync.',
        timestamp: new Date().toISOString()
      });
    }

    const status = await syncManager.sync();

    res.json({
      success: true,
      data: status,
      message: 'Sync started successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Start sync error:', error);
    res.status(500).json({
      success: false,
      error: 'START_SYNC_FAILED',
      message: 'Failed to start sync',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/sync/queue - Get sync queue
router.get('/queue', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !await authManager.hasPermission(currentUser, 'sync.view')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to view sync queue.',
        timestamp: new Date().toISOString()
      });
    }

    const { limit = 100, offset = 0 } = req.query;
    const queue = await syncManager.getSyncQueue(
      parseInt(limit as string),
      parseInt(offset as string)
    );

    res.json({
      success: true,
      data: queue,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get sync queue error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_SYNC_QUEUE_FAILED',
      message: 'Failed to get sync queue',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/sync/conflicts - Get sync conflicts
router.get('/conflicts', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !await authManager.hasPermission(currentUser, 'sync.view')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to view sync conflicts.',
        timestamp: new Date().toISOString()
      });
    }

    const conflicts = await syncManager.getSyncConflicts();

    res.json({
      success: true,
      data: conflicts,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get sync conflicts error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_SYNC_CONFLICTS_FAILED',
      message: 'Failed to get sync conflicts',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;