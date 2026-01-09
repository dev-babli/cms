/**
 * Manual Testing Script
 * Comprehensive manual testing for all endpoints and flows
 */

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3001';
const ALLOWED_ORIGIN = 'https://intellectt.com';

// Test results
const results = {
  passed: 0,
  failed: 0,
  tests: [],
};

function logTest(name, passed, details = '') {
  results.tests.push({ name, passed, details });
  if (passed) {
    results.passed++;
    console.log(`✅ ${name}`);
  } else {
    results.failed++;
    console.log(`❌ ${name}${details ? `: ${details}` : ''}`);
  }
}

async function testEndpoint(method, path, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        'Origin': ALLOWED_ORIGIN,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      data: await response.json().catch(() => null),
    };
  } catch (error) {
    return { error: error.message };
  }
}

async function runTests() {
  console.log('🧪 Starting Manual Test Suite\n');
  console.log('='.repeat(50));

  // 1. Health Check
  console.log('\n📋 1. Health Check');
  const health = await testEndpoint('GET', '/api/health');
  logTest('Health endpoint responds', health.status === 200);

  // 2. CORS Tests
  console.log('\n🌐 2. CORS Tests');
  const corsPreflight = await testEndpoint('OPTIONS', '/api/cms/leads', {
    headers: {
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'Content-Type',
    },
  });
  logTest('CORS preflight allows origin', corsPreflight.status === 200);
  logTest('CORS headers present', !!corsPreflight.headers['access-control-allow-origin']);

  // 3. Blog Endpoints
  console.log('\n📝 3. Blog Endpoints');
  const blogs = await testEndpoint('GET', '/api/cms/blog?published=true');
  logTest('Blog list returns 200', blogs.status === 200);
  logTest('Blog list has CORS headers', !!blogs.headers['access-control-allow-origin']);
  logTest('Blog list returns array', blogs.data?.success && Array.isArray(blogs.data.data));

  // 4. Case Studies
  console.log('\n📊 4. Case Studies');
  const caseStudies = await testEndpoint('GET', '/api/cms/case-studies?published=true');
  logTest('Case studies list returns 200', caseStudies.status === 200);
  logTest('Case studies have CORS headers', !!caseStudies.headers['access-control-allow-origin']);

  // 5. Ebooks
  console.log('\n📚 5. Ebooks');
  const ebooks = await testEndpoint('GET', '/api/cms/ebooks?published=true');
  logTest('Ebooks list returns 200', ebooks.status === 200);

  // 6. Whitepapers
  console.log('\n📄 6. Whitepapers');
  const whitepapers = await testEndpoint('GET', '/api/cms/whitepapers?published=true');
  logTest('Whitepapers list returns 200', whitepapers.status === 200);

  // 7. News
  console.log('\n📰 7. News');
  const news = await testEndpoint('GET', '/api/cms/news?published=true');
  logTest('News list returns 200', news.status === 200);

  // 8. Lead Submission
  console.log('\n📧 8. Lead Submission');
  const leadData = {
    first_name: 'Test',
    last_name: `User-${Date.now()}`,
    email: `test-${Date.now()}@example.com`,
    phone: '+1234567890',
    company: 'Test Company',
    consent_data_processing: true,
  };
  const leadSubmit = await testEndpoint('POST', '/api/cms/leads', { body: leadData });
  logTest('Lead submission accepts valid data', [200, 201].includes(leadSubmit.status));
  logTest('Lead submission has CORS headers', !!leadSubmit.headers['access-control-allow-origin']);

  // 9. Invalid Lead Submission
  console.log('\n🚫 9. Invalid Lead Submission');
  const invalidLead = await testEndpoint('POST', '/api/cms/leads', {
    body: {
      first_name: '',
      email: 'invalid',
      consent_data_processing: false,
    },
  });
  logTest('Lead submission rejects invalid data', [400, 422].includes(invalidLead.status));

  // 10. Security Headers
  console.log('\n🔒 10. Security Headers');
  logTest('X-Content-Type-Options present', health.headers['x-content-type-options'] === 'nosniff');
  logTest('X-Frame-Options present', health.headers['x-frame-options'] === 'DENY');
  logTest('X-XSS-Protection present', !!health.headers['x-xss-protection']);
  logTest('CSP header present', !!health.headers['content-security-policy']);

  // 11. Authentication Required
  console.log('\n🔐 11. Authentication Required');
  const protectedPost = await testEndpoint('POST', '/api/cms/blog', {
    body: { title: 'Test', content: 'Test content' },
  });
  logTest('Protected endpoints require auth', [401, 403].includes(protectedPost.status));

  // 12. SSRF Protection
  console.log('\n🛡️ 12. SSRF Protection');
  const ssrfTest = await testEndpoint('GET', '/api/cms/download?url=http://localhost:22');
  logTest('SSRF attempts blocked', [400, 403].includes(ssrfTest.status));

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Test Summary');
  console.log('='.repeat(50));
  console.log(`Total Tests: ${results.tests.length}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / results.tests.length) * 100).toFixed(1)}%`);

  if (results.failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.tests
      .filter(t => !t.passed)
      .forEach(t => console.log(`   - ${t.name}${t.details ? `: ${t.details}` : ''}`));
  }

  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('❌ Test suite error:', error);
  process.exit(1);
});



