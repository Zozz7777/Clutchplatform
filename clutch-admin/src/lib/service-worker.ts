/**
 * Service Worker for Advanced Caching
 * Features:
 * - Intelligent caching strategies
 * - Offline support
 * - Background sync
 * - Push notifications
 * - Cache invalidation
 */

// Service Worker Registration
export function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return Promise.resolve(null)
  }

  return navigator.serviceWorker.register('/sw.js')
    .then(registration => {
      console.log('Service Worker registered successfully:', registration)
      return registration
    })
    .catch(error => {
      console.error('Service Worker registration failed:', error)
      return null
    })
}

// Cache Management
export class CacheManager {
  private static instance: CacheManager
  private cacheNames = {
    static: 'clutch-static-v1',
    dynamic: 'clutch-dynamic-v1',
    api: 'clutch-api-v1',
    images: 'clutch-images-v1'
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  // Cache strategies
  strategies = {
    // Cache first - for static assets
    cacheFirst: async (request: Request, cacheName: string): Promise<Response> => {
      const cache = await caches.open(cacheName)
      const cachedResponse = await cache.match(request)
      
      if (cachedResponse) {
        return cachedResponse
      }
      
      const networkResponse = await fetch(request)
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone())
      }
      
      return networkResponse
    },

    // Network first - for API calls
    networkFirst: async (request: Request, cacheName: string): Promise<Response> => {
      const cache = await caches.open(cacheName)
      
      try {
        const networkResponse = await fetch(request)
        if (networkResponse.ok) {
          cache.put(request, networkResponse.clone())
        }
        return networkResponse
      } catch (error) {
        const cachedResponse = await cache.match(request)
        if (cachedResponse) {
          return cachedResponse
        }
        throw error
      }
    },

    // Stale while revalidate - for frequently updated content
    staleWhileRevalidate: async (request: Request, cacheName: string): Promise<Response> => {
      const cache = await caches.open(cacheName)
      const cachedResponse = await cache.match(request)
      
      const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
          cache.put(request, networkResponse.clone())
        }
        return networkResponse
      })
      
      return cachedResponse || fetchPromise
    }
  }

  // Cache invalidation
  async invalidateCache(cacheName: string, pattern?: string): Promise<void> {
    const cache = await caches.open(cacheName)
    const keys = await cache.keys()
    
    for (const key of keys) {
      if (!pattern || key.url.includes(pattern)) {
        await cache.delete(key)
      }
    }
  }

  // Clear all caches
  async clearAllCaches(): Promise<void> {
    const cacheNames = await caches.keys()
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    )
  }

  // Get cache statistics
  async getCacheStats(): Promise<{
    [key: string]: {
      size: number
      entries: number
    }
  }> {
    const stats: { [key: string]: { size: number; entries: number } } = {}
    
    for (const [name, cacheName] of Object.entries(this.cacheNames)) {
      const cache = await caches.open(cacheName)
      const keys = await cache.keys()
      let totalSize = 0
      
      for (const key of keys) {
        const response = await cache.match(key)
        if (response) {
          const blob = await response.blob()
          totalSize += blob.size
        }
      }
      
      stats[name] = {
        size: totalSize,
        entries: keys.length
      }
    }
    
    return stats
  }
}

// Background Sync
export class BackgroundSyncManager {
  private static instance: BackgroundSyncManager

  static getInstance(): BackgroundSyncManager {
    if (!BackgroundSyncManager.instance) {
      BackgroundSyncManager.instance = new BackgroundSyncManager()
    }
    return BackgroundSyncManager.instance
  }

  // Register background sync
  async registerBackgroundSync(tag: string, data?: any): Promise<void> {
    if (!('serviceWorker' in navigator) || !('sync' in window.ServiceWorkerRegistration.prototype)) {
      console.warn('Background sync not supported')
      return
    }

    const registration = await navigator.serviceWorker.ready
    if ('sync' in registration) {
      await (registration as any).sync.register(tag)
    }
    
    // Store data for background sync
    if (data) {
      localStorage.setItem(`sync-${tag}`, JSON.stringify(data))
    }
  }

  // Handle background sync
  async handleBackgroundSync(event: any): Promise<void> {
    const tag = event.tag
    const data = localStorage.getItem(`sync-${tag}`)
    
    if (data) {
      try {
        const syncData = JSON.parse(data)
        await this.processSyncData(tag, syncData)
        localStorage.removeItem(`sync-${tag}`)
      } catch (error) {
        console.error('Background sync failed:', error)
      }
    }
  }

  // Process sync data
  private async processSyncData(tag: string, data: any): Promise<void> {
    switch (tag) {
      case 'api-sync':
        await this.syncApiData(data)
        break
      case 'form-sync':
        await this.syncFormData(data)
        break
      default:
        console.warn('Unknown sync tag:', tag)
    }
  }

  // Sync API data
  private async syncApiData(data: any): Promise<void> {
    // Implement API synchronization logic
    console.log('Syncing API data:', data)
  }

