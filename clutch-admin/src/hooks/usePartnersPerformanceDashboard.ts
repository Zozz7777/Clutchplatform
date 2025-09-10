import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

interface PerformanceMetrics {
  totalPartners: number
  activePartners: number
  totalRevenue: number
  averageRevenue: number
  topPerformers: number
  newPartners: number
}

interface AnalyticsData {
  revenueByRegion: {
    [key: string]: number
  }
  performanceByType: {
    [key: string]: number
  }
  monthlyTrends: {
    month: string
    revenue: number
  }[]
}

interface PartnersPerformanceDashboardData {
  performanceMetrics: PerformanceMetrics
  analyticsData: AnalyticsData
  lastUpdated: string
}

export const usePartnersPerformanceDashboard = () => {
  const [data, setData] = useState<PartnersPerformanceDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadPerformanceData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🔄 Loading consolidated partners performance dashboard data...')
      
      const response = await apiClient.get<PartnersPerformanceDashboardData>('/partners/performance/dashboard')
      
      if (response.success && response.data) {
        setData(response.data)
        setLastUpdated(new Date())
        console.log('✅ Consolidated partners performance dashboard data loaded successfully')
      } else {
        throw new Error(response.message || 'Failed to load partners performance dashboard data')
      }
    } catch (err: any) {
      console.error('❌ Failed to load consolidated partners performance dashboard data:', err)
      setError(err.message || 'Failed to load partners performance dashboard data')
      toast.error('Failed to load partners performance dashboard data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshData = useCallback(() => {
    loadPerformanceData()
  }, [loadPerformanceData])

  // Load data on mount
  useEffect(() => {
    loadPerformanceData()
  }, [loadPerformanceData])

  // Auto-refresh every 5 minutes (performance data doesn't change frequently)
  useEffect(() => {
    const interval = setInterval(loadPerformanceData, 5 * 60 * 1000) // 5 minutes
    return () => clearInterval(interval)
  }, [loadPerformanceData])

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refreshData,
    // Convenience getters for specific data sections
    performanceMetrics: data?.performanceMetrics || null,
    analyticsData: data?.analyticsData || null
  }
}

export default usePartnersPerformanceDashboard
