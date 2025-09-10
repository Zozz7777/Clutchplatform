'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Megaphone,
  Search,
  Filter,
  Plus,
  Edit,
  Eye,
  Trash2,
  Calendar,
  Clock,
  Users,
  User,
  Target,
  Globe,
  Building,
  Send,
  Schedule,
  AlertCircle,
  CheckCircle,
  XCircle,
  Star,
  MessageSquare,
  FileText,
  Link,
  Bell
} from 'lucide-react'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowInput } from '@/components/ui/snow-input'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Modal } from '@/components/ui/modal'
import { useStore } from '@/store'
import { formatDate, formatDateTime } from '@/lib/utils'

interface Announcement {
  id: string
  title: string
  content: string
  type: 'company' | 'department' | 'targeted' | 'urgent'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'draft' | 'scheduled' | 'published' | 'archived'
  authorId: string
  authorName: string
  targetAudience: string[]
  departments: string[]
  publishDate: string
  expiryDate?: string
  isPinned: boolean
  attachments: string[]
  readCount: number
  createdAt: Date
  updatedAt: Date
}

interface AnnouncementFormData {
  title: string
  content: string
  type: 'company' | 'department' | 'targeted' | 'urgent'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  authorId: string
  authorName: string
  targetAudience: string[]
  departments: string[]
  publishDate: string
  expiryDate?: string
  isPinned: boolean
  attachments: string[]
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)
  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: '',
    content: '',
    type: 'company',
    priority: 'normal',
    authorId: '',
    authorName: '',
    targetAudience: [],
    departments: [],
    publishDate: '',
    expiryDate: '',
    isPinned: false,
    attachments: []
  })

  useEffect(() => {
    // TODO: Fetch announcements from API
    const mockAnnouncements: Announcement[] = [
      {
        id: '1',
        title: 'Company Holiday Schedule 2024',
        content: 'Please review the updated holiday schedule for 2024. All offices will be closed on the following dates...',
        type: 'company',
        priority: 'normal',
        status: 'published',
        authorId: '1',
        authorName: 'HR Department',
        targetAudience: ['all'],
        departments: ['all'],
        publishDate: '2024-01-01T00:00:00Z',
        isPinned: true,
        attachments: [],
        readCount: 1250,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: '2',
        title: 'New Office Opening - Downtown Location',
        content: 'We are excited to announce the opening of our new downtown office location. The grand opening will be...',
        type: 'company',
        priority: 'high',
        status: 'published',
        authorId: '1',
        authorName: 'Executive Team',
        targetAudience: ['all'],
        departments: ['all'],
        publishDate: '2024-01-10T00:00:00Z',
        isPinned: false,
        attachments: ['office-map.pdf'],
        readCount: 890,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10')
      },
      {
        id: '3',
        title: 'IT Maintenance - System Downtime',
        content: 'Scheduled maintenance will occur this weekend. All systems will be unavailable from 2 AM to 6 AM EST...',
        type: 'department',
        priority: 'urgent',
        status: 'scheduled',
        authorId: '2',
        authorName: 'IT Department',
        targetAudience: ['employees'],
        departments: ['technology', 'operations'],
        publishDate: '2024-01-15T02:00:00Z',
        isPinned: true,
        attachments: [],
        readCount: 0,
        createdAt: new Date('2024-01-12'),
        updatedAt: new Date('2024-01-12')
      }
    ]
    setAnnouncements(mockAnnouncements)
  }, [])

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.authorName?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || announcement.status === statusFilter
    const matchesType = typeFilter === 'all' || announcement.type === typeFilter
    const matchesPriority = priorityFilter === 'all' || announcement.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesType && matchesPriority
  })

  const announcementStats = {
    total: announcements.length,
    published: announcements.filter(a => a.status === 'published').length,
    scheduled: announcements.filter(a => a.status === 'scheduled').length,
    draft: announcements.filter(a => a.status === 'draft').length,
    archived: announcements.filter(a => a.status === 'archived').length,
    company: announcements.filter(a => a.type === 'company').length,
    department: announcements.filter(a => a.type === 'department').length,
    urgent: announcements.filter(a => a.priority === 'urgent').length,
    pinned: announcements.filter(a => a.isPinned).length
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'published': return 'bg-green-100 text-green-800'
      case 'archived': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'company': return 'bg-blue-100 text-blue-800'
      case 'department': return 'bg-green-100 text-green-800'
      case 'targeted': return 'bg-purple-100 text-purple-800'
      case 'urgent': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'normal': return 'bg-blue-100 text-blue-800'
      case 'high': return 'bg-yellow-100 text-yellow-800'
      case 'urgent': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const isPublished = (announcement: Announcement) => {
    return announcement.status === 'published' && new Date(announcement.publishDate) <= new Date()
  }

  const isScheduled = (announcement: Announcement) => {
    return announcement.status === 'scheduled' && new Date(announcement.publishDate) > new Date()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // TODO: Implement API call
      const newAnnouncement: Announcement = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
        status: 'draft',
        readCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      setAnnouncements([...announcements, newAnnouncement])
      setShowAddModal(false)
      setFormData({
        title: '',
        content: '',
        type: 'company',
        priority: 'normal',
        authorId: '',
        authorName: '',
        targetAudience: [],
        departments: [],
        publishDate: '',
        expiryDate: '',
        isPinned: false,
        attachments: []
      })
    } catch (error) {
      console.error('Error creating announcement:', error)
    }
  }

  const handleView = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement)
    setShowViewModal(true)
  }

  const handlePublish = async (id: string) => {
    try {
      setAnnouncements(announcements.map(a => 
        a.id === id ? { ...a, status: 'published' as const, updatedAt: new Date() } : a
      ))
    } catch (error) {
      console.error('Error publishing announcement:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      try {
        setAnnouncements(announcements.filter(a => a.id !== id))
      } catch (error) {
        console.error('Error deleting announcement:', error)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Announcements</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage company-wide communications</p>
        </div>
        <SnowButton onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Announcement
        </SnowButton>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-9 gap-6">
        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{announcementStats.total}</p>
              </div>
              <Megaphone className="h-8 w-8 text-blue-600" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Published</p>
                <p className="text-2xl font-bold text-green-600">{announcementStats.published}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Scheduled</p>
                <p className="text-2xl font-bold text-blue-600">{announcementStats.scheduled}</p>
              </div>
              <Schedule className="h-8 w-8 text-blue-600" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Drafts</p>
                <p className="text-2xl font-bold text-gray-600">{announcementStats.draft}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-600" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Archived</p>
                <p className="text-2xl font-bold text-yellow-600">{announcementStats.archived}</p>
              </div>
              <XCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Company</p>
                <p className="text-2xl font-bold text-blue-600">{announcementStats.company}</p>
              </div>
              <Globe className="h-8 w-8 text-blue-600" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Department</p>
                <p className="text-2xl font-bold text-green-600">{announcementStats.department}</p>
              </div>
              <Building className="h-8 w-8 text-green-600" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Urgent</p>
                <p className="text-2xl font-bold text-red-600">{announcementStats.urgent}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pinned</p>
                <p className="text-2xl font-bold text-purple-600">{announcementStats.pinned}</p>
              </div>
              <Star className="h-8 w-8 text-purple-600" />
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>

      {/* Filters */}
      <SnowCard>
        <SnowCardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="company">Company</option>
                <option value="department">Department</option>
                <option value="targeted">Targeted</option>
                <option value="urgent">Urgent</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              <SnowButton variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                More Filters
              </SnowButton>
            </div>
          </div>
        </SnowCardContent>
      </SnowCard>

      {/* Announcements Table */}
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle>Announcements</SnowCardTitle>
          <SnowCardDescription>
            {filteredAnnouncements.length} announcements found
          </SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Announcement</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Publish Date</TableHead>
                <TableHead>Read Count</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAnnouncements.map((announcement) => (
                <TableRow key={announcement.id} className={announcement.isPinned ? 'bg-yellow-50' : ''}>
                  <TableCell>
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {announcement.title}
                        </div>
                        {announcement.isPinned && (
                          <Star className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {announcement.content}
                      </div>
                      {announcement.attachments.length > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <Link className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {announcement.attachments.length} attachment(s)
                          </span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900 dark:text-white">
                        {announcement.authorName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(announcement.type)}`}>
                      {announcement.type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(announcement.status)}`}>
                      {announcement.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(announcement.priority)}`}>
                      {announcement.priority}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="text-gray-900 dark:text-white">
                        {formatDate(announcement.publishDate)}
                      </div>
                      <div className="text-gray-500">
                        {formatDateTime(announcement.publishDate).split(' ')[1]}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-900 dark:text-white">
                      {announcement.readCount}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <SnowButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(announcement)}
                      >
                        <Eye className="h-4 w-4" />
                      </SnowButton>
                      {announcement.status === 'draft' && (
                        <SnowButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePublish(announcement.id)}
                        >
                          <Send className="h-4 w-4" />
                        </SnowButton>
                      )}
                      <SnowButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(announcement.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </SnowButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SnowCardContent>
      </SnowCard>

      {/* Create Announcement Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          setFormData({
            title: '',
            content: '',
            type: 'company',
            priority: 'normal',
            authorId: '',
            authorName: '',
            targetAudience: [],
            departments: [],
            publishDate: '',
            expiryDate: '',
            isPinned: false,
            attachments: []
          })
        }}
        title="Create Announcement"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title *
              </label>
              <SnowInput
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="company">Company</option>
                <option value="department">Department</option>
                <option value="targeted">Targeted</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Author Name *
              </label>
              <SnowInput
                value={formData.authorName}
                onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Publish Date *
              </label>
              <SnowInput
                type="datetime-local"
                value={formData.publishDate}
                onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Expiry Date
              </label>
              <SnowInput
                type="datetime-local"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Content *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <SnowInput
              type="checkbox"
              id="isPinned"
              checked={formData.isPinned}
              onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
              className="rounded border-gray-300"
            />
            <label htmlFor="isPinned" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Pin this announcement
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <SnowButton
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddModal(false)
                setFormData({
                  title: '',
                  content: '',
                  type: 'company',
                  priority: 'normal',
                  authorId: '',
                  authorName: '',
                  targetAudience: [],
                  departments: [],
                  publishDate: '',
                  expiryDate: '',
                  isPinned: false,
                  attachments: []
                })
              }}
            >
              Cancel
            </SnowButton>
            <SnowButton type="submit">
              Create Announcement
            </SnowButton>
          </div>
        </form>
      </Modal>

      {/* View Announcement Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedAnnouncement(null)
        }}
        title="Announcement Details"
      >
        {selectedAnnouncement && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedAnnouncement.title}
                  </h3>
                  {selectedAnnouncement.isPinned && (
                    <Star className="h-5 w-5 text-yellow-500" />
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Author: {selectedAnnouncement.authorName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Published: {formatDateTime(selectedAnnouncement.publishDate)}
                    </span>
                  </div>
                  {selectedAnnouncement.expiryDate && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        Expires: {formatDateTime(selectedAnnouncement.expiryDate)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Status</span>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedAnnouncement.status)}`}>
                        {selectedAnnouncement.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Type</span>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(selectedAnnouncement.type)}`}>
                        {selectedAnnouncement.type}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Priority</span>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(selectedAnnouncement.priority)}`}>
                        {selectedAnnouncement.priority}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Read Count</span>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedAnnouncement.readCount}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Content</span>
              <div className="mt-2 p-4 bg-gray-50 rounded-md">
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                  {selectedAnnouncement.content}
                </p>
              </div>
            </div>
            {selectedAnnouncement.attachments.length > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-500">Attachments</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedAnnouncement.attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-md"
                    >
                      <Link className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{attachment}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              {selectedAnnouncement.status === 'draft' && (
                <SnowButton
                  onClick={() => {
                    setShowViewModal(false)
                    handlePublish(selectedAnnouncement.id)
                  }}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Publish Now
                </SnowButton>
              )}
              <SnowButton
                onClick={() => {
                  setShowViewModal(false)
                  setSelectedAnnouncement(null)
                }}
              >
                Close
              </SnowButton>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

