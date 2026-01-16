#!/bin/bash

# ============================================================
# OttoStart Production Deployment Package Creator
# For cPanel/Verpex Shared Hosting
# ============================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  OttoStart Production Package Creator${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Navigate to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo -e "${YELLOW}📁 Working from: ${PROJECT_ROOT}${NC}"

# Step 1: Clear caches
echo -e "\n${GREEN}[1/7] Clearing caches...${NC}"
php artisan cache:clear 2>/dev/null || true
php artisan config:clear 2>/dev/null || true
php artisan route:clear 2>/dev/null || true
php artisan view:clear 2>/dev/null || true
rm -f bootstrap/cache/config.php
rm -f bootstrap/cache/routes-v7.php
rm -f bootstrap/cache/*.php

# Step 2: Ensure production dependencies
echo -e "\n${GREEN}[2/7] Preparing dependencies...${NC}"
# Use --no-scripts to avoid issues with dev dependency removal
composer install --no-dev --optimize-autoloader --no-interaction --no-scripts 2>/dev/null || true
# Dump autoload separately
composer dump-autoload --optimize --no-scripts

# Step 3: Build frontend assets
echo -e "\n${GREEN}[3/7] Building frontend assets...${NC}"
# Only build if node_modules exist or install them
if [ ! -d "node_modules" ]; then
    npm ci --omit=dev
fi
npm run build

# Step 4: Verify .env.production exists
echo -e "\n${GREEN}[4/7] Checking environment file...${NC}"
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}⚠️  .env.production not found. Creating from .env.example...${NC}"
    cp .env.example .env.production
    echo -e "${YELLOW}   Please edit .env.production with your production settings!${NC}"
fi

# Step 5: Create package
echo -e "\n${GREEN}[5/7] Creating deployment package...${NC}"

# Package name with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
PACKAGE_NAME="ottostart_production_${TIMESTAMP}.zip"

# Files and folders to include
echo -e "${YELLOW}   Packaging application files...${NC}"

# Create a temporary directory for clean packaging
TEMP_DIR=$(mktemp -d)
echo -e "${YELLOW}   Using temp directory: ${TEMP_DIR}${NC}"

# Copy essential files to temp directory
echo -e "${YELLOW}   Copying essential files...${NC}"

# Core Laravel directories
cp -r app "$TEMP_DIR/"
cp -r bootstrap "$TEMP_DIR/"
cp -r config "$TEMP_DIR/"
cp -r lang "$TEMP_DIR/"
cp -r public "$TEMP_DIR/"
# Resources folder with proper structure
mkdir -p "$TEMP_DIR/resources"
cp -r resources/views "$TEMP_DIR/resources/views" 2>/dev/null || mkdir -p "$TEMP_DIR/resources/views"
cp -r resources/css "$TEMP_DIR/resources/css" 2>/dev/null || true
cp -r resources/js "$TEMP_DIR/resources/js" 2>/dev/null || true
cp -r routes "$TEMP_DIR/"
cp -r vendor "$TEMP_DIR/"

# Database
mkdir -p "$TEMP_DIR/database"
cp -r database/migrations "$TEMP_DIR/database/" 2>/dev/null || true
cp -r database/seeders "$TEMP_DIR/database/" 2>/dev/null || true
cp -r database/factories "$TEMP_DIR/database/" 2>/dev/null || true
cp database/database.sqlite "$TEMP_DIR/database/" 2>/dev/null || true

# Modules (if exists)
if [ -d "Modules" ]; then
    cp -r Modules "$TEMP_DIR/"
fi

# Storage structure (empty directories with .gitignore)
mkdir -p "$TEMP_DIR/storage/app/public"
mkdir -p "$TEMP_DIR/storage/framework/cache/data"
mkdir -p "$TEMP_DIR/storage/framework/sessions"
mkdir -p "$TEMP_DIR/storage/framework/views"
mkdir -p "$TEMP_DIR/storage/logs"

# Copy any existing public uploads
if [ -d "storage/app/public" ]; then
    cp -r storage/app/public/* "$TEMP_DIR/storage/app/public/" 2>/dev/null || true
fi

# Root files
cp .htaccess "$TEMP_DIR/" 2>/dev/null || true
cp .env.production "$TEMP_DIR/.env" # Rename for production
cp artisan "$TEMP_DIR/"
cp composer.json "$TEMP_DIR/"
cp composer.lock "$TEMP_DIR/"
cp index.php "$TEMP_DIR/"
cp modules_statuses.json "$TEMP_DIR/" 2>/dev/null || true

# Create .gitignore files for storage
echo "*\n!.gitignore" > "$TEMP_DIR/storage/framework/cache/data/.gitignore"
echo "*\n!.gitignore" > "$TEMP_DIR/storage/framework/sessions/.gitignore"
echo "*\n!.gitignore" > "$TEMP_DIR/storage/framework/views/.gitignore"
echo "*.log\n!.gitignore" > "$TEMP_DIR/storage/logs/.gitignore"

# Create the zip file
echo -e "${YELLOW}   Creating zip archive...${NC}"
cd "$TEMP_DIR"
zip -r "$PROJECT_ROOT/$PACKAGE_NAME" . -x "*.DS_Store" -x "*__MACOSX*" > /dev/null

# Cleanup temp directory
cd "$PROJECT_ROOT"
rm -rf "$TEMP_DIR"

# Reinstall all dependencies (including dev) for local development
echo -e "\n${GREEN}[6/7] Restoring dev dependencies...${NC}"
composer install --no-interaction 2>/dev/null || true

# Step 7: Create deployment instructions
echo -e "\n${GREEN}[7/7] Creating deployment checklist...${NC}"

cat > "deploy/DEPLOY_CHECKLIST_${TIMESTAMP}.txt" << 'EOF'
==============================================
OttoStart cPanel Deployment Checklist
==============================================

BEFORE UPLOAD:
[ ] Verify .env has correct settings (automatically renamed from .env.production)
[ ] Update APP_URL to your domain
[ ] Update DB_DATABASE path to match cPanel username
[ ] Generate a new APP_KEY if needed

CPANEL SETUP:
[ ] Set PHP version to 8.2+ (Select PHP Version)
[ ] Enable extensions: ctype, curl, dom, fileinfo, filter, hash, 
    mbstring, openssl, pcre, pdo, pdo_sqlite, session, tokenizer, 
    xml, gd, zip, intl

UPLOAD STEPS:
[ ] Upload zip to /home/YOUR_USERNAME/
[ ] Extract the archive
[ ] Move public/* contents to public_html/
[ ] The .env file is already configured (renamed from .env.production)

VIA SSH TERMINAL:
[ ] cd ~/public_html  (or to your app root)
[ ] chmod -R 755 storage bootstrap/cache
[ ] chmod 644 database/database.sqlite
[ ] php artisan storage:link
[ ] php artisan config:cache
[ ] php artisan route:cache
[ ] php artisan view:cache

VERIFICATION:
[ ] Visit your domain and check the homepage
[ ] Test login functionality
[ ] Check storage/logs/laravel.log for errors
[ ] Verify uploads work correctly

IMPORTANT PATHS IN .env:
- DB_DATABASE=/home/YOUR_CPANEL_USER/public_html/database/database.sqlite
- APP_URL=https://your-domain.com
EOF

# Show summary
echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${GREEN}✅ Deployment package ready:${NC}"
echo -e "   ${YELLOW}${PACKAGE_NAME}${NC}"
echo ""
echo -e "${GREEN}📋 Checklist created:${NC}"
echo -e "   ${YELLOW}deploy/DEPLOY_CHECKLIST_${TIMESTAMP}.txt${NC}"
echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${YELLOW}NEXT STEPS:${NC}"
echo "1. Upload ${PACKAGE_NAME} to Verpex cPanel"
echo "2. Follow the deployment checklist"
echo "3. The .env file is already configured from .env.production"
echo ""
echo -e "📖 Full documentation: ${YELLOW}docs/CPANEL_DEPLOYMENT.md${NC}"
echo -e "${BLUE}============================================${NC}"

# Get file size
SIZE=$(du -h "$PACKAGE_NAME" | cut -f1)
echo -e "\n📦 Package size: ${SIZE}"
