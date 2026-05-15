/**
 * URBAN THREAD - FULLY UPDATED SERVICE WORKER
 * Version: 2.1.0
 * Fixes: Render 503 Timeout, Google Fonts Crash, Slow Image Loading
 * Includes: Push Notifications, Background Sync, Offline Fallbacks
 */

const CACHE_NAME = 'urban-thread-images-v3';
const ASSETS_CACHE = 'urban-thread-assets-v3';
const DYNAMIC_CACHE = 'urban-thread-dynamic-v3';
const OFFLINE_CACHE = 'urban-thread-offline-v3';
const NETWORK_TIMEOUT = 10000; // Increased to 10s for Render wake-up
const MAX_CACHE_ITEMS = 60; // Fast limit for performance
const MAX_DYNAMIC_ITEMS = 50;

// Critical assets to cache immediately
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// API patterns for caching
const CACHEABLE_API_PATTERNS = [
  '/api/products',
  '/api/categories',
  '/api/settings',
  '/api/stats/advanced'
];

// --- INSTALL EVENT ---
self.addEventListener('install', (event) => {
  console.log('[SW] Installing updated service worker');
  event.waitUntil(
    Promise.all([
      caches.open(ASSETS_CACHE).then((cache) => cache.addAll(CRITICAL_ASSETS)),
      caches.open(OFFLINE_CACHE).then((cache) => {
        return cache.put('/offline', new Response(
          `<!DOCTYPE html><html><head><title>Offline - Urban Thread</title>
          <style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f8f9fa;text-align:center;}
          .container{max-width:400px;padding:2rem;background:white;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);}
          h1{color:#c9a84c;} .btn{display:inline-block;padding:0.75rem 1.5rem;background:#c9a84c;color:white;text-decoration:none;border-radius:6px;}</style></head>
          <body><div class="container"><h1>You're Offline</h1><p>Internet connection lost. You can still browse cached items.</p>
          <button class="btn" onclick="window.location.reload()">Try Again</button></div></body></html>`,
          { headers: { 'Content-Type': 'text/html' } }
        ));
      })
    ])
  );
  self.skipWaiting();
});

// --- ACTIVATE EVENT ---
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating & Cleaning Old Caches');
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => {
        if (![CACHE_NAME, ASSETS_CACHE, DYNAMIC_CACHE, OFFLINE_CACHE].includes(key)) {
          return caches.delete(key);
        }
      })
    )).then(() => self.clients.claim())
  );
});

// --- FETCH EVENT ---
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') return;

  // 1. Google Fonts Fix (Opaque Handling)
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(handleGeneralRequest(request, ASSETS_CACHE));
    return;
  }

  // 2. API Requests (Render Timeout Fix)
  if (isAPIRequest(request)) {
    event.respondWith(handleAPIRequest(request));
    return;
  }

  // 3. Images (Speed Optimization - Cache First)
  if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request));
    return;
  }

  // 4. Navigation & Others
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
  } else {
    event.respondWith(handleGeneralRequest(request, DYNAMIC_CACHE));
  }
});

// --- LOGIC HANDLERS ---

function isImageRequest(request) {
  return request.destination === 'image' || request.url.match(/\.(jpg|jpeg|png|gif|webp|svg|avif)$/i);
}

function isAPIRequest(request) {
  return request.url.includes('/api/') || CACHEABLE_API_PATTERNS.some(p => request.url.includes(p));
}

async function handleImageRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      limitCacheSize(CACHE_NAME, MAX_CACHE_ITEMS);
    }
    return networkResponse;
  } catch {
    return cached || new Response('Offline', { status: 404 });
  }
}

async function handleAPIRequest(request) {
  try {
    const controller = new AbortController();
    const tId = setTimeout(() => controller.abort(), NETWORK_TIMEOUT);

    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(tId);

    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
      return response;
    }
    throw new Error('API Fail');
  } catch {
    const cached = await caches.match(request);
    if (cached) {
      const headers = new Headers(cached.headers);
      headers.set('X-Cached-By', 'sw-fallback');
      return new Response(cached.body, { status: 200, headers });
    }
    return new Response(JSON.stringify({ success: false, message: "Backend waking up..." }), {
      status: 503, headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleNavigationRequest(request) {
  try {
    return await fetch(request, { signal: AbortSignal.timeout(5000) });
  } catch {
    return (await caches.match(request)) || caches.match('/offline');
  }
}

async function handleGeneralRequest(request, cacheName) {
  const cached = await caches.match(request);
  try {
    const network = await fetch(request);
    if (network.ok || network.type === 'opaque') {
      const cache = await caches.open(cacheName);
      cache.put(request, network.clone());
    }
    return network;
  } catch {
    return cached || (request.mode === 'navigate' ? caches.match('/offline') : null);
  }
}

// Optimized Cache Management (Faster than ArrayBuffer loop)
async function limitCacheSize(name, max) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  if (keys.length > max) {
    await cache.delete(keys[0]);
  }
}

// --- BACKGROUND SYNC ---
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-cart') {
    event.waitUntil(syncCartItems());
  }
});

async function syncCartItems() {
  try {
    const offlineCart = []; // Integration point for IndexedDB
    if (offlineCart.length > 0) {
      await fetch('/api/cart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: offlineCart })
      });
    }
  } catch (e) { console.error('Sync failed', e); }
}

// --- PUSH NOTIFICATIONS ---
self.addEventListener('push', (event) => {
  let data = { title: 'Urban Thread', body: 'New notification!' };
  if (event.data) {
    try { data = event.data.json(); } catch { data.body = event.data.text(); }
  }
  event.waitUntil(self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    data: { url: data.url || '/' }
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow(event.notification.data?.url || '/'));
});

// --- MESSAGE HANDLER ---
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data?.type === 'PERIODIC_CLEANUP') {
    limitCacheSize(CACHE_NAME, MAX_CACHE_ITEMS);
    limitCacheSize(DYNAMIC_CACHE, MAX_DYNAMIC_ITEMS);
  }
});