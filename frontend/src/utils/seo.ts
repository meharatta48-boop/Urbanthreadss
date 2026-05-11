// TypeScript declaration for gtag
declare global {
  interface Window {
    gtag?: (command: string, ...args: any[]) => void;
  }
}

// SEO and Social Sharing Utilities

interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  siteName?: string;
  locale?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  price?: number;
  currency?: string;
  availability?: 'in stock' | 'out of stock' | 'preorder';
  brand?: string;
  category?: string;
}

interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

class SEOManager {
  private static instance: SEOManager;
  private siteName: string = 'Urban Thread';
  private defaultImage: string = '/icons/icon-512x512.png';
  private siteUrl: string = 'https://urbanthread.com';

  static getInstance(): SEOManager {
    if (!SEOManager.instance) {
      SEOManager.instance = new SEOManager();
    }
    return SEOManager.instance;
  }

  // Update page meta tags
  public updatePageSEO(data: SEOData): void {
    this.updateTitle(data.title);
    this.updateMetaDescription(data.description);
    this.updateMetaKeywords(data.keywords);
    this.updateOpenGraphTags(data);
    this.updateTwitterCardTags(data);
    this.updateCanonicalUrl(data.url);
    this.updateStructuredData(data);
    this.updateJsonLd(data);
  }

  // Product-specific SEO
  public updateProductSEO(product: any): void {
    const seoData: SEOData = {
      title: `${product.name} - Urban Thread`,
      description: product.description || `Shop ${product.name} at Urban Thread. Premium quality fashion at affordable prices.`,
      keywords: [
        product.name,
        product.category?.name,
        'fashion',
        'clothing',
        'urban thread',
        'pakistan',
        'online shopping',
        ...(product.tags || [])
      ],
      image: product.images?.[0],
      url: `${this.siteUrl}/product/${product._id}`,
      type: 'product',
      price: product.price,
      currency: 'PKR',
      availability: product.stock > 0 ? 'in stock' : 'out of stock',
      brand: 'Urban Thread',
      category: product.category?.name
    };

    this.updatePageSEO(seoData);
  }

  // Category-specific SEO
  public updateCategorySEO(category: any): void {
    const seoData: SEOData = {
      title: `${category.name} - Urban Thread`,
      description: `Browse our collection of ${category.name}. Premium fashion items at Urban Thread.`,
      keywords: [
        category.name,
        'fashion',
        'clothing',
        'urban thread',
        'pakistan',
        'online shopping',
        category.name.toLowerCase()
      ],
      image: category.image || this.defaultImage,
      url: `${this.siteUrl}/shop?category=${category._id}`,
      type: 'website'
    };

    this.updatePageSEO(seoData);
  }

  // Homepage SEO
  public updateHomepageSEO(): void {
    const seoData: SEOData = {
      title: 'Urban Thread - Premium Fashion & Lifestyle',
      description: 'Discover premium fashion and lifestyle products at Urban Thread. Quality clothing, accessories, and more with nationwide delivery across Pakistan.',
      keywords: [
        'urban thread',
        'fashion',
        'clothing',
        'pakistan',
        'online shopping',
        'lifestyle',
        'premium fashion',
        'affordable luxury'
      ],
      image: this.defaultImage,
      url: this.siteUrl,
      type: 'website'
    };

    this.updatePageSEO(seoData);
  }

  // Private methods for updating specific tags
  private updateTitle(title: string): void {
    document.title = title;
    
    // Update og:title
    this.updateMetaTag('og:title', title);
    
    // Update twitter:title
    this.updateMetaTag('twitter:title', title);
  }

  private updateMetaDescription(description: string): void {
    this.updateMetaTag('description', description);
    this.updateMetaTag('og:description', description);
    this.updateMetaTag('twitter:description', description);
  }

  private updateMetaKeywords(keywords?: string[]): void {
    if (keywords && keywords.length > 0) {
      this.updateMetaTag('keywords', keywords.join(', '));
    }
  }

  private updateOpenGraphTags(data: SEOData): void {
    const tags = {
      'og:type': data.type || 'website',
      'og:site_name': data.siteName || this.siteName,
      'og:url': data.url || window.location.href,
      'og:image': data.image || this.defaultImage,
      'og:image:width': '1200',
      'og:image:height': '630',
      'og:image:alt': data.title,
      'og:locale': data.locale || 'en_US',
    };

    // Product-specific OG tags
    if (data.type === 'product') {
      Object.assign(tags, {
        'product:price:amount': data.price,
        'product:price:currency': data.currency || 'PKR',
        'product:availability': `https://schema.org/${data.availability?.replace(' ', '_') || 'InStock'}`,
        'product:brand': data.brand,
        'product:category': data.category,
      });
    }

    Object.entries(tags).forEach(([property, content]) => {
      this.updateMetaTag(property, content, 'property');
    });
  }

  private updateTwitterCardTags(data: SEOData): void {
    const tags = {
      'twitter:card': 'summary_large_image',
      'twitter:site': '@urbanthread_pk',
      'twitter:creator': '@urbanthread_pk',
      'twitter:image': data.image || this.defaultImage,
      'twitter:image:alt': data.title,
    };

    Object.entries(tags).forEach(([name, content]) => {
      this.updateMetaTag(name, content, 'name');
    });
  }

  private updateCanonicalUrl(url?: string): void {
    const canonicalUrl = url || window.location.href;
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    
    canonicalLink.href = canonicalUrl;
  }

