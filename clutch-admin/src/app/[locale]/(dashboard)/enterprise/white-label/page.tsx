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
  Activity,
  Building,
  Settings,
  Globe
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

export default function EnterpriseWhiteLabelPage() {
  const [whiteLabelData, setWhiteLabelData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadWhiteLabelData()
  }, [])

  const loadWhiteLabelData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await apiClient.get<any[]>('/enterprise/white-label')
      if (response.success) {
        setWhiteLabelData(response.data || [])
      } else {
        setWhiteLabelData([])
        setError('Failed to load white-label data')
        toast.error('Failed to load white-label data')
      }
    } catch (error: any) {
      console.error('Failed to load white-label data:', error)
      setWhiteLabelData([])
      setError('Failed to load white-label data')
      toast.error('Failed to load white-label data')
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500'
      case 'inactive':
        return 'bg-red-500'
      case 'pending':
        return 'bg-yellow-500'
      case 'expired':
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
      case 'pending':
        return 'text-yellow-400'
      case 'expired':
        return 'text-red-400'
      default:
        return 'text-slate-400'
    }
  }

  const getPlanTypeIcon = (type: string) => {
    switch (type) {
      case 'premium':
        return <Target className="h-4 w-4" />
      case 'enterprise':
        return <Building className="h-4 w-4" />
      case 'custom':
        return <Settings className="h-4 w-4" />
      default:
        return <Globe className="h-4 w-4" />
    }
  }

  const filteredWhiteLabels = whiteLabelData.filter(whiteLabel => {
    const matchesSearch = whiteLabel.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         whiteLabel.domain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         whiteLabel.planType?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || whiteLabel.status === filter
    return matchesSearch && matchesFilter
  })

  // Calculate metrics
  const totalClients = whiteLabelData.length
  const activeClients = whiteLabelData.filter(client => client.status === 'active').length
  const totalRevenue = whiteLabelData.reduce((sum, client) => sum + (client.monthlyRevenue || 0), 0)
  const avgMonthlyRevenue = totalClients > 0 ? totalRevenue / totalClients : 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>Loading white-label data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <SnowButton onClick={loadWhiteLabelData}>Retry</SnowButton>
        </div>
      </div>
    )
  }

  const handleDeleteWhiteLabel = async (whiteLabel: any) => {
    if (confirm(`Are you sure you want to delete the white-label "${whiteLabel.name}"?`)) {
      try {
        const response = await apiClient.delete(`/enterprise/white-label/${whiteLabel.id}`)
        if (response.success) {
          toast.success('White-label deleted successfully')
          loadWhiteLabelData()
        } else {
          toast.error(response.message || 'Failed to delete white-label')
        }
      } catch (error) {
        console.error('Failed to delete white-label:', error)
        toast.error('Failed to delete white-label')
      }
    }
  }

  const handleViewWhiteLabel = (whiteLabel: any) => {
    // Handle view white-label action
    console.log('View white-label:', whiteLabel)
  }

  const handleEditWhiteLabel = (whiteLabel: any) => {
    // Handle edit white-label action
    console.log('Edit white-label:', whiteLabel)
  }

  const handleConfigureWhiteLabel = (whiteLabel: any) => {
    // Handle configure white-label action
    console.log('Configure white-label:', whiteLabel)
  }

  const handleMoreActions = (whiteLabel: any) => {
    // Handle more actions for white-label
    console.log('More actions for white-label:', whiteLabel)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">White-Label Management</h1>
          <p className="text-muted-foreground">
            Manage white-label client configurations
          </p>
        </div>
        <SnowButton>
          <Plus className="mr-2 h-4 w-4" />
          Add Client
        </SnowButton>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Clients</p>
                <p className="text-2xl font-bold">{totalClients}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Clients</p>
                <p className="text-2xl font-bold">{activeClients}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Monthly</p>
                <p className="text-2xl font-bold">{formatCurrency(avgMonthlyRevenue)}</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-50">
                <PoundSterling className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
      <SnowCard>
        <SnowCardContent className="p-6">
          <div className="flex items-center space-x-4">
            <SnowSearchInput
              placeholder="Search clients..."
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
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </SnowCardContent>
      </SnowCard>
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle>White-Label Clients</SnowCardTitle>
          <SnowCardDescription>
            All white-label client configurations
          </SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          {filteredWhiteLabels.length > 0 ? (
            <SnowTable>
              <SnowTableHeader>
                <SnowTableHead>Client Name</SnowTableHead>
                <SnowTableHead>Domain</SnowTableHead>
                <SnowTableHead>Plan Type</SnowTableHead>
                <SnowTableHead>Status</SnowTableHead>
                <SnowTableHead>Monthly Revenue</SnowTableHead>
                <SnowTableHead>Expiry Date</SnowTableHead>
                <SnowTableHead>Actions</SnowTableHead>
              </SnowTableHeader>
              <SnowTableBody>
                {filteredWhiteLabels.map((whiteLabel) => (
                  <SnowTableRow key={whiteLabel._id || whiteLabel.id}>
                    <SnowTableCell>
                      <div>
                        <p className="font-medium">{whiteLabel.clientName || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">
                          {whiteLabel.contactEmail || 'N/A'}
                        </p>
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <span className="font-medium">{whiteLabel.domain || 'N/A'}</span>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="flex items-center space-x-2">
                        {getPlanTypeIcon(whiteLabel.planType)}
                        <span className="capitalize">{whiteLabel.planType || 'N/A'}</span>
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <Badge className={`${getStatusColor(whiteLabel.status)} ${getStatusText(whiteLabel.status)}`}>
                        {whiteLabel.status?.toUpperCase() || 'N/A'}
                      </Badge>
                    </SnowTableCell>
                    <SnowTableCell>
                      <span className="font-medium">{formatCurrency(whiteLabel.monthlyRevenue || 0)}</span>
                    </SnowTableCell>
                    <SnowTableCell>
                      <span className="text-sm">{formatDate(whiteLabel.expiryDate)}</span>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="flex items-center space-x-2">
                        <SnowButton 
                          icon={<Eye className="h-4 w-4" />} 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleViewWhiteLabel(whiteLabel)}
                        />
                        <SnowButton 
                          icon={<Edit className="h-4 w-4" />} 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleEditWhiteLabel(whiteLabel)}
                        />
                        <SnowButton 
                          icon={<Settings className="h-4 w-4" />} 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleConfigureWhiteLabel(whiteLabel)}
                        />
                        <SnowButton 
                          icon={<MoreHorizontal className="h-4 w-4" />} 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleMoreActions(whiteLabel)}
                        />
                      </div>
                    </SnowTableCell>
                  </SnowTableRow>
                ))}
              </SnowTableBody>
            </SnowTable>
          ) : (
            <div className="text-center py-12">
              <Building className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No white-label clients found</p>
              <p className="text-sm text-muted-foreground">No white-label clients match your current filters.</p>
            </div>
          )}
        </SnowCardContent>
      </SnowCard>
    </div>
  )
}

