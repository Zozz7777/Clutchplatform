import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'manager' | 'employee' | 'viewer' | 'hr_manager' | 'fleet_manager' | 'enterprise_manager' | 'sales_manager' | 'analytics' | 'management' | 'cto' | 'operations' | 'sales_rep' | 'analyst' | 'super_admin' | 'finance_manager' | 'marketing_manager' | 'legal_manager' | 'partner_manager' | 'hr' | 'fleet_admin' | 'driver' | 'accountant'
  roles?: string[] // Array of all roles the user has
  permissions: string[]
  profilePicture?: string
  phone?: string
  address?: string
  bio?: string
  company?: string
  position?: string
  isActive: boolean
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface Permission {
  resource: string
  action: string
}

export const useAuth = () => {
  const router = useRouter()
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  })

  const [sessionTimeout, setSessionTimeout] = useState<number | null>(null)

  // Check if user has specific permission
  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!authState.user) return false
    
    const { resource, action } = permission
    const requiredPermission = `${resource}:${action}`
    
    return authState.user.permissions.includes(requiredPermission) ||
           authState.user.permissions.includes(`${resource}:*`) ||
           authState.user.role === 'admin'
  }, [authState.user])

  // Check if user has any of the given permissions
  const hasAnyPermission = useCallback((permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission))
  }, [hasPermission])

  // Check if user has all of the given permissions
  const hasAllPermissions = useCallback((permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission))
  }, [hasPermission])

  // Check if user has specific role
  const hasRole = useCallback((role: User['role']): boolean => {
    if (!authState.user) return false
    return authState.user.role === role
  }, [authState.user])

  // Check if user has any of the given roles
  const hasAnyRole = useCallback((roles: string[]): boolean => {
    if (!authState.user) return false
    
    // Check primary role
    if (roles.includes(authState.user.role)) {
      return true
    }
    
    // Check roles array if it exists
    if (authState.user.roles && authState.user.roles.length > 0) {
      return authState.user.roles.some(userRole => roles.includes(userRole))
    }
    
    return false
  }, [authState.user])

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await apiClient.login({ email, password })
      
      if (response.success && response.data) {
        const { user, token } = response.data
        
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        })

        // Set session timeout (8 hours)
        const timeout = Date.now() + (8 * 60 * 60 * 1000)
        setSessionTimeout(timeout)
        localStorage.setItem('session-timeout', timeout.toString())

        toast.success(`Welcome back, ${user.firstName}!`)
        return { success: true, user }
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: response.message || 'Login failed'
        }))
        toast.error(response.message || 'Login failed')
        return { success: false, error: response.message }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }))
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  // Logout function
  const logout = useCallback(async () => {
    try {
      await apiClient.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      })
      setSessionTimeout(null)
      localStorage.removeItem('session-timeout')
      localStorage.removeItem('auth-token')
      localStorage.removeItem('refresh-token')
      
      toast.success('Logged out successfully')
      router.push('/login')
    }
  }, [router])

  // Refresh user data
  const refreshUser = useCallback(async () => {
    if (!apiClient.isAuthenticated()) {
      setAuthState(prev => ({ ...prev, isLoading: false }))
      return
    }

    try {
      // First try to refresh the token
      try {
        const refreshResponse = await apiClient.refreshAuthToken()
        if (refreshResponse.success && refreshResponse.data) {
          // Update tokens
          apiClient.setTokens(refreshResponse.data.token)
          // Update user data
          setAuthState({
            user: refreshResponse.data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
          return
        }
      } catch (refreshError) {
        console.log('Token refresh failed, trying to get current user...')
      }

      // Fallback to getting current user
      const response = await apiClient.getCurrentUser()
      
      if (response.success && response.data) {
        setAuthState({
          user: response.data,
          isAuthenticated: true,
          isLoading: false,
          error: null
        })
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: response.message || 'Failed to refresh user'
        })
        await logout()
      }
    } catch (error) {
      console.error('Failed to refresh user:', error)
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Failed to refresh user'
      })
      await logout()
    }
  }, [logout])

  // Update user profile
  const updateProfile = useCallback(async (profileData: Partial<User>) => {
    try {
      const response = await apiClient.updateProfile(profileData)
      
      if (response.success && response.data) {
        setAuthState(prev => ({
          ...prev,
          user: { ...prev.user!, ...response.data }
        }))
        toast.success('Profile updated successfully')
        return { success: true }
      } else {
        toast.error(response.message || 'Failed to update profile')
        return { success: false, error: response.message }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  // Change password
  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    try {
      const response = await apiClient.changePassword({ currentPassword, newPassword })
      
      if (response.success) {
        toast.success('Password changed successfully')
        return { success: true }
      } else {
        toast.error(response.message || 'Failed to change password')
        return { success: false, error: response.message }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to change password'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  // Enable 2FA
  const enable2FA = useCallback(async (phone: string) => {
    try {
      const response = await apiClient.enable2FA(phone)
      
      if (response.success) {
        toast.success('2FA setup initiated. Please check your phone for the verification code.')
        return { success: true }
      } else {
        toast.error(response.message || 'Failed to enable 2FA')
        return { success: false, error: response.message }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to enable 2FA'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  // Verify 2FA
  const verify2FA = useCallback(async (code: string) => {
    try {
      const response = await apiClient.verify2FA(code)
      
      if (response.success) {
        toast.success('2FA enabled successfully')
        return { success: true }
      } else {
        toast.error(response.message || 'Invalid verification code')
        return { success: false, error: response.message }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to verify 2FA'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  // Check session timeout
  const checkSessionTimeout = useCallback(() => {
    const storedTimeout = localStorage.getItem('session-timeout')
    if (storedTimeout) {
      const timeout = parseInt(storedTimeout)
      if (Date.now() > timeout) {
        toast.error('Session expired. Please login again.')
        logout()
      } else {
        setSessionTimeout(timeout)
      }
    }
  }, [logout])

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      checkSessionTimeout()
      
      if (apiClient.isAuthenticated()) {
        await refreshUser()
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }))
      }
    }

    initializeAuth()
  }, [refreshUser, checkSessionTimeout])

  // Set up session timeout check
  useEffect(() => {
    const interval = setInterval(() => {
      if (sessionTimeout && Date.now() > sessionTimeout) {
        toast.error('Session expired. Please login again.')
        logout()
      }
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [sessionTimeout, logout])

  // Set up activity monitoring for session extension
  useEffect(() => {
    if (!authState.isAuthenticated) return

    let activityTimeout: NodeJS.Timeout

    const resetActivityTimeout = () => {
      clearTimeout(activityTimeout)
      activityTimeout = setTimeout(() => {
        // Extend session on activity
        const newTimeout = Date.now() + (8 * 60 * 60 * 1000)
        setSessionTimeout(newTimeout)
        localStorage.setItem('session-timeout', newTimeout.toString())
      }, 300000) // 5 minutes of inactivity
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    events.forEach(event => {
      document.addEventListener(event, resetActivityTimeout, true)
    })

    resetActivityTimeout()

    return () => {
      clearTimeout(activityTimeout)
      events.forEach(event => {
        document.removeEventListener(event, resetActivityTimeout, true)
      })
    }
  }, [authState.isAuthenticated])

  return {
    ...authState,
    login,
    logout,
    refreshUser,
    updateProfile,
    changePassword,
    enable2FA,
    verify2FA,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    sessionTimeout
  }
}
