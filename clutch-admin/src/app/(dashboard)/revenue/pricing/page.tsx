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
  Target,
  BarChart3,
  PieChart,
  Edit,
  Save,
  RefreshCw,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

export default function PricingAnalyticsPage() {
  const [selectedTab, setSelectedTab] = useState('overview')
  const [editingPrice, setEditingPrice] = useState(null)

  const pricingMetrics = [
    {
      name: 'Average Revenue Per User',
      value: '$89.50',
      change: '+8.2%',
      trend: 'up',
      status: 'good'
    },
    {
      name: 'Price Elasticity',
      value: '-1.2',
      change: '+0.1',
      trend: 'up',
      status: 'good'
    },
    {
      name: 'Conversion Rate',
      value: '12.4%',
      change: '+1.8%',
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

  const pricingTiers = [
    {
      name: 'Starter',
      price: 29,
      users: 1247,
      revenue: 36163,
      growth: 12.5,
      conversion: 8.2,
      churn: 4.1
    },
    {
      name: 'Professional',
      price: 79,
      users: 892,
      revenue: 70468,
      growth: 18.3,
      conversion: 15.6,
      churn: 2.8
    },
    {
      name: 'Enterprise',
      price: 199,
      users: 156,
      revenue: 31044,
      growth: 25.7,
      conversion: 22.4,
      churn: 1.2
    }
  ]

  const priceExperiments = [
    {
      name: 'Starter Plan Price Test',
      currentPrice: 29,
      testPrice: 34,
      status: 'running',
      duration: '2 weeks',
      impact: '+15% revenue',
      confidence: 78
    },
    {
      name: 'Professional Feature Test',
      currentPrice: 79,
      testPrice: 89,
      status: 'completed',
      duration: '4 weeks',
      impact: '+8% conversion',
      confidence: 92
    },
    {
      name: 'Enterprise Discount Test',
      currentPrice: 199,
      testPrice: 179,
      status: 'planned',
      duration: '3 weeks',
      impact: 'TBD',
      confidence: 0
    }
  ]

  const competitorPricing = [
    {
      competitor: 'Competitor A',
      starter: 25,
      professional: 75,
      enterprise: 180,
      marketShare: 35
    },
    {
      competitor: 'Competitor B',
      starter: 35,
      professional: 85,
      enterprise: 220,
      marketShare: 28
    },
    {
      competitor: 'Competitor C',
      starter: 30,
      professional: 80,
      enterprise: 200,
      marketShare: 22
    }
  ]

  const pricingInsights = [
    {
      insight: 'Professional plan shows highest growth potential',
      impact: 'High',
      recommendation: 'Consider increasing price by 10-15%',
      confidence: 87
    },
    {
      insight: 'Starter plan price elasticity is optimal',
      impact: 'Medium',
      recommendation: 'Maintain current pricing strategy',
      confidence: 92
    },
    {
      insight: 'Enterprise customers are price-insensitive',
      impact: 'High',
      recommendation: 'Test premium features at higher price points',
      confidence: 78
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'critical': return 'text-red-600 bg-red-100'
      case 'running': return 'text-blue-600 bg-blue-100'
      case 'completed': return 'text-green-600 bg-green-100'
      case 'planned': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? 
      <TrendingUp className="h-4 w-4 text-green-500" /> : 
      <TrendingDown className="h-4 w-4 text-red-500" />
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'text-red-600 bg-red-100'
      case 'Medium': return 'text-yellow-600 bg-yellow-100'
      case 'Low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pricing Analytics</h1>
          <p className="text-muted-foreground">
            Analyze pricing performance and optimize revenue
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
          <Button>
            <BarChart3 className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Pricing Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        {pricingMetrics.map((metric) => (
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

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'tiers', label: 'Pricing Tiers' },
          { id: 'experiments', label: 'A/B Tests' },
          { id: 'competitors', label: 'Competitors' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Tier</CardTitle>
              <CardDescription>
                Revenue distribution across pricing tiers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pricingTiers.map((tier, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium">{tier.name}</h4>
                        <span className="text-sm font-medium">${tier.price}/mo</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(tier.revenue / 140000) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground mt-1">
                        <span>{tier.users} users</span>
                        <span>${(tier.revenue / 1000).toFixed(0)}K revenue</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing Insights</CardTitle>
              <CardDescription>
                AI-generated insights and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pricingInsights.map((insight, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{insight.insight}</h4>
                      <Badge className={getImpactColor(insight.impact)}>
                        {insight.impact}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {insight.recommendation}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Confidence: {insight.confidence}%
                      </span>
                      <Button variant="outline" size="sm">
                        Implement
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pricing Tiers Tab */}
      {selectedTab === 'tiers' && (
        <Card>
          <CardHeader>
            <CardTitle>Pricing Tier Analysis</CardTitle>
            <CardDescription>
              Detailed performance metrics for each pricing tier
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pricingTiers.map((tier, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{tier.name}</h3>
                      <p className="text-2xl font-bold">${tier.price}<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4 mr-1" />
                        Analyze
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{tier.users}</p>
                      <p className="text-sm text-muted-foreground">Users</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">${(tier.revenue / 1000).toFixed(0)}K</p>
                      <p className="text-sm text-muted-foreground">Revenue</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">+{tier.growth}%</p>
                      <p className="text-sm text-muted-foreground">Growth</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">{tier.conversion}%</p>
                      <p className="text-sm text-muted-foreground">Conversion</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* A/B Tests Tab */}
      {selectedTab === 'experiments' && (
        <Card>
          <CardHeader>
            <CardTitle>Pricing Experiments</CardTitle>
            <CardDescription>
              A/B tests and price optimization experiments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {priceExperiments.map((experiment, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium">{experiment.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                        <span>Current: ${experiment.currentPrice}</span>
                        <span>Test: ${experiment.testPrice}</span>
                        <span>Duration: {experiment.duration}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(experiment.status)}>
                        {experiment.status}
                      </Badge>
                      {experiment.confidence > 0 && (
                        <span className="text-sm text-muted-foreground">
                          {experiment.confidence}% confidence
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium">{experiment.impact}</span>
                    </div>
                    <div className="flex space-x-2">
                      {experiment.status === 'running' && (
                        <Button variant="outline" size="sm">
                          Stop Test
                        </Button>
                      )}
                      {experiment.status === 'completed' && (
                        <Button variant="outline" size="sm">
                          Apply Changes
                        </Button>
                      )}
                      {experiment.status === 'planned' && (
                        <Button size="sm">
                          Start Test
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Competitors Tab */}
      {selectedTab === 'competitors' && (
        <Card>
          <CardHeader>
            <CardTitle>Competitive Pricing Analysis</CardTitle>
            <CardDescription>
              Compare pricing with key competitors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {competitorPricing.map((competitor, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{competitor.competitor}</h4>
                    <Badge variant="outline">{competitor.marketShare}% market share</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-lg font-bold">${competitor.starter}</p>
                      <p className="text-sm text-muted-foreground">Starter</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">${competitor.professional}</p>
                      <p className="text-sm text-muted-foreground">Professional</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">${competitor.enterprise}</p>
                      <p className="text-sm text-muted-foreground">Enterprise</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing Optimization Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Optimization Summary</CardTitle>
          <CardDescription>
            Key recommendations for pricing strategy optimization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <Target className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold">Optimal Pricing</h3>
              <p className="text-sm text-muted-foreground">Professional tier</p>
              <p className="text-2xl font-bold text-blue-600">$89</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-semibold">Revenue Impact</h3>
              <p className="text-sm text-muted-foreground">Potential increase</p>
              <p className="text-2xl font-bold text-green-600">+15%</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-semibold">Confidence Level</h3>
              <p className="text-sm text-muted-foreground">Model accuracy</p>
              <p className="text-2xl font-bold text-purple-600">87%</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Recommended Actions</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Increase Professional plan price to $89 (+12.7% increase)</li>
              <li>• Test Enterprise plan premium features at $220</li>
              <li>• Maintain Starter plan pricing for market penetration</li>
              <li>• Implement dynamic pricing for high-value customers</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
