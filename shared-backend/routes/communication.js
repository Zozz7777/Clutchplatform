const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole } = require('../middleware/unified-auth');
const { getCollection } = require('../config/optimized-database');
const { ObjectId } = require('mongodb');

// Helper to generate mock data for chat channels (for development/testing)
const generateMockChatChannels = (count = 5) => {
  const channels = [];
  const types = ['support', 'internal', 'customer', 'group'];
  const statuses = ['active', 'inactive', 'archived'];

  for (let i = 0; i < count; i++) {
    channels.push({
      _id: new ObjectId(),
      name: `Channel ${i + 1}`,
      type: types[Math.floor(Math.random() * types.length)],
      participants: Math.floor(Math.random() * 50) + 5,
      unreadMessages: Math.floor(Math.random() * 20),
      lastMessage: {
        content: `Last message in channel ${i + 1}`,
        sender: `User ${Math.floor(Math.random() * 10) + 1}`,
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
      },
      status: statuses[Math.floor(Math.random() * statuses.length)]
    });
  }
  return channels;
};

// Helper to generate mock data for support tickets (for development/testing)
const generateMockTickets = (count = 8) => {
  const tickets = [];
  const priorities = ['low', 'medium', 'high', 'urgent'];
  const statuses = ['open', 'in_progress', 'resolved', 'closed'];
  const categories = ['technical', 'billing', 'general', 'feature_request'];

  for (let i = 0; i < count; i++) {
    tickets.push({
      _id: new ObjectId(),
      ticketNumber: `TICKET-${String(i + 1).padStart(4, '0')}`,
      subject: `Support Request ${i + 1}`,
      description: `Description for support ticket ${i + 1}`,
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      customer: {
        name: `Customer ${i + 1}`,
        email: `customer${i + 1}@example.com`,
        phone: `+1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`
      },
      assignedTo: Math.random() > 0.5 ? `Agent ${Math.floor(Math.random() * 5) + 1}` : null,
      category: categories[Math.floor(Math.random() * categories.length)],
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      responseTime: Math.floor(Math.random() * 48) + 1
    });
  }
  return tickets;
};

// Helper to generate mock data for chat conversations (for development/testing)
const generateMockConversations = (count = 5) => {
  const conversations = [];
  const statuses = ['active', 'inactive', 'archived'];
  const participants = ['user1', 'user2', 'support', 'admin'];

  for (let i = 0; i < count; i++) {
    conversations.push({
      _id: new ObjectId(),
      participants: [participants[Math.floor(Math.random() * participants.length)], participants[Math.floor(Math.random() * participants.length)]],
      lastMessage: `Last message in conversation ${i + 1}`,
      lastMessageAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      unreadCount: Math.floor(Math.random() * 10),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    });
  }
  return conversations;
};

// GET all chat channels
router.get('/chat-channels', authenticateToken, checkRole(['head_administrator', 'communication_manager', 'support_manager']), async (req, res) => {
  try {
    const channelsCollection = await getCollection('chat_channels');
    if (!channelsCollection) {
      return res.status(500).json({ success: false, error: 'DATABASE_CONNECTION_FAILED', message: 'Database connection failed' });
    }

    const channels = await channelsCollection.find({}).toArray();

    if (channels.length === 0) {
      // Seed with mock data if collection is empty
      const mockChannels = generateMockChatChannels();
      await channelsCollection.insertMany(mockChannels);
      return res.json({ success: true, data: mockChannels, message: 'Mock Chat Channels retrieved successfully' });
    }

    res.json({ success: true, data: channels, message: 'Chat Channels retrieved successfully' });
  } catch (error) {
    console.error('Get chat channels error:', error);
    res.status(500).json({ success: false, error: 'GET_CHANNELS_FAILED', message: 'Failed to get chat channels' });
  }
});

// GET all support tickets
router.get('/tickets', authenticateToken, checkRole(['head_administrator', 'support_manager', 'customer_service']), async (req, res) => {
  try {
    const ticketsCollection = await getCollection('support_tickets');
    if (!ticketsCollection) {
      return res.status(500).json({ success: false, error: 'DATABASE_CONNECTION_FAILED', message: 'Database connection failed' });
    }

    const tickets = await ticketsCollection.find({}).toArray();

    if (tickets.length === 0) {
      // Seed with mock data if collection is empty
      const mockTickets = generateMockTickets();
      await ticketsCollection.insertMany(mockTickets);
      return res.json({ success: true, data: mockTickets, message: 'Mock Support Tickets retrieved successfully' });
    }

    res.json({ success: true, data: tickets, message: 'Support Tickets retrieved successfully' });
  } catch (error) {
    console.error('Get support tickets error:', error);
    res.status(500).json({ success: false, error: 'GET_TICKETS_FAILED', message: 'Failed to get support tickets' });
  }
});

