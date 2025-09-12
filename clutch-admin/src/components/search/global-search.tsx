'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Search, X, Command, ArrowRight } from 'lucide-react'
import { SnowInput } from '@/components/ui/snow-input'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowCard, SnowCardContent } from '@/components/ui/snow-card'
import { useRouter } from 'next/navigation'

interface SearchResult {
  id: string
  title: string
  description: string
  href: string
  category: string
  icon?: React.ComponentType<{ className?: string }>
}

interface GlobalSearchProps {
  isOpen: boolean
  onClose: () => void
}

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Static search data - these are actual pages in the application
  const searchData: SearchResult[] = [
    // Dashboard
    { id: '1', title: 'Dashboard', description: 'Main dashboard overview', href: '/dashboard-consolidated', category: 'Core' },
    { id: '2', title: 'Autonomous Dashboard', description: 'AI-powered analytics dashboard', href: '/autonomous-dashboard', category: 'Core' },
    
    // Operations
    { id: '3', title: 'Operations', description: 'Platform operations and monitoring', href: '/operations/platform-overview', category: 'Operations' },
    { id: '4', title: 'System Health', description: 'Monitor system health and performance', href: '/operations/system-health', category: 'Operations' },
    { id: '5', title: 'Performance Monitoring', description: 'Track system performance metrics', href: '/operations/performance', category: 'Operations' },
    
    // Analytics
    { id: '6', title: 'Analytics', description: 'Business intelligence and analytics', href: '/analytics/overview', category: 'Analytics' },
    { id: '7', title: 'User Analytics', description: 'User behavior and engagement metrics', href: '/users/analytics', category: 'Analytics' },
    { id: '8', title: 'Revenue Analytics', description: 'Revenue tracking and forecasting', href: '/revenue/analytics', category: 'Analytics' },
    
    // Users & CRM
    { id: '9', title: 'Users', description: 'User management and analytics', href: '/users/analytics', category: 'Customers' },
    { id: '10', title: 'CRM', description: 'Customer relationship management', href: '/crm/customers', category: 'Customers' },
    { id: '11', title: 'Support', description: 'Customer support and tickets', href: '/support/tickets', category: 'Customers' },
    
    // Fleet
    { id: '12', title: 'Fleet Management', description: 'Vehicle and driver management', href: '/fleet/overview', category: 'Fleet' },
    { id: '13', title: 'Vehicle Tracking', description: 'Real-time vehicle tracking', href: '/fleet/tracking', category: 'Fleet' },
    
    // Settings
    { id: '14', title: 'Settings', description: 'System and user settings', href: '/settings', category: 'Settings' },
    { id: '15', title: 'Profile', description: 'User profile management', href: '/settings/profile', category: 'Settings' },
  ]

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }

    setIsLoading(true)
    
    // Simulate API delay
    const timer = setTimeout(() => {
      const filtered = searchData.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      )
      setResults(filtered)
      setIsLoading(false)
    }, 150)

    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (results[selectedIndex]) {
            handleResultClick(results[selectedIndex])
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex, onClose])

  const handleResultClick = (result: SearchResult) => {
    router.push(result.href)
    onClose()
    setQuery('')
    setResults([])
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setSelectedIndex(0)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black bg-opacity-50">
      <div className="w-full max-w-2xl mx-4">
        <SnowCard className="shadow-2xl">
          <SnowCardContent className="p-0">
            {/* Search Input */}
            <div className="flex items-center space-x-3 p-4 border-b border-slate-200">
              <Search className="h-5 w-5 text-slate-400" />
              <SnowInput
                ref={inputRef}
                value={query}
                onChange={handleInputChange}
                placeholder="Search anything..."
                className="flex-1 border-0 shadow-none focus:ring-0 text-lg"
              />
              <div className="flex items-center space-x-2">
                <kbd className="px-2 py-1 text-xs font-mono bg-slate-100 border border-slate-300 rounded">
                  ESC
                </kbd>
                <SnowButton
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </SnowButton>
              </div>
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-clutch-primary mx-auto mb-2"></div>
                  <p className="text-sm text-slate-500">Searching...</p>
                </div>
              ) : query.length < 2 ? (
                <div className="p-8 text-center">
                  <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-sm text-slate-500 mb-2">Start typing to search</p>
                  <p className="text-xs text-slate-400">
                    Search for pages, features, and more
                  </p>
                </div>
              ) : results.length === 0 ? (
                <div className="p-8 text-center">
                  <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-sm text-slate-500 mb-2">No results found</p>
                  <p className="text-xs text-slate-400">
                    Try different keywords or check your spelling
                  </p>
                </div>
              ) : (
                <div className="py-2">
                  {results.map((result, index) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors ${
                        index === selectedIndex ? 'bg-clutch-primary-50' : ''
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-slate-900">
                            {result.title}
                          </span>
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {result.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          {result.description}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {results.length > 0 && (
              <div className="px-4 py-3 border-t border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center space-x-4">
                    <span>↑↓ Navigate</span>
                    <span>↵ Select</span>
                    <span>ESC Close</span>
                  </div>
                  <span>{results.length} result{results.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            )}
          </SnowCardContent>
        </SnowCard>
      </div>
    </div>
  )
}
