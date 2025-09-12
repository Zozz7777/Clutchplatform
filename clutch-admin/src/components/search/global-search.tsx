'use client'

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  X, 
  Clock, 
  Star, 
  TrendingUp, 
  Filter,
  Command,
  ArrowRight,
  History,
  Lightbulb,
  Zap
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'

// Search result types
export interface SearchResult {
  id: string
  title: string
  description: string
  type: 'page' | 'user' | 'document' | 'action' | 'setting'
  category: string
  url?: string
  icon?: React.ReactNode
  relevance: number
  lastAccessed?: Date
  tags?: string[]
}

// Search suggestion types
export interface SearchSuggestion {
  id: string
  text: string
  type: 'recent' | 'popular' | 'ai' | 'shortcut'
  category?: string
  action?: () => void
}

// AI-powered search interface
interface AISearchProps {
  onResultSelect?: (result: SearchResult) => void
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void
  placeholder?: string
  className?: string
}

export function GlobalSearch({
  onResultSelect,
  onSuggestionSelect,
  placeholder = "Search anything...",
  className = ""
}: AISearchProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [popularSearches, setPopularSearches] = useState<string[]>([])
  
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const toast = useToast()

  // Mock AI-powered search function
  const performAISearch = useCallback(async (searchQuery: string): Promise<SearchResult[]> => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Mock AI-powered results based on query
    const mockResults: SearchResult[] = [
      {
        id: '1',
        title: 'Dashboard Analytics',
        description: 'View comprehensive analytics and metrics for your dashboard',
        type: 'page',
        category: 'Analytics',
        url: '/dashboard',
        relevance: 0.95,
        tags: ['analytics', 'metrics', 'dashboard']
      },
      {
        id: '2',
        title: 'User Management',
        description: 'Manage users, roles, and permissions across the platform',
        type: 'page',
        category: 'Users',
        url: '/users',
        relevance: 0.88,
        tags: ['users', 'management', 'roles']
      },
      {
        id: '3',
        title: 'System Settings',
        description: 'Configure system-wide settings and preferences',
        type: 'setting',
        category: 'Settings',
        url: '/settings',
        relevance: 0.82,
        tags: ['settings', 'configuration', 'system']
      },
      {
        id: '4',
        title: 'Export Data',
        description: 'Export data in various formats (CSV, PDF, Excel)',
        type: 'action',
        category: 'Actions',
        relevance: 0.75,
        tags: ['export', 'data', 'download']
      }
    ]

    // Filter results based on query relevance
    return mockResults.filter(result => 
      result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [])

  // Generate AI-powered suggestions
  const generateAISuggestions = useCallback(async (searchQuery: string): Promise<SearchSuggestion[]> => {
    if (!searchQuery.trim()) {
      return [
        ...searchHistory.slice(0, 5).map(term => ({
          id: `recent-${term}`,
          text: term,
          type: 'recent' as const,
          category: 'Recent Searches'
        })),
        ...popularSearches.slice(0, 3).map(term => ({
          id: `popular-${term}`,
          text: term,
          type: 'popular' as const,
          category: 'Popular'
        }))
      ]
    }

    // Simulate AI suggestion generation
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const aiSuggestions: SearchSuggestion[] = [
      {
        id: 'ai-1',
        text: `Show me ${searchQuery} analytics`,
        type: 'ai',
        category: 'AI Suggestion'
      },
      {
        id: 'ai-2',
        text: `Create new ${searchQuery}`,
        type: 'ai',
        category: 'AI Suggestion'
      },
      {
        id: 'ai-3',
        text: `Export ${searchQuery} data`,
        type: 'ai',
        category: 'AI Suggestion'
      }
    ]

    return aiSuggestions
  }, [searchHistory, popularSearches])

  // Handle search
  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      const [searchResults, aiSuggestions] = await Promise.all([
        performAISearch(searchQuery),
        generateAISuggestions(searchQuery)
      ])
      
      setResults(searchResults)
      setSuggestions(aiSuggestions)
      
      // Add to search history
      setSearchHistory(prev => {
        const newHistory = [searchQuery, ...prev.filter(term => term !== searchQuery)]
        return newHistory.slice(0, 10) // Keep last 10 searches
      })
    } catch (error) {
      console.error('Search failed:', error)
      toast.error('Search failed', 'Please try again')
    } finally {
      setIsLoading(false)
    }
  }, [performAISearch, generateAISuggestions, toast])

  // Debounced search
  const debouncedSearch = useMemo(() => {
    let timeoutId: NodeJS.Timeout
    return (searchQuery: string) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => handleSearch(searchQuery), 300)
    }
  }, [handleSearch])

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setSelectedIndex(-1)
    debouncedSearch(value)
  }, [debouncedSearch])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const totalItems = results.length + suggestions.length
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % totalItems)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + totalItems) % totalItems)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          onResultSelect?.(results[selectedIndex])
          setIsOpen(false)
        } else if (selectedIndex >= results.length) {
          const suggestionIndex = selectedIndex - results.length
          onSuggestionSelect?.(suggestions[suggestionIndex])
          setIsOpen(false)
        }
        break
      case 'Escape':
        setIsOpen(false)
        setQuery('')
        setResults([])
        setSuggestions([])
        break
    }
  }, [selectedIndex, results, suggestions, onResultSelect, onSuggestionSelect])

  // Handle result selection
  const handleResultSelect = useCallback((result: SearchResult) => {
    onResultSelect?.(result)
    setIsOpen(false)
    setQuery('')
  }, [onResultSelect])

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: SearchSuggestion) => {
    setQuery(suggestion.text)
    onSuggestionSelect?.(suggestion)
    handleSearch(suggestion.text)
  }, [onSuggestionSelect, handleSearch])

  // Focus management
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      {/* Search Trigger */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 ${className}`}
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <Command className="h-3 w-3" />K
        </kbd>
      </Button>

      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          />

          {/* Search Container */}
          <div className="relative w-full max-w-2xl mx-4">
            <Card className="shadow-lg">
              <CardContent className="p-0">
                {/* Search Input */}
                <div className="flex items-center gap-2 p-4 border-b">
                  <Search className="h-5 w-5 text-muted-foreground" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="flex-1 text-lg border-0 outline-none bg-transparent"
                    autoComplete="off"
                  />
                  {query && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setQuery('')
                        setResults([])
                        setSuggestions([])
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Search Results */}
                <div ref={resultsRef} className="max-h-96 overflow-y-auto">
                  {isLoading ? (
                    <div className="p-4 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Searching...</p>
                    </div>
                  ) : (
                    <>
                      {/* Results */}
                      {results.length > 0 && (
                        <div className="p-2">
                          <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Results
                          </div>
                          {results.map((result, index) => (
                            <button
                              key={result.id}
                              onClick={() => handleResultSelect(result)}
                              className={`w-full text-left p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 ${
                                index === selectedIndex ? 'bg-slate-100 dark:bg-slate-800' : ''
                              }`}
                            >
                              <div className="flex-shrink-0">
                                {result.icon || <Search className="h-4 w-4 text-muted-foreground" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm">{result.title}</div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {result.description}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {result.category}
                                  </Badge>
                                  {result.tags?.slice(0, 2).map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Suggestions */}
                      {suggestions.length > 0 && (
                        <div className="p-2 border-t">
                          <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Suggestions
                          </div>
                          {suggestions.map((suggestion, index) => (
                            <button
                              key={suggestion.id}
                              onClick={() => handleSuggestionSelect(suggestion)}
                              className={`w-full text-left p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 ${
                                index + results.length === selectedIndex ? 'bg-slate-100 dark:bg-slate-800' : ''
                              }`}
                            >
                              <div className="flex-shrink-0">
                                {suggestion.type === 'recent' && <History className="h-4 w-4 text-muted-foreground" />}
                                {suggestion.type === 'popular' && <TrendingUp className="h-4 w-4 text-muted-foreground" />}
                                {suggestion.type === 'ai' && <Lightbulb className="h-4 w-4 text-blue-500" />}
                                {suggestion.type === 'shortcut' && <Zap className="h-4 w-4 text-yellow-500" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm">{suggestion.text}</div>
                                {suggestion.category && (
                                  <div className="text-xs text-muted-foreground">
                                    {suggestion.category}
                                  </div>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* No Results */}
                      {!isLoading && results.length === 0 && suggestions.length === 0 && query && (
                        <div className="p-4 text-center">
                          <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">No results found for "{query}"</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Try different keywords or check your spelling
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Search Tips */}
                <div className="p-3 border-t bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span>↑↓ Navigate</span>
                      <span>↵ Select</span>
                      <span>Esc Close</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Command className="h-3 w-3" />
                      <span>K</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  )
}

// Advanced filter builder
export function AdvancedFilterBuilder({
  onFiltersChange,
  className = ""
}: {
  onFiltersChange: (filters: any[]) => void
  className?: string
}) {
  const [filters, setFilters] = useState<any[]>([])
  const [availableFields, setAvailableFields] = useState([
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'category', label: 'Category', type: 'select', options: ['Analytics', 'Users', 'Settings'] },
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive', 'Pending'] }
  ])

  const addFilter = useCallback(() => {
    setFilters(prev => [...prev, {
      id: Date.now(),
      field: availableFields[0].key,
      operator: 'equals',
      value: ''
    }])
  }, [availableFields])

  const updateFilter = useCallback((id: number, updates: any) => {
    setFilters(prev => prev.map(filter => 
      filter.id === id ? { ...filter, ...updates } : filter
    ))
  }, [])

  const removeFilter = useCallback((id: number) => {
    setFilters(prev => prev.filter(filter => filter.id !== id))
  }, [])

  useEffect(() => {
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Advanced Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filters.map((filter) => (
            <div key={filter.id} className="flex items-center gap-2 p-3 border rounded-lg">
              <select
                value={filter.field}
                onChange={(e) => updateFilter(filter.id, { field: e.target.value })}
                className="px-3 py-2 border border-slate-300 rounded-md"
              >
                {availableFields.map(field => (
                  <option key={field.key} value={field.key}>
                    {field.label}
                  </option>
                ))}
              </select>
              
              <select
                value={filter.operator}
                onChange={(e) => updateFilter(filter.id, { operator: e.target.value })}
                className="px-3 py-2 border border-slate-300 rounded-md"
              >
                <option value="equals">Equals</option>
                <option value="contains">Contains</option>
                <option value="startsWith">Starts with</option>
                <option value="endsWith">Ends with</option>
                <option value="gt">Greater than</option>
                <option value="lt">Less than</option>
              </select>
              
              <input
                type="text"
                value={filter.value}
                onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                placeholder="Value"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-md"
              />
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeFilter(filter.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          <Button variant="outline" onClick={addFilter} className="w-full">
            <Filter className="h-4 w-4 mr-2" />
            Add Filter
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}