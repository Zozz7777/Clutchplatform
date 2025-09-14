'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  PoundSterling,
  Activity,
  BarChart3,
  LineChart,
  Download,
  RefreshCw,
  Target,
  Award,
  Smartphone
} from 'lucide-react'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { formatCurrency, formatNumber } from '@/lib/utils'
import SimpleChart from '@/components/charts/simple-chart'
import { toast } from 'sonner'

// Analytics Metric Card
const AnalyticsMetricCard = ({ 
  title, 
  value, 
  change, 
  trend, 
  format = 'number',
  icon: Icon,
  color = 'clutch-red',
  description
}: {
  title: string
  value: number
  change?: number
  trend?: 'up' | 'down' | 'neutral'
  format?: 'number' | 'currency' | 'percentage'
  icon?: any
  color?: string
  description?: string
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
    >
      <SnowCard className={`transition-all duration-200 hover:shadow-lg border-l-4 border-l-${color}-500`}>
        <SnowCardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            {Icon && <Icon className={`h-5 w-5 text-${color}-500`} />}
            <p className="text-sm font-medium text-clutch-gray-600">{title}</p>
          </div>
          
          <div className="flex items-baseline space-x-2 mb-2">
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
            <p className="text-xs text-clutch-gray-500">{description}</p>
          )}
        </SnowCardContent>
      </SnowCard>
    </motion.div>
  )
}

export default function AnalyticsOverviewPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d')
  const [isLoading, setIsLoading] = useState(false)

  // Mock data
  const analyticsData = {
    revenue: { total: 1250000, change: 12.5, trend: 'up' as const },
    users: { total: 15420, change: 8.3, trend: 'up' as const },
    orders: { total: 3240, change: -2.1, trend: 'down' as const },
    conversion: { total: 3.2, change: 0.8, trend: 'up' as const }
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    toast.success('Analytics data refreshed')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0"
      >
        <div>
          <h1 className="text-3xl font-bold text-clutch-gray-900">Analytics Overview</h1>
          <p className="text-clutch-gray-600 mt-1">
            Comprehensive business intelligence and performance metrics
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
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </SnowButton>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsMetricCard
          title="Total Revenue"
          value={analyticsData.revenue.total}
          change={analyticsData.revenue.change}
          trend={analyticsData.revenue.trend}
          format="currency"
          icon={PoundSterling}
          color="clutch-red"
          description="Monthly recurring revenue"
        />
        <AnalyticsMetricCard
          title="Active Users"
          value={analyticsData.users.total}
          change={analyticsData.users.change}
          trend={analyticsData.users.trend}
          format="number"
          icon={Users}
          color="clutch-blue"
          description="Registered platform users"
        />
        <AnalyticsMetricCard
          title="Total Orders"
          value={analyticsData.orders.total}
          change={analyticsData.orders.change}
          trend={analyticsData.orders.trend}
          format="number"
          icon={ShoppingCart}
          color="clutch-green"
          description="Completed orders"
        />
        <AnalyticsMetricCard
          title="Conversion Rate"
          value={analyticsData.conversion.total}
          change={analyticsData.conversion.change}
          trend={analyticsData.conversion.trend}
          format="percentage"
          icon={Target}
          color="clutch-purple"
          description="Lead to customer conversion"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle className="flex items-center space-x-2">
              <LineChart className="h-5 w-5 text-clutch-red-500" />
              <span>Revenue Trend</span>
            </SnowCardTitle>
            <SnowCardDescription>
              Monthly revenue performance over time
            </SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="h-80">
              <SimpleChart
                title="Revenue Trend"
                data={[
                  { label: 'Jan', value: 100000 },
                  { label: 'Feb', value: 120000 },
                  { label: 'Mar', value: 110000 },
                  { label: 'Apr', value: 140000 },
                  { label: 'May', value: 130000 },
                  { label: 'Jun', value: 150000 }
                ]}
                type="line"
                height={320}
              />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-clutch-blue-500" />
              <span>User Growth</span>
            </SnowCardTitle>
            <SnowCardDescription>
              User acquisition and growth metrics
            </SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="h-80">
              <SimpleChart
                title="User Growth"
                data={[
                  { label: 'Jan', value: 12000 },
                  { label: 'Feb', value: 13000 },
                  { label: 'Mar', value: 13500 },
                  { label: 'Apr', value: 14200 },
                  { label: 'May', value: 14800 },
                  { label: 'Jun', value: 15420 }
                ]}
                type="bar"
                height={320}
              />
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
    </div>
  )
}