import { apiService } from "./api";
import { logger } from "./logger";

export interface WebSocketMessage {
  type: string;
  data: Record<string, unknown>;
  timestamp: string;
}

export interface WebSocketEventHandlers {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
  onSystemHealth?: (data: Record<string, unknown>) => void;
  onNotification?: (data: Record<string, unknown>) => void;
  onUserUpdate?: (data: Record<string, unknown>) => void;
  onFleetUpdate?: (data: Record<string, unknown>) => void;
  onAnalyticsUpdate?: (data: Record<string, unknown>) => void;
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
  private pollingInterval: NodeJS.Timeout | null = null;
  private isPolling = false;
  private pollingIntervalMs = 30000; // 30 seconds
  private lastPollTime = 0;

  constructor(baseURL: string) {
    // Handle WebSocket URL construction properly
    if (baseURL.includes('https://')) {
      this.url = baseURL.replace('https://', 'wss://') + '/ws';
    } else if (baseURL.includes('http://')) {
      this.url = baseURL.replace('http://', 'ws://') + '/ws';
    } else {
      this.url = baseURL + '/ws';
    }
  }

  connect(handlers: WebSocketEventHandlers = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        logger.log('🔌 WebSocket already connected');
        resolve();
        return;
      }

      if (this.isConnecting) {
        logger.log('🔌 WebSocket connection already in progress');
        reject(new Error('Connection already in progress'));
        return;
      }

      this.isConnecting = true;
      this.eventHandlers = handlers;

      try {
        // Get fresh token with multiple fallbacks
        this.token = localStorage.getItem("clutch-admin-token") || 
                    sessionStorage.getItem("clutch-admin-token") ||
                    (apiService.getTokenStatus().hasToken ? 
                      localStorage.getItem("clutch-admin-token") : null);

        logger.log('🔌 WebSocket token check:', {
          hasToken: !!this.token,
          tokenPreview: this.token ? `${this.token.substring(0, 20)}...` : 'none',
          localStorage: localStorage.getItem("clutch-admin-token") ? 'exists' : 'missing',
          sessionStorage: sessionStorage.getItem("clutch-admin-token") ? 'exists' : 'missing',
          apiServiceStatus: apiService.getTokenStatus()
        });

        if (!this.token) {
          this.isConnecting = false;
          logger.log('🔌 No token found, skipping WebSocket connection');
          reject(new Error('No authentication token available'));
          return;
        }

        const wsUrl = `${this.url}?token=${this.token}`;
        logger.log('🔌 Attempting WebSocket connection to:', wsUrl.replace(this.token, '[TOKEN]'));
        
        // Close existing connection if any
        if (this.ws) {
          this.ws.close();
        }
        
        this.ws = new WebSocket(wsUrl);

        // Set connection timeout
        const connectionTimeout = setTimeout(() => {
          if (this.ws?.readyState === WebSocket.CONNECTING) {
            logger.log('🔌 WebSocket connection timeout');
            this.ws.close();
            this.isConnecting = false;
            reject(new Error('WebSocket connection timeout'));
          }
        }, 15000); // 15 second timeout

        this.ws.onopen = () => {
          logger.log('🔌 WebSocket connected successfully');
          clearTimeout(connectionTimeout);
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          
          // Stop polling fallback when WebSocket connects
          this.stopPolling();
          
          // Send initial ping to test connection
          setTimeout(() => {
            if (this.ws?.readyState === WebSocket.OPEN) {
              this.send({ type: 'ping', timestamp: Date.now() });
            }
          }, 1000);
          
          this.eventHandlers.onConnect?.();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            logger.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          clearTimeout(connectionTimeout);
          logger.log('🔌 WebSocket disconnected:', {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
            url: wsUrl.replace(this.token || '', '[TOKEN]'),
            hasToken: !!this.token,
            tokenPreview: this.token ? `${this.token.substring(0, 20)}...` : 'none',
            reconnectAttempts: this.reconnectAttempts,
            maxReconnectAttempts: this.maxReconnectAttempts
          });
          this.isConnecting = false;
          this.eventHandlers.onDisconnect?.();
          
          // Start polling fallback when WebSocket disconnects
          this.checkConnectionAndFallback();
          
          // Only attempt reconnect for unexpected disconnections and if we haven't exceeded max attempts
          if (!event.wasClean && event.code !== 1000 && event.code !== 1001 && this.reconnectAttempts < this.maxReconnectAttempts) {
            logger.log('🔌 Scheduling reconnect due to unexpected disconnection');
            this.scheduleReconnect();
          } else if (event.code === 1001) {
            logger.log('🔌 WebSocket closed by server (1001), not attempting reconnect');
          } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            logger.log('🔌 Max reconnect attempts reached, using polling fallback');
            this.startPolling();
          }
        };

