<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;
use App\Traits\HasSeoOptimization;
use App\Traits\HasSemanticAnalysis;
use App\Traits\HasImageSeo;
use App\Traits\HasWebCoreVitals;

class PortfolioItem extends Model
{
    use HasFactory, HasSeoOptimization, HasSemanticAnalysis, HasImageSeo, HasWebCoreVitals;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'content',
        'featured_image',
        'featured_image_alt',
        'featured_image_title',
        'gallery',
        'client',
        'project_date',
        'project_url',
        'technologies',
        'is_featured',
        'is_published',
        'sort_order',
    ];

    protected $casts = [
        'content' => 'array',
        'gallery' => 'array',
        'technologies' => 'array',
        'is_featured' => 'boolean',
        'is_published' => 'boolean',
        'project_date' => 'date',
        'sort_order' => 'integer',
    ];

    protected $attributes = [
        'is_featured' => false,
        'is_published' => false,
        'sort_order' => 0,
    ];

    /**
     * Optimized scope for published items
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true);
    }

    /**
     * Optimized scope for featured items
     */
    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    /**
     * Optimized scope for ordering (uses composite index)
     */
    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order')->orderBy('created_at', 'desc');
    }

    /**
     * Optimized scope for homepage featured items
     */
    public function scopeHomepageFeatured(Builder $query): Builder
    {
        return $query->published()
            ->featured()
            ->ordered()
            ->select(['id', 'title', 'slug', 'description', 'featured_image', 'client', 'technologies', 'is_featured'])
            ->limit(6);
    }

    /**
     * Scope for efficient listing with minimal data
     */
    public function scopeForListing(Builder $query): Builder
    {
        return $query->select(['id', 'title', 'slug', 'description', 'featured_image', 'client', 'is_featured', 'is_published', 'created_at']);
    }

    /**
     * Scope for search optimization
     */
    public function scopeSearch(Builder $query, string $term): Builder
    {
        return $query->where(function ($q) use ($term) {
            $q->where('title', 'LIKE', "%{$term}%")
              ->orWhere('description', 'LIKE', "%{$term}%")
              ->orWhere('client', 'LIKE', "%{$term}%");
        });
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
