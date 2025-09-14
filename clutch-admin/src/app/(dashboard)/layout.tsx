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
// New components
import NewSidebar from '@/components/layout/new-sidebar'
import NewHeader from '@/components/layout/new-header'
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
import { SnowButton } from '@/components/ui/snow-button'
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
      { title: 'CRM Dashboard', href: '/crm/dashboard' },
      { title: 'Customer Database', href: '/crm/customers' },
      { title: 'Lead Management', href: '/crm/leads' },
      { title: 'Deal Pipeline', href: '/crm/deals' },
      { title: 'Sales Analytics', href: '/crm/analytics' },
      { title: 'Marketing Automation', href: '/crm/marketing' },
      { title: 'Customer Support', href: '/crm/support' },
      { title: 'CRM Reports', href: '/crm/reports' }
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
      { title: 'Financial Dashboard', href: '/finance/dashboard' },
      { title: 'Invoice Management', href: '/finance/invoices' },
      { title: 'Expense Tracking', href: '/finance/expenses' },
      { title: 'Payment Processing', href: '/finance/payments' },
      { title: 'Budget Planning', href: '/finance/budget' },
      { title: 'Financial Reports', href: '/finance/reports' },
      { title: 'Tax Management', href: '/finance/tax' },
      { title: 'Revenue Analytics', href: '/finance/revenue' }
    ]
  },
  {
    title: 'HR Management',
    href: '/hr',
    icon: Users,
    badge: null,
    category: 'business',
    children: [
      { title: 'Employee Dashboard', href: '/hr/dashboard' },
      { title: 'Employee Directory', href: '/hr/employees' },
      { title: 'Department Management', href: '/hr/departments' },
      { title: 'Recruitment', href: '/hr/recruitment' },
      { title: 'Performance Tracking', href: '/hr/performance' },
      { title: 'Payroll Management', href: '/hr/payroll' },
      { title: 'Training & Development', href: '/hr/training' },
      { title: 'HR Analytics', href: '/hr/analytics' }
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
      { title: 'Legal Dashboard', href: '/legal/dashboard' },
      { title: 'Contract Management', href: '/legal/contracts' },
      { title: 'Compliance Monitoring', href: '/legal/compliance' },
      { title: 'Document Management', href: '/legal/documents' },
      { title: 'Case Management', href: '/legal/cases' },
      { title: 'Risk Assessment', href: '/legal/risk' },
      { title: 'Legal Analytics', href: '/legal/analytics' }
    ]
  },

  // Communication & Collaboration
  {
    title: 'Team Chat',
    href: '/chat',
    icon: MessageSquare,
    badge: 'NEW',
    category: 'communication',
    children: [
      { title: 'Chat Dashboard', href: '/chat/dashboard' },
      { title: 'Direct Messages', href: '/chat/messages' },
      { title: 'Channels', href: '/chat/channels' },
      { title: 'File Sharing', href: '/chat/files' },
      { title: 'Video Calls', href: '/chat/video' },
      { title: 'Chat Analytics', href: '/chat/analytics' }
    ]
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
             className={`fixed left-0 top-0 z-40 h-screen bg-white dark:bg-clutch-gray-700 border-r border-clutch-gray-200 dark:border-clutch-gray-600 shadow-lg transition-all duration-300 ${
               selectedParent ? 'w-16' : (sidebarCollapsed ? 'w-16' : 'w-64')
             }`}
           >
             {/* Sidebar Header with Logo */}
             <div className="flex h-16 items-center justify-between px-4 border-b border-clutch-gray-200 dark:border-clutch-gray-600 bg-clutch-gray-50 dark:bg-clutch-gray-800">
               {!sidebarCollapsed && !selectedParent && (
                 <div className="flex items-center space-x-2">
                   <div className="w-8 h-8 bg-clutch-primary rounded-lg flex items-center justify-center">
                     <span className="text-white font-bold text-sm">C</span>
                   </div>
                   <span className="text-lg font-semibold text-clutch-gray-700 dark:text-white">
                     Clutch
                   </span>
                 </div>
               )}
               <button
                 onClick={toggleSidebar}
                 className="p-1.5 hover:bg-clutch-gray-100 dark:hover:bg-clutch-gray-600 rounded-lg transition-colors"
                 aria-label="Toggle sidebar"
               >
                 <Menu className="h-4 w-4 text-clutch-gray-600 dark:text-clutch-gray-300" />
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
                      className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-clutch-gray-500 dark:text-clutch-gray-400 uppercase tracking-wider hover:text-clutch-gray-700 dark:hover:text-clutch-gray-300 transition-colors"
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
                                  : 'text-clutch-gray-700 dark:text-clutch-gray-300 hover:bg-clutch-red-50 dark:hover:bg-clutch-gray-800 hover:text-clutch-gray-900 dark:hover:text-white'}`}
                            >
                              <item.icon className={`h-5 w-5 mr-3 flex-shrink-0 transition-colors ${
                                isActive || isSelected ? 'text-white' : 'text-clutch-gray-700 group-hover:text-clutch-gray-800'}`} />
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
               <div className="border-t border-clutch-gray-200 dark:border-clutch-gray-600 p-4 bg-clutch-gray-50 dark:bg-clutch-gray-800">
                 <div className="flex items-center space-x-3">
                   <div className="w-8 h-8 bg-clutch-primary rounded-full flex items-center justify-center">
                     <User className="h-4 w-4 text-white" />
                   </div>
                   <div className="flex-1 min-w-0">
                     <p className="text-sm font-medium text-clutch-gray-900 dark:text-white truncate">
                       {user?.fullName || 'User'}
                     </p>
                     <p className="text-xs text-clutch-gray-600 dark:text-clutch-gray-400 truncate">
                       {user?.email || 'user@example.com'}
                     </p>
                   </div>
                 </div>
               </div>
             )}
      </div>
      {selectedParent && (
        <div className="fixed left-16 top-0 z-30 h-screen w-64 bg-white border-r border-clutch-gray-200 shadow-sm transition-all duration-300">
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


// Main Layout Component
const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { sidebarCollapsed } = useUIStore()
  const [selectedParent, setSelectedParent] = useState<string | null>(null)
  const [showSearch, setShowSearch] = useState(false)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50">
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
        <NewHeader 
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


