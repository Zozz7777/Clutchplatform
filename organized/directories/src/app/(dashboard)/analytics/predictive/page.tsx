'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Brain,
  Lightbulb,
  AlertTriangle,
  Target,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Users,
  Building,
  Zap,
  Shield,
  BarChart3
} from 'lucide-react'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/store'
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils'

export default function PredictiveAnalyticsPage() {
  const {
    predictiveAnalytics,
    fetchPredictiveAnalytics,
    fetchBusinessForecasting,
    fetchPredictiveInsights,
    fetchAIRecommendations,
    fetchRiskAssessment,
    updateRecommendationStatus,
    isLoading
  } = useStore()

  const [selectedTab, setSelectedTab] = useState('forecasting')

  useEffect(() => {
    fetchPredictiveAnalytics()
    fetchBusinessForecasting()
    fetchPredictiveInsights()
    fetchAIRecommendations()
    fetchRiskAssessment()
  }, [])

  const mockPredictiveAnalytics = {
    forecasting: {
      revenueForecast: [
        { period: '2024-05', actual: null, forecast: 295000, confidence: 85, trend: 'up' },
        { period: '2024-06', actual: null, forecast: 310000, confidence: 82, trend: 'up' },
        { period: '2024-07', actual: null, forecast: 325000, confidence: 78, trend: 'up' },
        { period: '2024-08', actual: null, forecast: 340000, confidence: 75, trend: 'up' }
      ],
      customerForecast: [
        { period: '2024-05', actual: null, forecast: 1280, confidence: 88, trend: 'up' },
        { period: '2024-06', actual: null, forecast: 1315, confidence: 85, trend: 'up' },
        { period: '2024-07', actual: null, forecast: 1350, confidence: 82, trend: 'up' },
        { period: '2024-08', actual: null, forecast: 1385, confidence: 80, trend: 'up' }
      ]
    },
    insights: [
      {
        id: '1',
        type: 'trend',
        title: 'Revenue Growth Acceleration',
        description: 'Revenue growth rate is accelerating by 15% month-over-month, indicating strong market demand.',
        confidence: 92,
        impact: 'high',
        category: 'financial',
        timestamp: new Date('2024-04-15T10:30:00'),
        recommendations: [
          'Increase marketing spend to capitalize on growth momentum',
          'Consider expanding sales team to handle increased demand',
          'Optimize pricing strategy for maximum revenue impact'
        ]
      },
      {
        id: '2',
        type: 'anomaly',
        title: 'Customer Churn Spike Detected',
        description: 'Customer churn rate increased by 25% this month, significantly above historical average.',
        confidence: 87,
        impact: 'high',
        category: 'customer',
        timestamp: new Date('2024-04-14T16:45:00'),
        recommendations: [
          'Implement customer retention campaigns immediately',
          'Analyze customer feedback for root cause identification',
          'Review customer service quality and response times'
        ]
      },
      {
        id: '3',
        type: 'pattern',
        title: 'Seasonal Demand Pattern Identified',
        description: 'Clear seasonal pattern detected in customer acquisition, peaking in Q3 and Q4.',
        confidence: 94,
        impact: 'medium',
        category: 'marketing',
        timestamp: new Date('2024-04-13T09:15:00'),
        recommendations: [
          'Plan marketing campaigns around seasonal peaks',
          'Adjust resource allocation for seasonal demand',
          'Prepare inventory and capacity for peak periods'
        ]
      }
    ],
    recommendations: [
      {
        id: '1',
        type: 'optimization',
        title: 'Optimize Customer Acquisition Cost',
        description: 'Reduce CAC by 20% through improved targeting and conversion optimization.',
        priority: 'high',
        category: 'marketing',
        expectedImpact: 15.5,
        implementationEffort: 'medium',
        timestamp: new Date('2024-04-15T10:30:00'),
        status: 'pending'
      },
      {
        id: '2',
        type: 'opportunity',
        title: 'Expand to New Market Segment',
        description: 'Enter the enterprise segment with projected $2M additional revenue potential.',
        priority: 'high',
        category: 'sales',
        expectedImpact: 25.0,
        implementationEffort: 'high',
        timestamp: new Date('2024-04-14T16:45:00'),
        status: 'pending'
      },
      {
        id: '3',
        type: 'risk',
        title: 'Mitigate Resource Bottleneck',
        description: 'Address potential resource constraints that could limit growth in Q3.',
        priority: 'medium',
        category: 'operations',
        expectedImpact: 8.5,
        implementationEffort: 'low',
        timestamp: new Date('2024-04-13T09:15:00'),
        status: 'pending'
      }
    ],
    riskAssessment: {
      overallRisk: 'medium',
      riskFactors: [
        {
          id: '1',
          name: 'Market Competition',
          probability: 75,
          impact: 60,
          riskScore: 45,
          category: 'external',
          description: 'Increased competition from new market entrants'
        },
        {
          id: '2',
          name: 'Resource Constraints',
          probability: 45,
          impact: 80,
          riskScore: 36,
          category: 'operational',
          description: 'Limited resources to meet growing demand'
        },
        {
          id: '3',
          name: 'Economic Downturn',
          probability: 25,
          impact: 90,
          riskScore: 22.5,
          category: 'external',
          description: 'Potential economic recession affecting customer spending'
        }
      ]
    }
  }

  const analytics = predictiveAnalytics || mockPredictiveAnalytics

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend':
        return <TrendingUp className="h-4 w-4 text-blue-500" />
      case 'anomaly':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'pattern':
        return <BarChart3 className="h-4 w-4 text-green-500" />
      default:
        return <Brain className="h-4 w-4 text-purple-500" />
    }
  }

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'optimization':
        return <Target className="h-4 w-4 text-blue-500" />
      case 'opportunity':
        return <Lightbulb className="h-4 w-4 text-green-500" />
      case 'risk':
        return <Shield className="h-4 w-4 text-red-500" />
      default:
        return <Zap className="h-4 w-4 text-yellow-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default:
        return 'text-green-600 bg-green-50 border-green-200'
    }
  }

  const handleRecommendationAction = async (id: string, status: 'implemented' | 'rejected') => {
    await updateRecommendationStatus(id, status)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Predictive Analytics</h1>
          <p className="text-muted-foreground">
            AI-powered insights, forecasting, and recommendations for strategic decision making
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b">
        {[
          { id: 'forecasting', name: 'Forecasting', icon: TrendingUp },
          { id: 'insights', name: 'AI Insights', icon: Brain },
          { id: 'recommendations', name: 'Recommendations', icon: Lightbulb },
          { id: 'risks', name: 'Risk Assessment', icon: Shield }
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <SnowButton
              key={tab.id}
              variant={selectedTab === tab.id ? "default" : "ghost"}
              onClick={() => setSelectedTab(tab.id)}
              className="flex items-center space-x-2"
            >
              <Icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </SnowButton>
          )
        })}
      </div>

      {/* Content */}
      <motion.div
        key={selectedTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {selectedTab === 'forecasting' && (
          <div className="space-y-6">
            {/* Revenue Forecast */}
            <SnowCard>
              <SnowCardHeader>
                <SnowCardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Revenue Forecast
                </SnowCardTitle>
                <SnowCardDescription>
                  AI-powered revenue predictions with confidence intervals
                </SnowCardDescription>
              </SnowCardHeader>
              <SnowCardContent>
                <div className="space-y-4">
                  {analytics.forecasting.revenueForecast.map((forecast, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <div className="font-medium">{forecast.period}</div>
                          <div className="text-sm text-muted-foreground">Revenue Forecast</div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {forecast.confidence}% confidence
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{formatCurrency(forecast.forecast)}</div>
                        <div className={`text-sm flex items-center ${
                          forecast.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {forecast.trend === 'up' ? (
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 mr-1" />
                          )}
                          {forecast.trend === 'up' ? 'Growing' : 'Declining'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SnowCardContent>
            </SnowCard>

            {/* Customer Forecast */}
            <SnowCard>
              <SnowCardHeader>
                <SnowCardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Customer Growth Forecast
                </SnowCardTitle>
                <SnowCardDescription>
                  Predicted customer acquisition and growth trends
                </SnowCardDescription>
              </SnowCardHeader>
              <SnowCardContent>
                <div className="space-y-4">
                  {analytics.forecasting.customerForecast.map((forecast, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <div className="font-medium">{forecast.period}</div>
                          <div className="text-sm text-muted-foreground">Customer Forecast</div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {forecast.confidence}% confidence
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{formatNumber(forecast.forecast)}</div>
                        <div className={`text-sm flex items-center ${
                          forecast.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {forecast.trend === 'up' ? (
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 mr-1" />
                          )}
                          {forecast.trend === 'up' ? 'Growing' : 'Declining'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SnowCardContent>
            </SnowCard>
          </div>
        )}

        {selectedTab === 'insights' && (
          <div className="space-y-6">
            {analytics.insights.map((insight) => (
              <SnowCard key={insight.id}>
                <SnowCardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getInsightIcon(insight.type)}
                      <div>
                        <SnowCardTitle className="flex items-center space-x-2">
                          <span>{insight.title}</span>
                          <Badge variant={insight.impact === 'high' ? 'destructive' : 'secondary'}>
                            {insight.impact} impact
                          </Badge>
                        </SnowCardTitle>
                        <SnowCardDescription className="mt-2">
                          {insight.description}
                        </SnowCardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {insight.confidence}% confidence
                    </Badge>
                  </div>
                </SnowCardHeader>
                <SnowCardContent>
                  <div className="space-y-4">
                    <div className="text-sm font-medium">Recommendations:</div>
                    <ul className="space-y-2">
                      {insight.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start space-x-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="text-xs text-muted-foreground mt-4">
                      Generated on {insight.timestamp.toLocaleDateString()} at {insight.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </SnowCardContent>
              </SnowCard>
            ))}
          </div>
        )}

        {selectedTab === 'recommendations' && (
          <div className="space-y-6">
            {analytics.recommendations.map((rec) => (
              <SnowCard key={rec.id}>
                <SnowCardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getRecommendationIcon(rec.type)}
                      <div>
                        <SnowCardTitle className="flex items-center space-x-2">
                          <span>{rec.title}</span>
                          <Badge className={getPriorityColor(rec.priority)}>
                            {rec.priority} priority
                          </Badge>
                        </SnowCardTitle>
                        <SnowCardDescription className="mt-2">
                          {rec.description}
                        </SnowCardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatPercent(rec.expectedImpact)} impact</div>
                      <div className="text-xs text-muted-foreground">{rec.implementationEffort} effort</div>
                    </div>
                  </div>
                </SnowCardHeader>
                <SnowCardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      Generated on {rec.timestamp.toLocaleDateString()}
                    </div>
                    <div className="flex space-x-2">
                      {rec.status === 'pending' && (
                        <>
                          <SnowButton
                            size="sm"
                            onClick={() => handleRecommendationAction(rec.id, 'implemented')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Implement
                          </SnowButton>
                          <SnowButton
                            size="sm"
                            variant="outline"
                            onClick={() => handleRecommendationAction(rec.id, 'rejected')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </SnowButton>
                        </>
                      )}
                      {rec.status === 'implemented' && (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Implemented
                        </Badge>
                      )}
                      {rec.status === 'rejected' && (
                        <Badge className="bg-red-100 text-red-800 border-red-200">
                          <XCircle className="h-3 w-3 mr-1" />
                          Rejected
                        </Badge>
                      )}
                    </div>
                  </div>
                </SnowCardContent>
              </SnowCard>
            ))}
          </div>
        )}

        {selectedTab === 'risks' && (
          <div className="space-y-6">
            {/* Overall Risk Assessment */}
            <SnowCard>
              <SnowCardHeader>
                <SnowCardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Overall Risk Assessment
                </SnowCardTitle>
                <SnowCardDescription>
                  Current risk profile and mitigation strategies
                </SnowCardDescription>
              </SnowCardHeader>
              <SnowCardContent>
                <div className="flex items-center space-x-4">
                  <div className="text-4xl font-bold">
                    {analytics.riskAssessment.overallRisk.toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium">Risk Level</div>
                    <div className="text-xs text-muted-foreground">
                      Based on {analytics.riskAssessment.riskFactors.length} identified factors
                    </div>
                  </div>
                </div>
              </SnowCardContent>
            </SnowCard>

            {/* Risk Factors */}
            <SnowCard>
              <SnowCardHeader>
                <SnowCardTitle>Risk Factors</SnowCardTitle>
                <SnowCardDescription>
                  Detailed analysis of identified risks and their impact
                </SnowCardDescription>
              </SnowCardHeader>
              <SnowCardContent>
                <div className="space-y-4">
                  {analytics.riskAssessment.riskFactors.map((risk) => (
                    <div key={risk.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium">{risk.name}</div>
                          <div className="text-sm text-muted-foreground mt-1">{risk.description}</div>
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="text-xs">
                              <span className="font-medium">Probability:</span> {risk.probability}%
                            </div>
                            <div className="text-xs">
                              <span className="font-medium">Impact:</span> {risk.impact}%
                            </div>
                            <div className="text-xs">
                              <span className="font-medium">Risk Score:</span> {risk.riskScore}
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {risk.category}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </SnowCardContent>
            </SnowCard>
          </div>
        )}
      </motion.div>
    </div>
  )
}

