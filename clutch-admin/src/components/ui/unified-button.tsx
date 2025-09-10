'use client'

import React, { forwardRef, useMemo } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { designTokens } from '@/lib/design-tokens'

// Button variants using CVA
const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        // Primary variants
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary shadow-sm',
        'primary-outline': 'border border-primary text-primary hover:bg-primary hover:text-primary-foreground focus-visible:ring-primary',
        'primary-ghost': 'text-primary hover:bg-primary/10 focus-visible:ring-primary',
        
        // Secondary variants
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:ring-secondary shadow-sm',
        'secondary-outline': 'border border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground focus-visible:ring-secondary',
        'secondary-ghost': 'text-secondary hover:bg-secondary/10 focus-visible:ring-secondary',
        
        // Neutral variants
        neutral: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 focus-visible:ring-neutral-500 shadow-sm',
        'neutral-outline': 'border border-neutral-300 text-neutral-700 hover:bg-neutral-50 focus-visible:ring-neutral-500',
        'neutral-ghost': 'text-neutral-700 hover:bg-neutral-100 focus-visible:ring-neutral-500',
        
        // Semantic variants
        success: 'bg-semantic-success-500 text-white hover:bg-semantic-success-600 focus-visible:ring-semantic-success-500 shadow-sm',
        'success-outline': 'border border-semantic-success-500 text-semantic-success-500 hover:bg-semantic-success-500 hover:text-white focus-visible:ring-semantic-success-500',
        'success-ghost': 'text-semantic-success-500 hover:bg-semantic-success-50 focus-visible:ring-semantic-success-500',
        
        warning: 'bg-semantic-warning-500 text-white hover:bg-semantic-warning-600 focus-visible:ring-semantic-warning-500 shadow-sm',
        'warning-outline': 'border border-semantic-warning-500 text-semantic-warning-500 hover:bg-semantic-warning-500 hover:text-white focus-visible:ring-semantic-warning-500',
        'warning-ghost': 'text-semantic-warning-500 hover:bg-semantic-warning-50 focus-visible:ring-semantic-warning-500',
        
        error: 'bg-semantic-error-500 text-white hover:bg-semantic-error-600 focus-visible:ring-semantic-error-500 shadow-sm',
        'error-outline': 'border border-semantic-error-500 text-semantic-error-500 hover:bg-semantic-error-500 hover:text-white focus-visible:ring-semantic-error-500',
        'error-ghost': 'text-semantic-error-500 hover:bg-semantic-error-50 focus-visible:ring-semantic-error-500',
        
        info: 'bg-semantic-info-500 text-white hover:bg-semantic-info-600 focus-visible:ring-semantic-info-500 shadow-sm',
        'info-outline': 'border border-semantic-info-500 text-semantic-info-500 hover:bg-semantic-info-500 hover:text-white focus-visible:ring-semantic-info-500',
        'info-ghost': 'text-semantic-info-500 hover:bg-semantic-info-50 focus-visible:ring-semantic-info-500',
        
        // Special variants
        link: 'text-primary underline-offset-4 hover:underline focus-visible:ring-primary',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive shadow-sm',
        'destructive-outline': 'border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground focus-visible:ring-destructive',
        'destructive-ghost': 'text-destructive hover:bg-destructive/10 focus-visible:ring-destructive'
      },
      size: {
        xs: 'h-7 px-2 text-xs',
        sm: 'h-8 px-3 text-sm',
        md: 'h-9 px-4 text-sm',
        lg: 'h-10 px-6 text-base',
        xl: 'h-11 px-8 text-base',
        '2xl': 'h-12 px-10 text-lg'
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto'
      },
      loading: {
        true: 'cursor-not-allowed',
        false: 'cursor-pointer'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
      loading: false
    }
  }
)

export interface UnifiedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  loadingText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  href?: string
  target?: string
  rel?: string
}

const UnifiedButton = forwardRef<HTMLButtonElement, UnifiedButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      loading = false,
      loadingText,
      leftIcon,
      rightIcon,
      children,
      disabled,
      href,
      target,
      rel,
      ...props
    },
    ref
  ) => {
    // Memoize button content to prevent unnecessary re-renders
    const buttonContent = useMemo(() => {
      if (loading) {
        return (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {loadingText || 'Loading...'}
          </>
        )
      }

      return (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )
    }, [loading, loadingText, leftIcon, rightIcon, children])

    // Handle as link if href is provided
    if (href) {
      return (
        <a
          href={href}
          target={target}
          rel={rel}
          className={cn(
            buttonVariants({ variant, size, fullWidth, loading }),
            className
          )}
        >
          {buttonContent}
        </a>
      )
    }

    return (
      <button
        className={cn(
          buttonVariants({ variant, size, fullWidth, loading }),
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {buttonContent}
      </button>
    )
  }
)

UnifiedButton.displayName = 'UnifiedButton'

// Button group component
export interface ButtonGroupProps {
  children: React.ReactNode
  orientation?: 'horizontal' | 'vertical'
  spacing?: 'none' | 'sm' | 'md' | 'lg'
  className?: string
}

export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ children, orientation = 'horizontal', spacing = 'sm', className }, ref) => {
    const spacingClasses = {
      none: 'gap-0',
      sm: 'gap-1',
      md: 'gap-2',
      lg: 'gap-3'
    }

    const orientationClasses = {
      horizontal: 'flex-row',
      vertical: 'flex-col'
    }

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex',
          orientationClasses[orientation],
          spacingClasses[spacing],
          className
        )}
        role="group"
      >
        {children}
      </div>
    )
  }
)

ButtonGroup.displayName = 'ButtonGroup'

// Icon button component
export interface IconButtonProps
  extends Omit<UnifiedButtonProps, 'leftIcon' | 'rightIcon' | 'children'> {
  icon: React.ReactNode
  'aria-label': string
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, className, size = 'md', ...props }, ref) => {
    const sizeClasses = {
      xs: 'h-7 w-7',
      sm: 'h-8 w-8',
      md: 'h-9 w-9',
      lg: 'h-10 w-10',
      xl: 'h-11 w-11',
      '2xl': 'h-12 w-12'
    }

    return (
      <UnifiedButton
        ref={ref}
        className={cn(sizeClasses[size || 'md'], className)}
        size={size}
        {...props}
      >
        {icon}
      </UnifiedButton>
    )
  }
)

IconButton.displayName = 'IconButton'

// Floating action button
export interface FloatingActionButtonProps
  extends Omit<UnifiedButtonProps, 'size' | 'variant'> {
  icon: React.ReactNode
  'aria-label': string
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
}

export const FloatingActionButton = forwardRef<HTMLButtonElement, FloatingActionButtonProps>(
  ({ icon, position = 'bottom-right', className, ...props }, ref) => {
    const positionClasses = {
      'bottom-right': 'fixed bottom-6 right-6',
      'bottom-left': 'fixed bottom-6 left-6',
      'top-right': 'fixed top-6 right-6',
      'top-left': 'fixed top-6 left-6'
    }

    return (
      <UnifiedButton
        ref={ref}
        variant="primary"
        size="lg"
        className={cn(
          positionClasses[position],
          'rounded-full shadow-lg hover:shadow-xl transition-shadow z-50',
          className
        )}
        {...props}
      >
        {icon}
      </UnifiedButton>
    )
  }
)

FloatingActionButton.displayName = 'FloatingActionButton'

export { UnifiedButton, buttonVariants }
export default UnifiedButton