  private updateStructuredData(data: SEOData): void {
    let structuredData: StructuredData;

    if (data.type === 'product') {
      structuredData = this.createProductStructuredData(data);
    } else {
      structuredData = this.createWebsiteStructuredData(data);
    }

    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
  }

  private updateJsonLd(data: SEOData): void {
    // Additional JSON-LD for breadcrumbs, etc.
    const breadcrumbData = this.createBreadcrumbStructuredData();
    
    if (breadcrumbData) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'breadcrumb-structured-data';
      script.textContent = JSON.stringify(breadcrumbData);
      
      const existingBreadcrumb = document.getElementById('breadcrumb-structured-data');
      if (existingBreadcrumb) {
        existingBreadcrumb.replaceWith(script);
      } else {
        document.head.appendChild(script);
      }
    }
  }

  private createProductStructuredData(data: SEOData): StructuredData {
    return {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: data.title,
      description: data.description,
      image: data.image,
      url: data.url,
      brand: {
        '@type': 'Brand',
        name: data.brand || this.siteName
      },
      category: data.category,
      offers: {
        '@type': 'Offer',
        price: data.price,
        priceCurrency: data.currency || 'PKR',
        availability: `https://schema.org/${data.availability?.replace(' ', '_') || 'InStock'}`,
        seller: {
          '@type': 'Organization',
          name: this.siteName,
          url: this.siteUrl
        }
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.5',
        reviewCount: '128'
      }
    };
  }

  private createWebsiteStructuredData(data: SEOData): StructuredData {
    return {
      '@context': 'https://schema.org/',
      '@type': 'WebSite',
      name: data.title,
      description: data.description,
      url: data.url,
      image: data.image,
      publisher: {
        '@type': 'Organization',
        name: this.siteName,
        logo: {
          '@type': 'ImageObject',
          url: this.defaultImage
        }
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${this.siteUrl}/shop?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    };
  }

  private createBreadcrumbStructuredData(): StructuredData | null {
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    
    if (pathSegments.length === 0) return null;

    const breadcrumbs = [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: this.siteUrl
      }
    ];

    let currentPath = this.siteUrl;
    
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const name = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      
      breadcrumbs.push({
        '@type': 'ListItem',
        position: index + 2,
        name: name,
        item: currentPath
      });
    });

    return {
      '@context': 'https://schema.org/',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs
    };
  }

  private updateMetaTag(name: string, content: string, attribute: 'name' | 'property' = 'name'): void {
    let tag = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
    
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute(attribute, name);
      document.head.appendChild(tag);
    }
    
    tag.content = content;
  }

  // Social sharing utilities
  public generateShareLinks(url: string, title: string, description: string): Record<string, string> {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description);

    return {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedDescription}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%20${encodedUrl}`
    };
  }

  public async shareProduct(product: any): Promise<void> {
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} on Urban Thread`,
      url: `${this.siteUrl}/product/${product._id}`
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to copying link
        await this.copyToClipboard(shareData.url);
        this.showShareSuccess('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  }

  private async copyToClipboard(text: string): Promise<void> {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }

  private showShareSuccess(message: string): void {
    // Create a simple toast notification
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #333;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      z-index: 10000;
      font-size: 14px;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  // Performance monitoring for SEO
  public trackPagePerformance(): void {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      const metrics = {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: this.getFirstPaint(),
        firstContentfulPaint: this.getFirstContentfulPaint(),
        largestContentfulPaint: this.getLargestContentfulPaint()
      };

      // Send to analytics
      if (window.gtag) {
        window.gtag('event', 'page_performance', {
          custom_map: metrics
        });
      }
    }
  }

  private getFirstPaint(): number | null {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : null;
  }

  private getFirstContentfulPaint(): number | null {
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcp ? fcp.startTime : null;
  }

  private getLargestContentfulPaint(): number | null {
    // This would require PerformanceObserver API
    return null;
  }

  // Schema.org markup for reviews
  public addReviewSchema(product: any, reviews: any[]): void {
    const reviewSchema = {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: product.name,
      image: product.images?.[0],
      review: reviews.map(review => ({
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: review.author
        },
        datePublished: review.date,
        reviewRating: {
          '@type': 'Rating',
          ratingValue: review.rating,
          bestRating: 5
        },
        reviewBody: review.comment
      })),
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: this.calculateAverageRating(reviews),
        reviewCount: reviews.length,
        bestRating: 5,
        worstRating: 1
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'review-structured-data';
    script.textContent = JSON.stringify(reviewSchema);
    
    const existingReview = document.getElementById('review-structured-data');
    if (existingReview) {
      existingReview.replaceWith(script);
    } else {
      document.head.appendChild(script);
    }
  }

  private calculateAverageRating(reviews: any[]): number {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }
}

// Export singleton instance
export default SEOManager.getInstance();

// Utility functions for common SEO tasks
export const updateProductSEO = (product: any) => {
  SEOManager.getInstance().updateProductSEO(product);
};

export const updateCategorySEO = (category: any) => {
  SEOManager.getInstance().updateCategorySEO(category);
};

export const updateHomepageSEO = () => {
  SEOManager.getInstance().updateHomepageSEO();
};

export const shareProduct = async (product: any) => {
  await SEOManager.getInstance().shareProduct(product);
};

export const generateShareLinks = (url: string, title: string, description: string) => {
  return SEOManager.getInstance().generateShareLinks(url, title, description);
};
