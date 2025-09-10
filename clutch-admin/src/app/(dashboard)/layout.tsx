'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { 
  LayoutDashboard, 
  Users, 
  PoundSterling, 
  ShoppingCart, 
  FolderOpen,
  BarChart3,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  Sun,
  Moon,
  Building2,
  Handshake,
  Megaphone,
  FileText,
  Shield,
  Calendar,
  MessageSquare,
  HelpCircle,
  ChevronUp,
  Activity,
  Smartphone,
  Mail
} from 'lucide-react'
import { useAuthStore, useUIStore } from '@/store'
import { useTheme } from 'next-themes'
// Legacy components removed - using SnowUI components only
import { SnowButton } from '@/components/ui/snow-button'
import { SnowInput } from '@/components/ui/snow-input'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Breadcrumbs from '@/components/layout/breadcrumbs'
import { Toaster } from 'sonner'
import { AuthGuard } from '@/components/auth/auth-guard'

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 p-8 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Something went wrong</h2>
            <p className="text-slate-600 mb-6">
              We encountered an error while loading the page. Please try refreshing.
            </p>
            <SnowButton 
              onClick={() => window.location.reload()} 
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200"
            >
              Refresh Page
            </SnowButton>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Loading Component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="text-center">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-primary mx-auto mb-4"></div>
        <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-primary/60 animate-ping"></div>
      </div>
      <p className="text-slate-600 font-medium">Loading...</p>
    </div>
  </div>
)

