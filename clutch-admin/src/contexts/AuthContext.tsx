'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { authService, User, AuthResponse } from '@/lib/auth-service'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string, rememberMe?: boolean) => Promise<AuthResponse>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<AuthResponse>
  resetPassword: (email: string) => Promise<AuthResponse>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!user && authService.isAuthenticated()

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if user is already logged in
        const storedUser = authService.getUser()
        if (storedUser && authService.isAuthenticated()) {
          // Verify token is still valid
          const response = await authService.getCurrentUser()
          if (response.success && response.data) {
            setUser(response.data.user)
          } else {
            // Token is invalid, clear user
            setUser(null)
            authService.logout()
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string, rememberMe = false): Promise<AuthResponse> => {
    setIsLoading(true)
    try {
      const response = await authService.login({ email, password, rememberMe })
      if (response.success && response.data) {
        setUser(response.data.user)
        router.push('/dashboard')
      }
      return response
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        message: 'Login failed. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    setIsLoading(true)
    try {
      await authService.logout()
      setUser(null)
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await authService.getCurrentUser()
      if (response.success && response.data) {
        setUser(response.data.user)
      } else {
        setUser(null)
        router.push('/login')
      }
    } catch (error) {
      console.error('Refresh user error:', error)
      setUser(null)
      router.push('/login')
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string): Promise<AuthResponse> => {
    try {
      return await authService.changePassword(currentPassword, newPassword)
    } catch (error) {
      console.error('Change password error:', error)
      return {
        success: false,
        message: 'Failed to change password. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  const resetPassword = async (email: string): Promise<AuthResponse> => {
    try {
      return await authService.resetPassword(email)
    } catch (error) {
      console.error('Reset password error:', error)
      return {
        success: false,
        message: 'Failed to send reset email. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshUser,
    changePassword,
    resetPassword,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Higher-order component for protected routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push('/login')
      }
    }, [isAuthenticated, isLoading, router])

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )
    }

    if (!isAuthenticated) {
      return null
    }

    return <Component {...props} />
  }
}
