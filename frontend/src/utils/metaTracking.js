/**
 * Meta Pixel and Conversion API integration for URBAN THREADS
 * Handles Facebook/Instagram ads tracking and conversion events
 */

const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || null; // Set in environment variables
const API_URL = import.meta.env.VITE_API_URL || "https://urbanthreadss.onrender.com/api";

class MetaTracker {
  constructor() {
    this.pixelId = PIXEL_ID;
    this.loaded = false;
    this.queue = [];
  }

  // Initialize Meta Pixel
  init() {
    if (typeof window === 'undefined') return;
    if (!this.pixelId) return;

    // Load Facebook Pixel script
    (function(f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function() {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    // Initialize pixel
    window.fbq('init', this.pixelId);
    window.fbq('track', 'PageView');

    this.loaded = true;

    // Process queued events
    this.queue.forEach(event => this.track(...event));
    this.queue = [];
  }

  trackPageView() {
    this.track("PageView");
  }

  // Track custom events
  track(event, parameters = {}) {
    if (!this.pixelId) return;
    if (!this.loaded) {
      this.queue.push([event, parameters]);
      return;
    }

    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', event, parameters);
    }
  }

  async trackServerEvent(eventName, payload = {}) {
    try {
      await fetch(`${API_URL}/meta/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName,
          ...payload,
          eventSourceUrl: typeof window !== "undefined" ? window.location.href : undefined,
        }),
      });
    } catch {
      // Keep user flow unaffected if CAPI is not available
    }
  }

  // Track AddToCart
  trackAddToCart(product, quantity = 1, price) {
    const customData = {
      content_name: product.name,
      content_ids: [product._id],
      content_type: 'product',
      value: price,
      currency: 'PKR',
      quantity: quantity
    };
    this.track('AddToCart', customData);
    this.trackServerEvent("AddToCart", { customData });
  }

  // Track Purchase
  trackPurchase(orderId, total, products, currency = 'PKR') {
    const contentIds = products.map(p => p.product?._id || p._id);

    const customData = {
      content_ids: contentIds,
      content_type: 'product',
      value: total,
      currency: currency,
      order_id: orderId
    };
    this.track('Purchase', customData);
    this.trackServerEvent("Purchase", {
      eventId: `purchase_${orderId}`,
      customData,
    });
  }

  // Track ViewContent (Product view)
  trackViewContent(product) {
    this.track('ViewContent', {
      content_name: product.name,
      content_ids: [product._id],
      content_type: 'product',
      value: product.price,
      currency: 'PKR'
    });
  }

  // Track InitiateCheckout
  trackInitiateCheckout(cartItems, total) {
    const contentIds = cartItems.map(item => item.product?._id);

    const customData = {
      content_ids: contentIds,
      content_type: 'product',
      value: total,
      currency: 'PKR',
      num_items: cartItems.length
    };
    this.track('InitiateCheckout', customData);
    this.trackServerEvent("InitiateCheckout", { customData });
  }

  // Track Search
  trackSearch(searchTerm, resultsCount) {
    this.track('Search', {
      search_string: searchTerm,
      content_type: 'product',
      content_category: 'search'
    });
  }

  // Track custom conversion events
  trackCustom(eventName, parameters = {}) {
    this.track(eventName, parameters);
  }
}

// Conversion API for server-side tracking
export class MetaConversionAPI {
  constructor(accessToken, pixelId) {
    this.accessToken = accessToken;
    this.pixelId = pixelId;
    this.apiVersion = 'v18.0';
  }

  async sendEvent(eventName, userData, customData, eventId) {
    const url = `https://graph.facebook.com/${this.apiVersion}/${this.pixelId}/events`;

    const payload = {
      data: [{
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        user_data: userData,
        custom_data: customData,
        event_id: eventId
      }],
      access_token: this.accessToken
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      return await response.json();
    } catch (error) {
      console.error('Meta Conversion API error:', error);
      return null;
    }
  }

  // Server-side purchase tracking
  async trackPurchase(orderId, userEmail, total, products) {
    const userData = {
      em: this.hash(userEmail), // Hash email for privacy
    };

    const customData = {
      value: total,
      currency: 'PKR',
      content_ids: products.map(p => p._id),
      content_type: 'product',
      order_id: orderId
    };

    return this.sendEvent('Purchase', userData, customData, `purchase_${orderId}`);
  }
}

// Hash function for Conversion API
MetaConversionAPI.prototype.hash = function(str) {
  // Simple hash for demo - use proper SHA256 in production
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString();
};

export const metaTracker = new MetaTracker();