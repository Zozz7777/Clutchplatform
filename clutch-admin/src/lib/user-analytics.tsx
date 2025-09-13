import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * User Analytics and Behavior Tracking
 * Features:
 * - User journey tracking
 * - Conversion funnel analysis
 * - A/B testing support
 * - Heatmap generation
 * - User segmentation
 * - Real-time analytics dashboard
 */

// Analytics event types
export interface AnalyticsEvent {
  id: string
  type: 'page_view' | 'click' | 'scroll' | 'form_submit' | 'conversion' | 'custom'
  name: string
  properties: Record<string, any>
  timestamp: Date
  userId?: string
  sessionId: string
  page: string
  referrer?: string
}

// User session data
export interface UserSession {
  id: string
  userId?: string
  startTime: Date
  endTime?: Date
  duration: number
  pageViews: number
  events: AnalyticsEvent[]
  deviceInfo: {
    type: string
    os: string
    browser: string
    screen: string
    userAgent: string
  }
  location: {
    country: string
    region: string
    city: string
    timezone: string
  }
  referrer?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}

// Conversion funnel data
export interface ConversionFunnel {
  id: string
  name: string
  steps: {
    name: string
    event: string
    count: number
    conversionRate: number
  }[]
  totalConversions: number
  overallConversionRate: number
}

// A/B test data
export interface ABTest {
  id: string
  name: string
  variants: {
    id: string
    name: string
    traffic: number
    conversions: number
    conversionRate: number
  }[]
  status: 'draft' | 'running' | 'paused' | 'completed'
  startDate: Date
  endDate?: Date
  winner?: string
}

// User segmentation data
export interface UserSegment {
  id: string
  name: string
  criteria: {
    property: string
    operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than'
    value: any
  }[]
  userCount: number
  description: string
}

// Analytics manager class
export class UserAnalytics {
  private static instance: UserAnalytics
  private session: UserSession | null = null
  private events: AnalyticsEvent[] = []
  private listeners: Set<(event: AnalyticsEvent) => void> = new Set()
  private sessionListeners: Set<(session: UserSession) => void> = new Set()
  private isInitialized = false

  static getInstance(): UserAnalytics {
    if (!UserAnalytics.instance) {
      UserAnalytics.instance = new UserAnalytics()
    }
    return UserAnalytics.instance
  }

  constructor() {
    this.initialize().catch(console.error)
  }

  private async initialize() {
    if (this.isInitialized) return
    
    this.isInitialized = true
    await this.setupSession()
    this.setupEventTracking()
    this.setupPageTracking()
    this.setupUserInteractionTracking()
  }

  // Session setup
  private async setupSession() {
    const sessionId = this.getSessionId()
    const userId = this.getUserId()
    
    this.session = {
      id: sessionId,
      userId,
      startTime: new Date(),
      duration: 0,
      pageViews: 0,
      events: [],
      deviceInfo: this.getDeviceInfo(),
      location: await this.getLocation(),
      referrer: document.referrer,
      utmSource: this.getUTMParameter('utm_source'),
      utmMedium: this.getUTMParameter('utm_medium'),
      utmCampaign: this.getUTMParameter('utm_campaign')
    }

    // Track session start
    this.trackEvent('session_start', {
      sessionId: this.session.id,
      userId: this.session.userId,
      referrer: this.session.referrer,
      utmSource: this.session.utmSource,
      utmMedium: this.session.utmMedium,
      utmCampaign: this.session.utmCampaign
    })

    // Track session end on page unload
    window.addEventListener('beforeunload', () => {
      this.endSession()
    })
  }

