import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Smart Navigation System
 * Features:
 * - Predictive navigation
 * - Contextual user experience
 * - Personalized flows
 * - Breadcrumb management
 * - Navigation history
 * - Smart suggestions
 */

// Navigation types
export interface NavigationItem {
  id: string
  label: string
  path: string
  icon?: string
  category?: string
  weight?: number
  metadata?: Record<string, any>
}

export interface NavigationHistory {
  id: string
  path: string
  timestamp: Date
  duration: number
  userAgent: string
  referrer?: string
}

export interface NavigationContext {
  currentPath: string
  previousPath?: string
  userRole: string
  userPreferences: Record<string, any>
  deviceType: 'mobile' | 'tablet' | 'desktop'
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
  dayOfWeek: 'weekday' | 'weekend'
}

export interface SmartSuggestion {
  id: string
  type: 'recent' | 'frequent' | 'recommended' | 'contextual'
  item: NavigationItem
  confidence: number
  reason: string
}

// Smart navigation manager
export class SmartNavigationManager {
  private static instance: SmartNavigationManager
  private navigationHistory: NavigationHistory[] = []
  private userPreferences: Record<string, any> = {}
  private navigationItems: NavigationItem[] = []
  private currentContext: NavigationContext | null = null
  private suggestions: SmartSuggestion[] = []

  static getInstance(): SmartNavigationManager {
    if (!SmartNavigationManager.instance) {
      SmartNavigationManager.instance = new SmartNavigationManager()
    }
    return SmartNavigationManager.instance
  }

  constructor() {
    this.initializeNavigationItems()
    // Only load from localStorage if we're in a browser environment
    if (typeof window !== 'undefined') {
      this.loadNavigationHistory()
      this.loadUserPreferences()
    }
  }

  // Initialize navigation items
  private initializeNavigationItems() {
    this.navigationItems = [
      { id: 'dashboard', label: 'Dashboard', path: '/dashboard-consolidated', category: 'main', weight: 10 },
      { id: 'hr', label: 'HR Management', path: '/hr', category: 'management', weight: 8 },
      { id: 'finance', label: 'Finance', path: '/finance', category: 'management', weight: 8 },
      { id: 'crm', label: 'CRM', path: '/crm', category: 'business', weight: 7 },
      { id: 'partners', label: 'Partners', path: '/partners', category: 'business', weight: 6 },
      { id: 'fleet', label: 'Fleet Management', path: '/fleet', category: 'operations', weight: 7 },
      { id: 'analytics', label: 'Analytics', path: '/analytics', category: 'insights', weight: 6 },
      { id: 'settings', label: 'Settings', path: '/settings', category: 'system', weight: 3 },
      { id: 'help', label: 'Help & Support', path: '/help', category: 'support', weight: 2 }
    ]
  }

