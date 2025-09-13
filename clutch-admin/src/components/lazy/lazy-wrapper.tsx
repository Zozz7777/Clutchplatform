'use client'

import React, { Suspense, lazy, ComponentType } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorBoundary } from '@/components/ui/error-boundary'

// Loading fallback component
const LoadingFallback = ({ className }: { className?: string }) => (
  <div className={`space-y-4 ${className || ''}`}>
    <Skeleton className="h-8 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-2/3" />
    <Skeleton className="h-32 w-full" />
  </div>
)

// Error fallback component
const ErrorFallback = ({ error, retry }: { error: Error; retry: () => void }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Failed to Load Component
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        {error.message || 'An error occurred while loading this component.'}
      </p>
      <button
        onClick={retry}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Try Again
      </button>
    </div>
  </div>
)

// Lazy wrapper component
interface LazyWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  errorFallback?: React.ComponentType<{ error: Error; retry: () => void }>
  className?: string
}

export function LazyWrapper({ 
  children, 
  fallback, 
  errorFallback: ErrorFallbackComponent = ErrorFallback,
  className 
}: LazyWrapperProps) {
  const ErrorFallback = ({ error, retry }: { error: any; retry: any }) => (
    <ErrorFallbackComponent error={error} retry={retry} />
  )

  return (
    <ErrorBoundary fallback={<ErrorFallback error={null} retry={() => {}} />}>
      <Suspense fallback={fallback || <LoadingFallback className={className} />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  )
}

// Higher-order component for lazy loading
export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function LazyLoadedComponent(props: P) {
    return (
      <LazyWrapper fallback={fallback}>
        <Component {...props} />
      </LazyWrapper>
    )
  }
}

// Lazy component factory
export function createLazyComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFn)
  
  return function LazyComponentWrapper(props: P) {
    return (
      <LazyWrapper fallback={fallback}>
        <LazyComponent {...props} />
      </LazyWrapper>
    )
  }
}

// Route-based lazy loading
export function createLazyRoute<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  fallback?: React.ReactNode
) {
  const LazyRoute = lazy(importFn)
  
  return function LazyRouteWrapper(props: P) {
    return (
      <LazyWrapper fallback={fallback}>
        <LazyRoute {...props} />
      </LazyWrapper>
    )
  }
}

// Progressive loading component
interface ProgressiveLoadingProps {
  children: React.ReactNode
  stages: Array<{
    threshold: number
    component: React.ComponentType
  }>
  fallback?: React.ReactNode
}

export function ProgressiveLoading({ 
  children, 
  stages, 
  fallback 
}: ProgressiveLoadingProps) {
  const [currentStage, setCurrentStage] = React.useState(0)
  const [isLoaded, setIsLoaded] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  if (!isLoaded) {
    return <>{fallback || <LoadingFallback />}</>
  }

  const CurrentStageComponent = stages[currentStage]?.component

  return (
    <LazyWrapper fallback={fallback}>
      {CurrentStageComponent ? <CurrentStageComponent /> : children}
    </LazyWrapper>
  )
}

// Intersection observer lazy loading
interface IntersectionLazyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  rootMargin?: string
  threshold?: number
  className?: string
}

export function IntersectionLazy({ 
  children, 
  fallback, 
  rootMargin = '50px',
  threshold = 0.1,
  className 
}: IntersectionLazyProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  const [hasLoaded, setHasLoaded] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true)
          setHasLoaded(true)
          observer.disconnect()
        }
      },
      { rootMargin, threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [rootMargin, threshold, hasLoaded])

  return (
    <div ref={ref} className={className}>
      {isVisible ? (
        <LazyWrapper fallback={fallback}>
          {children}
        </LazyWrapper>
      ) : (
        fallback || <LoadingFallback />
      )}
    </div>
  )
}
