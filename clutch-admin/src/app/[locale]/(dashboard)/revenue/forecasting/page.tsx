'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Calendar,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw
} from 'lucide-react'

export default function RevenueForecastingPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('12m')
  const [selectedModel, setSelectedModel] = useState('ai')

  const forecastMetrics = [
    {
      name: 'Current Revenue',
      value: '$2.4M',
      change: '+12.5%',
      trend: 'up',
      period: 'last 12 months'
    },
    {
      name: 'Forecasted Revenue',
      value: '$3.1M',
      change: '+29.2%',
      trend: 'up',
      period: 'next 12 months'
    },
    {
      name: 'Growth Rate',
      value: '24.8%',
      change: '+3.2%',
      trend: 'up',
      period: 'year-over-year'
    },
    {
      name: 'Confidence Level',
      value: '87%',
      change: '+5%',
      trend: 'up',
      period: 'forecast accuracy'
    }
  ]

  const revenueStreams = [
    {
      name: 'Subscription Revenue',
      current: 1800000,
      forecast: 2200000,
      growth: 22.2,
      confidence: 92
    },
    {
      name: 'Transaction Fees',
      current: 450000,
      forecast: 620000,
      growth: 37.8,
      confidence: 85
    },
    {
      name: 'Enterprise Licenses',
      current: 150000,
      forecast: 280000,
      growth: 86.7,
      confidence: 78
    }
  ]

  const monthlyForecast = [
    { month: 'Jan 2024', actual: 180000, forecast: 185000, confidence: 89 },
    { month: 'Feb 2024', actual: 195000, forecast: 198000, confidence: 91 },
    { month: 'Mar 2024', actual: 210000, forecast: 212000, confidence: 88 },
    { month: 'Apr 2024', actual: 225000, forecast: 228000, confidence: 90 },
    { month: 'May 2024', actual: 240000, forecast: 245000, confidence: 87 },
    { month: 'Jun 2024', actual: 255000, forecast: 262000, confidence: 85 },
    { month: 'Jul 2024', actual: 270000, forecast: 278000, confidence: 83 },
    { month: 'Aug 2024', actual: 285000, forecast: 295000, confidence: 81 },
    { month: 'Sep 2024', actual: 300000, forecast: 312000, confidence: 79 },
    { month: 'Oct 2024', actual: 315000, forecast: 330000, confidence: 77 },
    { month: 'Nov 2024', actual: 330000, forecast: 348000, confidence: 75 },
    { month: 'Dec 2024', actual: 345000, forecast: 365000, confidence: 73 }
  ]

  const riskFactors = [
    {
      factor: 'Market Competition',
      impact: 'Medium',
      probability: 'High',
      mitigation: 'Product differentiation and pricing strategy'
    },
    {
      factor: 'Economic Downturn',
      impact: 'High',
      probability: 'Low',
      mitigation: 'Diversified revenue streams and cost optimization'
    },
    {
      factor: 'Technology Changes',
      impact: 'High',
      probability: 'Medium',
      mitigation: 'Continuous R&D investment and innovation'
    },
    {
      factor: 'Customer Churn',
      impact: 'Medium',
      probability: 'Medium',
      mitigation: 'Improved customer success and retention programs'
    }
  ]

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

  const getProbabilityColor = (probability: string) => {
    switch (probability) {
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
          <h1 className="text-3xl font-bold tracking-tight">Revenue Forecasting</h1>
          <p className="text-muted-foreground">
            AI-powered revenue predictions and growth analysis
          </p>
        </div>
        <div className="flex space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="6m">6 Months</option>
            <option value="12m">12 Months</option>
            <option value="24m">24 Months</option>
          </select>
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button>
            <BarChart3 className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Forecast Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        {forecastMetrics.map((metric) => (
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
                <p className="text-xs text-muted-foreground">
                  {metric.change}
                </p>
                <p className="text-xs text-muted-foreground">
                  {metric.period}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Streams Forecast */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Streams Forecast</CardTitle>
            <CardDescription>
              Breakdown of revenue by source with growth projections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueStreams.map((stream, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{stream.name}</h4>
                    <Badge className="text-green-600 bg-green-100">
                      +{stream.growth}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                    <span>Current: ${(stream.current / 1000000).toFixed(1)}M</span>
                    <span>Forecast: ${(stream.forecast / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(stream.current / stream.forecast) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                    <span>Confidence: {stream.confidence}%</span>
                    <span>Growth: {stream.growth}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Forecast Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue Forecast</CardTitle>
            <CardDescription>
              Actual vs forecasted revenue with confidence intervals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {monthlyForecast.slice(-6).map((month, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{month.month}</span>
                      <span className="text-xs text-muted-foreground">
                        Confidence: {month.confidence}%
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-green-600">
                        Actual: ${(month.actual / 1000).toFixed(0)}K
                      </span>
                      <span className="text-blue-600">
                        Forecast: ${(month.forecast / 1000).toFixed(0)}K
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                      <div 
                        className="bg-green-500 h-1 rounded-full" 
                        style={{ width: `${(month.actual / month.forecast) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Analysis</CardTitle>
          <CardDescription>
            Potential risks and their impact on revenue forecasts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {riskFactors.map((risk, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{risk.factor}</h4>
                  <div className="flex space-x-2">
                    <Badge className={getImpactColor(risk.impact)}>
                      {risk.impact} Impact
                    </Badge>
                    <Badge className={getProbabilityColor(risk.probability)}>
                      {risk.probability} Probability
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>Mitigation:</strong> {risk.mitigation}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Forecast Model Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Forecast Model Configuration</CardTitle>
          <CardDescription>
            Configure AI models and parameters for revenue forecasting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">AI Model</h4>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="ai">AI Neural Network</option>
                <option value="linear">Linear Regression</option>
                <option value="seasonal">Seasonal Decomposition</option>
                <option value="ensemble">Ensemble Model</option>
              </select>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Confidence Interval</h4>
              <select className="w-full p-2 border border-gray-300 rounded-md">
                <option value="80">80%</option>
                <option value="85">85%</option>
                <option value="90">90%</option>
                <option value="95">95%</option>
              </select>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Update Frequency</h4>
              <select className="w-full p-2 border border-gray-300 rounded-md">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Forecast Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Forecast Summary</CardTitle>
          <CardDescription>
            Key insights and recommendations from revenue forecasting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <Target className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold">Growth Target</h3>
              <p className="text-sm text-muted-foreground">24.8% YoY growth</p>
              <p className="text-2xl font-bold text-green-600">$3.1M</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-semibold">Best Performing</h3>
              <p className="text-sm text-muted-foreground">Enterprise Licenses</p>
              <p className="text-2xl font-bold text-green-600">+86.7%</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-semibold">Model Accuracy</h3>
              <p className="text-sm text-muted-foreground">87% confidence</p>
              <p className="text-2xl font-bold text-purple-600">High</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Forecast Recommendations</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Focus on enterprise license growth - highest potential (+86.7%)</li>
              <li>• Optimize subscription pricing to maintain 22.2% growth</li>
              <li>• Monitor transaction fee trends for potential optimization</li>
              <li>• Implement risk mitigation strategies for identified factors</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
