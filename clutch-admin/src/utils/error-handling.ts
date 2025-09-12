'use client'

import { showToast } from '@/components/ui/toast'

// Error types
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN'
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Error interface
export interface AppError {
  type: ErrorType
  severity: ErrorSeverity
  message: string
  details?: any
  timestamp: Date
  context?: string
  userMessage?: string
  retryable?: boolean
}

// Error classification function
export function classifyError(error: any): AppError {
  const timestamp = new Date()
  
  // Network errors
  if (error.name === 'NetworkError' || error.message?.includes('fetch')) {
    return {
      type: ErrorType.NETWORK,
      severity: ErrorSeverity.MEDIUM,
      message: error.message || 'Network error occurred',
      details: error,
      timestamp,
      userMessage: 'Unable to connect to the server. Please check your internet connection.',
      retryable: true
    }
  }

  // HTTP status code errors
  if (error.status || error.response?.status) {
    const status = error.status || error.response?.status
    
    switch (status) {
      case 401:
        return {
          type: ErrorType.AUTHENTICATION,
          severity: ErrorSeverity.HIGH,
          message: 'Authentication failed',
          details: error,
          timestamp,
          userMessage: 'Your session has expired. Please log in again.',
          retryable: false
        }
      
      case 403:
        return {
          type: ErrorType.AUTHORIZATION,
          severity: ErrorSeverity.HIGH,
          message: 'Access denied',
          details: error,
          timestamp,
          userMessage: 'You do not have permission to perform this action.',
          retryable: false
        }
      
      case 404:
        return {
          type: ErrorType.NOT_FOUND,
          severity: ErrorSeverity.MEDIUM,
          message: 'Resource not found',
          details: error,
          timestamp,
          userMessage: 'The requested resource was not found.',
          retryable: false
        }
      
      case 422:
        return {
          type: ErrorType.VALIDATION,
          severity: ErrorSeverity.MEDIUM,
          message: 'Validation error',
          details: error,
          timestamp,
          userMessage: 'Please check your input and try again.',
          retryable: false
        }
      
      case 500:
      case 502:
      case 503:
      case 504:
        return {
          type: ErrorType.SERVER,
          severity: ErrorSeverity.HIGH,
          message: 'Server error',
          details: error,
          timestamp,
          userMessage: 'A server error occurred. Please try again later.',
          retryable: true
        }
      
      default:
        return {
          type: ErrorType.UNKNOWN,
          severity: ErrorSeverity.MEDIUM,
          message: error.message || 'An unknown error occurred',
          details: error,
          timestamp,
          userMessage: 'An unexpected error occurred. Please try again.',
          retryable: true
        }
    }
  }

  // Validation errors
  if (error.name === 'ValidationError' || error.errors) {
    return {
      type: ErrorType.VALIDATION,
      severity: ErrorSeverity.LOW,
      message: error.message || 'Validation failed',
      details: error,
      timestamp,
      userMessage: 'Please check your input and try again.',
      retryable: false
    }
  }

  // Default unknown error
  return {
    type: ErrorType.UNKNOWN,
    severity: ErrorSeverity.MEDIUM,
    message: error.message || 'An unknown error occurred',
    details: error,
    timestamp,
    userMessage: 'An unexpected error occurred. Please try again.',
    retryable: true
  }
}

// Error handler function
export function handleError(error: any, context?: string): AppError {
  const appError = classifyError(error)
  appError.context = context

  // Log error for debugging
  console.error(`[${appError.type}] ${appError.message}`, {
    context,
    details: appError.details,
    timestamp: appError.timestamp
  })

  // Show appropriate toast notification
  switch (appError.severity) {
    case ErrorSeverity.CRITICAL:
      showToast.error(appError.userMessage || appError.message, 'Critical error occurred')
      break
    
    case ErrorSeverity.HIGH:
      showToast.error(appError.userMessage || appError.message)
      break
    
    case ErrorSeverity.MEDIUM:
      showToast.warning(appError.userMessage || appError.message)
      break
    
    case ErrorSeverity.LOW:
      showToast.info(appError.userMessage || appError.message)
      break
  }

  return appError
}

// Async error wrapper
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: string
) {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args)
    } catch (error) {
      handleError(error, context)
      return null
    }
  }
}

// Error boundary error handler
export function handleErrorBoundaryError(error: Error, errorInfo: React.ErrorInfo) {
  const appError = classifyError(error)
  appError.context = 'ErrorBoundary'

  console.error('Error Boundary caught an error:', {
    error: appError,
    errorInfo,
    timestamp: new Date()
  })

  // Show critical error toast
  showToast.error(
    'A critical error occurred',
    'The application encountered an unexpected error. Please refresh the page.'
  )

  return appError
}

// Retry mechanism
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      if (attempt === maxRetries) {
        throw error
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }

  throw lastError
}

// Error reporting (for production monitoring)
export function reportError(error: AppError) {
  // In production, this would send the error to a monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to Sentry, LogRocket, etc.
    console.log('Reporting error to monitoring service:', error)
  }
}

// Global error handler
export function setupGlobalErrorHandling() {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = handleError(event.reason, 'UnhandledPromiseRejection')
    reportError(error)
  })

  // Handle global errors
  window.addEventListener('error', (event) => {
    const error = handleError(event.error, 'GlobalError')
    reportError(error)
  })
}

// Error recovery strategies
export const ErrorRecoveryStrategies = {
  // Retry with exponential backoff
  retryWithBackoff: async <T>(
    fn: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> => {
    return withRetry(fn, maxRetries, 1000)
  },

  // Fallback to cached data
  fallbackToCache: <T>(cacheKey: string, fallbackData: T): T => {
    try {
      const cached = localStorage.getItem(cacheKey)
      return cached ? JSON.parse(cached) : fallbackData
    } catch {
      return fallbackData
    }
  },

  // Redirect to safe page
  redirectToSafePage: (path: string = '/dashboard') => {
    if (typeof window !== 'undefined') {
      window.location.href = path
    }
  },

  // Clear problematic data
  clearProblematicData: (keys: string[]) => {
    keys.forEach(key => {
      try {
        localStorage.removeItem(key)
        sessionStorage.removeItem(key)
      } catch (error) {
        console.warn(`Failed to clear ${key}:`, error)
      }
    })
  }
}
