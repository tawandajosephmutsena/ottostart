#!/bin/bash

# ============================================================
# OttoStart Pre-Deployment Verification Script
# Checks that everything is ready for cPanel deployment
# ============================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  OttoStart Pre-Deployment Verification${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Navigate to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

ERRORS=0
WARNINGS=0

check_pass() {
    echo -e "  ${GREEN}✓${NC} $1"
}

check_fail() {
    echo -e "  ${RED}✗${NC} $1"
    ((ERRORS++))
}

check_warn() {
    echo -e "  ${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

# ============================================
# PHP Version Check
# ============================================
echo -e "\n${YELLOW}[1/8] PHP Version${NC}"
PHP_VERSION=$(php -r "echo PHP_MAJOR_VERSION.'.'.PHP_MINOR_VERSION;")
if [[ $(echo "$PHP_VERSION >= 8.2" | bc) -eq 1 ]]; then
    check_pass "PHP $PHP_VERSION detected"
else
    check_fail "PHP 8.2+ required, found $PHP_VERSION"
fi

# ============================================
# Required PHP Extensions
# ============================================
echo -e "\n${YELLOW}[2/8] PHP Extensions${NC}"
EXTENSIONS=("curl" "dom" "fileinfo" "mbstring" "openssl" "pdo" "pdo_sqlite" "tokenizer" "xml" "zip")

for ext in "${EXTENSIONS[@]}"; do
    if php -m | grep -qi "^$ext$"; then
        check_pass "$ext extension enabled"
    else
        check_fail "$ext extension missing"
    fi
done

# ============================================
# Composer Dependencies
# ============================================
echo -e "\n${YELLOW}[3/8] Composer Dependencies${NC}"
if [ -d "vendor" ]; then
    check_pass "Vendor directory exists"
else
    check_fail "Vendor directory missing - run 'composer install'"
fi

if [ -f "vendor/autoload.php" ]; then
    check_pass "Autoloader present"
else
    check_fail "Autoloader missing"
fi

# ============================================
# Frontend Build
# ============================================
echo -e "\n${YELLOW}[4/8] Frontend Build${NC}"
if [ -d "public/build" ]; then
    check_pass "Build directory exists"
else
    check_fail "Build directory missing - run 'npm run build'"
fi

if [ -f "public/build/manifest.json" ]; then
    check_pass "Manifest file present"
    
    # Check manifest is not empty
    if [ -s "public/build/manifest.json" ]; then
        check_pass "Manifest file has content"
    else
        check_fail "Manifest file is empty"
    fi
else
    check_fail "Manifest file missing"
fi

# Count JS files
JS_COUNT=$(find public/build -name "*.js" 2>/dev/null | wc -l | tr -d ' ')
if [ "$JS_COUNT" -gt 0 ]; then
    check_pass "$JS_COUNT JavaScript files found"
else
    check_fail "No JavaScript files in build"
fi

# Count CSS files
CSS_COUNT=$(find public/build -name "*.css" 2>/dev/null | wc -l | tr -d ' ')
if [ "$CSS_COUNT" -gt 0 ]; then
    check_pass "$CSS_COUNT CSS files found"
else
    check_fail "No CSS files in build"
fi

# ============================================
# Environment Files
# ============================================
echo -e "\n${YELLOW}[5/8] Environment Configuration${NC}"
if [ -f ".env.production" ]; then
    check_pass ".env.production exists"
    
    # Check for required variables
    if grep -q "APP_ENV=production" .env.production; then
        check_pass "APP_ENV=production is set"
    else
        check_warn "APP_ENV should be 'production'"
    fi
    
    if grep -q "APP_DEBUG=false" .env.production; then
        check_pass "APP_DEBUG=false is set"
    else
        check_fail "APP_DEBUG must be false for production!"
    fi
    
    if grep -q "APP_KEY=" .env.production; then
        check_pass "APP_KEY is set"
    else
        check_fail "APP_KEY is missing"
    fi
    
    if grep -q "APP_URL=http://localhost" .env.production; then
        check_warn "APP_URL is still localhost - update to your domain"
    else
        check_pass "APP_URL appears configured"
    fi
else
    check_fail ".env.production missing - copy from .env.example"
fi

# ============================================
# Database
# ============================================
echo -e "\n${YELLOW}[6/8] Database${NC}"
if [ -f "database/database.sqlite" ]; then
    check_pass "SQLite database exists"
    
    # Check database size
    DB_SIZE=$(du -h database/database.sqlite | cut -f1)
    check_pass "Database size: $DB_SIZE"
else
    check_warn "SQLite database not found (will need to create on server)"
fi

# ============================================
# Storage Structure
# ============================================
echo -e "\n${YELLOW}[7/8] Storage Structure${NC}"
STORAGE_DIRS=("storage/app/public" "storage/framework/cache" "storage/framework/sessions" "storage/framework/views" "storage/logs")

for dir in "${STORAGE_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        check_pass "$dir exists"
    else
        check_fail "$dir missing"
    fi
done

if [ -d "bootstrap/cache" ]; then
    check_pass "bootstrap/cache exists"
else
    check_fail "bootstrap/cache missing"
fi

# ============================================
# Critical Files
# ============================================
echo -e "\n${YELLOW}[8/8] Critical Files${NC}"
CRITICAL_FILES=("artisan" "index.php" "public/index.php" ".htaccess" "public/.htaccess" "composer.json" "composer.lock")

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        check_pass "$file present"
    else
        check_fail "$file missing"
    fi
done

# ============================================
# Summary
# ============================================
echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  Verification Summary${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed! Ready for deployment.${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Run: ./deploy/create-package.sh"
    echo "  2. Upload the package to Verpex cPanel"
    echo "  3. Follow docs/CPANEL_DEPLOYMENT.md"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS warning(s) found.${NC}"
    echo ""
    echo "You can proceed but should address the warnings."
else
    echo -e "${RED}❌ $ERRORS error(s) and $WARNINGS warning(s) found.${NC}"
    echo ""
    echo "Please fix the errors before deploying."
fi

echo ""
echo -e "${BLUE}============================================${NC}"

exit $ERRORS
