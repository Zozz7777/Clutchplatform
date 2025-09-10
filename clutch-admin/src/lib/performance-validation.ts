/**
 * Performance Validation & Optimization
 * Tools for measuring and optimizing Core Web Vitals
 */

import { onCLS, onINP, onLCP, onTTFB, onFCP } from 'web-vitals'

export interface PerformanceMetrics {
  // Core Web Vitals
  CLS: number // Cumulative Layout Shift
  FID: number // First Input Delay
  LCP: number // Largest Contentful Paint
  TTFB: number // Time to First Byte
  FCP: number // First Contentful Paint
  
  // Custom Metrics
  loadTime: number
  renderTime: number
  memoryUsage: number
  bundleSize: number
  imageOptimization: number
  cacheHitRate: number
}

export interface PerformanceThresholds {
  CLS: { good: number; needsImprovement: number }
  FID: { good: number; needsImprovement: number }
  LCP: { good: number; needsImprovement: number }
  TTFB: { good: number; needsImprovement: number }
  FCP: { good: number; needsImprovement: number }
  loadTime: { good: number; needsImprovement: number }
  renderTime: { good: number; needsImprovement: number }
  memoryUsage: { good: number; needsImprovement: number }
  bundleSize: { good: number; needsImprovement: number }
  imageOptimization: { good: number; needsImprovement: number }
  cacheHitRate: { good: number; needsImprovement: number }
}

export const defaultThresholds: PerformanceThresholds = {
  CLS: { good: 0.1, needsImprovement: 0.25 },
  FID: { good: 100, needsImprovement: 300 },
  LCP: { good: 2500, needsImprovement: 4000 },
  TTFB: { good: 800, needsImprovement: 1800 },
  FCP: { good: 1800, needsImprovement: 3000 },
  loadTime: { good: 2000, needsImprovement: 4000 },
  renderTime: { good: 1000, needsImprovement: 2000 },
  memoryUsage: { good: 50, needsImprovement: 80 },
  bundleSize: { good: 1000000, needsImprovement: 2000000 }, // 1MB, 2MB
  imageOptimization: { good: 80, needsImprovement: 60 }, // 80%, 60%
  cacheHitRate: { good: 80, needsImprovement: 60 } // 80%, 60%
}

export class PerformanceValidator {
  private metrics: Partial<PerformanceMetrics> = {}
  private thresholds: PerformanceThresholds
  private observers: PerformanceObserver[] = []
  private startTime: number

  constructor(thresholds: PerformanceThresholds = defaultThresholds) {
    this.thresholds = thresholds
    this.startTime = performance.now()
    this.initializeMetrics()
  }

  private initializeMetrics() {
    // Initialize Core Web Vitals
    onCLS((metric) => {
      this.metrics.CLS = metric.value
      this.reportMetric('CLS', metric.value)
    })

    onINP((metric) => {
      this.metrics.FID = metric.value
      this.reportMetric('FID', metric.value)
    })

    onLCP((metric) => {
      this.metrics.LCP = metric.value
      this.reportMetric('LCP', metric.value)
    })

    onTTFB((metric) => {
      this.metrics.TTFB = metric.value
      this.reportMetric('TTFB', metric.value)
    })

    onFCP((metric) => {
      this.metrics.FCP = metric.value
      this.reportMetric('FCP', metric.value)
    })

    // Initialize custom metrics
    this.measureLoadTime()
    this.measureRenderTime()
    this.measureMemoryUsage()
    this.measureBundleSize()
    this.measureImageOptimization()
    this.measureCacheHitRate()
  }

  private measureLoadTime() {
    window.addEventListener('load', () => {
      const loadTime = performance.now() - this.startTime
      this.metrics.loadTime = loadTime
      this.reportMetric('loadTime', loadTime)
    })
  }

