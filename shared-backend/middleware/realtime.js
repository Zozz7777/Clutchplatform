const { Server } = require('socket.io');

// Real-time manager class
class RealtimeManager {
  constructor() {
    this.io = null;
    this.rooms = new Map();
    this.connections = new Map();
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
        methods: ['GET', 'POST']
      },
      transports: ['websocket', 'polling']
    });

    this.setupEventHandlers();
    console.log('✅ Real-time manager initialized');
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);
      this.connections.set(socket.id, {
        userId: null,
        userType: null,
        rooms: new Set()
      });

      // Handle user authentication
      socket.on('authenticate', (data) => {
        this.handleAuthentication(socket, data);
      });

      // Handle joining rooms
      socket.on('join-room', (roomId) => {
        this.handleJoinRoom(socket, roomId);
      });

      // Handle leaving rooms
      socket.on('leave-room', (roomId) => {
        this.handleLeaveRoom(socket, roomId);
      });

      // Handle chat messages
      socket.on('chat-message', (data) => {
        this.handleChatMessage(socket, data);
      });

      // Handle typing indicators
      socket.on('typing', (data) => {
        this.handleTyping(socket, data);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
  }

  handleAuthentication(socket, data) {
    const { userId, userType, token } = data;
    
    // Validate token here if needed
    const connection = this.connections.get(socket.id);
    if (connection) {
      connection.userId = userId;
      connection.userType = userType;
    }

    socket.emit('authenticated', { success: true });
    console.log(`🔐 User authenticated: ${userId} (${userType})`);
  }

  handleJoinRoom(socket, roomId) {
    socket.join(roomId);
    
    const connection = this.connections.get(socket.id);
    if (connection) {
      connection.rooms.add(roomId);
    }

    // Notify others in the room
    socket.to(roomId).emit('user-joined', {
      userId: connection?.userId,
      userType: connection?.userType,
      timestamp: new Date().toISOString()
    });

    console.log(`🚪 User joined room: ${roomId}`);
  }

  handleLeaveRoom(socket, roomId) {
    socket.leave(roomId);
    
    const connection = this.connections.get(socket.id);
    if (connection) {
      connection.rooms.delete(roomId);
    }

    // Notify others in the room
    socket.to(roomId).emit('user-left', {
      userId: connection?.userId,
      userType: connection?.userType,
      timestamp: new Date().toISOString()
    });

    console.log(`🚪 User left room: ${roomId}`);
  }

  handleChatMessage(socket, data) {
    const { roomId, message, type = 'text' } = data;
    const connection = this.connections.get(socket.id);

    const messageData = {
      id: Date.now().toString(),
      userId: connection?.userId,
      userType: connection?.userType,
      message,
      type,
      timestamp: new Date().toISOString()
    };

    // Broadcast to room
    this.io.to(roomId).emit('chat-message', messageData);
    console.log(`💬 Message sent in room ${roomId}: ${message.substring(0, 50)}...`);
  }

  handleTyping(socket, data) {
    const { roomId, isTyping } = data;
    const connection = this.connections.get(socket.id);

    socket.to(roomId).emit('typing', {
      userId: connection?.userId,
      userType: connection?.userType,
      isTyping,
      timestamp: new Date().toISOString()
    });
  }

  handleDisconnect(socket) {
    const connection = this.connections.get(socket.id);
    if (connection) {
      // Notify all rooms user was in
      connection.rooms.forEach(roomId => {
        socket.to(roomId).emit('user-disconnected', {
          userId: connection.userId,
          userType: connection.userType,
          timestamp: new Date().toISOString()
        });
      });
    }

    this.connections.delete(socket.id);
    console.log(`🔌 Client disconnected: ${socket.id}`);
  }

  // Public methods for broadcasting
  broadcastToRoom(roomId, event, data) {
    this.io.to(roomId).emit(event, data);
  }

  broadcastToUser(userId, event, data) {
    // Find socket by userId
    for (const [socketId, connection] of this.connections) {
      if (connection.userId === userId) {
        this.io.to(socketId).emit(event, data);
        break;
      }
    }
  }

  broadcastToAll(event, data) {
    this.io.emit(event, data);
  }

  getRoomMembers(roomId) {
    const room = this.io.sockets.adapter.rooms.get(roomId);
    return room ? Array.from(room) : [];
  }

  getConnectedUsers() {
    return Array.from(this.connections.values()).filter(conn => conn.userId);
  }
}

// Server-Sent Events middleware
const sseMiddleware = (req, res, next) => {
  res.sseSetup = () => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    res.write('data: {"type":"connection","message":"SSE connection established"}\n\n');
  };

  res.sseSend = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  next();
};

module.exports = {
  RealtimeManager,
  sseMiddleware
};
