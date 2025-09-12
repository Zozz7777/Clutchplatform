'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/consolidated-api'
import { queryKeys } from '@/lib/react-query-setup'
import { handleError } from '@/utils/error-handling'

// Enhanced data fetching hooks using React Query
export function useKnowledgeBase() {
  return useQuery({
    queryKey: ['knowledge-base'],
    queryFn: () => apiClient.getKnowledgeBase(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

export function useIncidents() {
  return useQuery({
    queryKey: ['incidents'],
    queryFn: () => apiClient.getIncidents(),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  })
}

export function useMobileCrashes() {
  return useQuery({
    queryKey: ['mobile-crashes'],
    queryFn: () => apiClient.getMobileCrashes(),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
    refetchInterval: 15 * 1000, // Refetch every 15 seconds
  })
}

export function useMobileContent() {
  return useQuery({
    queryKey: ['mobile-content'],
    queryFn: () => apiClient.getMobileContent(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  })
}

export function useFeatureFlags() {
  return useQuery({
    queryKey: ['feature-flags'],
    queryFn: () => apiClient.getFeatureFlags(),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })
}

export function useMediaLibrary() {
  return useQuery({
    queryKey: ['media-library'],
    queryFn: () => apiClient.getMediaLibrary(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  })
}

export function useUserSegments() {
  return useQuery({
    queryKey: ['user-segments'],
    queryFn: () => apiClient.getUserSegments(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  })
}

export function useUserCohorts() {
  return useQuery({
    queryKey: ['user-cohorts'],
    queryFn: () => apiClient.getUserCohorts(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  })
}

export function useFeedback() {
  return useQuery({
    queryKey: ['feedback'],
    queryFn: () => apiClient.getFeedback(),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchInterval: 60 * 1000, // Refetch every minute
  })
}

export function usePricingAnalytics() {
  return useQuery({
    queryKey: ['pricing-analytics'],
    queryFn: () => apiClient.getPricingAnalytics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  })
}

export function useRevenueForecasting() {
  return useQuery({
    queryKey: ['revenue-forecasting'],
    queryFn: () => apiClient.getRevenueForecasting(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  })
}

export function useSEOManagement() {
  return useQuery({
    queryKey: ['seo-management'],
    queryFn: () => apiClient.getSEOManagement(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  })
}

// Mutation hooks with optimistic updates
export function useCreateKnowledgeBaseArticle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => apiClient.createKnowledgeBaseArticle(data),
    onMutate: async (newArticle) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['knowledge-base'] })

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(['knowledge-base'])

      // Optimistically update to the new value
      queryClient.setQueryData(['knowledge-base'], (old: any) => {
        if (!old?.data?.articles) return old
        return {
          ...old,
          data: {
            ...old.data,
            articles: [...old.data.articles, { ...newArticle, id: Date.now() }]
          }
        }
      })

      // Return a context object with the snapshotted value
      return { previousData }
    },
    onError: (err, newArticle, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(['knowledge-base'], context?.previousData)
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['knowledge-base'] })
    },
  })
}

export function useUpdateKnowledgeBaseArticle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiClient.updateKnowledgeBaseArticle(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['knowledge-base'] })
      const previousData = queryClient.getQueryData(['knowledge-base'])

      queryClient.setQueryData(['knowledge-base'], (old: any) => {
        if (!old?.data?.articles) return old
        return {
          ...old,
          data: {
            ...old.data,
            articles: old.data.articles.map((article: any) =>
              article.id === id ? { ...article, ...data } : article
            )
          }
        }
      })

      return { previousData }
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['knowledge-base'], context?.previousData)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base'] })
    },
  })
}

export function useDeleteKnowledgeBaseArticle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteKnowledgeBaseArticle(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['knowledge-base'] })
      const previousData = queryClient.getQueryData(['knowledge-base'])

      queryClient.setQueryData(['knowledge-base'], (old: any) => {
        if (!old?.data?.articles) return old
        return {
          ...old,
          data: {
            ...old.data,
            articles: old.data.articles.filter((article: any) => article.id !== id)
          }
        }
      })

      return { previousData }
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['knowledge-base'], context?.previousData)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base'] })
    },
  })
}

export function useCreateIncident() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => apiClient.createIncident(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] })
    },
  })
}

export function useUpdateIncident() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiClient.updateIncident(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] })
    },
  })
}

export function useResolveIncident() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiClient.resolveIncident(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['incidents'] })
      const previousData = queryClient.getQueryData(['incidents'])

      queryClient.setQueryData(['incidents'], (old: any) => {
        if (!old?.data) return old
        return {
          ...old,
          data: old.data.map((incident: any) =>
            incident.id === id ? { ...incident, status: 'resolved' } : incident
          )
        }
      })

      return { previousData }
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['incidents'], context?.previousData)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] })
    },
  })
}

export function useToggleFeatureFlag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) => 
      apiClient.toggleFeatureFlag(id, enabled),
    onMutate: async ({ id, enabled }) => {
      await queryClient.cancelQueries({ queryKey: ['feature-flags'] })
      const previousData = queryClient.getQueryData(['feature-flags'])

      queryClient.setQueryData(['feature-flags'], (old: any) => {
        if (!old?.data) return old
        return {
          ...old,
          data: old.data.map((flag: any) =>
            flag.id === id ? { ...flag, enabled } : flag
          )
        }
      })

      return { previousData }
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['feature-flags'], context?.previousData)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] })
    },
  })
}

export function useUploadMedia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => apiClient.uploadMedia(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-library'] })
    },
  })
}

export function useDeleteMedia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteMedia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-library'] })
    },
  })
}

// Utility hook for optimistic updates
export function useOptimisticUpdate<T>(
  queryKey: readonly unknown[],
  updateFn: (oldData: T, newData: any) => T
) {
  const queryClient = useQueryClient()

  return (newData: any) => {
    queryClient.setQueryData(queryKey, (oldData: T) => 
      updateFn(oldData, newData)
    )
  }
}

// Hook for prefetching data
export function usePrefetchData() {
  const queryClient = useQueryClient()

  const prefetchKnowledgeBase = () => {
    queryClient.prefetchQuery({
      queryKey: ['knowledge-base'],
      queryFn: () => apiClient.getKnowledgeBase(),
      staleTime: 5 * 60 * 1000,
    })
  }

  const prefetchIncidents = () => {
    queryClient.prefetchQuery({
      queryKey: ['incidents'],
      queryFn: () => apiClient.getIncidents(),
      staleTime: 1 * 60 * 1000,
    })
  }

  const prefetchFeatureFlags = () => {
    queryClient.prefetchQuery({
      queryKey: ['feature-flags'],
      queryFn: () => apiClient.getFeatureFlags(),
      staleTime: 1 * 60 * 1000,
    })
  }

  return {
    prefetchKnowledgeBase,
    prefetchIncidents,
    prefetchFeatureFlags,
  }
}
