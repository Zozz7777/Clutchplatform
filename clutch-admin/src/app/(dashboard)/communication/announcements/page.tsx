'use client'

import React, { useState, useEffect } from 'react'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { Badge } from '@/components/ui/badge'
import { SnowInput } from '@/components/ui/snow-input'
import { 
  Megaphone,
  Bell,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Send,
  Pause,
  Play,
  Target,
  MessageSquare,
  Mail,
  Smartphone,
  Monitor,
  Tablet,
  RefreshCw,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Info,
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
  Flag,
  AlertTriangle,
  Clipboard,
  ClipboardCheck,
  ClipboardX,
  Globe,
  MapPin,
  Building,
  UserCheck,
  UserX,
  UserPlus,
  Download,
  FileText,
  Archive,
  Star,
  Shield,
  Code
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

export default function CommunicationAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isFormLoading, setIsFormLoading] = useState(false)

  useEffect(() => {
    loadAnnouncements()
  }, [])

  const loadAnnouncements = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.get('/communication/announcements')
      if (response.success && response.data) {
        setAnnouncements(response.data as any[])
      } else {
        setAnnouncements([])
        if (!response.success) {
          toast.error('Failed to load announcements')
          setError('Failed to load announcements')
        }
      }
    } catch (error: any) {
      console.error('Failed to load announcements:', error)
      setError('Failed to load announcements')
      setAnnouncements([])
      toast.error('Failed to load announcements')
    } finally {
      setIsLoading(false)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'maintenance': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'feature': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'security': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'general': return 'bg-slate-100 text-slate-800 bg-white dark:text-slate-200'
      case 'technical': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default: return 'bg-slate-100 text-slate-800 bg-white dark:text-slate-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default: return 'bg-slate-100 text-slate-800 bg-white dark:text-slate-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'draft': return 'bg-slate-100 text-slate-800 bg-white dark:text-slate-200'
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default: return 'bg-slate-100 text-slate-800 bg-white dark:text-slate-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircle className="h-4 w-4" />
      case 'scheduled': return <Clock className="h-4 w-4" />
      case 'draft': return <FileText className="h-4 w-4" />
      case 'archived': return <Archive className="h-4 w-4" />
      default: return <Info className="h-4 w-4" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'maintenance': return <Settings className="h-4 w-4" />
      case 'feature': return <Star className="h-4 w-4" />
      case 'security': return <Shield className="h-4 w-4" />
      case 'general': return <Info className="h-4 w-4" />
      case 'technical': return <Code className="h-4 w-4" />
      default: return <Megaphone className="h-4 w-4" />
    }
  }

  const getAudienceIcon = (audience: string) => {
    switch (audience) {
      case 'all_users': return <Users className="h-4 w-4" />
      case 'premium_users': return <Award className="h-4 w-4" />
      case 'developers': return <Code className="h-4 w-4" />
      case 'admins': return <Shield className="h-4 w-4" />
      default: return <Users className="h-4 w-4" />
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

  const formatPercentage = (value: number) => {
    if (!value || isNaN(value)) return '0%'
    return `${value.toFixed(1)}%`
  }

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.author?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || announcement.status === filter
    return matchesSearch && matchesFilter
  })

  // Calculate metrics
  const totalAnnouncements = announcements.length
  const publishedAnnouncements = announcements.filter(a => a.status === 'published').length
  const scheduledAnnouncements = announcements.filter(a => a.status === 'scheduled').length
  const totalRecipients = announcements.reduce((sum, a) => sum + (a.totalRecipients || 0), 0)
  const avgEngagementRate = announcements.length > 0 
    ? announcements.reduce((sum, a) => sum + (a.engagementRate || 0), 0) / announcements.length 
    : 0

  const handleViewAnnouncement = async (announcement: any) => {
    try {
      const response = await apiClient.get(`/communication/announcements/${announcement._id}`)
      if (response.success) {
        setSelectedAnnouncement(response.data)
        setShowViewModal(true)
      } else {
        toast.error('Failed to load announcement details')
      }
    } catch (error) {
      console.error('Failed to load announcement details:', error)
      toast.error('Failed to load announcement details')
    }
  }

  const handleEditAnnouncement = async (announcement: any) => {
    try {
      const response = await apiClient.get(`/communication/announcements/${announcement._id}`)
      if (response.success) {
        setSelectedAnnouncement(response.data)
        setShowEditModal(true)
      } else {
        toast.error('Failed to load announcement for editing')
      }
    } catch (error) {
      console.error('Failed to load announcement for editing:', error)
      toast.error('Failed to load announcement for editing')
    }
  }

  const handleDeleteAnnouncement = async (announcement: any) => {
    if (confirm(`Are you sure you want to delete the announcement "${announcement.title}"?`)) {
      try {
        const response = await apiClient.delete(`/communication/announcements/${announcement._id}`)
        if (response.success) {
          toast.success('Announcement deleted successfully')
          loadAnnouncements() // Refresh the list
        } else {
          toast.error(response.message || 'Failed to delete announcement')
        }
      } catch (error) {
        console.error('Failed to delete announcement:', error)
        toast.error('Failed to delete announcement')
      }
    }
  }

  const handlePublishAnnouncement = async (announcement: any) => {
    try {
      const response = await apiClient.put(`/communication/announcements/${announcement._id}/publish`, {})
      if (response.success) {
        toast.success(`Publishing announcement: ${announcement.title}`)
        loadAnnouncements() // Refresh the list
      } else {
        toast.error(response.message || 'Failed to publish announcement')
      }
    } catch (error) {
      console.error('Failed to publish announcement:', error)
      toast.error('Failed to publish announcement')
    }
  }

  const handleScheduleAnnouncement = async (announcement: any, scheduledDate: string) => {
    try {
      const response = await apiClient.put(`/communication/announcements/${announcement._id}/schedule`, {
        scheduledDate
      })
      if (response.success) {
        toast.success(`Scheduling announcement: ${announcement.title}`)
        loadAnnouncements() // Refresh the list
      } else {
        toast.error(response.message || 'Failed to schedule announcement')
      }
    } catch (error) {
      console.error('Failed to schedule announcement:', error)
      toast.error('Failed to schedule announcement')
    }
  }

  const handleAddAnnouncement = async (announcementData: any) => {
    setIsFormLoading(true)
    try {
      const response = await apiClient.post('/communication/announcements', announcementData)
      if (response.success) {
        toast.success('Announcement created successfully')
        setShowAddModal(false)
        loadAnnouncements()
      } else {
        toast.error(response.message || 'Failed to create announcement')
      }
    } catch (error: any) {
      console.error('Failed to create announcement:', error)
      toast.error('Failed to create announcement')
    } finally {
      setIsFormLoading(false)
    }
  }

  const handleUpdateAnnouncement = async (announcementData: any) => {
    setIsFormLoading(true)
    try {
      const response = await apiClient.put(`/communication/announcements/${selectedAnnouncement._id}`, announcementData)
      if (response.success) {
        toast.success('Announcement updated successfully')
        setShowEditModal(false)
        setSelectedAnnouncement(null)
        loadAnnouncements()
      } else {
        toast.error(response.message || 'Failed to update announcement')
      }
    } catch (error: any) {
      console.error('Failed to update announcement:', error)
      toast.error('Failed to update announcement')
    } finally {
      setIsFormLoading(false)
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <SnowCard className="w-full max-w-md">
          <SnowCardHeader>
            <SnowCardTitle className="text-red-600">Error Loading Announcements</SnowCardTitle>
            <SnowCardDescription>{error}</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <SnowButton onClick={loadAnnouncements} className="w-full">
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
          <p className="text-muted-foreground">Loading announcements...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 text-slate-900">
            Announcements
          </h1>
          <p className="text-slate-600 text-slate-600">
            Manage and publish announcements to your users
          </p>
        </div>
        <div className="flex gap-2">
          <SnowButton variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </SnowButton>
          <SnowButton>
            <Plus className="h-4 w-4 mr-2" />
            Create Announcement
          </SnowButton>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Megaphone className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">Total Announcements</p>
                <p className="text-2xl font-bold">{totalAnnouncements}</p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">Published</p>
                <p className="text-2xl font-bold">{publishedAnnouncements}</p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">Scheduled</p>
                <p className="text-2xl font-bold">{scheduledAnnouncements}</p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">Total Recipients</p>
                <p className="text-2xl font-bold">{totalRecipients.toLocaleString()}</p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
      <SnowCard>
        <SnowCardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <SnowInput
                  placeholder="Search announcements..."
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
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
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
          <SnowCardTitle>Announcements</SnowCardTitle>
          <SnowCardDescription>Manage your announcements and track engagement</SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          <div className="space-y-4">
            {filteredAnnouncements.map((announcement) => (
              <div key={announcement.id} className="border rounded-lg p-6 hover:bg-slate-50 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      {getTypeIcon(announcement.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{announcement.title}</h3>
                        <Badge className={getTypeColor(announcement.type)}>
                          {announcement.type}
                        </Badge>
                        <Badge className={getPriorityColor(announcement.priority)}>
                          {announcement.priority}
                        </Badge>
                        <Badge className={getStatusColor(announcement.status)}>
                          {getStatusIcon(announcement.status)}
                          <span className="ml-1">{announcement.status}</span>
                        </Badge>
                      </div>
                      <p className="text-slate-600 text-slate-600 mb-3 line-clamp-2">
                        {announcement.content}
                      </p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <p className="font-medium">Author</p>
                          <p className="text-slate-500">{announcement.author}</p>
                        </div>
                        <div>
                          <p className="font-medium">Audience</p>
                          <div className="flex items-center space-x-1 text-slate-500">
                            {getAudienceIcon(announcement.audience)}
                            <span>{announcement.audience?.replace('_', ' ')}</span>
                          </div>
                        </div>
                        <div>
                          <p className="font-medium">Channels</p>
                          <p className="text-slate-500">{announcement.channels?.join(', ')}</p>
                        </div>
                        <div>
                          <p className="font-medium">Engagement</p>
                          <p className="font-medium">{formatPercentage(announcement.engagementRate)}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm">
                        <div>
                          <span className="text-slate-500">Published:</span>
                          <span className="ml-1">
                            {announcement.publishedAt ? formatDate(announcement.publishedAt) : 'Not published'}
                          </span>
                        </div>
                        {announcement.scheduledFor && (
                          <div>
                            <span className="text-slate-500">Scheduled:</span>
                            <span className="ml-1">{formatDate(announcement.scheduledFor)}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-slate-500">Expires:</span>
                          <span className="ml-1">{formatDate(announcement.expiresAt)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Read:</span>
                          <span className="ml-1">{announcement.readCount}/{announcement.totalRecipients}</span>
                        </div>
                      </div>

                      {announcement.tags && announcement.tags.length > 0 && (
                        <div className="flex items-center space-x-2 mt-3">
                          <span className="text-sm text-slate-500">Tags:</span>
                          {announcement.tags.map((tag: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <SnowButton
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewAnnouncement(announcement)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </SnowButton>
                    {announcement.status === 'draft' && (
                      <SnowButton
                        size="sm"
                        variant="outline"
                        onClick={() => handlePublishAnnouncement(announcement)}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Publish
                      </SnowButton>
                    )}
                    {announcement.status === 'draft' && (
                      <SnowButton
                        size="sm"
                        variant="outline"
                        onClick={() => handleScheduleAnnouncement(announcement, new Date().toISOString())}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule
                      </SnowButton>
                    )}
                    <SnowButton
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditAnnouncement(announcement)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </SnowButton>
                    <SnowButton
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteAnnouncement(announcement)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </SnowButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SnowCardContent>
      </SnowCard>
    </div>
  )
}



