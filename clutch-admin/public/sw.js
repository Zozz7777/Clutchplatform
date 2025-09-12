// Service Worker for Clutch Admin
const CACHE_NAME = 'clutch-admin-v1'
const STATIC_CACHE = 'clutch-static-v1'
const DYNAMIC_CACHE = 'clutch-dynamic-v1'

// Files to cache for offline support
const STATIC_FILES = [
  '/',
  '/dashboard',
  '/login',
  '/manifest.json',
  '/offline.html'
]

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/v1\/auth\/me/,
  /\/api\/v1\/dashboard\/stats/,
  /\/api\/v1\/users\/profile/
]

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static files...')
        return cache.addAll(STATIC_FILES)
      })
      .then(() => {
        console.log('Static files cached successfully')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('Failed to cache static files:', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Service Worker activated')
        return self.clients.claim()
      })
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Handle different types of requests
  if (isStaticFile(request)) {
    // Static files - cache first strategy
    event.respondWith(cacheFirst(request))
  } else if (isAPIRequest(request)) {
    // API requests - network first with cache fallback
    event.respondWith(networkFirst(request))
  } else if (isImageRequest(request)) {
    // Images - cache first with network fallback
    event.respondWith(cacheFirst(request))
  } else {
    // Other requests - network first
    event.respondWith(networkFirst(request))
  }
})

// Cache first strategy
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.error('Cache first strategy failed:', error)
    return new Response('Offline content not available', {
      status: 503,
      statusText: 'Service Unavailable'
    })
  }
}

// Network first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Network failed, trying cache:', error)
    
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html')
    }
    
    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable'
    })
  }
}

// Helper functions
function isStaticFile(request) {
  const url = new URL(request.url)
  return url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.png') ||
         url.pathname.endsWith('.jpg') ||
         url.pathname.endsWith('.jpeg') ||
         url.pathname.endsWith('.gif') ||
         url.pathname.endsWith('.svg') ||
         url.pathname.endsWith('.ico') ||
         url.pathname.endsWith('.woff') ||
         url.pathname.endsWith('.woff2')
}

function isAPIRequest(request) {
  const url = new URL(request.url)
  return url.pathname.startsWith('/api/')
}

function isImageRequest(request) {
  const url = new URL(request.url)
  return url.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag)
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  try {
    // Get pending actions from IndexedDB
    const pendingActions = await getPendingActions()
    
    for (const action of pendingActions) {
      try {
        await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body
        })
        
        // Remove from pending actions
        await removePendingAction(action.id)
        console.log('Synced action:', action.id)
      } catch (error) {
        console.error('Failed to sync action:', action.id, error)
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event)
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from Clutch Admin',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-192x192.png'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('Clutch Admin', options)
  )
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)
  
  event.notification.close()
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    )
  } else if (event.action === 'close') {
    // Just close the notification
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// IndexedDB helpers for offline storage
async function getPendingActions() {
  // This would interact with IndexedDB to get pending actions
  // For now, return empty array
  return []
}

async function removePendingAction(actionId) {
  // This would remove the action from IndexedDB
  console.log('Removing pending action:', actionId)
}

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME })
  }
})

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('Periodic sync triggered:', event.tag)
  
  if (event.tag === 'content-sync') {
    event.waitUntil(doPeriodicSync())
  }
})

async function doPeriodicSync() {
  try {
    // Sync critical data periodically
    console.log('Performing periodic sync...')
    
    // This would sync important data like user preferences, cached content, etc.
    const criticalEndpoints = [
      '/api/v1/auth/me',
      '/api/v1/dashboard/stats'
    ]
    
    for (const endpoint of criticalEndpoints) {
      try {
        const response = await fetch(endpoint)
        if (response.ok) {
          const cache = await caches.open(DYNAMIC_CACHE)
          cache.put(endpoint, response.clone())
        }
      } catch (error) {
        console.error('Failed to sync endpoint:', endpoint, error)
      }
    }
  } catch (error) {
    console.error('Periodic sync failed:', error)
  }
}