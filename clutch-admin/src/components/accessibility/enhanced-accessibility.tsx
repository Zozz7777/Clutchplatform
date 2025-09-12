'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useAccessibility } from './accessibility-provider'

// Screen reader optimization
export function ScreenReaderOptimized({ 
  children, 
  announcement, 
  priority = 'polite' 
}: { 
  children: React.ReactNode
  announcement?: string
  priority?: 'polite' | 'assertive'
}) {
  const { announceMessage } = useAccessibility()
  const [hasAnnounced, setHasAnnounced] = useState(false)

  useEffect(() => {
    if (announcement && !hasAnnounced) {
      announceMessage(announcement, priority)
      setHasAnnounced(true)
    }
  }, [announcement, priority, hasAnnounced, announceMessage])

  return <>{children}</>
}

// Enhanced keyboard navigation
export function EnhancedKeyboardNavigation({ 
  children, 
  onNavigate 
}: { 
  children: React.ReactNode
  onNavigate?: (direction: 'up' | 'down' | 'left' | 'right') => void
}) {
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [items, setItems] = useState<HTMLElement[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  const registerItems = useCallback((newItems: HTMLElement[]) => {
    setItems(newItems)
  }, [])

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setFocusedIndex(prev => (prev + 1) % items.length)
        onNavigate?.('down')
        break
      case 'ArrowUp':
        event.preventDefault()
        setFocusedIndex(prev => (prev - 1 + items.length) % items.length)
        onNavigate?.('up')
        break
      case 'ArrowLeft':
        event.preventDefault()
        onNavigate?.('left')
        break
      case 'ArrowRight':
        event.preventDefault()
        onNavigate?.('right')
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
      case 'Escape':
        event.preventDefault()
        setFocusedIndex(-1)
        break
    }
  }, [items, focusedIndex, onNavigate])

  useEffect(() => {
    if (items[focusedIndex]) {
      items[focusedIndex].focus()
    }
  }, [focusedIndex, items])

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      role="list"
      aria-label="Keyboard navigable list"
    >
      {children}
    </div>
  )
}

// Color contrast checker
export function ColorContrastChecker() {
  const [contrastRatio, setContrastRatio] = useState<number | null>(null)
  const [isCompliant, setIsCompliant] = useState<boolean | null>(null)

  const checkContrast = useCallback((foreground: string, background: string) => {
    // Convert hex to RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null
    }

    // Calculate relative luminance
    const getLuminance = (r: number, g: number, b: number) => {
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      })
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
    }

    const fgRgb = hexToRgb(foreground)
    const bgRgb = hexToRgb(background)

    if (!fgRgb || !bgRgb) return

    const fgLuminance = getLuminance(fgRgb.r, fgRgb.g, fgRgb.b)
    const bgLuminance = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b)

    const ratio = (Math.max(fgLuminance, bgLuminance) + 0.05) / (Math.min(fgLuminance, bgLuminance) + 0.05)
    
    setContrastRatio(ratio)
    setIsCompliant(ratio >= 4.5) // WCAG AA standard
  }, [])

  return {
    contrastRatio,
    isCompliant,
    checkContrast
  }
}

// Focus management
export function FocusManager() {
  const [focusHistory, setFocusHistory] = useState<HTMLElement[]>([])
  const [currentFocus, setCurrentFocus] = useState<HTMLElement | null>(null)

  const saveFocus = useCallback((element: HTMLElement) => {
    setFocusHistory(prev => [...prev, element])
    setCurrentFocus(element)
  }, [])

  const restoreFocus = useCallback(() => {
    if (focusHistory.length > 0) {
      const lastFocus = focusHistory[focusHistory.length - 1]
      lastFocus?.focus()
      setCurrentFocus(lastFocus)
    }
  }, [focusHistory])

  const clearFocusHistory = useCallback(() => {
    setFocusHistory([])
    setCurrentFocus(null)
  }, [])

  return {
    currentFocus,
    saveFocus,
    restoreFocus,
    clearFocusHistory
  }
}

// ARIA live region for announcements
export function AriaLiveRegion({ 
  message, 
  priority = 'polite' 
}: { 
  message: string
  priority?: 'polite' | 'assertive'
}) {
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => {
    if (message) {
      setAnnouncement(message)
      // Clear after announcement
      const timer = setTimeout(() => setAnnouncement(''), 1000)
      return () => clearTimeout(timer)
    }
  }, [message])

  return (
    <div
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
      role="status"
    >
      {announcement}
    </div>
  )
}

// Skip links for keyboard navigation
export function SkipLinks() {
  const skipLinks = [
    { href: '#main-content', text: 'Skip to main content' },
    { href: '#navigation', text: 'Skip to navigation' },
    { href: '#search', text: 'Skip to search' }
  ]

  return (
    <div className="skip-links">
      {skipLinks.map((link, index) => (
        <a
          key={index}
          href={link.href}
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {link.text}
        </a>
      ))}
    </div>
  )
}

// High contrast mode toggle
export function HighContrastToggle() {
  const [isHighContrast, setIsHighContrast] = useState(false)

  const toggleHighContrast = useCallback(() => {
    const newState = !isHighContrast
    setIsHighContrast(newState)
    
    if (newState) {
      document.documentElement.classList.add('high-contrast')
    } else {
      document.documentElement.classList.remove('high-contrast')
    }
    
    localStorage.setItem('high-contrast', newState.toString())
  }, [isHighContrast])

  useEffect(() => {
    const saved = localStorage.getItem('high-contrast')
    if (saved === 'true') {
      setIsHighContrast(true)
      document.documentElement.classList.add('high-contrast')
    }
  }, [])

  return (
    <button
      onClick={toggleHighContrast}
      className="px-3 py-2 text-sm border border-slate-300 rounded-md hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label={isHighContrast ? 'Disable high contrast mode' : 'Enable high contrast mode'}
    >
      {isHighContrast ? 'High Contrast: ON' : 'High Contrast: OFF'}
    </button>
  )
}

