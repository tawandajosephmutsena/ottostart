<?php

namespace App\Providers;

use App\Services\DatabaseSecurityService;
use Illuminate\Support\ServiceProvider;

class DatabaseSecurityServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(DatabaseSecurityService::class, function ($app) {
            return new DatabaseSecurityService();
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        if ($this->app->environment('production', 'staging')) {
            $databaseSecurity = $this->app->make(DatabaseSecurityService::class);
            $databaseSecurity->initialize();
        }
    }
}