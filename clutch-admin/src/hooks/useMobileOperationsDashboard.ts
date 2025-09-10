import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

interface AppMetrics {
  overview: {
    totalUsers: number
    activeUsers: number
    newUsers: number
    retentionRate: number
  }
  performance: {
    crashRate: number
    averageResponseTime: number
    appLoadTime: number
    batteryUsage: number
  }
  engagement: {
    dailyActiveUsers: number
    weeklyActiveUsers: number
    monthlyActiveUsers: number
    averageSessionDuration: number
    sessionsPerUser: number
  }
  platform: {
    ios: {
      users: number
      version: string
      rating: number
    }
    android: {
      users: number
      version: string
      rating: number
    }
  }
}

interface Release {
  id: string
  version: string
  platform: string
  releaseDate: string
  status: string
  downloadCount: number
  crashRate: number
}

interface Notification {
  id: string
  title: string
  message: string
  type: string
  sentAt: string
  recipients: number
  openRate: number
}

interface MobileOperationsDashboardData {
  appMetrics: AppMetrics
  releases: Release[]
  notifications: Notification[]
  lastUpdated: string
}

export const useMobileOperationsDashboard = () => {
  const [data, setData] = useState<MobileOperationsDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadMobileData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🔄 Loading consolidated mobile operations dashboard data...')
      
      const response = await apiClient.get<MobileOperationsDashboardData>('/mobile/dashboard')
      
      if (response.success && response.data) {
        setData(response.data)
        setLastUpdated(new Date())
        console.log('✅ Consolidated mobile operations dashboard data loaded successfully')
      } else {
        throw new Error(response.message || 'Failed to load mobile operations dashboard data')
      }
    } catch (err: any) {
      console.error('❌ Failed to load consolidated mobile operations dashboard data:', err)
      setError(err.message || 'Failed to load mobile operations dashboard data')
      toast.error('Failed to load mobile operations dashboard data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshData = useCallback(() => {
    loadMobileData()
  }, [loadMobileData])

  // Load data on mount
  useEffect(() => {
    loadMobileData()
  }, [loadMobileData])

  // Auto-refresh every 3 minutes (less frequent than individual calls)
  useEffect(() => {
    const interval = setInterval(loadMobileData, 3 * 60 * 1000) // 3 minutes
    return () => clearInterval(interval)
  }, [loadMobileData])

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refreshData,
    // Convenience getters for specific data sections
    appMetrics: data?.appMetrics || null,
    releases: data?.releases || [],
    notifications: data?.notifications || []
  }
}

export default useMobileOperationsDashboard
