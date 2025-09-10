'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const snowInputVariants = cva(
  'flex w-full rounded-lg border bg-white px-3 py-2 text-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-600 dark:placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ring-offset-background', /* Improved placeholder contrast */
  {
    variants: {
      variant: {
        default: 'border-red-200 dark:border-red-700 text-slate-900 dark:text-slate-100 hover:border-red-300 dark:hover:border-red-600 focus:border-red-500',
        ghost: 'border-transparent bg-red-50 dark:bg-red-950/20 text-slate-900 dark:text-slate-100 hover:bg-red-100 dark:hover:bg-red-950/40 focus:bg-white dark:focus:bg-slate-900 focus:border-red-500',
        success: 'border-emerald-200 dark:border-emerald-800 text-slate-900 dark:text-slate-100 focus:border-emerald-500',
        warning: 'border-amber-200 dark:border-amber-800 text-slate-900 dark:text-slate-100 focus:border-amber-500',
        destructive: 'border-red-300 dark:border-red-600 text-slate-900 dark:text-slate-100 focus:border-red-500',
      },
      size: {
        default: 'h-10 px-3 py-2',
        sm: 'h-8 px-2.5 py-1.5 text-xs',
        lg: 'h-12 px-4 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface SnowInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof snowInputVariants> {
  label?: string
  error?: string
  helper?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const SnowInput = React.forwardRef<HTMLInputElement, SnowInputProps>(
  ({ className, variant, size, type, label, error, helper, leftIcon, rightIcon, ...props }, ref) => {
    const inputId = React.useId()
    
    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={inputId}
            className="text-sm font-medium text-slate-700 text-slate-700"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 text-slate-600">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            className={cn(
              snowInputVariants({ variant: error ? 'destructive' : variant, size, className }),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10'
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 text-slate-600">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        {helper && !error && (
          <p className="text-sm text-slate-600 text-slate-600">{helper}</p>
        )}
      </div>
    )
  }
)
SnowInput.displayName = 'SnowInput'

// Search Input variant
export interface SnowSearchInputProps extends Omit<SnowInputProps, 'leftIcon'> {
  onSearch?: (value: string) => void
}

const SnowSearchInput = React.forwardRef<HTMLInputElement, SnowSearchInputProps>(
  ({ onSearch, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && onSearch) {
        onSearch(e.currentTarget.value)
      }
    }

    return (
      <SnowInput
        ref={ref}
        type="search"
        leftIcon={
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        }
        onKeyDown={handleKeyDown}
        {...props}
      />
    )
  }
)
SnowSearchInput.displayName = 'SnowSearchInput'

export { SnowInput, SnowSearchInput, snowInputVariants }



