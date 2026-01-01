<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;

class CacheManager
{
    /**
     * Cache TTL constants (in seconds)
     */
    const SHORT_TTL = 300;      // 5 minutes
    const MEDIUM_TTL = 1800;    // 30 minutes
    const LONG_TTL = 3600;      // 1 hour
    const DAILY_TTL = 86400;    // 24 hours
    const WEEKLY_TTL = 604800;  // 7 days

    /**
     * Cache tags for organized invalidation
     */
    const TAGS = [
        'content' => 'content',
        'portfolio' => 'portfolio',
        'services' => 'services',
        'insights' => 'insights',
        'settings' => 'settings',
        'homepage' => 'homepage',
        'featured' => 'featured',
        'published' => 'published',
    ];

    /**
     * Multi-layer cache remember with tags
     */
    public function remember(string $key, callable $callback, int $ttl = self::MEDIUM_TTL, array $tags = []): mixed
    {
        try {
            // Use Redis cache with tags if available
            if ($this->isRedisAvailable() && !empty($tags)) {
                return Cache::tags($tags)->remember($key, $ttl, $callback);
            }

            // Fallback to default cache store
            return Cache::remember($key, $ttl, $callback);
        } catch (\Exception $e) {
            Log::warning('Cache operation failed', [
                'key' => $key,
                'error' => $e->getMessage(),
            ]);

            // Execute callback directly if cache fails
            return $callback();
        }
    }

    /**
     * Cache homepage content with appropriate tags
     */
    public function cacheHomepageContent(): array
    {
        return $this->remember(
            'homepage_content',
            function () {
                return [
                    'featured_projects' => $this->getFeaturedProjects(),
                    'featured_services' => $this->getFeaturedServices(),
                    'recent_insights' => $this->getRecentInsights(),
                    'stats' => $this->getHomepageStats(),
                ];
            },
            self::MEDIUM_TTL,
            [self::TAGS['homepage'], self::TAGS['content'], self::TAGS['featured']]
        );
    }

    /**
     * Cache featured portfolio items
     */
    public function getFeaturedProjects(): Collection
    {
        return $this->remember(
            'featured_projects',
            function () {
                return \App\Models\PortfolioItem::homepageFeatured()->get();
            },
            self::LONG_TTL,
            [self::TAGS['portfolio'], self::TAGS['featured'], self::TAGS['published']]
        );
    }

    /**
     * Cache featured services
     */
    public function getFeaturedServices(): Collection
    {
        return $this->remember(
            'featured_services',
            function () {
                return \App\Models\Service::homepageFeatured()->get();
            },
            self::LONG_TTL,
            [self::TAGS['services'], self::TAGS['featured'], self::TAGS['published']]
        );
    }

    /**
     * Cache recent insights
     */
    public function getRecentInsights(): Collection
    {
        return $this->remember(
            'recent_insights',
            function () {
                return \App\Models\Insight::recentWithRelations()->get();
            },
            self::MEDIUM_TTL,
            [self::TAGS['insights'], self::TAGS['published']]
        );
    }

    /**
     * Cache homepage statistics
     */
    public function getHomepageStats(): array
    {
        return $this->remember(
            'homepage_stats',
            function () {
                $statsSettings = \App\Models\Setting::where('key', 'homepage_stats')->first();
                
                if ($statsSettings && $statsSettings->value) {
                    return $statsSettings->value;
                }

                return [
                    [
                        'value' => '150',
                        'label' => 'Projects Completed',
                        'suffix' => '+',
                    ],
                    [
                        'value' => '50',
                        'label' => 'Happy Clients',
                        'suffix' => '+',
                    ],
                    [
                        'value' => '5',
                        'label' => 'Years Experience',
                        'suffix' => '+',
                    ],
                    [
                        'value' => '24/7',
                        'label' => 'Support',
                    ],
                ];
            },
            self::DAILY_TTL,
            [self::TAGS['settings'], self::TAGS['homepage']]
        );
    }

