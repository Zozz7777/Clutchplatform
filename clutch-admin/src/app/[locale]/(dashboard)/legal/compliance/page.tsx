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
  FileX,
  BookOpen,
  Scale,
  Gavel,
  Award,
  Target,
  Flag,
  AlertCircle,
  Clipboard,
  ClipboardCheck,
  ClipboardX
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

export default function LegalCompliancePage() {
  const [complianceData, setComplianceData] = useState<any>({})
  const [policies, setPolicies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadComplianceData()
  }, [])

  const loadComplianceData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const [complianceResponse, policiesResponse] = await Promise.all([
        apiClient.get<any>('/legal/compliance'),
        apiClient.get<any[]>('/legal/compliance/policies')
      ])
      
      if (complianceResponse.success && complianceResponse.data) {
        setComplianceData(complianceResponse.data as any)
      } else {
        setComplianceData({})
        if (!complianceResponse.success) {
          toast.error('Failed to load compliance data')
          setError('Failed to load compliance data')
        }
      }
      
      if (policiesResponse.success && policiesResponse.data) {
        setPolicies(policiesResponse.data as any[])
      } else {
        setPolicies([])
        if (!policiesResponse.success) {
          toast.error('Failed to load compliance policies')
        }
      }
    } catch (error: any) {
      console.error('Failed to load legal compliance data:', error)
      setComplianceData({})
      setPolicies([])
      setError('Failed to load legal compliance data')
      toast.error('Failed to load legal compliance data')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'non_compliant': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'draft': return 'bg-slate-100 text-slate-800 bg-white dark:text-slate-200'
      default: return 'bg-slate-100 text-slate-800 bg-white dark:text-slate-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="h-4 w-4" />
      case 'non_compliant': return <XCircle className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'active': return <CheckCircle className="h-4 w-4" />
      case 'draft': return <FileText className="h-4 w-4" />
      default: return <Info className="h-4 w-4" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Data Protection': return <Shield className="h-4 w-4" />
      case 'Financial': return <BarChart3 className="h-4 w-4" />
      case 'Security': return <Lock className="h-4 w-4" />
      case 'HR': return <Users className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatPercentage = (value: number) => {
    if (!value || isNaN(value)) return '0%'
    return `${value.toFixed(1)}%`
  }

  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = (policy.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (policy.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (policy.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || policy.status === filter
    return matchesSearch && matchesFilter
  })

  const handleViewRegulation = (regulation: any) => {
    toast.info(`Viewing regulation: ${regulation.name}`)
  }

  const handleViewPolicy = (policy: any) => {
    toast.info(`Viewing policy: ${policy.name}`)
  }

  const handleDownloadPolicy = (policy: any) => {
    toast.success(`Downloading policy: ${policy.name}`)
  }

  const handleGenerateReport = () => {
    toast.success('Generating compliance report...')
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <SnowCard className="w-full max-w-md">
          <SnowCardHeader>
            <SnowCardTitle className="text-red-600">Error Loading Compliance Data</SnowCardTitle>
            <SnowCardDescription>{error}</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <SnowButton onClick={loadComplianceData} className="w-full">
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
          <p className="text-muted-foreground">Loading compliance data...</p>
        </div>
      </div>
    )
  }

  if (!complianceData) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 text-slate-900">
            Legal Compliance
          </h1>
          <p className="text-slate-600 text-slate-600">
            Monitor regulatory compliance and policy management
          </p>
        </div>
        <div className="flex gap-2">
          <SnowButton variant="outline" onClick={handleGenerateReport}>
            <Download className="h-4 w-4 mr-2" />
            Generate Report
          </SnowButton>
          <SnowButton>
            <Plus className="h-4 w-4 mr-2" />
            Add Policy
          </SnowButton>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Scale className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">Total Regulations</p>
                <p className="text-2xl font-bold">{complianceData.overview?.totalRegulations || 0}</p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">Compliant</p>
                <p className="text-2xl font-bold">{complianceData.overview?.compliantRegulations || 0}</p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ShieldX className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">Non-Compliant</p>
                <p className="text-2xl font-bold">{complianceData.overview?.nonCompliantRegulations || 0}</p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">Compliance Score</p>
                <p className="text-2xl font-bold">{formatPercentage(complianceData.overview?.complianceScore || 0)}</p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
      <div className="flex space-x-1 bg-slate-100 bg-slate-100 p-1 rounded-lg">
        <SnowButton
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'overview'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Compliance Overview
        </SnowButton>
        <SnowButton
          onClick={() => setActiveTab('policies')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'policies'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Policies
        </SnowButton>
      </div>
      {activeTab === 'overview' && (
        <>
          <SnowCard>
            <SnowCardHeader>
              <SnowCardTitle>Compliance by Category</SnowCardTitle>
              <SnowCardDescription>Regulatory compliance status by category</SnowCardDescription>
            </SnowCardHeader>
            <SnowCardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {complianceData.categories?.map((category: any) => (
                  <div key={category.name} className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      {getCategoryIcon(category.name)}
                      <h3 className="font-medium">{category.name}</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Total:</span>
                        <span className="font-medium">{category.count}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Compliant:</span>
                        <span className="font-medium">{category.compliant}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-red-600">Non-Compliant:</span>
                        <span className="font-medium">{category.nonCompliant || 0}</span>
                      </div>
                      {category.pending && (
                        <div className="flex justify-between text-sm">
                          <span className="text-yellow-600">Pending:</span>
                          <span className="font-medium">{category.pending}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </SnowCardContent>
          </SnowCard>
          <SnowCard>
            <SnowCardHeader>
              <SnowCardTitle>Regulatory Compliance</SnowCardTitle>
              <SnowCardDescription>Detailed compliance status for each regulation</SnowCardDescription>
            </SnowCardHeader>
            <SnowCardContent>
              <div className="space-y-4">
                {complianceData.regulations?.map((regulation: any) => (
                  <div key={regulation.id} className="border rounded-lg p-6 hover:bg-slate-50 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                          <Scale className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold">{regulation.name}</h3>
                            <Badge className={getStatusColor(regulation.status)}>
                              {getStatusIcon(regulation.status)}
                              <span className="ml-1">{regulation.status?.replace('_', ' ')}</span>
                            </Badge>
                          </div>
                          <p className="text-slate-600 text-slate-600 mb-3">
                            {regulation.description}
                          </p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="font-medium">Region</p>
                              <p className="text-slate-500">{regulation.region}</p>
                            </div>
                            <div>
                              <p className="font-medium">Category</p>
                              <p className="text-slate-500">{regulation.category}</p>
                            </div>
                            <div>
                              <p className="font-medium">Compliance Score</p>
                              <p className="font-medium">{formatPercentage(regulation.score)}</p>
                            </div>
                            <div>
                              <p className="font-medium">Requirements</p>
                              <p className="text-slate-500">{regulation.metRequirements}/{regulation.requirements}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 mt-4 text-sm">
                            <div>
                              <span className="text-slate-500">Last Review:</span>
                              <span className="ml-1">{formatDate(regulation.lastReview)}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">Next Review:</span>
                              <span className="ml-1">{formatDate(regulation.nextReview)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <SnowButton
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewRegulation(regulation)}
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
        </>
      )}
      {activeTab === 'policies' && (
        <>
          <SnowCard>
            <SnowCardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <SnowInput
                      placeholder="Search policies..."
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
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                  <SnowButton variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    More Filters
                  </SnowButton>
                </div>
              </div>
            </SnowCardContent>
          </SnowCard>
          <SnowCard>
            <SnowCardHeader>
              <SnowCardTitle>Policies & Procedures</SnowCardTitle>
              <SnowCardDescription>Manage organizational policies and compliance documents</SnowCardDescription>
            </SnowCardHeader>
            <SnowCardContent>
              <div className="space-y-4">
                {filteredPolicies.map((policy) => (
                  <div key={policy.id} className="border rounded-lg p-6 hover:bg-slate-50 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                          <FileText className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold">{policy.name}</h3>
                            <Badge className={getStatusColor(policy.status)}>
                              {getStatusIcon(policy.status)}
                              <span className="ml-1">{policy.status}</span>
                            </Badge>
                            <Badge variant="outline">
                              v{policy.version}
                            </Badge>
                          </div>
                          <p className="text-slate-600 text-slate-600 mb-3">
                            {policy.description}
                          </p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="font-medium">Category</p>
                              <p className="text-slate-500">{policy.category}</p>
                            </div>
                            <div>
                              <p className="font-medium">Compliance</p>
                              <p className="text-slate-500">{policy.compliance}</p>
                            </div>
                            <div>
                              <p className="font-medium">Approved By</p>
                              <p className="text-slate-500">{policy.approvedBy}</p>
                            </div>
                            <div>
                              <p className="font-medium">Last Updated</p>
                              <p className="text-slate-500">{formatDate(policy.lastUpdated)}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 mt-4 text-sm">
                            <div>
                              <span className="text-slate-500">Next Review:</span>
                              <span className="ml-1">{formatDate(policy.nextReview)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <SnowButton
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewPolicy(policy)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </SnowButton>
                        <SnowButton
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadPolicy(policy)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </SnowButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SnowCardContent>
          </SnowCard>
        </>
      )}
    </div>
  )
}



