'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  componentStack?: string
}

export class ReactErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError } = this.props
    
    // Enhanced error logging for React Error #310
    if (error.message.includes('310') || error.message.includes('Rendered more hooks than during the previous render')) {
      console.group('🚨 REACT ERROR #310 CAUGHT BY ERROR BOUNDARY')
      console.error('Error:', error)
      console.error('Error Info:', errorInfo)
      console.log('Component Stack:', errorInfo.componentStack)
      console.log('Error Boundary Stack:', error.stack)
      
      // Log component information
      if (typeof window !== 'undefined' && (window as any).reactErrorTracker) {
        const tracker = (window as any).reactErrorTracker
        console.log('Component Hook Tracker:', tracker.componentHookTracker)
        console.log('Component Render Tracker:', tracker.componentRenderTracker)
      }
      
      console.groupEnd()
      
      // Store error info globally for debugging
      if (typeof window !== 'undefined') {
        ;(window as any).lastReactError310 = {
          error,
          errorInfo,
          timestamp: new Date().toISOString(),
          componentStack: errorInfo.componentStack || undefined,
          tracker: (window as any).reactErrorTracker
        }
      }
    }
    
    this.setState({
      error,
      errorInfo,
      componentStack: errorInfo.componentStack || undefined
    })
    
    if (onError) {
      onError(error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      
      return (
        <div style={{
          padding: '20px',
          border: '2px solid red',
          borderRadius: '8px',
          backgroundColor: '#fee',
          margin: '20px',
          fontFamily: 'monospace'
        }}>
          <h2 style={{ color: 'red', margin: '0 0 10px 0' }}>🚨 React Error Caught</h2>
          <details>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
              Error Details (Click to expand)
            </summary>
            <pre style={{ 
              marginTop: '10px', 
              padding: '10px', 
              backgroundColor: '#f5f5f5', 
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '12px'
            }}>
              {this.state.error?.toString()}
            </pre>
            {this.state.componentStack && (
              <details style={{ marginTop: '10px' }}>
                <summary style={{ cursor: 'pointer' }}>Component Stack</summary>
                <pre style={{ 
                  marginTop: '5px', 
                  padding: '10px', 
                  backgroundColor: '#f0f0f0', 
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontSize: '11px'
                }}>
                  {this.state.componentStack}
                </pre>
              </details>
            )}
          </details>
          <button 
            onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
