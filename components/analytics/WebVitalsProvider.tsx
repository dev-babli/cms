"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { initWebVitals, initPerformanceObserver } from '@/lib/analytics/web-vitals';

interface WebVitalsProviderProps {
  children: React.ReactNode;
}

export function WebVitalsProvider({ children }: WebVitalsProviderProps) {
  const pathname = usePathname();

  useEffect(() => {
    // Initialize Web Vitals tracking on mount
    initWebVitals();
    initPerformanceObserver();
  }, []);

  useEffect(() => {
    // Track route changes for SPA navigation
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        page_path: pathname,
      });
    }
  }, [pathname]);

  return <>{children}</>;
}

// Performance monitoring hook for components
export function usePerformanceMonitor(componentName: string) {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Log slow component renders (> 16ms for 60fps)
      if (renderTime > 16) {
        console.warn(`⚠️ Slow Component Render: ${componentName} took ${renderTime.toFixed(2)}ms`);
      }
      
      // Track in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔍 Component Render Time: ${componentName} = ${renderTime.toFixed(2)}ms`);
      }
    };
  }, [componentName]);
}
