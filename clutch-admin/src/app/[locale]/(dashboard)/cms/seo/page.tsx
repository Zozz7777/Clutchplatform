'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Search, 
  TrendingUp, 
  Eye, 
  Link, 
  FileText,
  Globe,
  Target,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react'

export default function SEOPage() {
  const [selectedTab, setSelectedTab] = useState('overview')

  const seoMetrics = [
    {
      name: 'Organic Traffic',
      value: '45.2K',
      change: '+12.5%',
      trend: 'up',
      status: 'good'
    },
    {
      name: 'Search Rankings',
      value: '23',
      change: '+5',
      trend: 'up',
      status: 'good'
    },
    {
      name: 'Click-Through Rate',
      value: '3.2%',
      change: '+0.3%',
      trend: 'up',
      status: 'good'
    },
    {
      name: 'Page Load Speed',
      value: '2.3s',
      change: '-0.2s',
      trend: 'down',
      status: 'warning'
    }
  ]

  const topKeywords = [
    {
      keyword: 'clutch platform',
      position: 3,
      traffic: 1247,
      difficulty: 'medium',
      trend: 'up'
    },
    {
      keyword: 'fleet management software',
      position: 8,
      traffic: 892,
      difficulty: 'high',
      trend: 'up'
    },
    {
      keyword: 'mobile app development',
      position: 12,
      traffic: 654,
      difficulty: 'high',
      trend: 'down'
    },
    {
      keyword: 'business analytics',
      position: 15,
      traffic: 432,
      difficulty: 'medium',
      trend: 'up'
    }
  ]

  const pageOptimization = [
    {
      page: '/dashboard',
      title: 'Dashboard - Clutch Platform',
      metaDescription: 'Manage your business with our comprehensive dashboard',
      status: 'optimized',
      score: 95,
      issues: 0
    },
    {
      page: '/mobile/dashboard',
      title: 'Mobile Dashboard - Clutch Platform',
      metaDescription: 'Access your business data on the go with our mobile dashboard',
      status: 'needs_work',
      score: 78,
      issues: 3
    },
    {
      page: '/analytics/overview',
      title: 'Analytics Overview - Clutch Platform',
      metaDescription: 'Comprehensive analytics and insights for your business',
      status: 'optimized',
      score: 92,
      issues: 1
    },
    {
      page: '/support/knowledge-base',
      title: 'Knowledge Base - Clutch Platform',
      metaDescription: 'Find answers to common questions and get help',
      status: 'critical',
      score: 65,
      issues: 8
    }
  ]

  const technicalIssues = [
    {
      issue: 'Missing meta descriptions',
      pages: 12,
      severity: 'high',
      impact: 'High'
    },
    {
      issue: 'Slow page load times',
      pages: 8,
      severity: 'medium',
      impact: 'Medium'
    },
    {
      issue: 'Broken internal links',
      pages: 5,
      severity: 'high',
      impact: 'High'
    },
    {
      issue: 'Missing alt text on images',
      pages: 23,
      severity: 'medium',
      impact: 'Medium'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimized': return 'text-green-600 bg-green-100'
      case 'needs_work': return 'text-yellow-600 bg-yellow-100'
      case 'critical': return 'text-red-600 bg-red-100'
      case 'good': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SEO Management</h1>
          <p className="text-muted-foreground">
            Monitor and optimize search engine performance
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <BarChart3 className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
          <Button>
            <Target className="mr-2 h-4 w-4" />
            Run SEO Audit
          </Button>
        </div>
      </div>

      {/* SEO Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        {seoMetrics.map((metric) => (
          <Card key={metric.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.name}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
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
          { id: 'keywords', label: 'Keywords' },
          { id: 'pages', label: 'Page Optimization' },
          { id: 'technical', label: 'Technical Issues' }
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
              <CardTitle>SEO Health Score</CardTitle>
              <CardDescription>
                Overall SEO performance across all pages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">87</div>
                <p className="text-muted-foreground mb-4">Good</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '87%' }}></div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  +5 points from last month
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Performing Pages</CardTitle>
              <CardDescription>
                Pages with the best SEO performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pageOptimization.slice(0, 3).map((page, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{page.page}</p>
                      <p className="text-xs text-muted-foreground">Score: {page.score}</p>
                    </div>
                    <Badge className={getStatusColor(page.status)}>
                      {page.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Keywords Tab */}
      {selectedTab === 'keywords' && (
        <Card>
          <CardHeader>
            <CardTitle>Top Keywords</CardTitle>
            <CardDescription>
              Keywords ranking in search results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topKeywords.map((keyword, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{keyword.keyword}</h4>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                      <span>Position: {keyword.position}</span>
                      <span>{keyword.traffic} monthly traffic</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getDifficultyColor(keyword.difficulty)}>
                      {keyword.difficulty}
                    </Badge>
                    <Badge variant="outline">
                      {keyword.trend}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Page Optimization Tab */}
      {selectedTab === 'pages' && (
        <Card>
          <CardHeader>
            <CardTitle>Page Optimization</CardTitle>
            <CardDescription>
              SEO optimization status for all pages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pageOptimization.map((page, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium">{page.page}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{page.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{page.metaDescription}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(page.status)}>
                        {page.status.replace('_', ' ')}
                      </Badge>
                      <span className="text-sm font-medium">{page.score}/100</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-muted-foreground">
                        {page.issues} issues found
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Target className="h-4 w-4 mr-1" />
                        Optimize
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Technical Issues Tab */}
      {selectedTab === 'technical' && (
        <Card>
          <CardHeader>
            <CardTitle>Technical SEO Issues</CardTitle>
            <CardDescription>
              Technical issues affecting SEO performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {technicalIssues.map((issue, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{issue.issue}</h4>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                      <span>{issue.pages} pages affected</span>
                      <span>Impact: {issue.impact}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getSeverityColor(issue.severity)}>
                      {issue.severity}
                    </Badge>
                    <Button variant="outline" size="sm">
                      Fix
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* SEO Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>SEO Recommendations</CardTitle>
          <CardDescription>
            Actionable recommendations to improve SEO performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">High Priority</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Fix missing meta descriptions on 12 pages to improve click-through rates
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">Medium Priority</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Optimize page load speeds for better user experience and rankings
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800">Low Priority</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Add alt text to images for better accessibility and SEO
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
