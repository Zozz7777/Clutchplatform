import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

interface FeatureStats {
  total: number
  enabled: number
  disabled: number
  inRollout: number
  rolloutPercentage: number
}

interface UserGroup {
  name: string
  userCount: number
  users: string[]
}

interface GeographicRegion {
  name: string
  userCount: number
  enabledFeatures: number
}

interface RecentActivity {
  id: string
  type: string
  featureName: string
  user: string
  timestamp: string
  details: string
}

interface FeatureFlag {
  id: string
  name: string
  enabled: boolean
  rolloutPercentage: number
  userGroups: string[]
  regions: string[]
  description: string
  createdAt: string
  updatedAt: string
}

interface FeatureFlagsDashboardData {
  featureStats: FeatureStats
  userGroups: UserGroup[]
  geographicRegions: GeographicRegion[]
  recentActivity: RecentActivity[]
  featureFlags: FeatureFlag[]
  lastUpdated: string
}

export const useFeatureFlagsDashboard = () => {
  const [data, setData] = useState<FeatureFlagsDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadFeatureFlagsData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🔄 Loading consolidated feature flags dashboard data...')
      
      const response = await apiClient.get<FeatureFlagsDashboardData>('/feature-flags/dashboard')
      
      if (response.success && response.data) {
        setData(response.data)
        setLastUpdated(new Date())
        console.log('✅ Consolidated feature flags dashboard data loaded successfully')
      } else {
        throw new Error(response.message || 'Failed to load feature flags dashboard data')
      }
    } catch (err: any) {
      console.error('❌ Failed to load consolidated feature flags dashboard data:', err)
      setError(err.message || 'Failed to load feature flags dashboard data')
      toast.error('Failed to load feature flags dashboard data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshData = useCallback(() => {
    loadFeatureFlagsData()
  }, [loadFeatureFlagsData])

  // Load data on mount
  useEffect(() => {
    loadFeatureFlagsData()
  }, [loadFeatureFlagsData])

  // Auto-refresh every 3 minutes (less frequent than individual calls)
  useEffect(() => {
    const interval = setInterval(loadFeatureFlagsData, 3 * 60 * 1000) // 3 minutes
    return () => clearInterval(interval)
  }, [loadFeatureFlagsData])

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refreshData,
    // Convenience getters for specific data sections
    featureStats: data?.featureStats || null,
    userGroups: data?.userGroups || [],
    geographicRegions: data?.geographicRegions || [],
    recentActivity: data?.recentActivity || [],
    featureFlags: data?.featureFlags || []
  }
}

export default useFeatureFlagsDashboard
