import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Micro-Interactions and Animation System
 * Features:
 * - Advanced micro-interactions
 * - Gesture support
 * - Loading states
 * - Hover effects
 * - Focus states
 * - Transition animations
 */

// Animation utilities
export const animations = {
  // Spring animations
  spring: {
    gentle: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bouncy: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    snappy: 'cubic-bezier(0.4, 0, 0.2, 1)',
    smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  },

  // Duration presets
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
    slower: 700
  },

  // Easing functions
  easing: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    linear: 'linear'
  }
}

// Micro-interaction hooks
export function useMicroInteraction() {
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleMouseEnter = useCallback(() => setIsHovered(true), [])
  const handleMouseLeave = useCallback(() => setIsHovered(false), [])
  const handleFocus = useCallback(() => setIsFocused(true), [])
  const handleBlur = useCallback(() => setIsFocused(false), [])
  const handleMouseDown = useCallback(() => setIsPressed(true), [])
  const handleMouseUp = useCallback(() => setIsPressed(false), [])
  const handlePressEnd = useCallback(() => setIsPressed(false), [])

  return {
    isHovered,
    isFocused,
    isPressed,
    isLoading,
    setIsLoading,
    handlers: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onFocus: handleFocus,
      onBlur: handleBlur,
      onMouseDown: handleMouseDown,
      onMouseUp: handleMouseUp
    }
  }
}

// Gesture support
export function useGestureSupport() {
  const [gestures, setGestures] = useState({
    swipeLeft: false,
    swipeRight: false,
    swipeUp: false,
    swipeDown: false,
    pinch: false,
    rotate: false
  })

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const touchEndRef = useRef<{ x: number; y: number; time: number } | null>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    }
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return

    const touch = e.changedTouches[0]
    touchEndRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    }

    const deltaX = touchEndRef.current.x - touchStartRef.current.x
    const deltaY = touchEndRef.current.y - touchStartRef.current.y
    const deltaTime = touchEndRef.current.time - touchStartRef.current.time

    // Minimum distance and maximum time for a swipe
    const minDistance = 50
    const maxTime = 300

    if (deltaTime < maxTime) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > minDistance) {
          setGestures(prev => ({
            ...prev,
            swipeLeft: deltaX < 0,
            swipeRight: deltaX > 0
          }))
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > minDistance) {
          setGestures(prev => ({
            ...prev,
            swipeUp: deltaY < 0,
            swipeDown: deltaY > 0
          }))
        }
      }
    }

    // Reset gestures after a short delay
    setTimeout(() => {
      setGestures({
        swipeLeft: false,
        swipeRight: false,
        swipeUp: false,
        swipeDown: false,
        pinch: false,
        rotate: false
      })
    }, 100)
  }, [])

  return {
    gestures,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd
    }
  }
}

// Loading states
export function useLoadingState() {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState('')

  const startLoading = useCallback((msg?: string) => {
    setIsLoading(true)
    setProgress(0)
    setMessage(msg || 'Loading...')
  }, [])

  const updateProgress = useCallback((value: number, msg?: string) => {
    setProgress(Math.min(Math.max(value, 0), 100))
    if (msg) setMessage(msg)
  }, [])

  const stopLoading = useCallback(() => {
    setIsLoading(false)
    setProgress(100)
    setTimeout(() => {
      setProgress(0)
      setMessage('')
    }, 500)
  }, [])

  return {
    isLoading,
    progress,
    message,
    startLoading,
    updateProgress,
    stopLoading
  }
}

// Hover effects
export const hoverEffects = {
  // Scale effect
  scale: {
    hover: 'transform scale-105',
    transition: 'transition-transform duration-200 ease-out'
  },

  // Lift effect
  lift: {
    hover: 'transform -translate-y-1 shadow-lg',
    transition: 'transition-all duration-200 ease-out'
  },

  // Glow effect
  glow: {
    hover: 'shadow-lg shadow-primary/25',
    transition: 'transition-shadow duration-200 ease-out'
  },

  // Rotate effect
  rotate: {
    hover: 'transform rotate-3',
    transition: 'transition-transform duration-200 ease-out'
  },

  // Pulse effect
  pulse: {
    hover: 'animate-pulse',
    transition: 'transition-all duration-200 ease-out'
  }
}

// Focus states
export const focusStates = {
  // Ring focus
  ring: 'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
  
  // Glow focus
  glow: 'focus:outline-none focus:shadow-lg focus:shadow-primary/25',
  
  // Border focus
  border: 'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary',
  
  // Scale focus
  scale: 'focus:outline-none focus:scale-105 focus:ring-2 focus:ring-primary focus:ring-offset-2'
}

