/**
 * Performance Validator - Core System
 * Real-time performance monitoring and validation
 */

export interface PerformanceMetrics {
  // Core Web Vitals
  cls: number
  fid: number
  lcp: number
  ttfb: number
  fcp: number
  
  // Custom Metrics
  pageLoadTime: number
  domContentLoaded: number
  resourceLoadTime: number
  apiResponseTime: number
  renderTime: number
  
  // User Experience Metrics
  timeToInteractive: number
  firstMeaningfulPaint: number
  speedIndex: number
  
  // Business Metrics
  conversionRate: number
  bounceRate: number
  sessionDuration: number
  pageViews: number
}

export interface PerformanceThresholds {
  cls: { good: number; needsImprovement: number; poor: number }
  fid: { good: number; needsImprovement: number; poor: number }
  lcp: { good: number; needsImprovement: number; poor: number }
  ttfb: { good: number; needsImprovement: number; poor: number }
  fcp: { good: number; needsImprovement: number; poor: number }
  pageLoadTime: { good: number; needsImprovement: number; poor: number }
  apiResponseTime: { good: number; needsImprovement: number; poor: number }
}

export interface PerformanceReport {
  id: string
  timestamp: Date
  url: string
  userAgent: string
  metrics: PerformanceMetrics
  thresholds: PerformanceThresholds
  scores: PerformanceScores
  recommendations: PerformanceRecommendation[]
  alerts: PerformanceAlert[]
  trends: PerformanceTrends
}

export interface PerformanceScores {
  overall: number
  coreWebVitals: number
  loading: number
  interactivity: number
  visualStability: number
  business: number
}

export interface PerformanceRecommendation {
  id: string
  category: 'loading' | 'interactivity' | 'visual' | 'api' | 'resource'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  impact: string
  effort: 'low' | 'medium' | 'high'
  implementation: string[]
  expectedImprovement: number
}

export interface PerformanceAlert {
  id: string
  type: 'threshold' | 'anomaly' | 'degradation'
  severity: 'low' | 'medium' | 'high' | 'critical'
  metric: string
  value: number
  threshold: number
  message: string
  timestamp: Date
  resolved: boolean
}

export interface PerformanceTrends {
  period: { start: Date; end: Date }
  metrics: {
    [K in keyof PerformanceMetrics]: {
      current: number
      previous: number
      change: number
      changePercentage: number
      trend: 'improving' | 'degrading' | 'stable'
    }
  }
  overallTrend: 'improving' | 'degrading' | 'stable'
  criticalIssues: string[]
  improvements: string[]
}

export class PerformanceValidator {
  private static instance: PerformanceValidator
  private metrics: PerformanceMetrics
  private thresholds: PerformanceThresholds
  private reports: PerformanceReport[] = []
  private observers: PerformanceObserver[] = []
  private isInitialized = false

  static getInstance(): PerformanceValidator {
    if (!PerformanceValidator.instance) {
      PerformanceValidator.instance = new PerformanceValidator()
    }
    return PerformanceValidator.instance
  }

  constructor() {
    this.thresholds = this.getDefaultThresholds()
    this.metrics = this.getInitialMetrics()
    this.loadStoredData()
  }

  private getDefaultThresholds(): PerformanceThresholds {
    return {
      cls: { good: 0.1, needsImprovement: 0.25, poor: 0.25 },
      fid: { good: 100, needsImprovement: 300, poor: 300 },
      lcp: { good: 2500, needsImprovement: 4000, poor: 4000 },
      ttfb: { good: 800, needsImprovement: 1800, poor: 1800 },
      fcp: { good: 1800, needsImprovement: 3000, poor: 3000 },
      pageLoadTime: { good: 2000, needsImprovement: 4000, poor: 4000 },
      apiResponseTime: { good: 200, needsImprovement: 500, poor: 500 }
    }
  }

  private getInitialMetrics(): PerformanceMetrics {
    return {
      cls: 0, fid: 0, lcp: 0, ttfb: 0, fcp: 0,
      pageLoadTime: 0, domContentLoaded: 0, resourceLoadTime: 0,
      apiResponseTime: 0, renderTime: 0, timeToInteractive: 0,
      firstMeaningfulPaint: 0, speedIndex: 0, conversionRate: 0,
      bounceRate: 0, sessionDuration: 0, pageViews: 0
    }
  }

