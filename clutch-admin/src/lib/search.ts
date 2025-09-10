import { apiClient } from './api'

export interface SearchResult {
  id: string
  type: string
  title: string
  description: string
  url: string
  score: number
}

export interface SearchFilters {
  type?: string
  dateRange?: {
    start: Date
    end: Date
  }
  status?: string
  category?: string
}

export const searchItems = async (
  query: string,
  filters: SearchFilters = {},
  page: number = 1,
  limit: number = 20
): Promise<{ results: SearchResult[], total: number, page: number, totalPages: number }> => {
  try {
    const response = await apiClient.get('/search', {
      params: {
        q: query,
        ...filters,
        page,
        limit
      }
    })

    if (response.success) {
      return response.data as { results: SearchResult[]; total: number; page: number; totalPages: number; }
    } else {
      throw new Error(response.message || 'Search failed')
    }
  } catch (error) {
    console.error('Search error:', error)
    throw error
  }
}

export const searchInTable = <T>(
  items: T[],
  searchTerm: string,
  searchFields: (keyof T)[]
): T[] => {
  if (!searchTerm.trim()) {
    return items
  }

  const term = searchTerm.toLowerCase()
  return items.filter(item =>
    searchFields.some(field => {
      const value = item[field]
      if (value === null || value === undefined) return false
      return String(value).toLowerCase().includes(term)
    })
  )
}

export const filterItems = <T>(
  items: T[],
  filter: string,
  filterField: keyof T
): T[] => {
  if (filter === 'all') {
    return items
  }

  return items.filter(item => item[filterField] === filter)
}

export const sortItems = <T>(
  items: T[],
  sortField: keyof T,
  sortDirection: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...items].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]

    if (aValue === null || aValue === undefined) return 1
    if (bValue === null || bValue === undefined) return -1

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
    }

    if (aValue instanceof Date && bValue instanceof Date) {
      return sortDirection === 'asc' 
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime()
    }

    return 0
  })
}

export const exportData = async (
  data: any[],
  format: 'csv' | 'excel' | 'pdf' = 'csv',
  filename: string = 'export'
): Promise<void> => {
  try {
    const response = await apiClient.post('/export', {
      data,
      format,
      filename
    })

    if (response.success) {
      // Create download link
      const blob = new Blob([response.data as BlobPart], { 
        type: `application/${format === 'csv' ? 'text/csv' : format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'application/pdf'}` 
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } else {
      throw new Error(response.message || 'Export failed')
    }
  } catch (error) {
    console.error('Export error:', error)
    throw error
  }
}