  // Event tracking setup
  private setupEventTracking() {
    // Track clicks
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement
      if (target) {
        this.trackEvent('click', {
          element: target.tagName,
          id: target.id,
          className: target.className,
          text: target.textContent?.slice(0, 100),
          x: event.clientX,
          y: event.clientY
        })
      }
    })

    // Track scroll depth
    let maxScrollDepth = 0
    window.addEventListener('scroll', () => {
      const scrollDepth = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      )
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth
        this.trackEvent('scroll_depth', {
          depth: maxScrollDepth,
          page: window.location.pathname
        })
      }
    })

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement
      if (form) {
        this.trackEvent('form_submit', {
          formId: form.id,
          formName: form.name,
          action: form.action,
          method: form.method
        })
      }
    })

    // Track file downloads
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement
      if (target.tagName === 'A' && target.getAttribute('download')) {
        this.trackEvent('file_download', {
          filename: target.getAttribute('download'),
          url: target.getAttribute('href')
        })
      }
    })
  }

  // Page tracking setup
  private setupPageTracking() {
    // Track initial page view
    this.trackPageView()

    // Track page changes (for SPAs)
    let currentPath = window.location.pathname
    const observer = new MutationObserver(() => {
      if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname
        this.trackPageView()
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
  }

  // User interaction tracking
  private setupUserInteractionTracking() {
    // Track mouse movements for heatmap
    let mouseMovements: { x: number; y: number; timestamp: number }[] = []
    
    document.addEventListener('mousemove', (event) => {
      mouseMovements.push({
        x: event.clientX,
        y: event.clientY,
        timestamp: Date.now()
      })

      // Send mouse movements every 5 seconds
      if (mouseMovements.length >= 100) {
        this.trackEvent('mouse_movements', {
          movements: mouseMovements,
          page: window.location.pathname
        })
        mouseMovements = []
      }
    })

    // Track time on page
    let timeOnPage = 0
    const startTime = Date.now()
    
    setInterval(() => {
      timeOnPage = Date.now() - startTime
      this.trackEvent('time_on_page', {
        duration: timeOnPage,
        page: window.location.pathname
      })
    }, 30000) // Track every 30 seconds
  }

  // Track page view
  private trackPageView() {
    if (this.session) {
      this.session.pageViews++
    }

    this.trackEvent('page_view', {
      url: window.location.href,
      path: window.location.pathname,
      title: document.title,
      referrer: document.referrer
    })
  }

  // Track custom event
  trackEvent(name: string, properties: Record<string, any> = {}) {
    const event: AnalyticsEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'custom',
      name,
      properties,
      timestamp: new Date(),
      userId: this.session?.userId,
      sessionId: this.session?.id || '',
      page: window.location.pathname,
      referrer: document.referrer
    }

    this.events.push(event)
    if (this.session) {
      this.session.events.push(event)
    }

    this.notifyListeners(event)
    this.sendEvent(event)
  }

  // Track conversion
  trackConversion(conversionName: string, value?: number, properties: Record<string, any> = {}) {
    this.trackEvent('conversion', {
      conversionName,
      value,
      ...properties
    })
  }

  // End session
  private endSession() {
    if (this.session) {
      this.session.endTime = new Date()
      this.session.duration = this.session.endTime.getTime() - this.session.startTime.getTime()
      
      this.trackEvent('session_end', {
        duration: this.session.duration,
        pageViews: this.session.pageViews,
        events: this.session.events.length
      })

      this.notifySessionListeners(this.session)
      this.sendSession(this.session)
    }
  }

  // Send event to analytics service
  private async sendEvent(event: AnalyticsEvent) {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://clutch-main-nk7x.onrender.com/api/v1'
      await fetch(`${apiUrl}/analytics/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      })
    } catch (error) {
      console.error('Failed to send analytics event:', error)
    }
  }

  // Send session to analytics service
  private async sendSession(session: UserSession) {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://clutch-main-nk7x.onrender.com/api/v1'
      await fetch(`${apiUrl}/analytics/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session)
      })
    } catch (error) {
      console.error('Failed to send analytics session:', error)
    }
  }

  // Utility methods
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('analyticsSessionId')
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('analyticsSessionId', sessionId)
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
      screen: `${screen.width}x${screen.height}`,
      userAgent: navigator.userAgent
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
        city: data.city || 'Unknown',
        timezone: data.timezone || 'Unknown'
      }
    } catch {
      return {
        country: 'Unknown',
        region: 'Unknown',
        city: 'Unknown',
        timezone: 'Unknown'
      }
    }
  }

  private getUTMParameter(param: string): string | undefined {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get(param) || undefined
  }

  // Public methods
  getSession(): UserSession | null {
    return this.session
  }

  getEvents(): AnalyticsEvent[] {
    return [...this.events]
  }

  addEventListener(listener: (event: AnalyticsEvent) => void) {
    this.listeners.add(listener)
  }

  removeEventListener(listener: (event: AnalyticsEvent) => void) {
    this.listeners.delete(listener)
  }

  addSessionListener(listener: (session: UserSession) => void) {
    this.sessionListeners.add(listener)
  }

  removeSessionListener(listener: (session: UserSession) => void) {
    this.sessionListeners.delete(listener)
  }

  private notifyListeners(event: AnalyticsEvent) {
    this.listeners.forEach(listener => listener(event))
  }

  private notifySessionListeners(session: UserSession) {
    this.sessionListeners.forEach(listener => listener(session))
  }

  // A/B testing
  getABTestVariant(testId: string, variants: string[]): string {
    const userId = this.getUserId()
    const sessionId = this.getSessionId()
    
    // Use consistent hashing to ensure same user gets same variant
    const hash = this.hashString(`${testId}-${userId || sessionId}`)
    const index = hash % variants.length
    
    return variants[index]
  }

  private hashString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  // User segmentation
  isUserInSegment(segment: UserSegment): boolean {
    if (!this.session) return false

    return segment.criteria.every(criterion => {
      const value = this.getUserProperty(criterion.property)
      
      switch (criterion.operator) {
        case 'equals':
          return value === criterion.value
        case 'not_equals':
          return value !== criterion.value
        case 'contains':
          return String(value).includes(String(criterion.value))
        case 'not_contains':
          return !String(value).includes(String(criterion.value))
        case 'greater_than':
          return Number(value) > Number(criterion.value)
        case 'less_than':
          return Number(value) < Number(criterion.value)
        default:
          return false
      }
    })
  }

  private getUserProperty(property: string): any {
    if (!this.session) return null

    switch (property) {
      case 'deviceType':
        return this.session.deviceInfo.type
      case 'os':
        return this.session.deviceInfo.os
      case 'browser':
        return this.session.deviceInfo.browser
      case 'country':
        return this.session.location.country
      case 'region':
        return this.session.location.region
      case 'city':
        return this.session.location.city
      case 'pageViews':
        return this.session.pageViews
      case 'sessionDuration':
        return this.session.duration
      case 'referrer':
        return this.session.referrer
      case 'utmSource':
        return this.session.utmSource
      case 'utmMedium':
        return this.session.utmMedium
      case 'utmCampaign':
        return this.session.utmCampaign
      default:
        return null
    }
  }
}

