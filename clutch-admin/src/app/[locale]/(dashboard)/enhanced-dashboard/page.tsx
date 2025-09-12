'use client'

import React, { useEffect, useState } from 'react'
import { useApp } from '@/hooks/use-app'
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
  MoreHorizontal
} from 'lucide-react'

// Mock data
const mockMetrics = [
  { id: 1, title: 'Total Users', value: '12,345', change: '+12%', trend: 'up', icon: Users },
  { id: 2, title: 'Revenue', value: '$45,678', change: '+8%', trend: 'up', icon: DollarSign },
  { id: 3, title: 'Active Sessions', value: '2,456', change: '-3%', trend: 'down', icon: Activity },
  { id: 4, title: 'Conversion Rate', value: '3.2%', change: '+15%', trend: 'up', icon: TrendingUp }
]

const mockRecentActivity = [
  { id: 1, user: 'John Doe', action: 'Created new project', time: '2 minutes ago', type: 'success' },
  { id: 2, user: 'Jane Smith', action: 'Updated user profile', time: '5 minutes ago', type: 'info' },
  { id: 3, user: 'Mike Johnson', action: 'Deleted old data', time: '10 minutes ago', type: 'warning' },
  { id: 4, user: 'Sarah Wilson', action: 'Completed task', time: '15 minutes ago', type: 'success' },
  { id: 5, user: 'Tom Brown', action: 'Added new feature', time: '20 minutes ago', type: 'info' }
]

const mockAlerts = [
  { id: 1, title: 'System Update Available', message: 'A new system update is ready to install', type: 'info', priority: 'medium' },
  { id: 2, title: 'High CPU Usage', message: 'Server CPU usage is above 80%', type: 'warning', priority: 'high' },
  { id: 3, title: 'Backup Completed', message: 'Daily backup completed successfully', type: 'success', priority: 'low' }
]

const mockTableData = Array.from({ length: 1000 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: ['Admin', 'User', 'Manager', 'Guest'][i % 4],
  status: ['Active', 'Inactive', 'Pending'][i % 3],
  lastLogin: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
}))

export default function EnhancedDashboard() {
  const { responsive, navigation, analytics, performance } = useApp()
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [tableData, setTableData] = useState(mockTableData)

  // Track page load performance
  useEffect(() => {
    const startTime = window.performance.now()
    
    // Simulate data loading
    setTimeout(() => {
      setIsLoading(false)
      const loadTime = window.performance.now() - startTime
      // Track the event using the performance monitoring system
      console.log('Dashboard loaded in:', loadTime, 'ms')
    }, 1000)

    // Track page view
    analytics.trackEvent('page_view', { 
      page: '/enhanced-dashboard', 
      title: 'Enhanced Dashboard' 
    })
  }, [analytics, performance])

  // Handle metric click
  const handleMetricClick = (metricId: number) => {
    setSelectedMetric(metricId)
    analytics.trackEvent('metric_click', { metricId })
  }

  // Handle table row click
  const handleTableRowClick = (row: any) => {
    analytics.trackEvent('table_row_click', { userId: row.id })
  }

  // Handle alert dismiss
  const handleAlertDismiss = (alertId: number) => {
    analytics.trackEvent('alert_dismiss', { alertId })
  }

  // Render metric card
  const renderMetricCard = (metric: any) => (
    <AnimatedCard
      key={metric.id}
      animation="fadeIn"
      delay={metric.id * 100}
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
          </div>
          <div className="flex items-center space-x-2">
            <metric.icon className="h-8 w-8 text-primary" />
            <span className={`text-sm font-medium ${
              metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {metric.change}
            </span>
          </div>
        </div>
      </div>
    </AnimatedCard>
  )

  // Render activity item
  const renderActivityItem = (activity: any) => (
    <AnimatedCard
      key={activity.id}
      animation="slideInUp"
      delay={activity.id * 50}
      hoverAnimation="glow"
      className="mb-3"
    >
      <div className="p-4">
        <div className="flex items-center space-x-3">
          <div className={`w-2 h-2 rounded-full ${
            activity.type === 'success' ? 'bg-green-500' :
            activity.type === 'warning' ? 'bg-yellow-500' :
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
  const renderAlertCard = (alert: any) => (
    <GestureCard
      key={alert.id}
      className="mb-3"
    >
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div className={`w-2 h-2 rounded-full mt-2 ${
            alert.type === 'success' ? 'bg-green-500' :
            alert.type === 'warning' ? 'bg-yellow-500' :
            'bg-blue-500'
          }`} />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-900">{alert.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-2 ${
              alert.priority === 'high' ? 'bg-red-100 text-red-800' :
              alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {alert.priority}
            </span>
          </div>
        </div>
      </div>
    </GestureCard>
  )

  // Render table row
  const renderTableRow = (row: any) => (
    <div
      key={row.id}
      className="flex items-center space-x-4 p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
      onClick={() => handleTableRowClick(row)}
    >
      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
        <span className="text-white text-sm font-medium">{row.id}</span>
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

  return (
    <AdaptiveContainer>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Enhanced Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's what's happening with your platform.</p>
          </div>
          <div className="flex items-center space-x-3">
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
              onClick={() => analytics.trackEvent('new_item_click')}
              loading={false}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Item
            </AdvancedButton>
          </div>
        </div>
        <AdaptiveGrid columns={{ xs: 1, sm: 2, lg: 4 }} gap={{ xs: '1rem', lg: '1.5rem' }}>
          {mockMetrics.map(renderMetricCard)}
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
                  {mockRecentActivity.map(renderActivityItem)}
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
                  {mockAlerts.map(renderAlertCard)}
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
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <VirtualScrollTable
              data={tableData}
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
