'use client'

import React, { useState, useEffect } from 'react'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowInput } from '@/components/ui/snow-input'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  Play,
  Pause,
  Square,
  User,
  Calendar,
  PoundSterling,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Target,
  BarChart3,
  Timer
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

export default function ProjectsTimePage() {
  const [timeEntries, setTimeEntries] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [currentEntry, setCurrentEntry] = useState<any>(null)

  useEffect(() => {
    loadTimeEntriesData()
  }, [])

  const loadTimeEntriesData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await apiClient.get<any[]>('/projects/time')
      if (response.success && response.data) {
        setTimeEntries(response.data as any[])
      } else {
        setTimeEntries([])
        if (!response.success) {
          toast.error('Failed to load time entries')
          setError('Failed to load time entries')
        }
      }
    } catch (error: any) {
      console.error('Failed to load time entries data:', error)
      setTimeEntries([])
      setError('Failed to load time entries data')
      toast.error('Failed to load time entries data')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDuration = (hours: number) => {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return `${h}h ${m}m`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600'
      case 'in_progress': return 'text-blue-600'
      case 'pending': return 'text-yellow-600'
      default: return 'text-slate-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'in_progress': return <Clock className="h-4 w-4" />
      case 'pending': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const filteredTimeEntries = timeEntries.filter(entry => {
    const matchesSearch = entry.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.task.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.user.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || entry.status === filter
    return matchesSearch && matchesFilter
  })

  const handleStartTracking = () => {
    setIsTracking(true)
    setCurrentEntry({
      id: Date.now(),
      project: 'Current Project',
      task: 'Current Task',
      user: 'Current User',
      startTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      status: 'in_progress'
    })
    toast.success('Time tracking started')
  }

  const handleStopTracking = () => {
    setIsTracking(false)
    setCurrentEntry(null)
    toast.success('Time tracking stopped')
  }

  const handleViewEntry = (entry: any) => {
    toast.info(`Viewing time entry: ${entry.task}`)
  }

  const handleEditEntry = (entry: any) => {
    toast.info(`Editing time entry: ${entry.task}`)
  }

  const handleDeleteEntry = (entry: any) => {
    toast.error(`Deleting time entry: ${entry.task}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading time entries...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 text-slate-900">
            Time Tracking
          </h1>
          <p className="text-slate-600 text-slate-600">
            Track and manage project time entries
          </p>
        </div>
        <div className="flex gap-2">
          <SnowButton variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Export
          </SnowButton>
          <SnowButton>
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </SnowButton>
        </div>
      </div>
      {isTracking && currentEntry && (
        <SnowCard className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <SnowCardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <Timer className="h-5 w-5 text-white animate-pulse" />
                </div>
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">Currently Tracking</p>
                  <p className="text-sm text-green-600 dark:text-green-300">{currentEntry.project} - {currentEntry.task}</p>
                  <p className="text-xs text-green-500 dark:text-green-400">Started at {currentEntry.startTime}</p>
                </div>
              </div>
              <SnowButton onClick={handleStopTracking} variant="destructive">
                <Square className="h-4 w-4 mr-2" />
                Stop Tracking
              </SnowButton>
            </div>
          </SnowCardContent>
        </SnowCard>
      )}
      <div className="grid gap-4 md:grid-cols-4">
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">Total Hours</p>
                <p className="text-2xl font-bold">{formatDuration(timeEntries.reduce((sum, t) => sum + t.duration, 0))}</p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <PoundSterling className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">Total Billed</p>
                <p className="text-2xl font-bold">{formatCurrency(timeEntries.reduce((sum, t) => sum + t.totalAmount, 0))}</p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">Active Users</p>
                <p className="text-2xl font-bold">{new Set(timeEntries.map(t => t.user)).size}</p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">Today's Hours</p>
                <p className="text-2xl font-bold">{formatDuration(timeEntries.filter(t => t.date === '2024-01-28').reduce((sum, t) => sum + t.duration, 0))}</p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
      {!isTracking && (
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Ready to track time?</h3>
                <p className="text-sm text-slate-500">Start tracking your work time for current projects</p>
              </div>
              <SnowButton onClick={handleStartTracking}>
                <Play className="h-4 w-4 mr-2" />
                Start Tracking
              </SnowButton>
            </div>
          </SnowCardContent>
        </SnowCard>
      )}
      <SnowCard>
        <SnowCardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <SnowInput
                  placeholder="Search time entries..."
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
                <option value="completed">Completed</option>
                <option value="in_progress">In Progress</option>
                <option value="pending">Pending</option>
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
          <SnowCardTitle>Time Entries</SnowCardTitle>
          <SnowCardDescription>Track and manage project time entries</SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          <div className="space-y-4">
            {filteredTimeEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{entry.task}</p>
                    <p className="text-sm text-slate-500">{entry.project}</p>
                    <p className="text-xs text-slate-400">By: {entry.user}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-medium">{formatDuration(entry.duration)}</p>
                    <p className="text-sm text-slate-500">{entry.startTime} - {entry.endTime}</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(entry.totalAmount)}</p>
                    <p className="text-sm text-slate-500">@{formatCurrency(entry.hourlyRate)}/hr</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(entry.status)}
                    <span className={`text-sm font-medium ${getStatusColor(entry.status)}`}>
                                             {entry.status ? entry.status.replace('_', ' ') : 'Unknown'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <SnowButton
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewEntry(entry)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </SnowButton>
                    <SnowButton
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditEntry(entry)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </SnowButton>
                    <SnowButton
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteEntry(entry)}
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



