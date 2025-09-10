'use client'

import React, { useState, useEffect } from 'react'
import { SnowCard, SnowCardHeader, SnowCardContent, SnowCardTitle, SnowCardDescription } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowInput, SnowSearchInput } from '@/components/ui/snow-input'
import { SnowTable, SnowTableHeader, SnowTableBody, SnowTableRow, SnowTableCell, SnowTableHead, SnowTableFooter, SnowTableCaption } from '@/components/ui/snow-table'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Bell, 
  BellOff, 
  Settings, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  RefreshCw, 
  Download, 
  Clock, 
  Target, 
  Activity, 
  Server, 
  Database, 
  Network, 
  Smartphone, 
  Globe, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  PoundSterling, 
  Mail, 
  MessageSquare, 
  Phone,
  Shield,
  Gauge,
  BarChart3,
  LineChart,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { useMonitoringDashboard } from '@/hooks/useMonitoringDashboard'
import { toast } from 'sonner'

interface MonitoringAlert {
  id: string
  name: string
  description: string
  type: 'performance' | 'availability' | 'error' | 'security' | 'business'
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'active' | 'resolved' | 'acknowledged' | 'suppressed'
  metric: string
  threshold: number
  currentValue: number
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals'
  service: string
  platform: 'web' | 'mobile' | 'api' | 'database' | 'all'
  triggeredAt: string
  resolvedAt?: string
  acknowledgedBy?: string
  notificationChannels: string[]
  escalationLevel: number
  impactLevel: 'none' | 'low' | 'medium' | 'high' | 'critical'
  affectedUsers: number
  estimatedDowntime: number
}

interface AlertRule {
  id: string
  name: string
  description: string
  metric: string
  condition: string
  threshold: number
  enabled: boolean
  severity: string
  notificationChannels: string[]
  cooldownMinutes: number
  service: string
  environment: 'production' | 'staging' | 'development'
  createdAt: string
  lastTriggered?: string
  triggerCount: number
}

interface SystemMetric {
  service: string
  metric: string
  currentValue: number
  threshold: number
  status: 'healthy' | 'warning' | 'critical'
  trend: 'up' | 'down' | 'stable'
  lastUpdated: string
}

interface IncidentHistory {
  id: string
  title: string
  severity: string
  status: string
  startTime: string
  endTime?: string
  duration: number
  impactedServices: string[]
  rootCause: string
  resolution: string
}

