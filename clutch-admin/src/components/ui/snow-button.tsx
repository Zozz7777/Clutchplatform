'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const snowButtonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clutch-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-background active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-clutch-primary text-white shadow-sm hover:bg-clutch-primary-dark hover:shadow-md hover:scale-105',
        destructive: 'bg-error text-white shadow-sm hover:bg-error-dark hover:shadow-md',
        outline: 'border border-clutch-primary-100 bg-white text-clutch-primary-900 shadow-sm hover:bg-clutch-primary-50 hover:text-clutch-primary-dark hover:shadow-md',
        secondary: 'bg-clutch-primary-100 text-clutch-primary-900 shadow-sm hover:bg-clutch-primary-200 hover:shadow-md',
        ghost: 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
        link: 'text-clutch-primary underline-offset-4 hover:underline hover:text-clutch-primary-dark',
        success: 'bg-success text-white shadow-sm hover:bg-success-dark hover:shadow-md',
        warning: 'bg-warning text-white shadow-sm hover:bg-warning-dark hover:shadow-md',
        info: 'bg-info text-white shadow-sm hover:bg-info-dark hover:shadow-md',
        gradient: 'bg-gradient-to-r from-clutch-primary to-clutch-primary-light text-white shadow-sm hover:from-clutch-primary-dark hover:to-clutch-primary hover:shadow-md hover:scale-105',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-lg px-8 text-base',
        xl: 'h-14 rounded-xl px-10 text-lg',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface SnowButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof snowButtonVariants> {
  asChild?: boolean
  loading?: boolean
  icon?: React.ReactNode
}

const SnowButton = React.forwardRef<HTMLButtonElement, SnowButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, icon, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    
    return (
      <Comp
        className={cn(snowButtonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {children}
          </>
        ) : (
          <>
            {icon && <span className="mr-2">{icon}</span>}
            {children}
          </>
        )}
      </Comp>
    )
  }
)
SnowButton.displayName = 'SnowButton'

export { SnowButton, snowButtonVariants }

