/**
 * Integration Utilities
 * Helper functions for integrating new systems with existing code
 */

import { queryClient } from './react-query-setup'
import { SmartNavigationManager } from './smart-navigation'
import { PerformanceMonitor } from './performance-monitoring'
import { UserAnalytics } from './user-analytics'
import { OfflineManager } from './offline-support'

/**
 * Initialize all app systems
 */
export function initializeApp() {
  // Only initialize if we're in a browser environment
  if (typeof window === 'undefined') return
  
  // Initialize navigation tracking
  const navigationManager = SmartNavigationManager.getInstance()
  
  // Initialize performance monitoring
  const performanceMonitor = PerformanceMonitor.getInstance()
  
  // Initialize analytics
  const analytics = UserAnalytics.getInstance()
  
  // Track initial page load
  navigationManager.trackNavigation(window.location.pathname)
  
  // Global error handling is already set up in PerformanceMonitor
  // No need to duplicate error handling here
  
  console.log('App systems initialized successfully')
}

/**
 * Migrate existing data to new systems
 */
export function migrateExistingData() {
  // Only migrate if we're in a browser environment
  if (typeof window === 'undefined') return
  
  try {
    // Migrate existing navigation history
    const existingHistory = localStorage.getItem('navigationHistory')
    if (existingHistory) {
      const history = JSON.parse(existingHistory)
      const navigationManager = SmartNavigationManager.getInstance()
      
      history.forEach((item: any) => {
        navigationManager.trackNavigation(item.path, item.duration || 0)
      })
      
      // Remove old data
      localStorage.removeItem('navigationHistory')
    }
    
    // Migrate existing user preferences
    const existingPreferences = localStorage.getItem('userPreferences')
    if (existingPreferences) {
      const preferences = JSON.parse(existingPreferences)
      const navigationManager = SmartNavigationManager.getInstance()
      
      navigationManager.updateUserPreferences(preferences)
      
      // Remove old data
      localStorage.removeItem('userPreferences')
    }
    
    console.log('Data migration completed successfully')
  } catch (error) {
    console.error('Data migration failed:', error)
  }
}

/**
 * Set up service worker
 */
export function setupServiceWorker() {
  if (typeof window === 'undefined') return
  
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registered:', registration)
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error)
      })
  }
}

/**
 * Set up performance monitoring
 */
export function setupPerformanceMonitoring() {
  // PerformanceMonitor initializes itself in its constructor
  // No need to manually call private setup methods
  const performanceMonitor = PerformanceMonitor.getInstance()
  console.log('Performance monitoring initialized')
}

/**
 * Set up analytics
 */
export function setupAnalytics() {
  // UserAnalytics initializes itself in its constructor
  // No need to manually call private setup methods
  const analytics = UserAnalytics.getInstance()
  console.log('Analytics initialized')
}

/**
 * Set up offline support
 */
export function setupOfflineSupport() {
  // OfflineManager initializes itself in its constructor
  // No need to manually call setup methods
  const offlineManager = OfflineManager.getInstance()
  console.log('Offline support initialized')
}

/**
 * Set up accessibility
 */
export function setupAccessibility() {
  if (typeof window === 'undefined') return
  
  // Set up high contrast mode detection
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  
  const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
    if (e.matches) {
      document.documentElement.classList.add('reduce-motion')
    } else {
      document.documentElement.classList.remove('reduce-motion')
    }
  }
  
  mediaQuery.addEventListener('change', handleChange)
  handleChange(mediaQuery)
  
  // Set up keyboard navigation
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
      document.body.classList.add('keyboard-navigation')
    }
  })
  
  document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-navigation')
  })
}

/**
 * Set up responsive design
 */
export function setupResponsiveDesign() {
  if (typeof window === 'undefined') return
  
  // Set up viewport meta tag
  const viewport = document.querySelector('meta[name="viewport"]')
  if (!viewport) {
    const meta = document.createElement('meta')
    meta.name = 'viewport'
    meta.content = 'width=device-width, initial-scale=1.0'
    document.head.appendChild(meta)
  }
  
  // Set up responsive images
  const images = document.querySelectorAll('img')
  images.forEach(img => {
    if (!img.hasAttribute('loading')) {
      img.setAttribute('loading', 'lazy')
    }
  })
  
  // Set up responsive tables
  const tables = document.querySelectorAll('table')
  tables.forEach(table => {
    if (!table.hasAttribute('role')) {
      table.setAttribute('role', 'table')
    }
  })
}

/**
 * Set up error boundaries
 */
export function setupErrorBoundaries() {
  if (typeof window === 'undefined') return
  
  // Set up global error boundary
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error)
    
    // Send error to monitoring service
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'exception', {
        description: event.error?.message || 'Unknown error',
        fatal: false
      })
    }
  })
  
  // Set up unhandled promise rejection boundary
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
    
    // Send error to monitoring service
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'exception', {
        description: event.reason?.message || 'Unhandled promise rejection',
        fatal: false
      })
    }
  })
}

/**
 * Set up all app systems
 */
export function setupApp() {
  try {
    // Initialize core systems
    initializeApp()
    
    // Set up service worker
    setupServiceWorker()
    
    // Set up performance monitoring
    setupPerformanceMonitoring()
    
    // Set up analytics
    setupAnalytics()
    
    // Set up offline support
    setupOfflineSupport()
    
    // Set up accessibility
    setupAccessibility()
    
    // Set up responsive design
    setupResponsiveDesign()
    
    // Set up error boundaries
    setupErrorBoundaries()
    
    // Migrate existing data
    migrateExistingData()
    
    console.log('App setup completed successfully')
  } catch (error) {
    console.error('App setup failed:', error)
  }
}

const IntegrationUtils = {
  initializeApp,
  migrateExistingData,
  setupServiceWorker,
  setupPerformanceMonitoring,
  setupAnalytics,
  setupOfflineSupport,
  setupAccessibility,
  setupResponsiveDesign,
  setupErrorBoundaries,
  setupApp
}

export default IntegrationUtils
