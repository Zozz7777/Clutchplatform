import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

interface CampaignAnalytics {
  totalCampaigns: number
  activeCampaigns: number
  completedCampaigns: number
  totalSpend: number
  totalRevenue: number
  roi: number
  conversionRate: number
  clickThroughRate: number
}

interface PerformanceMetrics {
  email: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    unsubscribed: number
  }
  social: {
    impressions: number
    reach: number
    engagement: number
    shares: number
    comments: number
  }
  paid: {
    impressions: number
    clicks: number
    conversions: number
    cost: number
    cpc: number
  }
}

interface MarketingAnalyticsDashboardData {
  campaignAnalytics: CampaignAnalytics
  performanceMetrics: PerformanceMetrics
  lastUpdated: string
}

export const useMarketingAnalyticsDashboard = () => {
  const [data, setData] = useState<MarketingAnalyticsDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadMarketingData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🔄 Loading consolidated marketing analytics dashboard data...')
      
      const response = await apiClient.get<MarketingAnalyticsDashboardData>('/marketing/analytics/dashboard')
      
      if (response.success && response.data) {
        setData(response.data)
        setLastUpdated(new Date())
        console.log('✅ Consolidated marketing analytics dashboard data loaded successfully')
      } else {
        throw new Error(response.message || 'Failed to load marketing analytics dashboard data')
      }
    } catch (err: any) {
      console.error('❌ Failed to load consolidated marketing analytics dashboard data:', err)
      setError(err.message || 'Failed to load marketing analytics dashboard data')
      toast.error('Failed to load marketing analytics dashboard data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshData = useCallback(() => {
    loadMarketingData()
  }, [loadMarketingData])

  // Load data on mount
  useEffect(() => {
    loadMarketingData()
  }, [loadMarketingData])

  // Auto-refresh every 5 minutes (marketing data doesn't change frequently)
  useEffect(() => {
    const interval = setInterval(loadMarketingData, 5 * 60 * 1000) // 5 minutes
    return () => clearInterval(interval)
  }, [loadMarketingData])

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refreshData,
    // Convenience getters for specific data sections
    campaignAnalytics: data?.campaignAnalytics || null,
    performanceMetrics: data?.performanceMetrics || null
  }
}

export default useMarketingAnalyticsDashboard
