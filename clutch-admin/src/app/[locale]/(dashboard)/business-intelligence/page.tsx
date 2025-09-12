'use client'

import React, { useState, useEffect } from 'react'
import { SnowCard, SnowCardHeader, SnowCardContent, SnowCardTitle, SnowCardDescription } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  PoundSterling, 
  Building2, 
  Smartphone, 
  Globe, 
  Target, 
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  RefreshCw,
  Brain,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  MousePointer,
  Star,
  ShoppingCart,
  Car,
  Wrench
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

interface BusinessMetrics {
  revenue: {
    total: number
    monthly: number
    growth: number
    target: number
    forecast: number
  }
  customers: {
    total: number
    active: number
    churn: number
    acquisition: number
    growth: number
  }
  partners: {
    total: number
    active: number
    revenue: number
    growth: number
  }
  fleet: {
    clients: number
    vehicles: number
    revenue: number
    growth: number
  }
  mobile: {
    downloads: number
    activeUsers: number
    rating: number
    retention: number
  }
  operational: {
    tickets: number
    resolution: number
    satisfaction: number
    uptime: number
  }
}

interface KPITarget {
  metric: string
  current: number
  target: number
  progress: number
  status: 'on-track' | 'at-risk' | 'behind'
  trend: 'up' | 'down' | 'stable'
}

