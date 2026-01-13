/**
 * Optimized Fetch Hook with Caching and Error Handling
 * Provides better performance than standard fetch
 */

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseOptimizedFetchOptions {
  url: string;
  enabled?: boolean;
  refetchInterval?: number;
  cacheTime?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

interface UseOptimizedFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();

export function useOptimizedFetch<T = any>(
  options: UseOptimizedFetchOptions
): UseOptimizedFetchResult<T> {
  const { url, enabled = true, refetchInterval, cacheTime = 60000, onSuccess, onError } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    // Check cache first
    const cached = cache.get(url);
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      setData(cached.data);
      setLoading(false);
      return;
    }

    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const timeoutId = setTimeout(() => abortControllerRef.current?.abort(), 10000); // 10s timeout

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(url, {
        credentials: 'include',
        cache: 'no-store',
        signal: abortControllerRef.current.signal,
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data !== undefined) {
        // Update cache
        cache.set(url, { data: result.data, timestamp: Date.now() });
        setData(result.data);
        onSuccess?.(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch data');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return; // Request was aborted, don't set error
      }
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }, [url, cacheTime, onSuccess, onError]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    // Initial fetch
    fetchData();

    // Set up interval if specified
    if (refetchInterval) {
      intervalRef.current = setInterval(fetchData, refetchInterval);
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, fetchData, refetchInterval]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

/**
 * Clear cache for a specific URL or all URLs
 */
export function clearCache(url?: string) {
  if (url) {
    cache.delete(url);
  } else {
    cache.clear();
  }
}

