<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\ImageSeoService;
use App\Models\Service;
use App\Models\PortfolioItem;
use App\Models\Insight;
use App\Models\TeamMember;
use App\Models\MediaAsset;

class OptimizeImageSeo extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'optimize:image-seo 
                            {--model= : Model type to optimize (service, portfolio, insight, team, media, all)}
                            {--dry-run : Show what would be optimized without making changes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Optimize image SEO for content models by auto-generating alt text and analyzing images';

    protected ImageSeoService $imageSeoService;

    public function __construct(ImageSeoService $imageSeoService)
    {
        parent::__construct();
        $this->imageSeoService = $imageSeoService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $modelType = $this->option('model') ?? 'all';
        $dryRun = $this->option('dry-run');

        $this->info('Image SEO Optimization Tool');
        $this->info('==========================');

        if ($dryRun) {
            $this->warn('DRY RUN MODE - No changes will be made');
        }

        $models = $this->getModelsToOptimize($modelType);

        if (empty($models)) {
            $this->error('No models found to optimize.');
            return 1;
        }

        $totalOptimized = 0;
        $totalImprovement = 0;

        foreach ($models as $modelName => $modelClass) {
            $this->info("\nOptimizing {$modelName}...");
            
            $items = $modelClass::all();
            $optimizedCount = 0;
            $modelImprovement = 0;

            foreach ($items as $item) {
                $beforeScore = $item->getImageSeoScore();
                $needsOptimization = $item->getImagesNeedingOptimization();

                if (empty($needsOptimization)) {
                    continue;
                }

                $title = $item->title ?? $item->name ?? 'Item #' . $item->id;
                $this->line("  - {$title} (Score: {$beforeScore})");

                if (!$dryRun) {
                    $optimized = $item->autoGenerateAltText();
                    if ($optimized) {
                        $afterScore = $item->getImageSeoScore();
                        $improvement = $afterScore - $beforeScore;
                        $modelImprovement += $improvement;
                        $optimizedCount++;
                        
                        $this->line("    ✓ Optimized! New score: {$afterScore} (+{$improvement})");
                    } else {
                        $this->line("    ✗ No optimization needed");
                    }
                } else {
                    $recommendations = $item->getImageSeoRecommendations();
                    foreach ($recommendations as $rec) {
                        $this->line("    → {$rec['recommendation']}");
                    }
                }
            }

            if (!$dryRun) {
                $this->info("  Optimized {$optimizedCount} {$modelName} items (Total improvement: +{$modelImprovement})");
                $totalOptimized += $optimizedCount;
                $totalImprovement += $modelImprovement;
            }
        }

        if (!$dryRun) {
            $this->info("\n" . str_repeat('=', 50));
            $this->info("Total items optimized: {$totalOptimized}");
            $this->info("Total score improvement: +{$totalImprovement}");
            $this->info("Average improvement per item: " . ($totalOptimized > 0 ? round($totalImprovement / $totalOptimized, 1) : 0));
        } else {
            $this->info("\nDry run completed. Use --no-dry-run to apply changes.");
        }

        return 0;
    }

    /**
     * Get models to optimize based on the option
     */
    private function getModelsToOptimize(string $modelType): array
    {
        $allModels = [
            'services' => Service::class,
            'portfolio' => PortfolioItem::class,
            'insights' => Insight::class,
            'team' => TeamMember::class,
            'media' => MediaAsset::class,
        ];

        if ($modelType === 'all') {
            return $allModels;
        }

        // Handle singular forms
        $modelMap = [
            'service' => 'services',
            'portfolio' => 'portfolio',
            'insight' => 'insights',
            'team' => 'team',
            'media' => 'media',
        ];

        $key = $modelMap[$modelType] ?? $modelType;

        if (isset($allModels[$key])) {
            return [$key => $allModels[$key]];
        }

        $this->error("Invalid model type: {$modelType}");
        $this->info("Available types: " . implode(', ', array_keys($modelMap)) . ', all');
        
        return [];
    }
}