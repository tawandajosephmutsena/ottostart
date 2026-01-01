<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class CachePerformanceMonitor
{
    private array $metrics = [];
    private float $startTime;

    public function __construct()
    {
        $this->startTime = microtime(true);
    }

    /**
     * Track cache hit/miss statistics
     */
    public function trackCacheOperation(string $key, bool $hit, float $executionTime = null): void
    {
        $this->metrics[] = [
            'key' => $key,
            'hit' => $hit,
            'execution_time' => $executionTime ?? (microtime(true) - $this->startTime),
            'timestamp' => now(),
        ];

        // Log slow cache operations
        if ($executionTime && $executionTime > 0.1) { // 100ms threshold
            Log::warning('Slow cache operation detected', [
                'key' => $key,
                'execution_time' => $executionTime,
                'hit' => $hit,
            ]);
        }
    }

    /**
     * Get cache performance statistics
     */
    public function getPerformanceStats(): array
    {
        try {
            $stats = [
                'cache_driver' => config('cache.default'),
                'redis_available' => $this->isRedisAvailable(),
                'total_operations' => count($this->metrics),
                'hit_rate' => $this->calculateHitRate(),
                'average_response_time' => $this->calculateAverageResponseTime(),
                'memory_usage' => $this->getMemoryUsage(),
            ];

            if ($this->isRedisAvailable()) {
                $stats = array_merge($stats, $this->getRedisStats());
            }

            return $stats;
        } catch (\Exception $e) {
            Log::error('Failed to get cache performance stats', [
                'error' => $e->getMessage(),
            ]);

            return [
                'error' => 'Failed to retrieve cache statistics',
                'cache_driver' => config('cache.default'),
            ];
        }
    }

    /**
     * Get Redis-specific statistics
     */
    private function getRedisStats(): array
    {
        try {
            $redis = Redis::connection('cache');
            $info = $redis->info();

            return [
                'redis_version' => $info['redis_version'] ?? 'Unknown',
                'connected_clients' => $info['connected_clients'] ?? 0,
                'used_memory' => $info['used_memory_human'] ?? 'N/A',
                'used_memory_peak' => $info['used_memory_peak_human'] ?? 'N/A',
                'total_commands_processed' => $info['total_commands_processed'] ?? 0,
                'keyspace_hits' => $info['keyspace_hits'] ?? 0,
                'keyspace_misses' => $info['keyspace_misses'] ?? 0,
                'redis_hit_rate' => $this->calculateRedisHitRate($info),
                'uptime_in_seconds' => $info['uptime_in_seconds'] ?? 0,
            ];
        } catch (\Exception $e) {
            Log::error('Failed to get Redis stats', ['error' => $e->getMessage()]);
            return ['redis_error' => $e->getMessage()];
        }
    }

    /**
     * Calculate Redis hit rate from info
     */
    private function calculateRedisHitRate(array $info): float
    {
        $hits = $info['keyspace_hits'] ?? 0;
        $misses = $info['keyspace_misses'] ?? 0;
        $total = $hits + $misses;

        return $total > 0 ? round(($hits / $total) * 100, 2) : 0;
    }

    /**
     * Calculate hit rate from tracked metrics
     */
    private function calculateHitRate(): float
    {
        if (empty($this->metrics)) {
            return 0;
        }

        $hits = array_filter($this->metrics, fn($metric) => $metric['hit']);
        return round((count($hits) / count($this->metrics)) * 100, 2);
    }

    /**
     * Calculate average response time
     */
    private function calculateAverageResponseTime(): float
    {
        if (empty($this->metrics)) {
            return 0;
        }

        $totalTime = array_sum(array_column($this->metrics, 'execution_time'));
        return round($totalTime / count($this->metrics), 4);
    }

    /**
     * Get memory usage information
     */
    private function getMemoryUsage(): array
    {
        return [
            'php_memory_usage' => memory_get_usage(true),
            'php_memory_peak' => memory_get_peak_usage(true),
            'php_memory_limit' => ini_get('memory_limit'),
        ];
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
     * Generate performance report
     */
    public function generateReport(): array
    {
        $stats = $this->getPerformanceStats();
        
        return [
            'timestamp' => now()->toISOString(),
            'performance_stats' => $stats,
            'recommendations' => $this->generateRecommendations($stats),
            'metrics_summary' => [
                'total_tracked_operations' => count($this->metrics),
                'slow_operations' => $this->getSlowOperations(),
                'most_accessed_keys' => $this->getMostAccessedKeys(),
            ],
        ];
    }

    /**
     * Generate performance recommendations
     */
    private function generateRecommendations(array $stats): array
    {
        $recommendations = [];

        // Check hit rate
        if (isset($stats['hit_rate']) && $stats['hit_rate'] < 80) {
            $recommendations[] = [
                'type' => 'hit_rate',
                'message' => 'Cache hit rate is below 80%. Consider increasing TTL or reviewing cache keys.',
                'priority' => 'high',
            ];
        }

        // Check Redis availability
        if (!$stats['redis_available'] && config('cache.default') === 'redis') {
            $recommendations[] = [
                'type' => 'redis_connection',
                'message' => 'Redis is configured but not available. Check Redis server status.',
                'priority' => 'critical',
            ];
        }

        // Check response time
        if (isset($stats['average_response_time']) && $stats['average_response_time'] > 0.05) {
            $recommendations[] = [
                'type' => 'response_time',
                'message' => 'Average cache response time is high. Consider optimizing cache operations.',
                'priority' => 'medium',
            ];
        }

        return $recommendations;
    }

    /**
     * Get slow operations (>100ms)
     */
    private function getSlowOperations(): array
    {
        return array_filter($this->metrics, fn($metric) => $metric['execution_time'] > 0.1);
    }

    /**
     * Get most accessed cache keys
     */
    private function getMostAccessedKeys(): array
    {
        $keyCounts = [];
        
        foreach ($this->metrics as $metric) {
            $key = $metric['key'];
            $keyCounts[$key] = ($keyCounts[$key] ?? 0) + 1;
        }

        arsort($keyCounts);
        return array_slice($keyCounts, 0, 10, true);
    }

    /**
     * Store performance metrics to database for historical analysis
     */
    public function persistMetrics(): void
    {
        try {
            if (empty($this->metrics)) {
                return;
            }

            $stats = $this->getPerformanceStats();
            
            DB::table('cache_performance_logs')->insert([
                'timestamp' => now(),
                'hit_rate' => $stats['hit_rate'] ?? 0,
                'average_response_time' => $stats['average_response_time'] ?? 0,
                'total_operations' => $stats['total_operations'] ?? 0,
                'memory_usage' => json_encode($stats['memory_usage'] ?? []),
                'redis_stats' => json_encode($stats['redis_stats'] ?? []),
                'created_at' => now(),
            ]);

            Log::info('Cache performance metrics persisted', [
                'operations_count' => count($this->metrics),
                'hit_rate' => $stats['hit_rate'] ?? 0,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to persist cache metrics', [
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Clear tracked metrics
     */
    public function clearMetrics(): void
    {
        $this->metrics = [];
        $this->startTime = microtime(true);
    }
}