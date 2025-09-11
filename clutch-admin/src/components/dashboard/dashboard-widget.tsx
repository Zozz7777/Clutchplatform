'use client'

import React, { useState } from 'react'
import { MoreHorizontal, RefreshCw, Settings, X } from 'lucide-react'
import { SnowCard, SnowCardContent, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'

interface DashboardWidgetProps {
  title: string
  children: React.ReactNode
  className?: string
  onRefresh?: () => void
  onConfigure?: () => void
  onRemove?: () => void
  isLoading?: boolean
  error?: string
  size?: 'small' | 'medium' | 'large'
  refreshable?: boolean
  configurable?: boolean
  removable?: boolean
}

export default function DashboardWidget({
  title,
  children,
  className = '',
  onRefresh,
  onConfigure,
  onRemove,
  isLoading = false,
  error,
  size = 'medium',
  refreshable = true,
  configurable = true,
  removable = true
}: DashboardWidgetProps) {
  const [showMenu, setShowMenu] = useState(false)

  const sizeClasses = {
    small: 'col-span-1',
    medium: 'col-span-1 md:col-span-2',
    large: 'col-span-1 md:col-span-2 lg:col-span-3'
  }

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh()
    }
    setShowMenu(false)
  }

  const handleConfigure = () => {
    if (onConfigure) {
      onConfigure()
    }
    setShowMenu(false)
  }

  const handleRemove = () => {
    if (onRemove) {
      onRemove()
    }
    setShowMenu(false)
  }

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <SnowCard className="h-full">
        <SnowCardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SnowCardTitle className="text-lg">{title}</SnowCardTitle>
            <div className="flex items-center space-x-2">
              {isLoading && (
                <RefreshCw className="h-4 w-4 animate-spin text-slate-400" />
              )}
              <div className="relative">
                <SnowButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMenu(!showMenu)}
                  className="h-8 w-8 p-0"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </SnowButton>
                
                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 top-8 z-20 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1">
                      {refreshable && onRefresh && (
                        <button
                          onClick={handleRefresh}
                          className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                        >
                          <RefreshCw className="h-4 w-4" />
                          <span>Refresh</span>
                        </button>
                      )}
                      {configurable && onConfigure && (
                        <button
                          onClick={handleConfigure}
                          className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                        >
                          <Settings className="h-4 w-4" />
                          <span>Configure</span>
                        </button>
                      )}
                      {removable && onRemove && (
                        <button
                          onClick={handleRemove}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                        >
                          <X className="h-4 w-4" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </SnowCardHeader>
        
        <SnowCardContent className="flex-1">
          {error ? (
            <div className="flex items-center justify-center h-32 text-center">
              <div>
                <div className="text-sm text-error mb-2">Error loading data</div>
                <div className="text-xs text-slate-500 mb-3">{error}</div>
                {onRefresh && (
                  <SnowButton
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Retry
                  </SnowButton>
                )}
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <RefreshCw className="h-6 w-6 animate-spin text-slate-400 mx-auto mb-2" />
                <div className="text-sm text-slate-500">Loading...</div>
              </div>
            </div>
          ) : (
            children
          )}
        </SnowCardContent>
      </SnowCard>
    </div>
  )
}
