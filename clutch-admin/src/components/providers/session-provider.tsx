'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store'
import { sessionManager, setupActivityTracking } from '@/utils/sessionManager'

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    // Setup activity tracking for authenticated users
    if (isAuthenticated) {
      const cleanup = setupActivityTracking()
      
      // Start session monitoring if not already started
      sessionManager.login()
      
      return () => {
        cleanup?.()
      }
    } else {
      // Stop session monitoring for unauthenticated users
      sessionManager.logout()
    }
  }, [isAuthenticated])

  return <>{children}</>
}
