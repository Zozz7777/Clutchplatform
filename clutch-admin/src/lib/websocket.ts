import { apiService } from "./api";

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

export interface WebSocketEventHandlers {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
  onSystemHealth?: (data: any) => void;
  onNotification?: (data: any) => void;
  onUserUpdate?: (data: any) => void;
  onFleetUpdate?: (data: any) => void;
  onAnalyticsUpdate?: (data: any) => void;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private token: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;
  private isConnecting = false;
  private eventHandlers: WebSocketEventHandlers = {};

  constructor(baseURL: string) {
    this.url = baseURL.replace('http', 'ws') + '/ws';
  }

  connect(handlers: WebSocketEventHandlers = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        reject(new Error('Connection already in progress'));
        return;
      }

      this.isConnecting = true;
      this.eventHandlers = handlers;

      try {
        // Get fresh token
        this.token = apiService.getTokenStatus().hasToken ? 
          localStorage.getItem("clutch-admin-token") : null;

        if (!this.token) {
          this.isConnecting = false;
          reject(new Error('No authentication token available'));
          return;
        }

        const wsUrl = `${this.url}?token=${this.token}`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('🔌 WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.eventHandlers.onConnect?.();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('🔌 WebSocket disconnected:', event.code, event.reason);
          this.isConnecting = false;
          this.eventHandlers.onDisconnect?.();
          
          if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('🔌 WebSocket error:', error);
          this.isConnecting = false;
          this.eventHandlers.onError?.(error);
          reject(error);
        };

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private handleMessage(message: WebSocketMessage) {
    console.log('📨 WebSocket message received:', message.type);
    
    this.eventHandlers.onMessage?.(message);

    switch (message.type) {
      case 'system_health':
        this.eventHandlers.onSystemHealth?.(message.data);
        break;
      case 'notification':
        this.eventHandlers.onNotification?.(message.data);
        break;
      case 'user_update':
        this.eventHandlers.onUserUpdate?.(message.data);
        break;
      case 'fleet_update':
        this.eventHandlers.onFleetUpdate?.(message.data);
        break;
      case 'analytics_update':
        this.eventHandlers.onAnalyticsUpdate?.(message.data);
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  private scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`🔄 Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      if (this.reconnectAttempts <= this.maxReconnectAttempts) {
        this.connect(this.eventHandlers).catch(console.error);
      }
    }, delay);
  }

  send(message: any): boolean {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent auto-reconnect
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getConnectionState(): string {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'closed';
      default:
        return 'unknown';
    }
  }
}

// Create singleton instance
export const websocketService = new WebSocketService(
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://clutch-main-nk7x.onrender.com'
);
