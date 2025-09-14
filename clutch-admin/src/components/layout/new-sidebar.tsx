'use client'

import React, { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
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
  Zap,
  Scale,
  Gavel,
  CreditCard,
  TrendingUp,
  UserCheck,
  Briefcase,
  Target,
  Globe,
  Lock,
  Eye,
  Database,
  PieChart,
  LineChart,
  BarChart,
  TrendingDown,
  DollarSign,
  Receipt,
  Calculator,
  FileSpreadsheet,
  Banknote,
  Percent,
  Clock,
  Calendar as CalendarIcon,
  UserPlus,
  UserMinus,
  Award,
  BookOpen,
  GraduationCap,
  ClipboardList,
  CheckSquare,
  Square,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Save,
  Copy,
  Share,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Home,
  Search as SearchIcon,
  Star,
  Heart,
  Bookmark,
  Flag,
  Tag,
  Hash,
  AtSign,
  Phone,
  MapPin,
  Globe as GlobeIcon,
  Link as LinkIcon,
  Image,
  Video,
  Music,
  File,
  Archive,
  Folder,
  FolderOpen as FolderOpenIcon,
  HardDrive,
  Server,
  Cloud,
  Wifi,
  Bluetooth,
  Battery,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Monitor,
  Smartphone as SmartphoneIcon,
  Tablet,
  Laptop,
  Printer,
  Keyboard,
  Mouse,
  Headphones,
  Speaker,
  Tv,
  Radio,
  Gamepad2,
  Joystick,
  Dice1,
  Dice2,
  Dice3,
  Dice4,
  Dice5,
  Dice6,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Volume1,
  Volume2 as Volume2Icon,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Move,
  Move3d,
  ZoomIn,
  ZoomOut,
  Focus,
  Crop,
  Scissors,
  Palette,
  Brush,
  PenTool,
  Eraser,
  Highlighter,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Link2,
  Unlink,
  List,
  ListOrdered,
  Quote,
  Indent,
  Outdent,
  Table,
  Grid,
  Columns,
  Rows,
  Layout,
  Sidebar as SidebarIcon,
  PanelLeft,
  PanelRight,
  PanelTop,
  PanelBottom,
  Split,
  Merge,
  Layers,
  Box,
  Package,
  Container,
  Archive as ArchiveIcon,
  Inbox,
  Send,
  Mail as MailIcon,
  MailOpen,
  MailCheck,
  MailX,
  MailWarning,
  MailPlus,
  MailMinus,
  MailQuestion,
  MailSearch,
} from 'lucide-react'
import { useAuthStore, useUIStore } from '@/store'

