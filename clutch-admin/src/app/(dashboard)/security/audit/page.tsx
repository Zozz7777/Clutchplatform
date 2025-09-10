'use client'

import React, { useState, useEffect } from 'react'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { Badge } from '@/components/ui/badge'
import { SnowInput } from '@/components/ui/snow-input'
import { 
  Shield,
  ShieldCheck,
  ShieldX,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Download,
  Eye,
  FileText,
  Users,
  Activity,
  Calendar,
  MapPin,
  Globe,
  Lock,
  Unlock,
  Key,
  Database,
  Server,
  Network,
  Monitor,
  Smartphone,
  Tablet,
  RefreshCw,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Info,
  XCircle,
  Plus,
  Settings,
  MoreHorizontal,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Scan,
  ScanLine,
  QrCode,
  KeyRound,
  FileSearch,
  FileCheck,
  FileX
} from 'lucide-react'
import { useSecurityAuditDashboard } from '@/hooks/useSecurityAuditDashboard'
import { toast } from 'sonner'

export default function SecurityAuditPage() {
  // Use consolidated security audit dashboard hook instead of multiple separate API calls
  const {
    data: consolidatedData,
    isLoading,
    error,
    lastUpdated,
    refreshData,
    auditMetrics,
    recentAudits
  } = useSecurityAuditDashboard()

  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('logs')

  // Map consolidated data to component state
  const auditLogs = recentAudits.map(audit => ({
    id: audit.id,
    timestamp: audit.timestamp,
    user: 'system',
    action: audit.type,
    resource: audit.description,
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0',
    status: audit.status,
    severity: audit.findings > 3 ? 'high' : audit.findings > 1 ? 'medium' : 'low',
    details: {
      findings: audit.findings,
      description: audit.description
    }
  }))

  const securityEvents = auditMetrics.map(metric => ({
    id: metric.id,
    type: metric.name,
    severity: metric.severity,
    timestamp: new Date().toISOString(),
    description: `${metric.name}: ${metric.value} occurrences`,
    status: metric.changeType === 'increase' ? 'active' : 'resolved',
    source: 'security_system',
    details: {
      value: metric.value,
      change: metric.change,
      changeType: metric.changeType
    }
  }))

  // Handle error state
  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load audit data</p>
          <SnowButton onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </SnowButton>
        </div>
      </div>
    )
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default: return 'bg-slate-100 text-slate-800 bg-white dark:text-slate-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'denied': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'investigating': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'resolved': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default: return 'bg-slate-100 text-slate-800 bg-white dark:text-slate-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4" />
      case 'failed': return <XCircle className="h-4 w-4" />
      case 'denied': return <ShieldX className="h-4 w-4" />
      case 'investigating': return <Clock className="h-4 w-4" />
      case 'resolved': return <CheckCircle className="h-4 w-4" />
      default: return <Info className="h-4 w-4" />
    }
  }

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'suspicious_activity': return <AlertTriangle className="h-4 w-4" />
      case 'permission_violation': return <ShieldX className="h-4 w-4" />
      case 'configuration_change': return <Settings className="h-4 w-4" />
      case 'data_access': return <Database className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = (log.user || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (log.action || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (log.resource || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (typeof log.details === 'string' ? log.details : JSON.stringify(log.details || {})).toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || log.severity === filter
    return matchesSearch && matchesFilter
  })

  const totalLogs = auditLogs.length
  const highSeverityLogs = auditLogs.filter(log => log.severity === 'high').length
  const failedActions = auditLogs.filter(log => log.status === 'failed' || log.status === 'denied').length
  const totalEvents = securityEvents.length

  const handleViewLog = (log: any) => {
    toast.info(`Viewing audit log: ${log.action}`)
  }

  const handleViewEvent = (event: any) => {
    toast.info(`Viewing security event: ${event.type}`)
  }

  const handleExportLogs = () => {
    toast.success('Exporting audit logs...')
  }

  const handleGenerateReport = () => {
    toast.success('Generating security report...')
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <SnowCard className="w-full max-w-md">
          <SnowCardHeader>
            <SnowCardTitle className="text-red-600">Error Loading Audit Data</SnowCardTitle>
            <SnowCardDescription>{error}</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <SnowButton onClick={refreshData} className="w-full">
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
          <p className="text-muted-foreground">Loading audit data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 text-slate-900">
            Security Audit
          </h1>
          <p className="text-slate-600 text-slate-600">
            Monitor security events and audit logs
          </p>
        </div>
        <div className="flex gap-2">
          <SnowButton variant="outline" onClick={handleExportLogs}>
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </SnowButton>
          <SnowButton onClick={handleGenerateReport}>
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </SnowButton>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">Total Logs</p>
                <p className="text-2xl font-bold">{totalLogs}</p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">High Severity</p>
                <p className="text-2xl font-bold">{highSeverityLogs}</p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ShieldX className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">Failed Actions</p>
                <p className="text-2xl font-bold">{failedActions}</p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">Security Events</p>
                <p className="text-2xl font-bold">{totalEvents}</p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
      <div className="flex space-x-1 bg-slate-100 bg-slate-100 p-1 rounded-lg">
        <SnowButton
          onClick={() => setActiveTab('logs')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'logs'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Audit Logs
        </SnowButton>
        <SnowButton
          onClick={() => setActiveTab('events')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'events'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Security Events
        </SnowButton>
      </div>
      <SnowCard>
        <SnowCardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-600" />
                <SnowInput
                  placeholder="Search logs..."
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
                <option value="all">All Severity</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <SnowButton variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </SnowButton>
            </div>
          </div>
        </SnowCardContent>
      </SnowCard>
      {activeTab === 'logs' && (
        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle>Audit Logs</SnowCardTitle>
            <SnowCardDescription>Detailed activity logs and access records</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4 hover:bg-slate-50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                        {getStatusIcon(log.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium">{log.action?.replace('_', ' ').toUpperCase()}</h4>
                          <Badge className={getSeverityColor(log.severity)}>
                            {log.severity}
                          </Badge>
                          <Badge className={getStatusColor(log.status)}>
                            {getStatusIcon(log.status)}
                            <span className="ml-1">{log.status}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 text-slate-600 mb-2">
                          {typeof log.details === 'string' ? log.details : log.details?.description || JSON.stringify(log.details)}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="font-medium">User</p>
                            <p className="text-slate-500">{log.user || 'Unknown'}</p>
                          </div>
                          <div>
                            <p className="font-medium">Resource</p>
                            <p className="text-slate-500">{log.resource}</p>
                          </div>
                          <div>
                            <p className="font-medium">Location</p>
                            <div className="flex items-center space-x-1 text-slate-500">
                              <MapPin className="h-3 w-3" />
                              <span>{log.ip}</span>
                            </div>
                          </div>
                          <div>
                            <p className="font-medium">Time</p>
                            <p className="text-slate-500">{formatDate(log.timestamp)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <SnowButton
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewLog(log)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </SnowButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SnowCardContent>
        </SnowCard>
      )}
      {activeTab === 'events' && (
        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle>Security Events</SnowCardTitle>
            <SnowCardDescription>Critical security incidents and alerts</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="space-y-4">
              {securityEvents.map((event) => (
                <div key={event.id} className="border rounded-lg p-6 hover:bg-slate-50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                        {getEventTypeIcon(event.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">{event.type}</h3>
                          <Badge className={getSeverityColor(event.severity)}>
                            {event.severity}
                          </Badge>
                          <Badge className={getStatusColor(event.status)}>
                            {getStatusIcon(event.status)}
                            <span className="ml-1">{event.status}</span>
                          </Badge>
                        </div>
                        <p className="text-slate-600 text-slate-600 mb-3">
                          {event.description}
                        </p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                          <div>
                            <p className="font-medium">Affected Users</p>
                            <p className="text-slate-500">{event.details.value}</p>
                          </div>
                          <div>
                            <p className="font-medium">Systems</p>
                            <p className="text-slate-500">{event.source}</p>
                          </div>
                          <div>
                            <p className="font-medium">Location</p>
                            <div className="flex items-center space-x-1 text-slate-500">
                              <MapPin className="h-3 w-3" />
                              <span>{event.source}</span>
                            </div>
                          </div>
                          <div>
                            <p className="font-medium">Time</p>
                            <p className="text-slate-500">{formatDate(event.timestamp)}</p>
                          </div>
                        </div>

                        <div>
                          <p className="font-medium text-sm mb-2">Details:</p>
                          <p className="text-sm text-slate-600">{event.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <SnowButton
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewEvent(event)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </SnowButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SnowCardContent>
        </SnowCard>
      )}
    </div>
  )
}



