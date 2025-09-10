'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Video,
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
  MapPin,
  Link,
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  Share,
  Download,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  MessageSquare
} from 'lucide-react'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowInput } from '@/components/ui/snow-input'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Modal } from '@/components/ui/modal'
import { useStore } from '@/store'
import { formatDate, formatDateTime } from '@/lib/utils'

interface Meeting {
  id: string
  title: string
  description: string
  startTime: string
  endTime: string
  duration: number
  type: 'internal' | 'client' | 'partner' | 'training'
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
  hostId: string
  hostName: string
  participants: string[]
  location: string
  meetingLink?: string
  recordingUrl?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

interface MeetingFormData {
  title: string
  description: string
  startTime: string
  endTime: string
  type: 'internal' | 'client' | 'partner' | 'training'
  hostId: string
  hostName: string
  participants: string[]
  location: string
  meetingLink?: string
  notes?: string
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [formData, setFormData] = useState<MeetingFormData>({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    type: 'internal',
    hostId: '',
    hostName: '',
    participants: [],
    location: '',
    meetingLink: '',
    notes: ''
  })

  useEffect(() => {
    // TODO: Fetch meetings from API
    const mockMeetings: Meeting[] = [
      {
        id: '1',
        title: 'Weekly Team Standup',
        description: 'Daily standup meeting for the development team',
        startTime: '2024-01-15T09:00:00Z',
        endTime: '2024-01-15T09:30:00Z',
        duration: 30,
        type: 'internal',
        status: 'scheduled',
        hostId: '1',
        hostName: 'John Doe',
        participants: ['1', '2', '3', '4'],
        location: 'Conference Room A',
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        notes: 'Discuss sprint progress and blockers'
      },
      {
        id: '2',
        title: 'Client Presentation',
        description: 'Present quarterly results to client',
        startTime: '2024-01-15T14:00:00Z',
        endTime: '2024-01-15T15:00:00Z',
        duration: 60,
        type: 'client',
        status: 'completed',
        hostId: '1',
        hostName: 'John Doe',
        participants: ['1', '5', '6'],
        location: 'Virtual Meeting',
        meetingLink: 'https://zoom.us/j/123456789',
        recordingUrl: 'https://example.com/recording.mp4',
        notes: 'Presentation went well, client was satisfied'
      }
    ]
    setMeetings(mockMeetings)
  }, [])

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meeting.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meeting.hostName?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || meeting.status === statusFilter
    const matchesType = typeFilter === 'all' || meeting.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const meetingStats = {
    total: meetings.length,
    scheduled: meetings.filter(m => m.status === 'scheduled').length,
    inProgress: meetings.filter(m => m.status === 'in-progress').length,
    completed: meetings.filter(m => m.status === 'completed').length,
    cancelled: meetings.filter(m => m.status === 'cancelled').length,
    internal: meetings.filter(m => m.type === 'internal').length,
    client: meetings.filter(m => m.type === 'client').length,
    partner: meetings.filter(m => m.type === 'partner').length
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'in-progress': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-purple-100 text-purple-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'internal': return 'bg-blue-100 text-blue-800'
      case 'client': return 'bg-green-100 text-green-800'
      case 'partner': return 'bg-yellow-100 text-yellow-800'
      case 'training': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const isUpcoming = (meeting: Meeting) => {
    return new Date(meeting.startTime) > new Date()
  }

  const isOngoing = (meeting: Meeting) => {
    const now = new Date()
    const start = new Date(meeting.startTime)
    const end = new Date(meeting.endTime)
    return now >= start && now <= end
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // TODO: Implement API call
      const newMeeting: Meeting = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
        duration: Math.round((new Date(formData.endTime).getTime() - new Date(formData.startTime).getTime()) / (1000 * 60)),
        status: 'scheduled',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      setMeetings([...meetings, newMeeting])
      setShowAddModal(false)
      setFormData({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        type: 'internal',
        hostId: '',
        hostName: '',
        participants: [],
        location: '',
        meetingLink: '',
        notes: ''
      })
    } catch (error) {
      console.error('Error creating meeting:', error)
    }
  }

