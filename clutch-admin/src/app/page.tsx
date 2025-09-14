'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store'

export default function RootPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  
  useEffect(() => {
    // Use client-side navigation instead of server-side redirect
    if (isAuthenticated && user) {
      router.replace('/dashboard-consolidated')
    } else {
      router.replace('/login')
    }
  }, [isAuthenticated, user, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-clutch-primary mx-auto mb-4"></div>
        <p className="text-slate-600">Loading...</p>
      </div>
    </div>
  )
}