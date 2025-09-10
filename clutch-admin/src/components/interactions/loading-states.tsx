'use client'

import React, { forwardRef, useRef, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useLoadingState } from '@/lib/micro-interactions'

// Loading spinner variants
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'white' | 'gray'
  variant?: 'spinner' | 'dots' | 'pulse' | 'bounce' | 'wave'
  className?: string
}

export const LoadingSpinner = forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ size = 'md', color = 'primary', variant = 'spinner', className }, ref) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
      xl: 'w-12 h-12'
    }

    const colorClasses = {
      primary: 'text-primary',
      secondary: 'text-secondary',
      white: 'text-white',
      gray: 'text-gray-500'
    }

    const renderSpinner = () => {
      switch (variant) {
        case 'spinner':
          return (
            <div className={cn('animate-spin rounded-full border-2 border-current border-t-transparent', sizeClasses[size], colorClasses[color])} />
          )
        
        case 'dots':
          return (
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={cn(
                    'rounded-full animate-pulse',
                    size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-4 h-4',
                    colorClasses[color]
                  )}
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          )
        
        case 'pulse':
          return (
            <div className={cn('rounded-full animate-pulse', sizeClasses[size], colorClasses[color])} />
          )
        
        case 'bounce':
          return (
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={cn(
                    'rounded-full animate-bounce',
                    size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-4 h-4',
                    colorClasses[color]
                  )}
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          )
        
        case 'wave':
          return (
            <div className="flex space-x-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={cn(
                    'rounded-full animate-pulse',
                    size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-4 h-4',
                    colorClasses[color]
                  )}
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          )
        
        default:
          return null
      }
    }

    return (
      <div ref={ref} className={cn('flex items-center justify-center', className)}>
        {renderSpinner()}
      </div>
    )
  }
)

LoadingSpinner.displayName = 'LoadingSpinner'

// Skeleton loader
export interface SkeletonProps {
  width?: string | number
  height?: string | number
  variant?: 'text' | 'circular' | 'rectangular'
  animation?: 'pulse' | 'wave' | 'none'
  className?: string
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ width, height, variant = 'rectangular', animation = 'pulse', className }, ref) => {
    const variantClasses = {
      text: 'h-4 w-full',
      circular: 'rounded-full',
      rectangular: 'rounded-md'
    }

    const animationClasses = {
      pulse: 'animate-pulse',
      wave: 'animate-wave',
      none: ''
    }

    return (
      <div
        ref={ref}
        className={cn(
          'bg-gray-200',
          variantClasses[variant],
          animationClasses[animation],
          className
        )}
        style={{ width, height }}
      />
    )
  }
)

Skeleton.displayName = 'Skeleton'

// Progress bar
export interface ProgressBarProps {
  progress: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'error'
  animated?: boolean
  showPercentage?: boolean
  className?: string
}

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ progress, size = 'md', variant = 'default', animated = false, showPercentage = false, className }, ref) => {
    const sizeClasses = {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3'
    }

    const variantClasses = {
      default: 'bg-primary',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500'
    }

    const clampedProgress = Math.min(Math.max(progress, 0), 100)

    return (
      <div ref={ref} className={cn('w-full', className)}>
        {showPercentage && (
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{Math.round(clampedProgress)}%</span>
          </div>
        )}
        <div className={cn('w-full bg-gray-200 rounded-full overflow-hidden', sizeClasses[size])}>
          <div
            className={cn(
              'h-full transition-all duration-300 ease-out',
              variantClasses[variant],
              animated && 'animate-pulse'
            )}
            style={{ width: `${clampedProgress}%` }}
          />
        </div>
      </div>
    )
  }
)

ProgressBar.displayName = 'ProgressBar'

// Loading overlay
export interface LoadingOverlayProps {
  isLoading: boolean
  message?: string
  progress?: number
  variant?: 'spinner' | 'dots' | 'pulse' | 'bounce' | 'wave'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'white' | 'gray'
  className?: string
}