  private measureRenderTime() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure' && entry.name === 'render-time') {
          this.metrics.renderTime = entry.duration
          this.reportMetric('renderTime', entry.duration)
        }
      }
    })
    observer.observe({ entryTypes: ['measure'] })
    this.observers.push(observer)

    // Mark render start
    performance.mark('render-start')
    
    // Mark render end after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        performance.mark('render-end')
        performance.measure('render-time', 'render-start', 'render-end')
      })
    } else {
      performance.mark('render-end')
      performance.measure('render-time', 'render-start', 'render-end')
    }
  }

  private measureMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      const memoryUsage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      this.metrics.memoryUsage = memoryUsage
      this.reportMetric('memoryUsage', memoryUsage)
    }
  }

  private measureBundleSize() {
    const observer = new PerformanceObserver((list) => {
      let totalSize = 0
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource' && entry.name.includes('.js')) {
          const resourceEntry = entry as PerformanceResourceTiming
          totalSize += resourceEntry.transferSize || 0
        }
      }
      this.metrics.bundleSize = totalSize
      this.reportMetric('bundleSize', totalSize)
    })
    observer.observe({ entryTypes: ['resource'] })
    this.observers.push(observer)
  }

  private measureImageOptimization() {
    const observer = new PerformanceObserver((list) => {
      let totalImageSize = 0
      let optimizedImages = 0
      let totalImages = 0

      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource' && entry.name.match(/\.(jpg|jpeg|png|gif|webp|avif)$/i)) {
          const resourceEntry = entry as PerformanceResourceTiming
          totalImages++
          totalImageSize += resourceEntry.transferSize || 0

          // Check if image is optimized (WebP, AVIF, or small size)
          if (entry.name.includes('.webp') || entry.name.includes('.avif') || (resourceEntry.transferSize || 0) < 100000) {
            optimizedImages++
          }
        }
      }

      if (totalImages > 0) {
        const optimizationRate = (optimizedImages / totalImages) * 100
        this.metrics.imageOptimization = optimizationRate
        this.reportMetric('imageOptimization', optimizationRate)
      }
    })
    observer.observe({ entryTypes: ['resource'] })
    this.observers.push(observer)
  }

  private measureCacheHitRate() {
    const observer = new PerformanceObserver((list) => {
      let cacheHits = 0
      let totalRequests = 0

      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming
          totalRequests++
          if (resourceEntry.transferSize === 0) {
            cacheHits++
          }
        }
      }

      if (totalRequests > 0) {
        const hitRate = (cacheHits / totalRequests) * 100
        this.metrics.cacheHitRate = hitRate
        this.reportMetric('cacheHitRate', hitRate)
      }
    })
    observer.observe({ entryTypes: ['resource'] })
    this.observers.push(observer)
  }

  private reportMetric(name: keyof PerformanceMetrics, value: number) {
    const threshold = this.thresholds[name]
    if (!threshold) return

    let status: 'good' | 'needsImprovement' | 'poor'
    if (value <= threshold.good) {
      status = 'good'
    } else if (value <= threshold.needsImprovement) {
      status = 'needsImprovement'
    } else {
      status = 'poor'
    }

    console.log(`[Performance] ${name}: ${value.toFixed(2)} (${status})`)

    // Send to analytics
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'performance_metric', {
        metric_name: name,
        metric_value: value,
        metric_status: status
      })
    }
  }

  public getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics }
  }

  public getScore(): number {
    const metrics = this.getMetrics()
    let totalScore = 0
    let metricCount = 0

    Object.entries(metrics).forEach(([name, value]) => {
      const threshold = this.thresholds[name as keyof PerformanceMetrics]
      if (threshold && typeof value === 'number') {
        let score: number
        if (value <= threshold.good) {
          score = 100
        } else if (value <= threshold.needsImprovement) {
          score = 50
        } else {
          score = 0
        }
        totalScore += score
        metricCount++
      }
    })

    return metricCount > 0 ? totalScore / metricCount : 0
  }

  public getRecommendations(): string[] {
    const metrics = this.getMetrics()
    const recommendations: string[] = []

    Object.entries(metrics).forEach(([name, value]) => {
      const threshold = this.thresholds[name as keyof PerformanceMetrics]
      if (threshold && typeof value === 'number') {
        if (value > threshold.needsImprovement) {
          recommendations.push(this.getRecommendation(name as keyof PerformanceMetrics, value))
        }
      }
    })

    return recommendations
  }

  private getRecommendation(metric: keyof PerformanceMetrics, value: number): string {
    const recommendations: Record<keyof PerformanceMetrics, string> = {
      CLS: 'Optimize layout shifts by setting explicit dimensions for images and ads',
      FID: 'Reduce JavaScript execution time and optimize third-party scripts',
      LCP: 'Optimize images, use efficient image formats, and implement lazy loading',
      TTFB: 'Improve server response time and use CDN for static assets',
      FCP: 'Optimize critical rendering path and reduce render-blocking resources',
      loadTime: 'Implement code splitting, lazy loading, and optimize bundle size',
      renderTime: 'Optimize component rendering and reduce DOM complexity',
      memoryUsage: 'Implement memory leak prevention and optimize data structures',
      bundleSize: 'Implement code splitting and remove unused dependencies',
      imageOptimization: 'Use modern image formats (WebP, AVIF) and implement responsive images',
      cacheHitRate: 'Implement proper caching strategies and service workers'
    }

    return recommendations[metric] || `Optimize ${metric} performance`
  }

  public cleanup() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

