'use client'

import { apiClient } from './consolidated-api'
import { useAuthStore } from '@/store'
import { handleError } from '@/utils/error-handling'

// Enhanced authentication manager with proper queue system
class AuthManager {
  private static instance: AuthManager
  private refreshQueue: Array<{
    resolve: (token: string) => void
    reject: (error: any) => void
    timestamp: number
  }> = []
  private isRefreshing = false
  private refreshPromise: Promise<string> | null = null
  private lastRefreshTime = 0
  private readonly REFRESH_COOLDOWN = 5000 // 5 seconds cooldown between refreshes
  private readonly MAX_QUEUE_SIZE = 10
  private readonly QUEUE_TIMEOUT = 30000 // 30 seconds

  private constructor() {
    this.cleanupExpiredQueueItems()
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager()
    }
    return AuthManager.instance
  }

  // Clean up expired queue items
  private cleanupExpiredQueueItems() {
    const now = Date.now()
    this.refreshQueue = this.refreshQueue.filter(
      item => now - item.timestamp < this.QUEUE_TIMEOUT
    )
  }

  // Enhanced token refresh with proper queue management
  async refreshToken(): Promise<string> {
    // Check if we're already refreshing
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise
    }

    // Check cooldown period
    const now = Date.now()
    if (now - this.lastRefreshTime < this.REFRESH_COOLDOWN) {
      throw new Error('Token refresh is in cooldown period')
    }

    // Clean up expired queue items
    this.cleanupExpiredQueueItems()

    // Check queue size limit
    if (this.refreshQueue.length >= this.MAX_QUEUE_SIZE) {
      throw new Error('Token refresh queue is full')
    }

    this.isRefreshing = true
    this.lastRefreshTime = now

    this.refreshPromise = new Promise<string>(async (resolve, reject) => {
      try {
        // Starting token refresh
        
        const response = await apiClient.refreshAuthToken()
        
        if (response.success && response.data) {
          const { token, refreshToken, user } = response.data
          
          // Update tokens in API client
          apiClient.setTokens(token, refreshToken)
          
          // Update user data in store
          const { setUser } = useAuthStore.getState()
          if (user) {
            setUser(user)
          }
          
          // Token refresh successful
          resolve(token)
        } else {
          console.error('❌ Token refresh failed:', response.message)
          this.clearAuth()
          reject(new Error(response.message || 'Token refresh failed'))
        }
      } catch (error) {
        console.error('❌ Token refresh error:', error)
        this.clearAuth()
        reject(error)
      } finally {
        this.isRefreshing = false
        this.refreshPromise = null
        this.processQueue(resolve, reject)
      }
    })

    return this.refreshPromise
  }

  // Process queued requests
  private processQueue(resolve: (token: string) => void, reject: (error: any) => void) {
    const queue = [...this.refreshQueue]
    this.refreshQueue = []

    queue.forEach(item => {
      if (this.isRefreshing) {
        // If still refreshing, add back to queue
        this.refreshQueue.push(item)
      } else {
        // Process the queued request
        try {
          const token = apiClient.getToken()
          if (token) {
            item.resolve(token)
          } else {
            item.reject(new Error('No token available'))
          }
        } catch (error) {
          item.reject(error)
        }
      }
    })
  }

  // Queue a token refresh request
  async queueTokenRefresh(): Promise<string> {
    return new Promise((resolve, reject) => {
      const queueItem = {
        resolve,
        reject,
        timestamp: Date.now()
      }

      this.refreshQueue.push(queueItem)

      // If not currently refreshing, start refresh
      if (!this.isRefreshing) {
        this.refreshToken().catch(reject)
      }
    })
  }

  // Clear authentication state
  private clearAuth() {
    apiClient.clearTokens()
    const { clearUser } = useAuthStore.getState()
    clearUser()
  }

  // Check if token is expired or about to expire
  isTokenExpired(token?: string): boolean {
    if (!token) return true
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const now = Math.floor(Date.now() / 1000)
      const buffer = 300 // 5 minutes buffer
      
      return payload.exp < (now + buffer)
    } catch {
      return true
    }
  }

  // Get token expiration time
  getTokenExpiration(token?: string): Date | null {
    if (!token) return null
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return new Date(payload.exp * 1000)
    } catch {
      return null
    }
  }

  // Validate current session
  async validateSession(): Promise<boolean> {
    try {
      const token = apiClient.getToken()
      if (!token || this.isTokenExpired(token)) {
        return false
      }

      const response = await apiClient.getCurrentUser()
      return response.success
    } catch (error) {
      console.error('Session validation failed:', error)
      return false
    }
  }

  // Handle authentication errors
  handleAuthError(error: any): void {
    console.error('Authentication error:', error)
    
    // Clear authentication state
    this.clearAuth()
    
    // Show error message
    handleError(error, 'Authentication')
    
    // Redirect to login if not already there
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      window.location.href = '/login'
    }
  }
}

export const authManager = AuthManager.getInstance()
