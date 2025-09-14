'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { 
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  Sun,
  Moon,
  HelpCircle,
  MessageSquare
} from 'lucide-react'
import { useAuthStore, useUIStore } from '@/store'
import { useTheme } from 'next-themes'
// New components
import NewSidebar from '@/components/layout/new-sidebar'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Breadcrumbs from '@/components/layout/breadcrumbs'
import { Toaster } from 'sonner'
import { AuthGuard } from '@/components/auth/auth-guard'
import EnhancedErrorBoundary from '@/components/error-handlers/enhanced-error-boundary'
import { NotificationProvider } from '@/components/notifications/notification-provider'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import KeyboardShortcutsModal from '@/components/modals/keyboard-shortcuts-modal'
import GlobalSearch from '@/components/search/global-search'
import ThemeToggle from '@/components/theme/theme-toggle'

// Loading Component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-clutch-gray-50">
    <div className="text-center">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-clutch-gray-200 border-t-clutch-red-500 mx-auto mb-4"></div>
        <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-clutch-red-500/60 animate-ping"></div>
      </div>
      <p className="text-clutch-gray-600 font-medium">Loading...</p>
    </div>
  </div>
)

// Notifications Popup Component
const NotificationsPopup = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { notifications } = useUIStore()

  if (!isOpen) return null

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/20 z-50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div id="notifications-popup" role="dialog" aria-modal="true" aria-label="Notifications" className="fixed top-20 right-6 w-96 bg-white rounded-xl shadow-2xl border border-clutch-gray-200 z-50 animate-in slide-in-from-top">
        <div className="p-6 border-b border-clutch-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-clutch-gray-900">Notifications</h3>
            <button onClick={onClose} className="h-8 w-8 p-0 hover:bg-clutch-gray-50 rounded-lg flex items-center justify-center">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-clutch-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="h-6 w-6 text-clutch-gray-600" />
              </div>
              <p className="text-clutch-gray-600 font-medium">No notifications</p>
              <p className="text-sm text-clutch-gray-600 mt-1">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-clutch-gray-100">
              {notifications.map((notification, index) => (
                <div key={index} className="p-4 hover:bg-clutch-gray-50/50 transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-clutch-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-clutch-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-sm text-clutch-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-clutch-gray-600 mt-2">
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
          <div className="p-4 border-t border-clutch-gray-200">
            <button 
              className="w-full bg-white border border-clutch-gray-200 text-clutch-gray-700 hover:bg-clutch-gray-50 rounded-lg py-2 px-4 transition-colors" 
              onClick={onClose}
            >
              Mark all as read
            </button>
          </div>
        )}
      </div>
    </>
  )
}

// User Menu Dropdown Component
const UserMenuDropdown = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { user, logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/20 z-50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div id="user-menu-dropdown" role="menu" aria-label="User menu" className="fixed top-20 right-6 w-72 bg-white rounded-xl shadow-2xl border border-clutch-gray-200 z-50 animate-in slide-in-from-top">
        <div className="p-6 border-b border-clutch-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-clutch-red-500 rounded-full flex items-center justify-center">
              {user?.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt={user.fullName || 'User'} 
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <User className="h-6 w-6 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-clutch-gray-900 truncate">
                {user?.fullName || 'User'}
              </p>
              <p className="text-xs text-clutch-gray-600 truncate">
                {user?.email || 'user@example.com'}
              </p>
              <p className="text-xs text-clutch-gray-600">
                {user?.jobTitle || 'Employee'}
              </p>
            </div>
          </div>
        </div>
        <div className="py-2">
          <Link href="/settings/profile" onClick={onClose}>
            <div className="flex items-center px-4 py-3 text-sm text-clutch-gray-700 hover:bg-clutch-gray-50/50 transition-colors">
              <User className="h-4 w-4 mr-3 text-clutch-gray-600" />
              Account Settings
            </div>
          </Link>
          
          <Link href="/settings" onClick={onClose}>
            <div className="flex items-center px-4 py-3 text-sm text-clutch-gray-700 hover:bg-clutch-gray-50/50 transition-colors">
              <HelpCircle className="h-4 w-4 mr-3 text-clutch-gray-600" />
              Settings
            </div>
          </Link>
          
          <div className="border-t border-clutch-gray-200 my-2"></div>
          
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Logout
          </button>
        </div>
      </div>
    </>
  )
}