  private loadStoredData() {
    try {
      const stored = localStorage.getItem('performanceValidation')
      if (stored) {
        const data = JSON.parse(stored)
        this.reports = data.reports || []
      }
    } catch (error) {
      console.error('Failed to load performance validation data:', error)
    }
  }

  private saveData() {
    try {
      localStorage.setItem('performanceValidation', JSON.stringify({
        reports: this.reports
      }))
    } catch (error) {
      console.error('Failed to save performance validation data:', error)
    }
  }

  public initialize(): void {
    if (this.isInitialized || typeof window === 'undefined') return

    this.setupWebVitals()
    this.setupCustomMetrics()
    this.setupResourceTiming()
    this.setupNavigationTiming()
    this.setupUserTiming()
    this.setupBusinessMetrics()

    this.isInitialized = true
    console.log('Performance validation initialized')
  }

  private setupWebVitals(): void {
    // Core Web Vitals setup will be in separate file
  }

  private setupCustomMetrics(): void {
    window.addEventListener('load', () => {
      const loadTime = performance.now()
      this.metrics.pageLoadTime = loadTime
      this.checkThreshold('pageLoadTime', loadTime)
    })

    document.addEventListener('DOMContentLoaded', () => {
      const domTime = performance.now()
      this.metrics.domContentLoaded = domTime
    })
  }

