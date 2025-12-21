@echo off
echo ========================================
echo   Building CMS for cPanel Deployment
echo ========================================
echo.

echo [1/4] Cleaning previous builds...
if exist .next (
    echo   Removing .next folder...
    rmdir /s /q .next
)
if exist node_modules\.cache (
    echo   Removing cache...
    rmdir /s /q node_modules\.cache
)
echo   Done!
echo.

echo [2/4] Installing dependencies...
call npm ci
if errorlevel 1 (
    echo   ERROR: npm install failed!
    pause
    exit /b 1
)
echo   Done!
echo.

echo [3/4] Building Next.js application...
call npm run build
if errorlevel 1 (
    echo   ERROR: Build failed!
    pause
    exit /b 1
)
echo   Done!
echo.

echo [4/4] Verifying build...
if exist .next (
    echo   Build successful!
    echo.
    echo ========================================
    echo   Files Ready for Upload:
    echo ========================================
    echo   - .next/ folder (built files)
    echo   - public/ folder (static assets)
    echo   - server.js (production server)
    echo   - package.json
    echo   - package-lock.json
    echo   - next.config.ts
    echo   - tsconfig.json
    echo   - tailwind.config.ts
    echo   - postcss.config.mjs
    echo.
    echo ========================================
    echo   Next Steps:
    echo ========================================
    echo   1. Upload all files above to cPanel
    echo   2. Upload to: public_html/cms/
    echo   3. Install dependencies on server
    echo   4. Setup Node.js app in cPanel
    echo   5. Add environment variables
    echo   6. Start application
    echo.
    echo   See CPANEL-COMPLETE-DEPLOYMENT-GUIDE.md
    echo   for detailed instructions.
    echo ========================================
) else (
    echo   ERROR: Build folder not found!
    echo   Build may have failed. Check errors above.
    pause
    exit /b 1
)

pause

