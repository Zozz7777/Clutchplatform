/**
 * Real API Service for Clutch Admin
 * Replaces mock API client with proper backend integration
 */

import { authService } from './auth-service'
import { config, getApiUrl } from './config'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface ApiError {
  message: string
  status: number
  code?: string
}

class ApiService {
  private baseURL: string
  private defaultHeaders: Record<string, string>

  constructor() {
    this.baseURL = config.api.baseUrl
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'X-App-Name': config.app.name,
      'X-App-Version': config.app.version,
    }
  }

  /**
   * Get authorization headers
   */
  private getAuthHeaders(): Record<string, string> {
    const token = authService.getToken()
    return token ? { 'Authorization': `Bearer ${token}` } : {}
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const data = await response.json()

    if (!response.ok) {
      // Handle 401 Unauthorized
      if (response.status === 401) {
        const refreshResult = await authService.refreshToken()
        if (!refreshResult.success) {
          // Redirect to login if refresh fails
          window.location.href = '/login'
          return {
            success: false,
            message: 'Session expired. Please login again.',
            error: 'UNAUTHORIZED'
          }
        }
      }

      return {
        success: false,
        message: data.message || `HTTP ${response.status}: ${response.statusText}`,
        error: data.error || 'API_ERROR'
      }
    }

    return {
      success: true,
      data: data.data || data,
      message: data.message,
      pagination: data.pagination
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    try {
      const url = new URL(`${this.baseURL}${endpoint}`)
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, String(value))
          }
        })
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          ...this.defaultHeaders,
          ...this.getAuthHeaders(),
        },
      })

      return this.handleResponse<T>(response)
    } catch (error) {
      console.error('GET request error:', error)
      return {
        success: false,
        message: 'Network error. Please check your connection.',
        error: error instanceof Error ? error.message : 'NETWORK_ERROR'
      }
    }
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          ...this.defaultHeaders,
          ...this.getAuthHeaders(),
        },
        body: data ? JSON.stringify(data) : undefined,
      })

      return this.handleResponse<T>(response)
    } catch (error) {
      console.error('POST request error:', error)
      return {
        success: false,
        message: 'Network error. Please check your connection.',
        error: error instanceof Error ? error.message : 'NETWORK_ERROR'
      }
    }
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: {
          ...this.defaultHeaders,
          ...this.getAuthHeaders(),
        },
        body: data ? JSON.stringify(data) : undefined,
      })

      return this.handleResponse<T>(response)
    } catch (error) {
      console.error('PUT request error:', error)
      return {
        success: false,
        message: 'Network error. Please check your connection.',
        error: error instanceof Error ? error.message : 'NETWORK_ERROR'
      }
    }
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PATCH',
        headers: {
          ...this.defaultHeaders,
          ...this.getAuthHeaders(),
        },
        body: data ? JSON.stringify(data) : undefined,
      })

      return this.handleResponse<T>(response)
    } catch (error) {
      console.error('PATCH request error:', error)
      return {
        success: false,
        message: 'Network error. Please check your connection.',
        error: error instanceof Error ? error.message : 'NETWORK_ERROR'
      }
    }
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          ...this.defaultHeaders,
          ...this.getAuthHeaders(),
        },
      })

      return this.handleResponse<T>(response)
    } catch (error) {
      console.error('DELETE request error:', error)
      return {
        success: false,
        message: 'Network error. Please check your connection.',
        error: error instanceof Error ? error.message : 'NETWORK_ERROR'
      }
    }
  }

  /**
   * Upload file
   */
  async uploadFile<T>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, String(value))
        })
      }

      const token = authService.getToken()
      const headers: Record<string, string> = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      })

      return this.handleResponse<T>(response)
    } catch (error) {
      console.error('File upload error:', error)
      return {
        success: false,
        message: 'File upload failed. Please check your connection.',
        error: error instanceof Error ? error.message : 'UPLOAD_ERROR'
      }
    }
  }

  /**
   * Download file
   */
  async downloadFile(endpoint: string, filename?: string): Promise<boolean> {
    try {
      const token = authService.getToken()
      const headers: Record<string, string> = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename || 'download'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      return true
    } catch (error) {
      console.error('File download error:', error)
      return false
    }
  }
}

// Export singleton instance
export const apiService = new ApiService()
export default apiService

// Specific API methods for common operations
export const dashboardApi = {
  /**
   * Get dashboard metrics
   */
  getMetrics: () => apiService.get('/admin/dashboard/metrics'),
  
  /**
   * Get system health
   */
  getSystemHealth: () => apiService.get('/admin/system/health'),
  
  /**
   * Get recent activity
   */
  getRecentActivity: (limit = 10) => apiService.get('/admin/activity/recent', { limit }),
  
  /**
   * Get alerts
   */
  getAlerts: (status?: string) => apiService.get('/admin/alerts', { status }),
}

export const usersApi = {
  /**
   * Get users list
   */
  getUsers: (params?: { page?: number; limit?: number; search?: string; role?: string }) => 
    apiService.get('/admin/users', params),
  
  /**
   * Get user by ID
   */
  getUser: (id: string) => apiService.get(`/admin/users/${id}`),
  
  /**
   * Create user
   */
  createUser: (userData: any) => apiService.post('/admin/users', userData),
  
  /**
   * Update user
   */
  updateUser: (id: string, userData: any) => apiService.put(`/admin/users/${id}`, userData),
  
  /**
   * Delete user
   */
  deleteUser: (id: string) => apiService.delete(`/admin/users/${id}`),
  
  /**
   * Export users
   */
  exportUsers: (format: 'csv' | 'excel' | 'pdf') => 
    apiService.downloadFile(`/admin/users/export?format=${format}`, `users.${format}`),
}

export const settingsApi = {
  /**
   * Get system settings
   */
  getSettings: () => apiService.get('/admin/settings'),
  
  /**
   * Update system settings
   */
  updateSettings: (settings: any) => apiService.put('/admin/settings', settings),
  
  /**
   * Get company settings
   */
  getCompanySettings: () => apiService.get('/admin/settings/company'),
  
  /**
   * Update company settings
   */
  updateCompanySettings: (settings: any) => apiService.put('/admin/settings/company', settings),
  
  /**
   * Get security settings
   */
  getSecuritySettings: () => apiService.get('/admin/settings/security'),
  
  /**
   * Update security settings
   */
  updateSecuritySettings: (settings: any) => apiService.put('/admin/settings/security', settings),
}

export const analyticsApi = {
  /**
   * Get analytics data
   */
  getAnalytics: (params?: { period?: string; metric?: string }) => 
    apiService.get('/admin/analytics', params),
  
  /**
   * Get revenue analytics
   */
  getRevenueAnalytics: (period = '30d') => 
    apiService.get('/admin/analytics/revenue', { period }),
  
  /**
   * Get user analytics
   */
  getUserAnalytics: (period = '30d') => 
    apiService.get('/admin/analytics/users', { period }),
  
  /**
   * Export analytics
   */
  exportAnalytics: (format: 'csv' | 'excel' | 'pdf', params?: any) => 
    apiService.downloadFile(`/admin/analytics/export?format=${format}`, `analytics.${format}`),
}
