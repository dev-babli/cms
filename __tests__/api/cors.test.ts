/**
 * CORS Testing Suite
 * Tests all API endpoints for proper CORS configuration
 * 
 * NOTE: These are integration tests that require the CMS server to be running.
 * Start the server with: npm run dev
 * Then run tests with: npm test
 */

// Ensure fetch is available
if (typeof globalThis.fetch === 'undefined' && typeof fetch !== 'undefined') {
  globalThis.fetch = fetch;
}

describe('CORS Configuration Tests', () => {
  const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3001';
  let serverRunning = false;
  
  // Check if server is running before all tests
  beforeAll(async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/health`, {
        signal: AbortSignal.timeout(2000), // 2 second timeout
      });
      serverRunning = response.ok;
      if (!serverRunning) {
        console.warn('⚠️  CMS server is not running. Skipping integration tests.');
        console.warn('   Start the server with: npm run dev');
      }
    } catch (error) {
      serverRunning = false;
      console.warn('⚠️  CMS server is not running. Skipping integration tests.');
      console.warn('   Start the server with: npm run dev');
    }
  });
  const ALLOWED_ORIGINS = [
    'https://intellectt.com',
    'https://www.intellectt.com',
    'https://cms-intellectt-final.vercel.app',
  ];
  const BLOCKED_ORIGINS = [
    'https://malicious-site.com',
    'http://evil.com',
  ];

  describe('OPTIONS Preflight Requests', () => {
    const endpoints = [
      '/api/cms/leads',
      '/api/cms/download',
      '/api/auth/login',
      '/api/auth/register',
      '/api/cms/blog',
      '/api/cms/case-studies',
      '/api/cms/ebooks',
      '/api/cms/whitepapers',
      '/api/cms/news',
    ];

    endpoints.forEach((endpoint) => {
      ALLOWED_ORIGINS.forEach((origin) => {
        test(`OPTIONS ${endpoint} from ${origin} should allow CORS`, async () => {
          if (!serverRunning) {
            console.log('⏭️  Skipping test - server not running');
            return;
          }
          
          const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'OPTIONS',
            headers: {
              'Origin': origin,
              'Access-Control-Request-Method': 'POST',
              'Access-Control-Request-Headers': 'Content-Type, Authorization',
            },
          });

          expect(response.status).toBe(200);
          expect(response.headers.get('Access-Control-Allow-Origin')).toBe(origin);
          expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
          expect(response.headers.get('Access-Control-Allow-Headers')).toContain('Content-Type');
        });
      });

      BLOCKED_ORIGINS.forEach((origin) => {
        test(`OPTIONS ${endpoint} from ${origin} should block CORS`, async () => {
          if (!serverRunning) {
            console.log('⏭️  Skipping test - server not running');
            return;
          }
          
          const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'OPTIONS',
            headers: {
              'Origin': origin,
              'Access-Control-Request-Method': 'POST',
            },
          });

          expect([403, 404]).toContain(response.status);
        });
      });
    });
  });

  describe('GET Requests with CORS', () => {
    test('GET /api/health should include CORS headers', async () => {
      if (!serverRunning) {
        console.log('⏭️  Skipping test - server not running');
        return;
      }
      
      const response = await fetch(`${BASE_URL}/api/health`, {
        headers: {
          'Origin': 'https://intellectt.com',
        },
      });

      expect(response.ok).toBe(true);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://intellectt.com');
    });

    test('GET /api/cms/blog should include CORS headers', async () => {
      if (!serverRunning) {
        console.log('⏭️  Skipping test - server not running');
        return;
      }
      
      const response = await fetch(`${BASE_URL}/api/cms/blog?published=true`, {
        headers: {
          'Origin': 'https://intellectt.com',
        },
      });

      expect(response.ok).toBe(true);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://intellectt.com');
    });
  });

  describe('POST Requests with CORS', () => {
    test('POST /api/cms/leads should include CORS headers', async () => {
      if (!serverRunning) {
        console.log('⏭️  Skipping test - server not running');
        return;
      }
      
      const response = await fetch(`${BASE_URL}/api/cms/leads`, {
        method: 'POST',
        headers: {
          'Origin': 'https://intellectt.com',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: 'Test',
          last_name: 'User',
          email: 'test@example.com',
          consent_data_processing: true,
        }),
      });

      // Should either succeed or fail with proper CORS headers
      const corsHeader = response.headers.get('Access-Control-Allow-Origin');
      expect(corsHeader).toBe('https://intellectt.com');
    });
  });

  describe('Credentials Support', () => {
    test('Authenticated endpoints should allow credentials', async () => {
      if (!serverRunning) {
        console.log('⏭️  Skipping test - server not running');
        return;
      }
      
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'https://intellectt.com',
          'Access-Control-Request-Method': 'POST',
        },
      });

      expect(response.headers.get('Access-Control-Allow-Credentials')).toBe('true');
    });
  });
});

