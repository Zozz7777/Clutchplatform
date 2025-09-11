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
import DashboardWidget from '@/components/dashboard/dashboard-widget'
import SimpleChart from '@/components/charts/simple-chart'
import DataContext, { StatusIndicator, MetricCard } from '@/components/dashboard/data-context'

// Using MetricCard from data-context.tsx

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
        return 'bg-success-100 text-success-dark'
      case 'pending':
      case 'processing':
        return 'bg-warning-100 text-warning-dark'
      case 'failed':
      case 'error':
        return 'bg-error-100 text-error-dark'
      default:
        return 'bg-info-100 text-info-dark'
    }
  }

  return (
    <div className="flex items-center space-x-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
      {getStatusIcon(activity.status)}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900">{activity.action}</p>
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
        return 'bg-success-100 text-success-dark'
      case 'offline':
        return 'bg-error-100 text-error-dark'
      case 'warning':
        return 'bg-warning-100 text-warning-dark'
      default:
        return 'bg-info-100 text-info-dark'
    }
  }

  return (
    <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors">
      <div className="flex items-center space-x-3">
        {getStatusIcon(service.status)}
        <div>
          <p className="text-sm font-medium text-slate-900">{service.name}</p>
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-clutch-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard data...</p>
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
          <p className="text-slate-600">No dashboard data available</p>
          <SnowButton onClick={refreshData} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </SnowButton>
        </div>
      </div>
    )
  }

  return (
    <DataContext
      title="Dashboard Overview"
      lastUpdated={lastUpdated || undefined}
      onRefresh={refreshData}
      timeRange="Last 30 days"
      totalRecords={metrics?.users.total || 0}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Users"
            value={metrics?.users.total || 0}
            change={metrics?.users.growth}
            trend={metrics?.users.growth && metrics.users.growth > 0 ? 'up' : 'down'}
            format="number"
          />
          <MetricCard
            title="Total Orders"
            value={metrics?.orders.total || 0}
            change={metrics?.orders.growth}
            trend={metrics?.orders.growth && metrics.orders.growth > 0 ? 'up' : 'down'}
            format="number"
          />
          <MetricCard
            title="Monthly Revenue"
            value={metrics?.revenue.monthly || 0}
            change={metrics?.revenue.growth}
            trend={metrics?.revenue.growth && metrics.revenue.growth > 0 ? 'up' : 'down'}
            format="currency"
          />
          <MetricCard
            title="Active Vehicles"
            value={metrics?.vehicles.available || 0}
            format="number"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Total Services"
            value={metrics?.services.total || 0}
            format="number"
          />
          <MetricCard
            title="Active Partners"
            value={metrics?.partners.active || 0}
            format="number"
          />
          <MetricCard
            title="Pending Orders"
            value={metrics?.orders.pending || 0}
            format="number"
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardWidget
            title="Recent Activity"
            onRefresh={refreshData}
            size="medium"
          >
            <div className="space-y-2">
              {activityLogs.slice(0, 5).map((activity, index) => (
                <ActivityItem key={activity.id || index} activity={activity} />
              ))}
              {activityLogs.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-slate-500 mb-2">No recent activity</div>
                  <div className="text-sm text-slate-400">Activity will appear here as it happens</div>
                </div>
              )}
            </div>
          </DashboardWidget>
          
          <DashboardWidget
            title="Platform Services"
            onRefresh={refreshData}
            size="medium"
          >
            <div className="space-y-3">
              {platformServices.map((service, index) => (
                <StatusIndicator
                  key={service.name || index}
                  status={service.status === 'online' ? 'online' : service.status === 'warning' ? 'warning' : 'error'}
                  label={service.name}
                  value={`Uptime: ${service.uptime}`}
                />
              ))}
            </div>
          </DashboardWidget>
        </div>
        <DashboardWidget
          title="System Status"
          onRefresh={refreshData}
          size="large"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {systemStatus.map((status, index) => (
              <div key={status.name || index} className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">{status.name}</p>
                <p className="text-2xl font-bold text-slate-900">
                  {status.value}{status.unit}
                </p>
                <Badge className={`mt-2 ${
                  status.status === 'normal' ? 'bg-success-100 text-success-dark' : 'bg-warning-100 text-warning-dark'
                }`}>
                  {status.status}
                </Badge>
              </div>
            ))}
          </div>
        </DashboardWidget>
      </div>
    </DataContext>
  )
}
