'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Target,
  BarChart3,
  PieChart,
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
  UserCheck,
  UserX
} from 'lucide-react'

export default function UserSegmentsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSegment, setSelectedSegment] = useState(null)

  const userSegments = [
    {
      id: 1,
      name: 'High-Value Customers',
      description: 'Customers with LTV > $5,000 and active subscriptions',
      criteria: 'LTV > $5,000, Active = true, Subscription = Premium',
      userCount: 1247,
      percentage: 12.4,
      avgLTV: 8472,
      avgRevenue: 234,
      growth: 15.2,
      status: 'active'
    },
    {
      id: 2,
      name: 'At-Risk Users',
      description: 'Users showing signs of potential churn',
      criteria: 'Last Login < 30 days, Support Tickets > 2, Engagement < 20%',
      userCount: 892,
      percentage: 8.9,
      avgLTV: 1234,
      avgRevenue: 89,
      growth: -5.3,
      status: 'warning'
    },
    {
      id: 3,
      name: 'New Users',
      description: 'Users who joined in the last 30 days',
      criteria: 'Created Date > 30 days ago, First Login = true',
      userCount: 2156,
      percentage: 21.6,
      avgLTV: 456,
      avgRevenue: 29,
      growth: 28.7,
      status: 'active'
    },
    {
      id: 4,
      name: 'Enterprise Customers',
      description: 'Large enterprise accounts with multiple users',
      criteria: 'Account Type = Enterprise, Users > 50, ARR > $100K',
      userCount: 156,
      percentage: 1.6,
      avgLTV: 15678,
      avgRevenue: 199,
      growth: 22.1,
      status: 'active'
    },
    {
      id: 5,
      name: 'Inactive Users',
      description: 'Users who haven\'t logged in for 90+ days',
      criteria: 'Last Login > 90 days, Status = Inactive',
      userCount: 3456,
      percentage: 34.6,
      avgLTV: 234,
      avgRevenue: 0,
      growth: -12.4,
      status: 'critical'
    }
  ]

  const segmentMetrics = [
    {
      name: 'Total Segments',
      value: '12',
      change: '+2',
      trend: 'up'
    },
    {
      name: 'Active Segments',
      value: '8',
      change: '+1',
      trend: 'up'
    },
    {
      name: 'Total Users',
      value: '45.2K',
      change: '+8.5%',
      trend: 'up'
    },
    {
      name: 'Segmented Users',
      value: '89.2%',
      change: '+3.2%',
      trend: 'up'
    }
  ]

  const segmentInsights = [
    {
      insight: 'High-Value Customers segment shows 15.2% growth',
      impact: 'High',
      recommendation: 'Focus retention efforts on this segment',
      confidence: 92
    },
    {
      insight: 'At-Risk Users segment needs immediate attention',
      impact: 'Critical',
      recommendation: 'Implement re-engagement campaigns',
      confidence: 87
    },
    {
      insight: 'New Users segment has high growth potential',
      impact: 'Medium',
      recommendation: 'Optimize onboarding experience',
      confidence: 78
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
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

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'text-green-600 bg-green-100'
      case 'Medium': return 'text-yellow-600 bg-yellow-100'
      case 'Critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const filteredSegments = userSegments.filter(segment =>
    segment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    segment.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Segments</h1>
          <p className="text-muted-foreground">
            Create and manage user segments for targeted campaigns
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Segment
          </Button>
        </div>
      </div>

      {/* Segment Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        {segmentMetrics.map((metric) => (
          <Card key={metric.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.name}
              </CardTitle>
              {getTrendIcon(metric.trend)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                {metric.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Segments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search segments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <select className="w-full p-2 border border-gray-300 rounded-md">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Segments List */}
      <div className="space-y-4">
        {filteredSegments.map((segment) => (
          <Card key={segment.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold">{segment.name}</h3>
                    <Badge className={getStatusColor(segment.status)}>
                      {segment.status}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-3">{segment.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>Criteria: {segment.criteria}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{segment.userCount.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Users ({segment.percentage}%)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">${segment.avgLTV.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Avg LTV</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">${segment.avgRevenue}</p>
                  <p className="text-sm text-muted-foreground">Avg Revenue</p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${segment.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {segment.growth > 0 ? '+' : ''}{segment.growth}%
                  </p>
                  <p className="text-sm text-muted-foreground">Growth</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Segment Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Segment Insights</CardTitle>
          <CardDescription>
            AI-generated insights and recommendations for user segments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {segmentInsights.map((insight, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{insight.insight}</h4>
                  <Badge className={getImpactColor(insight.impact)}>
                    {insight.impact}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
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

      {/* Segment Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Segment Performance Overview</CardTitle>
          <CardDescription>
            Key performance indicators across all user segments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold">Total Segmented Users</h3>
              <p className="text-sm text-muted-foreground">89.2% of all users</p>
              <p className="text-2xl font-bold text-blue-600">40.3K</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Target className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-semibold">High-Value Segment</h3>
              <p className="text-sm text-muted-foreground">12.4% of users</p>
              <p className="text-2xl font-bold text-green-600">1,247 users</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-semibold">Segment Growth</h3>
              <p className="text-sm text-muted-foreground">Average growth rate</p>
              <p className="text-2xl font-bold text-purple-600">+9.7%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Segment Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Segment Actions</CardTitle>
          <CardDescription>
            Quick actions for managing user segments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-20 flex-col">
              <UserCheck className="h-6 w-6 mb-2" />
              <span>Create Campaign</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <BarChart3 className="h-6 w-6 mb-2" />
              <span>Analyze Segment</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Filter className="h-6 w-6 mb-2" />
              <span>Export Data</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Target className="h-6 w-6 mb-2" />
              <span>Set Alerts</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
