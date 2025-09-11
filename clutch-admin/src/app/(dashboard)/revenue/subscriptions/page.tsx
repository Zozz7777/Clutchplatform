'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar,
  Target,
  BarChart3,
  PieChart,
  RefreshCw,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

export default function SubscriptionMetricsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('12m')
  const [selectedMetric, setSelectedMetric] = useState('mrr')

  const subscriptionMetrics = [
    {
      name: 'Monthly Recurring Revenue',
      value: '$2.4M',
      change: '+12.5%',
      trend: 'up',
      status: 'good'
    },
    {
      name: 'Annual Recurring Revenue',
      value: '$28.8M',
      change: '+15.2%',
      trend: 'up',
      status: 'good'
    },
    {
      name: 'Customer Lifetime Value',
      value: '$2,847',
      change: '+8.7%',
      trend: 'up',
      status: 'good'
    },
    {
      name: 'Churn Rate',
      value: '3.2%',
      change: '-0.5%',
      trend: 'down',
      status: 'good'
    }
  ]

  const subscriptionTiers = [
    {
      name: 'Starter',
      price: 29,
      subscribers: 1247,
      mrr: 36163,
      churn: 4.1,
      growth: 12.5,
      ltv: 1847
    },
    {
      name: 'Professional',
      price: 79,
      subscribers: 892,
      mrr: 70468,
      churn: 2.8,
      growth: 18.3,
      ltv: 2847
    },
    {
      name: 'Enterprise',
      price: 199,
      subscribers: 156,
      mrr: 31044,
      churn: 1.2,
      growth: 25.7,
      ltv: 4847
    }
  ]

  const cohortAnalysis = [
    {
      cohort: 'Jan 2024',
      subscribers: 1200,
      month1: 95.2,
      month2: 92.1,
      month3: 89.4,
      month6: 84.7,
      month12: 78.9
    },
    {
      cohort: 'Feb 2024',
      subscribers: 1350,
      month1: 96.1,
      month2: 93.2,
      month3: 90.1,
      month6: 85.3,
      month12: 79.8
    },
    {
      cohort: 'Mar 2024',
      subscribers: 1180,
      month1: 94.8,
      month2: 91.7,
      month3: 88.9,
      month6: 83.2,
      month12: 77.1
    }
  ]

  const subscriptionEvents = [
    {
      type: 'new_subscription',
      count: 234,
      revenue: 18720,
      period: 'last 30 days',
      trend: 'up'
    },
    {
      type: 'upgrade',
      count: 89,
      revenue: 12450,
      period: 'last 30 days',
      trend: 'up'
    },
    {
      type: 'downgrade',
      count: 23,
      revenue: -3450,
      period: 'last 30 days',
      trend: 'down'
    },
    {
      type: 'cancellation',
      count: 45,
      revenue: -12890,
      period: 'last 30 days',
      trend: 'down'
    }
  ]

  const retentionMetrics = [
    {
      period: '1 Month',
      rate: 95.2,
      trend: 'up'
    },
    {
      period: '3 Months',
      rate: 89.4,
      trend: 'up'
    },
    {
      period: '6 Months',
      rate: 84.7,
      trend: 'up'
    },
    {
      period: '12 Months',
      rate: 78.9,
      trend: 'up'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? 
      <TrendingUp className="h-4 w-4 text-green-500" /> : 
      <TrendingDown className="h-4 w-4 text-red-500" />
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'new_subscription': return 'text-green-600 bg-green-100'
      case 'upgrade': return 'text-blue-600 bg-blue-100'
      case 'downgrade': return 'text-yellow-600 bg-yellow-100'
      case 'cancellation': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription Metrics</h1>
          <p className="text-muted-foreground">
            Monitor subscription performance and customer retention
          </p>
        </div>
        <div className="flex space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="3m">3 Months</option>
            <option value="6m">6 Months</option>
            <option value="12m">12 Months</option>
            <option value="24m">24 Months</option>
          </select>
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Subscription Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        {subscriptionMetrics.map((metric) => (
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
                  {metric.change} from last month
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Subscription Tiers Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Tiers Performance</CardTitle>
            <CardDescription>
              Performance metrics by subscription tier
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subscriptionTiers.map((tier, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{tier.name}</h4>
                      <p className="text-2xl font-bold">${tier.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">MRR</p>
                      <p className="text-lg font-bold">${(tier.mrr / 1000).toFixed(0)}K</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-lg font-bold text-blue-600">{tier.subscribers}</p>
                      <p className="text-xs text-muted-foreground">Subscribers</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-600">{tier.churn}%</p>
                      <p className="text-xs text-muted-foreground">Churn Rate</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-purple-600">${tier.ltv}</p>
                      <p className="text-xs text-muted-foreground">LTV</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Subscription Events */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Events</CardTitle>
            <CardDescription>
              Recent subscription activities and revenue impact
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subscriptionEvents.map((event, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium capitalize">{event.type.replace('_', ' ')}</h4>
                      <Badge className={getEventColor(event.type)}>
                        {event.trend}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{event.count} events</span>
                      <span>{event.period}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${event.revenue > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {event.revenue > 0 ? '+' : ''}${event.revenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Revenue Impact</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cohort Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Cohort Analysis</CardTitle>
          <CardDescription>
            Customer retention rates by subscription cohort
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Cohort</th>
                  <th className="text-right p-2">Subscribers</th>
                  <th className="text-right p-2">Month 1</th>
                  <th className="text-right p-2">Month 2</th>
                  <th className="text-right p-2">Month 3</th>
                  <th className="text-right p-2">Month 6</th>
                  <th className="text-right p-2">Month 12</th>
                </tr>
              </thead>
              <tbody>
                {cohortAnalysis.map((cohort, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 font-medium">{cohort.cohort}</td>
                    <td className="p-2 text-right">{cohort.subscribers.toLocaleString()}</td>
                    <td className="p-2 text-right">{cohort.month1}%</td>
                    <td className="p-2 text-right">{cohort.month2}%</td>
                    <td className="p-2 text-right">{cohort.month3}%</td>
                    <td className="p-2 text-right">{cohort.month6}%</td>
                    <td className="p-2 text-right">{cohort.month12}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Retention Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Retention Metrics</CardTitle>
          <CardDescription>
            Customer retention rates over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {retentionMetrics.map((metric, index) => (
              <div key={index} className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">{metric.rate}%</div>
                <p className="font-medium">{metric.period}</p>
                <div className="flex items-center justify-center mt-2">
                  {getTrendIcon(metric.trend)}
                  <span className="text-xs text-muted-foreground ml-1">Retention</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subscription Health Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Health Summary</CardTitle>
          <CardDescription>
            Overall subscription performance and key insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-semibold">MRR Growth</h3>
              <p className="text-sm text-muted-foreground">Monthly recurring revenue</p>
              <p className="text-2xl font-bold text-green-600">+12.5%</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold">Customer Retention</h3>
              <p className="text-sm text-muted-foreground">12-month retention</p>
              <p className="text-2xl font-bold text-blue-600">78.9%</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Target className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-semibold">LTV Growth</h3>
              <p className="text-sm text-muted-foreground">Customer lifetime value</p>
              <p className="text-2xl font-bold text-purple-600">+8.7%</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Subscription Insights</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Professional tier shows highest growth potential (+18.3%)</li>
              <li>• Enterprise customers have lowest churn rate (1.2%)</li>
              <li>• New subscription events are trending upward (+234 this month)</li>
              <li>• 12-month retention rate is above industry average (78.9%)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