  const handleView = (meeting: Meeting) => {
    setSelectedMeeting(meeting)
    setShowViewModal(true)
  }

  const handleJoin = (meeting: Meeting) => {
    setSelectedMeeting(meeting)
    setShowJoinModal(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this meeting?')) {
      try {
        setMeetings(meetings.filter(m => m.id !== id))
      } catch (error) {
        console.error('Error deleting meeting:', error)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Meetings</h1>
          <p className="text-gray-600 dark:text-gray-400">Schedule and manage team meetings</p>
        </div>
        <SnowButton onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Schedule Meeting
        </SnowButton>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-6">
        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Meetings</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{meetingStats.total}</p>
              </div>
              <Video className="h-8 w-8 text-blue-600" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Scheduled</p>
                <p className="text-2xl font-bold text-blue-600">{meetingStats.scheduled}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                <p className="text-2xl font-bold text-green-600">{meetingStats.inProgress}</p>
              </div>
              <VideoIcon className="h-8 w-8 text-green-600" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-purple-600">{meetingStats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">{meetingStats.cancelled}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Internal</p>
                <p className="text-2xl font-bold text-blue-600">{meetingStats.internal}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Client</p>
                <p className="text-2xl font-bold text-green-600">{meetingStats.client}</p>
              </div>
              <User className="h-8 w-8 text-green-600" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Partner</p>
                <p className="text-2xl font-bold text-yellow-600">{meetingStats.partner}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
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
                  placeholder="Search meetings..."
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
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="internal">Internal</option>
                <option value="client">Client</option>
                <option value="partner">Partner</option>
                <option value="training">Training</option>
              </select>
              <SnowButton variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                More Filters
              </SnowButton>
            </div>
          </div>
        </SnowCardContent>
      </SnowCard>

      {/* Meetings Table */}
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle>Meeting Schedule</SnowCardTitle>
          <SnowCardDescription>
            {filteredMeetings.length} meetings found
          </SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Meeting</TableHead>
                <TableHead>Host</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMeetings.map((meeting) => (
                <TableRow key={meeting.id} className={isOngoing(meeting) ? 'bg-green-50' : ''}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {meeting.title}
                      </div>
                      {meeting.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {meeting.description}
                        </div>
                      )}
                      {isOngoing(meeting) && (
                        <div className="text-xs text-green-600 font-medium mt-1">
                          LIVE NOW
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900 dark:text-white">
                        {meeting.hostName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(meeting.type)}`}>
                      {meeting.type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                      {meeting.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="text-gray-900 dark:text-white">
                        {formatDate(meeting.startTime)}
                      </div>
                      <div className="text-gray-500">
                        {formatDateTime(meeting.startTime).split(' ')[1]}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-900 dark:text-white">
                      {meeting.duration} min
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900 dark:text-white">
                        {meeting.location}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {isUpcoming(meeting) && meeting.meetingLink && (
                        <SnowButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleJoin(meeting)}
                        >
                          <Video className="h-4 w-4" />
                        </SnowButton>
                      )}
                      <SnowButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(meeting)}
                      >
                        <Eye className="h-4 w-4" />
                      </SnowButton>
                      <SnowButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(meeting.id)}
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

      {/* Schedule Meeting Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          setFormData({
            title: '',
            description: '',
            startTime: '',
            endTime: '',
            type: 'internal',
            hostId: '',
            hostName: '',
            participants: [],
            location: '',
            meetingLink: '',
            notes: ''
          })
        }}
        title="Schedule Meeting"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Meeting Title *
              </label>
              <SnowInput
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Meeting Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="internal">Internal</option>
                <option value="client">Client</option>
                <option value="partner">Partner</option>
                <option value="training">Training</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Time *
              </label>
              <SnowInput
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Time *
              </label>
              <SnowInput
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Host Name *
              </label>
              <SnowInput
                value={formData.hostName}
                onChange={(e) => setFormData({ ...formData, hostName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location
              </label>
              <SnowInput
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Conference Room A or Virtual Meeting"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Meeting Link
            </label>
            <SnowInput
              value={formData.meetingLink}
              onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
              placeholder="https://meet.google.com/..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-2">
            <SnowButton
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddModal(false)
                setFormData({
                  title: '',
                  description: '',
                  startTime: '',
                  endTime: '',
                  type: 'internal',
                  hostId: '',
                  hostName: '',
                  participants: [],
                  location: '',
                  meetingLink: '',
                  notes: ''
                })
              }}
            >
              Cancel
            </SnowButton>
            <SnowButton type="submit">
              Schedule Meeting
            </SnowButton>
          </div>
        </form>
      </Modal>

      {/* View Meeting Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedMeeting(null)
        }}
        title="Meeting Details"
      >
        {selectedMeeting && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {selectedMeeting.title}
                </h3>
                <div className="space-y-3">
                  {selectedMeeting.description && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {selectedMeeting.description}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Host: {selectedMeeting.hostName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {selectedMeeting.location}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Status</span>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedMeeting.status)}`}>
                        {selectedMeeting.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Type</span>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(selectedMeeting.type)}`}>
                        {selectedMeeting.type}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Duration</span>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedMeeting.duration} minutes
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Time</span>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatDateTime(selectedMeeting.startTime)}
                    </p>
                    <p className="text-sm text-gray-500">
                      to {formatDateTime(selectedMeeting.endTime)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {selectedMeeting.meetingLink && (
              <div>
                <span className="text-sm font-medium text-gray-500">Meeting Link</span>
                <div className="flex items-center gap-2 mt-1">
                  <Link className="h-4 w-4 text-gray-400" />
                  <a
                    href={selectedMeeting.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {selectedMeeting.meetingLink}
                  </a>
                </div>
              </div>
            )}
            {selectedMeeting.recordingUrl && (
              <div>
                <span className="text-sm font-medium text-gray-500">Recording</span>
                <div className="flex items-center gap-2 mt-1">
                  <Download className="h-4 w-4 text-gray-400" />
                  <a
                    href={selectedMeeting.recordingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Download Recording
                  </a>
                </div>
              </div>
            )}
            {selectedMeeting.notes && (
              <div>
                <span className="text-sm font-medium text-gray-500">Notes</span>
                <p className="text-gray-900 dark:text-white mt-1">{selectedMeeting.notes}</p>
              </div>
            )}
            <div className="flex justify-end gap-2">
              {isUpcoming(selectedMeeting) && selectedMeeting.meetingLink && (
                <SnowButton
                  onClick={() => {
                    setShowViewModal(false)
                    handleJoin(selectedMeeting)
                  }}
                  className="flex items-center gap-2"
                >
                  <Video className="h-4 w-4" />
                  Join Meeting
                </SnowButton>
              )}
              <SnowButton
                onClick={() => {
                  setShowViewModal(false)
                  setSelectedMeeting(null)
                }}
              >
                Close
              </SnowButton>
            </div>
          </div>
        )}
      </Modal>

      {/* Join Meeting Modal */}
      <Modal
        isOpen={showJoinModal}
        onClose={() => {
          setShowJoinModal(false)
          setSelectedMeeting(null)
        }}
        title="Join Meeting"
      >
        {selectedMeeting && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {selectedMeeting.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Hosted by {selectedMeeting.hostName}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <SnowButton
                onClick={() => window.open(selectedMeeting.meetingLink, '_blank')}
                className="flex items-center gap-2"
              >
                <Video className="h-4 w-4" />
                Join with Video
              </SnowButton>
              <SnowButton
                variant="outline"
                onClick={() => window.open(selectedMeeting.meetingLink, '_blank')}
                className="flex items-center gap-2"
              >
                <Mic className="h-4 w-4" />
                Audio Only
              </SnowButton>
            </div>
            <div className="flex justify-end gap-2">
              <SnowButton
                variant="outline"
                onClick={() => {
                  setShowJoinModal(false)
                  setSelectedMeeting(null)
                }}
              >
                Cancel
              </SnowButton>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

