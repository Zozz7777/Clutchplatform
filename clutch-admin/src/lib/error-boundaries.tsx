/**
 * Advanced Error Boundaries and Error Handling
 * Features:
 * - Comprehensive error boundaries
 * - Error reporting
 * - Fallback UI components
 * - Error recovery strategies
 * - Performance monitoring
 */

import React, { Component, ErrorInfo, ReactNode, useState, useCallback } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'

// Error types
export interface CustomErrorInfo {
  componentStack: string
  errorBoundary?: string
  errorBoundaryStack?: string
}

export interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  errorId: string
  retryCount: number
}

export interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  onRetry?: () => void
  maxRetries?: number
  resetOnPropsChange?: boolean
  resetKeys?: Array<string | number>
  level?: 'page' | 'component' | 'feature'
}

// Base Error Boundary
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { onError, level = 'component' } = this.props

    this.setState({
      error,
      errorInfo
    })

    // Log error
    console.error(`Error Boundary (${level}):`, error, errorInfo)

    // Report error to monitoring service
    this.reportError(error, errorInfo)

    // Call custom error handler
    onError?.(error, errorInfo)
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnPropsChange, resetKeys } = this.props
    const { hasError } = this.state

    if (hasError && resetOnPropsChange) {
      if (resetKeys) {
        const hasResetKeyChanged = resetKeys.some(
          (key, index) => key !== prevProps.resetKeys?.[index]
        )
        if (hasResetKeyChanged) {
          this.resetErrorBoundary()
        }
      } else {
        this.resetErrorBoundary()
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }
  }

  private reportError = (error: Error, errorInfo: React.ErrorInfo) => {
    const { level = 'component' } = this.props
    const { errorId } = this.state

    // Create error report
    const errorReport = {
      id: errorId,
      level,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId()
    }

    // Send to monitoring service
    this.sendErrorReport(errorReport)
  }

  private sendErrorReport = (errorReport: any) => {
    // In a real application, send to your error monitoring service
    // e.g., Sentry, LogRocket, Bugsnag, etc.
    console.error('Error Report:', errorReport)

    // Example: Send to monitoring service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: errorReport.message,
        fatal: false
      })
    }
  }

  private getCurrentUserId = (): string | null => {
    // Get current user ID from your auth system
    return localStorage.getItem('userId')
  }

  private getSessionId = (): string => {
    // Get or create session ID
    let sessionId = sessionStorage.getItem('sessionId')
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('sessionId', sessionId)
    }
    return sessionId
  }

  private resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0
    })
  }

  private handleRetry = () => {
    const { onRetry, maxRetries = 3 } = this.props
    const { retryCount } = this.state

    if (retryCount < maxRetries) {
      this.setState(prevState => ({
        retryCount: prevState.retryCount + 1
      }))

      // Call custom retry handler
      onRetry?.()

      // Reset error boundary after a short delay
      this.resetTimeoutId = window.setTimeout(() => {
        this.resetErrorBoundary()
      }, 1000)
    }
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    const { hasError, error, errorInfo, retryCount } = this.state
    const { children, fallback, maxRetries = 3, level = 'component' } = this.props

    if (hasError) {
      if (fallback) {
        return fallback
      }

      return (
        <ErrorFallback
          error={error}
          errorInfo={errorInfo}
          level={level}
          retryCount={retryCount}
          maxRetries={maxRetries}
          onRetry={this.handleRetry}
          onReload={this.handleReload}
          onGoHome={this.handleGoHome}
        />
      )
    }

    return children
  }
}

