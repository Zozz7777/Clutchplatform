'use client'

import React, { useEffect, useState } from 'react'
import { AppProviders } from '@/providers/app-providers'
import { setupApp } from '@/lib/integration-utils'
import { SmartNavigationBar } from '@/components/navigation/smart-navigation'
import { SmartSidebar } from '@/components/navigation/smart-navigation'
import { SmartBreadcrumbs } from '@/components/navigation/smart-navigation'
import { SmartQuickActions } from '@/components/navigation/smart-navigation'
import { useApp } from '@/hooks/use-app'
import { 
  LayoutDashboard, 
  Users, 
  PoundSterling, 
  ShoppingCart, 
  Building2,
  BarChart3,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  User,
  LogOut,
  Sun,
  Moon,
  Activity,
  MessageSquare,
  Shield,
  Handshake,
  Megaphone,
  FileText,
  Calendar,
  HelpCircle,
  Smartphone,
  Mail
} from 'lucide-react'
import { useAuthStore, useUIStore } from '@/store'
import { useTheme } from 'next-themes'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowInput } from '@/components/ui/snow-input'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Toaster } from 'sonner'
import { AuthGuard } from '@/components/auth/auth-guard'

// Initialize app systems
if (typeof window !== 'undefined') {
  setupApp()
}

