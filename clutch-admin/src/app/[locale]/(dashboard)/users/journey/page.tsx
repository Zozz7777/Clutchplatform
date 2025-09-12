'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Map, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  Target,
  BarChart3,
  PieChart,
  ArrowRight,
  ArrowDown,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'

export default function UserJourneyPage() {
  const [selectedJourney, setSelectedJourney] = useState('onboarding')
  const [selectedPeriod, setSelectedPeriod] = useState('30d')

  const journeyMetrics = [
    {
      name: 'Conversion Rate',
      value: '23.4%',
      change: '+2.1%',
      trend: 'up',
      status: 'good'
    },
    {
      name: 'Time to Convert',
      value: '12.3 days',
      change: '-1.2 days',
      trend: 'down',
      status: 'good'
    },
    {
      name: 'Drop-off Rate',
      value: '8.7%',
      change: '-0.8%',
      trend: 'down',
      status: 'good'
    },
    {
      name: 'Completion Rate',
      value: '91.3%',
      change: '+1.5%',
      trend: 'up',
      status: 'good'
    }
  ]

  const journeySteps = [
    {
      step: 'Landing Page',
      users: 10000,
      conversion: 100,
      dropoff: 0,
      avgTime: '0s',
      status: 'completed'
    },
    {
      step: 'Sign Up',
      users: 8500,
      conversion: 85,
      dropoff: 15,
      avgTime: '2m 30s',
      status: 'completed'
    },
    {
      step: 'Email Verification',
      users: 7200,
      conversion: 84.7,
      dropoff: 15.3,
      avgTime: '5m 15s',
      status: 'completed'
    },
    {
      step: 'Profile Setup',
      users: 5800,
      conversion: 80.6,
      dropoff: 19.4,
      avgTime: '8m 45s',
      status: 'completed'
    },
    {
      step: 'First Login',
      users: 4200,
      conversion: 72.4,
      dropoff: 27.6,
      avgTime: '1d 2h',
      status: 'completed'
    },
    {
      step: 'Dashboard Access',
      users: 3100,
      conversion: 73.8,
      dropoff: 26.2,
      avgTime: '2d 5h',
      status: 'completed'
    },
    {
      step: 'First Action',
      users: 2340,
      conversion: 75.5,
      dropoff: 24.5,
      avgTime: '3d 8h',
      status: 'completed'
    }
  ]

  const userPaths = [
    {
      path: 'Direct Signup → Dashboard',
      users: 2340,
      percentage: 23.4,
      avgTime: '12.3 days',
      conversion: 'high'
    },
    {
      path: 'Trial → Paid Subscription',
      users: 1890,
      percentage: 18.9,
      avgTime: '18.7 days',
      conversion: 'medium'
    },
    {
      path: 'Free → Premium Upgrade',
      users: 1560,
      percentage: 15.6,
      avgTime: '25.4 days',
      conversion: 'medium'
    },
    {
      path: 'Referral → Conversion',
      users: 980,
      percentage: 9.8,
      avgTime: '8.9 days',
      conversion: 'high'
    }
  ]

  const journeyInsights = [
    {
      insight: 'Profile Setup step has highest drop-off rate (19.4%)',
      impact: 'High',
      recommendation: 'Simplify profile setup process',
      confidence: 89
    },
    {
      insight: 'Email verification step takes too long (5m 15s)',
      impact: 'Medium',
      recommendation: 'Implement instant verification',
      confidence: 76
    },
    {
      insight: 'Referral path has fastest conversion (8.9 days)',
      impact: 'High',
      recommendation: 'Increase referral program investment',
      confidence: 92
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'critical': return 'text-red-600 bg-red-100'
      case 'completed': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? 
      <TrendingUp className="h-4 w-4 text-green-500" /> : 
      <TrendingDown className="h-4 w-4 text-red-500" />
  }

  const getConversionColor = (conversion: string) => {
    switch (conversion) {
      case 'high': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
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
          <h1 className="text-3xl font-bold tracking-tight">User Journey Analytics</h1>
          <p className="text-muted-foreground">
            Track user behavior and optimize conversion funnels
          </p>
        </div>
        <div className="flex space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
            <option value="90d">90 Days</option>
          </select>
          <Button variant="outline">
            <BarChart3 className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Map className="mr-2 h-4 w-4" />
            Create Journey
          </Button>
        </div>
      </div>

      {/* Journey Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        {journeyMetrics.map((metric) => (
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
                  {metric.change} from last period
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Journey Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>User Journey Funnel</CardTitle>
          <CardDescription>
            Step-by-step conversion funnel with drop-off analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {journeySteps.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium">{step.step}</h4>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{step.users.toLocaleString()} users</span>
                        <span>Avg time: {step.avgTime}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">{step.conversion}%</p>
                      <p className="text-xs text-muted-foreground">Conversion</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600">{step.dropoff}%</p>
                      <p className="text-xs text-muted-foreground">Drop-off</p>
                    </div>
                    <Badge className={getStatusColor(step.status)}>
                      {step.status}
                    </Badge>
                  </div>
                </div>
                {index < journeySteps.length - 1 && (
                  <div className="flex justify-center my-2">
                    <ArrowDown className="h-4 w-4 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Paths */}
        <Card>
          <CardHeader>
            <CardTitle>Top User Paths</CardTitle>
            <CardDescription>
              Most common user journey paths to conversion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userPaths.map((path, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{path.path}</h4>
                    <Badge className={getConversionColor(path.conversion)}>
                      {path.conversion}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{path.users.toLocaleString()} users ({path.percentage}%)</span>
                    <span>Avg time: {path.avgTime}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${path.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Journey Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Journey Insights</CardTitle>
            <CardDescription>
              AI-generated insights and optimization recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {journeyInsights.map((insight, index) => (
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
                      Optimize
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Journey Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Journey Performance Summary</CardTitle>
          <CardDescription>
            Overall user journey performance and key metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <Target className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold">Overall Conversion</h3>
              <p className="text-sm text-muted-foreground">End-to-end conversion</p>
              <p className="text-2xl font-bold text-blue-600">23.4%</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Clock className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-semibold">Time to Convert</h3>
              <p className="text-sm text-muted-foreground">Average conversion time</p>
              <p className="text-2xl font-bold text-green-600">12.3 days</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Users className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-semibold">Total Conversions</h3>
              <p className="text-sm text-muted-foreground">Last 30 days</p>
              <p className="text-2xl font-bold text-purple-600">2,340</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Journey Optimization Recommendations</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Simplify profile setup process to reduce 19.4% drop-off rate</li>
              <li>• Implement instant email verification to improve user experience</li>
              <li>• Increase investment in referral program (fastest conversion path)</li>
              <li>• Add progress indicators to improve completion rates</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
