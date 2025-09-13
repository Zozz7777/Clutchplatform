/**
 * Production Monitoring System
 * Comprehensive monitoring for production deployment
 */

export interface MonitoringConfig {
  prometheusEndpoint: string
  grafanaUrl: string
  alertManagerUrl: string
  logLevel: 'debug' | 'info' | 'warn' | 'error'
  sampleRate: number
  enablePerformanceMonitoring: boolean
  enableErrorTracking: boolean
  enableUserAnalytics: boolean
}

export interface SystemMetrics {
  timestamp: Date
  cpu: {
    usage: number
    load: number[]
  }
  memory: {
    used: number
    total: number
    percentage: number
  }
  disk: {
    used: number
    total: number
    percentage: number
  }
  network: {
    bytesIn: number
    bytesOut: number
    packetsIn: number
    packetsOut: number
  }
}

export interface ApplicationMetrics {
  timestamp: Date
  requests: {
    total: number
    successful: number
    failed: number
    rate: number
  }
  responseTime: {
    average: number
    p50: number
    p95: number
    p99: number
  }
  errors: {
    total: number
    rate: number
    byType: Record<string, number>
  }
  users: {
    active: number
    total: number
    new: number
  }
  performance: {
    bundleSize: number
    loadTime: number
    renderTime: number
    memoryUsage: number
  }
}

export interface Alert {
  id: string
  title: string
  description: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  status: 'firing' | 'resolved'
  timestamp: Date
  labels: Record<string, string>
  annotations: Record<string, string>
  duration?: number
}

export class ProductionMonitor {
  private static instance: ProductionMonitor
  private config: MonitoringConfig
  private metrics: ApplicationMetrics[] = []
  private alerts: Alert[] = []
  private listeners: Array<(metrics: ApplicationMetrics) => void> = []
  private alertListeners: Array<(alert: Alert) => void> = []

  static getInstance(config?: MonitoringConfig): ProductionMonitor {
    if (!ProductionMonitor.instance) {
      ProductionMonitor.instance = new ProductionMonitor(config)
    }
    return ProductionMonitor.instance
  }

  constructor(config?: MonitoringConfig) {
    this.config = config || {
      prometheusEndpoint: process.env.PROMETHEUS_ENDPOINT || 'https://clutch-main-nk7x.onrender.com:9090',
      grafanaUrl: process.env.GRAFANA_URL || 'https://clutch-main-nk7x.onrender.com:3001',
      alertManagerUrl: process.env.ALERT_MANAGER_URL || 'https://clutch-main-nk7x.onrender.com:9093',
      logLevel: (process.env.LOG_LEVEL as any) || 'info',
      sampleRate: parseFloat(process.env.PERFORMANCE_SAMPLE_RATE || '0.1'),
      enablePerformanceMonitoring: process.env.NEXT_PUBLIC_PERFORMANCE_MONITORING === 'true',
      enableErrorTracking: true,
      enableUserAnalytics: true
    }

    this.initializeMonitoring()
  }

  private initializeMonitoring() {
    if (typeof window === 'undefined') return

    // Initialize performance monitoring
    if (this.config.enablePerformanceMonitoring) {
      this.initializePerformanceMonitoring()
    }

    // Initialize error tracking
    if (this.config.enableErrorTracking) {
      this.initializeErrorTracking()
    }

    // Initialize user analytics
    if (this.config.enableUserAnalytics) {
      this.initializeUserAnalytics()
    }

    // Start metrics collection
    this.startMetricsCollection()

    // Start alert monitoring
    this.startAlertMonitoring()
  }

  private initializePerformanceMonitoring() {
    // Monitor Core Web Vitals
    this.monitorCoreWebVitals()

    // Monitor custom performance metrics
    this.monitorCustomMetrics()

    // Monitor resource usage
    this.monitorResourceUsage()
  }

