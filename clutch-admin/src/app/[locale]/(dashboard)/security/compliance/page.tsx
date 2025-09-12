'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock,
  RefreshCw,
  Filter,
  Download,
  FileText,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Settings,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  Award,
  Target
} from 'lucide-react'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useSecurityComplianceDashboard } from '@/hooks/useSecurityComplianceDashboard'

interface ComplianceRequirement {
  id: string
  name: string
  category: 'data_protection' | 'access_control' | 'audit_logging' | 'encryption' | 'network_security'
  status: 'compliant' | 'non_compliant' | 'in_progress' | 'not_applicable'
  priority: 'high' | 'medium' | 'low'
  lastChecked: string
  nextReview: string
  description: string
  requirements: string[]
  evidence: string[]
  riskLevel: 'critical' | 'high' | 'medium' | 'low'
}

interface ComplianceMetric {
  metric: string
  value: number
  target: number
  percentage: number
  status: 'good' | 'warning' | 'critical'
}

export default function SecurityCompliancePage() {
  // Use consolidated security compliance dashboard hook instead of multiple separate API calls
  const {
    data: consolidatedData,
    isLoading,
    error,
    lastUpdated,
    refreshData,
    complianceMetrics,
    auditLogs
  } = useSecurityComplianceDashboard()

  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')

  // Map consolidated data to component state
  const requirements = complianceMetrics.map(metric => ({
    id: metric.id,
    name: metric.name,
    category: 'data_protection' as const,
    status: metric.status as 'compliant' | 'non_compliant' | 'in_progress' | 'not_applicable',
    priority: 'high' as const,
    lastChecked: metric.lastAudit,
    nextReview: metric.nextAudit,
    description: `${metric.name} compliance requirement`,
    requirements: [`Maintain ${metric.score}% compliance score`],
    evidence: [`Audit report from ${new Date(metric.lastAudit).toLocaleDateString()}`],
    riskLevel: metric.score < 90 ? 'high' as const : 'low' as const
  }))

  const metrics = complianceMetrics.map(metric => ({
    metric: metric.name,
    value: metric.score,
    target: 95,
    status: metric.status,
    trend: 'stable' as const,
    lastUpdated: metric.lastAudit
  }))

  // Handle error state
  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load compliance data</p>
          <SnowButton onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </SnowButton>
        </div>
      </div>
    )
  }

  // Filter requirements based on search and filter criteria
  const filteredRequirements = requirements.filter(requirement => {
    const matchesSearch = requirement.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         requirement.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         requirement.category?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || requirement.status === filter || requirement.priority === filter
    return matchesSearch && matchesFilter
  })

  const updateComplianceStatus = async (requirementId: string, status: string) => {
    try {
      toast.success('Compliance status updated successfully')
      refreshData()
    } catch (error) {
      toast.error('Failed to update compliance status')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'non_compliant':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'not_applicable':
        return <Settings className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'non_compliant':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'in_progress':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'not_applicable':
        return 'text-gray-600 bg-gray-50 border-gray-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getMetricStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600'
      case 'warning':
        return 'text-yellow-600'
      case 'critical':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const compliantCount = requirements.filter(r => r.status === 'compliant').length
  const nonCompliantCount = requirements.filter(r => r.status === 'non_compliant').length
  const inProgressCount = requirements.filter(r => r.status === 'in_progress').length
  const overallCompliance = requirements.length > 0 ? (compliantCount / requirements.length) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security Compliance</h1>
          <p className="text-muted-foreground">
            Monitor and manage security compliance requirements
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <SnowButton variant="outline" onClick={refreshData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </SnowButton>
          <SnowButton>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </SnowButton>
        </div>
      </div>
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Compliance Filters
          </SnowCardTitle>
        </SnowCardHeader>
        <SnowCardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="data_protection">Data Protection</SelectItem>
                  <SelectItem value="access_control">Access Control</SelectItem>
                  <SelectItem value="audit_logging">Audit Logging</SelectItem>
                  <SelectItem value="encryption">Encryption</SelectItem>
                  <SelectItem value="network_security">Network Security</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="compliant">Compliant</SelectItem>
                  <SelectItem value="non_compliant">Non-Compliant</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="not_applicable">Not Applicable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Priority</label>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </SnowCardContent>
      </SnowCard>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <SnowCard key={metric.metric}>
            <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <SnowCardTitle className="text-sm font-medium">{metric.metric}</SnowCardTitle>
              <div className={`p-2 rounded-full ${getMetricStatusColor(metric.status)} bg-opacity-10`}>
                {metric.status === 'good' && <CheckCircle className="h-4 w-4" />}
                {metric.status === 'warning' && <AlertTriangle className="h-4 w-4" />}
                {metric.status === 'critical' && <XCircle className="h-4 w-4" />}
              </div>
            </SnowCardHeader>
            <SnowCardContent>
              <div className="text-2xl font-bold">
                {metric.metric.includes('Compliance') || metric.metric.includes('Items') ? `${metric.value}/${metric.target}` : `${Math.round((metric.value / metric.target) * 100)}%`}
              </div>
              <p className="text-xs text-muted-foreground">
                Target: {metric.target}
              </p>
            </SnowCardContent>
          </SnowCard>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle>Compliance Status</SnowCardTitle>
            <SnowCardDescription>
              Overall compliance breakdown
            </SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(compliantCount / requirements.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{compliantCount}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Non-Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${(nonCompliantCount / requirements.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{nonCompliantCount}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">In Progress</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: `${(inProgressCount / requirements.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{inProgressCount}</span>
                </div>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle>Risk Assessment</SnowCardTitle>
            <SnowCardDescription>
              Requirements by risk level
            </SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="space-y-4">
              {['critical', 'high', 'medium', 'low'].map((riskLevel) => {
                const count = requirements.filter(r => r.riskLevel === riskLevel).length
                const percentage = requirements.length > 0 ? (count / requirements.length) * 100 : 0
                return (
                  <div key={riskLevel} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        riskLevel === 'critical' ? 'bg-red-500' :
                        riskLevel === 'high' ? 'bg-orange-500' :
                        riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <span className="text-sm font-medium capitalize">{riskLevel} Risk</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            riskLevel === 'critical' ? 'bg-red-500' :
                            riskLevel === 'high' ? 'bg-orange-500' :
                            riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-8">
                        {count}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle>Compliance Requirements</SnowCardTitle>
          <SnowCardDescription>
            Detailed compliance requirements and status
          </SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Loading compliance data...
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8 text-red-600">
              <AlertTriangle className="h-6 w-6 mr-2" />
              {error}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequirements.map((requirement) => (
                <motion.div
                  key={requirement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-medium">{requirement.name}</h3>
                        <Badge className={getStatusColor(requirement.status)}>
                          {getStatusIcon(requirement.status)}
                          <span className="ml-1 capitalize">{requirement.status.replace('_', ' ')}</span>
                        </Badge>
                        <Badge className={getPriorityColor(requirement.priority)}>
                          {requirement.priority} Priority
                        </Badge>
                        <Badge className={getRiskColor(requirement.riskLevel)}>
                          {requirement.riskLevel} Risk
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {requirement.description}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">Requirements:</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {requirement.requirements.map((req, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                                <span>{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-2">Evidence:</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {requirement.evidence.map((ev, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <FileText className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                <span>{ev}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Last checked: {formatDate(requirement.lastChecked)} â€¢ 
                      Next review: {formatDate(requirement.nextReview)}
                    </div>
                    <div className="flex space-x-2">
                      <SnowButton size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </SnowButton>
                      {requirement.status !== 'compliant' && (
                        <SnowButton size="sm">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark Compliant
                        </SnowButton>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </SnowCardContent>
      </SnowCard>
    </div>
  )
}



