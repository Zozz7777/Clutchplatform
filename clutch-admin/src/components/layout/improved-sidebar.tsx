'use client'

import React, { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore, useUIStore } from '@/store'
import { SnowButton } from '@/components/ui/snow-button'
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
  Mail,
  Brain,
  Zap
} from 'lucide-react'

interface ImprovedSidebarProps {
  selectedParent: string | null
  setSelectedParent: (value: string | null) => void
  sidebarCollapsed: boolean
  onToggleSidebar: () => void
}

export function ImprovedSidebar({ 
  selectedParent, 
  setSelectedParent,
  sidebarCollapsed,
  onToggleSidebar
}: ImprovedSidebarProps) {
  const { user, logout } = useAuthStore()
  const pathname = usePathname()
  const router = useRouter()
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['core', 'operations']))

  // Navigation items with improved organization
  const navigationItems = [
    // Core Dashboard
    {
      title: 'Dashboard',
      href: '/dashboard-consolidated',
      icon: LayoutDashboard,
      badge: null,
      category: 'core'
    },
    {
      title: 'Autonomous Dashboard',
      href: '/autonomous-dashboard',
      icon: Brain,
      badge: 'AI',
      description: 'Self-healing, AI-powered analytics',
      category: 'core'
    },

    // Operations & Monitoring
    {
      title: 'Operations',
      href: '/operations',
      icon: Activity,
      badge: null,
      category: 'operations',
      children: [
        { title: 'Platform Overview', href: '/operations/platform-overview' },
        { title: 'System Health', href: '/operations/system-health' },
        { title: 'Performance Monitoring', href: '/operations/performance' },
        { title: 'API Analytics', href: '/operations/api-analytics' }
      ]
    },
    {
      title: 'Monitoring',
      href: '/monitoring',
      icon: Shield,
      badge: null,
      category: 'operations',
      children: [
        { title: 'System Alerts', href: '/monitoring/alerts' },
        { title: 'Performance Metrics', href: '/monitoring/performance' },
        { title: 'Incident Management', href: '/monitoring/incidents' },
        { title: 'Health Dashboard', href: '/monitoring/health' }
      ]
    },

    // Business Intelligence & Analytics
    {
      title: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      badge: null,
      category: 'analytics',
      children: [
        { title: 'Overview', href: '/analytics/overview' },
        { title: 'Department', href: '/analytics/department' },
        { title: 'Predictive', href: '/analytics/predictive' },
        { title: 'Reports', href: '/analytics/reports' }
      ]
    },
    {
      title: 'Business Intelligence',
      href: '/business-intelligence',
      icon: BarChart3,
      badge: 'NEW',
      category: 'analytics',
      children: []
    },
    {
      title: 'Revenue Analytics',
      href: '/revenue',
      icon: PoundSterling,
      badge: null,
      category: 'analytics',
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
      badge: null,
      category: 'analytics',
      children: [
        { title: 'User Analytics', href: '/users/analytics' },
        { title: 'User Segmentation', href: '/users/segments' },
        { title: 'User Journey', href: '/users/journey' },
        { title: 'Cohort Analysis', href: '/users/cohorts' }
      ]
    },

    // Customer Management
    {
      title: 'CRM',
      href: '/crm',
      icon: ShoppingCart,
      badge: null,
      category: 'customers',
      children: [
        { title: 'Customers', href: '/crm/customers' },
        { title: 'Deals', href: '/crm/deals' },
        { title: 'Leads', href: '/crm/leads' },
        { title: 'Pipeline', href: '/crm/pipeline' }
      ]
    },
    {
      title: 'Support',
      href: '/support',
      icon: MessageSquare,
      badge: null,
      category: 'customers',
      children: [
        { title: 'Support Tickets', href: '/support/tickets' },
        { title: 'Live Chat', href: '/support/live-chat' },
        { title: 'Knowledge Base', href: '/support/knowledge-base' },
        { title: 'Customer Feedback', href: '/support/feedback' }
      ]
    },

    // Fleet & Operations
    {
      title: 'Fleet Management',
      href: '/fleet',
      icon: Building2,
      badge: null,
      category: 'fleet',
      children: [
        { title: 'Fleet Overview', href: '/fleet/overview' },
        { title: 'Vehicle Tracking', href: '/fleet/tracking' },
        { title: 'Driver Management', href: '/fleet/drivers' },
        { title: 'Maintenance', href: '/fleet/maintenance' },
        { title: 'Route Optimization', href: '/fleet/routes' },
        { title: 'Cost Analytics', href: '/fleet/analytics' }
      ]
    },

    // AI & Technology
    {
      title: 'AI & ML',
      href: '/ai',
      icon: Brain,
      badge: 'AI',
      category: 'technology',
      children: [
        { title: 'AI Dashboard', href: '/ai/dashboard' },
        { title: 'Predictive Analytics', href: '/ai/predictive' },
        { title: 'Recommendations', href: '/ai/recommendations' },
        { title: 'Model Management', href: '/ai/models' },
        { title: 'Fraud Detection', href: '/ai/fraud' }
      ]
    },
    {
      title: 'Mobile Apps',
      href: '/mobile',
      icon: Smartphone,
      badge: null,
      category: 'technology',
      children: [
        { title: 'App Operations', href: '/mobile/operations' },
        { title: 'App Store Management', href: '/mobile/app-store' },
        { title: 'Push Notifications', href: '/mobile/notifications' },
        { title: 'Feature Flags', href: '/mobile/feature-flags' },
        { title: 'Crash Analytics', href: '/mobile/crashes' }
      ]
    },

    // Business Operations
    {
      title: 'Finance',
      href: '/finance',
      icon: PoundSterling,
      badge: null,
      category: 'business',
      children: [
        { title: 'Invoices', href: '/finance/invoices' },
        { title: 'Expenses', href: '/finance/expenses' },
        { title: 'Payments', href: '/finance/payments' },
        { title: 'Reports', href: '/finance/reports' }
      ]
    },
    {
      title: 'HR Management',
      href: '/hr',
      icon: Users,
      badge: null,
      category: 'business',
      children: [
        { title: 'Employees', href: '/hr/employees' },
        { title: 'Recruitment', href: '/hr/recruitment' },
        { title: 'Payroll', href: '/hr/payroll' },
        { title: 'Performance', href: '/hr/performance' }
      ]
    },
    {
      title: 'Partners',
      href: '/partners',
      icon: Handshake,
      badge: null,
      category: 'business',
      children: [
        { title: 'Partner Directory', href: '/partners/directory' },
        { title: 'Commission', href: '/partners/commission' },
        { title: 'Performance', href: '/partners/performance' }
      ]
    },

    // Marketing & Content
    {
      title: 'Marketing',
      href: '/marketing',
      icon: Megaphone,
      badge: null,
      category: 'marketing',
      children: [
        { title: 'Campaigns', href: '/marketing/campaigns' },
        { title: 'Analytics', href: '/marketing/analytics' },
        { title: 'Automation', href: '/marketing/automation' }
      ]
    },
    {
      title: 'Content Management',
      href: '/cms',
      icon: FileText,
      badge: null,
      category: 'marketing',
      children: [
        { title: 'Website Content', href: '/cms/website' },
        { title: 'Mobile App Content', href: '/cms/mobile' },
        { title: 'Help Articles', href: '/cms/help' },
        { title: 'Media Library', href: '/cms/media' },
        { title: 'SEO Management', href: '/cms/seo' }
      ]
    },

    // Enterprise & Security
    {
      title: 'Enterprise',
      href: '/enterprise',
      icon: Building2,
      badge: 'B2B',
      category: 'enterprise',
      children: [
        { title: 'Multi-tenant', href: '/enterprise/multi-tenant' },
        { title: 'White-label', href: '/enterprise/white-label' },
        { title: 'API Management', href: '/enterprise/api' },
        { title: 'Corporate Accounts', href: '/enterprise/accounts' },
        { title: 'Webhooks', href: '/enterprise/webhooks' }
      ]
    },
    {
      title: 'Security',
      href: '/security',
      icon: Shield,
      badge: 'SEC',
      category: 'enterprise',
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
      category: 'enterprise',
      children: [
        { title: 'Contracts', href: '/legal/contracts' },
        { title: 'Compliance', href: '/legal/compliance' },
        { title: 'Documents', href: '/legal/documents' }
      ]
    },

    // Communication & Collaboration
    {
      title: 'Team Chat',
      href: '/chat',
      icon: MessageSquare,
      badge: 'NEW',
      category: 'communication',
      children: []
    },
    {
      title: 'Email',
      href: '/email',
      icon: Mail,
      badge: null,
      category: 'communication',
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
      category: 'communication',
      children: [
        { title: 'Messages', href: '/communication/messages' },
        { title: 'Announcements', href: '/communication/announcements' },
        { title: 'Meetings', href: '/communication/meetings' }
      ]
    },

    // Project Management
    {
      title: 'Projects',
      href: '/projects',
      icon: FolderOpen,
      badge: null,
      category: 'projects',
      children: [
        { title: 'Project List', href: '/projects/list' },
        { title: 'Tasks', href: '/projects/tasks' },
        { title: 'Time Tracking', href: '/projects/time' }
      ]
    },

    // Settings
    {
      title: 'Settings',
      href: '/settings',
      icon: Settings,
      badge: null,
      category: 'settings',
      children: [
        { title: 'Profile', href: '/settings/profile' },
        { title: 'System', href: '/settings/system' }
      ]
    }
  ]

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

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  // Group items by category
  const groupedItems = navigationItems.reduce((acc, item) => {
    const category = item.category || 'other'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(item)
    return acc
  }, {} as Record<string, typeof navigationItems>)

  const categoryLabels = {
    core: 'Core',
    operations: 'Operations',
    analytics: 'Analytics',
    customers: 'Customers',
    fleet: 'Fleet',
    technology: 'Technology',
    business: 'Business',
    marketing: 'Marketing',
    enterprise: 'Enterprise',
    communication: 'Communication',
    projects: 'Projects',
    settings: 'Settings'
  }

  return (
    <>
      {/* Main Sidebar */}
      <div
        className={`fixed left-0 top-0 z-40 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-300 ${
          selectedParent ? 'w-16' : (sidebarCollapsed ? 'w-16' : 'w-64')
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700">
          {!sidebarCollapsed && !selectedParent && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-clutch-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-lg font-semibold text-slate-900 dark:text-white">
                Clutch
              </span>
            </div>
          )}
          <button
            onClick={onToggleSidebar}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 mt-16">
          <div className="space-y-2 px-3">
            {Object.entries(groupedItems).map(([category, items]) => {
              const isExpanded = expandedCategories.has(category)
              const categoryLabel = categoryLabels[category as keyof typeof categoryLabels] || category

              return (
                <div key={category} className="space-y-1">
                  {/* Category Header */}
                  {!sidebarCollapsed && !selectedParent && (
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                    >
                      <span>{categoryLabel}</span>
                      <ChevronDown 
                        className={`h-3 w-3 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`} 
                      />
                    </button>
                  )}

                  {/* Category Items */}
                  {(!sidebarCollapsed && !selectedParent && isExpanded) || (sidebarCollapsed || selectedParent) ? (
                    <div className="space-y-1">
                      {items.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                        const hasChildren = item.children && item.children.length > 0
                        const isSelected = selectedParent === item.href

                        return (
                          <div key={item.href}>
                            <SnowButton
                              onClick={(e) => handleCategoryClick(item, e)}
                              className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all group ${
                                isActive || isSelected
                                  ? 'bg-clutch-primary text-white shadow-sm'
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-clutch-primary-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
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
                                      item.badge === 'NEW' ? 'bg-success-100 text-success-dark' :
                                      item.badge === 'AI' ? 'bg-info-100 text-info-dark' :
                                      item.badge === 'B2B' ? 'bg-clutch-secondary-100 text-clutch-secondary-dark' :
                                      item.badge === 'SEC' ? 'bg-warning-100 text-warning-dark' :
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
                  ) : null}
                </div>
              )
            })}
          </div>
        </nav>

        {/* User Section */}
        {!sidebarCollapsed && !selectedParent && (
          <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-clutch-primary rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {user?.fullName || 'User'}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sub-sidebar */}
      {selectedParent && (
        <div className="fixed left-16 top-0 z-30 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-300">
          <div className="flex h-full flex-col">
            <div className="border-b border-slate-200 dark:border-slate-700 p-4 mt-16 bg-slate-50 dark:bg-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {navigationItems.find(item => item.href === selectedParent)?.title}
                </h3>
                <button
                  onClick={() => setSelectedParent(null)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <nav className="flex-1 overflow-y-auto py-4">
              <div className="space-y-1 px-3">
                {navigationItems.find(item => item.href === selectedParent)?.children?.map((child) => {
                  const isChildActive = pathname === child.href
                  return (
                    <button
                      key={child.href}
                      onClick={() => router.push(child.href)}
                      className={`block w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-all text-left ${
                        isChildActive
                          ? 'bg-clutch-primary text-white shadow-sm'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-clutch-primary-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                      {child.title}
                    </button>
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
