'use client';

/**
 * Feedback Analytics Dashboard
 * Comprehensive analytics and insights for user feedback
 */

import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  MessageSquare, 
  BarChart3,
  Target,
  Lightbulb,
  Activity,
  Zap
} from 'lucide-react'
import { FeedbackAnalyzer, FeedbackAnalysis, FeedbackIteration } from '@/lib/feedback-analysis'

interface FeedbackAnalyticsDashboardProps {
  className?: string
}

export const FeedbackAnalyticsDashboard: React.FC<FeedbackAnalyticsDashboardProps> = ({ 
  className = '' 
}) => {
  const [analyzer] = useState(() => FeedbackAnalyzer.getInstance())
  const [analysis, setAnalysis] = useState<FeedbackAnalysis | null>(null)
  const [iterations, setIterations] = useState<FeedbackIteration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    loadAnalytics()
  }, [selectedPeriod])

  const loadAnalytics = async () => {
    setIsLoading(true)
    try {
      const endDate = new Date()
      const startDate = new Date()
      
      switch (selectedPeriod) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7)
          break
        case '30d':
          startDate.setDate(endDate.getDate() - 30)
          break
        case '90d':
          startDate.setDate(endDate.getDate() - 90)
          break
      }

      const newAnalysis = analyzer.analyzeFeedback({ start: startDate, end: endDate })
      const allIterations = analyzer.getIterations()
      
      setAnalysis(newAnalysis)
      setIterations(allIterations)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTrendIcon = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-emerald-600" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getTrendColor = (direction: 'up' | 'down' | 'stable', isPositive: boolean = true) => {
    if (direction === 'stable') return 'text-gray-600'
    
    const isGoodTrend = isPositive ? direction === 'up' : direction === 'down'
    return isGoodTrend ? 'text-emerald-600' : 'text-red-600'
  }

  const getImpactColor = (impact: 'low' | 'medium' | 'high' | 'critical') => {
    switch (impact) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: number) => {
    if (priority <= 2) return 'bg-red-100 text-red-800'
    if (priority <= 4) return 'bg-orange-100 text-orange-800'
    return 'bg-blue-100 text-blue-800'
  }

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardContent className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Analytics Data</h3>
            <p className="text-muted-foreground mb-4">
              Start collecting feedback to see analytics and insights.
            </p>
            <Button onClick={loadAnalytics}>
              Refresh Analytics
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Feedback Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive insights and recommendations for user feedback
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={selectedPeriod === '7d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('7d')}
          >
            7 Days
          </Button>
          <Button
            variant={selectedPeriod === '30d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('30d')}
          >
            30 Days
          </Button>
          <Button
            variant={selectedPeriod === '90d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('90d')}
          >
            90 Days
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysis.summary.totalFeedback}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {getTrendIcon(analysis.trends.feedbackVolume.direction)}
              <span className={getTrendColor(analysis.trends.feedbackVolume.direction)}>
                {Math.abs(analysis.trends.feedbackVolume.changePercentage).toFixed(1)}%
              </span>
              <span>from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analysis.summary.totalFeedback > 0 
                ? ((analysis.summary.resolvedFeedback / analysis.summary.totalFeedback) * 100).toFixed(1)
                : 0}%
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                Avg: {Math.round(analysis.summary.averageResolutionTime / (1000 * 60 * 60))}h
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Satisfaction</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysis.summary.userSatisfaction.toFixed(1)}/5</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {getTrendIcon(analysis.trends.userSatisfaction.direction)}
              <span className={getTrendColor(analysis.trends.userSatisfaction.direction, true)}>
                {Math.abs(analysis.trends.userSatisfaction.changePercentage).toFixed(1)}%
              </span>
              <span>from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysis.summary.newFeedback}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <span>Requiring attention</span>
            </div>
          </CardContent>
        </Card>
      </div>
      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="issues">Top Issues</TabsTrigger>
          <TabsTrigger value="segments">User Segments</TabsTrigger>
          <TabsTrigger value="iterations">Iterations</TabsTrigger>
        </TabsList>
        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {analysis.insights.map((insight) => (
              <Card key={insight.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{insight.title}</CardTitle>
                    <Badge className={getImpactColor(insight.impact)}>
                      {insight.impact}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{insight.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Confidence: {(insight.confidence * 100).toFixed(0)}%
                    </span>
                    <Badge variant="outline" className={getPriorityColor(insight.priority)}>
                      Priority {insight.priority}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="recommendations" className="space-y-4">
          <div className="space-y-4">
            {analysis.recommendations.map((recommendation) => (
              <Card key={recommendation.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {recommendation.expectedImpact} impact
                      </Badge>
                      <Badge variant="outline">
                        {recommendation.effort} effort
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{recommendation.description}</p>
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Rationale:</h4>
                    <p className="text-sm text-muted-foreground">{recommendation.rationale}</p>
                  </div>
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Implementation Plan:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {recommendation.implementationPlan.map((step, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Related feedback: {recommendation.relatedFeedback.length} items
                    </span>
                    <span className="text-sm font-semibold">
                      Est. value: ${recommendation.estimatedValue}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="issues" className="space-y-4">
          <div className="space-y-4">
            {analysis.topIssues.map((issue) => (
              <Card key={issue.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{issue.title}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge className={getImpactColor(issue.severity)}>
                        {issue.severity}
                      </Badge>
                      <Badge variant="outline">
                        {issue.frequency} reports
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{issue.description}</p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-semibold mb-2">Impact Analysis:</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Affected Users:</span>
                          <span className="font-semibold">{issue.affectedUsers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Business Impact:</span>
                          <Badge variant="outline" className={getImpactColor(issue.businessImpact)}>
                            {issue.businessImpact}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Trend:</span>
                          <span className="capitalize">{issue.trend}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Suggested Actions:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {issue.suggestedActions.map((action, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <Zap className="h-3 w-3 text-primary" />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="segments" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {analysis.userSegments.map((segment) => (
              <Card key={segment.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{segment.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-muted-foreground mb-2">{segment.description}</p>
                      <div className="flex items-center space-x-4 text-sm">
                        <span>Size: <strong>{segment.size}</strong> users</span>
                        <span>Satisfaction: <strong>{segment.feedbackPatterns.satisfactionScore.toFixed(1)}/5</strong></span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Most Common Issues:</h4>
                      <div className="flex flex-wrap gap-1">
                        {segment.feedbackPatterns.mostCommonIssues.map((issue, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {issue}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Recommendations:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {segment.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <Lightbulb className="h-3 w-3 text-yellow-500" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="iterations" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Feedback Iterations</h3>
            <Button>
              <Target className="h-4 w-4 mr-2" />
              Create New Iteration
            </Button>
          </div>
          
          <div className="space-y-4">
            {iterations.map((iteration) => (
              <Card key={iteration.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{iteration.name}</CardTitle>
                    <Badge variant="outline">
                      {iteration.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{iteration.description}</p>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-semibold mb-2">Goals:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {iteration.goals.map((goal, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <CheckCircle className="h-3 w-3 text-emerald-500" />
                            <span>{goal}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Progress:</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Actions Completed:</span>
                          <span>
                            {iteration.actions.filter(a => a.status === 'completed').length} / {iteration.actions.length}
                          </span>
                        </div>
                        <Progress 
                          value={(iteration.actions.filter(a => a.status === 'completed').length / iteration.actions.length) * 100} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
