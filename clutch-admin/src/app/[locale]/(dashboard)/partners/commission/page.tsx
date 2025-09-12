'use client'

import React, { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'
import { SnowCard, SnowCardHeader, SnowCardContent, SnowCardTitle, SnowCardDescription } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowInput, SnowSearchInput } from '@/components/ui/snow-input'
import { SnowTable, SnowTableHeader, SnowTableBody, SnowTableRow, SnowTableCell, SnowTableHead, SnowTableFooter, SnowTableCaption } from '@/components/ui/snow-table'
import { Badge } from '@/components/ui/badge'
import { 
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
  Handshake,
  Percent,
  Calculator,
  Receipt,
  PoundSterling
} from 'lucide-react'

export default function PartnersCommissionPage() {
  const [commissions, setCommissions] = useState<any[]>([])
  const [partners, setPartners] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)
  const [selectedCommission, setSelectedCommission] = useState<any>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [commissionsResponse, partnersResponse] = await Promise.all([
        apiClient.get('/partners/commissions'),
        apiClient.get('/partners')
      ])
      
      if (commissionsResponse.success && commissionsResponse.data) {
        setCommissions(commissionsResponse.data as any[])
      } else {
        setCommissions([])
      }
      
      if (partnersResponse.success && partnersResponse.data) {
        setPartners(partnersResponse.data as any[])
      } else {
        setPartners([])
      }
    } catch (error: any) {
      console.error('Failed to load commission data:', error)
      setError('Failed to load commission data')
      setCommissions([])
      setPartners([])
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500'
      case 'pending': return 'bg-yellow-500'
      case 'processing': return 'bg-blue-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-slate-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Paid'
      case 'pending': return 'Pending'
      case 'processing': return 'Processing'
      case 'cancelled': return 'Cancelled'
      default: return 'Unknown'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'processing': return <Activity className="h-4 w-4" />
      case 'cancelled': return <X className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const filteredCommissions = commissions.filter(commission => {
    const matchesSearch = commission.partnerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         commission.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         commission.status?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || commission.status === filter
    return matchesSearch && matchesFilter
  })

  // Calculate metrics
  const totalCommissions = commissions.length
  const paidCommissions = commissions.filter(c => c.status === 'paid').length
  const pendingCommissions = commissions.filter(c => c.status === 'pending').length
  const totalAmount = commissions.reduce((sum, c) => sum + (c.commissionAmount || 0), 0)
  const avgCommissionRate = commissions.length > 0 
    ? commissions.reduce((sum, c) => sum + (c.commissionRate || 0), 0) / commissions.length 
    : 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const handleViewCommission = (commission: any) => {
    setSelectedCommission(commission)
    setShowViewModal(true)
  }

  const handleEditCommission = (commission: any) => {
    setSelectedCommission(commission)
    setShowEditModal(true)
  }

  const handleGenerateInvoice = async (commission: any) => {
    try {
      const response = await apiClient.post(`/partners/commission/${commission.id}/invoice`, {})
      if (response.success) {
        toast.success('Invoice generated successfully')
      } else {
        toast.error('Failed to generate invoice')
      }
    } catch (error: any) {
      console.error('Failed to generate invoice:', error)
      toast.error('Failed to generate invoice')
    }
  }

  const handleDeleteCommission = async (commission: any) => {
    if (confirm('Are you sure you want to delete this commission?')) {
      try {
        const response = await apiClient.delete(`/partners/commission/${commission.id}`)
        if (response.success) {
          toast.success('Commission deleted successfully')
          loadData()
        } else {
          toast.error('Failed to delete commission')
        }
      } catch (error: any) {
        console.error('Failed to delete commission:', error)
        toast.error('Failed to delete commission')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-300">PARTNERS SYSTEM ACTIVE</span>
                  </div>
                  <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                  Partner Commissions
                </h1>
                <p className="text-emerald-100 max-w-2xl">
                  Manage and track partner commission payments
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <SnowButton variant="outline" className="bg-emerald-500/20 border-emerald-400/30 text-white hover:bg-emerald-500/30">
                  <Handshake className="h-4 w-4 mr-2" />
                  Partners Dashboard
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
                  Partner Commissions
                </h1>
                <p className="text-red-100 max-w-2xl">
                  Unable to load commission data. Please try again.
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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-300">PARTNERS SYSTEM ACTIVE</span>
                </div>
                <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                Partner Commissions
              </h1>
              <p className="text-emerald-100 max-w-2xl">
                Manage and track partner commission payments and performance
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <SnowButton variant="outline" className="bg-emerald-500/20 border-emerald-400/30 text-white hover:bg-emerald-500/30">
                <Handshake className="h-4 w-4 mr-2" />
                Partners Dashboard
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
                <p className="text-sm font-medium text-emerald-300">Total Commissions</p>
                <p className="text-2xl font-bold text-white">{totalCommissions}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-400" />
                  <p className="text-xs text-emerald-200">+{paidCommissions} paid</p>
                </div>
              </div>
              <div className="p-3 bg-emerald-500/20 rounded-lg">
                <PoundSterling className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard variant="dark">
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-300">Paid Commissions</p>
                <p className="text-2xl font-bold text-white">{paidCommissions}</p>
                <p className="text-xs text-green-200">Successfully processed</p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard variant="dark">
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-300">Total Amount</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(totalAmount)}</p>
                <p className="text-xs text-blue-200">Commission value</p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Calculator className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard variant="dark">
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-300">Avg Commission Rate</p>
                <p className="text-2xl font-bold text-white">{avgCommissionRate.toFixed(1)}%</p>
                <p className="text-xs text-purple-200">Partner agreements</p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Percent className="h-6 w-6 text-purple-400" />
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
                placeholder="Search commissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onSearch={() => {}}
              />
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="cancelled">Cancelled</option>
              </select>
                              <SnowButton variant="default">
                <Plus className="h-4 w-4 mr-2" />
                Add Commission
              </SnowButton>
            </div>
          </div>
        </SnowCardContent>
      </SnowCard>
      <SnowCard variant="dark">
        <SnowCardHeader>
          <SnowCardTitle icon={<PoundSterling className="h-5 w-5" />}>
            Partner Commissions
          </SnowCardTitle>
          <SnowCardDescription>
            Manage and track all partner commission payments and performance
          </SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          {filteredCommissions.length > 0 ? (
            <SnowTable>
              <SnowTableHeader>
                <tr>
                  <SnowTableHead>Partner</SnowTableHead>
                  <SnowTableHead>Invoice</SnowTableHead>
                  <SnowTableHead>Amount</SnowTableHead>
                  <SnowTableHead>Commission</SnowTableHead>
                  <SnowTableHead>Rate</SnowTableHead>
                  <SnowTableHead>Status</SnowTableHead>
                  <SnowTableHead>Due Date</SnowTableHead>
                  <SnowTableHead align="center">Actions</SnowTableHead>
                </tr>
              </SnowTableHeader>
              <SnowTableBody>
                {filteredCommissions.map((commission) => (
                                     <SnowTableRow key={commission.id}>
                    <SnowTableCell>
                      <div>
                        <div className="font-medium text-white">{commission.partnerName}</div>
                        <div className="text-sm text-slate-400">{commission.partnerId}</div>
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="text-white">{commission.invoiceNumber}</div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="text-white">{formatCurrency(commission.amount)}</div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="text-white font-medium">{formatCurrency(commission.commissionAmount)}</div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="text-white">{commission.commissionRate}%</div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="flex items-center space-x-2">
                        <div className={`p-1 rounded-full ${getStatusColor(commission.status)}`}>
                          {getStatusIcon(commission.status)}
                        </div>
                        <span className="text-white">{getStatusText(commission.status)}</span>
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="text-white">{commission.dueDate}</div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="flex items-center space-x-2">
                        <SnowButton
                          icon={<Eye className="h-4 w-4" />}
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewCommission(commission)}
                        />
                        <SnowButton
                          icon={<Edit className="h-4 w-4" />}
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCommission(commission)}
                        />
                        <SnowButton
                          icon={<Receipt className="h-4 w-4" />}
                          variant="outline"
                          size="sm"
                          onClick={() => handleGenerateInvoice(commission)}
                        />
                        <SnowButton
                          icon={<Trash2 className="h-4 w-4" />}
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCommission(commission)}
                        />
                      </div>
                    </SnowTableCell>
                  </SnowTableRow>
                ))}
              </SnowTableBody>
            </SnowTable>
          ) : (
            <div className="text-center py-12">
              <PoundSterling className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-300 mb-2">No Commissions Found</h3>
              <p className="text-slate-400 mb-4">No commissions match your current search criteria. Try adjusting your filters or add a new commission.</p>
                             <SnowButton variant="default">
                 <Plus className="h-4 w-4 mr-2" />
                 Add Commission
               </SnowButton>
            </div>
          )}
        </SnowCardContent>
      </SnowCard>
    </div>
  )
}

