import React, { useState, useEffect } from 'react'
import { 
  Download, 
  Upload, 
  Filter, 
  Search, 
  Settings, 
  RefreshCw, 
  Bell, 
  CheckSquare, 
  Square,
  Trash2,
  Edit,
  Eye,
  MoreHorizontal,
  FileText,
  BarChart3,
  Calendar,
  Users,
  PoundSterling
} from 'lucide-react'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowInput } from '@/components/ui/snow-input'
import { Badge } from '@/components/ui/badge'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { clutchApi } from '@/lib/api-service'
import { toast } from 'sonner'

// Real-time Notification System
export const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Load notifications
    loadNotifications()
    
    // Set up real-time updates
    const interval = setInterval(() => {
      loadNotifications()
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const loadNotifications = async () => {
    try {
      const response = await clutchApi.getActivityLogs(20)
      if (response.success && response.data) {
        // Transform activity logs to notifications format
        const notificationsData = response.data.map((log: any, index: number) => ({
          id: log.id || `notif-${index}`,
          title: log.action || 'System Update',
          message: log.details || 'Activity recorded',
          time: log.timestamp || new Date().toISOString(),
          read: false,
          type: log.type || 'info'
        }))
        setNotifications(notificationsData)
        setUnreadCount(notificationsData.filter((n: any) => !n.read).length)
      }
    } catch (error) {
      console.error('Failed to load notifications:', error)
      setNotifications([])
      setUnreadCount(0)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      // For now, just update local state since we don't have a specific API endpoint
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      // For now, just update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
      toast.success('All notifications marked as read')
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <SnowButton variant="outline" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </SnowButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <SnowButton variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all read
            </SnowButton>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex items-start space-x-3 p-3 cursor-pointer"
                onClick={() => markAsRead(notification.id)}
              >
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  notification.read ? 'bg-gray-300' : 'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{notification.title}</p>
                  <p className="text-xs text-muted-foreground">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Advanced Data Export Component
export const DataExporter = ({ 
  data, 
  filename, 
  exportFormats = ['csv', 'excel', 'pdf'],
  onExport 
}: {
  data: any[]
  filename: string
  exportFormats?: string[]
  onExport?: (format: string) => void
}) => {
  const [isExporting, setIsExporting] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState(exportFormats[0])

  const handleExport = async (format: string) => {
    setIsExporting(true)
    try {
      if (onExport) {
        await onExport(format)
      } else {
        await exportData(format)
      }
      toast.success(`Data exported as ${format.toUpperCase()}`)
    } catch (error) {
      toast.error('Export failed')
    } finally {
      setIsExporting(false)
    }
  }

  const exportData = async (format: string) => {
    try {
      // For now, create a basic client-side export
      if (format === 'csv') {
        const csvContent = convertToCSV(data)
        downloadFile(csvContent, `${filename}.csv`, 'text/csv')
      } else if (format === 'json') {
        const jsonContent = JSON.stringify(data, null, 2)
        downloadFile(jsonContent, `${filename}.json`, 'application/json')
      } else {
        // For other formats, show a message that server-side export is needed
        toast.info(`${format.toUpperCase()} export requires server-side processing`)
      }
    } catch (error) {
      console.error('Export failed:', error)
      throw error
    }
  }

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return ''
    const headers = Object.keys(data[0])
    const csvHeaders = headers.join(',')
    const csvRows = data.map(row => 
      headers.map(header => `"${row[header]}"`).join(',')
    )
    return [csvHeaders, ...csvRows].join('\n')
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(link)
  }

  return (
    <div className="flex items-center space-x-2">
      <Select value={selectedFormat} onValueChange={setSelectedFormat}>
        <SelectTrigger className="w-24">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {exportFormats.map(format => (
            <SelectItem key={format} value={format}>
              {format.toUpperCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <SnowButton
        onClick={() => handleExport(selectedFormat)}
        disabled={isExporting}
        size="sm"
      >
        {isExporting ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        Export
      </SnowButton>
    </div>
  )
}

// Advanced Filtering Component
export const AdvancedFilter = ({
  filters,
  onFilterChange,
  onClearFilters
}: {
  filters: Record<string, any>
  onFilterChange: (filters: Record<string, any>) => void
  onClearFilters: () => void
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [localFilters, setLocalFilters] = useState(filters)

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleClearFilters = () => {
    setLocalFilters({})
    onClearFilters()
  }

  return (
    <SnowCard>
      <SnowCardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <SnowCardTitle className="text-sm font-medium">Advanced Filters</SnowCardTitle>
          <SnowButton
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Filter className="h-4 w-4" />
            {isExpanded ? 'Hide' : 'Show'}
          </SnowButton>
        </div>
      </SnowCardHeader>
      {isExpanded && (
        <SnowCardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Search</label>
              <SnowInput
                placeholder="Search..."
                value={localFilters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select
                value={localFilters.status || ''}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Date Range</label>
              <Select
                value={localFilters.dateRange || ''}
                onValueChange={(value) => handleFilterChange('dateRange', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This week</SelectItem>
                  <SelectItem value="month">This month</SelectItem>
                  <SelectItem value="quarter">This quarter</SelectItem>
                  <SelectItem value="year">This year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <SnowButton variant="outline" size="sm" onClick={handleClearFilters}>
              Clear Filters
            </SnowButton>
            <div className="text-sm text-muted-foreground">
              {Object.keys(localFilters).filter(key => localFilters[key]).length} active filters
            </div>
          </div>
        </SnowCardContent>
      )}
    </SnowCard>
  )
}

// Bulk Operations Component
export const BulkOperations = ({
  selectedItems,
  onBulkAction,
  availableActions = ['delete', 'export', 'update']
}: {
  selectedItems: string[]
  onBulkAction: (action: string, items: string[]) => void
  availableActions?: string[]
}) => {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleBulkAction = async (action: string) => {
    if (selectedItems.length === 0) {
      toast.error('No items selected')
      return
    }

    setIsProcessing(true)
    try {
      await onBulkAction(action, selectedItems)
      toast.success(`Bulk ${action} completed`)
    } catch (error) {
      toast.error(`Bulk ${action} failed`)
    } finally {
      setIsProcessing(false)
    }
  }

  if (selectedItems.length === 0) return null

  return (
    <SnowCard className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
      <SnowCardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckSquare className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">
              {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {availableActions.includes('export') && (
              <SnowButton
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('export')}
                disabled={isProcessing}
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </SnowButton>
            )}
            {availableActions.includes('update') && (
              <SnowButton
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('update')}
                disabled={isProcessing}
              >
                <Edit className="h-4 w-4 mr-1" />
                Update
              </SnowButton>
            )}
            {availableActions.includes('delete') && (
              <SnowButton
                variant="destructive"
                size="sm"
                onClick={() => handleBulkAction('delete')}
                disabled={isProcessing}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </SnowButton>
            )}
          </div>
        </div>
      </SnowCardContent>
    </SnowCard>
  )
}

// Data Table with Advanced Features
export const AdvancedDataTable = ({
  data,
  columns,
  onRowSelect,
  onBulkAction,
  showBulkOperations = true,
  showFilters = true,
  showExport = true
}: {
  data: any[]
  columns: Array<{
    key: string
    label: string
    render?: (value: any, row: any) => React.ReactNode
  }>
  onRowSelect?: (selectedIds: string[]) => void
  onBulkAction?: (action: string, items: string[]) => void
  showBulkOperations?: boolean
  showFilters?: boolean
  showExport?: boolean
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [filteredData, setFilteredData] = useState(data)

  useEffect(() => {
    // Apply filters
    let filtered = data
    if (filters.search) {
      filtered = filtered.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(filters.search.toLowerCase())
        )
      )
    }
    setFilteredData(filtered)
  }, [data, filters])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = filteredData.map(item => item.id)
      setSelectedRows(allIds)
      onRowSelect?.(allIds)
    } else {
      setSelectedRows([])
      onRowSelect?.([])
    }
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = checked
      ? [...selectedRows, id]
      : selectedRows.filter(rowId => rowId !== id)
    setSelectedRows(newSelected)
    onRowSelect?.(newSelected)
  }

  return (
    <div className="space-y-4">
      {showFilters && (
        <AdvancedFilter
          filters={filters}
          onFilterChange={setFilters}
          onClearFilters={() => setFilters({})}
        />
      )}
      {showBulkOperations && (
        <BulkOperations
          selectedItems={selectedRows}
          onBulkAction={onBulkAction || (() => {})}
        />
      )}
      {showExport && (
        <div className="flex justify-end">
          <DataExporter
            data={filteredData}
            filename="exported-data"
          />
        </div>
      )}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left">
                <Checkbox
                  checked={selectedRows.length === filteredData.length && filteredData.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </th>
              {columns.map(column => (
                <th key={column.key} className="px-4 py-3 text-left text-sm font-medium">
                  {column.label}
                </th>
              ))}
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, index) => (
              <tr key={row.id || index} className="border-t">
                <td className="px-4 py-3">
                  <Checkbox
                    checked={selectedRows.includes(row.id)}
                    onCheckedChange={(checked) => handleSelectRow(row.id, checked as boolean)}
                  />
                </td>
                {columns.map(column => (
                  <td key={column.key} className="px-4 py-3 text-sm">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
                <td className="px-4 py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SnowButton variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </SnowButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}



