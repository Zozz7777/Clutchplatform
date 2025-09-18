const express = require('express');
const router = express.Router();
const { getCollection } = require('../config/database');
const { authenticateToken, checkRole, checkPermission } = require('../middleware/unified-auth');

// ==================== REAL-TIME COMMUNICATION ROUTES ====================

// Store active connections for Server-Sent Events
const activeConnections = new Map();

// GET /api/v1/realtime/events - Server-Sent Events endpoint
router.get('/events', authenticateToken, (req, res) => {
  console.log('📡 Setting up Server-Sent Events connection for user:', req.user.id);
  
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });
  
  // Send initial connection event
  res.write(`data: ${JSON.stringify({
    type: 'connection',
    message: 'Connected to real-time updates',
    timestamp: new Date().toISOString()
  })}\n\n`);
  
  // Store connection
  const connectionId = `${req.user.id}_${Date.now()}`;
  activeConnections.set(connectionId, {
    userId: req.user.id,
    response: res,
    connectedAt: new Date()
  });
  
  // Send heartbeat every 30 seconds
  const heartbeat = setInterval(() => {
    try {
      res.write(`data: ${JSON.stringify({
        type: 'heartbeat',
        timestamp: new Date().toISOString()
      })}\n\n`);
    } catch (error) {
      clearInterval(heartbeat);
      activeConnections.delete(connectionId);
    }
  }, 30000);
  
  // Handle client disconnect
  req.on('close', () => {
    console.log('📡 SSE connection closed for user:', req.user.id);
    clearInterval(heartbeat);
    activeConnections.delete(connectionId);
  });
  
  req.on('error', (error) => {
    console.error('📡 SSE connection error:', error);
    clearInterval(heartbeat);
    activeConnections.delete(connectionId);
  });
});

// POST /api/v1/realtime/broadcast - Broadcast message to all connected users
router.post('/broadcast', authenticateToken, checkRole(['head_administrator', 'manager']), async (req, res) => {
  try {
    console.log('📡 Broadcasting message to all connected users');
    
    const { message, type = 'notification', data = {} } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Message is required'
      });
    }
    
    const broadcastData = {
      type,
      message,
      data,
      timestamp: new Date().toISOString(),
      from: req.user.name || req.user.email
    };
    
    // Send to all active connections
    let sentCount = 0;
    for (const [connectionId, connection] of activeConnections) {
      try {
        connection.response.write(`data: ${JSON.stringify(broadcastData)}\n\n`);
        sentCount++;
      } catch (error) {
        console.error('Error sending to connection:', connectionId, error);
        activeConnections.delete(connectionId);
      }
    }
    
    res.json({
      success: true,
      data: {
        sentTo: sentCount,
        totalConnections: activeConnections.size
      },
      message: 'Message broadcasted successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error broadcasting message:', error);
    res.status(500).json({
      success: false,
      error: 'BROADCAST_FAILED',
      message: 'Failed to broadcast message'
    });
  }
});

// POST /api/v1/realtime/send-to-user - Send message to specific user
router.post('/send-to-user', authenticateToken, async (req, res) => {
  try {
    console.log('📡 Sending message to specific user');
    
    const { userId, message, type = 'notification', data = {} } = req.body;
    
    if (!userId || !message) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'User ID and message are required'
      });
    }
    
    const messageData = {
      type,
      message,
      data,
      timestamp: new Date().toISOString(),
      from: req.user.name || req.user.email
    };
    
    // Find connections for the target user
    let sentCount = 0;
    for (const [connectionId, connection] of activeConnections) {
      if (connection.userId === userId) {
        try {
          connection.response.write(`data: ${JSON.stringify(messageData)}\n\n`);
          sentCount++;
        } catch (error) {
          console.error('Error sending to user connection:', connectionId, error);
          activeConnections.delete(connectionId);
        }
      }
    }
    
    res.json({
      success: true,
      data: {
        sentTo: sentCount,
        targetUserId: userId
      },
      message: 'Message sent successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error sending message to user:', error);
    res.status(500).json({
      success: false,
      error: 'SEND_MESSAGE_FAILED',
      message: 'Failed to send message to user'
    });
  }
});

