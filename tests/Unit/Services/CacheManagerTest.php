<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\CacheManager;
use App\Models\PortfolioItem;
use App\Models\Service;
use App\Models\Insight;
use App\Models\Setting;
use App\Models\User;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Log;
use Mockery;

class CacheManagerTest extends TestCase
{
    use RefreshDatabase;

    private CacheManager $cacheManager;

    protected function setUp(): void
    {
        parent::setUp();
        $this->cacheManager = new CacheManager();
    }

    public function test_remember_executes_callback_when_cache_miss(): void
    {
        Cache::flush();
        
        $callbackExecuted = false;
        $callback = function () use (&$callbackExecuted) {
            $callbackExecuted = true;
            return 'test_value';
        };

        $result = $this->cacheManager->remember('test_key', $callback, 300);

        expect($result)->toBe('test_value');
        expect($callbackExecuted)->toBeTrue();
    }

    public function test_remember_returns_cached_value_when_cache_hit(): void
    {
        Cache::put('test_key', 'cached_value', 300);
        
        $callbackExecuted = false;
        $callback = function () use (&$callbackExecuted) {
            $callbackExecuted = true;
            return 'new_value';
        };

        $result = $this->cacheManager->remember('test_key', $callback, 300);

        expect($result)->toBe('cached_value');
        expect($callbackExecuted)->toBeFalse();
    }

    public function test_remember_handles_cache_failure_gracefully(): void
    {
        // Mock Cache to throw exception
        Cache::shouldReceive('remember')
            ->once()
            ->andThrow(new \Exception('Cache failure'));

        Log::shouldReceive('warning')
            ->once()
            ->with('Cache operation failed', Mockery::type('array'));

        $callback = function () {
            return 'fallback_value';
        };

        $result = $this->cacheManager->remember('test_key', $callback, 300);

        expect($result)->toBe('fallback_value');
    }

    public function test_get_featured_projects_returns_correct_data(): void
    {
        // Create test data
        $this->createTestPortfolioItems();

        $result = $this->cacheManager->getFeaturedProjects();

        expect($result)->toHaveCount(2);
        expect($result->first()->title)->toBe('Featured Project 1');
        expect($result->first()->is_featured)->toBeTrue();
        expect($result->first()->is_published)->toBeTrue();
    }

    public function test_get_featured_services_returns_correct_data(): void
    {
        // Create test data
        $this->createTestServices();

        $result = $this->cacheManager->getFeaturedServices();

        expect($result)->toHaveCount(2);
        expect($result->first()->title)->toBe('Featured Service 1');
        expect($result->first()->is_featured)->toBeTrue();
        expect($result->first()->is_published)->toBeTrue();
    }

    public function test_get_recent_insights_returns_correct_data(): void
    {
        // Create test data
        $this->createTestInsights();

        $result = $this->cacheManager->getRecentInsights();

        expect($result)->toHaveCount(2);
        expect($result->first()->title)->toBe('Recent Insight 2'); // Most recent first
        expect($result->first()->is_published)->toBeTrue();
    }

    public function test_get_homepage_stats_returns_default_when_no_settings(): void
    {
        $result = $this->cacheManager->getHomepageStats();

        expect($result)->toBeArray();
        expect($result)->toHaveCount(4);
        expect($result[0]['value'])->toBe('150');
        expect($result[0]['label'])->toBe('Projects Completed');
        expect($result[0]['suffix'])->toBe('+');
    }

    public function test_get_homepage_stats_returns_custom_settings(): void
    {
        Setting::create([
            'key' => 'homepage_stats',
            'value' => [
                [
                    'value' => '200',
                    'label' => 'Custom Projects',
                    'suffix' => '+',
                ],
            ],
            'type' => 'json',
            'group_name' => 'homepage'
        ]);

        $result = $this->cacheManager->getHomepageStats();

        expect($result)->toHaveCount(1);
        expect($result[0]['value'])->toBe('200');
        expect($result[0]['label'])->toBe('Custom Projects');
    }

    public function test_cache_homepage_content_returns_complete_structure(): void
    {
        $this->createCompleteTestData();

        $result = $this->cacheManager->cacheHomepageContent();

        expect($result)->toHaveKeys([
            'featured_projects',
            'featured_services', 
            'recent_insights',
            'stats'
        ]);
        expect($result['featured_projects'])->toHaveCount(2);
        expect($result['featured_services'])->toHaveCount(2);
        expect($result['recent_insights'])->toHaveCount(2);
        expect($result['stats'])->toHaveCount(4);
    }

    public function test_invalidate_by_tags_flushes_tagged_cache(): void
    {
        Cache::shouldReceive('tags')
            ->with(['test_tag'])
            ->once()
            ->andReturnSelf();
        
        Cache::shouldReceive('flush')
            ->once();

        Log::shouldReceive('info')
            ->once()
            ->with('Cache invalidated by tags', ['tags' => ['test_tag']]);

        $this->cacheManager->invalidateByTags(['test_tag']);
    }

