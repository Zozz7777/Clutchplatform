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
          try {
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
              console.log('✅ WebSocket token validated for user:', decoded.userId || decoded.id);
              return true;
            } catch (error) {
              console.log('❌ WebSocket connection rejected: Invalid token', error.message);
              return false;
            }
          } catch (error) {
            console.log('❌ WebSocket connection rejected: URL parsing error', error.message);
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
          lastPing: Date.now(),
          connectedAt: Date.now()
        });

        // Send connection confirmation
        try {
          ws.send(JSON.stringify({
            type: 'connection',
            message: 'Connected successfully',
            clientId,
            user: {
              id: user.userId || user.id,
              email: user.email,
              role: user.role
            },
            timestamp: new Date().toISOString()
          }));
        } catch (error) {
          console.error('❌ Error sending connection confirmation:', error);
        }

        // Handle incoming messages
        ws.on('message', (message) => {
          try {
            const data = JSON.parse(message);
            this.handleMessage(clientId, data);
          } catch (error) {
            console.error('❌ WebSocket message parsing error:', error);
            try {
              ws.send(JSON.stringify({
                type: 'error',
                message: 'Invalid message format',
                timestamp: new Date().toISOString()
              }));
            } catch (sendError) {
              console.error('❌ Error sending error message:', sendError);
            }
          }
        });

        // Handle pong responses
        ws.on('pong', () => {
          const client = this.clients.get(clientId);
          if (client) {
            client.lastPing = Date.now();
          }
        });

        // Handle client disconnect
        ws.on('close', (code, reason) => {
          console.log(`🔌 WebSocket client disconnected: ${clientId}`, {
            code,
            reason: reason.toString(),
            duration: Date.now() - (this.clients.get(clientId)?.connectedAt || Date.now())
          });
          this.clients.delete(clientId);
        });

        // Handle errors
        ws.on('error', (error) => {
          console.error(`❌ WebSocket client error (${clientId}):`, error);
          this.clients.delete(clientId);
        });

        // Send initial ping to test connection
        try {
          ws.ping();
        } catch (error) {
          console.error('❌ Error sending initial ping:', error);
        }
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
      const now = Date.now();
      this.clients.forEach((client, clientId) => {
        if (client.ws.readyState === WebSocket.OPEN) {
          try {
            client.ws.ping();
            // Check if client hasn't responded to pings for too long
            if (now - client.lastPing > 60000) { // 60 seconds timeout
              console.log(`🔌 WebSocket client ${clientId} timeout, closing connection`);
              client.ws.close(1000, 'Heartbeat timeout');
              this.clients.delete(clientId);
            }
          } catch (error) {
            console.error(`❌ Error pinging client ${clientId}:`, error);
            this.clients.delete(clientId);
          }
        } else {
          console.log(`🔌 Removing dead WebSocket client: ${clientId}`);
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