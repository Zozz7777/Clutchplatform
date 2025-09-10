'use client'

import React, { forwardRef, useRef, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useMicroInteraction, useGestureSupport } from '@/lib/micro-interactions'
import { useAccessibility } from '@/lib/accessibility'

export interface AdvancedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  loadingText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  // Micro-interaction props
  ripple?: boolean
  magnetic?: boolean
  glow?: boolean
  bounce?: boolean
  scale?: boolean
  tilt?: boolean
  // Gesture support
  swipeActions?: {
    left?: { action: () => void; icon: React.ReactNode; label: string }
    right?: { action: () => void; icon: React.ReactNode; label: string }
  }
  // Accessibility
  ariaLabel?: string
  ariaDescribedBy?: string
}

export const AdvancedButton = forwardRef<HTMLButtonElement, AdvancedButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      loadingText,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ripple = true,
      magnetic = false,
      glow = false,
      bounce = false,
      scale = true,
      tilt = false,
      swipeActions,
      ariaLabel,
      ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const { isHovered, isFocused, isPressed, handlers } = useMicroInteraction()
    const { gestures, handlers: gestureHandlers } = useGestureSupport()
    const { announce } = useAccessibility()
    
    const buttonRef = useRef<HTMLButtonElement>(null)
    const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([])
    const [magneticOffset, setMagneticOffset] = useState({ x: 0, y: 0 })
    const [tiltAngle, setTiltAngle] = useState({ x: 0, y: 0 })

    // Combine refs
    const combinedRef = (node: HTMLButtonElement) => {
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node
      }
      if (buttonRef.current !== node) {
        (buttonRef as React.MutableRefObject<HTMLButtonElement | null>).current = node
      }
    }

    // Ripple effect
    const handleRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!ripple || loading || disabled) return

      const rect = buttonRef.current?.getBoundingClientRect()
      if (!rect) return

      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      const newRipple = { x, y, id: Date.now() }
      setRipples(prev => [...prev, newRipple])

      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id))
      }, 600)
    }

    // Magnetic effect
    useEffect(() => {
      if (!magnetic || !buttonRef.current) return

      const handleMouseMove = (event: MouseEvent) => {
        const rect = buttonRef.current?.getBoundingClientRect()
        if (!rect) return

        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2

        const deltaX = event.clientX - centerX
        const deltaY = event.clientY - centerY

        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
        const maxDistance = 100

        if (distance < maxDistance) {
          const strength = (maxDistance - distance) / maxDistance
          setMagneticOffset({
            x: deltaX * strength * 0.1,
            y: deltaY * strength * 0.1
          })
        } else {
          setMagneticOffset({ x: 0, y: 0 })
        }
      }

      const handleMouseLeave = () => {
        setMagneticOffset({ x: 0, y: 0 })
      }

      document.addEventListener('mousemove', handleMouseMove)
      buttonRef.current.addEventListener('mouseleave', handleMouseLeave)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        buttonRef.current?.removeEventListener('mouseleave', handleMouseLeave)
      }
    }, [magnetic])

    // Tilt effect
    useEffect(() => {
      if (!tilt || !buttonRef.current) return

      const handleMouseMove = (event: MouseEvent) => {
        const rect = buttonRef.current?.getBoundingClientRect()
        if (!rect) return

        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2

        const deltaX = event.clientX - centerX
        const deltaY = event.clientY - centerY

        const maxTilt = 15
        const tiltX = (deltaY / rect.height) * maxTilt
        const tiltY = (deltaX / rect.width) * maxTilt

        setTiltAngle({ x: tiltX, y: tiltY })
      }

      const handleMouseLeave = () => {
        setTiltAngle({ x: 0, y: 0 })
      }

      document.addEventListener('mousemove', handleMouseMove)
      buttonRef.current.addEventListener('mouseleave', handleMouseLeave)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        buttonRef.current?.removeEventListener('mouseleave', handleMouseLeave)
      }
    }, [tilt])

    // Swipe actions
    useEffect(() => {
      if (!swipeActions) return

      if (gestures.swipeLeft && swipeActions.left) {
        swipeActions.left.action()
        announce(swipeActions.left.label)
      }

      if (gestures.swipeRight && swipeActions.right) {
        swipeActions.right.action()
        announce(swipeActions.right.label)
      }
    }, [gestures, swipeActions, announce])

    // Variant styles
    const variantStyles = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-secondary',
      ghost: 'text-foreground hover:bg-accent hover:text-accent-foreground focus:ring-accent',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive'
    }

    // Size styles
    const sizeStyles = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-9 px-4 text-sm',
      lg: 'h-10 px-6 text-base'
    }

    // Interaction styles
    const interactionStyles = {
      scale: scale ? 'transform transition-transform duration-200' : '',
      bounce: bounce ? 'hover:animate-bounce' : '',
      glow: glow ? 'hover:shadow-lg hover:shadow-primary/25' : '',
      magnetic: magnetic ? 'transition-transform duration-200' : '',
      tilt: tilt ? 'transition-transform duration-200' : ''
    }

    // State styles
    const stateStyles = {
      pressed: isPressed ? 'scale-95' : '',
      hovered: isHovered ? 'shadow-md' : '',
      focused: isFocused ? 'ring-2 ring-offset-2' : ''
    }

    return (
      <button
        ref={combinedRef}
        type="button"
        className={cn(
          // Base styles
          'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all duration-200 focus:outline-none',
          // Variant styles
          variantStyles[variant],
          // Size styles
          sizeStyles[size],
          // Interaction styles
          interactionStyles.scale,
          interactionStyles.bounce,
          interactionStyles.glow,
          interactionStyles.magnetic,
          interactionStyles.tilt,
          // State styles
          stateStyles.pressed,
          stateStyles.hovered,
          stateStyles.focused,
          // Disabled state
          disabled && 'opacity-50 cursor-not-allowed',
          // Full width
          props.fullWidth && 'w-full',
          className
        )}
        disabled={disabled || loading}
        style={{
          transform: `
            translate(${magneticOffset.x}px, ${magneticOffset.y}px)
            rotateX(${tiltAngle.x}deg)
            rotateY(${tiltAngle.y}deg)
          `
        }}
        // ARIA attributes
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-disabled={disabled || loading}
        aria-busy={loading}
        // Event handlers
        onClick={(e) => {
          handleRipple(e)
          props.onClick?.(e)
        }}
        {...handlers}
        {...gestureHandlers}
        {...props}
      >
        {ripples.map(ripple => (
          <span
            key={ripple.id}
            className="absolute bg-white/30 rounded-full animate-ping pointer-events-none"
            style={{
              left: ripple.x - 10,
              top: ripple.y - 10,
              width: 20,
              height: 20
            }}
          />
        ))}
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
            {loadingText || 'Loading...'}
          </>
        ) : (
          <>
            {leftIcon && (
              <span className="flex-shrink-0" aria-hidden="true">
                {leftIcon}
              </span>
            )}
            {children}
            {rightIcon && (
              <span className="flex-shrink-0" aria-hidden="true">
                {rightIcon}
              </span>
            )}
          </>
        )}
        {swipeActions && (
          <>
            {swipeActions.left && (
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-red-500 text-white flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                {swipeActions.left.icon}
              </div>
            )}
            {swipeActions.right && (
              <div className="absolute right-0 top-0 bottom-0 w-12 bg-green-500 text-white flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                {swipeActions.right.icon}
              </div>
            )}
          </>
        )}
      </button>
    )
  }
)

