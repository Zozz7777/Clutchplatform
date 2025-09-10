import { toast } from 'sonner'

export interface WebSocketMessage {
  type: string
  data: any
  timestamp: number
}

export interface WebSocketEventHandlers {
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Event) => void
  onMessage?: (message: WebSocketMessage) => void
  onDashboardUpdate?: (data: any) => void
  onNotification?: (notification: any) => void
  onSystemAlert?: (alert: any) => void
  onUserActivity?: (activity: any) => void
  onMetricsUpdate?: (metrics: any) => void
}

class WebSocketClient {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private heartbeatInterval: NodeJS.Timeout | null = null
  private eventHandlers: WebSocketEventHandlers = {}
  private isConnecting = false

  constructor(private url: string, private token: string) {}

  connect(handlers: WebSocketEventHandlers = {}) {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
      return
    }

    this.isConnecting = true
    this.eventHandlers = handlers

    try {
      this.ws = new WebSocket(`${this.url}?token=${this.token}`)
      this.setupEventListeners()
    } catch (error) {
      console.error('WebSocket connection failed:', error)
      this.isConnecting = false
      this.handleReconnect()
    }
  }

  private setupEventListeners() {
    if (!this.ws) return

    this.ws.onopen = () => {
      console.log('WebSocket connected')
      this.isConnecting = false
      this.reconnectAttempts = 0
      this.startHeartbeat()
      this.eventHandlers.onConnect?.()
    }

    this.ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason)
      this.isConnecting = false
      this.stopHeartbeat()
      this.eventHandlers.onDisconnect?.()
      
      if (!event.wasClean) {
        this.handleReconnect()
      }
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      this.isConnecting = false
      this.eventHandlers.onError?.(error)
    }

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data)
        this.handleMessage(message)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }
  }

  private handleMessage(message: WebSocketMessage) {
    this.eventHandlers.onMessage?.(message)

    switch (message.type) {
      case 'dashboard_update':
        this.eventHandlers.onDashboardUpdate?.(message.data)
        break
      case 'notification':
        this.eventHandlers.onNotification?.(message.data)
        this.showNotification(message.data)
        break
      case 'system_alert':
        this.eventHandlers.onSystemAlert?.(message.data)
        this.showSystemAlert(message.data)
        break
      case 'user_activity':
        this.eventHandlers.onUserActivity?.(message.data)
        break
      case 'metrics_update':
        this.eventHandlers.onMetricsUpdate?.(message.data)
        break
      case 'pong':
        // Heartbeat response
        break
      default:
        console.log('Unknown message type:', message.type)
    }
  }

  private showNotification(notification: any) {
    const { type, title, message } = notification
    switch (type) {
      case 'success':
        toast.success(message, { description: title })
        break
      case 'error':
        toast.error(message, { description: title })
        break
      case 'warning':
        toast.warning(message, { description: title })
        break
      case 'info':
        toast.info(message, { description: title })
        break
      default:
        toast(message, { description: title })
    }
  }

  private showSystemAlert(alert: any) {
    const { severity, message, title } = alert
    switch (severity) {
      case 'critical':
        toast.error(message, { 
          description: title,
          duration: 0, // Don't auto-dismiss critical alerts
          action: {
            label: 'Dismiss',
            onClick: () => {}
          }
        })
        break
      case 'warning':
        toast.warning(message, { description: title })
        break
      default:
        toast.info(message, { description: title })
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.send({ type: 'ping', data: {}, timestamp: Date.now() })
    }, 30000) // Send ping every 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`)

    setTimeout(() => {
      this.connect(this.eventHandlers)
    }, delay)
  }

  send(message: WebSocketMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket is not connected')
    }
  }

  subscribe(channel: string) {
    this.send({
      type: 'subscribe',
      data: { channel },
      timestamp: Date.now()
    })
  }

  unsubscribe(channel: string) {
    this.send({
      type: 'unsubscribe',
      data: { channel },
      timestamp: Date.now()
    })
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }
    this.stopHeartbeat()
    this.isConnecting = false
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}

// Singleton instance
let wsClient: WebSocketClient | null = null

export const initializeWebSocket = (token: string): WebSocketClient => {
  if (!wsClient) {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'wss://clutch-main-nk7x.onrender.com/ws'
    wsClient = new WebSocketClient(wsUrl, token)
  }
  return wsClient
}

export const getWebSocketClient = (): WebSocketClient | null => {
  return wsClient
}

export const disconnectWebSocket = () => {
  if (wsClient) {
    wsClient.disconnect()
    wsClient = null
  }
}
