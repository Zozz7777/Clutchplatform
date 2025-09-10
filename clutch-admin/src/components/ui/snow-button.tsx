'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const snowButtonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-background active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-sm hover:from-red-700 hover:to-red-600 hover:shadow-md hover:scale-105',
        destructive: 'bg-red-500 text-white shadow-sm hover:bg-red-600 hover:shadow-md',
        outline: 'border border-red-200 dark:border-red-700 bg-white text-red-800 dark:text-red-300 shadow-sm hover:bg-red-25 hover:text-red-900 dark:hover:bg-red-950/20 hover:shadow-md', /* Improved contrast */
        secondary: 'bg-red-100 dark:bg-red-900/20 text-red-900 dark:text-red-100 shadow-sm hover:bg-red-200 dark:hover:bg-red-900/40 hover:shadow-md',
        ghost: 'text-red-800 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-900 dark:hover:text-red-100', /* Better base contrast */
        link: 'text-red-600 underline-offset-4 hover:underline hover:text-red-700',
        success: 'bg-emerald-500 text-white shadow-sm hover:bg-emerald-600 hover:shadow-md',
        warning: 'bg-amber-500 text-white shadow-sm hover:bg-amber-600 hover:shadow-md',
        gradient: 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-sm hover:from-red-700 hover:to-red-600 hover:shadow-md hover:scale-105',
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

