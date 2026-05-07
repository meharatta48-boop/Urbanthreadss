/**
 * Service Worker for Image Caching
 * Place this file in /public/sw.js
 * Handles offline caching and aggressive image caching strategies
 */

const CACHE_NAME = 'urban-thread-images-v1';
const ASSETS_CACHE = 'urban-thread-assets-v1';
const NETWORK_TIMEOUT = 5000; // 5 seconds

// Cache static assets on install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(ASSETS_CACHE).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
      ]);
    })
  );
  self.skipWaiting();
});

// Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== ASSETS_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch strategy: Network first for HTML/JS, Cache first for images
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Image requests - Cache first, fallback to network
  if (request.destination === 'image' || url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) return response;

        return fetch(request, { signal: AbortSignal.timeout(NETWORK_TIMEOUT) })
          .then((response) => {
            if (!response || response.status !== 200) {
              return response;
            }

            // Clone the response and add to cache
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });

            return response;
          })
          .catch(() => {
            // Return cached image if available
            return caches.match(request);
          });
      })
    );
    return;
  }

  // HTML/JS/CSS - Network first, fallback to cache
  if (request.destination === 'document' || request.destination === 'script' || request.destination === 'style') {
    event.respondWith(
      fetch(request, { signal: AbortSignal.timeout(NETWORK_TIMEOUT) })
        .then((response) => {
          if (!response || response.status !== 200) {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(ASSETS_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // Default strategy - Network first
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request);
    })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
