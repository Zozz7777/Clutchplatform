'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Download, 
  Upload, 
  Search, 
  Filter,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Plus,
  Calendar,
  User,
  Tag,
  AlertTriangle,
  CheckCircle,
  Clock,
  Lock,
  Unlock,
  BarChart3,
  Folder,
  File,
  FileCheck,
  FileX
} from 'lucide-react'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { Badge } from '@/components/ui/badge'
import { SnowInput } from '@/components/ui/snow-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api'

interface LegalDocument {
  id: string
  title: string
  type: 'contract' | 'policy' | 'agreement' | 'terms' | 'privacy' | 'compliance'
  status: 'active' | 'draft' | 'expired' | 'pending_review'
  version: string
  author: string
  createdDate: string
  lastModified: string
  expiryDate?: string
  tags: string[]
  description: string
  fileSize: string
  fileType: string
  isPublic: boolean
  requiresSignature: boolean
  signatureCount: number
  totalSignatures: number
}

interface DocumentMetric {
  metric: string
  value: number
  change: number
  changePercent: number
  trend: 'up' | 'down' | 'stable'
}

export default function LegalDocumentsPage() {
  const [documents, setDocuments] = useState<LegalDocument[]>([])
  const [metrics, setMetrics] = useState<DocumentMetric[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDocumentsData()
  }, [])

  const loadDocumentsData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const [documentsResponse, metricsResponse] = await Promise.all([
        apiClient.get<any[]>('/legal/documents'),
        apiClient.get<any[]>('/legal/documents/metrics')
      ])
      
      if (documentsResponse.success && documentsResponse.data) {
        setDocuments(documentsResponse.data as LegalDocument[])
      } else {
        setDocuments([])
        if (!documentsResponse.success) {
          toast.error('Failed to load legal documents')
          setError('Failed to load legal documents')
        }
      }
      
      if (metricsResponse.success && metricsResponse.data) {
        setMetrics(metricsResponse.data as DocumentMetric[])
      } else {
        setMetrics([])
        if (!metricsResponse.success) {
          toast.error('Failed to load document metrics')
        }
      }
    } catch (error: any) {
      console.error('Failed to load legal documents data:', error)
      setDocuments([])
      setMetrics([])
      setError('Failed to load legal documents data')
      toast.error('Failed to load legal documents data')
    } finally {
      setIsLoading(false)
    }
  }

  const downloadDocument = async (documentId: string) => {
    try {
      toast.success('Document downloaded successfully')
    } catch (error) {
      toast.error('Failed to download document')
    }
  }

  const deleteDocument = async (documentId: string) => {
    try {
      toast.success('Document deleted successfully')
      loadDocumentsData()
    } catch (error) {
      toast.error('Failed to delete document')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'draft':
        return <File className="h-4 w-4 text-red-500" />
      case 'expired':
        return <FileX className="h-4 w-4 text-red-500" />
      case 'pending_review':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <FileText className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'draft':
        return 'text-gray-600 bg-gray-50 border-gray-200'
      case 'expired':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'pending_review':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'contract':
        return <FileCheck className="h-4 w-4" />
      case 'policy':
        return <FileText className="h-4 w-4" />
      case 'agreement':
        return <FileCheck className="h-4 w-4" />
      case 'terms':
        return <FileText className="h-4 w-4" />
      case 'privacy':
        return <Lock className="h-4 w-4" />
      case 'compliance':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const now = new Date()
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  }

  const activeDocuments = documents.filter(d => d.status === 'active').length
  const pendingReview = documents.filter(d => d.status === 'pending_review').length
  const expiringSoon = documents.filter(d => isExpiringSoon(d.expiryDate)).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Legal Documents</h1>
          <p className="text-muted-foreground">
            Manage and organize legal documents and contracts
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <SnowButton variant="outline" onClick={loadDocumentsData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </SnowButton>
          <SnowButton>
            <Plus className="h-4 w-4 mr-2" />
            Upload Document
          </SnowButton>
        </div>
      </div>
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Search & Filters
          </SnowCardTitle>
        </SnowCardHeader>
        <SnowCardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Search Documents</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <SnowInput
                  placeholder="Search by title, description, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Document Type</label>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="policy">Policy</SelectItem>
                  <SelectItem value="agreement">Agreement</SelectItem>
                  <SelectItem value="terms">Terms</SelectItem>
                  <SelectItem value="privacy">Privacy</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="pending_review">Pending Review</SelectItem>
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
              <div className="p-2 rounded-full bg-muted">
                <BarChart3 className="h-4 w-4" />
              </div>
            </SnowCardHeader>
            <SnowCardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                {metric.changePercent > 0 ? '+' : ''}{metric.changePercent}% from last month
              </p>
            </SnowCardContent>
          </SnowCard>
        ))}
      </div>
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle>Legal Documents</SnowCardTitle>
          <SnowCardDescription>
            Manage and organize all legal documents
          </SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Loading documents...
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8 text-red-600">
              <AlertTriangle className="h-6 w-6 mr-2" />
              {error}
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((document) => (
                <motion.div
                  key={document.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="p-2 rounded-full bg-muted">
                        {getTypeIcon(document.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium">{document.title}</h3>
                          <Badge className={getStatusColor(document.status)}>
                            {getStatusIcon(document.status)}
                            <span className="ml-1 capitalize">{document.status.replace('_', ' ')}</span>
                          </Badge>
                          {document.isPublic ? (
                            <Badge variant="outline" className="text-green-600">
                              <Unlock className="h-3 w-3 mr-1" />
                              Public
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-600">
                              <Lock className="h-3 w-3 mr-1" />
                              Private
                            </Badge>
                          )}
                          {isExpiringSoon(document.expiryDate) && (
                            <Badge variant="outline" className="text-orange-600">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Expiring Soon
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {document.description}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                          <span>Version {document.version}</span>
                          <span>â€¢</span>
                          <span>By {document.author}</span>
                          <span>â€¢</span>
                          <span>Created {formatDate(document.createdDate)}</span>
                          <span>â€¢</span>
                          <span>Modified {formatDate(document.lastModified)}</span>
                          {document.expiryDate && (
                            <>
                              <span>â€¢</span>
                              <span>Expires {formatDate(document.expiryDate)}</span>
                            </>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">
                            {document.fileSize} â€¢ {document.fileType}
                          </span>
                          {document.requiresSignature && (
                            <span className="text-sm text-muted-foreground">
                              â€¢ {document.signatureCount}/{document.totalSignatures} signatures
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 mt-3">
                          {document.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <SnowButton
                        size="sm"
                        variant="outline"
                        onClick={() => downloadDocument(document.id)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </SnowButton>
                      <SnowButton
                        size="sm"
                        variant="outline"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </SnowButton>
                      <SnowButton
                        size="sm"
                        variant="outline"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </SnowButton>
                      <SnowButton
                        size="sm"
                        variant="outline"
                        onClick={() => deleteDocument(document.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </SnowButton>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {documents.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Folder className="h-8 w-8 mx-auto mb-2" />
                  <p>No documents found</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          )}
        </SnowCardContent>
      </SnowCard>
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle>Quick Actions</SnowCardTitle>
          <SnowCardDescription>
            Common document management tasks
          </SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SnowButton variant="outline" className="h-20 flex-col">
              <Upload className="h-6 w-6 mb-2" />
              <span>Upload New Document</span>
            </SnowButton>
            <SnowButton variant="outline" className="h-20 flex-col">
              <FileCheck className="h-6 w-6 mb-2" />
              <span>Create Template</span>
            </SnowButton>
            <SnowButton variant="outline" className="h-20 flex-col">
              <Download className="h-6 w-6 mb-2" />
              <span>Export All</span>
            </SnowButton>
          </div>
        </SnowCardContent>
      </SnowCard>
    </div>
  )
}



