'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const snowModalVariants = cva(
  'fixed inset-0 z-50 flex items-center justify-center p-4',
  {
    variants: {
      variant: {
        default: '',
        centered: 'items-center justify-center',
        fullscreen: 'p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

const snowModalContentVariants = cva(
  'relative bg-white bg-white rounded-xl shadow-2xl border border-red-200/30 dark:border-red-800/30 transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'max-w-lg w-full max-h-[90vh] overflow-y-auto',
        centered: 'max-w-md w-full',
        fullscreen: 'w-full h-full rounded-none border-0',
        large: 'max-w-4xl w-full max-h-[90vh] overflow-y-auto',
        xlarge: 'max-w-7xl w-full max-h-[90vh] overflow-y-auto',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface SnowModalProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof snowModalVariants> {
  isOpen: boolean
  onClose: () => void
  contentVariant?: VariantProps<typeof snowModalContentVariants>['variant']
  showOverlay?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
}

const SnowModal = React.forwardRef<HTMLDivElement, SnowModalProps>(
  ({ 
    className, 
    variant, 
    contentVariant = 'default',
    isOpen, 
    onClose, 
    showOverlay = true, 
    closeOnOverlayClick = true,
    closeOnEscape = true,
    children, 
    ...props 
  }, ref) => {
    const modalRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && closeOnEscape) {
          onClose()
        }
      }

      if (isOpen) {
        document.addEventListener('keydown', handleEscape)
        document.body.style.overflow = 'hidden'
      }

      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.body.style.overflow = 'unset'
      }
    }, [isOpen, onClose, closeOnEscape])

    const handleOverlayClick = (e: React.MouseEvent) => {
      if (closeOnOverlayClick && e.target === e.currentTarget) {
        onClose()
      }
    }

    if (!isOpen) return null

    return (
      <div
        ref={ref}
        className={cn(snowModalVariants({ variant, className }))}
        {...props}
      >
        {showOverlay && (
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleOverlayClick}
          />
        )}
        <div
          ref={modalRef}
          className={cn(snowModalContentVariants({ variant: contentVariant }))}
        >
          {children}
        </div>
      </div>
    )
  }
)
SnowModal.displayName = 'SnowModal'

const SnowModalHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center justify-between p-6 pb-4 border-b border-red-200/30 dark:border-red-800/30', className)}
    {...props}
  />
))
SnowModalHeader.displayName = 'SnowModalHeader'

const SnowModalTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn('text-xl font-semibold text-slate-900 dark:text-slate-100', className)}
    {...props}
  />
))
SnowModalTitle.displayName = 'SnowModalTitle'

const SnowModalCloseButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'rounded-lg p-2 text-slate-500 hover:text-slate-700 text-slate-600 dark:hover:text-slate-200',
      'hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors',
      className
    )}
    {...props}
  >
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>
))
SnowModalCloseButton.displayName = 'SnowModalCloseButton'

const SnowModalContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6', className)} {...props} />
))
SnowModalContent.displayName = 'SnowModalContent'

const SnowModalFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center justify-end gap-3 p-6 pt-4 border-t border-red-200/30 dark:border-red-800/30', className)}
    {...props}
  />
))
SnowModalFooter.displayName = 'SnowModalFooter'

export {
  SnowModal,
  SnowModalHeader,
  SnowModalTitle,
  SnowModalCloseButton,
  SnowModalContent,
  SnowModalFooter,
  snowModalVariants,
  snowModalContentVariants,
}

