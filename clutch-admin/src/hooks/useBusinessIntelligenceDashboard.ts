import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

interface BIMetrics {
  financial: {
    revenue: {
      current: number
      previous: number
      change: number
      trend: string
      forecast: number
    }
    profit: {
      current: number
      previous: number
      change: number
      trend: string
      forecast: number
    }
  }
  operational: {
    efficiency: {
      current: number
      previous: number
      change: number
      trend: string
    }
    productivity: {
      current: number
      previous: number
      change: number
      trend: string
    }
  }
}

interface BIReport {
  id: string
  title: string
  type: string
  status: string
  generatedAt: string
  insights: string[]
}

interface BusinessIntelligenceDashboardData {
  biMetrics: BIMetrics
  biReports: BIReport[]
  lastUpdated: string
}

export const useBusinessIntelligenceDashboard = () => {
  const [data, setData] = useState<BusinessIntelligenceDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadBIData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🔄 Loading consolidated business intelligence dashboard data...')
      
      const response = await apiClient.get<BusinessIntelligenceDashboardData>('/business-intelligence/dashboard')
      
      if (response.success && response.data) {
        setData(response.data)
        setLastUpdated(new Date())
        console.log('✅ Consolidated business intelligence dashboard data loaded successfully')
      } else {
        throw new Error(response.message || 'Failed to load business intelligence dashboard data')
      }
    } catch (err: any) {
      console.error('❌ Failed to load consolidated business intelligence dashboard data:', err)
      setError(err.message || 'Failed to load business intelligence dashboard data')
      toast.error('Failed to load business intelligence dashboard data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshData = useCallback(() => {
    loadBIData()
  }, [loadBIData])

  // Load data on mount
  useEffect(() => {
    loadBIData()
  }, [loadBIData])

  // Auto-refresh every 10 minutes (BI data doesn't change frequently)
  useEffect(() => {
    const interval = setInterval(loadBIData, 10 * 60 * 1000) // 10 minutes
    return () => clearInterval(interval)
  }, [loadBIData])

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refreshData,
    // Convenience getters for specific data sections
    biMetrics: data?.biMetrics || null,
    biReports: data?.biReports || []
  }
}

export default useBusinessIntelligenceDashboard
