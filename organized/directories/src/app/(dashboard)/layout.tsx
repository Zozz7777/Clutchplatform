'use client'

import React from 'react'
import { useAuthStore } from '@/store'
import { MainLayout } from '@/components/layout/main-layout'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated } = useAuthStore()

  // For now, we'll allow access without authentication for demo purposes
  // In production, you would redirect to login if not authenticated
  if (!isAuthenticated) {
    // For demo purposes, we'll just render the dashboard
    // In production: return <Redirect to="/login" />
  }

  return <MainLayout>{children}</MainLayout>
}
