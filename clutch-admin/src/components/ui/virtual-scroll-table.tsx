'use client'

import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react'
import * as ReactWindow from 'react-window'
import { SnowCard, SnowCardContent } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { ChevronUp, ChevronDown, Search, Filter, Download } from 'lucide-react'

interface VirtualScrollTableProps<T> {
  data: T[]
  columns: Column<T>[]
  height?: number
  itemHeight?: number
  onRowClick?: (item: T, index: number) => void
  onSort?: (column: string, direction: 'asc' | 'desc') => void
  onFilter?: (filters: Record<string, any>) => void
  onExport?: () => void
  loading?: boolean
  emptyMessage?: string
  className?: string
}

interface Column<T> {
  key: string
  title: string
  width?: number
  sortable?: boolean
  filterable?: boolean
  render?: (value: any, item: T, index: number) => React.ReactNode
  align?: 'left' | 'center' | 'right'
}

export function VirtualScrollTable<T extends Record<string, any>>({
  data,
  columns,
  height = 400,
  itemHeight = 50,
  onRowClick,
  onSort,
  onFilter,
  onExport,
  loading = false,
  emptyMessage = 'No data available',
  className = ''
}: VirtualScrollTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const listRef = useRef<any>(null)

  // Memoized filtered and sorted data
  const processedData = useMemo(() => {
    let result = [...data]

    // Apply search filter
    if (searchTerm) {
      result = result.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Apply column filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== '') {
        result = result.filter(item => {
          const itemValue = item[key]
          if (typeof itemValue === 'string') {
            return itemValue.toLowerCase().includes(String(value).toLowerCase())
          }
          return itemValue === value
        })
      }
    })

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }

    return result
  }, [data, searchTerm, filters, sortConfig])

  // Handle sorting
  const handleSort = useCallback((columnKey: string) => {
    const column = columns.find(col => col.key === columnKey)
    if (!column?.sortable) return

    setSortConfig(prev => {
      if (prev?.key === columnKey) {
        return {
          key: columnKey,
          direction: prev.direction === 'asc' ? 'desc' : 'asc'
        }
      }
      return { key: columnKey, direction: 'asc' }
    })

    onSort?.(columnKey, sortConfig?.direction === 'asc' ? 'desc' : 'asc')
  }, [columns, sortConfig, onSort])

  // Handle filtering
  const handleFilter = useCallback((columnKey: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [columnKey]: value
    }))
    onFilter?.({ ...filters, [columnKey]: value })
  }, [filters, onFilter])

  // Row renderer for virtual scrolling
  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = processedData[index]
    if (!item) return null

    return (
      <div
        style={style}
        className={`flex items-center border-b border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors ${
          index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
        }`}
        onClick={() => onRowClick?.(item, index)}
      >
        {columns.map((column, colIndex) => (
          <div
            key={column.key}
            className="px-4 py-3 flex-1"
            style={{
              width: column.width || 'auto',
              textAlign: column.align || 'left'
            }}
          >
            {column.render ? column.render(item[column.key], item, index) : item[column.key]}
          </div>
        ))}
      </div>
    )
  }, [processedData, columns, onRowClick])

  // Header renderer
  const Header = useCallback(() => (
    <div className="flex items-center bg-slate-100 border-b-2 border-slate-300 font-semibold text-slate-700">
      {columns.map((column) => (
        <div
          key={column.key}
          className="px-4 py-3 flex-1 flex items-center gap-2"
          style={{
            width: column.width || 'auto',
            textAlign: column.align || 'left'
          }}
        >
          <span>{column.title}</span>
          {column.sortable && (
            <button
              onClick={() => handleSort(column.key)}
              className="hover:bg-slate-200 rounded p-1 transition-colors"
            >
              {sortConfig?.key === column.key ? (
                sortConfig.direction === 'asc' ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )
              ) : (
                <div className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      ))}
    </div>
  ), [columns, sortConfig, handleSort])

  // Filter bar
  const FilterBar = useCallback(() => (
    <div className="flex items-center gap-4 p-4 bg-slate-50 border-b border-slate-200">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
        />
      </div>
      
      {onExport && (
        <SnowButton
          variant="outline"
          size="sm"
          onClick={onExport}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export
        </SnowButton>
      )}
    </div>
  ), [searchTerm, onExport])

  if (loading) {
    return (
      <SnowCard className={className}>
        <SnowCardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary/20 border-t-primary"></div>
          </div>
        </SnowCardContent>
      </SnowCard>
    )
  }

  if (processedData.length === 0) {
    return (
      <SnowCard className={className}>
        <SnowCardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-slate-600">{emptyMessage}</p>
          </div>
        </SnowCardContent>
      </SnowCard>
    )
  }

  return (
    <SnowCard className={className}>
      <FilterBar />
      <div className="overflow-hidden">
        <Header />
        <div className="space-y-0">
          {processedData.map((item, index) => (
            <div key={index} className="border-b border-gray-200 last:border-b-0">
              {Row({ index, style: {} })}
            </div>
          ))}
        </div>
      </div>
    </SnowCard>
  )
}

export default VirtualScrollTable
