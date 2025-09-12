'use client'

import React, { useState, useEffect } from 'react'
import { SnowCard, SnowCardHeader, SnowCardContent, SnowCardTitle, SnowCardDescription } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowInput, SnowSearchInput } from '@/components/ui/snow-input'
import { SnowTable, SnowTableHeader, SnowTableBody, SnowTableRow, SnowTableCell, SnowTableHead, SnowTableFooter, SnowTableCaption } from '@/components/ui/snow-table'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle,
  Clock,
  BarChart3,
  Zap,
  Target,
  Activity,
  Loader2
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

export default function AIPredictivePage() {
  const [timeRange, setTimeRange] = useState('30d')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [predictiveData, setPredictiveData] = useState<any>({
    demandForecast: {},
    maintenancePredictions: [],
    routeOptimization: {},
    riskAssessment: {}
  })

  useEffect(() => {
    loadPredictiveData()
  }, [timeRange])

  const loadPredictiveData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Load predictive analytics data from AI predictive endpoint
      const response = await apiClient.get<any>(`/ai/predictive?timeRange=${timeRange}`)
      if (response.success) {
        setPredictiveData(response.data || {})
      } else {
        setError('Failed to load predictive data')
        toast.error('Failed to load predictive data')
      }
    } catch (error: any) {
      console.error('Failed to load predictive data:', error)
      setError('Failed to load predictive data')
      toast.error('Failed to load predictive data')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    if (!amount || isNaN(amount)) return 'EGP 0'
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>Loading predictive data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <SnowButton onClick={loadPredictiveData}>Retry</SnowButton>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Predictive Analytics</h1>
          <p className="text-muted-foreground">
            AI-powered predictions and insights
          </p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
      </div>
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle>Demand Forecast</SnowCardTitle>
          <SnowCardDescription>
            Predicted demand for the upcoming periods
          </SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Next Week</p>
              <p className="text-2xl font-bold">{predictiveData.demandForecast?.nextWeek || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Next Month</p>
              <p className="text-2xl font-bold">{predictiveData.demandForecast?.nextMonth || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Next Quarter</p>
              <p className="text-2xl font-bold">{predictiveData.demandForecast?.nextQuarter || 0}</p>
            </div>
          </div>
          <div className="mt-4 text-center">
            <Badge className="bg-blue-100 text-blue-800">
              Trend: {predictiveData.demandForecast?.trend || 'stable'}
            </Badge>
          </div>
        </SnowCardContent>
      </SnowCard>
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle>Maintenance Predictions</SnowCardTitle>
          <SnowCardDescription>
            Predicted maintenance needs for vehicles
          </SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          {predictiveData.maintenancePredictions && predictiveData.maintenancePredictions.length > 0 ? (
            <SnowTable>
              <SnowTableHeader>
                <SnowTableHead>Vehicle</SnowTableHead>
                <SnowTableHead>Prediction Date</SnowTableHead>
                <SnowTableHead>Type</SnowTableHead>
                <SnowTableHead>Confidence</SnowTableHead>
              </SnowTableHeader>
              <SnowTableBody>
                {predictiveData.maintenancePredictions.map((prediction: any, index: number) => (
                  <SnowTableRow key={index}>
                    <SnowTableCell>
                      <span className="font-medium">{prediction.vehicle || 'N/A'}</span>
                    </SnowTableCell>
                    <SnowTableCell>
                      <span className="text-sm">{formatDate(prediction.prediction)}</span>
                    </SnowTableCell>
                    <SnowTableCell>
                      <span className="text-sm">{prediction.type || 'N/A'}</span>
                    </SnowTableCell>
                    <SnowTableCell>
                      <span className="font-medium">{prediction.confidence || 0}%</span>
                    </SnowTableCell>
                  </SnowTableRow>
                ))}
              </SnowTableBody>
            </SnowTable>
          ) : (
            <div className="text-center py-12">
              <Brain className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-muted-foreground">No maintenance predictions available for the selected time range.</p>
            </div>
          )}
        </SnowCardContent>
      </SnowCard>
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle>Route Optimization</SnowCardTitle>
          <SnowCardDescription>
            Potential savings from route optimization
          </SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Potential Savings</p>
              <p className="text-2xl font-bold">{predictiveData.routeOptimization?.potentialSavings || 0}%</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Fuel Reduction</p>
              <p className="text-2xl font-bold">{predictiveData.routeOptimization?.fuelReduction || 0}%</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Time Reduction</p>
              <p className="text-2xl font-bold">{predictiveData.routeOptimization?.timeReduction || 0}%</p>
            </div>
          </div>
        </SnowCardContent>
      </SnowCard>
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle>Risk Assessment</SnowCardTitle>
          <SnowCardDescription>
            AI-powered risk analysis
          </SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">High Risk</p>
              <p className="text-2xl font-bold text-red-600">{predictiveData.riskAssessment?.highRisk || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Medium Risk</p>
              <p className="text-2xl font-bold text-yellow-600">{predictiveData.riskAssessment?.mediumRisk || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Low Risk</p>
              <p className="text-2xl font-bold text-green-600">{predictiveData.riskAssessment?.lowRisk || 0}</p>
            </div>
          </div>
        </SnowCardContent>
      </SnowCard>
    </div>
  )
}


