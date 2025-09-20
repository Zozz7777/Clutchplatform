import express from 'express';
import { WebSocketManager } from '../../lib/websocket-manager';
import { logger } from '../../lib/logger';

const router = express.Router();

// WebSocket manager instance (will be injected)
let wsManager: WebSocketManager | null = null;

/**
 * Set WebSocket manager instance
 */
export function setWebSocketManager(manager: WebSocketManager): void {
  wsManager = manager;
}

/**
 * Get WebSocket connection statistics
 */
router.get('/stats', async (req, res) => {
  try {
    if (!wsManager) {
      return res.status(503).json({
        success: false,
        error: 'WEBSOCKET_NOT_AVAILABLE',
        message: 'WebSocket manager not initialized',
        timestamp: new Date().toISOString()
      });
    }

    const stats = wsManager.getStats();

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('WebSocket stats error:', error);
    res.status(500).json({
      success: false,
      error: 'WEBSOCKET_STATS_FAILED',
      message: 'Failed to get WebSocket statistics',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Broadcast message to all connected clients
 */
router.post('/broadcast', async (req, res) => {
  try {
    if (!wsManager) {
      return res.status(503).json({
        success: false,
        error: 'WEBSOCKET_NOT_AVAILABLE',
        message: 'WebSocket manager not initialized',
        timestamp: new Date().toISOString()
      });
    }

    const { message, channel, userId, userRole, excludeClient } = req.body;

    if (!message || !message.type) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_MESSAGE',
        message: 'Message type is required',
        timestamp: new Date().toISOString()
      });
    }

    const sentCount = wsManager.broadcast(message, {
      channel,
      userId,
      userRole,
      excludeClient
    });

    res.json({
      success: true,
      data: {
        sent_count: sentCount,
        message: message
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('WebSocket broadcast error:', error);
    res.status(500).json({
      success: false,
      error: 'WEBSOCKET_BROADCAST_FAILED',
      message: 'Failed to broadcast message',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Broadcast message to specific channel
 */
router.post('/broadcast/channel/:channel', async (req, res) => {
  try {
    if (!wsManager) {
      return res.status(503).json({
        success: false,
        error: 'WEBSOCKET_NOT_AVAILABLE',
        message: 'WebSocket manager not initialized',
        timestamp: new Date().toISOString()
      });
    }

    const { channel } = req.params;
    const { message, excludeClient } = req.body;

    if (!message || !message.type) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_MESSAGE',
        message: 'Message type is required',
        timestamp: new Date().toISOString()
      });
    }

    const sentCount = wsManager.broadcastToChannel(channel, message, excludeClient);

    res.json({
      success: true,
      data: {
        channel,
        sent_count: sentCount,
        message: message
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('WebSocket channel broadcast error:', error);
    res.status(500).json({
      success: false,
      error: 'WEBSOCKET_CHANNEL_BROADCAST_FAILED',
      message: 'Failed to broadcast message to channel',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Send message to specific user
 */
router.post('/send/user/:userId', async (req, res) => {
  try {
    if (!wsManager) {
      return res.status(503).json({
        success: false,
        error: 'WEBSOCKET_NOT_AVAILABLE',
        message: 'WebSocket manager not initialized',
        timestamp: new Date().toISOString()
      });
    }

    const { userId } = req.params;
    const { message } = req.body;

    if (!message || !message.type) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_MESSAGE',
        message: 'Message type is required',
        timestamp: new Date().toISOString()
      });
    }

    const sentCount = wsManager.broadcastToUser(parseInt(userId), message);

    res.json({
      success: true,
      data: {
        user_id: parseInt(userId),
        sent_count: sentCount,
        message: message
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('WebSocket user send error:', error);
    res.status(500).json({
      success: false,
      error: 'WEBSOCKET_USER_SEND_FAILED',
      message: 'Failed to send message to user',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Broadcast message to specific role
 */
router.post('/broadcast/role/:userRole', async (req, res) => {
  try {
    if (!wsManager) {
      return res.status(503).json({
        success: false,
        error: 'WEBSOCKET_NOT_AVAILABLE',
        message: 'WebSocket manager not initialized',
        timestamp: new Date().toISOString()
      });
    }

    const { userRole } = req.params;
    const { message } = req.body;

    if (!message || !message.type) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_MESSAGE',
        message: 'Message type is required',
        timestamp: new Date().toISOString()
      });
    }

    const sentCount = wsManager.broadcastToRole(userRole, message);

    res.json({
      success: true,
      data: {
        user_role: userRole,
        sent_count: sentCount,
        message: message
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('WebSocket role broadcast error:', error);
    res.status(500).json({
      success: false,
      error: 'WEBSOCKET_ROLE_BROADCAST_FAILED',
      message: 'Failed to broadcast message to role',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Get available channels
 */
router.get('/channels', async (req, res) => {
  try {
    const channels = [
      {
        name: 'inventory',
        description: 'Inventory updates and stock changes',
        permissions: ['inventory:read', 'inventory:write']
      },
      {
        name: 'sales',
        description: 'Sales transactions and POS updates',
        permissions: ['sales:read', 'sales:write']
      },
      {
        name: 'customers',
        description: 'Customer data and loyalty updates',
        permissions: ['customers:read', 'customers:write']
      },
      {
        name: 'suppliers',
        description: 'Supplier information and purchase orders',
        permissions: ['suppliers:read', 'suppliers:write']
      },
      {
        name: 'reports',
        description: 'Report generation and analytics',
        permissions: ['reports:read']
      },
      {
        name: 'ai',
        description: 'AI insights and recommendations',
        permissions: ['ai:read']
      },
      {
        name: 'marketplace',
        description: 'Marketplace orders and inventory sync',
        permissions: ['marketplace:read', 'marketplace:write']
      },
      {
        name: 'branches',
        description: 'Multi-branch operations and transfers',
        permissions: ['branches:read', 'branches:write']
      },
      {
        name: 'sync',
        description: 'Data synchronization status',
        permissions: ['sync:read']
      },
      {
        name: 'admin',
        description: 'Administrative notifications and system updates',
        permissions: ['admin:read', 'admin:write']
      }
    ];

    res.json({
      success: true,
      data: {
        channels
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('WebSocket channels error:', error);
    res.status(500).json({
      success: false,
      error: 'WEBSOCKET_CHANNELS_FAILED',
      message: 'Failed to get available channels',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