// GET /api/v1/realtime/chat/rooms - Get chat rooms
router.get('/chat/rooms', authenticateToken, async (req, res) => {
  try {
    console.log('💬 Fetching chat rooms for user:', req.user.id);
    
    const chatRoomsCollection = await getCollection('chat_rooms');
    
    // Get rooms where user is a member
    const rooms = await chatRoomsCollection
      .find({
        $or: [
          { members: req.user.id },
          { createdBy: req.user.id },
          { type: 'public' }
        ]
      })
      .sort({ lastMessageAt: -1 })
      .toArray();
    
    // Get unread message counts
    const messagesCollection = await getCollection('chat_messages');
    const roomsWithUnread = await Promise.all(
      rooms.map(async (room) => {
        const unreadCount = await messagesCollection.countDocuments({
          roomId: room._id,
          senderId: { $ne: req.user.id },
          readBy: { $ne: req.user.id },
          createdAt: { $gt: room.lastReadAt || new Date(0) }
        });
        
        return {
          ...room,
          unreadCount
        };
      })
    );
    
    res.json({
      success: true,
      data: {
        rooms: roomsWithUnread,
        totalRooms: roomsWithUnread.length
      },
      message: 'Chat rooms retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching chat rooms:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_CHAT_ROOMS_FAILED',
      message: 'Failed to fetch chat rooms'
    });
  }
});

// POST /api/v1/realtime/chat/rooms - Create new chat room
router.post('/chat/rooms', authenticateToken, async (req, res) => {
  try {
    console.log('💬 Creating new chat room');
    
    const { name, description, type = 'private', members = [] } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Room name is required'
      });
    }
    
    const chatRoomsCollection = await getCollection('chat_rooms');
    
    const room = {
      name,
      description: description || '',
      type,
      members: [...new Set([req.user.id, ...members])], // Remove duplicates
      createdBy: req.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastMessageAt: new Date(),
      lastReadAt: new Date()
    };
    
    const result = await chatRoomsCollection.insertOne(room);
    
    // Send notification to all members
    const notificationData = {
      type: 'chat_room_created',
      message: `New chat room "${name}" created`,
      data: {
        roomId: result.insertedId,
        roomName: name,
        createdBy: req.user.name || req.user.email
      },
      timestamp: new Date().toISOString()
    };
    
    // Notify all room members
    for (const memberId of room.members) {
      for (const [connectionId, connection] of activeConnections) {
        if (connection.userId === memberId) {
          try {
            connection.response.write(`data: ${JSON.stringify(notificationData)}\n\n`);
          } catch (error) {
            activeConnections.delete(connectionId);
          }
        }
      }
    }
    
    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...room
      },
      message: 'Chat room created successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error creating chat room:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_CHAT_ROOM_FAILED',
      message: 'Failed to create chat room'
    });
  }
});

// GET /api/v1/realtime/chat/rooms/:id/messages - Get chat messages
router.get('/chat/rooms/:id/messages', authenticateToken, async (req, res) => {
  try {
    console.log('💬 Fetching chat messages for room:', req.params.id);
    
    const { ObjectId } = require('mongodb');
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;
    
    const chatRoomsCollection = await getCollection('chat_rooms');
    const messagesCollection = await getCollection('chat_messages');
    
    // Check if user has access to the room
    const room = await chatRoomsCollection.findOne({
      _id: new ObjectId(req.params.id),
      $or: [
        { members: req.user.id },
        { createdBy: req.user.id },
        { type: 'public' }
      ]
    });
    
    if (!room) {
      return res.status(403).json({
        success: false,
        error: 'ACCESS_DENIED',
        message: 'Access denied to this chat room'
      });
    }
    
    // Get messages
    const messages = await messagesCollection
      .find({ roomId: new ObjectId(req.params.id) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    // Get total count
    const total = await messagesCollection.countDocuments({ roomId: new ObjectId(req.params.id) });
    
    // Mark messages as read
    await messagesCollection.updateMany(
      {
        roomId: new ObjectId(req.params.id),
        senderId: { $ne: req.user.id },
        readBy: { $ne: req.user.id }
      },
      {
        $addToSet: { readBy: req.user.id }
      }
    );
    
    res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Return in chronological order
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Chat messages retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching chat messages:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_CHAT_MESSAGES_FAILED',
      message: 'Failed to fetch chat messages'
    });
  }
});

