import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

interface RevenueAnalytics {
  totalRevenue: number
  monthlyRevenue: number
  revenueGrowth: number
  averageOrderValue: number
  revenueBySource: {
    subscriptions: number
    transactions: number
    services: number
  }
}

interface RevenueForecast {
  period: string
  forecasted: number
  actual: number | null
  accuracy: number | null
}

interface RevenueBreakdown {
  byRegion: {
    [key: string]: number
  }
  byProduct: {
    [key: string]: number
  }
  byCustomer: {
    [key: string]: number
  }
}

interface RevenueDashboardData {
  revenueAnalytics: RevenueAnalytics
  revenueForecasts: RevenueForecast[]
  revenueBreakdown: RevenueBreakdown
  lastUpdated: string
}

export const useRevenueDashboard = () => {
  const [data, setData] = useState<RevenueDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadRevenueData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🔄 Loading consolidated revenue dashboard data...')
      
      const response = await apiClient.get<RevenueDashboardData>('/analytics/revenue/dashboard')
      
      if (response.success && response.data) {
        setData(response.data)
        setLastUpdated(new Date())
        console.log('✅ Consolidated revenue dashboard data loaded successfully')
      } else {
        throw new Error(response.message || 'Failed to load revenue dashboard data')
      }
    } catch (err: any) {
      console.error('❌ Failed to load consolidated revenue dashboard data:', err)
      setError(err.message || 'Failed to load revenue dashboard data')
      toast.error('Failed to load revenue dashboard data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshData = useCallback(() => {
    loadRevenueData()
  }, [loadRevenueData])

  // Load data on mount
  useEffect(() => {
    loadRevenueData()
  }, [loadRevenueData])

  // Auto-refresh every 5 minutes (revenue data doesn't change frequently)
  useEffect(() => {
    const interval = setInterval(loadRevenueData, 5 * 60 * 1000) // 5 minutes
    return () => clearInterval(interval)
  }, [loadRevenueData])

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refreshData,
    // Convenience getters for specific data sections
    revenueAnalytics: data?.revenueAnalytics || null,
    revenueForecasts: data?.revenueForecasts || [],
    revenueBreakdown: data?.revenueBreakdown || null
  }
}

export default useRevenueDashboard
