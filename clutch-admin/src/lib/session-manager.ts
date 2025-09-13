'use client'

import { authManager } from './auth-manager'
import { useAuthStore } from '@/store'
import { handleError } from '@/utils/error-handling'
import { showToast } from '@/components/ui/toast'

interface SessionConfig {
  sessionTimeout: number // in milliseconds
  warningTime: number // in milliseconds before timeout
  refreshInterval: number // in milliseconds
  maxInactivityTime: number // in milliseconds
}

class SessionManager {
  private static instance: SessionManager
  private config: SessionConfig
  private sessionTimeout: NodeJS.Timeout | null = null
  private warningTimeout: NodeJS.Timeout | null = null
  private refreshInterval: NodeJS.Timeout | null = null
  private lastActivity: number = Date.now()
  private isMonitoring = false
  private warningShown = false

  private constructor() {
    this.config = {
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
      warningTime: 5 * 60 * 1000, // 5 minutes before timeout
      refreshInterval: 5 * 60 * 1000, // 5 minutes
      maxInactivityTime: 15 * 60 * 1000 // 15 minutes
    }

    this.setupActivityTracking()
  }

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager()
    }
    return SessionManager.instance
  }

  // Setup activity tracking
  private setupActivityTracking() {
    if (typeof window === 'undefined') return

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    events.forEach(event => {
      document.addEventListener(event, this.updateActivity.bind(this), true)
    })

    // Track visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this))
  }

  // Update last activity time
  private updateActivity() {
    this.lastActivity = Date.now()
    this.warningShown = false
    
    // Reset warning timeout
    if (this.warningTimeout) {
      clearTimeout(this.warningTimeout)
      this.warningTimeout = null
    }
  }

  // Handle visibility change
  private handleVisibilityChange() {
    if (document.hidden) {
      this.pauseMonitoring()
    } else {
      this.resumeMonitoring()
    }
  }

  // Start session monitoring
  startMonitoring() {
    if (this.isMonitoring) return

    this.isMonitoring = true
    this.lastActivity = Date.now()
    this.warningShown = false

    // Starting session monitoring

    // Start refresh interval
    this.startRefreshInterval()

    // Start session timeout
    this.startSessionTimeout()

    // Start inactivity monitoring
    this.startInactivityMonitoring()
  }

  // Stop session monitoring
  stopMonitoring() {
    if (!this.isMonitoring) return

    this.isMonitoring = false

    // Stopping session monitoring

    // Clear all timeouts
    this.clearTimeouts()
  }

  // Pause monitoring
  private pauseMonitoring() {
    if (!this.isMonitoring) return

    // Pausing session monitoring
    this.clearTimeouts()
  }

  // Resume monitoring
  private resumeMonitoring() {
    if (!this.isMonitoring) return

    // Resuming session monitoring
    this.startMonitoring()
  }

  // Start refresh interval
  private startRefreshInterval() {
    this.refreshInterval = setInterval(async () => {
      try {
        await this.refreshSession()
      } catch (error) {
        console.error('Session refresh failed:', error)
        this.handleSessionTimeout()
      }
    }, this.config.refreshInterval)
  }

  // Start session timeout
  private startSessionTimeout() {
    this.sessionTimeout = setTimeout(() => {
      this.handleSessionTimeout()
    }, this.config.sessionTimeout)
  }

  // Start inactivity monitoring
  private startInactivityMonitoring() {
    const checkInactivity = () => {
      if (!this.isMonitoring) return

      const now = Date.now()
      const timeSinceActivity = now - this.lastActivity

      if (timeSinceActivity > this.config.maxInactivityTime) {
        // User inactive for too long, showing warning
        this.showInactivityWarning()
      } else {
        // Check again in 1 minute
        setTimeout(checkInactivity, 60000)
      }
    }

    // Start checking after 1 minute
    setTimeout(checkInactivity, 60000)
  }

  // Show inactivity warning
  private showInactivityWarning() {
    if (this.warningShown) return

    this.warningShown = true

    // Show warning toast
    // const { showToast } = require('@/components/ui/toast') // Removed require() import
    showToast.warning(
      'Session Timeout Warning',
      'You will be logged out due to inactivity. Click anywhere to continue your session.'
    )

    // Set warning timeout
    this.warningTimeout = setTimeout(() => {
      this.handleSessionTimeout()
    }, this.config.warningTime)
  }

  // Refresh session
  private async refreshSession() {
    try {
      const isValid = await authManager.validateSession()
      if (!isValid) {
        throw new Error('Session validation failed')
      }

      // Session refreshed successfully
    } catch (error) {
      console.error('❌ Session refresh failed:', error)
      throw error
    }
  }

  // Handle session timeout
  private handleSessionTimeout() {
    // Session timeout - logging out user
    
    this.stopMonitoring()
    
    // Clear user data
    const { setUser } = useAuthStore.getState()
    setUser(null as any) // Clear user by setting to null
    
    // Show timeout message
    // const { showToast } = require('@/components/ui/toast') // Removed require() import
    showToast.error(
      'Session Expired',
      'Your session has expired due to inactivity. Please log in again.'
    )
    
    // Redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }

  // Clear all timeouts
  private clearTimeouts() {
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout)
      this.sessionTimeout = null
    }
    
    if (this.warningTimeout) {
      clearTimeout(this.warningTimeout)
      this.warningTimeout = null
    }
    
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
      this.refreshInterval = null
    }
  }

  // Extend session
  extendSession() {
    if (!this.isMonitoring) return

    // Extending session
    
    this.updateActivity()
    
    // Restart session timeout
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout)
    }
    this.startSessionTimeout()
  }

  // Get session info
  getSessionInfo() {
    const now = Date.now()
    const timeSinceActivity = now - this.lastActivity
    const timeUntilTimeout = this.config.sessionTimeout - timeSinceActivity

    return {
      isMonitoring: this.isMonitoring,
      lastActivity: new Date(this.lastActivity),
      timeSinceActivity,
      timeUntilTimeout: Math.max(0, timeUntilTimeout),
      warningShown: this.warningShown
    }
  }

  // Update configuration
  updateConfig(newConfig: Partial<SessionConfig>) {
    this.config = { ...this.config, ...newConfig }
    
    if (this.isMonitoring) {
      this.stopMonitoring()
      this.startMonitoring()
    }
  }

  // Cleanup
  destroy() {
    this.stopMonitoring()
    
    if (typeof window !== 'undefined') {
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
      events.forEach(event => {
        document.removeEventListener(event, this.updateActivity.bind(this), true)
      })
      
      document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this))
    }
  }
}

export const sessionManager = SessionManager.getInstance()
