'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const snowCardVariants = cva(
  'rounded-xl border bg-white bg-white text-slate-900 dark:text-slate-100 transition-all duration-300 hover:shadow-lg',
  {
    variants: {
      variant: {
        default: 'border-red-200/30 dark:border-red-800/30 shadow-sm hover:shadow-xl hover:border-red-300/50 dark:hover:border-red-700/50',
        elevated: 'border-red-200/30 dark:border-red-800/30 shadow-lg hover:shadow-2xl hover:border-red-300/50 dark:hover:border-red-700/50',
        outline: 'border-red-200 dark:border-red-700',
        ghost: 'border-transparent shadow-none',
        primary: 'border-red-300/40 bg-gradient-to-br from-red-50/80 to-white dark:from-red-950/30 dark:to-slate-900',
        success: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50',
        warning: 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50',
        destructive: 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/50',
        dark: 'bg-slate-800 bg-white border-slate-700 border-slate-200 text-white shadow-lg',
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
    className={cn('text-xl font-semibold leading-none tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2', className)}
    {...props}
  >
    {icon && <span className="text-red-500">{icon}</span>}
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
    className={cn('text-sm text-slate-600 text-slate-600', className)}
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