export const LoadingOverlay = forwardRef<HTMLDivElement, LoadingOverlayProps>(
  ({ isLoading, message, progress, variant = 'spinner', size = 'lg', color = 'white', className }, ref) => {
    if (!isLoading) return null

    return (
      <div
        ref={ref}
        className={cn(
          'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50',
          className
        )}
      >
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full mx-4">
          <div className="text-center">
            <LoadingSpinner
              variant={variant}
              size={size}
              color={color === 'white' ? 'primary' : color}
              className="mx-auto mb-4"
            />
            
            {message && (
              <p className="text-gray-700 mb-4">{message}</p>
            )}
            
            {progress !== undefined && (
              <ProgressBar
                progress={progress}
                size="sm"
                variant="default"
                showPercentage={true}
                className="mb-4"
              />
            )}
          </div>
        </div>
      </div>
    )
  }
)

LoadingOverlay.displayName = 'LoadingOverlay'

// Shimmer effect
export interface ShimmerProps {
  width?: string | number
  height?: string | number
  className?: string
}

export const Shimmer = forwardRef<HTMLDivElement, ShimmerProps>(
  ({ width, height, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden bg-gray-200 rounded',
          className
        )}
        style={{ width, height }}
      >
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      </div>
    )
  }
)

Shimmer.displayName = 'Shimmer'

// Loading button
export interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  loadingText?: string
  loadingVariant?: 'spinner' | 'dots' | 'pulse' | 'bounce' | 'wave'
  loadingSize?: 'sm' | 'md' | 'lg' | 'xl'
  children: React.ReactNode
}

export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ loading, loadingText, loadingVariant = 'spinner', loadingSize = 'sm', children, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
          'bg-primary text-primary-foreground hover:bg-primary/90',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading ? (
          <>
            <LoadingSpinner
              variant={loadingVariant}
              size={loadingSize}
              color="white"
            />
            {loadingText || 'Loading...'}
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)

LoadingButton.displayName = 'LoadingButton'

// Loading card
export interface LoadingCardProps {
  loading?: boolean
  message?: string
  progress?: number
  variant?: 'spinner' | 'dots' | 'pulse' | 'bounce' | 'wave'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'white' | 'gray'
  className?: string
  children?: React.ReactNode
}

export const LoadingCard = forwardRef<HTMLDivElement, LoadingCardProps>(
  ({ loading, message, progress, variant = 'spinner', size = 'md', color = 'primary', className, children }, ref) => {
    if (!loading) {
      return <div ref={ref} className={className}>{children}</div>
    }

    return (
      <div
        ref={ref}
        className={cn(
          'bg-white rounded-lg border border-gray-200 p-6',
          className
        )}
      >
        <div className="text-center">
          <LoadingSpinner
            variant={variant}
            size={size}
            color={color}
            className="mx-auto mb-4"
          />
          
          {message && (
            <p className="text-gray-700 mb-4">{message}</p>
          )}
          
          {progress !== undefined && (
            <ProgressBar
              progress={progress}
              size="sm"
              variant="default"
              showPercentage={true}
            />
          )}
        </div>
      </div>
    )
  }
)

LoadingCard.displayName = 'LoadingCard'

// Loading table
export interface LoadingTableProps {
  loading?: boolean
  rows?: number
  columns?: number
  className?: string
  children?: React.ReactNode
}

export const LoadingTable = forwardRef<HTMLDivElement, LoadingTableProps>(
  ({ loading, rows = 5, columns = 4, className, children }, ref) => {
    if (!loading) {
      return <div ref={ref} className={className}>{children}</div>
    }

    return (
      <div ref={ref} className={cn('w-full', className)}>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <div className="flex space-x-4">
              {Array.from({ length: columns }).map((_, i) => (
                <Skeleton key={i} width="20%" height={20} />
              ))}
            </div>
          </div>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="px-6 py-4 border-b border-gray-200 last:border-b-0">
              <div className="flex space-x-4">
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <Skeleton key={colIndex} width="20%" height={16} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
)

LoadingTable.displayName = 'LoadingTable'

// Export SkeletonLoader as an alias for Skeleton
export const SkeletonLoader = Skeleton

// Export ShimmerLoader as an alias for Shimmer
export const ShimmerLoader = Shimmer

// Export ProgressiveImage as an alias for LoadingOverlay
export const ProgressiveImage = LoadingOverlay

const LoadingStates = {
  LoadingSpinner,
  Skeleton,
  SkeletonLoader,
  ShimmerLoader,
  ProgressiveImage,
  ProgressBar,
  LoadingOverlay,
  Shimmer,
  LoadingButton,
  LoadingCard,
  LoadingTable
}

export default LoadingStates
