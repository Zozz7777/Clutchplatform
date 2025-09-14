'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  XCircle,
  BarChart3,
  PieChart,
  LineChart,
  Bell,
  Settings,
  Eye,
  Download,
  Plus,
  ArrowUpRight,
  Zap,
  Shield,
  Brain,
  Target,
  Award,
  Star,
  Globe,
  Smartphone,
  Mail,
  MessageSquare,
  FileText,
  Database,
  Server,
  Cpu,
  HardDrive,
  Wifi
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
import { toast } from 'sonner'

// Enhanced Metric Card with animations
const EnhancedMetricCard = ({ 
  title, 
  value, 
  change, 
  trend, 
  format = 'number',
  icon: Icon,
  color = 'clutch-red',
  description,
  onClick
}: {
  title: string
  value: number
  change?: number
  trend?: 'up' | 'down' | 'neutral'
  format?: 'number' | 'currency' | 'percentage'
  icon?: any
  color?: string
  description?: string
  onClick?: () => void
}) => {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return formatCurrency(val)
      case 'percentage':
        return `${val}%`
      default:
        return formatNumber(val)
    }
  }

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Activity className="h-4 w-4 text-gray-500" />
  }

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600'
    if (trend === 'down') return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <SnowCard className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-l-4 border-l-${color}-500`}>
        <SnowCardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                {Icon && <Icon className={`h-5 w-5 text-${color}-500`} />}
                <p className="text-sm font-medium text-clutch-gray-600">{title}</p>
              </div>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-2xl font-bold text-clutch-gray-900">
                  {formatValue(value)}
                </h3>
                {change !== undefined && (
                  <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
                    {getTrendIcon()}
                    <span className="text-sm font-medium">
                      {Math.abs(change)}%
                    </span>
                  </div>
                )}
              </div>
              {description && (
                <p className="text-xs text-clutch-gray-500 mt-1">{description}</p>
              )}
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowUpRight className="h-4 w-4 text-clutch-gray-400" />
            </div>
          </div>
        </SnowCardContent>
      </SnowCard>
    </motion.div>
  )
}

// Enhanced Activity Item with better styling
const EnhancedActivityItem = ({ activity }: { activity: any }) => {
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
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center space-x-3 p-3 hover:bg-clutch-gray-50 rounded-lg transition-colors border border-transparent hover:border-clutch-gray-200"
    >
      {getStatusIcon(activity.status)}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-clutch-gray-900">{activity.action}</p>
        <p className="text-sm text-clutch-gray-600 truncate">{activity.description}</p>
      </div>
      <div className="flex items-center space-x-2">
        <Badge className={`${getStatusColor(activity.status)} border`}>
          {activity.status}
        </Badge>
        <span className="text-xs text-clutch-gray-500">
          {new Date(activity.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </motion.div>
  )
}

// Enhanced Service Status Component
const EnhancedServiceStatus = ({ service }: { service: any }) => {
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
        return 'bg-green-100 text-green-800 border-green-200'
      case 'offline':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center justify-between p-3 hover:bg-clutch-gray-50 rounded-lg transition-colors border border-transparent hover:border-clutch-gray-200"
    >
      <div className="flex items-center space-x-3">
        {getStatusIcon(service.status)}
        <div>
          <p className="text-sm font-medium text-clutch-gray-900">{service.name}</p>
          <p className="text-xs text-clutch-gray-600">Uptime: {service.uptime}</p>
        </div>
      </div>
      <Badge className={`${getStatusColor(service.status)} border`}>
        {service.status}
      </Badge>
    </motion.div>
  )
}

// Quick Actions Component
const QuickActions = () => {
  const actions = [
    { icon: Plus, label: 'New Order', color: 'clutch-red', href: '/orders/new' },
    { icon: Users, label: 'Add Customer', color: 'clutch-blue', href: '/customers/new' },
    { icon: Car, label: 'Add Vehicle', color: 'clutch-green', href: '/fleet/new' },
    { icon: FileText, label: 'New Report', color: 'clutch-purple', href: '/reports/new' },
    { icon: Settings, label: 'Settings', color: 'clutch-gray', href: '/settings' },
    { icon: Bell, label: 'Notifications', color: 'clutch-orange', href: '/notifications' }
  ]

  return (
    <SnowCard>
      <SnowCardHeader>
        <SnowCardTitle className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-clutch-red-500" />
          <span>Quick Actions</span>
        </SnowCardTitle>
        <SnowCardDescription>
          Common tasks and shortcuts
        </SnowCardDescription>
      </SnowCardHeader>
      <SnowCardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {actions.map((action, index) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <SnowButton
                variant="outline"
                className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-clutch-gray-50"
              >
                <action.icon className={`h-6 w-6 text-${action.color}-500`} />
                <span className="text-xs font-medium text-clutch-gray-700">
                  {action.label}
                </span>
              </SnowButton>
            </motion.div>
          ))}
        </div>
      </SnowCardContent>
    </SnowCard>
  )
}

// Performance Metrics Component
const PerformanceMetrics = ({ metrics }: { metrics: any }) => {
  const performanceData = [
    { label: 'CPU Usage', value: 45, color: 'clutch-red', icon: Cpu },
    { label: 'Memory', value: 67, color: 'clutch-blue', icon: Database },
    { label: 'Storage', value: 23, color: 'clutch-green', icon: HardDrive },
    { label: 'Network', value: 89, color: 'clutch-purple', icon: Wifi }
  ]

  return (
    <SnowCard>
      <SnowCardHeader>
        <SnowCardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-clutch-red-500" />
          <span>System Performance</span>
        </SnowCardTitle>
        <SnowCardDescription>
          Real-time system metrics
        </SnowCardDescription>
      </SnowCardHeader>
      <SnowCardContent>
        <div className="space-y-4">
          {performanceData.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-3"
            >
              <metric.icon className={`h-5 w-5 text-${metric.color}-500`} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-clutch-gray-700">
                    {metric.label}
                  </span>
                  <span className="text-sm font-bold text-clutch-gray-900">
                    {metric.value}%
                  </span>
                </div>
                <div className="w-full bg-clutch-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.value}%` }}
                    transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                    className={`h-2 rounded-full bg-${metric.color}-500`}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </SnowCardContent>
    </SnowCard>
  )
}

