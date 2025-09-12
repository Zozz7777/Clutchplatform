import { rateLimiters } from '@/utils/rate-limiter'
import { performanceMonitor } from '@/utils/performanceMonitor'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  timestamp?: number
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface ApiError {
  code: string
  message: string
  details?: any
}

class ApiClient {
  private baseURL: string
  private token: string | null = null
  private refreshToken: string | null = null
  private isRefreshing = false
  private refreshSubscribers: Array<(token: string) => void> = []
  private lastRequestTime = 0
  private requestDelay = 100 // 100ms delay between requests to avoid rate limiting
  private useMockAuth = false // Force real API calls - mock auth disabled
  private consecutiveErrors = 0
  private maxConsecutiveErrors = 5
  private circuitBreakerTimeout = 30000 // 30 seconds
  private circuitBreakerOpen = false
  private circuitBreakerOpenTime = 0

  constructor() {
    this.baseURL = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'https://clutch-main-nk7x.onrender.com/api/v1')
    this.loadTokens()
  }

  private loadTokens() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth-token')
      this.refreshToken = localStorage.getItem('refresh-token')

      if (process.env.NEXT_PUBLIC_DEBUG_AUTH === 'true' && process.env.NODE_ENV !== 'production') {
        console.log('🔄 CLUTCH_LOAD_TOKENS', {
          hasToken: !!this.token,
          hasRefreshToken: !!this.refreshToken,
          tokenLength: this.token?.length || 0,
          timestamp: new Date().toISOString()
        })
      }

      // CRITICAL: If no token found, try alternative storage keys
      if (!this.token) {
        const alternativeKeys = ['token', 'access_token', 'jwt_token', 'authToken']
        for (const key of alternativeKeys) {
          const altToken = localStorage.getItem(key)
          if (altToken) {
            if (process.env.NEXT_PUBLIC_DEBUG_AUTH === 'true' && process.env.NODE_ENV !== 'production') {
              console.log('🔄 FOUND_ALTERNATIVE_TOKEN', { key, length: altToken.length })
            }
            this.token = altToken
            break
          }
        }
      }
    } else {
      if (process.env.NEXT_PUBLIC_DEBUG_AUTH === 'true' && process.env.NODE_ENV !== 'production') {
        console.log('🔄 CLUTCH_LOAD_TOKENS: Server-side (no window object)')
      }
    }
  }

  // Method to reload tokens (useful for session management)
  public reloadTokens() {
    this.loadTokens()
  }

  // Method to force token refresh and ensure it's available for requests
  public ensureToken(): boolean {
    this.loadTokens()
    
    if (!this.token && typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('auth-token')
      if (storedToken) {
        if (process.env.NEXT_PUBLIC_DEBUG_AUTH === 'true' && process.env.NODE_ENV !== 'production') {
          console.log('🔄 FORCE_TOKEN_RELOAD')
        }
        this.token = storedToken
        return true
      }
    }
    
    // Validate token format if it exists
    if (this.token && typeof this.token === 'string') {
      // Check if token looks valid (basic format check)
      if (this.token.length < 10 || this.token.includes('undefined') || this.token.includes('null')) {
        if (process.env.NEXT_PUBLIC_DEBUG_AUTH === 'true' && process.env.NODE_ENV !== 'production') {
          console.warn('🚨 INVALID_TOKEN_FORMAT')
        }
        this.clearTokens()
        return false
      }
    }
    
    return !!this.token
  }



  // Method to reset circuit breaker
  public resetCircuitBreaker(): void {
    this.circuitBreakerOpen = false
    this.consecutiveErrors = 0
    this.circuitBreakerOpenTime = 0
    console.log('🔄 CIRCUIT_BREAKER_MANUALLY_RESET')
  }

  // Check if circuit breaker is open
  public isCircuitBreakerOpen(): boolean {
    if (!this.circuitBreakerOpen) return false
    
    const timeSinceOpen = Date.now() - this.circuitBreakerOpenTime
    if (timeSinceOpen >= this.circuitBreakerTimeout) {
      // Auto-reset if timeout has passed
      this.circuitBreakerOpen = false
      this.consecutiveErrors = 0
      console.log('🔄 CIRCUIT_BREAKER_AUTO_RESET: Circuit breaker auto-reset after timeout')
      return false
    }
    
    return true
  }

  setTokens(token: string, refreshTokenParam?: string) {
    this.token = token
    if (refreshTokenParam) {
      this.refreshToken = refreshTokenParam
    }
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-token', token)
      if (refreshTokenParam) {
        localStorage.setItem('refresh-token', refreshTokenParam)
      }

      if (process.env.NEXT_PUBLIC_DEBUG_AUTH === 'true' && process.env.NODE_ENV !== 'production') {
        console.log('🔑 CLUTCH_SET_TOKENS', {
          hasToken: !!token,
          tokenLength: token?.length || 0,
          hasRefreshToken: !!refreshTokenParam,
          apiClientTokenSet: !!this.token,
          localStorageUpdated: true,
          timestamp: new Date().toISOString()
        })
      }
    }
  }

  private clearTokens() {
    this.token = null
    this.refreshToken = null
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token')
      localStorage.removeItem('refresh-token')
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    addApiVersion = true
  ): Promise<ApiResponse<T>> {
    // Track API request performance
    const requestId = `${endpoint}-${Date.now()}`
    performanceMonitor.trackApiRequest(requestId)
    
    // Check circuit breaker
    if (this.circuitBreakerOpen) {
      const timeSinceOpen = Date.now() - this.circuitBreakerOpenTime
      if (timeSinceOpen < this.circuitBreakerTimeout) {
        console.warn('🚨 CIRCUIT_BREAKER_OPEN: Skipping request due to consecutive errors')
        return {
          success: false,
          message: 'Service temporarily unavailable due to consecutive errors',
          timestamp: Date.now()
        } as ApiResponse<T>
      } else {
        // Reset circuit breaker
        this.circuitBreakerOpen = false
        this.consecutiveErrors = 0
        console.log('🔄 CIRCUIT_BREAKER_RESET: Attempting requests again')
      }
    }

    // Use mock API if enabled
    if (this.useMockAuth) {
      console.log('🔧 Using mock API for development:', endpoint)
      const { mockApiClient } = await import('./mock-auth')
      
      try {
        if (options.method === 'GET' || !options.method) {
          const data = await mockApiClient.get<T>(endpoint)
          return data as ApiResponse<T>
        } else if (options.method === 'POST') {
          const data = await mockApiClient.post<T>(endpoint, options.body)
          return data as ApiResponse<T>
        } else if (options.method === 'PUT') {
          const data = await mockApiClient.put<T>(endpoint, options.body)
          return data as ApiResponse<T>
        } else if (options.method === 'DELETE') {
          const data = await mockApiClient.delete<T>(endpoint)
          return data as ApiResponse<T>
        }
      } catch (error) {
        return {
          success: false,
          message: 'Mock API error',
          timestamp: Date.now()
        } as ApiResponse<T>
      }
    }
    
    // CRITICAL: Ensure we have a valid token before making requests
    const hasToken = this.ensureToken()
    
    // Use rate limiter for better request management
    const rateLimiter = endpoint.includes('/auth/') ? rateLimiters.auth : 
                       endpoint.includes('/dashboard') ? rateLimiters.dashboard :
                       rateLimiters.general
    
    await rateLimiter.waitForSlot()
    rateLimiter.recordRequest()
    
    // Check if we need authentication for this endpoint
    const requiresAuth = !endpoint.includes('/auth/') && !endpoint.includes('/health')
    
    if (requiresAuth && !hasToken) {
      console.warn('🚨 NO_TOKEN_FOR_PROTECTED_ENDPOINT:', endpoint)
      if (typeof window !== 'undefined') {
        console.warn('🚨 REDIRECTING_TO_LOGIN: No token for protected endpoint')
        window.location.href = '/login'
        return {
          success: false,
          message: 'Authentication required',
          timestamp: Date.now()
        } as ApiResponse<T>
      }
    }
    
    const baseUrl = addApiVersion ? this.baseURL : this.baseURL.replace('/api/v1', '')
    const url = `${baseUrl}${endpoint}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-API-Version': 'v1', // Add API version header
      ...(options.headers as Record<string, string>),
    }

    // CRITICAL: Always add Authorization header if we have a token
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    if (process.env.NEXT_PUBLIC_DEBUG_AUTH === 'true' && process.env.NODE_ENV !== 'production') {
      console.log('🔍 CLUTCH_TOKEN_DEBUG', {
        endpoint,
        hasApiClientToken: !!this.token,
        tokenLength: this.token?.length || 0,
        hasLocalStorageToken: typeof window !== 'undefined' ? !!localStorage.getItem('auth-token') : 'N/A',
        hasAuthHeader: !!headers.Authorization,
        timestamp: new Date().toISOString()
      })
    }

    // Only log API requests in development or when explicitly enabled
    if ((process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEBUG_API === 'true') && process.env.NEXT_PUBLIC_DEBUG_AUTH === 'true') {
      console.log('🚀 CLUTCH_API_REQUEST', {
        url,
        method: options.method || 'GET',
        hasAuthHeader: !!headers.Authorization,
        authHeaderExists: 'Authorization' in headers,
        hasToken: !!this.token,
        headerKeys: Object.keys(headers),
        timestamp: new Date().toISOString()
      })
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (response.status === 401) {
        if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEBUG_AUTH === 'true') {
          console.warn('🚨 AUTH_ERROR: 401 Unauthorized - attempting token refresh')
        }
        if (this.refreshToken) {
          return this.handleTokenRefresh<T>(endpoint, options)
        } else {
          // No refresh token available, redirect to login
          if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEBUG_AUTH === 'true') {
            console.warn('🚨 NO_REFRESH_TOKEN: Redirecting to login')
          }
          this.clearTokens()
          if (typeof window !== 'undefined' && !endpoint.includes('/auth/')) {
            window.location.href = '/login'
          }
          return {
            success: false,
            message: 'Authentication expired. Please login again.',
            timestamp: Date.now()
          } as ApiResponse<T>
        }
      }

      // Handle 500 errors - these are server issues, not auth issues
      if (response.status === 500) {
        if (process.env.NEXT_PUBLIC_DEBUG_AUTH === 'true' && process.env.NODE_ENV !== 'production') {
          console.warn('🚨 SERVER_ERROR: 500 Internal Server Error - Server issue, not auth issue')
        }
        // Don't clear tokens for 500 errors - these are server problems
        // Only clear tokens for actual authentication errors (401, 403)
        
        return {
          success: false,
          error: 'Server temporarily unavailable',
          message: 'The server is experiencing issues. Please try again later.',
          timestamp: Date.now()
        } as ApiResponse<T>
      }

      const data = await response.json()

      if (!response.ok) {
        // Handle rate limiting specifically
        if (response.status === 429) {
          if (process.env.NEXT_PUBLIC_DEBUG_AUTH === 'true' && process.env.NODE_ENV !== 'production') {
            console.warn('🚨 RATE_LIMIT_HIT: Backing off gracefully')
          }
          // Use a more reasonable backoff strategy
          this.requestDelay = Math.min(this.requestDelay * 1.5, 10000) // 1.5x delay, max 10 seconds
          
          // Wait longer before retrying
          await new Promise(resolve => setTimeout(resolve, this.requestDelay))
          
          // Retry the request once with exponential backoff
          if (process.env.NEXT_PUBLIC_DEBUG_AUTH === 'true' && process.env.NODE_ENV !== 'production') {
            console.log('🔄 RETRYING_REQUEST after rate limit delay')
          }
          return this.request<T>(endpoint, options, addApiVersion)
        }
        
        // Enhanced error handling with detailed error information
        const error = new Error(data.message || data.error || `HTTP ${response.status}`) as any
        error.code = data.error || 'API_ERROR'
        error.details = data.details || data
        error.statusCode = data.statusCode || response.status
        error.endpoint = endpoint
        error.method = options.method || 'GET'
        error.timestamp = new Date().toISOString()
        
        if (process.env.NEXT_PUBLIC_DEBUG_AUTH === 'true' && process.env.NODE_ENV !== 'production') {
          console.error('API Error Details', {
            endpoint,
            method: options.method || 'GET',
            statusCode: response.status,
            errorCode: data.error,
            message: data.message,
            timestamp: new Date().toISOString()
          })
        }
        
        throw error
      }

      // Reset consecutive errors on successful request
      this.consecutiveErrors = 0
      return data
    } catch (error: any) {
      // Circuit breaker logic
      if (error.statusCode >= 500 || error.code === 'NETWORK_ERROR') {
        this.consecutiveErrors++
        if (this.consecutiveErrors >= this.maxConsecutiveErrors) {
          this.circuitBreakerOpen = true
          this.circuitBreakerOpenTime = Date.now()
          if (process.env.NEXT_PUBLIC_DEBUG_AUTH === 'true' && process.env.NODE_ENV !== 'production') {
            console.warn('🚨 CIRCUIT_BREAKER_TRIGGERED: Too many consecutive errors, opening circuit breaker')
          }
        }
      } else {
        // Reset consecutive errors on successful requests or non-5xx errors
        this.consecutiveErrors = 0
      }

      if (process.env.NEXT_PUBLIC_DEBUG_AUTH === 'true' && process.env.NODE_ENV !== 'production') {
        console.error('API request failed', {
          endpoint,
          method: options.method || 'GET',
          error: error.message,
          code: error.code,
          statusCode: error.statusCode,
          consecutiveErrors: this.consecutiveErrors,
          circuitBreakerOpen: this.circuitBreakerOpen,
          timestamp: new Date().toISOString()
        })
      }
      throw error
    } finally {
      // Track API response performance
      performanceMonitor.trackApiResponse(requestId)
    }
  }

  private async handleTokenRefresh<T>(
    endpoint: string,
    options: RequestInit
  ): Promise<ApiResponse<T>> {
    if (this.isRefreshing) {
      return new Promise((resolve) => {
        this.refreshSubscribers.push((token: string) => {
          options.headers = {
            ...options.headers,
            Authorization: `Bearer ${token}`,
          }
          this.request<T>(endpoint, options).then(resolve)
        })
      })
    }

    this.isRefreshing = true

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Version': 'v1', // Add API version header
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        const responseData = data.data as { token: string; refreshToken: string }
        this.setTokens(responseData.token, responseData.refreshToken)
        this.refreshSubscribers.forEach((callback) => callback(responseData.token))
        this.refreshSubscribers = []

        // Retry original request
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${responseData.token}`,
        }
        return this.request<T>(endpoint, options)
      } else {
        this.clearTokens()
        window.location.href = '/login'
        return {
          success: false,
          message: 'Authentication failed',
          timestamp: Date.now(),
        }
      }
    } catch (error) {
      this.clearTokens()
      window.location.href = '/login'
      return {
        success: false,
        message: 'Authentication failed',
        timestamp: Date.now(),
      }
    } finally {
      this.isRefreshing = false
    }
  }

  // Authentication methods
  async login(credentials: { email: string; password: string }): Promise<ApiResponse<{ user: any; token: string; refreshToken: string }>> {
    // Use mock authentication if enabled
    if (this.useMockAuth) {
      console.log('🔧 Using mock authentication for development')
      const { mockAuth } = await import('./mock-auth')
      const mockResponse = await mockAuth.login(credentials)
      
      if (mockResponse.success && mockResponse.data) {
        this.setTokens(mockResponse.data.token, mockResponse.data.refreshToken)
        return {
          success: true,
          data: mockResponse.data,
          message: 'Mock login successful',
          timestamp: Date.now()
        }
      } else {
        return {
          success: false,
          message: mockResponse.message || 'Mock login failed',
          timestamp: Date.now()
        }
      }
    }
    // Use employee login endpoint
    try {
      const response = await this.request('/auth/employee-login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      })

      if (response.success && response.data) {
        const loginData = response.data as { user: any; token: string; refreshToken: string }
        this.setTokens(loginData.token, loginData.refreshToken)
        return response as ApiResponse<{ user: any; token: string; refreshToken: string }>
      } else {
        return {
          success: false,
          message: response.message || 'Login failed',
          timestamp: Date.now()
        }
      }
    } catch (error: any) {
      console.error('Employee login failed:', error)
      
      // Handle CORS errors specifically
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        return {
          success: false,
          message: 'Network error: Unable to connect to the server. Please check your internet connection and try again.',
          error: 'NETWORK_ERROR',
          timestamp: Date.now()
        }
      }
      
      // Handle CORS errors
      if (error.message && error.message.includes('CORS')) {
        return {
          success: false,
          message: 'Cross-origin request blocked. Please contact support if this issue persists.',
          error: 'CORS_ERROR',
          timestamp: Date.now()
        }
      }
      
      return {
        success: false,
        message: error.message || 'Login failed due to network error',
        error: error.code || 'UNKNOWN_ERROR',
        timestamp: Date.now()
      }
    }
  }

  async logout(): Promise<ApiResponse> {
    try {
      await this.request('/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout request failed:', error)
    } finally {
      this.clearTokens()
    }

    return { success: true }
  }

  async getCurrentUser(): Promise<ApiResponse<any>> {
    return this.request('/auth/employee-me')
  }

  async refreshAuthToken(): Promise<ApiResponse<any>> {
    if (!this.refreshToken) {
      return {
        success: false,
        message: 'No refresh token available',
        timestamp: Date.now()
      }
    }
    
    return this.request('/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: this.refreshToken })
    })
  }

  // Dashboard methods
  async getDashboardMetrics(): Promise<ApiResponse<any>> {
    return this.request('/admin/dashboard/metrics')
  }

  // Consolidated dashboard data - single API call for all dashboard data
  async getConsolidatedDashboardData(): Promise<ApiResponse<any>> {
    return this.request('/admin/dashboard/consolidated')
  }

  async getDashboardAnalytics(): Promise<ApiResponse<any>> {
    return this.request('/analytics')
  }

  // Platform services method
  async getPlatformServices(): Promise<ApiResponse<any>> {
    return this.request('/admin/platform/services')
  }

  // Activity logs method
  async getActivityLogs(limit = 20, offset = 0): Promise<ApiResponse<any>> {
    return this.request(`/admin/activity-logs?limit=${limit}&offset=${offset}`)
  }

  async getRealTimeMetrics(): Promise<ApiResponse<any>> {
    return this.request('/dashboard/admin/overview')
  }

  async getRecentActivities(): Promise<ApiResponse<any[]>> {
    return this.request('/dashboard/admin/overview')
  }

  // HR methods
  async getEmployees(params?: { page?: number; limit?: number; search?: string; department?: string }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.department) queryParams.append('department', params.department)

    return this.request(`/hr/employees?${queryParams.toString()}`)
  }

  async createEmployee(employee: any): Promise<ApiResponse<any>> {
    return this.request('/hr/employees', {
      method: 'POST',
      body: JSON.stringify(employee),
    })
  }

  async updateEmployee(id: string, employee: any): Promise<ApiResponse<any>> {
    return this.request(`/hr/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(employee),
    })
  }

  async deleteEmployee(id: string): Promise<ApiResponse> {
    return this.request(`/hr/employees/${id}`, {
      method: 'DELETE',
    })
  }

  async getDepartments(): Promise<ApiResponse<any[]>> {
    return this.request('/hr/departments')
  }

  // Finance methods
  async getInvoices(params?: { page?: number; limit?: number; status?: string; dateFrom?: string; dateTo?: string }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.status) queryParams.append('status', params.status)
    if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom)
    if (params?.dateTo) queryParams.append('dateTo', params.dateTo)

    return this.request(`/finance/invoices?${queryParams.toString()}`)
  }

  async createInvoice(invoice: any): Promise<ApiResponse<any>> {
    return this.request('/finance/invoices', {
      method: 'POST',
      body: JSON.stringify(invoice),
    })
  }

  async updateInvoice(id: string, invoice: any): Promise<ApiResponse<any>> {
    return this.request(`/finance/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(invoice),
    })
  }

  async deleteInvoice(id: string): Promise<ApiResponse> {
    return this.request(`/finance/invoices/${id}`, {
      method: 'DELETE',
    })
  }

  async getPayments(params?: { page?: number; limit?: number; status?: string }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.status) queryParams.append('status', params.status)

    return this.request(`/finance/payments?${queryParams.toString()}`)
  }

  async getExpenses(params?: { page?: number; limit?: number; category?: string }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.category) queryParams.append('category', params.category)

    return this.request(`/finance/expenses?${queryParams.toString()}`)
  }

  // CRM methods
  async getCustomers(params?: { page?: number; limit?: number; search?: string; status?: string }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.status) queryParams.append('status', params.status)

    return this.request(`/crm/customers?${queryParams.toString()}`)
  }

  async createCustomer(customer: any): Promise<ApiResponse<any>> {
    return this.request('/crm/customers', {
      method: 'POST',
      body: JSON.stringify(customer),
    })
  }

  async updateCustomer(id: string, customer: any): Promise<ApiResponse<any>> {
    return this.request(`/crm/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customer),
    })
  }

  async deleteCustomer(id: string): Promise<ApiResponse> {
    return this.request(`/crm/customers/${id}`, {
      method: 'DELETE',
    })
  }

  async getDeals(params?: { page?: number; limit?: number; stage?: string }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.stage) queryParams.append('stage', params.stage)

    return this.request(`/crm/deals?${queryParams.toString()}`)
  }

  async createDeal(deal: any): Promise<ApiResponse<any>> {
    return this.request('/crm/deals', {
      method: 'POST',
      body: JSON.stringify(deal),
    })
  }

  async updateDeal(id: string, deal: any): Promise<ApiResponse<any>> {
    return this.request(`/crm/deals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(deal),
    })
  }

  async deleteDeal(id: string): Promise<ApiResponse> {
    return this.request(`/crm/deals/${id}`, {
      method: 'DELETE',
    })
  }

  // Fleet methods
  async getFleetVehicles(params?: { page?: number; limit?: number; status?: string }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.status) queryParams.append('status', params.status)

    return this.request(`/fleet-vehicles?${queryParams.toString()}`)
  }

  async getFleetTracking(): Promise<ApiResponse<any>> {
    return this.request('/fleet/tracking')
  }



  // Partners methods
  async getPartners(): Promise<ApiResponse<any[]>> {
    return this.request('/partners')
  }

  async getPartner(id: string): Promise<ApiResponse<any>> {
    return this.request(`/partners/${id}`)
  }

  async createPartner(data: any): Promise<ApiResponse<any>> {
    return this.request('/partners', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updatePartner(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/partners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deletePartner(id: string): Promise<ApiResponse<any>> {
    return this.request(`/partners/${id}`, { method: 'DELETE' })
  }

  async getPartnerOrders(params?: { page?: number; limit?: number; status?: string }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.status) queryParams.append('status', params.status)

    return this.request(`/partners/orders?${queryParams.toString()}`)
  }

  // Marketing methods
  async getCampaigns(params?: { page?: number; limit?: number; status?: string }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.status) queryParams.append('status', params.status)

    return this.request(`/marketing/campaigns?${queryParams.toString()}`)
  }

  async createCampaign(campaign: any): Promise<ApiResponse<any>> {
    return this.request('/marketing/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaign),
    })
  }

  async updateCampaign(id: string, campaign: any): Promise<ApiResponse<any>> {
    return this.request(`/marketing/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(campaign),
    })
  }

  async deleteCampaign(id: string): Promise<ApiResponse> {
    return this.request(`/marketing/campaigns/${id}`, {
      method: 'DELETE',
    })
  }

  async getMarketingAnalytics(period?: string): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams()
    if (period) queryParams.append('period', period)

    return this.request(`/marketing/analytics?${queryParams.toString()}`)
  }

  // Projects methods
  async getProjects(params?: { page?: number; limit?: number; status?: string }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.status) queryParams.append('status', params.status)

    return this.request(`/projects?${queryParams.toString()}`)
  }

  async createProject(project: any): Promise<ApiResponse<any>> {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    })
  }

  async updateProject(id: string, project: any): Promise<ApiResponse<any>> {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(project),
    })
  }

  async deleteProject(id: string): Promise<ApiResponse> {
    return this.request(`/projects/${id}`, {
      method: 'DELETE',
    })
  }

  async getProjectTasks(projectId: string, params?: { page?: number; limit?: number; status?: string }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.status) queryParams.append('status', params.status)

    return this.request(`/projects/${projectId}/tasks?${queryParams.toString()}`)
  }

  async createTask(task: any): Promise<ApiResponse<any>> {
    return this.request('/projects/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    })
  }

  async updateTask(id: string, task: any): Promise<ApiResponse<any>> {
    return this.request(`/projects/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    })
  }

  async deleteTask(id: string): Promise<ApiResponse> {
    return this.request(`/projects/tasks/${id}`, {
      method: 'DELETE',
    })
  }

  // Legal/Contracts methods
  async getContracts(): Promise<ApiResponse<any[]>> {
    return this.request('/legal/contracts')
  }

  async getContract(id: string): Promise<ApiResponse<any>> {
    return this.request(`/legal/${id}`)
  }

  async createContract(data: any): Promise<ApiResponse<any>> {
    return this.request('/legal/contracts', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateContract(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/legal/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deleteContract(id: string): Promise<ApiResponse<any>> {
    return this.request(`/legal/${id}`, { method: 'DELETE' })
  }

  async getPolicies(params?: { page?: number; limit?: number; type?: string }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.type) queryParams.append('type', params.type)

    return this.request(`/legal/policies?${queryParams.toString()}`)
  }

  async getDocuments(params?: { page?: number; limit?: number; type?: string }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.type) queryParams.append('type', params.type)

    return this.request(`/legal/documents?${queryParams.toString()}`)
  }

  // Communication methods
  async getMessages(params?: { page?: number; limit?: number; type?: string }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.type) queryParams.append('type', params.type)

    return this.request(`/communication/messages?${queryParams.toString()}`)
  }

  async sendMessage(message: any): Promise<ApiResponse<any>> {
    return this.request('/communication/messages', {
      method: 'POST',
      body: JSON.stringify(message),
    })
  }

  async getAnnouncements(params?: { page?: number; limit?: number; type?: string }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.type) queryParams.append('type', params.type)

    return this.request(`/communication/announcements?${queryParams.toString()}`)
  }

  async createAnnouncement(announcement: any): Promise<ApiResponse<any>> {
    return this.request('/communication/announcements', {
      method: 'POST',
      body: JSON.stringify(announcement),
    })
  }

  async getMeetings(params?: { page?: number; limit?: number; status?: string }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.status) queryParams.append('status', params.status)

    return this.request(`/communication/meetings?${queryParams.toString()}`)
  }

  async createMeeting(meeting: any): Promise<ApiResponse<any>> {
    return this.request('/communication/meetings', {
      method: 'POST',
      body: JSON.stringify(meeting),
    })
  }

  async updateMessage(id: string, message: any): Promise<ApiResponse<any>> {
    return this.request(`/communication/messages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(message),
    })
  }

  async deleteMessage(id: string): Promise<ApiResponse> {
    return this.request(`/communication/messages/${id}`, {
      method: 'DELETE',
    })
  }

  async updateAnnouncement(id: string, announcement: any): Promise<ApiResponse<any>> {
    return this.request(`/communication/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(announcement),
    })
  }

  async deleteAnnouncement(id: string): Promise<ApiResponse> {
    return this.request(`/communication/announcements/${id}`, {
      method: 'DELETE',
    })
  }

  async updateMeeting(id: string, meeting: any): Promise<ApiResponse<any>> {
    return this.request(`/communication/meetings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(meeting),
    })
  }

  async deleteMeeting(id: string): Promise<ApiResponse> {
    return this.request(`/communication/meetings/${id}`, {
      method: 'DELETE',
    })
  }

  async markMessageAsRead(id: string): Promise<ApiResponse> {
    return this.request(`/communication/messages/${id}/read`, {
      method: 'PATCH',
    })
  }

  async markMessageAsUnread(id: string): Promise<ApiResponse> {
    return this.request(`/communication/messages/${id}/unread`, {
      method: 'PATCH',
    })
  }

  async starMessage(id: string): Promise<ApiResponse> {
    return this.request(`/communication/messages/${id}/star`, {
      method: 'PATCH',
    })
  }

  async unstarMessage(id: string): Promise<ApiResponse> {
    return this.request(`/communication/messages/${id}/unstar`, {
      method: 'PATCH',
    })
  }

  async archiveMessage(id: string): Promise<ApiResponse> {
    return this.request(`/communication/messages/${id}/archive`, {
      method: 'PATCH',
    })
  }

  async unarchiveMessage(id: string): Promise<ApiResponse> {
    return this.request(`/communication/messages/${id}/unarchive`, {
      method: 'PATCH',
    })
  }

  // User Profile methods
  async getUserProfile(): Promise<ApiResponse<any>> {
    return this.request('/auth/profile')
  }

  async updateUserProfile(profile: any): Promise<ApiResponse<any>> {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    })
  }

  async getUserPreferences(): Promise<ApiResponse<any>> {
    return this.request('/auth/preferences')
  }

  async updateUserPreferences(preferences: any): Promise<ApiResponse<any>> {
    return this.request('/auth/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    })
  }

  // Settings methods
  async getCompanySettings(): Promise<ApiResponse<any>> {
    return this.request('/settings/company')
  }

  async updateCompanySettings(settings: any): Promise<ApiResponse<any>> {
    return this.request('/settings/company', {
      method: 'PUT',
      body: JSON.stringify(settings),
    })
  }

  async getSecuritySettings(): Promise<ApiResponse<any>> {
    return this.request('/auth/permissions')
  }

  async updateSecuritySettings(settings: any): Promise<ApiResponse<any>> {
    return this.request('/settings/security', {
      method: 'PUT',
      body: JSON.stringify(settings),
    })
  }

  async getFeatureSettings(): Promise<ApiResponse<any>> {
    return this.request('/settings/features')
  }

  async updateFeatureSettings(settings: any): Promise<ApiResponse<any>> {
    return this.request('/settings/features', {
      method: 'PUT',
      body: JSON.stringify(settings),
    })
  }

  // Analytics methods
  async getAnalytics(params?: { period?: string; type?: string }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams()
    if (params?.period) queryParams.append('period', params.period)
    if (params?.type) queryParams.append('type', params.type)

    return this.request(`/analytics?${queryParams.toString()}`)
  }

  // System methods
  async getSystemHealth(): Promise<ApiResponse<any>> {
    const baseUrl = this.baseURL.replace('/api/v1', '')
    const url = `${baseUrl}/health`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    try {
      const response = await fetch(url, {
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`)
      }

      return data
    } catch (error: any) {
      console.error('API request failed:', error)
      throw error
    }
  }

  async getSystemAlerts(): Promise<ApiResponse<any[]>> {
    return this.request('/system/alerts')
  }

  async getSystemLogs(params?: { page?: number; limit?: number; level?: string }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.level) queryParams.append('level', params.level)

    return this.request(`/system/logs?${queryParams.toString()}`)
  }

  async getBackups(): Promise<ApiResponse<any[]>> {
    return this.request('/system/backups')
  }

  async createBackup(): Promise<ApiResponse<any>> {
    return this.request('/system/backups', {
      method: 'POST',
    })
  }

  async restoreBackup(id: string): Promise<ApiResponse> {
    return this.request(`/system/backups/${id}/restore`, {
      method: 'POST',
    })
  }

  async deleteBackup(id: string): Promise<ApiResponse> {
    return this.request(`/system/backups/${id}`, {
      method: 'DELETE',
    })
  }

  async backupSystem(): Promise<ApiResponse<any>> {
    return this.request('/system/backup', {
      method: 'POST',
    })
  }

  async restoreSystem(backupData: any): Promise<ApiResponse> {
    return this.request('/system/restore', {
      method: 'POST',
      body: JSON.stringify(backupData),
    })
  }

  // Payroll methods
  async getPayroll(params?: { page?: number; limit?: number; employeeId?: string; status?: string; month?: number; year?: number }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.employeeId) queryParams.append('employeeId', params.employeeId)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.month) queryParams.append('month', params.month.toString())
    if (params?.year) queryParams.append('year', params.year.toString())

    return this.request(`/hr/payroll?${queryParams.toString()}`)
  }

  async getPayrollSummary(params?: { month?: number; year?: number }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams()
    if (params?.month) queryParams.append('month', params.month.toString())
    if (params?.year) queryParams.append('year', params.year.toString())

    return this.request(`/hr/payroll/summary?${queryParams.toString()}`)
  }

  async createPayrollRecord(data: any): Promise<ApiResponse<any>> {
    return this.request('/hr/payroll', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updatePayrollRecord(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/hr/payroll/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deletePayrollRecord(id: string): Promise<ApiResponse> {
    return this.request(`/hr/payroll/${id}`, {
      method: 'DELETE',
    })
  }

  async processPayrollBatch(data: any): Promise<ApiResponse<any>> {
    return this.request('/hr/payroll/process', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Fleet methods
  async getFleetRoutes(params?: { page?: number; limit?: number; status?: string; vehicleId?: string; driverId?: string }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.status) queryParams.append('status', params.status)
    if (params?.vehicleId) queryParams.append('vehicleId', params.vehicleId)
    if (params?.driverId) queryParams.append('driverId', params.driverId)

    return this.request(`/fleet/routes?${queryParams.toString()}`)
  }

  async createFleetRoute(data: any): Promise<ApiResponse<any>> {
    return this.request('/fleet/routes', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateFleetRoute(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/fleet/routes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteFleetRoute(id: string): Promise<ApiResponse> {
    return this.request(`/fleet/routes/${id}`, {
      method: 'DELETE',
    })
  }

  async getFleetMaintenance(params?: { page?: number; limit?: number; vehicleId?: string; status?: string; type?: string }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.vehicleId) queryParams.append('vehicleId', params.vehicleId)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.type) queryParams.append('type', params.type)

    return this.request(`/fleet/maintenance?${queryParams.toString()}`)
  }

  async createFleetMaintenance(data: any): Promise<ApiResponse<any>> {
    return this.request('/fleet/maintenance', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateFleetMaintenance(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/fleet/maintenance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async getFleetDrivers(params?: { page?: number; limit?: number; status?: string; licenseType?: string }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.status) queryParams.append('status', params.status)
    if (params?.licenseType) queryParams.append('licenseType', params.licenseType)

    return this.request(`/fleet/drivers?${queryParams.toString()}`)
  }

  async createFleetDriver(data: any): Promise<ApiResponse<any>> {
    return this.request('/fleet/drivers', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateFleetDriver(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/fleet/drivers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Security methods
  async getSecuritySessions(params?: { page?: number; limit?: number; userId?: string; status?: string; deviceType?: string }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.userId) queryParams.append('userId', params.userId)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.deviceType) queryParams.append('deviceType', params.deviceType)

    return this.request(`/security/sessions?${queryParams.toString()}`)
  }

  async getSecuritySessionMetrics(): Promise<ApiResponse<any>> {
    return this.request('/security/sessions/metrics')
  }

  async revokeSecuritySession(id: string): Promise<ApiResponse> {
    return this.request(`/security/sessions/${id}`, {
      method: 'DELETE',
    })
  }

  async getComplianceRequirements(params?: { page?: number; limit?: number; status?: string; type?: string }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.status) queryParams.append('status', params.status)
    if (params?.type) queryParams.append('type', params.type)

    return this.request(`/security/compliance/requirements?${queryParams.toString()}`)
  }

  async getComplianceMetrics(): Promise<ApiResponse<any>> {
    return this.request('/security/compliance/metrics')
  }

  async createComplianceRequirement(data: any): Promise<ApiResponse<any>> {
    return this.request('/security/compliance/requirements', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateComplianceRequirement(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/security/compliance/requirements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async getBiometricDevices(params?: { page?: number; limit?: number; status?: string; type?: string }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.status) queryParams.append('status', params.status)
    if (params?.type) queryParams.append('type', params.type)

    return this.request(`/security/biometric/devices?${queryParams.toString()}`)
  }

  async getBiometricSessions(params?: { page?: number; limit?: number; userId?: string; deviceId?: string; status?: string }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.userId) queryParams.append('userId', params.userId)
    if (params?.deviceId) queryParams.append('deviceId', params.deviceId)
    if (params?.status) queryParams.append('status', params.status)

    return this.request(`/security/biometric/sessions?${queryParams.toString()}`)
  }

  async registerBiometricDevice(data: any): Promise<ApiResponse<any>> {
    return this.request('/security/biometric/devices', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateBiometricDevice(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/security/biometric/devices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // User profile methods
  async updateProfile(profile: any): Promise<ApiResponse<any>> {
    return this.request('/auth/update-profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    })
  }

  async changePassword(passwords: { currentPassword: string; newPassword: string }): Promise<ApiResponse> {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwords),
    })
  }

  async enable2FA(phone: string): Promise<ApiResponse> {
    return this.request('/auth/enable-2fa', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    })
  }

  async verify2FA(code: string): Promise<ApiResponse> {
    return this.request('/auth/verify-2fa', {
      method: 'POST',
      body: JSON.stringify({ code }),
    })
  }

  async getActiveSessions(): Promise<ApiResponse<any[]>> {
    return this.request('/auth/sessions')
  }

  async revokeSession(sessionId: string): Promise<ApiResponse<any>> {
    return this.request(`/auth/sessions/${sessionId}`, { method: 'DELETE' })
  }

  async setRecoveryOptions(recoveryEmail: string): Promise<ApiResponse> {
    return this.request('/auth/set-recovery-options', {
      method: 'POST',
      body: JSON.stringify({ recoveryEmail }),
    })
  }

  // Upload methods
  async uploadFile(file: File, type: string = 'general'): Promise<ApiResponse<any>> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    return this.request('/upload', {
      method: 'POST',
      body: formData,
      headers: {} // Let browser set content-type for FormData
    })
  }

  // Generic CRUD methods
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString())
        }
      })
    }

    const url = queryParams.toString() ? `${endpoint}?${queryParams.toString()}` : endpoint
    return this.request<T>(url)
  }

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async patch<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    })
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.token
  }

  getToken(): string | null {
    return this.token
  }

  // Check authentication status and redirect if needed
  checkAuthStatus(): boolean {
    this.loadTokens()
    
    if (!this.token) {
      console.warn('🚨 NO_AUTH_TOKEN: Redirecting to login')
      if (typeof window !== 'undefined') {
        // Clear any stale auth state
        localStorage.removeItem('auth-token')
        localStorage.removeItem('refresh-token')
        // Redirect to login
        window.location.href = '/login'
      }
      return false
    }
    
    return true
  }
}

export const apiClient = new ApiClient()