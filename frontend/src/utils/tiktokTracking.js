/**
 * TikTok Pixel integration for URBAN THREADS
 * Handles TikTok ads tracking and conversion events
 */

const PIXEL_ID = import.meta.env.VITE_TIKTOK_PIXEL_ID || 'D913VO3C77U7SVVMMHUG';

class TikTokTracker {
  constructor() {
    this.pixelId = PIXEL_ID;
    this.loaded = false;
    this.queue = [];
  }

  // Initialize TikTok Pixel
  init() {
    if (typeof window === 'undefined') return;

    // If window.ttq is already loaded statically, process queued events immediately
    if (window.ttq) {
      this.loaded = true;
      this.queue.forEach(event => {
        if (window.ttq) {
          if (event[0] === 'page') {
            window.ttq.page();
          } else {
            window.ttq.track(event[0], event[1]);
          }
        }
      });
      this.queue = [];
      return;
    }

    if (!this.pixelId) return;

    // Load TikTok Pixel script dynamically as fallback
    (function (w, d, t) {
      w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
      var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
      ;n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
    })(window, document, 'ttq');

    // Initialize pixel
    window.ttq.load(this.pixelId);
    window.ttq.page();

    this.loaded = true;

    // Process queued events
    this.queue.forEach(event => {
      if (event[0] === 'page') {
        window.ttq.page();
      } else {
        window.ttq.track(event[0], event[1]);
      }
    });
    this.queue = [];
  }

  trackPageView() {
    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.page();
    } else if (!this.loaded) {
      this.queue.push(['page']);
    }
  }

  // Track standard events
  track(event, parameters = {}) {
    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.track(event, parameters);
      return;
    }

    // Queue if not loaded/available yet
    if (!this.loaded) {
      this.queue.push([event, parameters]);
    }
  }

  // Track AddToCart
  trackAddToCart(product, quantity = 1, price) {
    const customData = {
      content_id: product._id,
      content_name: product.name,
      content_type: 'product',
      value: Number(price) * Number(quantity),
      currency: 'PKR',
      quantity: Number(quantity)
    };
    this.track('AddToCart', customData);
  }

  // Track CompletePayment (Purchase)
  trackPurchase(orderId, total, products, currency = 'PKR') {
    const contents = products.map(p => ({
      content_id: p.product?._id || p._id,
      content_name: p.name || p.product?.name || '',
      price: Number(p.price || 0),
      quantity: Number(p.quantity || 1)
    }));

    const customData = {
      contents: contents.length > 0 ? contents : undefined,
      content_type: 'product',
      value: Number(total),
      currency: currency
    };
    this.track('CompletePayment', customData);
  }

  // Track ViewContent (Product view)
  trackViewContent(product) {
    this.track('ViewContent', {
      content_id: product._id,
      content_name: product.name,
      content_type: 'product',
      value: Number(product.price),
      currency: 'PKR'
    });
  }

  // Track InitiateCheckout
  trackInitiateCheckout(cartItems, total) {
    const contents = cartItems.map(item => ({
      content_id: item.product?._id || item._id,
      content_name: item.name || item.product?.name || '',
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 1)
    }));

    const customData = {
      contents: contents,
      content_type: 'product',
      value: Number(total),
      currency: 'PKR'
    };
    this.track('InitiateCheckout', customData);
  }
}

export const tiktokTracker = new TikTokTracker();
