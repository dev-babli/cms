#!/bin/bash

# Comprehensive Testing Script
# Runs all tests and generates a report

echo "🧪 Starting Comprehensive Test Suite..."
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results
PASSED=0
FAILED=0
TOTAL=0

# Function to run a test
run_test() {
    local test_name=$1
    local test_command=$2
    
    echo -n "Testing: $test_name... "
    TOTAL=$((TOTAL + 1))
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASSED${NC}"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# Check if CMS is running
echo "📋 Pre-flight Checks"
echo "-------------------"
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo -e "${GREEN}✓ CMS is running${NC}"
else
    echo -e "${RED}✗ CMS is not running. Please start it first.${NC}"
    echo "   Run: cd cms && npm run dev"
    exit 1
fi
echo ""

# Set test API URL
export TEST_API_URL=${TEST_API_URL:-"http://localhost:3001"}

# Run API Tests
echo "🔌 API Endpoint Tests"
echo "-------------------"
cd cms
npm test -- __tests__/api/endpoints.test.ts --passWithNoTests
cd ..
echo ""

# Run CORS Tests
echo "🌐 CORS Tests"
echo "-----------"
cd cms
npm test -- __tests__/api/cors.test.ts --passWithNoTests
cd ..
echo ""

# Run Security Tests
echo "🔒 Security Tests"
echo "---------------"
cd cms
npm test -- __tests__/api/security.test.ts --passWithNoTests
cd ..
echo ""

# Manual API Tests
echo "📡 Manual API Tests"
echo "-----------------"

# Test Health Endpoint
run_test "Health Check" "curl -s -o /dev/null -w '%{http_code}' $TEST_API_URL/api/health | grep -q '200'"

# Test CORS Headers
run_test "CORS Headers" "curl -s -H 'Origin: https://intellectt.com' -H 'Access-Control-Request-Method: POST' -X OPTIONS $TEST_API_URL/api/cms/leads | grep -q 'Access-Control-Allow-Origin'"

# Test Blog Endpoint
run_test "Blog Endpoint" "curl -s -o /dev/null -w '%{http_code}' $TEST_API_URL/api/cms/blog?published=true | grep -q '200'"

# Test Case Studies Endpoint
run_test "Case Studies Endpoint" "curl -s -o /dev/null -w '%{http_code}' $TEST_API_URL/api/cms/case-studies?published=true | grep -q '200'"

# Test Security Headers
run_test "Security Headers" "curl -s -I $TEST_API_URL/api/health | grep -q 'X-Content-Type-Options'"

echo ""
echo "=========================================="
echo "📊 Test Summary"
echo "=========================================="
echo -e "Total Tests: ${TOTAL}"
echo -e "${GREEN}Passed: ${PASSED}${NC}"
echo -e "${RED}Failed: ${FAILED}${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi



