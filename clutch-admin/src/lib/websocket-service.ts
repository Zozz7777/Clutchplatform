import { toast } from 'sonner';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

export interface SystemHealthUpdate {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  responseTime: number;
  lastCheck: string;
}

export interface PerformanceMetrics {
  responseTime: {
    average: number;
    p95: number;
    p99: number;
    max: number;
  };
  throughput: {
    requestsPerSecond: number;
    requestsPerMinute: number;
    requestsPerHour: number;
  };
  errorRate: {
    percentage: number;
    count: number;
    lastHour: number;
  };
  availability: {
    uptime: number;
    downtime: number;
    lastIncident: string;
  };
}

export interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
  type: 'user' | 'system' | 'admin';
}

export interface NotificationUpdate {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;
  private isConnecting = false;
  private messageHandlers: Map<string, ((data: any) => void)[]> = new Map();
  private connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error' = 'disconnected';
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_BASE_URL || 'https://clutch-main-nk7x.onrender.com';
    // Only connect on client side
    if (typeof window !== 'undefined') {
      this.connect();
    }
  }

  private connect(): void {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.isConnecting = true;
    this.connectionStatus = 'connecting';

    try {
      // Use the stored baseUrl
      const wsUrl = this.baseUrl.replace('http://', 'ws://').replace('https://', 'wss://') + '/ws';

      // WebSocket connection attempt
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        // WebSocket connected
        this.connectionStatus = 'connected';
        this.reconnectAttempts = 0;
        this.isConnecting = false;
        toast.success('Real-time connection established');
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        // WebSocket disconnected
        this.connectionStatus = 'disconnected';
        this.isConnecting = false;
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.warn('WebSocket connection failed, will retry or use fallback:', error);
        this.connectionStatus = 'error';
        this.isConnecting = false;
        // Don't show error toast immediately, let the reconnection logic handle it
        this.attemptReconnect();
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.connectionStatus = 'error';
      this.isConnecting = false;
      this.attemptReconnect();
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      // Max reconnection attempts reached
      toast.error('Real-time connection lost. Please refresh the page.');
      return;
    }

    this.reconnectAttempts++;
    // Attempting to reconnect
    
    setTimeout(() => {
      this.connect();
    }, this.reconnectInterval);
  }

  private handleMessage(message: WebSocketMessage): void {
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message.data);
        } catch (error) {
          console.error(`Error in message handler for ${message.type}:`, error);
        }
      });
    }
  }

  public subscribe(type: string, handler: (data: any) => void): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    
    this.messageHandlers.get(type)!.push(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.messageHandlers.get(type);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  public send(type: string, data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type,
        data,
        timestamp: new Date().toISOString()
      };
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  public getConnectionStatus(): string {
    return this.connectionStatus;
  }

  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connectionStatus = 'disconnected';
  }

  // Specific subscription methods for different data types
  public subscribeToSystemHealth(handler: (data: SystemHealthUpdate) => void): () => void {
    return this.subscribe('system_health', handler);
  }

  public subscribeToPerformanceMetrics(handler: (data: PerformanceMetrics) => void): () => void {
    return this.subscribe('performance_metrics', handler);
  }

  public subscribeToNotifications(handler: (data: NotificationUpdate) => void): () => void {
    return this.subscribe('notification', handler);
  }

  public subscribeToChatMessages(handler: (data: ChatMessage) => void): () => void {
    return this.subscribe('chat_message', handler);
  }

  public subscribeToFleetUpdates(handler: (data: any) => void): () => void {
    return this.subscribe('fleet_update', handler);
  }

  public subscribeToUserUpdates(handler: (data: any) => void): () => void {
    return this.subscribe('user_update', handler);
  }

  public subscribeToPaymentUpdates(handler: (data: any) => void): () => void {
    return this.subscribe('payment_update', handler);
  }

  // Send methods for different actions
  public sendChatMessage(message: string, recipient?: string): void {
    this.send('chat_message', {
      message,
      recipient,
      timestamp: new Date().toISOString()
    });
  }

  public requestSystemHealth(): void {
    this.send('request_system_health', {});
  }

  public requestPerformanceMetrics(): void {
    this.send('request_performance_metrics', {});
  }

  public requestFleetUpdates(): void {
    this.send('request_fleet_updates', {});
  }

  public requestUserUpdates(): void {
    this.send('request_user_updates', {});
  }
}

// Create singleton instance only on client side
export const websocketService = (() => {
  if (typeof window === 'undefined') {
    // Return a mock service for SSR
    return {
      subscribe: () => () => {},
      send: () => {},
      getConnectionStatus: () => 'disconnected',
      isConnected: () => false,
      disconnect: () => {},
      subscribeToSystemHealth: () => () => {},
      subscribeToPerformanceMetrics: () => () => {},
      subscribeToNotifications: () => () => {},
      subscribeToChatMessages: () => () => {},
      subscribeToFleetUpdates: () => () => {},
      subscribeToUserUpdates: () => () => {},
      subscribeToPaymentUpdates: () => () => {},
      sendChatMessage: () => {},
      requestSystemHealth: () => {},
      requestPerformanceMetrics: () => {},
      requestFleetUpdates: () => {},
      requestUserUpdates: () => {}
    } as any;
  }
  return new WebSocketService();
})();

// Export a function to create WebSocket service with custom baseUrl
export const createWebSocketService = (baseUrl?: string) => {
  if (typeof window === 'undefined') {
    // Return a mock service for SSR
    return {
      subscribe: () => () => {},
      send: () => {},
      getConnectionStatus: () => 'disconnected',
      isConnected: () => false,
      disconnect: () => {},
      subscribeToSystemHealth: () => () => {},
      subscribeToPerformanceMetrics: () => () => {},
      subscribeToNotifications: () => () => {},
      subscribeToChatMessages: () => () => {},
      subscribeToFleetUpdates: () => () => {},
      subscribeToUserUpdates: () => () => {},
      subscribeToPaymentUpdates: () => () => {},
      sendChatMessage: () => {},
      requestSystemHealth: () => {},
      requestPerformanceMetrics: () => {},
      requestFleetUpdates: () => {},
      requestUserUpdates: () => {}
    } as any;
  }
  return new WebSocketService(baseUrl);
};

// Export for use in components
export default websocketService;
