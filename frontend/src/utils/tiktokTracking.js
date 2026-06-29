/**
 * TikTok Pixel integration for URBAN THREADS
 * Handles TikTok ads tracking, advanced matching (PII), and conversion events
 */

const PIXEL_ID = import.meta.env.VITE_TIKTOK_PIXEL_ID || 'D913VO3C77U7SVVMMHUG';

// Lightweight synchronous SHA-256 hash function in pure JS
function sha256(ascii) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }
  
  var mathPow = Math.pow;
  var maxWord = mathPow(2, 32);
  var lengthProperty = 'length';
  var i, j;

  var result = '';

  var words = [];
  var asciiLength = ascii[lengthProperty] * 8;
  
  var hash = sha256.h = sha256.h || [];
  var k = sha256.k = sha256.k || [];
  var primeCounter = k[lengthProperty];

  var isPrime = {};
  for (var candidate = 2; primeCounter < 64; candidate++) {
    if (!isPrime[candidate]) {
      for (i = 0; i < 313; i += candidate) {
        isPrime[i] = 1;
      }
      hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1/3) * maxWord) | 0;
    }
  }
  
  ascii += '\x80';
  while (ascii[lengthProperty] % 64 - 56) ascii += '\x00';
  for (i = 0; i < ascii[lengthProperty]; i++) {
    j = ascii.charCodeAt(i);
    if (j >> 8) return; // Only accept characters in range 0-255
    words[i >> 2] |= j << (24 - (i % 4) * 8);
  }
  words[words[lengthProperty]] = ((asciiLength / maxWord) | 0);
  words[words[lengthProperty]] = (asciiLength | 0);
  
  for (j = 0; j < words[lengthProperty];) {
    var w = words.slice(j, j += 16);
    var oldHash = hash.slice(0);
    
    hash = hash.slice(0, 8);
    
    for (i = 0; i < 64; i++) {
      var w15 = w[i - 15], w2 = w[i - 2];

      var s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
      var s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
      var ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      var maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      
      var temp1 = hash[7] + (rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25)) + ch + k[i] + (w[i] = (i < 16 ? w[i] : (w[i - 16] + s0 + w[i - 7] + s1) | 0));
      var temp2 = (rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22)) + maj;
      
      hash = [(temp1 + temp2) | 0].concat(hash); 
      hash[4] = (hash[4] + temp1) | 0;
    }
    
    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }
  
  for (i = 0; i < 8; i++) {
    var val = hash[i];
    if (val < 0) val += maxWord;
    var hex = val.toString(16);
    while (hex[lengthProperty] < 8) hex = '0' + hex;
    result += hex;
  }
  return result;
}

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
          } else if (event[0] === 'identify') {
            window.ttq.identify(event[1]);
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
      } else if (event[0] === 'identify') {
        window.ttq.identify(event[1]);
      } else {
        window.ttq.track(event[0], event[1]);
      }
    });
    this.queue = [];
  }

  // Advanced Matching to identify user before sending events
  identifyUser(userInfo) {
    if (!userInfo) return;

    const email = userInfo.email;
    const phone = userInfo.phone || userInfo.phone_number;
    const externalId = userInfo._id || userInfo.id;

    const identifyData = {};
    if (email && typeof email === 'string') {
      identifyData.email = sha256(email.trim().toLowerCase());
    }
    if (phone && typeof phone === 'string') {
      const cleanPhone = phone.trim().replace(/[^0-9+]/g, '');
      identifyData.phone_number = sha256(cleanPhone);
    }
    if (externalId) {
      identifyData.external_id = sha256(String(externalId));
    }

    if (Object.keys(identifyData).length > 0) {
      if (typeof window !== 'undefined' && window.ttq) {
        window.ttq.identify(identifyData);
      } else {
        this.queue.push(['identify', identifyData]);
      }
    }
  }

  trackPageView() {
    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.page();
    } else if (!this.loaded) {
      this.queue.push(['page']);
    }
  }

  // Generic tracking wrapper
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
      contents: [
        {
          content_id: String(product._id),
          content_type: 'product',
          content_name: product.name
        }
      ],
      value: Number(price) * Number(quantity),
      currency: 'PKR'
    };
    this.track('AddToCart', customData);
  }

  // Track Purchase / CompletePayment / PlaceAnOrder
  trackPurchase(orderId, total, products, currency = 'PKR') {
    const contents = products.map(p => ({
      content_id: String(p.product?._id || p._id),
      content_type: 'product',
      content_name: p.name || p.product?.name || ''
    }));

    const customData = {
      contents: contents,
      value: Number(total),
      currency: currency
    };

    // Track standard Purchase, CompletePayment, and PlaceAnOrder events for full coverage
    this.track('Purchase', customData);
    this.track('CompletePayment', customData);
    this.track('PlaceAnOrder', customData);
  }

  // Track ViewContent (Product view)
  trackViewContent(product) {
    this.track('ViewContent', {
      contents: [
        {
          content_id: String(product._id),
          content_type: 'product',
          content_name: product.name
        }
      ],
      value: Number(product.price),
      currency: 'PKR'
    });
  }

  // Track InitiateCheckout
  trackInitiateCheckout(cartItems, total) {
    const contents = cartItems.map(item => ({
      content_id: String(item.product?._id || item._id),
      content_type: 'product',
      content_name: item.name || item.product?.name || ''
    }));

    const customData = {
      contents: contents,
      value: Number(total),
      currency: 'PKR'
    };
    this.track('InitiateCheckout', customData);
  }

  // Track AddToWishlist
  trackAddToWishlist(product, price) {
    this.track('AddToWishlist', {
      contents: [
        {
          content_id: String(product._id),
          content_type: 'product',
          content_name: product.name
        }
      ],
      value: Number(price),
      currency: 'PKR'
    });
  }

  // Track Search
  trackSearch(searchTerm, resultsCount, value = 0) {
    this.track('Search', {
      contents: [],
      value: Number(value),
      currency: 'PKR',
      search_string: searchTerm
    });
  }

  // Track AddPaymentInfo
  trackAddPaymentInfo(total, cartItems) {
    const contents = cartItems.map(item => ({
      content_id: String(item.product?._id || item._id),
      content_type: 'product',
      content_name: item.name || item.product?.name || ''
    }));

    this.track('AddPaymentInfo', {
      contents: contents,
      value: Number(total),
      currency: 'PKR'
    });
  }

  // Track CompleteRegistration
  trackCompleteRegistration() {
    this.track('CompleteRegistration');
  }
}

export const tiktokTracker = new TikTokTracker();
export { sha256 };
