<?php

namespace App\Traits;

use App\Services\SeoOptimizationService;
use App\Services\SeoService;

trait HasSeoOptimization
{
    /**
     * Get optimized SEO data for this model
     */
    public function getSeoData(): array
    {
        $seoService = app(SeoService::class);
        
        $data = [
            'title' => $this->getSeoTitle(),
            'description' => $this->getSeoDescription(),
            'keywords' => $this->getSeoKeywords(),
            'image' => $this->getSeoImage(),
            'url' => $this->getSeoUrl(),
            'type' => $this->getSeoType(),
            'published_time' => $this->getSeoPublishedTime(),
            'modified_time' => $this->getSeoModifiedTime(),
            'author' => $this->getSeoAuthor(),
        ];

        return $seoService->generateSeoData($data);
    }

    /**
     * Get SEO analysis for this model
     */
    public function getSeoAnalysis(): array
    {
        $optimizationService = app(SeoOptimizationService::class);
        
        return $optimizationService->analyzePage([
            'title' => $this->getSeoTitle(),
            'description' => $this->getSeoDescription(),
            'content' => $this->getSeoContent(),
            'keywords' => $this->getSeoKeywords(),
        ]);
    }

    /**
     * Get the SEO title for this model
     */
    protected function getSeoTitle(): string
    {
        // Check for custom meta_title field first
        if (isset($this->attributes['meta_title']) && !empty($this->attributes['meta_title'])) {
            return $this->attributes['meta_title'];
        }

        // Fall back to regular title
        return $this->attributes['title'] ?? '';
    }

    /**
     * Get the SEO description for this model
     */
    protected function getSeoDescription(): string
    {
        // Check for custom meta_description field first
        if (isset($this->attributes['meta_description']) && !empty($this->attributes['meta_description'])) {
            return $this->attributes['meta_description'];
        }

        // Fall back to excerpt or description
        if (isset($this->attributes['excerpt']) && !empty($this->attributes['excerpt'])) {
            return $this->attributes['excerpt'];
        }

        if (isset($this->attributes['description']) && !empty($this->attributes['description'])) {
            return $this->attributes['description'];
        }

        // Generate from content if available
        $content = $this->getSeoContent();
        if (!empty($content)) {
            return \Illuminate\Support\Str::limit(strip_tags($content), 160);
        }

        return '';
    }

    /**
     * Get SEO keywords for this model
     */
    protected function getSeoKeywords(): array
    {
        // Check for tags or keywords field
        if (isset($this->attributes['tags']) && is_array($this->attributes['tags'])) {
            return $this->attributes['tags'];
        }

        if (isset($this->attributes['keywords']) && is_array($this->attributes['keywords'])) {
            return $this->attributes['keywords'];
        }

        // Extract from content
        $content = $this->getSeoContent();
        if (!empty($content)) {
            $optimizationService = app(SeoOptimizationService::class);
            return $optimizationService->extractKeywords($content, 5);
        }

        return [];
    }

    /**
     * Get SEO image for this model
     */
    protected function getSeoImage(): ?string
    {
        if (isset($this->attributes['featured_image']) && !empty($this->attributes['featured_image'])) {
            return asset($this->attributes['featured_image']);
        }

        if (isset($this->attributes['image']) && !empty($this->attributes['image'])) {
            return asset($this->attributes['image']);
        }

        return null;
    }

    /**
     * Get SEO URL for this model
     */
    protected function getSeoUrl(): string
    {
        // Try to generate route URL
        $routeName = $this->getSeoRouteName();
        if ($routeName && isset($this->attributes['slug'])) {
            try {
                return route($routeName, $this->attributes['slug']);
            } catch (\Exception $e) {
                // Fall back to app URL if route generation fails
            }
        }

        return config('app.url');
    }

    /**
     * Get SEO type for this model
     */
    protected function getSeoType(): string
    {
        $modelClass = get_class($this);
        
        $typeMap = [
            'App\Models\Insight' => 'article',
            'App\Models\PortfolioItem' => 'portfolio',
            'App\Models\Service' => 'service',
            'App\Models\Page' => 'webpage',
            'App\Models\TeamMember' => 'person',
        ];

        return $typeMap[$modelClass] ?? 'webpage';
    }

    /**
     * Get SEO published time
     */
    protected function getSeoPublishedTime(): ?string
    {
        if (isset($this->attributes['published_at']) && $this->attributes['published_at']) {
            return $this->asDateTime($this->attributes['published_at'])->toISOString();
        }

        if (isset($this->attributes['created_at']) && $this->attributes['created_at']) {
            return $this->asDateTime($this->attributes['created_at'])->toISOString();
        }

        return null;
    }

    /**
     * Get SEO modified time
     */
    protected function getSeoModifiedTime(): ?string
    {
        if (isset($this->attributes['updated_at']) && $this->attributes['updated_at']) {
            return $this->asDateTime($this->attributes['updated_at'])->toISOString();
        }

        return null;
    }

    /**
     * Get SEO author
     */
    protected function getSeoAuthor(): ?string
    {
        // Check for author relationship
        if (method_exists($this, 'author') && $this->relationLoaded('author')) {
            return $this->author->name ?? null;
        }

        // Check for author_id and load if needed
        if (isset($this->attributes['author_id'])) {
            $author = \App\Models\User::find($this->attributes['author_id']);
            return $author->name ?? null;
        }

        return null;
    }

    /**
     * Get content for SEO analysis
     */
    protected function getSeoContent(): string
    {
        if (isset($this->attributes['content'])) {
            // Handle JSON content
            if (is_array($this->attributes['content'])) {
                return collect($this->attributes['content'])->flatten()->implode(' ');
            }
            
            return $this->attributes['content'];
        }

        return '';
    }

    /**
     * Get route name for this model
     */
    protected function getSeoRouteName(): ?string
    {
        $modelClass = get_class($this);
        
        $routeMap = [
            'App\Models\Insight' => 'blog.show',
            'App\Models\PortfolioItem' => 'portfolio.show',
            'App\Models\Service' => 'services.show',
            'App\Models\Page' => 'pages.show',
        ];

        return $routeMap[$modelClass] ?? null;
    }

    /**
     * Generate optimized title suggestions
     */
    public function getTitleSuggestions(): array
    {
        $optimizationService = app(SeoOptimizationService::class);
        
        return $optimizationService->generateTitleSuggestions(
            $this->getSeoTitle(),
            $this->getSeoKeywords()
        );
    }

    /**
     * Generate optimized description suggestions
     */
    public function getDescriptionSuggestions(): array
    {
        $optimizationService = app(SeoOptimizationService::class);
        
        return $optimizationService->generateDescriptionSuggestions(
            $this->getSeoTitle(),
            $this->getSeoContent(),
            $this->getSeoKeywords()
        );
    }
}