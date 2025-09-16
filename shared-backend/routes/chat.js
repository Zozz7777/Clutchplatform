const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { checkRole, checkPermission } = require('../middleware/rbac');
const { getCollection } = require('../config/optimized-database');
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

// ===== CHAT MESSAGES =====

// GET /api/chat/messages - Get all messages
router.get('/messages', async (req, res) => {
  try {
    const messagesCollection = await getCollection('chat_messages');
    const { page = 1, limit = 50, channelId, userId, type } = req.query;
    
    const filter = {};
    if (channelId) filter.channelId = channelId;
    if (userId) filter.userId = userId;
    if (type) filter.type = type;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const messages = await messagesCollection
      .find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
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

// GET /api/chat/messages/:id - Get message by ID
router.get('/messages/:id', async (req, res) => {
  try {
    const messagesCollection = await getCollection('chat_messages');
    const message = await messagesCollection.findOne({ _id: req.params.id });
    
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

// POST /api/chat/messages - Create new message
router.post('/messages', async (req, res) => {
  try {
    const messagesCollection = await getCollection('chat_messages');
    const { 
      channelId, 
      content, 
      type, 
      replyTo, 
      attachments 
    } = req.body;
    
    if (!channelId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Channel ID and content are required'
      });
    }
    
    const message = {
      channelId,
      content,
      type: type || 'text',
      replyTo: replyTo || null,
      attachments: attachments || [],
      userId: req.user.userId,
      userName: req.user.name || req.user.email,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await messagesCollection.insertOne(message);
    
    // Broadcast message to WebSocket clients
    webSocketServer.broadcast({
      type: 'new_message',
      data: {
        id: result.insertedId,
        ...message
      }
    });
    
    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...message
      },
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/chat/messages/:id - Update message
router.put('/messages/:id', async (req, res) => {
  try {
    const messagesCollection = await getCollection('chat_messages');
    const { content, type, attachments } = req.body;
    
    const updateData = {
      updatedAt: new Date()
    };
    
    if (content) updateData.content = content;
    if (type) updateData.type = type;
    if (attachments) updateData.attachments = attachments;
    
    const result = await messagesCollection.updateOne(
      { _id: req.params.id, userId: req.user.userId },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or you are not authorized to edit it'
      });
    }
    
    // Broadcast message update to WebSocket clients
    webSocketServer.broadcast({
      type: 'message_updated',
      data: {
        id: req.params.id,
        ...updateData
      }
    });
    
    res.json({
      success: true,
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

// DELETE /api/chat/messages/:id - Delete message
router.delete('/messages/:id', async (req, res) => {
  try {
    const messagesCollection = await getCollection('chat_messages');
    const result = await messagesCollection.deleteOne({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or you are not authorized to delete it'
      });
    }
    
    // Broadcast message deletion to WebSocket clients
    webSocketServer.broadcast({
      type: 'message_deleted',
      data: {
        id: req.params.id
      }
    });
    
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

// ===== CHAT CHANNELS =====

// GET /api/chat/channels - Get all channels
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

// POST /api/chat/channels - Create new channel
router.post('/channels', checkRole(['head_administrator', 'head_administrator']), async (req, res) => {
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
      members: members || [req.user.userId],
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

// GET /api/chat/analytics - Get chat analytics
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

module.exports = router;