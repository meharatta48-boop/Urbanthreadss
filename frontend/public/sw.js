/**
 * Enhanced Service Worker for Urban Thread PWA
 * Handles offline caching, push notifications, and advanced PWA features
 */

const CACHE_NAME = 'urban-thread-images-v1';
const ASSETS_CACHE = 'urban-thread-assets-v1';
const DYNAMIC_CACHE = 'urban-thread-dynamic-v1';
const OFFLINE_CACHE = 'urban-thread-offline-v1';
const NETWORK_TIMEOUT = 5000;
const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB

// Critical assets to cache immediately
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// API endpoints that should be cached
const CACHEABLE_API_PATTERNS = [
  '/api/products',
  '/api/categories',
  '/api/settings'
];

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');
  
  event.waitUntil(
    Promise.all([
      // Cache critical assets
      caches.open(ASSETS_CACHE).then((cache) => {
        return cache.addAll(CRITICAL_ASSETS);
      }),
      
      // Cache offline page
      caches.open(OFFLINE_CACHE).then((cache) => {
        return cache.put('/offline', new Response(
          `<!DOCTYPE html>
          <html>
            <head>
              <title>Offline - Urban Thread</title>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  min-height: 100vh;
                  margin: 0;
                  background: #f8f9fa;
                  color: #333;
                  text-align: center;
                }
                .container {
                  max-width: 400px;
                  padding: 2rem;
                  background: white;
                  border-radius: 12px;
                  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                .icon {
                  font-size: 4rem;
                  margin-bottom: 1rem;
                }
                h1 {
                  margin: 0 0 1rem 0;
                  color: #c9a84c;
                }
                p {
                  margin: 0 0 1.5rem 0;
                  color: #666;
                }
                .btn {
                  display: inline-block;
                  padding: 0.75rem 1.5rem;
                  background: #c9a84c;
                  color: white;
                  text-decoration: none;
                  border-radius: 6px;
                  font-weight: 500;
                  transition: background 0.2s;
                }
                .btn:hover {
                  background: #b3983d;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="icon">🛍️</div>
                <h1>You're Offline</h1>
                <p>It looks like you've lost your internet connection. Don't worry - you can still browse your cached content.</p>
                <button class="btn" onclick="window.location.reload()">Try Again</button>
              </div>
            </body>
          </html>`,
          {
            headers: {
              'Content-Type': 'text/html',
              'Cache-Control': 'no-cache'
            }
          }
        ));
      })
    ])
  );
  
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (![CACHE_NAME, ASSETS_CACHE, DYNAMIC_CACHE, OFFLINE_CACHE].includes(cacheName)) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Take control of all open pages
      self.clients.claim()
    ])
  );
});

// Fetch event - handle different strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and Chrome extensions
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle different request types
  if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request));
  } else if (isAPIRequest(request)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isNavigationRequest(request)) {
    event.respondWith(handleNavigationRequest(request));
  } else {
    event.respondWith(handleGeneralRequest(request));
  }
});

// Request type checkers
function isImageRequest(request) {
  return request.destination === 'image' || 
         request.url.match(/\.(jpg|jpeg|png|gif|webp|svg|avif)$/i);
}

function isAPIRequest(request) {
  return request.url.includes('/api/') || 
         CACHEABLE_API_PATTERNS.some(pattern => request.url.includes(pattern));
}

function isNavigationRequest(request) {
  return request.mode === 'navigate' || 
         (request.destination === 'document' && request.url.includes(self.location.origin));
}

// Request handlers
async function handleImageRequest(request) {
  try {
    // Cache first strategy for images
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Fetch from network
    const networkResponse = await fetch(request, { 
      signal: AbortSignal.timeout(NETWORK_TIMEOUT) 
    });

    if (networkResponse && networkResponse.status === 200) {
      // Cache the response
      const responseToCache = networkResponse.clone();
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, responseToCache);
      
      // Check cache size and clean if necessary
      await cleanCacheIfNeeded(CACHE_NAME);
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Image request failed, trying cache:', error);
    return caches.match(request) || new Response('Image not available offline', { status: 404 });
  }
}

