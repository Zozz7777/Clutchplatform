'use client'

import React, { forwardRef, useRef, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useAnimation, useTransition, animationPresets } from '@/lib/animation-system'
import { useAccessibility } from '@/lib/accessibility'

export interface AnimatedCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  // Animation props
  animation?: 'fadeIn' | 'slideInUp' | 'slideInDown' | 'slideInLeft' | 'slideInRight' | 'scaleIn' | 'bounceIn' | 'rotateIn' | 'elasticIn'
  delay?: number
  duration?: number
  stagger?: number
  // Hover animations
  hoverAnimation?: 'lift' | 'glow' | 'scale' | 'rotate' | 'tilt' | 'none'
  // Click animations
  clickAnimation?: 'bounce' | 'scale' | 'pulse' | 'none'
  // Visibility
  isVisible?: boolean
  // Accessibility
  ariaLabel?: string
  ariaDescribedBy?: string
}

export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  (
    {
      className,
      children,
      animation = 'fadeIn',
      delay = 0,
      duration,
      stagger = 0,
      hoverAnimation = 'lift',
      clickAnimation = 'scale',
      isVisible = true,
      ariaLabel,
      ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const { animate } = useAnimation()
    const { announce } = useAccessibility()
    const cardRef = useRef<HTMLDivElement>(null)
    const [isHovered, setIsHovered] = useState(false)
    const [isPressed, setIsPressed] = useState(false)
    const [hasAnimated, setHasAnimated] = useState(false)

    // Combine refs
    const combinedRef = (node: HTMLDivElement) => {
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
      }
      if (cardRef.current !== node) {
        (cardRef as React.MutableRefObject<HTMLDivElement | null>).current = node
      }
    }

    // Initial animation
    useEffect(() => {
      if (isVisible && !hasAnimated && cardRef.current) {
        const preset = animationPresets[animation]
        const animationOptions = {
          ...preset,
          config: {
            ...preset.config,
            duration: duration || preset.config.duration,
            delay: delay + stagger
          }
        }

        setTimeout(() => {
          animate(cardRef.current!, animationOptions)
          setHasAnimated(true)
        }, delay)
      }
    }, [isVisible, hasAnimated, animation, delay, duration, stagger, animate])

    // Hover animations
    const handleMouseEnter = () => {
      setIsHovered(true)
      if (hoverAnimation !== 'none' && cardRef.current) {
        const hoverPresets = {
          lift: { transform: 'translateY(-4px)', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' },
          glow: { boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' },
          scale: { transform: 'scale(1.02)' },
          rotate: { transform: 'rotate(1deg)' },
          tilt: { transform: 'perspective(1000px) rotateX(5deg) rotateY(5deg)' }
        }

        const hoverStyle = hoverPresets[hoverAnimation]
        if (hoverStyle) {
          animate(cardRef.current, {
            config: { duration: 200, easing: 'ease-out' },
            keyframes: [hoverStyle]
          })
        }
      }
    }

    const handleMouseLeave = () => {
      setIsHovered(false)
      if (hoverAnimation !== 'none' && cardRef.current) {
        animate(cardRef.current, {
          config: { duration: 200, easing: 'ease-out' },
          keyframes: [
            { transform: 'translateY(0) scale(1) rotate(0deg)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
          ]
        })
      }
    }

    // Click animations
    const handleMouseDown = () => {
      setIsPressed(true)
      if (clickAnimation !== 'none' && cardRef.current) {
        const clickPresets = {
          bounce: { transform: 'scale(0.95)' },
          scale: { transform: 'scale(0.98)' },
          pulse: { transform: 'scale(0.95)', opacity: 0.8 }
        }

        const clickStyle = clickPresets[clickAnimation]
        if (clickStyle) {
          animate(cardRef.current, {
            config: { duration: 100, easing: 'ease-out' },
            keyframes: [clickStyle]
          })
        }
      }
    }

    const handleMouseUp = () => {
      setIsPressed(false)
      if (clickAnimation !== 'none' && cardRef.current) {
        animate(cardRef.current, {
          config: { duration: 100, easing: 'ease-out' },
          keyframes: [
            { transform: 'scale(1)', opacity: 1 }
          ]
        })
      }
    }

    // Hover effect styles
    const hoverEffectStyles = {
      lift: isHovered ? 'transform -translate-y-1 shadow-lg' : '',
      glow: isHovered ? 'shadow-lg shadow-primary/25' : '',
      scale: isHovered ? 'transform scale-105' : '',
      rotate: isHovered ? 'transform rotate-1' : '',
      tilt: isHovered ? 'transform perspective-1000 rotate-x-1 rotate-y-1' : '',
      none: ''
    }

    // Press effect styles
    const pressEffectStyles = {
      pressed: isPressed ? 'transform scale-95' : ''
    }

    return (
      <div
        ref={combinedRef}
        className={cn(
          // Base styles
          'relative bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-200',
          // Hover effects
          hoverEffectStyles[hoverAnimation],
          // Press effects
          pressEffectStyles.pressed,
          // Animation
          'transform transition-all duration-200',
          className
        )}
        // ARIA attributes
        role="button"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        // Event handlers
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        {...props}
      >
        {children}
      </div>
    )
  }
)

AnimatedCard.displayName = 'AnimatedCard'

// Animated List Item
export interface AnimatedListItemProps
  extends Omit<AnimatedCardProps, 'animation' | 'hoverAnimation' | 'clickAnimation'> {
  index: number
  totalItems: number
  onRemove?: () => void
  onEdit?: () => void
}

export const AnimatedListItem = forwardRef<HTMLDivElement, AnimatedListItemProps>(
  ({ index, totalItems, onRemove, onEdit, className, children, ...props }, ref) => {
    const { animate } = useAnimation()
    const [isRemoving, setIsRemoving] = useState(false)

    const handleRemove = () => {
      if (onRemove) {
        setIsRemoving(true)
        // Animate out before removing
        setTimeout(() => {
          onRemove()
        }, 300)
      }
    }

    const handleEdit = () => {
      if (onEdit) {
        onEdit()
      }
    }

    return (
      <AnimatedCard
        ref={ref}
        animation="slideInUp"
        delay={index * 50}
        hoverAnimation="lift"
        clickAnimation="scale"
        className={cn(
          'group',
          isRemoving && 'opacity-0 transform scale-95',
          className
        )}
        {...props}
      >
        <div className="p-4">
          {children}
        </div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex space-x-1">
            {onEdit && (
              <button
                onClick={handleEdit}
                className="p-1 text-gray-500 hover:text-blue-500 transition-colors"
                aria-label="Edit item"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {onRemove && (
              <button
                onClick={handleRemove}
                className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                aria-label="Remove item"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </AnimatedCard>
    )
  }
)

AnimatedListItem.displayName = 'AnimatedListItem'

// Animated Modal
export interface AnimatedModalProps
  extends Omit<AnimatedCardProps, 'animation' | 'hoverAnimation' | 'clickAnimation'> {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  showCloseButton?: boolean
}

export const AnimatedModal = forwardRef<HTMLDivElement, AnimatedModalProps>(
  ({
    isOpen,
    onClose,
    title,
    size = 'md',
    closeOnOverlayClick = true,
    closeOnEscape = true,
    showCloseButton = true,
    className,
    children,
    ...props
  }, ref) => {
    const { animate } = useAnimation()
    const modalRef = useRef<HTMLDivElement>(null)
    const overlayRef = useRef<HTMLDivElement>(null)

    // Size styles
    const sizeStyles = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      full: 'max-w-full mx-4'
    }

    // Handle modal open/close
    useEffect(() => {
      if (isOpen && modalRef.current && overlayRef.current) {
        // Animate overlay
        animate(overlayRef.current, {
          config: { duration: 200, easing: 'ease-out' },
          keyframes: [
            { opacity: 0 },
            { opacity: 1 }
          ]
        })

        // Animate modal
        animate(modalRef.current, {
          config: { duration: 300, easing: 'ease-out' },
          keyframes: [
            { transform: 'scale(0.9) translateY(-20px)', opacity: 0 },
            { transform: 'scale(1) translateY(0)', opacity: 1 }
          ]
        })
      }
    }, [isOpen, animate])

    // Handle escape key
    useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (closeOnEscape && event.key === 'Escape' && isOpen) {
          onClose()
        }
      }

      if (isOpen) {
        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
      }
    }, [isOpen, closeOnEscape, onClose])

    // Handle overlay click
    const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (closeOnOverlayClick && event.target === event.currentTarget) {
        onClose()
      }
    }

    if (!isOpen) return null

    return (
      <div
        ref={overlayRef}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={handleOverlayClick}
      >
        <div
          ref={modalRef}
          className={cn(
            'relative w-full bg-white rounded-lg shadow-lg',
            sizeStyles[size],
            className
          )}
          {...props}
        >
          {title && (
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label="Close modal"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    )
  }
)

AnimatedModal.displayName = 'AnimatedModal'

export default AnimatedCard
