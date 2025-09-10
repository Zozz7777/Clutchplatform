import React from 'react';

/**
 * Comprehensive Accessibility System
 * Features:
 * - ARIA labels and roles
 * - Keyboard navigation
 * - Screen reader support
 * - High contrast mode
 * - Focus management
 * - Accessibility testing utilities
 */

import { useEffect, useRef, useState, useCallback } from 'react'

// ARIA utilities
export const ariaUtils = {
  // Generate unique IDs for ARIA relationships
  generateId: (prefix: string = 'clutch') => `${prefix}-${Math.random().toString(36).substr(2, 9)}`,

  // ARIA roles
  roles: {
    button: 'button',
    link: 'link',
    menu: 'menu',
    menuitem: 'menuitem',
    dialog: 'dialog',
    alert: 'alert',
    alertdialog: 'alertdialog',
    banner: 'banner',
    complementary: 'complementary',
    contentinfo: 'contentinfo',
    form: 'form',
    main: 'main',
    navigation: 'navigation',
    region: 'region',
    search: 'search',
    tab: 'tab',
    tablist: 'tablist',
    tabpanel: 'tabpanel',
    tooltip: 'tooltip',
    progressbar: 'progressbar',
    slider: 'slider',
    switch: 'switch',
    checkbox: 'checkbox',
    radio: 'radio',
    textbox: 'textbox',
    combobox: 'combobox',
    listbox: 'listbox',
    option: 'option',
    tree: 'tree',
    treeitem: 'treeitem',
    grid: 'grid',
    gridcell: 'gridcell',
    row: 'row',
    columnheader: 'columnheader',
    rowheader: 'rowheader'
  },

  // ARIA states
  states: {
    expanded: 'aria-expanded',
    selected: 'aria-selected',
    checked: 'aria-checked',
    disabled: 'aria-disabled',
    hidden: 'aria-hidden',
    invalid: 'aria-invalid',
    required: 'aria-required',
    readonly: 'aria-readonly',
    pressed: 'aria-pressed',
    current: 'aria-current',
    live: 'aria-live',
    atomic: 'aria-atomic',
    relevant: 'aria-relevant',
    busy: 'aria-busy'
  },

  // ARIA properties
  properties: {
    label: 'aria-label',
    labelledby: 'aria-labelledby',
    describedby: 'aria-describedby',
    controls: 'aria-controls',
    owns: 'aria-owns',
    activedescendant: 'aria-activedescendant',
    flowto: 'aria-flowto',
    level: 'aria-level',
    posinset: 'aria-posinset',
    setsize: 'aria-setsize',
    sort: 'aria-sort',
    valuemin: 'aria-valuemin',
    valuemax: 'aria-valuemax',
    valuenow: 'aria-valuenow',
    valuetext: 'aria-valuetext',
    orientation: 'aria-orientation',
    autocomplete: 'aria-autocomplete',
    haspopup: 'aria-haspopup',
    modal: 'aria-modal',
    multiline: 'aria-multiline',
    multiselectable: 'aria-multiselectable',
    placeholder: 'aria-placeholder',
    readonly: 'aria-readonly',
    required: 'aria-required'
  }
}

// Keyboard navigation utilities
export const keyboardNavigation = {
  // Key codes
  keys: {
    ENTER: 'Enter',
    SPACE: ' ',
    ESCAPE: 'Escape',
    TAB: 'Tab',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    HOME: 'Home',
    END: 'End',
    PAGE_UP: 'PageUp',
    PAGE_DOWN: 'PageDown',
    DELETE: 'Delete',
    BACKSPACE: 'Backspace'
  },

  // Keyboard event handlers
  createKeyHandler: (keyMap: Record<string, () => void>) => {
    return (event: KeyboardEvent) => {
      const handler = keyMap[event.key]
      if (handler) {
        event.preventDefault()
        handler()
      }
    }
  },

  // Focus management
  focusManager: {
    // Trap focus within an element
    trapFocus: (element: HTMLElement) => {
      const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as NodeListOf<HTMLElement>

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus()
              e.preventDefault()
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus()
              e.preventDefault()
            }
          }
        }
      }

      element.addEventListener('keydown', handleTabKey)
      firstElement?.focus()

      return () => {
        element.removeEventListener('keydown', handleTabKey)
      }
    },

    // Restore focus to previous element
    restoreFocus: (previousElement: HTMLElement | null) => {
      if (previousElement) {
        previousElement.focus()
      }
    },

    // Get next focusable element
    getNextFocusable: (currentElement: HTMLElement) => {
      const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as NodeListOf<HTMLElement>

      const currentIndex = Array.from(focusableElements).indexOf(currentElement)
      return focusableElements[currentIndex + 1] || focusableElements[0]
    },

    // Get previous focusable element
    getPreviousFocusable: (currentElement: HTMLElement) => {
      const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as NodeListOf<HTMLElement>

      const currentIndex = Array.from(focusableElements).indexOf(currentElement)
      return focusableElements[currentIndex - 1] || focusableElements[focusableElements.length - 1]
    }
  }
}