// GET /api/v1/communication/chat - Get chat messages
router.get('/chat', authenticateToken, checkRole(['head_administrator', 'communication_manager', 'support_manager']), async (req, res) => {
  try {
    const { chatId } = req.query;
    const messagesCollection = await getCollection('chat_messages');
    
    if (!messagesCollection) {
      return res.status(500).json({ 
        success: false, 
        error: 'DATABASE_CONNECTION_FAILED', 
        message: 'Database connection failed' 
      });
    }

    let query = {};
    if (chatId) {
      query.chatId = chatId;
    }

    const messages = await messagesCollection.find(query).sort({ timestamp: -1 }).limit(50).toArray();

    res.json({ 
      success: true, 
      data: messages, 
      message: 'Chat messages retrieved successfully' 
    });
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'GET_CHAT_MESSAGES_FAILED', 
      message: 'Failed to get chat messages' 
    });
  }
});

// GET /api/v1/communication/chat/conversations - Get chat conversations
router.get('/chat/conversations', authenticateToken, checkRole(['head_administrator', 'communication_manager', 'support_manager', 'user']), async (req, res) => {
  try {
    const conversationsCollection = await getCollection('chat_conversations');
    
    if (!conversationsCollection) {
      return res.status(500).json({
        success: false,
        error: 'DATABASE_CONNECTION_FAILED',
        message: 'Database connection failed'
      });
    }

    // Get all conversations
    const conversations = await conversationsCollection.find({}).sort({ lastMessageAt: -1 }).toArray();

    // If no conversations exist, create some mock data
    if (conversations.length === 0) {
      const mockConversations = generateMockConversations();
      await conversationsCollection.insertMany(mockConversations);
      return res.json({
        success: true,
        data: mockConversations,
        message: 'Mock conversations retrieved successfully'
      });
    }

    res.json({
      success: true,
      data: conversations,
      message: 'Chat conversations retrieved successfully'
    });
  } catch (error) {
    console.error('Get chat conversations error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_CHAT_CONVERSATIONS_FAILED',
      message: 'Failed to get chat conversations'
    });
  }
});

// POST /api/v1/communication/chat - Send chat message
router.post('/chat', authenticateToken, checkRole(['head_administrator', 'communication_manager', 'support_manager', 'user']), async (req, res) => {
  try {
    const { chatId, message, senderId, senderName } = req.body;
    
    if (!message || !senderId) {
      return res.status(400).json({ 
        success: false, 
        error: 'MISSING_REQUIRED_FIELDS', 
        message: 'Message and senderId are required' 
      });
    }

    const messagesCollection = await getCollection('chat_messages');
    
    if (!messagesCollection) {
      return res.status(500).json({ 
        success: false, 
        error: 'DATABASE_CONNECTION_FAILED', 
        message: 'Database connection failed' 
      });
    }

    const newMessage = {
      chatId: chatId || 'default',
      message,
      senderId,
      senderName: senderName || 'Unknown User',
      timestamp: new Date().toISOString(),
      read: false
    };

    const result = await messagesCollection.insertOne(newMessage);

    res.json({ 
      success: true, 
      data: { ...newMessage, _id: result.insertedId }, 
      message: 'Message sent successfully' 
    });
  } catch (error) {
    console.error('Send chat message error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'SEND_MESSAGE_FAILED', 
      message: 'Failed to send message' 
    });
  }
});

// GET /api/v1/communication/email - Get email history
router.get('/email', authenticateToken, checkRole(['head_administrator', 'communication_manager', 'support_manager']), async (req, res) => {
  try {
    const emailsCollection = await getCollection('email_history');
    
    if (!emailsCollection) {
      return res.status(500).json({ 
        success: false, 
        error: 'DATABASE_CONNECTION_FAILED', 
        message: 'Database connection failed' 
      });
    }

    const emails = await emailsCollection.find({}).sort({ timestamp: -1 }).limit(100).toArray();

    res.json({ 
      success: true, 
      data: emails, 
      message: 'Email history retrieved successfully' 
    });
  } catch (error) {
    console.error('Get email history error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'GET_EMAIL_HISTORY_FAILED', 
      message: 'Failed to get email history' 
    });
  }
});

// POST /api/v1/communication/email - Send email
router.post('/email', authenticateToken, checkRole(['head_administrator', 'communication_manager', 'support_manager']), async (req, res) => {
  try {
    const { to, subject, body, type = 'outbound' } = req.body;
    
    if (!to || !subject || !body) {
      return res.status(400).json({ 
        success: false, 
        error: 'MISSING_REQUIRED_FIELDS', 
        message: 'To, subject, and body are required' 
      });
    }

    const emailsCollection = await getCollection('email_history');
    
    if (!emailsCollection) {
      return res.status(500).json({ 
        success: false, 
        error: 'DATABASE_CONNECTION_FAILED', 
        message: 'Database connection failed' 
      });
    }

    const newEmail = {
      to,
      subject,
      body,
      type,
      status: 'sent',
      timestamp: new Date().toISOString()
    };

    const result = await emailsCollection.insertOne(newEmail);

    res.json({ 
      success: true, 
      data: { ...newEmail, _id: result.insertedId }, 
      message: 'Email sent successfully' 
    });
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'SEND_EMAIL_FAILED', 
      message: 'Failed to send email' 
    });
  }
});

module.exports = router;