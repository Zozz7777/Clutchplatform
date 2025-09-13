'use client'

import React, { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore, useUIStore } from '@/store'
import { RedesignedSidebar } from './redesigned-sidebar'
import { RedesignedHeader } from './redesigned-header'
import { SnowCard } from '@/components/ui/snow-card'
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

interface RedesignedLayoutProps {
  children: React.ReactNode
}

export function RedesignedLayout({ children }: RedesignedLayoutProps) {
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const [selectedParent, setSelectedParent] = useState<string | null>(null)
  const [showSearch, setShowSearch] = useState(false)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)

  // Handle sidebar toggle
  const handleToggleSidebar = () => {
    toggleSidebar()
    setSelectedParent(null) // Close sub-sidebar when toggling main sidebar
  }

  // Handle search
  const handleSearchClick = () => {
    setShowSearch(true)
  }

  // Handle keyboard shortcuts
  const handleKeyboardShortcutsClick = () => {
    setShowKeyboardShortcuts(true)
  }

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('[data-search]')) {
        setShowSearch(false)
      }
    }

    if (showSearch) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSearch])

  // Close keyboard shortcuts when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('[data-keyboard-shortcuts]')) {
        setShowKeyboardShortcuts(false)
      }
    }

    if (showKeyboardShortcuts) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showKeyboardShortcuts])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <RedesignedSidebar 
        selectedParent={selectedParent} 
        setSelectedParent={setSelectedParent}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={handleToggleSidebar}
      />
      
      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          selectedParent 
            ? 'ml-80' // 16 + 64 = 80 (collapsed main sidebar + sub-sidebar)
            : sidebarCollapsed 
              ? 'ml-16' 
              : 'ml-64'
        }`}
      >
        {/* Header */}
        <RedesignedHeader onToggleSidebar={handleToggleSidebar} />
        
        {/* Page Content */}
        <main className="p-6 min-h-screen">
          <div className="max-w-8xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      {/* Global Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 bg-black/20 z-50 backdrop-blur-sm" data-search>
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Global Search
                </h3>
                <button
                  onClick={() => setShowSearch(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-clutch-primary focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  autoFocus
                />
              </div>
              
              <div className="mt-6">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Quick Actions
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <button className="p-3 text-left border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <div className="flex items-center space-x-2">
                      <LayoutDashboard className="h-4 w-4 text-clutch-primary" />
                      <span className="text-sm font-medium">Go to Dashboard</span>
                    </div>
                  </button>
                  <button className="p-3 text-left border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-clutch-primary" />
                      <span className="text-sm font-medium">View Users</span>
                    </div>
                  </button>
                  <button className="p-3 text-left border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4 text-clutch-primary" />
                      <span className="text-sm font-medium">Analytics</span>
                    </div>
                  </button>
                  <button className="p-3 text-left border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <div className="flex items-center space-x-2">
                      <Settings className="h-4 w-4 text-clutch-primary" />
                      <span className="text-sm font-medium">Settings</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Keyboard Shortcuts Modal */}
      {showKeyboardShortcuts && (
        <div className="fixed inset-0 bg-black/20 z-50 backdrop-blur-sm" data-keyboard-shortcuts>
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Keyboard Shortcuts
                </h3>
                <button
                  onClick={() => setShowKeyboardShortcuts(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700 dark:text-slate-300">Toggle Sidebar</span>
                  <kbd className="px-2 py-1 text-xs font-mono bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded shadow-sm">
                    Ctrl + B
                  </kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700 dark:text-slate-300">Global Search</span>
                  <kbd className="px-2 py-1 text-xs font-mono bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded shadow-sm">
                    Ctrl + K
                  </kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700 dark:text-slate-300">Toggle Theme</span>
                  <kbd className="px-2 py-1 text-xs font-mono bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded shadow-sm">
                    Ctrl + T
                  </kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700 dark:text-slate-300">Notifications</span>
                  <kbd className="px-2 py-1 text-xs font-mono bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded shadow-sm">
                    Ctrl + N
                  </kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700 dark:text-slate-300">Help</span>
                  <kbd className="px-2 py-1 text-xs font-mono bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded shadow-sm">
                    Ctrl + ?
                  </kbd>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}