// POST /api/v1/realtime/chat/rooms/:id/messages - Send chat message
router.post('/chat/rooms/:id/messages', authenticateToken, async (req, res) => {
  try {
    console.log('💬 Sending chat message to room:', req.params.id);
    
    const { ObjectId } = require('mongodb');
    const { message, type = 'text', metadata = {} } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Message content is required'
      });
    }
    
    const chatRoomsCollection = await getCollection('chat_rooms');
    const messagesCollection = await getCollection('chat_messages');
    
    // Check if user has access to the room
    const room = await chatRoomsCollection.findOne({
      _id: new ObjectId(req.params.id),
      $or: [
        { members: req.user.id },
        { createdBy: req.user.id },
        { type: 'public' }
      ]
    });
    
    if (!room) {
      return res.status(403).json({
        success: false,
        error: 'ACCESS_DENIED',
        message: 'Access denied to this chat room'
      });
    }
    
    // Create message
    const chatMessage = {
      roomId: new ObjectId(req.params.id),
      senderId: req.user.id,
      senderName: req.user.name || req.user.email,
      message,
      type,
      metadata,
      createdAt: new Date(),
      readBy: [req.user.id]
    };
    
    const result = await messagesCollection.insertOne(chatMessage);
    
    // Update room's last message timestamp
    await chatRoomsCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { lastMessageAt: new Date() } }
    );
    
    // Send real-time notification to all room members
    const notificationData = {
      type: 'chat_message',
      message: 'New message received',
      data: {
        roomId: req.params.id,
        messageId: result.insertedId,
        sender: req.user.name || req.user.email,
        message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
        timestamp: chatMessage.createdAt
      },
      timestamp: new Date().toISOString()
    };
    
    // Notify all room members
    for (const memberId of room.members) {
      for (const [connectionId, connection] of activeConnections) {
        if (connection.userId === memberId) {
          try {
            connection.response.write(`data: ${JSON.stringify(notificationData)}\n\n`);
          } catch (error) {
            activeConnections.delete(connectionId);
          }
        }
      }
    }
    
    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...chatMessage
      },
      message: 'Message sent successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error sending chat message:', error);
    res.status(500).json({
      success: false,
      error: 'SEND_CHAT_MESSAGE_FAILED',
      message: 'Failed to send chat message'
    });
  }
});

// GET /api/v1/realtime/dashboard/updates - Live dashboard updates
router.get('/dashboard/updates', authenticateToken, async (req, res) => {
  try {
    console.log('📊 Setting up live dashboard updates for user:', req.user.id);
    
    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });
    
    // Send initial dashboard data
    const dashboardData = await getDashboardData(req.user.id);
    res.write(`data: ${JSON.stringify({
      type: 'dashboard_data',
      data: dashboardData,
      timestamp: new Date().toISOString()
    })}\n\n`);
    
    // Store connection for dashboard updates
    const connectionId = `dashboard_${req.user.id}_${Date.now()}`;
    activeConnections.set(connectionId, {
      userId: req.user.id,
      response: res,
      connectedAt: new Date(),
      type: 'dashboard'
    });
    
    // Send periodic dashboard updates
    const updateInterval = setInterval(async () => {
      try {
        const updatedData = await getDashboardData(req.user.id);
        res.write(`data: ${JSON.stringify({
          type: 'dashboard_update',
          data: updatedData,
          timestamp: new Date().toISOString()
        })}\n\n`);
      } catch (error) {
        clearInterval(updateInterval);
        activeConnections.delete(connectionId);
      }
    }, 30000); // Update every 30 seconds
    
    // Handle client disconnect
    req.on('close', () => {
      console.log('📊 Dashboard connection closed for user:', req.user.id);
      clearInterval(updateInterval);
      activeConnections.delete(connectionId);
    });
    
  } catch (error) {
    console.error('❌ Error setting up dashboard updates:', error);
    res.status(500).json({
      success: false,
      error: 'DASHBOARD_UPDATES_FAILED',
      message: 'Failed to setup dashboard updates'
    });
  }
});

