'use client'

import React, { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'
import { SnowCard, SnowCardHeader, SnowCardContent, SnowCardTitle, SnowCardDescription } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowInput, SnowSearchInput } from '@/components/ui/snow-input'
import { SnowTable, SnowTableHeader, SnowTableBody, SnowTableRow, SnowTableCell, SnowTableHead, SnowTableCaption } from '@/components/ui/snow-table'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
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
  Brain,
  Zap as Lightning,
  Target as Bullseye,
  TrendingUp as ChartLine,
  Brain as Cpu,
  AlertTriangle,
  Shield as Security,
  Lock,
  Unlock,
  Eye as Monitor,
  Ban,
  CheckSquare,
  PoundSterling
} from 'lucide-react'

export default function AIFraudPage() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)
  const [selectedAlert, setSelectedAlert] = useState<any>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isFormLoading, setIsFormLoading] = useState(false)

  useEffect(() => {
    loadFraudAlertsData()
  }, [])

  const loadFraudAlertsData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [alertsResponse, transactionsResponse] = await Promise.all([
        apiClient.get('/ai/fraud/alerts'),
        apiClient.get('/ai/fraud/transactions')
      ])
      
      if (alertsResponse.success && alertsResponse.data) {
        setAlerts(alertsResponse.data as any[])
      } else {
        setAlerts([])
      }
      
      if (transactionsResponse.success && transactionsResponse.data) {
        setTransactions(transactionsResponse.data as any[])
      } else {
        setTransactions([])
      }
    } catch (error: any) {
      console.error('Failed to load fraud data:', error)
      setError('Failed to load fraud data')
      setAlerts([])
      setTransactions([])
      toast.error('Failed to load fraud data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewAlert = async (alert: any) => {
    try {
      const response = await apiClient.get(`/ai/fraud/alerts/${alert.id}`)
      if (response.success) {
        setSelectedAlert(response.data)
        setShowViewModal(true)
      } else {
        toast.error('Failed to load alert details', { duration: 3000 })
      }
    } catch (error) {
      console.error('Failed to load alert details:', error)
      toast.error('Failed to load alert details', { duration: 3000 })
    }
  }

  const handleInvestigateAlert = async (alert: any) => {
    try {
      const response = await apiClient.put(`/ai/fraud/alerts/${alert.id}/investigate`, {})
      if (response.success) {
        toast.success('Alert marked for investigation')
        loadFraudAlertsData() // Refresh the list
      } else {
        toast.error(response.message || 'Failed to investigate alert')
      }
    } catch (error) {
      console.error('Failed to investigate alert:', error)
      toast.error('Failed to investigate alert')
    }
  }

  const handleBlockAlert = async (alert: any) => {
    try {
      const response = await apiClient.put(`/ai/fraud/alerts/${alert.id}/block`, {})
      if (response.success) {
        toast.success('Alert blocked successfully')
        loadFraudAlertsData() // Refresh the list
      } else {
        toast.error('Failed to block alert')
      }
    } catch (error: any) {
      console.error('Failed to block alert:', error)
      toast.error('Failed to block alert')
    }
  }

  const handleDeleteAlert = async (alert: any) => {
    if (confirm(`Are you sure you want to delete alert #${alert.id}?`)) {
      try {
        const response = await apiClient.delete(`/ai/fraud/alerts/${alert.id}`)
        if (response.success) {
          toast.success('Alert deleted successfully')
          loadFraudAlertsData() // Refresh the list
        } else {
          toast.error(response.message || 'Failed to delete alert')
        }
      } catch (error) {
        console.error('Failed to delete alert:', error)
        toast.error('Failed to delete alert')
      }
    }
  }

  const handleCreateAlert = async (alertData: any) => {
    setIsFormLoading(true)
    try {
      const response = await apiClient.post('/ai/fraud/alerts', alertData)
      if (response.success) {
        toast.success('Alert created successfully')
        setShowAddModal(false)
        loadFraudAlertsData()
      } else {
        toast.error(response.message || 'Failed to create alert')
      }
    } catch (error: any) {
      console.error('Failed to create alert:', error)
      toast.error('Failed to create alert')
    } finally {
      setIsFormLoading(false)
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-green-400'
      default: return 'text-slate-400'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-500'
      case 'investigating': return 'bg-blue-500'
      case 'pending': return 'bg-yellow-500'
      case 'confirmed': return 'bg-red-500'
      default: return 'bg-slate-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'resolved': return 'Resolved'
      case 'investigating': return 'Investigating'
      case 'pending': return 'Pending'
      case 'confirmed': return 'Confirmed'
      default: return 'Unknown'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="h-4 w-4" />
      case 'investigating': return <Clock className="h-4 w-4" />
      case 'pending': return <AlertCircle className="h-4 w-4" />
      case 'confirmed': return <AlertTriangle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'transaction': return <PoundSterling className="h-4 w-4" />
      case 'account': return <User className="h-4 w-4" />
      case 'device': return <Monitor className="h-4 w-4" />
      case 'location': return <MapPin className="h-4 w-4" />
      default: return <Shield className="h-4 w-4" />
    }
  }

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.id?.toString().includes(searchTerm) ||
                         alert.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || alert.status === filter
    return matchesSearch && matchesFilter
  })

  // Calculate metrics
  const totalAlerts = alerts.length
  const resolvedAlerts = alerts.filter(a => a.status === 'resolved').length
  const highRiskAlerts = alerts.filter(a => a.risk === 'high').length
  const totalAmount = alerts.filter(a => a.amount).reduce((sum, a) => sum + (a.amount || 0), 0)
  const avgConfidence = alerts.length > 0 
    ? alerts.reduce((sum, a) => sum + (a.confidence || 0), 0) / alerts.length 
    : 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 via-red-700 to-red-800 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-300">FRAUD DETECTION ACTIVE</span>
                  </div>
                  <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                  AI Fraud Detection
                </h1>
                <p className="text-red-100 max-w-2xl">
                  Advanced AI-powered fraud detection and security monitoring
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <SnowButton variant="outline" className="bg-red-500/20 border-red-400/30 text-white hover:bg-red-500/30">
                  <Shield className="h-4 w-4 mr-2" />
                  Security Dashboard
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
                  AI Fraud Detection
                </h1>
                <p className="text-red-100 max-w-2xl">
                  Unable to load fraud detection data. Please try again.
                </p>
              </div>
              <SnowButton variant="outline" className="bg-red-500/20 border-red-400/30 text-white hover:bg-red-500/30" onClick={loadFraudAlertsData}>
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
              <SnowButton onClick={loadFraudAlertsData} variant="default">
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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 via-red-700 to-red-800 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-300">FRAUD DETECTION ACTIVE</span>
                </div>
                <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                AI Fraud Detection
              </h1>
              <p className="text-red-100 max-w-2xl">
                Advanced AI-powered fraud detection and security monitoring
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <SnowButton variant="outline" className="bg-red-500/20 border-red-400/30 text-white hover:bg-red-500/30">
                <Shield className="h-4 w-4 mr-2" />
                Security Dashboard
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
                <p className="text-sm font-medium text-red-300">Total Alerts</p>
                <p className="text-2xl font-bold text-white">{totalAlerts}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <ArrowUpRight className="h-3 w-3 text-red-400" />
                  <p className="text-xs text-red-200">+{highRiskAlerts} high risk</p>
                </div>
              </div>
              <div className="p-3 bg-red-500/20 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard variant="dark" >
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-300">Resolved Alerts</p>
                <p className="text-2xl font-bold text-white">{resolvedAlerts}</p>
                <p className="text-xs text-green-200">Successfully handled</p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard variant="dark" >
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-300">Risk Amount</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(totalAmount)}</p>
                <p className="text-xs text-orange-200">Potential fraud value</p>
              </div>
              <div className="p-3 bg-orange-500/20 rounded-lg">
                <PoundSterling className="h-6 w-6 text-orange-400" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard variant="dark" >
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-300">AI Confidence</p>
                <p className="text-2xl font-bold text-white">{avgConfidence.toFixed(1)}%</p>
                <p className="text-xs text-blue-200">Detection accuracy</p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Brain className="h-6 w-6 text-blue-400" />
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
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onSearch={() => {}}
              />
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Status</option>
                <option value="resolved">Resolved</option>
                <option value="investigating">Investigating</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
              </select>
              <SnowButton variant="default"  onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Alert
              </SnowButton>
            </div>
          </div>
        </SnowCardContent>
      </SnowCard>
      <SnowCard variant="dark">
        <SnowCardHeader>
          <SnowCardTitle icon={<Shield className="h-5 w-5" />}>
            Fraud Detection Alerts
          </SnowCardTitle>
          <SnowCardDescription>
            Monitor and manage AI-powered fraud detection alerts
          </SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          {filteredAlerts.length > 0 ? (
            <SnowTable>
              <SnowTableHeader>
                <tr>
                  <SnowTableHead>Alert</SnowTableHead>
                  <SnowTableHead>Type</SnowTableHead>
                  <SnowTableHead>Status</SnowTableHead>
                  <SnowTableHead>Risk</SnowTableHead>
                  <SnowTableHead>Amount</SnowTableHead>
                  <SnowTableHead>Location</SnowTableHead>
                  <SnowTableHead>Confidence</SnowTableHead>
                  <SnowTableHead align="center">Actions</SnowTableHead>
                </tr>
              </SnowTableHeader>
              <SnowTableBody>
                {filteredAlerts.map((alert) => (
                  <SnowTableRow key={alert.id}>
                    <SnowTableCell>
                      <div>
                        <div className="font-medium text-white">Alert #{alert.id}</div>
                        <div className="text-sm text-slate-400">{alert.description}</div>
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="flex items-center space-x-2">
                        <div className="p-1 bg-slate-700 rounded">
                          {getTypeIcon(alert.type)}
                        </div>
                        <span className="text-white capitalize">{alert.type}</span>
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="flex items-center space-x-2">
                        <div className={`p-1 rounded-full ${getStatusColor(alert.status)}`}>
                          {getStatusIcon(alert.status)}
                        </div>
                        <span className="text-white">{getStatusText(alert.status)}</span>
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className={`font-medium ${getRiskColor(alert.risk)}`}>
                        {alert.risk.toUpperCase()}
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="text-white">
                        {alert.amount ? formatCurrency(alert.amount) : 'N/A'}
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="text-white">{alert.location}</div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="text-white">{alert.confidence}%</div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="flex items-center space-x-2">
                        <SnowButton
                          icon={<Eye className="h-4 w-4" />}
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewAlert(alert)}
                        />
                        <SnowButton
                          icon={<CheckSquare className="h-4 w-4" />}
                          variant="outline"
                          size="sm"
                          onClick={() => handleInvestigateAlert(alert)}
                        />
                        <SnowButton
                          icon={<Ban className="h-4 w-4" />}
                          variant="outline"
                          size="sm"
                          onClick={() => handleBlockAlert(alert)}
                        />
                        <SnowButton
                          icon={<Trash2 className="h-4 w-4" />}
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAlert(alert)}
                        />
                      </div>
                    </SnowTableCell>
                  </SnowTableRow>
                ))}
              </SnowTableBody>
            </SnowTable>
          ) : (
            <div className="text-center py-12">
              <SnowCard variant="dark" className="mx-auto max-w-sm">
                <SnowCardContent className="p-6">
                  <Shield className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No Alerts Found</h3>
                  <p className="text-slate-300 mb-4">No alerts match your current search criteria. Try adjusting your filters or create a new alert.</p>
                  <SnowButton variant="default"  onClick={() => setShowAddModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Alert
                  </SnowButton>
                </SnowCardContent>
              </SnowCard>
            </div>
          )}
        </SnowCardContent>
      </SnowCard>
    </div>
  )
}

