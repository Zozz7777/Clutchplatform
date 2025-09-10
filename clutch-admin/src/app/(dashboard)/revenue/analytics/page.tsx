'use client'

import React, { useState, useEffect } from 'react'
import { SnowCard, SnowCardHeader, SnowCardContent, SnowCardTitle, SnowCardDescription } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { Badge } from '@/components/ui/badge'
import { 
  PoundSterling, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Building2, 
  Smartphone, 
  ShoppingCart, 
  Target, 
  Calendar, 
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  CreditCard,
  Wallet,
  Receipt,
  DollarSign,
  Percent,
  Activity,
  Globe,
  Car,
  Wrench
} from 'lucide-react'
import { useRevenueDashboard } from '@/hooks/useRevenueDashboard'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api'

interface RevenueMetrics {
  totalRevenue: number
  monthlyRevenue: number
  yearlyRevenue: number
  revenueGrowth: number
  averageOrderValue: number
  monthlyRecurringRevenue: number
  customerLifetimeValue: number
  churnRate: number
  netRevenueRetention: number
  grossMargin: number
  conversionRate: number
  paymentSuccessRate: number
}

interface RevenueBySource {
  source: string
  revenue: number
  percentage: number
  growth: number
  color: string
}

interface RevenueByRegion {
  region: string
  revenue: number
  customers: number
  averageOrderValue: number
  growth: number
}

interface PaymentMethod {
  method: string
  revenue: number
  transactions: number
  percentage: number
  successRate: number
}

