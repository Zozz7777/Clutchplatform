'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { apiClient, type ApiResponse } from '@/lib/api'
import { useAuthStore } from '@/store'

export interface RealtimeOptions {
  refreshInterval?: number // in milliseconds
  enabled?: boolean
  retryAttempts?: number
  onError?: (error: any) => void
  onSuccess?: (data: any) => void
}

export function useRealtimeData<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  options: RealtimeOptions = {}
) {
  const {
    refreshInterval = 30000, // 30 seconds default
    enabled = true,
    retryAttempts = 3,
    onError,
    onSuccess,
  } = options

  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const retryCountRef = useRef(0)
  const mountedRef = useRef(true)

  const fetchData = useCallback(async () => {
    if (!enabled || !mountedRef.current) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await apiCall()

      if (!mountedRef.current) return

      if (response.success && response.data) {
        setData(response.data)
        setLastUpdated(new Date())
        retryCountRef.current = 0
        onSuccess?.(response.data)
      } else {
        throw new Error(response.message || 'Failed to fetch data')
      }
    } catch (err) {
      if (!mountedRef.current) return

      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      onError?.(err)

      // Retry logic with better rate limiting handling
      if (retryCountRef.current < retryAttempts) {
        retryCountRef.current++
        // Longer delay for rate limiting errors
        const isRateLimitError = errorMessage.includes('429') || errorMessage.includes('rate limit')
        const delay = isRateLimitError ? 10000 * retryCountRef.current : 3000 * retryCountRef.current
        setTimeout(fetchData, delay)
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [apiCall, enabled, retryAttempts, onError, onSuccess])

  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    if (enabled && refreshInterval > 0) {
      intervalRef.current = setInterval(fetchData, refreshInterval)
    }
  }, [fetchData, enabled, refreshInterval])

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const refresh = useCallback(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    mountedRef.current = true
    
    // Stagger initial requests to prevent rate limiting
    const initialDelay = Math.random() * 2000 // Random delay 0-2 seconds
    setTimeout(() => {
      if (mountedRef.current) {
        fetchData()
        startPolling()
      }
    }, initialDelay)

    return () => {
      mountedRef.current = false
      stopPolling()
    }
  }, [fetchData, startPolling, stopPolling])

  useEffect(() => {
    if (enabled) {
      startPolling()
    } else {
      stopPolling()
    }
  }, [enabled, startPolling, stopPolling])

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refresh,
    startPolling,
    stopPolling,
  }
}

// Specialized hooks for common data types
export function useDashboardMetrics(options?: RealtimeOptions) {
  const { isAuthenticated } = useAuthStore()
  
  return useRealtimeData(
    () => apiClient.getDashboardMetrics(),
    { 
      refreshInterval: 60000, // 1 minute
      retryAttempts: 2, // Reduced retry attempts
      enabled: isAuthenticated, // Only fetch when authenticated
      ...options 
    }
  )
}

export function usePlatformServices(options?: RealtimeOptions) {
  const { isAuthenticated } = useAuthStore()
  
  return useRealtimeData(
    () => apiClient.getPlatformServices(),
    { 
      refreshInterval: 120000, // 2 minutes - platform services don't change often
      retryAttempts: 2, // Reduced retry attempts
      enabled: isAuthenticated, // Only fetch when authenticated
      ...options 
    }
  )
}

export function useActivityLogs(limit = 20, options?: RealtimeOptions) {
  const { isAuthenticated } = useAuthStore()
  
  return useRealtimeData(
    () => apiClient.getActivityLogs(limit),
    { 
      refreshInterval: 45000, // Increased to 45 seconds to reduce load
      retryAttempts: 2, // Reduced retry attempts
      enabled: isAuthenticated, // Only fetch when authenticated
      ...options 
    }
  )
}

export function useRealtimeMetrics(options?: RealtimeOptions) {
  return useRealtimeData(
    () => apiClient.getRealTimeMetrics(),
    { refreshInterval: 5000, ...options }
  )
}

export function useUsers(page = 1, limit = 20, filters?: any, options?: RealtimeOptions) {
  return useRealtimeData(
    () => apiClient.get(`/hr/employees?page=${page}&limit=${limit}`, filters),
    { refreshInterval: 60000, ...options }
  )
}

export function useDrivers(page = 1, limit = 20, filters?: any, options?: RealtimeOptions) {
  return useRealtimeData(
    () => apiClient.get(`/fleet/drivers?page=${page}&limit=${limit}`, filters),
    { refreshInterval: 30000, ...options }
  )
}

export function usePartners(page = 1, limit = 20, filters?: any, options?: RealtimeOptions) {
  return useRealtimeData(
    () => apiClient.get(`/partners?page=${page}&limit=${limit}`, filters),
    { refreshInterval: 60000, ...options }
  )
}

export function useOrders(page = 1, limit = 20, filters?: any, options?: RealtimeOptions) {
  return useRealtimeData(
    () => apiClient.get(`/orders?page=${page}&limit=${limit}`, filters),
    { refreshInterval: 15000, ...options }
  )
}

export function useAnalytics(period = '30d', options?: RealtimeOptions) {
  return useRealtimeData(
    () => apiClient.get(`/analytics?period=${period}`),
    { refreshInterval: 300000, ...options } // 5 minutes
  )
}

export function useRevenueData(period = '30d', options?: RealtimeOptions) {
  return useRealtimeData(
    () => apiClient.get(`/analytics/revenue?period=${period}`),
    { refreshInterval: 300000, ...options } // 5 minutes
  )
}

export function useNotifications(page = 1, limit = 20, options?: RealtimeOptions) {
  return useRealtimeData(
    () => apiClient.get(`/notifications?page=${page}&limit=${limit}`),
    { refreshInterval: 30000, ...options }
  )
}

export function useSystemHealth(options?: RealtimeOptions) {
  return useRealtimeData(
    () => apiClient.getSystemHealth(),
    { refreshInterval: 30000, ...options }
  )
}

export function useBusinessMetrics(period = '30d', options?: RealtimeOptions) {
  return useRealtimeData(
    () => apiClient.get(`/analytics/business?period=${period}`),
    { refreshInterval: 300000, ...options } // 5 minutes
  )
}
