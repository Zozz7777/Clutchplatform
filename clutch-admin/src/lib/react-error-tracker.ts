/**
 * React Error Tracker - Logs component names and hook violations
 * This helps identify which components are causing React Error #310
 */

import React from 'react'

// Store component names and their hook counts
const componentHookTracker = new Map<string, number>()
const componentRenderTracker = new Map<string, number>()

// Track component renders and hook counts
export function trackComponentRender(componentName: string, hookCount: number) {
  const currentRender = componentRenderTracker.get(componentName) || 0
  const previousHookCount = componentHookTracker.get(componentName)
  
  componentRenderTracker.set(componentName, currentRender + 1)
  componentHookTracker.set(componentName, hookCount)
  
  // Log if hook count changed between renders
  if (previousHookCount !== undefined && previousHookCount !== hookCount) {
    console.error(`🚨 HOOK VIOLATION DETECTED in component: ${componentName}`, {
      component: componentName,
      previousHookCount,
      currentHookCount: hookCount,
      renderCount: currentRender + 1,
      timestamp: new Date().toISOString(),
      error: 'React Error #310 - Hook count changed between renders'
    })
  }
  
  // Log all component renders in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔍 Component: ${componentName}`, {
      renderCount: currentRender + 1,
      hookCount,
      timestamp: new Date().toISOString()
    })
  }
}

// Track useMemo calls specifically
export function trackUseMemoCall(componentName: string, deps: any[], condition?: boolean) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🎯 useMemo called in: ${componentName}`, {
      component: componentName,
      dependencies: deps,
      condition,
      timestamp: new Date().toISOString()
    })
  }
}

// Enhanced error boundary that logs component information
export class ReactErrorTracker extends Error {
  public componentName?: string
  public hookCount?: number
  public renderCount?: number
  
  constructor(message: string, componentName?: string, hookCount?: number, renderCount?: number) {
    super(message)
    this.name = 'ReactErrorTracker'
    this.componentName = componentName
    this.hookCount = hookCount
    this.renderCount = renderCount
  }
}

// Global error handler for React errors
if (typeof window !== 'undefined') {
  const originalConsoleError = console.error
  
  console.error = (...args) => {
    // Check if this is a React Error #310
    const message = args[0]?.toString() || ''
    
    if (message.includes('React error #310') || message.includes('Rendered more hooks than during the previous render')) {
      console.group('🚨 REACT ERROR #310 DETECTED')
      console.error('Original Error:', ...args)
      console.log('Component Hook Tracker:', Object.fromEntries(componentHookTracker))
      console.log('Component Render Tracker:', Object.fromEntries(componentRenderTracker))
      console.log('Stack Trace:', new Error().stack)
      console.groupEnd()
      
      // Also log to a global variable for debugging
      ;(window as any).reactError310 = {
        error: args,
        componentTracker: Object.fromEntries(componentHookTracker),
        renderTracker: Object.fromEntries(componentRenderTracker),
        timestamp: new Date().toISOString()
      }
    }
    
    // Call original console.error
    originalConsoleError.apply(console, args)
  }
}

// Hook to track component lifecycle
export function useComponentTracker(componentName: string) {
  const [hookCount, setHookCount] = React.useState(0)
  
  React.useEffect(() => {
    trackComponentRender(componentName, hookCount)
  })
  
  return {
    trackHook: () => setHookCount(prev => prev + 1),
    getHookCount: () => hookCount
  }
}

// Safe useMemo that tracks calls
export function useTrackedMemo<T>(
  factory: () => T,
  deps: React.DependencyList | undefined,
  componentName: string
): T {
  trackUseMemoCall(componentName, [...(deps || [])])
  return React.useMemo(factory, deps || [])
}

// Export for global access
if (typeof window !== 'undefined') {
  ;(window as any).reactErrorTracker = {
    componentHookTracker,
    componentRenderTracker,
    trackComponentRender,
    trackUseMemoCall
  }
}
