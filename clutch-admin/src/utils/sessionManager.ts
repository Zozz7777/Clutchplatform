import { apiClient } from '@/lib/api'
import { useAuthStore } from '@/store'
import { debugSession } from './debugSession'

export class SessionManager {
  private static instance: SessionManager
  private refreshInterval: NodeJS.Timeout | null = null
  private sessionTimeout: NodeJS.Timeout | null = null
  private readonly REFRESH_INTERVAL = 14 * 60 * 1000 // 14 minutes (before 15-minute token expiry)
  private readonly SESSION_TIMEOUT = 7 * 24 * 60 * 60 * 1000 // 7 days (refresh token expiry)

  private constructor() {
    this.initializeSession()
  }

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager()
    }
    return SessionManager.instance
  }

  private initializeSession() {
    // Don't start session monitoring automatically
    if (typeof window !== 'undefined') {
      // Handle page visibility changes
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && this.shouldMonitorSession()) {
          this.checkSessionValidity()
        }
      })

      // Handle window focus events
      window.addEventListener('focus', () => {
        if (this.shouldMonitorSession()) {
          this.checkSessionValidity()
        }
      })
    }
  }

  private shouldMonitorSession(): boolean {
    if (typeof window === 'undefined') return false
    
    // Don't monitor session on login page
    const isLoginPage = window.location.pathname.includes('/login')
    if (isLoginPage) return false
    
    // Only monitor if user is authenticated
    const authStore = useAuthStore.getState()
    return authStore.isAuthenticated
  }

  private startSessionMonitoring() {
    // Only start monitoring if it should be monitored
    if (!this.shouldMonitorSession()) {
      debugSession.log('Session monitoring skipped (not authenticated or on login page)')
      return
    }

    // Clear any existing intervals
    this.stopSessionMonitoring()

    // Start refresh interval
    this.refreshInterval = setInterval(() => {
      if (this.shouldMonitorSession()) {
        this.refreshSession()
      } else {
        this.stopSessionMonitoring()
      }
    }, this.REFRESH_INTERVAL)

    // Set session timeout
    this.sessionTimeout = setTimeout(() => {
      this.handleSessionTimeout()
    }, this.SESSION_TIMEOUT)

    debugSession.log('Session monitoring started')
  }

  private stopSessionMonitoring() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
      this.refreshInterval = null
    }
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout)
      this.sessionTimeout = null
    }
  }

  private async refreshSession() {
    // Don't refresh if we shouldn't monitor session
    if (!this.shouldMonitorSession()) {
      debugSession.log('Session refresh skipped (not authenticated or on login page)')
      return
    }

    try {
      debugSession.log('Attempting to refresh session...')
      const response = await apiClient.refreshAuthToken()
      if (response.success && response.data) {
        // Update tokens in API client
        apiClient.setTokens(response.data.token, response.data.refreshToken)
        
        // Update user data in store
        const { setUser } = useAuthStore.getState()
        if (response.data.user) {
          setUser(response.data.user)
          debugSession.logUser(response.data.user)
        }
        
        debugSession.log('Session refreshed successfully')
        console.log('Session refreshed successfully')
      } else {
        debugSession.logError('Session refresh failed', response.message)
        console.warn('Session refresh failed:', response.message)
        this.handleSessionTimeout()
      }
    } catch (error) {
      debugSession.logError('Session refresh error', error)
      console.error('Session refresh error:', error)
      this.handleSessionTimeout()
    }
  }

  private async checkSessionValidity() {
    // Don't check session validity if we shouldn't monitor
    if (!this.shouldMonitorSession()) {
      debugSession.log('Session validity check skipped (not authenticated or on login page)')
      return
    }

    try {
      debugSession.log('Checking session validity...')
      
      // Ensure tokens are loaded before making request
      apiClient.reloadTokens()
      
      const response = await apiClient.getCurrentUser()
      if (!response.success) {
        debugSession.logError('Session validation failed, attempting refresh...')
        console.warn('Session validation failed, attempting refresh...')
        await this.refreshSession()
      } else {
        debugSession.log('Session validation successful')
      }
    } catch (error) {
      debugSession.logError('Session validation error', error)
      console.error('Session validation error:', error)
      this.handleSessionTimeout()
    }
  }

  private handleSessionTimeout() {
    console.log('Session timeout, logging out user')
    this.stopSessionMonitoring()
    
    const { logout } = useAuthStore.getState()
    logout()
    
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }

  public login() {
    // Start session monitoring after successful login
    this.startSessionMonitoring()
  }

  public logout() {
    // Stop session monitoring on logout
    this.stopSessionMonitoring()
  }

  public extendSession() {
    // Reset session timeout when user is active
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout)
    }
    
    this.sessionTimeout = setTimeout(() => {
      this.handleSessionTimeout()
    }, this.SESSION_TIMEOUT)
  }
}

// Export singleton instance
export const sessionManager = SessionManager.getInstance()

// Activity tracker to extend session on user activity
export const setupActivityTracking = () => {
  if (typeof window === 'undefined') return

  const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
  
  const handleActivity = () => {
    sessionManager.extendSession()
  }

  activityEvents.forEach(event => {
    document.addEventListener(event, handleActivity, { passive: true })
  })

  // Cleanup function
  return () => {
    activityEvents.forEach(event => {
      document.removeEventListener(event, handleActivity)
    })
  }
}
