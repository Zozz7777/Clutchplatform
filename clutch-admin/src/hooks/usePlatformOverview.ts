import { useState, useEffect, useCallback, useRef } from 'react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'
import { useStableCallback, useApiCall } from './useStableCallback'

interface PlatformMetrics {
  totalUsers: number
  activeUsers: number
  totalOrders: number
  completedOrders: number
  totalRevenue: number
  monthlyRevenue: number
  userGrowth: number
  revenueGrowth: number
  orderGrowth: number
}

interface AppMetrics {
  mobileApp: {
    downloads: number
    activeUsers: number
    rating: number
    crashes: number
    performance: number
  }
  webApp: {
    sessions: number
    pageViews: number
    bounceRate: number
    avgSessionDuration: number
    performance: number
  }
  api: {
    requests: number
    responseTime: number
    errorRate: number
    uptime: number
    throughput: number
  }
}

interface SystemStatus {
  name: string
  value: number
  unit: string
  status: string
  trend: string
}

interface PlatformOverviewData {
  platformMetrics: PlatformMetrics
  appMetrics: AppMetrics
  systemStatus: SystemStatus[]
  lastUpdated: string
}

export const usePlatformOverview = () => {
  const [data, setData] = useState<PlatformOverviewData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const { makeApiCall } = useApiCall()
  const isMountedRef = useRef(true)

  const loadPlatformData = useStableCallback(async () => {
    if (!isMountedRef.current) return

    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🔄 Loading consolidated platform overview data...')
      
      const response = await makeApiCall(async () => {
        return await apiClient.get<PlatformOverviewData>('/operations/platform-overview')
      }, 3) // Max 3 calls
      
      if (!response) return // Rate limited
      
      if (response.success && response.data) {
        setData(response.data)
        setLastUpdated(new Date())
        console.log('✅ Consolidated platform overview data loaded successfully')
      } else {
        throw new Error(response.message || 'Failed to load platform overview data')
      }
    } catch (err: any) {
      console.error('❌ Failed to load consolidated platform overview data:', err)
      setError(err.message || 'Failed to load platform overview data')
      toast.error('Failed to load platform overview data')
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  })

  const refreshData = useStableCallback(() => {
    loadPlatformData()
  })

  // Load data on mount only
  useEffect(() => {
    loadPlatformData()
    
    return () => {
      isMountedRef.current = false
    }
  }, []) // Empty dependency array to run only once

  // Auto-refresh every 5 minutes (less frequent to prevent issues)
  useEffect(() => {
    const interval = setInterval(() => {
      if (isMountedRef.current) {
        loadPlatformData()
      }
    }, 5 * 60 * 1000) // 5 minutes
    
    return () => clearInterval(interval)
  }, []) // Empty dependency array

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refreshData,
    // Convenience getters for specific data sections
    platformMetrics: data?.platformMetrics || null,
    appMetrics: data?.appMetrics || null,
    systemStatus: data?.systemStatus || []
  }
}

export default usePlatformOverview
