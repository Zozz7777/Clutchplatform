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
  RefreshCw
} from 'lucide-react'

// Accessibility violation types
export interface AccessibilityViolation {
  id: string
  type: 'error' | 'warning' | 'info'
  category: 'color-contrast' | 'keyboard-navigation' | 'aria-labels' | 'form-labels' | 'focus-management'
  element: HTMLElement
  message: string
  suggestion: string
  severity: 'high' | 'medium' | 'low'
  wcagLevel: 'A' | 'AA' | 'AAA'
}

// Accessibility audit results
interface AuditResults {
  violations: AccessibilityViolation[]
  score: number
  totalElements: number
  passedChecks: number
  failedChecks: number
}

// Color contrast checker
const checkColorContrast = (element: HTMLElement): AccessibilityViolation[] => {
  const violations: AccessibilityViolation[] = []
  const styles = window.getComputedStyle(element)
  const color = styles.color
  const backgroundColor = styles.backgroundColor
  
  // Simple contrast check (in a real implementation, you'd use a proper contrast calculation)
  if (color === backgroundColor) {
    violations.push({
      id: `contrast-${Date.now()}`,
      type: 'error',
      category: 'color-contrast',
      element,
      message: 'Text and background colors are identical',
      suggestion: 'Use contrasting colors for text and background',
      severity: 'high',
      wcagLevel: 'AA'
    })
  }
  
  return violations
}

// Keyboard navigation checker
const checkKeyboardNavigation = (element: HTMLElement): AccessibilityViolation[] => {
  const violations: AccessibilityViolation[] = []
  
  // Check if interactive elements are keyboard accessible
  if (element.tagName === 'BUTTON' || element.tagName === 'A' || element.getAttribute('role') === 'button') {
    const tabIndex = element.getAttribute('tabindex')
    if (tabIndex === '-1') {
      violations.push({
        id: `keyboard-${Date.now()}`,
        type: 'error',
        category: 'keyboard-navigation',
        element,
        message: 'Interactive element is not keyboard accessible',
        suggestion: 'Remove tabindex="-1" or ensure element is accessible via keyboard',
        severity: 'high',
        wcagLevel: 'A'
      })
    }
  }
  
  // Check for focus indicators
  const hasFocusIndicator = element.style.outline !== 'none' || 
                           element.classList.contains('focus:outline-none') ||
                           element.classList.contains('focus:ring-2')
  
  if (!hasFocusIndicator && (element.tagName === 'BUTTON' || element.tagName === 'A' || element.getAttribute('role') === 'button')) {
    violations.push({
      id: `focus-${Date.now()}`,
      type: 'warning',
      category: 'keyboard-navigation',
      element,
      message: 'Interactive element lacks visible focus indicator',
      suggestion: 'Add focus:ring-2 or focus:outline-none with custom focus styles',
      severity: 'medium',
      wcagLevel: 'AA'
    })
  }
  
  return violations
}

