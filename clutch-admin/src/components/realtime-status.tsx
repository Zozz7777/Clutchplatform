"use client";

import React from 'react';
import { useRealtime } from '@/contexts/realtime-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

export function RealtimeStatus() {
  const { isConnected, connectionState, connect, disconnect, messageCount } = useRealtime();

  const getStatusIcon = () => {
    switch (connectionState) {
      case 'connected':
        return <CheckCircle className="h-3 w-3 text-success" />;
      case 'connecting':
        return <RefreshCw className="h-3 w-3 text-primary animate-spin" />;
      case 'disconnected':
        return <WifiOff className="h-3 w-3 text-destructive" />;
      case 'closing':
        return <Clock className="h-3 w-3 text-warning" />;
      default:
        return <AlertCircle className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getStatusBadge = () => {
    switch (connectionState) {
      case 'connected':
        return <Badge variant="default" className="bg-success/100 text-white">Live</Badge>;
      case 'connecting':
        return <Badge variant="secondary" className="bg-primary/100 text-white">Connecting</Badge>;
      case 'disconnected':
        return <Badge variant="destructive">Offline</Badge>;
      case 'closing':
        return <Badge variant="secondary" className="bg-warning/100 text-white">Closing</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleToggleConnection = () => {
    if (isConnected) {
      disconnect();
    } else {
      connect();
    }
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-[0.625rem]">
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <span className="text-xs font-medium text-muted-foreground">
          Real-time
        </span>
      </div>
      
      {getStatusBadge()}
      
      {messageCount > 0 && (
        <Badge variant="outline" className="text-xs">
          {messageCount} msgs
        </Badge>
      )}
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggleConnection}
        className="h-6 w-6 p-0"
      >
        {isConnected ? (
          <WifiOff className="h-3 w-3" />
        ) : (
          <Wifi className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
}
