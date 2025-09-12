'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  BarChart3,
  PieChart,
  Download,
  RefreshCw,
  Filter,
  Target,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'

export default function CohortAnalysisPage() {
  const [selectedCohort, setSelectedCohort] = useState('monthly')
  const [selectedMetric, setSelectedMetric] = useState('retention')

  const cohortMetrics = [
    {
      name: 'Average Retention',
      value: '78.9%',
      change: '+3.2%',
      trend: 'up',
      status: 'good'
    },
    {
      name: 'Cohort Size',
      value: '2.4K',
      change: '+12.5%',
      trend: 'up',
      status: 'good'
    },
    {
      name: 'Revenue per Cohort',
      value: '$45.2K',
      change: '+8.7%',
      trend: 'up',
      status: 'good'
    },
    {
      name: 'Churn Rate',
      value: '21.1%',
      change: '-2.1%',
      trend: 'down',
      status: 'good'
    }
  ]

  const cohortData = [
    {
      cohort: 'Jan 2024',
      users: 1200,
      month0: 100,
      month1: 95.2,
      month2: 92.1,
      month3: 89.4,
      month6: 84.7,
      month12: 78.9,
      revenue: 45200
    },
    {
      cohort: 'Feb 2024',
      users: 1350,
      month0: 100,
      month1: 96.1,
      month2: 93.2,
      month3: 90.1,
      month6: 85.3,
      month12: 79.8,
      revenue: 50800
    },
    {
      cohort: 'Mar 2024',
      users: 1180,
      month0: 100,
      month1: 94.8,
      month2: 91.7,
      month3: 88.9,
      month6: 83.2,
      month12: 77.1,
      revenue: 44300
    },
    {
      cohort: 'Apr 2024',
      users: 1420,
      month0: 100,
      month1: 97.2,
      month2: 94.1,
      month3: 91.3,
      month6: 86.7,
      month12: 81.2,
      revenue: 53400
    },
    {
      cohort: 'May 2024',
      users: 1280,
      month0: 100,
      month1: 95.8,
      month2: 92.6,
      month3: 89.8,
      month6: 85.1,
      month12: 79.5,
      revenue: 48100
    }
  ]

  const cohortInsights = [
    {
      insight: 'April 2024 cohort shows highest retention (81.2%)',
      impact: 'High',
      recommendation: 'Analyze April onboarding improvements',
      confidence: 89
    },
    {
      insight: 'Month 1 retention is consistently above 95%',
      impact: 'Medium',
      recommendation: 'Focus on Month 2-3 retention improvements',
      confidence: 92
    },
    {
      insight: 'Revenue per cohort is trending upward',
      impact: 'High',
      recommendation: 'Scale successful acquisition channels',
      confidence: 87
    }
  ]

  const retentionHeatmap = [
    { cohort: 'Jan 2024', month1: 95.2, month2: 92.1, month3: 89.4, month6: 84.7, month12: 78.9 },
    { cohort: 'Feb 2024', month1: 96.1, month2: 93.2, month3: 90.1, month6: 85.3, month12: 79.8 },
    { cohort: 'Mar 2024', month1: 94.8, month2: 91.7, month3: 88.9, month6: 83.2, month12: 77.1 },
    { cohort: 'Apr 2024', month1: 97.2, month2: 94.1, month3: 91.3, month6: 86.7, month12: 81.2 },
    { cohort: 'May 2024', month1: 95.8, month2: 92.6, month3: 89.8, month6: 85.1, month12: 79.5 }
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

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'text-red-600 bg-red-100'
      case 'Medium': return 'text-yellow-600 bg-yellow-100'
      case 'Low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getRetentionColor = (value: number) => {
    if (value >= 90) return 'bg-green-500'
    if (value >= 80) return 'bg-green-400'
    if (value >= 70) return 'bg-yellow-400'
    if (value >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cohort Analysis</h1>
          <p className="text-muted-foreground">
            Analyze user retention and behavior patterns over time
          </p>
        </div>
        <div className="flex space-x-2">
          <select
            value={selectedCohort}
            onChange={(e) => setSelectedCohort(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
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

      {/* Cohort Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        {cohortMetrics.map((metric) => (
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

      {/* Cohort Retention Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cohort Retention Analysis</CardTitle>
          <CardDescription>
            User retention rates by cohort and time period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Cohort</th>
                  <th className="text-right p-2">Users</th>
                  <th className="text-right p-2">Month 0</th>
                  <th className="text-right p-2">Month 1</th>
                  <th className="text-right p-2">Month 2</th>
                  <th className="text-right p-2">Month 3</th>
                  <th className="text-right p-2">Month 6</th>
                  <th className="text-right p-2">Month 12</th>
                  <th className="text-right p-2">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {cohortData.map((cohort, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 font-medium">{cohort.cohort}</td>
                    <td className="p-2 text-right">{cohort.users.toLocaleString()}</td>
                    <td className="p-2 text-right">{cohort.month0}%</td>
                    <td className="p-2 text-right">{cohort.month1}%</td>
                    <td className="p-2 text-right">{cohort.month2}%</td>
                    <td className="p-2 text-right">{cohort.month3}%</td>
                    <td className="p-2 text-right">{cohort.month6}%</td>
                    <td className="p-2 text-right">{cohort.month12}%</td>
                    <td className="p-2 text-right">${(cohort.revenue / 1000).toFixed(0)}K</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Retention Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Retention Heatmap</CardTitle>
          <CardDescription>
            Visual representation of retention rates across cohorts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Cohort</th>
                  <th className="text-center p-2">Month 1</th>
                  <th className="text-center p-2">Month 2</th>
                  <th className="text-center p-2">Month 3</th>
                  <th className="text-center p-2">Month 6</th>
                  <th className="text-center p-2">Month 12</th>
                </tr>
              </thead>
              <tbody>
                {retentionHeatmap.map((row, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 font-medium">{row.cohort}</td>
                    <td className="p-2 text-center">
                      <div className={`w-12 h-8 rounded flex items-center justify-center text-white text-sm font-medium ${getRetentionColor(row.month1)}`}>
                        {row.month1}%
                      </div>
                    </td>
                    <td className="p-2 text-center">
                      <div className={`w-12 h-8 rounded flex items-center justify-center text-white text-sm font-medium ${getRetentionColor(row.month2)}`}>
                        {row.month2}%
                      </div>
                    </td>
                    <td className="p-2 text-center">
                      <div className={`w-12 h-8 rounded flex items-center justify-center text-white text-sm font-medium ${getRetentionColor(row.month3)}`}>
                        {row.month3}%
                      </div>
                    </td>
                    <td className="p-2 text-center">
                      <div className={`w-12 h-8 rounded flex items-center justify-center text-white text-sm font-medium ${getRetentionColor(row.month6)}`}>
                        {row.month6}%
                      </div>
                    </td>
                    <td className="p-2 text-center">
                      <div className={`w-12 h-8 rounded flex items-center justify-center text-white text-sm font-medium ${getRetentionColor(row.month12)}`}>
                        {row.month12}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>90%+</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-400 rounded"></div>
              <span>80-89%</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-400 rounded"></div>
              <span>70-79%</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span>60-69%</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>&lt;60%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cohort Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Cohort Insights</CardTitle>
          <CardDescription>
            AI-generated insights and recommendations from cohort analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cohortInsights.map((insight, index) => (
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

      {/* Cohort Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Cohort Performance Summary</CardTitle>
          <CardDescription>
            Key performance indicators across all cohorts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold">Best Performing Cohort</h3>
              <p className="text-sm text-muted-foreground">April 2024</p>
              <p className="text-2xl font-bold text-blue-600">81.2%</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-semibold">Average Retention</h3>
              <p className="text-sm text-muted-foreground">12-month retention</p>
              <p className="text-2xl font-bold text-green-600">78.9%</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Target className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-semibold">Revenue Growth</h3>
              <p className="text-sm text-muted-foreground">Per cohort</p>
              <p className="text-2xl font-bold text-purple-600">+8.7%</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Cohort Optimization Recommendations</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Analyze April 2024 cohort improvements for replication</li>
              <li>• Focus on Month 2-3 retention improvements (current weakness)</li>
              <li>• Scale successful acquisition channels from high-performing cohorts</li>
              <li>• Implement cohort-specific retention campaigns</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
