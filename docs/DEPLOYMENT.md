# OttoStart Deployment Guide

A comprehensive guide for deploying OttoStart to production environments.

## Prerequisites

- PHP 8.2 or higher
- Composer 2.x
- Node.js 20.x or higher
- NPM 10.x or higher
- MySQL 8.0+ or PostgreSQL 14+ (SQLite for development)
- Redis (optional, for caching)

## Environment Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url> ottostart
cd ottostart

# Install PHP dependencies
composer install --no-dev --optimize-autoloader

# Install Node dependencies and build
npm ci
npm run build
```

### 2. Configure Environment

```bash
cp .env.example .env
php artisan key:generate
```

### 3. Essential Environment Variables

```env
# Application
APP_NAME=OttoStart
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ottostart
DB_USERNAME=your_user
DB_PASSWORD=your_password

# Session (use database for distributed setups)
SESSION_DRIVER=database
SESSION_ENCRYPT=true
SESSION_SECURE_COOKIE=true

# Cache (Redis recommended for production)
CACHE_STORE=redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Queue (for background jobs)
QUEUE_CONNECTION=database

# Mail
MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host
MAIL_PORT=587
MAIL_USERNAME=your-email
MAIL_PASSWORD=your-password
MAIL_ENCRYPTION=tls

# Sentry (Error Monitoring)
SENTRY_LARAVEL_DSN=https://your-sentry-dsn
```

### 4. Database Setup

```bash
php artisan migrate --force
php artisan db:seed --class=DatabaseSeeder --force
```

## Production Optimization

### 1. Laravel Optimization

```bash
# Cache configuration
php artisan config:cache

# Cache routes
php artisan route:cache

# Cache views
php artisan view:cache

# Optimize autoloader
composer dump-autoload --optimize
```

### 2. Asset Optimization

Assets are optimized during `npm run build`:
- CSS minification
- JavaScript tree-shaking
- Console/debugger removal
- Source maps disabled

### 3. Cache Warm-up

```bash
# Warm up application cache
php artisan cache:warmup
```

## Web Server Configuration

### Nginx Configuration

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name your-domain.com;

    root /var/www/ottostart/public;
    index index.php;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # Static file caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

### Apache Configuration (.htaccess)

The default Laravel `.htaccess` in `/public` handles most requirements.

## Queue Workers

### Supervisor Configuration

Create `/etc/supervisor/conf.d/ottostart-worker.conf`:

```ini
[program:ottostart-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/ottostart/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/ottostart/storage/logs/worker.log
stopwaitsecs=3600
```

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start ottostart-worker:*
```

## Scheduled Tasks

Add to crontab:

```bash
* * * * * cd /var/www/ottostart && php artisan schedule:run >> /dev/null 2>&1
```

## Backup Configuration

### Automated Backups

The application uses `spatie/laravel-backup`. Configure in `config/backup.php`:

```bash
# Manual backup
php artisan backup:run

# Clean old backups
php artisan backup:clean
```

## Monitoring

### Health Checks

- `/up` - Laravel health check endpoint
- `/api/health` - Custom API health check

### Error Tracking

Sentry is configured for error tracking. Ensure `SENTRY_LARAVEL_DSN` is set.

## Security Checklist

- [ ] `APP_DEBUG=false`
- [ ] `SESSION_ENCRYPT=true`
- [ ] `SESSION_SECURE_COOKIE=true`
- [ ] HTTPS enforced
- [ ] Strong database passwords
- [ ] Redis password protected (if used)
- [ ] File permissions: directories 755, files 644
- [ ] `storage/` and `bootstrap/cache/` writable by web server
- [ ] Environment file not accessible via web

## Deployment Checklist

1. [ ] Run `composer install --no-dev`
2. [ ] Run `npm ci && npm run build`
3. [ ] Configure `.env` for production
4. [ ] Generate application key
5. [ ] Run migrations
6. [ ] Cache configuration, routes, views
7. [ ] Set up queue workers
8. [ ] Configure scheduled tasks
9. [ ] Set up SSL certificates
10. [ ] Test all critical paths
11. [ ] Enable error monitoring
12. [ ] Configure backups

## Rollback Procedure

```bash
# If deployment fails
git checkout previous-tag
composer install --no-dev
npm ci && npm run build
php artisan migrate:rollback
php artisan config:cache
php artisan route:cache
```

## Common Issues

### Storage Permissions

```bash
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

### Queue Not Processing

```bash
php artisan queue:restart
```

### Cache Issues

```bash
php artisan cache:clear
php artisan config:clear
php artisan view:clear
```