// Navigation Items
const navigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    path: '/dashboard-consolidated'
  },
  {
    id: 'operations',
    label: 'Platform Operations',
    icon: <Activity className="w-5 h-5" />,
    path: '/operations',
    children: [
      { id: 'platform-overview', label: 'Platform Overview', path: '/operations/platform-overview' },
      { id: 'system-health', label: 'System Health', path: '/operations/system-health' },
      { id: 'performance', label: 'Performance Monitoring', path: '/operations/performance' },
      { id: 'api-analytics', label: 'API Analytics', path: '/operations/api-analytics' }
    ]
  },
  {
    id: 'support',
    label: 'Customer Support',
    icon: <MessageSquare className="w-5 h-5" />,
    path: '/support',
    children: [
      { id: 'tickets', label: 'Support Tickets', path: '/support/tickets' },
      { id: 'live-chat', label: 'Live Chat', path: '/support/live-chat' },
      { id: 'knowledge-base', label: 'Knowledge Base', path: '/support/knowledge-base' },
      { id: 'feedback', label: 'Customer Feedback', path: '/support/feedback' }
    ]
  },
  {
    id: 'mobile',
    label: 'Mobile Apps',
    icon: <Smartphone className="w-5 h-5" />,
    path: '/mobile',
    children: [
      { id: 'app-operations', label: 'App Operations', path: '/mobile/operations' },
      { id: 'app-store', label: 'App Store Management', path: '/mobile/app-store' },
      { id: 'notifications', label: 'Push Notifications', path: '/mobile/notifications' },
      { id: 'feature-flags', label: 'Feature Flags', path: '/mobile/feature-flags' },
      { id: 'crashes', label: 'Crash Analytics', path: '/mobile/crashes' }
    ]
  },
  {
    id: 'cms',
    label: 'Content Management',
    icon: <FileText className="w-5 h-5" />,
    path: '/cms',
    children: [
      { id: 'website', label: 'Website Content', path: '/cms/website' },
      { id: 'mobile-content', label: 'Mobile App Content', path: '/cms/mobile' },
      { id: 'help', label: 'Help Articles', path: '/cms/help' },
      { id: 'media', label: 'Media Library', path: '/cms/media' },
      { id: 'seo', label: 'SEO Management', path: '/cms/seo' }
    ]
  },
  {
    id: 'business-intelligence',
    label: 'Business Intelligence',
    icon: <BarChart3 className="w-5 h-5" />,
    path: '/business-intelligence'
  },
  {
    id: 'revenue',
    label: 'Revenue Analytics',
    icon: <PoundSterling className="w-5 h-5" />,
    path: '/revenue',
    children: [
      { id: 'analytics', label: 'Revenue Overview', path: '/revenue/analytics' },
      { id: 'forecasting', label: 'Revenue Forecasting', path: '/revenue/forecasting' },
      { id: 'pricing', label: 'Pricing Analytics', path: '/revenue/pricing' },
      { id: 'subscriptions', label: 'Subscription Metrics', path: '/revenue/subscriptions' }
    ]
  },
  {
    id: 'users',
    label: 'User Analytics',
    icon: <Users className="w-5 h-5" />,
    path: '/users',
    children: [
      { id: 'user-analytics', label: 'User Analytics', path: '/users/analytics' },
      { id: 'segments', label: 'User Segmentation', path: '/users/segments' },
      { id: 'journey', label: 'User Journey', path: '/users/journey' },
      { id: 'cohorts', label: 'Cohort Analysis', path: '/users/cohorts' }
    ]
  },
  {
    id: 'monitoring',
    label: 'Monitoring & Alerts',
    icon: <Shield className="w-5 h-5" />,
    path: '/monitoring',
    children: [
      { id: 'alerts', label: 'System Alerts', path: '/monitoring/alerts' },
      { id: 'performance', label: 'Performance Metrics', path: '/monitoring/performance' },
      { id: 'incidents', label: 'Incident Management', path: '/monitoring/incidents' },
      { id: 'health', label: 'Health Dashboard', path: '/monitoring/health' }
    ]
  },
  {
    id: 'fleet',
    label: 'B2B Fleet Management',
    icon: <Building2 className="w-5 h-5" />,
    path: '/fleet',
    children: [
      { id: 'overview', label: 'Fleet Overview', path: '/fleet/overview' },
      { id: 'tracking', label: 'Vehicle Tracking', path: '/fleet/tracking' },
      { id: 'drivers', label: 'Driver Management', path: '/fleet/drivers' },
      { id: 'maintenance', label: 'Maintenance', path: '/fleet/maintenance' },
      { id: 'routes', label: 'Route Optimization', path: '/fleet/routes' },
      { id: 'analytics', label: 'Cost Analytics', path: '/fleet/analytics' }
    ]
  },
  {
    id: 'ai',
    label: 'AI & Machine Learning',
    icon: <BarChart3 className="w-5 h-5" />,
    path: '/ai',
    children: [
      { id: 'ai-dashboard', label: 'AI Dashboard', path: '/ai/dashboard' },
      { id: 'predictive', label: 'Predictive Analytics', path: '/ai/predictive' },
      { id: 'recommendations', label: 'Recommendations', path: '/ai/recommendations' },
      { id: 'models', label: 'Model Management', path: '/ai/models' },
      { id: 'fraud', label: 'Fraud Detection', path: '/ai/fraud' }
    ]
  },
  {
    id: 'enterprise',
    label: 'Enterprise B2B',
    icon: <Building2 className="w-5 h-5" />,
    path: '/enterprise',
    children: [
      { id: 'multi-tenant', label: 'Multi-tenant', path: '/enterprise/multi-tenant' },
      { id: 'white-label', label: 'White-label', path: '/enterprise/white-label' },
      { id: 'api', label: 'API Management', path: '/enterprise/api' },
      { id: 'accounts', label: 'Corporate Accounts', path: '/enterprise/accounts' },
      { id: 'webhooks', label: 'Webhooks', path: '/enterprise/webhooks' }
    ]
  },
  {
    id: 'hr',
    label: 'HR Management',
    icon: <Users className="w-5 h-5" />,
    path: '/hr',
    children: [
      { id: 'employees', label: 'Employees', path: '/hr/employees' },
      { id: 'recruitment', label: 'Recruitment', path: '/hr/recruitment' },
      { id: 'payroll', label: 'Payroll', path: '/hr/payroll' },
      { id: 'performance', label: 'Performance', path: '/hr/performance' }
    ]
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: <PoundSterling className="w-5 h-5" />,
    path: '/finance',
    children: [
      { id: 'invoices', label: 'Invoices', path: '/finance/invoices' },
      { id: 'expenses', label: 'Expenses', path: '/finance/expenses' },
      { id: 'payments', label: 'Payments', path: '/finance/payments' },
      { id: 'reports', label: 'Reports', path: '/finance/reports' }
    ]
  },
  {
    id: 'crm',
    label: 'CRM',
    icon: <ShoppingCart className="w-5 h-5" />,
    path: '/crm',
    children: [
      { id: 'customers', label: 'Customers', path: '/crm/customers' },
      { id: 'deals', label: 'Deals', path: '/crm/deals' },
      { id: 'leads', label: 'Leads', path: '/crm/leads' },
      { id: 'pipeline', label: 'Pipeline', path: '/crm/pipeline' }
    ]
  },
  {
    id: 'partners',
    label: 'Partners',
    icon: <Handshake className="w-5 h-5" />,
    path: '/partners',
    children: [
      { id: 'directory', label: 'Partner Directory', path: '/partners/directory' },
      { id: 'commission', label: 'Commission', path: '/partners/commission' },
      { id: 'performance', label: 'Performance', path: '/partners/performance' }
    ]
  },
  {
    id: 'marketing',
    label: 'Marketing',
    icon: <Megaphone className="w-5 h-5" />,
    path: '/marketing',
    children: [
      { id: 'campaigns', label: 'Campaigns', path: '/marketing/campaigns' },
      { id: 'analytics', label: 'Analytics', path: '/marketing/analytics' },
      { id: 'automation', label: 'Automation', path: '/marketing/automation' }
    ]
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <BarChart3 className="w-5 h-5" />,
    path: '/analytics',
    children: [
      { id: 'overview', label: 'Overview', path: '/analytics/overview' },
      { id: 'department', label: 'Department', path: '/analytics/department' },
      { id: 'predictive', label: 'Predictive', path: '/analytics/predictive' },
      { id: 'reports', label: 'Reports', path: '/analytics/reports' }
    ]
  },
  {
    id: 'security',
    label: 'Security',
    icon: <Shield className="w-5 h-5" />,
    path: '/security',
    children: [
      { id: '2fa', label: '2FA Management', path: '/security/2fa' },
      { id: 'biometric', label: 'Biometric Auth', path: '/security/biometric' },
      { id: 'audit', label: 'Audit Logs', path: '/security/audit' },
      { id: 'sessions', label: 'Session Management', path: '/security/sessions' },
      { id: 'compliance', label: 'Compliance', path: '/security/compliance' }
    ]
  },
  {
    id: 'legal',
    label: 'Legal & Compliance',
    icon: <Shield className="w-5 h-5" />,
    path: '/legal',
    children: [
      { id: 'contracts', label: 'Contracts', path: '/legal/contracts' },
      { id: 'compliance', label: 'Compliance', path: '/legal/compliance' },
      { id: 'documents', label: 'Documents', path: '/legal/documents' }
    ]
  },
  {
    id: 'chat',
    label: 'Team Chat',
    icon: <MessageSquare className="w-5 h-5" />,
    path: '/chat'
  },
  {
    id: 'email',
    label: 'Email',
    icon: <Mail className="w-5 h-5" />,
    path: '/email',
    children: [
      { id: 'email-client', label: 'Email Client', path: '/email' },
      { id: 'management', label: 'Management', path: '/email/management' }
    ]
  },
  {
    id: 'communication',
    label: 'Communication',
    icon: <MessageSquare className="w-5 h-5" />,
    path: '/communication',
    children: [
      { id: 'messages', label: 'Messages', path: '/communication/messages' },
      { id: 'announcements', label: 'Announcements', path: '/communication/announcements' },
      { id: 'meetings', label: 'Meetings', path: '/communication/meetings' }
    ]
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings className="w-5 h-5" />,
    path: '/settings',
    children: [
      { id: 'profile', label: 'Profile', path: '/settings/profile' },
      { id: 'system', label: 'System', path: '/settings/system' }
    ]
  }
]

