'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  Users, 
  Video, 
  Phone, 
  MapPin,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  User,
  MessageSquare,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Share,
  Link,
  FileText,
  Download
} from 'lucide-react'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { Badge } from '@/components/ui/badge'
import { SnowInput } from '@/components/ui/snow-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api'

interface Meeting {
  id: string
  title: string
  description: string
  type: 'video' | 'audio' | 'in_person' | 'hybrid'
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
  startTime: string
  endTime: string
  duration: number
  organizer: string
  participants: string[]
  maxParticipants: number
  location?: string
  meetingUrl?: string
  agenda: string[]
  attachments: string[]
  isRecurring: boolean
  recurringPattern?: string
  recordingUrl?: string
  notes?: string
  tags: string[]
}

interface MeetingMetric {
  metric: string
  value: number
  change: number
  changePercent: number
  trend: 'up' | 'down' | 'stable'
}

export default function CommunicationMeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [metrics, setMetrics] = useState<MeetingMetric[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadMeetingsData()
  }, [])

  const loadMeetingsData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const [meetingsResponse, metricsResponse] = await Promise.all([
        apiClient.get<any[]>('/communication/meetings'),
        apiClient.get<any[]>('/communication/meetings/metrics')
      ])
      
      if (meetingsResponse.success && meetingsResponse.data) {
        setMeetings(meetingsResponse.data as Meeting[])
      } else {
        setMeetings([])
        if (!meetingsResponse.success) {
          toast.error('Failed to load meetings data')
          setError('Failed to load meetings data')
        }
      }
      
      if (metricsResponse.success && metricsResponse.data) {
        setMetrics(metricsResponse.data as MeetingMetric[])
      } else {
        setMetrics([])
        if (!metricsResponse.success) {
          toast.error('Failed to load meeting metrics')
        }
      }
    } catch (error: any) {
      console.error('Failed to load meetings data:', error)
      setMeetings([])
      setMetrics([])
      setError('Failed to load meetings data')
      toast.error('Failed to load meetings data')
    } finally {
      setIsLoading(false)
    }
  }

  const joinMeeting = async (meetingId: string) => {
    try {
      toast.success('Joining meeting...')
    } catch (error) {
      toast.error('Failed to join meeting')
    }
  }

  const deleteMeeting = async (meetingId: string) => {
    try {
      toast.success('Meeting deleted successfully')
      loadMeetingsData()
    } catch (error) {
      toast.error('Failed to delete meeting')
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />
      case 'audio':
        return <Phone className="h-4 w-4" />
      case 'in_person':
        return <MapPin className="h-4 w-4" />
      case 'hybrid':
        return <Users className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'ongoing':
        return <Activity className="h-4 w-4 text-green-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-red-500" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Calendar className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'ongoing':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'completed':
        return 'text-gray-600 bg-gray-50 border-gray-200'
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const isUpcoming = (startTime: string) => {
    const now = new Date()
    const meetingTime = new Date(startTime)
    return meetingTime > now
  }

  const isToday = (dateString: string) => {
    const today = new Date()
    const meetingDate = new Date(dateString)
    return today.toDateString() === meetingDate.toDateString()
  }

  const scheduledMeetings = meetings.filter(m => m.status === 'scheduled').length
  const ongoingMeetings = meetings.filter(m => m.status === 'ongoing').length
  const todayMeetings = meetings.filter(m => isToday(m.startTime)).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meetings</h1>
          <p className="text-muted-foreground">
            Schedule and manage team meetings and communications
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <SnowButton variant="outline" onClick={loadMeetingsData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </SnowButton>
          <SnowButton>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Meeting
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
              <label className="text-sm font-medium">Search Meetings</label>
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
              <label className="text-sm font-medium">Meeting Type</label>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="in_person">In Person</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
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
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
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
              <div className="text-2xl font-bold">
                {metric.metric.includes('Duration') ? `${metric.value} min` : 
                 metric.metric.includes('Engagement') ? `${metric.value}%` : metric.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {metric.changePercent > 0 ? '+' : ''}{metric.changePercent}% from last week
              </p>
            </SnowCardContent>
          </SnowCard>
        ))}
      </div>
      {todayMeetings > 0 && (
        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle>Today's Meetings</SnowCardTitle>
            <SnowCardDescription>
              Upcoming meetings for today
            </SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="space-y-4">
              {meetings
                .filter(meeting => isToday(meeting.startTime))
                .map((meeting) => (
                  <motion.div
                    key={meeting.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 border-blue-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-full bg-blue-100">
                        {getTypeIcon(meeting.type)}
                      </div>
                      <div>
                        <h3 className="font-medium">{meeting.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatDateTime(meeting.startTime)} â€¢ {formatDuration(meeting.duration)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(meeting.status)}>
                        {getStatusIcon(meeting.status)}
                        <span className="ml-1 capitalize">{meeting.status}</span>
                      </Badge>
                      {meeting.meetingUrl && (
                        <SnowButton size="sm" onClick={() => joinMeeting(meeting.id)}>
                          <Video className="h-4 w-4 mr-1" />
                          Join
                        </SnowButton>
                      )}
                    </div>
                  </motion.div>
                ))}
            </div>
          </SnowCardContent>
        </SnowCard>
      )}
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle>All Meetings</SnowCardTitle>
          <SnowCardDescription>
            Complete list of scheduled and past meetings
          </SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Loading meetings...
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8 text-red-600">
              <AlertTriangle className="h-6 w-6 mr-2" />
              {error}
            </div>
          ) : (
            <div className="space-y-4">
              {meetings.map((meeting) => (
                <motion.div
                  key={meeting.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="p-2 rounded-full bg-muted">
                        {getTypeIcon(meeting.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium">{meeting.title}</h3>
                          <Badge className={getStatusColor(meeting.status)}>
                            {getStatusIcon(meeting.status)}
                            <span className="ml-1 capitalize">{meeting.status}</span>
                          </Badge>
                          {meeting.isRecurring && (
                            <Badge variant="outline" className="text-blue-600">
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Recurring
                            </Badge>
                          )}
                          {isToday(meeting.startTime) && (
                            <Badge variant="outline" className="text-green-600">
                              <Calendar className="h-3 w-3 mr-1" />
                              Today
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {meeting.description}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <h4 className="text-sm font-medium mb-2">Meeting Details:</h4>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div>ðŸ“… {formatDateTime(meeting.startTime)}</div>
                              <div>â±ï¸ Duration: {formatDuration(meeting.duration)}</div>
                              <div>ðŸ‘¤ Organizer: {meeting.organizer}</div>
                              <div>ðŸ‘¥ Participants: {meeting.participants.length}/{meeting.maxParticipants}</div>
                              {meeting.location && <div>ðŸ“ Location: {meeting.location}</div>}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-2">Agenda:</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {meeting.agenda.slice(0, 3).map((item, index) => (
                                <li key={index} className="flex items-start space-x-2">
                                  <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                              {meeting.agenda.length > 3 && (
                                <li className="text-xs text-muted-foreground">
                                  +{meeting.agenda.length - 3} more items
                                </li>
                              )}
                            </ul>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {meeting.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {meeting.meetingUrl && meeting.status === 'scheduled' && (
                        <SnowButton
                          size="sm"
                          onClick={() => joinMeeting(meeting.id)}
                        >
                          <Video className="h-4 w-4 mr-1" />
                          Join
                        </SnowButton>
                      )}
                      {meeting.recordingUrl && meeting.status === 'completed' && (
                        <SnowButton
                          size="sm"
                          variant="outline"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Recording
                        </SnowButton>
                      )}
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
                        onClick={() => deleteMeeting(meeting.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </SnowButton>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {meetings.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2" />
                  <p>No meetings found</p>
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
            Common meeting management tasks
          </SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SnowButton variant="outline" className="h-20 flex-col">
              <Plus className="h-6 w-6 mb-2" />
              <span>Schedule Meeting</span>
            </SnowButton>
            <SnowButton variant="outline" className="h-20 flex-col">
              <Video className="h-6 w-6 mb-2" />
              <span>Start Meeting</span>
            </SnowButton>
            <SnowButton variant="outline" className="h-20 flex-col">
              <FileText className="h-6 w-6 mb-2" />
              <span>Meeting Templates</span>
            </SnowButton>
            <SnowButton variant="outline" className="h-20 flex-col">
              <Download className="h-6 w-6 mb-2" />
              <span>Export Calendar</span>
            </SnowButton>
          </div>
        </SnowCardContent>
      </SnowCard>
    </div>
  )
}



