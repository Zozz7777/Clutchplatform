/**
 * WebSocket Server
 * Handles real-time communication with frontend clients
 */

const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

class WebSocketServer {
  constructor() {
    this.wss = null;
    this.clients = new Map();
    this.heartbeatInterval = null;
  }

  initialize(server) {
    console.log('🔌 Initializing WebSocket server...');
    
    this.wss = new WebSocket.Server({ 
      server,
      path: '/ws'
    });

    this.wss.on('connection', (ws, req) => {
      console.log('🔌 New WebSocket connection attempt');
      
      // Extract token from query parameters
      const url = new URL(req.url, `http://${req.headers.host}`);
      const token = url.searchParams.get('token');
      
      if (!token) {
        console.log('❌ WebSocket connection rejected: No token provided');
        ws.close(1008, 'No authentication token provided');
        return;
      }

      // Verify JWT token
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('✅ WebSocket connection authenticated for user:', decoded.email);
        
        // Store client connection
        const clientId = `${decoded.userId}_${Date.now()}`;
        this.clients.set(clientId, {
          ws,
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role,
          permissions: decoded.permissions,
          connectedAt: new Date()
        });

        // Send welcome message
        ws.send(JSON.stringify({
          type: 'connection',
          message: 'Connected to Clutch real-time updates',
          clientId,
          timestamp: new Date().toISOString()
        }));

        // Handle incoming messages
        ws.on('message', (message) => {
          try {
            const data = JSON.parse(message);
            this.handleMessage(clientId, data);
          } catch (error) {
            console.error('❌ WebSocket message parsing error:', error);
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Invalid message format',
              timestamp: new Date().toISOString()
            }));
          }
        });

        // Handle connection close
        ws.on('close', (code, reason) => {
          console.log(`🔌 WebSocket connection closed: ${code} - ${reason}`);
          this.clients.delete(clientId);
        });

        // Handle connection errors
        ws.on('error', (error) => {
          console.error('❌ WebSocket connection error:', error);
          this.clients.delete(clientId);
        });

        // Send heartbeat
        ws.on('pong', () => {
          const client = this.clients.get(clientId);
          if (client) {
            client.lastPong = new Date();
          }
        });

      } catch (error) {
        console.log('❌ WebSocket connection rejected: Invalid token');
        ws.close(1008, 'Invalid authentication token');
      }
    });

    // Start heartbeat to keep connections alive
    this.startHeartbeat();
    
    console.log('✅ WebSocket server initialized');
  }

  handleMessage(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client) return;

    console.log('📨 WebSocket message from', client.email, ':', data.type);

    switch (data.type) {
      case 'ping':
        client.ws.send(JSON.stringify({
          type: 'pong',
          timestamp: new Date().toISOString()
        }));
        break;

      case 'subscribe':
        // Handle subscription to specific channels
        client.ws.send(JSON.stringify({
          type: 'subscribed',
          channel: data.channel,
          timestamp: new Date().toISOString()
        }));
        break;

      default:
        client.ws.send(JSON.stringify({
          type: 'error',
          message: 'Unknown message type',
          timestamp: new Date().toISOString()
        }));
    }
  }

  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.clients.forEach((client, clientId) => {
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.ping();
          
          // Check if client responded to ping
          if (client.lastPong && (Date.now() - client.lastPong.getTime()) > 30000) {
            console.log('🔌 Removing unresponsive WebSocket client:', client.email);
            client.ws.terminate();
            this.clients.delete(clientId);
          }
        } else {
          // Remove closed connections
          this.clients.delete(clientId);
        }
      });
    }, 30000); // Send ping every 30 seconds
  }

  broadcast(message, filter = null) {
    const data = JSON.stringify({
      ...message,
      timestamp: new Date().toISOString()
    });

    this.clients.forEach((client, clientId) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        // Apply filter if provided
        if (!filter || filter(client)) {
          client.ws.send(data);
        }
      }
    });
  }

  sendToUser(userId, message) {
    const data = JSON.stringify({
      ...message,
      timestamp: new Date().toISOString()
    });

    this.clients.forEach((client, clientId) => {
      if (client.ws.readyState === WebSocket.OPEN && client.userId === userId) {
        client.ws.send(data);
      }
    });
  }

  getStats() {
    return {
      totalConnections: this.clients.size,
      activeConnections: Array.from(this.clients.values()).filter(
        client => client.ws.readyState === WebSocket.OPEN
      ).length,
      clients: Array.from(this.clients.values()).map(client => ({
        userId: client.userId,
        email: client.email,
        role: client.role,
        connectedAt: client.connectedAt
      }))
    };
  }

  shutdown() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    this.clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.close(1001, 'Server shutting down');
      }
    });
    
    this.clients.clear();
    
    if (this.wss) {
      this.wss.close();
    }
  }
}

// Create singleton instance
const webSocketServer = new WebSocketServer();

module.exports = webSocketServer;
