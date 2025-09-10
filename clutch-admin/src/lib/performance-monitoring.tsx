import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Comprehensive Performance Monitoring System
 * Features:
 * - Core Web Vitals monitoring
 * - Performance metrics tracking
 * - Error tracking and reporting
 * - User analytics
 * - Real-time performance dashboard
 */

// Performance metrics types
export interface PerformanceMetrics {
  // Core Web Vitals
  lcp: number | null // Largest Contentful Paint
  fid: number | null // First Input Delay
  cls: number | null // Cumulative Layout Shift
  fcp: number | null // First Contentful Paint
  ttfb: number | null // Time to First Byte
  
  // Custom metrics
  pageLoadTime: number | null
  domContentLoaded: number | null
  resourceLoadTime: number | null
  memoryUsage: number | null
  
  // User interactions
  clickLatency: number | null
  scrollLatency: number | null
  keyboardLatency: number | null
  
  // Network metrics
  networkLatency: number | null
  downloadSpeed: number | null
  uploadSpeed: number | null
}

export interface ErrorReport {
  id: string
  message: string
  stack: string
  url: string
  timestamp: Date
  userAgent: string
  userId?: string
  sessionId: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'javascript' | 'network' | 'resource' | 'user'
}

export interface UserAnalytics {
  userId?: string
  sessionId: string
  pageViews: number
  timeOnPage: number
  bounceRate: number
  conversionRate: number
  deviceInfo: {
    type: string
    os: string
    browser: string
    screen: string
  }
  location: {
    country: string
    region: string
    city: string
  }
}

