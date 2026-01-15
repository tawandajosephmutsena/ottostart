<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class OptimizeProduction extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:optimize 
                            {--clear : Clear all caches before optimizing}
                            {--skip-routes : Skip route caching}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Optimize the application for production with comprehensive caching';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('🚀 Optimizing application for production...');
        $this->newLine();

        // Clear caches if requested
        if ($this->option('clear')) {
            $this->warn('Clearing existing caches...');
            $this->call('cache:clear');
            $this->call('config:clear');
            $this->call('route:clear');
            $this->call('view:clear');
            $this->newLine();
        }

        // 1. Cache configuration
        $this->info('📦 Caching configuration...');
        $this->call('config:cache');

        // 2. Cache routes (optional, can cause issues with closures)
        if (!$this->option('skip-routes')) {
            $this->info('🛤️ Caching routes...');
            $this->call('route:cache');
        }

        // 3. Cache views
        $this->info('👁️ Caching views...');
        $this->call('view:cache');

        // 4. Cache events
        $this->info('📡 Caching events...');
        $this->call('event:cache');

        // 5. Optimize autoloader
        $this->info('📚 Optimizing autoloader...');
        $this->callSilently('optimize');

        // 6. Clear application cache for fresh start
        $this->info('🧹 Preparing application cache...');
        $this->call('cache:clear');

        $this->newLine();
        $this->info('✅ Application optimized successfully!');
        $this->newLine();
        
        $this->table(
            ['Optimization', 'Status'],
            [
                ['Config Cache', '✓ Cached'],
                ['Route Cache', $this->option('skip-routes') ? '⊘ Skipped' : '✓ Cached'],
                ['View Cache', '✓ Cached'],
                ['Event Cache', '✓ Cached'],
                ['Autoloader', '✓ Optimized'],
            ]
        );

        $this->newLine();
        $this->comment('💡 Tip: Run this command after deploying to production.');
        $this->comment('💡 Tip: To clear all caches, run: php artisan app:optimize --clear');

        return Command::SUCCESS;
    }
}
