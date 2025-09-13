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
  Brain,
  Zap,
  Crown,
  Gem,
  Sparkles,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'

interface PredictiveData {
  metric: string
  current: number
  predicted: number
  confidence: number
  trend: 'up' | 'down' | 'stable'
  timeframe: string
  icon: React.ComponentType<any>
  color: string
}

export function PredictiveAnalytics() {
  const [predictions, setPredictions] = useState<PredictiveData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d')

  useEffect(() => {
    // Simulate AI predictions
    const mockPredictions: PredictiveData[] = [
      {
        metric: 'Revenue',
        current: 125000,
        predicted: 148000,
        confidence: 94,
        trend: 'up',
        timeframe: '30 days',
        icon: DollarSign,
        color: 'luxury-emerald'
      },
      {
        metric: 'Active Users',
        current: 12500,
        predicted: 15200,
        confidence: 89,
        trend: 'up',
        timeframe: '30 days',
        icon: Users,
        color: 'luxury-diamond'
      },
      {
        metric: 'Conversion Rate',
        current: 3.2,
        predicted: 3.8,
        confidence: 87,
        trend: 'up',
        timeframe: '30 days',
        icon: Target,
        color: 'luxury-gold'
      },
      {
        metric: 'Churn Rate',
        current: 2.1,
        predicted: 1.8,
        confidence: 92,
        trend: 'down',
        timeframe: '30 days',
        icon: TrendingDown,
        color: 'luxury-ruby'
      },
      {
        metric: 'Page Load Time',
        current: 1.2,
        predicted: 0.9,
        confidence: 85,
        trend: 'down',
        timeframe: '30 days',
        icon: Activity,
        color: 'luxury-platinum'
      },
      {
        metric: 'Customer Satisfaction',
        current: 4.2,
        predicted: 4.6,
        confidence: 91,
        trend: 'up',
        timeframe: '30 days',
        icon: CheckCircle,
        color: 'luxury-emerald'
      }
    ]

    setTimeout(() => {
      setPredictions(mockPredictions)
      setLoading(false)
    }, 2000)
  }, [selectedTimeframe])

  const timeframes = [
    { id: '7d', label: '7 Days', icon: Calendar },
    { id: '30d', label: '30 Days', icon: Calendar },
    { id: '90d', label: '90 Days', icon: Calendar },
    { id: '1y', label: '1 Year', icon: Calendar }
  ]

  const formatValue = (value: number, metric: string) => {
    if (metric === 'Revenue') {
      return `$${(value / 1000).toFixed(0)}k`
    }
    if (metric === 'Active Users') {
      return `${(value / 1000).toFixed(1)}k`
    }
    if (metric === 'Conversion Rate' || metric === 'Churn Rate') {
      return `${value}%`
    }
    if (metric === 'Page Load Time') {
      return `${value}s`
    }
    if (metric === 'Customer Satisfaction') {
      return `${value}/5`
    }
    return value.toString()
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return ArrowUp
      case 'down': return ArrowDown
      default: return Minus
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-luxury-emerald-500'
      case 'down': return 'text-luxury-ruby-500'
      default: return 'text-slate-500'
    }
  }

  if (loading) {
    return (
      <LuxuryCard variant="glass" className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-luxury-gold-200 border-t-luxury-gold-500"></div>
        </div>
        <p className="text-center text-slate-600 mt-4 font-medium">AI is generating predictions...</p>
      </LuxuryCard>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-luxury-diamond-500 to-luxury-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              Predictive Analytics
              <Gem className="h-5 w-5 text-luxury-diamond-500" />
            </h2>
            <p className="text-slate-600 font-medium">AI-powered future insights and forecasts</p>
          </div>
        </div>
        <LuxuryButton variant="diamond" className="hover:scale-105 transition-transform duration-300">
          <Sparkles className="h-4 w-4 mr-2" />
          Generate Report
        </LuxuryButton>
      </div>

      {/* Timeframe Selector */}
      <div className="flex flex-wrap gap-2">
        {timeframes.map((timeframe) => (
          <LuxuryButton
            key={timeframe.id}
            variant={selectedTimeframe === timeframe.id ? 'diamond' : 'glass'}
            size="sm"
            onClick={() => setSelectedTimeframe(timeframe.id)}
            className="hover:scale-105 transition-transform duration-300"
          >
            <timeframe.icon className="h-4 w-4 mr-2" />
            {timeframe.label}
          </LuxuryButton>
        ))}
      </div>

      {/* Predictions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {predictions.map((prediction, index) => {
          const Icon = prediction.icon
          const TrendIcon = getTrendIcon(prediction.trend)
          const trendColor = getTrendColor(prediction.trend)
          const change = ((prediction.predicted - prediction.current) / prediction.current * 100)
          
          return (
            <LuxuryCard
              key={index}
              variant="glass"
              className="hover:scale-105 transition-all duration-300 cursor-pointer"
              effect="glow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  prediction.color === 'luxury-emerald' ? 'bg-luxury-emerald-500' :
                  prediction.color === 'luxury-diamond' ? 'bg-luxury-diamond-500' :
                  prediction.color === 'luxury-gold' ? 'bg-luxury-gold-500' :
                  prediction.color === 'luxury-ruby' ? 'bg-luxury-ruby-500' :
                  'bg-luxury-platinum-500'
                } shadow-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <TrendIcon className={`h-4 w-4 ${trendColor}`} />
                    <span className={`text-sm font-bold ${trendColor}`}>
                      {change > 0 ? '+' : ''}{change.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">{prediction.confidence}% confidence</div>
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-2">{prediction.metric}</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Current</span>
                  <span className="text-lg font-bold text-slate-900">
                    {formatValue(prediction.current, prediction.metric)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Predicted</span>
                  <span className={`text-lg font-bold ${
                    prediction.trend === 'up' ? 'text-luxury-emerald-600' :
                    prediction.trend === 'down' ? 'text-luxury-ruby-600' :
                    'text-slate-900'
                  }`}>
                    {formatValue(prediction.predicted, prediction.metric)}
                  </span>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      prediction.color === 'luxury-emerald' ? 'bg-luxury-emerald-500' :
                      prediction.color === 'luxury-diamond' ? 'bg-luxury-diamond-500' :
                      prediction.color === 'luxury-gold' ? 'bg-luxury-gold-500' :
                      prediction.color === 'luxury-ruby' ? 'bg-luxury-ruby-500' :
                      'bg-luxury-platinum-500'
                    }`}
                    style={{ width: `${Math.min(prediction.confidence, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Next {prediction.timeframe}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {prediction.confidence}% confidence
                  </span>
                </div>
              </div>
            </LuxuryCard>
          )
        })}
      </div>

      {/* Summary Insights */}
      <LuxuryCard variant="glass" className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-luxury-gold-500 to-luxury-diamond-500 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Key Insights</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-luxury-emerald-500 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900">Revenue Growth</h4>
                <p className="text-sm text-slate-600">Strong upward trend expected with 18% growth in the next 30 days</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-luxury-emerald-500 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900">User Engagement</h4>
                <p className="text-sm text-slate-600">Active users projected to increase by 22% based on current patterns</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-luxury-gold-500 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900">Performance Optimization</h4>
                <p className="text-sm text-slate-600">Page load times expected to improve by 25% with current optimizations</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-luxury-emerald-500 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900">Customer Satisfaction</h4>
                <p className="text-sm text-slate-600">Satisfaction scores predicted to reach 4.6/5 based on recent improvements</p>
              </div>
            </div>
          </div>
        </div>
      </LuxuryCard>
    </div>
  )
}
