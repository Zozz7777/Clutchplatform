import React, { useState, useEffect, useCallback } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ErrorBoundary as BaseErrorBoundary } from './error-boundaries'
import { useAuthStore } from '../store'

/**
 * React Query Setup and Configuration
 * Features:
 * - Data fetching with React Query
 * - Optimistic updates
 * - Offline support
 * - Error boundaries
 * - Cache management
 */

// Query client configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time - how long data is considered fresh
      staleTime: 5 * 60 * 1000, // 5 minutes
      
      // Cache time - how long data stays in cache
      gcTime: 10 * 60 * 1000, // 10 minutes
      
      // Retry configuration
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false
        }
        // Retry up to 3 times for other errors
        return failureCount < 3
      },
      
      // Retry delay
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch on window focus
      refetchOnWindowFocus: false,
      
      // Refetch on reconnect
      refetchOnReconnect: true,
      
      // Background refetch
      refetchOnMount: true,
      
      // Network mode
      networkMode: 'online'
    },
    mutations: {
      // Retry mutations
      retry: 1,
      
      // Network mode for mutations
      networkMode: 'online'
    }
  }
})

// Query keys factory
export const queryKeys = {
  // Dashboard queries
  dashboard: {
    all: ['dashboard'] as const,
    metrics: () => [...queryKeys.dashboard.all, 'metrics'] as const,
    activity: () => [...queryKeys.dashboard.all, 'activity'] as const,
    alerts: () => [...queryKeys.dashboard.all, 'alerts'] as const
  },
  
  // User queries
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.users.lists(), { filters }] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const
  },
  
  // HR queries
  hr: {
    all: ['hr'] as const,
    employees: () => [...queryKeys.hr.all, 'employees'] as const,
    employee: (id: string) => [...queryKeys.hr.employees(), id] as const,
    departments: () => [...queryKeys.hr.all, 'departments'] as const,
    department: (id: string) => [...queryKeys.hr.departments(), id] as const
  },
  
  // Finance queries
  finance: {
    all: ['finance'] as const,
    invoices: () => [...queryKeys.finance.all, 'invoices'] as const,
    invoice: (id: string) => [...queryKeys.finance.invoices(), id] as const,
    expenses: () => [...queryKeys.finance.all, 'expenses'] as const,
    expense: (id: string) => [...queryKeys.finance.expenses(), id] as const
  },
  
  // CRM queries
  crm: {
    all: ['crm'] as const,
    customers: () => [...queryKeys.crm.all, 'customers'] as const,
    customer: (id: string) => [...queryKeys.crm.customers(), id] as const,
    deals: () => [...queryKeys.crm.all, 'deals'] as const,
    deal: (id: string) => [...queryKeys.crm.deals(), id] as const
  },
  
  // Partners queries
  partners: {
    all: ['partners'] as const,
    lists: () => [...queryKeys.partners.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.partners.lists(), { filters }] as const,
    details: () => [...queryKeys.partners.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.partners.details(), id] as const
  },
  
  // Fleet queries
  fleet: {
    all: ['fleet'] as const,
    vehicles: () => [...queryKeys.fleet.all, 'vehicles'] as const,
    vehicle: (id: string) => [...queryKeys.fleet.vehicles(), id] as const,
    drivers: () => [...queryKeys.fleet.all, 'drivers'] as const,
    driver: (id: string) => [...queryKeys.fleet.drivers(), id] as const
  }
}

// API service with React Query integration
export class ApiService {
  private baseURL: string
  private queryClient: QueryClient

  constructor(baseURL: string, queryClient: QueryClient) {
    this.baseURL = baseURL
    this.queryClient = queryClient
  }

  // Generic fetch method
  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // GET request
  async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.fetch<T>(endpoint, { method: 'GET', ...options })
  }

  // POST request
  async post<T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options
    })
  }

  // PUT request
  async put<T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options
    })
  }

  // DELETE request
  async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.fetch<T>(endpoint, { method: 'DELETE', ...options })
  }

  // Invalidate queries
  invalidateQueries(queryKey: readonly unknown[]) {
    this.queryClient.invalidateQueries({ queryKey })
  }

  // Set query data
  setQueryData<T>(queryKey: readonly unknown[], data: T) {
    this.queryClient.setQueryData(queryKey, data)
  }

  // Get query data
  getQueryData<T>(queryKey: readonly unknown[]): T | undefined {
    return this.queryClient.getQueryData(queryKey)
  }
}

