'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Zap, 
  Database, 
  Server, 
  Users,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react'

export default function MonitoringPerformancePage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h')
  const [selectedMetric, setSelectedMetric] = useState('all')

  const performanceMetrics = [
    {
      name: 'Response Time',
      value: '245ms',
      change: '+12ms',
      trend: 'up',
      status: 'warning',
      threshold: 200
    },
    {
      name: 'Throughput',
      value: '1,247 req/s',
      change: '+89 req/s',
      trend: 'up',
      status: 'good',
      threshold: 1000
    },
    {
      name: 'Error Rate',
      value: '0.12%',
      change: '-0.03%',
      trend: 'down',
      status: 'good',
      threshold: 1
    },
    {
      name: 'CPU Usage',
      value: '68%',
      change: '+5%',
      trend: 'up',
      status: 'warning',
      threshold: 70
    }
  ]

  const systemComponents = [
    {
      name: 'API Gateway',
      status: 'healthy',
      responseTime: '45ms',
      uptime: '99.9%',
      requests: 15420,
      errors: 12
    },
    {
      name: 'Database',
      status: 'healthy',
      responseTime: '12ms',
      uptime: '99.8%',
      requests: 8920,
      errors: 5
    },
    {
      name: 'Authentication',
      status: 'warning',
      responseTime: '89ms',
      uptime: '98.5%',
      requests: 5670,
      errors: 23
    },
    {
      name: 'File Storage',
      status: 'healthy',
      responseTime: '23ms',
      uptime: '99.7%',
      requests: 3450,
      errors: 2
    }
  ]

  const performanceAlerts = [
    {
      id: 1,
      type: 'warning',
      message: 'High response time detected on API Gateway',
      timestamp: '2 minutes ago',
      severity: 'medium',
      component: 'API Gateway'
    },
    {
      id: 2,
      type: 'info',
      message: 'Performance optimization completed successfully',
      timestamp: '15 minutes ago',
      severity: 'low',
      component: 'System'
    },
    {
      id: 3,
      type: 'error',
      message: 'Authentication service experiencing delays',
      timestamp: '1 hour ago',
      severity: 'high',
      component: 'Authentication'
    }
  ]

  const topEndpoints = [
    {
      endpoint: '/api/v1/auth/login',
      requests: 15420,
      avgResponse: '89ms',
      errorRate: '0.1%',
      status: 'good'
    },
    {
      endpoint: '/api/v1/dashboard/consolidated',
      requests: 12340,
      avgResponse: '156ms',
      errorRate: '0.2%',
      status: 'good'
    },
    {
      endpoint: '/api/v1/mobile/dashboard',
      requests: 9876,
      avgResponse: '234ms',
      errorRate: '0.5%',
      status: 'warning'
    },
    {
      endpoint: '/api/v1/analytics/overview',
      requests: 7654,
      avgResponse: '445ms',
      errorRate: '1.2%',
      status: 'error'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100'
      case 'good': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'error': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? 
      <TrendingUp className="h-4 w-4 text-green-500" /> : 
      <TrendingDown className="h-4 w-4 text-red-500" />
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance Monitoring</h1>
          <p className="text-muted-foreground">
            Monitor system performance metrics and optimization opportunities
          </p>
        </div>
        <div className="flex space-x-2">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="15m">Last 15 minutes</option>
            <option value="1h">Last hour</option>
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
          </select>
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button>
            <BarChart3 className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {performanceMetrics.map((metric) => (
          <Card key={metric.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.name}
              </CardTitle>
              {getTrendIcon(metric.trend)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center space-x-2">
                <Badge className={getStatusColor(metric.status)}>
                  {metric.status}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  {metric.change} from last hour
                </p>
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div 
                    className={`h-1 rounded-full ${
                      metric.status === 'good' ? 'bg-green-500' : 
                      metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ 
                      width: `${Math.min((parseFloat(metric.value.replace(/[^\d.]/g, '')) / metric.threshold) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Threshold: {metric.threshold}{metric.name.includes('Rate') ? '%' : metric.name.includes('Usage') ? '%' : metric.name.includes('Time') ? 'ms' : ''}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* System Components */}
        <Card>
          <CardHeader>
            <CardTitle>System Components</CardTitle>
            <CardDescription>
              Real-time status of all system components
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {systemComponents.map((component, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${getStatusColor(component.status)}`}>
                    {component.status === 'healthy' ? 
                      <CheckCircle className="h-4 w-4" /> : 
                      <AlertTriangle className="h-4 w-4" />
                    }
                  </div>
                  <div>
                    <p className="font-medium">{component.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Uptime: {component.uptime}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{component.responseTime}</p>
                  <p className="text-xs text-muted-foreground">
                    {component.requests.toLocaleString()} requests
                  </p>
                  {component.errors > 0 && (
                    <p className="text-xs text-red-600">
                      {component.errors} errors
                    </p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Performance Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Alerts</CardTitle>
            <CardDescription>
              Recent performance alerts and notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {performanceAlerts.map((alert) => (
              <div key={alert.id} className="flex items-start space-x-3">
                <div className={`p-1 rounded-full ${getStatusColor(alert.type)}`}>
                  {alert.type === 'error' ? 
                    <AlertTriangle className="h-4 w-4" /> : 
                    alert.type === 'warning' ? 
                    <AlertTriangle className="h-4 w-4" /> : 
                    <CheckCircle className="h-4 w-4" />
                  }
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{alert.message}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {alert.component}
                    </Badge>
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {alert.timestamp}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Top Endpoints Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Top Endpoints Performance</CardTitle>
          <CardDescription>
            Performance metrics for most frequently called endpoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topEndpoints.map((endpoint, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <p className="font-mono text-sm">{endpoint.endpoint}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {endpoint.requests.toLocaleString()} requests
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Avg: {endpoint.avgResponse}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(endpoint.status)}>
                    {endpoint.errorRate}
                  </Badge>
                  <p className="text-sm font-medium mt-1">{endpoint.avgResponse}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
          <CardDescription>
            System performance summary and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
              <h3 className="font-semibold">Response Time</h3>
              <p className="text-2xl font-bold text-yellow-600">245ms</p>
              <p className="text-sm text-muted-foreground">Above target (200ms)</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Database className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-semibold">System Health</h3>
              <p className="text-2xl font-bold text-green-600">Good</p>
              <p className="text-sm text-muted-foreground">3 components healthy</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Activity className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold">Throughput</h3>
              <p className="text-2xl font-bold text-blue-600">1,247 req/s</p>
              <p className="text-sm text-muted-foreground">Above target</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">Performance Recommendations</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Optimize analytics endpoint queries - currently taking 445ms</li>
              <li>• Consider caching for frequently accessed dashboard data</li>
              <li>• Review database indexes for slow queries</li>
              <li>• Monitor CPU usage trend - currently at 68%</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
