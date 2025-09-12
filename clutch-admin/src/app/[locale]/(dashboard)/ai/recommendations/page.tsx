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
  Brain,
  Activity,
  Wrench,
  Route,
  Car,
  Lightbulb,
  Star
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

export default function AIRecommendationsPage() {
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)
  const [selectedRecommendation, setSelectedRecommendation] = useState<any>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    loadRecommendations()
  }, [])

  const loadRecommendations = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await apiClient.get<any[]>('/ai/recommendations')
      if (response.success) {
        setRecommendations(response.data || [])
      } else {
        setRecommendations([])
        setError('Failed to load recommendations')
        toast.error('Failed to load recommendations')
      }
    } catch (error: any) {
      console.error('Failed to load recommendations:', error)
      setRecommendations([])
      setError('Failed to load recommendations')
      toast.error('Failed to load recommendations')
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewRecommendation = async (recommendation: any) => {
    try {
      const response = await apiClient.get(`/ai/recommendations/${recommendation._id || recommendation.id}`)
      if (response.success) {
        setSelectedRecommendation(response.data)
        setShowViewModal(true)
      } else {
        toast.error('Failed to load recommendation details')
      }
    } catch (error) {
      console.error('Failed to load recommendation details:', error)
      toast.error('Failed to load recommendation details')
    }
  }

  const handleApproveRecommendation = async (recommendation: any) => {
    try {
      const response = await apiClient.post(`/ai/recommendations/${recommendation._id || recommendation.id}/approve`, {})
      if (response.success) {
        toast.success('Recommendation approved successfully')
        loadRecommendations() // Refresh the list
      } else {
        toast.error('Failed to approve recommendation')
      }
    } catch (error) {
      console.error('Failed to approve recommendation:', error)
      toast.error('Failed to approve recommendation')
    }
  }

  const handleScheduleRecommendation = async (recommendation: any) => {
    try {
      const response = await apiClient.post(`/ai/recommendations/${recommendation._id || recommendation.id}/schedule`, {})
      if (response.success) {
        toast.success('Recommendation scheduled successfully')
        loadRecommendations() // Refresh the list
      } else {
        toast.error('Failed to schedule recommendation')
      }
    } catch (error) {
      console.error('Failed to schedule recommendation:', error)
      toast.error('Failed to schedule recommendation')
    }
  }

  const handleTargetRecommendation = async (recommendation: any) => {
    try {
      const response = await apiClient.post(`/ai/recommendations/${recommendation._id || recommendation.id}/target`, {})
      if (response.success) {
        toast.success('Recommendation targeted successfully')
        loadRecommendations() // Refresh the list
      } else {
        toast.error('Failed to target recommendation')
      }
    } catch (error) {
      console.error('Failed to target recommendation:', error)
      toast.error('Failed to target recommendation')
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'low':
        return 'bg-blue-500'
      default:
        return 'bg-slate-500'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-400'
      case 'medium':
        return 'text-yellow-400'
      case 'low':
        return 'text-blue-400'
      default:
        return 'text-slate-400'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'revenue':
        return <PoundSterling className="h-4 w-4" />
      case 'efficiency':
        return <TrendingUp className="h-4 w-4" />
      case 'safety':
        return <AlertCircle className="h-4 w-4" />
      case 'maintenance':
        return <Wrench className="h-4 w-4" />
      case 'route':
        return <Route className="h-4 w-4" />
      case 'fleet':
        return <Car className="h-4 w-4" />
      case 'customer':
        return <Users className="h-4 w-4" />
      default:
        return <Lightbulb className="h-4 w-4" />
    }
  }

  const filteredRecommendations = recommendations.filter(recommendation => {
    const matchesFilter = filter === 'all' || recommendation.category === filter
    return matchesFilter
  })

  // Calculate metrics
  const totalRecommendations = recommendations.length
  const highPriority = recommendations.filter(rec => rec.priority === 'high').length
  const implemented = recommendations.filter(rec => rec.status === 'implemented').length
  const potentialSavings = recommendations.reduce((sum, rec) => sum + (rec.estimatedSavings || 0), 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>Loading AI recommendations...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <SnowButton onClick={loadRecommendations}>Retry</SnowButton>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Recommendations</h1>
          <p className="text-muted-foreground">
            AI-powered insights and recommendations
          </p>
        </div>
        <SnowButton>
          <Lightbulb className="mr-2 h-4 w-4" />
          Generate New
        </SnowButton>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Recommendations</p>
                <p className="text-2xl font-bold">{totalRecommendations}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <Lightbulb className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold">{highPriority}</p>
              </div>
              <div className="p-3 rounded-lg bg-red-50">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Implemented</p>
                <p className="text-2xl font-bold">{implemented}</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Potential Savings</p>
                <p className="text-2xl font-bold">{formatCurrency(potentialSavings)}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-50">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
      <SnowCard>
        <SnowCardContent className="p-6">
          <div className="flex items-center space-x-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="revenue">Revenue</option>
              <option value="efficiency">Efficiency</option>
              <option value="safety">Safety</option>
              <option value="maintenance">Maintenance</option>
              <option value="route">Route</option>
              <option value="fleet">Fleet</option>
              <option value="customer">Customer</option>
            </select>
          </div>
        </SnowCardContent>
      </SnowCard>
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle>AI Recommendations</SnowCardTitle>
          <SnowCardDescription>
            AI-generated recommendations for business optimization
          </SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          {filteredRecommendations.length > 0 ? (
            <SnowTable>
              <SnowTableHeader>
                <SnowTableHead>Recommendation</SnowTableHead>
                <SnowTableHead>Category</SnowTableHead>
                <SnowTableHead>Priority</SnowTableHead>
                <SnowTableHead>Status</SnowTableHead>
                <SnowTableHead>Estimated Savings</SnowTableHead>
                <SnowTableHead>Confidence</SnowTableHead>
                <SnowTableHead>Generated</SnowTableHead>
                <SnowTableHead>Actions</SnowTableHead>
              </SnowTableHeader>
              <SnowTableBody>
                {filteredRecommendations.map((recommendation) => (
                  <SnowTableRow key={recommendation._id || recommendation.id}>
                    <SnowTableCell>
                      <div>
                        <p className="font-medium">{recommendation.title || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">
                          {recommendation.description || 'N/A'}
                        </p>
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(recommendation.category)}
                        <span className="text-sm">{recommendation.category || 'N/A'}</span>
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <Badge className={`${getPriorityColor(recommendation.priority)} ${getPriorityText(recommendation.priority)}`}>
                        {recommendation.priority?.toUpperCase() || 'N/A'}
                      </Badge>
                    </SnowTableCell>
                    <SnowTableCell>
                      <Badge className={recommendation.status === 'implemented' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {recommendation.status?.toUpperCase() || 'PENDING'}
                      </Badge>
                    </SnowTableCell>
                    <SnowTableCell>
                      <span className="font-medium">{formatCurrency(recommendation.estimatedSavings || 0)}</span>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm">{recommendation.confidence || 0}%</span>
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <span className="text-sm">{formatDate(recommendation.generatedAt)}</span>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="flex items-center space-x-2">
                        <SnowButton 
                          icon={<CheckCircle className="h-4 w-4" />} 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleApproveRecommendation(recommendation)}
                        />
                        <SnowButton 
                          icon={<Clock className="h-4 w-4" />} 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleScheduleRecommendation(recommendation)}
                        />
                        <SnowButton 
                          icon={<Target className="h-4 w-4" />} 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleTargetRecommendation(recommendation)}
                        />
                      </div>
                    </SnowTableCell>
                  </SnowTableRow>
                ))}
              </SnowTableBody>
            </SnowTable>
          ) : (
            <div className="text-center py-12">
              <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No recommendations found</p>
              <p className="text-muted-foreground text-sm">No AI recommendations match your current filters.</p>
            </div>
          )}
        </SnowCardContent>
      </SnowCard>
    </div>
  )
}

