@echo off
REM Comprehensive Testing Script for Windows
REM Runs all tests and generates a report

echo 🧪 Starting Comprehensive Test Suite...
echo ==========================================
echo.

REM Check if CMS is running
echo 📋 Pre-flight Checks
echo -------------------
curl -s http://localhost:3001/api/health >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ CMS is not running. Please start it first.
    echo    Run: cd cms ^&^& npm run dev
    exit /b 1
) else (
    echo ✅ CMS is running
)
echo.

REM Set test API URL
set TEST_API_URL=http://localhost:3001

REM Run tests
echo 🔌 Running API Tests...
echo --------------------
cd cms
call npm test -- __tests__/api/endpoints.test.ts --passWithNoTests
cd ..

echo.
echo 🌐 Running CORS Tests...
echo --------------------
cd cms
call npm test -- __tests__/api/cors.test.ts --passWithNoTests
cd ..

echo.
echo 🔒 Running Security Tests...
echo --------------------
cd cms
call npm test -- __tests__/api/security.test.ts --passWithNoTests
cd ..

echo.
echo 📡 Running Manual Tests...
echo --------------------
cd cms
call node scripts/test-manual.js
cd ..

echo.
echo ==========================================
echo ✅ Test Suite Complete!
echo ==========================================







