'use client'

import React, { useState, useEffect } from 'react'
import { 
  Menu, 
  Search, 
  Bell, 
  User, 
  ChevronDown, 
  Sun, 
  Moon, 
  HelpCircle, 
  MessageSquare,
  Settings,
  LogOut,
  Shield,
  Activity,
  Zap,
  Command
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useAuthStore, useUIStore } from '@/store'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface NewHeaderProps {
  onSearchClick?: () => void
  onKeyboardShortcutsClick?: () => void
}

const NewHeader: React.FC<NewHeaderProps> = ({ 
  onSearchClick, 
  onKeyboardShortcutsClick 
}) => {
  // Hooks
  const { sidebarCollapsed, toggleSidebar, notifications } = useUIStore()
  const { user, logout } = useAuthStore()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()
  
  // State
  const [mounted, setMounted] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)

  // Initialize theme
  useEffect(() => {
    setMounted(true)
  }, [])

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs: Array<{ label: string; href: string; isLast?: boolean }> = []
    
    // Add home
    breadcrumbs.push({ label: 'Dashboard', href: '/dashboard' })
    
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

  // Theme toggle
  const toggleTheme = () => {
    if (mounted) {
      setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'dark' : 'light')
    }
  }

  // Toggle functions
  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen)
    setUserMenuOpen(false)
  }

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen)
    setNotificationsOpen(false)
  }

  // Search functionality
  const handleSearchQuery = async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    // Enhanced search results with more comprehensive data
    const mockResults = [
      { title: 'Dashboard Overview', href: '/dashboard', type: 'page', category: 'Core' },
      { title: 'User Analytics', href: '/users/analytics', type: 'page', category: 'Analytics' },
      { title: 'Fleet Management', href: '/fleet/overview', type: 'page', category: 'Fleet' },
      { title: 'CRM Customers', href: '/crm/customers', type: 'page', category: 'CRM' },
      { title: 'HR Employees', href: '/hr/employees', type: 'page', category: 'HR' },
      { title: 'Finance Reports', href: '/finance/reports', type: 'page', category: 'Finance' },
      { title: 'Legal Contracts', href: '/legal/contracts', type: 'page', category: 'Legal' },
      { title: 'AI Dashboard', href: '/ai/dashboard', type: 'page', category: 'AI' },
      { title: 'System Settings', href: '/settings/system', type: 'page', category: 'Settings' },
      { title: 'Team Chat', href: '/chat', type: 'page', category: 'Communication' }
    ].filter(result => 
      result.title.toLowerCase().includes(query.toLowerCase()) ||
      result.category.toLowerCase().includes(query.toLowerCase())
    )

    setSearchResults(mockResults)
    setShowSearchResults(true)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    handleSearchQuery(query)
  }

  const handleSearchResultClick = (href: string) => {
    router.push(href)
    setSearchQuery('')
    setShowSearchResults(false)
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  // Don't render until theme is mounted
  if (!mounted) {
    return (
      <header className="sticky top-0 z-30 bg-white dark:bg-clutch-gray-800 border-b border-clutch-gray-200 dark:border-clutch-gray-700 shadow-sm">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 bg-clutch-gray-200 rounded animate-pulse" />
            <div className="h-4 w-32 bg-clutch-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 bg-clutch-gray-200 rounded animate-pulse" />
            <div className="h-8 w-8 bg-clutch-gray-200 rounded animate-pulse" />
            <div className="h-8 w-8 bg-clutch-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-clutch-gray-800 border-b border-clutch-gray-200 dark:border-clutch-gray-700 shadow-sm backdrop-blur-sm bg-white/95 dark:bg-clutch-gray-800/95">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Sidebar Toggle */}
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-clutch-gray-100 dark:hover:bg-clutch-gray-700 rounded-lg transition-all duration-200 hover:scale-105"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5 text-clutch-gray-600 dark:text-clutch-gray-300" />
          </button>
          
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-1 text-sm text-clutch-gray-500 dark:text-clutch-gray-400">
            {breadcrumbs.map((breadcrumb, index) => (
              <React.Fragment key={breadcrumb.href}>
                {index > 0 && (
                  <span className="mx-1 text-clutch-gray-300 dark:text-clutch-gray-600">
                    /
                  </span>
                )}
                {breadcrumb.isLast ? (
                  <span className="text-clutch-gray-900 dark:text-white font-medium">
                    {breadcrumb.label}
                  </span>
                ) : (
                  <Link
                    href={breadcrumb.href}
                    className="hover:text-clutch-primary transition-colors duration-200"
                  >
                    {breadcrumb.label}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-clutch-gray-400" />
              <input
                type="text"
                placeholder="Search anything... (Ctrl+K)"
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2.5 border border-clutch-gray-300 dark:border-clutch-gray-600 rounded-xl focus:ring-2 focus:ring-clutch-primary focus:border-transparent bg-white dark:bg-clutch-gray-700 text-clutch-gray-900 dark:text-white placeholder-clutch-gray-400 transition-all duration-200"
                onFocus={() => onSearchClick?.()}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <kbd className="px-2 py-1 text-xs font-mono bg-clutch-gray-100 dark:bg-clutch-gray-600 text-clutch-gray-500 dark:text-clutch-gray-400 rounded border">
                  ⌘K
                </kbd>
              </div>
            </div>
            
            {/* Enhanced Search Results */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-clutch-gray-800 border border-clutch-gray-200 dark:border-clutch-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="py-2">
                  {searchResults.map((result, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearchResultClick(result.href)}
                      className="w-full px-4 py-3 text-left hover:bg-clutch-gray-50 dark:hover:bg-clutch-gray-700 transition-colors duration-200 group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-clutch-primary rounded-full group-hover:scale-125 transition-transform duration-200"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-clutch-gray-900 dark:text-white group-hover:text-clutch-primary transition-colors">
                            {result.title}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-clutch-gray-500 dark:text-clutch-gray-400">
                              {result.href}
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-clutch-gray-100 dark:bg-clutch-gray-600 text-clutch-gray-600 dark:text-clutch-gray-300 rounded-full">
                              {result.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          {/* Help */}
          <button
            onClick={() => router.push('/help')}
            className="p-2 hover:bg-clutch-gray-100 dark:hover:bg-clutch-gray-700 rounded-lg transition-all duration-200 hover:scale-105"
            title="Help & Support"
          >
            <HelpCircle className="h-5 w-5 text-clutch-gray-600 dark:text-clutch-gray-300" />
          </button>

          {/* Team Chat */}
          <button
            onClick={() => router.push('/chat')}
            className="p-2 hover:bg-clutch-gray-100 dark:hover:bg-clutch-gray-700 rounded-lg transition-all duration-200 hover:scale-105"
            title="Team Chat"
          >
            <MessageSquare className="h-5 w-5 text-clutch-gray-600 dark:text-clutch-gray-300" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-clutch-gray-100 dark:hover:bg-clutch-gray-700 rounded-lg transition-all duration-200 hover:scale-105"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-clutch-gray-600 dark:text-clutch-gray-300" />
            ) : (
              <Moon className="h-5 w-5 text-clutch-gray-600 dark:text-clutch-gray-300" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={toggleNotifications}
              className="relative p-2 hover:bg-clutch-gray-100 dark:hover:bg-clutch-gray-700 rounded-lg transition-all duration-200 hover:scale-105"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 text-clutch-gray-600 dark:text-clutch-gray-300" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-clutch-primary rounded-full text-xs text-white flex items-center justify-center font-medium animate-pulse">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-clutch-gray-800 border border-clutch-gray-200 dark:border-clutch-gray-700 rounded-xl shadow-xl z-50">
                <div className="p-4 border-b border-clutch-gray-200 dark:border-clutch-gray-700">
                  <h3 className="text-sm font-semibold text-clutch-gray-900 dark:text-white">
                    Notifications
                  </h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification, index) => (
                      <div key={index} className="p-4 border-b border-clutch-gray-100 dark:border-clutch-gray-700 last:border-b-0">
                        <p className="text-sm text-clutch-gray-900 dark:text-white">
                          {notification.message}
                        </p>
                        <p className="text-xs text-clutch-gray-500 dark:text-clutch-gray-400 mt-1">
                          {notification.timestamp}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <Bell className="h-8 w-8 text-clutch-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-clutch-gray-500 dark:text-clutch-gray-400">
                        No notifications
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={toggleUserMenu}
              className="flex items-center space-x-2 p-2 hover:bg-clutch-gray-100 dark:hover:bg-clutch-gray-700 rounded-lg transition-all duration-200 hover:scale-105"
              aria-label="User menu"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-clutch-primary to-clutch-primary-dark rounded-full flex items-center justify-center shadow-sm">
                <User className="h-4 w-4 text-white" />
              </div>
              <ChevronDown className="h-4 w-4 text-clutch-gray-600 dark:text-clutch-gray-300" />
            </button>

            {/* User Menu Dropdown */}
            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-clutch-gray-800 border border-clutch-gray-200 dark:border-clutch-gray-700 rounded-xl shadow-xl z-50">
                <div className="p-4 border-b border-clutch-gray-200 dark:border-clutch-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-clutch-primary to-clutch-primary-dark rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-clutch-gray-900 dark:text-white">
                        {user?.email || 'Admin User'}
                      </p>
                      <p className="text-xs text-clutch-gray-500 dark:text-clutch-gray-400">
                        {user?.email || 'admin@zgarage.com'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="py-2">
                  <Link
                    href="/settings/profile"
                    className="flex items-center space-x-3 px-4 py-2 text-sm text-clutch-gray-700 dark:text-clutch-gray-300 hover:bg-clutch-gray-50 dark:hover:bg-clutch-gray-700 transition-colors"
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center space-x-3 px-4 py-2 text-sm text-clutch-gray-700 dark:text-clutch-gray-300 hover:bg-clutch-gray-50 dark:hover:bg-clutch-gray-700 transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                  <Link
                    href="/security"
                    className="flex items-center space-x-3 px-4 py-2 text-sm text-clutch-gray-700 dark:text-clutch-gray-300 hover:bg-clutch-gray-50 dark:hover:bg-clutch-gray-700 transition-colors"
                  >
                    <Shield className="h-4 w-4" />
                    <span>Security</span>
                  </Link>
                  <div className="border-t border-clutch-gray-200 dark:border-clutch-gray-700 my-2"></div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
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

export default NewHeader