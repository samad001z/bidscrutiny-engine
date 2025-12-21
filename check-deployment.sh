#!/bin/bash
# 🚀 DEPLOYMENT READINESS CHECKLIST

echo "=========================================="
echo "🚀 BidScrutiny Deployment Checklist"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2: $1"
        return 0
    else
        echo -e "${RED}✗${NC} $2: $1 (NOT FOUND)"
        return 1
    fi
}

check_content() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $1 contains: $2"
        return 0
    else
        echo -e "${YELLOW}⚠${NC} $1 check: $2 (verify manually)"
        return 1
    fi
}

echo "📦 BACKEND FILES"
echo "---"
check_file "requirements.txt" "Python dependencies"
check_file "Procfile" "Railway configuration"
check_file "start.sh" "Start script"
check_file ".env.example" "Environment template"
echo ""

echo "🎨 FRONTEND FILES"
echo "---"
check_file "frontend/package.json" "NPM dependencies"
check_file "frontend/vite.config.js" "Vite configuration"
check_file "frontend/vercel.json" "Vercel configuration"
check_file "frontend/.env.production" "Production environment"
echo ""

echo "🔐 SECURITY"
echo "---"
check_file ".gitignore" "Git ignore"
check_content ".gitignore" ".env" ".env file in .gitignore"
check_content ".gitignore" "serviceAccount.json" "Firebase credentials in .gitignore"
echo ""

echo "🔧 CONFIGURATION"
echo "---"
check_content "app/main.py" "FRONTEND_URL" "CORS frontend URL handling"
check_content "app/main.py" "allow_origins" "CORS configuration"
check_content "frontend/src/services/api.js" "VITE_API_URL" "API URL configuration"
check_content "frontend/src/services/api.js" "getAPIUrl" "Smart API URL detection"
echo ""

echo "📝 DOCUMENTATION"
echo "---"
check_file "DEPLOYMENT_GUIDE.md" "Deployment guide"
check_file "README.md" "Project README"
echo ""

echo "=========================================="
echo "✅ Deployment Checklist Complete!"
echo "=========================================="
echo ""
echo "📋 NEXT STEPS:"
echo "1. Review DEPLOYMENT_GUIDE.md"
echo "2. Prepare Firebase service account JSON"
echo "3. Get Gemini API key from Google AI Studio"
echo "4. Create Railway account (railway.app)"
echo "5. Create Vercel account (vercel.com)"
echo "6. Follow steps in DEPLOYMENT_GUIDE.md"
echo ""
echo "🎯 PRODUCTION URLS WILL BE:"
echo "   Backend:  https://[your-project].railway.app"
echo "   Frontend: https://[your-project].vercel.app"
echo ""