// Enhanced Header Component
const Header = ({ 
  onSearchClick, 
  onKeyboardShortcutsClick 
}: { 
  onSearchClick: () => void
  onKeyboardShortcutsClick: () => void
}) => {
  const { sidebarCollapsed, toggleSidebar, notifications } = useUIStore()
  const { user } = useAuthStore()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Initialize keyboard shortcuts
  useKeyboardShortcuts()

  // Ensure theme is mounted before rendering
  useEffect(() => {
    setMounted(true)
  }, [])

  // Listen for keyboard shortcuts events
  useEffect(() => {
    const handleKeyboardShortcutsEvent = () => {
      onKeyboardShortcutsClick()
    }

    window.addEventListener('open-keyboard-shortcuts', handleKeyboardShortcutsEvent)
    return () => window.removeEventListener('open-keyboard-shortcuts', handleKeyboardShortcutsEvent)
  }, [onKeyboardShortcutsClick])

  const toggleTheme = () => {
    if (mounted) {
      setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'dark' : 'light')
    }
  }

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen)
    setUserMenuOpen(false)
  }

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen)
    setNotificationsOpen(false)
  }

  const handleSearchClick = () => {
    onSearchClick()
  }

  const handleKeyboardShortcutsClick = () => {
    onKeyboardShortcutsClick()
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs: Array<{ label: string; href: string; isLast?: boolean }> = []
    
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
  const handleSearchQuery = async (query: string) => {
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
    handleSearchQuery(query)
  }

  // Handle search result click
  const handleSearchResultClick = (href: string) => {
    router.push(href)
    setSearchQuery('')
    setShowSearchResults(false)
  }

  // Don't render logo until theme is mounted to prevent hydration mismatch
  const currentTheme = mounted ? resolvedTheme : 'light'

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-clutch-gray-700 border-b border-clutch-gray-200 dark:border-clutch-gray-600 shadow-sm">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-clutch-gray-100 dark:hover:bg-clutch-gray-800 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5 text-clutch-gray-600 dark:text-clutch-gray-300" />
          </button>
          
          {/* Enhanced Breadcrumbs */}
          <nav className="flex items-center space-x-1 text-sm text-clutch-gray-500 dark:text-clutch-gray-400">
            {breadcrumbs.map((breadcrumb, index) => (
              <React.Fragment key={breadcrumb.href}>
                {index > 0 && <span className="mx-1">/</span>}
                {breadcrumb.isLast ? (
                  <span className="text-clutch-gray-900 dark:text-white font-medium">
                    {breadcrumb.label}
                  </span>
                ) : (
                  <Link
                    href={breadcrumb.href}
                    className="hover:text-clutch-gray-700 dark:hover:text-clutch-gray-300 transition-colors"
                  >
                    {breadcrumb.label}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </nav>
          
          {/* Enhanced Search */}
          <div className="relative" data-dropdown>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-clutch-gray-400" />
              <input
                type="text"
                placeholder="Search anything..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-80 pl-10 pr-4 py-2 border border-clutch-gray-300 dark:border-clutch-gray-600 rounded-lg focus:ring-2 focus:ring-clutch-red-500 focus:border-transparent bg-white dark:bg-clutch-gray-800 text-clutch-gray-900 dark:text-white"
              />
            </div>
            
            {/* Search Results */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-clutch-gray-800 border border-clutch-gray-200 dark:border-clutch-gray-700 rounded-lg shadow-lg z-50">
                <div className="py-2">
                  {searchResults.map((result, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearchResultClick(result.href)}
                      className="w-full px-4 py-2 text-left hover:bg-clutch-gray-50 dark:hover:bg-clutch-gray-700 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-clutch-red-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-clutch-gray-900 dark:text-white">
                            {result.title}
                          </p>
                          <p className="text-xs text-clutch-gray-500 dark:text-clutch-gray-400">
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
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Help */}
          <button
            onClick={() => router.push('/help')}
            className="p-2 hover:bg-clutch-gray-100 dark:hover:bg-clutch-gray-800 rounded-lg transition-colors"
            title="Help & Support"
          >
            <HelpCircle className="h-5 w-5 text-clutch-gray-600 dark:text-clutch-gray-300" />
          </button>

          {/* Chat */}
          <button
            onClick={() => router.push('/chat')}
            className="p-2 hover:bg-clutch-gray-100 dark:hover:bg-clutch-gray-800 rounded-lg transition-colors"
            title="Team Chat"
          >
            <MessageSquare className="h-5 w-5 text-clutch-gray-600 dark:text-clutch-gray-300" />
          </button>
          
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-clutch-gray-100 dark:hover:bg-clutch-gray-800 rounded-lg transition-colors"
            title={`Switch to ${mounted && theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {mounted ? (
              theme === 'dark' ? (
                <Sun className="h-5 w-5 text-clutch-gray-600 dark:text-clutch-gray-300" />
              ) : (
                <Moon className="h-5 w-5 text-clutch-gray-600 dark:text-clutch-gray-300" />
              )
            ) : (
              <div className="h-5 w-5 bg-clutch-gray-200 rounded animate-pulse" />
            )}
          </button>
          
          {/* Notifications */}
          <div className="relative" data-dropdown>
            <button
              onClick={toggleNotifications}
              className="relative p-2 hover:bg-clutch-gray-100 dark:hover:bg-clutch-gray-800 rounded-lg transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 text-clutch-gray-600 dark:text-clutch-gray-300" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-clutch-red-500 rounded-full text-xs text-white flex items-center justify-center font-medium">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </button>
          </div>
          
          {/* User Menu */}
          <div className="relative" data-dropdown>
            <button
              onClick={toggleUserMenu}
              className="flex items-center space-x-2 p-2 hover:bg-clutch-gray-100 dark:hover:bg-clutch-gray-800 rounded-lg transition-colors"
              aria-label="User menu"
            >
              <div className="w-8 h-8 bg-clutch-red-500 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <ChevronDown className="h-4 w-4 text-clutch-gray-600 dark:text-clutch-gray-300" />
            </button>
          </div>
        </div>
      </div>
      <NotificationsPopup 
        isOpen={notificationsOpen} 
        onClose={() => setNotificationsOpen(false)} 
      />
      <UserMenuDropdown 
        isOpen={userMenuOpen} 
        onClose={() => setUserMenuOpen(false)} 
      />
    </header>
  )
}

// Main Layout Component
const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { sidebarCollapsed } = useUIStore()
  const [selectedParent, setSelectedParent] = useState<string | null>(null)
  const [showSearch, setShowSearch] = useState(false)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)

  return (
    <div className="min-h-screen bg-clutch-gray-50">
      <NewSidebar selectedParent={selectedParent} setSelectedParent={setSelectedParent} />
      <div
        className={`transition-all duration-300 ${
          selectedParent 
            ? 'ml-80' // 16 + 64 = 80 (collapsed main sidebar + sub-sidebar)
            : sidebarCollapsed 
              ? 'ml-16' 
              : 'ml-64'
        }`}
      >
        <Header 
          onSearchClick={() => setShowSearch(true)}
          onKeyboardShortcutsClick={() => setShowKeyboardShortcuts(true)}
        />
        <main id="main-content" role="main" tabIndex={-1} className="p-6 min-h-screen">
          <div className="max-w-8xl mx-auto">
            <Breadcrumbs />
            <div className="mt-6">
              <EnhancedErrorBoundary>
                <Suspense fallback={<LoadingSpinner />}>
                  {children}
                </Suspense>
              </EnhancedErrorBoundary>
            </div>
          </div>
        </main>
      </div>
      
      {/* Global Search Modal */}
      <GlobalSearch 
        isOpen={showSearch} 
        onClose={() => setShowSearch(false)} 
      />
      
      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal 
        isOpen={showKeyboardShortcuts} 
        onClose={() => setShowKeyboardShortcuts(false)} 
      />
    </div>
  )
}

// Root Layout
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <AuthGuard>
        <DashboardLayout>
          {children}
        </DashboardLayout>
        <Toaster />
      </AuthGuard>
    </NotificationProvider>
  )
}
