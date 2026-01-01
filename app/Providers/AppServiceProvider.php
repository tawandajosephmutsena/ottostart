<?php

namespace App\Providers;

use App\Models\Insight;
use App\Models\Page;
use App\Models\PortfolioItem;
use App\Models\Service;
use App\Observers\SitemapObserver;
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
        // Register sitemap observer for content models
        Insight::observe(SitemapObserver::class);
        Page::observe(SitemapObserver::class);
        PortfolioItem::observe(SitemapObserver::class);
        Service::observe(SitemapObserver::class);

        // Enable CSP nonce for Vite
        \Illuminate\Support\Facades\Vite::useCspNonce();
    }
}
