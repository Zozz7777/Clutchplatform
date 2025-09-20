import WebSocket from 'ws';
import { EventEmitter } from 'events';
import { logger } from './logger';

export interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
}

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

export class WebSocketManager extends EventEmitter {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectAttempts: number = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isConnected: boolean = false;
  private isConnecting: boolean = false;

  constructor() {
    super();
    this.config = {
      url: 'wss://clutch-main-nk7x.onrender.com/ws',
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000
    };
  }

  async initialize(): Promise<void> {
    try {
      await this.connect();
      logger.info('WebSocket manager initialized');
    } catch (error) {
      logger.error('Failed to initialize WebSocket manager:', error);
    }
  }

  private async connect(): Promise<void> {
    if (this.isConnecting || this.isConnected) {
      return;
    }

    this.isConnecting = true;

    try {
      this.ws = new WebSocket(this.config.url);

      this.ws.on('open', () => {
        this.isConnected = true;
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        
        logger.info('WebSocket connected successfully');
        this.emit('connected');
        
        // Start heartbeat
        this.startHeartbeat();
      });

      this.ws.on('message', (data: WebSocket.Data) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          this.handleMessage(message);
        } catch (error) {
          logger.error('Failed to parse WebSocket message:', error);
        }
      });

      this.ws.on('close', (code: number, reason: string) => {
        this.isConnected = false;
        this.isConnecting = false;
        
        logger.warn(`WebSocket closed: ${code} - ${reason}`);
        this.emit('disconnected', { code, reason });
        
        // Stop heartbeat
        this.stopHeartbeat();
        
        // Attempt to reconnect
        this.scheduleReconnect();
      });

      this.ws.on('error', (error: Error) => {
        this.isConnected = false;
        this.isConnecting = false;
        
        logger.error('WebSocket error:', error);
        this.emit('error', error);
      });

    } catch (error) {
      this.isConnecting = false;
      logger.error('Failed to create WebSocket connection:', error);
      this.scheduleReconnect();
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    logger.debug('Received WebSocket message:', message);

    switch (message.type) {
      case 'sync_required':
        this.emit('syncRequired', message.data);
        break;
      
      case 'inventory_update':
        this.emit('inventoryUpdate', message.data);
        break;
      
      case 'price_update':
        this.emit('priceUpdate', message.data);
        break;
      
      case 'stock_alert':
        this.emit('stockAlert', message.data);
        break;
      
      case 'system_notification':
        this.emit('systemNotification', message.data);
        break;
      
      case 'pong':
        // Heartbeat response
        break;
      
      default:
        logger.warn('Unknown WebSocket message type:', message.type);
        this.emit('unknownMessage', message);
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected && this.ws) {
        this.send({
          type: 'ping',
          data: { timestamp: Date.now() },
          timestamp: Date.now()
        });
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      logger.error('Max reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached');
      return;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempts++;
    const delay = this.config.reconnectInterval * this.reconnectAttempts;

    logger.info(`Scheduling reconnection attempt ${this.reconnectAttempts} in ${delay}ms`);

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  send(message: WebSocketMessage): boolean {
    if (!this.isConnected || !this.ws) {
      logger.warn('Cannot send message: WebSocket not connected');
      return false;
    }

    try {
      this.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      logger.error('Failed to send WebSocket message:', error);
      return false;
    }
  }

  sendSyncRequest(tableName: string, recordId: number): boolean {
    return this.send({
      type: 'sync_request',
      data: { tableName, recordId },
      timestamp: Date.now()
    });
  }

  sendInventoryUpdate(productId: number, stockChange: number): boolean {
    return this.send({
      type: 'inventory_update',
      data: { productId, stockChange },
      timestamp: Date.now()
    });
  }

  sendSaleNotification(saleId: number, total: number): boolean {
    return this.send({
      type: 'sale_notification',
      data: { saleId, total },
      timestamp: Date.now()
    });
  }

  sendStockAlert(productId: number, currentStock: number, minStock: number): boolean {
    return this.send({
      type: 'stock_alert',
      data: { productId, currentStock, minStock },
      timestamp: Date.now()
    });
  }

  async disconnect(): Promise<void> {
    this.stopHeartbeat();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.isConnected = false;
    this.isConnecting = false;
    
    logger.info('WebSocket disconnected');
  }

  isWebSocketConnected(): boolean {
    return this.isConnected;
  }

  getConnectionStatus(): {
    connected: boolean;
    connecting: boolean;
    reconnectAttempts: number;
  } {
    return {
      connected: this.isConnected,
      connecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  updateConfig(newConfig: Partial<WebSocketConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('WebSocket configuration updated');
  }
}
