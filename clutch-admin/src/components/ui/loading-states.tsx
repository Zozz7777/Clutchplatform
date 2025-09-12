'use client'

import React from 'react'
import { Skeleton, CardSkeleton, TableSkeleton, ListSkeleton, ChartSkeleton, MetricsSkeleton } from './skeleton'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from './button'
import { Card, CardContent, CardHeader } from './card'

// Loading spinner component
export function LoadingSpinner({ size = 'default', className = '' }: { size?: 'sm' | 'default' | 'lg'; className?: string }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  )
}

// Loading overlay component
export function LoadingOverlay({ isLoading, children }: { isLoading: boolean; children: React.ReactNode }) {
  if (!isLoading) return <>{children}</>

  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center z-10">
        <div className="flex items-center space-x-2">
          <LoadingSpinner />
          <span className="text-sm text-slate-600 dark:text-slate-400">Loading...</span>
        </div>
      </div>
    </div>
  )
}

// Loading button component
export function LoadingButton({ 
  isLoading, 
  loadingText = 'Loading...', 
  children, 
  ...props 
}: { 
  isLoading: boolean
  loadingText?: string
  children: React.ReactNode
} & React.ComponentProps<typeof Button>) {
  return (
    <Button disabled={isLoading} {...props}>
      {isLoading ? (
        <>
          <LoadingSpinner size="sm" className="mr-2" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  )
}

// Error state component
export function ErrorState({ 
  error, 
  onRetry, 
  title = 'Something went wrong',
  description = 'We encountered an error while loading data.'
}: {
  error?: string | Error
  onRetry?: () => void
  title?: string
  description?: string
}) {
  const errorMessage = error instanceof Error ? error.message : error

  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <AlertCircle className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            {title}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            {description}
          </p>
          {errorMessage && (
            <p className="text-sm text-red-600 dark:text-red-400 mb-4 font-mono bg-red-50 dark:bg-red-900/20 p-2 rounded">
              {errorMessage}
            </p>
          )}
          {onRetry && (
            <Button onClick={onRetry} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Empty state component
export function EmptyState({ 
  title, 
  description, 
  action,
  icon: Icon
}: {
  title: string
  description: string
  action?: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card>
      <CardContent className="p-12">
        <div className="text-center">
          {Icon && (
            <div className="text-slate-400 mb-4">
              <Icon className="h-12 w-12 mx-auto" />
            </div>
          )}
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            {title}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {description}
          </p>
          {action}
        </div>
      </CardContent>
    </Card>
  )
}

// Data loading wrapper component
export function DataLoadingWrapper<T>({
  data,
  isLoading,
  error,
  onRetry,
  loadingComponent,
  errorComponent,
  emptyComponent,
  children
}: {
  data: T | null | undefined
  isLoading: boolean
  error: string | Error | null
  onRetry?: () => void
  loadingComponent?: React.ReactNode
  errorComponent?: React.ReactNode
  emptyComponent?: React.ReactNode
  children: (data: T) => React.ReactNode
}) {
  if (isLoading) {
    return loadingComponent || <CardSkeleton />
  }

  if (error) {
    return errorComponent || <ErrorState error={error} onRetry={onRetry} />
  }

  if (!data || (Array.isArray(data) && data.length === 0)) {
    return emptyComponent || <EmptyState title="No data available" description="There's nothing to show here." />
  }

  return <>{children(data)}</>
}

// Page loading component
export function PageLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <CardSkeleton />
        </div>
        <div className="lg:col-span-3">
          <CardSkeleton />
        </div>
      </div>
    </div>
  )
}

// Table loading component
export function TableLoading({ columns = 4, rows = 5 }: { columns?: number; rows?: number }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <TableSkeleton rows={rows} />
      </CardContent>
    </Card>
  )
}

// Chart loading component
export function ChartLoading() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
      </CardHeader>
      <CardContent>
        <ChartSkeleton />
      </CardContent>
    </Card>
  )
}

// Metrics loading component
export function MetricsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricsSkeleton />
    </div>
  )
}

// Inline loading component
export function InlineLoading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
      <LoadingSpinner size="sm" />
      <span>{text}</span>
    </div>
  )
}

// Skeleton for specific content types
export function ArticleSkeleton() {
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  )
}

export function IncidentSkeleton() {
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-8" />
          </div>
          <Skeleton className="h-4 w-full" />
          <div className="flex items-center space-x-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  )
}
