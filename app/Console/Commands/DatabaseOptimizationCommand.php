<?php

namespace App\Console\Commands;

use App\Services\DatabaseQueryOptimizer;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class DatabaseOptimizationCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:optimize 
                            {action : The action to perform (analyze|indexes|stats|queries)}
                            {--monitor : Enable query monitoring during analysis}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Analyze and optimize database performance';

    private DatabaseQueryOptimizer $optimizer;

    public function __construct(DatabaseQueryOptimizer $optimizer)
    {
        parent::__construct();
        $this->optimizer = $optimizer;
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $action = $this->argument('action');

        return match ($action) {
            'analyze' => $this->analyzeQueries(),
            'indexes' => $this->showIndexes(),
            'stats' => $this->showStats(),
            'queries' => $this->testOptimizedQueries(),
            default => $this->showHelp(),
        };
    }

    /**
     * Analyze query performance
     */
    private function analyzeQueries(): int
    {
        $this->info('Analyzing database query performance...');

        if ($this->option('monitor')) {
            $this->optimizer->startMonitoring();
            
            $this->info('Running sample queries with monitoring...');
            
            // Run some sample queries to analyze
            $this->optimizer->getOptimizedHomepageQueries();
            
            $analysis = $this->optimizer->analyzeQueryPerformance();
            
            $this->table(
                ['Metric', 'Value'],
                [
                    ['Total Queries', $analysis['total_queries']],
                    ['Total Time (ms)', number_format($analysis['total_time'], 2)],
                    ['Average Time (ms)', number_format($analysis['average_time'], 2)],
                    ['Slow Queries', $analysis['slow_queries']],
                    ['Duplicate Queries', $analysis['duplicate_queries']],
                ]
            );

            if (!empty($analysis['recommendations'])) {
                $this->info('Recommendations:');
                foreach ($analysis['recommendations'] as $rec) {
                    $this->line("• [{$rec['priority']}] {$rec['message']}");
                }
            }
        } else {
            $this->info('Use --monitor flag to enable query monitoring during analysis');
        }

        return 0;
    }

    /**
     * Show database indexes
     */
    private function showIndexes(): int
    {
        $this->info('Checking database indexes...');

        $indexes = $this->optimizer->checkIndexes();

        foreach ($indexes as $table => $tableIndexes) {
            $this->info("Table: {$table}");
            
            if (empty($tableIndexes)) {
                $this->line('  No indexes found');
                continue;
            }

            foreach ($tableIndexes as $index) {
                $columns = implode(', ', $index['columns']);
                $unique = $index['unique'] ? ' (UNIQUE)' : '';
                $this->line("  • {$index['name']}: [{$columns}]{$unique}");
            }
            $this->line('');
        }

        return 0;
    }

    /**
     * Show database statistics
     */
    private function showStats(): int
    {
        $this->info('Gathering database statistics...');

        $stats = $this->optimizer->getDatabaseStats();

        if (isset($stats['error'])) {
            $this->error('Error: ' . $stats['error']);
            return 1;
        }

        // Table statistics
        if (isset($stats['tables'])) {
            $this->info('Table Statistics:');
            $tableData = [];
            foreach ($stats['tables'] as $table => $data) {
                $tableData[] = [$table, number_format($data['row_count'])];
            }
            $this->table(['Table', 'Row Count'], $tableData);
        }

        // Performance statistics
        if (isset($stats['performance'])) {
            $this->info('Performance Statistics:');
            $perf = $stats['performance'];
            $this->table(
                ['Metric', 'Value'],
                [
                    ['Queries Logged', $perf['total_queries_logged']],
                    ['Avg Query Time (ms)', number_format($perf['average_query_time'], 2)],
                    ['Slow Queries', $perf['slow_queries']],
                ]
            );
        }

        return 0;
    }

    /**
     * Test optimized queries
     */
    private function testOptimizedQueries(): int
    {
        $this->info('Testing optimized queries...');

        $this->optimizer->startMonitoring();

        try {
            $startTime = microtime(true);
            $results = $this->optimizer->getOptimizedHomepageQueries();
            $endTime = microtime(true);

            $this->info('Query Results:');
            $this->table(
                ['Content Type', 'Count', 'Time (ms)'],
                [
                    ['Portfolio Items', count($results['portfolio']), ''],
                    ['Services', count($results['services']), ''],
                    ['Insights', count($results['insights']), ''],
                    ['Total Execution Time', '', number_format(($endTime - $startTime) * 1000, 2)],
                ]
            );

            $queryLog = $this->optimizer->stopMonitoring();
            
            $this->info('Query Analysis:');
            $totalTime = array_sum(array_column($queryLog, 'time'));
            $this->table(
                ['Metric', 'Value'],
                [
                    ['Total Queries', count($queryLog)],
                    ['Total DB Time (ms)', number_format($totalTime, 2)],
                    ['Average Query Time (ms)', count($queryLog) > 0 ? number_format($totalTime / count($queryLog), 2) : 0],
                ]
            );

            // Show individual queries if verbose
            if ($this->getOutput()->isVerbose()) {
                $this->info('Individual Queries:');
                foreach ($queryLog as $i => $query) {
                    $this->line(($i + 1) . ". {$query['sql']} ({$query['time']}ms)");
                }
            }

        } catch (\Exception $e) {
            $this->error('Query test failed: ' . $e->getMessage());
            return 1;
        }

        return 0;
    }

    /**
     * Show command help
     */
    private function showHelp(): int
    {
        $this->error('Invalid action. Available actions:');
        $this->line('  analyze   - Analyze query performance with recommendations');
        $this->line('  indexes   - Show database indexes for all tables');
        $this->line('  stats     - Show database statistics and table info');
        $this->line('  queries   - Test optimized queries and show performance');
        $this->line('');
        $this->line('Options:');
        $this->line('  --monitor - Enable query monitoring during analysis');
        $this->line('');
        $this->line('Examples:');
        $this->line('  php artisan db:optimize analyze --monitor');
        $this->line('  php artisan db:optimize indexes');
        $this->line('  php artisan db:optimize stats');
        $this->line('  php artisan db:optimize queries -v');

        return 1;
    }
}