// ARIA labels checker
const checkAriaLabels = (element: HTMLElement): AccessibilityViolation[] => {
  const violations: AccessibilityViolation[] = []
  
  // Check for missing ARIA labels on interactive elements
  if (element.tagName === 'BUTTON' && !element.getAttribute('aria-label') && !element.textContent?.trim()) {
    violations.push({
      id: `aria-${Date.now()}`,
      type: 'error',
      category: 'aria-labels',
      element,
      message: 'Button lacks accessible label',
      suggestion: 'Add aria-label or ensure button has visible text content',
      severity: 'high',
      wcagLevel: 'A'
    })
  }
  
  // Check for missing ARIA labels on form inputs
  if ((element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA') &&
      !element.getAttribute('aria-label') && 
      !element.getAttribute('aria-labelledby') &&
      !document.querySelector(`label[for="${element.id}"]`)) {
    violations.push({
      id: `form-aria-${Date.now()}`,
      type: 'error',
      category: 'aria-labels',
      element,
      message: 'Form input lacks accessible label',
      suggestion: 'Add aria-label, aria-labelledby, or associate with a label element',
      severity: 'high',
      wcagLevel: 'A'
    })
  }
  
  return violations
}

// Form labels checker
const checkFormLabels = (element: HTMLElement): AccessibilityViolation[] => {
  const violations: AccessibilityViolation[] = []
  
  if (element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA') {
    const hasLabel = element.getAttribute('aria-label') || 
                    element.getAttribute('aria-labelledby') ||
                    document.querySelector(`label[for="${element.id}"]`) ||
                    element.getAttribute('placeholder')
    
    if (!hasLabel) {
      violations.push({
        id: `form-label-${Date.now()}`,
        type: 'error',
        category: 'form-labels',
        element,
        message: 'Form input missing label',
        suggestion: 'Add a label element or aria-label attribute',
        severity: 'high',
        wcagLevel: 'A'
      })
    }
  }
  
  return violations
}

// Main accessibility audit function
const runAccessibilityAudit = (): AuditResults => {
  const violations: AccessibilityViolation[] = []
  const allElements = document.querySelectorAll('*')
  let passedChecks = 0
  let failedChecks = 0
  
  allElements.forEach((element) => {
    const htmlElement = element as HTMLElement
    
    // Run all checks
    const contrastViolations = checkColorContrast(htmlElement)
    const keyboardViolations = checkKeyboardNavigation(htmlElement)
    const ariaViolations = checkAriaLabels(htmlElement)
    const formViolations = checkFormLabels(htmlElement)
    
    const elementViolations = [
      ...contrastViolations,
      ...keyboardViolations,
      ...ariaViolations,
      ...formViolations
    ]
    
    violations.push(...elementViolations)
    
    if (elementViolations.length === 0) {
      passedChecks++
    } else {
      failedChecks++
    }
  })
  
  const totalChecks = passedChecks + failedChecks
  const score = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 100
  
  return {
    violations,
    score,
    totalElements: allElements.length,
    passedChecks,
    failedChecks
  }
}

// Accessibility audit component
export function AccessibilityAudit({ className = "" }: { className?: string }) {
  const [results, setResults] = useState<AuditResults | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const runAudit = useCallback(async () => {
    setIsRunning(true)
    try {
      // Simulate audit delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      const auditResults = runAccessibilityAudit()
      setResults(auditResults)
    } finally {
      setIsRunning(false)
    }
  }, [])

  const getViolationIcon = (type: AccessibilityViolation['type']) => {
    switch (type) {
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info': return <CheckCircle className="h-4 w-4 text-blue-500" />
    }
  }

  const getSeverityColor = (severity: AccessibilityViolation['severity']) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  const getCategoryIcon = (category: AccessibilityViolation['category']) => {
    switch (category) {
      case 'color-contrast': return <Eye className="h-4 w-4" />
      case 'keyboard-navigation': return <Keyboard className="h-4 w-4" />
      case 'aria-labels': return <Volume2 className="h-4 w-4" />
      case 'form-labels': return <MousePointer className="h-4 w-4" />
      case 'focus-management': return <Shield className="h-4 w-4" />
    }
  }

  const filteredViolations = selectedCategory 
    ? results?.violations.filter(v => v.category === selectedCategory) || []
    : results?.violations || []

  const categories = [
    { key: 'color-contrast', label: 'Color Contrast', icon: <Eye className="h-4 w-4" /> },
    { key: 'keyboard-navigation', label: 'Keyboard Navigation', icon: <Keyboard className="h-4 w-4" /> },
    { key: 'aria-labels', label: 'ARIA Labels', icon: <Volume2 className="h-4 w-4" /> },
    { key: 'form-labels', label: 'Form Labels', icon: <MousePointer className="h-4 w-4" /> },
    { key: 'focus-management', label: 'Focus Management', icon: <Shield className="h-4 w-4" /> }
  ]

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Accessibility Audit
        </CardTitle>
        <CardDescription>
          WCAG 2.1 AA compliance checker for the current page
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Audit Controls */}
          <div className="flex items-center justify-between">
            <Button onClick={runAudit} disabled={isRunning}>
              {isRunning ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Shield className="h-4 w-4 mr-2" />
              )}
              {isRunning ? 'Running Audit...' : 'Run Audit'}
            </Button>
            
            {results && (
              <div className="flex items-center gap-2">
                <Badge variant={results.score >= 90 ? 'default' : results.score >= 70 ? 'secondary' : 'destructive'}>
                  Score: {results.score}%
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {results.passedChecks} passed, {results.failedChecks} failed
                </span>
              </div>
            )}
          </div>

          {/* Results Summary */}
          {results && (
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">{results.passedChecks}</div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-red-600">{results.failedChecks}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{results.totalElements}</div>
                <div className="text-sm text-muted-foreground">Elements</div>
              </div>
            </div>
          )}

          {/* Category Filters */}
          {results && results.violations.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Filter by Category</h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                >
                  All ({results.violations.length})
                </Button>
                {categories.map(category => {
                  const count = results.violations.filter(v => v.category === category.key).length
                  return (
                    <Button
                      key={category.key}
                      variant={selectedCategory === category.key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category.key)}
                    >
                      {category.icon}
                      <span className="ml-1">{category.label} ({count})</span>
                    </Button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Violations List */}
          {results && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredViolations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {selectedCategory ? 'No violations in this category' : 'No accessibility violations found!'}
                </div>
              ) : (
                filteredViolations.map((violation) => (
                  <div
                    key={violation.id}
                    className={`p-3 border rounded-lg ${getSeverityColor(violation.severity)}`}
                  >
                    <div className="flex items-start gap-3">
                      {getViolationIcon(violation.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getCategoryIcon(violation.category)}
                          <span className="font-medium text-sm">{violation.message}</span>
                          <Badge variant="outline" className="text-xs">
                            WCAG {violation.wcagLevel}
                          </Badge>
                        </div>
                        <p className="text-sm opacity-90 mb-2">{violation.suggestion}</p>
                        <div className="text-xs opacity-75">
                          Element: {violation.element.tagName.toLowerCase()}
                          {violation.element.id && `#${violation.element.id}`}
                          {violation.element.className && `.${violation.element.className.split(' ').join('.')}`}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Quick accessibility fixes component
export function QuickAccessibilityFixes() {
  const applyQuickFixes = useCallback(() => {
    // Add focus indicators to buttons without them
    const buttons = document.querySelectorAll('button:not([class*="focus:"])')
    buttons.forEach(button => {
      if (!button.classList.contains('focus:ring-2')) {
        button.classList.add('focus:ring-2', 'focus:ring-blue-500', 'focus:outline-none')
      }
    })

    // Add aria-labels to buttons without text
    const buttonsWithoutText = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])')
    buttonsWithoutText.forEach(button => {
      if (!button.textContent?.trim()) {
        button.setAttribute('aria-label', 'Button')
      }
    })

    // Add skip links
    const skipLink = document.createElement('a')
    skipLink.href = '#main-content'
    skipLink.textContent = 'Skip to main content'
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md'
    document.body.insertBefore(skipLink, document.body.firstChild)

    // Add main landmark
    const main = document.querySelector('main')
    if (main && !main.id) {
      main.id = 'main-content'
    }
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Accessibility Fixes</CardTitle>
        <CardDescription>
          Apply common accessibility improvements automatically
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={applyQuickFixes} className="w-full">
          <Shield className="h-4 w-4 mr-2" />
          Apply Quick Fixes
        </Button>
      </CardContent>
    </Card>
  )
}
