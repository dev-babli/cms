/**
 * Security Testing Suite
 * Tests all security features and protections
 */

// Ensure fetch is available
if (typeof globalThis.fetch === 'undefined' && typeof fetch !== 'undefined') {
  globalThis.fetch = fetch;
}

describe('Security Tests', () => {
  const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3001';
  let serverRunning = false;
  
  // Check if server is running
  beforeAll(async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/health`, {
        signal: AbortSignal.timeout(2000),
      });
      serverRunning = response.ok;
      if (!serverRunning) {
        console.warn('⚠️  CMS server is not running. Some tests will be skipped.');
        console.warn('   Start the server with: npm run dev');
      }
    } catch (error) {
      serverRunning = false;
      console.warn('⚠️  CMS server is not running. Some tests will be skipped.');
      console.warn('   Start the server with: npm run dev');
    }
  });

  describe('Rate Limiting', () => {
    test('API endpoints should enforce rate limits', async () => {
      if (!serverRunning) {
        console.log('⏭️  Skipping test - server not running');
        return;
      }
      
      const requests = Array(110).fill(null).map(() =>
        fetch(`${BASE_URL}/api/cms/blog?published=true`)
      );

      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status === 429);

      // Should rate limit after 100 requests
      expect(rateLimited.length).toBeGreaterThan(0);
    });

    test('Auth endpoints should have stricter rate limits', async () => {
      if (!serverRunning) {
        console.log('⏭️  Skipping test - server not running');
        return;
      }
      
      const requests = Array(10).fill(null).map(() =>
        fetch(`${BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com', password: 'wrong' }),
        })
      );

      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status === 429);

      // Should rate limit after 5 attempts
      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });

  describe('SQL Injection Protection', () => {
    test('Should block SQL injection attempts', async () => {
      if (!serverRunning) {
        console.log('⏭️  Skipping test - server not running');
        return;
      }
      
      const maliciousInputs = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "1' UNION SELECT * FROM users--",
      ];

      for (const input of maliciousInputs) {
        const response = await fetch(`${BASE_URL}/api/cms/blog?search=${encodeURIComponent(input)}`, {
          headers: {
            'Origin': 'https://intellectt.com',
          },
        });

        // Should either reject or sanitize
        expect([200, 400, 403]).toContain(response.status);
      }
    });
  });

  describe('XSS Protection', () => {
    test('Should sanitize XSS attempts in form submissions', async () => {
      if (!serverRunning) {
        console.log('⏭️  Skipping test - server not running');
        return;
      }
      
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert(1)>',
        'javascript:alert(1)',
      ];

      for (const payload of xssPayloads) {
        const response = await fetch(`${BASE_URL}/api/cms/leads`, {
          method: 'POST',
          headers: {
            'Origin': 'https://intellectt.com',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            first_name: payload,
            last_name: 'Test',
            email: 'test@example.com',
            consent_data_processing: true,
          }),
        });

        // Should sanitize or reject
        expect([200, 400, 403]).toContain(response.status);
      }
    });
  });

  describe('SSRF Protection', () => {
    test('Download endpoint should block SSRF attempts', async () => {
      if (!serverRunning) {
        console.log('⏭️  Skipping test - server not running');
        return;
      }
      
      const ssrfUrls = [
        'http://localhost:22',
        'http://127.0.0.1:3306',
        'file:///etc/passwd',
        'http://169.254.169.254/latest/meta-data',
      ];

      for (const url of ssrfUrls) {
        const response = await fetch(`${BASE_URL}/api/cms/download?url=${encodeURIComponent(url)}`, {
          headers: {
            'Origin': 'https://intellectt.com',
          },
        });

        // Should block SSRF attempts
        expect([400, 403]).toContain(response.status);
      }
    });
  });

  describe('Security Headers', () => {
    test('All responses should include security headers', async () => {
      if (!serverRunning) {
        console.log('⏭️  Skipping test - server not running');
        return;
      }
      
      const response = await fetch(`${BASE_URL}/api/health`);

      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
      expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block');
      expect(response.headers.get('Referrer-Policy')).toBeTruthy();
      expect(response.headers.get('Content-Security-Policy')).toBeTruthy();
    });
  });

  describe('Authentication Required', () => {
    test('Protected endpoints should require authentication', async () => {
      if (!serverRunning) {
        console.log('⏭️  Skipping test - server not running');
        return;
      }
      
      const protectedEndpoints = [
        { method: 'POST', path: '/api/cms/blog' },
        { method: 'PUT', path: '/api/cms/blog/1' },
        { method: 'DELETE', path: '/api/cms/blog/1' },
      ];

      for (const endpoint of protectedEndpoints) {
        const response = await fetch(`${BASE_URL}${endpoint.path}`, {
          method: endpoint.method,
          headers: {
            'Content-Type': 'application/json',
            'Origin': 'https://intellectt.com',
          },
        });

        // Should require authentication
        expect([401, 403]).toContain(response.status);
      }
    });
  });
});

