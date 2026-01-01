<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\SeoOptimizationService;
use App\Services\SeoService;
use App\Models\Insight;
use App\Models\PortfolioItem;
use App\Models\Service;
use App\Models\Page;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SeoAnalysisController extends Controller
{
    private SeoOptimizationService $seoOptimizationService;
    private SeoService $seoService;

    public function __construct(
        SeoOptimizationService $seoOptimizationService,
        SeoService $seoService
    ) {
        $this->seoOptimizationService = $seoOptimizationService;
        $this->seoService = $seoService;
    }

    /**
     * Display SEO analysis dashboard
     */
    public function index(): Response
    {
        $overallStats = $this->getOverallSeoStats();
        $recentAnalyses = $this->getRecentAnalyses();
        $topIssues = $this->getTopSeoIssues();

        return Inertia::render('admin/seo/Dashboard', [
            'stats' => $overallStats,
            'recentAnalyses' => $recentAnalyses,
            'topIssues' => $topIssues,
        ]);
    }

    /**
     * Analyze a specific content item
     */
    public function analyze(Request $request): array
    {
        $request->validate([
            'type' => 'required|in:insight,portfolio,service,page',
            'id' => 'required|integer',
        ]);

        $model = $this->getModel($request->type, $request->id);
        
        if (!$model) {
            return [
                'success' => false,
                'message' => 'Content not found',
            ];
        }

        $analysis = $model->getSeoAnalysis();
        
        // Store analysis for tracking
        $this->storeAnalysis($model, $analysis);

        return [
            'success' => true,
            'analysis' => $analysis,
            'model' => [
                'id' => $model->id,
                'title' => $model->title,
                'type' => $request->type,
                'url' => $model->getSeoUrl(),
            ],
        ];
    }

    /**
     * Get SEO suggestions for content
     */
    public function suggestions(Request $request): array
    {
        $request->validate([
            'type' => 'required|in:insight,portfolio,service,page',
            'id' => 'required|integer',
        ]);

        $model = $this->getModel($request->type, $request->id);
        
        if (!$model) {
            return [
                'success' => false,
                'message' => 'Content not found',
            ];
        }

        return [
            'success' => true,
            'suggestions' => [
                'titles' => $model->getTitleSuggestions(),
                'descriptions' => $model->getDescriptionSuggestions(),
            ],
        ];
    }

    /**
     * Bulk analyze content
     */
    public function bulkAnalyze(Request $request): array
    {
        $request->validate([
            'type' => 'required|in:insight,portfolio,service,page',
            'limit' => 'integer|min:1|max:100',
        ]);

        $limit = $request->limit ?? 20;
        $models = $this->getModels($request->type, $limit);
        $results = [];

        foreach ($models as $model) {
            $analysis = $model->getSeoAnalysis();
            $this->storeAnalysis($model, $analysis);
            
            $results[] = [
                'id' => $model->id,
                'title' => $model->title,
                'score' => $analysis['overall_score'],
                'grade' => $analysis['grade'],
                'issues_count' => count($analysis['title']['issues']) + count($analysis['description']['issues']),
            ];
        }

        return [
            'success' => true,
            'results' => $results,
            'analyzed_count' => count($results),
        ];
    }

    /**
     * Get SEO recommendations for the entire site
     */
    public function siteRecommendations(): array
    {
        $recommendations = [];

        // Analyze content distribution
        $contentStats = $this->getContentStats();
        
        if ($contentStats['insights'] < 10) {
            $recommendations[] = [
                'type' => 'content',
                'priority' => 'high',
                'title' => 'Increase Blog Content',
                'description' => 'You have only ' . $contentStats['insights'] . ' blog posts. Aim for at least 20-30 quality posts to improve SEO.',
                'action' => 'Create more blog content',
            ];
        }

        if ($contentStats['portfolio'] < 5) {
            $recommendations[] = [
                'type' => 'content',
                'priority' => 'medium',
                'title' => 'Expand Portfolio',
                'description' => 'Add more portfolio items to showcase your work and improve keyword coverage.',
                'action' => 'Add portfolio projects',
            ];
        }

        // Analyze SEO scores
        $lowScoreContent = $this->getLowScoreContent();
        
        if (count($lowScoreContent) > 0) {
            $recommendations[] = [
                'type' => 'optimization',
                'priority' => 'high',
                'title' => 'Fix Low-Scoring Content',
                'description' => count($lowScoreContent) . ' pieces of content have SEO scores below 70.',
                'action' => 'Optimize titles and descriptions',
                'items' => $lowScoreContent,
            ];
        }

        // Check for missing meta descriptions
        $missingDescriptions = $this->getMissingDescriptions();
        
        if (count($missingDescriptions) > 0) {
            $recommendations[] = [
                'type' => 'meta',
                'priority' => 'high',
                'title' => 'Add Missing Meta Descriptions',
                'description' => count($missingDescriptions) . ' pages are missing meta descriptions.',
                'action' => 'Add meta descriptions',
                'items' => $missingDescriptions,
            ];
        }

        // Check for duplicate titles
        $duplicateTitles = $this->getDuplicateTitles();
        
        if (count($duplicateTitles) > 0) {
            $recommendations[] = [
                'type' => 'meta',
                'priority' => 'medium',
                'title' => 'Fix Duplicate Titles',
                'description' => 'Found ' . count($duplicateTitles) . ' duplicate page titles.',
                'action' => 'Make titles unique',
                'items' => $duplicateTitles,
            ];
        }

        return [
            'success' => true,
            'recommendations' => $recommendations,
            'total_count' => count($recommendations),
        ];
    }

    /**
     * Get model instance by type and ID
     */
    private function getModel(string $type, int $id)
    {
        return match($type) {
            'insight' => Insight::find($id),
            'portfolio' => PortfolioItem::find($id),
            'service' => Service::find($id),
            'page' => Page::find($id),
            default => null,
        };
    }

    /**
     * Get models by type
     */
    private function getModels(string $type, int $limit)
    {
        return match($type) {
            'insight' => Insight::published()->limit($limit)->get(),
            'portfolio' => PortfolioItem::published()->limit($limit)->get(),
            'service' => Service::published()->limit($limit)->get(),
            'page' => Page::published()->limit($limit)->get(),
            default => collect(),
        };
    }

    /**
     * Store analysis results for tracking
     */
    private function storeAnalysis($model, array $analysis): void
    {
        // This could be stored in a dedicated table for tracking over time
        // For now, we'll just cache it
        $cacheKey = 'seo_analysis_' . get_class($model) . '_' . $model->id;
        cache()->put($cacheKey, $analysis, now()->addHours(24));
    }

    /**
     * Get overall SEO statistics
     */
    private function getOverallSeoStats(): array
    {
        return [
            'total_pages' => $this->getTotalPages(),
            'analyzed_pages' => $this->getAnalyzedPages(),
            'average_score' => $this->getAverageScore(),
            'pages_needing_attention' => $this->getPagesNeedingAttention(),
            'top_performing_pages' => $this->getTopPerformingPages(),
        ];
    }

    /**
     * Get recent SEO analyses
     */
    private function getRecentAnalyses(): array
    {
        // This would come from a stored analyses table in a real implementation
        return [];
    }

    /**
     * Get top SEO issues across the site
     */
    private function getTopSeoIssues(): array
    {
        return [
            [
                'issue' => 'Missing meta descriptions',
                'count' => count($this->getMissingDescriptions()),
                'severity' => 'high',
            ],
            [
                'issue' => 'Duplicate titles',
                'count' => count($this->getDuplicateTitles()),
                'severity' => 'medium',
            ],
            [
                'issue' => 'Long titles',
                'count' => $this->getLongTitlesCount(),
                'severity' => 'low',
            ],
        ];
    }

    /**
     * Helper methods for statistics
     */
    private function getTotalPages(): int
    {
        return Insight::published()->count() +
               PortfolioItem::published()->count() +
               Service::published()->count() +
               Page::published()->count();
    }

    private function getAnalyzedPages(): int
    {
        // This would be tracked in a real implementation
        return 0;
    }

    private function getAverageScore(): float
    {
        // This would be calculated from stored analyses
        return 0.0;
    }

    private function getPagesNeedingAttention(): int
    {
        return count($this->getLowScoreContent());
    }

    private function getTopPerformingPages(): array
    {
        // This would come from stored analyses
        return [];
    }

    private function getContentStats(): array
    {
        return [
            'insights' => Insight::published()->count(),
            'portfolio' => PortfolioItem::published()->count(),
            'services' => Service::published()->count(),
            'pages' => Page::published()->count(),
        ];
    }

    private function getLowScoreContent(): array
    {
        // This would be based on stored analysis scores
        return [];
    }

    private function getMissingDescriptions(): array
    {
        $missing = [];

        // Check insights
        $insights = Insight::published()
            ->where(function($q) {
                $q->whereNull('excerpt')
                  ->orWhere('excerpt', '');
            })
            ->select(['id', 'title', 'slug'])
            ->get();

        foreach ($insights as $insight) {
            $missing[] = [
                'type' => 'insight',
                'id' => $insight->id,
                'title' => $insight->title,
                'url' => route('blog.show', $insight->slug),
            ];
        }

        // Check portfolio items
        $portfolio = PortfolioItem::published()
            ->where(function($q) {
                $q->whereNull('description')
                  ->orWhere('description', '');
            })
            ->select(['id', 'title', 'slug'])
            ->get();

        foreach ($portfolio as $item) {
            $missing[] = [
                'type' => 'portfolio',
                'id' => $item->id,
                'title' => $item->title,
                'url' => route('portfolio.show', $item->slug),
            ];
        }

        return $missing;
    }

    private function getDuplicateTitles(): array
    {
        $duplicates = [];

        // This would check for duplicate titles across all content types
        // Implementation would involve grouping by title and finding duplicates

        return $duplicates;
    }

    private function getLongTitlesCount(): int
    {
        return Insight::published()
            ->whereRaw('LENGTH(title) > 60')
            ->count() +
            PortfolioItem::published()
            ->whereRaw('LENGTH(title) > 60')
            ->count() +
            Service::published()
            ->whereRaw('LENGTH(title) > 60')
            ->count();
    }

    /**
     * Perform semantic HTML analysis
     */
    public function semanticAnalysis(Request $request)
    {
        $request->validate([
            'type' => 'required|string|in:insight,portfolio,service,page',
            'id' => 'required|integer',
            'html' => 'nullable|string',
        ]);

        try {
            $model = $this->getModel($request->type, $request->id);
            
            if (!$model) {
                return response()->json([
                    'success' => false,
                    'message' => 'Content not found',
                ], 404);
            }

            // Check if model uses HasSemanticAnalysis trait
            if (!method_exists($model, 'getSemanticAnalysis')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Model does not support semantic analysis',
                ], 400);
            }

            $analysis = $model->getSemanticAnalysis($request->html);

            return response()->json([
                'success' => true,
                'analysis' => $analysis,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Semantic analysis failed: ' . $e->getMessage(),
            ], 500);
        }
    }
}