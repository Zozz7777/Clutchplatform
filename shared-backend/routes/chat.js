const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole, checkPermission } = require('../middleware/unified-auth');
const { getCollection } = require('../config/optimized-database');
const { ObjectId } = require('mongodb');
const rateLimit = require('express-rate-limit');
const webSocketServer = require('../services/websocket-server');

// Rate limiting
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many chat requests from this IP, please try again later.'
});

// Apply rate limiting and authentication to all routes
router.use(chatLimiter);
router.use(authenticateToken);

// ============================================================================
// NON-PARAMETERIZED ROUTES (MUST COME FIRST)
// ============================================================================

// ===== CHAT SESSIONS =====

// GET /api/v1/chat/sessions - Get all chat sessions
router.get('/sessions', checkRole(['head_administrator', 'admin', 'support_agent']), async (req, res) => {
  try {
    const sessionsCollection = await getCollection('chat_sessions');
    const { page = 1, limit = 50, status, customerId } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (customerId) filter.customerId = customerId;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const sessions = await sessionsCollection
      .find(filter)
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await sessionsCollection.countDocuments(filter);
    
    res.json({
      success: true,
      data: sessions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat sessions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===== CHAT MESSAGES =====

// GET /api/v1/chat/messages - Get all messages (general)
router.get('/messages', async (req, res) => {
  try {
    const messagesCollection = await getCollection('chat_messages');
    const { page = 1, limit = 50, channelId, userId } = req.query;
    
    const filter = {};
    if (channelId) filter.channelId = channelId;
    if (userId) filter.senderId = userId;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const messages = await messagesCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await messagesCollection.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/v1/chat/send - Send a message
router.post('/send', checkRole(['head_administrator', 'admin', 'support_agent', 'user']), async (req, res) => {
  try {
    const messagesCollection = await getCollection('chat_messages');
    const { 
      channelId, 
      message, 
      type = 'text', 
      attachments = [],
      replyTo 
    } = req.body;
    
    if (!channelId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Channel ID and message are required'
      });
    }
    
    const messageData = {
      channelId,
      senderId: req.user.userId,
      senderName: req.user.name || req.user.email,
      message,
      type,
      attachments,
      replyTo: replyTo || null,
      status: 'sent',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await messagesCollection.insertOne(messageData);
    
    // Emit real-time update via WebSocket
    if (webSocketServer) {
      webSocketServer.emitToChannel(channelId, 'new_message', {
        ...messageData,
        _id: result.insertedId
      });
    }
    
    res.status(201).json({
      success: true,
      data: {
        message: {
          ...messageData,
          _id: result.insertedId
        }
      },
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/v1/chat/messages - Create new message (alternative endpoint)
router.post('/messages', async (req, res) => {
  try {
    const messagesCollection = await getCollection('chat_messages');
    const { 
      channelId, 
      senderId, 
      message, 
      type = 'text',
      attachments = []
    } = req.body;
    
    if (!channelId || !senderId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Channel ID, sender ID, and message are required'
      });
    }
    
    const messageData = {
      channelId,
      senderId,
      message,
      type,
      attachments,
      status: 'sent',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await messagesCollection.insertOne(messageData);
    
    res.status(201).json({
      success: true,
      data: {
        message: {
          ...messageData,
          _id: result.insertedId
        }
      },
      message: 'Message created successfully'
    });
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===== CHAT CHANNELS =====

// GET /api/v1/chat/channels - Get all channels
router.get('/channels', async (req, res) => {
  try {
    const channelsCollection = await getCollection('chat_channels');
    const { page = 1, limit = 20, type, userId } = req.query;
    
    const filter = {};
    if (type) filter.type = type;
    if (userId) filter.members = userId;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const channels = await channelsCollection
      .find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ updatedAt: -1 })
      .toArray();
    
    const total = await channelsCollection.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        channels,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching channels:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch channels',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/v1/chat/channels - Create new channel
router.post('/channels', checkRole(['head_administrator']), async (req, res) => {
  try {
    const channelsCollection = await getCollection('chat_channels');
    const { 
      name, 
      description, 
      type, 
      members, 
      isPrivate 
    } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: 'Name and type are required'
      });
    }
    
    const channel = {
      name,
      description: description || '',
      type,
      members: members || [],
      isPrivate: isPrivate || false,
      createdBy: req.user.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await channelsCollection.insertOne(channel);
    
    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...channel
      },
      message: 'Channel created successfully'
    });
  } catch (error) {
    console.error('Error creating channel:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create channel',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===== CHAT ANALYTICS =====

// GET /api/v1/chat/analytics - Get chat analytics
router.get('/analytics', async (req, res) => {
  try {
    const messagesCollection = await getCollection('chat_messages');
    const channelsCollection = await getCollection('chat_channels');
    
    const totalMessages = await messagesCollection.countDocuments();
    const totalChannels = await channelsCollection.countDocuments();
    
    // Get messages by type
    const messageTypeStats = await messagesCollection.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]).toArray();
    
    // Get channels by type
    const channelTypeStats = await channelsCollection.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]).toArray();
    
    // Get recent activity (last 24 hours)
    const recentMessages = await messagesCollection.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    
    res.json({
      success: true,
      data: {
        overview: {
          totalMessages,
          totalChannels,
          recentMessages
        },
        messageTypeStats,
        channelTypeStats
      }
    });
  } catch (error) {
    console.error('Error fetching chat analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================================================
// PARAMETERIZED ROUTES (MUST COME LAST TO AVOID CONFLICTS)
// ============================================================================

// GET /api/v1/chat/messages/:channelId - Get messages for specific channel
router.get('/messages/:channelId', checkRole(['head_administrator', 'admin', 'support_agent', 'user']), async (req, res) => {
  try {
    const messagesCollection = await getCollection('chat_messages');
    const { channelId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const messages = await messagesCollection
      .find({ channelId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await messagesCollection.countDocuments({ channelId });
    
    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching channel messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch channel messages',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/v1/chat/messages/:id - Get specific message
router.get('/messages/:id', async (req, res) => {
  try {
    const messagesCollection = await getCollection('chat_messages');
    const message = await messagesCollection.findOne({ _id: new ObjectId(req.params.id) });
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/v1/chat/messages/:id - Update message
router.put('/messages/:id', async (req, res) => {
  try {
    const messagesCollection = await getCollection('chat_messages');
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };
    
    const result = await messagesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    res.json({
      success: true,
      data: { id, ...updateData },
      message: 'Message updated successfully'
    });
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/v1/chat/messages/:id - Delete message
router.delete('/messages/:id', async (req, res) => {
  try {
    const messagesCollection = await getCollection('chat_messages');
    const { id } = req.params;
    
    const result = await messagesCollection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;