<?php

namespace App\Console\Commands;

use App\Services\CacheManager;
use App\Services\AssetVersioningService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Artisan;

class PerformanceOptimizationCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'performance:optimize 
                            {action : The action to perform (all|cache|assets|build|analyze)}
                            {--force : Force optimization even in production}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Optimize application performance';

    private CacheManager $cacheManager;
    private AssetVersioningService $assetService;

    public function __construct(CacheManager $cacheManager, AssetVersioningService $assetService)
    {
        parent::__construct();
        $this->cacheManager = $cacheManager;
        $this->assetService = $assetService;
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $action = $this->argument('action');

        return match ($action) {
            'all' => $this->optimizeAll(),
            'cache' => $this->optimizeCache(),
            'assets' => $this->optimizeAssets(),
            'build' => $this->optimizeBuild(),
            'analyze' => $this->analyzePerformance(),
            default => $this->showHelp(),
        };
    }

    /**
     * Optimize everything
     */
    private function optimizeAll(): int
    {
        $this->info('Starting comprehensive performance optimization...');

        $steps = [
            'Optimizing cache' => fn() => $this->optimizeCache(),
            'Optimizing assets' => fn() => $this->optimizeAssets(),
            'Optimizing build' => fn() => $this->optimizeBuild(),
        ];

        foreach ($steps as $description => $step) {
            $this->info($description . '...');
            $result = $step();
            
            if ($result !== 0) {
                $this->error("Failed: {$description}");
                return $result;
            }
        }

        $this->info('✅ All optimizations completed successfully!');
        return 0;
    }

    /**
     * Optimize cache
     */
    private function optimizeCache(): int
    {
        try {
            $this->info('Clearing and warming up cache...');

            // Clear all caches
            Artisan::call('cache:clear');
            Artisan::call('config:clear');
            Artisan::call('route:clear');
            Artisan::call('view:clear');

            // Cache configurations
            if (app()->environment('production') || $this->option('force')) {
                Artisan::call('config:cache');
                Artisan::call('route:cache');
                Artisan::call('view:cache');
            }

            // Warm up application cache
            $this->cacheManager->warmUp();

            $this->info('✅ Cache optimization completed');
            return 0;

        } catch (\Exception $e) {
            $this->error('Cache optimization failed: ' . $e->getMessage());
            return 1;
        }
    }

    /**
     * Optimize assets
     */
    private function optimizeAssets(): int
    {
        try {
            $this->info('Optimizing assets...');

            // Clear asset cache
            $this->assetService->clearCache();

            // Check if build directory exists
            if (!is_dir(public_path('build'))) {
                $this->warn('Build directory not found. Run "npm run build" first.');
                return 1;
            }

            // Analyze assets
            $assets = $this->assetService->getAllAssets();
            $totalSize = 0;
            $assetCount = 0;

            foreach ($assets as $asset) {
                if ($asset['size']) {
                    $totalSize += $asset['size'];
                    $assetCount++;
                }
            }

            $this->table(
                ['Metric', 'Value'],
                [
                    ['Total Assets', $assetCount],
                    ['Total Size', $this->formatBytes($totalSize)],
                    ['Average Size', $assetCount > 0 ? $this->formatBytes($totalSize / $assetCount) : '0 B'],
                ]
            );

            // Check for large assets
            $largeAssets = array_filter($assets, fn($asset) => ($asset['size'] ?? 0) > 500 * 1024);
            
            if (!empty($largeAssets)) {
                $this->warn('Large assets detected (>500KB):');
                foreach ($largeAssets as $key => $asset) {
                    $this->line("  • {$key}: " . $this->formatBytes($asset['size']));
                }
            }

            $this->info('✅ Asset optimization completed');
            return 0;

        } catch (\Exception $e) {
            $this->error('Asset optimization failed: ' . $e->getMessage());
            return 1;
        }
    }

    /**
     * Optimize build
     */
    private function optimizeBuild(): int
    {
        try {
            $this->info('Running production build optimization...');

            // Check if Node.js is available
            $nodeVersion = shell_exec('node --version 2>/dev/null');
            if (!$nodeVersion) {
                $this->error('Node.js not found. Please install Node.js to run build optimization.');
                return 1;
            }

            $this->info('Node.js version: ' . trim($nodeVersion));

            // Check if npm is available
            $npmVersion = shell_exec('npm --version 2>/dev/null');
            if (!$npmVersion) {
                $this->error('npm not found. Please install npm.');
                return 1;
            }

            // Install dependencies if needed
            if (!is_dir(base_path('node_modules'))) {
                $this->info('Installing npm dependencies...');
                $result = shell_exec('cd ' . base_path() . ' && npm install 2>&1');
                $this->line($result);
            }

            // Run production build
            $this->info('Running production build...');
            $buildCommand = 'cd ' . base_path() . ' && npm run build 2>&1';
            $buildResult = shell_exec($buildCommand);
            
            if ($buildResult) {
                $this->line($buildResult);
            }

            // Verify build was successful
            if (!is_dir(public_path('build'))) {
                $this->error('Build failed - build directory not created');
                return 1;
            }

            $this->info('✅ Build optimization completed');
            return 0;

        } catch (\Exception $e) {
            $this->error('Build optimization failed: ' . $e->getMessage());
            return 1;
        }
    }

    /**
     * Analyze performance
     */
    private function analyzePerformance(): int
    {
        $this->info('Analyzing application performance...');

        // Cache statistics
        $cacheStats = $this->cacheManager->getStatistics();
        
        $this->info('Cache Statistics:');
        $this->table(
            ['Metric', 'Value'],
            [
                ['Driver', $cacheStats['driver']],
                ['Memory Used', $cacheStats['memory_used'] ?? 'N/A'],
                ['Memory Peak', $cacheStats['memory_peak'] ?? 'N/A'],
                ['Connected Clients', $cacheStats['connected_clients'] ?? 'N/A'],
            ]
        );

        // Asset statistics
        if (is_dir(public_path('build'))) {
            $assets = $this->assetService->getAllAssets();
            $cssAssets = array_filter($assets, fn($asset) => str_ends_with($asset['file'], '.css'));
            $jsAssets = array_filter($assets, fn($asset) => str_ends_with($asset['file'], '.js'));

            $this->info('Asset Statistics:');
            $this->table(
                ['Type', 'Count', 'Total Size'],
                [
                    ['CSS Files', count($cssAssets), $this->calculateTotalSize($cssAssets)],
                    ['JS Files', count($jsAssets), $this->calculateTotalSize($jsAssets)],
                    ['All Assets', count($assets), $this->calculateTotalSize($assets)],
                ]
            );
        }

        // Performance recommendations
        $recommendations = $this->getPerformanceRecommendations();
        
        if (!empty($recommendations)) {
            $this->info('Performance Recommendations:');
            foreach ($recommendations as $rec) {
                $this->line("• [{$rec['priority']}] {$rec['message']}");
            }
        }

        return 0;
    }

    /**
     * Get performance recommendations
     */
    private function getPerformanceRecommendations(): array
    {
        $recommendations = [];

        // Check if caching is enabled
        if (config('cache.default') === 'database') {
            $recommendations[] = [
                'priority' => 'high',
                'message' => 'Consider using Redis for better cache performance',
            ];
        }

        // Check if build directory exists
        if (!is_dir(public_path('build'))) {
            $recommendations[] = [
                'priority' => 'critical',
                'message' => 'Run "npm run build" to create optimized assets',
            ];
        }

        // Check for large assets
        if (is_dir(public_path('build'))) {
            $assets = $this->assetService->getAllAssets();
            $largeAssets = array_filter($assets, fn($asset) => ($asset['size'] ?? 0) > 1024 * 1024);
            
            if (!empty($largeAssets)) {
                $recommendations[] = [
                    'priority' => 'medium',
                    'message' => 'Large assets detected (>1MB). Consider code splitting.',
                ];
            }
        }

        // Check environment
        if (!app()->environment('production')) {
            $recommendations[] = [
                'priority' => 'low',
                'message' => 'Run optimizations in production environment for best results',
            ];
        }

        return $recommendations;
    }

    /**
     * Calculate total size of assets
     */
    private function calculateTotalSize(array $assets): string
    {
        $totalSize = array_sum(array_column($assets, 'size'));
        return $this->formatBytes($totalSize);
    }

    /**
     * Format bytes to human readable format
     */
    private function formatBytes(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        
        $bytes /= pow(1024, $pow);
        
        return round($bytes, 2) . ' ' . $units[$pow];
    }

    /**
     * Show command help
     */
    private function showHelp(): int
    {
        $this->error('Invalid action. Available actions:');
        $this->line('  all      - Run all optimizations');
        $this->line('  cache    - Optimize cache (clear, warm up)');
        $this->line('  assets   - Analyze and optimize assets');
        $this->line('  build    - Run production build');
        $this->line('  analyze  - Analyze current performance');
        $this->line('');
        $this->line('Options:');
        $this->line('  --force  - Force optimization even in production');
        $this->line('');
        $this->line('Examples:');
        $this->line('  php artisan performance:optimize all');
        $this->line('  php artisan performance:optimize cache');
        $this->line('  php artisan performance:optimize analyze');

        return 1;
    }
}
