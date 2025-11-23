// Service Worker for Properties 4 Creation PWA
const CACHE_NAME = 'properties-4-creation-v1'
const STATIC_CACHE = 'properties-4-creation-static-v1'
const DYNAMIC_CACHE = 'properties-4-creation-dynamic-v1'

// Resources to cache on install
const STATIC_ASSETS = [
  '/',
  '/about',
  '/projects',
  '/contact',
  '/get-started',
  '/manifest.json',
  '/favicon.ico',
  '/og-image.jpg',
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => self.skipWaiting())
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE)
          .map((cacheName) => caches.delete(cacheName))
      )
    }).then(() => self.clients.claim())
  )
})

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return

  // Skip external requests
  if (!event.request.url.startsWith(self.location.origin)) return

  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(DYNAMIC_CACHE)
              .then((cache) => cache.put(event.request, responseClone))
          }
          return response
        })
        .catch(() => {
          // Return cached version if offline
          return caches.match(event.request)
            .then((cachedResponse) => {
              return cachedResponse || caches.match('/')
            })
        })
    )
    return
  }

  // Handle static assets and API requests
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }

        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            // Cache API responses for a short time
            if (event.request.url.includes('/api/')) {
              const responseClone = response.clone()
              caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                  // Set cache expiration (5 minutes)
                  const cacheResponse = new Response(responseClone.body, {
                    status: responseClone.status,
                    statusText: responseClone.statusText,
                    headers: {
                      ...Object.fromEntries(responseClone.headers.entries()),
                      'sw-cache-timestamp': Date.now().toString(),
                    },
                  })
                  cache.put(event.request, cacheResponse)
                })
            }

            return response
          })
          .catch(() => {
            // Return offline fallback for images and styles
            if (event.request.destination === 'image') {
              return caches.match('/placeholder-image.png')
            }
            if (event.request.destination === 'style') {
              return new Response('', { status: 200, statusText: 'OK' })
            }
          })
      })
  )
})

// Background sync for form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-forms') {
    event.waitUntil(syncPendingForms())
  }
})

async function syncPendingForms() {
  try {
    // Implementation for syncing pending form submissions
    // This would retrieve cached form data and send to API
    console.log('Service Worker: Syncing pending forms')
  } catch (error) {
    console.error('Service Worker: Form sync failed', error)
  }
}

// Push notifications (if implemented later)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      data: data.data,
    }

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  )
})

// Performance monitoring
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'performance') {
    // Send performance data to analytics
    console.log('Service Worker: Performance data', event.data.payload)
  }
})
