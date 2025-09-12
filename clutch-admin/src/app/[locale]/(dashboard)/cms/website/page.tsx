'use client'

import React, { useState, useEffect } from 'react'
import { SnowCard, SnowCardHeader, SnowCardContent, SnowCardTitle, SnowCardDescription } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowInput, SnowSearchInput } from '@/components/ui/snow-input'
import { Badge } from '@/components/ui/badge'
import { 
  Globe, 
  FileText, 
  Image, 
  Video, 
  Edit, 
  Eye, 
  Trash2, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Tag, 
  ExternalLink,
  Upload,
  Download,
  RefreshCw,
  Settings,
  Check,
  X,
  Clock,
  TrendingUp,
  Users,
  MousePointer
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

interface ContentMetrics {
  totalPages: number
  publishedPages: number
  draftPages: number
  totalViews: number
  avgViewsPerPage: number
  seoScore: number
  lastUpdated: string
}

interface WebContent {
  id: string
  title: string
  slug: string
  type: 'page' | 'blog' | 'help' | 'legal'
  status: 'draft' | 'published' | 'archived'
  content: string
  excerpt: string
  featuredImage?: string
  author: {
    id: string
    name: string
    email: string
  }
  seo: {
    title: string
    description: string
    keywords: string[]
    metaTitle?: string
    metaDescription?: string
  }
  analytics: {
    views: number
    uniqueViews: number
    avgTimeOnPage: number
    bounceRate: number
  }
  createdAt: string
  updatedAt: string
  publishedAt?: string
  tags: string[]
  category: string
  lastModifiedBy: string
}

export default function WebsiteContentPage() {
  const [content, setContent] = useState<WebContent[]>([])
  const [metrics, setMetrics] = useState<ContentMetrics>({
    totalPages: 0,
    publishedPages: 0,
    draftPages: 0,
    totalViews: 0,
    avgViewsPerPage: 0,
    seoScore: 0,
    lastUpdated: ''
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    loadContentData()
  }, [])

  const loadContentData = async () => {
    try {
      setIsLoading(true)
      
      const [contentResponse, metricsResponse] = await Promise.all([
        apiClient.get<WebContent[]>('/cms/content'),
        apiClient.get<ContentMetrics>('/cms/metrics')
      ])

      if (contentResponse.success && contentResponse.data) {
        setContent(contentResponse.data)
      }

      if (metricsResponse.success && metricsResponse.data) {
        setMetrics(metricsResponse.data)
      }
    } catch (error) {
      console.error('Failed to load content data:', error)
      toast.error('Failed to load content data')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500'
      case 'draft': return 'bg-yellow-500'
      case 'archived': return 'bg-red-500'
      default: return 'bg-red-500'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'page': return <Globe className="h-4 w-4" />
      case 'blog': return <FileText className="h-4 w-4" />
      case 'help': return <FileText className="h-4 w-4" />
      case 'legal': return <FileText className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-GB').format(num)
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    const matchesType = typeFilter === 'all' || item.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Website Content Management</h1>
          <p className="text-muted-foreground">
            Manage website pages, blog posts, and help documentation
          </p>
        </div>
        <div className="flex gap-3">
          <SnowButton variant="outline" onClick={loadContentData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </SnowButton>
          <SnowButton variant="default" >
            <Plus className="h-4 w-4 mr-2" />
            New Content
          </SnowButton>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SnowCard variant="dark" >
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Pages</p>
                <p className="text-2xl font-bold text-white">{metrics.totalPages}</p>
                <p className="text-blue-100 text-xs">
                  {metrics.publishedPages} published
                </p>
              </div>
              <Globe className="h-8 w-8 text-blue-200" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard variant="dark" >
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Views</p>
                <p className="text-2xl font-bold text-white">{formatNumber(metrics.totalViews)}</p>
                <p className="text-green-100 text-xs">
                  {formatNumber(metrics.avgViewsPerPage)} avg per page
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-200" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard variant="dark" >
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">SEO Score</p>
                <p className="text-2xl font-bold text-white">{metrics.seoScore}%</p>
                <p className="text-purple-100 text-xs">
                  Average across all pages
                </p>
              </div>
              <Search className="h-8 w-8 text-purple-200" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard variant="dark" >
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Draft Pages</p>
                <p className="text-2xl font-bold text-white">{metrics.draftPages}</p>
                <p className="text-orange-100 text-xs">
                  Ready for review
                </p>
              </div>
              <FileText className="h-8 w-8 text-orange-200" />
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
      <SnowCard>
        <SnowCardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <SnowSearchInput
                placeholder="Search content, titles, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-700 rounded-lg bg-slate-800 text-white"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-slate-700 rounded-lg bg-slate-800 text-white"
            >
              <option value="all">All Types</option>
              <option value="page">Pages</option>
              <option value="blog">Blog Posts</option>
              <option value="help">Help Articles</option>
              <option value="legal">Legal Pages</option>
            </select>
          </div>
        </SnowCardContent>
      </SnowCard>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredContent.map((item) => (
          <SnowCard key={item.id}>
            <SnowCardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(item.type)}
                    <Badge variant="outline" className="text-xs">
                      {item.type}
                    </Badge>
                  </div>
                  <Badge className={`${getStatusColor(item.status)} text-white`}>
                    {item.status}
                  </Badge>
                </div>
                {item.featuredImage && (
                  <div className="w-full h-32 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                    <img src={item.featuredImage} alt={item.title} className="w-full h-full object-cover rounded-lg" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">{item.excerpt}</p>
                </div>
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {item.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{item.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center p-2 bg-slate-50 bg-slate-100 rounded">
                    <p className="font-medium">{formatNumber(item.analytics.views)}</p>
                    <p className="text-muted-foreground">Views</p>
                  </div>
                  <div className="text-center p-2 bg-slate-50 bg-slate-100 rounded">
                    <p className="font-medium">{formatDuration(item.analytics.avgTimeOnPage)}</p>
                    <p className="text-muted-foreground">Avg Time</p>
                  </div>
                  <div className="text-center p-2 bg-slate-50 bg-slate-100 rounded">
                    <p className="font-medium">{item.analytics.bounceRate}%</p>
                    <p className="text-muted-foreground">Bounce</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <User className="h-3 w-3" />
                    <span>{item.author.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-3 w-3" />
                    <span>Updated {new Date(item.updatedAt).toLocaleDateString()}</span>
                  </div>
                  {item.publishedAt && (
                    <div className="flex items-center space-x-2">
                      <Check className="h-3 w-3" />
                      <span>Published {new Date(item.publishedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2 pt-4 border-t border-slate-200 border-slate-200">
                  <SnowButton variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </SnowButton>
                  <SnowButton variant="outline" size="sm" className="flex-1">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </SnowButton>
                  <SnowButton variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </SnowButton>
                </div>
              </div>
            </SnowCardContent>
          </SnowCard>
        ))}
      </div>
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle icon={<Settings className="h-5 w-5 text-blue-400" />}>
            Content Management Tools
          </SnowCardTitle>
          <SnowCardDescription>Quick access to content management features</SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <SnowButton variant="outline" className="h-auto p-4 flex-col items-start">
              <Upload className="h-6 w-6 mb-2 text-blue-500" />
              <div className="text-left">
                <p className="font-medium">Media Upload</p>
                <p className="text-xs text-muted-foreground">Upload images and videos</p>
              </div>
            </SnowButton>
            
            <SnowButton variant="outline" className="h-auto p-4 flex-col items-start">
              <Search className="h-6 w-6 mb-2 text-green-500" />
              <div className="text-left">
                <p className="font-medium">SEO Audit</p>
                <p className="text-xs text-muted-foreground">Check SEO performance</p>
              </div>
            </SnowButton>
            
            <SnowButton variant="outline" className="h-auto p-4 flex-col items-start">
              <Download className="h-6 w-6 mb-2 text-purple-500" />
              <div className="text-left">
                <p className="font-medium">Export Content</p>
                <p className="text-xs text-muted-foreground">Backup all content</p>
              </div>
            </SnowButton>
            
            <SnowButton variant="outline" className="h-auto p-4 flex-col items-start">
              <TrendingUp className="h-6 w-6 mb-2 text-orange-500" />
              <div className="text-left">
                <p className="font-medium">Analytics Report</p>
                <p className="text-xs text-muted-foreground">View detailed analytics</p>
              </div>
            </SnowButton>
          </div>
        </SnowCardContent>
      </SnowCard>
    </div>
  )
}