// Performance monitoring class
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetrics = {
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null,
    pageLoadTime: null,
    domContentLoaded: null,
    resourceLoadTime: null,
    memoryUsage: null,
    clickLatency: null,
    scrollLatency: null,
    keyboardLatency: null,
    networkLatency: null,
    downloadSpeed: null,
    uploadSpeed: null
  }
  
  private errors: ErrorReport[] = []
  private analytics: UserAnalytics | null = null
  private listeners: Set<(metrics: PerformanceMetrics) => void> = new Set()
  private errorListeners: Set<(error: ErrorReport) => void> = new Set()
  private isInitialized = false

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  constructor() {
    this.initialize().catch(console.error)
  }

  private async initialize() {
    if (this.isInitialized) return
    
    this.isInitialized = true
    this.setupCoreWebVitals()
    this.setupCustomMetrics()
    this.setupErrorTracking()
    await this.setupUserAnalytics()
    this.setupNetworkMonitoring()
    this.setupMemoryMonitoring()
  }

  // Core Web Vitals monitoring
  private setupCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        this.metrics.lcp = lastEntry.startTime
        this.notifyListeners()
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          this.metrics.fid = entry.processingStart - entry.startTime
          this.notifyListeners()
        })
      })
      fidObserver.observe({ entryTypes: ['first-input'] })

      // Cumulative Layout Shift (CLS)
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
            this.metrics.cls = clsValue
            this.notifyListeners()
          }
        })
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })

      // First Contentful Paint (FCP)
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.fcp = entry.startTime
            this.notifyListeners()
          }
        })
      })
      fcpObserver.observe({ entryTypes: ['paint'] })
    }

    // Time to First Byte (TTFB)
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigation) {
        this.metrics.ttfb = navigation.responseStart - navigation.requestStart
        this.metrics.pageLoadTime = navigation.loadEventEnd - navigation.fetchStart
        this.metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart
        this.notifyListeners()
      }
    })
  }

  // Custom metrics setup
  private setupCustomMetrics() {
    // Resource load time
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const totalLoadTime = entries.reduce((sum, entry) => sum + entry.duration, 0)
        this.metrics.resourceLoadTime = totalLoadTime
        this.notifyListeners()
      })
      resourceObserver.observe({ entryTypes: ['resource'] })
    }

    // User interaction latency
    this.setupInteractionMonitoring()
  }

  // User interaction monitoring
  private setupInteractionMonitoring() {
    let clickStartTime = 0
    let scrollStartTime = 0
    let keyboardStartTime = 0

    // Click latency
    document.addEventListener('mousedown', () => {
      clickStartTime = performance.now()
    })

    document.addEventListener('mouseup', () => {
      if (clickStartTime > 0) {
        this.metrics.clickLatency = performance.now() - clickStartTime
        this.notifyListeners()
        clickStartTime = 0
      }
    })

    // Scroll latency
    document.addEventListener('scrollstart', () => {
      scrollStartTime = performance.now()
    })

    document.addEventListener('scrollend', () => {
      if (scrollStartTime > 0) {
        this.metrics.scrollLatency = performance.now() - scrollStartTime
        this.notifyListeners()
        scrollStartTime = 0
      }
    })

    // Keyboard latency
    document.addEventListener('keydown', () => {
      keyboardStartTime = performance.now()
    })

    document.addEventListener('keyup', () => {
      if (keyboardStartTime > 0) {
        this.metrics.keyboardLatency = performance.now() - keyboardStartTime
        this.notifyListeners()
        keyboardStartTime = 0
      }
    })
  }

  // Error tracking setup
  private setupErrorTracking() {
    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.reportError({
        message: event.message,
        stack: event.error?.stack || '',
        url: event.filename,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        sessionId: this.getSessionId(),
        severity: 'high',
        category: 'javascript'
      })
    })

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError({
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack || '',
        url: window.location.href,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        sessionId: this.getSessionId(),
        severity: 'medium',
        category: 'javascript'
      })
    })

    // Resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.reportError({
          message: `Failed to load resource: ${(event.target as any).src || (event.target as any).href}`,
          stack: '',
          url: window.location.href,
          timestamp: new Date(),
          userAgent: navigator.userAgent,
          sessionId: this.getSessionId(),
          severity: 'low',
          category: 'resource'
        })
      }
    }, true)
  }

  // User analytics setup
  private async setupUserAnalytics() {
    const sessionId = this.getSessionId()
    const userId = this.getUserId()
    
    this.analytics = {
      userId,
      sessionId,
      pageViews: 1,
      timeOnPage: 0,
      bounceRate: 0,
      conversionRate: 0,
      deviceInfo: this.getDeviceInfo(),
      location: await this.getLocation()
    }

    // Track page views
    this.trackPageView()

    // Track time on page
    this.trackTimeOnPage()
  }

  // Network monitoring
  private setupNetworkMonitoring() {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      
      if (connection) {
        this.metrics.downloadSpeed = connection.downlink
        this.metrics.uploadSpeed = connection.uplink
        this.metrics.networkLatency = connection.rtt
        this.notifyListeners()
      }
    }
  }

  // Memory monitoring
  private setupMemoryMonitoring() {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      
      setInterval(() => {
        this.metrics.memoryUsage = memory.usedJSHeapSize
        this.notifyListeners()
      }, 5000) // Check every 5 seconds
    }
  }

  // Error reporting
  private reportError(errorData: Omit<ErrorReport, 'id'>) {
    const error: ErrorReport = {
      ...errorData,
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }

    this.errors.push(error)
    this.notifyErrorListeners(error)

    // Send to monitoring service
    this.sendErrorReport(error)
  }

  // Send error report to monitoring service
  private async sendErrorReport(error: ErrorReport) {
    try {
      await fetch('/api/monitoring/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(error)
      })
    } catch (err) {
      console.error('Failed to send error report:', err)
    }
  }

  // Track page view
  private trackPageView() {
    if (this.analytics) {
      this.analytics.pageViews++
      this.sendAnalytics('page_view', {
        url: window.location.href,
        title: document.title,
        timestamp: new Date().toISOString()
      })
    }
  }

  // Track time on page
  private trackTimeOnPage() {
    const startTime = Date.now()
    
    window.addEventListener('beforeunload', () => {
      if (this.analytics) {
        this.analytics.timeOnPage = Date.now() - startTime
        this.sendAnalytics('time_on_page', {
          duration: this.analytics.timeOnPage,
          timestamp: new Date().toISOString()
        })
      }
    })
  }

  // Send analytics data
  private async sendAnalytics(event: string, data: any) {
    try {
      await fetch('/api/monitoring/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event,
          data,
          userId: this.analytics?.userId,
          sessionId: this.analytics?.sessionId,
          timestamp: new Date().toISOString()
        })
      })
    } catch (err) {
      console.error('Failed to send analytics:', err)
    }
  }

  // Utility methods
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('sessionId')
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('sessionId', sessionId)
    }
    return sessionId
  }

  private getUserId(): string | undefined {
    return localStorage.getItem('userId') || undefined
  }

  private getDeviceInfo() {
    return {
      type: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop',
      os: this.getOS(),
      browser: this.getBrowser(),
      screen: `${screen.width}x${screen.height}`
    }
  }

  private getOS(): string {
    const userAgent = navigator.userAgent
    if (userAgent.includes('Windows')) return 'Windows'
    if (userAgent.includes('Mac')) return 'macOS'
    if (userAgent.includes('Linux')) return 'Linux'
    if (userAgent.includes('Android')) return 'Android'
    if (userAgent.includes('iOS')) return 'iOS'
    return 'Unknown'
  }

  private getBrowser(): string {
    const userAgent = navigator.userAgent
    if (userAgent.includes('Chrome')) return 'Chrome'
    if (userAgent.includes('Firefox')) return 'Firefox'
    if (userAgent.includes('Safari')) return 'Safari'
    if (userAgent.includes('Edge')) return 'Edge'
    return 'Unknown'
  }

  private async getLocation() {
    try {
      const response = await fetch('https://ipapi.co/json/')
      const data = await response.json()
      return {
        country: data.country_name || 'Unknown',
        region: data.region || 'Unknown',
        city: data.city || 'Unknown'
      }
    } catch {
      return {
        country: 'Unknown',
        region: 'Unknown',
        city: 'Unknown'
      }
    }
  }

  // Public methods
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  getErrors(): ErrorReport[] {
    return [...this.errors]
  }

  getAnalytics(): UserAnalytics | null {
    return this.analytics
  }

  addMetricsListener(listener: (metrics: PerformanceMetrics) => void) {
    this.listeners.add(listener)
  }

  removeMetricsListener(listener: (metrics: PerformanceMetrics) => void) {
    this.listeners.delete(listener)
  }

  addErrorListener(listener: (error: ErrorReport) => void) {
    this.errorListeners.add(listener)
  }

  removeErrorListener(listener: (error: ErrorReport) => void) {
    this.errorListeners.delete(listener)
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.metrics))
  }

  private notifyErrorListeners(error: ErrorReport) {
    this.errorListeners.forEach(listener => listener(error))
  }

  // Custom event tracking
  trackEvent(event: string, data: any) {
    this.sendAnalytics(event, data)
  }

  // Performance score calculation
  calculatePerformanceScore(): number {
    const { lcp, fid, cls, fcp, ttfb } = this.metrics
    
    let score = 100
    
    // LCP scoring (0-100)
    if (lcp !== null) {
      if (lcp > 4000) score -= 30
      else if (lcp > 2500) score -= 15
    }
    
    // FID scoring (0-100)
    if (fid !== null) {
      if (fid > 300) score -= 25
      else if (fid > 100) score -= 10
    }
    
    // CLS scoring (0-100)
    if (cls !== null) {
      if (cls > 0.25) score -= 25
      else if (cls > 0.1) score -= 10
    }
    
    // FCP scoring (0-100)
    if (fcp !== null) {
      if (fcp > 3000) score -= 20
      else if (fcp > 1800) score -= 10
    }
    
    // TTFB scoring (0-100)
    if (ttfb !== null) {
      if (ttfb > 800) score -= 15
      else if (ttfb > 600) score -= 5
    }
    
    return Math.max(0, score)
  }
}

