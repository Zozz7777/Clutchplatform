"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { websocketService, WebSocketEventHandlers } from '@/lib/websocket';
import { useAuth } from './auth-context';
import { toast } from 'sonner';

interface RealtimeContextType {
  isConnected: boolean;
  connectionState: string;
  connect: () => Promise<void>;
  disconnect: () => void;
  sendMessage: (message: Record<string, unknown>) => boolean;
  lastMessage: Record<string, unknown> | null;
  messageCount: number;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionState, setConnectionState] = useState('disconnected');
  const [lastMessage, setLastMessage] = useState<Record<string, unknown> | null>(null);
  const [messageCount, setMessageCount] = useState(0);

  const handleConnect = useCallback(() => {
    setIsConnected(true);
    setConnectionState('connected');
    toast.success('Real-time connection established');
  }, []);

  const handleDisconnect = useCallback(() => {
    setIsConnected(false);
    setConnectionState('disconnected');
    toast.error('Real-time connection lost');
  }, []);

  const handleError = useCallback((error: Event) => {
    // WebSocket error
    toast.error('Real-time connection error');
  }, []);

  const handleMessage = useCallback((message: Record<string, unknown>) => {
    setLastMessage(message);
    setMessageCount(prev => prev + 1);
    
    // Handle different message types
    switch (message.type) {
      case 'connection':
        // Connection message is handled silently - no toast needed
        break;
      case 'pong':
        // Pong response is handled silently
        break;
      case 'notification':
        toast.info(message.data?.message || 'New notification received');
        break;
      case 'system_health':
        if (message.data?.status === 'critical') {
          toast.error('System health critical!');
        } else if (message.data?.status === 'degraded') {
          toast.warning('System health degraded');
        }
        break;
      case 'user_update':
        toast.info('User data updated');
        break;
      case 'fleet_update':
        toast.info('Fleet data updated');
        break;
      case 'analytics_update':
        // Analytics updates are usually silent
        break;
      default:
        // Log unknown message types for debugging
        break;
    }
  }, []);

  const connect = useCallback(async () => {
    try {
      setIsConnecting(true);
      const handlers: WebSocketEventHandlers = {
        onConnect: () => {
          handleConnect();
          setIsConnecting(false);
        },
        onDisconnect: () => {
          handleDisconnect();
          setIsConnecting(false);
        },
        onError: (error) => {
          handleError(error);
          setIsConnecting(false);
        },
        onMessage: handleMessage,
        onSystemHealth: (data) => {
        },
        onNotification: (data) => {
        },
        onUserUpdate: (data) => {
        },
        onFleetUpdate: (data) => {
        },
        onAnalyticsUpdate: (data) => {
        },
      };

      await websocketService.connect(handlers);
    } catch (error) {
      // Failed to connect to WebSocket
      setIsConnecting(false);
      toast.error('Failed to establish real-time connection');
    }
  }, [handleConnect, handleDisconnect, handleError, handleMessage]);

  const disconnect = useCallback(() => {
    websocketService.disconnect();
    setIsConnected(false);
    setIsConnecting(false);
    setConnectionState('disconnected');
  }, []);

  const sendMessage = useCallback((message: Record<string, unknown>) => {
    return websocketService.send(message);
  }, []);

  // Auto-connect when user is authenticated
  useEffect(() => {
    if (!isAuthLoading) {
      if (user && !isConnected && !isConnecting) {
        // Add a delay and check for token availability before connecting
        const connectTimer = setTimeout(() => {
          // Check if token is available before attempting connection
          const token = localStorage.getItem("clutch-admin-token") || sessionStorage.getItem("clutch-admin-token");
          if (token) {
            connect();
          } else {
            // No token found, skipping WebSocket connection
          }
        }, 500); // Increased delay to 500ms
        
        return () => clearTimeout(connectTimer);
      } else if (!user && isConnected) {
        disconnect();
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (isConnected) {
        disconnect();
      }
    };
  }, [user, isAuthLoading, isConnected, isConnecting, connect, disconnect]);

  // Update connection state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionState(websocketService.getConnectionState());
      setIsConnected(websocketService.isConnected());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const value: RealtimeContextType = {
    isConnected,
    connectionState,
    connect,
    disconnect,
    sendMessage,
    lastMessage,
    messageCount,
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
}
