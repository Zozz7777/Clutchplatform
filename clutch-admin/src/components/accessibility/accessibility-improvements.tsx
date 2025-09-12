'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  Keyboard,
  Volume2,
  MousePointer,
  Shield,
  Settings,
  ToggleLeft,
  ToggleRight,
  Sun,
  Moon,
  Type,
  Contrast
} from 'lucide-react'

// Accessibility settings interface
interface AccessibilitySettings {
  highContrast: boolean
  largeText: boolean
  reducedMotion: boolean
  focusIndicators: boolean
  screenReader: boolean
  keyboardNavigation: boolean
}

// Accessibility improvements component
export function AccessibilityImprovements({ className = "" }: { className?: string }) {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    focusIndicators: true,
    screenReader: false,
    keyboardNavigation: true
  })

  const [isApplied, setIsApplied] = useState(false)

  // Apply accessibility settings
  const applySettings = useCallback((newSettings: AccessibilitySettings) => {
    const root = document.documentElement
    
    // High contrast mode
    if (newSettings.highContrast) {
      root.classList.add('high-contrast')
      root.style.setProperty('--foreground', '#000000')
      root.style.setProperty('--background', '#ffffff')
      root.style.setProperty('--primary', '#0000ff')
      root.style.setProperty('--secondary', '#808080')
    } else {
      root.classList.remove('high-contrast')
      root.style.removeProperty('--foreground')
      root.style.removeProperty('--background')
      root.style.removeProperty('--primary')
      root.style.removeProperty('--secondary')
    }

    // Large text mode
    if (newSettings.largeText) {
      root.classList.add('large-text')
      root.style.setProperty('--font-size-base', '18px')
      root.style.setProperty('--font-size-sm', '16px')
      root.style.setProperty('--font-size-lg', '20px')
    } else {
      root.classList.remove('large-text')
      root.style.removeProperty('--font-size-base')
      root.style.removeProperty('--font-size-sm')
      root.style.removeProperty('--font-size-lg')
    }

    // Reduced motion
    if (newSettings.reducedMotion) {
      root.classList.add('reduce-motion')
      root.style.setProperty('--animation-duration', '0.01ms')
      root.style.setProperty('--transition-duration', '0.01ms')
    } else {
      root.classList.remove('reduce-motion')
      root.style.removeProperty('--animation-duration')
      root.style.removeProperty('--transition-duration')
    }

    // Focus indicators
    if (newSettings.focusIndicators) {
      root.classList.add('focus-indicators')
      // Add focus styles to all interactive elements
      const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]')
      interactiveElements.forEach(element => {
        if (!element.classList.contains('focus:ring-2')) {
          element.classList.add('focus:ring-2', 'focus:ring-blue-500', 'focus:outline-none')
        }
      })
    } else {
      root.classList.remove('focus-indicators')
    }

    // Screen reader optimizations
    if (newSettings.screenReader) {
      root.classList.add('screen-reader-optimized')
      // Add ARIA landmarks
      const main = document.querySelector('main')
      if (main && !main.getAttribute('role')) {
        main.setAttribute('role', 'main')
      }
      
      const nav = document.querySelector('nav')
      if (nav && !nav.getAttribute('role')) {
        nav.setAttribute('role', 'navigation')
      }
    } else {
      root.classList.remove('screen-reader-optimized')
    }

    // Keyboard navigation
    if (newSettings.keyboardNavigation) {
      root.classList.add('keyboard-navigation')
      // Ensure all interactive elements are keyboard accessible
      const interactiveElements = document.querySelectorAll('button, a, input, select, textarea')
      interactiveElements.forEach(element => {
        if (element.getAttribute('tabindex') === '-1') {
          element.removeAttribute('tabindex')
        }
      })
    } else {
      root.classList.remove('keyboard-navigation')
    }

    setSettings(newSettings)
    setIsApplied(true)
    
    // Save to localStorage
    localStorage.setItem('accessibility-settings', JSON.stringify(newSettings))
  }, [])

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibility-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(parsed)
        applySettings(parsed)
      } catch (error) {
        console.error('Failed to load accessibility settings:', error)
      }
    }
  }, [applySettings])

  const toggleSetting = useCallback((key: keyof AccessibilitySettings) => {
    const newSettings = { ...settings, [key]: !settings[key] }
    applySettings(newSettings)
  }, [settings, applySettings])

  const resetSettings = useCallback(() => {
    const defaultSettings: AccessibilitySettings = {
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      focusIndicators: true,
      screenReader: false,
      keyboardNavigation: true
    }
    applySettings(defaultSettings)
  }, [applySettings])

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Accessibility Settings
        </CardTitle>
        <CardDescription>
          Customize the interface for better accessibility
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* High Contrast Mode */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Contrast className="h-5 w-5 text-blue-500" />
              <div>
                <div className="font-medium">High Contrast Mode</div>
                <div className="text-sm text-muted-foreground">
                  Increases color contrast for better visibility
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSetting('highContrast')}
              className="p-0"
            >
              {settings.highContrast ? (
                <ToggleRight className="h-6 w-6 text-blue-500" />
              ) : (
                <ToggleLeft className="h-6 w-6 text-slate-400" />
              )}
            </Button>
          </div>

          {/* Large Text Mode */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Type className="h-5 w-5 text-green-500" />
              <div>
                <div className="font-medium">Large Text Mode</div>
                <div className="text-sm text-muted-foreground">
                  Increases font size for better readability
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSetting('largeText')}
              className="p-0"
            >
              {settings.largeText ? (
                <ToggleRight className="h-6 w-6 text-green-500" />
              ) : (
                <ToggleLeft className="h-6 w-6 text-slate-400" />
              )}
            </Button>
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-purple-500" />
              <div>
                <div className="font-medium">Reduced Motion</div>
                <div className="text-sm text-muted-foreground">
                  Reduces animations and transitions
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSetting('reducedMotion')}
              className="p-0"
            >
              {settings.reducedMotion ? (
                <ToggleRight className="h-6 w-6 text-purple-500" />
              ) : (
                <ToggleLeft className="h-6 w-6 text-slate-400" />
              )}
            </Button>
          </div>

          {/* Focus Indicators */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Keyboard className="h-5 w-5 text-orange-500" />
              <div>
                <div className="font-medium">Enhanced Focus Indicators</div>
                <div className="text-sm text-muted-foreground">
                  Makes focus states more visible
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSetting('focusIndicators')}
              className="p-0"
            >
              {settings.focusIndicators ? (
                <ToggleRight className="h-6 w-6 text-orange-500" />
              ) : (
                <ToggleLeft className="h-6 w-6 text-slate-400" />
              )}
            </Button>
          </div>

          {/* Screen Reader Optimization */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Volume2 className="h-5 w-5 text-red-500" />
              <div>
                <div className="font-medium">Screen Reader Optimization</div>
                <div className="text-sm text-muted-foreground">
                  Adds ARIA landmarks and labels
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSetting('screenReader')}
              className="p-0"
            >
              {settings.screenReader ? (
                <ToggleRight className="h-6 w-6 text-red-500" />
              ) : (
                <ToggleLeft className="h-6 w-6 text-slate-400" />
              )}
            </Button>
          </div>

          {/* Keyboard Navigation */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <MousePointer className="h-5 w-5 text-indigo-500" />
              <div>
                <div className="font-medium">Keyboard Navigation</div>
                <div className="text-sm text-muted-foreground">
                  Ensures all elements are keyboard accessible
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSetting('keyboardNavigation')}
              className="p-0"
            >
              {settings.keyboardNavigation ? (
                <ToggleRight className="h-6 w-6 text-indigo-500" />
              ) : (
                <ToggleLeft className="h-6 w-6 text-slate-400" />
              )}
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={resetSettings} variant="outline" className="flex-1">
              <Settings className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
            {isApplied && (
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Applied
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Keyboard shortcuts help component
export function KeyboardShortcutsHelp({ className = "" }: { className?: string }) {
  const shortcuts = [
    { key: 'Tab', description: 'Navigate to next element' },
    { key: 'Shift + Tab', description: 'Navigate to previous element' },
    { key: 'Enter', description: 'Activate button or link' },
    { key: 'Space', description: 'Activate button or checkbox' },
    { key: 'Escape', description: 'Close modal or cancel action' },
    { key: 'Arrow Keys', description: 'Navigate within lists or menus' },
    { key: 'Home', description: 'Go to first item' },
    { key: 'End', description: 'Go to last item' },
    { key: 'Ctrl + K', description: 'Open global search' },
    { key: 'Alt + M', description: 'Open main menu' }
  ]

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Keyboard className="h-5 w-5" />
          Keyboard Shortcuts
        </CardTitle>
        <CardDescription>
          Essential keyboard shortcuts for navigation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between p-2 border rounded">
              <span className="text-sm">{shortcut.description}</span>
              <kbd className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 rounded border">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Color contrast checker component
export function ColorContrastChecker({ className = "" }: { className?: string }) {
  const [contrastRatio, setContrastRatio] = useState<number | null>(null)
  const [isCompliant, setIsCompliant] = useState<boolean | null>(null)
  const [foreground, setForeground] = useState('#000000')
  const [background, setBackground] = useState('#ffffff')

  const calculateContrast = useCallback((fg: string, bg: string) => {
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

    const fgRgb = hexToRgb(fg)
    const bgRgb = hexToRgb(bg)

    if (!fgRgb || !bgRgb) return

    const fgLuminance = getLuminance(fgRgb.r, fgRgb.g, fgRgb.b)
    const bgLuminance = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b)

    const ratio = (Math.max(fgLuminance, bgLuminance) + 0.05) / (Math.min(fgLuminance, bgLuminance) + 0.05)
    
    setContrastRatio(ratio)
    setIsCompliant(ratio >= 4.5) // WCAG AA standard
  }, [])

  useEffect(() => {
    calculateContrast(foreground, background)
  }, [foreground, background, calculateContrast])

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Contrast className="h-5 w-5" />
          Color Contrast Checker
        </CardTitle>
        <CardDescription>
          Check if your color combinations meet WCAG standards
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Color Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Foreground Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={foreground}
                  onChange={(e) => setForeground(e.target.value)}
                  className="w-12 h-8 border rounded"
                />
                <input
                  type="text"
                  value={foreground}
                  onChange={(e) => setForeground(e.target.value)}
                  className="flex-1 px-2 py-1 border rounded text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Background Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  className="w-12 h-8 border rounded"
                />
                <input
                  type="text"
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  className="flex-1 px-2 py-1 border rounded text-sm"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div 
            className="p-4 rounded border text-center font-medium"
            style={{ 
              backgroundColor: background, 
              color: foreground 
            }}
          >
            Sample text with these colors
          </div>

          {/* Results */}
          {contrastRatio && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Contrast Ratio:</span>
                <span className="text-sm font-mono">{contrastRatio.toFixed(2)}:1</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">WCAG AA Compliance:</span>
                <Badge variant={isCompliant ? 'default' : 'destructive'}>
                  {isCompliant ? 'Pass' : 'Fail'}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Minimum ratio for normal text: 4.5:1
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