  private monitorCoreWebVitals() {
    // LCP (Largest Contentful Paint)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        this.recordMetric('lcp', lastEntry.startTime)
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

      // FID (First Input Delay)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          this.recordMetric('fid', entry.processingStart - entry.startTime)
        })
      })
      fidObserver.observe({ entryTypes: ['first-input'] })

      // CLS (Cumulative Layout Shift)
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
            this.recordMetric('cls', clsValue)
          }
        })
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })
    }
  }

  private monitorCustomMetrics() {
    // Monitor bundle size
    this.monitorBundleSize()

    // Monitor API response times
    this.monitorAPIResponseTimes()

    // Monitor user interactions
    this.monitorUserInteractions()
  }

  private monitorBundleSize() {
    if ('performance' in window) {
      const entries = performance.getEntriesByType('resource')
      let totalSize = 0
      
      entries.forEach((entry: any) => {
        if (entry.name.includes('.js') || entry.name.includes('.css')) {
          totalSize += entry.transferSize || 0
        }
      })

      this.recordMetric('bundle_size', totalSize)
    }
  }

  private monitorAPIResponseTimes() {
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      const start = performance.now()
      try {
        const response = await originalFetch(...args)
        const duration = performance.now() - start
        this.recordMetric('api_response_time', duration)
        return response
      } catch (error) {
        const duration = performance.now() - start
        this.recordMetric('api_error_time', duration)
        throw error
      }
    }
  }

  private monitorUserInteractions() {
    // Monitor click events
    document.addEventListener('click', (event) => {
      this.recordMetric('user_clicks', 1)
    })

    // Monitor scroll events
    let scrollTimeout: NodeJS.Timeout
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        this.recordMetric('user_scrolls', 1)
      }, 100)
    })

    // Monitor form submissions
    document.addEventListener('submit', (event) => {
      this.recordMetric('form_submissions', 1)
    })
  }

  private monitorResourceUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      this.recordMetric('memory_used', memory.usedJSHeapSize)
      this.recordMetric('memory_total', memory.jsHeapSizeLimit)
    }
  }

  private initializeErrorTracking() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.recordError({
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        type: 'javascript_error'
      })
    })

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.recordError({
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack,
        type: 'promise_rejection'
      })
    })
  }

  private initializeUserAnalytics() {
    // Track page views
    this.trackPageView()

    // Track user sessions
    this.trackUserSession()

    // Track user interactions
    this.trackUserInteractions()
  }

  private trackPageView() {
    this.recordMetric('page_views', 1)
    
    // Track page load time
    window.addEventListener('load', () => {
      const loadTime = performance.now()
      this.recordMetric('page_load_time', loadTime)
    })
  }

  private trackUserSession() {
    const sessionId = this.getSessionId()
    this.recordMetric('active_sessions', 1)
    
    // Track session duration
    const startTime = Date.now()
    window.addEventListener('beforeunload', () => {
      const duration = Date.now() - startTime
      this.recordMetric('session_duration', duration)
    })
  }

  private trackUserInteractions() {
    // Track feature usage
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement
      if (target.dataset.feature) {
        this.recordMetric(`feature_usage_${target.dataset.feature}`, 1)
      }
    })
  }

  private startMetricsCollection() {
    setInterval(() => {
      this.collectMetrics()
    }, 30000) // Collect metrics every 30 seconds
  }

  private collectMetrics() {
    const metrics: ApplicationMetrics = {
      timestamp: new Date(),
      requests: this.getRequestMetrics(),
      responseTime: this.getResponseTimeMetrics(),
      errors: this.getErrorMetrics(),
      users: this.getUserMetrics(),
      performance: this.getPerformanceMetrics()
    }

    this.metrics.push(metrics)
    
    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100)
    }

    // Notify listeners
    this.listeners.forEach(listener => listener(metrics))

    // Send to Prometheus
    this.sendMetricsToPrometheus(metrics)
  }

  private getRequestMetrics() {
    // This would integrate with your actual request tracking
    return {
      total: 0,
      successful: 0,
      failed: 0,
      rate: 0
    }
  }

  private getResponseTimeMetrics() {
    // This would integrate with your actual response time tracking
    return {
      average: 0,
      p50: 0,
      p95: 0,
      p99: 0
    }
  }

  private getErrorMetrics() {
    // This would integrate with your actual error tracking
    return {
      total: 0,
      rate: 0,
      byType: {}
    }
  }

  private getUserMetrics() {
    // This would integrate with your actual user tracking
    return {
      active: 0,
      total: 0,
      new: 0
    }
  }

  private getPerformanceMetrics() {
    if (typeof window === 'undefined') {
      return {
        bundleSize: 0,
        loadTime: 0,
        renderTime: 0,
        memoryUsage: 0
      }
    }

    const bundleSize = this.getBundleSize()
    const loadTime = this.getLoadTime()
    const renderTime = this.getRenderTime()
    const memoryUsage = this.getMemoryUsage()

    return {
      bundleSize,
      loadTime,
      renderTime,
      memoryUsage
    }
  }

  private getBundleSize(): number {
    if ('performance' in window) {
      const entries = performance.getEntriesByType('resource')
      return entries.reduce((total, entry: any) => {
        if (entry.name.includes('.js') || entry.name.includes('.css')) {
          return total + (entry.transferSize || 0)
        }
        return total
      }, 0)
    }
    return 0
  }

  private getLoadTime(): number {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as any
      return navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0
    }
    return 0
  }

  private getRenderTime(): number {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as any
      return navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0
    }
    return 0
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      return memory ? (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100 : 0
    }
    return 0
  }

  private startAlertMonitoring() {
    setInterval(() => {
      this.checkAlerts()
    }, 60000) // Check alerts every minute
  }

  private checkAlerts() {
    // This would integrate with Prometheus alerting
    // For now, we'll implement basic threshold checks
    
    if (this.metrics.length === 0) return

    const latestMetrics = this.metrics[this.metrics.length - 1]

    // Check for high error rate
    if (latestMetrics.errors.rate > 0.05) {
      this.triggerAlert({
        id: 'high-error-rate',
        title: 'High Error Rate',
        description: `Error rate is ${(latestMetrics.errors.rate * 100).toFixed(2)}%`,
        severity: 'warning',
        status: 'firing',
        timestamp: new Date(),
        labels: { service: 'clutch-admin' },
        annotations: { summary: 'High error rate detected' }
      })
    }

    // Check for high response time
    if (latestMetrics.responseTime.p95 > 2000) {
      this.triggerAlert({
        id: 'high-response-time',
        title: 'High Response Time',
        description: `95th percentile response time is ${latestMetrics.responseTime.p95}ms`,
        severity: 'warning',
        status: 'firing',
        timestamp: new Date(),
        labels: { service: 'clutch-admin' },
        annotations: { summary: 'High response time detected' }
      })
    }

    // Check for high memory usage
    if (latestMetrics.performance.memoryUsage > 80) {
      this.triggerAlert({
        id: 'high-memory-usage',
        title: 'High Memory Usage',
        description: `Memory usage is ${latestMetrics.performance.memoryUsage.toFixed(2)}%`,
        severity: 'warning',
        status: 'firing',
        timestamp: new Date(),
        labels: { service: 'clutch-admin' },
        annotations: { summary: 'High memory usage detected' }
      })
    }
  }

  private triggerAlert(alert: Alert) {
    this.alerts.push(alert)
    
    // Notify alert listeners
    this.alertListeners.forEach(listener => listener(alert))

    // Send to alert manager
    this.sendAlertToManager(alert)
  }

  private recordMetric(name: string, value: number) {
    // This would send metrics to Prometheus
    console.log(`[Metric] ${name}: ${value}`)
  }

  private recordError(error: any) {
    // This would send errors to your error tracking service
    console.error('[Error]', error)
  }

  private sendMetricsToPrometheus(metrics: ApplicationMetrics) {
    // This would send metrics to Prometheus
    // Implementation would depend on your Prometheus setup
  }

  private sendAlertToManager(alert: Alert) {
    // This would send alerts to AlertManager
    // Implementation would depend on your AlertManager setup
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('monitoring_session_id')
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('monitoring_session_id', sessionId)
    }
    return sessionId
  }

  // Public methods
  public getMetrics(): ApplicationMetrics[] {
    return [...this.metrics]
  }

  public getAlerts(): Alert[] {
    return [...this.alerts]
  }

  public subscribeToMetrics(listener: (metrics: ApplicationMetrics) => void): () => void {
    this.listeners.push(listener)
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  public subscribeToAlerts(listener: (alert: Alert) => void): () => void {
    this.alertListeners.push(listener)
    return () => {
      const index = this.alertListeners.indexOf(listener)
      if (index > -1) {
        this.alertListeners.splice(index, 1)
      }
    }
  }

  public getSystemHealth(): 'healthy' | 'degraded' | 'unhealthy' {
    if (this.metrics.length === 0) return 'healthy'

    const latestMetrics = this.metrics[this.metrics.length - 1]
    
    // Check critical thresholds
    if (latestMetrics.errors.rate > 0.1 || latestMetrics.responseTime.p95 > 5000) {
      return 'unhealthy'
    }
    
    if (latestMetrics.errors.rate > 0.05 || latestMetrics.responseTime.p95 > 2000) {
      return 'degraded'
    }
    
    return 'healthy'
  }
}

// Initialize monitoring
export function initializeProductionMonitoring(config?: MonitoringConfig): ProductionMonitor {
  return ProductionMonitor.getInstance(config)
}

const ProductionMonitoring = {
  ProductionMonitor,
  initializeProductionMonitoring
}

export default ProductionMonitoring