// Navigation Items with all required modules
const navigationItems = [
  // Core Dashboard
  {
    title: 'Dashboard',
    href: '/dashboard-consolidated',
    icon: LayoutDashboard,
    badge: null,
    category: 'core',
    description: 'Main dashboard overview'
  },
  {
    title: 'Autonomous Dashboard',
    href: '/autonomous-dashboard',
    icon: Brain,
    badge: 'AI',
    category: 'core',
    description: 'AI-powered analytics'
  },

  // Operations & Monitoring
  {
    title: 'Operations',
    href: '/operations',
    icon: Activity,
    badge: null,
    category: 'operations',
    description: 'Platform operations',
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
    description: 'System monitoring',
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
    description: 'Business analytics',
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
    icon: TrendingUp,
    badge: 'NEW',
    category: 'analytics',
    description: 'Advanced BI tools'
  },
  {
    title: 'Revenue Analytics',
    href: '/revenue',
    icon: DollarSign,
    badge: null,
    category: 'analytics',
    description: 'Revenue insights',
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
    description: 'User behavior analytics',
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
    description: 'Customer relationship management',
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
    description: 'Customer support',
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
    description: 'Fleet operations',
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
    description: 'Artificial intelligence',
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
    description: 'Mobile app management',
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
    icon: CreditCard,
    badge: null,
    category: 'business',
    description: 'Financial management',
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
    icon: UserCheck,
    badge: null,
    category: 'business',
    description: 'Human resources',
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
    title: 'Legal & Compliance',
    href: '/legal',
    icon: Scale,
    badge: null,
    category: 'business',
    description: 'Legal management',
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
  {
    title: 'Partners',
    href: '/partners',
    icon: Handshake,
    badge: null,
    category: 'business',
    description: 'Partner management',
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
    description: 'Marketing campaigns',
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
    description: 'Content management',
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
    description: 'Enterprise features',
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
    icon: Lock,
    badge: 'SEC',
    category: 'enterprise',
    description: 'Security management',
    children: [
      { title: '2FA Management', href: '/security/2fa' },
      { title: 'Biometric Auth', href: '/security/biometric' },
      { title: 'Audit Logs', href: '/security/audit' },
      { title: 'Session Management', href: '/security/sessions' },
      { title: 'Compliance', href: '/security/compliance' }
    ]
  },

  // Communication & Collaboration
  {
    title: 'Team Chat',
    href: '/chat',
    icon: MessageSquare,
    badge: 'NEW',
    category: 'communication',
    description: 'Team communication',
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
    description: 'Email management',
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
    description: 'Communication tools',
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
    description: 'Project management',
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
    description: 'System settings',
    children: [
      { title: 'Profile', href: '/settings/profile' },
      { title: 'System', href: '/settings/system' }
    ]
  }
]

// Category labels
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

interface NewSidebarProps {
  selectedParent: string | null
  setSelectedParent: (value: string | null) => void
}

export default function NewSidebar({ selectedParent, setSelectedParent }: NewSidebarProps) {
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

  return (
    <>
      {/* Main Sidebar */}
      <div
        className={`fixed left-0 top-0 z-40 h-screen bg-white dark:bg-clutch-gray-700 border-r border-clutch-gray-200 dark:border-clutch-gray-600 shadow-lg transition-all duration-300 ${
          selectedParent ? 'w-16' : (sidebarCollapsed ? 'w-16' : 'w-64')
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-clutch-gray-200 dark:border-clutch-gray-600 bg-clutch-gray-50 dark:bg-clutch-gray-800">
          {!sidebarCollapsed && !selectedParent && (
          <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-clutch-red-500 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
            </div>
              <span className="text-lg font-semibold text-clutch-gray-700 dark:text-white">
                Clutch Admin
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
                            <button
                              onClick={(e) => handleCategoryClick(item, e)}
                              className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all group ${
                                isActive || isSelected
                                  ? 'bg-clutch-red-500 text-white shadow-sm'
                                  : 'text-clutch-gray-700 dark:text-clutch-gray-300 hover:bg-clutch-red-50 dark:hover:bg-clutch-gray-800 hover:text-clutch-gray-900 dark:hover:text-white'
                              }`}
                            >
                              <item.icon className={`h-5 w-5 mr-3 flex-shrink-0 transition-colors ${
                                isActive || isSelected ? 'text-white' : 'text-clutch-gray-700 group-hover:text-clutch-gray-800'
                              }`} />
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
                                      item.badge === 'NEW' ? 'bg-green-100 text-green-800' :
                                      item.badge === 'AI' ? 'bg-blue-100 text-blue-800' :
                                      item.badge === 'B2B' ? 'bg-purple-100 text-purple-800' :
                                      item.badge === 'SEC' ? 'bg-orange-100 text-orange-800' :
                                      'bg-clutch-gray-100 text-clutch-gray-700'
                                    }`}>
                                      {item.badge}
                                    </span>
                                  )}
                                </>
                            )}
                          </button>
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
          <div className="border-t border-clutch-gray-200 dark:border-clutch-gray-600 p-4 bg-clutch-gray-50 dark:bg-clutch-gray-800">
          <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-clutch-red-500 rounded-full flex items-center justify-center">
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

      {/* Sub-sidebar */}
      {selectedParent && (
        <div className="fixed left-16 top-0 z-30 h-screen w-64 bg-white dark:bg-clutch-gray-700 border-r border-clutch-gray-200 dark:border-clutch-gray-600 shadow-sm transition-all duration-300">
          <div className="flex h-full flex-col">
            <div className="border-b border-clutch-gray-200 dark:border-clutch-gray-600 p-4 mt-16 bg-clutch-gray-50 dark:bg-clutch-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-clutch-gray-900 dark:text-white">
                  {navigationItems.find(item => item.href === selectedParent)?.title}
                </h3>
            <button
                  onClick={() => setSelectedParent(null)}
                  className="h-7 w-7 p-0 hover:bg-clutch-gray-100 dark:hover:bg-clutch-gray-600 rounded-lg transition-colors flex items-center justify-center"
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
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`block w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                        isChildActive
                          ? 'bg-clutch-red-500 text-white shadow-sm'
                          : 'text-clutch-gray-700 dark:text-clutch-gray-300 hover:bg-clutch-red-50 dark:hover:bg-clutch-gray-800 hover:text-clutch-gray-900 dark:hover:text-white'
                      }`}
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