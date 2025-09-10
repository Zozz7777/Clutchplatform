import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

interface ModelPerformance {
  totalModels: number
  activeModels: number
  averageAccuracy: number
  lastUpdated: string
  performance: {
    model: string
    accuracy: number
    precision: number
    recall: number
    f1Score: number
  }[]
}

interface TrainingData {
  id: string
  model: string
  status: string
  startTime: string
  endTime: string | null
  accuracy: number | null
  datasetSize: number
}

interface AIModelsDashboardData {
  modelPerformance: ModelPerformance
  trainingData: TrainingData[]
  lastUpdated: string
}

export const useAIModelsDashboard = () => {
  const [data, setData] = useState<AIModelsDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadModelsData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🔄 Loading consolidated AI models dashboard data...')
      
      const response = await apiClient.get<AIModelsDashboardData>('/ai/models/dashboard')
      
      if (response.success && response.data) {
        setData(response.data)
        setLastUpdated(new Date())
        console.log('✅ Consolidated AI models dashboard data loaded successfully')
      } else {
        throw new Error(response.message || 'Failed to load AI models dashboard data')
      }
    } catch (err: any) {
      console.error('❌ Failed to load consolidated AI models dashboard data:', err)
      setError(err.message || 'Failed to load AI models dashboard data')
      toast.error('Failed to load AI models dashboard data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshData = useCallback(() => {
    loadModelsData()
  }, [loadModelsData])

  // Load data on mount
  useEffect(() => {
    loadModelsData()
  }, [loadModelsData])

  // Auto-refresh every 5 minutes (model performance doesn't change frequently)
  useEffect(() => {
    const interval = setInterval(loadModelsData, 5 * 60 * 1000) // 5 minutes
    return () => clearInterval(interval)
  }, [loadModelsData])

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refreshData,
    // Convenience getters for specific data sections
    modelPerformance: data?.modelPerformance || null,
    trainingData: data?.trainingData || []
  }
}

export default useAIModelsDashboard
