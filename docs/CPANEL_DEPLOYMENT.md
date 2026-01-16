# OttoStart cPanel Deployment Guide for Verpex

Complete guide for deploying OttoStart to Verpex shared hosting with cPanel.

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Local Preparation](#local-preparation)
3. [Verpex cPanel Setup](#verpex-cpanel-setup)
4. [File Upload](#file-upload)
5. [Database Configuration](#database-configuration)
6. [Post-Upload Configuration](#post-upload-configuration)
7. [SSL & Security](#ssl--security)
8. [Troubleshooting](#troubleshooting)

---

## 📌 Pre-Deployment Checklist

### Verpex Hosting Requirements

- [ ] Verpex shared hosting plan with cPanel access
- [ ] PHP 8.2+ available (Select PHP Version in cPanel)
- [ ] SSH/Terminal access enabled (recommended)
- [ ] Default MySQL database support
- [ ] Domain configured and pointing to Verpex

### Required PHP Extensions

Ensure these are enabled in cPanel > Select PHP Version > Extensions:

- `ctype`
- `curl`
- `dom`
- `fileinfo`
- `filter`
- `hash`
- `mbstring`
- `openssl`
- `pcre`
- `pdo`
- `pdo_sqlite` (for SQLite) or `pdo_mysql` (for MySQL)
- `session`
- `tokenizer`
- `xml`
- `gd` or `imagick` (for image processing)
- `zip`
- `intl`

---

## 🛠️ Local Preparation

### Step 1: Build Production Assets

```bash
cd /Users/mac/Herd/ottostart

# Clear all caches first
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Install production dependencies
composer install --no-dev --optimize-autoloader

# Build frontend assets
npm ci
npm run build
```

### Step 2: Prepare the .env File

Create or update `.env.production` with your Verpex settings:

```env
APP_NAME=OttoStart
APP_ENV=production
APP_KEY=base64:YOUR_APP_KEY_HERE
APP_DEBUG=false
APP_URL=https://your-domain.com

APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US

APP_MAINTENANCE_DRIVER=file

BCRYPT_ROUNDS=12

LOG_CHANNEL=single
LOG_LEVEL=error

# For SQLite (simpler, recommended for shared hosting)
DB_CONNECTION=sqlite
DB_DATABASE=/home/YOUR_CPANEL_USERNAME/public_html/database/database.sqlite

# For MySQL (alternative)
# DB_CONNECTION=mysql
# DB_HOST=localhost
# DB_PORT=3306
# DB_DATABASE=your_cpanel_user_dbname
# DB_USERNAME=your_cpanel_user_dbuser
# DB_PASSWORD=your_database_password

SESSION_DRIVER=file
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=lax

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync

CACHE_STORE=file
CACHE_PREFIX=ottostart-cache

MAIL_MAILER=log
# Or configure SMTP:
# MAIL_MAILER=smtp
# MAIL_HOST=mail.your-domain.com
# MAIL_PORT=465
# MAIL_USERNAME=email@your-domain.com
# MAIL_PASSWORD=your_email_password
# MAIL_ENCRYPTION=ssl
# MAIL_FROM_ADDRESS=noreply@your-domain.com
# MAIL_FROM_NAME="${APP_NAME}"

VITE_APP_NAME="${APP_NAME}"
```

### Step 3: Create Deployment Package

Run the deployment script (created below) or manually:

```bash
# Create deployment package
./deploy/create-package.sh
```

---

## 🖥️ Verpex cPanel Setup

### Step 1: Access cPanel

1. Log in to your Verpex client area
2. Navigate to your hosting plan
3. Click "cPanel" or "Manage"

### Step 2: Configure PHP Version

1. Go to **Select PHP Version**
2. Set PHP version to **8.2** (or higher if available)
3. Enable required extensions (see checklist above)
4. Click **Save**

### Step 3: Configure PHP Settings (Optional)

In **Select PHP Version** > **Options**:

```ini
max_execution_time = 300
max_input_time = 300
memory_limit = 256M
post_max_size = 64M
upload_max_filesize = 64M
```

---

## 📤 File Upload

### Option A: Upload to Root (Recommended for Main Domain)

Your Laravel app will be at:
```
/home/YOUR_USERNAME/
├── public_html/           ← Laravel's public folder contents go here
│   ├── build/
│   ├── storage/           ← Symlink to ../storage/app/public
│   ├── index.php          ← Modified to point to parent
│   ├── .htaccess
│   └── [other public assets]
├── app/
├── bootstrap/
├── config/
├── database/
├── lang/
├── Modules/
├── resources/
├── routes/
├── storage/
├── vendor/
├── .env
├── .htaccess              ← Root .htaccess for security
├── artisan
├── composer.json
└── index.php              ← Already configured for this setup
```

**Upload Steps:**

1. **File Manager** in cPanel
2. Navigate to `/home/YOUR_USERNAME/`
3. Upload your `ottostart_production.zip`
4. Extract in place
5. Move `public/*` contents to `public_html/`
6. Delete the now-empty `public/` folder

### Option B: Upload to Subdirectory (For Subdomain)

1. Create subdomain in cPanel > Subdomains
2. Point document root to `/home/YOUR_USERNAME/ottostart/public`
3. Upload entire Laravel app to `/home/YOUR_USERNAME/ottostart/`

---

## 🗄️ Database Configuration

### For SQLite (Current Configuration)

SQLite is already configured. Just ensure:

1. The database file exists at the correct path
2. The file has proper permissions (644)
3. The directory has proper permissions (755)

```bash
# Via SSH/Terminal in cPanel
chmod 644 database/database.sqlite
chmod 755 database/
```

### For MySQL (Alternative)

1. **MySQL Databases** in cPanel
2. Create a new database (e.g., `youruser_ottostart`)
3. Create a new user with a strong password
4. Add user to database with **All Privileges**
5. Update `.env` with new credentials
6. Run migrations:

```bash
# Via SSH/Terminal
cd ~/public_html  # or your app directory
php artisan migrate --force
```

---

## ⚙️ Post-Upload Configuration

### Step 1: Set File Permissions

Via SSH Terminal in cPanel:

```bash
cd ~/public_html  # or your app root

# Storage and cache directories
chmod -R 755 storage
chmod -R 755 bootstrap/cache
chmod 644 database/database.sqlite

# Make artisan executable
chmod +x artisan
```

### Step 2: Create Storage Symlink

**Option A: Via SSH**
```bash
cd ~/public_html
php artisan storage:link
```

**Option B: Via PHP Script (if no SSH)**

Create `~/public_html/storage_link.php`:
```php
<?php
// Run once then DELETE this file!
$target = __DIR__ . '/../storage/app/public';
$link = __DIR__ . '/storage';

if (file_exists($link)) {
    echo "Link already exists.\n";
} else {
    symlink($target, $link);
    echo "Storage link created successfully!\n";
}
echo "DELETE THIS FILE NOW for security!";
```

Visit `https://your-domain.com/storage_link.php` then delete the file.

### Step 3: Clear and Cache

Via SSH Terminal:

```bash
cd ~/public_html

# Clear all caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Cache for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Step 4: Verify .htaccess Files

Ensure `/public_html/.htaccess` contains:

```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Handle X-XSRF-Token Header
    RewriteCond %{HTTP:x-xsrf-token} .
    RewriteRule .* - [E=HTTP_X_XSRF_TOKEN:%{HTTP:X-XSRF-Token}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

---

## 🔒 SSL & Security

### Enable SSL (Free with Verpex)

1. **SSL/TLS Status** in cPanel
2. Click **Run AutoSSL** for your domain
3. Wait for certificate installation

### Force HTTPS

Add to `.htaccess` in `public_html`:

```apache
# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### Security Headers

Already configured in your Laravel middleware (`SecurityHeaders.php`).

---

## 🔧 Troubleshooting

### 500 Internal Server Error

1. **Check error logs**: cPanel > Errors or `storage/logs/laravel.log`
2. **Verify PHP version**: Must be 8.2+
3. **Check file permissions**: `storage/` and `bootstrap/cache/` must be writable
4. **Clear caches**: 
   ```bash
   php artisan cache:clear
   php artisan config:clear
   ```

### "Class not found" Errors

```bash
composer dump-autoload
php artisan clear-compiled
```

### Storage/Image Not Displaying

1. Verify storage symlink exists
2. Check `public_html/storage` → `../storage/app/public`
3. Check file permissions

### Database Connection Errors

1. **SQLite**: Verify path in `.env` matches actual location
2. **MySQL**: Verify credentials in cPanel match `.env`
3. Check that `pdo_sqlite` or `pdo_mysql` extension is enabled

### Session/Login Issues

1. Verify `SESSION_DOMAIN` is correct (or set to `null`)
2. Check `SESSION_SECURE_COOKIE=true` if using HTTPS
3. Clear browser cookies and Laravel sessions:
   ```bash
   php artisan session:table  # if using database sessions
   ```

### Assets Not Loading (CSS/JS 404)

1. Verify `npm run build` was run before upload
2. Check `public_html/build/` folder exists with assets
3. Verify `manifest.json` exists in `public_html/build/`

---

## 📝 Quick Reference Commands

```bash
# SSH into Verpex (if available)
ssh username@your-domain.com

# Navigate to app
cd ~/public_html

# Artisan commands
php artisan cache:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force
php artisan storage:link

# Check PHP version
php -v

# Check Laravel version
php artisan --version

# View logs
tail -f storage/logs/laravel.log
```

---

## 🔄 Updating Your Application

1. Put site in maintenance mode: `php artisan down`
2. Upload new files (or pull via git if configured)
3. Run: `composer install --no-dev`
4. Run: `php artisan migrate --force`
5. Clear and re-cache configuration
6. Bring site back: `php artisan up`

---

## 📞 Verpex Support

If you encounter hosting-specific issues:
- Verpex Support: https://verpex.com/support
- Knowledge Base: https://verpex.com/kb
