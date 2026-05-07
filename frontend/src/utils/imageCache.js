/**
 * Image Caching Strategy
 * Implements service worker caching for images and HTTP headers
 */

const CACHE_NAME = 'urban-thread-images-v1';
const CACHE_EXPIRY = 1000 * 60 * 60 * 24 * 30; // 30 days

/**
 * Register service worker for image caching
 * Call this once in your app initialization (App.jsx)
 */
export const registerImageCache = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.log('Service Worker registration failed:', err);
    });
  }
};

/**
 * Preload critical images (header logo, hero image)
 * Should be called for above-the-fold images
 */
export const preloadCriticalImages = (imageSrcs) => {
  imageSrcs.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    link.fetchPriority = 'high';
    document.head.appendChild(link);
  });
};

/**
 * Prefetch images (lower priority for below-fold images)
 * Call for images that will be needed soon
 */
export const prefetchImages = (imageSrcs) => {
  imageSrcs.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = 'image';
    link.href = src;
    link.fetchPriority = 'low';
    document.head.appendChild(link);
  });
};

/**
 * Get cached image or fetch from network
 * @param {string} src - Image URL
 * @param {number} expiryTime - Cache expiry time in milliseconds
 * @returns {Promise<string>} - Blob URL or original src
 */
export const getCachedImage = async (src, expiryTime = CACHE_EXPIRY) => {
  if (!('caches' in window)) return src;

  try {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(src);

    if (cached) {
      const cacheDate = cached.headers.get('date');
      const cacheTime = new Date(cacheDate).getTime();
      const now = new Date().getTime();

      // If cache is still fresh, use it
      if (now - cacheTime < expiryTime) {
        return URL.createObjectURL(await cached.blob());
      }
    }

    // Fetch from network and cache
    const response = await fetch(src);
    if (response.ok) {
      cache.put(src, response.clone());
      return URL.createObjectURL(await response.blob());
    }
  } catch (err) {
    console.log('Image cache error:', err);
  }

  return src;
};

/**
 * Clear image cache
 */
export const clearImageCache = () => {
  if ('caches' in window) {
    caches.delete(CACHE_NAME);
  }
};

/**
 * Add HTTP Cache-Control headers to image requests
 * This should be configured on your backend for image endpoints
 * 
 * Headers to set:
 * - Cache-Control: public, max-age=2592000 (30 days)
 * - ETag: (for cache validation)
 * - Last-Modified: (for browser caching)
 * 
 * Example (Express backend):
 * app.get('/uploads/*', (req, res) => {
 *   res.set('Cache-Control', 'public, max-age=2592000');
 *   res.set('ETag', getFileETag(req.path));
 *   // ... serve file
 * });
 */

export default {
  registerImageCache,
  preloadCriticalImages,
  prefetchImages,
  getCachedImage,
  clearImageCache,
};
