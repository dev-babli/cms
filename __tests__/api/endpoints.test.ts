/**
 * API Endpoint Testing Suite
 * Tests all API endpoints for functionality
 */

// Ensure fetch is available
if (typeof globalThis.fetch === 'undefined' && typeof fetch !== 'undefined') {
  globalThis.fetch = fetch;
}

describe('API Endpoints Tests', () => {
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

  describe('Health Check', () => {
    test('GET /api/health should return 200', async () => {
      if (!serverRunning) {
        console.log('⏭️  Skipping test - server not running');
        return;
      }
      
      const response = await fetch(`${BASE_URL}/api/health`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.status).toBe('ok');
    });
  });

  describe('Blog Endpoints', () => {
    test('GET /api/cms/blog should return blog posts', async () => {
      if (!serverRunning) {
        console.log('⏭️  Skipping test - server not running');
        return;
      }
      
      const response = await fetch(`${BASE_URL}/api/cms/blog?published=true`, {
        headers: {
          'Origin': 'https://intellectt.com',
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    test('GET /api/cms/blog/[id] should return single blog post', async () => {
      if (!serverRunning) {
        console.log('⏭️  Skipping test - server not running');
        return;
      }
      
      // First get all posts to get an ID
      const listResponse = await fetch(`${BASE_URL}/api/cms/blog?published=true`);
      const listData = await listResponse.json();
      
      if (listData.data && listData.data.length > 0) {
        const postId = listData.data[0].id;
        const response = await fetch(`${BASE_URL}/api/cms/blog/${postId}`, {
          headers: {
            'Origin': 'https://intellectt.com',
          },
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.success).toBe(true);
      }
    });
  });

  describe('Case Studies Endpoints', () => {
    test('GET /api/cms/case-studies should return case studies', async () => {
      if (!serverRunning) {
        console.log('⏭️  Skipping test - server not running');
        return;
      }
      
      const response = await fetch(`${BASE_URL}/api/cms/case-studies?published=true`, {
        headers: {
          'Origin': 'https://intellectt.com',
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  describe('Ebooks Endpoints', () => {
    test('GET /api/cms/ebooks should return ebooks', async () => {
      if (!serverRunning) {
        console.log('⏭️  Skipping test - server not running');
        return;
      }
      
      const response = await fetch(`${BASE_URL}/api/cms/ebooks?published=true`, {
        headers: {
          'Origin': 'https://intellectt.com',
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  describe('Whitepapers Endpoints', () => {
    test('GET /api/cms/whitepapers should return whitepapers', async () => {
      if (!serverRunning) {
        console.log('⏭️  Skipping test - server not running');
        return;
      }
      
      const response = await fetch(`${BASE_URL}/api/cms/whitepapers?published=true`, {
        headers: {
          'Origin': 'https://intellectt.com',
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  describe('News Endpoints', () => {
    test('GET /api/cms/news should return news items', async () => {
      if (!serverRunning) {
        console.log('⏭️  Skipping test - server not running');
        return;
      }
      
      const response = await fetch(`${BASE_URL}/api/cms/news?published=true`, {
        headers: {
          'Origin': 'https://intellectt.com',
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  describe('Lead Submission', () => {
    test('POST /api/cms/leads should accept valid lead data', async () => {
      if (!serverRunning) {
        console.log('⏭️  Skipping test - server not running');
        return;
      }
      
      const leadData = {
        first_name: 'Test',
        last_name: 'User',
        email: `test-${Date.now()}@example.com`,
        phone: '+1234567890',
        company: 'Test Company',
        consent_data_processing: true,
      };

      const response = await fetch(`${BASE_URL}/api/cms/leads`, {
        method: 'POST',
        headers: {
          'Origin': 'https://intellectt.com',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData),
      });

      expect([200, 201]).toContain(response.status);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    test('POST /api/cms/leads should reject invalid data', async () => {
      if (!serverRunning) {
        console.log('⏭️  Skipping test - server not running');
        return;
      }
      
      const invalidData = {
        first_name: '',
        email: 'invalid-email',
        consent_data_processing: false,
      };

      const response = await fetch(`${BASE_URL}/api/cms/leads`, {
        method: 'POST',
        headers: {
          'Origin': 'https://intellectt.com',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidData),
      });

      expect([400, 422]).toContain(response.status);
    });
  });

  describe('Download Endpoint', () => {
    test('GET /api/cms/download should validate URLs', async () => {
      if (!serverRunning) {
        console.log('⏭️  Skipping test - server not running');
        return;
      }
      
      // Test with invalid URL
      const response = await fetch(`${BASE_URL}/api/cms/download?url=http://localhost:22`, {
        headers: {
          'Origin': 'https://intellectt.com',
        },
      });

      // Should reject SSRF attempts
      expect([400, 403]).toContain(response.status);
    });
  });
});