// Performance monitoring hook
export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null,
    pageLoadTime: null,
    domContentLoaded: null,
    resourceLoadTime: null,
    memoryUsage: null,
    clickLatency: null,
    scrollLatency: null,
    keyboardLatency: null,
    networkLatency: null,
    downloadSpeed: null,
    uploadSpeed: null
  })
  
  const [errors, setErrors] = useState<ErrorReport[]>([])
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null)
  const [performanceScore, setPerformanceScore] = useState<number>(0)
  
  const monitor = useRef(PerformanceMonitor.getInstance())

  useEffect(() => {
    const handleMetricsUpdate = (newMetrics: PerformanceMetrics) => {
      setMetrics(newMetrics)
      setPerformanceScore(monitor.current.calculatePerformanceScore())
    }

    const handleError = (error: ErrorReport) => {
      setErrors(prev => [...prev, error])
    }

    monitor.current.addMetricsListener(handleMetricsUpdate)
    monitor.current.addErrorListener(handleError)

    // Initial metrics
    setMetrics(monitor.current.getMetrics())
    setErrors(monitor.current.getErrors())
    setAnalytics(monitor.current.getAnalytics())
    setPerformanceScore(monitor.current.calculatePerformanceScore())

    return () => {
      monitor.current.removeMetricsListener(handleMetricsUpdate)
      monitor.current.removeErrorListener(handleError)
    }
  }, [])

  const trackEvent = useCallback((event: string, data: any) => {
    monitor.current.trackEvent(event, data)
  }, [])

  return {
    metrics,
    errors,
    analytics,
    performanceScore,
    trackEvent
  }
}

// Performance dashboard component
export const PerformanceDashboard: React.FC = () => {
  const { metrics, errors, performanceScore } = usePerformanceMonitoring()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Performance Score</h3>
        <div className="text-3xl font-bold text-blue-600 mb-2">
          {performanceScore}/100
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${performanceScore}%` }}
          />
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Core Web Vitals</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>LCP:</span>
            <span className={metrics.lcp && metrics.lcp > 2500 ? 'text-red-600' : 'text-green-600'}>
              {metrics.lcp ? `${metrics.lcp.toFixed(0)}ms` : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>FID:</span>
            <span className={metrics.fid && metrics.fid > 100 ? 'text-red-600' : 'text-green-600'}>
              {metrics.fid ? `${metrics.fid.toFixed(0)}ms` : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>CLS:</span>
            <span className={metrics.cls && metrics.cls > 0.1 ? 'text-red-600' : 'text-green-600'}>
              {metrics.cls ? metrics.cls.toFixed(3) : 'N/A'}
            </span>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Errors</h3>
        <div className="text-2xl font-bold text-red-600 mb-2">
          {errors.length}
        </div>
        <div className="text-sm text-gray-600">
          {errors.filter(e => e.severity === 'high' || e.severity === 'critical').length} critical
        </div>
      </div>
    </div>
  )
}

const PerformanceMonitoring = {
  PerformanceMonitor,
  usePerformanceMonitoring,
  PerformanceDashboard
}

export default PerformanceMonitoring
