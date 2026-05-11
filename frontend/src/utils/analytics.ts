// TypeScript declaration for gtag
declare global {
  interface Window {
    gtag?: (command: string, ...args: any[]) => void;
  }
}

// Advanced Analytics and Tracking System

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId: string;
  page: string;
  referrer?: string;
  userAgent: string;
}

interface PageView {
  page: string;
  title: string;
  timestamp: number;
  sessionId: string;
  userId?: string;
  referrer?: string;
}

interface UserInteraction {
  type: 'click' | 'scroll' | 'hover' | 'form_submit' | 'search' | 'filter' | 'add_to_cart' | 'purchase';
  element: string;
  properties?: Record<string, any>;
  timestamp: number;
  sessionId: string;
}

class AnalyticsManager {
  private sessionId: string;
  private userId: string | null = null;
  private events: AnalyticsEvent[] = [];
  private pageViews: PageView[] = [];
  private interactions: UserInteraction[] = [];
  private isEnabled: boolean = true;
  private batchSize: number = 10;
  private flushInterval: number = 30000; // 30 seconds

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeTracking();
    this.startPeriodicFlush();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeTracking(): void {
    // Check if analytics is enabled (respect user preferences)
    const consent = localStorage.getItem('analytics_consent');
    this.isEnabled = consent !== 'denied';

    // Set user ID if available
    const userData = localStorage.getItem('authTokens');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        this.userId = parsed.user?.id || null;
      } catch (e) {
        console.error('Failed to parse user data for analytics');
      }
    }

    // Track page view on initial load
    this.trackPageView();

    // Track unload event
    window.addEventListener('beforeunload', () => {
      this.flushEvents();
    });

    // Track visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('page_hidden');
      } else {
        this.trackEvent('page_visible');
      }
    });
  }

  private startPeriodicFlush(): void {
    setInterval(() => {
      if (this.events.length > 0) {
        this.flushEvents();
      }
    }, this.flushInterval);
  }

  // Public API methods
  public trackEvent(event: string, properties?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: Date.now(),
      userId: this.userId || undefined,
      sessionId: this.sessionId,
      page: window.location.pathname,
      referrer: document.referrer,
      userAgent: navigator.userAgent
    };

    this.events.push(analyticsEvent);

    // Auto-flush if batch size reached
    if (this.events.length >= this.batchSize) {
      this.flushEvents();
    }

    // Also send to Google Analytics if available
    this.sendToGoogleAnalytics(event, properties);
  }

  public trackPageView(page?: string): void {
    if (!this.isEnabled) return;

    const pageView: PageView = {
      page: page || window.location.pathname,
      title: document.title,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId || undefined,
      referrer: document.referrer
    };

    this.pageViews.push(pageView);

    // Send to Google Analytics
    if (window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: pageView.page,
        page_title: pageView.title
      });
    }
  }

  public trackInteraction(type: UserInteraction['type'], element: string, properties?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const interaction: UserInteraction = {
      type,
      element,
      properties,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    this.interactions.push(interaction);

    // Track as regular event as well
    this.trackEvent(`interaction_${type}`, { element, ...properties });
  }

  public trackEcommerce(action: string, properties: Record<string, any>): void {
    if (!this.isEnabled) return;

    this.trackEvent(`ecommerce_${action}`, properties);

    // Send to Google Analytics Ecommerce
    if (window.gtag) {
      switch (action) {
        case 'add_to_cart':
          window.gtag('event', 'add_to_cart', {
            currency: 'PKR',
            value: properties.price,
            items: [{
              item_id: properties.productId,
              item_name: properties.name,
              category: properties.category,
              price: properties.price,
              quantity: properties.quantity
            }]
          });
          break;
        case 'purchase':
          window.gtag('event', 'purchase', {
            transaction_id: properties.orderId,
            value: properties.total,
            currency: 'PKR',
            items: properties.items
          });
          break;
        case 'view_item':
          window.gtag('event', 'view_item', {
            currency: 'PKR',
            value: properties.price,
            items: [{
              item_id: properties.productId,
              item_name: properties.name,
              category: properties.category,
              price: properties.price
            }]
          });
          break;
      }
    }
  }

  public trackSearch(query: string, results: number, filters?: Record<string, any>): void {
    if (!this.isEnabled) return;

    this.trackEvent('search_performed', {
      query,
      results_count: results,
      filters: Object.keys(filters || {}),
      session_position: this.interactions.filter(i => i.type === 'search').length + 1
    });
  }

  public trackPerformance(): void {
    if (!this.isEnabled || !window.performance) return;

    const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    this.trackEvent('page_performance', {
      load_time: navigation.loadEventEnd - navigation.loadEventStart,
      dom_content_loaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      first_paint: this.getFirstPaint(),
      first_contentful_paint: this.getFirstContentfulPaint(),
      largest_contentful_paint: this.getLargestContentfulPaint()
    });
  }

  public setUser(userId: string, properties?: Record<string, any>): void {
    this.userId = userId;
    
    if (window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        user_id: userId
      });
      
      if (properties) {
        window.gtag('set', 'user_properties', properties);
      }
    }
  }

  public consent(accepted: boolean): void {
    this.isEnabled = accepted;
    localStorage.setItem('analytics_consent', accepted ? 'granted' : 'denied');
    
    if (accepted) {
      this.trackEvent('analytics_consent_granted');
    } else {
      // Clear all stored data
      this.clearData();
    }
  }

  // Private helper methods
  private sendToGoogleAnalytics(event: string, properties?: Record<string, any>): void {
    if (window.gtag && this.isEnabled) {
      window.gtag('event', event, properties);
    }
  }

  private getFirstPaint(): number | null {
    const paintEntries = window.performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : null;
  }

  private getFirstContentfulPaint(): number | null {
    const paintEntries = window.performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcp ? fcp.startTime : null;
  }

  private getLargestContentfulPaint(): number | null {
    // This would require PerformanceObserver API
    return null;
  }

  private async flushEvents(): Promise<void> {
    if (!this.isEnabled || this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      // Send to your analytics backend
      await this.sendToBackend(eventsToSend);
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      // Re-add events to try again later
      this.events.unshift(...eventsToSend);
    }
  }

  private async sendToBackend(events: AnalyticsEvent[]): Promise<void> {
    // Replace with your actual analytics endpoint
    const response = await fetch('/api/analytics/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ events }),
    });

    if (!response.ok) {
      throw new Error(`Analytics API error: ${response.status}`);
    }
  }

  private clearData(): void {
    this.events = [];
    this.pageViews = [];
    this.interactions = [];
  }

  // Public methods for getting analytics data
  public getSessionId(): string {
    return this.sessionId;
  }

  public getEventCount(): number {
    return this.events.length;
  }

  public getPageViewCount(): number {
    return this.pageViews.length;
  }

  public getInteractionCount(): number {
    return this.interactions.length;
  }
}

