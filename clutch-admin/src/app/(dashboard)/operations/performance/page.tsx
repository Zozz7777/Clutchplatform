'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Zap, 
  Database, 
  Server, 
  Users,
  BarChart3,
  Activity
} from 'lucide-react'

export default function PerformancePage() {
  const performanceMetrics = [
    {
      name: 'Response Time',
      value: '245ms',
      change: '+12ms',
      trend: 'up',
      status: 'warning'
    },
    {
      name: 'Throughput',
      value: '1,247 req/s',
      change: '+89 req/s',
      trend: 'up',
      status: 'good'
    },
    {
      name: 'Error Rate',
      value: '0.12%',
      change: '-0.03%',
      trend: 'down',
      status: 'good'
    },
    {
      name: 'CPU Usage',
      value: '68%',
      change: '+5%',
      trend: 'up',
      status: 'warning'
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

  const slowQueries = [
    {
      query: 'SELECT * FROM users WHERE...',
      avgTime: '2.3s',
      calls: 1234,
      impact: 'high'
    },
    {
      query: 'SELECT * FROM analytics WHERE...',
      avgTime: '1.8s',
      calls: 567,
      impact: 'medium'
    },
    {
      query: 'SELECT * FROM mobile_data WHERE...',
      avgTime: '1.2s',
      calls: 890,
      impact: 'medium'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'error': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? 
      <TrendingUp className="h-4 w-4 text-red-500" /> : 
      <TrendingDown className="h-4 w-4 text-green-500" />
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
          <Button variant="outline">
            <Clock className="mr-2 h-4 w-4" />
            Last 24h
          </Button>
          <Button>
            <Activity className="mr-2 h-4 w-4" />
            Refresh
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
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Endpoints */}
        <Card>
          <CardHeader>
            <CardTitle>Top Endpoints</CardTitle>
            <CardDescription>
              Most frequently called API endpoints
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topEndpoints.map((endpoint, index) => (
              <div key={index} className="flex items-center justify-between">
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
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Slow Queries */}
        <Card>
          <CardHeader>
            <CardTitle>Slow Queries</CardTitle>
            <CardDescription>
              Database queries that need optimization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {slowQueries.map((query, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <p className="font-mono text-xs mb-2 truncate">
                  {query.query}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium">{query.avgTime}</span>
                    <span className="text-xs text-muted-foreground">
                      {query.calls} calls
                    </span>
                  </div>
                  <Badge 
                    variant={query.impact === 'high' ? 'destructive' : 'secondary'}
                  >
                    {query.impact}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

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
              <Database className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold">Database</h3>
              <p className="text-2xl font-bold text-green-600">Healthy</p>
              <p className="text-sm text-muted-foreground">3 slow queries detected</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Server className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-semibold">Server Load</h3>
              <p className="text-2xl font-bold text-green-600">Normal</p>
              <p className="text-sm text-muted-foreground">68% CPU usage</p>
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
