<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\WebCoreVitalsService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WebCoreVitalsController extends Controller
{
    protected WebCoreVitalsService $webCoreVitalsService;

    public function __construct(WebCoreVitalsService $webCoreVitalsService)
    {
        $this->webCoreVitalsService = $webCoreVitalsService;
    }

    /**
     * Show Web Core Vitals dashboard
     */
    public function index()
    {
        return Inertia::render('admin/seo/WebCoreVitals', [
            'title' => 'Web Core Vitals Optimization',
        ]);
    }

    /**
     * Analyze Web Core Vitals for a URL
     */
    public function analyze(Request $request)
    {
        $request->validate([
            'url' => 'nullable|string|url',
            'options' => 'nullable|array',
        ]);

        try {
            $analysis = $this->webCoreVitalsService->analyzeWebCoreVitals(
                $request->url,
                $request->options ?? []
            );

            return response()->json([
                'success' => true,
                'analysis' => $analysis,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Web Core Vitals analysis failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get Web Core Vitals optimization report
     */
    public function getOptimizationReport()
    {
        try {
            $report = $this->webCoreVitalsService->generateOptimizationReport();

            return response()->json([
                'success' => true,
                'report' => $report,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate optimization report: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get content-specific recommendations
     */
    public function getContentRecommendations(Request $request)
    {
        $request->validate([
            'content_type' => 'required|string|in:portfolio,insight,service,page',
        ]);

        try {
            $recommendations = $this->webCoreVitalsService->getContentTypeRecommendations(
                $request->content_type
            );

            return response()->json([
                'success' => true,
                'recommendations' => $recommendations,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get content recommendations: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Analyze content model Web Core Vitals
     */
    public function analyzeContentModel(Request $request)
    {
        $request->validate([
            'type' => 'required|string|in:portfolio,insight,service',
            'id' => 'required|integer',
        ]);

        try {
            $model = $this->getModelInstance($request->type, $request->id);
            
            if (!$model) {
                return response()->json([
                    'success' => false,
                    'message' => 'Model not found',
                ], 404);
            }

            // Check if model uses HasWebCoreVitals trait
            if (!method_exists($model, 'getWebCoreVitalsAnalysis')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Model does not support Web Core Vitals analysis',
                ], 400);
            }

            $analysis = $model->getWebCoreVitalsAnalysis();
            $summary = $model->getWebCoreVitalsSummary();
            $status = $model->getWebCoreVitalsStatus();
            $recommendations = $model->getContentSpecificRecommendations();

            return response()->json([
                'success' => true,
                'model' => [
                    'type' => $request->type,
                    'id' => $request->id,
                    'title' => $model->title ?? $model->name ?? 'Untitled',
                    'url' => $model->getModelUrl(),
                ],
                'analysis' => $analysis,
                'summary' => $summary,
                'status' => $status,
                'recommendations' => $recommendations,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to analyze content model: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get bulk Web Core Vitals analysis for content models
     */
    public function bulkAnalyze(Request $request)
    {
        $request->validate([
            'content_types' => 'required|array',
            'content_types.*' => 'string|in:portfolio,insight,service',
            'limit' => 'nullable|integer|min:1|max:50',
        ]);

        try {
            $results = [];
            $limit = $request->limit ?? 10;

            foreach ($request->content_types as $contentType) {
                $models = $this->getModelsForBulkAnalysis($contentType, $limit);
                
                foreach ($models as $model) {
                    if (method_exists($model, 'getWebCoreVitalsSummary')) {
                        $summary = $model->getWebCoreVitalsSummary();
                        $summary['model_type'] = $contentType;
                        $summary['model_id'] = $model->id;
                        $summary['title'] = $model->title ?? $model->name ?? 'Untitled';
                        $results[] = $summary;
                    }
                }
            }

            // Generate bulk summary
            $bulkSummary = $this->generateBulkSummary($results);

            return response()->json([
                'success' => true,
                'results' => $results,
                'summary' => $bulkSummary,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Bulk analysis failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get Web Core Vitals dashboard data
     */
    public function getDashboardData()
    {
        try {
            // Get overall site analysis
            $siteAnalysis = $this->webCoreVitalsService->analyzeWebCoreVitals();
            
            // Get optimization report
            $optimizationReport = $this->webCoreVitalsService->generateOptimizationReport();
            
            // Get content type statistics
            $contentStats = $this->getContentTypeStats();
            
            return response()->json([
                'success' => true,
                'dashboard' => [
                    'site_analysis' => $siteAnalysis,
                    'optimization_report' => $optimizationReport,
                    'content_stats' => $contentStats,
                    'quick_wins' => $this->getQuickWins($optimizationReport),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get dashboard data: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get model instance by type and ID
     */
    private function getModelInstance(string $type, int $id)
    {
        switch ($type) {
            case 'portfolio':
                return \App\Models\PortfolioItem::find($id);
            case 'insight':
                return \App\Models\Insight::find($id);
            case 'service':
                return \App\Models\Service::find($id);
            default:
                return null;
        }
    }

    /**
     * Get models for bulk analysis
     */
    private function getModelsForBulkAnalysis(string $contentType, int $limit)
    {
        switch ($contentType) {
            case 'portfolio':
                return \App\Models\PortfolioItem::published()->limit($limit)->get();
            case 'insight':
                return \App\Models\Insight::published()->limit($limit)->get();
            case 'service':
                return \App\Models\Service::published()->limit($limit)->get();
            default:
                return collect();
        }
    }

    /**
     * Generate bulk analysis summary
     */
    private function generateBulkSummary(array $results): array
    {
        $totalItems = count($results);
        
        if ($totalItems === 0) {
            return [
                'total_items' => 0,
                'average_score' => 0,
                'needs_optimization' => 0,
                'grade_distribution' => [],
            ];
        }

        $totalScore = array_sum(array_column($results, 'overall_score'));
        $averageScore = round($totalScore / $totalItems);
        
        $needsOptimization = count(array_filter($results, fn($r) => $r['needs_optimization']));
        
        // Grade distribution
        $grades = array_column($results, 'grade');
        $gradeDistribution = array_count_values($grades);

        // Metric averages
        $avgLCP = round(array_sum(array_column($results, 'lcp_score')) / $totalItems);
        $avgFID = round(array_sum(array_column($results, 'fid_score')) / $totalItems);
        $avgCLS = round(array_sum(array_column($results, 'cls_score')) / $totalItems);

        return [
            'total_items' => $totalItems,
            'average_score' => $averageScore,
            'needs_optimization' => $needsOptimization,
            'optimization_percentage' => round((($totalItems - $needsOptimization) / $totalItems) * 100),
            'grade_distribution' => $gradeDistribution,
            'metric_averages' => [
                'lcp' => $avgLCP,
                'fid' => $avgFID,
                'cls' => $avgCLS,
            ],
        ];
    }

    /**
     * Get content type statistics
     */
    private function getContentTypeStats(): array
    {
        return [
            'portfolio' => [
                'total' => \App\Models\PortfolioItem::published()->count(),
                'with_images' => \App\Models\PortfolioItem::published()->whereNotNull('featured_image')->count(),
            ],
            'insights' => [
                'total' => \App\Models\Insight::published()->count(),
                'with_images' => \App\Models\Insight::published()->whereNotNull('featured_image')->count(),
            ],
            'services' => [
                'total' => \App\Models\Service::published()->count(),
                'with_images' => \App\Models\Service::published()->whereNotNull('image')->count(),
            ],
        ];
    }

    /**
     * Get quick wins from optimization report
     */
    private function getQuickWins(array $optimizationReport): array
    {
        $quickWins = [];
        
        if (isset($optimizationReport['action_plan'])) {
            foreach ($optimizationReport['action_plan'] as $phase) {
                if ($phase['phase'] === 'Quick Wins') {
                    $quickWins = $phase['optimizations'];
                    break;
                }
            }
        }

        return $quickWins;
    }
}