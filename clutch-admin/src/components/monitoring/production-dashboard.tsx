'use client'

import React, { useState, useEffect, useRef } from 'react'
import { ProductionMonitor, Alert, ApplicationMetrics } from '@/lib/production-monitoring'
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  Download, 
  Eye, 
  HardDrive, 
  Cpu, 
  Monitor, 
  Network, 
  RefreshCw, 
  Server, 
  TrendingUp, 
  Users, 
  Zap,
  X,
  Bell,
  Settings,
  BarChart3,
  Wifi
} from 'lucide-react'

interface ProductionDashboardProps {
  className?: string
}

export function ProductionDashboard({ className }: ProductionDashboardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [metrics, setMetrics] = useState<ApplicationMetrics[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [systemHealth, setSystemHealth] = useState<'healthy' | 'degraded' | 'unhealthy'>('healthy')
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'alerts' | 'logs'>('overview')
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('1h')
  
  const monitor = useRef<ProductionMonitor | null>(null)

  useEffect(() => {
    // Initialize monitoring
    monitor.current = ProductionMonitor.getInstance()
    
    // Subscribe to metrics updates
    const unsubscribeMetrics = monitor.current.subscribeToMetrics((newMetrics) => {
      setMetrics(prev => [...prev, newMetrics].slice(-100)) // Keep last 100 metrics
    })

    // Subscribe to alerts
    const unsubscribeAlerts = monitor.current.subscribeToAlerts((newAlert) => {
      setAlerts(prev => [newAlert, ...prev].slice(-50)) // Keep last 50 alerts
    })

    // Initial data load
    setMetrics(monitor.current.getMetrics())
    setAlerts(monitor.current.getAlerts())
    setSystemHealth(monitor.current.getSystemHealth())
    setIsLoading(false)

    return () => {
      unsubscribeMetrics()
      unsubscribeAlerts()
    }
  }, [])

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600 bg-green-100'
      case 'degraded': return 'text-yellow-600 bg-yellow-100'
      case 'unhealthy': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="h-5 w-5" />
      case 'degraded': return <AlertTriangle className="h-5 w-5" />
      case 'unhealthy': return <X className="h-5 w-5" />
      default: return <Clock className="h-5 w-5" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100'
      case 'error': return 'text-red-600 bg-red-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'info': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <X className="h-4 w-4" />
      case 'error': return <X className="h-4 w-4" />
      case 'warning': return <AlertTriangle className="h-4 w-4" />
      case 'info': return <Bell className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatBytes = (bytes: number) => {
    if (bytes >= 1000000000) return `${(bytes / 1000000000).toFixed(1)}GB`
    if (bytes >= 1000000) return `${(bytes / 1000000).toFixed(1)}MB`
    if (bytes >= 1000) return `${(bytes / 1000).toFixed(1)}KB`
    return `${bytes}B`
  }

  const formatDuration = (ms: number) => {
    if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`
    return `${ms.toFixed(0)}ms`
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 right-4 z-40 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary-dark transition-colors ${className}`}
        aria-label="Open production dashboard"
      >
        <Monitor className="h-6 w-6" />
      </button>
    )
  }

  if (isLoading) {
    return (
      <div className={`fixed inset-4 z-50 bg-white rounded-lg shadow-xl border border-gray-200 ${className}`}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600">Loading production dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  const latestMetrics = metrics[metrics.length - 1]
  const activeAlerts = alerts.filter(alert => alert.status === 'firing')

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setIsOpen(false)} />
      
      <div className={`fixed inset-4 z-50 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden ${className}`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Monitor className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-gray-900">Production Dashboard</h2>
            </div>
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getHealthColor(systemHealth)}`}>
              {getHealthIcon(systemHealth)}
              <span className="capitalize">{systemHealth}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="1h">Last Hour</option>
              <option value="6h">Last 6 Hours</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        <div className="flex border-b border-gray-200">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'metrics', label: 'Metrics', icon: Activity },
            { id: 'alerts', label: 'Alerts', icon: Bell },
            { id: 'logs', label: 'Logs', icon: Eye }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
              {id === 'alerts' && activeAlerts.length > 0 && (
                <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                  {activeAlerts.length}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && latestMetrics && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600">Requests</h3>
                    <Activity className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatNumber(latestMetrics.requests.total)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {latestMetrics.requests.rate.toFixed(1)}/sec
                  </div>
                </div>

                <div className="p-6 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600">Response Time</h3>
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatDuration(latestMetrics.responseTime.p95)}
                  </div>
                  <div className="text-sm text-gray-500">
                    P95
                  </div>
                </div>

                <div className="p-6 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600">Active Users</h3>
                    <Users className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatNumber(latestMetrics.users.active)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatNumber(latestMetrics.users.total)} total
                  </div>
                </div>

                <div className="p-6 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600">Error Rate</h3>
                    <AlertTriangle className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {(latestMetrics.errors.rate * 100).toFixed(2)}%
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatNumber(latestMetrics.errors.total)} errors
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Download className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Bundle Size</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {formatBytes(latestMetrics.performance.bundleSize)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Load Time</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {formatDuration(latestMetrics.performance.loadTime)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Monitor className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Render Time</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {formatDuration(latestMetrics.performance.renderTime)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Cpu className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Memory Usage</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {latestMetrics.performance.memoryUsage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Server className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Application</span>
                      </div>
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(systemHealth)}`}>
                        {getHealthIcon(systemHealth)}
                        <span className="capitalize">{systemHealth}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Database className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Database</span>
                      </div>
                      <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium text-green-600 bg-green-100">
                        <CheckCircle className="h-3 w-3" />
                        <span>Healthy</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Network className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Network</span>
                      </div>
                      <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium text-green-600 bg-green-100">
                        <CheckCircle className="h-3 w-3" />
                        <span>Healthy</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <HardDrive className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Storage</span>
                      </div>
                      <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium text-green-600 bg-green-100">
                        <CheckCircle className="h-3 w-3" />
                        <span>Healthy</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 bg-gray-50 rounded-lg">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Response Time Trend</h4>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                      <p>Chart would be rendered here</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-gray-50 rounded-lg">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Error Rate Trend</h4>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 mx-auto mb-2" />
                      <p>Chart would be rendered here</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Active Alerts</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {activeAlerts.length} active alerts
                  </span>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Settings className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {activeAlerts.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">All Clear!</h4>
                    <p className="text-gray-600">No active alerts at this time.</p>
                  </div>
                ) : (
                  activeAlerts.map((alert) => (
                    <div key={alert.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                            {getSeverityIcon(alert.severity)}
                            <span className="capitalize">{alert.severity}</span>
                          </div>
                          <h4 className="text-md font-medium text-gray-900">{alert.title}</h4>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className="text-xs text-gray-500">
                            Duration: {alert.duration ? formatDuration(alert.duration) : 'N/A'}
                          </span>
                          <span className="text-xs text-gray-500">
                            Service: {alert.labels.service || 'N/A'}
                          </span>
                        </div>
                        <button className="text-sm text-primary hover:text-primary-dark">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">System Logs</h3>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
                <div className="space-y-1">
                  <div>[2024-12-01 10:30:15] INFO: Application started successfully</div>
                  <div>[2024-12-01 10:30:16] INFO: Database connection established</div>
                  <div>[2024-12-01 10:30:17] INFO: Redis cache initialized</div>
                  <div>[2024-12-01 10:30:18] INFO: Monitoring system activated</div>
                  <div>[2024-12-01 10:30:19] INFO: All services healthy</div>
                  <div>[2024-12-01 10:30:20] INFO: Ready to accept requests</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default ProductionDashboard
