import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

interface SecurityStat {
  id: string
  name: string
  value: number
  change: number
  changeType: 'increase' | 'decrease'
  icon: string
}

interface TwoFactorMethod {
  id: string
  name: string
  users: number
  successRate: number
  status: string
  lastUsed: string
}

interface RecentEvent {
  id: string
  type: string
  user: string
  method: string
  timestamp: string
  ip: string
  location: string
}

interface SecurityPolicy {
  id: string
  name: string
  description: string
  status: string
  usersAffected: number
  lastModified: string
}

interface TwoFADashboardData {
  securityStats: SecurityStat[]
  twoFactorMethods: TwoFactorMethod[]
  recentEvents: RecentEvent[]
  securityPolicies: SecurityPolicy[]
  lastUpdated: string
}

export const use2FADashboard = () => {
  const [data, setData] = useState<TwoFADashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const load2FAData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🔄 Loading consolidated 2FA dashboard data...')
      
      const response = await apiClient.get<TwoFADashboardData>('/security/2fa/dashboard')
      
      if (response.success && response.data) {
        setData(response.data)
        setLastUpdated(new Date())
        console.log('✅ Consolidated 2FA dashboard data loaded successfully')
      } else {
        throw new Error(response.message || 'Failed to load 2FA dashboard data')
      }
    } catch (err: any) {
      console.error('❌ Failed to load consolidated 2FA dashboard data:', err)
      setError(err.message || 'Failed to load 2FA dashboard data')
      toast.error('Failed to load 2FA dashboard data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshData = useCallback(() => {
    load2FAData()
  }, [load2FAData])

  // Load data on mount
  useEffect(() => {
    load2FAData()
  }, [load2FAData])

  // Auto-refresh every 3 minutes (less frequent than individual calls)
  useEffect(() => {
    const interval = setInterval(load2FAData, 3 * 60 * 1000) // 3 minutes
    return () => clearInterval(interval)
  }, [load2FAData])

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refreshData,
    // Convenience getters for specific data sections
    securityStats: data?.securityStats || [],
    twoFactorMethods: data?.twoFactorMethods || [],
    recentEvents: data?.recentEvents || [],
    securityPolicies: data?.securityPolicies || []
  }
}

export default use2FADashboard
