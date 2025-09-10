import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

interface AuditMetric {
  id: string
  name: string
  value: number
  change: number
  changeType: 'increase' | 'decrease'
  severity: string
}

interface RecentAudit {
  id: string
  type: string
  description: string
  status: string
  timestamp: string
  findings: number
}

interface SecurityAuditDashboardData {
  auditMetrics: AuditMetric[]
  recentAudits: RecentAudit[]
  lastUpdated: string
}

export const useSecurityAuditDashboard = () => {
  const [data, setData] = useState<SecurityAuditDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadAuditData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🔄 Loading consolidated security audit dashboard data...')
      
      const response = await apiClient.get<SecurityAuditDashboardData>('/security/audit/dashboard')
      
      if (response.success && response.data) {
        setData(response.data)
        setLastUpdated(new Date())
        console.log('✅ Consolidated security audit dashboard data loaded successfully')
      } else {
        throw new Error(response.message || 'Failed to load security audit dashboard data')
      }
    } catch (err: any) {
      console.error('❌ Failed to load consolidated security audit dashboard data:', err)
      setError(err.message || 'Failed to load security audit dashboard data')
      toast.error('Failed to load security audit dashboard data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshData = useCallback(() => {
    loadAuditData()
  }, [loadAuditData])

  // Load data on mount
  useEffect(() => {
    loadAuditData()
  }, [loadAuditData])

  // Auto-refresh every 5 minutes (less frequent than individual calls)
  useEffect(() => {
    const interval = setInterval(loadAuditData, 5 * 60 * 1000) // 5 minutes
    return () => clearInterval(interval)
  }, [loadAuditData])

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refreshData,
    // Convenience getters for specific data sections
    auditMetrics: data?.auditMetrics || [],
    recentAudits: data?.recentAudits || []
  }
}

export default useSecurityAuditDashboard
