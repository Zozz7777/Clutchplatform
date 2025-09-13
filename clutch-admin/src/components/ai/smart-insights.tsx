'use client'

import React, { useState, useEffect } from 'react'
import { LuxuryCard } from '@/components/ui/luxury-card'
import { LuxuryButton } from '@/components/ui/luxury-button'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Brain,
  Zap,
  Crown,
  Gem,
  Sparkles,
  BarChart3,
  PieChart,
  LineChart,
  Target
} from 'lucide-react'

interface SmartInsight {
  id: string
  type: 'positive' | 'negative' | 'neutral' | 'warning'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  category: string
  confidence: number
  action?: string
  value?: string
  trend?: 'up' | 'down' | 'stable'
}

export function SmartInsights() {
  const [insights, setInsights] = useState<SmartInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    // Simulate AI-generated insights
    const mockInsights: SmartInsight[] = [
      {
        id: '1',
        type: 'positive',
        title: 'Revenue Growth Acceleration',
        description: 'Your revenue has grown 23% this month, exceeding the 15% target. This is driven by increased user engagement and premium subscriptions.',
        impact: 'high',
        category: 'revenue',
        confidence: 94,
        action: 'Consider scaling marketing efforts',
        value: '+23%',
        trend: 'up'
      },
      {
        id: '2',
        type: 'warning',
        title: 'User Churn Risk Detected',
        description: '15% of your premium users show signs of potential churn based on engagement patterns. Early intervention recommended.',
        impact: 'high',
        category: 'users',
        confidence: 87,
        action: 'Launch retention campaign',
        value: '15%',
        trend: 'down'
      },
      {
        id: '3',
        type: 'positive',
        title: 'Performance Optimization Success',
        description: 'Page load times improved by 40% after implementing the new caching strategy. User satisfaction scores increased.',
        impact: 'medium',
        category: 'performance',
        confidence: 92,
        action: 'Monitor for 48 hours',
        value: '-40%',
        trend: 'up'
      },
      {
        id: '4',
        type: 'neutral',
        title: 'Market Trend Analysis',
        description: 'Industry data shows a 12% increase in demand for AI-powered features. Consider prioritizing AI development.',
        impact: 'medium',
        category: 'market',
        confidence: 78,
        action: 'Research AI integration',
        value: '+12%',
        trend: 'up'
      },
      {
        id: '5',
        type: 'negative',
        title: 'Security Alert Pattern',
        description: 'Unusual login patterns detected from 3 IP addresses. No breaches confirmed, but monitoring recommended.',
        impact: 'high',
        category: 'security',
        confidence: 85,
        action: 'Review security logs',
        value: '3 IPs',
        trend: 'down'
      },
      {
        id: '6',
        type: 'positive',
        title: 'Customer Satisfaction Peak',
        description: 'Customer satisfaction reached 4.8/5 this week, the highest in 6 months. Support response times improved significantly.',
        impact: 'medium',
        category: 'satisfaction',
        confidence: 96,
        action: 'Share success metrics',
        value: '4.8/5',
        trend: 'up'
      }
    ]

    setTimeout(() => {
      setInsights(mockInsights)
      setLoading(false)
    }, 2000)
  }, [])

  const categories = [
    { id: 'all', label: 'All Insights', icon: Brain },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'performance', label: 'Performance', icon: Activity },
    { id: 'security', label: 'Security', icon: AlertTriangle },
    { id: 'market', label: 'Market', icon: TrendingUp }
  ]

  const filteredInsights = selectedCategory === 'all' 
    ? insights 
    : insights.filter(insight => insight.category === selectedCategory)

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive': return CheckCircle
      case 'negative': return AlertTriangle
      case 'warning': return AlertTriangle
      default: return Info
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive': return 'luxury-emerald'
      case 'negative': return 'luxury-ruby'
      case 'warning': return 'luxury-gold'
      default: return 'luxury-diamond'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'luxury-ruby'
      case 'medium': return 'luxury-gold'
      default: return 'luxury-emerald'
    }
  }

  if (loading) {
    return (
      <LuxuryCard variant="glass" className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-luxury-gold-200 border-t-luxury-gold-500"></div>
        </div>
        <p className="text-center text-slate-600 mt-4 font-medium">AI is analyzing your data...</p>
      </LuxuryCard>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-luxury-gold-500 to-luxury-diamond-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              Smart Insights
              <Crown className="h-5 w-5 text-luxury-gold-500" />
            </h2>
            <p className="text-slate-600 font-medium">AI-powered analytics and recommendations</p>
          </div>
        </div>
        <LuxuryButton variant="luxury" className="hover:scale-105 transition-transform duration-300">
          <Sparkles className="h-4 w-4 mr-2" />
          Generate New Insights
        </LuxuryButton>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <LuxuryButton
            key={category.id}
            variant={selectedCategory === category.id ? 'luxury' : 'glass'}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className="hover:scale-105 transition-transform duration-300"
          >
            <category.icon className="h-4 w-4 mr-2" />
            {category.label}
          </LuxuryButton>
        ))}
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInsights.map((insight) => {
          const Icon = getInsightIcon(insight.type)
          const color = getInsightColor(insight.type)
          const impactColor = getImpactColor(insight.impact)
          
          return (
            <LuxuryCard
              key={insight.id}
              variant="glass"
              className="hover:scale-105 transition-all duration-300 cursor-pointer"
              effect="glow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  color === 'luxury-emerald' ? 'bg-luxury-emerald-500' :
                  color === 'luxury-ruby' ? 'bg-luxury-ruby-500' :
                  color === 'luxury-gold' ? 'bg-luxury-gold-500' :
                  'bg-luxury-diamond-500'
                } shadow-lg`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    color === 'luxury-emerald' ? 'text-luxury-emerald-600' :
                    color === 'luxury-ruby' ? 'text-luxury-ruby-600' :
                    color === 'luxury-gold' ? 'text-luxury-gold-600' :
                    'text-luxury-diamond-600'
                  }`}>
                    {insight.value}
                  </div>
                  <div className="flex items-center gap-1">
                    {insight.trend === 'up' && <TrendingUp className="h-3 w-3 text-luxury-emerald-500" />}
                    {insight.trend === 'down' && <TrendingDown className="h-3 w-3 text-luxury-ruby-500" />}
                    <span className="text-xs text-slate-500">{insight.confidence}% confidence</span>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-2">{insight.title}</h3>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">{insight.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    impactColor === 'luxury-ruby' ? 'bg-luxury-ruby-500' :
                    impactColor === 'luxury-gold' ? 'bg-luxury-gold-500' :
                    'bg-luxury-emerald-500'
                  }`}></div>
                  <span className="text-xs font-medium text-slate-600 capitalize">{insight.impact} impact</span>
                </div>
                {insight.action && (
                  <LuxuryButton
                    variant="glass"
                    size="sm"
                    className="text-xs hover:scale-105 transition-transform duration-300"
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    Action
                  </LuxuryButton>
                )}
              </div>
            </LuxuryCard>
          )
        })}
      </div>

      {/* Summary Stats */}
      <LuxuryCard variant="glass" className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-luxury-emerald-500 to-luxury-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-luxury-emerald-600">3</div>
            <div className="text-sm text-slate-600">Positive Insights</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-luxury-ruby-500 to-luxury-ruby-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-luxury-ruby-600">2</div>
            <div className="text-sm text-slate-600">Critical Alerts</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-luxury-gold-500 to-luxury-gold-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-luxury-gold-600">4</div>
            <div className="text-sm text-slate-600">Action Items</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-luxury-diamond-500 to-luxury-diamond-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-luxury-diamond-600">89%</div>
            <div className="text-sm text-slate-600">Avg Confidence</div>
          </div>
        </div>
      </LuxuryCard>
    </div>
  )
}
