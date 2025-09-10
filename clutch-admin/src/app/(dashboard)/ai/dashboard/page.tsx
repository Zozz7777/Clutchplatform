'use client'

import React, { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'
import { SnowCard, SnowCardHeader, SnowCardContent, SnowCardTitle, SnowCardDescription } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowInput, SnowSearchInput } from '@/components/ui/snow-input'
import { SnowTable, SnowTableHeader, SnowTableBody, SnowTableRow, SnowTableCell, SnowTableHead } from '@/components/ui/snow-table'
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
  Brain,
  Activity,
  BarChart3,
  Zap
} from 'lucide-react'

export default function AIDashboardPage() {
  const [aiData, setAiData] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState<any>(null)
  const [showViewModal, setShowViewModal] = useState(false)

  useEffect(() => {
    loadAIData()
  }, [])

  const loadAIData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await apiClient.get<any[]>('/ai/dashboard')
      if (response.success) {
        setAiData(response.data || [])
      } else {
        setAiData([])
        setError('Failed to load AI data')
        toast.error('Failed to load AI data')
      }
    } catch (error: any) {
      console.error('Failed to load AI data:', error)
      setAiData([])
      setError('Failed to load AI data')
      toast.error('Failed to load AI data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewModel = async (model: any) => {
    try {
      const response = await apiClient.get(`/ai/dashboard/${model._id || model.id}`)
      if (response.success) {
        setSelectedModel(response.data)
        setShowViewModal(true)
      } else {
        toast.error('Failed to load model details')
      }
    } catch (error) {
      console.error('Failed to load model details:', error)
      toast.error('Failed to load model details')
    }
  }

  const handleActivateModel = async (model: any) => {
    try {
      const response = await apiClient.post(`/ai/dashboard/${model._id || model.id}/activate`, {})
      if (response.success) {
        toast.success('Model activated successfully')
        loadAIData() // Refresh the list
      } else {
        toast.error('Failed to activate model')
      }
    } catch (error) {
      console.error('Failed to activate model:', error)
      toast.error('Failed to activate model')
    }
  }

  const handleMoreActions = (model: any) => {
    // Implement dropdown menu or additional actions
    toast.info(`More actions for model: ${model.name}`)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500'
      case 'inactive':
        return 'bg-red-500'
      case 'training':
        return 'bg-yellow-500'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-slate-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400'
      case 'inactive':
        return 'text-red-400'
      case 'training':
        return 'text-yellow-400'
      case 'error':
        return 'text-red-400'
      default:
        return 'text-slate-400'
    }
  }

  const getModelTypeIcon = (type: string) => {
    switch (type) {
      case 'predictive':
        return <BarChart3 className="h-4 w-4" />
      case 'fraud_detection':
        return <AlertCircle className="h-4 w-4" />
      case 'recommendation':
        return <Target className="h-4 w-4" />
      default:
        return <Brain className="h-4 w-4" />
    }
  }

  const filteredModels = (aiData?.models || []).filter((model: any) => {
    const matchesSearch = model.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || model.status === filter
    return matchesSearch && matchesFilter
  })

  // Calculate metrics
  const totalModels = aiData.models?.length || 0
  const activeModels = (aiData.models || []).filter((m: any) => m.status === 'active').length
  const avgAccuracy = (aiData.models || []).reduce((sum: number, m: any) => sum + (m.accuracy || 0), 0) / Math.max(totalModels, 1)
  const totalPredictions = aiData.totalPredictions || 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>Loading AI dashboard data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <SnowButton onClick={loadAIData}>Retry</SnowButton>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage AI models and predictions
          </p>
        </div>
        <SnowButton>
          <Plus className="mr-2 h-4 w-4" />
          Deploy Model
        </SnowButton>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Models</p>
                <p className="text-2xl font-bold">{totalModels}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Models</p>
                <p className="text-2xl font-bold">{activeModels}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Avg Accuracy</p>
                <p className="text-2xl font-bold">{formatPercentage(avgAccuracy)}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Total Predictions</p>
                <p className="text-2xl font-bold">{totalPredictions.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50">
                <Activity className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
      <SnowCard>
        <SnowCardContent className="p-6">
          <div className="flex items-center space-x-4">
            <SnowSearchInput
              placeholder="Search models..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="training">Training</option>
              <option value="error">Error</option>
            </select>
          </div>
        </SnowCardContent>
      </SnowCard>
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle>AI Models Overview</SnowCardTitle>
          <SnowCardDescription>
            All AI models and their performance metrics
          </SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          {filteredModels.length > 0 ? (
            <SnowTable>
              <SnowTableHeader>
                <SnowTableHead>Model Name</SnowTableHead>
                <SnowTableHead>Type</SnowTableHead>
                <SnowTableHead>Status</SnowTableHead>
                <SnowTableHead>Accuracy</SnowTableHead>
                <SnowTableHead>Predictions</SnowTableHead>
                <SnowTableHead>Last Updated</SnowTableHead>
                <SnowTableHead>Actions</SnowTableHead>
              </SnowTableHeader>
              <SnowTableBody>
                {filteredModels.map((model: any) => (
                  <SnowTableRow key={model._id || model.id}>
                    <SnowTableCell>
                      <div>
                        <p className="font-medium">{model.name || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">
                          {model.description || 'N/A'}
                        </p>
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="flex items-center space-x-2">
                        {getModelTypeIcon(model.type)}
                        <span className="capitalize">{model.type?.replace('_', ' ') || 'N/A'}</span>
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <Badge className={`${getStatusColor(model.status)} ${getStatusText(model.status)}`}>
                        {model.status?.toUpperCase() || 'N/A'}
                      </Badge>
                    </SnowTableCell>
                    <SnowTableCell>
                      <span className="font-medium">{formatPercentage(model.accuracy || 0)}</span>
                    </SnowTableCell>
                    <SnowTableCell>
                      <span className="font-medium">{(model.predictions || 0).toLocaleString()}</span>
                    </SnowTableCell>
                    <SnowTableCell>
                      <span className="text-sm">{formatDate(model.lastUpdated)}</span>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="flex items-center space-x-2">
                        <SnowButton 
                          icon={<Eye className="h-4 w-4" />} 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleViewModel(model)}
                        />
                        <SnowButton 
                          icon={<Zap className="h-4 w-4" />} 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleActivateModel(model)}
                        />
                        <SnowButton 
                          icon={<MoreHorizontal className="h-4 w-4" />} 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleMoreActions(model)}
                        />
                      </div>
                    </SnowTableCell>
                  </SnowTableRow>
                ))}
              </SnowTableBody>
            </SnowTable>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No AI models match your current filters.</p>
            </div>
          )}
        </SnowCardContent>
      </SnowCard>
    </div>
  )
}

