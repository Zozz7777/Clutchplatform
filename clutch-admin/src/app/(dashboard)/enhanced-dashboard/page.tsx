'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { dashboardApi, usersApi } from '@/lib/real-api-service'
import { AdaptiveContainer } from '@/components/responsive/adaptive-layout'
import { AdaptiveGrid } from '@/components/responsive/adaptive-layout'
import { AdaptiveFlex } from '@/components/responsive/adaptive-layout'
import { AnimatedCard } from '@/components/animations/animated-card'
import { AdvancedButton } from '@/components/interactions/advanced-button'
import { GestureCard } from '@/components/interactions/gesture-card'
import { SkeletonLoader, ShimmerLoader, ProgressiveImage } from '@/components/interactions/loading-states'
import { VirtualScrollTable } from '@/components/ui/virtual-scroll-table'
import { AccessibleButton } from '@/components/accessibility/accessible-button'
import { AccessibleModal } from '@/components/accessibility/accessible-modal'
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Star,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  MessageSquare,
  Bell,
  Settings,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  RefreshCw,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

// Types for dashboard data
interface DashboardMetrics {
  totalUsers: number
  activeUsers: number
  totalRevenue: number
  monthlyRevenue: number
  conversionRate: number
  averageOrderValue: number
  totalOrders: number
  activeDrivers: number
}

interface ActivityItem {
  id: string
  user: string
  action: string
  time: string
  type: 'success' | 'warning' | 'info' | 'error'
  timestamp: string
}

interface AlertItem {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  priority: 'low' | 'medium' | 'high'
  timestamp: string
}

interface User {
  id: number
  name: string
  email: string
  role: string
  status: 'Active' | 'Inactive' | 'Pending'
  lastLogin: string
  avatar?: string
}

