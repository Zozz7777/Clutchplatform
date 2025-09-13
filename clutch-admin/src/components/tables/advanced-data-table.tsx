'use client'

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronUp, 
  ChevronDown, 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal,
  ArrowUpDown,
  Eye,
  EyeOff,
  Settings,
  RefreshCw,
  X
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'

// Table column interface
export interface TableColumn<T = any> {
  key: string
  title: string
  sortable?: boolean
  filterable?: boolean
  visible?: boolean
  width?: number
  minWidth?: number
  maxWidth?: number
  render?: (value: any, row: T, index: number) => React.ReactNode
  filter?: {
    type: 'text' | 'select' | 'date' | 'number' | 'boolean'
    options?: Array<{ label: string; value: any }>
    placeholder?: string
  }
}

// Table data interface
export interface TableData<T = any> {
  data: T[]
  total: number
  page: number
  limit: number
  hasNext: boolean
  hasPrev: boolean
}

// Sort configuration
export interface SortConfig {
  key: string
  direction: 'asc' | 'desc'
}

// Filter configuration
export interface FilterConfig {
  key: string
  value: any
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'lt' | 'gte' | 'lte'
}

// Advanced data table props
interface AdvancedDataTableProps<T = any> {
  columns: TableColumn<T>[]
  data: TableData<T>
  loading?: boolean
  error?: string
  onSort?: (sort: SortConfig) => void
  onFilter?: (filters: FilterConfig[]) => void
  onPageChange?: (page: number) => void
  onLimitChange?: (limit: number) => void
  onExport?: (format: 'csv' | 'pdf' | 'excel') => void
  onRefresh?: () => void
  virtualScrolling?: boolean
  rowHeight?: number
  className?: string
}

