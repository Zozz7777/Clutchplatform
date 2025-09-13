'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const luxuryCardVariants = cva(
  'rounded-2xl border bg-white/80 backdrop-blur-md text-slate-900 transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] relative overflow-hidden group',
  {
    variants: {
      variant: {
        // Glassmorphism Variants
        glass: 'border-white/20 bg-white/10 backdrop-blur-xl shadow-glass-lg hover:shadow-glass-xl hover:bg-white/20',
        'glass-dark': 'border-white/10 bg-black/20 backdrop-blur-xl shadow-glass-lg hover:shadow-glass-xl hover:bg-black/30',
        
        // Luxury Material Variants
        luxury: 'border-luxury-gold-200 bg-gradient-to-br from-white via-luxury-gold-50/30 to-luxury-gold-100/20 shadow-luxury-lg hover:shadow-luxury-xl',
        platinum: 'border-luxury-platinum-200 bg-gradient-to-br from-white via-luxury-platinum-50/30 to-luxury-platinum-100/20 shadow-lg hover:shadow-xl',
        diamond: 'border-luxury-diamond-200 bg-gradient-to-br from-white via-luxury-diamond-50/30 to-luxury-diamond-100/20 shadow-lg hover:shadow-xl',
        emerald: 'border-luxury-emerald-200 bg-gradient-to-br from-white via-luxury-emerald-50/30 to-luxury-emerald-100/20 shadow-lg hover:shadow-xl',
        
        // Neumorphism Variants
        neumorphism: 'bg-gray-100 border-0 shadow-neumorphism-light hover:shadow-neumorphism-dark',
        'neumorphism-dark': 'bg-gray-800 border-0 shadow-neumorphism-dark hover:shadow-neumorphism-light text-white',
        
        // Premium Gradient Variants
        sunset: 'border-0 bg-gradient-to-br from-luxury-gold-500/10 via-luxury-ruby-500/10 to-purple-500/10 shadow-lg hover:shadow-xl',
        ocean: 'border-0 bg-gradient-to-br from-luxury-diamond-500/10 via-luxury-emerald-500/10 to-luxury-gold-500/10 shadow-lg hover:shadow-xl',
        cosmic: 'border-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-luxury-gold-500/10 shadow-lg hover:shadow-xl',
        aurora: 'border-0 bg-gradient-to-br from-luxury-emerald-500/10 via-luxury-diamond-500/10 to-purple-500/10 shadow-lg hover:shadow-xl',
        
        // Holographic Effect
        holographic: 'border-0 bg-gradient-to-br from-luxury-gold-500/20 via-luxury-diamond-500/20 via-luxury-emerald-500/20 to-luxury-ruby-500/20 shadow-lg hover:shadow-xl animate-pulse',
        
        // Default
        default: 'border-slate-200 shadow-lg hover:shadow-xl',
      },
      size: {
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
        '2xl': 'p-12',
      },
      effect: {
        none: '',
        shimmer: 'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-1000',
        glow: 'hover:shadow-luxury-2xl hover:shadow-luxury-gold-500/25',
        float: 'hover:animate-float',
        pulse: 'hover:animate-pulse',
        bounce: 'hover:animate-bounce',
      }
    },
    defaultVariants: {
      variant: 'glass',
      size: 'default',
      effect: 'none',
    },
  }
)

export interface LuxuryCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof luxuryCardVariants> {
  asChild?: boolean
  interactive?: boolean
  gradient?: boolean
}

const LuxuryCard = React.forwardRef<HTMLDivElement, LuxuryCardProps>(
  ({ className, variant, size, effect, interactive = false, gradient = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        luxuryCardVariants({ variant, size, effect, className }),
        interactive && 'cursor-pointer hover:scale-105 active:scale-95',
        gradient && 'bg-gradient-to-br from-white/80 via-luxury-gold-50/50 to-luxury-diamond-50/50'
      )}
      {...props}
    />
  )
)
LuxuryCard.displayName = 'LuxuryCard'

const LuxuryCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { 
    icon?: React.ReactNode
    gradient?: boolean
  }
>(({ className, icon, gradient = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-col space-y-2 pb-6',
      gradient && 'bg-gradient-to-r from-luxury-gold-500/10 to-luxury-diamond-500/10 -m-6 mb-0 p-6 rounded-t-2xl',
      className
    )}
    {...props}
  />
))
LuxuryCardHeader.displayName = 'LuxuryCardHeader'

const LuxuryCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & { 
    icon?: React.ReactNode
    gradient?: boolean
    luxury?: boolean
  }
>(({ className, icon, gradient = false, luxury = false, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-2xl font-bold leading-tight tracking-tight flex items-center gap-3',
      luxury && 'bg-gradient-to-r from-luxury-gold-600 to-luxury-diamond-600 bg-clip-text text-transparent',
      gradient && 'bg-gradient-to-r from-luxury-gold-600 to-luxury-diamond-600 bg-clip-text text-transparent',
      className
    )}
    {...props}
  >
    {icon && (
      <span className={cn(
        'text-luxury-gold-500 group-hover:text-luxury-gold-600 transition-colors duration-300',
        luxury && 'text-luxury-gold-500',
        gradient && 'text-luxury-gold-500'
      )}>
        {icon}
      </span>
    )}
    {children}
  </h3>
))
LuxuryCardTitle.displayName = 'LuxuryCardTitle'

const LuxuryCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & { 
    gradient?: boolean
  }
>(({ className, gradient = false, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'text-sm text-slate-600 leading-relaxed',
      gradient && 'text-slate-700',
      className
    )}
    {...props}
  />
))
LuxuryCardDescription.displayName = 'LuxuryCardDescription'

const LuxuryCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('', className)} {...props} />
))
LuxuryCardContent.displayName = 'LuxuryCardContent'

const LuxuryCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { 
    gradient?: boolean
  }
>(({ className, gradient = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center pt-6',
      gradient && 'bg-gradient-to-r from-luxury-gold-500/5 to-luxury-diamond-500/5 -m-6 mt-0 p-6 rounded-b-2xl',
      className
    )}
    {...props}
  />
))
LuxuryCardFooter.displayName = 'LuxuryCardFooter'

export { 
  LuxuryCard, 
  LuxuryCardHeader, 
  LuxuryCardFooter, 
  LuxuryCardTitle, 
  LuxuryCardDescription, 
  LuxuryCardContent,
  luxuryCardVariants 
}