async function handleAPIRequest(request) {
  try {
    // Network first for API requests with short timeout
    const networkResponse = await fetch(request, { 
      signal: AbortSignal.timeout(3000) 
    });

    if (networkResponse && networkResponse.status === 200) {
      // Cache successful GET requests
      if (request.method === 'GET') {
        const responseToCache = networkResponse.clone();
        const cache = await caches.open(DYNAMIC_CACHE);
        await cache.put(request, responseToCache);
      }
      
      return networkResponse;
    }
  } catch (error) {
    console.log('[SW] API request failed, trying cache:', error);
    
    // Try cache for GET requests
    if (request.method === 'GET') {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        // Add header to indicate cached response
        const headers = new Headers(cachedResponse.headers);
        headers.set('X-Cached-By', 'service-worker');
        
        return new Response(cachedResponse.body, {
          status: cachedResponse.status,
          statusText: cachedResponse.statusText,
          headers
        });
      }
    }
    
    // Return offline response for API errors
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'No internet connection',
        cached: false 
      }), 
      { 
        status: 503, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}

async function handleNavigationRequest(request) {
  try {
    // Network first for navigation
    const networkResponse = await fetch(request, { 
      signal: AbortSignal.timeout(NETWORK_TIMEOUT) 
    });

    if (networkResponse && networkResponse.status === 200) {
      // Cache successful responses
      const responseToCache = networkResponse.clone();
      const cache = await caches.open(ASSETS_CACHE);
      await cache.put(request, responseToCache);
      
      return networkResponse;
    }
  } catch (error) {
    console.log('[SW] Navigation request failed, trying cache:', error);
    
    // Try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page
    return caches.match('/offline');
  }
}

async function handleGeneralRequest(request) {
  try {
    // Network first with fallback to cache
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      // Cache successful responses
      const responseToCache = networkResponse.clone();
      const cache = await caches.open(DYNAMIC_CACHE);
      await cache.put(request, responseToCache);
      
      return networkResponse;
    }
  } catch (error) {
    console.log('[SW] General request failed, trying cache:', error);
    return caches.match(request);
  }
}

// Cache management
async function cleanCacheIfNeeded(cacheName) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  // Estimate cache size (rough calculation)
  let totalSize = 0;
  for (const request of keys) {
    const response = await cache.match(request);
    if (response) {
      const responseClone = response.clone();
      const buffer = await responseClone.arrayBuffer();
      totalSize += buffer.byteLength;
    }
  }
  
  // If cache is too large, remove oldest entries
  if (totalSize > MAX_CACHE_SIZE) {
    console.log('[SW] Cache size exceeded, cleaning up');
    const entriesToRemove = Math.ceil(keys.length * 0.2); // Remove 20%
    
    for (let i = 0; i < entriesToRemove; i++) {
      await cache.delete(keys[i]);
    }
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event:', event.tag);
  
  if (event.tag === 'background-sync-cart') {
    event.waitUntil(syncCartItems());
  }
});

async function syncCartItems() {
  try {
    // Get offline cart items from IndexedDB
    const offlineCart = await getOfflineCartItems();
    
    if (offlineCart.length > 0) {
      // Sync with server
      const response = await fetch('/api/cart/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: offlineCart })
      });
      
      if (response.ok) {
        // Clear offline cart after successful sync
        await clearOfflineCart();
        
        // Notify all clients about the sync
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({ type: 'CART_SYNCED', success: true });
        });
      }
    }
  } catch (error) {
    console.error('[SW] Failed to sync cart items:', error);
  }
}

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: 'You have a new notification from Urban Thread',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore',
        icon: '/icons/explore.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/close.png'
      }
    ]
  };

  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.title = data.title || 'Urban Thread';
    options.image = data.image;
    options.tag = data.tag;
    options.url = data.url;
  }

  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click received');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/shop')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    return;
  } else {
    // Default behavior - open the app
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/')
    );
  }
});

// Message handler for client communication
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: '1.0.0' });
  }
  
  if (event.data && event.data.type === 'FORCE_REFRESH') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        return Promise.all(
          clients.map((client) => client.navigate(client.url))
        );
      })
    );
  }
});

// IndexedDB helpers for offline storage
async function getOfflineCartItems() {
  // This would integrate with your IndexedDB setup
  // For now, return empty array
  return [];
}

async function clearOfflineCart() {
  // This would clear IndexedDB cart items
  return true;
}

// Periodic cache cleanup
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PERIODIC_CLEANUP') {
    event.waitUntil(
      Promise.all([
        cleanCacheIfNeeded(CACHE_NAME),
        cleanCacheIfNeeded(DYNAMIC_CACHE)
      ])
    );
  }
});
