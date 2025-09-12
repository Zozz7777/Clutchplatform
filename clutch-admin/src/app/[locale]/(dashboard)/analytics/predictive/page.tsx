'use client'

import React, { useState, useEffect } from 'react'
import { SnowCard, SnowCardHeader, SnowCardContent, SnowCardTitle, SnowCardDescription } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowInput, SnowSearchInput } from '@/components/ui/snow-input'
import { SnowTable, SnowTableHeader, SnowTableBody, SnowTableRow, SnowTableCell, SnowTableHead, SnowTableFooter, SnowTableCaption } from '@/components/ui/snow-table'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  PoundSterling, 
  Calendar,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Target,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Loader2,
  BarChart3,
  Activity
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

export default function PredictiveAnalyticsPage() {
  const [predictiveData, setPredictiveData] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState('30d')
  const [selectedPrediction, setSelectedPrediction] = useState<any>(null)
  const [showViewModal, setShowViewModal] = useState(false)

  useEffect(() => {
    loadPredictiveData()
  }, [])

  const loadPredictiveData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await apiClient.get<any[]>('/analytics/predictive')
      if (response.success) {
        setPredictiveData(response.data || [])
      } else {
        setPredictiveData([])
        setError('Failed to load predictive data')
        toast.error('Failed to load predictive data')
      }
    } catch (error: any) {
      console.error('Failed to load predictive data:', error)
      setPredictiveData([])
      setError('Failed to load predictive data')
      toast.error('Failed to load predictive data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewPrediction = async (prediction: any) => {
    try {
      const response = await apiClient.get(`/analytics/predictive/${prediction._id || prediction.id}`)
      if (response.success) {
        setSelectedPrediction(response.data)
        setShowViewModal(true)
      } else {
        toast.error('Failed to load prediction details')
      }
    } catch (error) {
      console.error('Failed to load prediction details:', error)
      toast.error('Failed to load prediction details')
    }
  }

  const handleAnalyzePrediction = async (prediction: any) => {
    try {
      const response = await apiClient.post(`/analytics/predictive/${prediction._id || prediction.id}/analyze`, {})
      if (response.success) {
        toast.success('Prediction analysis completed')
        loadPredictiveData() // Refresh the list
      } else {
        toast.error('Failed to analyze prediction')
      }
    } catch (error: any) {
      console.error('Failed to analyze prediction:', error)
      toast.error('Failed to analyze prediction')
    }
  }

  const handleMoreActions = (prediction: any) => {
    // Implement dropdown menu or additional actions
    toast.info(`More actions for prediction: ${prediction.name}`)
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

  const formatPercentage = (value: number) => {
    if (!value || isNaN(value)) return '0%'
    return `${value.toFixed(1)}%`
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-500'
    if (confidence >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 80) return 'text-green-400'
    if (confidence >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-red-500" />
    }
  }

  const getTrendText = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const filteredPredictions = (predictiveData?.predictions || []).filter((prediction: any) => {
    const matchesSearch = prediction.metric?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prediction.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || prediction.category === filter
    return matchesSearch && matchesFilter
  })

  // Calculate metrics
  const totalPredictions = predictiveData?.predictions?.length || 0
  const highConfidence = (predictiveData?.predictions || []).filter((p: any) => p.confidence >= 80).length
  const avgConfidence = (predictiveData?.predictions || []).reduce((sum: number, p: any) => sum + (p.confidence || 0), 0) / Math.max(totalPredictions, 1)
  const positiveTrends = (predictiveData?.predictions || []).filter((p: any) => p.trend === 'up').length

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
          <h1 className="text-3xl font-bold tracking-tight">Predictive Analytics</h1>
          <p className="text-muted-foreground">
            AI-powered predictions and forecasting
          </p>
        </div>
        <SnowButton>
          <Plus className="mr-2 h-4 w-4" />
          Generate Report
        </SnowButton>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Predictions</p>
                <p className="text-2xl font-bold">{totalPredictions}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Confidence</p>
                <p className="text-2xl font-bold">{highConfidence}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-50">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Confidence</p>
                <p className="text-2xl font-bold">{formatPercentage(avgConfidence)}</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-50">
                <Target className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Positive Trends</p>
                <p className="text-2xl font-bold">{positiveTrends}</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
      <SnowCard>
        <SnowCardContent className="p-6">
          <div className="flex items-center space-x-4">
            <SnowSearchInput
              placeholder="Search predictions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="revenue">Revenue</option>
              <option value="demand">Demand</option>
              <option value="performance">Performance</option>
              <option value="risk">Risk</option>
            </select>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </SnowCardContent>
      </SnowCard>
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle>Predictions Overview</SnowCardTitle>
          <SnowCardDescription>
            AI-generated predictions and forecasts
          </SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          {filteredPredictions.length > 0 ? (
            <SnowTable>
              <SnowTableHeader>
                <SnowTableHead>Metric</SnowTableHead>
                <SnowTableHead>Prediction</SnowTableHead>
                <SnowTableHead>Confidence</SnowTableHead>
                <SnowTableHead>Trend</SnowTableHead>
                <SnowTableHead>Category</SnowTableHead>
                <SnowTableHead>Timeframe</SnowTableHead>
                <SnowTableHead>Actions</SnowTableHead>
              </SnowTableHeader>
              <SnowTableBody>
                {filteredPredictions.map((prediction: any) => (
                  <SnowTableRow key={prediction._id || prediction.id}>
                    <SnowTableCell>
                      <div>
                        <p className="font-medium">{prediction.metric || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">
                          {prediction.description || 'N/A'}
                        </p>
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <span className="font-medium">
                        {prediction.value ? formatCurrency(prediction.value) : prediction.prediction || 'N/A'}
                      </span>
                    </SnowTableCell>
                    <SnowTableCell>
                      <Badge className={`${getConfidenceColor(prediction.confidence || 0)} ${getConfidenceText(prediction.confidence || 0)}`}>
                        {formatPercentage(prediction.confidence || 0)}
                      </Badge>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="flex items-center space-x-2">
                        {getTrendIcon(prediction.trend)}
                        <span className={`font-medium ${getTrendText(prediction.trend)}`}>
                          {prediction.trend?.toUpperCase() || 'N/A'}
                        </span>
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <Badge className="bg-blue-100 text-blue-800">
                        {prediction.category || 'N/A'}
                      </Badge>
                    </SnowTableCell>
                    <SnowTableCell>
                      <span className="text-sm">{prediction.timeframe || 'N/A'}</span>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="flex items-center space-x-2">
                        <SnowButton 
                          icon={<Eye className="h-4 w-4" />} 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleViewPrediction(prediction)}
                        />
                        <SnowButton 
                          icon={<BarChart3 className="h-4 w-4" />} 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleAnalyzePrediction(prediction)}
                        />
                        <SnowButton 
                          icon={<MoreHorizontal className="h-4 w-4" />} 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleMoreActions(prediction)}
                        />
                      </div>
                    </SnowTableCell>
                  </SnowTableRow>
                ))}
              </SnowTableBody>
            </SnowTable>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">No predictions found</p>
              <p className="text-sm text-muted-foreground">No predictions match your current filters.</p>
            </div>
          )}
        </SnowCardContent>
      </SnowCard>
    </div>
  )
}


