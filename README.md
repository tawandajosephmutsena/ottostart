# OttoStart

A modern Laravel 12 + React 19 application built with Inertia.js, TypeScript, and Tailwind CSS v4.

## 🚀 Requirements

- **PHP** >= 8.2
- **Node.js** >= 18.x
- **Composer** >= 2.x
- **npm** >= 9.x

## 📦 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ottostart
```

### 2. Install PHP Dependencies

```bash
composer install
```

### 3. Environment Setup

Copy the environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and configure your database and other settings:

```env
APP_NAME=OttoStart
APP_URL=http://localhost:8000

DB_CONNECTION=sqlite
# Or for MySQL:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=ottostart
# DB_USERNAME=root
# DB_PASSWORD=

CACHE_STORE=file
```

### 4. Generate Application Key

```bash
php artisan key:generate
```

### 5. Database Setup

For SQLite (default):

```bash
touch database/database.sqlite
php artisan migrate
```

For MySQL:

```bash
php artisan migrate
```

To seed with demo data:

```bash
php artisan db:seed
```

### 6. Install Node.js Dependencies

```bash
npm install
```

### 7. Build Frontend Assets

For production:

```bash
npm run build
```

For development (with hot-reload):

```bash
npm run dev
```

## 🏃 Running the Application

### Development

**Option 1: Run all services together (recommended)**

```bash
composer dev
```

This starts the PHP server, queue worker, logs, and Vite dev server concurrently.

**Option 2: Run services separately**

Terminal 1 - PHP Server:

```bash
php artisan serve
```

Terminal 2 - Vite Dev Server:

```bash
npm run dev
```

The application will be available at:

- **App**: http://localhost:8000
- **Vite**: http://localhost:5173

### Production

```bash
npm run build
php artisan serve
```

### With Laravel Herd

If using [Laravel Herd](https://herd.laravel.com/), the application will be available at:

- http://ottostart.test

## 🧪 Testing

```bash
# Run all tests
composer test

# Or directly with Pest
php artisan test
```

## 🛠️ Available Scripts

### Composer Scripts

| Command            | Description                                                 |
| ------------------ | ----------------------------------------------------------- |
| `composer setup`   | Full installation (dependencies, env, key, migrations, npm) |
| `composer dev`     | Start all development services                              |
| `composer dev:ssr` | Start with SSR enabled                                      |
| `composer test`    | Run test suite                                              |

### NPM Scripts

| Command             | Description                    |
| ------------------- | ------------------------------ |
| `npm run dev`       | Start Vite dev server with HMR |
| `npm run build`     | Build for production           |
| `npm run build:ssr` | Build with SSR support         |
| `npm run lint`      | Run ESLint                     |
| `npm run format`    | Format code with Prettier      |
| `npm run types`     | TypeScript type checking       |

## 📁 Project Structure

```
ottostart/
├── app/                    # Laravel application code
│   ├── Http/Controllers/   # Controllers
│   ├── Models/             # Eloquent models
│   ├── Services/           # Business logic services
│   └── Providers/          # Service providers
├── config/                 # Configuration files
├── database/
│   ├── migrations/         # Database migrations
│   └── seeders/            # Database seeders
├── public/                 # Public assets
├── resources/
│   ├── js/                 # React components & TypeScript
│   │   ├── components/     # Reusable UI components
│   │   ├── layouts/        # Layout components
│   │   └── pages/          # Inertia page components
│   └── css/                # Tailwind CSS styles
├── routes/                 # Route definitions
│   ├── web.php             # Web routes
│   └── api.php             # API routes
└── tests/                  # Test files
```

## 🔧 Tech Stack

- **Backend**: Laravel 12, PHP 8.2+
- **Frontend**: React 19, TypeScript, Inertia.js
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI, Headless UI
- **Animations**: Framer Motion, GSAP
- **Rich Text**: TipTap Editor
- **Build Tool**: Vite 7
- **Testing**: Pest PHP

## 📝 License

This project is open-sourced software licensed under the [MIT license](LICENSE).
