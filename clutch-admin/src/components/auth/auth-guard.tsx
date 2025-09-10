'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { Loader2, Shield, AlertTriangle } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, isLoading, user, refreshUser } = useAuthStore()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we have a token in localStorage
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null
        
        if (token && !isAuthenticated) {
          // Try to refresh user data
          await refreshUser()
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        // Clear invalid token
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-token')
        }
      } finally {
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [isAuthenticated, refreshUser])

  // Show loading while checking authentication
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 bg-white">
        <SnowCard className="w-full max-w-md">
          <SnowCardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <SnowCardTitle>Checking Authentication</SnowCardTitle>
            <SnowCardDescription>
              Please wait while we verify your credentials...
            </SnowCardDescription>
          </SnowCardHeader>
        </SnowCard>
      </div>
    )
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    // Use setTimeout to avoid hydration issues
    setTimeout(() => {
      router.push('/login')
    }, 0)

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 bg-white">
        <SnowCard className="w-full max-w-md">
          <SnowCardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Shield className="h-8 w-8 text-red-500" />
            </div>
            <SnowCardTitle>Authentication Required</SnowCardTitle>
            <SnowCardDescription>
              You need to be logged in to access this page.
            </SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent className="text-center">
            <SnowButton 
              onClick={() => router.push('/login')}
              className="w-full"
            >
              Go to Login
            </SnowButton>
          </SnowCardContent>
        </SnowCard>
      </div>
    )
  }

  // If custom fallback is provided, use it
  if (fallback) {
    return <>{fallback}</>
  }

  // User is authenticated, render children
  return <>{children}</>
}

// Higher-order component for protecting routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function AuthenticatedComponent(props: P) {
    return (
      <AuthGuard>
        <Component {...props} />
      </AuthGuard>
    )
  }
}