// Screen reader utilities
export const screenReader = {
  // Announce text to screen readers
  announce: (text: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = text

    document.body.appendChild(announcement)

    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  },

  // Create screen reader only text
  srOnly: (text: string) => (
    <span className="sr-only">{text}</span>
  ),

  // Hide from screen readers
  hideFromScreenReader: (element: HTMLElement) => {
    element.setAttribute('aria-hidden', 'true')
  },

  // Show to screen readers
  showToScreenReader: (element: HTMLElement) => {
    element.removeAttribute('aria-hidden')
  }
}

// High contrast mode
export const highContrast = {
  // Check if high contrast mode is enabled
  isEnabled: () => {
    if (typeof window === 'undefined') return false
    
    // Check for Windows High Contrast Mode
    if (window.matchMedia('(-ms-high-contrast: active)').matches) {
      return true
    }

    // Check for forced colors
    if (window.matchMedia('(forced-colors: active)').matches) {
      return true
    }

    // Check for prefers-contrast
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      return true
    }

    return false
  },

  // Apply high contrast styles
  applyStyles: () => {
    const isHighContrast = highContrast.isEnabled()
    
    if (isHighContrast) {
      document.documentElement.classList.add('high-contrast')
    } else {
      document.documentElement.classList.remove('high-contrast')
    }

    return isHighContrast
  },

  // High contrast CSS variables
  cssVariables: {
    '--high-contrast-bg': '#000000',
    '--high-contrast-text': '#FFFFFF',
    '--high-contrast-border': '#FFFFFF',
    '--high-contrast-focus': '#FFFF00'
  }
}

// Focus management hook
export function useFocusManagement() {
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const setFocus = useCallback((element: HTMLElement | null) => {
    if (element) {
      previousFocusRef.current = focusedElement
      element.focus()
      setFocusedElement(element)
    }
  }, [focusedElement])

  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current) {
      previousFocusRef.current.focus()
      setFocusedElement(previousFocusRef.current)
    }
  }, [])

  const trapFocus = useCallback((container: HTMLElement) => {
    return keyboardNavigation.focusManager.trapFocus(container)
  }, [])

  return {
    focusedElement,
    setFocus,
    restoreFocus,
    trapFocus
  }
}