export default function BusinessIntelligencePage() {
  const [metrics, setMetrics] = useState<BusinessMetrics>({
    revenue: {
      total: 2450000,
      monthly: 340000,
      growth: 12.5,
      target: 3000000,
      forecast: 2890000
    },
    customers: {
      total: 125000,
      active: 89500,
      churn: 3.2,
      acquisition: 2800,
      growth: 18.7
    },
    partners: {
      total: 1250,
      active: 890,
      revenue: 485000,
      growth: 15.3
    },
    fleet: {
      clients: 45,
      vehicles: 2890,
      revenue: 180000,
      growth: 28.4
    },
    mobile: {
      downloads: 142000,
      activeUsers: 52000,
      rating: 4.6,
      retention: 73.2
    },
    operational: {
      tickets: 342,
      resolution: 87.5,
      satisfaction: 94.2,
      uptime: 99.8
    }
  })

  const [kpiTargets, setKpiTargets] = useState<KPITarget[]>([
    {
      metric: 'Annual Revenue',
      current: 2450000,
      target: 3000000,
      progress: 81.7,
      status: 'on-track',
      trend: 'up'
    },
    {
      metric: 'Customer Acquisition',
      current: 2800,
      target: 3500,
      progress: 80.0,
      status: 'on-track',
      trend: 'up'
    },
    {
      metric: 'Customer Retention',
      current: 96.8,
      target: 95.0,
      progress: 101.9,
      status: 'on-track',
      trend: 'up'
    },
    {
      metric: 'Platform Uptime',
      current: 99.8,
      target: 99.9,
      progress: 99.9,
      status: 'at-risk',
      trend: 'stable'
    },
    {
      metric: 'Support Resolution',
      current: 87.5,
      target: 90.0,
      progress: 97.2,
      status: 'behind',
      trend: 'down'
    }
  ])

  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('30d')

  useEffect(() => {
    loadBusinessData()
  }, [selectedPeriod])

  const loadBusinessData = async () => {
    try {
      setIsLoading(true)
      
      const [metricsResponse, kpiResponse] = await Promise.all([
        apiClient.get<BusinessMetrics>(`/business-intelligence/metrics?period=${selectedPeriod}`),
        apiClient.get<KPITarget[]>(`/business-intelligence/kpi-targets?period=${selectedPeriod}`)
      ])

      if (metricsResponse.success && metricsResponse.data) {
        setMetrics(metricsResponse.data)
      }

      if (kpiResponse.success && kpiResponse.data) {
        setKpiTargets(kpiResponse.data)
      }
    } catch (error) {
      console.error('Failed to load business intelligence data:', error)
      toast.error('Failed to load business intelligence data')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-GB').format(num)
  }

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />
  }

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-500' : 'text-red-500'
  }

  const getKPIStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'bg-green-500'
      case 'at-risk': return 'bg-yellow-500'
      case 'behind': return 'bg-red-500'
      default: return 'bg-red-500'
    }
  }

  // Sample data for charts
  const revenueData = [
    { name: 'Jan', value: 185000, forecast: 180000, target: 200000 },
    { name: 'Feb', value: 225000, forecast: 220000, target: 220000 },
    { name: 'Mar', value: 265000, forecast: 260000, target: 240000 },
    { name: 'Apr', value: 290000, forecast: 285000, target: 260000 },
    { name: 'May', value: 315000, forecast: 310000, target: 280000 },
    { name: 'Jun', value: 340000, forecast: 335000, target: 300000 },
    { name: 'Jul', value: 0, forecast: 360000, target: 320000 },
    { name: 'Aug', value: 0, forecast: 385000, target: 340000 },
    { name: 'Sep', value: 0, forecast: 410000, target: 360000 },
    { name: 'Oct', value: 0, forecast: 435000, target: 380000 },
    { name: 'Nov', value: 0, forecast: 460000, target: 400000 },
    { name: 'Dec', value: 0, forecast: 485000, target: 420000 }
  ]

  const customerGrowthData = [
    { name: 'Week 1', customers: 118000, partners: 1180, fleet: 42 },
    { name: 'Week 2', customers: 121000, partners: 1195, fleet: 43 },
    { name: 'Week 3', customers: 123500, partners: 1210, fleet: 44 },
    { name: 'Week 4', customers: 125000, partners: 1250, fleet: 45 }
  ]

  const platformUsageData = [
    { name: 'Customer App', value: 52000, color: '#3B82F6' },
    { name: 'Partner App', value: 8900, color: '#10B981' },
    { name: 'Fleet App', value: 3200, color: '#F59E0B' },
    { name: 'Website', value: 24500, color: '#EF4444' },
    { name: 'Admin', value: 890, color: '#8B5CF6' }
  ]

  const operationalMetrics = [
    { name: 'Mon', tickets: 42, resolved: 38, satisfaction: 94 },
    { name: 'Tue', tickets: 38, resolved: 35, satisfaction: 92 },
    { name: 'Wed', tickets: 45, resolved: 41, satisfaction: 96 },
    { name: 'Thu', tickets: 52, resolved: 47, satisfaction: 89 },
    { name: 'Fri', tickets: 39, resolved: 36, satisfaction: 95 },
    { name: 'Sat', tickets: 28, resolved: 26, satisfaction: 97 },
    { name: 'Sun', tickets: 22, resolved: 21, satisfaction: 98 }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Intelligence</h1>
          <p className="text-muted-foreground">
            Comprehensive insights and KPIs across the entire Clutch ecosystem
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-slate-700 rounded-lg bg-slate-800 text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <SnowButton variant="outline" onClick={loadBusinessData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </SnowButton>
                     <SnowButton variant="default">
             <Download className="h-4 w-4 mr-2" />
             Export Report
           </SnowButton>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                 <SnowCard variant="dark">
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Revenue</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(metrics.revenue.total)}</p>
                <p className="text-blue-100 text-xs flex items-center">
                  <span className={getGrowthColor(metrics.revenue.growth)}>
                    {getGrowthIcon(metrics.revenue.growth)}
                    {Math.abs(metrics.revenue.growth)}%
                  </span>
                  <span className="ml-1">vs last period</span>
                </p>
              </div>
              <PoundSterling className="h-8 w-8 text-blue-200" />
            </div>
          </SnowCardContent>
        </SnowCard>

                 <SnowCard variant="dark">
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Active Customers</p>
                <p className="text-2xl font-bold text-white">{formatNumber(metrics.customers.active)}</p>
                <p className="text-green-100 text-xs flex items-center">
                  <span className={getGrowthColor(metrics.customers.growth)}>
                    {getGrowthIcon(metrics.customers.growth)}
                    {Math.abs(metrics.customers.growth)}%
                  </span>
                  <span className="ml-1">growth rate</span>
                </p>
              </div>
              <Users className="h-8 w-8 text-green-200" />
            </div>
          </SnowCardContent>
        </SnowCard>

                 <SnowCard variant="dark">
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Active Partners</p>
                <p className="text-2xl font-bold text-white">{formatNumber(metrics.partners.active)}</p>
                <p className="text-purple-100 text-xs flex items-center">
                  <span className={getGrowthColor(metrics.partners.growth)}>
                    {getGrowthIcon(metrics.partners.growth)}
                    {Math.abs(metrics.partners.growth)}%
                  </span>
                  <span className="ml-1">partner growth</span>
                </p>
              </div>
              <Building2 className="h-8 w-8 text-purple-200" />
            </div>
          </SnowCardContent>
        </SnowCard>

                 <SnowCard variant="dark">
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Fleet Vehicles</p>
                <p className="text-2xl font-bold text-white">{formatNumber(metrics.fleet.vehicles)}</p>
                <p className="text-orange-100 text-xs flex items-center">
                  <span className={getGrowthColor(metrics.fleet.growth)}>
                    {getGrowthIcon(metrics.fleet.growth)}
                    {Math.abs(metrics.fleet.growth)}%
                  </span>
                  <span className="ml-1">fleet expansion</span>
                </p>
              </div>
              <Car className="h-8 w-8 text-orange-200" />
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle icon={<Target className="h-5 w-5 text-blue-400" />}>
            Key Performance Indicators
          </SnowCardTitle>
          <SnowCardDescription>Progress towards strategic business goals</SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          <div className="space-y-4">
            {kpiTargets.map((kpi, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-50 bg-slate-100 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${getKPIStatusColor(kpi.status)}`} />
                  <div>
                    <p className="font-medium">{kpi.metric}</p>
                    <p className="text-sm text-muted-foreground">
                      {typeof kpi.current === 'number' && kpi.current > 1000 ? formatNumber(kpi.current) : kpi.current}
                      {' '}/ {typeof kpi.target === 'number' && kpi.target > 1000 ? formatNumber(kpi.target) : kpi.target}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        kpi.status === 'on-track' ? 'bg-green-500' : 
                        kpi.status === 'at-risk' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(kpi.progress, 100)}%` }}
                    />
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{kpi.progress.toFixed(1)}%</p>
                    <Badge variant={kpi.status === 'on-track' ? 'default' : 'destructive'} className="text-xs">
                      {kpi.status.replace('-', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SnowCardContent>
      </SnowCard>
      <div className="grid gap-6 md:grid-cols-2">
        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle>Revenue Forecast</SnowCardTitle>
            <SnowCardDescription>Actual vs forecast vs target revenue</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="h-300 bg-slate-100 bg-white rounded-lg flex items-center justify-center">
              Revenue Chart Placeholder
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle>Platform Usage Distribution</SnowCardTitle>
            <SnowCardDescription>Active users across all platforms</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="h-300 bg-slate-100 bg-white rounded-lg flex items-center justify-center">
              Platform Usage Chart Placeholder
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle>Customer Growth Trends</SnowCardTitle>
            <SnowCardDescription>Growth across all business segments</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="h-300 bg-slate-100 bg-white rounded-lg flex items-center justify-center">
              Customer Growth Chart Placeholder
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle>Operational Performance</SnowCardTitle>
            <SnowCardDescription>Support tickets and customer satisfaction</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="h-300 bg-slate-100 bg-white rounded-lg flex items-center justify-center">
              Operational Performance Chart Placeholder
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle icon={<Brain className="h-5 w-5 text-purple-400" />}>
            AI-Powered Business Insights
          </SnowCardTitle>
          <SnowCardDescription>Automated analysis and recommendations</SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">Strong Revenue Growth</p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Revenue is 12.5% above target this quarter. Fleet management segment showing exceptional growth.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Users className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-200">Customer Acquisition Trending Up</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Mobile app downloads increased 18.7% this month. Consider expanding marketing budget.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">Support Response Time</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Average response time increased. Consider adding more support staff during peak hours.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Star className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="font-medium text-purple-800 dark:text-purple-200">Partner Satisfaction High</p>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    Partner app ratings improved to 4.4/5. Focus on expanding partner network.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SnowCardContent>
      </SnowCard>
    </div>
  )
}


