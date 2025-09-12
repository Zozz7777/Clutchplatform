'use client'

import React, { forwardRef, useRef, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useSmartNavigation } from '@/lib/smart-navigation'
import { useResponsive } from '@/lib/responsive-system'
import { Search, Clock, Star, TrendingUp, User, Settings, HelpCircle } from 'lucide-react'

// Smart Navigation Bar
export interface SmartNavigationBarProps
  extends React.HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode
  userMenu?: React.ReactNode
  searchEnabled?: boolean
  suggestionsEnabled?: boolean
  breadcrumbsEnabled?: boolean
}

export const SmartNavigationBar = forwardRef<HTMLElement, SmartNavigationBarProps>(
  ({ 
    className, 
    logo, 
    userMenu, 
    searchEnabled = true, 
    suggestionsEnabled = true,
    breadcrumbsEnabled = true,
    ...props 
  }, ref) => {
    const { suggestions, breadcrumbs, trackNavigation } = useSmartNavigation()
    const { isMobile } = useResponsive()
    const [searchQuery, setSearchQuery] = useState('')
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [showMobileMenu, setShowMobileMenu] = useState(false)

    const handleSearch = (query: string) => {
      setSearchQuery(query)
      if (query.length > 0) {
        setShowSuggestions(true)
      } else {
        setShowSuggestions(false)
      }
    }

    const handleSuggestionClick = (suggestion: any) => {
      trackNavigation(suggestion.item.path)
      setShowSuggestions(false)
      setSearchQuery('')
      // Note: Navigation should be handled by the calling component with useRouter
      console.log(`Navigation requested to: ${suggestion.item.path}`)
    }

    return (
      <nav
        ref={ref}
        className={cn(
          'bg-white border-b border-gray-200 px-4 py-3',
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {logo}
          </div>
          {searchEnabled && (
            <div className="flex-1 max-w-md mx-4 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-600" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {suggestions.slice(0, 5).map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">
                          {suggestion.item.label}
                        </span>
                        <span className="ml-2 text-xs text-slate-600">
                          {suggestion.reason}
                        </span>
                      </div>
                      <div className="flex items-center">
                        {suggestion.type === 'recent' && <Clock className="h-4 w-4 text-slate-600" />}
                        {suggestion.type === 'frequent' && <Star className="h-4 w-4 text-slate-600" />}
                        {suggestion.type === 'recommended' && <TrendingUp className="h-4 w-4 text-slate-600" />}
                        {suggestion.type === 'contextual' && <User className="h-4 w-4 text-slate-600" />}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="flex items-center space-x-4">
            {userMenu}
          </div>
        </div>
        {breadcrumbsEnabled && breadcrumbs.length > 1 && (
          <div className="mt-3 flex items-center space-x-2 text-sm text-gray-600">
            {breadcrumbs.map((breadcrumb, index) => (
              <React.Fragment key={breadcrumb.path}>
                {index > 0 && <span>/</span>}
                <a
                  href={breadcrumb.path}
                  className={cn(
                    'hover:text-gray-900 transition-colors',
                    breadcrumb.active && 'text-gray-900 font-medium'
                  )}
                >
                  {breadcrumb.label}
                </a>
              </React.Fragment>
            ))}
          </div>
        )}
      </nav>
    )
  }
)

SmartNavigationBar.displayName = 'SmartNavigationBar'

// Smart Sidebar
export interface SmartSidebarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean
  onToggle?: () => void
  items: Array<{
    id: string
    label: string
    icon?: React.ReactNode
    path: string
    children?: Array<{
      id: string
      label: string
      path: string
    }>
  }>
  showSuggestions?: boolean
  showRecent?: boolean
}

export const SmartSidebar = forwardRef<HTMLDivElement, SmartSidebarProps>(
  ({ 
    className, 
    isOpen = false, 
    onToggle, 
    items, 
    showSuggestions = true,
    showRecent = true,
    ...props 
  }, ref) => {
    const { suggestions, navigationHistory, trackNavigation } = useSmartNavigation()
    const { isMobile } = useResponsive()
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

    const toggleExpanded = (itemId: string) => {
      setExpandedItems(prev => {
        const newSet = new Set(prev)
        if (newSet.has(itemId)) {
          newSet.delete(itemId)
        } else {
          newSet.add(itemId)
        }
        return newSet
      })
    }

    const handleItemClick = (path: string) => {
      trackNavigation(path)
      if (isMobile && onToggle) {
        onToggle()
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          'bg-white border-r border-gray-200 h-full overflow-y-auto',
          isMobile ? 'fixed inset-y-0 left-0 z-50 w-64' : 'w-64',
          isMobile && !isOpen && 'hidden',
          className
        )}
        {...props}
      >
        <div className="p-4">
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id}>
                <button
                  onClick={() => {
                    if (item.children && item.children.length > 0) {
                      toggleExpanded(item.id)
                    } else {
                      handleItemClick(item.path)
                    }
                  }}
                  className={cn(
                    'w-full flex items-center px-3 py-2 text-left text-slate-800 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors',
                    item.children && item.children.length > 0 && 'justify-between'
                  )}
                >
                  <div className="flex items-center">
                    {item.icon && (
                      <span className="mr-3 flex-shrink-0">
                        {item.icon}
                      </span>
                    )}
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  {item.children && item.children.length > 0 && (
                    <svg
                      className={cn(
                        'h-4 w-4 transition-transform',
                        expandedItems.has(item.id) && 'rotate-90'
                      )}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
                {item.children && item.children.length > 0 && expandedItems.has(item.id) && (
                  <div className="ml-6 mt-2 space-y-1">
                    {item.children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => handleItemClick(child.path)}
                        className="w-full flex items-center px-3 py-2 text-left text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          {showSuggestions && suggestions.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Smart Suggestions
              </h3>
              <div className="space-y-1">
                {suggestions.slice(0, 3).map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleItemClick(suggestion.item.path)}
                    className="w-full flex items-center px-3 py-2 text-left text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <span className="mr-3 flex-shrink-0">
                      {suggestion.type === 'recent' && <Clock className="h-4 w-4" />}
                      {suggestion.type === 'frequent' && <Star className="h-4 w-4" />}
                      {suggestion.type === 'recommended' && <TrendingUp className="h-4 w-4" />}
                      {suggestion.type === 'contextual' && <User className="h-4 w-4" />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {suggestion.item.label}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {suggestion.reason}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {showRecent && navigationHistory.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
                Recent
              </h3>
              <div className="space-y-1">
                {navigationHistory.slice(0, 5).map((history) => {
                  const item = items.find(i => i.path === history.path)
                  if (!item) return null

                  return (
                    <button
                      key={history.id}
                      onClick={() => handleItemClick(history.path)}
                      className="w-full flex items-center px-3 py-2 text-left text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <span className="mr-3 flex-shrink-0">
                        {item.icon || <Clock className="h-4 w-4" />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {item.label}
                        </div>
                        <div className="text-xs text-slate-600 truncate">
                          {new Date(history.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
)

SmartSidebar.displayName = 'SmartSidebar'

// Smart Breadcrumbs
export interface SmartBreadcrumbsProps
  extends React.HTMLAttributes<HTMLElement> {
  showHome?: boolean
  separator?: React.ReactNode
  maxItems?: number
}

export const SmartBreadcrumbs = forwardRef<HTMLElement, SmartBreadcrumbsProps>(
  ({ 
    className, 
    showHome = true, 
    separator = '/',
    maxItems = 5,
    ...props 
  }, ref) => {
    const { breadcrumbs } = useSmartNavigation()

    if (breadcrumbs.length <= 1) return null

    const displayBreadcrumbs = maxItems ? breadcrumbs.slice(-maxItems) : breadcrumbs

    return (
      <nav
        ref={ref}
        className={cn('flex items-center space-x-2 text-sm text-gray-600', className)}
        aria-label="Breadcrumb"
        {...props}
      >
        {displayBreadcrumbs.map((breadcrumb, index) => (
          <React.Fragment key={breadcrumb.path}>
            {index > 0 && (
              <span className="text-slate-600" aria-hidden="true">
                {separator}
              </span>
            )}
            <a
              href={breadcrumb.path}
              className={cn(
                'hover:text-gray-900 transition-colors',
                breadcrumb.active && 'text-gray-900 font-medium'
              )}
              aria-current={breadcrumb.active ? 'page' : undefined}
            >
              {breadcrumb.label}
            </a>
          </React.Fragment>
        ))}
      </nav>
    )
  }
)

SmartBreadcrumbs.displayName = 'SmartBreadcrumbs'

// Smart Quick Actions
export interface SmartQuickActionsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  actions: Array<{
    id: string
    label: string
    icon: React.ReactNode
    onClick: () => void
    shortcut?: string
  }>
  maxItems?: number
}

export const SmartQuickActions = forwardRef<HTMLDivElement, SmartQuickActionsProps>(
  ({ 
    className, 
    actions, 
    maxItems = 4,
    ...props 
  }, ref) => {
    const { trackNavigation } = useSmartNavigation()

    const handleActionClick = (action: any) => {
      action.onClick()
      trackNavigation(`/quick-action/${action.id}`)
    }

    return (
      <div
        ref={ref}
        className={cn('flex flex-wrap gap-2', className)}
        {...props}
      >
        {actions.slice(0, maxItems).map((action) => (
          <button
            key={action.id}
            onClick={() => handleActionClick(action)}
            className="flex items-center px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors"
            title={action.shortcut ? `${action.label} (${action.shortcut})` : action.label}
          >
            <span className="mr-2 flex-shrink-0">
              {action.icon}
            </span>
            <span className="hidden sm:inline">{action.label}</span>
          </button>
        ))}
      </div>
    )
  }
)

SmartQuickActions.displayName = 'SmartQuickActions'

const SmartNavigation = {
  SmartNavigationBar,
  SmartSidebar,
  SmartBreadcrumbs,
  SmartQuickActions
}

export default SmartNavigation
