'use client'

// Performance monitoring singleton to prevent memory leaks
class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, any> = new Map()
  private observers: PerformanceObserver[] = []
  private isInitialized = false
  private cleanupInterval: NodeJS.Timeout | null = null
  private maxMetricsAge = 5 * 60 * 1000 // 5 minutes
  private maxMetricsCount = 1000

  private constructor() {
    this.initialize()
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  private initialize() {
    if (this.isInitialized || typeof window === 'undefined') return

    try {
      // Initialize performance observers
      this.setupPerformanceObservers()
      
      // Start cleanup interval
      this.startCleanupInterval()
      
      this.isInitialized = true
      console.log('📊 Performance monitor initialized')
    } catch (error) {
      console.error('Failed to initialize performance monitor:', error)
    }
  }

  private setupPerformanceObservers() {
    // Navigation timing observer
    if ('PerformanceObserver' in window) {
      try {
        const navObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach(entry => {
            this.recordMetric('navigation', entry)
          })
        })
        navObserver.observe({ entryTypes: ['navigation'] })
        this.observers.push(navObserver)
      } catch (error) {
        console.warn('Navigation timing observer not supported:', error)
      }

      // Resource timing observer
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach(entry => {
            this.recordMetric('resource', entry)
          })
        })
        resourceObserver.observe({ entryTypes: ['resource'] })
        this.observers.push(resourceObserver)
      } catch (error) {
        console.warn('Resource timing observer not supported:', error)
      }

      // Long task observer
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach(entry => {
            this.recordMetric('longtask', entry)
          })
        })
        longTaskObserver.observe({ entryTypes: ['longtask'] })
        this.observers.push(longTaskObserver)
      } catch (error) {
        console.warn('Long task observer not supported:', error)
      }
    }
  }

  private startCleanupInterval() {
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldMetrics()
    }, 60000) // Clean up every minute
  }

  private cleanupOldMetrics() {
    const now = Date.now()
    const keysToDelete: string[] = []

    this.metrics.forEach((metric, key) => {
      if (now - metric.timestamp > this.maxMetricsAge) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach(key => {
      this.metrics.delete(key)
    })

    // Limit total metrics count
    if (this.metrics.size > this.maxMetricsCount) {
      const sortedEntries = Array.from(this.metrics.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
      
      const toDelete = sortedEntries.slice(0, this.metrics.size - this.maxMetricsCount)
      toDelete.forEach(([key]) => {
        this.metrics.delete(key)
      })
    }
  }

  // Record a performance metric
  recordMetric(type: string, data: any) {
    const key = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.metrics.set(key, {
      type,
      data,
      timestamp: Date.now()
    })
  }

  // Measure function execution time
  async measureFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now()
    try {
      const result = await fn()
      const duration = performance.now() - start
      this.recordMetric('function', { name, duration, success: true })
      return result
    } catch (error) {
      const duration = performance.now() - start
      this.recordMetric('function', { name, duration, success: false, error: error.message })
      throw error
    }
  }

  // Measure API call performance
  async measureApiCall<T>(endpoint: string, apiCall: () => Promise<T>): Promise<T> {
    const start = performance.now()
    try {
      const result = await apiCall()
      const duration = performance.now() - start
      this.recordMetric('api', { endpoint, duration, success: true })
      return result
    } catch (error) {
      const duration = performance.now() - start
      this.recordMetric('api', { endpoint, duration, success: false, error: error.message })
      throw error
    }
  }

  // Get performance metrics
  getMetrics(type?: string, limit = 100) {
    const now = Date.now()
    let filteredMetrics = Array.from(this.metrics.values())

    if (type) {
      filteredMetrics = filteredMetrics.filter(metric => metric.type === type)
    }

    // Sort by timestamp (newest first) and limit
    return filteredMetrics
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
  }

  // Get performance summary
  getPerformanceSummary() {
    const metrics = this.getMetrics()
    const now = Date.now()
    const last5Minutes = metrics.filter(m => now - m.timestamp < 5 * 60 * 1000)
    const lastHour = metrics.filter(m => now - m.timestamp < 60 * 60 * 1000)

    const apiMetrics = last5Minutes.filter(m => m.type === 'api')
    const functionMetrics = last5Minutes.filter(m => m.type === 'function')
    const longTasks = lastHour.filter(m => m.type === 'longtask')

    return {
      totalMetrics: metrics.length,
      last5Minutes: last5Minutes.length,
      lastHour: lastHour.length,
      apiCalls: {
        total: apiMetrics.length,
        averageDuration: apiMetrics.length > 0 
          ? apiMetrics.reduce((sum, m) => sum + m.data.duration, 0) / apiMetrics.length 
          : 0,
        successRate: apiMetrics.length > 0 
          ? apiMetrics.filter(m => m.data.success).length / apiMetrics.length 
          : 0
      },
      functions: {
        total: functionMetrics.length,
        averageDuration: functionMetrics.length > 0 
          ? functionMetrics.reduce((sum, m) => sum + m.data.duration, 0) / functionMetrics.length 
          : 0,
        successRate: functionMetrics.length > 0 
          ? functionMetrics.filter(m => m.data.success).length / functionMetrics.length 
          : 0
      },
      longTasks: longTasks.length,
      memoryUsage: this.getMemoryUsage()
    }
  }

  // Get memory usage (if available)
  private getMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      }
    }
    return null
  }

  // Clear all metrics
  clearMetrics() {
    this.metrics.clear()
  }

  // Destroy the monitor and cleanup resources
  destroy() {
    // Disconnect all observers
    this.observers.forEach(observer => {
      try {
        observer.disconnect()
      } catch (error) {
        console.warn('Error disconnecting performance observer:', error)
      }
    })
    this.observers = []

    // Clear cleanup interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }

    // Clear metrics
    this.metrics.clear()

    this.isInitialized = false
    console.log('📊 Performance monitor destroyed')
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance()

// Performance budget enforcement
export class PerformanceBudget {
  private static instance: PerformanceBudget
  private budgets: Map<string, number> = new Map()
  private violations: any[] = []

  private constructor() {
    this.setDefaultBudgets()
  }

  static getInstance(): PerformanceBudget {
    if (!PerformanceBudget.instance) {
      PerformanceBudget.instance = new PerformanceBudget()
    }
    return PerformanceBudget.instance
  }

  private setDefaultBudgets() {
    this.budgets.set('api_call', 5000) // 5 seconds
    this.budgets.set('function_execution', 1000) // 1 second
    this.budgets.set('page_load', 3000) // 3 seconds
    this.budgets.set('component_render', 100) // 100ms
  }

  setBudget(type: string, budget: number) {
    this.budgets.set(type, budget)
  }

  checkBudget(type: string, duration: number): boolean {
    const budget = this.budgets.get(type)
    if (!budget) return true

    const withinBudget = duration <= budget
    if (!withinBudget) {
      this.violations.push({
        type,
        duration,
        budget,
        timestamp: Date.now()
      })
      
      console.warn(`Performance budget violated: ${type} took ${duration}ms (budget: ${budget}ms)`)
    }

    return withinBudget
  }

  getViolations() {
    return this.violations
  }

  clearViolations() {
    this.violations = []
  }
}

export const performanceBudget = PerformanceBudget.getInstance()
