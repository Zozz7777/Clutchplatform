import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

interface ConsolidatedDashboardData {
  metrics: {
    users: {
      total: number
      active: number
      growth: number
    }
    orders: {
      total: number
      pending: number
      completed: number
      growth: number
    }
    revenue: {
      total: number
      monthly: number
      weekly: number
      daily: number
      growth: number
    }
    vehicles: {
      total: number
      available: number
      inService: number
    }
    services: {
      total: number
      active: number
      completed: number
    }
    partners: {
      total: number
      active: number
      pending: number
    }
  }
  recentOrders: Array<{
    id: string
    customer: any
    vehicle: any
    status: string
    createdAt: string
    total: number
  }>
  activityLogs: Array<{
    id: string
    type: string
    action: string
    description: string
    timestamp: string
    status: string
  }>
  platformServices: Array<{
    name: string
    status: string
    uptime: string
  }>
  systemStatus: Array<{
    name: string
    value: number
    unit: string
    status: string
  }>
  realTimeData: {
    totalUsers: number
    activeDrivers: number
    totalPartners: number
    monthlyRevenue: number
  }
}

export const useConsolidatedDashboard = () => {
  const [data, setData] = useState<ConsolidatedDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🔄 Loading consolidated dashboard data...')
      
      const response = await apiClient.getConsolidatedDashboardData()
      
      if (response.success && response.data) {
        setData(response.data)
        setLastUpdated(new Date())
        console.log('✅ Consolidated dashboard data loaded successfully')
      } else {
        throw new Error(response.message || 'Failed to load dashboard data')
      }
    } catch (err: any) {
      console.error('❌ Failed to load consolidated dashboard data:', err)
      setError(err.message || 'Failed to load dashboard data')
      toast.error('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshData = useCallback(() => {
    loadDashboardData()
  }, [loadDashboardData])

  // Load data on mount
  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  // Auto-refresh every 5 minutes (much less frequent than before)
  useEffect(() => {
    const interval = setInterval(loadDashboardData, 5 * 60 * 1000) // 5 minutes
    return () => clearInterval(interval)
  }, [loadDashboardData])

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refreshData,
    // Convenience getters for specific data sections
    metrics: data?.metrics || null,
    recentOrders: data?.recentOrders || [],
    activityLogs: data?.activityLogs || [],
    platformServices: data?.platformServices || [],
    systemStatus: data?.systemStatus || [],
    realTimeData: data?.realTimeData || null
  }
}

export default useConsolidatedDashboard
