#!/bin/bash
# Build script for cPanel deployment

echo "========================================"
echo "  Building CMS for cPanel Deployment"
echo "========================================"
echo ""

echo "[1/4] Cleaning previous builds..."
if [ -d ".next" ]; then
    echo "  Removing .next folder..."
    rm -rf .next
fi
if [ -d "node_modules/.cache" ]; then
    echo "  Removing cache..."
    rm -rf node_modules/.cache
fi
echo "  Done!"
echo ""

echo "[2/4] Installing dependencies..."
npm ci
if [ $? -ne 0 ]; then
    echo "  ERROR: npm install failed!"
    exit 1
fi
echo "  Done!"
echo ""

echo "[3/4] Building Next.js application..."
npm run build
if [ $? -ne 0 ]; then
    echo "  ERROR: Build failed!"
    exit 1
fi
echo "  Done!"
echo ""

echo "[4/4] Verifying build..."
if [ -d ".next" ]; then
    echo "  Build successful!"
    echo ""
    echo "========================================"
    echo "  Files Ready for Upload:"
    echo "========================================"
    echo "  - .next/ folder (built files)"
    echo "  - public/ folder (static assets)"
    echo "  - server.js (production server)"
    echo "  - package.json"
    echo "  - package-lock.json"
    echo "  - next.config.ts"
    echo "  - tsconfig.json"
    echo "  - tailwind.config.ts"
    echo "  - postcss.config.mjs"
    echo ""
    echo "========================================"
    echo "  Next Steps:"
    echo "========================================"
    echo "  1. Upload all files above to cPanel"
    echo "  2. Upload to: public_html/cms/"
    echo "  3. Install dependencies on server"
    echo "  4. Setup Node.js app in cPanel"
    echo "  5. Add environment variables"
    echo "  6. Start application"
    echo ""
    echo "  See CPANEL-COMPLETE-DEPLOYMENT-GUIDE.md"
    echo "  for detailed instructions."
    echo "========================================"
    
    # Show build size
    if command -v du &> /dev/null; then
        echo ""
        echo "Build size:"
        du -sh .next
    fi
else
    echo "  ERROR: Build folder not found!"
    echo "  Build may have failed. Check errors above."
    exit 1
fi