// Error Fallback Component
interface ErrorFallbackProps {
  error: Error | null
  errorInfo: React.ErrorInfo | null
  level: string
  retryCount: number
  maxRetries: number
  onRetry: () => void
  onReload: () => void
  onGoHome: () => void
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  level,
  retryCount,
  maxRetries,
  onRetry,
  onReload,
  onGoHome
}) => {
  const [showDetails, setShowDetails] = React.useState(false)

  const canRetry = retryCount < maxRetries

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg border border-red-200 p-6">
        <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
          {level === 'page' ? 'Page Error' : 'Something went wrong'}
        </h2>
        <p className="text-gray-600 text-center mb-6">
          {level === 'page' 
            ? 'We encountered an error while loading this page.'
            : 'An unexpected error occurred. Please try again.'
          }
        </p>
        {process.env.NODE_ENV === 'development' && error && (
          <div className="mb-6">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-2"
            >
              <Bug className="w-4 h-4" />
              {showDetails ? 'Hide' : 'Show'} Error Details
            </button>
            
            {showDetails && (
              <div className="bg-gray-100 rounded-lg p-4 text-sm">
                <div className="mb-2">
                  <strong>Error:</strong> {error.message}
                </div>
                {error.stack && (
                  <div className="mb-2">
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap text-xs mt-1">
                      {error.stack}
                    </pre>
                  </div>
                )}
                {errorInfo?.componentStack && (
                  <div>
                    <strong>Component Stack:</strong>
                    <pre className="whitespace-pre-wrap text-xs mt-1">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        <div className="flex flex-col gap-3">
          {canRetry && (
            <button
              onClick={onRetry}
              className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again ({retryCount + 1}/{maxRetries})
            </button>
          )}
          
          <button
            onClick={onReload}
            className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reload Page
          </button>
          
          {level === 'page' && (
            <button
              onClick={onGoHome}
              className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Home className="w-4 h-4" />
              Go to Home
            </button>
          )}
        </div>
        {retryCount > 0 && (
          <p className="text-xs text-gray-500 text-center mt-4">
            Retry attempt {retryCount} of {maxRetries}
          </p>
        )}
      </div>
    </div>
  )
}

// Page-level Error Boundary
export const PageErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    level="page"
    maxRetries={2}
    resetOnPropsChange={true}
    onError={(error, errorInfo) => {
      console.error('Page Error:', error, errorInfo)
    }}
  >
    {children}
  </ErrorBoundary>
)

// Component-level Error Boundary
export const ComponentErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    level="component"
    maxRetries={1}
    onError={(error, errorInfo) => {
      console.error('Component Error:', error, errorInfo)
    }}
  >
    {children}
  </ErrorBoundary>
)

// Feature-level Error Boundary
export const FeatureErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    level="feature"
    maxRetries={2}
    resetOnPropsChange={true}
    onError={(error, errorInfo) => {
      console.error('Feature Error:', error, errorInfo)
    }}
  >
    {children}
  </ErrorBoundary>
)

// Async Error Boundary for async operations
export class AsyncErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `async-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo })
    console.error('Async Error Boundary:', error, errorInfo)
  }

  render() {
    const { hasError, error } = this.state
    const { children, fallback } = this.props

    if (hasError) {
      if (fallback) {
        return fallback
      }

      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Async Error</span>
          </div>
          <p className="text-red-700 mt-2">
            {error?.message || 'An error occurred while loading data.'}
          </p>
        </div>
      )
    }

    return children
  }
}

// Error Recovery Hook
export function useErrorRecovery() {
  const [error, setError] = useState<Error | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const recover = useCallback(() => {
    setError(null)
    setRetryCount(0)
  }, [])

  const retry = useCallback(() => {
    setRetryCount(prev => prev + 1)
    setError(null)
  }, [])

  const handleError = useCallback((error: Error) => {
    setError(error)
  }, [])

  return {
    error,
    retryCount,
    recover,
    retry,
    handleError
  }
}

const ErrorBoundaries = {
  ErrorBoundary,
  PageErrorBoundary,
  ComponentErrorBoundary,
  FeatureErrorBoundary,
  AsyncErrorBoundary,
  useErrorRecovery
}

export default ErrorBoundaries