// Create singleton instance
const analytics = new AnalyticsManager();

// Export the instance and types
export default analytics;
export { AnalyticsEvent, PageView, UserInteraction };

// Utility functions for common tracking scenarios
export const trackProductView = (product: any) => {
  analytics.trackEcommerce('view_item', {
    productId: product._id,
    name: product.name,
    category: product.category?.name,
    price: product.price,
    comparePrice: product.comparePrice
  });
};

export const trackAddToCart = (product: any, quantity: number = 1) => {
  analytics.trackEcommerce('add_to_cart', {
    productId: product._id,
    name: product.name,
    category: product.category?.name,
    price: product.price,
    quantity
  });
};

export const trackPurchase = (order: any) => {
  analytics.trackEcommerce('purchase', {
    orderId: order._id,
    total: order.total,
    items: order.items.map((item: any) => ({
      productId: item.productId,
      name: item.name,
      category: item.category,
      price: item.price,
      quantity: item.quantity
    }))
  });
};

export const trackSearch = (query: string, results: number, filters?: Record<string, any>) => {
  analytics.trackSearch(query, results, filters);
};

export const trackFilter = (filterType: string, filterValue: string) => {
  analytics.trackInteraction('filter', `filter_${filterType}`, { value: filterValue });
};

export const trackButtonClick = (buttonName: string, context?: string) => {
  analytics.trackInteraction('click', buttonName, { context });
};

export const trackFormSubmission = (formName: string, success: boolean) => {
  analytics.trackInteraction('form_submit', formName, { success });
};

export const trackScrollDepth = (depth: number) => {
  analytics.trackEvent('scroll_depth', { depth: `${depth}%` });
};

export const trackError = (error: Error, context?: string) => {
  analytics.trackEvent('error', {
    message: error.message,
    stack: error.stack,
    context,
    userAgent: navigator.userAgent,
    url: window.location.href
  });
};
