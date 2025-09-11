'use client'

import React from 'react'
import { Calendar, Filter, Download, RefreshCw } from 'lucide-react'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowCard, SnowCardContent, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'

interface DataContextProps {
  title: string
  lastUpdated?: Date
  onRefresh?: () => void
  onExport?: () => void
  onFilter?: () => void
  timeRange?: string
  totalRecords?: number
  children: React.ReactNode
  className?: string
}

export default function DataContext({
  title,
  lastUpdated,
  onRefresh,
  onExport,
  onFilter,
  timeRange = 'Last 30 days',
  totalRecords,
  children,
  className = ''
}: DataContextProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Context */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <div className="flex items-center space-x-4 mt-2 text-sm text-slate-600">
            {lastUpdated && (
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Last updated: {lastUpdated.toLocaleString()}</span>
              </div>
            )}
            {totalRecords !== undefined && (
              <div>
                <span className="font-medium">{totalRecords.toLocaleString()}</span> records
              </div>
            )}
            <div className="flex items-center space-x-1">
              <span>Time range:</span>
              <span className="font-medium">{timeRange}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {onFilter && (
            <SnowButton
              variant="outline"
              size="sm"
              onClick={onFilter}
              className="flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </SnowButton>
          )}
          {onExport && (
            <SnowButton
              variant="outline"
              size="sm"
              onClick={onExport}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </SnowButton>
          )}
          {onRefresh && (
            <SnowButton
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </SnowButton>
          )}
        </div>
      </div>

      {/* Content */}
      {children}
    </div>
  )
}

// Status Indicator Component
interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'warning' | 'error'
  label: string
  value?: string | number
  className?: string
}

export function StatusIndicator({ status, label, value, className = '' }: StatusIndicatorProps) {
  const statusConfig = {
    online: {
      color: 'bg-success',
      textColor: 'text-success-dark',
      icon: '●'
    },
    offline: {
      color: 'bg-error',
      textColor: 'text-error-dark',
      icon: '●'
    },
    warning: {
      color: 'bg-warning',
      textColor: 'text-warning-dark',
      icon: '●'
    },
    error: {
      color: 'bg-error',
      textColor: 'text-error-dark',
      icon: '●'
    }
  }

  const config = statusConfig[status]

  return (
    <div className={`flex items-center space-x-3 p-3 bg-slate-50 rounded-lg ${className}`}>
      <div className={`w-3 h-3 ${config.color} rounded-full flex items-center justify-center`}>
        <span className="text-white text-xs">{config.icon}</span>
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-slate-900">{label}</div>
        {value && (
          <div className={`text-sm ${config.textColor}`}>{value}</div>
        )}
      </div>
    </div>
  )
}

// Metric Card Component
interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  trend?: 'up' | 'down' | 'neutral'
  format?: 'number' | 'currency' | 'percentage'
  className?: string
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  trend = 'neutral', 
  format = 'number',
  className = '' 
}: MetricCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(val)
      case 'percentage':
        return `${val}%`
      default:
        return val.toLocaleString()
    }
  }

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-success'
      case 'down':
        return 'text-error'
      default:
        return 'text-slate-500'
    }
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return '↗'
      case 'down':
        return '↘'
      default:
        return '→'
    }
  }

  return (
    <SnowCard className={className}>
      <SnowCardContent className="p-6">
        <div className="space-y-2">
          <div className="text-sm font-medium text-slate-600">{title}</div>
          <div className="text-2xl font-bold text-slate-900">
            {formatValue(value)}
          </div>
          {change !== undefined && (
            <div className={`flex items-center space-x-1 text-sm ${getTrendColor()}`}>
              <span>{getTrendIcon()}</span>
              <span>{Math.abs(change)}%</span>
              <span className="text-slate-500">vs last period</span>
            </div>
          )}
        </div>
      </SnowCardContent>
    </SnowCard>
  )
}
