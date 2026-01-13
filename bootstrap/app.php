<?php

use App\Http\Middleware\AdminMiddleware;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\RoleMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        // \App\Http\Middleware\VerifyCsrfToken::class, // Built-in verification is now default in Laravel 11. Disable manual addition or configure validation.
        // Actually, in Laravel 11, VerifyCsrfToken is implicit in web group.
        // Can exclude URI or disable based on environment.
        
        $middleware->validateCsrfTokens(except: [
            'stripe/*',
            'webhook/*',
        ]);

        if (env('APP_ENV') === 'dusk.local') {
            $middleware->validateCsrfTokens(except: ['*']);
        }

        $middleware->web(append: [
            \App\Http\Middleware\XssProtection::class,
            \App\Http\Middleware\SecurityHeaders::class,
            \App\Http\Middleware\CompressionMiddleware::class,
            \App\Http\Middleware\HandleRedirects::class,
            \App\Http\Middleware\CanonicalRedirect::class,
            \App\Http\Middleware\InjectSeoData::class,
            \App\Http\Middleware\InjectBreadcrumbs::class,
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\TrackVisits::class,
        ]);

        $middleware->alias([
            'role' => RoleMiddleware::class,
            'admin' => AdminMiddleware::class,
            'lockout' => \App\Http\Middleware\CheckAccountLockout::class,
            'rate_limit' => \App\Http\Middleware\RateLimitMiddleware::class,
            'cache.headers' => \App\Http\Middleware\CacheHeadersMiddleware::class,
            'compression' => \App\Http\Middleware\CompressionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        \Sentry\Laravel\Integration::handles($exceptions);
    })->create();
