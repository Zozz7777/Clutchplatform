'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Zap, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Activity
} from 'lucide-react'

export default function APIAnalyticsPage() {
  const apiMetrics = [
    {
      name: 'Total Requests',
      value: '2.4M',
      change: '+12.5%',
      trend: 'up',
      period: 'last 24h'
    },
    {
      name: 'Success Rate',
      value: '99.2%',
      change: '+0.3%',
      trend: 'up',
      period: 'last 24h'
    },
    {
      name: 'Avg Response Time',
      value: '156ms',
      change: '-8ms',
      trend: 'down',
      period: 'last 24h'
    },
    {
      name: 'Active Users',
      value: '1,847',
      change: '+156',
      trend: 'up',
      period: 'last 24h'
    }
  ]

  const topAPIs = [
    {
      endpoint: '/api/v1/auth/login',
      requests: 45620,
      successRate: '99.8%',
      avgResponse: '89ms',
      users: 1247
    },
    {
      endpoint: '/api/v1/dashboard/consolidated',
      requests: 38240,
      successRate: '99.5%',
      avgResponse: '156ms',
      users: 892
    },
    {
      endpoint: '/api/v1/mobile/dashboard',
      requests: 29876,
      successRate: '98.9%',
      avgResponse: '234ms',
      users: 654
    },
    {
      endpoint: '/api/v1/analytics/overview',
      requests: 21540,
      successRate: '97.2%',
      avgResponse: '445ms',
      users: 423
    }
  ]

  const errorAnalysis = [
    {
      endpoint: '/api/v1/analytics/overview',
      errorType: 'Timeout',
      count: 234,
      percentage: '1.1%',
      severity: 'high'
    },
    {
      endpoint: '/api/v1/mobile/dashboard',
      errorType: 'Rate Limit',
      count: 89,
      percentage: '0.3%',
      severity: 'medium'
    },
    {
      endpoint: '/api/v1/auth/login',
      errorType: 'Validation Error',
      count: 45,
      percentage: '0.1%',
      severity: 'low'
    }
  ]

  const usageByHour = [
    { hour: '00:00', requests: 1200 },
    { hour: '02:00', requests: 800 },
    { hour: '04:00', requests: 600 },
    { hour: '06:00', requests: 900 },
    { hour: '08:00', requests: 2500 },
    { hour: '10:00', requests: 3200 },
    { hour: '12:00', requests: 3800 },
    { hour: '14:00', requests: 3500 },
    { hour: '16:00', requests: 3100 },
    { hour: '18:00', requests: 2800 },
    { hour: '20:00', requests: 2200 },
    { hour: '22:00', requests: 1500 }
  ]

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? 
      <TrendingUp className="h-4 w-4 text-green-500" /> : 
      <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
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
          <h1 className="text-3xl font-bold tracking-tight">API Analytics</h1>
          <p className="text-muted-foreground">
            Monitor API usage, performance, and user behavior
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Clock className="mr-2 h-4 w-4" />
            Last 24h
          </Button>
          <Button>
            <Activity className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      {/* API Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {apiMetrics.map((metric) => (
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
                <p className="text-xs text-muted-foreground">
                  {metric.change}
                </p>
                <p className="text-xs text-muted-foreground">
                  {metric.period}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top APIs */}
        <Card>
          <CardHeader>
            <CardTitle>Top API Endpoints</CardTitle>
            <CardDescription>
              Most frequently used API endpoints
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topAPIs.map((api, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-mono text-sm">{api.endpoint}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {api.requests.toLocaleString()} requests
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {api.users} users
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{api.avgResponse}</div>
                  <Badge 
                    className={api.successRate === '99.8%' ? 'text-green-600 bg-green-100' : 
                              api.successRate === '99.5%' ? 'text-green-600 bg-green-100' :
                              api.successRate === '98.9%' ? 'text-yellow-600 bg-yellow-100' :
                              'text-red-600 bg-red-100'}
                  >
                    {api.successRate}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Error Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Error Analysis</CardTitle>
            <CardDescription>
              API errors and failure patterns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {errorAnalysis.map((error, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-mono text-sm">{error.endpoint}</p>
                  <p className="text-sm text-muted-foreground">{error.errorType}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{error.count} errors</div>
                  <Badge className={getSeverityColor(error.severity)}>
                    {error.percentage}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Usage Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Patterns</CardTitle>
          <CardDescription>
            API usage throughout the day
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Peak Usage Hours</h4>
              <Badge variant="outline">12:00 - 14:00</Badge>
            </div>
            
            <div className="grid grid-cols-12 gap-2">
              {usageByHour.map((data, index) => (
                <div key={index} className="text-center">
                  <div 
                    className="bg-blue-500 rounded-t"
                    style={{ 
                      height: `${(data.requests / 4000) * 100}px`,
                      minHeight: '4px'
                    }}
                  ></div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {data.hour}
                  </p>
                  <p className="text-xs font-medium">
                    {data.requests}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Health Summary */}
      <Card>
        <CardHeader>
          <CardTitle>API Health Summary</CardTitle>
          <CardDescription>
            Overall API performance and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-semibold">Overall Health</h3>
              <p className="text-2xl font-bold text-green-600">Excellent</p>
              <p className="text-sm text-muted-foreground">99.2% success rate</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Zap className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold">Performance</h3>
              <p className="text-2xl font-bold text-blue-600">156ms</p>
              <p className="text-sm text-muted-foreground">Average response time</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Users className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-semibold">Usage</h3>
              <p className="text-2xl font-bold text-purple-600">1,847</p>
              <p className="text-sm text-muted-foreground">Active users</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">API Optimization Recommendations</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Consider caching for analytics endpoint - high response time (445ms)</li>
              <li>• Monitor rate limiting on mobile dashboard endpoint</li>
              <li>• Optimize database queries for high-traffic endpoints</li>
              <li>• Implement API versioning for better backward compatibility</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
