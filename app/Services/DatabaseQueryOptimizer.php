<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class DatabaseQueryOptimizer
{
    private array $queryLog = [];
    private bool $monitoring = false;

    /**
     * Start query monitoring
     */
    public function startMonitoring(): void
    {
        $this->monitoring = true;
        $this->queryLog = [];

        DB::listen(function ($query) {
            if ($this->monitoring) {
                $this->queryLog[] = [
                    'sql' => $query->sql,
                    'bindings' => $query->bindings,
                    'time' => $query->time,
                    'connection' => $query->connectionName,
                ];

                // Log slow queries
                if ($query->time > 100) { // 100ms threshold
                    Log::warning('Slow query detected', [
                        'sql' => $query->sql,
                        'time' => $query->time,
                        'bindings' => $query->bindings,
                    ]);
                }
            }
        });
    }

    /**
     * Stop query monitoring
     */
    public function stopMonitoring(): array
    {
        $this->monitoring = false;
        return $this->queryLog;
    }

    /**
     * Get optimized homepage content queries
     */
    public function getOptimizedHomepageQueries(): array
    {
        $this->startMonitoring();

        try {
            // Optimized portfolio query with proper indexing
            $portfolioQuery = DB::table('portfolio_items')
                ->select(['id', 'title', 'slug', 'description', 'featured_image', 'client', 'technologies', 'is_featured'])
                ->where('is_published', true)
                ->where('is_featured', true)
                ->orderBy('sort_order')
                ->orderBy('created_at', 'desc')
                ->limit(6);

            // Optimized services query
            $servicesQuery = DB::table('services')
                ->select(['id', 'title', 'slug', 'description', 'icon', 'featured_image', 'price_range', 'is_featured'])
                ->where('is_published', true)
                ->where('is_featured', true)
                ->orderBy('sort_order')
                ->orderBy('created_at', 'desc')
                ->limit(6);

            // Optimized insights query with joins
            $insightsQuery = DB::table('insights')
                ->select([
                    'insights.id',
                    'insights.title',
                    'insights.slug',
                    'insights.excerpt',
                    'insights.featured_image',
                    'insights.published_at',
                    'insights.reading_time',
                    'users.id as author_id',
                    'users.name as author_name',
                    'categories.id as category_id',
                    'categories.name as category_name',
                    'categories.slug as category_slug'
                ])
                ->leftJoin('users', 'insights.author_id', '=', 'users.id')
                ->leftJoin('categories', 'insights.category_id', '=', 'categories.id')
                ->where('insights.is_published', true)
                ->orderBy('insights.published_at', 'desc')
                ->limit(6);

            $results = [
                'portfolio' => $portfolioQuery->get(),
                'services' => $servicesQuery->get(),
                'insights' => $insightsQuery->get(),
            ];

            return $results;
        } finally {
            $this->stopMonitoring();
        }
    }

    /**
     * Optimize Eloquent query with eager loading
     */
    public function optimizeEagerLoading(Builder $query, array $relations): Builder
    {
        // Only load necessary columns for relationships
        $optimizedRelations = [];
        
        foreach ($relations as $relation => $columns) {
            if (is_numeric($relation)) {
                // Simple relation name
                $optimizedRelations[] = $columns;
            } else {
                // Relation with specific columns
                $optimizedRelations[$relation] = function ($q) use ($columns) {
                    $q->select($columns);
                };
            }
        }

        return $query->with($optimizedRelations);
    }

    /**
     * Get query performance analysis
     */
    public function analyzeQueryPerformance(): array
    {
        $totalQueries = count($this->queryLog);
        $totalTime = array_sum(array_column($this->queryLog, 'time'));
        $slowQueries = array_filter($this->queryLog, fn($query) => $query['time'] > 100);
        $duplicateQueries = $this->findDuplicateQueries();

        return [
            'total_queries' => $totalQueries,
            'total_time' => $totalTime,
            'average_time' => $totalQueries > 0 ? $totalTime / $totalQueries : 0,
            'slow_queries' => count($slowQueries),
            'duplicate_queries' => count($duplicateQueries),
            'recommendations' => $this->generateOptimizationRecommendations(),
        ];
    }

    /**
     * Find duplicate queries
     */
    private function findDuplicateQueries(): array
    {
        $queryHashes = [];
        $duplicates = [];

        foreach ($this->queryLog as $query) {
            $hash = md5($query['sql'] . serialize($query['bindings']));
            
            if (isset($queryHashes[$hash])) {
                $duplicates[] = $query;
            } else {
                $queryHashes[$hash] = true;
            }
        }

        return $duplicates;
    }

    /**
     * Generate optimization recommendations
     */
    private function generateOptimizationRecommendations(): array
    {
        $recommendations = [];
        $slowQueries = array_filter($this->queryLog, fn($query) => $query['time'] > 100);
        $duplicateQueries = $this->findDuplicateQueries();

        if (count($slowQueries) > 0) {
            $recommendations[] = [
                'type' => 'slow_queries',
                'message' => 'Found ' . count($slowQueries) . ' slow queries. Consider adding indexes or optimizing query structure.',
                'priority' => 'high',
                'queries' => array_slice($slowQueries, 0, 5), // Show first 5
            ];
        }

        if (count($duplicateQueries) > 0) {
            $recommendations[] = [
                'type' => 'duplicate_queries',
                'message' => 'Found ' . count($duplicateQueries) . ' duplicate queries. Consider implementing caching or query optimization.',
                'priority' => 'medium',
            ];
        }

        if (count($this->queryLog) > 20) {
            $recommendations[] = [
                'type' => 'query_count',
                'message' => 'High number of queries (' . count($this->queryLog) . '). Consider eager loading or query consolidation.',
                'priority' => 'medium',
            ];
        }

        return $recommendations;
    }

    /**
     * Optimize model scopes for better performance
     */
    public function optimizeModelScopes(): void
    {
        // This method provides guidance for optimizing model scopes
        Log::info('Database optimization recommendations', [
            'portfolio_optimization' => 'Use composite index on (is_published, is_featured, sort_order)',
            'services_optimization' => 'Use composite index on (is_published, is_featured, sort_order)',
            'insights_optimization' => 'Use composite index on (is_published, published_at) and (category_id, is_published)',
            'eager_loading' => 'Always use select() to limit columns and with() for relationships',
            'caching' => 'Implement Redis caching for frequently accessed data',
        ]);
    }

    /**
     * Create optimized repository methods
     */
    public function createOptimizedQueries(): array
    {
        return [
            'featured_portfolio' => function () {
                return DB::table('portfolio_items')
                    ->select(['id', 'title', 'slug', 'description', 'featured_image', 'client', 'technologies'])
                    ->where('is_published', true)
                    ->where('is_featured', true)
                    ->orderBy('sort_order')
                    ->limit(6)
                    ->get();
            },
            
            'featured_services' => function () {
                return DB::table('services')
                    ->select(['id', 'title', 'slug', 'description', 'icon', 'featured_image', 'price_range'])
                    ->where('is_published', true)
                    ->where('is_featured', true)
                    ->orderBy('sort_order')
                    ->limit(6)
                    ->get();
            },
            
            'recent_insights_with_relations' => function () {
                return DB::table('insights')
                    ->select([
                        'insights.id',
                        'insights.title',
                        'insights.slug',
                        'insights.excerpt',
                        'insights.featured_image',
                        'insights.published_at',
                        'insights.reading_time',
                        'users.name as author_name',
                        'categories.name as category_name',
                        'categories.slug as category_slug'
                    ])
                    ->leftJoin('users', 'insights.author_id', '=', 'users.id')
                    ->leftJoin('categories', 'insights.category_id', '=', 'categories.id')
                    ->where('insights.is_published', true)
                    ->orderBy('insights.published_at', 'desc')
                    ->limit(6)
                    ->get();
            },
        ];
    }

    /**
     * Check database indexes
     */
    public function checkIndexes(): array
    {
        try {
            $indexes = [];
            
            // Get indexes for each table
            $tables = ['portfolio_items', 'services', 'insights', 'users', 'categories'];
            
            foreach ($tables as $table) {
                $tableIndexes = DB::select("PRAGMA index_list($table)");
                $indexes[$table] = array_map(function ($index) use ($table) {
                    $indexInfo = DB::select("PRAGMA index_info({$index->name})");
                    return [
                        'name' => $index->name,
                        'unique' => $index->unique,
                        'columns' => array_column($indexInfo, 'name'),
                    ];
                }, $tableIndexes);
            }
            
            return $indexes;
        } catch (\Exception $e) {
            Log::error('Failed to check database indexes', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Get database statistics
     */
    public function getDatabaseStats(): array
    {
        try {
            $stats = [];
            
            // Table sizes and row counts
            $tables = ['portfolio_items', 'services', 'insights', 'users', 'categories'];
            
            foreach ($tables as $table) {
                $count = DB::table($table)->count();
                $stats['tables'][$table] = [
                    'row_count' => $count,
                ];
            }
            
            // Query performance metrics
            $stats['performance'] = [
                'total_queries_logged' => count($this->queryLog),
                'average_query_time' => count($this->queryLog) > 0 
                    ? array_sum(array_column($this->queryLog, 'time')) / count($this->queryLog) 
                    : 0,
                'slow_queries' => count(array_filter($this->queryLog, fn($q) => $q['time'] > 100)),
            ];
            
            return $stats;
        } catch (\Exception $e) {
            Log::error('Failed to get database stats', ['error' => $e->getMessage()]);
            return ['error' => $e->getMessage()];
        }
    }
}