export default function EnhancedDashboard() {
  const { user: currentUser } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Dashboard data state
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [usersLoading, setUsersLoading] = useState(false)

  // Load dashboard data
  const loadDashboardData = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }
      setError(null)

      // Load all dashboard data in parallel
      const [metricsResponse, activityResponse, alertsResponse] = await Promise.all([
        dashboardApi.getMetrics(),
        dashboardApi.getRecentActivity(10),
        dashboardApi.getAlerts()
      ])

      // Handle metrics
      if (metricsResponse.success && metricsResponse.data) {
        setMetrics(metricsResponse.data as any)
      } else {
        console.error('Failed to load metrics:', metricsResponse.message)
      }

      // Handle recent activity
      if (activityResponse.success && activityResponse.data) {
        setRecentActivity((activityResponse.data as any).logs || [])
      } else {
        console.error('Failed to load recent activity:', activityResponse.message)
      }

      // Handle alerts
      if (alertsResponse.success && alertsResponse.data) {
        setAlerts((alertsResponse.data as any).alerts || [])
      } else {
        console.error('Failed to load alerts:', alertsResponse.message)
      }

    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      setError('Failed to load dashboard data. Please try again.')
      toast.error('Dashboard Error', {
        description: 'Failed to load dashboard data. Please refresh the page.'
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Load users data
  const loadUsers = async () => {
    try {
      setUsersLoading(true)
      const response = await usersApi.getUsers({ limit: 100 })
      
      if (response.success && response.data) {
        setUsers((response.data as any).users || [])
      } else {
        console.error('Failed to load users:', response.message)
        toast.error('Failed to load users', {
          description: response.message || 'Please try again.'
        })
      }
    } catch (error) {
      console.error('Failed to load users:', error)
      toast.error('Failed to load users', {
        description: 'Please try again.'
      })
    } finally {
      setUsersLoading(false)
    }
  }

  // Initial data load
  useEffect(() => {
    loadDashboardData()
    loadUsers()
  }, [])

  // Handle refresh
  const handleRefresh = async () => {
    await loadDashboardData(true)
    await loadUsers()
    toast.success('Dashboard refreshed', {
      description: 'All data has been updated.'
    })
  }

  // Handle metric click
  const handleMetricClick = (metricId: number) => {
    setSelectedMetric(metricId)
    toast.info('Metric Selected', {
      description: 'You can view detailed analytics for this metric.'
    })
  }

  // Handle table row click
  const handleTableRowClick = (row: User) => {
    toast.info('User Selected', {
      description: `Viewing details for ${row.name}`
    })
  }

  // Handle alert dismiss
  const handleAlertDismiss = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId))
    toast.success('Alert dismissed', {
      description: 'The alert has been removed from your dashboard.'
    })
  }

  // Handle export users
  const handleExportUsers = async () => {
    try {
      const success = await usersApi.exportUsers('csv')
      if (success) {
        toast.success('Export started', {
          description: 'Your user data is being exported.'
        })
      } else {
        toast.error('Export failed', {
          description: 'Failed to export user data. Please try again.'
        })
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Export failed', {
        description: 'Please try again.'
      })
    }
  }

  // Render metric card
  const renderMetricCard = (metric: any, index: number) => (
    <AnimatedCard
      key={metric.id}
      animation="fadeIn"
      delay={index * 100}
      hoverAnimation="lift"
      clickAnimation="scale"
      onClick={() => handleMetricClick(metric.id)}
      className="cursor-pointer"
    >
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{metric.title}</p>
            <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
            <div className="flex items-center mt-1">
              <span className={`text-sm font-medium ${
                metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.change}
              </span>
              <span className="text-xs text-gray-500 ml-1">vs last month</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <metric.icon className="h-8 w-8 text-primary" />
          </div>
        </div>
      </div>
    </AnimatedCard>
  )

  // Render activity item
  const renderActivityItem = (activity: ActivityItem) => (
    <AnimatedCard
      key={activity.id}
      animation="slideInUp"
      delay={parseInt(activity.id) * 50}
      hoverAnimation="glow"
      className="mb-3"
    >
      <div className="p-4">
        <div className="flex items-center space-x-3">
          <div className={`w-2 h-2 rounded-full ${
            activity.type === 'success' ? 'bg-green-500' :
            activity.type === 'warning' ? 'bg-yellow-500' :
            activity.type === 'error' ? 'bg-red-500' :
            'bg-blue-500'
          }`} />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{activity.user}</p>
            <p className="text-sm text-gray-600">{activity.action}</p>
          </div>
          <span className="text-xs text-gray-500">{activity.time}</span>
        </div>
      </div>
    </AnimatedCard>
  )

  // Render alert card
  const renderAlertCard = (alert: AlertItem) => (
    <GestureCard
      key={alert.id}
      className="mb-3"
    >
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div className={`w-2 h-2 rounded-full mt-2 ${
            alert.type === 'success' ? 'bg-green-500' :
            alert.type === 'warning' ? 'bg-yellow-500' :
            alert.type === 'error' ? 'bg-red-500' :
            'bg-blue-500'
          }`} />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-900">{alert.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
            <div className="flex items-center justify-between mt-2">
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                alert.priority === 'high' ? 'bg-red-100 text-red-800' :
                alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {alert.priority}
              </span>
              <button
                onClick={() => handleAlertDismiss(alert.id)}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </GestureCard>
  )

  // Render table row
  const renderTableRow = (row: User) => (
    <div
      key={row.id}
      className="flex items-center space-x-4 p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
      onClick={() => handleTableRowClick(row)}
    >
      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
        <span className="text-white text-sm font-medium">
          {row.name.charAt(0).toUpperCase()}
        </span>
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{row.name}</p>
        <p className="text-sm text-gray-600">{row.email}</p>
      </div>
      <div className="w-20">
        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
          row.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
          row.role === 'Manager' ? 'bg-blue-100 text-blue-800' :
          row.role === 'User' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {row.role}
        </span>
      </div>
      <div className="w-20">
        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
          row.status === 'Active' ? 'bg-green-100 text-green-800' :
          row.status === 'Inactive' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {row.status}
        </span>
      </div>
      <div className="w-24 text-sm text-gray-600">{row.lastLogin}</div>
      <div className="w-12">
        <button className="p-1 text-gray-400 hover:text-gray-600">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  )

  // Prepare metrics data
  const metricsData = metrics ? [
    { id: 1, title: 'Total Users', value: metrics.totalUsers.toLocaleString(), change: '+12%', trend: 'up', icon: Users },
    { id: 2, title: 'Monthly Revenue', value: `$${metrics.monthlyRevenue.toLocaleString()}`, change: '+8%', trend: 'up', icon: DollarSign },
    { id: 3, title: 'Active Users', value: metrics.activeUsers.toLocaleString(), change: '-3%', trend: 'down', icon: Activity },
    { id: 4, title: 'Conversion Rate', value: `${(metrics.conversionRate * 100).toFixed(1)}%`, change: '+15%', trend: 'up', icon: TrendingUp }
  ] : []

  if (isLoading) {
    return (
      <AdaptiveContainer>
        <div className="space-y-6">
          <AdaptiveGrid columns={{ xs: 1, sm: 2, lg: 4 }} gap={{ xs: '1rem', lg: '1.5rem' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-6 bg-white rounded-lg border border-gray-200">
                <SkeletonLoader width="100%" height={20} />
                <SkeletonLoader width="80%" height={16} />
                <SkeletonLoader width="60%" height={16} />
              </div>
            ))}
          </AdaptiveGrid>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="p-6 bg-white rounded-lg border border-gray-200">
                <SkeletonLoader width="100%" height={20} />
                <SkeletonLoader width="90%" height={16} />
                <SkeletonLoader width="80%" height={16} />
                <SkeletonLoader width="70%" height={16} />
                <SkeletonLoader width="60%" height={16} />
              </div>
            </div>
            <div className="space-y-6">
              <div className="p-6 bg-white rounded-lg border border-gray-200">
                <SkeletonLoader width="100%" height={20} />
                <SkeletonLoader width="80%" height={16} />
                <SkeletonLoader width="60%" height={16} />
              </div>
            </div>
          </div>
        </div>
      </AdaptiveContainer>
    )
  }

  if (error) {
    return (
      <AdaptiveContainer>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => loadDashboardData()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Try Again
          </button>
        </div>
      </AdaptiveContainer>
    )
  }

  return (
    <AdaptiveContainer>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Enhanced Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, {currentUser?.name}! Here's what's happening with your platform.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <AccessibleButton
              variant="secondary"
              onClick={handleRefresh}
              ariaLabel="Refresh dashboard data"
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </AccessibleButton>
            <AccessibleButton
              variant="secondary"
              onClick={() => setShowModal(true)}
              ariaLabel="Open settings modal"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </AccessibleButton>
            <AdvancedButton
              variant="primary"
              onClick={() => toast.info('New Item', { description: 'This feature will be implemented soon.' })}
              loading={false}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Item
            </AdvancedButton>
          </div>
        </div>

        <AdaptiveGrid columns={{ xs: 1, sm: 2, lg: 4 }} gap={{ xs: '1rem', lg: '1.5rem' }}>
          {metricsData.map(renderMetricCard)}
        </AdaptiveGrid>

        <AdaptiveGrid columns={{ xs: 1, lg: 3 }} gap={{ xs: '1rem', lg: '1.5rem' }}>
          <div className="lg:col-span-2">
            <AnimatedCard animation="fadeIn" delay={500}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                  <button className="text-sm text-primary hover:text-primary-dark">
                    View All
                  </button>
                </div>
                <div className="space-y-3">
                  {recentActivity.length > 0 ? (
                    recentActivity.map(renderActivityItem)
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="h-8 w-8 mx-auto mb-2" />
                      <p>No recent activity</p>
                    </div>
                  )}
                </div>
              </div>
            </AnimatedCard>
          </div>
          <div>
            <AnimatedCard animation="fadeIn" delay={600}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Alerts</h2>
                  <button className="text-sm text-primary hover:text-primary-dark">
                    Manage
                  </button>
                </div>
                <div className="space-y-3">
                  {alerts.length > 0 ? (
                    alerts.map(renderAlertCard)
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                      <p>No alerts</p>
                    </div>
                  )}
                </div>
              </div>
            </AnimatedCard>
          </div>
        </AdaptiveGrid>

        <AnimatedCard animation="fadeIn" delay={700}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Users</h2>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Filter className="h-4 w-4" />
                </button>
                <button 
                  onClick={handleExportUsers}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Export users"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {usersLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 border-b border-gray-200">
                    <SkeletonLoader width={32} height={32} className="rounded-full" />
                    <div className="flex-1">
                      <SkeletonLoader width="60%" height={16} />
                      <SkeletonLoader width="40%" height={14} />
                    </div>
                    <SkeletonLoader width={60} height={20} />
                    <SkeletonLoader width={60} height={20} />
                    <SkeletonLoader width={80} height={14} />
                  </div>
                ))}
              </div>
            ) : (
              <VirtualScrollTable
                data={users}
                columns={[
                  { key: 'id', title: 'ID', width: 60 },
                  { key: 'name', title: 'User', width: 200 },
                  { key: 'email', title: 'Email', width: 250 },
                  { key: 'role', title: 'Role', width: 100 },
                  { key: 'status', title: 'Status', width: 100 },
                  { key: 'lastLogin', title: 'Last Login', width: 150 }
                ]}
                itemHeight={80}
                className="border border-gray-200 rounded-lg overflow-hidden"
              />
            )}
          </div>
        </AnimatedCard>

        <AccessibleModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Dashboard Settings"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme
              </label>
              <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Refresh Interval
              </label>
              <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary">
                <option value="30">30 seconds</option>
                <option value="60">1 minute</option>
                <option value="300">5 minutes</option>
                <option value="0">Manual</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="notifications" className="rounded" />
              <label htmlFor="notifications" className="text-sm text-gray-700">
                Enable notifications
              </label>
            </div>
          </div>
        </AccessibleModal>
      </div>
    </AdaptiveContainer>
  )
}