// Accessibility testing utilities
export const accessibilityTesting = {
  // Check color contrast ratio
  getContrastRatio: (color1: string, color2: string): number => {
    const getLuminance = (color: string): number => {
      const rgb = color.match(/\d+/g)
      if (!rgb) return 0

      const [r, g, b] = rgb.map(Number).map(c => {
        c = c / 255
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      })

      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }

    const luminance1 = getLuminance(color1)
    const luminance2 = getLuminance(color2)

    const lighter = Math.max(luminance1, luminance2)
    const darker = Math.min(luminance1, luminance2)

    return (lighter + 0.05) / (darker + 0.05)
  },

  // Check if color combination meets WCAG standards
  meetsWCAG: (color1: string, color2: string, level: 'AA' | 'AAA' = 'AA'): boolean => {
    const ratio = accessibilityTesting.getContrastRatio(color1, color2)
    return level === 'AA' ? ratio >= 4.5 : ratio >= 7
  },

  // Validate ARIA attributes
  validateARIA: (element: HTMLElement): string[] => {
    const errors: string[] = []

    // Check for required ARIA attributes
    if (element.getAttribute('role') === 'button' && !element.getAttribute('aria-label') && !element.textContent?.trim()) {
      errors.push('Button role requires aria-label or visible text')
    }

    if (element.getAttribute('role') === 'link' && !element.getAttribute('aria-label') && !element.textContent?.trim()) {
      errors.push('Link role requires aria-label or visible text')
    }

    // Check for invalid ARIA states
    const ariaExpanded = element.getAttribute('aria-expanded')
    if (ariaExpanded && !['true', 'false'].includes(ariaExpanded)) {
      errors.push('aria-expanded must be "true" or "false"')
    }

    const ariaSelected = element.getAttribute('aria-selected')
    if (ariaSelected && !['true', 'false'].includes(ariaSelected)) {
      errors.push('aria-selected must be "true" or "false"')
    }

    return errors
  },

  // Check keyboard accessibility
  checkKeyboardAccessibility: (element: HTMLElement): string[] => {
    const errors: string[] = []

    // Check if interactive elements are keyboard accessible
    if (element.tagName === 'DIV' && element.onclick) {
      errors.push('Clickable div should be a button or have proper keyboard support')
    }

    // Check for tabindex
    const tabIndex = element.getAttribute('tabindex')
    if (tabIndex && isNaN(Number(tabIndex))) {
      errors.push('tabindex must be a number')
    }

    return errors
  },

  // Run comprehensive accessibility audit
  audit: (element: HTMLElement): {
    errors: string[]
    warnings: string[]
    suggestions: string[]
  } => {
    const errors: string[] = []
    const warnings: string[] = []
    const suggestions: string[] = []

    // Check ARIA
    const ariaErrors = accessibilityTesting.validateARIA(element)
    errors.push(...ariaErrors)

    // Check keyboard accessibility
    const keyboardErrors = accessibilityTesting.checkKeyboardAccessibility(element)
    errors.push(...keyboardErrors)

    // Check color contrast
    const computedStyle = window.getComputedStyle(element)
    const backgroundColor = computedStyle.backgroundColor
    const color = computedStyle.color

    if (backgroundColor && color) {
      const contrastRatio = accessibilityTesting.getContrastRatio(backgroundColor, color)
      if (contrastRatio < 4.5) {
        warnings.push(`Low color contrast ratio: ${contrastRatio.toFixed(2)}`)
      }
    }

    // Check for missing alt text on images
    const images = element.querySelectorAll('img')
    images.forEach(img => {
      if (!img.alt && !img.getAttribute('aria-label')) {
        errors.push('Image missing alt text or aria-label')
      }
    })

    // Check for missing form labels
    const inputs = element.querySelectorAll('input, select, textarea')
    inputs.forEach(input => {
      const id = input.getAttribute('id')
      const ariaLabel = input.getAttribute('aria-label')
      const ariaLabelledby = input.getAttribute('aria-labelledby')
      
      if (!id && !ariaLabel && !ariaLabelledby) {
        errors.push('Form control missing label')
      }
    })

    return { errors, warnings, suggestions }
  }
}

// Accessibility hooks
export function useAccessibility() {
  const [isHighContrast, setIsHighContrast] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    // Check high contrast mode
    const checkHighContrast = () => {
      setIsHighContrast(highContrast.isEnabled())
    }

    // Check reduced motion preference
    const checkReducedMotion = () => {
      setPrefersReducedMotion(
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      )
    }

    checkHighContrast()
    checkReducedMotion()

    // Listen for changes
    const highContrastMedia = window.matchMedia('(-ms-high-contrast: active)')
    const reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)')

    highContrastMedia.addEventListener('change', checkHighContrast)
    reducedMotionMedia.addEventListener('change', checkReducedMotion)

    return () => {
      highContrastMedia.removeEventListener('change', checkHighContrast)
      reducedMotionMedia.removeEventListener('change', checkReducedMotion)
    }
  }, [])

  return {
    isHighContrast,
    prefersReducedMotion,
    announce: screenReader.announce,
    generateId: ariaUtils.generateId
  }
}

// Accessibility component wrapper
export function withAccessibility<P extends object>(
  Component: React.ComponentType<P>,
  accessibilityProps: {
    role?: string
    ariaLabel?: string
    ariaDescribedBy?: string
    tabIndex?: number
  }
) {
  return React.forwardRef<HTMLElement, P>((props, ref) => {
    const { generateId } = useAccessibility()
    const id = useRef(generateId())

    return (
      <Component
        {...(props as any)}
        ref={ref}
        role={accessibilityProps.role}
        aria-label={accessibilityProps.ariaLabel}
        aria-describedby={accessibilityProps.ariaDescribedBy}
        tabIndex={accessibilityProps.tabIndex}
        id={id.current}
      />
    )
  })
}

const Accessibility = {
  ariaUtils,
  keyboardNavigation,
  screenReader,
  highContrast,
  useFocusManagement,
  accessibilityTesting,
  useAccessibility,
  withAccessibility
}

export default Accessibility
