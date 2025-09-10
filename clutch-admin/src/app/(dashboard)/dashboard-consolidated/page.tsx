'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  Car,
  Handshake,
  Wrench,
  PoundSterling,
  Activity,
  Clock,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { Badge } from '@/components/ui/badge'
import { useConsolidatedDashboard } from '@/hooks/useConsolidatedDashboard'
import { formatCurrency, formatNumber } from '@/lib/utils'
import ApiErrorHandler from '@/components/error-handlers/api-error-handler'

// Metric Card Component
const MetricCard = ({ 
  title, 
  value, 
  growth, 
  icon: Icon, 
  color = 'blue',
  format = 'number'
}: {
  title: string
  value: number
  growth?: number
  icon: any
  color?: string
  format?: 'number' | 'currency'
}) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    red: 'text-red-600 bg-red-100',
    yellow: 'text-yellow-600 bg-yellow-100',
    purple: 'text-purple-600 bg-purple-100'
  }

  const displayValue = format === 'currency' ? formatCurrency(value) : formatNumber(value)

  return (
    <SnowCard>
      <SnowCardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{displayValue}</p>
            {growth !== undefined && (
              <div className="flex items-center mt-1">
                {growth >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(growth)}%
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </SnowCardContent>
    </SnowCard>
  )
}

// Activity Item Component
const ActivityItem = ({ activity }: { activity: any }) => {
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'failed':
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-blue-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  return (
    <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      {getStatusIcon(activity.status)}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
        <p className="text-sm text-slate-600 truncate">{activity.description}</p>
      </div>
      <div className="flex items-center space-x-2">
        <Badge className={getStatusColor(activity.status)}>
          {activity.status}
        </Badge>
        <span className="text-xs text-slate-600">
          {new Date(activity.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </div>
  )
}

// Service Status Component
const ServiceStatus = ({ service }: { service: any }) => {
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'offline':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <Activity className="h-4 w-4 text-blue-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'online':
        return 'bg-green-100 text-green-800'
      case 'offline':
        return 'bg-red-100 text-red-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex items-center space-x-3">
        {getStatusIcon(service.status)}
        <div>
          <p className="text-sm font-medium text-gray-900">{service.name}</p>
          <p className="text-xs text-slate-600">Uptime: {service.uptime}</p>
        </div>
      </div>
      <Badge className={getStatusColor(service.status)}>
        {service.status}
      </Badge>
    </div>
  )
}

export default function ConsolidatedDashboardPage() {
  const { 
    data, 
    isLoading, 
    error, 
    lastUpdated, 
    refreshData,
    metrics,
    recentOrders,
    activityLogs,
    platformServices,
    systemStatus,
    realTimeData
  } = useConsolidatedDashboard()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <ApiErrorHandler 
          error={{ message: error }} 
          onRetry={refreshData}
        />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-600">No dashboard data available</p>
          <SnowButton onClick={refreshData} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </SnowButton>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-slate-700">
            Last updated: {lastUpdated?.toLocaleString()}
          </p>
        </div>
        <SnowButton onClick={refreshData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </SnowButton>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={metrics?.users.total || 0}
          growth={metrics?.users.growth}
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="Total Orders"
          value={metrics?.orders.total || 0}
          growth={metrics?.orders.growth}
          icon={ShoppingCart}
          color="green"
        />
        <MetricCard
          title="Monthly Revenue"
          value={metrics?.revenue.monthly || 0}
          growth={metrics?.revenue.growth}
          icon={PoundSterling}
          color="purple"
          format="currency"
        />
        <MetricCard
          title="Active Vehicles"
          value={metrics?.vehicles.available || 0}
          icon={Car}
          color="red"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Services"
          value={metrics?.services.total || 0}
          icon={Wrench}
          color="yellow"
        />
        <MetricCard
          title="Active Partners"
          value={metrics?.partners.active || 0}
          icon={Handshake}
          color="green"
        />
        <MetricCard
          title="Pending Orders"
          value={metrics?.orders.pending || 0}
          icon={Clock}
          color="yellow"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle>Recent Activity</SnowCardTitle>
            <SnowCardDescription>
              Latest system activities and updates
            </SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="space-y-2">
              {activityLogs.slice(0, 5).map((activity, index) => (
                <ActivityItem key={activity.id || index} activity={activity} />
              ))}
              {activityLogs.length === 0 && (
                <p className="text-center text-slate-600 py-4">No recent activity</p>
              )}
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle>Platform Services</SnowCardTitle>
            <SnowCardDescription>
              Status of all platform services
            </SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="space-y-2">
              {platformServices.map((service, index) => (
                <ServiceStatus key={service.name || index} service={service} />
              ))}
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle>System Status</SnowCardTitle>
          <SnowCardDescription>
            Current system performance metrics
          </SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {systemStatus.map((status, index) => (
              <div key={status.name || index} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">{status.name}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {status.value}{status.unit}
                </p>
                <Badge className={`mt-2 ${
                  status.status === 'normal' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {status.status}
                </Badge>
              </div>
            ))}
          </div>
        </SnowCardContent>
      </SnowCard>
    </div>
  )
}
