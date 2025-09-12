'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useAccessibility } from '@/components/accessibility/accessibility-provider'

// Touch gesture support
export function TouchGestureHandler({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinch,
  onTap,
  onLongPress,
  swipeThreshold = 50,
  longPressDelay = 500
}: {
  children: React.ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onPinch?: (scale: number) => void
  onTap?: () => void
  onLongPress?: () => void
  swipeThreshold?: number
  longPressDelay?: number
}) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null)
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number; time: number } | null>(null)
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    const touchData = { x: touch.clientX, y: touch.clientY, time: Date.now() }
    setTouchStart(touchData)
    setTouchEnd(null)

    // Long press detection
    if (onLongPress) {
      const timer = setTimeout(() => {
        onLongPress()
      }, longPressDelay)
      setLongPressTimer(timer)
    }
  }, [onLongPress, longPressDelay])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    setTouchEnd({ x: touch.clientX, y: touch.clientY, time: Date.now() })

    // Cancel long press if user moves
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
  }, [longPressTimer])

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }

    if (!touchStart || !touchEnd) return

    const deltaX = touchEnd.x - touchStart.x
    const deltaY = touchEnd.y - touchStart.y
    const deltaTime = touchEnd.time - touchStart.time

    // Determine if it's a swipe or tap
    if (Math.abs(deltaX) > swipeThreshold || Math.abs(deltaY) > swipeThreshold) {
      // It's a swipe
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0) {
          onSwipeRight?.()
        } else {
          onSwipeLeft?.()
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          onSwipeDown?.()
        } else {
          onSwipeUp?.()
        }
      }
    } else if (deltaTime < 300) {
      // It's a tap
      onTap?.()
    }

    setTouchStart(null)
    setTouchEnd(null)
  }, [touchStart, touchEnd, swipeThreshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onTap, longPressTimer])

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'pan-x pan-y' }}
    >
      {children}
    </div>
  )
}

// Mobile-specific UI components
export function MobileFriendlyButton({
  children,
  onClick,
  variant = 'primary',
  size = 'large',
  disabled = false,
  className = ''
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  className?: string
}) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors touch-manipulation'
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300 focus:ring-slate-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  }
  
  const sizeClasses = {
    small: 'px-3 py-2 text-sm min-h-[44px]',
    medium: 'px-4 py-3 text-base min-h-[48px]',
    large: 'px-6 py-4 text-lg min-h-[52px]'
  }
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      aria-label={typeof children === 'string' ? children : undefined}
    >
      {children}
    </button>
  )
}

// Mobile navigation drawer
export function MobileNavigationDrawer({
  isOpen,
  onClose,
  children
}: {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}) {
  const { isReducedMotion } = useAccessibility()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white dark:bg-slate-800 shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } ${isReducedMotion ? 'transition-none' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold">Navigation</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Close navigation menu"
            >
              ×
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}

// Mobile-optimized form inputs
export function MobileFormInput({
  label,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  placeholder,
  className = ''
}: {
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
  placeholder?: string
  className?: string
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`block w-full px-4 py-3 text-base border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400 ${error ? 'border-red-500' : ''}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${label}-error` : undefined}
      />
      {error && (
        <p id={`${label}-error`} className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

// Progressive Web App features
export function PWAFeatures() {
  const [isInstallable, setIsInstallable] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      console.log(`User response to the install prompt: ${outcome}`)
      setDeferredPrompt(null)
      setIsInstallable(false)
    }
  }

  return {
    isInstallable,
    handleInstall
  }
}

// Mobile performance optimization
export function MobilePerformanceOptimizer() {
  const [isSlowConnection, setIsSlowConnection] = useState(false)
  const [isLowMemory, setIsLowMemory] = useState(false)

  useEffect(() => {
    // Check connection speed
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      const isSlow = connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g'
      setIsSlowConnection(isSlow)
    }

    // Check memory
    if ('memory' in performance) {
      const memory = (performance as any).memory
      const isLow = memory.usedJSHeapSize / memory.jsHeapSizeLimit > 0.8
      setIsLowMemory(isLow)
    }
  }, [])

  return {
    isSlowConnection,
    isLowMemory,
    shouldReduceAnimations: isSlowConnection || isLowMemory,
    shouldLazyLoadImages: isSlowConnection,
    shouldReduceDataUsage: isSlowConnection
  }
}

// Mobile-specific layout
export function MobileLayout({
  children,
  header,
  footer
}: {
  children: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      {header && (
        <header className="sticky top-0 z-30 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          {header}
        </header>
      )}
      
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
      
      {footer && (
        <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
          {footer}
        </footer>
      )}
    </div>
  )
}

// Touch-friendly list
export function TouchFriendlyList({
  items,
  renderItem,
  onItemPress,
  className = ''
}: {
  items: any[]
  renderItem: (item: any, index: number) => React.ReactNode
  onItemPress?: (item: any, index: number) => void
  className?: string
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      {items.map((item, index) => (
        <TouchGestureHandler
          key={index}
          onTap={() => onItemPress?.(item, index)}
          swipeThreshold={30}
        >
          <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg active:bg-slate-50 dark:active:bg-slate-700 transition-colors">
            {renderItem(item, index)}
          </div>
        </TouchGestureHandler>
      ))}
    </div>
  )
}

// Mobile-optimized modal
export function MobileModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'full'
}: {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'small' | 'medium' | 'full'
}) {
  const { isReducedMotion } = useAccessibility()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const sizeClasses = {
    small: 'max-w-sm',
    medium: 'max-w-md',
    full: 'max-w-full h-full'
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <div
            className={`relative bg-white dark:bg-slate-800 rounded-lg shadow-lg w-full ${sizeClasses[size]} ${
              size === 'full' ? 'h-full' : 'max-h-[90vh] overflow-y-auto'
            } ${isReducedMotion ? '' : 'animate-in fade-in-0 zoom-in-95 duration-300'}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 id="modal-title" className="text-lg font-semibold">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Mobile-specific hooks
export function useMobileOptimization() {
  const [isMobile, setIsMobile] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    window.addEventListener('orientationchange', checkMobile)

    return () => {
      window.removeEventListener('resize', checkMobile)
      window.removeEventListener('orientationchange', checkMobile)
    }
  }, [])

  return {
    isMobile,
    isTouchDevice,
    orientation,
    shouldUseMobileLayout: isMobile,
    shouldUseTouchGestures: isTouchDevice
  }
}
