'use client'

import { performanceMonitor } from './performance-monitor'

// Code splitting utilities
export const lazyLoadComponent = <T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) => {
  return React.lazy(importFunc)
}

// Image optimization utilities
export const optimizeImage = (src: string, options: {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'jpeg' | 'png' | 'avif'
} = {}) => {
  const { width, height, quality = 80, format = 'webp' } = options
  
  // In a real implementation, this would use a service like Cloudinary or Next.js Image Optimization
  const params = new URLSearchParams()
  if (width) params.set('w', width.toString())
  if (height) params.set('h', height.toString())
  params.set('q', quality.toString())
  params.set('f', format)
  
  return `${src}?${params.toString()}`
}

// Bundle size optimization
export const bundleAnalyzer = {
  // Track bundle size
  trackBundleSize: (bundleName: string, size: number) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📦 Bundle ${bundleName}: ${(size / 1024).toFixed(2)} KB`)
    }
  },
  
  // Warn about large bundles
  warnLargeBundle: (bundleName: string, size: number, threshold = 500) => {
    if (size > threshold * 1024) {
      console.warn(`⚠️ Large bundle detected: ${bundleName} (${(size / 1024).toFixed(2)} KB)`)
    }
  }
}

// Service Worker implementation
export class ServiceWorkerManager {
  private static instance: ServiceWorkerManager
  private registration: ServiceWorkerRegistration | null = null

  private constructor() {}

  static getInstance(): ServiceWorkerManager {
    if (!ServiceWorkerManager.instance) {
      ServiceWorkerManager.instance = new ServiceWorkerManager()
    }
    return ServiceWorkerManager.instance
  }

  async register(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return null
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      console.log('✅ Service Worker registered successfully')
      return this.registration
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error)
      return null
    }
  }

  async unregister(): Promise<boolean> {
    if (!this.registration) return false

    try {
      const result = await this.registration.unregister()
      console.log('✅ Service Worker unregistered')
      return result
    } catch (error) {
      console.error('❌ Service Worker unregistration failed:', error)
      return false
    }
  }

  async update(): Promise<void> {
    if (!this.registration) return

    try {
      await this.registration.update()
      console.log('✅ Service Worker updated')
    } catch (error) {
      console.error('❌ Service Worker update failed:', error)
    }
  }

  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration
  }
}

// Offline support utilities
export const offlineManager = {
  isOnline: () => navigator.onLine,
  
  onOnline: (callback: () => void) => {
    window.addEventListener('online', callback)
    return () => window.removeEventListener('online', callback)
  },
  
  onOffline: (callback: () => void) => {
    window.addEventListener('offline', callback)
    return () => window.removeEventListener('offline', callback)
  },
  
  // Cache management
  clearCache: async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      )
    }
  },
  
  // Offline data storage
  storeOfflineData: (key: string, data: any) => {
    try {
      localStorage.setItem(`offline_${key}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }))
    } catch (error) {
      console.error('Failed to store offline data:', error)
    }
  },
  
  getOfflineData: (key: string, maxAge = 24 * 60 * 60 * 1000) => {
    try {
      const stored = localStorage.getItem(`offline_${key}`)
      if (!stored) return null
      
      const { data, timestamp } = JSON.parse(stored)
      if (Date.now() - timestamp > maxAge) {
        localStorage.removeItem(`offline_${key}`)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Failed to get offline data:', error)
      return null
    }
  }
}

// Performance monitoring hooks
export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = React.useState({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0
  })

  React.useEffect(() => {
    const startTime = performance.now()
    
    const measurePerformance = () => {
      const loadTime = performance.now() - startTime
      const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0
      
      setMetrics({
        loadTime,
        renderTime: performance.now(),
        memoryUsage
      })
      
      performanceMonitor.recordMetric('page_load', {
        loadTime,
        memoryUsage
      })
    }

    // Measure after component mount
    const timer = setTimeout(measurePerformance, 100)
    
    return () => clearTimeout(timer)
  }, [])

  return metrics
}

// Resource preloading
export const resourcePreloader = {
  preloadImage: (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = reject
      img.src = src
    })
  },
  
  preloadScript: (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.onload = () => resolve()
      script.onerror = reject
      script.src = src
      document.head.appendChild(script)
    })
  },
  
  preloadStylesheet: (href: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'style'
      link.href = href
      link.onload = () => resolve()
      link.onerror = reject
      document.head.appendChild(link)
    })
  }
}

// Memory management
export const memoryManager = {
  // Monitor memory usage
  getMemoryUsage: () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      }
    }
    return null
  },
  
  // Force garbage collection (if available)
  forceGC: () => {
    if ('gc' in window) {
      (window as any).gc()
    }
  },
  
  // Monitor for memory leaks
  monitorMemoryLeaks: (threshold = 80) => {
    const checkMemory = () => {
      const usage = memoryManager.getMemoryUsage()
      if (usage && usage.percentage > threshold) {
        console.warn(`⚠️ High memory usage detected: ${usage.percentage.toFixed(2)}%`)
        performanceMonitor.recordMetric('memory_warning', usage)
      }
    }
    
    const interval = setInterval(checkMemory, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }
}

// Performance budget enforcement
export const performanceBudget = {
  // Page load budget
  pageLoadBudget: 3000, // 3 seconds
  
  // Bundle size budget
  bundleSizeBudget: 500, // 500 KB
  
  // Memory budget
  memoryBudget: 50 * 1024 * 1024, // 50 MB
  
  // Check if within budget
  checkPageLoad: (loadTime: number) => {
    return loadTime <= performanceBudget.pageLoadBudget
  },
  
  checkBundleSize: (size: number) => {
    return size <= performanceBudget.bundleSizeBudget * 1024
  },
  
  checkMemoryUsage: (usage: number) => {
    return usage <= performanceBudget.memoryBudget
  },
  
  // Get budget status
  getBudgetStatus: () => {
    const memory = memoryManager.getMemoryUsage()
    return {
      pageLoad: 'unknown', // Would need to be measured
      bundleSize: 'unknown', // Would need to be measured
      memory: memory ? performanceBudget.checkMemoryUsage(memory.used) : 'unknown'
    }
  }
}

// React performance optimizations
export const reactOptimizations = {
  // Memo wrapper for expensive components
  withMemo: <P extends object>(Component: React.ComponentType<P>) => {
    return React.memo(Component)
  },
  
  // Callback memoization
  useStableCallback: <T extends (...args: any[]) => any>(callback: T): T => {
    const ref = React.useRef(callback)
    ref.current = callback
    return React.useCallback((...args: any[]) => ref.current(...args), []) as T
  },
  
  // Value memoization
  useStableValue: <T>(value: T): T => {
    const ref = React.useRef(value)
    if (ref.current !== value) {
      ref.current = value
    }
    return ref.current
  }
}

// Export service worker manager instance
export const serviceWorkerManager = ServiceWorkerManager.getInstance()
