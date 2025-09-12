'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/consolidated-api'

export interface DataFetchingState<T> {
  data: T | null
  isLoading: boolean
  error: string | null
  lastUpdated: Date | null
}

export interface DataFetchingOptions {
  enabled?: boolean
  refetchInterval?: number
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
}

export function useDataFetching<T>(
  fetchFunction: () => Promise<{ success: boolean; data?: T; message?: string }>,
  options: DataFetchingOptions = {}
) {
  const [state, setState] = useState<DataFetchingState<T>>({
    data: null,
    isLoading: true,
    error: null,
    lastUpdated: null
  })

  const { enabled = true, refetchInterval, onSuccess, onError } = options

  const fetchData = useCallback(async () => {
    if (!enabled) return

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await fetchFunction()
      
      if (response.success && response.data) {
        setState({
          data: response.data,
          isLoading: false,
          error: null,
          lastUpdated: new Date()
        })
        onSuccess?.(response.data)
      } else {
        const errorMessage = response.message || 'Failed to fetch data'
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage
        }))
        onError?.(errorMessage)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }))
      onError?.(errorMessage)
    }
  }, [fetchFunction, enabled, onSuccess, onError])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (refetchInterval && enabled) {
      const interval = setInterval(fetchData, refetchInterval)
      return () => clearInterval(interval)
    }
  }, [fetchData, refetchInterval, enabled])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  return {
    ...state,
    refetch
  }
}

// Specific hooks for different data types
export function useKnowledgeBase() {
  return useDataFetching(
    () => apiClient.getKnowledgeBase(),
    { refetchInterval: 300000 } // 5 minutes
  )
}

export function useIncidents() {
  return useDataFetching(
    () => apiClient.getIncidents(),
    { refetchInterval: 60000 } // 1 minute
  )
}

export function useMobileCrashes() {
  return useDataFetching(
    () => apiClient.getMobileCrashes(),
    { refetchInterval: 30000 } // 30 seconds
  )
}

export function useMobileContent() {
  return useDataFetching(
    () => apiClient.getMobileContent(),
    { refetchInterval: 300000 } // 5 minutes
  )
}

export function useFeatureFlags() {
  return useDataFetching(
    () => apiClient.getFeatureFlags(),
    { refetchInterval: 60000 } // 1 minute
  )
}

export function useMediaLibrary() {
  return useDataFetching(
    () => apiClient.getMediaLibrary(),
    { refetchInterval: 300000 } // 5 minutes
  )
}

export function useUserSegments() {
  return useDataFetching(
    () => apiClient.getUserSegments(),
    { refetchInterval: 300000 } // 5 minutes
  )
}

export function useUserCohorts() {
  return useDataFetching(
    () => apiClient.getUserCohorts(),
    { refetchInterval: 300000 } // 5 minutes
  )
}

export function useFeedback() {
  return useDataFetching(
    () => apiClient.getFeedback(),
    { refetchInterval: 60000 } // 1 minute
  )
}

export function usePricingAnalytics() {
  return useDataFetching(
    () => apiClient.getPricingAnalytics(),
    { refetchInterval: 300000 } // 5 minutes
  )
}

export function useRevenueForecasting() {
  return useDataFetching(
    () => apiClient.getRevenueForecasting(),
    { refetchInterval: 300000 } // 5 minutes
  )
}

export function useSEOManagement() {
  return useDataFetching(
    () => apiClient.getSEOManagement(),
    { refetchInterval: 300000 } // 5 minutes
  )
}
