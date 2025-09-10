'use client'

import React, { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'
import { handleApiError, logError } from '@/utils/errorHandler'
import { validateArrayResponse } from '@/utils/dataValidator'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowInput } from '@/components/ui/snow-input'
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
  Megaphone,
  Activity,
  Play,
  Pause,
  Mail,
  Share2,
  FileText
} from 'lucide-react'

export default function MarketingCampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCampaigns()
  }, [])

  const loadCampaigns = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.get('/marketing/campaigns')
      const validation = validateArrayResponse(response, [])
      
      if (validation.isValid) {
        setCampaigns(validation.data || [])
      } else {
        setCampaigns([])
        const errorMessage = handleApiError(new Error(validation.error || 'Failed to load campaigns'), 'load campaigns')
        setError(errorMessage)
        toast.error(errorMessage)
        logError(new Error(validation.error), 'loadCampaigns', { response })
      }
    } catch (error: any) {
      const errorMessage = handleApiError(error, 'load campaigns')
      setError(errorMessage)
      setCampaigns([])
      logError(error, 'loadCampaigns')
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'draft': return 'bg-slate-100 text-slate-800 bg-white dark:text-slate-200'
      default: return 'bg-slate-100 text-slate-800 bg-white dark:text-slate-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="h-4 w-4" />
      case 'paused': return <Pause className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'draft': return <Clock className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />
      case 'social': return <Share2 className="h-4 w-4" />
      case 'ppc': return <PoundSterling className="h-4 w-4" />
      case 'content': return <FileText className="h-4 w-4" />
      default: return <Megaphone className="h-4 w-4" />
    }
  }

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = (campaign.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (campaign.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (campaign.targetAudience || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || campaign.status === filter
    return matchesSearch && matchesFilter
  })

  const totalBudget = campaigns.reduce((sum, campaign) => sum + (campaign.budget || 0), 0)
  const totalSpent = campaigns.reduce((sum, campaign) => sum + (campaign.spent || 0), 0)
  const activeCampaigns = campaigns.filter(campaign => campaign.status === 'active').length
  const avgROI = campaigns.length > 0 ? campaigns.reduce((sum, campaign) => sum + (campaign.roi || 0), 0) / campaigns.length : 0

  const handleViewCampaign = (campaign: any) => {
    toast.info(`Viewing campaign: ${campaign.name || 'Unknown'}`)
  }

  const handleEditCampaign = (campaign: any) => {
    toast.info(`Editing campaign: ${campaign.name || 'Unknown'}`)
  }

  const handleDeleteCampaign = (campaign: any) => {
    toast.error(`Deleting campaign: ${campaign.name || 'Unknown'}`)
  }

  const handlePauseCampaign = (campaign: any) => {
    toast.success(`Paused campaign: ${campaign.name || 'Unknown'}`)
  }

  const handleResumeCampaign = (campaign: any) => {
    toast.success(`Resumed campaign: ${campaign.name || 'Unknown'}`)
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <SnowCard className="w-full max-w-md">
          <SnowCardHeader>
            <SnowCardTitle className="text-red-600">Error Loading Campaigns</SnowCardTitle>
            <SnowCardDescription>{error}</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <SnowButton onClick={loadCampaigns} className="w-full">
              Retry
            </SnowButton>
          </SnowCardContent>
        </SnowCard>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading campaigns...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 text-slate-900">
            Marketing Campaigns
          </h1>
          <p className="text-slate-600 text-slate-600">
            Manage and track your marketing campaigns
          </p>
        </div>
        <div className="flex gap-2">
          <SnowButton variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Export
          </SnowButton>
          <SnowButton>
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </SnowButton>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-3 rounded-lg bg-green-50">
                <PoundSterling className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Total Budget</p>
                <p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">Total Spent</p>
                <p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Play className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">Active Campaigns</p>
                <p className="text-2xl font-bold">{activeCampaigns}</p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">Avg ROI</p>
                <p className="text-2xl font-bold">{avgROI.toFixed(1)}%</p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
      <SnowCard>
        <SnowCardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <SnowInput
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="draft">Draft</option>
              </select>
              <SnowButton variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </SnowButton>
            </div>
          </div>
        </SnowCardContent>
      </SnowCard>
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle>Campaigns</SnowCardTitle>
          <SnowCardDescription>Manage and monitor your marketing campaigns</SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          <div className="space-y-4">
            {filteredCampaigns.map((campaign) => (
              <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    {getTypeIcon(campaign.type)}
                  </div>
                  <div>
                    <p className="font-medium">{campaign.name || 'Unknown Campaign'}</p>
                    <p className="text-sm text-slate-500">{campaign.description || 'No description'}</p>
                    <p className="text-xs text-slate-400">Target: {campaign.targetAudience || 'General'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(campaign.spent || 0)} / {formatCurrency(campaign.budget || 0)}</p>
                    <p className="text-sm text-slate-500">{campaign.impressions?.toLocaleString() || 0} impressions</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-medium">{campaign.ctr?.toFixed(2) || 0}% CTR</p>
                    <p className="text-sm text-slate-500">{campaign.conversions || 0} conversions</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-medium">{campaign.roi?.toFixed(1) || 0}% ROI</p>
                    <p className="text-sm text-slate-500">{formatCurrency(campaign.cpa || 0)} CPA</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(campaign.status)}>
                      {getStatusIcon(campaign.status)}
                      <span className="ml-1">{campaign.status || 'Unknown'}</span>
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <SnowButton
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewCampaign(campaign)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </SnowButton>
                    {campaign.status === 'active' && (
                      <SnowButton
                        size="sm"
                        variant="outline"
                        onClick={() => handlePauseCampaign(campaign)}
                      >
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </SnowButton>
                    )}
                    {campaign.status === 'paused' && (
                      <SnowButton
                        size="sm"
                        variant="outline"
                        onClick={() => handleResumeCampaign(campaign)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Resume
                      </SnowButton>
                    )}
                    <SnowButton
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditCampaign(campaign)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </SnowButton>
                    <SnowButton
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteCampaign(campaign)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </SnowButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SnowCardContent>
      </SnowCard>
    </div>
  )
}



