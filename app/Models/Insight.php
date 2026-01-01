<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;
use App\Traits\HasVersions;
use App\Traits\HasSeoOptimization;
use App\Traits\HasSemanticAnalysis;
use App\Traits\HasImageSeo;
use App\Traits\HasWebCoreVitals;

class Insight extends Model
{
    use HasFactory, HasVersions, HasSeoOptimization, HasSemanticAnalysis, HasImageSeo, HasWebCoreVitals;

    protected $fillable = [
        'title',
        'slug',
        'excerpt',
        'content',
        'featured_image',
        'featured_image_alt',
        'featured_image_title',
        'author_id',
        'category_id',
        'tags',
        'reading_time',
        'is_featured',
        'is_published',
        'published_at',
    ];

    protected $casts = [
        'content' => 'array',
        'tags' => 'array',
        'is_featured' => 'boolean',
        'is_published' => 'boolean',
        'published_at' => 'datetime',
        'reading_time' => 'integer',
    ];

    protected $attributes = [
        'is_featured' => false,
        'is_published' => false,
    ];

    /**
     * Optimized relationship to author
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id')->select(['id', 'name']);
    }

    /**
     * Optimized relationship to category
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class)->select(['id', 'name', 'slug']);
    }

    /**
     * Optimized scope for published insights
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true);
    }

    /**
     * Optimized scope for featured insights
     */
    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    /**
     * Optimized scope for category filtering
     */
    public function scopeByCategory(Builder $query, $categoryId): Builder
    {
        return $query->where('category_id', $categoryId);
    }

    /**
     * Optimized scope for recent insights with relationships
     */
    public function scopeRecentWithRelations(Builder $query): Builder
    {
        return $query->published()
            ->with(['author:id,name', 'category:id,name,slug'])
            ->orderBy('published_at', 'desc')
            ->select(['id', 'title', 'slug', 'excerpt', 'featured_image', 'author_id', 'category_id', 'published_at', 'reading_time'])
            ->limit(6);
    }

    /**
     * Scope for efficient listing with minimal data
     */
    public function scopeForListing(Builder $query): Builder
    {
        return $query->select(['id', 'title', 'slug', 'excerpt', 'featured_image', 'author_id', 'category_id', 'published_at', 'reading_time', 'is_featured', 'is_published']);
    }

    /**
     * Scope for search optimization
     */
    public function scopeSearch(Builder $query, string $term): Builder
    {
        return $query->where(function ($q) use ($term) {
            $q->where('title', 'LIKE', "%{$term}%")
              ->orWhere('excerpt', 'LIKE', "%{$term}%");
        });
    }

    /**
     * Scope for date range filtering
     */
    public function scopePublishedBetween(Builder $query, $startDate, $endDate): Builder
    {
        return $query->published()
            ->whereBetween('published_at', [$startDate, $endDate]);
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * Fields to ignore when creating versions.
     */
    protected function getVersionIgnoredFields(): array
    {
        return [
            'updated_at',
            'views_count',
            'last_viewed_at',
        ];
    }

    /**
     * Create a draft version.
     */
    public function createDraft(array $data, string $changeNotes = null): ContentVersion
    {
        // Create a new version with the updated data
        $tempModel = $this->replicate();
        $tempModel->fill($data);
        
        return ContentVersion::create([
            'versionable_type' => get_class($this),
            'versionable_id' => $this->id,
            'version_number' => ContentVersion::getNextVersionNumber(get_class($this), $this->id),
            'content_data' => $tempModel->toArray(),
            'author_id' => auth()->id(),
            'change_summary' => 'Draft version',
            'change_notes' => $changeNotes,
            'is_current' => false,
            'is_published' => false,
        ]);
    }

    /**
     * Get the content body from the current version or model.
     */
    public function getContentBody(): string
    {
        $currentVersion = $this->currentVersion();
        if ($currentVersion && isset($currentVersion->content_data['content']['body'])) {
            return $currentVersion->content_data['content']['body'];
        }
        
        return $this->content['body'] ?? '';
    }
}
