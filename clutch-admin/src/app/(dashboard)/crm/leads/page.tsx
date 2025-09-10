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
  Phone,
  Mail,
  MapPin,
  Building,
  Activity
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

export default function CRMLeadsPage() {
  const [leads, setLeads] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    loadLeadsData()
  }, [])

  const loadLeadsData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Load leads data from CRM leads endpoint
      const response = await apiClient.get<any[]>('/crm/leads')
      if (response.success) {
        setLeads(response.data || [])
      } else {
        setLeads([])
        setError('Failed to load leads data')
        toast.error('Failed to load leads data')
      }
    } catch (error: any) {
      console.error('Failed to load leads data:', error)
      setLeads([])
      setError('Failed to load leads data')
      toast.error('Failed to load leads data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewLead = async (lead: any) => {
    try {
      const response = await apiClient.get(`/crm/leads/${lead._id || lead.id}`)
      if (response.success) {
        setSelectedLead(response.data)
        setShowViewModal(true)
      } else {
        toast.error('Failed to load lead details')
      }
    } catch (error) {
      console.error('Failed to load lead details:', error)
      toast.error('Failed to load lead details')
    }
  }

  const handleEditLead = async (lead: any) => {
    try {
      const response = await apiClient.get(`/crm/leads/${lead._id || lead.id}`)
      if (response.success) {
        setSelectedLead(response.data)
        setShowEditModal(true)
      } else {
        toast.error('Failed to load lead for editing')
      }
    } catch (error) {
      console.error('Failed to load lead for editing:', error)
      toast.error('Failed to load lead for editing')
    }
  }

  const handleMoreActions = (lead: any) => {
    // Implement dropdown menu or additional actions
    toast.info(`More actions for lead: ${lead.name}`)
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
      case 'new':
        return 'bg-blue-500'
      case 'contacted':
        return 'bg-yellow-500'
      case 'qualified':
        return 'bg-orange-500'
      case 'converted':
        return 'bg-green-500'
      case 'lost':
        return 'bg-red-500'
      default:
        return 'bg-slate-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new':
        return 'text-blue-400'
      case 'contacted':
        return 'text-yellow-400'
      case 'qualified':
        return 'text-orange-400'
      case 'converted':
        return 'text-green-400'
      case 'lost':
        return 'text-red-400'
      default:
        return 'text-slate-400'
    }
  }

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || lead.status === filter
    return matchesSearch && matchesFilter
  })

  // Calculate metrics
  const totalLeads = leads.length
  const totalValue = leads.reduce((sum, lead) => sum + (lead.potentialValue || 0), 0)
  const convertedLeads = leads.filter(lead => lead.status === 'converted').length
  const qualifiedLeads = leads.filter(lead => lead.status === 'qualified').length
  const avgLeadValue = totalLeads > 0 ? totalValue / totalLeads : 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>Loading leads data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <SnowButton onClick={loadLeadsData}>Retry</SnowButton>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads Management</h1>
          <p className="text-muted-foreground">
            Track and manage your sales leads
          </p>
        </div>
        <SnowButton>
          <Plus className="mr-2 h-4 w-4" />
          Add Lead
        </SnowButton>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold">{totalLeads}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <Users className="h-6 w-6 text-blue-600" />
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
                <p className="text-sm font-medium text-muted-foreground">Converted</p>
                <p className="text-2xl font-bold">{convertedLeads}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Avg Lead Value</p>
                <p className="text-2xl font-bold">{formatCurrency(avgLeadValue)}</p>
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
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>
          </div>
        </SnowCardContent>
      </SnowCard>
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle>Leads Overview</SnowCardTitle>
          <SnowCardDescription>
            All leads in your CRM system
          </SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          {filteredLeads.length > 0 ? (
            <SnowTable>
              <SnowTableHeader>
                <SnowTableHead>Lead</SnowTableHead>
                <SnowTableHead>Company</SnowTableHead>
                <SnowTableHead>Contact</SnowTableHead>
                <SnowTableHead>Status</SnowTableHead>
                <SnowTableHead>Potential Value</SnowTableHead>
                <SnowTableHead>Source</SnowTableHead>
                <SnowTableHead>Created</SnowTableHead>
                <SnowTableHead>Actions</SnowTableHead>
              </SnowTableHeader>
              <SnowTableBody>
                {filteredLeads.map((lead) => (
                  <SnowTableRow key={lead._id || lead.id}>
                    <SnowTableCell>
                      <div>
                        <p className="font-medium">{lead.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {lead.position || 'N/A'}
                        </p>
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div>
                        <p className="font-medium">{lead.company || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">
                          {lead.industry || 'N/A'}
                        </p>
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div>
                        <p className="text-sm">{lead.email || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">
                          {lead.phone || 'N/A'}
                        </p>
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <Badge className={`${getStatusColor(lead.status)} ${getStatusText(lead.status)}`}>
                        {lead.status?.toUpperCase() || 'N/A'}
                      </Badge>
                    </SnowTableCell>
                    <SnowTableCell>
                      <span className="font-medium">{formatCurrency(lead.potentialValue || 0)}</span>
                    </SnowTableCell>
                    <SnowTableCell>
                      <span className="text-sm">{lead.source || 'N/A'}</span>
                    </SnowTableCell>
                    <SnowTableCell>
                      <span className="text-sm">{formatDate(lead.createdAt)}</span>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="flex items-center space-x-2">
                        <SnowButton 
                          icon={<Eye className="h-4 w-4" />} 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleViewLead(lead)}
                        />
                        <SnowButton 
                          icon={<Edit className="h-4 w-4" />} 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleEditLead(lead)}
                        />
                        <SnowButton 
                          icon={<MoreHorizontal className="h-4 w-4" />} 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleMoreActions(lead)}
                        />
                      </div>
                    </SnowTableCell>
                  </SnowTableRow>
                ))}
              </SnowTableBody>
            </SnowTable>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No leads match your current filters.</p>
            </div>
          )}
        </SnowCardContent>
      </SnowCard>
    </div>
  )
}

