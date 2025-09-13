'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
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
  ChevronRight,
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
  Zap,
  Truck,
  MapPin,
  Wrench,
  Route,
  Car,
  Star,
  StarOff,
  Plus,
  Filter
} from 'lucide-react'
import { useAuthStore, useUIStore } from '@/store'
import { useTheme } from 'next-themes'
import { SnowButton } from '@/components/ui/snow-button'
import { toast } from 'sonner'

// New simplified navigation structure
const navigationSections = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    children: [
      { title: 'Overview', href: '/dashboard' },
      { title: 'Analytics', href: '/analytics/overview' },
      { title: 'Reports', href: '/analytics/reports' }
    ]
  },
  {
    id: 'operations',
    title: 'Operations',
    icon: Activity,
    href: '/operations',
    children: [
      { title: 'Fleet Management', href: '/fleet/overview' },
      { title: 'Monitoring', href: '/monitoring/health' },
      { title: 'Maintenance', href: '/fleet/maintenance' }
    ]
  },
  {
    id: 'customers',
    title: 'Customer Management',
    icon: Users,
    href: '/crm',
    children: [
      { title: 'CRM', href: '/crm/customers' },
      { title: 'Support', href: '/support/tickets' },
      { title: 'Communications', href: '/communication/messages' }
    ]
  },
  {
    id: 'business',
    title: 'Business',
    icon: Building2,
    href: '/finance',
    children: [
      { title: 'Finance', href: '/finance/invoices' },
      { title: 'HR', href: '/hr/employees' },
      { title: 'Partners', href: '/partners/directory' }
    ]
  },
  {
    id: 'technology',
    title: 'Technology',
    icon: Brain,
    href: '/ai',
    children: [
      { title: 'AI & ML', href: '/ai/dashboard' },
      { title: 'Mobile Apps', href: '/mobile/operations' },
      { title: 'Integrations', href: '/enterprise/api' }
    ]
  },
  {
    id: 'administration',
    title: 'Administration',
    icon: Settings,
    href: '/settings',
    children: [
      { title: 'Security', href: '/security/audit' },
      { title: 'Settings', href: '/settings/system' },
      { title: 'Users', href: '/users/analytics' }
    ]
  }
]

interface NewSidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

export function NewSidebar({ isCollapsed, onToggle }: NewSidebarProps) {
  const { user, logout } = useAuthStore()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['dashboard']))
  const [searchQuery, setSearchQuery] = useState('')
  const [favorites, setFavorites] = useState<string[]>(['dashboard', 'fleet-overview', 'crm-customers'])
  const [filteredSections, setFilteredSections] = useState(navigationSections)

  // Filter sections based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = navigationSections.filter(section => 
        section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.children.some(child => 
          child.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
      setFilteredSections(filtered)
    } else {
      setFilteredSections(navigationSections)
    }
  }, [searchQuery])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
    toast.success('Logged out successfully')
  }

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const toggleFavorite = (pageId: string) => {
    const newFavorites = favorites.includes(pageId)
      ? favorites.filter(id => id !== pageId)
      : [...favorites, pageId]
    setFavorites(newFavorites)
    toast.success(favorites.includes(pageId) ? 'Removed from favorites' : 'Added to favorites')
  }

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  const isFavorite = (pageId: string) => {
    return favorites.includes(pageId)
  }

  return (
    <div className={`fixed left-0 top-0 z-40 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-clutch-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-semibold text-slate-900 dark:text-white">Clutch Admin</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-clutch-primary focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {filteredSections.map((section) => {
            const isExpanded = expandedSections.has(section.id)
            const hasActiveChild = section.children.some(child => isActive(child.href))
            const isSectionActive = isActive(section.href)

            return (
              <div key={section.id} className="space-y-1">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    isSectionActive || hasActiveChild
                      ? 'bg-clutch-primary text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <section.icon className="h-5 w-5" />
                    {!isCollapsed && <span>{section.title}</span>}
                  </div>
                  {!isCollapsed && (
                    <ChevronDown className={`h-4 w-4 transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`} />
                  )}
                </button>

                {/* Section Children */}
                {!isCollapsed && isExpanded && (
                  <div className="ml-6 space-y-1">
                    {section.children.map((child) => {
                      const childIsActive = isActive(child.href)
                      const childId = child.href.replace('/', '').replace('/', '-')
                      
                      return (
                        <div key={child.href} className="flex items-center space-x-2">
                          <Link
                            href={child.href}
                            className={`flex-1 px-3 py-2 text-sm rounded-lg transition-all ${
                              childIsActive
                                ? 'bg-clutch-primary-50 text-clutch-primary-900 dark:bg-clutch-primary-900/20 dark:text-clutch-primary-100'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                          >
                            {child.title}
                          </Link>
                          <button
                            onClick={() => toggleFavorite(childId)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                          >
                            {isFavorite(childId) ? (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            ) : (
                              <StarOff className="h-4 w-4 text-slate-400" />
                            )}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </nav>

      {/* Favorites */}
      {!isCollapsed && favorites.length > 0 && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center space-x-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span>Favorites</span>
          </h3>
          <div className="space-y-1">
            {favorites.map((favorite) => {
              const section = navigationSections.find(s => 
                s.children.some(c => c.href.replace('/', '').replace('/', '-') === favorite)
              )
              const child = section?.children.find(c => 
                c.href.replace('/', '').replace('/', '-') === favorite
              )
              
              if (!child) return null
              
              return (
                <Link
                  key={favorite}
                  href={child.href}
                  className={`flex items-center space-x-2 px-2 py-1 text-sm rounded transition-colors ${
                    isActive(child.href)
                      ? 'bg-clutch-primary-50 text-clutch-primary-900 dark:bg-clutch-primary-900/20 dark:text-clutch-primary-100'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">{child.title}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* User Section */}
      {!isCollapsed && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-clutch-primary rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {user?.fullName || 'User'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4 text-slate-500" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
