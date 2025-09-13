'use client'

import React, { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore, useUIStore } from '@/store'
import { LuxurySidebar } from './luxury-sidebar'
import { LuxuryHeader } from './luxury-header'
import { LuxuryCard } from './luxury-card'
import { LuxuryButton } from './luxury-button'
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
  Zap,
  Crown,
  Gem,
  Sparkles
} from 'lucide-react'

interface LuxuryLayoutProps {
  children: React.ReactNode
}

export function LuxuryLayout({ children }: LuxuryLayoutProps) {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-luxury-gold-50/30">
      {/* Luxury Sidebar */}
      <LuxurySidebar 
        selectedParent={selectedParent} 
        setSelectedParent={setSelectedParent}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={handleToggleSidebar}
      />
      
      {/* Main Content */}
      <div
        className={`transition-all duration-500 ${
          selectedParent 
            ? 'ml-80' // 16 + 64 = 80 (collapsed main sidebar + sub-sidebar)
            : sidebarCollapsed 
              ? 'ml-16' 
              : 'ml-64'
        }`}
      >
        {/* Luxury Header */}
        <LuxuryHeader onToggleSidebar={handleToggleSidebar} />
        
        {/* Page Content */}
        <main className="p-6 min-h-screen">
          <div className="max-w-8xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      {/* Luxury Global Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" data-search>
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 z-50 overflow-hidden">
            <div className="p-6 border-b border-white/20 bg-gradient-to-r from-luxury-gold-500/10 to-luxury-diamond-500/10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Search className="h-5 w-5 text-luxury-gold-600" />
                  Global Search
                </h3>
                <LuxuryButton
                  variant="glass"
                  size="icon-sm"
                  onClick={() => setShowSearch(false)}
                  className="hover:scale-110 transition-transform duration-300"
                >
                  <X className="h-5 w-5" />
                </LuxuryButton>
              </div>
            </div>
            
            <div className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-luxury-gold-500" />
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="w-full pl-10 pr-4 py-3 border border-white/20 bg-white/50 backdrop-blur-md rounded-xl focus:ring-2 focus:ring-luxury-gold-500 focus:border-transparent text-slate-900 placeholder:text-slate-500"
                  autoFocus
                />
              </div>
              
              <div className="mt-6">
                <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-luxury-gold-500" />
                  Quick Actions
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <LuxuryButton 
                    variant="glass" 
                    className="p-3 justify-start hover:scale-105 transition-transform duration-300"
                  >
                    <div className="flex items-center space-x-2">
                      <LayoutDashboard className="h-4 w-4 text-luxury-gold-500" />
                      <span className="text-sm font-medium">Go to Dashboard</span>
                    </div>
                  </LuxuryButton>
                  <LuxuryButton 
                    variant="glass" 
                    className="p-3 justify-start hover:scale-105 transition-transform duration-300"
                  >
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-luxury-diamond-500" />
                      <span className="text-sm font-medium">View Users</span>
                    </div>
                  </LuxuryButton>
                  <LuxuryButton 
                    variant="glass" 
                    className="p-3 justify-start hover:scale-105 transition-transform duration-300"
                  >
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4 text-luxury-emerald-500" />
                      <span className="text-sm font-medium">Analytics</span>
                    </div>
                  </LuxuryButton>
                  <LuxuryButton 
                    variant="glass" 
                    className="p-3 justify-start hover:scale-105 transition-transform duration-300"
                  >
                    <div className="flex items-center space-x-2">
                      <Settings className="h-4 w-4 text-luxury-platinum-500" />
                      <span className="text-sm font-medium">Settings</span>
                    </div>
                  </LuxuryButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Luxury Keyboard Shortcuts Modal */}
      {showKeyboardShortcuts && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" data-keyboard-shortcuts>
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 z-50 overflow-hidden">
            <div className="p-6 border-b border-white/20 bg-gradient-to-r from-luxury-gold-500/10 to-luxury-diamond-500/10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-luxury-gold-600" />
                  Keyboard Shortcuts
                </h3>
                <LuxuryButton
                  variant="glass"
                  size="icon-sm"
                  onClick={() => setShowKeyboardShortcuts(false)}
                  className="hover:scale-110 transition-transform duration-300"
                >
                  <X className="h-5 w-5" />
                </LuxuryButton>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-luxury-gold-500/5 to-luxury-diamond-500/5 rounded-xl">
                  <span className="text-sm font-medium text-slate-700">Toggle Sidebar</span>
                  <kbd className="px-3 py-1 text-xs font-mono bg-white/50 backdrop-blur-md border border-white/20 rounded-lg shadow-sm text-slate-600">
                    Ctrl + B
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-luxury-gold-500/5 to-luxury-diamond-500/5 rounded-xl">
                  <span className="text-sm font-medium text-slate-700">Global Search</span>
                  <kbd className="px-3 py-1 text-xs font-mono bg-white/50 backdrop-blur-md border border-white/20 rounded-lg shadow-sm text-slate-600">
                    Ctrl + K
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-luxury-gold-500/5 to-luxury-diamond-500/5 rounded-xl">
                  <span className="text-sm font-medium text-slate-700">Toggle Theme</span>
                  <kbd className="px-3 py-1 text-xs font-mono bg-white/50 backdrop-blur-md border border-white/20 rounded-lg shadow-sm text-slate-600">
                    Ctrl + T
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-luxury-gold-500/5 to-luxury-diamond-500/5 rounded-xl">
                  <span className="text-sm font-medium text-slate-700">Notifications</span>
                  <kbd className="px-3 py-1 text-xs font-mono bg-white/50 backdrop-blur-md border border-white/20 rounded-lg shadow-sm text-slate-600">
                    Ctrl + N
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-luxury-gold-500/5 to-luxury-diamond-500/5 rounded-xl">
                  <span className="text-sm font-medium text-slate-700">Help</span>
                  <kbd className="px-3 py-1 text-xs font-mono bg-white/50 backdrop-blur-md border border-white/20 rounded-lg shadow-sm text-slate-600">
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