// Helper function to get dashboard data
async function getDashboardData(userId) {
  try {
    const inventoryCollection = await getCollection('auto_parts_inventory');
    const ordersCollection = await getCollection('auto_parts_orders');
    const usersCollection = await getCollection('users');
    
    // Get real-time metrics
    const [
      totalParts,
      lowStockParts,
      totalOrders,
      activeUsers,
      recentOrders
    ] = await Promise.all([
      inventoryCollection.countDocuments(),
      inventoryCollection.countDocuments({ quantity: { $lte: 5 } }),
      ordersCollection.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
      usersCollection.countDocuments({ lastLoginAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
      ordersCollection.find({ status: 'pending' }).sort({ createdAt: -1 }).limit(5).toArray()
    ]);
    
    return {
      metrics: {
        totalParts,
        lowStockParts,
        totalOrders,
        activeUsers
      },
      recentOrders,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    return {
      metrics: { totalParts: 0, lowStockParts: 0, totalOrders: 0, activeUsers: 0 },
      recentOrders: [],
      lastUpdated: new Date().toISOString()
    };
  }
}

// GET /api/v1/realtime/connections - Get active connections (admin only)
router.get('/connections', authenticateToken, checkRole(['head_administrator']), async (req, res) => {
  try {
    console.log('📡 Fetching active connections');
    
    const connections = Array.from(activeConnections.entries()).map(([id, connection]) => ({
      id,
      userId: connection.userId,
      type: connection.type || 'general',
      connectedAt: connection.connectedAt,
      duration: Date.now() - connection.connectedAt.getTime()
    }));
    
    res.json({
      success: true,
      data: {
        connections,
        totalConnections: connections.length,
        connectionsByType: connections.reduce((acc, conn) => {
          acc[conn.type] = (acc[conn.type] || 0) + 1;
          return acc;
        }, {})
      },
      message: 'Active connections retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching connections:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_CONNECTIONS_FAILED',
      message: 'Failed to fetch active connections'
    });
  }
});


// Generic handlers for all HTTP methods
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: `${'realtime'} service is running`,
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: '/'
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).json({
    success: true,
    message: `${'realtime'} item retrieved`,
    data: { id: id, name: `Item ${id}`, status: 'active' },
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: `/${id}`
  });
});

router.post('/', (req, res) => {
  res.status(201).json({
    success: true,
    message: `${'realtime'} item created`,
    data: { id: Date.now(), ...req.body, createdAt: new Date().toISOString() },
    timestamp: new Date().toISOString(),
    method: 'POST',
    path: '/'
  });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).json({
    success: true,
    message: `${'realtime'} item updated`,
    data: { id: id, ...req.body, updatedAt: new Date().toISOString() },
    timestamp: new Date().toISOString(),
    method: 'PUT',
    path: `/${id}`
  });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).json({
    success: true,
    message: `${'realtime'} item deleted`,
    data: { id: id, deletedAt: new Date().toISOString() },
    timestamp: new Date().toISOString(),
    method: 'DELETE',
    path: `/${id}`
  });
});

router.get('/search', (req, res) => {
  res.status(200).json({
    success: true,
    message: `${'realtime'} search results`,
    data: { query: req.query.q || '', results: [], total: 0 },
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: '/search'
  });
});

module.exports = router;