/**
 * Performance Validation Page
 * Real-time performance monitoring and validation
 */

import React from 'react'
import { PerformanceValidationDashboard } from '@/components/performance/performance-validation-dashboard'
import { Activity } from 'lucide-react'

export default function PerformanceValidationPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Activity className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance Validation</h1>
          <p className="text-muted-foreground">
            Real-time performance monitoring and validation in production
          </p>
        </div>
      </div>

      <PerformanceValidationDashboard />
    </div>
  )
}