    public function test_invalidate_content_cache_calls_correct_tags(): void
    {
        Cache::shouldReceive('tags')
            ->with([
                CacheManager::TAGS['content'],
                CacheManager::TAGS['homepage'],
                CacheManager::TAGS['featured'],
            ])
            ->once()
            ->andReturnSelf();
        
        Cache::shouldReceive('flush')->once();
        Log::shouldReceive('info')->once();

        $this->cacheManager->invalidateContentCache();
    }

    public function test_generate_key_creates_consistent_keys(): void
    {
        $key1 = $this->cacheManager->generateKey('base', ['param1' => 'value1']);
        $key2 = $this->cacheManager->generateKey('base', ['param1' => 'value1']);
        $key3 = $this->cacheManager->generateKey('base', ['param1' => 'value2']);

        expect($key1)->toBe($key2);
        expect($key1)->not->toBe($key3);
        expect($key1)->toStartWith('base:');
    }

    public function test_cache_model_stores_and_retrieves_model(): void
    {
        $portfolioItem = PortfolioItem::create([
            'title' => 'Test Project',
            'slug' => 'test-project',
            'description' => 'Test description',
            'is_published' => true,
        ]);

        $cached = $this->cacheManager->cacheModel($portfolioItem);

        expect($cached->id)->toBe($portfolioItem->id);
        expect($cached->title)->toBe('Test Project');
    }

    public function test_get_statistics_returns_cache_info(): void
    {
        $stats = $this->cacheManager->getStatistics();

        expect($stats)->toHaveKey('driver');
        expect($stats)->toHaveKey('status');
    }

    public function test_warm_up_caches_critical_data(): void
    {
        $this->createCompleteTestData();

        Log::shouldReceive('info')
            ->with('Starting cache warm-up')
            ->once();
        
        Log::shouldReceive('info')
            ->with('Cache warm-up completed successfully')
            ->once();

        $this->cacheManager->warmUp();

        // Verify cache entries exist
        expect(Cache::has('homepage_content'))->toBeTrue();
        expect(Cache::has('featured_projects'))->toBeTrue();
        expect(Cache::has('featured_services'))->toBeTrue();
        expect(Cache::has('recent_insights'))->toBeTrue();
        expect(Cache::has('homepage_stats'))->toBeTrue();
    }

    private function createTestPortfolioItems(): void
    {
        PortfolioItem::create([
            'title' => 'Featured Project 1',
            'slug' => 'featured-project-1',
            'description' => 'First featured project',
            'is_featured' => true,
            'is_published' => true,
            'sort_order' => 1,
        ]);

        PortfolioItem::create([
            'title' => 'Featured Project 2',
            'slug' => 'featured-project-2',
            'description' => 'Second featured project',
            'is_featured' => true,
            'is_published' => true,
            'sort_order' => 2,
        ]);

        // Non-featured item (should not appear)
        PortfolioItem::create([
            'title' => 'Regular Project',
            'slug' => 'regular-project',
            'description' => 'Regular project',
            'is_featured' => false,
            'is_published' => true,
        ]);
    }

    private function createTestServices(): void
    {
        Service::create([
            'title' => 'Featured Service 1',
            'slug' => 'featured-service-1',
            'description' => 'First featured service',
            'is_featured' => true,
            'is_published' => true,
            'sort_order' => 1,
        ]);

        Service::create([
            'title' => 'Featured Service 2',
            'slug' => 'featured-service-2',
            'description' => 'Second featured service',
            'is_featured' => true,
            'is_published' => true,
            'sort_order' => 2,
        ]);
    }

    private function createTestInsights(): void
    {
        $author = User::create([
            'name' => 'Test Author',
            'email' => 'author@test.com',
            'password' => 'password',
        ]);

        $category = Category::create([
            'name' => 'Technology',
            'slug' => 'technology',
            'type' => 'insight',
        ]);

        Insight::create([
            'title' => 'Recent Insight 1',
            'slug' => 'recent-insight-1',
            'excerpt' => 'First insight',
            'content' => ['body' => 'Content 1'],
            'author_id' => $author->id,
            'category_id' => $category->id,
            'is_published' => true,
            'published_at' => now()->subDays(2),
        ]);

        Insight::create([
            'title' => 'Recent Insight 2',
            'slug' => 'recent-insight-2',
            'excerpt' => 'Second insight',
            'content' => ['body' => 'Content 2'],
            'author_id' => $author->id,
            'category_id' => $category->id,
            'is_published' => true,
            'published_at' => now()->subDays(1), // More recent
        ]);
    }

    private function createCompleteTestData(): void
    {
        $this->createTestPortfolioItems();
        $this->createTestServices();
        $this->createTestInsights();
    }
}