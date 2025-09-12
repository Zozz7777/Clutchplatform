'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  Download, 
  Upload, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
  Package,
  Gauge,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

// Bundle analysis interface
interface BundleAnalysis {
  totalSize: number
  gzippedSize: number
  chunks: BundleChunk[]
  recommendations: BundleRecommendation[]
  score: number
  lastAnalyzed: Date
}

interface BundleChunk {
  name: string
  size: number
  gzippedSize: number
  modules: BundleModule[]
  type: 'vendor' | 'app' | 'shared' | 'runtime'
}

interface BundleModule {
  name: string
  size: number
  gzippedSize: number
  type: 'js' | 'css' | 'image' | 'font' | 'other'
}

interface BundleRecommendation {
  type: 'warning' | 'error' | 'info'
  message: string
  impact: 'high' | 'medium' | 'low'
  action: string
}

// Mock bundle analysis data
const mockBundleAnalysis: BundleAnalysis = {
  totalSize: 2048576, // 2MB
  gzippedSize: 512000, // 512KB
  chunks: [
    {
      name: 'vendor',
      size: 1024000,
      gzippedSize: 256000,
      type: 'vendor',
      modules: [
        { name: 'react', size: 512000, gzippedSize: 128000, type: 'js' },
        { name: 'react-dom', size: 256000, gzippedSize: 64000, type: 'js' },
        { name: 'lodash', size: 256000, gzippedSize: 64000, type: 'js' }
      ]
    },
    {
      name: 'app',
      size: 512000,
      gzippedSize: 128000,
      type: 'app',
      modules: [
        { name: 'main', size: 256000, gzippedSize: 64000, type: 'js' },
        { name: 'dashboard', size: 128000, gzippedSize: 32000, type: 'js' },
        { name: 'components', size: 128000, gzippedSize: 32000, type: 'js' }
      ]
    },
    {
      name: 'styles',
      size: 256000,
      gzippedSize: 64000,
      type: 'shared',
      modules: [
        { name: 'globals.css', size: 128000, gzippedSize: 32000, type: 'css' },
        { name: 'components.css', size: 128000, gzippedSize: 32000, type: 'css' }
      ]
    },
    {
      name: 'assets',
      size: 256576,
      gzippedSize: 64000,
      type: 'shared',
      modules: [
        { name: 'logo.png', size: 128000, gzippedSize: 32000, type: 'image' },
        { name: 'icons.svg', size: 128576, gzippedSize: 32000, type: 'image' }
      ]
    }
  ],
  recommendations: [
    {
      type: 'warning',
      message: 'Vendor bundle is large (1MB)',
      impact: 'high',
      action: 'Consider code splitting or tree shaking'
    },
    {
      type: 'info',
      message: 'Lodash is imported entirely',
      impact: 'medium',
      action: 'Use individual lodash imports'
    },
    {
      type: 'error',
      message: 'Unused CSS detected',
      impact: 'medium',
      action: 'Remove unused CSS classes'
    }
  ],
  score: 75,
  lastAnalyzed: new Date()
}