// Font size controls
export function FontSizeControls() {
  const { fontSize, setFontSize } = useAccessibility()

  const increaseFontSize = useCallback(() => {
    const sizes = ['small', 'medium', 'large'] as const
    const currentIndex = sizes.indexOf(fontSize)
    if (currentIndex < sizes.length - 1) {
      setFontSize(sizes[currentIndex + 1])
    }
  }, [fontSize, setFontSize])

  const decreaseFontSize = useCallback(() => {
    const sizes = ['small', 'medium', 'large'] as const
    const currentIndex = sizes.indexOf(fontSize)
    if (currentIndex > 0) {
      setFontSize(sizes[currentIndex - 1])
    }
  }, [fontSize, setFontSize])

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={decreaseFontSize}
        className="px-2 py-1 text-sm border border-slate-300 rounded hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Decrease font size"
      >
        A-
      </button>
      <span className="text-sm font-medium">{fontSize}</span>
      <button
        onClick={increaseFontSize}
        className="px-2 py-1 text-sm border border-slate-300 rounded hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Increase font size"
      >
        A+
      </button>
    </div>
  )
}

// Accessibility toolbar
export function AccessibilityToolbar() {
  return (
    <div className="flex items-center gap-4 p-4 bg-slate-100 dark:bg-slate-800 border-b">
      <HighContrastToggle />
      <FontSizeControls />
      <div className="text-sm text-muted-foreground">
        Accessibility Tools
      </div>
    </div>
  )
}

// WCAG compliance checker
export function WCAGComplianceChecker() {
  const [violations, setViolations] = useState<Array<{
    type: string
    message: string
    element: HTMLElement
    severity: 'error' | 'warning' | 'info'
  }>>([])

  const checkCompliance = useCallback(() => {
    const newViolations: typeof violations = []

    // Check for missing alt text on images
    const images = document.querySelectorAll('img')
    images.forEach(img => {
      if (!img.alt && !img.getAttribute('aria-label')) {
        newViolations.push({
          type: 'missing-alt-text',
          message: 'Image missing alt text',
          element: img as HTMLElement,
          severity: 'error'
        })
      }
    })

    // Check for missing labels on form inputs
    const inputs = document.querySelectorAll('input, select, textarea')
    inputs.forEach(input => {
      const element = input as HTMLElement
      const hasLabel = element.getAttribute('aria-label') || 
                      element.getAttribute('aria-labelledby') ||
                      document.querySelector(`label[for="${element.id}"]`)
      
      if (!hasLabel) {
        newViolations.push({
          type: 'missing-label',
          message: 'Form input missing label',
          element,
          severity: 'error'
        })
      }
    })

    // Check for proper heading hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    let lastLevel = 0
    headings.forEach(heading => {
      const level = parseInt(heading.tagName.charAt(1))
      if (level > lastLevel + 1) {
        newViolations.push({
          type: 'heading-hierarchy',
          message: `Heading level ${level} should not follow level ${lastLevel}`,
          element: heading as HTMLElement,
          severity: 'warning'
        })
      }
      lastLevel = level
    })

    setViolations(newViolations)
  }, [])

  useEffect(() => {
    checkCompliance()
  }, [checkCompliance])

  return {
    violations,
    checkCompliance,
    hasErrors: violations.some(v => v.severity === 'error'),
    hasWarnings: violations.some(v => v.severity === 'warning')
  }
}

// Keyboard shortcuts manager
export function KeyboardShortcutsManager() {
  const [shortcuts, setShortcuts] = useState<Map<string, () => void>>(new Map())

  const registerShortcut = useCallback((key: string, callback: () => void) => {
    setShortcuts(prev => new Map(prev.set(key, callback)))
  }, [])

  const unregisterShortcut = useCallback((key: string) => {
    setShortcuts(prev => {
      const newMap = new Map(prev)
      newMap.delete(key)
      return newMap
    })
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = `${event.ctrlKey ? 'ctrl+' : ''}${event.altKey ? 'alt+' : ''}${event.shiftKey ? 'shift+' : ''}${event.key.toLowerCase()}`
      const callback = shortcuts.get(key)
      if (callback) {
        event.preventDefault()
        callback()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])

  return {
    registerShortcut,
    unregisterShortcut
  }
}

// Accessibility testing utilities
export const accessibilityTesting = {
  // Test keyboard navigation
  testKeyboardNavigation: () => {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    return {
      totalFocusable: focusableElements.length,
      elements: Array.from(focusableElements) as HTMLElement[]
    }
  },

  // Test color contrast
  testColorContrast: (element: HTMLElement) => {
    const styles = window.getComputedStyle(element)
    const color = styles.color
    const backgroundColor = styles.backgroundColor
    
    // This would need a proper contrast calculation implementation
    return {
      foreground: color,
      background: backgroundColor,
      ratio: 4.5 // Placeholder
    }
  },

  // Test ARIA attributes
  testAriaAttributes: () => {
    const elementsWithAria = document.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby]')
    return Array.from(elementsWithAria) as HTMLElement[]
  }
}