  // Sync form data
  private async syncFormData(data: any): Promise<void> {
    // Implement form synchronization logic
    console.log('Syncing form data:', data)
  }
}

// Push Notification Manager
export class PushNotificationManager {
  private static instance: PushNotificationManager

  static getInstance(): PushNotificationManager {
    if (!PushNotificationManager.instance) {
      PushNotificationManager.instance = new PushNotificationManager()
    }
    return PushNotificationManager.instance
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported')
      return 'denied'
    }

    return await Notification.requestPermission()
  }

  // Subscribe to push notifications
  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported')
      return null
    }

    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    })

    return subscription
  }

  // Handle push messages
  async handlePushMessage(event: any): Promise<void> {
    const data = event.data ? event.data.json() : {}
    
    const options: NotificationOptions = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: data.tag,
      data: data.data,
    }

    await (self as any).registration.showNotification(data.title, options)
  }

  // Handle notification click
  async handleNotificationClick(event: any): Promise<void> {
    event.notification.close()
    
    if (event.action) {
      // Handle action button click
      console.log('Action clicked:', event.action)
    } else {
      // Handle notification click
      const url = event.notification.data?.url || '/'
      await (self as any).clients.openWindow(url)
    }
  }
}

// Offline Support
export class OfflineManager {
  private static instance: OfflineManager

  static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager()
    }
    return OfflineManager.instance
  }

  // Check online status
  isOnline(): boolean {
    return navigator.onLine
  }

  // Handle online/offline events
  setupOnlineOfflineHandlers(): void {
    window.addEventListener('online', () => {
      console.log('App is online')
      this.handleOnline()
    })

    window.addEventListener('offline', () => {
      console.log('App is offline')
      this.handleOffline()
    })
  }

  // Handle online event
  private async handleOnline(): Promise<void> {
    // Sync pending data
    const backgroundSync = BackgroundSyncManager.getInstance()
    await backgroundSync.registerBackgroundSync('api-sync')
  }

  // Handle offline event
  private handleOffline(): void {
    // Show offline indicator
    this.showOfflineIndicator()
  }

  // Show offline indicator
  private showOfflineIndicator(): void {
    // Implement offline indicator UI
    console.log('Showing offline indicator')
  }

  // Cache critical resources for offline use
  async cacheCriticalResources(): Promise<void> {
    const criticalResources = [
      '/',
      '/dashboard',
      '/offline.html',
      '/manifest.json',
      '/icon-192x192.png',
      '/icon-512x512.png'
    ]

    const cache = await caches.open('clutch-static-v1')
    await cache.addAll(criticalResources)
  }
}

// Service Worker Event Handlers
export const serviceWorkerHandlers = {
  // Install event
  install: async (event: any): Promise<void> => {
    console.log('Service Worker installing...')
    
    const offlineManager = OfflineManager.getInstance()
    await offlineManager.cacheCriticalResources()
    
    // Skip waiting to activate immediately
    await (self as any).skipWaiting()
  },

  // Activate event
  activate: async (event: any): Promise<void> => {
    console.log('Service Worker activating...')
    
    // Clean up old caches
    const cacheManager = CacheManager.getInstance()
    await cacheManager.clearAllCaches()
    
    // Take control of all clients
    await (self as any).clients.claim()
  },

  // Fetch event
  fetch: async (event: any): Promise<Response> => {
    const request = event.request
    const url = new URL(request.url)
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
      return fetch(request)
    }

    const cacheManager = CacheManager.getInstance()
    
    // Handle different types of requests
    if (url.pathname.startsWith('/api/')) {
      // API requests - network first
      return cacheManager.strategies.networkFirst(request, 'clutch-api-v1')
    } else if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2)$/)) {
      // Static assets - cache first
      return cacheManager.strategies.cacheFirst(request, 'clutch-static-v1')
    } else {
      // HTML pages - stale while revalidate
      return cacheManager.strategies.staleWhileRevalidate(request, 'clutch-dynamic-v1')
    }
  },

  // Background sync event
  sync: async (event: any): Promise<void> => {
    const backgroundSync = BackgroundSyncManager.getInstance()
    await backgroundSync.handleBackgroundSync(event)
  },

  // Push event
  push: async (event: any): Promise<void> => {
    const pushManager = PushNotificationManager.getInstance()
    await pushManager.handlePushMessage(event)
  },

  // Notification click event
  notificationclick: async (event: any): Promise<void> => {
    const pushManager = PushNotificationManager.getInstance()
    await pushManager.handleNotificationClick(event)
  }
}

// Initialize service worker
export function initializeServiceWorker(): void {
  if (typeof window === 'undefined') return

  // Register service worker
  registerServiceWorker()

  // Setup offline manager
  const offlineManager = OfflineManager.getInstance()
  offlineManager.setupOnlineOfflineHandlers()

  // Request notification permission
  const pushManager = PushNotificationManager.getInstance()
  pushManager.requestPermission()
}
