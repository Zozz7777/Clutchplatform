'use client'

import React, { useEffect, useRef } from 'react'
import { trackComponentRender, trackUseMemoCall } from '@/lib/react-error-tracker'

/**
 * Higher-Order Component that tracks component renders and hook usage
 * This will help identify which components are causing React Error #310
 */
export function withComponentTracker<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Unknown'
  
  const TrackedComponent = (props: P) => {
    const renderCount = useRef(0)
    const hookCount = useRef(0)
    
    // Track every render
    useEffect(() => {
      renderCount.current += 1
      trackComponentRender(displayName, hookCount.current)
    })
    
    // Track hook calls
    const trackHook = () => {
      hookCount.current += 1
    }
    
    // Override useMemo to track calls
    const originalUseMemo = React.useMemo
    React.useMemo = (factory: any, deps: any) => {
      trackUseMemoCall(displayName, deps || [])
      trackHook()
      return originalUseMemo(factory, deps)
    }
    
    return <WrappedComponent {...props} />
  }
  
  TrackedComponent.displayName = `withComponentTracker(${displayName})`
  
  return TrackedComponent
}

/**
 * Hook that tracks component renders and provides debugging info
 */
export function useComponentDebugger(componentName: string) {
  const renderCount = useRef(0)
  const hookCount = useRef(0)
  
  useEffect(() => {
    renderCount.current += 1
    trackComponentRender(componentName, hookCount.current)
  })
  
  const trackHook = () => {
    hookCount.current += 1
  }
  
  const trackUseMemo = (deps: any[]) => {
    trackUseMemoCall(componentName, deps)
    trackHook()
  }
  
  return {
    renderCount: renderCount.current,
    hookCount: hookCount.current,
    trackHook,
    trackUseMemo
  }
}

/**
 * Component that wraps children and tracks all components in the tree
 */
export function ComponentTracker({ children, name = 'Root' }: { children: React.ReactNode; name?: string }) {
  const { renderCount, hookCount } = useComponentDebugger(name)
  
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 ComponentTracker: ${name}`, {
        renderCount,
        hookCount,
        timestamp: new Date().toISOString()
      })
    }
  })
  
  return <>{children}</>
}
