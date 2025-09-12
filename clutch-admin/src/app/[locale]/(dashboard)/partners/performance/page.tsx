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
  Trophy,
  Star,
  Medal,
  Crown,
  Flag,
  Rocket
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function PartnersPerformancePage() {
  const [partners, setPartners] = useState<any[]>([])
  const [performance, setPerformance] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)
  const [selectedPartner, setSelectedPartner] = useState<any>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [partnersResponse, performanceResponse] = await Promise.all([
        apiClient.get('/partners'),
        apiClient.get('/partners/performance')
      ])
      
      if (partnersResponse.success && partnersResponse.data) {
        setPartners(partnersResponse.data as any[])
      } else {
        setPartners([])
      }
      
      if (performanceResponse.success && performanceResponse.data) {
        setPerformance(performanceResponse.data as any[])
      } else {
        setPerformance([])
      }
    } catch (error: any) {
      console.error('Failed to load performance data:', error)
      setError('Failed to load performance data')
      setPartners([])
      setPerformance([])
    } finally {
      setIsLoading(false)
    }
  }

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'bg-green-500'
      case 'good': return 'bg-blue-500'
      case 'average': return 'bg-yellow-500'
      case 'poor': return 'bg-red-500'
      default: return 'bg-slate-500'
    }
  }

  const getPerformanceText = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'Excellent'
      case 'good': return 'Good'
      case 'average': return 'Average'
      case 'poor': return 'Poor'
      default: return 'Unknown'
    }
  }

  const getPerformanceIcon = (performance: string) => {
    switch (performance) {
      case 'excellent': return <Crown className="h-4 w-4" />
      case 'good': return <Trophy className="h-4 w-4" />
      case 'average': return <Medal className="h-4 w-4" />
      case 'poor': return <AlertCircle className="h-4 w-4" />
      default: return <Star className="h-4 w-4" />
    }
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-400" />
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-400" />
    return <Activity className="h-4 w-4 text-slate-400" />
  }

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.performance?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || partner.performance === filter
    return matchesSearch && matchesFilter
  })

  // Calculate metrics
  const totalPartners = partners.length
  const excellentPartners = partners.filter(p => p.performance === 'excellent').length
  const totalSales = partners.reduce((sum, p) => sum + (p.totalSales || 0), 0)
  const avgPerformance = partners.length > 0 
    ? partners.reduce((sum, p) => {
        const score = p.performance === 'excellent' ? 4 : p.performance === 'good' ? 3 : p.performance === 'average' ? 2 : 1
        return sum + score
      }, 0) / partners.length 
    : 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const handleViewPartner = (partner: any) => {
    setSelectedPartner(partner)
    setShowViewModal(true)
  }

  const handleEditPartner = (partner: any) => {
    setSelectedPartner(partner)
    setShowEditModal(true)
  }

  const handleViewAnalytics = async (partner: any) => {
    try {
      router.push(`/partners/performance/${partner.id}/analytics`)
    } catch (error: any) {
      console.error('Failed to navigate to analytics:', error)
      toast.error('Failed to open analytics')
    }
  }

  const handleDeletePartner = async (partner: any) => {
    if (confirm('Are you sure you want to delete this partner?')) {
      try {
        const response = await apiClient.delete(`/partners/performance/${partner.id}`)
        if (response.success) {
          toast.success('Partner deleted successfully')
          loadData()
        } else {
          toast.error('Failed to delete partner')
        }
      } catch (error: any) {
        console.error('Failed to delete partner:', error)
        toast.error('Failed to delete partner')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-8 text-white shadow-2xl">
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
                  Partner Performance
                </h1>
                <p className="text-blue-100 max-w-2xl">
                  Track and analyze partner performance metrics
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <SnowButton variant="outline" className="bg-blue-500/20 border-blue-400/30 text-white hover:bg-blue-500/30">
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
                  Partner Performance
                </h1>
                <p className="text-red-100 max-w-2xl">
                  Unable to load performance data. Please try again.
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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-8 text-white shadow-2xl">
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
                Partner Performance
              </h1>
              <p className="text-blue-100 max-w-2xl">
                Track and analyze partner performance metrics and achievements
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <SnowButton variant="outline" className="bg-blue-500/20 border-blue-400/30 text-white hover:bg-blue-500/30">
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
                <p className="text-sm font-medium text-blue-300">Total Partners</p>
                <p className="text-2xl font-bold text-white">{totalPartners}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-400" />
                  <p className="text-xs text-blue-200">Active network</p>
                </div>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard variant="dark">
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-300">Excellent Performers</p>
                <p className="text-2xl font-bold text-white">{excellentPartners}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-400" />
                  <p className="text-xs text-green-200">Top tier partners</p>
                </div>
              </div>
              <Crown className="h-8 w-8 text-green-200" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard variant="dark">
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-300">Total Sales</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(totalSales)}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-400" />
                  <p className="text-xs text-purple-200">Partner-generated</p>
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-200" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard variant="dark">
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-300">Avg Performance</p>
                <p className="text-2xl font-bold text-white">{avgPerformance.toFixed(1)}/4</p>
                <div className="flex items-center space-x-1 mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-400" />
                  <p className="text-xs text-orange-200">Performance score</p>
                </div>
              </div>
              <Target className="h-8 w-8 text-orange-200" />
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
      <SnowCard variant="dark">
        <SnowCardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <SnowSearchInput
                placeholder="Search partners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onSearch={() => {}}
              />
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Performance</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="average">Average</option>
                <option value="poor">Poor</option>
              </select>
              <SnowButton variant="default" >
                <Plus className="h-4 w-4 mr-2" />
                Add Partner
              </SnowButton>
            </div>
          </div>
        </SnowCardContent>
      </SnowCard>
      <SnowCard variant="dark">
        <SnowCardHeader>
          <SnowCardTitle icon={<Trophy className="h-5 w-5" />}>
            Partner Performance
          </SnowCardTitle>
          <SnowCardDescription>
            Comprehensive performance metrics and achievements for all partners
          </SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          {filteredPartners.length > 0 ? (
            <SnowTable>
              <SnowTableHeader>
                <tr>
                  <SnowTableHead>Partner</SnowTableHead>
                  <SnowTableHead>Type</SnowTableHead>
                  <SnowTableHead>Sales</SnowTableHead>
                  <SnowTableHead>Commission</SnowTableHead>
                  <SnowTableHead>Performance</SnowTableHead>
                  <SnowTableHead>Deals</SnowTableHead>
                  <SnowTableHead>Trend</SnowTableHead>
                  <SnowTableHead align="center">Actions</SnowTableHead>
                </tr>
              </SnowTableHeader>
              <SnowTableBody>
                {filteredPartners.map((partner) => (
                  <SnowTableRow key={partner.id}>
                    <SnowTableCell>
                      <div>
                        <div className="font-medium text-white">{partner.name}</div>
                        <div className="text-sm text-slate-400">{partner.partnerId}</div>
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="text-white capitalize">{partner.type}</div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="text-white">{formatCurrency(partner.totalSales)}</div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="text-white font-medium">{formatCurrency(partner.totalCommission)}</div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="flex items-center space-x-2">
                        <div className={`p-1 rounded-full ${getPerformanceColor(partner.performance)}`}>
                          {getPerformanceIcon(partner.performance)}
                        </div>
                        <span className="text-white">{getPerformanceText(partner.performance)}</span>
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="text-white">{partner.dealsClosed || 0}</div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(partner.trend || 0)}
                        <span className={`text-sm ${(partner.trend || 0) > 0 ? 'text-green-400' : (partner.trend || 0) < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                          {Math.abs(partner.trend || 0).toFixed(1)}%
                        </span>
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                                              <div className="flex items-center space-x-2">
                          <SnowButton
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewPartner(partner)}
                          >
                            <Eye className="h-4 w-4" />
                          </SnowButton>
                          <SnowButton
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPartner(partner)}
                          >
                            <Edit className="h-4 w-4" />
                          </SnowButton>
                          <SnowButton
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewAnalytics(partner)}
                          >
                            <BarChart3 className="h-4 w-4" />
                          </SnowButton>
                          <SnowButton
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeletePartner(partner)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </SnowButton>
                        </div>
                    </SnowTableCell>
                  </SnowTableRow>
                ))}
              </SnowTableBody>
            </SnowTable>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No performance data found
              </p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or add new partners.
              </p>
            </div>
          )}
        </SnowCardContent>
      </SnowCard>
    </div>
  )
}

