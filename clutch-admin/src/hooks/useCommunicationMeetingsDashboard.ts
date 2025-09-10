import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

interface MeetingSchedule {
  totalMeetings: number
  upcomingMeetings: number
  completedMeetings: number
  cancelledMeetings: number
  averageDuration: number
  totalParticipants: number
}

interface MeetingAnalytics {
  attendanceRate: number
  satisfactionScore: number
  productivityScore: number
  meetingTypes: {
    [key: string]: number
  }
  timeSlots: {
    [key: string]: number
  }
}

interface CommunicationMeetingsDashboardData {
  meetingSchedule: MeetingSchedule
  meetingAnalytics: MeetingAnalytics
  lastUpdated: string
}

export const useCommunicationMeetingsDashboard = () => {
  const [data, setData] = useState<CommunicationMeetingsDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadMeetingsData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🔄 Loading consolidated communication meetings dashboard data...')
      
      const response = await apiClient.get<CommunicationMeetingsDashboardData>('/communication/meetings/dashboard')
      
      if (response.success && response.data) {
        setData(response.data)
        setLastUpdated(new Date())
        console.log('✅ Consolidated communication meetings dashboard data loaded successfully')
      } else {
        throw new Error(response.message || 'Failed to load communication meetings dashboard data')
      }
    } catch (err: any) {
      console.error('❌ Failed to load consolidated communication meetings dashboard data:', err)
      setError(err.message || 'Failed to load communication meetings dashboard data')
      toast.error('Failed to load communication meetings dashboard data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshData = useCallback(() => {
    loadMeetingsData()
  }, [loadMeetingsData])

  // Load data on mount
  useEffect(() => {
    loadMeetingsData()
  }, [loadMeetingsData])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(loadMeetingsData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [loadMeetingsData])

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refreshData,
    meetingSchedule: data?.meetingSchedule || null,
    meetingAnalytics: data?.meetingAnalytics || null
  }
}

export default useCommunicationMeetingsDashboard