export function AdvancedDataTable<T extends object = any>({
  columns,
  data,
  loading = false,
  error,
  onSort,
  onFilter,
  onPageChange,
  onLimitChange,
  onExport,
  onRefresh,
  virtualScrolling = true,
  rowHeight = 48,
  className = ''
}: AdvancedDataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null)
  const [filters, setFilters] = useState<FilterConfig[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columns.filter(col => col.visible !== false).map(col => col.key))
  )
  const [showFilters, setShowFilters] = useState(false)
  const [showColumnSettings, setShowColumnSettings] = useState(false)
  
  const tableRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)
  
  const toast = useToast()

  // Calculate visible rows for virtual scrolling
  const visibleRows = useMemo(() => {
    if (!virtualScrolling || !containerHeight) return data.data

    const startIndex = Math.floor(scrollTop / rowHeight)
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / rowHeight) + 1,
      data.data.length
    )

    return data.data.slice(startIndex, endIndex).map((row, index) => ({
      row,
      index: startIndex + index
    }))
  }, [data.data, scrollTop, containerHeight, rowHeight, virtualScrolling])

  // Handle scroll for virtual scrolling
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (virtualScrolling) {
      setScrollTop(e.currentTarget.scrollTop)
    }
  }, [virtualScrolling])

  // Update container height
  useEffect(() => {
    if (tableRef.current) {
      setContainerHeight(tableRef.current.clientHeight)
    }
  }, [])

  // Handle sort
  const handleSort = useCallback((key: string) => {
    const column = columns.find(col => col.key === key)
    if (!column?.sortable) return

    const newDirection: 'asc' | 'desc' = sortConfig?.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    const newSortConfig: SortConfig = { key, direction: newDirection }
    
    setSortConfig(newSortConfig)
    onSort?.(newSortConfig)
  }, [columns, sortConfig, onSort])

  // Handle filter
  const handleFilter = useCallback((key: string, value: any, operator: FilterConfig['operator'] = 'contains') => {
    const newFilters = filters.filter(f => f.key !== key)
    if (value !== null && value !== undefined && value !== '') {
      newFilters.push({ key, value, operator })
    }
    
    setFilters(newFilters)
    onFilter?.(newFilters)
  }, [filters, onFilter])

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    // Implement search logic here
  }, [])

  // Handle column visibility toggle
  const toggleColumnVisibility = useCallback((key: string) => {
    setVisibleColumns(prev => {
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        newSet.add(key)
      }
      return newSet
    })
  }, [])

  // Handle export
  const handleExport = useCallback((format: 'csv' | 'pdf' | 'excel') => {
    if (onExport) {
      onExport(format)
      toast.success(`Data exported as ${format.toUpperCase()}`)
    }
  }, [onExport, toast])

  // Get sort icon
  const getSortIcon = (key: string) => {
    if (sortConfig?.key !== key) return <ArrowUpDown className="h-4 w-4" />
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />
  }

  // Filter visible columns
  const visibleColumnsData = useMemo(() => {
    return columns.filter(col => visibleColumns.has(col.key))
  }, [columns, visibleColumns])

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            {onRefresh && (
              <Button onClick={onRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Data Table</CardTitle>
            <CardDescription>
              {data.total} total records • Page {data.page} of {Math.ceil(data.total / data.limit)}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {filters.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {filters.length}
                </Badge>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowColumnSettings(!showColumnSettings)}>
              <Settings className="h-4 w-4 mr-2" />
              Columns
            </Button>
            {onExport && (
              <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {filters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.map((filter, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {filter.key}: {filter.value}
                  <button
                    onClick={() => handleFilter(filter.key, null)}
                    className="ml-1 hover:bg-slate-300 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Column Settings */}
          {showColumnSettings && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Column Visibility</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {columns.map((column) => (
                    <label key={column.key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={visibleColumns.has(column.key)}
                        onChange={() => toggleColumnVisibility(column.key)}
                        className="rounded"
                      />
                      <span className="text-sm">{column.title}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Table */}
          <div 
            ref={tableRef}
            className="border rounded-lg overflow-auto"
            style={{ height: virtualScrolling ? '400px' : 'auto' }}
            onScroll={handleScroll}
          >
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0">
                <tr>
                  {visibleColumnsData.map((column) => (
                    <th
                      key={column.key}
                      className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300 border-b"
                      style={{ 
                        width: column.width,
                        minWidth: column.minWidth,
                        maxWidth: column.maxWidth
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span>{column.title}</span>
                        {column.sortable && (
                          <button
                            onClick={() => handleSort(column.key)}
                            className="hover:bg-slate-200 dark:hover:bg-slate-700 rounded p-1"
                          >
                            {getSortIcon(column.key)}
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={visibleColumnsData.length} className="px-4 py-8 text-center">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                      <p className="text-muted-foreground">Loading...</p>
                    </td>
                  </tr>
                ) : virtualScrolling ? (
                  <>
                    {/* Virtual scrolling spacer */}
                    <tr style={{ height: scrollTop }} />
                    {visibleRows.map((item, idx) => {
                      const row = 'row' in item ? (item as { row: T; index: number }).row : item as T
                      const index = 'index' in item ? (item as { row: T; index: number }).index : idx
                      return (
                      <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                        {visibleColumnsData.map((column) => (
                          <td
                            key={column.key}
                            className="px-4 py-3 text-sm border-b"
                            style={{ height: rowHeight }}
                          >
                            {column.render ? 
                              column.render((row as any)[column.key], row, index) : 
                              (row as any)[column.key]
                            }
                          </td>
                        ))}
                      </tr>
                      )
                    })}
                    {/* Virtual scrolling spacer */}
                    <tr style={{ height: (data.data.length - Math.ceil(scrollTop / rowHeight) - Math.ceil(containerHeight / rowHeight)) * rowHeight }} />
                  </>
                ) : (
                  data.data.map((row, index) => (
                    <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                      {visibleColumnsData.map((column) => (
                        <td
                          key={column.key}
                          className="px-4 py-3 text-sm border-b"
                        >
                          {column.render ? 
                            column.render((row as any)[column.key], row, index) : 
                            (row as any)[column.key]
                          }
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows per page:</span>
              <select
                value={data.limit}
                onChange={(e) => onLimitChange?.(Number(e.target.value))}
                className="px-2 py-1 border border-slate-300 rounded text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(data.page - 1)}
                disabled={!data.hasPrev || loading}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {data.page} of {Math.ceil(data.total / data.limit)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(data.page + 1)}
                disabled={!data.hasNext || loading}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Export utilities
export const exportUtils = {
  toCSV: (data: any[], columns: TableColumn[]) => {
    const headers = columns.map(col => col.title).join(',')
    const rows = data.map(row => 
      columns.map(col => {
        const value = row[col.key]
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      }).join(',')
    )
    return [headers, ...rows].join('\n')
  },
  
  downloadCSV: (data: any[], columns: TableColumn[], filename: string) => {
    const csv = exportUtils.toCSV(data, columns)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }
}