// Enhanced Layout Component
export default function EnhancedLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore()
  const { sidebarCollapsed, toggleSidebar, notifications } = useUIStore()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const pathname = usePathname()

  // App hooks
  const { responsive, navigation, analytics, performance } = useApp()

  // Ensure theme is mounted before rendering
  useEffect(() => {
    setMounted(true)
  }, [])

  // Track page view
  useEffect(() => {
    navigation.trackNavigation(pathname)
    analytics.trackEvent('page_view', { 
      page: pathname, 
      title: document.title 
    })
  }, [pathname, navigation, analytics])

  const toggleTheme = () => {
    if (mounted) {
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      analytics.trackEvent('search', { query: searchQuery.trim() })
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const handleLogout = async () => {
    analytics.trackEvent('logout')
    await logout()
    router.push('/login')
  }

  // Quick actions
  const quickActions = [
    {
      id: 'new-ticket',
      label: 'New Ticket',
      icon: <MessageSquare className="w-4 h-4" />,
      onClick: () => router.push('/support/tickets/new')
    },
    {
      id: 'new-user',
      label: 'Add User',
      icon: <Users className="w-4 h-4" />,
      onClick: () => router.push('/hr/employees/new')
    },
    {
      id: 'new-project',
      label: 'New Project',
      icon: <FileText className="w-4 h-4" />,
      onClick: () => router.push('/projects/new')
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="w-4 h-4" />,
      onClick: () => router.push('/analytics')
    }
  ]

  // Don't render logo until theme is mounted to prevent hydration mismatch
  const currentTheme = mounted ? resolvedTheme : 'light'

  return (
    <AppProviders>
      <div className="min-h-screen bg-gray-50">
        <SmartNavigationBar
          logo={
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">Clutch Admin</span>
            </div>
          }
          userMenu={
            <div className="flex items-center space-x-4">
              <SmartQuickActions actions={quickActions} maxItems={2} />
              <SnowButton
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="h-9 w-9 p-0 hover:bg-gray-100 transition-colors"
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
                className="h-9 w-9 p-0 relative hover:bg-gray-100 transition-colors"
                aria-label="Notifications"
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
                className="h-9 w-9 p-0 hover:bg-gray-100 transition-colors"
                aria-label="User menu"
              >
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <User className="h-3 w-3 text-white" />
                </div>
              </SnowButton>
            </div>
          }
          searchEnabled={true}
          suggestionsEnabled={true}
          breadcrumbsEnabled={true}
        />

        <div className="flex">
          <SmartSidebar
            items={navigationItems}
            isOpen={!sidebarCollapsed}
            onToggle={toggleSidebar}
            showSuggestions={true}
            showRecent={true}
          />
          <main className="flex-1 p-6">
            <SmartBreadcrumbs className="mb-6" />
            {children}
          </main>
        </div>
        {notificationsOpen && (
          <div className="fixed inset-0 bg-black/20 z-50 backdrop-blur-sm" onClick={() => setNotificationsOpen(false)}>
            <div className="fixed top-20 right-6 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                  <SnowButton variant="ghost" size="sm" onClick={() => setNotificationsOpen(false)} className="h-8 w-8 p-0">
                    <X className="h-4 w-4" />
                  </SnowButton>
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bell className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium">No notifications</p>
                    <p className="text-sm text-gray-500 mt-1">You're all caught up!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification, index) => (
                      <div key={index} className="p-4 hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {notification.timestamp}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {userMenuOpen && (
          <div className="fixed inset-0 bg-black/20 z-50 backdrop-blur-sm" onClick={() => setUserMenuOpen(false)}>
            <div className="fixed top-20 right-6 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user?.fullName || 'User'}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {user?.email || 'user@example.com'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.jobTitle || 'Employee'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="py-2">
                <Link href="/settings/profile" onClick={() => setUserMenuOpen(false)}>
                  <div className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50/50 transition-colors">
                    <User className="h-4 w-4 mr-3 text-gray-600" />
                    Account Settings
                  </div>
                </Link>
                
                <Link href="/settings" onClick={() => setUserMenuOpen(false)}>
                  <div className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50/50 transition-colors">
                    <Settings className="h-4 w-4 mr-3 text-gray-600" />
                    Settings
                  </div>
                </Link>
                
                <div className="border-t border-gray-200 my-2"></div>
                
                <SnowButton
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Logout
                </SnowButton>
              </div>
            </div>
          </div>
        )}

        <Toaster />
      </div>
    </AppProviders>
  )
}