// Performance optimization utilities
export const performanceOptimizations = {
  // Lazy load images
  lazyLoadImages: () => {
    const images = document.querySelectorAll('img[data-src]')
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          img.src = img.dataset.src || ''
          img.removeAttribute('data-src')
          imageObserver.unobserve(img)
        }
      })
    })

    images.forEach(img => imageObserver.observe(img))
  },

  // Preload critical resources
  preloadCriticalResources: (resources: string[]) => {
    resources.forEach(resource => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = resource
      link.as = resource.endsWith('.css') ? 'style' : 'script'
      document.head.appendChild(link)
    })
  },

  // Optimize fonts
  optimizeFonts: () => {
    const fonts = document.querySelectorAll('link[rel="stylesheet"][href*="font"]')
    fonts.forEach(font => {
      font.setAttribute('rel', 'preload')
      font.setAttribute('as', 'style')
      font.setAttribute('onload', "this.onload=null;this.rel='stylesheet'")
    })
  },

  // Defer non-critical JavaScript
  deferNonCriticalJS: () => {
    const scripts = document.querySelectorAll('script[data-defer]')
    scripts.forEach(script => {
      script.setAttribute('defer', '')
    })
  },

  // Optimize CSS delivery
  optimizeCSSDelivery: () => {
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical])')
    stylesheets.forEach(stylesheet => {
      stylesheet.setAttribute('media', 'print')
      stylesheet.setAttribute('onload', "this.media='all'")
    })
  },

  // Implement resource hints
  addResourceHints: () => {
    const hints = [
      { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
      { rel: 'dns-prefetch', href: '//www.google-analytics.com' },
      { rel: 'preconnect', href: '//api.example.com' }
    ]

    hints.forEach(hint => {
      const link = document.createElement('link')
      link.rel = hint.rel
      link.href = hint.href
      document.head.appendChild(link)
    })
  }
}

// Initialize performance validation
export function initializePerformanceValidation(thresholds?: PerformanceThresholds): PerformanceValidator {
  const validator = new PerformanceValidator(thresholds)
  
  // Apply optimizations
  performanceOptimizations.lazyLoadImages()
  performanceOptimizations.optimizeFonts()
  performanceOptimizations.deferNonCriticalJS()
  performanceOptimizations.optimizeCSSDelivery()
  performanceOptimizations.addResourceHints()

  return validator
}

const PerformanceValidation = {
  PerformanceValidator,
  performanceOptimizations,
  initializePerformanceValidation,
  defaultThresholds
}

export default PerformanceValidation
