import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { logger } from './logger';
import { DatabaseManager } from './database';
import { AuthManager } from './auth';

export interface WebSocketMessage {
  type: 'auth' | 'subscribe' | 'unsubscribe' | 'data' | 'error' | 'ping' | 'pong';
  data?: any;
  channel?: string;
  token?: string;
  timestamp?: string;
}

export interface WebSocketClient {
  id: string;
  ws: WebSocket;
  userId?: number;
  userRole?: string;
  subscribedChannels: Set<string>;
  lastPing: number;
  isAlive: boolean;
}

export interface BroadcastOptions {
  channel?: string;
  excludeClient?: string;
  userId?: number;
  userRole?: string;
}

export class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, WebSocketClient> = new Map();
  private channels: Map<string, Set<string>> = new Map();
  private pingInterval: NodeJS.Timeout | null = null;
  private db: DatabaseManager;
  private authManager: AuthManager;

  constructor(db: DatabaseManager, authManager: AuthManager) {
    this.db = db;
    this.authManager = authManager;
  }

  /**
   * Initialize WebSocket server
   */
  initialize(server: Server): void {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws',
      verifyClient: this.verifyClient.bind(this)
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    this.startPingInterval();

    logger.info('WebSocket server initialized');
  }

  /**
   * Verify client connection
   */
  private async verifyClient(info: any): Promise<boolean> {
    try {
      const url = new URL(info.req.url!, `http://${info.req.headers.host}`);
      const token = url.searchParams.get('token');
      
      if (!token) {
        logger.warn('WebSocket connection rejected: No token provided');
        return false;
      }

      const user = await this.authManager.verifyToken(token);
      if (!user) {
        logger.warn('WebSocket connection rejected: Invalid token');
        return false;
      }

      return true;
    } catch (error) {
      logger.error('WebSocket verification error:', error);
      return false;
    }
  }

  /**
   * Handle new WebSocket connection
   */
  private async handleConnection(ws: WebSocket, req: any): Promise<void> {
    try {
      const url = new URL(req.url!, `http://${req.headers.host}`);
      const token = url.searchParams.get('token');
      
      if (!token) {
        ws.close(1008, 'No token provided');
        return;
      }

      const user = await this.authManager.verifyToken(token);
      if (!user) {
        ws.close(1008, 'Invalid token');
        return;
      }

      const clientId = this.generateClientId();
      const client: WebSocketClient = {
        id: clientId,
        ws,
        userId: user.id,
        userRole: user.role,
        subscribedChannels: new Set(),
        lastPing: Date.now(),
        isAlive: true
      };

      this.clients.set(clientId, client);
      this.setupClientHandlers(client);

      // Send welcome message
      this.sendToClient(clientId, {
        type: 'data',
        data: { message: 'Connected successfully', userId: user.id },
        timestamp: new Date().toISOString()
      });

      logger.info(`WebSocket client connected: ${clientId} (User: ${user.id})`);

    } catch (error) {
      logger.error('WebSocket connection error:', error);
      ws.close(1011, 'Internal server error');
    }
  }

  /**
   * Setup client event handlers
   */
  private setupClientHandlers(client: WebSocketClient): void {
    client.ws.on('message', (data) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());
        this.handleMessage(client, message);
      } catch (error) {
        logger.error('WebSocket message parse error:', error);
        this.sendToClient(client.id, {
          type: 'error',
          data: { message: 'Invalid message format' },
          timestamp: new Date().toISOString()
        });
      }
    });

    client.ws.on('pong', () => {
      client.isAlive = true;
      client.lastPing = Date.now();
    });

    client.ws.on('close', () => {
      this.handleDisconnection(client);
    });

    client.ws.on('error', (error) => {
      logger.error(`WebSocket client error (${client.id}):`, error);
      this.handleDisconnection(client);
    });
  }

  /**
   * Handle incoming WebSocket messages
   */
  private async handleMessage(client: WebSocketClient, message: WebSocketMessage): Promise<void> {
    try {
      switch (message.type) {
        case 'subscribe':
          await this.handleSubscribe(client, message);
          break;
        case 'unsubscribe':
          await this.handleUnsubscribe(client, message);
          break;
        case 'ping':
          this.sendToClient(client.id, {
            type: 'pong',
            timestamp: new Date().toISOString()
          });
          break;
        default:
          logger.warn(`Unknown message type: ${message.type}`);
      }
    } catch (error) {
      logger.error('WebSocket message handling error:', error);
      this.sendToClient(client.id, {
        type: 'error',
        data: { message: 'Message handling failed' },
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Handle channel subscription
   */
  private async handleSubscribe(client: WebSocketClient, message: WebSocketMessage): Promise<void> {
    if (!message.channel) {
      this.sendToClient(client.id, {
        type: 'error',
        data: { message: 'Channel not specified' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Check if user has permission to subscribe to this channel
    const hasPermission = await this.checkChannelPermission(client, message.channel);
    if (!hasPermission) {
      this.sendToClient(client.id, {
        type: 'error',
        data: { message: 'Insufficient permissions for channel' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    client.subscribedChannels.add(message.channel);
    
    if (!this.channels.has(message.channel)) {
      this.channels.set(message.channel, new Set());
    }
    this.channels.get(message.channel)!.add(client.id);

    this.sendToClient(client.id, {
      type: 'data',
      data: { message: `Subscribed to channel: ${message.channel}` },
      timestamp: new Date().toISOString()
    });

    logger.info(`Client ${client.id} subscribed to channel: ${message.channel}`);
  }

  /**
   * Handle channel unsubscription
   */
  private async handleUnsubscribe(client: WebSocketClient, message: WebSocketMessage): Promise<void> {
    if (!message.channel) {
      this.sendToClient(client.id, {
        type: 'error',
        data: { message: 'Channel not specified' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    client.subscribedChannels.delete(message.channel);
    
    const channelClients = this.channels.get(message.channel);
    if (channelClients) {
      channelClients.delete(client.id);
      if (channelClients.size === 0) {
        this.channels.delete(message.channel);
      }
    }

    this.sendToClient(client.id, {
      type: 'data',
      data: { message: `Unsubscribed from channel: ${message.channel}` },
      timestamp: new Date().toISOString()
    });

    logger.info(`Client ${client.id} unsubscribed from channel: ${message.channel}`);
  }

  /**
   * Check if user has permission to subscribe to a channel
   */
  private async checkChannelPermission(client: WebSocketClient, channel: string): Promise<boolean> {
    if (!client.userId) return false;

    // Define channel permissions
    const channelPermissions: Record<string, string[]> = {
      'inventory': ['inventory:read', 'inventory:write'],
      'sales': ['sales:read', 'sales:write'],
      'customers': ['customers:read', 'customers:write'],
      'suppliers': ['suppliers:read', 'suppliers:write'],
      'reports': ['reports:read'],
      'ai': ['ai:read'],
      'marketplace': ['marketplace:read', 'marketplace:write'],
      'branches': ['branches:read', 'branches:write'],
      'sync': ['sync:read'],
      'admin': ['admin:read', 'admin:write']
    };

    const requiredPermissions = channelPermissions[channel];
    if (!requiredPermissions) return false;

    // Check if user has any of the required permissions
    for (const permission of requiredPermissions) {
      const hasPermission = await this.authManager.hasPermission(client.userId, permission);
      if (hasPermission) return true;
    }

    return false;
  }

  /**
   * Handle client disconnection
   */
  private handleDisconnection(client: WebSocketClient): void {
    // Remove from all channels
    for (const channel of client.subscribedChannels) {
      const channelClients = this.channels.get(channel);
      if (channelClients) {
        channelClients.delete(client.id);
        if (channelClients.size === 0) {
          this.channels.delete(channel);
        }
      }
    }

    this.clients.delete(client.id);
    logger.info(`WebSocket client disconnected: ${client.id}`);
  }

  /**
   * Send message to specific client
   */
  sendToClient(clientId: string, message: WebSocketMessage): boolean {
    const client = this.clients.get(clientId);
    if (!client || client.ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      client.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      logger.error(`Failed to send message to client ${clientId}:`, error);
      return false;
    }
  }

  /**
   * Broadcast message to multiple clients
   */
  broadcast(message: WebSocketMessage, options: BroadcastOptions = {}): number {
    let sentCount = 0;

    for (const [clientId, client] of this.clients) {
      // Skip if client is excluded
      if (options.excludeClient === clientId) continue;

      // Skip if client is not alive
      if (!client.isAlive) continue;

      // Filter by channel
      if (options.channel && !client.subscribedChannels.has(options.channel)) continue;

      // Filter by user ID
      if (options.userId && client.userId !== options.userId) continue;

      // Filter by user role
      if (options.userRole && client.userRole !== options.userRole) continue;

      if (this.sendToClient(clientId, message)) {
        sentCount++;
      }
    }

    return sentCount;
  }

  /**
   * Broadcast to specific channel
   */
  broadcastToChannel(channel: string, message: WebSocketMessage, excludeClient?: string): number {
    return this.broadcast(message, { channel, excludeClient });
  }

  /**
   * Broadcast to specific user
   */
  broadcastToUser(userId: number, message: WebSocketMessage): number {
    return this.broadcast(message, { userId });
  }

  /**
   * Broadcast to specific role
   */
  broadcastToRole(userRole: string, message: WebSocketMessage): number {
    return this.broadcast(message, { userRole });
  }

  /**
   * Start ping interval to keep connections alive
   */
  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      for (const [clientId, client] of this.clients) {
        if (!client.isAlive) {
          logger.info(`Terminating dead connection: ${clientId}`);
          client.ws.terminate();
          this.clients.delete(clientId);
          continue;
        }

        client.isAlive = false;
        client.ws.ping();
      }
    }, 30000); // Ping every 30 seconds
  }

  /**
   * Stop ping interval
   */
  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Generate unique client ID
   */
  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get connection statistics
   */
  getStats(): any {
    return {
      totalClients: this.clients.size,
      totalChannels: this.channels.size,
      channels: Array.from(this.channels.keys()),
      clients: Array.from(this.clients.values()).map(client => ({
        id: client.id,
        userId: client.userId,
        userRole: client.userRole,
        subscribedChannels: Array.from(client.subscribedChannels),
        isAlive: client.isAlive,
        lastPing: client.lastPing
      }))
    };
  }

  /**
   * Close all connections and cleanup
   */
  close(): void {
    this.stopPingInterval();
    
    for (const [clientId, client] of this.clients) {
      client.ws.close(1001, 'Server shutting down');
    }
    
    this.clients.clear();
    this.channels.clear();
    
    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }

    logger.info('WebSocket server closed');
  }
}