// Bundle analyzer component
export function BundleAnalyzer({ className = "" }: { className?: string }) {
  const [analysis, setAnalysis] = useState<BundleAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedChunk, setSelectedChunk] = useState<string | null>(null)

  const runAnalysis = useCallback(async () => {
    setIsAnalyzing(true)
    try {
      // Simulate analysis delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      setAnalysis(mockBundleAnalysis)
    } finally {
      setIsAnalyzing(false)
    }
  }, [])

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRecommendationIcon = (type: BundleRecommendation['type']) => {
    switch (type) {
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info': return <CheckCircle className="h-4 w-4 text-blue-500" />
    }
  }

  const getImpactColor = (impact: BundleRecommendation['impact']) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Bundle Analyzer
        </CardTitle>
        <CardDescription>
          Analyze and optimize your application bundle size
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Analysis Controls */}
          <div className="flex items-center justify-between">
            <Button onClick={runAnalysis} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <BarChart3 className="h-4 w-4 mr-2" />
              )}
              {isAnalyzing ? 'Analyzing...' : 'Analyze Bundle'}
            </Button>
            
            {analysis && (
              <div className="flex items-center gap-2">
                <Badge variant={analysis.score >= 90 ? 'default' : analysis.score >= 70 ? 'secondary' : 'destructive'}>
                  Score: {analysis.score}%
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Last analyzed: {analysis.lastAnalyzed.toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>

          {/* Bundle Overview */}
          {analysis && (
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{formatBytes(analysis.totalSize)}</div>
                <div className="text-sm text-muted-foreground">Total Size</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">{formatBytes(analysis.gzippedSize)}</div>
                <div className="text-sm text-muted-foreground">Gzipped Size</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>{analysis.score}%</div>
                <div className="text-sm text-muted-foreground">Performance Score</div>
              </div>
            </div>
          )}

          {/* Chunks Breakdown */}
          {analysis && (
            <div className="space-y-3">
              <h4 className="font-medium">Bundle Chunks</h4>
              {analysis.chunks.map((chunk) => (
                <div
                  key={chunk.name}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedChunk === chunk.name ? 'border-blue-500 bg-blue-50' : 'hover:bg-slate-50'
                  }`}
                  onClick={() => setSelectedChunk(selectedChunk === chunk.name ? null : chunk.name)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{chunk.type}</Badge>
                      <span className="font-medium">{chunk.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{formatBytes(chunk.size)}</span>
                      <span>({formatBytes(chunk.gzippedSize)} gzipped)</span>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(chunk.size / analysis.totalSize) * 100}%` }}
                    />
                  </div>

                  {/* Module details */}
                  {selectedChunk === chunk.name && (
                    <div className="mt-3 space-y-2">
                      {chunk.modules.map((module, index) => (
                        <div key={index} className="flex items-center justify-between text-sm p-2 bg-slate-50 rounded">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">{module.type}</Badge>
                            <span>{module.name}</span>
                          </div>
                          <span className="text-muted-foreground">{formatBytes(module.size)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Recommendations */}
          {analysis && analysis.recommendations.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Optimization Recommendations</h4>
              {analysis.recommendations.map((recommendation, index) => (
                <div
                  key={index}
                  className={`p-3 border rounded-lg ${getImpactColor(recommendation.impact)}`}
                >
                  <div className="flex items-start gap-3">
                    {getRecommendationIcon(recommendation.type)}
                    <div className="flex-1">
                      <div className="font-medium text-sm">{recommendation.message}</div>
                      <div className="text-sm opacity-90 mt-1">{recommendation.action}</div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {recommendation.impact} impact
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Performance metrics component
export function PerformanceMetrics({ className = "" }: { className?: string }) {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    bundleSize: 0,
    cacheHitRate: 0
  })

  const [isMonitoring, setIsMonitoring] = useState(false)

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true)
    // Simulate metrics collection
    const interval = setInterval(() => {
      setMetrics(prev => ({
        loadTime: Math.random() * 1000 + 500,
        renderTime: Math.random() * 100 + 50,
        memoryUsage: Math.random() * 50 + 10,
        bundleSize: Math.random() * 1000 + 500,
        cacheHitRate: Math.random() * 20 + 80
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false)
  }, [])

  useEffect(() => {
    if (isMonitoring) {
      const cleanup = startMonitoring()
      return cleanup
    }
  }, [isMonitoring, startMonitoring])

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gauge className="h-5 w-5" />
          Performance Metrics
        </CardTitle>
        <CardDescription>
          Real-time performance monitoring
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Monitoring Controls */}
          <div className="flex items-center justify-between">
            <Button
              onClick={isMonitoring ? stopMonitoring : startMonitoring}
              variant={isMonitoring ? 'destructive' : 'default'}
            >
              {isMonitoring ? (
                <XCircle className="h-4 w-4 mr-2" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
            </Button>
            
            {isMonitoring && (
              <Badge variant="default" className="animate-pulse">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                Monitoring
              </Badge>
            )}
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{metrics.loadTime.toFixed(0)}ms</div>
              <div className="text-sm text-muted-foreground">Load Time</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{metrics.renderTime.toFixed(0)}ms</div>
              <div className="text-sm text-muted-foreground">Render Time</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{metrics.memoryUsage.toFixed(1)}MB</div>
              <div className="text-sm text-muted-foreground">Memory Usage</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{metrics.cacheHitRate.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Cache Hit Rate</div>
            </div>
          </div>

          {/* Performance Trends */}
          <div className="space-y-2">
            <h4 className="font-medium">Performance Trends</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Load Time</span>
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-green-500" />
                  <span className="text-green-600">-12%</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Memory Usage</span>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-red-500" />
                  <span className="text-red-600">+5%</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Cache Hit Rate</span>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-green-600">+8%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
