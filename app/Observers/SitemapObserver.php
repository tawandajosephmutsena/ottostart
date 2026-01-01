<?php

namespace App\Observers;

use App\Services\SitemapService;
use Illuminate\Database\Eloquent\Model;

class SitemapObserver
{
    private SitemapService $sitemapService;

    public function __construct(SitemapService $sitemapService)
    {
        $this->sitemapService = $sitemapService;
    }

    /**
     * Handle the model "created" event.
     */
    public function created(Model $model): void
    {
        $this->clearSitemapCache();
    }

    /**
     * Handle the model "updated" event.
     */
    public function updated(Model $model): void
    {
        // Only clear cache if publication status or slug changed
        if ($this->shouldRegenerateSitemap($model)) {
            $this->clearSitemapCache();
        }
    }

    /**
     * Handle the model "deleted" event.
     */
    public function deleted(Model $model): void
    {
        $this->clearSitemapCache();
    }

    /**
     * Determine if sitemap should be regenerated based on model changes
     */
    private function shouldRegenerateSitemap(Model $model): bool
    {
        $watchedFields = ['is_published', 'slug', 'title', 'updated_at'];
        
        foreach ($watchedFields as $field) {
            if ($model->wasChanged($field)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Clear sitemap cache to trigger regeneration
     */
    private function clearSitemapCache(): void
    {
        try {
            $this->sitemapService->clearCache();
        } catch (\Exception $e) {
            // Log error but don't fail the main operation
            \Log::warning('Failed to clear sitemap cache: ' . $e->getMessage());
        }
    }
}