// Transition animations
export const transitions = {
  // Fade transitions
  fade: {
    enter: 'transition-opacity duration-300 ease-out',
    enterFrom: 'opacity-0',
    enterTo: 'opacity-100',
    leave: 'transition-opacity duration-200 ease-in',
    leaveFrom: 'opacity-100',
    leaveTo: 'opacity-0'
  },

  // Slide transitions
  slide: {
    up: {
      enter: 'transition-transform duration-300 ease-out',
      enterFrom: 'transform translate-y-full',
      enterTo: 'transform translate-y-0',
      leave: 'transition-transform duration-200 ease-in',
      leaveFrom: 'transform translate-y-0',
      leaveTo: 'transform translate-y-full'
    },
    down: {
      enter: 'transition-transform duration-300 ease-out',
      enterFrom: 'transform -translate-y-full',
      enterTo: 'transform translate-y-0',
      leave: 'transition-transform duration-200 ease-in',
      leaveFrom: 'transform translate-y-0',
      leaveTo: 'transform -translate-y-full'
    },
    left: {
      enter: 'transition-transform duration-300 ease-out',
      enterFrom: 'transform -translate-x-full',
      enterTo: 'transform translate-x-0',
      leave: 'transition-transform duration-200 ease-in',
      leaveFrom: 'transform translate-x-0',
      leaveTo: 'transform -translate-x-full'
    },
    right: {
      enter: 'transition-transform duration-300 ease-out',
      enterFrom: 'transform translate-x-full',
      enterTo: 'transform translate-x-0',
      leave: 'transition-transform duration-200 ease-in',
      leaveFrom: 'transform translate-x-0',
      leaveTo: 'transform translate-x-full'
    }
  },

  // Scale transitions
  scale: {
    enter: 'transition-transform duration-300 ease-out',
    enterFrom: 'transform scale-95',
    enterTo: 'transform scale-100',
    leave: 'transition-transform duration-200 ease-in',
    leaveFrom: 'transform scale-100',
    leaveTo: 'transform scale-95'
  }
}

// Advanced loading components
export const LoadingStates = {
  // Spinner
  Spinner: ({ size = 'md', color = 'primary' }: { size?: 'sm' | 'md' | 'lg'; color?: string }) => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8'
    }

    return (
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-${color} ${sizeClasses[size]}`} />
    )
  },

  // Dots
  Dots: ({ count = 3, size = 'md' }: { count?: number; size?: 'sm' | 'md' | 'lg' }) => {
    const sizeClasses = {
      sm: 'h-1 w-1',
      md: 'h-2 w-2',
      lg: 'h-3 w-3'
    }

    return (
      <div className="flex space-x-1">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={`${sizeClasses[size]} bg-primary rounded-full animate-pulse`}
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    )
  },

  // Skeleton
  Skeleton: ({ width = '100%', height = '1rem', className = '' }: { width?: string; height?: string; className?: string }) => (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      style={{ width, height }}
    />
  ),

  // Progress bar
  ProgressBar: ({ progress = 0, animated = false }: { progress?: number; animated?: boolean }) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className={`bg-primary h-2 rounded-full transition-all duration-300 ${animated ? 'animate-pulse' : ''}`}
        style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
      />
    </div>
  )
}

// Micro-interaction components
export const MicroInteractionComponents = {
  // Hoverable card
  HoverableCard: ({ children, className = '', effect = 'lift' }: { children: React.ReactNode; className?: string; effect?: keyof typeof hoverEffects }) => {
    const { isHovered, handlers } = useMicroInteraction()
    
    return (
      <div
        className={`${className} ${hoverEffects[effect].transition} ${isHovered ? hoverEffects[effect].hover : ''}`}
        {...handlers}
      >
        {children}
      </div>
    )
  },

  // Clickable button with ripple effect
  RippleButton: ({ children, onClick, className = '' }: { children: React.ReactNode; onClick?: () => void; className?: string }) => {
    const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([])
    const buttonRef = useRef<HTMLButtonElement>(null)

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!buttonRef.current) return

      const rect = buttonRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const newRipple = { x, y, id: Date.now() }
      setRipples(prev => [...prev, newRipple])

      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id))
      }, 600)

      onClick?.()
    }

    return (
      <button
        ref={buttonRef}
        className={`relative overflow-hidden ${className}`}
        onClick={handleClick}
      >
        {children}
        {ripples.map(ripple => (
          <span
            key={ripple.id}
            className="absolute bg-white/30 rounded-full animate-ping"
            style={{
              left: ripple.x - 10,
              top: ripple.y - 10,
              width: 20,
              height: 20
            }}
          />
        ))}
      </button>
    )
  }
}

// Animation utilities
export const animationUtils = {
  // Stagger animation
  stagger: (index: number, delay: number = 100) => ({
    animationDelay: `${index * delay}ms`
  }),

  // Parallax effect
  parallax: (speed: number = 0.5) => ({
    transform: `translateY(${window.scrollY * speed}px)`
  }),

  // Intersection observer for animations
  useIntersectionObserver: (threshold: number = 0.1) => {
    const [isIntersecting, setIsIntersecting] = useState(false)
    const ref = useRef<HTMLElement>(null)

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          setIsIntersecting(entry.isIntersecting)
        },
        { threshold }
      )

      if (ref.current) {
        observer.observe(ref.current)
      }

      return () => {
        if (ref.current) {
          observer.unobserve(ref.current)
        }
      }
    }, [threshold])

    return { ref, isIntersecting }
  }
}

const MicroInteractions = {
  animations,
  useMicroInteraction,
  useGestureSupport,
  useLoadingState,
  hoverEffects,
  focusStates,
  transitions,
  LoadingStates,
  MicroInteractionComponents,
  animationUtils
}

export default MicroInteractions
