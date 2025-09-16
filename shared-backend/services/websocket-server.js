const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

class WebSocketServer {
  constructor() {
    this.wss = null;
    this.clients = new Map();
    this.heartbeatInterval = null;
  }

  initialize(server) {
    try {
      this.wss = new WebSocket.Server({ 
        server,
        path: '/ws',
        verifyClient: (info) => {
          // Extract token from query string
          const url = new URL(info.req.url, `http://${info.req.headers.host}`);
          const token = url.searchParams.get('token');
          
          if (!token) {
            console.log('❌ WebSocket connection rejected: No token provided');
            return false;
          }

          try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            info.req.user = decoded;
            return true;
          } catch (error) {
            console.log('❌ WebSocket connection rejected: Invalid token', error.message);
            return false;
          }
        }
      });

      this.wss.on('connection', (ws, req) => {
        const user = req.user;
        const clientId = `${user.userId || user.id}-${Date.now()}`;
        
        console.log(`🔌 WebSocket client connected: ${clientId} (${user.email})`);
        
        // Store client connection
        this.clients.set(clientId, {
          ws,
          user,
          lastPing: Date.now()
        });

        // Send connection confirmation
        ws.send(JSON.stringify({
          type: 'connection',
          message: 'Connected successfully',
          clientId,
          user: {
            id: user.userId || user.id,
            email: user.email,
            role: user.role
          }
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
              message: 'Invalid message format'
            }));
          }
        });

        // Handle client disconnect
        ws.on('close', () => {
          console.log(`🔌 WebSocket client disconnected: ${clientId}`);
          this.clients.delete(clientId);
        });

        // Handle errors
        ws.on('error', (error) => {
          console.error(`❌ WebSocket client error (${clientId}):`, error);
          this.clients.delete(clientId);
        });

        // Send ping to keep connection alive
        ws.ping();
      });

      // Start heartbeat
      this.startHeartbeat();

      console.log('✅ WebSocket server initialized on /ws');
      return true;
    } catch (error) {
      console.error('❌ WebSocket server initialization failed:', error);
      return false;
    }
  }

  handleMessage(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client) return;

    switch (data.type) {
      case 'ping':
        client.ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        break;
      
      case 'subscribe':
        // Handle subscription to specific channels
        client.ws.send(JSON.stringify({
          type: 'subscribed',
          channel: data.channel
        }));
        break;
      
      default:
        console.log(`📨 WebSocket message from ${clientId}:`, data.type);
    }
  }

  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.clients.forEach((client, clientId) => {
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.ping();
        } else {
          this.clients.delete(clientId);
        }
      });
    }, 30000); // Ping every 30 seconds
  }

  broadcast(message, excludeClientId = null) {
    const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
    
    this.clients.forEach((client, clientId) => {
      if (clientId !== excludeClientId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(messageStr);
      }
    });
  }

  sendToUser(userId, message) {
    const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
    
    this.clients.forEach((client, clientId) => {
      if (client.user.userId === userId || client.user.id === userId) {
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(messageStr);
        }
      }
    });
  }

  getStats() {
    return {
      connectedClients: this.clients.size,
      isRunning: this.wss !== null,
      uptime: this.wss ? Date.now() - this.wss.startTime : 0
    };
  }

  stop() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }
    
    this.clients.clear();
    console.log('🔌 WebSocket server stopped');
  }
}

module.exports = new WebSocketServer();