export default function RevenueAnalyticsPage() {
  const [metrics, setMetrics] = useState<RevenueMetrics>({
    totalRevenue: 2450000,
    monthlyRevenue: 340000,
    yearlyRevenue: 2450000,
    revenueGrowth: 12.5,
    averageOrderValue: 45.80,
    monthlyRecurringRevenue: 185000,
    customerLifetimeValue: 285,
    churnRate: 3.2,
    netRevenueRetention: 108.5,
    grossMargin: 68.4,
    conversionRate: 12.8,
    paymentSuccessRate: 97.2
  })

  const [revenueSources, setRevenueSources] = useState<RevenueBySource[]>([
    {
      source: 'Customer Bookings',
      revenue: 1450000,
      percentage: 59.2,
      growth: 15.3,
      color: '#3B82F6'
    },
    {
      source: 'Partner Commissions',
      revenue: 485000,
      percentage: 19.8,
      growth: 8.7,
      color: '#10B981'
    },
    {
      source: 'Fleet Management',
      revenue: 380000,
      percentage: 15.5,
      growth: 28.4,
      color: '#F59E0B'
    },
    {
      source: 'Enterprise Subscriptions',
      revenue: 135000,
      percentage: 5.5,
      growth: 45.2,
      color: '#8B5CF6'
    }
  ])

  const [revenueByRegion, setRevenueByRegion] = useState<RevenueByRegion[]>([
    {
      region: 'London',
      revenue: 985000,
      customers: 45000,
      averageOrderValue: 52.30,
      growth: 14.2
    },
    {
      region: 'Manchester',
      revenue: 485000,
      customers: 22000,
      averageOrderValue: 48.90,
      growth: 18.7
    },
    {
      region: 'Birmingham',
      revenue: 380000,
      customers: 18500,
      averageOrderValue: 43.20,
      growth: 11.8
    },
    {
      region: 'Edinburgh',
      revenue: 245000,
      customers: 12800,
      averageOrderValue: 47.60,
      growth: 22.3
    },
    {
      region: 'Other Cities',
      revenue: 355000,
      customers: 26700,
      averageOrderValue: 41.10,
      growth: 9.4
    }
  ])

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      method: 'Credit Card',
      revenue: 1680000,
      transactions: 38500,
      percentage: 68.6,
      successRate: 97.8
    },
    {
      method: 'Apple Pay',
      revenue: 485000,
      transactions: 10200,
      percentage: 19.8,
      successRate: 98.9
    },
    {
      method: 'Google Pay',
      revenue: 185000,
      transactions: 4100,
      percentage: 7.6,
      successRate: 98.2
    },
    {
      method: 'Bank Transfer',
      revenue: 100000,
      transactions: 1800,
      percentage: 4.1,
      successRate: 94.5
    }
  ])

  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('30d')

  useEffect(() => {
    loadRevenueData()
  }, [selectedPeriod])

  const loadRevenueData = async () => {
    try {
      setIsLoading(true)
      
      const [
        metricsResponse,
        sourcesResponse,
        regionsResponse,
        paymentsResponse
      ] = await Promise.all([
        apiClient.get<RevenueMetrics>(`/revenue/metrics?period=${selectedPeriod}`),
        apiClient.get<RevenueBySource[]>(`/revenue/sources?period=${selectedPeriod}`),
        apiClient.get<RevenueByRegion[]>(`/revenue/regions?period=${selectedPeriod}`),
        apiClient.get<PaymentMethod[]>(`/revenue/payment-methods?period=${selectedPeriod}`)
      ])

      if (metricsResponse.success && metricsResponse.data) {
        setMetrics(metricsResponse.data)
      }

      if (sourcesResponse.success && sourcesResponse.data) {
        setRevenueSources(sourcesResponse.data)
      }

      if (regionsResponse.success && regionsResponse.data) {
        setRevenueByRegion(regionsResponse.data)
      }

      if (paymentsResponse.success && paymentsResponse.data) {
        setPaymentMethods(paymentsResponse.data)
      }
    } catch (error) {
      console.error('Failed to load revenue data:', error)
      toast.error('Failed to load revenue analytics')
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

  const formatCurrencyDetailed = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
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

  // Sample data for charts
  const monthlyRevenueData = [
    { name: 'Jan', revenue: 185000, target: 180000, customers: 115000, bookings: 4200 },
    { name: 'Feb', revenue: 225000, target: 200000, customers: 117600, bookings: 4850 },
    { name: 'Mar', revenue: 265000, target: 220000, customers: 120520, bookings: 5680 },
    { name: 'Apr', revenue: 290000, target: 240000, customers: 123000, bookings: 6100 },
    { name: 'May', revenue: 315000, target: 260000, customers: 125720, bookings: 6480 },
    { name: 'Jun', revenue: 340000, target: 280000, customers: 128230, bookings: 7020 }
  ]

  const revenueBreakdownData = [
    { name: 'Bookings', value: 1450000, color: '#3B82F6' },
    { name: 'Partners', value: 485000, color: '#10B981' },
    { name: 'Fleet', value: 380000, color: '#F59E0B' },
    { name: 'Enterprise', value: 135000, color: '#8B5CF6' }
  ]

  const cohortRevenueData = [
    { name: 'Week 1', newCustomers: 485000, existingCustomers: 1245000, churn: 45000 },
    { name: 'Week 2', newCustomers: 520000, existingCustomers: 1380000, churn: 38000 },
    { name: 'Week 3', newCustomers: 465000, existingCustomers: 1420000, churn: 52000 },
    { name: 'Week 4', newCustomers: 540000, existingCustomers: 1485000, churn: 41000 }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Revenue Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive revenue analysis across all platform verticals
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
          <SnowButton variant="outline" onClick={loadRevenueData} disabled={isLoading}>
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
                <p className="text-green-100 text-sm font-medium">Total Revenue</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(metrics.totalRevenue)}</p>
                <p className="text-green-100 text-xs flex items-center">
                  <span className={getGrowthColor(metrics.revenueGrowth)}>
                    {getGrowthIcon(metrics.revenueGrowth)}
                    {Math.abs(metrics.revenueGrowth)}%
                  </span>
                  <span className="ml-1">vs last period</span>
                </p>
              </div>
              <PoundSterling className="h-8 w-8 text-green-200" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard variant="dark">
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Monthly Revenue</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(metrics.monthlyRevenue)}</p>
                <p className="text-blue-100 text-xs">
                  MRR: {formatCurrency(metrics.monthlyRecurringRevenue)}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-200" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard variant="dark">
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Avg Order Value</p>
                <p className="text-2xl font-bold text-white">{formatCurrencyDetailed(metrics.averageOrderValue)}</p>
                <p className="text-purple-100 text-xs">
                  {metrics.conversionRate}% conversion rate
                </p>
              </div>
              <ShoppingCart className="h-8 w-8 text-purple-200" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard variant="dark">
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Gross Margin</p>
                <p className="text-2xl font-bold text-white">{metrics.grossMargin}%</p>
                <p className="text-orange-100 text-xs">
                  LTV: {formatCurrency(metrics.customerLifetimeValue)}
                </p>
              </div>
              <Target className="h-8 w-8 text-orange-200" />
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle>Monthly Revenue Trends</SnowCardTitle>
            <SnowCardDescription>Revenue vs targets and customer growth</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              Chart component placeholder - integrate with your preferred charting library
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle>Revenue Breakdown</SnowCardTitle>
            <SnowCardDescription>Revenue distribution by business vertical</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              Chart component placeholder - integrate with your preferred charting library
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle icon={<BarChart3 className="h-5 w-5 text-green-600" />}>
            Revenue by Source
          </SnowCardTitle>
          <SnowCardDescription>Performance breakdown by revenue stream</SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {revenueSources.map((source, index) => (
              <div key={index} className="p-4 bg-slate-50 bg-slate-100 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: source.color }} />
                    <h4 className="font-semibold">{source.source}</h4>
                  </div>
                  <Badge variant="outline">{source.percentage}%</Badge>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-2xl font-bold">{formatCurrency(source.revenue)}</p>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <span className={getGrowthColor(source.growth)}>
                        {getGrowthIcon(source.growth)}
                        {Math.abs(source.growth)}%
                      </span>
                      <span className="ml-1">growth</span>
                    </p>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ 
                        width: `${source.percentage}%`,
                        backgroundColor: source.color 
                      }}
                    />
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
            <SnowCardTitle icon={<Globe className="h-5 w-5 text-blue-600" />}>
              Revenue by Region
            </SnowCardTitle>
            <SnowCardDescription>Geographic distribution of revenue</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="space-y-4">
              {revenueByRegion.map((region, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 bg-slate-100 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{region.region}</h4>
                      <span className="font-bold">{formatCurrency(region.revenue)}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Customers</p>
                        <p className="font-medium">{formatNumber(region.customers)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">AOV</p>
                        <p className="font-medium">{formatCurrencyDetailed(region.averageOrderValue)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Growth</p>
                        <p className={`font-medium ${getGrowthColor(region.growth)}`}>
                          {region.growth >= 0 ? '+' : ''}{region.growth}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle icon={<CreditCard className="h-5 w-5 text-purple-400" />}>
              Payment Methods
            </SnowCardTitle>
            <SnowCardDescription>Revenue breakdown by payment method</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="space-y-4">
              {paymentMethods.map((method, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 bg-slate-100 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{method.method}</h4>
                      <Badge variant="outline">{method.percentage}%</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Revenue</p>
                        <p className="font-medium">{formatCurrency(method.revenue)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Transactions</p>
                        <p className="font-medium">{formatNumber(method.transactions)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Success Rate</p>
                        <p className="font-medium text-green-500">{method.successRate}%</p>
                      </div>
                    </div>
                    <div className="mt-2 w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full" 
                        style={{ width: `${method.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle>Customer Cohort Revenue</SnowCardTitle>
          <SnowCardDescription>Revenue contribution from new vs existing customers</SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            Chart component placeholder - integrate with your preferred charting library
          </div>
        </SnowCardContent>
      </SnowCard>
      <div className="grid gap-4 md:grid-cols-3">
        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-red-500/20 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Churn Rate</p>
                <p className="text-2xl font-bold">{metrics.churnRate}%</p>
                <p className="text-sm text-red-500">-0.3% vs last month</p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <Percent className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Net Revenue Retention</p>
                <p className="text-2xl font-bold">{metrics.netRevenueRetention}%</p>
                <p className="text-sm text-green-500">+2.1% vs last month</p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Activity className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Success Rate</p>
                <p className="text-2xl font-bold">{metrics.paymentSuccessRate}%</p>
                <p className="text-sm text-blue-500">+0.5% vs last month</p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
    </div>
  )
}


