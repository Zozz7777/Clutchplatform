'use client'

import React, { useState, useEffect } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'
import { useAccessibility } from '@/components/accessibility/accessibility-provider'

interface MobileLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
}

export function MobileLayout({ children, sidebar, header, footer }: MobileLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { isReducedMotion } = useAccessibility()

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close sidebar when clicking outside
  useEffect(() => {
    if (!isSidebarOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('[data-mobile-sidebar]') && !target.closest('[data-mobile-toggle]')) {
        setIsSidebarOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isSidebarOpen])

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isSidebarOpen])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Mobile Header */}
      {header && (
        <header className="sticky top-0 z-40 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              data-mobile-toggle
              onClick={toggleSidebar}
              className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle navigation menu"
            >
              {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            {header}
          </div>
        </header>
      )}

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-50"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar */}
      {sidebar && (
        <aside
          data-mobile-sidebar
          className={`fixed top-0 left-0 z-50 h-full w-80 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } ${isReducedMotion ? 'transition-none' : ''}`}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Navigation
              </h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {sidebar}
            </div>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Mobile Footer */}
      {footer && (
        <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
          {footer}
        </footer>
      )}
    </div>
  )
}

// Mobile-friendly navigation component
interface MobileNavigationProps {
  items: Array<{
    label: string
    href: string
    icon?: React.ReactNode
    children?: Array<{
      label: string
      href: string
    }>
  }>
  currentPath?: string
}

export function MobileNavigation({ items, currentPath }: MobileNavigationProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(label)) {
        newSet.delete(label)
      } else {
        newSet.add(label)
      }
      return newSet
    })
  }

  return (
    <nav className="space-y-1 p-4">
      {items.map((item) => (
        <div key={item.label}>
          <a
            href={item.href}
            className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentPath === item.href
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <div className="flex items-center space-x-3">
              {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
              <span>{item.label}</span>
            </div>
            {item.children && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  toggleExpanded(item.label)
                }}
                className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-expanded={expandedItems.has(item.label)}
                aria-label={`Toggle ${item.label} submenu`}
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    expandedItems.has(item.label) ? 'rotate-180' : ''
                  }`}
                />
              </button>
            )}
          </a>
          
          {item.children && expandedItems.has(item.label) && (
            <div className="ml-6 mt-1 space-y-1">
              {item.children.map((child) => (
                <a
                  key={child.href}
                  href={child.href}
                  className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                    currentPath === child.href
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200'
                      : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700/50'
                  }`}
                >
                  {child.label}
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  )
}

// Touch-friendly button component
interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

export function TouchButton({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}: TouchButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors touch-manipulation'
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300 focus:ring-slate-500 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[44px]',
    md: 'px-4 py-3 text-base min-h-[48px]',
    lg: 'px-6 py-4 text-lg min-h-[52px]'
  }
  
  const widthClasses = fullWidth ? 'w-full' : ''
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

// Mobile-friendly form component
interface MobileFormProps {
  children: React.ReactNode
  onSubmit: (e: React.FormEvent) => void
  className?: string
}

export function MobileForm({ children, onSubmit, className = '' }: MobileFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className={`space-y-6 ${className}`}
      noValidate
    >
      {children}
    </form>
  )
}

// Mobile-friendly input component
interface MobileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helperText?: string
}

export function MobileInput({ label, error, helperText, className = '', ...props }: MobileInputProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <input
        className={`block w-full px-4 py-3 text-base border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400 ${className}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-slate-500 dark:text-slate-400">{helperText}</p>
      )}
    </div>
  )
}
