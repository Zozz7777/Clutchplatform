'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface AccessibilityContextType {
  isHighContrast: boolean
  isReducedMotion: boolean
  fontSize: 'small' | 'medium' | 'large'
  setFontSize: (size: 'small' | 'medium' | 'large') => void
  announceMessage: (message: string, priority?: 'polite' | 'assertive') => void
  focusElement: (selector: string) => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return context
}

interface AccessibilityProviderProps {
  children: React.ReactNode
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [isHighContrast, setIsHighContrast] = useState(false)
  const [isReducedMotion, setIsReducedMotion] = useState(false)
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium')

  // Detect system preferences
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check for high contrast mode
    const checkHighContrast = () => {
      const mediaQuery = window.matchMedia('(prefers-contrast: high)')
      setIsHighContrast(mediaQuery.matches)
    }

    // Check for reduced motion
    const checkReducedMotion = () => {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      setIsReducedMotion(mediaQuery.matches)
    }

    // Initial checks
    checkHighContrast()
    checkReducedMotion()

    // Listen for changes
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)')
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    highContrastQuery.addEventListener('change', checkHighContrast)
    reducedMotionQuery.addEventListener('change', checkReducedMotion)

    return () => {
      highContrastQuery.removeEventListener('change', checkHighContrast)
      reducedMotionQuery.removeEventListener('change', checkReducedMotion)
    }
  }, [])

  // Apply accessibility styles
  useEffect(() => {
    const root = document.documentElement
    
    // Apply high contrast styles
    if (isHighContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    // Apply reduced motion styles
    if (isReducedMotion) {
      root.classList.add('reduced-motion')
    } else {
      root.classList.remove('reduced-motion')
    }

    // Apply font size
    root.classList.remove('font-small', 'font-medium', 'font-large')
    root.classList.add(`font-${fontSize}`)
  }, [isHighContrast, isReducedMotion, fontSize])

  // Announce messages to screen readers
  const announceMessage = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message

    document.body.appendChild(announcement)

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }

  // Focus element by selector
  const focusElement = (selector: string) => {
    const element = document.querySelector(selector) as HTMLElement
    if (element) {
      element.focus()
    }
  }

  const value: AccessibilityContextType = {
    isHighContrast,
    isReducedMotion,
    fontSize,
    setFontSize,
    announceMessage,
    focusElement
  }

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  )
}

// Keyboard navigation hook
export function useKeyboardNavigation() {
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [items, setItems] = useState<HTMLElement[]>([])

  const registerItems = (newItems: HTMLElement[]) => {
    setItems(newItems)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setFocusedIndex(prev => (prev + 1) % items.length)
        break
      case 'ArrowUp':
        event.preventDefault()
        setFocusedIndex(prev => (prev - 1 + items.length) % items.length)
        break
      case 'Home':
        event.preventDefault()
        setFocusedIndex(0)
        break
      case 'End':
        event.preventDefault()
        setFocusedIndex(items.length - 1)
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (items[focusedIndex]) {
          items[focusedIndex].click()
        }
        break
    }
  }

  useEffect(() => {
    if (items[focusedIndex]) {
      items[focusedIndex].focus()
    }
  }, [focusedIndex, items])

  return {
    focusedIndex,
    registerItems,
    handleKeyDown
  }
}

// Focus trap hook
export function useFocusTrap(isActive: boolean) {
  const containerRef = React.useRef<HTMLElement>(null)

  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    document.addEventListener('keydown', handleTabKey)
    firstElement?.focus()

    return () => {
      document.removeEventListener('keydown', handleTabKey)
    }
  }, [isActive])

  return containerRef
}

// Screen reader only text component
export function ScreenReaderOnly({ children }: { children: React.ReactNode }) {
  return (
    <span className="sr-only">
      {children}
    </span>
  )
}

// Skip link component
export function SkipLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {children}
    </a>
  )
}
