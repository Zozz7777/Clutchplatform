'use client';

/**
 * Performance Validation Dashboard
 * Real-time performance monitoring and validation
 */

import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Zap,
  Target,
  BarChart3,
  Gauge,
  Lightbulb,
  Settings
} from 'lucide-react'
import { PerformanceValidator, PerformanceReport, PerformanceMetrics } from '@/lib/performance-validator'
import { WebVitalsMonitor } from '@/lib/web-vitals-monitor'

interface PerformanceValidationDashboardProps {
  className?: string
}

export const PerformanceValidationDashboard: React.FC<PerformanceValidationDashboardProps> = ({ 
  className = '' 
}) => {
  const [validator] = useState(() => PerformanceValidator.getInstance())
  const [webVitalsMonitor] = useState(() => new WebVitalsMonitor(validator))
  const [currentMetrics, setCurrentMetrics] = useState<PerformanceMetrics | null>(null)
  const [latestReport, setLatestReport] = useState<PerformanceReport | null>(null)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    initializeMonitoring()
  }, [])

  const initializeMonitoring = async () => {
    try {
      validator.initialize()
      webVitalsMonitor.initialize()
      
      const metrics = validator.getCurrentMetrics()
      const report = validator.getLatestReport()
      
      setCurrentMetrics(metrics)
      setLatestReport(report)
      setIsMonitoring(true)
      
      // Update metrics every 5 seconds
      const interval = setInterval(() => {
        const updatedMetrics = validator.getCurrentMetrics()
        setCurrentMetrics(updatedMetrics)
      }, 5000)
      
      return () => clearInterval(interval)
    } catch (error) {
      console.error('Failed to initialize performance monitoring:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateReport = () => {
    const report = validator.generateReport()
    setLatestReport(report)
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600'
    if (score >= 75) return 'text-yellow-600'
    if (score >= 50) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return 'bg-emerald-100 text-emerald-800'
    if (score >= 75) return 'bg-yellow-100 text-yellow-800'
    if (score >= 50) return 'bg-orange-100 text-orange-800'
    return 'bg-red-100 text-red-800'
  }

  const getMetricStatus = (value: number, thresholds: { good: number; needsImprovement: number; poor: number }) => {
    if (value <= thresholds.good) return { status: 'good', color: 'text-emerald-600' }
    if (value <= thresholds.needsImprovement) return { status: 'needs-improvement', color: 'text-yellow-600' }
    if (value <= thresholds.poor) return { status: 'poor', color: 'text-orange-600' }
    return { status: 'critical', color: 'text-red-600' }
  }

  const formatMetricValue = (value: number, unit: string = 'ms') => {
    if (unit === 'ms') return `${value.toFixed(0)}ms`
    if (unit === 'score') return `${value.toFixed(1)}`
    return `${value.toFixed(2)}`
  }

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Initializing performance monitoring...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Performance Validation</h2>
          <p className="text-muted-foreground">
            Real-time performance monitoring and validation in production
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isMonitoring ? 'default' : 'secondary'}>
            <Activity className="h-3 w-3 mr-1" />
            {isMonitoring ? 'Monitoring' : 'Stopped'}
          </Badge>
          <Button onClick={generateReport}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>
      {latestReport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Gauge className="h-5 w-5" />
              <span>Overall Performance Score</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-4xl font-bold">
                  <span className={getScoreColor(latestReport.scores.overall)}>
                    {latestReport.scores.overall}
                  </span>
                  <span className="text-muted-foreground">/100</span>
                </div>
                <div>
                  <Badge className={getScoreBadgeColor(latestReport.scores.overall)}>
                    {latestReport.scores.overall >= 90 ? 'Excellent' : 
                     latestReport.scores.overall >= 75 ? 'Good' : 
                     latestReport.scores.overall >= 50 ? 'Needs Improvement' : 'Poor'}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">
                    Last updated: {latestReport.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Performance Trend</p>
                <div className="flex items-center space-x-1">
                  {latestReport.trends.overallTrend === 'improving' ? (
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                  ) : latestReport.trends.overallTrend === 'degrading' ? (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  ) : (
                    <Activity className="h-4 w-4 text-gray-600" />
                  )}
                  <span className="capitalize text-sm">
                    {latestReport.trends.overallTrend}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      <Tabs defaultValue="core-web-vitals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="core-web-vitals">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="loading">Loading Performance</TabsTrigger>
          <TabsTrigger value="interactivity">Interactivity</TabsTrigger>
          <TabsTrigger value="business">Business Metrics</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>
        <TabsContent value="core-web-vitals" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {currentMetrics && latestReport && [
              { key: 'cls', label: 'Cumulative Layout Shift', unit: 'score', description: 'Visual stability' },
              { key: 'fid', label: 'First Input Delay', unit: 'ms', description: 'Interactivity' },
              { key: 'lcp', label: 'Largest Contentful Paint', unit: 'ms', description: 'Loading performance' }
            ].map(({ key, label, unit, description }) => {
              const value = currentMetrics[key as keyof PerformanceMetrics] as number
              const threshold = latestReport.thresholds[key as keyof typeof latestReport.thresholds]
              const status = getMetricStatus(value, threshold)
              
              return (
                <Card key={key}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold mb-1">
                      <span className={status.color}>
                        {formatMetricValue(value, unit)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={status.color}>
                        {status.status.replace('-', ' ')}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        Good: {formatMetricValue(threshold.good, unit)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
        <TabsContent value="loading" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {currentMetrics && latestReport && [
              { key: 'ttfb', label: 'Time to First Byte', unit: 'ms', description: 'Server response time' },
              { key: 'fcp', label: 'First Contentful Paint', unit: 'ms', description: 'First content render' },
              { key: 'pageLoadTime', label: 'Page Load Time', unit: 'ms', description: 'Complete page load' }
            ].map(({ key, label, unit, description }) => {
              const value = currentMetrics[key as keyof PerformanceMetrics] as number
              const threshold = latestReport.thresholds[key as keyof typeof latestReport.thresholds]
              const status = getMetricStatus(value, threshold)
              
              return (
                <Card key={key}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold mb-1">
                      <span className={status.color}>
                        {formatMetricValue(value, unit)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={status.color}>
                        {status.status.replace('-', ' ')}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        Good: {formatMetricValue(threshold.good, unit)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
        <TabsContent value="interactivity" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {currentMetrics && [
              { key: 'fid', label: 'First Input Delay', unit: 'ms', description: 'Time to respond to user input' },
              { key: 'timeToInteractive', label: 'Time to Interactive', unit: 'ms', description: 'When page becomes fully interactive' }
            ].map(({ key, label, unit, description }) => {
              const value = currentMetrics[key as keyof PerformanceMetrics] as number
              
              return (
                <Card key={key}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold mb-1">
                      {formatMetricValue(value, unit)}
                    </div>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
        <TabsContent value="business" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {currentMetrics && [
              { key: 'conversionRate', label: 'Conversion Rate', unit: 'count', description: 'User conversions' },
              { key: 'bounceRate', label: 'Bounce Rate', unit: 'count', description: 'Single-page sessions' },
              { key: 'sessionDuration', label: 'Session Duration', unit: 'ms', description: 'Average session time' },
              { key: 'pageViews', label: 'Page Views', unit: 'count', description: 'Total page views' }
            ].map(({ key, label, unit, description }) => {
              const value = currentMetrics[key as keyof PerformanceMetrics] as number
              
              return (
                <Card key={key}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold mb-1">
                      {formatMetricValue(value, unit)}
                    </div>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
        <TabsContent value="recommendations" className="space-y-4">
          {latestReport && latestReport.recommendations.length > 0 ? (
            <div className="space-y-4">
              {latestReport.recommendations.map((recommendation) => (
                <Card key={recommendation.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {recommendation.priority}
                        </Badge>
                        <Badge variant="outline">
                          {recommendation.effort} effort
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{recommendation.description}</p>
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Expected Impact:</h4>
                      <p className="text-sm text-muted-foreground">{recommendation.impact}</p>
                    </div>
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Implementation Steps:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {recommendation.implementation.map((step, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                              {index + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Category: {recommendation.category}
                      </span>
                      <span className="text-sm font-semibold">
                        Expected improvement: {recommendation.expectedImprovement}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Recommendations</h3>
                <p className="text-muted-foreground">
                  Your performance metrics are within acceptable thresholds.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