        this.ws.onerror = (error) => {
          clearTimeout(connectionTimeout);
          logger.error('🔌 WebSocket error:', {
            error,
            readyState: this.ws?.readyState,
            url: wsUrl.replace(this.token || '', '[TOKEN]'),
            hasToken: !!this.token,
            tokenPreview: this.token ? `${this.token.substring(0, 20)}...` : 'none'
          });
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
    logger.log('📨 WebSocket message received:', message.type);
    
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
      case 'connection':
        // Connection confirmation message - handled silently
        break;
      case 'pong':
        // Pong response - handled silently
        break;
      default:
        logger.log('Unknown message type:', message.type);
    }
  }

  private scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);
    
    logger.log(`🔄 Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      if (this.reconnectAttempts <= this.maxReconnectAttempts) {
        this.connect(this.eventHandlers).catch(logger.error);
      }
    }, delay);
  }

  send(message: Record<string, unknown>): boolean {
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
    this.stopPolling(); // Stop polling fallback
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  isUsingPollingFallback(): boolean {
    return this.isPolling;
  }

  getConnectionInfo(): { connected: boolean; polling: boolean; state: string } {
    return {
      connected: this.isConnected(),
      polling: this.isPolling,
      state: this.getConnectionState()
    };
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

  /**
   * Start polling fallback when WebSocket is not available
   */
  private startPolling(): void {
    if (this.isPolling || this.isConnected()) {
      return;
    }

    logger.log('🔄 Starting polling fallback for WebSocket');
    this.isPolling = true;
    this.lastPollTime = Date.now();

    this.pollingInterval = setInterval(async () => {
      try {
        await this.pollForUpdates();
      } catch (error) {
        logger.error('Polling error:', error);
      }
    }, this.pollingIntervalMs);

    // Initial poll
    this.pollForUpdates().catch(logger.error);
  }

  /**
   * Stop polling fallback
   */
  private stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.isPolling = false;
    logger.log('🔄 Stopped polling fallback');
  }

  /**
   * Poll for updates using HTTP API
   */
  private async pollForUpdates(): Promise<void> {
    if (!this.token) {
      return;
    }

    try {
      const baseURL = this.url.replace('wss://', 'https://').replace('ws://', 'http://').replace('/ws', '');
      
      // Poll for notifications
      const notificationsResponse = await fetch(`${baseURL}/api/v1/notifications`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json();
        if (notificationsData.success && notificationsData.data?.length > 0) {
          // Check for new notifications since last poll
          const newNotifications = notificationsData.data.filter((notification: Record<string, unknown>) => 
            new Date(notification.timestamp as string).getTime() > this.lastPollTime
          );

          newNotifications.forEach((notification: Record<string, unknown>) => {
            this.eventHandlers.onNotification?.(notification);
            this.eventHandlers.onMessage?.({
              type: 'notification',
              data: notification,
              timestamp: notification.timestamp
            });
          });
        }
      }

      // Poll for system health
      const healthResponse = await fetch(`${baseURL}/api/v1/system-health`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        if (healthData.success) {
          this.eventHandlers.onSystemHealth?.(healthData.data);
          this.eventHandlers.onMessage?.({
            type: 'system_health',
            data: healthData.data,
            timestamp: new Date().toISOString()
          });
        }
      }

      this.lastPollTime = Date.now();
    } catch (error) {
      logger.error('Polling request failed:', error);
    }
  }

  /**
   * Check if WebSocket is available and start fallback if needed
   */
  private checkConnectionAndFallback(): void {
    if (!this.isConnected() && !this.isPolling) {
      logger.log('🔌 WebSocket not connected, starting polling fallback');
      this.startPolling();
    } else if (this.isConnected() && this.isPolling) {
      logger.log('🔌 WebSocket connected, stopping polling fallback');
      this.stopPolling();
    }
  }
}

// Create singleton instance with build-time safety
export const websocketService = (() => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    logger.log('🔌 WebSocket service initialized in SSR mode - using safe fallback');
    // Return a mock service for SSR
    return {
      connect: () => Promise.resolve(),
      disconnect: () => {},
      send: () => false,
      isConnected: () => false,
      isUsingPollingFallback: () => true,
      getConnectionInfo: () => ({ connected: false, polling: true, state: 'ssr' }),
      getConnectionState: () => 'ssr'
    } as any;
  }
  
  return new WebSocketService(
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://clutch-main-nk7x.onrender.com'
);
})();