  // Load navigation history from localStorage
  private loadNavigationHistory() {
    if (typeof window === 'undefined') return
    
    try {
      const stored = localStorage.getItem('navigationHistory')
      if (stored) {
        this.navigationHistory = JSON.parse(stored).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }))
      }
    } catch (error) {
      console.error('Failed to load navigation history:', error)
      this.navigationHistory = []
    }
  }

  // Save navigation history to localStorage
  private saveNavigationHistory() {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem('navigationHistory', JSON.stringify(this.navigationHistory))
    } catch (error) {
      console.error('Failed to save navigation history:', error)
    }
  }

  // Load user preferences from localStorage
  private loadUserPreferences() {
    if (typeof window === 'undefined') return
    
    try {
      const stored = localStorage.getItem('userPreferences')
      if (stored) {
        this.userPreferences = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error)
      this.userPreferences = {}
    }
  }

  // Save user preferences to localStorage
  private saveUserPreferences() {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem('userPreferences', JSON.stringify(this.userPreferences))
    } catch (error) {
      console.error('Failed to save user preferences:', error)
    }
  }

  // Track navigation
  trackNavigation(path: string, duration: number = 0) {
    if (typeof window === 'undefined') return
    
    const historyItem: NavigationHistory = {
      id: `nav-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      path,
      timestamp: new Date(),
      duration,
      userAgent: navigator.userAgent,
      referrer: document.referrer
    }

    this.navigationHistory.unshift(historyItem)
    
    // Keep only last 100 navigation items
    if (this.navigationHistory.length > 100) {
      this.navigationHistory = this.navigationHistory.slice(0, 100)
    }

    this.saveNavigationHistory()
    this.updateContext(path)
    this.generateSuggestions()
  }

  // Update navigation context
  private updateContext(currentPath: string) {
    const previousPath = this.navigationHistory[1]?.path
    const userRole = this.userPreferences.role || 'user'
    const deviceType = this.getDeviceType()
    const timeOfDay = this.getTimeOfDay()
    const dayOfWeek = this.getDayOfWeek()

    this.currentContext = {
      currentPath,
      previousPath,
      userRole,
      userPreferences: this.userPreferences,
      deviceType,
      timeOfDay,
      dayOfWeek
    }
  }

  // Get device type
  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    if (typeof window === 'undefined') return 'desktop'
    
    const width = window.innerWidth
    if (width < 768) return 'mobile'
    if (width < 1024) return 'tablet'
    return 'desktop'
  }

  // Get time of day
  private getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours()
    if (hour >= 6 && hour < 12) return 'morning'
    if (hour >= 12 && hour < 17) return 'afternoon'
    if (hour >= 17 && hour < 22) return 'evening'
    return 'night'
  }

  // Get day of week
  private getDayOfWeek(): 'weekday' | 'weekend' {
    const day = new Date().getDay()
    return day >= 1 && day <= 5 ? 'weekday' : 'weekend'
  }

  // Generate smart suggestions
  private generateSuggestions() {
    const suggestions: SmartSuggestion[] = []

    // Recent navigation suggestions
    const recentPaths = this.navigationHistory
      .slice(0, 10)
      .map(item => item.path)
      .filter((path, index, array) => array.indexOf(path) === index)

    recentPaths.forEach(path => {
      const item = this.navigationItems.find(nav => nav.path === path)
      if (item) {
        suggestions.push({
          id: `recent-${item.id}`,
          type: 'recent',
          item,
          confidence: 0.8,
          reason: 'Recently visited'
        })
      }
    })

    // Frequent navigation suggestions
    const pathFrequency = this.navigationHistory.reduce((acc, item) => {
      acc[item.path] = (acc[item.path] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    Object.entries(pathFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .forEach(([path, count]) => {
        const item = this.navigationItems.find(nav => nav.path === path)
        if (item && count > 1) {
          suggestions.push({
            id: `frequent-${item.id}`,
            type: 'frequent',
            item,
            confidence: Math.min(0.9, 0.6 + (count * 0.1)),
            reason: `Visited ${count} times`
          })
        }
      })

    // Contextual suggestions
    if (this.currentContext) {
      const contextualSuggestions = this.getContextualSuggestions()
      suggestions.push(...contextualSuggestions)
    }

    // Recommended suggestions based on user role and preferences
    const recommendedSuggestions = this.getRecommendedSuggestions()
    suggestions.push(...recommendedSuggestions)

    // Sort by confidence and remove duplicates
    this.suggestions = suggestions
      .filter((suggestion, index, array) => 
        array.findIndex(s => s.item.id === suggestion.item.id) === index
      )
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10)
  }

  // Get contextual suggestions
  private getContextualSuggestions(): SmartSuggestion[] {
    if (!this.currentContext) return []

    const suggestions: SmartSuggestion[] = []
    const { currentPath, timeOfDay, dayOfWeek, userRole } = this.currentContext

    // Time-based suggestions
    if (timeOfDay === 'morning') {
      const morningItems = this.navigationItems.filter(item => 
        ['dashboard', 'analytics'].includes(item.id)
      )
      morningItems.forEach(item => {
        suggestions.push({
          id: `contextual-${item.id}`,
          type: 'contextual',
          item,
          confidence: 0.7,
          reason: 'Good for morning review'
        })
      })
    }

    // Role-based suggestions
    if (userRole === 'admin') {
      const adminItems = this.navigationItems.filter(item => 
        ['settings', 'analytics', 'fleet'].includes(item.id)
      )
      adminItems.forEach(item => {
        suggestions.push({
          id: `role-${item.id}`,
          type: 'contextual',
          item,
          confidence: 0.6,
          reason: 'Recommended for administrators'
        })
      })
    }

    // Path-based suggestions
    if (currentPath.includes('/hr')) {
      const hrRelatedItems = this.navigationItems.filter(item => 
        ['finance', 'analytics'].includes(item.id)
      )
      hrRelatedItems.forEach(item => {
        suggestions.push({
          id: `related-${item.id}`,
          type: 'contextual',
          item,
          confidence: 0.5,
          reason: 'Related to HR management'
        })
      })
    }

    return suggestions
  }

  // Get recommended suggestions
  private getRecommendedSuggestions(): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = []

    // High-weight items that haven't been visited recently
    const highWeightItems = this.navigationItems
      .filter(item => item.weight && item.weight >= 7)
      .filter(item => !this.navigationHistory.some(history => history.path === item.path))

    highWeightItems.forEach(item => {
      suggestions.push({
        id: `recommended-${item.id}`,
        type: 'recommended',
        item,
        confidence: 0.4,
        reason: 'Important feature you haven\'t explored'
      })
    })

    return suggestions
  }

  // Get smart suggestions
  getSuggestions(limit: number = 5): SmartSuggestion[] {
    return this.suggestions.slice(0, limit)
  }

  // Get navigation history
  getNavigationHistory(limit: number = 10): NavigationHistory[] {
    return this.navigationHistory.slice(0, limit)
  }

  // Get breadcrumbs for current path
  getBreadcrumbs(path: string): Array<{ label: string; path: string; active: boolean }> {
    const pathSegments = path.split('/').filter(segment => segment)
    const breadcrumbs: Array<{ label: string; path: string; active: boolean }> = []

    // Add home
    breadcrumbs.push({ label: 'Home', path: '/', active: false })

    // Build breadcrumbs from path segments
    let currentPath = ''
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const isLast = index === pathSegments.length - 1
      
      // Find navigation item for this path
      const navItem = this.navigationItems.find(item => item.path === currentPath)
      const label = navItem ? navItem.label : segment.charAt(0).toUpperCase() + segment.slice(1)
      
      breadcrumbs.push({
        label,
        path: currentPath,
        active: isLast
      })
    })

    return breadcrumbs
  }

  // Update user preferences
  updateUserPreferences(preferences: Record<string, any>) {
    this.userPreferences = { ...this.userPreferences, ...preferences }
    this.saveUserPreferences()
    this.generateSuggestions()
  }

  // Get user preferences
  getUserPreferences(): Record<string, any> {
    return { ...this.userPreferences }
  }

  // Get current context
  getCurrentContext(): NavigationContext | null {
    return this.currentContext
  }

  // Clear navigation history
  clearNavigationHistory() {
    this.navigationHistory = []
    this.saveNavigationHistory()
    this.generateSuggestions()
  }

  // Get navigation statistics
  getNavigationStats(): {
    totalVisits: number
    uniquePaths: number
    averageSessionDuration: number
    mostVisitedPath: string
    lastVisit: Date | null
  } {
    const totalVisits = this.navigationHistory.length
    const uniquePaths = new Set(this.navigationHistory.map(item => item.path)).size
    const averageSessionDuration = this.navigationHistory.reduce((sum, item) => sum + item.duration, 0) / totalVisits
    const pathFrequency = this.navigationHistory.reduce((acc, item) => {
      acc[item.path] = (acc[item.path] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const mostVisitedPath = Object.entries(pathFrequency).sort(([, a], [, b]) => b - a)[0]?.[0] || ''
    const lastVisit = this.navigationHistory[0]?.timestamp || null

    return {
      totalVisits,
      uniquePaths,
      averageSessionDuration,
      mostVisitedPath,
      lastVisit
    }
  }
}

// Smart navigation hook
export function useSmartNavigation() {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([])
  const [navigationHistory, setNavigationHistory] = useState<NavigationHistory[]>([])
  const [currentContext, setCurrentContext] = useState<NavigationContext | null>(null)
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ label: string; path: string; active: boolean }>>([])
  
  const manager = useRef(SmartNavigationManager.getInstance())

  useEffect(() => {
    // Initialize with current data
    setSuggestions(manager.current.getSuggestions())
    setNavigationHistory(manager.current.getNavigationHistory())
    setCurrentContext(manager.current.getCurrentContext())
    
    // Only access window.location if we're in a browser environment
    if (typeof window !== 'undefined') {
      setBreadcrumbs(manager.current.getBreadcrumbs(window.location.pathname))
      // Track current navigation
      manager.current.trackNavigation(window.location.pathname)
    }
  }, [])

  const trackNavigation = useCallback((path: string, duration: number = 0) => {
    manager.current.trackNavigation(path, duration)
    setSuggestions(manager.current.getSuggestions())
    setNavigationHistory(manager.current.getNavigationHistory())
    setCurrentContext(manager.current.getCurrentContext())
    setBreadcrumbs(manager.current.getBreadcrumbs(path))
  }, [])

  const updateUserPreferences = useCallback((preferences: Record<string, any>) => {
    manager.current.updateUserPreferences(preferences)
    setSuggestions(manager.current.getSuggestions())
    setCurrentContext(manager.current.getCurrentContext())
  }, [])

  const getNavigationStats = useCallback(() => {
    return manager.current.getNavigationStats()
  }, [])

  const clearNavigationHistory = useCallback(() => {
    manager.current.clearNavigationHistory()
    setSuggestions(manager.current.getSuggestions())
    setNavigationHistory(manager.current.getNavigationHistory())
  }, [])

  return {
    suggestions,
    navigationHistory,
    currentContext,
    breadcrumbs,
    trackNavigation,
    updateUserPreferences,
    getNavigationStats,
    clearNavigationHistory
  }
}

// Navigation context
export const NavigationContext = React.createContext<{
  manager: SmartNavigationManager
  suggestions: SmartSuggestion[]
  navigationHistory: NavigationHistory[]
  currentContext: NavigationContext | null
  breadcrumbs: Array<{ label: string; path: string; active: boolean }>
}>({
  manager: SmartNavigationManager.getInstance(),
  suggestions: [],
  navigationHistory: [],
  currentContext: null,
  breadcrumbs: []
})

// Navigation provider
export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const smartNavigation = useSmartNavigation()

  return (
    <NavigationContext.Provider
      value={{
        manager: SmartNavigationManager.getInstance(),
        ...smartNavigation
      }}
    >
      {children}
    </NavigationContext.Provider>
  )
}

const SmartNavigation = {
  SmartNavigationManager,
  useSmartNavigation,
  NavigationContext,
  NavigationProvider
}

export default SmartNavigation
