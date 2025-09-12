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
  Handshake,
  Building,
  Phone,
  Mail,
  MapPin,
  Activity
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

export default function CRMDealsPage() {
  const [deals, setDeals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDealsData()
  }, [])

  const loadDealsData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await apiClient.get<any[]>('/crm/deals')
      if (response.success) {
        setDeals(response.data || [])
      } else {
        setDeals([])
        setError('Failed to load deals data')
        toast.error('Failed to load deals data')
      }
    } catch (error: any) {
      console.error('Failed to load deals data:', error)
      setDeals([])
      setError('Failed to load deals data')
      toast.error('Failed to load deals data')
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

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'lead':
        return 'bg-blue-500'
      case 'qualified':
        return 'bg-yellow-500'
      case 'proposal':
        return 'bg-orange-500'
      case 'negotiation':
        return 'bg-purple-500'
      case 'closed_won':
        return 'bg-green-500'
      case 'closed_lost':
        return 'bg-red-500'
      default:
        return 'bg-slate-500'
    }
  }

  const getStageText = (stage: string) => {
    switch (stage) {
      case 'lead':
        return 'text-blue-400'
      case 'qualified':
        return 'text-yellow-400'
      case 'proposal':
        return 'text-orange-400'
      case 'negotiation':
        return 'text-purple-400'
      case 'closed_won':
        return 'text-green-400'
      case 'closed_lost':
        return 'text-red-400'
      default:
        return 'text-slate-400'
    }
  }

  const handleDeleteDeal = async (deal: any) => {
    if (confirm(`Are you sure you want to delete the deal "${deal.title}"?`)) {
      try {
        const response = await apiClient.delete(`/crm/deals/${deal.id}`)
        if (response.success) {
          toast.success('Deal deleted successfully')
          loadDealsData()
        } else {
          toast.error(response.message || 'Failed to delete deal')
        }
      } catch (error) {
        console.error('Failed to delete deal:', error)
        toast.error('Failed to delete deal')
      }
    }
  }

  const handleViewDeal = (deal: any) => {
    // Handle view deal action
    console.log('View deal:', deal)
  }

  const handleEditDeal = (deal: any) => {
    // Handle edit deal action
    console.log('Edit deal:', deal)
  }

  const handleMoreActions = (deal: any) => {
    // Handle more actions
    console.log('More actions for deal:', deal)
  }

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.customer?.company?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || deal.stage === filter
    return matchesSearch && matchesFilter
  })

  // Calculate metrics
  const totalDeals = deals.length
  const totalValue = deals.reduce((sum, deal) => sum + (deal.amount || 0), 0)
  const wonDeals = deals.filter(deal => deal.stage === 'closed_won').length
  const avgDealValue = totalDeals > 0 ? totalValue / totalDeals : 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>Loading deals data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <SnowButton onClick={loadDealsData}>Retry</SnowButton>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deals Management</h1>
          <p className="text-muted-foreground">
            Track and manage your sales deals
          </p>
        </div>
        <SnowButton>
          <Plus className="mr-2 h-4 w-4" />
          Add Deal
        </SnowButton>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Deals</p>
                <p className="text-2xl font-bold">{totalDeals}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-50">
                <PoundSterling className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Won Deals</p>
                <p className="text-2xl font-bold">{wonDeals}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Avg Deal Value</p>
                <p className="text-2xl font-bold">{formatCurrency(avgDealValue)}</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
      <SnowCard>
        <SnowCardContent className="p-6">
          <div className="flex items-center space-x-4">
            <SnowSearchInput
              placeholder="Search deals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Stages</option>
              <option value="lead">Lead</option>
              <option value="qualified">Qualified</option>
              <option value="proposal">Proposal</option>
              <option value="negotiation">Negotiation</option>
              <option value="closed_won">Closed Won</option>
              <option value="closed_lost">Closed Lost</option>
            </select>
          </div>
        </SnowCardContent>
      </SnowCard>
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle>Deals Overview</SnowCardTitle>
          <SnowCardDescription>
            All deals in your CRM system
          </SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          {filteredDeals.length > 0 ? (
            <SnowTable>
              <SnowTableHeader>
                <SnowTableHead>Deal</SnowTableHead>
                <SnowTableHead>Customer</SnowTableHead>
                <SnowTableHead>Amount</SnowTableHead>
                <SnowTableHead>Stage</SnowTableHead>
                <SnowTableHead>Probability</SnowTableHead>
                <SnowTableHead>Expected Close</SnowTableHead>
                <SnowTableHead>Actions</SnowTableHead>
              </SnowTableHeader>
              <SnowTableBody>
                {filteredDeals.map((deal) => (
                  <SnowTableRow key={deal._id || deal.id}>
                    <SnowTableCell>
                      <div>
                        <p className="font-medium">{deal.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Created {formatDate(deal.createdAt)}
                        </p>
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div>
                        <p className="font-medium">{deal.customer?.name || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">
                          {deal.customer?.company || 'N/A'}
                        </p>
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <span className="font-medium">{formatCurrency(deal.amount || 0)}</span>
                    </SnowTableCell>
                    <SnowTableCell>
                      <Badge className={`${getStageColor(deal.stage)} ${getStageText(deal.stage)}`}>
                        {deal.stage?.replace('_', ' ').toUpperCase() || 'N/A'}
                      </Badge>
                    </SnowTableCell>
                    <SnowTableCell>
                      <span className="font-medium">{deal.probability || 0}%</span>
                    </SnowTableCell>
                    <SnowTableCell>
                      <span className="text-sm">{formatDate(deal.expectedCloseDate)}</span>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="flex items-center space-x-2">
                        <SnowButton 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleViewDeal(deal)}
                        >
                          <Eye className="h-4 w-4" />
                        </SnowButton>
                        <SnowButton 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEditDeal(deal)}
                        >
                          <Edit className="h-4 w-4" />
                        </SnowButton>
                        <SnowButton 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleMoreActions(deal)}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </SnowButton>
                      </div>
                    </SnowTableCell>
                  </SnowTableRow>
                ))}
              </SnowTableBody>
            </SnowTable>
          ) : (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No deals match your current filters.</p>
            </div>
          )}
        </SnowCardContent>
      </SnowCard>
    </div>
  )
}

