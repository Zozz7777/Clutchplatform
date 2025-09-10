'use client'

import React, { useState, useEffect } from 'react'
import { PerformanceValidator, PerformanceMetrics, defaultThresholds } from '@/lib/performance-validation'
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  Download, 
  Image, 
  Cpu, 
  Monitor, 
  RefreshCw, 
  TrendingUp, 
  Zap 
} from 'lucide-react'

interface PerformanceDashboardProps {
  className?: string
}

export function PerformanceDashboard({ className }: PerformanceDashboardProps) {
  const [validator, setValidator] = useState<PerformanceValidator | null>(null)
  const [metrics, setMetrics] = useState<Partial<PerformanceMetrics>>({})
  const [score, setScore] = useState<number>(0)
  const [recommendations, setRecommendations] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const perfValidator = new PerformanceValidator(defaultThresholds)
    setValidator(perfValidator)

    // Update metrics every 5 seconds
    const interval = setInterval(() => {
      const currentMetrics = perfValidator.getMetrics()
      const currentScore = perfValidator.getScore()
      const currentRecommendations = perfValidator.getRecommendations()

      setMetrics(currentMetrics)
      setScore(currentScore)
      setRecommendations(currentRecommendations)
      setIsLoading(false)
    }, 5000)

    return () => {
      clearInterval(interval)
      perfValidator.cleanup()
    }
  }, [])

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const getMetricStatus = (name: keyof PerformanceMetrics, value: number) => {
    const threshold = defaultThresholds[name as keyof typeof defaultThresholds]
    if (!threshold) return 'unknown'

    if (value <= threshold.good) return 'good'
    if (value <= threshold.needsImprovement) return 'needsImprovement'
    return 'poor'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'needsImprovement':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'poor':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600'
      case 'needsImprovement':
        return 'text-yellow-600'
      case 'poor':
        return 'text-red-600'
      default:
        return 'text-gray-400'
    }
  }

  const formatMetricValue = (name: keyof PerformanceMetrics, value: number) => {
    switch (name) {
      case 'CLS':
        return value.toFixed(3)
      case 'FID':
      case 'LCP':
      case 'TTFB':
      case 'FCP':
      case 'loadTime':
      case 'renderTime':
        return `${value.toFixed(0)}ms`
      case 'memoryUsage':
      case 'imageOptimization':
      case 'cacheHitRate':
        return `${value.toFixed(1)}%`
      case 'bundleSize':
        return `${(value / 1024).toFixed(1)}KB`
      default:
        return value.toFixed(2)
    }
  }

  const coreWebVitals = [
    { name: 'CLS', label: 'Cumulative Layout Shift', icon: Monitor, description: 'Visual stability' },
    { name: 'FID', label: 'First Input Delay', icon: Zap, description: 'Interactivity' },
    { name: 'LCP', label: 'Largest Contentful Paint', icon: Image, description: 'Loading performance' },
    { name: 'TTFB', label: 'Time to First Byte', icon: Download, description: 'Server response' },
    { name: 'FCP', label: 'First Contentful Paint', icon: Activity, description: 'Perceived loading' }
  ]

  const customMetrics = [
    { name: 'loadTime', label: 'Load Time', icon: Clock, description: 'Total page load' },
    { name: 'renderTime', label: 'Render Time', icon: Monitor, description: 'DOM rendering' },
    { name: 'memoryUsage', label: 'Memory Usage', icon: Cpu, description: 'JavaScript heap' },
    { name: 'bundleSize', label: 'Bundle Size', icon: Database, description: 'JavaScript bundle' },
    { name: 'imageOptimization', label: 'Image Optimization', icon: Image, description: 'Optimized images' },
    { name: 'cacheHitRate', label: 'Cache Hit Rate', icon: TrendingUp, description: 'Cached resources' }
  ]

  if (isLoading) {
    return (
      <div className={`p-4 bg-white rounded-lg border border-gray-200 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Loading performance data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`p-4 bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Performance Dashboard</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(score)} ${getScoreColor(score)}`}>
          Score: {score.toFixed(0)}/100
        </div>
      </div>
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Core Web Vitals</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {coreWebVitals.map(({ name, label, icon: Icon, description }) => {
            const value = metrics[name as keyof PerformanceMetrics]
            const status = value ? getMetricStatus(name as keyof PerformanceMetrics, value) : 'unknown'
            
            return (
              <div key={name} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">{label}</span>
                  </div>
                  {getStatusIcon(status)}
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {value ? formatMetricValue(name as keyof PerformanceMetrics, value) : 'N/A'}
                </div>
                <div className="text-xs text-gray-500">{description}</div>
              </div>
            )
          })}
        </div>
      </div>
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Custom Metrics</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {customMetrics.map(({ name, label, icon: Icon, description }) => {
            const value = metrics[name as keyof PerformanceMetrics]
            const status = value ? getMetricStatus(name as keyof PerformanceMetrics, value) : 'unknown'
            
            return (
              <div key={name} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">{label}</span>
                  </div>
                  {getStatusIcon(status)}
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {value ? formatMetricValue(name as keyof PerformanceMetrics, value) : 'N/A'}
                </div>
                <div className="text-xs text-gray-500">{description}</div>
              </div>
            )
          })}
        </div>
      </div>
      {recommendations.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Recommendations</h4>
          <div className="space-y-2">
            {recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-yellow-800">{recommendation}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Performance Score</h4>
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${score}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span>50</span>
            <span>80</span>
            <span>100</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PerformanceDashboard
