'use client'

import React, { useState, useEffect } from 'react'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { Badge } from '@/components/ui/badge'
import { SnowInput } from '@/components/ui/snow-input'
import { 
  Zap,
  Play,
  Pause,
  StopCircle,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  Mail,
  MessageSquare,
  Calendar,
  Target,
  TrendingUp,
  Activity,
  Settings,
  Workflow,
  ArrowRight,
  UserPlus,
  ShoppingCart,
  Star,
  Heart,
  Share2,
  Download,
  Upload,
  Copy,
  MoreHorizontal
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

export default function MarketingAutomationPage() {
  const [workflows, setWorkflows] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadWorkflowsData()
  }, [])

  const loadWorkflowsData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await apiClient.get<any[]>('/marketing/automation/workflows')
      if (response.success && response.data) {
        setWorkflows(response.data as any[])
      } else {
        setWorkflows([])
        if (!response.success) {
          toast.error('Failed to load automation workflows')
          setError('Failed to load automation workflows')
        }
      }
    } catch (error: any) {
      console.error('Failed to load automation workflows data:', error)
      setWorkflows([])
      setError('Failed to load automation workflows data')
      toast.error('Failed to load automation workflows data')
    } finally {
      setIsLoading(false)
    }
  }

  const formatPercentage = (value: number) => {
    if (!value || isNaN(value)) return '0%'
    return `${value.toFixed(1)}%`
  }

  const formatNumber = (num: number) => {
    if (!num || isNaN(num)) return '0'
    return new Intl.NumberFormat('en-EG').format(num)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'draft': return 'bg-slate-100 text-slate-800 bg-white dark:text-slate-200'
      case 'stopped': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-slate-100 text-slate-800 bg-white dark:text-slate-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="h-4 w-4" />
      case 'paused': return <Pause className="h-4 w-4" />
      case 'draft': return <Clock className="h-4 w-4" />
      case 'stopped': return <StopCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getTriggerIcon = (trigger: string) => {
    switch (trigger) {
      case 'user_signup': return <UserPlus className="h-4 w-4" />
      case 'cart_abandoned': return <ShoppingCart className="h-4 w-4" />
      case 'lead_created': return <Target className="h-4 w-4" />
      case 'inactive_user': return <Users className="h-4 w-4" />
      case 'purchase_completed': return <CheckCircle className="h-4 w-4" />
      default: return <Zap className="h-4 w-4" />
    }
  }

  const getTriggerName = (trigger: string) => {
    switch (trigger) {
      case 'user_signup': return 'User Signup'
      case 'cart_abandoned': return 'Cart Abandoned'
      case 'lead_created': return 'Lead Created'
      case 'inactive_user': return 'Inactive User'
      case 'purchase_completed': return 'Purchase Completed'
      default: return trigger
    }
  }

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = (workflow.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (workflow.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getTriggerName(workflow.trigger || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || workflow.status === filter
    return matchesSearch && matchesFilter
  })

  const totalWorkflows = workflows.length
  const activeWorkflows = workflows.filter(w => w.status === 'active').length
  const totalSubscribers = workflows.reduce((sum, w) => sum + (w.subscribers || 0), 0)
  const avgConversionRate = workflows.length > 0 ? workflows.reduce((sum, w) => sum + (w.conversionRate || 0), 0) / workflows.length : 0

  const handleViewWorkflow = (workflow: any) => {
    toast.info(`Viewing workflow: ${workflow.name || 'Unknown'}`)
  }

  const handleEditWorkflow = (workflow: any) => {
    toast.info(`Editing workflow: ${workflow.name || 'Unknown'}`)
  }

  const handleDeleteWorkflow = (workflow: any) => {
    toast.error(`Deleting workflow: ${workflow.name || 'Unknown'}`)
  }

  const handlePauseWorkflow = (workflow: any) => {
    toast.success(`Paused workflow: ${workflow.name || 'Unknown'}`)
  }

  const handleResumeWorkflow = (workflow: any) => {
    toast.success(`Resumed workflow: ${workflow.name || 'Unknown'}`)
  }

  const handleDuplicateWorkflow = (workflow: any) => {
    toast.success(`Duplicated workflow: ${workflow.name || 'Unknown'}`)
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <SnowCard className="w-full max-w-md">
          <SnowCardHeader>
            <SnowCardTitle className="text-red-600">Error Loading Workflows</SnowCardTitle>
            <SnowCardDescription>{error}</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <SnowButton onClick={loadWorkflowsData} className="w-full">
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
          <p className="text-muted-foreground">Loading workflows...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 text-slate-900">
            Marketing Automation
          </h1>
          <p className="text-slate-600 text-slate-600">
            Create and manage automated marketing workflows
          </p>
        </div>
        <div className="flex gap-2">
          <SnowButton variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </SnowButton>
          <SnowButton>
            <Plus className="h-4 w-4 mr-2" />
            Create Workflow
          </SnowButton>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Workflow className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">Total Workflows</p>
                <p className="text-2xl font-bold">{totalWorkflows}</p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Play className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">Active Workflows</p>
                <p className="text-2xl font-bold">{activeWorkflows}</p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">Total Subscribers</p>
                <p className="text-2xl font-bold">{formatNumber(totalSubscribers)}</p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">Avg Conversion</p>
                <p className="text-2xl font-bold">{formatPercentage(avgConversionRate)}</p>
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
                  placeholder="Search workflows..."
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
                <option value="draft">Draft</option>
                <option value="stopped">Stopped</option>
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
          <SnowCardTitle>Automation Workflows</SnowCardTitle>
          <SnowCardDescription>Manage your automated marketing sequences</SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          <div className="space-y-4">
            {filteredWorkflows.map((workflow) => (
              <div key={workflow.id} className="border rounded-lg p-6 hover:bg-slate-50 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{workflow.name || 'Unknown Workflow'}</h3>
                        <Badge className={getStatusColor(workflow.status)}>
                          {getStatusIcon(workflow.status)}
                          <span className="ml-1">{workflow.status || 'Unknown'}</span>
                        </Badge>
                      </div>
                      <p className="text-slate-600 text-slate-600 mb-3">
                        {workflow.description || 'No description'}
                      </p>
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="flex items-center space-x-1 text-sm text-slate-500">
                          {getTriggerIcon(workflow.trigger)}
                          <span>Trigger: {getTriggerName(workflow.trigger)}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mb-4">
                        <span className="text-sm font-medium text-slate-600">Steps:</span>
                        <div className="flex items-center space-x-1">
                          {workflow.steps?.map((step: any, index: number) => (
                            <div key={step.id} className="flex items-center">
                              <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-xs">
                                {index + 1}
                              </div>
                              {index < workflow.steps.length - 1 && (
                                <ArrowRight className="h-3 w-3 text-slate-400 mx-1" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="font-medium">{formatNumber(workflow.subscribers || 0)}</p>
                          <p className="text-slate-500">Subscribers</p>
                        </div>
                        <div>
                          <p className="font-medium">{formatNumber(workflow.sent || 0)}</p>
                          <p className="text-slate-500">Sent</p>
                        </div>
                        <div>
                          <p className="font-medium">{formatNumber(workflow.opened || 0)}</p>
                          <p className="text-slate-500">Opened</p>
                        </div>
                        <div>
                          <p className="font-medium">{formatPercentage(workflow.conversionRate || 0)}</p>
                          <p className="text-slate-500">Conversion</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <SnowButton
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewWorkflow(workflow)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </SnowButton>
                    {workflow.status === 'active' && (
                      <SnowButton
                        size="sm"
                        variant="outline"
                        onClick={() => handlePauseWorkflow(workflow)}
                      >
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </SnowButton>
                    )}
                    {workflow.status === 'paused' && (
                      <SnowButton
                        size="sm"
                        variant="outline"
                        onClick={() => handleResumeWorkflow(workflow)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Resume
                      </SnowButton>
                    )}
                    <SnowButton
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditWorkflow(workflow)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </SnowButton>
                    <SnowButton
                      size="sm"
                      variant="outline"
                      onClick={() => handleDuplicateWorkflow(workflow)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </SnowButton>
                    <SnowButton
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteWorkflow(workflow)}
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



