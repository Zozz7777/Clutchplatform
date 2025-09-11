'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  Shield
} from 'lucide-react'

export default function SystemHealthPage() {
  const systemMetrics = [
    {
      name: 'CPU Usage',
      value: '45%',
      status: 'healthy',
      icon: Cpu,
      trend: '+2%'
    },
    {
      name: 'Memory Usage',
      value: '68%',
      status: 'warning',
      icon: Database,
      trend: '+5%'
    },
    {
      name: 'Disk Usage',
      value: '32%',
      status: 'healthy',
      icon: HardDrive,
      trend: '+1%'
    },
    {
      name: 'Network Latency',
      value: '12ms',
      status: 'healthy',
      icon: Wifi,
      trend: '-3ms'
    }
  ]

  const services = [
    {
      name: 'API Gateway',
      status: 'healthy',
      uptime: '99.9%',
      responseTime: '45ms'
    },
    {
      name: 'Database',
      status: 'healthy',
      uptime: '99.8%',
      responseTime: '12ms'
    },
    {
      name: 'Authentication',
      status: 'warning',
      uptime: '98.5%',
      responseTime: '89ms'
    },
    {
      name: 'File Storage',
      status: 'healthy',
      uptime: '99.7%',
      responseTime: '23ms'
    }
  ]

  const alerts = [
    {
      id: 1,
      type: 'warning',
      message: 'High memory usage detected on server-03',
      timestamp: '2 minutes ago',
      severity: 'medium'
    },
    {
      id: 2,
      type: 'info',
      message: 'Scheduled maintenance completed successfully',
      timestamp: '1 hour ago',
      severity: 'low'
    },
    {
      id: 3,
      type: 'error',
      message: 'Authentication service experiencing delays',
      timestamp: '3 hours ago',
      severity: 'high'
    }
  ]

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Health</h1>
          <p className="text-muted-foreground">
            Monitor system performance and health metrics
          </p>
        </div>
        <Button>
          <Activity className="mr-2 h-4 w-4" />
          Refresh Metrics
        </Button>
      </div>

      {/* System Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {systemMetrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.name}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(metric.status)}>
                    {metric.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {metric.trend} from last hour
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

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
                      {alert.timestamp}
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