// Analytics hook
export function useUserAnalytics() {
  const [session, setSession] = useState<UserSession | null>(null)
  const [events, setEvents] = useState<AnalyticsEvent[]>([])
  const analytics = useRef(UserAnalytics.getInstance())

  useEffect(() => {
    const handleEvent = (event: AnalyticsEvent) => {
      setEvents(prev => [...prev, event])
    }

    const handleSession = (session: UserSession) => {
      setSession(session)
    }

    analytics.current.addEventListener(handleEvent)
    analytics.current.addSessionListener(handleSession)

    // Initial state
    setSession(analytics.current.getSession())
    setEvents(analytics.current.getEvents())

    return () => {
      analytics.current.removeEventListener(handleEvent)
      analytics.current.removeSessionListener(handleSession)
    }
  }, [])

  const trackEvent = useCallback((name: string, properties: Record<string, any> = {}) => {
    analytics.current.trackEvent(name, properties)
  }, [])

  const trackConversion = useCallback((conversionName: string, value?: number, properties: Record<string, any> = {}) => {
    analytics.current.trackConversion(conversionName, value, properties)
  }, [])

  const getABTestVariant = useCallback((testId: string, variants: string[]) => {
    return analytics.current.getABTestVariant(testId, variants)
  }, [])

  const isUserInSegment = useCallback((segment: UserSegment) => {
    return analytics.current.isUserInSegment(segment)
  }, [])

  return {
    session,
    events,
    trackEvent,
    trackConversion,
    getABTestVariant,
    isUserInSegment
  }
}

// Analytics dashboard component
export const AnalyticsDashboard: React.FC = () => {
  const { session, events } = useUserAnalytics()

  if (!session) {
    return <div>Loading analytics...</div>
  }

  const pageViews = events.filter(e => e.type === 'page_view').length
  const conversions = events.filter(e => e.type === 'conversion').length
  const clicks = events.filter(e => e.name === 'click').length

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Session Info</h3>
        <div className="space-y-2 text-sm">
          <div>Duration: {Math.round(session.duration / 1000)}s</div>
          <div>Page Views: {pageViews}</div>
          <div>Events: {events.length}</div>
          <div>Device: {session.deviceInfo.type}</div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Engagement</h3>
        <div className="space-y-2 text-sm">
          <div>Clicks: {clicks}</div>
          <div>Conversions: {conversions}</div>
          <div>Conversion Rate: {pageViews > 0 ? ((conversions / pageViews) * 100).toFixed(1) : 0}%</div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Device</h3>
        <div className="space-y-2 text-sm">
          <div>OS: {session.deviceInfo.os}</div>
          <div>Browser: {session.deviceInfo.browser}</div>
          <div>Screen: {session.deviceInfo.screen}</div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Location</h3>
        <div className="space-y-2 text-sm">
          <div>Country: {session.location.country}</div>
          <div>Region: {session.location.region}</div>
          <div>City: {session.location.city}</div>
        </div>
      </div>
    </div>
  )
}

const UserAnalyticsModule = {
  UserAnalytics,
  useUserAnalytics,
  AnalyticsDashboard
}

export default UserAnalyticsModule
