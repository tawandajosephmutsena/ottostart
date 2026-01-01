<?php

namespace App\Console\Commands;

use App\Services\SitemapService;
use Illuminate\Console\Command;

class GenerateSitemap extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'sitemap:generate 
                            {--submit : Submit sitemap to search engines after generation}
                            {--clear-cache : Clear sitemap cache before generation}';

    /**
     * The console command description.
     */
    protected $description = 'Generate XML sitemap for the website';

    private SitemapService $sitemapService;

    public function __construct(SitemapService $sitemapService)
    {
        parent::__construct();
        $this->sitemapService = $sitemapService;
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Generating XML sitemap...');

        // Clear cache if requested
        if ($this->option('clear-cache')) {
            $this->info('Clearing sitemap cache...');
            $this->sitemapService->clearCache();
        }

        // Generate sitemap
        $success = $this->sitemapService->generateAndSaveSitemap();

        if (!$success) {
            $this->error('Failed to generate sitemap!');
            return Command::FAILURE;
        }

        // Get statistics
        $stats = $this->sitemapService->getSitemapStats();
        
        $this->info('Sitemap generated successfully!');
        $this->table(
            ['Metric', 'Count'],
            [
                ['Total URLs', $stats['total_urls']],
                ['Static Pages', $stats['static_pages']],
                ['Portfolio Items', $stats['portfolio_items']],
                ['Services', $stats['services']],
                ['Blog Posts', $stats['insights']],
                ['CMS Pages', $stats['cms_pages']],
            ]
        );

        $this->info('Sitemap saved to: ' . public_path('sitemap.xml'));

        // Submit to search engines if requested
        if ($this->option('submit')) {
            $this->info('Submitting sitemap to search engines...');
            $results = $this->sitemapService->submitToSearchEngines();

            foreach ($results as $engine => $result) {
                if ($result['success']) {
                    $this->info("✓ Successfully submitted to {$engine}");
                } else {
                    $this->error("✗ Failed to submit to {$engine}: " . $result['error']);
                }
            }
        }

        return Command::SUCCESS;
    }
}