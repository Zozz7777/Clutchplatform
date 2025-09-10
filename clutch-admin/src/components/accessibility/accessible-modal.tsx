'use client'

import React, { forwardRef, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { useAccessibility, keyboardNavigation, screenReader } from '@/lib/accessibility'
import { useFocusManagement } from '@/lib/accessibility'
import { X } from 'lucide-react'

export interface AccessibleModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  showCloseButton?: boolean
  // Accessibility props
  ariaDescribedBy?: string
  ariaLabelledBy?: string
  // Focus management
  initialFocus?: React.RefObject<HTMLElement>
  returnFocus?: boolean
  // Animation
  animated?: boolean
  // Custom styling
  className?: string
  overlayClassName?: string
  contentClassName?: string
}

export const AccessibleModal = forwardRef<HTMLDivElement, AccessibleModalProps>(
  (
    {
      isOpen,
      onClose,
      title,
      children,
      size = 'md',
      closeOnOverlayClick = true,
      closeOnEscape = true,
      showCloseButton = true,
      ariaDescribedBy,
      ariaLabelledBy,
      initialFocus,
      returnFocus = true,
      animated = true,
      className,
      overlayClassName,
      contentClassName
    },
    ref
  ) => {
    const { announce, generateId } = useAccessibility()
    const { setFocus, restoreFocus, trapFocus } = useFocusManagement()
    const [isVisible, setIsVisible] = useState(false)
    const [isAnimating, setIsAnimating] = useState(false)
    
    const modalRef = useRef<HTMLDivElement>(null)
    const titleRef = useRef<HTMLHeadingElement>(null)
    const previousFocusRef = useRef<HTMLElement | null>(null)
    const modalId = useRef(generateId('modal'))
    const titleId = useRef(generateId('modal-title'))

    // Handle modal open/close
    useEffect(() => {
      if (isOpen) {
        // Store previous focus
        previousFocusRef.current = document.activeElement as HTMLElement
        
        // Show modal
        setIsVisible(true)
        setIsAnimating(true)
        
        // Announce modal opening
        announce(`Modal opened: ${title}`)
        
        // Set initial focus
        setTimeout(() => {
          if (initialFocus?.current) {
            setFocus(initialFocus.current)
          } else if (titleRef.current) {
            setFocus(titleRef.current)
          } else if (modalRef.current) {
            setFocus(modalRef.current)
          }
        }, 100)
        
        // Trap focus
        if (modalRef.current) {
          const cleanup = trapFocus(modalRef.current)
          return cleanup
        }
      } else {
        // Announce modal closing
        announce('Modal closed')
        
        // Restore focus
        if (returnFocus && previousFocusRef.current) {
          restoreFocus()
        }
        
        // Hide modal with animation
        if (animated) {
          setIsAnimating(false)
          setTimeout(() => {
            setIsVisible(false)
          }, 200)
        } else {
          setIsVisible(false)
        }
      }
    }, [isOpen, title, announce, setFocus, restoreFocus, trapFocus, initialFocus, returnFocus, animated])

    // Handle escape key
    useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (closeOnEscape && event.key === keyboardNavigation.keys.ESCAPE && isOpen) {
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

    // Handle close button click
    const handleCloseClick = () => {
      onClose()
    }

    // Size styles
    const sizeStyles = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      full: 'max-w-full mx-4'
    }

    // Animation styles
    const animationStyles = {
      overlay: {
        enter: 'transition-opacity duration-200 ease-out',
        enterFrom: 'opacity-0',
        enterTo: 'opacity-100',
        leave: 'transition-opacity duration-200 ease-in',
        leaveFrom: 'opacity-100',
        leaveTo: 'opacity-0'
      },
      content: {
        enter: 'transition-all duration-200 ease-out',
        enterFrom: 'opacity-0 scale-95 translate-y-4',
        enterTo: 'opacity-100 scale-100 translate-y-0',
        leave: 'transition-all duration-200 ease-in',
        leaveFrom: 'opacity-100 scale-100 translate-y-0',
        leaveTo: 'opacity-0 scale-95 translate-y-4'
      }
    }

    if (!isVisible) return null

    const modalContent = (
      <div
        ref={ref}
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center p-4',
          overlayClassName
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy || titleId.current}
        aria-describedby={ariaDescribedBy}
        onClick={handleOverlayClick}
      >
        <div
          className={cn(
            'absolute inset-0 bg-black/50 backdrop-blur-sm',
            animated && isAnimating && animationStyles.overlay.enter,
            animated && !isAnimating && animationStyles.overlay.leave,
            animated && isAnimating && animationStyles.overlay.enterTo,
            animated && !isAnimating && animationStyles.overlay.leaveTo
          )}
        />
        <div
          ref={modalRef}
          className={cn(
            'relative w-full bg-background rounded-lg shadow-lg',
            sizeStyles[size],
            animated && isAnimating && animationStyles.content.enter,
            animated && !isAnimating && animationStyles.content.leave,
            animated && isAnimating && animationStyles.content.enterTo,
            animated && !isAnimating && animationStyles.content.leaveTo,
            contentClassName
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2
              ref={titleRef}
              id={titleId.current}
              className="text-lg font-semibold text-foreground"
            >
              {title}
            </h2>
            
            {showCloseButton && (
              <button
                type="button"
                onClick={handleCloseClick}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className={cn('p-6', className)}>
            {children}
          </div>
        </div>
      </div>
    )

    // Render modal in portal
    return createPortal(modalContent, document.body)
  }
)

AccessibleModal.displayName = 'AccessibleModal'

// Accessible Alert Dialog
export interface AccessibleAlertDialogProps
  extends Omit<AccessibleModalProps, 'size' | 'closeOnOverlayClick'> {
  variant?: 'default' | 'destructive' | 'warning' | 'info'
  actions?: {
    primary: {
      label: string
      onClick: () => void
      loading?: boolean
    }
    secondary?: {
      label: string
      onClick: () => void
    }
  }
}

export const AccessibleAlertDialog = forwardRef<HTMLDivElement, AccessibleAlertDialogProps>(
  (
    {
      variant = 'default',
      actions,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const { announce } = useAccessibility()

    // Variant styles
    const variantStyles = {
      default: 'border-border',
      destructive: 'border-destructive',
      warning: 'border-yellow-500',
      info: 'border-blue-500'
    }

    const handlePrimaryAction = () => {
      actions?.primary.onClick()
      props.onClose()
    }

    const handleSecondaryAction = () => {
      actions?.secondary?.onClick()
      props.onClose()
    }

    return (
      <AccessibleModal
        ref={ref}
        size="sm"
        closeOnOverlayClick={false}
        className={cn(variantStyles[variant], className)}
        {...props}
      >
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            {children}
          </div>
          {actions && (
            <div className="flex justify-end gap-3">
              {actions.secondary && (
                <button
                  type="button"
                  onClick={handleSecondaryAction}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {actions.secondary.label}
                </button>
              )}
              <button
                type="button"
                onClick={handlePrimaryAction}
                disabled={actions.primary.loading}
                className={cn(
                  'px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors',
                  variant === 'destructive' 
                    ? 'bg-destructive hover:bg-destructive/90' 
                    : 'bg-primary hover:bg-primary/90',
                  actions.primary.loading && 'opacity-50 cursor-not-allowed'
                )}
              >
                {actions.primary.loading ? 'Loading...' : actions.primary.label}
              </button>
            </div>
          )}
        </div>
      </AccessibleModal>
    )
  }
)

AccessibleAlertDialog.displayName = 'AccessibleAlertDialog'

// Accessible Confirmation Dialog
export interface AccessibleConfirmationDialogProps
  extends Omit<AccessibleAlertDialogProps, 'actions'> {
  onConfirm: () => void
  onCancel: () => void
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'default' | 'destructive'
  loading?: boolean
}

export const AccessibleConfirmationDialog = forwardRef<HTMLDivElement, AccessibleConfirmationDialogProps>(
  (
    {
      onConfirm,
      onCancel,
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      confirmVariant = 'default',
      loading = false,
      ...props
    },
    ref
  ) => {
    const actions = {
      primary: {
        label: confirmText,
        onClick: onConfirm,
        loading
      },
      secondary: {
        label: cancelText,
        onClick: onCancel
      }
    }

    return (
      <AccessibleAlertDialog
        ref={ref}
        variant={confirmVariant === 'destructive' ? 'destructive' : 'default'}
        actions={actions}
        {...props}
      />
    )
  }
)

AccessibleConfirmationDialog.displayName = 'AccessibleConfirmationDialog'

export default AccessibleModal
