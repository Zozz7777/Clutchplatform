'use client'

import React from 'react'
import { useToast } from '@/components/ui/toast'

interface WebSocketMessage {
  type: string
  data: any
  timestamp: number
}

interface WebSocketConfig {
  url: string
  reconnectInterval?: number
  maxReconnectAttempts?: number
  heartbeatInterval?: number
}

class WebSocketService {
  private static instance: WebSocketService
  private ws: WebSocket | null = null
  private config: WebSocketConfig
  private reconnectAttempts = 0
  private reconnectTimer: NodeJS.Timeout | null = null
  private heartbeatTimer: NodeJS.Timeout | null = null
  private listeners: Map<string, Set<(data: any) => void>> = new Map()
  private isConnecting = false
  private isConnected = false

  private constructor() {
    this.config = {
      url: process.env.NEXT_PUBLIC_WS_URL || 'wss://clutch-main-nk7x.onrender.com/ws',
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000
    }
  }

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService()
    }
    return WebSocketService.instance
  }

  // Connect to WebSocket
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnected || this.isConnecting) {
        resolve()
        return
      }

      this.isConnecting = true

      try {
        this.ws = new WebSocket(this.config.url)

        this.ws.onopen = () => {
          console.log('🔌 WebSocket connected')
          this.isConnected = true
          this.isConnecting = false
          this.reconnectAttempts = 0
          this.startHeartbeat()
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data)
            this.handleMessage(message)
          } catch (error) {
            console.error('Error parsing WebSocket message:', error)
          }
        }

        this.ws.onclose = (event) => {
          console.log('🔌 WebSocket disconnected:', event.code, event.reason)
          this.isConnected = false
          this.isConnecting = false
          this.stopHeartbeat()
          
          if (!event.wasClean && this.reconnectAttempts < this.config.maxReconnectAttempts!) {
            this.scheduleReconnect()
          }
        }

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          this.isConnecting = false
          reject(error)
        }
      } catch (error) {
        this.isConnecting = false
        reject(error)
      }
    })
  }

  // Disconnect from WebSocket
  disconnect(): void {
    this.stopHeartbeat()
    this.clearReconnectTimer()
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }
    
    this.isConnected = false
    this.isConnecting = false
  }

  // Send message through WebSocket
  send(type: string, data: any): void {
    if (!this.isConnected || !this.ws) {
      console.warn('WebSocket not connected, cannot send message')
      return
    }

    const message: WebSocketMessage = {
      type,
      data,
      timestamp: Date.now()
    }

    this.ws.send(JSON.stringify(message))
  }

  // Subscribe to specific message types
  subscribe(type: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }
    
    this.listeners.get(type)!.add(callback)

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(type)
      if (listeners) {
        listeners.delete(callback)
        if (listeners.size === 0) {
          this.listeners.delete(type)
        }
      }
    }
  }

  // Handle incoming messages
  private handleMessage(message: WebSocketMessage): void {
    const listeners = this.listeners.get(message.type)
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(message.data)
        } catch (error) {
          console.error('Error in WebSocket listener:', error)
        }
      })
    }
  }

  // Start heartbeat to keep connection alive
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected) {
        this.send('ping', { timestamp: Date.now() })
      }
    }, this.config.heartbeatInterval)
  }

  // Stop heartbeat
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  // Schedule reconnection
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }

    this.reconnectAttempts++
    const delay = this.config.reconnectInterval! * Math.pow(2, this.reconnectAttempts - 1)
    
    console.log(`🔄 Scheduling WebSocket reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`)
    
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnection failed:', error)
      })
    }, delay)
  }

  // Clear reconnect timer
  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  // Get connection status
  getConnectionStatus(): {
    isConnected: boolean
    isConnecting: boolean
    reconnectAttempts: number
  } {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts
    }
  }

  // Update configuration
  updateConfig(newConfig: Partial<WebSocketConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }
}

// React hook for WebSocket
export function useWebSocket() {
  const [isConnected, setIsConnected] = React.useState(false)
  const [isConnecting, setIsConnecting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const wsService = WebSocketService.getInstance()

  React.useEffect(() => {
    const connect = async () => {
      try {
        setIsConnecting(true)
        setError(null)
        await wsService.connect()
        setIsConnected(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Connection failed')
        setIsConnected(false)
      } finally {
        setIsConnecting(false)
      }
    }

    connect()

    return () => {
      wsService.disconnect()
    }
  }, [])

  const send = React.useCallback((type: string, data: any) => {
    wsService.send(type, data)
  }, [])

  const subscribe = React.useCallback((type: string, callback: (data: any) => void) => {
    return wsService.subscribe(type, callback)
  }, [])

  return {
    isConnected,
    isConnecting,
    error,
    send,
    subscribe
  }
}

// Real-time data hook
export function useRealtimeData<T>(
  dataType: string,
  initialData: T,
  options: {
    autoConnect?: boolean
    onUpdate?: (data: T) => void
    onError?: (error: Error) => void
  } = {}
) {
  const [data, setData] = React.useState<T>(initialData)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)
  const { isConnected, subscribe } = useWebSocket()

  React.useEffect(() => {
    if (!isConnected || !options.autoConnect) return

    const unsubscribe = subscribe(dataType, (newData: T) => {
      setData(newData)
      options.onUpdate?.(newData)
    })

    return unsubscribe
  }, [isConnected, dataType, options.autoConnect])

  const updateData = React.useCallback((newData: T) => {
    setData(newData)
  }, [])

  const refresh = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Trigger data refresh through WebSocket
      wsService.send('refresh', { type: dataType })
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Refresh failed')
      setError(error)
      options.onError?.(error)
    } finally {
      setIsLoading(false)
    }
  }, [dataType])

  return {
    data,
    isLoading,
    error,
    isConnected,
    updateData,
    refresh
  }
}

export const wsService = WebSocketService.getInstance()
