/**
 * Communication Management Routes
 * Handles chat, notifications, and messaging
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { getCollection } = require('../config/optimized-database');

// GET /api/v1/communication/chat - Get chat messages
router.get('/chat', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50, chatId, userId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const chatMessagesCollection = await getCollection('chat_messages');
    
    // Build filter
    const filter = {};
    if (chatId) {
      filter.chatId = chatId;
    } else if (userId) {
      // Get messages where user is either sender or receiver
      filter.$or = [
        { senderId: userId },
        { receiverId: userId }
      ];
    } else {
      // Default: get messages for current user
      filter.$or = [
        { senderId: req.user.userId },
        { receiverId: req.user.userId }
      ];
    }
    
    // Get messages with pagination
    const [messages, total] = await Promise.all([
      chatMessagesCollection
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray(),
      chatMessagesCollection.countDocuments(filter)
    ]);
    
    res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Reverse to show oldest first
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      },
      message: 'Chat messages retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_CHAT_MESSAGES_FAILED',
      message: 'Failed to retrieve chat messages',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/communication/chat - Send chat message
router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { receiverId, message, type = 'text', chatId } = req.body;
    
    if (!receiverId || !message) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'receiverId and message are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const chatMessagesCollection = await getCollection('chat_messages');
    
    const newMessage = {
      senderId: req.user.userId,
      receiverId,
      message,
      type,
      chatId: chatId || `chat_${req.user.userId}_${receiverId}`,
      status: 'sent',
      createdAt: new Date(),
      readAt: null
    };
    
    const result = await chatMessagesCollection.insertOne(newMessage);
    
    res.status(201).json({
      success: true,
      data: {
        message: {
          ...newMessage,
          _id: result.insertedId
        }
      },
      message: 'Message sent successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Send chat message error:', error);
    res.status(500).json({
      success: false,
      error: 'SEND_MESSAGE_FAILED',
      message: 'Failed to send message',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/v1/communication/chat/:id/read - Mark message as read
router.put('/chat/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const chatMessagesCollection = await getCollection('chat_messages');
    
    // Check if message exists and user is the receiver
    const message = await chatMessagesCollection.findOne({
      _id: id,
      receiverId: req.user.userId
    });
    
    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'MESSAGE_NOT_FOUND',
        message: 'Message not found or you are not the receiver',
        timestamp: new Date().toISOString()
      });
    }
    
    // Update message status
    const result = await chatMessagesCollection.updateOne(
      { _id: id, receiverId: req.user.userId },
      { 
        $set: { 
          status: 'read',
          readAt: new Date()
        }
      }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        error: 'UPDATE_FAILED',
        message: 'Failed to mark message as read',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      message: 'Message marked as read',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({
      success: false,
      error: 'MARK_READ_FAILED',
      message: 'Failed to mark message as read',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/communication/chat/conversations - Get user conversations
router.get('/chat/conversations', authenticateToken, async (req, res) => {
  try {
    const chatMessagesCollection = await getCollection('chat_messages');
    
    // Get unique conversations for the user
    const conversations = await chatMessagesCollection.aggregate([
      {
        $match: {
          $or: [
            { senderId: req.user.userId },
            { receiverId: req.user.userId }
          ]
        }
      },
      {
        $group: {
          _id: '$chatId',
          lastMessage: { $last: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { $eq: ['$receiverId', req.user.userId] },
                    { $ne: ['$status', 'read'] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]).toArray();
    
    res.json({
      success: true,
      data: { conversations },
      message: 'Conversations retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_CONVERSATIONS_FAILED',
      message: 'Failed to retrieve conversations',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/communication/chat/unread - Get unread message count
router.get('/chat/unread', authenticateToken, async (req, res) => {
  try {
    const chatMessagesCollection = await getCollection('chat_messages');
    
    const unreadCount = await chatMessagesCollection.countDocuments({
      receiverId: req.user.userId,
      status: { $ne: 'read' }
    });
    
    res.json({
      success: true,
      data: { unreadCount },
      message: 'Unread message count retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_UNREAD_COUNT_FAILED',
      message: 'Failed to retrieve unread message count',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/communication/email - Send email notification
router.post('/email', authenticateToken, requireRole(['admin', 'hr']), async (req, res) => {
  try {
    const { to, subject, body, type = 'notification' } = req.body;
    
    if (!to || !subject || !body) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'to, subject, and body are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const emailsCollection = await getCollection('emails');
    
    const newEmail = {
      to,
      subject,
      body,
      type,
      status: 'pending',
      sentBy: req.user.userId,
      createdAt: new Date(),
      sentAt: null
    };
    
    const result = await emailsCollection.insertOne(newEmail);
    
    // TODO: Integrate with actual email service (SendGrid, AWS SES, etc.)
    
    res.status(201).json({
      success: true,
      data: {
        email: {
          ...newEmail,
          _id: result.insertedId
        }
      },
      message: 'Email queued for sending',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({
      success: false,
      error: 'SEND_EMAIL_FAILED',
      message: 'Failed to send email',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/communication/email - Get email history
router.get('/email', authenticateToken, requireRole(['admin', 'hr']), async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const emailsCollection = await getCollection('emails');
    
    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    
    // Get emails with pagination
    const [emails, total] = await Promise.all([
      emailsCollection
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray(),
      emailsCollection.countDocuments(filter)
    ]);
    
    res.json({
      success: true,
      data: {
        emails,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      },
      message: 'Email history retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get email history error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_EMAIL_HISTORY_FAILED',
      message: 'Failed to retrieve email history',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;