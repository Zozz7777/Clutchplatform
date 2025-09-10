import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

interface FraudDetection {
  totalDetections: number
  falsePositives: number
  accuracy: number
  lastUpdated: string
  models: {
    name: string
    accuracy: number
    status: string
    lastTrained: string
  }[]
}

interface FraudAlert {
  id: string
  type: string
  severity: string
  description: string
  timestamp: string
  status: string
  confidence: number
}

interface AIFraudDashboardData {
  fraudDetection: FraudDetection
  fraudAlerts: FraudAlert[]
  lastUpdated: string
}

export const useAIFraudDashboard = () => {
  const [data, setData] = useState<AIFraudDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadFraudData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🔄 Loading consolidated AI fraud dashboard data...')
      
      const response = await apiClient.get<AIFraudDashboardData>('/ai/fraud/dashboard')
      
      if (response.success && response.data) {
        setData(response.data)
        setLastUpdated(new Date())
        console.log('✅ Consolidated AI fraud dashboard data loaded successfully')
      } else {
        throw new Error(response.message || 'Failed to load AI fraud dashboard data')
      }
    } catch (err: any) {
      console.error('❌ Failed to load consolidated AI fraud dashboard data:', err)
      setError(err.message || 'Failed to load AI fraud dashboard data')
      toast.error('Failed to load AI fraud dashboard data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshData = useCallback(() => {
    loadFraudData()
  }, [loadFraudData])

  // Load data on mount
  useEffect(() => {
    loadFraudData()
  }, [loadFraudData])

  // Auto-refresh every 2 minutes (fraud detection needs frequent updates)
  useEffect(() => {
    const interval = setInterval(loadFraudData, 2 * 60 * 1000) // 2 minutes
    return () => clearInterval(interval)
  }, [loadFraudData])

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refreshData,
    // Convenience getters for specific data sections
    fraudDetection: data?.fraudDetection || null,
    fraudAlerts: data?.fraudAlerts || []
  }
}

export default useAIFraudDashboard
