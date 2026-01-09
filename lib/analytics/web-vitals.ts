// Core Web Vitals tracking for performance monitoring
// Based on Next.js 15 and web-vitals 4.x standards

import { getCLS, getFID, getFCP, getLCP, getTTFB, onINP } from 'web-vitals';

export interface WebVitalsMetric {
  id: string;
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  delta: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  navigationType: string;
  attribution?: any;
}

// Performance thresholds (2026 standards)
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },      // Largest Contentful Paint
  FID: { good: 100, poor: 300 },        // First Input Delay (deprecated, use INP)
  INP: { good: 200, poor: 500 },        // Interaction to Next Paint (new)
  CLS: { good: 0.1, poor: 0.25 },       // Cumulative Layout Shift
  FCP: { good: 1800, poor: 3000 },      // First Contentful Paint
  TTFB: { good: 800, poor: 1800 },      // Time to First Byte
};

function getRating(name: WebVitalsMetric['name'], value: number): WebVitalsMetric['rating'] {
  const threshold = THRESHOLDS[name];
  if (!threshold) return 'good';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

// Send metrics to analytics service
async function sendMetric(metric: WebVitalsMetric) {
  try {
    // Option 1: Send to Google Analytics 4
    if (typeof gtag !== 'undefined') {
      gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.value),
        custom_map: { metric_rating: metric.rating }
      });
    }

    // Option 2: Send to your own analytics API
    if (process.env.NODE_ENV === 'production') {
      await fetch('/api/analytics/web-vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...metric,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
        }),
      });
    }

    // Option 3: Console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 Web Vitals: ${metric.name}`, {
        value: `${metric.value.toFixed(2)}ms`,
        rating: metric.rating,
        id: metric.id,
      });
    }
  } catch (error) {
    console.error('Failed to send web vitals metric:', error);
  }
}

// Initialize Core Web Vitals tracking
export function initWebVitals() {
  try {
    // Largest Contentful Paint (LCP) - measures loading performance
    getLCP((metric) => {
      const webVitalsMetric: WebVitalsMetric = {
        ...metric,
        rating: getRating('LCP', metric.value),
        navigationType: (performance.getEntriesByType('navigation')[0] as any)?.type || 'navigate',
      };
      sendMetric(webVitalsMetric);
    });

    // First Input Delay (FID) - measures interactivity (legacy)
    getFID((metric) => {
      const webVitalsMetric: WebVitalsMetric = {
        ...metric,
        rating: getRating('FID', metric.value),
        navigationType: (performance.getEntriesByType('navigation')[0] as any)?.type || 'navigate',
      };
      sendMetric(webVitalsMetric);
    });

    // Interaction to Next Paint (INP) - new interactivity metric
    onINP((metric) => {
      const webVitalsMetric: WebVitalsMetric = {
        ...metric,
        rating: getRating('INP', metric.value),
        navigationType: (performance.getEntriesByType('navigation')[0] as any)?.type || 'navigate',
      };
      sendMetric(webVitalsMetric);
    });

    // Cumulative Layout Shift (CLS) - measures visual stability
    getCLS((metric) => {
      const webVitalsMetric: WebVitalsMetric = {
        ...metric,
        rating: getRating('CLS', metric.value),
        navigationType: (performance.getEntriesByType('navigation')[0] as any)?.type || 'navigate',
      };
      sendMetric(webVitalsMetric);
    });

    // First Contentful Paint (FCP) - measures loading
    getFCP((metric) => {
      const webVitalsMetric: WebVitalsMetric = {
        ...metric,
        rating: getRating('FCP', metric.value),
        navigationType: (performance.getEntriesByType('navigation')[0] as any)?.type || 'navigate',
      };
      sendMetric(webVitalsMetric);
    });

    // Time to First Byte (TTFB) - measures server response
    getTTFB((metric) => {
      const webVitalsMetric: WebVitalsMetric = {
        ...metric,
        rating: getRating('TTFB', metric.value),
        navigationType: (performance.getEntriesByType('navigation')[0] as any)?.type || 'navigate',
      };
      sendMetric(webVitalsMetric);
    });

  } catch (error) {
    console.error('Failed to initialize Web Vitals tracking:', error);
  }
}

// Performance observer for additional metrics
export function initPerformanceObserver() {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return;
  }

  try {
    // Monitor long tasks (> 50ms)
    const longTaskObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 50) {
          console.warn(`⚠️ Long Task detected: ${entry.duration.toFixed(2)}ms`, entry);
          
          // Send to analytics if needed
          if (process.env.NODE_ENV === 'production') {
            sendMetric({
              id: `long-task-${Date.now()}`,
              name: 'TTFB', // Using TTFB as placeholder for custom metrics
              value: entry.duration,
              delta: entry.duration,
              rating: entry.duration > 200 ? 'poor' : 'needs-improvement',
              navigationType: 'long-task',
            });
          }
        }
      });
    });

    longTaskObserver.observe({ entryTypes: ['longtask'] });

    // Monitor resource loading
    const resourceObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const resource = entry as PerformanceResourceTiming;
        
        // Flag slow resources (> 2s)
        if (resource.duration > 2000) {
          console.warn(`⚠️ Slow Resource: ${resource.name} took ${resource.duration.toFixed(2)}ms`);
        }
        
        // Flag large resources (> 1MB)
        if (resource.transferSize && resource.transferSize > 1024 * 1024) {
          console.warn(`⚠️ Large Resource: ${resource.name} is ${(resource.transferSize / 1024 / 1024).toFixed(2)}MB`);
        }
      });
    });

    resourceObserver.observe({ entryTypes: ['resource'] });

  } catch (error) {
    console.error('Failed to initialize Performance Observer:', error);
  }
}

// Real User Monitoring (RUM) data collection
export function collectRUMData() {
  if (typeof window === 'undefined') return null;

  return {
    // Device information
    deviceMemory: (navigator as any).deviceMemory || 'unknown',
    hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
    connection: (navigator as any).connection ? {
      effectiveType: (navigator as any).connection.effectiveType,
      downlink: (navigator as any).connection.downlink,
      rtt: (navigator as any).connection.rtt,
    } : null,
    
    // Page information
    url: window.location.href,
    referrer: document.referrer,
    timestamp: Date.now(),
    
    // Performance timing
    navigation: performance.getEntriesByType('navigation')[0],
    
    // Viewport
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
  };
}
