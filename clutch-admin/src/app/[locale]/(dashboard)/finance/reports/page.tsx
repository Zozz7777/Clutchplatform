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
  Download,
  FileText,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

export default function FinanceReportsPage() {
  const [reports, setReports] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadReportsData()
  }, [])

  const loadReportsData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await apiClient.get<any[]>('/finance/reports')
      if (response.success) {
        setReports(response.data || [])
      } else {
        setReports([])
        setError('Failed to load reports data')
        toast.error('Failed to load reports data')
      }
    } catch (error: any) {
      console.error('Failed to load reports data:', error)
      setReports([])
      setError('Failed to load reports data')
      toast.error('Failed to load reports data')
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
      case 'completed':
        return 'bg-green-500'
      case 'pending':
        return 'bg-yellow-500'
      case 'failed':
        return 'bg-red-500'
      case 'processing':
        return 'bg-blue-500'
      default:
        return 'bg-slate-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400'
      case 'pending':
        return 'text-yellow-400'
      case 'failed':
        return 'text-red-400'
      case 'processing':
        return 'text-blue-400'
      default:
        return 'text-slate-400'
    }
  }

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'financial_statement':
        return <BarChart3 className="h-4 w-4" />
      case 'cash_flow':
        return <TrendingUp className="h-4 w-4" />
      case 'profit_loss':
        return <PoundSterling className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || report.status === filter
    return matchesSearch && matchesFilter
  })

  // Calculate metrics
  const totalReports = reports.length
  const completedReports = reports.filter(report => report.status === 'completed').length
  const pendingReports = reports.filter(report => report.status === 'pending').length
  const avgReportSize = reports.reduce((sum, report) => sum + (report.size || 0), 0) / Math.max(totalReports, 1)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>Loading reports data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <SnowButton onClick={loadReportsData}>Retry</SnowButton>
        </div>
      </div>
    )
  }

  const handleDeleteReport = async (report: any) => {
    if (confirm(`Are you sure you want to delete the report "${report.name}"?`)) {
      try {
        const response = await apiClient.delete(`/finance/reports/${report.id}`)
        if (response.success) {
          toast.success('Report deleted successfully')
          loadReportsData()
        } else {
          toast.error(response.message || 'Failed to delete report')
        }
      } catch (error) {
        console.error('Failed to delete report:', error)
        toast.error('Failed to delete report')
      }
    }
  }

  const handleViewReport = (report: any) => {
    // Handle view report action
    console.log('View report:', report)
  }

  const handleDownloadReport = (report: any) => {
    // Handle download report action
    console.log('Download report:', report)
  }

  const handleMoreActions = (report: any) => {
    // Handle more actions for report
    console.log('More actions for report:', report)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finance Reports</h1>
          <p className="text-muted-foreground">
            Generate and manage financial reports
          </p>
        </div>
        <SnowButton>
          <Plus className="mr-2 h-4 w-4" />
          Generate Report
        </SnowButton>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Reports</p>
                <p className="text-2xl font-bold">{totalReports}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedReports}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingReports}</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-50">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Size</p>
                <p className="text-2xl font-bold">{Math.round(avgReportSize)} KB</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50">
                <BarChart3 className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
      <SnowCard>
        <SnowCardContent className="p-6">
          <div className="flex items-center space-x-4">
            <SnowSearchInput
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </SnowCardContent>
      </SnowCard>
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle>Reports Overview</SnowCardTitle>
          <SnowCardDescription>
            All financial reports in your system
          </SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          {filteredReports.length > 0 ? (
            <SnowTable>
              <SnowTableHeader>
                <SnowTableHead>Report Name</SnowTableHead>
                <SnowTableHead>Type</SnowTableHead>
                <SnowTableHead>Status</SnowTableHead>
                <SnowTableHead>Generated By</SnowTableHead>
                <SnowTableHead>Date</SnowTableHead>
                <SnowTableHead>Size</SnowTableHead>
                <SnowTableHead>Actions</SnowTableHead>
              </SnowTableHeader>
              <SnowTableBody>
                {filteredReports.map((report) => (
                  <SnowTableRow key={report._id || report.id}>
                    <SnowTableCell>
                      <div>
                        <p className="font-medium">{report.name || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">
                          {report.description || 'N/A'}
                        </p>
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="flex items-center space-x-2">
                        {getReportTypeIcon(report.type)}
                        <span className="capitalize">{report.type?.replace('_', ' ') || 'N/A'}</span>
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <Badge className={`${getStatusColor(report.status)} ${getStatusText(report.status)}`}>
                        {report.status?.toUpperCase() || 'N/A'}
                      </Badge>
                    </SnowTableCell>
                    <SnowTableCell>
                      <span className="font-medium">{report.generatedBy || 'N/A'}</span>
                    </SnowTableCell>
                    <SnowTableCell>
                      <span className="text-sm">{formatDate(report.date)}</span>
                    </SnowTableCell>
                    <SnowTableCell>
                      <span className="text-sm">{report.size ? `${report.size} KB` : 'N/A'}</span>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="flex items-center space-x-2">
                        <SnowButton 
                          icon={<Eye className="h-4 w-4" />} 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleViewReport(report)}
                        />
                        <SnowButton 
                          icon={<Download className="h-4 w-4" />} 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleDownloadReport(report)}
                        />
                        <SnowButton 
                          icon={<MoreHorizontal className="h-4 w-4" />} 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleMoreActions(report)}
                        />
                      </div>
                    </SnowTableCell>
                  </SnowTableRow>
                ))}
              </SnowTableBody>
            </SnowTable>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No reports match your current filters.</p>
            </div>
          )}
        </SnowCardContent>
      </SnowCard>
    </div>
  )
}

