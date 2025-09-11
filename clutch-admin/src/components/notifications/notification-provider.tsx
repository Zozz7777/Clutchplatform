'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react'
import { SnowButton } from '@/components/ui/snow-button'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  persistent?: boolean
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id'>) => string
  removeNotification: (id: string) => void
  clearAllNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: React.ReactNode
  maxNotifications?: number
}

export function NotificationProvider({ 
  children, 
  maxNotifications = 5 
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification: Notification = {
      id,
      duration: 5000,
      ...notification
    }

    setNotifications(prev => {
      const updated = [newNotification, ...prev]
      return updated.slice(0, maxNotifications)
    })

    // Auto-remove notification after duration (unless persistent)
    if (!newNotification.persistent && newNotification.duration) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }

    return id
  }, [maxNotifications])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAllNotifications
    }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  )
}

function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return createPortal(
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {notifications.map(notification => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>,
    document.body
  )
}

interface NotificationToastProps {
  notification: Notification
  onRemove: (id: string) => void
}

function NotificationToast({ notification, onRemove }: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  const handleRemove = () => {
    setIsLeaving(true)
    setTimeout(() => onRemove(notification.id), 300)
  }

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-success" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-error" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-warning" />
      case 'info':
        return <Info className="h-5 w-5 text-info" />
      default:
        return <Info className="h-5 w-5 text-slate-500" />
    }
  }

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-success-50 border-success-200'
      case 'error':
        return 'bg-error-50 border-error-200'
      case 'warning':
        return 'bg-warning-50 border-warning-200'
      case 'info':
        return 'bg-info-50 border-info-200'
      default:
        return 'bg-white border-slate-200'
    }
  }

  return (
    <div
      className={`
        ${getBackgroundColor()}
        border rounded-lg shadow-lg p-4 transition-all duration-300 transform
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${isLeaving ? 'translate-x-full opacity-0' : ''}
      `}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-slate-900">
            {notification.title}
          </h4>
          {notification.message && (
            <p className="text-sm text-slate-600 mt-1">
              {notification.message}
            </p>
          )}
          {notification.action && (
            <div className="mt-3">
              <SnowButton
                size="sm"
                variant="outline"
                onClick={notification.action.onClick}
                className="text-xs"
              >
                {notification.action.label}
              </SnowButton>
            </div>
          )}
        </div>
        <div className="flex-shrink-0">
          <SnowButton
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="h-6 w-6 p-0 hover:bg-slate-200"
          >
            <X className="h-4 w-4" />
          </SnowButton>
        </div>
      </div>
    </div>
  )
}

// Hook for easy notification usage
export const useNotificationActions = () => {
  const { addNotification } = useNotifications()

  const showSuccess = useCallback((title: string, message?: string) => {
    return addNotification({ type: 'success', title, message })
  }, [addNotification])

  const showError = useCallback((title: string, message?: string) => {
    return addNotification({ type: 'error', title, message, persistent: true })
  }, [addNotification])

  const showWarning = useCallback((title: string, message?: string) => {
    return addNotification({ type: 'warning', title, message })
  }, [addNotification])

  const showInfo = useCallback((title: string, message?: string) => {
    return addNotification({ type: 'info', title, message })
  }, [addNotification])

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}