// Navigation Items
const navigationItems = [
  {
    title: 'Dashboard',
    href: '/dashboard-consolidated',
    icon: LayoutDashboard,
    badge: null
  },
  {
    title: 'Platform Operations',
    href: '/operations',
    icon: Activity,
    badge: 'NEW',
    children: [
      { title: 'Platform Overview', href: '/operations/platform-overview' },
      { title: 'System Health', href: '/operations/system-health' },
      { title: 'Performance Monitoring', href: '/operations/performance' },
      { title: 'API Analytics', href: '/operations/api-analytics' }
    ]
  },
  {
    title: 'Customer Support',
    href: '/support',
    icon: MessageSquare,
    badge: 'NEW',
    children: [
      { title: 'Support Tickets', href: '/support/tickets' },
      { title: 'Live Chat', href: '/support/live-chat' },
      { title: 'Knowledge Base', href: '/support/knowledge-base' },
      { title: 'Customer Feedback', href: '/support/feedback' }
    ]
  },
  {
    title: 'Mobile Apps',
    href: '/mobile',
    icon: Smartphone,
    badge: 'NEW',
    children: [
      { title: 'App Operations', href: '/mobile/operations' },
      { title: 'App Store Management', href: '/mobile/app-store' },
      { title: 'Push Notifications', href: '/mobile/notifications' },
      { title: 'Feature Flags', href: '/mobile/feature-flags' },
      { title: 'Crash Analytics', href: '/mobile/crashes' }
    ]
  },
  {
    title: 'Content Management',
    href: '/cms',
    icon: FileText,
    badge: 'NEW',
    children: [
      { title: 'Website Content', href: '/cms/website' },
      { title: 'Mobile App Content', href: '/cms/mobile' },
      { title: 'Help Articles', href: '/cms/help' },
      { title: 'Media Library', href: '/cms/media' },
      { title: 'SEO Management', href: '/cms/seo' }
    ]
  },
  {
    title: 'Business Intelligence',
    href: '/business-intelligence',
    icon: BarChart3,
    badge: 'NEW',
    children: []
  },
  {
    title: 'Revenue Analytics',
    href: '/revenue',
    icon: PoundSterling,
    badge: 'NEW',
    children: [
      { title: 'Revenue Overview', href: '/revenue/analytics' },
      { title: 'Revenue Forecasting', href: '/revenue/forecasting' },
      { title: 'Pricing Analytics', href: '/revenue/pricing' },
      { title: 'Subscription Metrics', href: '/revenue/subscriptions' }
    ]
  },
  {
    title: 'User Analytics',
    href: '/users',
    icon: Users,
    badge: 'NEW',
    children: [
      { title: 'User Analytics', href: '/users/analytics' },
      { title: 'User Segmentation', href: '/users/segments' },
      { title: 'User Journey', href: '/users/journey' },
      { title: 'Cohort Analysis', href: '/users/cohorts' }
    ]
  },
  {
    title: 'Monitoring & Alerts',
    href: '/monitoring',
    icon: Shield,
    badge: 'NEW',
    children: [
      { title: 'System Alerts', href: '/monitoring/alerts' },
      { title: 'Performance Metrics', href: '/monitoring/performance' },
      { title: 'Incident Management', href: '/monitoring/incidents' },
      { title: 'Health Dashboard', href: '/monitoring/health' }
    ]
  },
  {
    title: 'B2B Fleet Management',
    href: '/fleet',
    icon: Building2,
    badge: null,
    children: [
      { title: 'Fleet Overview', href: '/fleet/overview' },
      { title: 'Vehicle Tracking', href: '/fleet/tracking' },
      { title: 'Driver Management', href: '/fleet/drivers' },
      { title: 'Maintenance', href: '/fleet/maintenance' },
      { title: 'Route Optimization', href: '/fleet/routes' },
      { title: 'Cost Analytics', href: '/fleet/analytics' }
    ]
  },
  {
    title: 'AI & Machine Learning',
    href: '/ai',
    icon: BarChart3,
    badge: 'AI',
    children: [
      { title: 'AI Dashboard', href: '/ai/dashboard' },
      { title: 'Predictive Analytics', href: '/ai/predictive' },
      { title: 'Recommendations', href: '/ai/recommendations' },
      { title: 'Model Management', href: '/ai/models' },
      { title: 'Fraud Detection', href: '/ai/fraud' }
    ]
  },
  {
    title: 'Enterprise B2B',
    href: '/enterprise',
    icon: Building2,
    badge: 'B2B',
    children: [
      { title: 'Multi-tenant', href: '/enterprise/multi-tenant' },
      { title: 'White-label', href: '/enterprise/white-label' },
      { title: 'API Management', href: '/enterprise/api' },
      { title: 'Corporate Accounts', href: '/enterprise/accounts' },
      { title: 'Webhooks', href: '/enterprise/webhooks' }
    ]
  },
  {
    title: 'HR Management',
    href: '/hr',
    icon: Users,
    badge: null,
    children: [
      { title: 'Employees', href: '/hr/employees' },
      { title: 'Recruitment', href: '/hr/recruitment' },
      { title: 'Payroll', href: '/hr/payroll' },
      { title: 'Performance', href: '/hr/performance' }
    ]
  },
  {
    title: 'Finance',
    href: '/finance',
    icon: PoundSterling,
    badge: null,
    children: [
      { title: 'Invoices', href: '/finance/invoices' },
      { title: 'Expenses', href: '/finance/expenses' },
      { title: 'Payments', href: '/finance/payments' },
      { title: 'Reports', href: '/finance/reports' }
    ]
  },
  {
    title: 'CRM',
    href: '/crm',
    icon: ShoppingCart,
    badge: null,
    children: [
      { title: 'Customers', href: '/crm/customers' },
      { title: 'Deals', href: '/crm/deals' },
      { title: 'Leads', href: '/crm/leads' },
      { title: 'Pipeline', href: '/crm/pipeline' }
    ]
  },
  {
    title: 'Partners',
    href: '/partners',
    icon: Handshake,
    badge: null,
    children: [
      { title: 'Partner Directory', href: '/partners/directory' },
      { title: 'Commission', href: '/partners/commission' },
      { title: 'Performance', href: '/partners/performance' }
    ]
  },
  {
    title: 'Marketing',
    href: '/marketing',
    icon: Megaphone,
    badge: null,
    children: [
      { title: 'Campaigns', href: '/marketing/campaigns' },
      { title: 'Analytics', href: '/marketing/analytics' },
      { title: 'Automation', href: '/marketing/automation' }
    ]
  },
  {
    title: 'Projects',
    href: '/projects',
    icon: FolderOpen,
    badge: null,
    children: [
      { title: 'Project List', href: '/projects/list' },
      { title: 'Tasks', href: '/projects/tasks' },
      { title: 'Time Tracking', href: '/projects/time' }
    ]
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    badge: null,
    children: [
      { title: 'Overview', href: '/analytics/overview' },
      { title: 'Department', href: '/analytics/department' },
      { title: 'Predictive', href: '/analytics/predictive' },
      { title: 'Reports', href: '/analytics/reports' }
    ]
  },
  {
    title: 'Security',
    href: '/security',
    icon: Shield,
    badge: 'SEC',
    children: [
      { title: '2FA Management', href: '/security/2fa' },
      { title: 'Biometric Auth', href: '/security/biometric' },
      { title: 'Audit Logs', href: '/security/audit' },
      { title: 'Session Management', href: '/security/sessions' },
      { title: 'Compliance', href: '/security/compliance' }
    ]
  },
  {
    title: 'Legal & Compliance',
    href: '/legal',
    icon: Shield,
    badge: null,
    children: [
      { title: 'Contracts', href: '/legal/contracts' },
      { title: 'Compliance', href: '/legal/compliance' },
      { title: 'Documents', href: '/legal/documents' }
    ]
  },
  {
    title: 'Team Chat',
    href: '/chat',
    icon: MessageSquare,
    badge: 'NEW',
    children: []
  },
  {
    title: 'Email',
    href: '/email',
    icon: Mail,
    badge: 'NEW',
    children: [
      { title: 'Email Client', href: '/email' },
      { title: 'Management', href: '/email/management' }
    ]
  },
  {
    title: 'Communication',
    href: '/communication',
    icon: MessageSquare,
    badge: null,
    children: [
      { title: 'Messages', href: '/communication/messages' },
      { title: 'Announcements', href: '/communication/announcements' },
      { title: 'Meetings', href: '/communication/meetings' }
    ]
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    badge: null,
    children: [
      { title: 'Profile', href: '/settings/profile' },
      { title: 'System', href: '/settings/system' }
    ]
  }
]

