/**
 * FINAL FIXED Service Worker for Urban Thread PWA
 * Fixes: Google Fonts crash, Render 503 Timeout, and TypeError responses.
 */

const CACHE_NAME = 'urban-thread-images-v2';
const ASSETS_CACHE = 'urban-thread-assets-v2';
const DYNAMIC_CACHE = 'urban-thread-dynamic-v2';
const OFFLINE_CACHE = 'urban-thread-offline-v2';

const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.png'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(ASSETS_CACHE).then((cache) => cache.addAll(CRITICAL_ASSETS))
  );
  self.skipWaiting();
});

// Activate Event - Purana kachra saaf karne ke liye
self.addEventListener('activate', (event) => {
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

// Fetch Event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Google Fonts Fix (Opaque responses bypass)
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    );
    return;
  }

  // 2. API Requests Fix (Render 503 Timeout handling)
  if (url.pathname.includes('/api/')) {
    event.respondWith(handleAPIRequest(request));
    return;
  }

  // 3. Static Assets & Images
  event.respondWith(
    caches.match(request).then((cached) => {
      return cached || fetch(request).then((response) => {
        if (response.status === 200) {
          const copy = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      }).catch(() => caches.match('/offline'));
    })
  );
});

// Safe API Handler
async function handleAPIRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);

  try {
    // 10 Seconds ka timeout (Render free tier k liye zaroori hai)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const networkResponse = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (networkResponse.ok) {
      if (request.method === 'GET') {
        cache.put(request, networkResponse.clone()).catch(() => { });
      }
      return networkResponse;
    }

    throw new Error("Server Error");

  } catch (error) {
    console.warn('[SW] API Failed, checking cache...', error.message);

    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;

    // AGAR KUCH NAHI MILA TO CRASH NAHI HONA - VALID RESPONSE DENA HAI
    return new Response(
      JSON.stringify({
        success: false,
        message: "Backend is waking up (Render Sleep Mode). Please refresh in 10 seconds.",
        is_sw_fallback: true
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}