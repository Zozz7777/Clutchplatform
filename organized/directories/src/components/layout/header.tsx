import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useAuthStore, useUIStore } from '@/store'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowInput } from '@/components/ui/snow-input'
import { Logo } from '@/components/ui/logo'
import {
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
} from 'lucide-react'

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const { user, logout } = useAuthStore()
  const { 
    sidebarCollapsed, 
    toggleSidebar, 
    theme, 
    setTheme,
    notifications,
    markNotificationAsRead,
    removeNotification
  } = useUIStore()

  const [showNotifications, setShowNotifications] = React.useState(false)
  const [showUserMenu, setShowUserMenu] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')

  const unreadNotifications = notifications.filter(n => !n.isRead)

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
  }

  const toggleTheme = () => {
    const newTheme = {
      ...theme,
      mode: theme.mode === 'light' ? 'dark' : 'light'
    }
    setTheme(newTheme)
    
    // Update document class for CSS variables
    if (theme.mode === 'dark') {
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.add('dark')
    }
  }

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn(
        'flex h-16 items-center justify-between border-b bg-background px-6',
        className
      )}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <SnowButton
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </SnowButton>

        <div className="hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <SnowInput
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-80 pl-10"
            />
          </div>
        </div>
      </div>

      {/* Center Logo */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <Logo size="lg" />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <SnowButton
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="hidden sm:flex"
        >
          {theme.mode === 'light' ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </SnowButton>

        {/* Notifications */}
        <div className="relative">
          <SnowButton
            variant="ghost"
            size="icon"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative"
          >
            <Bell className="h-5 w-5" />
            {unreadNotifications.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                {unreadNotifications.length}
              </span>
            )}
          </SnowButton>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-12 z-50 w-80 rounded-lg border bg-background p-4 shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Notifications</h3>
                  <SnowButton
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowNotifications(false)}
                  >
                    <X className="h-4 w-4" />
                  </SnowButton>
                </div>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No notifications
                    </p>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          'flex items-start gap-3 rounded-lg p-3 transition-colors',
                          !notification.isRead && 'bg-accent',
                          'hover:bg-accent/80'
                        )}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium">{notification.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <SnowButton
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeNotification(notification.id)
                          }}
                        >
                          <X className="h-3 w-3" />
                        </SnowButton>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Settings */}
        <SnowButton variant="ghost" size="icon" className="hidden sm:flex">
          <Settings className="h-5 w-5" />
        </SnowButton>

        {/* User Menu */}
        <div className="relative">
          <SnowButton
            variant="ghost"
            className="flex items-center gap-2"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-clutch-red to-clutch-red-dark flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-muted-foreground">
                {user?.role}
              </p>
            </div>
          </SnowButton>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-12 z-50 w-56 rounded-lg border bg-background p-2 shadow-lg"
              >
                <div className="space-y-1">
                  <SnowButton
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </SnowButton>
                  <SnowButton
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </SnowButton>
                  <div className="border-t" />
                  <SnowButton
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </SnowButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  )
}