export default function EnhancedDashboardPage() {
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

  const [selectedTimeRange, setSelectedTimeRange] = useState('30d')
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      refreshData()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, refreshData])

  // Fallback data structure
  const safeMetrics = metrics || {
    users: { total: 0, active: 0, growth: 0 },
    orders: { total: 0, pending: 0, completed: 0, growth: 0 },
    revenue: { total: 0, monthly: 0, weekly: 0, daily: 0, growth: 0 },
    vehicles: { total: 0, available: 0, inService: 0 },
    services: { total: 0, active: 0, completed: 0 },
    partners: { total: 0, active: 0, pending: 0 }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-clutch-red-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-clutch-gray-600">Loading dashboard data...</p>
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
          <p className="text-clutch-gray-600">No dashboard data available</p>
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
      title="Enhanced Dashboard"
      lastUpdated={lastUpdated || undefined}
      onRefresh={refreshData}
      timeRange={`Last ${selectedTimeRange}`}
      totalRecords={metrics?.users.total || 0}
    >
      <div className="space-y-6">
        {/* Header with Controls */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0"
        >
          <div>
            <h1 className="text-3xl font-bold text-clutch-gray-900">Dashboard Overview</h1>
            <p className="text-clutch-gray-600 mt-1">
              Welcome back! Here's what's happening with your business today.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-3 py-2 border border-clutch-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-clutch-red-500 focus:border-clutch-red-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <SnowButton
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto Refresh
            </SnowButton>
          </div>
        </motion.div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <EnhancedMetricCard
            title="Total Users"
            value={safeMetrics.users.total}
            change={safeMetrics.users.growth}
            trend={safeMetrics.users.growth && safeMetrics.users.growth > 0 ? 'up' : 'down'}
            format="number"
            icon={Users}
            color="clutch-blue"
            description="Active platform users"
          />
          <EnhancedMetricCard
            title="Total Orders"
            value={safeMetrics.orders.total}
            change={safeMetrics.orders.growth}
            trend={safeMetrics.orders.growth && safeMetrics.orders.growth > 0 ? 'up' : 'down'}
            format="number"
            icon={ShoppingCart}
            color="clutch-green"
            description="Completed orders"
          />
          <EnhancedMetricCard
            title="Monthly Revenue"
            value={safeMetrics.revenue.monthly}
            change={safeMetrics.revenue.growth}
            trend={safeMetrics.revenue.growth && safeMetrics.revenue.growth > 0 ? 'up' : 'down'}
            format="currency"
            icon={PoundSterling}
            color="clutch-red"
            description="Current month revenue"
          />
          <EnhancedMetricCard
            title="Active Vehicles"
            value={safeMetrics.vehicles.available}
            format="number"
            icon={Car}
            color="clutch-purple"
            description="Fleet availability"
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <EnhancedMetricCard
            title="Total Services"
            value={safeMetrics.services.total}
            format="number"
            icon={Wrench}
            color="clutch-orange"
            description="Service requests"
          />
          <EnhancedMetricCard
            title="Active Partners"
            value={safeMetrics.partners.active}
            format="number"
            icon={Handshake}
            color="clutch-teal"
            description="Business partners"
          />
          <EnhancedMetricCard
            title="Pending Orders"
            value={safeMetrics.orders.pending}
            format="number"
            icon={Clock}
            color="clutch-yellow"
            description="Awaiting processing"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Charts and Analytics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Revenue Chart */}
            <SnowCard>
              <SnowCardHeader>
                <SnowCardTitle className="flex items-center space-x-2">
                  <LineChart className="h-5 w-5 text-clutch-red-500" />
                  <span>Revenue Trends</span>
                </SnowCardTitle>
                <SnowCardDescription>
                  Monthly revenue performance over time
                </SnowCardDescription>
              </SnowCardHeader>
              <SnowCardContent>
                <div className="h-64">
                  <SimpleChart
                    title="Revenue Trend"
                    data={[
                      { label: 'Jan', value: 45000 },
                      { label: 'Feb', value: 52000 },
                      { label: 'Mar', value: 48000 },
                      { label: 'Apr', value: 61000 },
                      { label: 'May', value: 55000 },
                      { label: 'Jun', value: 67000 }
                    ]}
                    type="line"
                    height={256}
                  />
                </div>
              </SnowCardContent>
            </SnowCard>

            {/* Activity Feed */}
            <SnowCard>
              <SnowCardHeader>
                <SnowCardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-clutch-blue-500" />
                  <span>Recent Activity</span>
                </SnowCardTitle>
                <SnowCardDescription>
                  Latest system activities and events
                </SnowCardDescription>
              </SnowCardHeader>
              <SnowCardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {activityLogs.slice(0, 8).map((activity, index) => (
                    <EnhancedActivityItem key={activity.id || index} activity={activity} />
                  ))}
                  {activityLogs.length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-clutch-gray-500 mb-2">No recent activity</div>
                      <div className="text-sm text-clutch-gray-400">Activity will appear here as it happens</div>
                    </div>
                  )}
                </div>
              </SnowCardContent>
            </SnowCard>
          </div>

          {/* Right Column - Quick Actions and Status */}
          <div className="space-y-6">
            <QuickActions />
            <PerformanceMetrics metrics={metrics} />
            
            {/* Platform Services Status */}
            <SnowCard>
              <SnowCardHeader>
                <SnowCardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-clutch-green-500" />
                  <span>Platform Services</span>
                </SnowCardTitle>
                <SnowCardDescription>
                  System health and uptime
                </SnowCardDescription>
              </SnowCardHeader>
              <SnowCardContent>
                <div className="space-y-3">
                  {platformServices.map((service, index) => (
                    <EnhancedServiceStatus key={service.name || index} service={service} />
                  ))}
                </div>
              </SnowCardContent>
            </SnowCard>
          </div>
        </div>

        {/* System Status Overview */}
        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-clutch-purple-500" />
              <span>System Status Overview</span>
            </SnowCardTitle>
            <SnowCardDescription>
              Comprehensive system health metrics
            </SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {systemStatus.map((status, index) => (
                <motion.div
                  key={status.name || index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-4 bg-clutch-gray-50 rounded-lg border border-clutch-gray-200 hover:border-clutch-gray-300 transition-colors"
                >
                  <p className="text-sm text-clutch-gray-600 mb-2">{status.name}</p>
                  <p className="text-2xl font-bold text-clutch-gray-900 mb-2">
                    {status.value}{status.unit}
                  </p>
                  <Badge className={`${
                    status.status === 'normal' 
                      ? 'bg-green-100 text-green-800 border-green-200' 
                      : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                  } border`}>
                    {status.status}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
    </DataContext>
  )
}