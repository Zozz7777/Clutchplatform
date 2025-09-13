/**
 * Real Authentication Service for Clutch Admin
 * Replaces mock authentication with proper JWT-based auth
 */

export interface User {
  id: string
  email: string
  name: string
  role: string
  permissions: string[]
  avatar?: string
  lastLogin?: Date
  isActive: boolean
}

export interface AuthResponse {
  success: boolean
  data?: {
    user: User
    token: string
    refreshToken: string
    expiresIn: number
  }
  message?: string
  error?: string
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

class AuthService {
  private baseURL: string
  private tokenKey = 'clutch_admin_token'
  private refreshTokenKey = 'clutch_admin_refresh_token'
  private userKey = 'clutch_admin_user'

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (data.success && data.data) {
        // Store tokens and user data
        this.setTokens(data.data.token, data.data.refreshToken)
        this.setUser(data.data.user)
        
        return {
          success: true,
          data: {
            user: data.data.user,
            token: data.data.token,
            refreshToken: data.data.refreshToken,
            expiresIn: data.data.expiresIn || 3600
          }
        }
      }

      return {
        success: false,
        message: data.message || 'Login failed',
        error: data.error
      }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        message: 'Network error. Please check your connection.',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<AuthResponse> {
    try {
      const token = this.getToken()
      if (token) {
        await fetch(`${this.baseURL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear local storage regardless of API call success
      this.clearTokens()
      this.clearUser()
    }

    return { success: true, message: 'Logged out successfully' }
  }

  /**
   * Get current user from token
   */
  async getCurrentUser(): Promise<AuthResponse> {
    try {
      const token = this.getToken()
      if (!token) {
        return {
          success: false,
          message: 'No authentication token found'
        }
      }

      const response = await fetch(`${this.baseURL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.success && data.data) {
        this.setUser(data.data.user)
        return {
          success: true,
          data: {
            user: data.data.user,
            token: token,
            refreshToken: this.getRefreshToken() || '',
            expiresIn: 3600
          }
        }
      }

      // If token is invalid, try to refresh
      if (response.status === 401) {
        const refreshResult = await this.refreshToken()
        if (refreshResult.success) {
          return this.getCurrentUser() // Retry with new token
        }
      }

      return {
        success: false,
        message: data.message || 'Failed to get current user'
      }
    } catch (error) {
      console.error('Get current user error:', error)
      return {
        success: false,
        message: 'Network error. Please check your connection.',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<AuthResponse> {
    try {
      const refreshToken = this.getRefreshToken()
      if (!refreshToken) {
        return {
          success: false,
          message: 'No refresh token found'
        }
      }

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      })

      const data = await response.json()

      if (data.success && data.data) {
        this.setTokens(data.data.token, data.data.refreshToken)
        return {
          success: true,
          data: {
            user: data.data.user,
            token: data.data.token,
            refreshToken: data.data.refreshToken,
            expiresIn: data.data.expiresIn || 3600
          }
        }
      }

      // If refresh fails, clear tokens
      this.clearTokens()
      this.clearUser()

      return {
        success: false,
        message: data.message || 'Token refresh failed'
      }
    } catch (error) {
      console.error('Token refresh error:', error)
      this.clearTokens()
      this.clearUser()
      return {
        success: false,
        message: 'Network error during token refresh',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken()
    if (!token) return false

    try {
      // Check if token is expired
      const payload = JSON.parse(atob(token.split('.')[1]))
      const now = Date.now() / 1000
      return payload.exp > now
    } catch {
      return false
    }
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(this.tokenKey)
  }

  /**
   * Get stored refresh token
   */
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(this.refreshTokenKey)
  }

  /**
   * Get stored user data
   */
  getUser(): User | null {
    if (typeof window === 'undefined') return null
    const userStr = localStorage.getItem(this.userKey)
    return userStr ? JSON.parse(userStr) : null
  }

  /**
   * Store tokens
   */
  private setTokens(token: string, refreshToken: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.tokenKey, token)
    localStorage.setItem(this.refreshTokenKey, refreshToken)
  }

  /**
   * Store user data
   */
  private setUser(user: User): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.userKey, JSON.stringify(user))
  }

  /**
   * Clear tokens
   */
  private clearTokens(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(this.tokenKey)
    localStorage.removeItem(this.refreshTokenKey)
  }

  /**
   * Clear user data
   */
  private clearUser(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(this.userKey)
  }

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<AuthResponse> {
    try {
      const token = this.getToken()
      if (!token) {
        return {
          success: false,
          message: 'No authentication token found'
        }
      }

      const response = await fetch(`${this.baseURL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        }),
      })

      const data = await response.json()

      return {
        success: data.success,
        message: data.message || (data.success ? 'Password changed successfully' : 'Failed to change password'),
        error: data.error
      }
    } catch (error) {
      console.error('Change password error:', error)
      return {
        success: false,
        message: 'Network error. Please check your connection.',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Reset password (forgot password)
   */
  async resetPassword(email: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      return {
        success: data.success,
        message: data.message || (data.success ? 'Password reset email sent' : 'Failed to send reset email'),
        error: data.error
      }
    } catch (error) {
      console.error('Reset password error:', error)
      return {
        success: false,
        message: 'Network error. Please check your connection.',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

// Export singleton instance
export const authService = new AuthService()
export default authService
