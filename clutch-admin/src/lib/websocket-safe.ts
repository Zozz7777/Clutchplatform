/**
 * Build-safe WebSocket service that handles SSR and build-time issues
 * This version prevents WebSocket connection warnings during build
 */

import { apiService } from "./api";

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

export class SafeWebSocketService {
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
  private isClient = false;

  constructor(baseURL: string) {
    // Check if we're in a browser environment
    this.isClient = typeof window !== 'undefined';
    
    if (!this.isClient) {
      return;
    }

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
      // Skip WebSocket connection during SSR or build
      if (!this.isClient) {
        this.startPollingFallback(handlers);
        resolve();
        return;
      }

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
        // Get fresh token with multiple fallbacks
        this.token = localStorage.getItem("clutch-admin-token") || 
                    sessionStorage.getItem("clutch-admin-token") ||
                    (apiService.getTokenStatus().hasToken ? 
                      localStorage.getItem("clutch-admin-token") : null);
        if (!this.token) {
          this.isConnecting = false;
          this.startPollingFallback(handlers);
          resolve();
          return;
        }

        const wsUrl = `${this.url}?token=${this.token}`;
        // Close existing connection if any
        if (this.ws) {
          this.ws.close();
        }
        
        this.ws = new WebSocket(wsUrl);

        // Set connection timeout
        const connectionTimeout = setTimeout(() => {
          if (this.ws?.readyState === WebSocket.CONNECTING) {
            this.ws.close();
            this.isConnecting = false;
            this.startPollingFallback(handlers);
            resolve();
          }
        }, 10000); // 10 second timeout

        this.ws.onopen = () => {
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
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          clearTimeout(connectionTimeout);
          this.isConnecting = false;
          this.eventHandlers.onDisconnect?.();
          
          // Start polling fallback when WebSocket disconnects
          this.startPollingFallback(handlers);
          
          // Only attempt reconnect for unexpected disconnections and if we haven't exceeded max attempts
          if (!event.wasClean && event.code !== 1000 && event.code !== 1001 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          } else if (event.code === 1001) {
            this.startPollingFallback(handlers);
          } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.startPollingFallback(handlers);
          }
        };

        this.ws.onerror = (error) => {
          clearTimeout(connectionTimeout);
          console.error('🔌 WebSocket error, falling back to polling:', {
            error,
            readyState: this.ws?.readyState,
            url: wsUrl.replace(this.token || '', '[TOKEN]'),
            hasToken: !!this.token,
            tokenPreview: this.token ? `${this.token.substring(0, 20)}...` : 'none'
          });
          this.isConnecting = false;
          this.eventHandlers.onError?.(error);
          this.startPollingFallback(handlers);
          resolve(); // Resolve instead of reject to prevent unhandled promise rejection
        };

      } catch (error) {
        this.isConnecting = false;
        console.error('🔌 WebSocket connection failed, falling back to polling:', error);
        this.startPollingFallback(handlers);
        resolve(); // Resolve instead of reject to prevent unhandled promise rejection
      }
    });
  }

  private handleMessage(message: WebSocketMessage) {
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
    }
  }

  private scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);
    setTimeout(() => {
      if (this.reconnectAttempts <= this.maxReconnectAttempts) {
        this.connect(this.eventHandlers).catch(console.error);
      }
    }, delay);
  }

  private startPollingFallback(handlers: WebSocketEventHandlers) {
    if (this.isPolling) {
      return;
    }
    this.isPolling = true;
    this.lastPollTime = Date.now();
    this.eventHandlers = handlers;

    this.pollingInterval = setInterval(async () => {
      try {
        await this.pollForUpdates();
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, this.pollingIntervalMs);

    // Initial poll
    this.pollForUpdates().catch(console.error);
  }

  private stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.isPolling = false;
  }

  private async pollForUpdates(): Promise<void> {
    if (!this.token || !this.isClient) {
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
      console.error('Polling request failed:', error);
    }
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

  getConnectionInfo(): { connected: boolean; polling: boolean; state: string; isClient: boolean } {
    return {
      connected: this.isConnected(),
      polling: this.isPolling,
      state: this.getConnectionState(),
      isClient: this.isClient
    };
  }

  getConnectionState(): string {
    if (!this.isClient) return 'ssr';
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
export const safeWebSocketService = new SafeWebSocketService(
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://clutch-main-nk7x.onrender.com'
);
