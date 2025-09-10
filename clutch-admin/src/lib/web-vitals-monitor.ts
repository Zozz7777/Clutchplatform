/**
 * Web Vitals Monitor
 * Core Web Vitals monitoring and tracking
 */

import { onCLS, onINP, onLCP, onTTFB, onFCP } from 'web-vitals'
import { PerformanceValidator } from './performance-validator'

export class WebVitalsMonitor {
  private validator: PerformanceValidator
  private isInitialized = false

  constructor(validator: PerformanceValidator) {
    this.validator = validator
  }

  public initialize(): void {
    if (this.isInitialized || typeof window === 'undefined') return

    this.setupCoreWebVitals()
    this.isInitialized = true
    console.log('Web Vitals monitoring initialized')
  }

  private setupCoreWebVitals(): void {
    // Cumulative Layout Shift (CLS)
    onCLS((metric) => {
      this.validator['metrics'].cls = metric.value
      this.validator['checkThreshold']('cls', metric.value)
      this.reportMetric('CLS', metric.value, metric.id)
    })

    // First Input Delay (FID)
    onINP((metric) => {
      this.validator['metrics'].fid = metric.value
      this.validator['checkThreshold']('fid', metric.value)
      this.reportMetric('FID', metric.value, metric.id)
    })

    // Largest Contentful Paint (LCP)
    onLCP((metric) => {
      this.validator['metrics'].lcp = metric.value
      this.validator['checkThreshold']('lcp', metric.value)
      this.reportMetric('LCP', metric.value, metric.id)
    })

    // Time to First Byte (TTFB)
    onTTFB((metric) => {
      this.validator['metrics'].ttfb = metric.value
      this.validator['checkThreshold']('ttfb', metric.value)
      this.reportMetric('TTFB', metric.value, metric.id)
    })

    // First Contentful Paint (FCP)
    onFCP((metric) => {
      this.validator['metrics'].fcp = metric.value
      this.validator['checkThreshold']('fcp', metric.value)
      this.reportMetric('FCP', metric.value, metric.id)
    })
  }

  private reportMetric(name: string, value: number, id: string): void {
    console.log(`[Web Vitals] ${name}: ${value.toFixed(2)} (ID: ${id})`)
    
    // Send to analytics/monitoring service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', name, {
        event_category: 'Web Vitals',
        value: Math.round(name === 'CLS' ? value * 1000 : value),
        event_label: id,
        non_interaction: true,
      })
    }

    // Send to custom analytics
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('Web Vital', {
        metric: name,
        value: value,
        id: id,
        timestamp: Date.now()
      })
    }
  }

  public getCurrentVitals(): {
    cls: number
    fid: number
    lcp: number
    ttfb: number
    fcp: number
  } {
    return {
      cls: this.validator['metrics'].cls,
      fid: this.validator['metrics'].fid,
      lcp: this.validator['metrics'].lcp,
      ttfb: this.validator['metrics'].ttfb,
      fcp: this.validator['metrics'].fcp
    }
  }

  public cleanup(): void {
    this.isInitialized = false
  }
}
