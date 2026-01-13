'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log error to error reporting service
    // Safely log error to prevent additional errors
    try {
      let errorMessage = 'Unknown error';
      let errorStack: string | undefined;
      
      // Type guard: check if error is an Error instance
      if (error instanceof Error) {
        errorMessage = error.message || 'Unknown error';
        errorStack = error.stack;
      } else {
        // Handle non-Error types (Event, string, etc.)
        const errorAny = error as any;
        if (errorAny instanceof Event) {
          errorMessage = `Browser event error: ${errorAny.type}`;
        } else if (typeof errorAny === 'string') {
          errorMessage = errorAny;
        } else {
          errorMessage = String(errorAny) || 'Unknown error';
        }
      }
      
      console.error('Admin error:', {
        message: errorMessage,
        stack: errorStack,
        digest: error?.digest,
        originalError: error,
      });
    } catch (logError) {
      // Silently fail if logging itself causes an error
      console.error('Failed to log error:', logError);
    }
  }, [error]);

  // If it's an authentication error, redirect to login
  useEffect(() => {
    if (error.message?.includes('auth') || error.message?.includes('login') || error.digest) {
      router.push('/auth/login');
    }
  }, [error, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-gray-900 mb-2">500</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Admin Error
          </h2>
          <p className="text-gray-600 mb-6">
            {process.env.NODE_ENV === 'development' 
              ? (() => {
                  if (error instanceof Error) {
                    return error.message;
                  }
                  const errorAny = error as any;
                  if (errorAny instanceof Event) {
                    return `Event error: ${errorAny.type}`;
                  }
                  return String(errorAny) || 'An error occurred in the admin panel';
                })()
              : 'An error occurred. Please try logging in again.'}
          </p>
          {error.digest && (
            <p className="text-sm text-gray-500 mb-4">
              Error ID: {error.digest}
            </p>
          )}
        </div>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.push('/auth/login')}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
          <button
            onClick={reset}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}