// Create API service instance
export const apiService = new ApiService(process.env.NEXT_PUBLIC_API_BASE_URL || 'https://clutch-main-nk7x.onrender.com/api/v1', queryClient)

// Custom hooks for data fetching
export function useDashboardMetrics() {
  const { isAuthenticated } = useAuthStore()
  
  return useQuery({
    queryKey: queryKeys.dashboard.metrics(),
    queryFn: () => apiService.get('/dashboard/metrics'),
    staleTime: 2 * 60 * 1000, // 2 minutes for metrics
    enabled: isAuthenticated, // Only fetch when authenticated
  })
}

export function useDashboardActivity() {
  return useQuery({
    queryKey: queryKeys.dashboard.activity(),
    queryFn: () => apiService.get('/dashboard/activity'),
    staleTime: 1 * 60 * 1000, // 1 minute for activity
  })
}

export function useUsers(filters: Record<string, any> = {}) {
  return useQuery({
    queryKey: queryKeys.users.list(filters),
    queryFn: () => apiService.get('/users', { 
      body: JSON.stringify(filters) 
    }),
  })
}

export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => apiService.get(`/users/${id}`),
    enabled: !!id,
  })
}

export function useEmployees() {
  return useQuery({
    queryKey: queryKeys.hr.employees(),
    queryFn: () => apiService.get('/hr/employees'),
  })
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: queryKeys.hr.employee(id),
    queryFn: () => apiService.get(`/hr/employees/${id}`),
    enabled: !!id,
  })
}

// Mutation hooks
export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userData: any) => apiService.post('/users', userData),
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() })
    },
    onError: (error) => {
      console.error('Failed to create user:', error)
    }
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiService.put(`/users/${id}`, data),
    onSuccess: (data, variables) => {
      // Update the specific user in cache
      queryClient.setQueryData(
        queryKeys.users.detail(variables.id),
        data
      )
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() })
    },
    onError: (error) => {
      console.error('Failed to update user:', error)
    }
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiService.delete(`/users/${id}`),
    onSuccess: (_, id) => {
      // Remove user from cache
      queryClient.removeQueries({ queryKey: queryKeys.users.detail(id) })
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() })
    },
    onError: (error) => {
      console.error('Failed to delete user:', error)
    }
  })
}

// Optimistic updates hook
export function useOptimisticUpdate<T>(
  queryKey: readonly unknown[],
  updateFn: (oldData: T, newData: any) => T
) {
  const queryClient = useQueryClient()

  return useCallback((newData: any) => {
    queryClient.setQueryData(queryKey, (oldData: T) => 
      updateFn(oldData, newData)
    )
  }, [queryClient, queryKey, updateFn])
}

// Offline support
export function useOfflineSupport() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

// Error boundary for React Query
export class QueryErrorBoundary extends BaseErrorBoundary {
  constructor(props: any) {
    super(props)
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Query Error Boundary caught an error:', error, errorInfo)
    
    // Log error to monitoring service
    if (typeof window !== 'undefined') {
      // Send error to monitoring service
      console.error('Query Error:', error.message)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Something went wrong</h3>
            <p className="text-slate-600 mb-4">We encountered an error while loading data.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// React Query Provider component
export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}

// Error Boundary class
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Something went wrong</h2>
            <p className="text-slate-600 mb-4">We encountered an error while loading the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

const ReactQuerySetup = {
  queryClient,
  queryKeys,
  apiService,
  useDashboardMetrics,
  useDashboardActivity,
  useUsers,
  useUser,
  useEmployees,
  useEmployee,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useOptimisticUpdate,
  useOfflineSupport,
  QueryErrorBoundary,
  ReactQueryProvider
}

export default ReactQuerySetup
