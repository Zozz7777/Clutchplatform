'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { premiumDesignTokens } from '@/lib/premium-design-tokens'

const luxuryButtonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clutch-red-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-background active:scale-[0.98] relative overflow-hidden group',
  {
    variants: {
      variant: {
        // Clutch Brand Red Variants
        luxury: 'bg-gradient-to-r from-clutch-red-500 to-clutch-red-600 text-white shadow-luxury-lg hover:shadow-luxury-xl hover:from-clutch-red-600 hover:to-clutch-red-700 hover:scale-105 hover:shadow-2xl',
        'luxury-outline': 'border-2 border-clutch-red-500 bg-transparent text-clutch-red-600 hover:bg-clutch-red-50 hover:border-clutch-red-600 hover:text-clutch-red-700 hover:shadow-luxury-md',
        'luxury-ghost': 'text-clutch-red-600 hover:bg-clutch-red-50 hover:text-clutch-red-700 hover:shadow-luxury-sm',
        
        // Platinum Variants
        platinum: 'bg-gradient-to-r from-luxury-platinum-500 to-luxury-platinum-600 text-white shadow-lg hover:shadow-xl hover:from-luxury-platinum-600 hover:to-luxury-platinum-700 hover:scale-105',
        'platinum-outline': 'border-2 border-luxury-platinum-500 bg-transparent text-luxury-platinum-600 hover:bg-luxury-platinum-50 hover:border-luxury-platinum-600 hover:text-luxury-platinum-700',
        
        // Diamond Variants
        diamond: 'bg-gradient-to-r from-luxury-diamond-500 to-luxury-diamond-600 text-white shadow-lg hover:shadow-xl hover:from-luxury-diamond-600 hover:to-luxury-diamond-700 hover:scale-105',
        'diamond-outline': 'border-2 border-luxury-diamond-500 bg-transparent text-luxury-diamond-600 hover:bg-luxury-diamond-50 hover:border-luxury-diamond-600 hover:text-luxury-diamond-700',
        
        // Emerald Variants
        emerald: 'bg-gradient-to-r from-luxury-emerald-500 to-luxury-emerald-600 text-white shadow-lg hover:shadow-xl hover:from-luxury-emerald-600 hover:to-luxury-emerald-700 hover:scale-105',
        'emerald-outline': 'border-2 border-luxury-emerald-500 bg-transparent text-luxury-emerald-600 hover:bg-luxury-emerald-50 hover:border-luxury-emerald-600 hover:text-luxury-emerald-700',
        
        // Glassmorphism Variants
        glass: 'bg-glass-light backdrop-blur-md border border-glass-medium text-white shadow-glass-lg hover:bg-glass-medium hover:shadow-glass-xl hover:scale-105',
        'glass-dark': 'bg-glass-dark backdrop-blur-md border border-glass-darkMedium text-white shadow-glass-lg hover:bg-glass-darkMedium hover:shadow-glass-xl hover:scale-105',
        
        // Neumorphism Variants
        neumorphism: 'bg-gray-100 shadow-neumorphism-light hover:shadow-neumorphism-dark text-gray-700 hover:scale-105',
        'neumorphism-dark': 'bg-gray-800 shadow-neumorphism-dark hover:shadow-neumorphism-light text-gray-200 hover:scale-105',
        
        // Premium Gradient Variants
        sunset: 'bg-gradient-to-r from-luxury-gold-500 via-luxury-ruby-500 to-purple-500 text-white shadow-lg hover:shadow-xl hover:scale-105',
        ocean: 'bg-gradient-to-r from-luxury-diamond-500 via-luxury-emerald-500 to-luxury-gold-500 text-white shadow-lg hover:shadow-xl hover:scale-105',
        cosmic: 'bg-gradient-to-r from-purple-500 via-pink-500 to-luxury-gold-500 text-white shadow-lg hover:shadow-xl hover:scale-105',
        aurora: 'bg-gradient-to-r from-luxury-emerald-500 via-luxury-diamond-500 to-purple-500 text-white shadow-lg hover:shadow-xl hover:scale-105',
        
        // Destructive
        destructive: 'bg-gradient-to-r from-luxury-ruby-500 to-luxury-ruby-600 text-white shadow-lg hover:shadow-xl hover:from-luxury-ruby-600 hover:to-luxury-ruby-700 hover:scale-105',
        'destructive-outline': 'border-2 border-luxury-ruby-500 bg-transparent text-luxury-ruby-600 hover:bg-luxury-ruby-50 hover:border-luxury-ruby-600 hover:text-luxury-ruby-700',
      },
      size: {
        xs: 'h-7 px-3 text-xs rounded-lg',
        sm: 'h-8 px-4 text-sm rounded-lg',
        default: 'h-10 px-6 text-sm rounded-xl',
        lg: 'h-12 px-8 text-base rounded-xl',
        xl: 'h-14 px-10 text-lg rounded-2xl',
        '2xl': 'h-16 px-12 text-xl rounded-2xl',
        icon: 'h-10 w-10 rounded-xl',
        'icon-sm': 'h-8 w-8 rounded-lg',
        'icon-lg': 'h-12 w-12 rounded-xl',
        'icon-xl': 'h-14 w-14 rounded-2xl',
      },
    },
    defaultVariants: {
      variant: 'luxury',
      size: 'default',
    },
  }
)

export interface LuxuryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof luxuryButtonVariants> {
  asChild?: boolean
  loading?: boolean
  icon?: React.ReactNode
  shimmer?: boolean
  glow?: boolean
  float?: boolean
}

const LuxuryButton = React.forwardRef<HTMLButtonElement, LuxuryButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    loading = false, 
    children, 
    disabled, 
    icon, 
    shimmer = false,
    glow = false,
    float = false,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : 'button'
    
    return (
      <Comp
        className={cn(
          luxuryButtonVariants({ variant, size, className }),
          shimmer && 'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700',
          glow && 'animate-glow',
          float && 'animate-float'
        )}
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
            {icon && <span className="mr-2 group-hover:scale-110 transition-transform duration-200">{icon}</span>}
            <span className="relative z-10">{children}</span>
            {shimmer && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            )}
          </>
        )}
      </Comp>
    )
  }
)
LuxuryButton.displayName = 'LuxuryButton'

export { LuxuryButton, luxuryButtonVariants }
