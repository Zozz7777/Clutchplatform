/**
 * Bundle Optimization Utilities
 * Features:
 * - Bundle size analysis
 * - Tree shaking optimization
 * - Dynamic imports
 * - Compression strategies
 */

import { ComponentType } from 'react'

// Bundle size monitoring
export class BundleSizeMonitor {
  private static instance: BundleSizeMonitor
  private chunkSizes = new Map<string, number>()
  private totalSize = 0

  static getInstance(): BundleSizeMonitor {
    if (!BundleSizeMonitor.instance) {
      BundleSizeMonitor.instance = new BundleSizeMonitor()
    }
    return BundleSizeMonitor.instance
  }

  // Track chunk size
  trackChunkSize(chunkName: string, size: number): void {
    this.chunkSizes.set(chunkName, size)
    this.totalSize += size
  }

  // Get bundle statistics
  getBundleStats(): {
    totalSize: number
    chunkCount: number
    averageChunkSize: number
    largestChunks: Array<{ name: string; size: number; percentage: number }>
  } {
    const chunkCount = this.chunkSizes.size
    const averageChunkSize = chunkCount > 0 ? this.totalSize / chunkCount : 0
    
    const largestChunks = Array.from(this.chunkSizes.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, size]) => ({
        name,
        size,
        percentage: (size / this.totalSize) * 100
      }))

    return {
      totalSize: this.totalSize,
      chunkCount,
      averageChunkSize,
      largestChunks
    }
  }

  // Get size in human readable format
  formatSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }
}

// Tree shaking optimization
export const treeShakingOptimizations = {
  // Import only what you need
  lodash: {
    // Instead of: import _ from 'lodash'
    // Use: import { debounce, throttle } from 'lodash'
    recommended: [
      'import { debounce, throttle } from "lodash"',
      'import { isEmpty, isEqual } from "lodash"',
      'import { pick, omit } from "lodash"'
    ]
  },

  // Date-fns optimization
  dateFns: {
    // Instead of: import { format } from 'date-fns'
    // Use: import format from 'date-fns/format'
    recommended: [
      'import format from "date-fns/format"',
      'import parseISO from "date-fns/parseISO"',
      'import addDays from "date-fns/addDays"'
    ]
  },

  // React optimization
  react: {
    // Use specific imports
    recommended: [
      'import { useState, useEffect } from "react"',
      'import { useCallback, useMemo } from "react"',
      'import { Suspense, lazy } from "react"'
    ]
  }
}

// Dynamic import strategies
export class DynamicImportManager {
  private static instance: DynamicImportManager
  private loadedModules = new Set<string>()
  private loadingPromises = new Map<string, Promise<any>>()

  static getInstance(): DynamicImportManager {
    if (!DynamicImportManager.instance) {
      DynamicImportManager.instance = new DynamicImportManager()
    }
    return DynamicImportManager.instance
  }

  // Load module with caching
  async loadModule<T>(moduleName: string, importFunc: () => Promise<T>): Promise<T> {
    if (this.loadedModules.has(moduleName)) {
      return importFunc()
    }

    if (this.loadingPromises.has(moduleName)) {
      return this.loadingPromises.get(moduleName)!
    }

    const promise = importFunc().then(module => {
      this.loadedModules.add(moduleName)
      this.loadingPromises.delete(moduleName)
      return module
    })

    this.loadingPromises.set(moduleName, promise)
    return promise
  }

  // Preload module
  async preloadModule(moduleName: string, importFunc: () => Promise<any>): Promise<void> {
    try {
      await this.loadModule(moduleName, importFunc)
    } catch (error) {
      console.warn(`Failed to preload module ${moduleName}:`, error)
    }
  }

  // Get loaded modules
  getLoadedModules(): string[] {
    return Array.from(this.loadedModules)
  }
}

// Compression strategies
export const compressionStrategies = {
  // Gzip compression
  gzip: {
    enabled: true,
    level: 6, // Compression level (1-9)
    threshold: 1024 // Minimum size to compress
  },

  // Brotli compression
  brotli: {
    enabled: true,
    level: 4, // Compression level (0-11)
    threshold: 1024
  },

  // Image optimization
  images: {
    webp: true,
    avif: true,
    quality: 80,
    progressive: true
  }
}

// Bundle analysis configuration
export const bundleAnalysisConfig = {
  // Webpack bundle analyzer
  webpack: {
    analyzerMode: 'static',
    openAnalyzer: false,
    generateStatsFile: true,
    statsFilename: 'bundle-stats.json'
  },

  // Vite bundle analyzer
  vite: {
    enabled: true,
    outputDir: 'dist-analyze',
    open: false
  }
}

// Performance budgets
export const performanceBudgets = {
  // Bundle size limits
  bundleSize: {
    initial: 250 * 1024, // 250KB
    chunk: 100 * 1024,   // 100KB
    total: 1000 * 1024   // 1MB
  },

  // Load time limits
  loadTime: {
    firstContentfulPaint: 1500, // 1.5s
    largestContentfulPaint: 2500, // 2.5s
    timeToInteractive: 3000 // 3s
  }
}

// Bundle optimization recommendations
export const optimizationRecommendations = {
  // Code splitting
  codeSplitting: [
    'Split vendor bundles from application code',
    'Use route-based code splitting',
    'Implement component-level lazy loading',
    'Split large third-party libraries'
  ],

  // Tree shaking
  treeShaking: [
    'Use ES6 modules instead of CommonJS',
    'Import only needed functions from libraries',
    'Remove unused code and dead code',
    'Use sideEffects: false in package.json'
  ],

  // Compression
  compression: [
    'Enable Gzip compression',
    'Use Brotli compression for better ratios',
    'Optimize images with WebP/AVIF',
    'Minify CSS and JavaScript'
  ],

  // Caching
  caching: [
    'Implement proper cache headers',
    'Use service workers for offline caching',
    'Cache static assets with long TTL',
    'Implement cache invalidation strategies'
  ]
}

// Bundle size monitoring utility
export function monitorBundleSize(): void {
  if (typeof window === 'undefined') return

  const monitor = BundleSizeMonitor.getInstance()
  
  // Monitor performance entries
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'resource') {
        const resourceEntry = entry as PerformanceResourceTiming
        if (resourceEntry.name.includes('.js') || resourceEntry.name.includes('.css')) {
          const size = resourceEntry.transferSize || resourceEntry.encodedBodySize || 0
          const chunkName = resourceEntry.name.split('/').pop() || 'unknown'
          monitor.trackChunkSize(chunkName, size)
        }
      }
    }
  })

  observer.observe({ entryTypes: ['resource'] })

  // Log bundle stats periodically
  setInterval(() => {
    const stats = monitor.getBundleStats()
    if (stats.totalSize > 0) {
      console.log('Bundle Statistics:', {
        totalSize: monitor.formatSize(stats.totalSize),
        chunkCount: stats.chunkCount,
        averageChunkSize: monitor.formatSize(stats.averageChunkSize),
        largestChunks: stats.largestChunks.map(chunk => ({
          name: chunk.name,
          size: monitor.formatSize(chunk.size),
          percentage: chunk.percentage.toFixed(2) + '%'
        }))
      })
    }
  }, 30000) // Every 30 seconds
}

// Initialize bundle monitoring
if (typeof window !== 'undefined') {
  monitorBundleSize()
}
