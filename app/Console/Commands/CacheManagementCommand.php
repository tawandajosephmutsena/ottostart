<?php

namespace App\Console\Commands;

use App\Services\CacheManager;
use App\Services\CachePerformanceMonitor;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class CacheManagementCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cache:manage 
                            {action : The action to perform (stats|warm|clear|invalidate)}
                            {--tags=* : Cache tags to target for invalidation}
                            {--key= : Specific cache key to target}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Manage application cache with advanced operations';

    private CacheManager $cacheManager;
    private CachePerformanceMonitor $performanceMonitor;

    public function __construct(CacheManager $cacheManager, CachePerformanceMonitor $performanceMonitor)
    {
        parent::__construct();
        $this->cacheManager = $cacheManager;
        $this->performanceMonitor = $performanceMonitor;
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $action = $this->argument('action');

        return match ($action) {
            'stats' => $this->showStats(),
            'warm' => $this->warmCache(),
            'clear' => $this->clearCache(),
            'invalidate' => $this->invalidateCache(),
            default => $this->showHelp(),
        };
    }

    /**
     * Show cache statistics
     */
    private function showStats(): int
    {
        $this->info('Gathering cache statistics...');

        $stats = $this->cacheManager->getStatistics();
        $performanceStats = $this->performanceMonitor->getPerformanceStats();

        $this->table(
            ['Metric', 'Value'],
            [
                ['Cache Driver', $stats['driver']],
                ['Memory Used', $stats['memory_used'] ?? 'N/A'],
                ['Memory Peak', $stats['memory_peak'] ?? 'N/A'],
                ['Connected Clients', $stats['connected_clients'] ?? 'N/A'],
                ['Total Commands', $stats['total_commands'] ?? 'N/A'],
                ['Hit Rate', ($performanceStats['hit_rate'] ?? 0) . '%'],
                ['Avg Response Time', ($performanceStats['average_response_time'] ?? 0) . 'ms'],
            ]
        );

        if (isset($stats['error'])) {
            $this->error('Cache Error: ' . $stats['error']);
            return 1;
        }

        return 0;
    }

    /**
     * Warm up cache
     */
    private function warmCache(): int
    {
        $this->info('Warming up cache...');

        try {
            $this->cacheManager->warmUp();
            $this->info('✅ Cache warm-up completed successfully');
            return 0;
        } catch (\Exception $e) {
            $this->error('❌ Cache warm-up failed: ' . $e->getMessage());
            return 1;
        }
    }

    /**
     * Clear cache
     */
    private function clearCache(): int
    {
        $tags = $this->option('tags');
        $key = $this->option('key');

        if ($key) {
            return $this->clearSpecificKey($key);
        }

        if (!empty($tags)) {
            return $this->clearByTags($tags);
        }

        return $this->clearAllCache();
    }

    /**
     * Clear specific cache key
     */
    private function clearSpecificKey(string $key): int
    {
        $this->info("Clearing cache key: {$key}");

        try {
            Cache::forget($key);
            $this->info('✅ Cache key cleared successfully');
            return 0;
        } catch (\Exception $e) {
            $this->error('❌ Failed to clear cache key: ' . $e->getMessage());
            return 1;
        }
    }

    /**
     * Clear cache by tags
     */
    private function clearByTags(array $tags): int
    {
        $this->info('Clearing cache by tags: ' . implode(', ', $tags));

        try {
            $this->cacheManager->invalidateByTags($tags);
            $this->info('✅ Cache cleared by tags successfully');
            return 0;
        } catch (\Exception $e) {
            $this->error('❌ Failed to clear cache by tags: ' . $e->getMessage());
            return 1;
        }
    }

    /**
     * Clear all cache
     */
    private function clearAllCache(): int
    {
        if (!$this->confirm('Are you sure you want to clear ALL cache?')) {
            $this->info('Cache clear cancelled');
            return 0;
        }

        $this->info('Clearing all cache...');

        try {
            Cache::flush();
            $this->info('✅ All cache cleared successfully');
            return 0;
        } catch (\Exception $e) {
            $this->error('❌ Failed to clear cache: ' . $e->getMessage());
            return 1;
        }
    }

    /**
     * Invalidate specific cache types
     */
    private function invalidateCache(): int
    {
        $type = $this->choice(
            'Which cache type would you like to invalidate?',
            [
                'content' => 'Content Cache',
                'portfolio' => 'Portfolio Cache',
                'services' => 'Services Cache',
                'insights' => 'Insights Cache',
                'homepage' => 'Homepage Cache',
                'all' => 'All Content Cache',
            ],
            'content'
        );

        $this->info("Invalidating {$type} cache...");

        try {
            match ($type) {
                'content' => $this->cacheManager->invalidateContentCache(),
                'portfolio' => $this->cacheManager->invalidatePortfolioCache(),
                'services' => $this->cacheManager->invalidateServicesCache(),
                'insights' => $this->cacheManager->invalidateInsightsCache(),
                'homepage' => $this->cacheManager->invalidateByTags([CacheManager::TAGS['homepage']]),
                'all' => $this->cacheManager->invalidateContentCache(),
            };

            $this->info('✅ Cache invalidated successfully');
            return 0;
        } catch (\Exception $e) {
            $this->error('❌ Failed to invalidate cache: ' . $e->getMessage());
            return 1;
        }
    }

    /**
     * Show command help
     */
    private function showHelp(): int
    {
        $this->error('Invalid action. Available actions:');
        $this->line('  stats     - Show cache statistics');
        $this->line('  warm      - Warm up cache with critical data');
        $this->line('  clear     - Clear cache (use --tags or --key for specific clearing)');
        $this->line('  invalidate - Invalidate specific cache types');
        $this->line('');
        $this->line('Examples:');
        $this->line('  php artisan cache:manage stats');
        $this->line('  php artisan cache:manage warm');
        $this->line('  php artisan cache:manage clear --tags=content,homepage');
        $this->line('  php artisan cache:manage clear --key=homepage_content');
        $this->line('  php artisan cache:manage invalidate');

        return 1;
    }
}
