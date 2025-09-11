'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const snowCardVariants = cva(
  'rounded-xl border bg-white text-slate-900 dark:text-slate-100 transition-all duration-300 hover:shadow-lg',
  {
    variants: {
      variant: {
        default: 'border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300',
        elevated: 'border-slate-200 shadow-lg hover:shadow-2xl hover:border-slate-300',
        outline: 'border-slate-300',
        ghost: 'border-transparent shadow-none',
        primary: 'border-clutch-primary-100 bg-clutch-primary-50',
        success: 'border-success-100 bg-success-50',
        warning: 'border-warning-100 bg-warning-50',
        error: 'border-error-100 bg-error-50',
        info: 'border-info-100 bg-info-50',
        dark: 'bg-slate-800 border-slate-700 text-white shadow-lg',
      },
      size: {
        default: 'p-6',
        sm: 'p-4',
        lg: 'p-8',
        xl: 'p-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface SnowCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof snowCardVariants> {
  asChild?: boolean
}

const SnowCard = React.forwardRef<HTMLDivElement, SnowCardProps>(
  ({ className, variant, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(snowCardVariants({ variant, size, className }))}
      {...props}
    />
  )
)
SnowCard.displayName = 'SnowCard'

const SnowCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 pb-6', className)}
    {...props}
  />
))
SnowCardHeader.displayName = 'SnowCardHeader'

const SnowCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & { icon?: React.ReactNode }
>(({ className, icon, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-xl font-semibold leading-tight tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2', className)}
    {...props}
  >
    {icon && <span className="text-clutch-primary">{icon}</span>}
    {children}
  </h3>
))
SnowCardTitle.displayName = 'SnowCardTitle'

const SnowCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-slate-600 dark:text-slate-400 leading-relaxed', className)}
    {...props}
  />
))
SnowCardDescription.displayName = 'SnowCardDescription'

const SnowCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('', className)} {...props} />
))
SnowCardContent.displayName = 'SnowCardContent'

const SnowCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-6', className)}
    {...props}
  />
))
SnowCardFooter.displayName = 'SnowCardFooter'

export { 
  SnowCard, 
  SnowCardHeader, 
  SnowCardFooter, 
  SnowCardTitle, 
  SnowCardDescription, 
  SnowCardContent,
  snowCardVariants 
}

