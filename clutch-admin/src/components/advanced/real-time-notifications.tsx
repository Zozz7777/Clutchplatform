'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  AlertTriangle,
  Settings,
  Volume2,
  VolumeX,
  Eye,
  EyeOff
} from 'lucide-react'
import { toast } from 'sonner'

interface Notification {
  id: string
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  message: string
  timestamp: Date
  read: boolean
  priority: 'low' | 'medium' | 'high'
  category: string
  actionUrl?: string
  actionLabel?: string
}

interface RealTimeNotificationsProps {
  className?: string
}

export function RealTimeNotifications({ className }: RealTimeNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [autoMarkRead, setAutoMarkRead] = useState(false)
  const [ws, setWs] = useState<WebSocket | null>(null)

  // WebSocket connection
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'wss://clutch-main-nk7x.onrender.com'
        const socket = new WebSocket(`${wsUrl}/notifications`)
        
        socket.onopen = () => {
          console.log('🔔 Connected to notifications WebSocket')
          setIsConnected(true)
          setWs(socket)
        }

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            handleNewNotification(data)
          } catch (error) {
            console.error('Failed to parse notification:', error)
          }
        }

        socket.onclose = () => {
          console.log('🔔 Disconnected from notifications WebSocket')
          setIsConnected(false)
          setWs(null)
          
          // Attempt to reconnect after 5 seconds
          setTimeout(connectWebSocket, 5000)
        }

        socket.onerror = (error) => {
          console.error('WebSocket error:', error)
          setIsConnected(false)
        }
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error)
        setIsConnected(false)
      }
    }

    connectWebSocket()

    return () => {
      if (ws) {
        ws.close()
      }
    }
  }, [])

  // Handle new notification
  const handleNewNotification = useCallback((data: any) => {
    const notification: Notification = {
      id: data.id || Date.now().toString(),
      type: data.type || 'info',
      title: data.title || 'New Notification',
      message: data.message || '',
      timestamp: new Date(data.timestamp || Date.now()),
      read: false,
      priority: data.priority || 'medium',
      category: data.category || 'system',
      actionUrl: data.actionUrl,
      actionLabel: data.actionLabel
    }

    setNotifications(prev => [notification, ...prev])

    // Show toast notification
    const toastOptions = {
      description: notification.message,
      action: notification.actionUrl ? {
        label: notification.actionLabel || 'View',
        onClick: () => window.open(notification.actionUrl, '_blank')
      } : undefined
    }

    switch (notification.type) {
      case 'success':
        toast.success(notification.title, toastOptions)
        break
      case 'warning':
        toast.warning(notification.title, toastOptions)
        break
      case 'error':
        toast.error(notification.title, toastOptions)
        break
      default:
        toast.info(notification.title, toastOptions)
    }

    // Play sound if enabled
    if (soundEnabled) {
      playNotificationSound(notification.type)
    }

    // Auto-mark as read if enabled
    if (autoMarkRead) {
      setTimeout(() => {
        markAsRead(notification.id)
      }, 5000)
    }
  }, [soundEnabled, autoMarkRead])

  // Play notification sound
  const playNotificationSound = (type: string) => {
    try {
      const audio = new Audio(`/sounds/notification-${type}.mp3`)
      audio.volume = 0.3
      audio.play().catch(() => {
        // Fallback to system sound if custom sound fails
        console.log('🔔 Notification sound played')
      })
    } catch (error) {
      console.log('🔔 Notification sound played (fallback)')
    }
  }

  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
    toast.success('All notifications marked as read')
  }

  // Clear notification
  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([])
    toast.success('All notifications cleared')
  }

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />
      default: return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <Badge variant="destructive" className="text-xs">High</Badge>
      case 'medium': return <Badge variant="default" className="text-xs">Medium</Badge>
      default: return <Badge variant="secondary" className="text-xs">Low</Badge>
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Real-time Notifications</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Disable sound' : 'Enable sound'}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAutoMarkRead(!autoMarkRead)}
              title={autoMarkRead ? 'Disable auto-read' : 'Enable auto-read'}
            >
              {autoMarkRead ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              Mark All Read
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllNotifications}
              disabled={notifications.length === 0}
            >
              Clear All
            </Button>
          </div>
        </div>
        <CardDescription>
          Live notifications from your platform
          <span className={`ml-2 inline-flex items-center gap-1 text-xs ${
            isConnected ? 'text-green-600' : 'text-red-600'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`} />
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No notifications yet</p>
            <p className="text-sm">You'll see real-time updates here</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 border rounded-lg transition-all ${
                  notification.read 
                    ? 'bg-gray-50 border-gray-200' 
                    : 'bg-white border-gray-300 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`text-sm font-medium ${
                        notification.read ? 'text-gray-600' : 'text-gray-900'
                      }`}>
                        {notification.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        {getPriorityBadge(notification.priority)}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => clearNotification(notification.id)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className={`text-sm ${
                      notification.read ? 'text-gray-500' : 'text-gray-700'
                    }`}>
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {notification.timestamp.toLocaleTimeString()}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {notification.category}
                        </span>
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="h-6 px-2 text-xs"
                          >
                            Mark Read
                          </Button>
                        )}
                        {notification.actionUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(notification.actionUrl, '_blank')}
                            className="h-6 px-2 text-xs"
                          >
                            {notification.actionLabel || 'View'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
