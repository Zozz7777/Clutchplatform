import React, { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Offline Support and Data Synchronization
 * Features:
 * - Offline detection
 * - Data synchronization
 * - Queue management
 * - Conflict resolution
 * - Background sync
 */
import { queryClient } from './react-query-setup'

// Offline status types
export interface OfflineStatus {
  isOnline: boolean
  isOffline: boolean
  lastOnline: Date | null
  lastOffline: Date | null
  connectionType: string | null
}

// Sync queue item
export interface SyncQueueItem {
  id: string
  type: 'create' | 'update' | 'delete'
  endpoint: string
  data: any
  timestamp: Date
  retryCount: number
  maxRetries: number
  priority: number
}

// Conflict resolution strategies
export type ConflictResolutionStrategy = 'server-wins' | 'client-wins' | 'merge' | 'manual'

// Offline manager class
export class OfflineManager {
  private static instance: OfflineManager
  private syncQueue: SyncQueueItem[] = []
  private isSyncing = false
  private syncInterval: number | null = null
  private listeners: Set<(status: OfflineStatus) => void> = new Set()

  static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager()
    }
    return OfflineManager.instance
  }

  constructor() {
    this.initialize()
  }

  private initialize() {
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline)
    window.addEventListener('offline', this.handleOffline)

    // Start sync interval
    this.startSyncInterval()

    // Listen for visibility change to sync when tab becomes active
    document.addEventListener('visibilitychange', this.handleVisibilityChange)
  }

  private handleOnline = () => {
    this.notifyListeners({
      isOnline: true,
      isOffline: false,
      lastOnline: new Date(),
      lastOffline: null,
      connectionType: this.getConnectionType()
    })

    // Start syncing when back online
    this.processSyncQueue()
  }

  private handleOffline = () => {
    this.notifyListeners({
      isOnline: false,
      isOffline: true,
      lastOnline: null,
      lastOffline: new Date(),
      connectionType: null
    })
  }

  private handleVisibilityChange = () => {
    if (!document.hidden && navigator.onLine) {
      this.processSyncQueue()
    }
  }

  private getConnectionType(): string | null {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      return connection?.effectiveType || connection?.type || null
    }
    return null
  }

  private notifyListeners(status: OfflineStatus) {
    this.listeners.forEach(listener => listener(status))
  }

  private startSyncInterval() {
    this.syncInterval = window.setInterval(() => {
      if (navigator.onLine && this.syncQueue.length > 0) {
        this.processSyncQueue()
      }
    }, 30000) // Sync every 30 seconds
  }

  private stopSyncInterval() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  // Add item to sync queue
  addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount'>) {
    const syncItem: SyncQueueItem = {
      ...item,
      id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      retryCount: 0
    }

    this.syncQueue.push(syncItem)
    this.syncQueue.sort((a, b) => b.priority - a.priority) // Sort by priority

    // Try to sync immediately if online
    if (navigator.onLine) {
      this.processSyncQueue()
    }

    // Persist queue to localStorage
    this.persistQueue()
  }

  // Sync queue with server
  private async processSyncQueue() {
    if (this.isSyncing || this.syncQueue.length === 0) {
      return
    }

    this.isSyncing = true

    try {
      const itemsToSync = [...this.syncQueue]
      const successfulItems: string[] = []

      for (const item of itemsToSync) {
        try {
          await this.syncItem(item)
          successfulItems.push(item.id)
        } catch (error) {
          console.error('Failed to sync item:', item, error)
          
          // Increment retry count
          item.retryCount++
          
          // Remove item if max retries reached
          if (item.retryCount >= item.maxRetries) {
            console.warn('Max retries reached for item:', item.id)
            successfulItems.push(item.id)
          }
        }
      }

      // Remove successful items from queue
      this.syncQueue = this.syncQueue.filter(item => !successfulItems.includes(item.id))
      this.persistQueue()

    } finally {
      this.isSyncing = false
    }
  }

  // Sync individual item
  private async syncItem(item: SyncQueueItem) {
    const { type, endpoint, data } = item

    let response: Response

    switch (type) {
      case 'create':
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        break
      case 'update':
        response = await fetch(endpoint, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        break
      case 'delete':
        response = await fetch(endpoint, {
          method: 'DELETE'
        })
        break
      default:
        throw new Error(`Unknown sync type: ${type}`)
    }

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.status} ${response.statusText}`)
    }

    // Invalidate relevant queries
    this.invalidateQueries(endpoint)
  }

  // Invalidate queries based on endpoint
  private invalidateQueries(endpoint: string) {
    if (endpoint.includes('/users')) {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    } else if (endpoint.includes('/hr/employees')) {
      queryClient.invalidateQueries({ queryKey: ['hr', 'employees'] })
    } else if (endpoint.includes('/finance')) {
      queryClient.invalidateQueries({ queryKey: ['finance'] })
    } else if (endpoint.includes('/crm')) {
      queryClient.invalidateQueries({ queryKey: ['crm'] })
    }
  }

  // Persist queue to localStorage
  private persistQueue() {
    try {
      localStorage.setItem('syncQueue', JSON.stringify(this.syncQueue))
    } catch (error) {
      console.error('Failed to persist sync queue:', error)
    }
  }

  // Load queue from localStorage
  private loadQueue() {
    try {
      const stored = localStorage.getItem('syncQueue')
      if (stored) {
        const parsed = JSON.parse(stored)
        this.syncQueue = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }))
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error)
      this.syncQueue = []
    }
  }

  // Get current offline status
  getOfflineStatus(): OfflineStatus {
    return {
      isOnline: navigator.onLine,
      isOffline: !navigator.onLine,
      lastOnline: null,
      lastOffline: null,
      connectionType: this.getConnectionType()
    }
  }

  // Get sync queue
  getSyncQueue(): SyncQueueItem[] {
    return [...this.syncQueue]
  }

  // Clear sync queue
  clearSyncQueue() {
    this.syncQueue = []
    this.persistQueue()
  }

  // Trigger sync manually
  triggerSync() {
    this.processSyncQueue()
  }

  // Add status listener
  addStatusListener(listener: (status: OfflineStatus) => void) {
    this.listeners.add(listener)
  }

  // Remove status listener
  removeStatusListener(listener: (status: OfflineStatus) => void) {
    this.listeners.delete(listener)
  }

  // Cleanup
  destroy() {
    window.removeEventListener('online', this.handleOnline)
    window.removeEventListener('offline', this.handleOffline)
    document.removeEventListener('visibilitychange', this.handleVisibilityChange)
    this.stopSyncInterval()
    this.listeners.clear()
  }
}

// Offline support hook
export function useOfflineSupport() {
  const [offlineStatus, setOfflineStatus] = useState<OfflineStatus>({
    isOnline: navigator.onLine,
    isOffline: !navigator.onLine,
    lastOnline: null,
    lastOffline: null,
    connectionType: null
  })

  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([])
  const offlineManager = useRef(OfflineManager.getInstance())

  useEffect(() => {
    const manager = offlineManager.current

    // Load initial queue
    setSyncQueue(manager.getSyncQueue())

    // Add status listener
    const handleStatusChange = (status: OfflineStatus) => {
      setOfflineStatus(status)
      setSyncQueue(manager.getSyncQueue())
    }

    manager.addStatusListener(handleStatusChange)

    return () => {
      manager.removeStatusListener(handleStatusChange)
    }
  }, [])

  const addToSyncQueue = useCallback((item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount'>) => {
    offlineManager.current.addToSyncQueue(item)
    setSyncQueue(offlineManager.current.getSyncQueue())
  }, [])

  const clearSyncQueue = useCallback(() => {
    offlineManager.current.clearSyncQueue()
    setSyncQueue([])
  }, [])

  const syncNow = useCallback(() => {
    offlineManager.current.triggerSync()
  }, [])

  return {
    offlineStatus,
    syncQueue,
    addToSyncQueue,
    clearSyncQueue,
    syncNow
  }
}

// Offline indicator component
export const OfflineIndicator: React.FC = () => {
  const { offlineStatus } = useOfflineSupport()

  // Always call hooks in the same order, then handle conditional rendering
  const renderContent = () => {
    if (!offlineStatus.isOffline) {
      return null
    }

    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-yellow-900 px-4 py-2 text-center text-sm font-medium">
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-yellow-900 rounded-full animate-pulse" />
          You're offline. Changes will be synced when you're back online.
        </div>
      </div>
    )
  }

  return renderContent()
}

// Sync status component
export const SyncStatus: React.FC = () => {
  const { syncQueue, syncNow } = useOfflineSupport()

  // Always call hooks in the same order, then handle conditional rendering
  const renderContent = () => {
    if (syncQueue.length === 0) {
      return null
    }

    return (
      <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-gray-700">
              {syncQueue.length} item{syncQueue.length !== 1 ? 's' : ''} pending sync
            </span>
          </div>
          <button
            onClick={syncNow}
            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Sync Now
          </button>
        </div>
      </div>
    )
  }

  return renderContent()
}

// Offline-aware data fetching hook
export function useOfflineAwareQuery<T>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<T>,
  options: {
    enabled?: boolean
    staleTime?: number
    retry?: boolean
  } = {}
) {
  const { offlineStatus } = useOfflineSupport()
  const [data, setData] = useState<T | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    if (offlineStatus.isOffline) {
      // Try to get data from cache
      const cachedData = queryClient.getQueryData<T>(queryKey)
      if (cachedData) {
        setData(cachedData)
        return
      }
      return
    }

    if (!options.enabled) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await queryFn()
      setData(result)
      queryClient.setQueryData(queryKey, result)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [queryKey, queryFn, options.enabled, offlineStatus.isOffline])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    isLoading,
    error,
    refetch: fetchData
  }
}

// Conflict resolution utilities
export const conflictResolution = {
  // Server wins strategy
  serverWins: (serverData: any, clientData: any) => serverData,

  // Client wins strategy
  clientWins: (serverData: any, clientData: any) => clientData,

  // Merge strategy
  merge: (serverData: any, clientData: any) => {
    return {
      ...serverData,
      ...clientData,
      // Preserve server timestamps
      updatedAt: serverData.updatedAt,
      createdAt: serverData.createdAt
    }
  },

  // Manual resolution
  manual: (serverData: any, clientData: any) => {
    // Return both versions for manual resolution
    return {
      server: serverData,
      client: clientData,
      requiresManualResolution: true
    }
  }
}

const OfflineSupport = {
  OfflineManager,
  useOfflineSupport,
  OfflineIndicator,
  SyncStatus,
  useOfflineAwareQuery,
  conflictResolution
}

export default OfflineSupport
