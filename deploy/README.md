# OttoStart Deployment Tools

This folder contains scripts and utilities for deploying OttoStart to cPanel shared hosting (Verpex).

## 📁 Contents

| File | Description |
|------|-------------|
| `verify.sh` | Pre-deployment verification script - checks that everything is ready |
| `create-package.sh` | Creates a production-ready deployment package (zip file) |
| `cpanel-helper.php` | Web-based artisan command runner for cPanel (use when SSH unavailable) |

## 🚀 Quick Start

### 1. Verify Everything is Ready

```bash
./deploy/verify.sh
```

This checks:
- PHP version and extensions
- Composer dependencies
- Frontend build status
- Environment configuration
- Database and storage structure
- Critical files

### 2. Create Deployment Package

```bash
./deploy/create-package.sh
```

This will:
- Clear all caches
- Install production dependencies
- Build frontend assets
- Create a timestamped zip package
- Generate a deployment checklist

### 3. Upload to Verpex cPanel

Follow the instructions in `docs/CPANEL_DEPLOYMENT.md` or the generated checklist.

## ⚠️ Security Notes

### cpanel-helper.php

This file provides web-based access to artisan commands for servers without SSH access.

**IMPORTANT:**
1. Change the `$secretKey` variable before uploading
2. Only upload when needed
3. **DELETE IMMEDIATELY after use**
4. Never commit with a known secret key

## 📖 Full Documentation

See `docs/CPANEL_DEPLOYMENT.md` for complete deployment instructions including:

- Pre-deployment checklist
- Verpex cPanel configuration
- File upload options  
- Database setup (SQLite & MySQL)
- Post-upload configuration
- SSL & security setup
- Troubleshooting guide

## 🔄 Updating an Existing Deployment

1. Create a new package: `./deploy/create-package.sh`
2. Upload to server
3. Run the update commands via SSH or cpanel-helper.php:
   - Clear caches
   - Run migrations
   - Rebuild caches
