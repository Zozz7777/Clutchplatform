import express from 'express';
import { SyncManager } from '../../lib/sync';
import { logger } from '../../lib/logger';

const router = express.Router();
const syncManager = new SyncManager();

// GET /api/sync/status - Get sync status
router.get('/status', async (req, res) => {
  try {
    const status = await syncManager.getStatus();

    res.json({
      success: true,
      data: { status },
      message: 'Sync status retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get sync status error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_SYNC_STATUS_FAILED',
      message: 'Failed to retrieve sync status',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/sync/now - Trigger sync now
router.post('/now', async (req, res) => {
  try {
    const result = await syncManager.syncNow();

    res.json({
      success: result,
      message: result ? 'Sync completed successfully' : 'Sync failed',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Sync now error:', error);
    res.status(500).json({
      success: false,
      error: 'SYNC_NOW_FAILED',
      message: 'Failed to sync now',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