// Sidebar Component
const Sidebar = ({ 
  selectedParent, 
  setSelectedParent 
}: { 
  selectedParent: string | null; 
  setSelectedParent: (value: string | null) => void; 
}) => {
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const { user, logout } = useAuthStore()
  const pathname = usePathname()
  const router = useRouter()


  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const handleCategoryClick = (item: typeof navigationItems[0], event: React.MouseEvent) => {
    if (item.children && item.children.length > 0) {
      // Always use sub-sidebar approach, regardless of sidebar state
      setSelectedParent(selectedParent === item.href ? null : item.href)
    } else {
      router.push(item.href)
    }
  }



  return (
    <>
             <div
         className={`fixed left-0 top-0 z-40 h-screen bg-white border-r border-border shadow-sm transition-all duration-300 ${
           selectedParent ? 'w-16' : (sidebarCollapsed ? 'w-16' : 'w-64')
         }`}
       >
        <nav className="flex-1 overflow-y-auto py-4 mt-16">
          <div className="space-y-1 px-3">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              const hasChildren = item.children && item.children.length > 0
              const isSelected = selectedParent === item.href

              return (
                <div key={item.href}>
                  <SnowButton
                    onClick={(e) => handleCategoryClick(item, e)}
                    className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all group ${
                      isActive || isSelected
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-slate-800 hover:bg-slate-50 hover:text-slate-900'}`}
                  >
                    <item.icon className={`h-5 w-5 mr-3 flex-shrink-0 transition-colors ${
                      isActive || isSelected ? 'text-white' : 'text-slate-700 group-hover:text-slate-800'}`} />
                    {!sidebarCollapsed && !selectedParent && (
                      <>
                        <span className="flex-1 text-left">{item.title}</span>
                        {hasChildren && (
                          <ChevronDown 
                            className={`h-4 w-4 transition-transform duration-200 ${
                              isSelected ? 'rotate-180' : ''
                            }`} 
                          />
                        )}
                        {item.badge && (
                          <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            item.badge === 'NEW' ? 'bg-emerald-100 text-emerald-700' :
                            item.badge === 'AI' ? 'bg-purple-100 text-purple-700' :
                            item.badge === 'B2B' ? 'bg-blue-100 text-blue-700' :
                            item.badge === 'SEC' ? 'bg-orange-100 text-orange-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </SnowButton>
                </div>
              )
            })}
          </div>
        </nav>
        {!sidebarCollapsed && !selectedParent && (
          <div className="border-t border-border p-4 bg-slate-100/50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.fullName || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      {selectedParent && (
        <div className="fixed left-16 top-0 z-30 h-screen w-64 bg-white border-r border-border shadow-sm transition-all duration-300">
          <div className="flex h-full flex-col">
            <div className="border-b border-border p-4 mt-16 bg-slate-100/50">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  {navigationItems.find(item => item.href === selectedParent)?.title}
                </h3>
                <SnowButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedParent(null)}
                  className="h-7 w-7 p-0 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </SnowButton>
              </div>
            </div>
            <nav className="flex-1 overflow-y-auto py-4">
              <div className="space-y-1 px-3">
                {navigationItems.find(item => item.href === selectedParent)?.children?.map((child) => {
                  const isChildActive = pathname === child.href
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`block w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                        isChildActive
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-slate-800 hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                      {child.title}
                    </Link>
                  )
                })}
              </div>
            </nav>
          </div>
        </div>
      )}


    </>
  )
}

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
      <div id="notifications-popup" role="dialog" aria-modal="true" aria-label="Notifications" className="fixed top-20 right-6 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 animate-in slide-in-from-top">
                  <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Notifications</h3>
              <SnowButton variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 hover:bg-slate-50">
              <X className="h-4 w-4" />
            </SnowButton>
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="h-6 w-6 text-slate-600" />
              </div>
              <p className="text-slate-600 font-medium">No notifications</p>
              <p className="text-sm text-slate-600 mt-1">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((notification, index) => (
                <div key={index} className="p-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">
                        {notification.title}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-slate-600 mt-2">
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
          <div className="p-4 border-t border-slate-200">
            <SnowButton 
              variant="outline" 
              className="w-full bg-white border-slate-200 text-slate-700 hover:bg-slate-50" 
              onClick={onClose}
            >
              Mark all as read
            </SnowButton>
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
      <div id="user-menu-dropdown" role="menu" aria-label="User menu" className="fixed top-20 right-6 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 animate-in slide-in-from-top">
                  <div className="p-6 border-b border-slate-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
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
              <p className="text-sm font-semibold text-slate-900 truncate">
                {user?.fullName || 'User'}
              </p>
              <p className="text-xs text-slate-600 truncate">
                {user?.email || 'user@example.com'}
              </p>
              <p className="text-xs text-slate-600">
                {user?.jobTitle || 'Employee'}
              </p>
            </div>
          </div>
        </div>
        <div className="py-2">
          <Link href="/settings/profile" onClick={onClose}>
            <div className="flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-50/50 transition-colors">
              <User className="h-4 w-4 mr-3 text-slate-600" />
              Account Settings
            </div>
          </Link>
          
          <Link href="/settings" onClick={onClose}>
            <div className="flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-50/50 transition-colors">
              <Settings className="h-4 w-4 mr-3 text-slate-600" />
              Settings
            </div>
          </Link>
          
          <div className="border-t border-slate-200 my-2"></div>
          
          <SnowButton
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Logout
          </SnowButton>
        </div>
      </div>
    </>
  )
}

// Header Component
const Header = () => {
  const { sidebarCollapsed, toggleSidebar, notifications } = useUIStore()
  const { user } = useAuthStore()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  // Ensure theme is mounted before rendering
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    if (mounted) {
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
    }
  }

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen)
    setUserMenuOpen(false) // Close user menu if open
  }

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen)
    setNotificationsOpen(false) // Close notifications if open
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to search results page or implement search functionality
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  // Don't render logo until theme is mounted to prevent hydration mismatch
  const currentTheme = mounted ? resolvedTheme : 'light'

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-border shadow-sm">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-6">
          <SnowButton
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="h-9 w-9 p-0 hover:bg-slate-50 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-4 w-4" />
          </SnowButton>
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 flex items-center justify-center">
              {currentTheme === 'dark' ? (
                <Image src="/LogoWhite.svg" alt="Clutch Logo" width={32} height={32} priority />
              ) : (
                <Image src="/Logo Red.svg" alt="Clutch Logo" width={32} height={32} priority />
              )}
            </div>
            <span className="text-xl font-bold text-foreground">Clutch Admin</span>
          </Link>
          <div className="hidden md:flex items-center space-x-3">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <SnowInput
                placeholder="Search anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-80 h-9 bg-slate-100 border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            </form>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <SnowButton
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard/chat')}
            className="h-9 px-3 border-slate-200 hover:bg-slate-50 transition-colors"
            aria-label="Team Chat"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Chat</span>
          </SnowButton>
          <SnowButton
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="h-9 w-9 p-0 hover:bg-slate-50 transition-colors"
            aria-label="Toggle theme"
          >
            {currentTheme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </SnowButton>
          <SnowButton
            variant="ghost"
            size="sm"
            onClick={toggleNotifications}
            className="h-9 w-9 p-0 relative hover:bg-slate-50 transition-colors"
            aria-label="Notifications"
            aria-haspopup="dialog"
            aria-expanded={notificationsOpen}
            aria-controls="notifications-popup"
          >
            <Bell className="h-4 w-4" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full text-xs text-white flex items-center justify-center font-medium">
                {notifications.length > 9 ? '9+' : notifications.length}
              </span>
            )}
          </SnowButton>
          <SnowButton
            variant="ghost"
            size="sm"
            onClick={toggleUserMenu}
            className="h-9 w-9 p-0 hover:bg-slate-50 transition-colors"
            aria-label="User menu"
            aria-haspopup="menu"
            aria-expanded={userMenuOpen}
            aria-controls="user-menu-dropdown"
          >
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <User className="h-3 w-3 text-white" />
            </div>
          </SnowButton>
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

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar selectedParent={selectedParent} setSelectedParent={setSelectedParent} />
      <div
        className={`transition-all duration-300 ${
          selectedParent 
            ? 'ml-80' // 16 + 64 = 80 (collapsed main sidebar + sub-sidebar)
            : sidebarCollapsed 
              ? 'ml-16' 
              : 'ml-64'
        }`}
      >
        <Header />
        <main id="main-content" role="main" tabIndex={-1} className="p-6 min-h-screen">
          <div className="max-w-8xl mx-auto">
            <Breadcrumbs />
            <div className="mt-6">
              <ErrorBoundary>
                <Suspense fallback={<LoadingSpinner />}>
                  {children}
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

// Root Layout
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <DashboardLayout>
        {children}
      </DashboardLayout>
      <Toaster />
    </AuthGuard>
  )
}