    /**
     * Invalidate cache by tags
     */
    public function invalidateByTags(array $tags): void
    {
        try {
            if ($this->isRedisAvailable()) {
                Cache::tags($tags)->flush();
                Log::info('Cache invalidated by tags', ['tags' => $tags]);
            } else {
                // Fallback: clear all cache if tags not supported
                Cache::flush();
                Log::info('Full cache cleared (tags not supported)');
            }
        } catch (\Exception $e) {
            Log::error('Cache invalidation failed', [
                'tags' => $tags,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Invalidate content-related cache
     */
    public function invalidateContentCache(): void
    {
        $this->invalidateByTags([
            self::TAGS['content'],
            self::TAGS['homepage'],
            self::TAGS['featured'],
        ]);
    }

    /**
     * Invalidate portfolio cache
     */
    public function invalidatePortfolioCache(): void
    {
        $this->invalidateByTags([
            self::TAGS['portfolio'],
            self::TAGS['content'],
            self::TAGS['homepage'],
            self::TAGS['featured'],
        ]);
    }

    /**
     * Invalidate services cache
     */
    public function invalidateServicesCache(): void
    {
        $this->invalidateByTags([
            self::TAGS['services'],
            self::TAGS['content'],
            self::TAGS['homepage'],
            self::TAGS['featured'],
        ]);
    }

    /**
     * Invalidate insights cache
     */
    public function invalidateInsightsCache(): void
    {
        $this->invalidateByTags([
            self::TAGS['insights'],
            self::TAGS['content'],
            self::TAGS['homepage'],
        ]);
    }

    /**
     * Get cache statistics
     */
    public function getStatistics(): array
    {
        try {
            if ($this->isRedisAvailable()) {
                $redis = Redis::connection('cache');
                $info = $redis->info('memory');
                
                return [
                    'driver' => 'redis',
                    'memory_used' => $info['used_memory_human'] ?? 'N/A',
                    'memory_peak' => $info['used_memory_peak_human'] ?? 'N/A',
                    'connected_clients' => $redis->info('clients')['connected_clients'] ?? 0,
                    'total_commands' => $redis->info('stats')['total_commands_processed'] ?? 0,
                ];
            }

            return [
                'driver' => config('cache.default'),
                'status' => 'active',
            ];
        } catch (\Exception $e) {
            return [
                'driver' => config('cache.default'),
                'status' => 'error',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Warm up critical cache entries
     */
    public function warmUp(): void
    {
        Log::info('Starting cache warm-up');

        try {
            // Warm up homepage content
            $this->cacheHomepageContent();
            
            // Warm up individual components
            $this->getFeaturedProjects();
            $this->getFeaturedServices();
            $this->getRecentInsights();
            $this->getHomepageStats();

            Log::info('Cache warm-up completed successfully');
        } catch (\Exception $e) {
            Log::error('Cache warm-up failed', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Check if Redis is available
     */
    private function isRedisAvailable(): bool
    {
        try {
            return config('cache.default') === 'redis' && Redis::connection('cache')->ping();
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Generate cache key with prefix
     */
    public function generateKey(string $base, array $params = []): string
    {
        $key = $base;
        
        if (!empty($params)) {
            $key .= ':' . md5(serialize($params));
        }

        return $key;
    }

    /**
     * Cache model with automatic invalidation setup
     */
    public function cacheModel(Model $model, string $key = null, int $ttl = self::MEDIUM_TTL): Model
    {
        $cacheKey = $key ?: $this->generateKey(
            get_class($model) . ':' . $model->getKey()
        );

        return $this->remember(
            $cacheKey,
            fn() => $model,
            $ttl,
            [$this->getModelTag($model)]
        );
    }

    /**
     * Get appropriate cache tag for model
     */
    private function getModelTag(Model $model): string
    {
        $class = class_basename($model);
        
        return match ($class) {
            'PortfolioItem' => self::TAGS['portfolio'],
            'Service' => self::TAGS['services'],
            'Insight' => self::TAGS['insights'],
            'Setting' => self::TAGS['settings'],
            default => self::TAGS['content'],
        };
    }
}