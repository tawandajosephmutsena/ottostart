<?php

namespace App\Providers;

use App\Models\Insight;
use App\Models\Page;
use App\Models\PortfolioItem;
use App\Models\Service;
use App\Observers\SitemapObserver;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;


class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Define global RBAC Gate logic
        Gate::before(function ($user, $ability) {
            // Super-admins get all permissions bypass
            if (method_exists($user, 'hasRole') && $user->hasRole('super-admin')) {
                return true;
            }
        });

        Gate::after(function ($user, $ability, $result, $arguments) {
            if ($result === null && method_exists($user, 'hasPermission')) {
                return $user->hasPermission($ability);
            }
        });

        // Register sitemap observer for content models

        Insight::observe(SitemapObserver::class);
        Page::observe(SitemapObserver::class);
        PortfolioItem::observe(SitemapObserver::class);
        Service::observe(SitemapObserver::class);

        // Enable CSP nonce for Vite
        \Illuminate\Support\Facades\Vite::useCspNonce();

        // Performance: Prevent lazy loading in development to catch N+1 queries
        if ($this->app->environment('local')) {
            \Illuminate\Database\Eloquent\Model::preventLazyLoading();
        }

        // Performance: Log slow queries in development
        if ($this->app->environment('local') && config('app.debug')) {
            \Illuminate\Support\Facades\DB::listen(function ($query) {
                if ($query->time > 100) { // Log queries over 100ms
                    \Illuminate\Support\Facades\Log::warning('Slow Query', [
                        'sql' => $query->sql,
                        'bindings' => $query->bindings,
                        'time' => $query->time . 'ms',
                    ]);
                }
            });
        }

        // Performance: Use strict mode for models (better data integrity)
        \Illuminate\Database\Eloquent\Model::shouldBeStrict(!$this->app->isProduction());
    }

}
