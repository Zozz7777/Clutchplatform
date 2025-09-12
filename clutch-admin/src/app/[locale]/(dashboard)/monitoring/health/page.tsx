'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Heart, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Server,
  Database,
  Globe,
  Shield,
  Zap,
  RefreshCw,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

export default function HealthMonitoringPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h')
  const [selectedService, setSelectedService] = useState('all')

  const healthMetrics = [
    {
      name: 'Overall Health',
      value: '98.7%',
      change: '+0.3%',
      trend: 'up',
      status: 'excellent'
    },
    {
      name: 'Uptime',
      value: '99.9%',
      change: '+0.1%',
      trend: 'up',
      status: 'excellent'
    },
    {
      name: 'Response Time',
      value: '156ms',
      change: '-12ms',
      trend: 'down',
      status: 'good'
    },
    {
      name: 'Error Rate',
      value: '0.08%',
      change: '-0.02%',
      trend: 'down',
      status: 'excellent'
    }
  ]

  const services = [
    {
      name: 'API Gateway',
      status: 'healthy',
      uptime: '99.9%',
      responseTime: '45ms',
      errorRate: '0.01%',
      lastCheck: '30 seconds ago',
      dependencies: ['Load Balancer', 'Authentication'],
      healthScore: 98
    },
    {
      name: 'Database',
      status: 'healthy',
      uptime: '99.8%',
      responseTime: '12ms',
      errorRate: '0.02%',
      lastCheck: '15 seconds ago',
      dependencies: ['Storage', 'Backup'],
      healthScore: 97
    },
    {
      name: 'Authentication',
      status: 'warning',
      uptime: '98.5%',
      responseTime: '89ms',
      errorRate: '0.15%',
      lastCheck: '1 minute ago',
      dependencies: ['Identity Provider', 'Session Store'],
      healthScore: 85
    },
    {
      name: 'File Storage',
      status: 'healthy',
      uptime: '99.7%',
      responseTime: '23ms',
      errorRate: '0.03%',
      lastCheck: '45 seconds ago',
      dependencies: ['CDN', 'Backup Storage'],
      healthScore: 96
    },
    {
      name: 'Message Queue',
      status: 'healthy',
      uptime: '99.6%',
      responseTime: '8ms',
      errorRate: '0.01%',
      lastCheck: '20 seconds ago',
      dependencies: ['Redis', 'Monitoring'],
      healthScore: 99
    },
    {
      name: 'Email Service',
      status: 'critical',
      uptime: '95.2%',
      responseTime: '234ms',
      errorRate: '2.1%',
      lastCheck: '2 minutes ago',
      dependencies: ['SMTP Server', 'Template Engine'],
      healthScore: 72
    }
  ]

  const healthAlerts = [
    {
      id: 1,
      service: 'Email Service',
      type: 'critical',
      message: 'High error rate detected (2.1%)',
      timestamp: '5 minutes ago',
      severity: 'high'
    },
    {
      id: 2,
      service: 'Authentication',
      type: 'warning',
      message: 'Response time above threshold (89ms)',
      timestamp: '15 minutes ago',
      severity: 'medium'
    },
    {
      id: 3,
      service: 'Database',
      type: 'info',
      message: 'Backup completed successfully',
      timestamp: '1 hour ago',
      severity: 'low'
    }
  ]

  const systemResources = [
    {
      name: 'CPU Usage',
      value: '68%',
      status: 'warning',
      threshold: 70,
      trend: 'up'
    },
    {
      name: 'Memory Usage',
      value: '45%',
      status: 'good',
      threshold: 80,
      trend: 'down'
    },
    {
      name: 'Disk Usage',
      value: '32%',
      status: 'good',
      threshold: 85,
      trend: 'up'
    },
    {
      name: 'Network I/O',
      value: '156 MB/s',
      status: 'good',
      threshold: 500,
      trend: 'up'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100'
      case 'excellent': return 'text-green-600 bg-green-100'
      case 'good': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />
      case 'excellent': return <CheckCircle className="h-4 w-4" />
      case 'good': return <CheckCircle className="h-4 w-4" />
      case 'warning': return <AlertTriangle className="h-4 w-4" />
      case 'critical': return <XCircle className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
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

  const filteredServices = selectedService === 'all' ? 
    services : 
    services.filter(service => service.status === selectedService)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Health Monitoring</h1>
          <p className="text-muted-foreground">
            Monitor system health and service availability
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
        </div>
      </div>

      {/* Health Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        {healthMetrics.map((metric) => (
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

      {/* System Resources */}
      <Card>
        <CardHeader>
          <CardTitle>System Resources</CardTitle>
          <CardDescription>
            Current system resource utilization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {systemResources.map((resource) => (
              <div key={resource.name} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{resource.name}</h4>
                  {getTrendIcon(resource.trend)}
                </div>
                <div className="text-2xl font-bold mb-2">{resource.value}</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      resource.status === 'good' ? 'bg-green-500' : 
                      resource.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ 
                      width: `${Math.min((parseFloat(resource.value.replace(/[^\d.]/g, '')) / resource.threshold) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Threshold: {resource.threshold}{resource.name.includes('Usage') ? '%' : resource.name.includes('I/O') ? ' MB/s' : ''}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Services Health */}
        <Card>
          <CardHeader>
            <CardTitle>Services Health</CardTitle>
            <CardDescription>
              Real-time health status of all services
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredServices.map((service, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${getStatusColor(service.status)}`}>
                      {getStatusIcon(service.status)}
                    </div>
                    <div>
                      <h4 className="font-medium">{service.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Health Score: {service.healthScore}%
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(service.status)}>
                    {service.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Uptime</p>
                    <p className="font-medium">{service.uptime}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Response</p>
                    <p className="font-medium">{service.responseTime}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Error Rate</p>
                    <p className="font-medium">{service.errorRate}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-1">Dependencies:</p>
                  <div className="flex flex-wrap gap-1">
                    {service.dependencies.map((dep, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {dep}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Health Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Health Alerts</CardTitle>
            <CardDescription>
              Recent health alerts and notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {healthAlerts.map((alert) => (
              <div key={alert.id} className="flex items-start space-x-3">
                <div className={`p-1 rounded-full ${getStatusColor(alert.type)}`}>
                  {getStatusIcon(alert.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{alert.message}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {alert.service}
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

      {/* Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle>System Health Overview</CardTitle>
          <CardDescription>
            Comprehensive system health summary
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <Heart className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-semibold">Overall Health</h3>
              <p className="text-2xl font-bold text-green-600">98.7%</p>
              <p className="text-sm text-muted-foreground">Excellent</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Server className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold">Services Status</h3>
              <p className="text-2xl font-bold text-blue-600">5/6 Healthy</p>
              <p className="text-sm text-muted-foreground">1 needs attention</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Shield className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-semibold">Security Status</h3>
              <p className="text-2xl font-bold text-purple-600">Secure</p>
              <p className="text-sm text-muted-foreground">No threats detected</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Health Recommendations</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Monitor Email Service closely - currently experiencing issues</li>
              <li>• Consider scaling Authentication service to improve response times</li>
              <li>• System resources are within healthy ranges</li>
              <li>• Overall system health is excellent at 98.7%</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
