'use client'

import React, { useEffect } from 'react'

/**
 * Error Tracker Component - Add this to any page to enable React Error #310 tracking
 * This will log detailed information about which components are causing the error
 */
export function ErrorTracker({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize error tracking
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Error Tracker initialized - monitoring for React Error #310')
      
      // Override console.error to catch React errors
      const originalConsoleError = console.error
      
      console.error = (...args) => {
        const message = args[0]?.toString() || ''
        
        if (message.includes('React error #310') || message.includes('Rendered more hooks than during the previous render')) {
          console.group('🚨 REACT ERROR #310 DETECTED')
          console.error('Original Error:', ...args)
          console.log('Current URL:', window.location.href)
          console.log('User Agent:', navigator.userAgent)
          console.log('Timestamp:', new Date().toISOString())
          
          // Log component information if available
          if ((window as any).reactErrorTracker) {
            const tracker = (window as any).reactErrorTracker
            console.log('Component Hook Tracker:', tracker.componentHookTracker)
            console.log('Component Render Tracker:', tracker.componentRenderTracker)
          }
          
          // Log auto tracker info if available
          if ((window as any).autoTracker) {
            const autoTracker = (window as any).autoTracker
            console.log('Auto Tracker Info:', {
              hookCount: autoTracker.getHookCount(),
              renderCount: autoTracker.getRenderCount()
            })
          }
          
          // Log stack trace
          console.log('Stack Trace:', new Error().stack)
          console.groupEnd()
          
          // Store error info globally
          ;(window as any).lastReactError310 = {
            error: args,
            url: window.location.href,
            timestamp: new Date().toISOString(),
            tracker: (window as any).reactErrorTracker,
            autoTracker: (window as any).autoTracker
          }
        }
        
        // Call original console.error
        originalConsoleError.apply(console, args)
      }
      
      // Log when component mounts
      console.log('✅ Error Tracker mounted - ready to catch React Error #310')
    }
  }, [])
  
  return <>{children}</>
}

/**
 * Simple hook to track component renders
 */
export function useErrorTracking(componentName: string) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 Component mounted: ${componentName}`, {
        component: componentName,
        timestamp: new Date().toISOString(),
        url: window.location.href
      })
    }
  }, [componentName])
}
