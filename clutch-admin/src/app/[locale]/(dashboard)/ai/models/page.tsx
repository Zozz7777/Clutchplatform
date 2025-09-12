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
  Brain, 
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  X,
  Sparkles,
  Zap,
  Briefcase,
  Award,
  User,
  MapPin,
  BarChart3,
  Activity,
  Target,
  Users,
  Zap as Lightning,
  Target as Bullseye,
  TrendingUp as ChartLine,
  Brain as Cpu,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Database,
  Layers,
  Network,
  Cpu as Chip
} from 'lucide-react'

export default function AIModelsPage() {
  const [models, setModels] = useState<any[]>([])
  const [deployments, setDeployments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState<any>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isFormLoading, setIsFormLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [modelsResponse, deploymentsResponse] = await Promise.all([
        apiClient.get('/ai/models'),
        apiClient.get('/ai/models/deployments')
      ])
      
      if (modelsResponse.success && modelsResponse.data) {
        setModels(modelsResponse.data as any[])
      } else {
        setModels([])
      }
      
      if (deploymentsResponse.success && deploymentsResponse.data) {
        setDeployments(deploymentsResponse.data as any[])
      } else {
        setDeployments([])
      }
    } catch (error: any) {
      console.error('Failed to load AI models data:', error)
      setError('Failed to load AI models data')
      setModels([])
      setDeployments([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewModel = async (model: any) => {
    try {
      const response = await apiClient.get(`/ai/models/${model.id}`)
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

  const handleConfigureModel = async (model: any) => {
    try {
      const response = await apiClient.get(`/ai/models/${model.id}`)
      if (response.success) {
        setSelectedModel(response.data)
        setShowEditModal(true)
      } else {
        toast.error('Failed to load model configuration')
      }
    } catch (error) {
      console.error('Failed to load model configuration:', error)
      toast.error('Failed to load model configuration')
    }
  }

  const handleTrainDeploy = async (model: any) => {
    try {
      const action = model.status === 'training' ? 'stop' : 'train'
      const response = await apiClient.post(`/ai/models/${model.id}/${action}`, {})
      if (response.success) {
        toast.success(action === 'train' ? 'Model training started' : 'Model stopped')
        loadData() // Refresh the list
      } else {
        toast.error(response.message || `Failed to ${action} model`)
      }
    } catch (error) {
      console.error(`Failed to ${model.status === 'training' ? 'stop' : 'train'} model:`, error)
      toast.error(`Failed to ${model.status === 'training' ? 'stop' : 'train'} model`)
    }
  }

  const handleDeleteModel = async (model: any) => {
    if (confirm(`Are you sure you want to delete the model "${model.name}"?`)) {
      try {
        const response = await apiClient.delete(`/ai/models/${model.id}`)
        if (response.success) {
          toast.success('Model deleted successfully')
          loadData() // Refresh the list
        } else {
          toast.error(response.message || 'Failed to delete model')
        }
      } catch (error) {
        console.error('Failed to delete model:', error)
        toast.error('Failed to delete model')
      }
    }
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 95) return 'text-green-400'
    if (accuracy >= 90) return 'text-yellow-400'
    if (accuracy >= 85) return 'text-orange-400'
    return 'text-red-400'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return 'bg-green-500'
      case 'training': return 'bg-blue-500'
      case 'testing': return 'bg-yellow-500'
      case 'archived': return 'bg-slate-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-slate-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'deployed': return 'Deployed'
      case 'training': return 'Training'
      case 'testing': return 'Testing'
      case 'archived': return 'Archived'
      case 'error': return 'Error'
      default: return 'Unknown'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'deployed': return <CheckCircle className="h-4 w-4" />
      case 'training': return <Clock className="h-4 w-4" />
      case 'testing': return <AlertCircle className="h-4 w-4" />
      case 'archived': return <FileText className="h-4 w-4" />
      case 'error': return <X className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'nlp': return <Brain className="h-4 w-4" />
      case 'computer_vision': return <Eye className="h-4 w-4" />
      case 'recommendation': return <Target className="h-4 w-4" />
      case 'forecasting': return <ChartLine className="h-4 w-4" />
      case 'classification': return <Layers className="h-4 w-4" />
      default: return <Cpu className="h-4 w-4" />
    }
  }

  const filteredModels = models.filter(model => {
    const matchesSearch = model.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || model.status === filter
    return matchesSearch && matchesFilter
  })



  // Calculate metrics
  const totalModels = models.length
  const deployedModels = models.filter(m => m.status === 'deployed').length
  const trainingModels = models.filter(m => m.status === 'training').length
  const totalApiCalls = models.reduce((sum, m) => sum + (m.apiCalls || 0), 0)
  const avgAccuracy = models.length > 0 
    ? models.reduce((sum, m) => sum + (m.accuracy || 0), 0) / models.length 
    : 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 4,
      maximumFractionDigits: 4
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-300">AI SYSTEM ACTIVE</span>
                  </div>
                  <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                  AI Models
                </h1>
                <p className="text-indigo-100 max-w-2xl">
                  Manage and monitor AI models, deployments, and performance
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <SnowButton variant="outline" className="bg-indigo-500/20 border-indigo-400/30 text-white hover:bg-indigo-500/30">
                  <Brain className="h-4 w-4 mr-2" />
                  AI Dashboard
                </SnowButton>
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <SnowCard key={i} variant="dark" className="animate-pulse">
              <SnowCardContent className="p-6">
                <div className="h-4 bg-slate-700 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-slate-700 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-slate-700 rounded w-1/3"></div>
              </SnowCardContent>
            </SnowCard>
          ))}
        </div>
        <SnowCard variant="dark">
          <SnowCardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-slate-700 rounded animate-pulse"></div>
              ))}
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 via-red-700 to-red-800 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 bg-red-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-red-300">SYSTEM ERROR</span>
                  </div>
                  <AlertCircle className="h-5 w-5 text-red-300 animate-pulse" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                  AI Models
                </h1>
                <p className="text-red-100 max-w-2xl">
                  Unable to load AI models data. Please try again.
                </p>
              </div>
              <SnowButton variant="outline" className="bg-red-500/20 border-red-400/30 text-white hover:bg-red-500/30" onClick={loadData}>
                <Zap className="h-4 w-4 mr-2" />
                Retry
              </SnowButton>
            </div>
          </div>
        </div>

        <SnowCard variant="dark">
          <SnowCardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Failed to Load Data</h3>
              <p className="text-slate-300 mb-4">{error}</p>
                             <SnowButton onClick={loadData} variant="default">
                Try Again
              </SnowButton>
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-300">AI SYSTEM ACTIVE</span>
                </div>
                <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                AI Models
              </h1>
              <p className="text-indigo-100 max-w-2xl">
                Manage and monitor AI models, deployments, and performance
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <SnowButton variant="outline" className="bg-indigo-500/20 border-indigo-400/30 text-white hover:bg-indigo-500/30">
                <Brain className="h-4 w-4 mr-2" />
                AI Dashboard
              </SnowButton>
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <SnowCard variant="dark">
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-300">Total Models</p>
                <p className="text-2xl font-bold text-white">{totalModels}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-400" />
                  <p className="text-xs text-indigo-200">+{deployedModels} deployed</p>
                </div>
              </div>
              <div className="p-3 bg-indigo-500/20 rounded-lg">
                <Brain className="h-6 w-6 text-indigo-400" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard variant="dark">
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-300">Deployed Models</p>
                <p className="text-2xl font-bold text-white">{deployedModels}</p>
                <p className="text-xs text-green-200">Active in production</p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-lg">
                <Play className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard variant="dark">
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-300">Total API Calls</p>
                <p className="text-2xl font-bold text-white">{totalApiCalls.toLocaleString()}</p>
                <p className="text-xs text-blue-200">Model requests</p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Network className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard variant="dark">
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-300">Avg Accuracy</p>
                <p className="text-2xl font-bold text-white">{avgAccuracy.toFixed(1)}%</p>
                <p className="text-xs text-purple-200">Model performance</p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Target className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
      <SnowCard variant="dark">
        <SnowCardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <SnowSearchInput
                placeholder="Search models..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onSearch={() => {}}
              />
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="deployed">Deployed</option>
                <option value="training">Training</option>
                <option value="testing">Testing</option>
                <option value="archived">Archived</option>
                <option value="error">Error</option>
              </select>
              <SnowButton variant="default">
                <Plus className="h-4 w-4 mr-2" />
                Create Model
              </SnowButton>
            </div>
          </div>
        </SnowCardContent>
      </SnowCard>
      <SnowCard variant="dark">
        <SnowCardHeader>
          <SnowCardTitle icon={<Brain className="h-5 w-5" />}>
            AI Models
          </SnowCardTitle>
          <SnowCardDescription>
            Manage and monitor AI models, their performance, and deployments
          </SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          {filteredModels.length > 0 ? (
            <SnowTable>
              <SnowTableHeader>
                <tr>
                  <SnowTableHead>Model</SnowTableHead>
                  <SnowTableHead>Type</SnowTableHead>
                  <SnowTableHead>Status</SnowTableHead>
                  <SnowTableHead>Accuracy</SnowTableHead>
                  <SnowTableHead>API Calls</SnowTableHead>
                  <SnowTableHead>Response Time</SnowTableHead>
                  <SnowTableHead>Cost</SnowTableHead>
                  <SnowTableHead align="center">Actions</SnowTableHead>
                </tr>
              </SnowTableHeader>
              <SnowTableBody>
                {filteredModels.map((model) => (
                                     <SnowTableRow key={model.id}>
                    <SnowTableCell>
                      <div>
                        <div className="font-medium text-white">{model.name}</div>
                        <div className="text-sm text-slate-400">{model.description}</div>
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="flex items-center space-x-2">
                        <div className="p-1 bg-slate-700 rounded">
                          {getTypeIcon(model.type)}
                        </div>
                        <span className="text-white capitalize">{model.type.replace('_', ' ')}</span>
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="flex items-center space-x-2">
                        <div className={`p-1 rounded-full ${getStatusColor(model.status)}`}>
                          {getStatusIcon(model.status)}
                        </div>
                        <span className="text-white">{getStatusText(model.status)}</span>
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className={`font-medium ${getAccuracyColor(model.accuracy)}`}>
                        {model.accuracy}%
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="text-white">{model.apiCalls.toLocaleString()}</div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="text-white">{model.responseTime}</div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="text-white">{formatCurrency(model.cost)}</div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="flex items-center space-x-2">
                        <SnowButton
                          icon={<Eye className="h-4 w-4" />}
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewModel(model)}
                        />
                        <SnowButton
                          icon={<Settings className="h-4 w-4" />}
                          variant="outline"
                          size="sm"
                          onClick={() => handleConfigureModel(model)}
                        />
                        <SnowButton
                          icon={<Play className="h-4 w-4" />}
                          variant="outline"
                          size="sm"
                          onClick={() => handleTrainDeploy(model)}
                        />
                        <SnowButton
                          icon={<Trash2 className="h-4 w-4" />}
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteModel(model)}
                        />
                      </div>
                    </SnowTableCell>
                  </SnowTableRow>
                ))}
              </SnowTableBody>
            </SnowTable>
          ) : (
            <div className="text-center py-12">
              <div className="text-slate-400 mb-4">
                <Brain className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No Models Found</h3>
              <p className="text-slate-300 mb-4">No models match your current search criteria. Try adjusting your filters or create a new model.</p>
                             <SnowButton variant="default">
                <Plus className="h-4 w-4 mr-2" />
                Create Model
              </SnowButton>
            </div>
          )}
        </SnowCardContent>
      </SnowCard>
    </div>
  )
}

