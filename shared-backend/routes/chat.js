/**
 * Chat & Messaging Routes
 * Complete chat system with real-time messaging and communication management
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { getCollection } = require('../config/optimized-database');
const { rateLimit: createRateLimit } = require('../middleware/rateLimit');
const { ObjectId } = require('mongodb');

// Apply rate limiting
const chatRateLimit = createRateLimit({ windowMs: 60 * 1000, max: 200 });

// ==================== MESSAGE MANAGEMENT ====================

// GET /api/chat/messages - Get chat messages
router.get('/messages', authenticateToken, requireRole(['admin', 'user', 'support', 'super_admin']), chatRateLimit, async (req, res) => {
  try {
    const { page = 1, limit = 50, channel, userId, type, dateFrom, dateTo } = req.query;
    const skip = (page - 1) * limit;
    
    const messagesCollection = await getCollection('chat_messages');
    
    // Build query
    const query = {};
    if (channel) query.channel = channel;
    if (userId) query.userId = userId;
    if (type) query.type = type;
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }
    
    const messages = await messagesCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await messagesCollection.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Messages retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_MESSAGES_FAILED',
      message: 'Failed to retrieve messages',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/chat/messages/:id - Get message by ID
router.get('/messages/:id', authenticateToken, requireRole(['admin', 'user', 'support', 'super_admin']), chatRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const messagesCollection = await getCollection('chat_messages');
    
    const message = await messagesCollection.findOne({ _id: new ObjectId(id) });
    
    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'MESSAGE_NOT_FOUND',
        message: 'Message not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: { message },
      message: 'Message retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get message error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_MESSAGE_FAILED',
      message: 'Failed to retrieve message',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/chat/messages - Send new message
router.post('/messages', authenticateToken, requireRole(['admin', 'user', 'support', 'super_admin']), chatRateLimit, async (req, res) => {
  try {
    const {
      content,
      channel = 'general',
      type = 'text',
      recipientId,
      metadata = {}
    } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Message content is required',
        timestamp: new Date().toISOString()
      });
    }
    
    const messagesCollection = await getCollection('chat_messages');
    
    const newMessage = {
      content,
      channel,
      type,
      senderId: req.user.userId,
      recipientId: recipientId || null,
      metadata,
      status: 'sent',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await messagesCollection.insertOne(newMessage);
    
    // Broadcast message to WebSocket clients (if WebSocket is available)
    try {
      const { webSocketServer } = require('../services/websocket-server');
      if (webSocketServer) {
        webSocketServer.broadcast({
          type: 'new_message',
          data: { ...newMessage, _id: result.insertedId }
        });
      }
    } catch (wsError) {
      console.log('WebSocket not available for message broadcast');
    }
    
    res.status(201).json({
      success: true,
      data: { message: { ...newMessage, _id: result.insertedId } },
      message: 'Message sent successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      error: 'SEND_MESSAGE_FAILED',
      message: 'Failed to send message',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/chat/messages/:id - Update message
router.put('/messages/:id', authenticateToken, requireRole(['admin', 'user', 'support', 'super_admin']), chatRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, status } = req.body;
    
    const messagesCollection = await getCollection('chat_messages');
    
    // Check if message exists and user has permission to edit
    const message = await messagesCollection.findOne({ _id: new ObjectId(id) });
    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'MESSAGE_NOT_FOUND',
        message: 'Message not found',
        timestamp: new Date().toISOString()
      });
    }
    
    // Only allow sender or admin to edit
    if (message.senderId !== req.user.userId && !req.user.role.includes('admin')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You can only edit your own messages',
        timestamp: new Date().toISOString()
      });
    }
    
    const updateData = { updatedAt: new Date() };
    if (content !== undefined) updateData.content = content;
    if (status !== undefined) updateData.status = status;
    
    const result = await messagesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        error: 'UPDATE_FAILED',
        message: 'Failed to update message',
        timestamp: new Date().toISOString()
      });
    }
    
    const updatedMessage = await messagesCollection.findOne({ _id: new ObjectId(id) });
    
    res.json({
      success: true,
      data: { message: updatedMessage },
      message: 'Message updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Update message error:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_MESSAGE_FAILED',
      message: 'Failed to update message',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/chat/messages/:id - Delete message
router.delete('/messages/:id', authenticateToken, requireRole(['admin', 'user', 'support', 'super_admin']), chatRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const messagesCollection = await getCollection('chat_messages');
    
    // Check if message exists and user has permission to delete
    const message = await messagesCollection.findOne({ _id: new ObjectId(id) });
    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'MESSAGE_NOT_FOUND',
        message: 'Message not found',
        timestamp: new Date().toISOString()
      });
    }
    
    // Only allow sender or admin to delete
    if (message.senderId !== req.user.userId && !req.user.role.includes('admin')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You can only delete your own messages',
        timestamp: new Date().toISOString()
      });
    }
    
    const result = await messagesCollection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return res.status(400).json({
        success: false,
        error: 'DELETE_FAILED',
        message: 'Failed to delete message',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: { id },
      message: 'Message deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      error: 'DELETE_MESSAGE_FAILED',
      message: 'Failed to delete message',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== CHANNEL MANAGEMENT ====================

// GET /api/chat/channels - Get chat channels
router.get('/channels', authenticateToken, requireRole(['admin', 'user', 'support', 'super_admin']), chatRateLimit, async (req, res) => {
  try {
    const channelsCollection = await getCollection('chat_channels');
    
    const channels = await channelsCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json({
      success: true,
      data: { channels },
      message: 'Channels retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get channels error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_CHANNELS_FAILED',
      message: 'Failed to retrieve channels',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/chat/channels - Create new channel
router.post('/channels', authenticateToken, requireRole(['admin', 'super_admin']), chatRateLimit, async (req, res) => {
  try {
    const { name, description, type = 'public', members = [] } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Channel name is required',
        timestamp: new Date().toISOString()
      });
    }
    
    const channelsCollection = await getCollection('chat_channels');
    
    // Check if channel already exists
    const existingChannel = await channelsCollection.findOne({ name: name.toLowerCase() });
    if (existingChannel) {
      return res.status(409).json({
        success: false,
        error: 'CHANNEL_EXISTS',
        message: 'Channel with this name already exists',
        timestamp: new Date().toISOString()
      });
    }
    
    const newChannel = {
      name: name.toLowerCase(),
      displayName: name,
      description: description || null,
      type,
      members: [...members, req.user.userId], // Include creator
      createdBy: req.user.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await channelsCollection.insertOne(newChannel);
    
    res.status(201).json({
      success: true,
      data: { channel: { ...newChannel, _id: result.insertedId } },
      message: 'Channel created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create channel error:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_CHANNEL_FAILED',
      message: 'Failed to create channel',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== CHAT ANALYTICS ====================

// GET /api/chat/analytics - Get chat analytics
router.get('/analytics', authenticateToken, requireRole(['admin', 'super_admin']), chatRateLimit, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    const messagesCollection = await getCollection('chat_messages');
    const channelsCollection = await getCollection('chat_channels');
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(period.replace('d', '')));
    
    // Message statistics
    const totalMessages = await messagesCollection.countDocuments();
    const periodMessages = await messagesCollection.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    // Channel statistics
    const totalChannels = await channelsCollection.countDocuments();
    
    // Active users (users who sent messages in the period)
    const activeUsers = await messagesCollection.distinct('senderId', {
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    const analytics = {
      messages: {
        total: totalMessages,
        period: periodMessages
      },
      channels: {
        total: totalChannels
      },
      users: {
        active: activeUsers.length
      },
      period,
      generatedAt: new Date()
    };
    
    res.json({
      success: true,
      data: analytics,
      message: 'Chat analytics retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get chat analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_CHAT_ANALYTICS_FAILED',
      message: 'Failed to retrieve chat analytics',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== GENERIC HANDLERS ====================

// GET /api/chat - Get chat overview
router.get('/', authenticateToken, requireRole(['admin', 'user', 'support', 'super_admin']), chatRateLimit, async (req, res) => {
  res.json({
    success: true,
    message: 'Chat & Messaging API is running',
    endpoints: {
      messages: '/api/chat/messages',
      channels: '/api/chat/channels',
      analytics: '/api/chat/analytics'
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
