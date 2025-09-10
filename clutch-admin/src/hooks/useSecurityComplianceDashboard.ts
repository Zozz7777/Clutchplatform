import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

interface ComplianceMetric {
  id: string
  name: string
  status: string
  score: number
  lastAudit: string
  nextAudit: string
}

interface AuditLog {
  id: string
  type: string
  description: string
  status: string
  timestamp: string
  auditor: string
}

interface SecurityComplianceDashboardData {
  complianceMetrics: ComplianceMetric[]
  auditLogs: AuditLog[]
  lastUpdated: string
}

export const useSecurityComplianceDashboard = () => {
  const [data, setData] = useState<SecurityComplianceDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadComplianceData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🔄 Loading consolidated security compliance dashboard data...')
      
      const response = await apiClient.get<SecurityComplianceDashboardData>('/security/compliance/dashboard')
      
      if (response.success && response.data) {
        setData(response.data)
        setLastUpdated(new Date())
        console.log('✅ Consolidated security compliance dashboard data loaded successfully')
      } else {
        throw new Error(response.message || 'Failed to load security compliance dashboard data')
      }
    } catch (err: any) {
      console.error('❌ Failed to load consolidated security compliance dashboard data:', err)
      setError(err.message || 'Failed to load security compliance dashboard data')
      toast.error('Failed to load security compliance dashboard data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshData = useCallback(() => {
    loadComplianceData()
  }, [loadComplianceData])

  // Load data on mount
  useEffect(() => {
    loadComplianceData()
  }, [loadComplianceData])

  // Auto-refresh every 5 minutes (less frequent than individual calls)
  useEffect(() => {
    const interval = setInterval(loadComplianceData, 5 * 60 * 1000) // 5 minutes
    return () => clearInterval(interval)
  }, [loadComplianceData])

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refreshData,
    // Convenience getters for specific data sections
    complianceMetrics: data?.complianceMetrics || [],
    auditLogs: data?.auditLogs || []
  }
}

export default useSecurityComplianceDashboard
