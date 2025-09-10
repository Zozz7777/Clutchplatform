/**
 * Frontend Performance Monitoring Utility
 * Tracks client-side performance metrics and sends them to the backend
 */

interface PerformanceMetrics {
  pageLoadTime: number
  apiResponseTimes: number[]
  memoryUsage: number
  userInteractions: number
  errors: number
  timestamp: number
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    pageLoadTime: 0,
    apiResponseTimes: [],
    memoryUsage: 0,
    userInteractions: 0,
    errors: 0,
    timestamp: Date.now()
  }

  private startTime: number = Date.now()
  private apiStartTimes: Map<string, number> = new Map()
  private isEnabled: boolean = true

  constructor() {
    this.initializeMonitoring()
  }

  private initializeMonitoring() {
    // Track page load time
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        this.metrics.pageLoadTime = Date.now() - this.startTime
        this.logMetric('pageLoadTime', this.metrics.pageLoadTime)
      })

      // Track memory usage (if available)
      if ('memory' in performance) {
        setInterval(() => {
          const memory = (performance as any).memory
          this.metrics.memoryUsage = memory.usedJSHeapSize
        }, 30000) // Every 30 seconds
      }

      // Track user interactions
      const interactionEvents = ['click', 'keydown', 'scroll', 'touchstart']
      interactionEvents.forEach(event => {
        document.addEventListener(event, () => {
          this.metrics.userInteractions++
        }, { passive: true })
      })

      // Track errors
      window.addEventListener('error', () => {
        this.metrics.errors++
      })

      window.addEventListener('unhandledrejection', () => {
        this.metrics.errors++
      })
    }
  }

  // Track API request start
  trackApiRequest(requestId: string) {
    if (!this.isEnabled) return
    this.apiStartTimes.set(requestId, Date.now())
  }

  // Track API request end
  trackApiResponse(requestId: string) {
    if (!this.isEnabled) return
    
    const startTime = this.apiStartTimes.get(requestId)
    if (startTime) {
      const responseTime = Date.now() - startTime
      this.metrics.apiResponseTimes.push(responseTime)
      
      // Keep only last 100 response times
      if (this.metrics.apiResponseTimes.length > 100) {
        this.metrics.apiResponseTimes.shift()
      }
      
      this.apiStartTimes.delete(requestId)
      this.logMetric('apiResponseTime', responseTime)
    }
  }

  // Log a metric
  private logMetric(type: string, value: number) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Performance Metric [${type}]:`, value)
    }
  }

  // Get current metrics
  getMetrics(): PerformanceMetrics {
    return {
      ...this.metrics,
      timestamp: Date.now()
    }
  }

  // Get average API response time
  getAverageApiResponseTime(): number {
    if (this.metrics.apiResponseTimes.length === 0) return 0
    const sum = this.metrics.apiResponseTimes.reduce((a, b) => a + b, 0)
    return sum / this.metrics.apiResponseTimes.length
  }

  // Send metrics to backend (optional)
  async sendMetricsToBackend() {
    if (!this.isEnabled) return

    try {
      const metrics = this.getMetrics()
      
      // Only send if we have meaningful data
      if (metrics.apiResponseTimes.length > 0 || metrics.userInteractions > 0) {
        const response = await fetch('/api/v1/performance/client-metrics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(metrics)
        })

        if (response.ok) {
          console.log('📊 Performance metrics sent to backend')
        }
      }
    } catch (error) {
      console.warn('Failed to send performance metrics:', error)
    }
  }

  // Reset metrics
  resetMetrics() {
    this.metrics = {
      pageLoadTime: 0,
      apiResponseTimes: [],
      memoryUsage: 0,
      userInteractions: 0,
      errors: 0,
      timestamp: Date.now()
    }
    this.startTime = Date.now()
    this.apiStartTimes.clear()
  }

  // Enable/disable monitoring
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled
  }

  // Get performance summary
  getPerformanceSummary() {
    const avgResponseTime = this.getAverageApiResponseTime()
    const uptime = Date.now() - this.startTime

    return {
      uptime,
      pageLoadTime: this.metrics.pageLoadTime,
      averageApiResponseTime: avgResponseTime,
      totalApiRequests: this.metrics.apiResponseTimes.length,
      userInteractions: this.metrics.userInteractions,
      errors: this.metrics.errors,
      memoryUsage: this.metrics.memoryUsage,
      performanceScore: this.calculatePerformanceScore()
    }
  }

  // Calculate a simple performance score (0-100)
  private calculatePerformanceScore(): number {
    let score = 100

    // Deduct points for slow page load
    if (this.metrics.pageLoadTime > 3000) score -= 20
    else if (this.metrics.pageLoadTime > 2000) score -= 10

    // Deduct points for slow API responses
    const avgResponseTime = this.getAverageApiResponseTime()
    if (avgResponseTime > 2000) score -= 20
    else if (avgResponseTime > 1000) score -= 10

    // Deduct points for errors
    if (this.metrics.errors > 10) score -= 20
    else if (this.metrics.errors > 5) score -= 10

    return Math.max(0, score)
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor()

// Auto-send metrics every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    performanceMonitor.sendMetricsToBackend()
  }, 5 * 60 * 1000) // 5 minutes
}

export default performanceMonitor
