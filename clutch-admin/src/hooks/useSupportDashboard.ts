import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

interface SupportTicket {
  id: string
  title: string
  description: string
  status: string
  priority: string
  category: string
  assignedTo: string
  createdBy: string
  createdAt: string
  updatedAt: string
  lastActivity: string
  tags: string[]
}

interface TicketMetrics {
  overview: {
    totalTickets: number
    openTickets: number
    resolvedTickets: number
    averageResolutionTime: number
  }
  byStatus: {
    open: number
    inProgress: number
    pending: number
    resolved: number
    closed: number
  }
  byPriority: {
    urgent: number
    high: number
    medium: number
    low: number
  }
  byCategory: {
    technical: number
    billing: number
    feature_request: number
    bug: number
    general: number
  }
  performance: {
    averageResponseTime: number
    customerSatisfaction: number
    firstContactResolution: number
    escalationRate: number
  }
}

interface SupportDashboardData {
  tickets: SupportTicket[]
  metrics: TicketMetrics
  lastUpdated: string
}

export const useSupportDashboard = () => {
  const [data, setData] = useState<SupportDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadSupportData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🔄 Loading consolidated support dashboard data...')
      
      const response = await apiClient.get<SupportDashboardData>('/support/dashboard')
      
      if (response.success && response.data) {
        setData(response.data)
        setLastUpdated(new Date())
        console.log('✅ Consolidated support dashboard data loaded successfully')
      } else {
        throw new Error(response.message || 'Failed to load support dashboard data')
      }
    } catch (err: any) {
      console.error('❌ Failed to load consolidated support dashboard data:', err)
      setError(err.message || 'Failed to load support dashboard data')
      toast.error('Failed to load support dashboard data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshData = useCallback(() => {
    loadSupportData()
  }, [loadSupportData])

  // Load data on mount
  useEffect(() => {
    loadSupportData()
  }, [loadSupportData])

  // Auto-refresh every 3 minutes (less frequent than individual calls)
  useEffect(() => {
    const interval = setInterval(loadSupportData, 3 * 60 * 1000) // 3 minutes
    return () => clearInterval(interval)
  }, [loadSupportData])

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refreshData,
    // Convenience getters for specific data sections
    tickets: data?.tickets || [],
    metrics: data?.metrics || null
  }
}

export default useSupportDashboard
