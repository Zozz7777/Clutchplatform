'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  Search,
  Bell,
  User,
  ChevronDown,
  Sun,
  Moon,
  Settings,
  LogOut,
  HelpCircle,
  MessageSquare,
  X,
  CheckCircle,
  AlertTriangle,
  Info,
  Clock
} from 'lucide-react'
import { useAuthStore, useUIStore } from '@/store'
import { useTheme } from 'next-themes'
import { SnowButton } from '@/components/ui/snow-button'
import { toast } from 'sonner'

interface ImprovedHeaderProps {
  onToggleSidebar: () => void
}

export function ImprovedHeader({ onToggleSidebar }: ImprovedHeaderProps) {
  const { user, logout } = useAuthStore()
  const { notifications } = useUIStore()
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme, resolvedTheme } = useTheme()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Ensure theme is mounted before rendering
  useEffect(() => {
    setMounted(true)
  }, [])

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs = []
    
    // Add home
    breadcrumbs.push({ label: 'Home', href: '/dashboard' })
    
    // Add path segments
    let currentPath = ''
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      
      breadcrumbs.push({
        label,
        href: currentPath,
        isLast: index === segments.length - 1
      })
    })
    
    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  // Handle search
  const handleSearch = async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    // Mock search results - replace with real search API
    const mockResults = [
      { title: 'Dashboard', href: '/dashboard', type: 'page' },
      { title: 'User Analytics', href: '/users/analytics', type: 'page' },
      { title: 'Fleet Management', href: '/fleet/overview', type: 'page' },
      { title: 'CRM Customers', href: '/crm/customers', type: 'page' },
      { title: 'Settings', href: '/settings/system', type: 'page' }
    ].filter(result => 
      result.title.toLowerCase().includes(query.toLowerCase())
    )

    setSearchResults(mockResults)
    setShowSearchResults(true)
  }

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    handleSearch(query)
  }

  // Handle search result click
  const handleSearchResultClick = (href: string) => {
    router.push(href)
    setSearchQuery('')
    setShowSearchResults(false)
  }

  // Handle logout
  const handleLogout = async () => {
    await logout()
    router.push('/login')
    toast.success('Logged out successfully')
    setUserMenuOpen(false)
  }

  // Toggle theme
  const toggleTheme = () => {
    if (mounted) {
      setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'dark' : 'light')
    }
  }

  // Toggle notifications
  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen)
    setUserMenuOpen(false)
  }

  // Toggle user menu
  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen)
    setNotificationsOpen(false)
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('[data-dropdown]')) {
        setNotificationsOpen(false)
        setUserMenuOpen(false)
        setShowSearchResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            <svg className="h-5 w-5 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-1 text-sm text-slate-500 dark:text-slate-400">
            {breadcrumbs.map((breadcrumb, index) => (
              <React.Fragment key={breadcrumb.href}>
                {index > 0 && <span className="mx-1">/</span>}
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-slate-900 dark:text-white font-medium">
                    {breadcrumb.label}
                  </span>
                ) : (
                  <Link
                    href={breadcrumb.href}
                    className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                  >
                    {breadcrumb.label}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative" data-dropdown>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search anything..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-80 pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-clutch-primary focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            
            {/* Search Results */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50">
                <div className="py-2">
                  {searchResults.map((result, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearchResultClick(result.href)}
                      className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-clutch-primary rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {result.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {result.href}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Help */}
          <button
            onClick={() => router.push('/help')}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Help & Support"
          >
            <HelpCircle className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          </button>

          {/* Chat */}
          <button
            onClick={() => router.push('/chat')}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Team Chat"
          >
            <MessageSquare className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title={`Switch to ${mounted && theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {mounted ? (
              theme === 'dark' ? (
                <Sun className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              ) : (
                <Moon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              )
            ) : (
              <div className="h-5 w-5 bg-slate-200 rounded animate-pulse" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative" data-dropdown>
            <button
              onClick={toggleNotifications}
              className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-clutch-primary rounded-full text-xs text-white flex items-center justify-center font-medium">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </button>
            
            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div className="absolute top-full right-0 mt-1 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Notifications
                    </h3>
                    <button
                      onClick={() => setNotificationsOpen(false)}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-600 dark:text-slate-400 font-medium">
                        No notifications
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                        You're all caught up!
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                      {notifications.map((notification, index) => (
                        <div key={index} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              {notification.type === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
                              {notification.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                              {notification.type === 'error' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                              {notification.type === 'info' && <Info className="h-5 w-5 text-blue-500" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 dark:text-white">
                                {notification.title}
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                                {notification.timestamp}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {notifications.length > 0 && (
                  <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                    <button className="w-full text-sm text-clutch-primary hover:text-clutch-primary-dark transition-colors">
                      Mark all as read
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" data-dropdown>
            <button
              onClick={toggleUserMenu}
              className="flex items-center space-x-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="User menu"
            >
              <div className="w-8 h-8 bg-clutch-primary rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <ChevronDown className="h-4 w-4 text-slate-600 dark:text-slate-300" />
            </button>
            
            {/* User Menu Dropdown */}
            {userMenuOpen && (
              <div className="absolute top-full right-0 mt-1 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-clutch-primary rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {user?.fullName || 'User'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {user?.email || 'user@example.com'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="py-2">
                  <Link
                    href="/settings/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <User className="h-4 w-4 mr-3" />
                    Profile Settings
                  </Link>
                  
                  <Link
                    href="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Settings
                  </Link>
                  
                  <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
