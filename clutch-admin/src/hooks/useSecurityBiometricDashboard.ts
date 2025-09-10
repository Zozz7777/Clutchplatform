import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

interface BiometricStat {
  id: string
  name: string
  value: number
  change: number
  changeType: 'increase' | 'decrease'
  accuracy: number
}

interface BiometricEvent {
  id: string
  type: string
  user: string
  method: string
  timestamp: string
  status: string
}

interface SecurityBiometricDashboardData {
  biometricStats: BiometricStat[]
  biometricEvents: BiometricEvent[]
  lastUpdated: string
}

export const useSecurityBiometricDashboard = () => {
  const [data, setData] = useState<SecurityBiometricDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadBiometricData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🔄 Loading consolidated security biometric dashboard data...')
      
      const response = await apiClient.get<SecurityBiometricDashboardData>('/security/biometric/dashboard')
      
      if (response.success && response.data) {
        setData(response.data)
        setLastUpdated(new Date())
        console.log('✅ Consolidated security biometric dashboard data loaded successfully')
      } else {
        throw new Error(response.message || 'Failed to load security biometric dashboard data')
      }
    } catch (err: any) {
      console.error('❌ Failed to load consolidated security biometric dashboard data:', err)
      setError(err.message || 'Failed to load security biometric dashboard data')
      toast.error('Failed to load security biometric dashboard data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshData = useCallback(() => {
    loadBiometricData()
  }, [loadBiometricData])

  // Load data on mount
  useEffect(() => {
    loadBiometricData()
  }, [loadBiometricData])

  // Auto-refresh every 5 minutes (less frequent than individual calls)
  useEffect(() => {
    const interval = setInterval(loadBiometricData, 5 * 60 * 1000) // 5 minutes
    return () => clearInterval(interval)
  }, [loadBiometricData])

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refreshData,
    // Convenience getters for specific data sections
    biometricStats: data?.biometricStats || [],
    biometricEvents: data?.biometricEvents || []
  }
}

export default useSecurityBiometricDashboard
