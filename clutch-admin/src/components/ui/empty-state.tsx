'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'
import { SnowButton } from './snow-button'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  className = '' 
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-8 px-4 text-center ${className}`}>
      {Icon && (
        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <Icon className="h-6 w-6 text-slate-400 dark:text-slate-500" />
        </div>
      )}
      <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-sm">
        {description}
      </p>
      {action && (
        <SnowButton 
          variant="outline" 
          size="sm"
          onClick={action.onClick}
        >
          {action.label}
        </SnowButton>
      )}
    </div>
  )
}

interface MetricEmptyStateProps {
  metric: string
  period?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function MetricEmptyState({ metric, period = 'this period', action }: MetricEmptyStateProps) {
  return (
    <EmptyState
      title={`No ${metric} data`}
      description={`No ${metric.toLowerCase()} data available for ${period}. This could be normal for a new system or during maintenance.`}
      action={action}
    />
  )
}
