'use client'

import React, { useState, useEffect } from 'react'
import { SnowCard, SnowCardHeader, SnowCardContent, SnowCardTitle, SnowCardDescription } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowInput, SnowSearchInput } from '@/components/ui/snow-input'
import { SnowTable, SnowTableHeader, SnowTableBody, SnowTableRow, SnowTableCell, SnowTableHead } from '@/components/ui/snow-table'
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
  BarChart3,
  PieChart,
  Activity,
  FileText,
  Download
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

export default function AnalyticsReportsPage() {
  const [reports, setReports] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [showViewModal, setShowViewModal] = useState(false)

  useEffect(() => {
    loadReportsData()
  }, [])

  const loadReportsData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await apiClient.get<any[]>('/analytics/reports')
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

  const handleViewReport = async (report: any) => {
    try {
      const response = await apiClient.get(`/analytics/reports/${report._id || report.id}`)
      if (response.success) {
        setSelectedReport(response.data)
        setShowViewModal(true)
      } else {
        toast.error('Failed to load report details')
      }
    } catch (error) {
      console.error('Failed to load report details:', error)
      toast.error('Failed to load report details')
    }
  }

  const handleDownloadReport = async (report: any) => {
    try {
      const response = await apiClient.get(`/analytics/reports/${report._id || report.id}/download`)
      if (response.success) {
        const blob = new Blob([response.data as BlobPart], { type: 'application/pdf' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${report.name}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('Report downloaded successfully')
      } else {
        toast.error('Failed to download report')
      }
    } catch (error) {
      console.error('Failed to download report:', error)
      toast.error('Failed to download report')
    }
  }

  const handleMoreActions = (report: any) => {
    // Implement dropdown menu or additional actions
    toast.info(`More actions for report: ${report.name}`)
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
      case 'processing':
        return 'bg-yellow-500'
      case 'failed':
        return 'bg-red-500'
      case 'scheduled':
        return 'bg-blue-500'
      default:
        return 'bg-slate-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400'
      case 'processing':
        return 'text-yellow-400'
      case 'failed':
        return 'text-red-400'
      case 'scheduled':
        return 'text-blue-400'
      default:
        return 'text-slate-400'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'financial':
        return <PoundSterling className="h-4 w-4" />
      case 'marketing':
        return <TrendingUp className="h-4 w-4" />
      case 'operational':
        return <Target className="h-4 w-4" />
      case 'customer':
        return <Users className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.category?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filter === 'all' || report.status === filter
    return matchesSearch && matchesStatus
  })

  // Calculate metrics
  const totalReports = reports.length
  const completedReports = reports.filter(report => report.status === 'completed').length
  const totalViews = reports.reduce((sum, report) => sum + (report.views || 0), 0)
  const totalDownloads = reports.reduce((sum, report) => sum + (report.downloads || 0), 0)

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Reports</h1>
          <p className="text-muted-foreground">
            Generate and manage analytics reports
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
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{totalViews}</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Downloads</p>
                <p className="text-2xl font-bold">{totalDownloads}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-50">
                <Download className="h-6 w-6 text-green-600" />
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
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>
        </SnowCardContent>
      </SnowCard>
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle>Reports Overview</SnowCardTitle>
          <SnowCardDescription>
            All analytics reports and their status
          </SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          {filteredReports.length > 0 ? (
            <SnowTable>
              <SnowTableHeader>
                <SnowTableHead>Report</SnowTableHead>
                <SnowTableHead>Category</SnowTableHead>
                <SnowTableHead>Status</SnowTableHead>
                <SnowTableHead>Format</SnowTableHead>
                <SnowTableHead>Size</SnowTableHead>
                <SnowTableHead>Views</SnowTableHead>
                <SnowTableHead>Downloads</SnowTableHead>
                <SnowTableHead>Last Generated</SnowTableHead>
                <SnowTableHead>Actions</SnowTableHead>
              </SnowTableHeader>
              <SnowTableBody>
                {filteredReports.map((report) => (
                  <SnowTableRow key={report._id || report.id}>
                    <SnowTableCell>
                      <div>
                        <p className="font-medium">{report.title || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">
                          {report.description || 'N/A'}
                        </p>
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(report.category)}
                        <span className="text-sm">{report.category || 'N/A'}</span>
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <Badge className={`${getStatusColor(report.status)} ${getStatusText(report.status)}`}>
                        {report.status?.toUpperCase() || 'N/A'}
                      </Badge>
                    </SnowTableCell>
                    <SnowTableCell>
                      <span className="text-sm">{report.format || 'N/A'}</span>
                    </SnowTableCell>
                    <SnowTableCell>
                      <span className="text-sm">{report.size || 'N/A'}</span>
                    </SnowTableCell>
                    <SnowTableCell>
                      <span className="font-medium">{report.views || 0}</span>
                    </SnowTableCell>
                    <SnowTableCell>
                      <span className="font-medium">{report.downloads || 0}</span>
                    </SnowTableCell>
                    <SnowTableCell>
                      <span className="text-sm">{formatDate(report.lastGenerated)}</span>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="flex items-center space-x-2">
                        <SnowButton icon={<Eye className="h-4 w-4" />} size="sm" variant="ghost" onClick={() => handleViewReport(report)} />
                        <SnowButton icon={<Download className="h-4 w-4" />} size="sm" variant="ghost" onClick={() => handleDownloadReport(report)} />
                        <SnowButton icon={<MoreHorizontal className="h-4 w-4" />} size="sm" variant="ghost" onClick={() => handleMoreActions(report)} />
                      </div>
                    </SnowTableCell>
                  </SnowTableRow>
                ))}
              </SnowTableBody>
            </SnowTable>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No reports found</p>
              <p className="text-muted-foreground text-sm">No reports match your current filters.</p>
            </div>
          )}
        </SnowCardContent>
      </SnowCard>
    </div>
  )
}

