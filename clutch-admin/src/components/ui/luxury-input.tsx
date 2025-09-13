'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const luxuryInputVariants = cva(
  'flex w-full rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300',
  {
    variants: {
      variant: {
        // Glassmorphism Variants
        glass: 'border-white/20 bg-white/10 backdrop-blur-xl text-white placeholder:text-white/60 focus-visible:ring-clutch-red-500 focus-visible:border-clutch-red-500 hover:bg-white/20',
        'glass-dark': 'border-white/10 bg-black/20 backdrop-blur-xl text-white placeholder:text-white/60 focus-visible:ring-clutch-red-500 focus-visible:border-clutch-red-500 hover:bg-black/30',
        
        // Clutch Brand Material Variants
        luxury: 'border-clutch-red-200 bg-gradient-to-r from-white via-clutch-red-50/30 to-clutch-red-100/20 text-slate-900 placeholder:text-slate-500 focus-visible:ring-clutch-red-500 focus-visible:border-clutch-red-500 hover:from-clutch-red-50/50 hover:to-clutch-red-100/30',
        platinum: 'border-luxury-platinum-200 bg-gradient-to-r from-white via-luxury-platinum-50/30 to-luxury-platinum-100/20 text-slate-900 placeholder:text-slate-500 focus-visible:ring-luxury-platinum-500 focus-visible:border-luxury-platinum-500',
        diamond: 'border-luxury-diamond-200 bg-gradient-to-r from-white via-luxury-diamond-50/30 to-luxury-diamond-100/20 text-slate-900 placeholder:text-slate-500 focus-visible:ring-luxury-diamond-500 focus-visible:border-luxury-diamond-500',
        emerald: 'border-luxury-emerald-200 bg-gradient-to-r from-white via-luxury-emerald-50/30 to-luxury-emerald-100/20 text-slate-900 placeholder:text-slate-500 focus-visible:ring-luxury-emerald-500 focus-visible:border-luxury-emerald-500',
        
        // Neumorphism Variants
        neumorphism: 'bg-gray-100 border-0 shadow-neumorphism-light text-gray-700 placeholder:text-gray-500 focus-visible:ring-clutch-red-500 focus-visible:shadow-neumorphism-dark',
        'neumorphism-dark': 'bg-gray-800 border-0 shadow-neumorphism-dark text-gray-200 placeholder:text-gray-400 focus-visible:ring-clutch-red-500 focus-visible:shadow-neumorphism-light',
        
        // Premium Gradient Variants
        sunset: 'border-0 bg-gradient-to-r from-clutch-red-500/10 via-luxury-ruby-500/10 to-purple-500/10 text-slate-900 placeholder:text-slate-500 focus-visible:ring-clutch-red-500',
        ocean: 'border-0 bg-gradient-to-r from-luxury-diamond-500/10 via-luxury-emerald-500/10 to-clutch-red-500/10 text-slate-900 placeholder:text-slate-500 focus-visible:ring-luxury-diamond-500',
        cosmic: 'border-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-clutch-red-500/10 text-slate-900 placeholder:text-slate-500 focus-visible:ring-purple-500',
        aurora: 'border-0 bg-gradient-to-r from-luxury-emerald-500/10 via-luxury-diamond-500/10 to-purple-500/10 text-slate-900 placeholder:text-slate-500 focus-visible:ring-luxury-emerald-500',
        
        // Default
        default: 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-500 focus-visible:ring-clutch-red-500 focus-visible:border-clutch-red-500',
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-lg',
        default: 'h-10 px-4 text-sm rounded-xl',
        lg: 'h-12 px-6 text-base rounded-xl',
        xl: 'h-14 px-8 text-lg rounded-2xl',
      },
      effect: {
        none: '',
        glow: 'focus-visible:shadow-lg focus-visible:shadow-clutch-red-500/25',
        shimmer: 'relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] focus-visible:before:translate-x-[100%] before:transition-transform before:duration-700',
        float: 'hover:scale-105 focus-visible:scale-105',
      }
    },
    defaultVariants: {
      variant: 'luxury',
      size: 'default',
      effect: 'none',
    },
  }
)

export interface LuxuryInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  label?: string
  error?: string
  success?: string
  hint?: string
  variant?: 'glass' | 'glass-dark' | 'luxury' | 'platinum' | 'diamond' | 'emerald' | 'neumorphism' | 'neumorphism-dark' | 'sunset' | 'ocean' | 'cosmic' | 'aurora' | 'default'
  size?: 'sm' | 'default' | 'lg' | 'xl'
  effect?: 'none' | 'glow' | 'shimmer' | 'float'
}

const LuxuryInput = React.forwardRef<HTMLInputElement, LuxuryInputProps>(
  ({ 
    className, 
    variant, 
    size: inputSize, 
    effect,
    icon,
    iconPosition = 'left',
    label,
    error,
    success,
    hint,
    id,
    ...props 
  }, ref) => {
    const inputId = id || `luxury-input-${Math.random().toString(36).substr(2, 9)}`
    
    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={inputId}
            className="text-sm font-medium text-slate-700 flex items-center gap-2"
          >
            {label}
            {error && <span className="text-luxury-ruby-500">*</span>}
          </label>
        )}
        
        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
              {icon}
            </div>
          )}
          
          <input
            id={inputId}
            className={cn(
              luxuryInputVariants({ variant, size: inputSize || 'default', effect, className }),
              icon && iconPosition === 'left' && 'pl-10',
              icon && iconPosition === 'right' && 'pr-10',
              error && 'border-luxury-ruby-500 focus-visible:ring-luxury-ruby-500 focus-visible:border-luxury-ruby-500',
              success && 'border-luxury-emerald-500 focus-visible:ring-luxury-emerald-500 focus-visible:border-luxury-emerald-500'
            )}
            ref={ref}
            {...props}
          />
          
          {icon && iconPosition === 'right' && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400">
              {icon}
            </div>
          )}
        </div>
        
        {(error || success || hint) && (
          <div className="text-xs">
            {error && <p className="text-luxury-ruby-500 flex items-center gap-1">{error}</p>}
            {success && <p className="text-luxury-emerald-500 flex items-center gap-1">{success}</p>}
            {hint && !error && !success && <p className="text-slate-500">{hint}</p>}
          </div>
        )}
      </div>
    )
  }
)
LuxuryInput.displayName = 'LuxuryInput'

export { LuxuryInput, luxuryInputVariants }