AdvancedButton.displayName = 'AdvancedButton'

// Floating Action Button with advanced interactions
export interface FloatingActionButtonProps
  extends Omit<AdvancedButtonProps, 'size' | 'variant'> {
  icon: React.ReactNode
  'aria-label': string
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  expandable?: boolean
  expandedContent?: React.ReactNode
}

export const FloatingActionButton = forwardRef<HTMLButtonElement, FloatingActionButtonProps>(
  ({ 
    icon, 
    position = 'bottom-right', 
    expandable = false, 
    expandedContent,
    className,
    ...props 
  }, ref) => {
    const [isExpanded, setIsExpanded] = useState(false)

    const positionClasses = {
      'bottom-right': 'fixed bottom-6 right-6',
      'bottom-left': 'fixed bottom-6 left-6',
      'top-right': 'fixed top-6 right-6',
      'top-left': 'fixed top-6 left-6'
    }

    return (
      <div className="relative">
        <AdvancedButton
          ref={ref}
          variant="primary"
          size="lg"
          className={cn(
            positionClasses[position],
            'rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50',
            expandable && 'group',
            className
          )}
          onClick={(event) => {
            if (expandable) {
              setIsExpanded(!isExpanded)
            }
            props.onClick?.(event)
          }}
          {...props}
        >
          {icon}
        </AdvancedButton>
        {expandable && isExpanded && expandedContent && (
          <div className="absolute bottom-full right-0 mb-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[200px] z-40">
            {expandedContent}
          </div>
        )}
      </div>
    )
  }
)

FloatingActionButton.displayName = 'FloatingActionButton'

// Toggle Button with advanced interactions
export interface ToggleButtonProps
  extends Omit<AdvancedButtonProps, 'ariaPressed' | 'onToggle'> {
  pressed: boolean
  onToggle: (pressed: boolean) => void
  pressedText?: string
  unpressedText?: string
}

export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(
  ({ pressed, onToggle, pressedText, unpressedText, children, ...props }, ref) => {
    const { announce } = useAccessibility()

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      const newPressed = !pressed
      onToggle(newPressed)
      
      // Announce state change
      const announcement = newPressed 
        ? (pressedText || `${children} activated`)
        : (unpressedText || `${children} deactivated`)
      announce(announcement)
    }

    return (
      <AdvancedButton
        ref={ref}
        aria-pressed={pressed}
        onClick={handleClick}
        className={cn(
          pressed && 'bg-primary text-primary-foreground',
          !pressed && 'bg-gray-100 text-gray-700 hover:bg-gray-200',
          props.className
        )}
        {...props}
      >
        {children}
      </AdvancedButton>
    )
  }
)

ToggleButton.displayName = 'ToggleButton'

export default AdvancedButton
