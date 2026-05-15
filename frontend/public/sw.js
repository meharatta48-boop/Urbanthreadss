/**
 * Enhanced & Fixed Service Worker for Urban Thread PWA
 * Handles offline caching, push notifications, and advanced PWA features
 */

const CACHE_NAME = 'urban-thread-images-v1';
const ASSETS_CACHE = 'urban-thread-assets-v1';
const DYNAMIC_CACHE = 'urban-thread-dynamic-v1';
const OFFLINE_CACHE = 'urban-thread-offline-v1';
const NETWORK_TIMEOUT = 5000;
const MAX_CACHE_ITEMS = 50; // Performance ke liye arrayBuffer calculation ko simple entries count se badla

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
      caches.open(ASSETS_CACHE).then((cache) => {
        return cache.addAll(CRITICAL_ASSETS);
      }),

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
      self.clients.claim()
    ])
  );
});

// Fetch event - handle different strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // Google Fonts Check (Fixes TypeError Response Error)
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(handleFontRequest(request));
    return;
  }

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

// FIX: Font requests handler (Handles opaque responses safely)
async function handleFontRequest(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) return cachedResponse;

  try {
    const networkResponse = await fetch(request);
    // Fonts opaque status 0 dete hain jise standard code reject karta h, yahan allow kia h
    if (networkResponse) {
      const responseToCache = networkResponse.clone();
      const cache = await caches.open(ASSETS_CACHE);
      await cache.put(request, responseToCache);
    }
    return networkResponse;
  } catch {
    return new Response("", { status: 408, statusText: "Font Timeout" });
  }
}

async function handleImageRequest(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request, {
      signal: AbortSignal.timeout(NETWORK_TIMEOUT)
    });

    if (networkResponse && networkResponse.status === 200) {
      const responseToCache = networkResponse.clone();
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, responseToCache);

      // Fast trim execution
      event.waitUntil(trimCache(CACHE_NAME, MAX_CACHE_ITEMS));
    }

    return networkResponse;
  } catch {
    return caches.match(request) || new Response('Image not available offline', { status: 404 });
  }
}

async function handleAPIRequest(request) {
  try {
    const networkResponse = await fetch(request, {
      signal: AbortSignal.timeout(4000) // 3s se barha kar 4s kia backend delay mitigation k liye
    });

    if (networkResponse && networkResponse.status === 200) {
      if (request.method === 'GET') {
        const responseToCache = networkResponse.clone();
        const cache = await caches.open(DYNAMIC_CACHE);
        await cache.put(request, responseToCache);
      }
      return networkResponse;
    }

    // Status 503 fallback
    throw new Error("Server temporary down");
  } catch (error) {
    console.log('[SW] API request failed, trying cache:', error);

    if (request.method === 'GET') {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        const headers = new Headers(cachedResponse.headers);
        headers.set('X-Cached-By', 'service-worker');

        return new Response(cachedResponse.body, {
          status: cachedResponse.status,
          statusText: cachedResponse.statusText,
          headers
        });
      }
    }

    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'No internet connection or server is currently sleeping. Please retry.',
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
    const networkResponse = await fetch(request, {
      signal: AbortSignal.timeout(NETWORK_TIMEOUT)
    });

    if (networkResponse && networkResponse.status === 200) {
      const responseToCache = networkResponse.clone();
      const cache = await caches.open(ASSETS_CACHE);
      await cache.put(request, responseToCache);
      return networkResponse;
    }
  } catch {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return caches.match('/offline');
  }
}

async function handleGeneralRequest(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const responseToCache = networkResponse.clone();
      const cache = await caches.open(DYNAMIC_CACHE);
      await cache.put(request, responseToCache);
      return networkResponse;
    }
  } catch {
    return caches.match(request);
  }
}

// FIX: Trim entries instead of calculating dynamic byte sizes synchronously (Abort error fix)
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    const overflow = keys.length - maxItems;
    for (let i = 0; i < overflow; i++) {
      await cache.delete(keys[i]);
    }
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-cart') {
    event.waitUntil(syncCartItems());
  }
});

async function syncCartItems() {
  try {
    const offlineCart = await getOfflineCartItems();
    if (offlineCart.length > 0) {
      const response = await fetch('/api/cart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: offlineCart })
      });

      if (response.ok) {
        await clearOfflineCart();
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
  const options = {
    body: 'You have a new notification from Urban Thread',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: { dateOfArrival: Date.now(), primaryKey: 1 },
    actions: [
      { action: 'explore', title: 'Explore' },
      { action: 'close', title: 'Close' }
    ]
  };

  if (event.data) {
    try {
      const data = event.data.json();
      options.body = data.body || options.body;
      options.title = data.title || 'Urban Thread';
      options.image = data.image;
      options.tag = data.tag;
      options.url = data.url;
    } catch {
      options.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(options.title || 'Urban Thread', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      self.clients.openWindow(event.notification.data?.url || '/shop')
    );
  } else {
    event.waitUntil(
      self.clients.openWindow(event.notification.data?.url || '/')
    );
  }
});

// Message handler for client communication
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: '1.0.1' });
  }
  if (event.data.type === 'FORCE_REFRESH') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        return Promise.all(clients.map((client) => client.navigate(client.url)));
      })
    );
  }
  if (event.data.type === 'PERIODIC_CLEANUP') {
    event.waitUntil(
      Promise.all([
        trimCache(CACHE_NAME, MAX_CACHE_ITEMS),
        trimCache(DYNAMIC_CACHE, MAX_CACHE_ITEMS)
      ])
    );
  }
});

// IndexedDB fallbacks
async function getOfflineCartItems() { return []; }
async function clearOfflineCart() { return true; }