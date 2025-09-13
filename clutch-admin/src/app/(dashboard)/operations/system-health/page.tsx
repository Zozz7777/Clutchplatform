'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SnowCard, SnowCardHeader, SnowCardContent, SnowCardTitle, SnowCardDescription } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  Server, 
  Cpu, 
  HardDrive,
  Wifi,
  Shield,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Zap,
  Eye,
  Download
} from 'lucide-react'
import { apiClient } from '@/lib/consolidated-api'
import { useToast } from '@/components/ui/toast'
import { DataLoadingWrapper, ErrorState, EmptyState } from '@/components/ui/loading-states'

// Type definitions
interface SystemMetric {
  name: string
  value: string | number
  status: 'healthy' | 'warning' | 'error'
  icon?: string
  trend: string
}

interface Service {
  name: string
  status: 'healthy' | 'warning' | 'error'
  uptime: string
  responseTime: string
}

interface Alert {
  id: number
  message: string
  severity: 'low' | 'medium' | 'high'
  timestamp: string
  type: 'info' | 'warning' | 'error'
}

// Enhanced System Health Page with Real-time Data
export default function SystemHealthPage() {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [autoRefresh, setAutoRefresh] = useState(true)
  const toast = useToast()

  // Fetch system health data
  const fetchSystemHealth = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.getSystemHealth()
      
      if (response.success && response.data) {
        setSystemMetrics(response.data.metrics || [])
        setServices(response.data.services || [])
        setAlerts(response.data.alerts || [])
        setLastUpdated(new Date())
      } else {
        throw new Error(response.message || 'Failed to fetch system health data')
      }
    } catch (err) {
      console.error('Error fetching system health:', err)
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
      toast.error('Failed to load system health data', errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-refresh functionality
  useEffect(() => {
    fetchSystemHealth()
    
    if (autoRefresh) {
      const interval = setInterval(fetchSystemHealth, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  // Manual refresh
  const handleRefresh = () => {
    fetchSystemHealth()
  }

  // Export system health report
  const handleExport = async () => {
    try {
      const response = await apiClient.exportSystemHealthReport()
      if (response.success) {
        toast.success('System health report exported successfully')
      } else {
        throw new Error(response.message || 'Export failed')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      toast.error('Failed to export report', errorMessage)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'error': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />
      case 'warning': return <AlertTriangle className="h-4 w-4" />
      case 'error': return <AlertTriangle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">System Health</h1>
            <p className="text-muted-foreground">
              Monitor system performance and health metrics
            </p>
          </div>
        </div>
        <ErrorState 
          error={error} 
          onRetry={handleRefresh}
          title="Failed to load system health data"
          description="We couldn't load the system health metrics. Please try again."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Health</h1>
          <p className="text-muted-foreground">
            Real-time system performance and health monitoring
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-sm text-muted-foreground">
              Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
            </span>
          </div>
          <p className="text-sm text-muted-foreground flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
          <SnowButton 
            variant="outline" 
            onClick={handleRefresh} 
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </SnowButton>
          <SnowButton variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </SnowButton>
        </div>
      </div>

      {/* System Metrics */}
      <DataLoadingWrapper
        data={systemMetrics}
        isLoading={isLoading}
        error={null}
        loadingComponent={
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SnowCard key={i} variant="dark">
                <SnowCardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-slate-300 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-slate-300 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-slate-300 rounded w-full"></div>
                  </div>
                </SnowCardContent>
              </SnowCard>
            ))}
          </div>
        }
        emptyComponent={
          <EmptyState
            title="No system metrics available"
            description="System metrics are not currently available. Please try refreshing."
            action={
              <SnowButton onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Metrics
              </SnowButton>
            }
          />
        }
      >
        {(metrics) => (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => {
              const Icon = metric.icon || Activity
              return (
                <SnowCard key={metric.name} variant="dark">
                  <SnowCardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-300">{metric.name}</p>
                        <p className="text-2xl font-bold text-white">{metric.value}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getStatusColor(metric.status)}>
                            {metric.status}
                          </Badge>
                          <p className="text-xs text-blue-100">
                            {metric.trend} from last hour
                          </p>
                        </div>
                      </div>
                      <Icon className="h-8 w-8 text-blue-200" />
                    </div>
                  </SnowCardContent>
                </SnowCard>
              )
            })}
          </div>
        )}
      </DataLoadingWrapper>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Services Status */}
        <Card>
          <CardHeader>
            <CardTitle>Services Status</CardTitle>
            <CardDescription>
              Real-time status of all system services
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {services.map((service) => (
              <div key={service.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${getStatusColor(service.status)}`}>
                    {getStatusIcon(service.status)}
                  </div>
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Uptime: {service.uptime}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{service.responseTime}</p>
                  <p className="text-xs text-muted-foreground">Response time</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>
              Latest system alerts and notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-start space-x-3">
                <div className={`p-1 rounded-full ${getStatusColor(alert.type)}`}>
                  {getStatusIcon(alert.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{alert.message}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {alert.severity}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {alert.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* System Overview */}
      <Card>
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
          <CardDescription>
            Comprehensive system health dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <Server className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold">Server Status</h3>
              <p className="text-2xl font-bold text-green-600">Online</p>
              <p className="text-sm text-muted-foreground">All servers operational</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Shield className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-semibold">Security</h3>
              <p className="text-2xl font-bold text-green-600">Secure</p>
              <p className="text-sm text-muted-foreground">No security threats</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Activity className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold">Performance</h3>
              <p className="text-2xl font-bold text-green-600">Optimal</p>
              <p className="text-sm text-muted-foreground">System running smoothly</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
