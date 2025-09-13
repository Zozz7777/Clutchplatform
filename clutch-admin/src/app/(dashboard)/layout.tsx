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
  Mail,
  Brain,
  Zap
} from 'lucide-react'
import { useAuthStore, useUIStore } from '@/store'
import { useTheme } from 'next-themes'
// Legacy components removed - using SnowUI components only
import { SnowButton } from '@/components/ui/snow-button'
import { SnowInput } from '@/components/ui/snow-input'
// Luxury components
import { LuxuryButton } from '@/components/ui/luxury-button'
import { LuxuryInput } from '@/components/ui/luxury-input'
import { LuxuryCard } from '@/components/ui/luxury-card'
import LuxuryAvatar from '@/components/ui/luxury-avatar'
import LuxuryBadge from '@/components/ui/luxury-badge'
import LuxuryTooltip from '@/components/ui/luxury-tooltip'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
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
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="text-center">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-clutch-primary mx-auto mb-4"></div>
        <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-clutch-primary/60 animate-ping"></div>
      </div>
      <p className="text-slate-600 font-medium">Loading...</p>
    </div>
  </div>
)

// Reorganized Navigation Items - Grouped by Function
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
  },

  // Luxury Showcase
  {
    title: 'Luxury Showcase',
    href: '/luxury-showcase',
    icon: Zap,
    badge: 'NEW',
    category: 'settings',
    children: []
  }
]

     // Redesigned Sidebar Component with Enhanced UX
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
       const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['core', 'operations']))

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
           {/* Enhanced Main Sidebar */}
           <div
             className={`fixed left-0 top-0 z-40 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 shadow-lg transition-all duration-300 ${
               selectedParent ? 'w-16' : (sidebarCollapsed ? 'w-16' : 'w-64')
             }`}
           >
             {/* Sidebar Header with Logo */}
             <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
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
                 onClick={toggleSidebar}
                 className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                 aria-label="Toggle sidebar"
               >
                 <Menu className="h-4 w-4 text-slate-600 dark:text-slate-300" />
               </button>
             </div>
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
             {/* Enhanced User Section */}
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
      {selectedParent && (
        <div className="fixed left-16 top-0 z-30 h-screen w-64 bg-white border-r border-slate-200 shadow-sm transition-all duration-300">
          <div className="flex h-full flex-col">
            <div className="border-b border-slate-200 p-4 mt-16 bg-slate-50">
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
                          ? 'bg-clutch-primary text-white shadow-sm'
                          : 'text-slate-700 hover:bg-clutch-primary-50 hover:text-slate-900'}`}
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
                    <div className="w-2 h-2 bg-clutch-primary rounded-full mt-2 flex-shrink-0"></div>
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
            <div className="w-12 h-12 bg-clutch-primary rounded-full flex items-center justify-center">
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
            className="flex items-center w-full px-4 py-3 text-sm text-error hover:bg-error-50 transition-colors"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Logout
          </SnowButton>
        </div>
      </div>
    </>
  )
}

     // Enhanced Header Component with Improved UX
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
    setUserMenuOpen(false) // Close user menu if open
  }

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen)
    setNotificationsOpen(false) // Close notifications if open
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
      // Navigate to search results page or implement search functionality
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
         <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm">
           <div className="flex h-16 items-center justify-between px-6">
             <div className="flex items-center space-x-4">
               <button
                 onClick={toggleSidebar}
                 className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                 aria-label="Toggle sidebar"
               >
                 <Menu className="h-5 w-5 text-slate-600 dark:text-slate-300" />
               </button>
               
               {/* Enhanced Breadcrumbs */}
               <nav className="flex items-center space-x-1 text-sm text-slate-500 dark:text-slate-400">
                 {breadcrumbs.map((breadcrumb, index) => (
                   <React.Fragment key={breadcrumb.href}>
                     {index > 0 && <span className="mx-1">/</span>}
                     {breadcrumb.isLast ? (
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
               {/* Enhanced Search */}
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
        </div>
             <div className="flex items-center space-x-4">
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


