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
  sendMessage: (message: any) => boolean;
  lastMessage: any;
  messageCount: number;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionState, setConnectionState] = useState('disconnected');
  const [lastMessage, setLastMessage] = useState<any>(null);
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
    console.error('WebSocket error:', error);
    toast.error('Real-time connection error');
  }, []);

  const handleMessage = useCallback((message: any) => {
    setLastMessage(message);
    setMessageCount(prev => prev + 1);
    
    // Handle different message types
    switch (message.type) {
      case 'notification':
        toast.info(message.data.message || 'New notification received');
        break;
      case 'system_health':
        if (message.data.status === 'critical') {
          toast.error('System health critical!');
        } else if (message.data.status === 'degraded') {
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
          console.log('System health update:', data);
        },
        onNotification: (data) => {
          console.log('Notification received:', data);
        },
        onUserUpdate: (data) => {
          console.log('User update received:', data);
        },
        onFleetUpdate: (data) => {
          console.log('Fleet update received:', data);
        },
        onAnalyticsUpdate: (data) => {
          console.log('Analytics update received:', data);
        },
      };

      await websocketService.connect(handlers);
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
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

  const sendMessage = useCallback((message: any) => {
    return websocketService.send(message);
  }, []);

  // Auto-connect when user is authenticated
  useEffect(() => {
    if (!isAuthLoading) {
      if (user && !isConnected && !isConnecting) {
        connect();
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
