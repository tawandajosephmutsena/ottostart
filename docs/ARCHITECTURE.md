# OttoStart Architecture

A comprehensive overview of the OttoStart web application architecture.

## Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Backend** | Laravel | 12.x |
| **Frontend** | React | 19.x |
| **Bridge** | Inertia.js | 2.x |
| **Styling** | Tailwind CSS | 4.x |
| **Language** | TypeScript | 5.x |
| **Build** | Vite | 7.x |
| **Database** | SQLite/MySQL | - |
| **Cache** | Redis (optional) | - |

## Directory Structure

```text
ottostart/
├── app/
│   ├── Http/
│   │   ├── Controllers/       # Request handlers
│   │   │   └── Admin/         # Admin panel controllers
│   │   └── Middleware/        # Security, caching, SEO middleware
│   ├── Models/                # Eloquent models with SEO traits
│   ├── Services/              # Business logic services
│   ├── Traits/                # Reusable model traits
│   ├── Observers/             # Model event observers
│   └── Providers/             # Service providers
├── config/                    # Laravel configuration
├── database/
│   ├── migrations/            # Database schema
│   └── seeders/               # Data seeders
├── Modules/                   # Laravel modules (plugins)
│   └── DemoPlugin/            # Example plugin module
├── resources/
│   ├── js/
│   │   ├── components/        # React components
│   │   │   ├── admin/         # Admin panel components
│   │   │   ├── Blocks/        # Page builder blocks
│   │   │   └── ui/            # UI primitives (shadcn/ui)
│   │   ├── layouts/           # Page layouts
│   │   └── pages/             # Inertia pages
│   └── css/                   # Tailwind CSS
├── routes/
│   └── web.php                # Application routes
└── tests/
    ├── Unit/                  # Unit tests
    └── Feature/               # Feature tests
```

## Core Concepts

### 1. Page Builder System

The page builder allows dynamic page creation using composable blocks:

```text
Page → Blocks[] → Block { type, content, is_enabled }
```

**Block Types:**
- `hero` - Hero section with image
- `text` - Rich text with columns
- `stats` - Statistics display
- `services` - Dynamic services listing
- `portfolio` - Dynamic portfolio items
- `insights` - Blog posts listing
- `form` - Multi-step contact form
- `faq` - FAQ accordion
- `testimonials` - Testimonial carousel
- And more...

### 2. Model Traits

Models utilize shared traits for common functionality:

| Trait | Purpose |
|-------|---------|
| `HasSeoOptimization` | SEO metadata generation |
| `HasSemanticAnalysis` | Content analysis |
| `HasImageSeo` | Image SEO attributes |
| `HasWebCoreVitals` | Performance tracking |
| `HasVersions` | Content versioning |

### 3. Middleware Pipeline

Request flow through middleware:

```text
Request → XssProtection → SecurityHeaders → CompressionMiddleware 
       → InjectSeoData → HandleInertiaRequests → TrackVisits → Response
```

### 4. Caching Strategy

Multi-layer caching with tag-based invalidation:

```php
// CacheManager service
$cacheManager->remember('key', callback, TTL, ['tags']);
$cacheManager->invalidateByTags(['portfolio', 'featured']);
```

## Data Flow

### Frontend to Backend

```text
React Component → Inertia.useForm() → Laravel Controller → Model → Database
```

### Backend to Frontend

```text
Controller → Inertia::render('Page', $data) → React Page Component
```

## Security Implementation

| Feature | Implementation |
|---------|----------------|
| CSRF Protection | Laravel built-in |
| XSS Prevention | `XssProtection` middleware |
| CSP Headers | `SecurityHeaders` middleware |
| Rate Limiting | `RateLimitMiddleware` |
| File Upload Security | `SecureFileUploadService` |
| Account Lockout | `CheckAccountLockout` middleware |

## Module System

Plugins use `nwidart/laravel-modules` package:

```text
Modules/
└── DemoPlugin/
    ├── Config/
    ├── Http/Controllers/
    ├── Models/
    ├── Providers/
    │   └── DemoPluginServiceProvider.php
    └── Routes/
```

## Admin Panel Routes

| Route Group | Prefix | Middleware |
|-------------|--------|------------|
| Portfolio | `/admin/portfolio` | `auth`, `admin` |
| Services | `/admin/services` | `auth`, `admin` |
| Insights | `/admin/insights` | `auth`, `admin` |
| Pages | `/admin/pages` | `auth`, `admin` |
| Media | `/admin/media` | `auth`, `admin` |
| SEO | `/admin/seo` | `auth`, `admin` |

## Frontend Component Organization

### Admin Components

```text
components/admin/
├── PageBuilder/
│   ├── PageBuilder.tsx      # Main builder container
│   ├── BlockEditor.tsx      # Block content editor
│   ├── SortableBlockItem.tsx # Draggable block item
│   └── VisualPreview.tsx    # Live preview
├── RichTextEditor.tsx       # TipTap editor
└── MediaLibrary.tsx         # Media upload/select
```

### Public Components

```text
components/
├── Blocks/                  # Renderable block components
├── Navigation.tsx           # Site navigation
├── Footer.tsx               # Site footer
├── SeoHead.tsx              # SEO meta tags
└── StructuredData.tsx       # JSON-LD schema
```

## API Patterns

### Controller Methods

```php
// Standard CRUD pattern
public function index()    // List all
public function create()   // Show create form
public function store()    // Create new
public function show()     // Show single
public function edit()     // Show edit form
public function update()   // Update existing
public function destroy()  // Delete
```

### Service Methods

```php
// Business logic in services
$seoService->analyzePage($data);
$cacheManager->getFeaturedProjects();
$imageService->optimize($path);
```

## Testing Strategy

| Type | Tool | Location |
|------|------|----------|
| Unit Tests | Pest PHP | `tests/Unit/` |
| Feature Tests | Laravel | `tests/Feature/` |
| Browser Tests | Dusk | `tests/Browser/` |
| Type Checking | TypeScript | `npm run types` |
| Linting | ESLint | `npm run lint` |
