'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { useDashboardStore } from '@/store'
import { formatCurrency } from '@/lib/utils'
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  ShoppingCart,
  Star,
  Activity,
  Building2,
  Target,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'

export default function DashboardPage() {
  const { metrics, isLoading, fetchMetrics } = useDashboardStore()

  React.useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  const metricCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(metrics?.totalRevenue || 0),
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: <DollarSign className="h-6 w-6" />,
      color: 'bg-green-500',
    },
    {
      title: 'Total Customers',
      value: metrics?.totalCustomers?.toLocaleString() || '0',
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: <Users className="h-6 w-6" />,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Orders',
      value: metrics?.totalOrders?.toLocaleString() || '0',
      change: '+15.3%',
      changeType: 'positive' as const,
      icon: <ShoppingCart className="h-6 w-6" />,
      color: 'bg-purple-500',
    },
    {
      title: 'Customer Satisfaction',
      value: `${metrics?.customerSatisfaction || 0}/5.0`,
      change: '+2.1%',
      changeType: 'positive' as const,
      icon: <Star className="h-6 w-6" />,
      color: 'bg-yellow-500',
    },
    {
      title: 'Employee Productivity',
      value: `${metrics?.employeeProductivity || 0}%`,
      change: '+5.7%',
      changeType: 'positive' as const,
      icon: <Activity className="h-6 w-6" />,
      color: 'bg-indigo-500',
    },
    {
      title: 'Partner Performance',
      value: `${metrics?.partnerPerformance || 0}%`,
      change: '-1.2%',
      changeType: 'negative' as const,
      icon: <Building2 className="h-6 w-6" />,
      color: 'bg-red-500',
    },
  ]

  const recentActivities = [
    {
      id: 1,
      type: 'order',
      message: 'New order #12345 received from John Doe',
      time: '2 minutes ago',
      amount: '$150.00',
    },
    {
      id: 2,
      type: 'customer',
      message: 'New customer Sarah Johnson registered',
      time: '15 minutes ago',
    },
    {
      id: 3,
      type: 'payment',
      message: 'Payment received for invoice #INV-001',
      time: '1 hour ago',
      amount: '$2,500.00',
    },
    {
      id: 4,
      type: 'partner',
      message: 'Partner ABC Auto completed 5 orders',
      time: '2 hours ago',
    },
    {
      id: 5,
      type: 'employee',
      message: 'Employee performance review completed',
      time: '3 hours ago',
    },
  ]

  const quickActions = [
    {
      title: 'Add New Customer',
      description: 'Create a new customer profile',
      icon: <Users className="h-5 w-5" />,
      href: '/crm/customers/new',
      color: 'bg-blue-500',
    },
    {
      title: 'Create Invoice',
      description: 'Generate a new invoice',
      icon: <DollarSign className="h-5 w-5" />,
      href: '/finance/invoices/new',
      color: 'bg-green-500',
    },
    {
      title: 'Add Employee',
      description: 'Onboard a new employee',
      icon: <Users className="h-5 w-5" />,
      href: '/hr/employees/new',
      color: 'bg-purple-500',
    },
    {
      title: 'Create Campaign',
      description: 'Launch a marketing campaign',
      icon: <Target className="h-5 w-5" />,
      href: '/marketing/campaigns/new',
      color: 'bg-orange-500',
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-clutch-red"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>
        <SnowButton className="bg-gradient-to-r from-clutch-red to-clutch-red-dark hover:from-clutch-red-dark hover:to-clutch-red">
          <TrendingUp className="mr-2 h-4 w-4" />
          View Reports
        </SnowButton>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricCards.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <SnowCard className="hover:shadow-lg transition-shadow">
              <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <SnowCardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </SnowCardTitle>
                <div className={`p-2 rounded-lg ${metric.color} text-white`}>
                  {metric.icon}
                </div>
              </SnowCardHeader>
              <SnowCardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  {metric.changeType === 'positive' ? (
                    <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span
                    className={
                      metric.changeType === 'positive'
                        ? 'text-green-500'
                        : 'text-red-500'
                    }
                  >
                    {metric.change}
                  </span>
                  <span className="ml-1">from last month</span>
                </div>
              </SnowCardContent>
            </SnowCard>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-1"
        >
          <SnowCard>
            <SnowCardHeader>
              <SnowCardTitle>Quick Actions</SnowCardTitle>
              <SnowCardDescription>
                Common tasks to get you started
              </SnowCardDescription>
            </SnowCardHeader>
            <SnowCardContent className="space-y-3">
              {quickActions.map((action) => (
                <SnowButton
                  key={action.title}
                  variant="ghost"
                  className="w-full justify-start h-auto p-3"
                >
                  <div className={`p-2 rounded-lg ${action.color} text-white mr-3`}>
                    {action.icon}
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{action.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {action.description}
                    </div>
                  </div>
                </SnowButton>
              ))}
            </SnowCardContent>
          </SnowCard>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <SnowCard>
            <SnowCardHeader>
              <SnowCardTitle>Recent Activity</SnowCardTitle>
              <SnowCardDescription>
                Latest updates from your business
              </SnowCardDescription>
            </SnowCardHeader>
            <SnowCardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-clutch-red rounded-full mt-2"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {activity.message}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {activity.time}
                      </p>
                    </div>
                    {activity.amount && (
                      <div className="flex-shrink-0">
                        <span className="text-sm font-medium text-green-600">
                          {activity.amount}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </SnowCardContent>
          </SnowCard>
        </motion.div>
      </div>

      {/* Charts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle>Revenue Overview</SnowCardTitle>
            <SnowCardDescription>
              Monthly revenue trends
            </SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Chart placeholder - Revenue data will be displayed here
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle>Customer Growth</SnowCardTitle>
            <SnowCardDescription>
              New customer acquisition
            </SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Chart placeholder - Customer growth data will be displayed here
            </div>
          </SnowCardContent>
        </SnowCard>
      </motion.div>
    </div>
  )
}

