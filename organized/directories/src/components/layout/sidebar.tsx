import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store'
import { useAuth } from '@/hooks/useAuth'
import { navigation, filterNavigationByRoles, type NavItem } from '@/lib/navigation'
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  HelpCircle,
} from 'lucide-react'

// Get filtered navigation based on user roles
const useFilteredNavigation = () => {
  const { user } = useAuth()
  
  if (!user) {
    return []
  }
  
  // Get user roles from the user object
  const userRoles = user.roles || [user.role]
  
  return filterNavigationByRoles(navigation, userRoles)
}

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const [expandedItems, setExpandedItems] = React.useState<string[]>([])
  const [hoveredItem, setHoveredItem] = React.useState<string | null>(null)
  
  // Get filtered navigation based on user roles
  const filteredNavigation = useFilteredNavigation()

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  const renderNavItem = (item: NavItem, level: number = 0) => {
    const isActive = (href: string) => pathname === href
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.href)
    const isHovered = hoveredItem === item.href

    const toggleExpanded = (href: string) => {
      setExpandedItems(prev => 
        prev.includes(href) 
          ? prev.filter(item => item !== href)
          : [...prev, href]
      )
    }

    const handleMouseEnter = () => {
      if (sidebarCollapsed && hasChildren) {
        setHoveredItem(item.href)
      }
    }

    const handleMouseLeave = () => {
      if (sidebarCollapsed) {
        setHoveredItem(null)
      }
    }

    return (
      <div
        key={item.href}
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ '--sidebar-item-top': `${level * 40}px` } as React.CSSProperties}
      >
        <div className="flex items-center">
          <Link
            href={item.href}
            className={cn(
              'group flex items-center rounded-lg px-2 py-1 text-xs font-medium transition-colors flex-1',
              'hover:bg-accent hover:text-accent-foreground',
              isActive(item.href) && 'bg-accent text-accent-foreground',
              sidebarCollapsed && level === 0 && 'justify-center'
            )}
          >
            <span className={cn('flex items-center gap-1.5', sidebarCollapsed && level === 0 && 'justify-center')}>
              <div className="flex-shrink-0">
                {React.cloneElement(item.icon as React.ReactElement, { className: 'h-2.5 w-2.5' })}
              </div>
              {!sidebarCollapsed && (
                <span className="flex-1 text-xs">{item.title}</span>
              )}
            </span>
            {item.badge && !sidebarCollapsed && (
              <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                {item.badge}
              </span>
            )}
          </Link>

          {/* Dropdown Toggle */}
          {hasChildren && !sidebarCollapsed && (
            <button
              onClick={() => toggleExpanded(item.href)}
              className={cn(
                'p-1 rounded-md hover:bg-accent transition-colors',
                isExpanded && 'bg-accent'
              )}
            >
              <ChevronDown 
                className={cn(
                  'h-2 w-2 transition-transform',
                  isExpanded && 'rotate-180'
                )} 
              />
            </button>
          )}
        </div>

        {/* Overlay Dropdown */}
        {hasChildren && isExpanded && !sidebarCollapsed && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="fixed left-64 top-0 ml-2 z-[100] min-w-48 rounded-lg border bg-background shadow-xl"
              style={{ top: 'var(--sidebar-item-top, 0px)' }}
            >
              <div className="p-2 space-y-1">
                {item.children!.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={cn(
                      'flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors',
                      'hover:bg-accent hover:text-accent-foreground',
                      isActive(child.href) && 'bg-accent text-accent-foreground'
                    )}
                  >
                    <div className="flex-shrink-0">
                      {React.cloneElement(child.icon as React.ReactElement, { className: 'h-2.5 w-2.5' })}
                    </div>
                    <span className="text-xs">{child.title}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Hover Dropdown for collapsed sidebar */}
        {hasChildren && sidebarCollapsed && isHovered && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="fixed left-12 top-0 ml-2 z-[100] min-w-48 rounded-lg border bg-background shadow-xl"
              style={{ top: 'var(--sidebar-item-top, 0px)' }}
            >
              <div className="p-2">
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground border-b mb-2">
                  {item.title}
                </div>
                <div className="space-y-1">
                  {item.children!.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn(
                        'flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors',
                        'hover:bg-accent hover:text-accent-foreground',
                        isActive(child.href) && 'bg-accent text-accent-foreground'
                      )}
                    >
                      <div className="flex-shrink-0">
                        {React.cloneElement(child.icon as React.ReactElement, { className: 'h-2.5 w-2.5' })}
                      </div>
                      <span className="text-xs">{child.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    )
  }

  return (
    <motion.div
      initial={false}
      animate={{ width: sidebarCollapsed ? 48 : 240 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex h-full flex-col border-r bg-background',
        className
      )}
    >
      {/* Header - Only toggle button */}
      <div className="flex h-12 items-center justify-end border-b px-3">
        <button
          onClick={toggleSidebar}
          className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-accent"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {filteredNavigation.map((item) => renderNavItem(item))}
      </nav>

      {/* Footer */}
      <div className="border-t p-3">
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-xs text-muted-foreground"
          >
            <HelpCircle className="h-3 w-3" />
            <span>Need help?</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
