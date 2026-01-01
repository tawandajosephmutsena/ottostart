<?php

namespace App\Providers;

use App\Services\CacheManager;
use App\Services\CachePerformanceMonitor;
use App\Observers\CacheInvalidationObserver;
use App\Models\PortfolioItem;
use App\Models\Service;
use App\Models\Insight;
use App\Models\Setting;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class CacheServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Register cache manager as singleton
        $this->app->singleton(CacheManager::class, function ($app) {
            return new CacheManager();
        });

        // Register cache performance monitor as singleton
        $this->app->singleton(CachePerformanceMonitor::class, function ($app) {
            return new CachePerformanceMonitor();
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Register model observers for cache invalidation
        $this->registerCacheObservers();

        // Set up cache event listeners
        $this->setupCacheEventListeners();

        // Warm up cache in production
        if ($this->app->environment('production')) {
            $this->warmUpCache();
        }
    }

    /**
     * Register cache invalidation observers
     */
    private function registerCacheObservers(): void
    {
        try {
            PortfolioItem::observe(CacheInvalidationObserver::class);
            Service::observe(CacheInvalidationObserver::class);
            Insight::observe(CacheInvalidationObserver::class);
            Setting::observe(CacheInvalidationObserver::class);

            Log::info('Cache invalidation observers registered successfully');
        } catch (\Exception $e) {
            Log::error('Failed to register cache observers', [
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Set up cache event listeners
     */
    private function setupCacheEventListeners(): void
    {
        // Only set up listeners if Redis is available (supports events)
        try {
            if (config('cache.default') === 'redis') {
                // Listen for cache write events
                Cache::listen(function ($event) {
                    if (method_exists($event, 'key')) {
                        Log::debug('Cache operation', [
                            'event' => class_basename($event),
                            'key' => $event->key ?? 'unknown',
                        ]);
                    }
                });
            }
        } catch (\Exception $e) {
            Log::debug('Cache event listeners not available for current driver', [
                'driver' => config('cache.default'),
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Warm up critical cache entries
     */
    private function warmUpCache(): void
    {
        try {
            $cacheManager = $this->app->make(CacheManager::class);
            
            // Defer cache warm-up to avoid blocking application boot
            $this->app->terminating(function () use ($cacheManager) {
                $cacheManager->warmUp();
            });
        } catch (\Exception $e) {
            Log::error('Cache warm-up setup failed', [
                'error' => $e->getMessage(),
            ]);
        }
    }
}