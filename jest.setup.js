// Jest setup file
// This file runs before each test file

// Polyfill fetch for Node.js environments
// Node.js 18+ has built-in fetch, but we need to ensure it's available in Jest
if (typeof globalThis.fetch === 'undefined') {
  // Try to use Node.js built-in fetch (Node 18+)
  try {
    // In Node.js 18+, fetch is available globally
    if (typeof fetch !== 'undefined') {
      globalThis.fetch = fetch;
    } else {
      // Fallback: use undici (Node.js 18+ internal)
      const { fetch: undiciFetch, Headers, Request, Response } = require('undici');
      globalThis.fetch = undiciFetch;
      globalThis.Headers = Headers;
      globalThis.Request = Request;
      globalThis.Response = Response;
    }
  } catch (e) {
    // If undici is not available, install node-fetch
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const fetch = require('node-fetch');
      globalThis.fetch = fetch;
      if (fetch.Headers) {
        globalThis.Headers = fetch.Headers;
        globalThis.Request = fetch.Request;
        globalThis.Response = fetch.Response;
      }
    } catch (e2) {
      console.warn('⚠️  fetch polyfill not available. Installing node-fetch...');
      // We'll need to install node-fetch
    }
  }
}

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Suppress console errors in tests (optional)
// Uncomment if you want to suppress console errors during tests
// global.console = {
//   ...console,
//   error: jest.fn(),
//   warn: jest.fn(),
// };