export default function MonitoringAlertsPage() {
  // Use consolidated monitoring dashboard hook instead of multiple separate API calls
  const {
    data: consolidatedData,
    isLoading,
    error,
    lastUpdated,
    refreshData,
    alerts,
    metrics,
    incidents
  } = useMonitoringDashboard()

  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('alerts')

  // Create systemMetrics from available metrics data
  const systemMetrics = metrics ? [
    {
      service: 'API Response Time',
      metric: 'Response Time',
      currentValue: `${metrics.systemHealth.responseTime}ms`,
      currentValueNum: metrics.systemHealth.responseTime,
      threshold: '500ms',
      thresholdNum: 500,
      status: metrics.systemHealth.responseTime < 500 ? 'healthy' : 'warning',
      trend: 'stable'
    },
    {
      service: 'Error Rate',
      metric: 'Error Rate',
      currentValue: `${metrics.systemHealth.errorRate}%`,
      currentValueNum: metrics.systemHealth.errorRate,
      threshold: '5%',
      thresholdNum: 5,
      status: metrics.systemHealth.errorRate < 5 ? 'healthy' : 'critical',
      trend: 'stable'
    },
    {
      service: 'CPU Usage',
      metric: 'CPU Usage',
      currentValue: `${metrics.performance.cpuUsage}%`,
      currentValueNum: metrics.performance.cpuUsage,
      threshold: '80%',
      thresholdNum: 80,
      status: metrics.performance.cpuUsage < 80 ? 'healthy' : 'warning',
      trend: 'stable'
    },
    {
      service: 'Memory Usage',
      metric: 'Memory Usage',
      currentValue: `${metrics.performance.memoryUsage}%`,
      currentValueNum: metrics.performance.memoryUsage,
      threshold: '85%',
      thresholdNum: 85,
      status: metrics.performance.memoryUsage < 85 ? 'healthy' : 'warning',
      trend: 'stable'
    }
  ] : []

  // Create alertRules array
  const alertRules = [
    {
      id: '1',
      name: 'High CPU Usage',
      description: 'Alert when CPU usage exceeds 80%',
      metric: 'cpu_usage',
      condition: 'greater_than',
      threshold: 80,
      enabled: true,
      service: 'System',
      severity: 'warning',
      triggerCount: 3
    },
    {
      id: '2',
      name: 'High Memory Usage',
      description: 'Alert when memory usage exceeds 85%',
      metric: 'memory_usage',
      condition: 'greater_than',
      threshold: 85,
      enabled: true,
      service: 'System',
      severity: 'warning',
      triggerCount: 1
    },
    {
      id: '3',
      name: 'High Error Rate',
      description: 'Alert when error rate exceeds 5%',
      metric: 'error_rate',
      condition: 'greater_than',
      threshold: 5,
      enabled: true,
      service: 'API',
      severity: 'critical',
      triggerCount: 7
    },
    {
      id: '4',
      name: 'Slow Response Time',
      description: 'Alert when response time exceeds 500ms',
      metric: 'response_time',
      condition: 'greater_than',
      threshold: 500,
      enabled: true,
      service: 'API',
      severity: 'warning',
      triggerCount: 2
    }
  ]

  // Create incidentHistory array
  const incidentHistory = [
    {
      id: '1',
      title: 'API Response Time Spike',
      description: 'API response time exceeded 2 seconds for 5 minutes',
      severity: 'high',
      status: 'resolved',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      duration: '15 minutes',
      affectedServices: ['API Gateway', 'User Service'],
      rootCause: 'High database query load during peak hours',
      resolution: 'Optimized database queries and added caching layer'
    },
    {
      id: '2',
      title: 'Database Connection Pool Exhaustion',
      description: 'Database connection pool reached maximum capacity',
      severity: 'critical',
      status: 'resolved',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      duration: '45 minutes',
      affectedServices: ['Database', 'User Service', 'Order Service'],
      rootCause: 'Connection leaks in legacy code',
      resolution: 'Fixed connection leaks and increased pool size'
    },
    {
      id: '3',
      title: 'Memory Leak Detected',
      description: 'Memory usage continuously increased over 2 hours',
      severity: 'medium',
      status: 'investigating',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      duration: '2 hours',
      affectedServices: ['Payment Service'],
      rootCause: 'Under investigation',
      resolution: 'Pending analysis'
    }
  ]

  // Handle error state
  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load monitoring data</p>
          <SnowButton onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </SnowButton>
        </div>
      </div>
    )
  }


  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-blue-500'
      default: return 'bg-red-500'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-500'
      case 'acknowledged': return 'bg-yellow-500'
      case 'resolved': return 'bg-green-500'
      case 'suppressed': return 'bg-red-500'
      default: return 'bg-red-500'
    }
  }

  const getMetricStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500'
      case 'warning': return 'bg-yellow-500'
      case 'critical': return 'bg-red-500'
      default: return 'bg-red-500'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUpRight className="h-4 w-4 text-red-500" />
      case 'down': return <ArrowDownRight className="h-4 w-4 text-green-500" />
      case 'stable': return <div className="h-4 w-4 bg-gray-400 rounded-full" />
      default: return null
    }
  }

  const acknowledgeAlert = async (alertId: string) => {
    try {
      // Note: In a real implementation, you would make an API call here
      // For now, we'll just show a success message and refresh the data
      toast.success('Alert acknowledged')
      refreshData()
    } catch (error) {
      toast.error('Failed to acknowledge alert')
    }
  }

  const resolveAlert = async (alertId: string) => {
    try {
      // Note: In a real implementation, you would make an API call here
      // For now, we'll just show a success message and refresh the data
      toast.success('Alert resolved')
      refreshData()
    } catch (error) {
      toast.error('Failed to resolve alert')
    }
  }

  const toggleAlertRule = async (ruleId: string) => {
    try {
      // Note: In a real implementation, you would make an API call here
      // For now, we'll just show a success message and refresh the data
      toast.success('Alert rule toggled')
      refreshData()
    } catch (error) {
      toast.error('Failed to toggle alert rule')
    }
  }

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.source.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter
    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter
    return matchesSearch && matchesSeverity && matchesStatus
  })

  // Sample data for charts
  const alertTrendsData = [
    { name: '00:00', critical: 2, high: 5, medium: 8, low: 3 },
    { name: '04:00', critical: 1, high: 3, medium: 6, low: 4 },
    { name: '08:00', critical: 3, high: 7, medium: 12, low: 6 },
    { name: '12:00', critical: 2, high: 4, medium: 9, low: 5 },
    { name: '16:00', critical: 1, high: 6, medium: 11, low: 7 },
    { name: '20:00', critical: 2, high: 5, medium: 8, low: 4 }
  ]

  const responseTimeData = [
    { name: '1h ago', value: 245 },
    { name: '45m ago', value: 289 },
    { name: '30m ago', value: 2850 },
    { name: '15m ago', value: 2920 },
    { name: 'Now', value: 2785 }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monitoring & Alerts</h1>
          <p className="text-muted-foreground">
            Real-time system monitoring and automated alerting
          </p>
        </div>
        <div className="flex gap-3">
          <SnowButton variant="outline" onClick={refreshData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </SnowButton>
                     <SnowButton variant="default">
              <Plus className="h-4 w-4 mr-2" />
              Create Alert Rule
            </SnowButton>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                 <SnowCard variant="dark">
           <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Critical Alerts</p>
                <p className="text-2xl font-bold text-white">
                  {alerts.filter(a => a.severity === 'critical' && a.status === 'active').length}
                </p>
                <p className="text-red-100 text-xs">
                  {alerts.filter(a => a.severity === 'critical').length} total
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-200" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard variant="dark">
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Active Alerts</p>
                <p className="text-2xl font-bold text-white">
                  {alerts.filter(a => a.status === 'active').length}
                </p>
                <p className="text-orange-100 text-xs">
                  {alerts.filter(a => a.status === 'acknowledged').length} acknowledged
                </p>
              </div>
              <Bell className="h-8 w-8 text-orange-200" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard variant="dark">
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">System Health</p>
                <p className="text-2xl font-bold text-white">
                  {metrics ? Math.round(metrics.systemHealth.uptime) : 0}%
                </p>
                <p className="text-green-100 text-xs">
                  {metrics ? `${metrics.alerts.resolved}/${metrics.alerts.total}` : '0/0'} alerts resolved
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-200" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard variant="dark">
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Alert Rules</p>
                <p className="text-2xl font-bold text-white">{metrics ? metrics.alerts.total : 0}</p>
                <p className="text-blue-100 text-xs">
                  {metrics ? metrics.alerts.active : 0} active
                </p>
              </div>
              <Settings className="h-8 w-8 text-blue-200" />
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
      <div className="flex space-x-1 bg-slate-800 rounded-lg p-1">
        {[
          { id: 'alerts', label: 'Active Alerts', icon: AlertTriangle },
          { id: 'metrics', label: 'System Metrics', icon: Activity },
          { id: 'rules', label: 'Alert Rules', icon: Settings },
          { id: 'incidents', label: 'Incident History', icon: Clock }
        ].map((tab) => (
          <SnowButton
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1"
          >
            <tab.icon className="h-4 w-4 mr-2" />
            {tab.label}
          </SnowButton>
        ))}
      </div>
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          <SnowCard>
            <SnowCardContent className="p-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-64">
                  <SnowSearchInput
                    placeholder="Search alerts by name, service, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-700 rounded-lg bg-slate-800 text-white"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-700 rounded-lg bg-slate-800 text-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="resolved">Resolved</option>
                  <option value="suppressed">Suppressed</option>
                </select>
              </div>
            </SnowCardContent>
          </SnowCard>
          <SnowCard>
            <SnowCardHeader>
              <SnowCardTitle>Active Alerts ({filteredAlerts.length})</SnowCardTitle>
            </SnowCardHeader>
            <SnowCardContent>
              <SnowTable>
                <SnowTableHeader>
                  <SnowTableRow>
                    <SnowTableHead>Alert</SnowTableHead>
                    <SnowTableHead>Service</SnowTableHead>
                    <SnowTableHead>Severity</SnowTableHead>
                    <SnowTableHead>Status</SnowTableHead>
                    <SnowTableHead>Value</SnowTableHead>
                    <SnowTableHead>Triggered</SnowTableHead>
                    <SnowTableHead>Actions</SnowTableHead>
                  </SnowTableRow>
                </SnowTableHeader>
                <SnowTableBody>
                  {filteredAlerts.map((alert) => (
                    <SnowTableRow key={alert.id}>
                      <SnowTableCell>
                        <div>
                          <p className="font-medium text-white">{alert.title}</p>
                          <p className="text-sm text-slate-600">{alert.description}</p>
                        </div>
                      </SnowTableCell>
                      <SnowTableCell>
                        <div className="flex items-center space-x-2">
                          <Server className="h-4 w-4 text-slate-600" />
                          <span className="capitalize">{alert.source.replace('-', ' ')}</span>
                        </div>
                      </SnowTableCell>
                      <SnowTableCell>
                        <Badge className={`${getSeverityColor(alert.severity)} text-white`}>
                          {alert.severity}
                        </Badge>
                      </SnowTableCell>
                      <SnowTableCell>
                        <Badge className={`${getStatusColor(alert.status)} text-white`}>
                          {alert.status}
                        </Badge>
                      </SnowTableCell>
                      <SnowTableCell>
                        <div>
                          <p className="font-medium">{alert.status}</p>
                          <p className="text-sm text-slate-600">{new Date(alert.timestamp).toLocaleString()}</p>
                        </div>
                      </SnowTableCell>
                      <SnowTableCell>
                        <div>
                          <p className="text-sm">{new Date(alert.timestamp).toLocaleDateString()}</p>
                          <p className="text-xs text-slate-600">{new Date(alert.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </SnowTableCell>
                      <SnowTableCell>
                        <div className="flex space-x-2">
                          {alert.status === 'active' && (
                            <SnowButton 
                              variant="outline" 
                              size="sm"
                              onClick={() => acknowledgeAlert(alert.id)}
                            >
                              Ack
                            </SnowButton>
                          )}
                          {(alert.status === 'active' || alert.status === 'acknowledged') && (
                            <SnowButton 
                              variant="outline" 
                              size="sm"
                              onClick={() => resolveAlert(alert.id)}
                            >
                              Resolve
                            </SnowButton>
                          )}
                          <SnowButton variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </SnowButton>
                        </div>
                      </SnowTableCell>
                    </SnowTableRow>
                  ))}
                </SnowTableBody>
              </SnowTable>
            </SnowCardContent>
          </SnowCard>
        </div>
      )}

      {activeTab === 'metrics' && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {systemMetrics.map((metric, index) => (
              <SnowCard key={index}>
                <SnowCardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getMetricStatusColor(metric.status)}`} />
                      <h4 className="font-semibold">{metric.service}</h4>
                    </div>
                    {getTrendIcon(metric.trend)}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.metric}</p>
                    <p className="text-2xl font-bold">{metric.currentValue}</p>
                    <p className="text-sm text-muted-foreground">
                      Threshold: {metric.threshold}
                    </p>
                  </div>
                  <div className="mt-3 w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        metric.status === 'healthy' ? 'bg-green-500' : 
                        metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min((metric.currentValueNum / metric.thresholdNum) * 100, 100)}%` }}
                    />
                  </div>
                </SnowCardContent>
              </SnowCard>
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <SnowCard>
              <SnowCardHeader>
                <SnowCardTitle>Alert Trends (24h)</SnowCardTitle>
                <SnowCardDescription>Alert volume by severity over time</SnowCardDescription>
              </SnowCardHeader>
              <SnowCardContent>
                <div className="h-64 bg-slate-900 rounded-lg flex items-center justify-center text-slate-400 text-sm">
                  Chart Placeholder
                </div>
              </SnowCardContent>
            </SnowCard>

            <SnowCard>
              <SnowCardHeader>
                <SnowCardTitle>Response Time Spike</SnowCardTitle>
                <SnowCardDescription>Customer API response time over last hour</SnowCardDescription>
              </SnowCardHeader>
              <SnowCardContent>
                <div className="h-64 bg-slate-900 rounded-lg flex items-center justify-center text-slate-400 text-sm">
                  Chart Placeholder
                </div>
              </SnowCardContent>
            </SnowCard>
          </div>
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="space-y-6">
          <SnowCard>
            <SnowCardHeader>
              <SnowCardTitle>Alert Rules ({alertRules.length})</SnowCardTitle>
              <SnowCardDescription>Configure monitoring thresholds and notifications</SnowCardDescription>
            </SnowCardHeader>
            <SnowCardContent>
              <div className="space-y-4">
                {alertRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-4 bg-slate-50 bg-slate-100 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${rule.enabled ? 'bg-green-500' : 'bg-red-500'}`} />
                      <div>
                        <h4 className="font-semibold">{rule.name}</h4>
                        <p className="text-sm text-muted-foreground">{rule.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge variant="outline">{rule.service}</Badge>
                          <Badge variant="secondary">{rule.severity}</Badge>
                          <span className="text-xs text-muted-foreground">
                            Triggered {rule.triggerCount} times
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <SnowButton
                        variant="outline"
                        size="sm"
                        onClick={() => toggleAlertRule(rule.id)}
                      >
                        {rule.enabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </SnowButton>
                      <SnowButton variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </SnowButton>
                      <SnowButton variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </SnowButton>
                    </div>
                  </div>
                ))}
              </div>
            </SnowCardContent>
          </SnowCard>
        </div>
      )}

      {activeTab === 'incidents' && (
        <div className="space-y-6">
          <SnowCard>
            <SnowCardHeader>
              <SnowCardTitle>Recent Incidents</SnowCardTitle>
              <SnowCardDescription>Historical incident data and resolutions</SnowCardDescription>
            </SnowCardHeader>
            <SnowCardContent>
              <div className="space-y-4">
                {incidentHistory.map((incident) => (
                  <div key={incident.id} className="p-4 bg-slate-50 bg-slate-100 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{incident.title}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={`${getSeverityColor(incident.severity)} text-white`}>
                            {incident.severity}
                          </Badge>
                          <Badge variant="outline">{incident.status}</Badge>
                          <span className="text-sm text-muted-foreground">
                            Duration: {incident.duration} minutes
                          </span>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(incident.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm font-medium mb-1">Root Cause:</p>
                        <p className="text-sm text-muted-foreground">{incident.rootCause}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Resolution:</p>
                        <p className="text-sm text-muted-foreground">{incident.resolution}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-1">Impacted Services:</p>
                      <div className="flex flex-wrap gap-1">
                        {incident.affectedServices.map((service, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SnowCardContent>
          </SnowCard>
        </div>
      )}
    </div>
  )
}


