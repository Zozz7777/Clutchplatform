'use client'

import React, { useEffect, useState } from 'react'
import { AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { SnowButton } from '@/components/ui/snow-button'

interface ApiErrorHandlerProps {
  error: any
  onRetry?: () => void
  onLogin?: () => void
  className?: string
}

export const ApiErrorHandler: React.FC<ApiErrorHandlerProps> = ({
  error,
  onRetry,
  onLogin,
  className = ''
}) => {
  const [isRetrying, setIsRetrying] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  const handleRetry = async () => {
    if (isRetrying) return
    
    setIsRetrying(true)
    setRetryCount(prev => prev + 1)
    
    try {
      if (onRetry) {
        await onRetry()
      }
    } finally {
      setIsRetrying(false)
    }
  }

  const handleLogin = () => {
    if (onLogin) {
      onLogin()
    } else {
      window.location.href = '/login'
    }
  }

  // Determine error type and message
  const getErrorInfo = () => {
    if (!error) return { type: 'unknown', message: 'An unknown error occurred' }

    const status = error.statusCode || error.status
    const message = error.message || error.error || 'An error occurred'

    if (status === 401) {
      return {
        type: 'auth',
        message: 'Your session has expired. Please login again.',
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
        action: 'login'
      }
    }

    if (status === 429) {
      return {
        type: 'rate_limit',
        message: 'Too many requests. Please wait a moment and try again.',
        icon: <WifiOff className="h-5 w-5 text-yellow-500" />,
        action: 'retry'
      }
    }

    if (status >= 500) {
      return {
        type: 'server',
        message: 'Server error. Please try again later.',
        icon: <WifiOff className="h-5 w-5 text-red-500" />,
        action: 'retry'
      }
    }

    if (message.includes('Network') || message.includes('fetch')) {
      return {
        type: 'network',
        message: 'Network error. Please check your connection.',
        icon: <Wifi className="h-5 w-5 text-yellow-500" />,
        action: 'retry'
      }
    }

    return {
      type: 'general',
      message: message,
      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      action: 'retry'
    }
  }

  const errorInfo = getErrorInfo()

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        {errorInfo.icon}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-red-800">
            {errorInfo.type === 'auth' && 'Authentication Required'}
            {errorInfo.type === 'rate_limit' && 'Rate Limit Exceeded'}
            {errorInfo.type === 'server' && 'Server Error'}
            {errorInfo.type === 'network' && 'Network Error'}
            {errorInfo.type === 'general' && 'Error'}
          </h3>
          <p className="mt-1 text-sm text-red-700">
            {errorInfo.message}
          </p>
          
          {retryCount > 0 && (
            <p className="mt-1 text-xs text-red-600">
              Retry attempt: {retryCount}
            </p>
          )}
        </div>
      </div>
      
      <div className="mt-3 flex space-x-2">
        {errorInfo.action === 'retry' && onRetry && (
          <SnowButton
            onClick={handleRetry}
            disabled={isRetrying}
            className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </>
            )}
          </SnowButton>
        )}
        
        {errorInfo.action === 'login' && (
          <SnowButton
            onClick={handleLogin}
            className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1"
          >
            Go to Login
          </SnowButton>
        )}
      </div>
    </div>
  )
}

export default ApiErrorHandler