  private setupResourceTiming(): void {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming
          this.metrics.resourceLoadTime = Math.max(
            this.metrics.resourceLoadTime,
            resourceEntry.responseEnd - resourceEntry.requestStart
          )
        }
      }
    })
    observer.observe({ entryTypes: ['resource'] })
    this.observers.push(observer)
  }

  private setupNavigationTiming(): void {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigation) {
        this.metrics.renderTime = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart
        this.metrics.firstMeaningfulPaint = navigation.domContentLoadedEventEnd - navigation.fetchStart
      }
    })
  }

  private setupUserTiming(): void {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure') {
          switch (entry.name) {
            case 'api-response-time':
              this.metrics.apiResponseTime = entry.duration
              this.checkThreshold('apiResponseTime', entry.duration)
              break
          }
        }
      }
    })
    observer.observe({ entryTypes: ['measure'] })
    this.observers.push(observer)
  }

  private setupBusinessMetrics(): void {
    this.metrics.pageViews = 1
    this.metrics.sessionDuration = Date.now()
    
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement
      if (target.matches('[data-conversion]')) {
        this.metrics.conversionRate = (this.metrics.conversionRate || 0) + 1
      }
    })

    let hasInteracted = false
    document.addEventListener('click', () => { hasInteracted = true })
    document.addEventListener('scroll', () => { hasInteracted = true })
    
    window.addEventListener('beforeunload', () => {
      if (!hasInteracted) {
        this.metrics.bounceRate = (this.metrics.bounceRate || 0) + 1
      }
    })
  }

  private checkThreshold(metric: keyof PerformanceThresholds, value: number): void {
    const threshold = this.thresholds[metric]
    let severity: PerformanceAlert['severity'] = 'low'
    let message = ''

    if (value > threshold.poor) {
      severity = 'critical'
      message = `${metric} is critically poor: ${value.toFixed(2)}`
    } else if (value > threshold.needsImprovement) {
      severity = 'high'
      message = `${metric} needs improvement: ${value.toFixed(2)}`
    } else if (value > threshold.good) {
      severity = 'medium'
      message = `${metric} is below optimal: ${value.toFixed(2)}`
    }

    if (severity !== 'low') {
      this.createAlert(metric, value, threshold.poor, message, severity)
    }
  }

  private createAlert(
    metric: string, 
    value: number, 
    threshold: number, 
    message: string, 
    severity: PerformanceAlert['severity']
  ): void {
    const alert: PerformanceAlert = {
      id: `alert-${Date.now()}-${Math.random()}`,
      type: 'threshold',
      severity,
      metric,
      value,
      threshold,
      message,
      timestamp: new Date(),
      resolved: false
    }

    this.sendAlert(alert)
  }

  private sendAlert(alert: PerformanceAlert): void {
    console.warn('Performance Alert:', alert)
    
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureMessage(alert.message, {
        level: alert.severity === 'critical' ? 'error' : 'warning',
        extra: {
          metric: alert.metric,
          value: alert.value,
          threshold: alert.threshold
        }
      })
    }
  }

  public generateReport(): PerformanceReport {
    const report: PerformanceReport = {
      id: `report-${Date.now()}`,
      timestamp: new Date(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      metrics: { ...this.metrics },
      thresholds: { ...this.thresholds },
      scores: this.calculateScores(),
      recommendations: this.generateRecommendations(),
      alerts: [],
      trends: this.calculateTrends()
    }

    this.reports.push(report)
    this.saveData()

    return report
  }

  private calculateScores(): PerformanceScores {
    const coreWebVitalsScore = this.calculateCoreWebVitalsScore()
    const loadingScore = this.calculateLoadingScore()
    const interactivityScore = this.calculateInteractivityScore()
    const visualStabilityScore = this.calculateVisualStabilityScore()
    const businessScore = this.calculateBusinessScore()

    const overall = Math.round(
      (coreWebVitalsScore + loadingScore + interactivityScore + visualStabilityScore + businessScore) / 5
    )

    return {
      overall,
      coreWebVitals: coreWebVitalsScore,
      loading: loadingScore,
      interactivity: interactivityScore,
      visualStability: visualStabilityScore,
      business: businessScore
    }
  }

  private calculateCoreWebVitalsScore(): number {
    const clsScore = this.getMetricScore(this.metrics.cls, this.thresholds.cls)
    const fidScore = this.getMetricScore(this.metrics.fid, this.thresholds.fid)
    const lcpScore = this.getMetricScore(this.metrics.lcp, this.thresholds.lcp)
    
    return Math.round((clsScore + fidScore + lcpScore) / 3)
  }

  private calculateLoadingScore(): number {
    const ttfbScore = this.getMetricScore(this.metrics.ttfb, this.thresholds.ttfb)
    const fcpScore = this.getMetricScore(this.metrics.fcp, this.thresholds.fcp)
    const pageLoadScore = this.getMetricScore(this.metrics.pageLoadTime, this.thresholds.pageLoadTime)
    
    return Math.round((ttfbScore + fcpScore + pageLoadScore) / 3)
  }

  private calculateInteractivityScore(): number {
    const fidScore = this.getMetricScore(this.metrics.fid, this.thresholds.fid)
    const ttiScore = this.getMetricScore(this.metrics.timeToInteractive, { good: 3800, needsImprovement: 7300, poor: 7300 })
    
    return Math.round((fidScore + ttiScore) / 2)
  }

  private calculateVisualStabilityScore(): number {
    return this.getMetricScore(this.metrics.cls, this.thresholds.cls)
  }

  private calculateBusinessScore(): number {
    const conversionScore = Math.min(100, (this.metrics.conversionRate || 0) * 20)
    const bounceScore = Math.max(0, 100 - (this.metrics.bounceRate || 0) * 10)
    
    return Math.round((conversionScore + bounceScore) / 2)
  }

  private getMetricScore(value: number, threshold: { good: number; needsImprovement: number; poor: number }): number {
    if (value <= threshold.good) return 100
    if (value <= threshold.needsImprovement) return 75
    if (value <= threshold.poor) return 50
    return 25
  }

  private generateRecommendations(): PerformanceRecommendation[] {
    const recommendations: PerformanceRecommendation[] = []

    if (this.metrics.cls > this.thresholds.cls.good) {
      recommendations.push({
        id: 'cls-improvement',
        category: 'visual',
        priority: this.metrics.cls > this.thresholds.cls.poor ? 'critical' : 'high',
        title: 'Improve Cumulative Layout Shift',
        description: 'Reduce unexpected layout shifts that impact user experience',
        impact: 'High user experience improvement',
        effort: 'medium',
        implementation: [
          'Add size attributes to images and videos',
          'Reserve space for dynamic content',
          'Avoid inserting content above existing content',
          'Use transform animations instead of changing layout properties'
        ],
        expectedImprovement: 30
      })
    }

    if (this.metrics.lcp > this.thresholds.lcp.good) {
      recommendations.push({
        id: 'lcp-improvement',
        category: 'loading',
        priority: this.metrics.lcp > this.thresholds.lcp.poor ? 'critical' : 'high',
        title: 'Optimize Largest Contentful Paint',
        description: 'Improve loading performance of the largest content element',
        impact: 'Significant loading performance improvement',
        effort: 'high',
        implementation: [
          'Optimize and compress images',
          'Use modern image formats (WebP, AVIF)',
          'Implement lazy loading for below-the-fold content',
          'Optimize server response times',
          'Use a Content Delivery Network (CDN)'
        ],
        expectedImprovement: 40
      })
    }

    return recommendations
  }

  private calculateTrends(): PerformanceTrends {
    const now = new Date()
    const previousPeriod = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    const currentReports = this.reports.filter(r => r.timestamp >= previousPeriod)
    const previousReports = this.reports.filter(r => 
      r.timestamp < previousPeriod && r.timestamp >= new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
    )

    const currentAvg = this.calculateAverageMetrics(currentReports)
    const previousAvg = this.calculateAverageMetrics(previousReports)

    const trends: PerformanceTrends = {
      period: { start: previousPeriod, end: now },
      metrics: {} as any,
      overallTrend: 'stable',
      criticalIssues: [],
      improvements: []
    }

    Object.keys(this.metrics).forEach(metric => {
      const current = currentAvg[metric as keyof PerformanceMetrics] || 0
      const previous = previousAvg[metric as keyof PerformanceMetrics] || 0
      const change = current - previous
      const changePercentage = previous > 0 ? (change / previous) * 100 : 0
      
      let trend: 'improving' | 'degrading' | 'stable' = 'stable'
      if (Math.abs(changePercentage) > 5) {
        const isLowerBetter = ['cls', 'fid', 'lcp', 'ttfb', 'fcp', 'pageLoadTime', 'apiResponseTime'].includes(metric)
        trend = isLowerBetter ? 
          (change < 0 ? 'improving' : 'degrading') : 
          (change > 0 ? 'improving' : 'degrading')
      }

      trends.metrics[metric as keyof PerformanceMetrics] = {
        current,
        previous,
        change,
        changePercentage,
        trend
      }
    })

    const improvingMetrics = Object.values(trends.metrics).filter(m => m.trend === 'improving').length
    const degradingMetrics = Object.values(trends.metrics).filter(m => m.trend === 'degrading').length
    
    if (improvingMetrics > degradingMetrics) {
      trends.overallTrend = 'improving'
    } else if (degradingMetrics > improvingMetrics) {
      trends.overallTrend = 'degrading'
    }

    return trends
  }

  private calculateAverageMetrics(reports: PerformanceReport[]): Partial<PerformanceMetrics> {
    if (reports.length === 0) return {}

    const sum = reports.reduce((acc, report) => {
      Object.keys(report.metrics).forEach(key => {
        acc[key] = (acc[key] || 0) + report.metrics[key as keyof PerformanceMetrics]
      })
      return acc
    }, {} as any)

    Object.keys(sum).forEach(key => {
      sum[key] = sum[key] / reports.length
    })

    return sum
  }

  public getCurrentMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  public getReports(): PerformanceReport[] {
    return [...this.reports]
  }

  public getLatestReport(): PerformanceReport | null {
    return this.reports.length > 0 ? this.reports[this.reports.length - 1] : null
  }

  public measureCustomMetric(name: string, startMark: string, endMark: string): void {
    if (typeof window !== 'undefined' && window.performance) {
      performance.measure(name, startMark, endMark)
    }
  }

  public markCustomTiming(name: string): void {
    if (typeof window !== 'undefined' && window.performance) {
      performance.mark(name)
    }
  }

  public updateThresholds(newThresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds }
  }

  public cleanup(): void {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
    this.isInitialized = false
  }
}
