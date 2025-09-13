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
  Clock,
  Crown,
  Gem,
  Sparkles
} from 'lucide-react'
import { useAuthStore, useUIStore } from '@/store'
import { useTheme } from 'next-themes'
import { LuxuryButton } from './luxury-button'
import { LuxuryInput } from './luxury-input'
import { toast } from 'sonner'

interface LuxuryHeaderProps {
  onToggleSidebar: () => void
}

export function LuxuryHeader({ onToggleSidebar }: LuxuryHeaderProps) {
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

  // Generate luxury breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs = []
    
    // Add home
    breadcrumbs.push({ label: 'Home', href: '/dashboard', icon: Crown })
    
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
        isLast: index === segments.length - 1,
        icon: Gem
      })
    })
    
    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  // Handle luxury search
  const handleSearch = async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    // Premium search results with luxury styling
    const mockResults = [
      { title: 'Dashboard', href: '/dashboard', type: 'page', icon: Crown, premium: true },
      { title: 'User Analytics', href: '/users/analytics', type: 'page', icon: Gem, premium: false },
      { title: 'Fleet Management', href: '/fleet/overview', type: 'page', icon: Crown, premium: true },
      { title: 'CRM Customers', href: '/crm/customers', type: 'page', icon: Gem, premium: false },
      { title: 'Settings', href: '/settings/system', type: 'page', icon: Settings, premium: false }
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
    toast.success('Logged out successfully', {
      style: {
        background: 'linear-gradient(135deg, #f5a623 0%, #e8941a 100%)',
        color: 'white',
        border: 'none',
      }
    })
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
    <header className="sticky top-0 z-30 bg-gradient-to-r from-white/90 via-white/80 to-white/90 backdrop-blur-xl border-b border-white/20 shadow-2xl">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <LuxuryButton
            variant="glass"
            size="icon-sm"
            onClick={onToggleSidebar}
            className="hover:scale-110 transition-transform duration-300"
          >
            <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </LuxuryButton>
          
          {/* Luxury Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-sm">
            {breadcrumbs.map((breadcrumb, index) => (
              <React.Fragment key={breadcrumb.href}>
                {index > 0 && (
                  <div className="flex items-center">
                    <div className="w-1 h-1 bg-luxury-gold-400 rounded-full mx-2"></div>
                  </div>
                )}
                {index === breadcrumbs.length - 1 ? (
                  <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-luxury-gold-500/10 to-luxury-diamond-500/10 rounded-lg">
                    <breadcrumb.icon className="h-4 w-4 text-luxury-gold-600" />
                    <span className="text-slate-900 font-bold bg-gradient-to-r from-luxury-gold-600 to-luxury-diamond-600 bg-clip-text text-transparent">
                      {breadcrumb.label}
                    </span>
                  </div>
                ) : (
                  <Link
                    href={breadcrumb.href}
                    className="flex items-center gap-2 px-3 py-1 hover:bg-gradient-to-r hover:from-luxury-gold-500/5 hover:to-luxury-diamond-500/5 rounded-lg transition-all duration-300 hover:scale-105"
                  >
                    <breadcrumb.icon className="h-4 w-4 text-luxury-gold-500" />
                    <span className="text-slate-600 hover:text-slate-800 font-medium">
                      {breadcrumb.label}
                    </span>
                  </Link>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Luxury Search */}
          <div className="relative" data-dropdown>
            <LuxuryInput
              type="text"
              placeholder="Search anything..."
              value={searchQuery}
              onChange={handleSearchChange}
              variant="glass"
              effect="glow"
              icon={<Search className="h-4 w-4" />}
              className="w-80"
            />
            
            {/* Luxury Search Results */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="p-2">
                  {searchResults.map((result, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearchResultClick(result.href)}
                      className="w-full px-4 py-3 text-left hover:bg-gradient-to-r hover:from-luxury-gold-500/10 hover:to-luxury-diamond-500/10 transition-all duration-300 rounded-xl group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          result.premium 
                            ? 'bg-gradient-to-br from-luxury-gold-500 to-luxury-diamond-500' 
                            : 'bg-gradient-to-br from-slate-500 to-slate-600'
                        }`}>
                          <result.icon className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-900 group-hover:text-luxury-gold-700 transition-colors">
                              {result.title}
                            </p>
                            {result.premium && (
                              <Crown className="h-3 w-3 text-luxury-gold-500" />
                            )}
                          </div>
                          <p className="text-xs text-slate-500">
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
          <LuxuryButton
            variant="glass"
            size="icon"
            onClick={() => router.push('/help')}
            className="hover:scale-110 transition-transform duration-300"
            title="Help & Support"
          >
            <HelpCircle className="h-5 w-5" />
          </LuxuryButton>

          {/* Chat */}
          <LuxuryButton
            variant="glass"
            size="icon"
            onClick={() => router.push('/chat')}
            className="hover:scale-110 transition-transform duration-300"
            title="Team Chat"
          >
            <MessageSquare className="h-5 w-5" />
          </LuxuryButton>

          {/* Theme Toggle */}
          <LuxuryButton
            variant="glass"
            size="icon"
            onClick={toggleTheme}
            className="hover:scale-110 transition-transform duration-300"
            title={`Switch to ${mounted && theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {mounted ? (
              theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )
            ) : (
              <div className="h-5 w-5 bg-slate-200 rounded animate-pulse" />
            )}
          </LuxuryButton>

          {/* Luxury Notifications */}
          <div className="relative" data-dropdown>
            <LuxuryButton
              variant="glass"
              size="icon"
              onClick={toggleNotifications}
              className="relative hover:scale-110 transition-transform duration-300"
            >
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-luxury-gold-500 to-luxury-diamond-500 rounded-full text-xs text-white flex items-center justify-center font-bold shadow-lg">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </LuxuryButton>
            
            {/* Luxury Notifications Dropdown */}
            {notificationsOpen && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="p-4 border-b border-white/20 bg-gradient-to-r from-luxury-gold-500/10 to-luxury-diamond-500/10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Bell className="h-5 w-5 text-luxury-gold-600" />
                      Notifications
                    </h3>
                    <LuxuryButton
                      variant="glass"
                      size="icon-sm"
                      onClick={() => setNotificationsOpen(false)}
                      className="hover:scale-110 transition-transform duration-300"
                    >
                      <X className="h-4 w-4" />
                    </LuxuryButton>
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-luxury-gold-500/20 to-luxury-diamond-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Bell className="h-8 w-8 text-luxury-gold-500" />
                      </div>
                      <p className="text-slate-600 font-bold">
                        No notifications
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        You're all caught up!
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/20">
                      {notifications.map((notification, index) => (
                        <div key={index} className="p-4 hover:bg-gradient-to-r hover:from-luxury-gold-500/5 hover:to-luxury-diamond-500/5 transition-all duration-300">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              {notification.type === 'success' && <CheckCircle className="h-5 w-5 text-luxury-emerald-500" />}
                              {notification.type === 'warning' && <AlertTriangle className="h-5 w-5 text-luxury-gold-500" />}
                              {notification.type === 'error' && <AlertTriangle className="h-5 w-5 text-luxury-ruby-500" />}
                              {notification.type === 'info' && <Info className="h-5 w-5 text-luxury-diamond-500" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-900">
                                {notification.title}
                              </p>
                              <p className="text-sm text-slate-600 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
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
                  <div className="p-4 border-t border-white/20 bg-gradient-to-r from-luxury-gold-500/5 to-luxury-diamond-500/5">
                    <LuxuryButton 
                      variant="glass" 
                      className="w-full"
                    >
                      Mark all as read
                    </LuxuryButton>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Luxury User Menu */}
          <div className="relative" data-dropdown>
            <LuxuryButton
              variant="glass"
              onClick={toggleUserMenu}
              className="flex items-center space-x-2 hover:scale-105 transition-transform duration-300"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-luxury-gold-500 to-luxury-diamond-500 rounded-xl flex items-center justify-center shadow-lg">
                <User className="h-4 w-4 text-white" />
              </div>
              <ChevronDown className="h-4 w-4" />
            </LuxuryButton>
            
            {/* Luxury User Menu Dropdown */}
            {userMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="p-4 border-b border-white/20 bg-gradient-to-r from-luxury-gold-500/10 to-luxury-diamond-500/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-luxury-gold-500 to-luxury-diamond-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate flex items-center gap-1">
                        {user?.fullName || 'Premium User'}
                        <Crown className="h-3 w-3 text-luxury-gold-500" />
                      </p>
                      <p className="text-xs text-luxury-gold-600 truncate font-medium">
                        {user?.email || 'premium@clutch.com'}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Gem className="h-3 w-3 text-luxury-diamond-500" />
                        <span className="text-xs text-luxury-diamond-600 font-bold">VIP Member</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="py-2">
                  <Link
                    href="/settings/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-gradient-to-r hover:from-luxury-gold-500/10 hover:to-luxury-diamond-500/10 transition-all duration-300"
                  >
                    <User className="h-4 w-4 mr-3 text-luxury-gold-500" />
                    Profile Settings
                  </Link>
                  
                  <Link
                    href="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-gradient-to-r hover:from-luxury-gold-500/10 hover:to-luxury-diamond-500/10 transition-all duration-300"
                  >
                    <Settings className="h-4 w-4 mr-3 text-luxury-gold-500" />
                    Settings
                  </Link>
                  
                  <div className="border-t border-white/20 my-2"></div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 text-sm text-luxury-ruby-600 hover:bg-gradient-to-r hover:from-luxury-ruby-500/10 hover:to-luxury-ruby-600/10 transition-all duration-300"
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