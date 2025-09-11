'use client'

import React, { Suspense, lazy, ComponentType } from 'react'
import { RefreshCw } from 'lucide-react'

interface LazyWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  delay?: number
}

// Loading fallback component
const LoadingFallback = ({ delay = 200 }: { delay?: number }) => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center">
      <RefreshCw className="h-6 w-6 animate-spin text-clutch-primary mx-auto mb-2" />
      <div className="text-sm text-slate-500">Loading...</div>
    </div>
  </div>
)

// Lazy wrapper with delay
export function LazyWrapper({ children, fallback, delay = 200 }: LazyWrapperProps) {
  const [showFallback, setShowFallback] = React.useState(true)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowFallback(false)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  return (
    <Suspense fallback={fallback || <LoadingFallback delay={delay} />}>
      {showFallback ? (fallback || <LoadingFallback delay={delay} />) : children}
    </Suspense>
  )
}

// Higher-order component for lazy loading
export function withLazyLoading<T extends object>(
  Component: ComponentType<T>,
  fallback?: React.ReactNode,
  delay?: number
) {
  return function LazyLoadedComponent(props: T) {
    return (
      <LazyWrapper fallback={fallback} delay={delay}>
        <Component {...props} />
      </LazyWrapper>
    )
  }
}

// Lazy load a component with error boundary
export function createLazyComponent<T extends object>(
  importFunc: () => Promise<{ default: ComponentType<T> }>,
  fallback?: React.ReactNode,
  delay?: number
) {
  const LazyComponent = lazy(importFunc)
  
  return function LazyComponentWithWrapper(props: T) {
    return (
      <LazyWrapper fallback={fallback} delay={delay}>
        <LazyComponent {...props} />
      </LazyWrapper>
    )
  }
}

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  const [renderTime, setRenderTime] = React.useState<number>(0)
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    const startTime = performance.now()
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
        if (entry.isIntersecting) {
          const endTime = performance.now()
          setRenderTime(endTime - startTime)
        }
      },
      { threshold: 0.1 }
    )

    const element = document.getElementById(componentName)
    if (element) {
      observer.observe(element)
    }

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [componentName])

  return { renderTime, isVisible }
}

// Virtual scrolling hook for large lists
export function useVirtualScrolling<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = React.useState(0)

  const visibleStart = Math.floor(scrollTop / itemHeight)
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  )

  const visibleItems = items.slice(visibleStart, visibleEnd)
  const totalHeight = items.length * itemHeight
  const offsetY = visibleStart * itemHeight

  const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll
  }
}
