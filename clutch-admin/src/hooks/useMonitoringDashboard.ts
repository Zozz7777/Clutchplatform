import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

interface Alert {
  id: string
  title: string
  description: string
  severity: string
  status: string
  timestamp: string
  source: string
  category: string
}

interface Metrics {
  systemHealth: {
    uptime: number
    responseTime: number
    errorRate: number
    throughput: number
  }
  alerts: {
    total: number
    active: number
    resolved: number
    critical: number
  }
  performance: {
    cpuUsage: number
    memoryUsage: number
    diskUsage: number
    networkLatency: number
  }
}

interface Incident {
  id: string
  title: string
  description: string
  status: string
  severity: string
  startTime: string
  endTime: string | null
  impact: string
  affectedServices: string[]
}

interface MonitoringDashboardData {
  alerts: Alert[]
  metrics: Metrics
  incidents: Incident[]
  lastUpdated: string
}

export const useMonitoringDashboard = () => {
  const [data, setData] = useState<MonitoringDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadMonitoringData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🔄 Loading consolidated monitoring dashboard data...')
      
      const response = await apiClient.get<MonitoringDashboardData>('/monitoring/dashboard')
      
      if (response.success && response.data) {
        setData(response.data)
        setLastUpdated(new Date())
        console.log('✅ Consolidated monitoring dashboard data loaded successfully')
      } else {
        throw new Error(response.message || 'Failed to load monitoring dashboard data')
      }
    } catch (err: any) {
      console.error('❌ Failed to load consolidated monitoring dashboard data:', err)
      setError(err.message || 'Failed to load monitoring dashboard data')
      toast.error('Failed to load monitoring dashboard data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshData = useCallback(() => {
    loadMonitoringData()
  }, [loadMonitoringData])

  // Load data on mount
  useEffect(() => {
    loadMonitoringData()
  }, [loadMonitoringData])

  // Auto-refresh every 2 minutes (monitoring needs more frequent updates)
  useEffect(() => {
    const interval = setInterval(loadMonitoringData, 2 * 60 * 1000) // 2 minutes
    return () => clearInterval(interval)
  }, [loadMonitoringData])

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refreshData,
    // Convenience getters for specific data sections
    alerts: data?.alerts || [],
    metrics: data?.metrics || null,
    incidents: data?.incidents || []
  }
}

export default useMonitoringDashboard
