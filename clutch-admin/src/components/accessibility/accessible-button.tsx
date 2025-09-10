'use client'

import React, { forwardRef, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useAccessibility, keyboardNavigation, screenReader } from '@/lib/accessibility'
import { useMicroInteraction } from '@/lib/micro-interactions'

export interface AccessibleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  loadingText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  // Accessibility props
  ariaLabel?: string
  ariaDescribedBy?: string
  ariaExpanded?: boolean
  ariaPressed?: boolean
  ariaControls?: string
  ariaHaspopup?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog'
  // Screen reader support
  srOnlyText?: string
  // Keyboard navigation
  onKeyDown?: (event: React.KeyboardEvent<HTMLButtonElement>) => void
  // Focus management
  autoFocus?: boolean
  focusOnMount?: boolean
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
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
      ariaLabel,
      ariaDescribedBy,
      ariaExpanded,
      ariaPressed,
      ariaControls,
      ariaHaspopup,
      srOnlyText,
      onKeyDown,
      autoFocus = false,
      focusOnMount = false,
      ...props
    },
    ref
  ) => {
    const { announce, generateId } = useAccessibility()
    const { isHovered, isFocused, isPressed, handlers } = useMicroInteraction()
    const buttonRef = useRef<HTMLButtonElement>(null)
    const buttonId = useRef(generateId('button'))

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

    // Auto focus on mount
    useEffect(() => {
      if (focusOnMount && buttonRef.current) {
        buttonRef.current.focus()
      }
    }, [focusOnMount])

    // Handle keyboard events
    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      // Standard button keyboard behavior
      if (event.key === keyboardNavigation.keys.ENTER || event.key === keyboardNavigation.keys.SPACE) {
        event.preventDefault()
        if (!disabled && !loading) {
          buttonRef.current?.click()
        }
      }

      // Custom keyboard handler
      onKeyDown?.(event)
    }

    // Handle click with accessibility announcements
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled) {
        event.preventDefault()
        return
      }

      // Announce action to screen readers
      if (loadingText) {
        announce(loadingText)
      } else if (ariaLabel) {
        announce(`${ariaLabel} activated`)
      } else if (typeof children === 'string') {
        announce(`${children} activated`)
      }

      props.onClick?.(event)
    }

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

    // Focus styles
    const focusStyles = 'focus:outline-none focus:ring-2 focus:ring-offset-2'

    // State styles
    const stateStyles = {
      disabled: 'opacity-50 cursor-not-allowed',
      loading: 'cursor-wait',
      pressed: 'scale-95',
      hovered: 'shadow-md'
    }

    return (
      <button
        ref={combinedRef}
        id={buttonId.current}
        type="button"
        className={cn(
          // Base styles
          'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all duration-200',
          // Variant styles
          variantStyles[variant],
          // Size styles
          sizeStyles[size],
          // Focus styles
          focusStyles,
          // State styles
          disabled && stateStyles.disabled,
          loading && stateStyles.loading,
          isPressed && stateStyles.pressed,
          isHovered && stateStyles.hovered,
          // Full width
          props.fullWidth && 'w-full',
          className
        )}
        disabled={disabled || loading}
        autoFocus={autoFocus}
        // ARIA attributes
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-expanded={ariaExpanded}
        aria-pressed={ariaPressed}
        aria-controls={ariaControls}
        aria-haspopup={ariaHaspopup}
        aria-disabled={disabled || loading}
        aria-busy={loading}
        // Event handlers
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...handlers}
        {...props}
      >
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
            {srOnlyText && (
              <span className="sr-only">{srOnlyText}</span>
            )}
            {rightIcon && (
              <span className="flex-shrink-0" aria-hidden="true">
                {rightIcon}
              </span>
            )}
          </>
        )}
      </button>
    )
  }
)

AccessibleButton.displayName = 'AccessibleButton'

// Accessible Icon Button
export interface AccessibleIconButtonProps
  extends Omit<AccessibleButtonProps, 'leftIcon' | 'rightIcon' | 'children'> {
  icon: React.ReactNode
  'aria-label': string
}

export const AccessibleIconButton = forwardRef<HTMLButtonElement, AccessibleIconButtonProps>(
  ({ icon, className, size = 'md', ...props }, ref) => {
    const sizeStyles = {
      sm: 'h-8 w-8',
      md: 'h-9 w-9',
      lg: 'h-10 w-10'
    }

    return (
      <AccessibleButton
        ref={ref}
        className={cn(sizeStyles[size], className)}
        size={size}
        {...props}
      >
        <span className="flex-shrink-0" aria-hidden="true">
          {icon}
        </span>
      </AccessibleButton>
    )
  }
)

AccessibleIconButton.displayName = 'AccessibleIconButton'

// Accessible Toggle Button
export interface AccessibleToggleButtonProps
  extends Omit<AccessibleButtonProps, 'ariaPressed' | 'onToggle'> {
  pressed: boolean
  onToggle: (pressed: boolean) => void
  pressedText?: string
  unpressedText?: string
}

export const AccessibleToggleButton = forwardRef<HTMLButtonElement, AccessibleToggleButtonProps>(
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
      <AccessibleButton
        ref={ref}
        aria-pressed={pressed}
        onClick={handleClick}
        {...props}
      >
        {children}
      </AccessibleButton>
    )
  }
)

AccessibleToggleButton.displayName = 'AccessibleToggleButton'

// Accessible Menu Button
export interface AccessibleMenuButtonProps
  extends Omit<AccessibleButtonProps, 'ariaExpanded' | 'ariaHaspopup' | 'onToggle'> {
  expanded: boolean
  onToggle: (expanded: boolean) => void
  menuId: string
}

export const AccessibleMenuButton = forwardRef<HTMLButtonElement, AccessibleMenuButtonProps>(
  ({ expanded, onToggle, menuId, children, ...props }, ref) => {
    const { announce } = useAccessibility()

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      const newExpanded = !expanded
      onToggle(newExpanded)
      
      // Announce menu state
      const announcement = newExpanded ? 'Menu opened' : 'Menu closed'
      announce(announcement)
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === keyboardNavigation.keys.ARROW_DOWN) {
        event.preventDefault()
        if (!expanded) {
          onToggle(true)
          announce('Menu opened')
        }
      } else if (event.key === keyboardNavigation.keys.ESCAPE) {
        if (expanded) {
          onToggle(false)
          announce('Menu closed')
        }
      }
    }

    return (
      <AccessibleButton
        ref={ref}
        aria-expanded={expanded}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </AccessibleButton>
    )
  }
)

AccessibleMenuButton.displayName = 'AccessibleMenuButton'

export default AccessibleButton
