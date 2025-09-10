import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

interface UserBehavior {
  totalUsers: number
  activeUsers: number
  newUsers: number
  returningUsers: number
  averageSessionDuration: number
  bounceRate: number
}

interface UserEngagement {
  dailyActiveUsers: number
  weeklyActiveUsers: number
  monthlyActiveUsers: number
  engagementRate: number
  retentionRate: number
  churnRate: number
}

interface UserRetention {
  day1Retention: number
  day7Retention: number
  day30Retention: number
  cohortAnalysis: {
    [key: string]: number
  }
  lifetimeValue: number
}

interface UsersAnalyticsDashboardData {
  userBehavior: UserBehavior
  userEngagement: UserEngagement
  userRetention: UserRetention
  lastUpdated: string
}

export const useUsersAnalyticsDashboard = () => {
  const [data, setData] = useState<UsersAnalyticsDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadUsersData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🔄 Loading consolidated users analytics dashboard data...')
      
      const response = await apiClient.get<UsersAnalyticsDashboardData>('/users/analytics/dashboard')
      
      if (response.success && response.data) {
        setData(response.data)
        setLastUpdated(new Date())
        console.log('✅ Consolidated users analytics dashboard data loaded successfully')
      } else {
        throw new Error(response.message || 'Failed to load users analytics dashboard data')
      }
    } catch (err: any) {
      console.error('❌ Failed to load consolidated users analytics dashboard data:', err)
      setError(err.message || 'Failed to load users analytics dashboard data')
      toast.error('Failed to load users analytics dashboard data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshData = useCallback(() => {
    loadUsersData()
  }, [loadUsersData])

  // Load data on mount
  useEffect(() => {
    loadUsersData()
  }, [loadUsersData])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(loadUsersData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [loadUsersData])

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refreshData,
    userBehavior: data?.userBehavior || null,
    userEngagement: data?.userEngagement || null,
    userRetention: data?.userRetention || null
  }
}

export default useUsersAnalyticsDashboard
