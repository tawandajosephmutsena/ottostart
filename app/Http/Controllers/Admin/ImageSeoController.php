<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\ImageSeoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ImageSeoController extends Controller
{
    protected ImageSeoService $imageSeoService;

    public function __construct(ImageSeoService $imageSeoService)
    {
        $this->imageSeoService = $imageSeoService;
    }

    /**
     * Show image SEO dashboard
     */
    public function index()
    {
        return Inertia::render('admin/seo/ImageSeo', [
            'title' => 'Image SEO Optimization',
        ]);
    }

    /**
     * Analyze single image
     */
    public function analyzeImage(Request $request)
    {
        $request->validate([
            'path' => 'required|string',
            'alt_text' => 'nullable|string',
            'title' => 'nullable|string',
        ]);

        try {
            $analysis = $this->imageSeoService->analyzeImageSeo(
                $request->path,
                $request->alt_text,
                $request->title
            );

            return response()->json([
                'success' => true,
                'analysis' => $analysis,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to analyze image: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Bulk analyze images in directory
     */
    public function bulkAnalyze(Request $request)
    {
        $request->validate([
            'directory' => 'required|string',
        ]);

        try {
            $results = $this->imageSeoService->bulkAnalyzeImages($request->directory);

            return response()->json([
                'success' => true,
                'results' => $results,
                'summary' => $this->generateBulkSummary($results),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to analyze images: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate alt text suggestions
     */
    public function generateAltText(Request $request)
    {
        $request->validate([
            'path' => 'required|string',
            'context' => 'nullable|string',
        ]);

        try {
            $suggestions = $this->imageSeoService->generateAltTextSuggestions(
                $request->path,
                $request->context
            );

            return response()->json([
                'success' => true,
                'suggestions' => $suggestions,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate alt text: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate SEO-friendly filename
     */
    public function generateFilename(Request $request)
    {
        $request->validate([
            'original_name' => 'required|string',
            'description' => 'nullable|string',
            'keywords' => 'nullable|array',
        ]);

        try {
            $filename = $this->imageSeoService->generateSeoFilename(
                $request->original_name,
                $request->description,
                $request->keywords ?? []
            );

            return response()->json([
                'success' => true,
                'filename' => $filename,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate filename: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get image directories for analysis
     */
    public function getDirectories()
    {
        try {
            $directories = [];
            
            // Common image directories
            $commonDirs = [
                'uploads',
                'uploads/images',
                'uploads/portfolio',
                'uploads/insights',
                'uploads/services',
                'uploads/team',
                'uploads/media',
            ];

            foreach ($commonDirs as $dir) {
                if (Storage::exists($dir)) {
                    $imageCount = $this->countImagesInDirectory($dir);
                    if ($imageCount > 0) {
                        $directories[] = [
                            'path' => $dir,
                            'name' => ucfirst(str_replace(['uploads/', '_', '-'], ['', ' ', ' '], $dir)),
                            'image_count' => $imageCount,
                        ];
                    }
                }
            }

            return response()->json([
                'success' => true,
                'directories' => $directories,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get directories: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get content models with images for analysis
     */
    public function getContentModels()
    {
        try {
            $models = [];

            // Portfolio items
            $portfolioItems = \App\Models\PortfolioItem::select('id', 'title', 'featured_image')
                ->whereNotNull('featured_image')
                ->get();
            
            foreach ($portfolioItems as $item) {
                $models[] = [
                    'type' => 'portfolio',
                    'id' => $item->id,
                    'title' => $item->title,
                    'image_count' => 1, // Just featured image for now
                ];
            }

            // Insights
            $insights = \App\Models\Insight::select('id', 'title', 'featured_image')
                ->whereNotNull('featured_image')
                ->get();
            
            foreach ($insights as $insight) {
                $models[] = [
                    'type' => 'insight',
                    'id' => $insight->id,
                    'title' => $insight->title,
                    'image_count' => 1,
                ];
            }

            // Services
            $services = \App\Models\Service::select('id', 'title', 'featured_image')
                ->whereNotNull('featured_image')
                ->get();
            
            foreach ($services as $service) {
                $models[] = [
                    'type' => 'service',
                    'id' => $service->id,
                    'title' => $service->title,
                    'image_count' => 1,
                ];
            }

            // Team Members
            $teamMembers = \App\Models\TeamMember::select('id', 'name', 'avatar')
                ->whereNotNull('avatar')
                ->get();
            
            foreach ($teamMembers as $member) {
                $models[] = [
                    'type' => 'team',
                    'id' => $member->id,
                    'title' => $member->name,
                    'image_count' => 1,
                ];
            }

            // Media Assets
            $mediaAssets = \App\Models\MediaAsset::images()
                ->select('id', 'original_name', 'filename')
                ->get();
            
            foreach ($mediaAssets as $asset) {
                $models[] = [
                    'type' => 'media',
                    'id' => $asset->id,
                    'title' => $asset->original_name ?: $asset->filename,
                    'image_count' => 1,
                ];
            }

            return response()->json([
                'success' => true,
                'models' => $models,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get content models: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Analyze content model images
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

            // Check if model uses HasImageSeo trait
            if (!method_exists($model, 'getImageSeoAnalysis')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Model does not support image SEO analysis',
                ], 400);
            }

            $analysis = $model->getImageSeoAnalysis();
            $recommendations = $model->getImageSeoRecommendations();
            $score = $model->getImageSeoScore();

            return response()->json([
                'success' => true,
                'model' => [
                    'type' => $request->type,
                    'id' => $request->id,
                    'title' => $model->title ?? $model->name ?? 'Untitled',
                ],
                'analysis' => $analysis,
                'recommendations' => $recommendations,
                'score' => $score,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to analyze content model: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Count images in directory
     */
    private function countImagesInDirectory(string $directory): int
    {
        $files = Storage::files($directory);
        $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        $count = 0;

        foreach ($files as $file) {
            $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
            if (in_array($extension, $imageExtensions)) {
                $count++;
            }
        }

        return $count;
    }

    /**
     * Generate bulk analysis summary
     */
    private function generateBulkSummary(array $results): array
    {
        $totalImages = count($results);
        $totalScore = array_sum(array_column($results, 'score'));
        $averageScore = $totalImages > 0 ? round($totalScore / $totalImages) : 0;

        $issueCount = 0;
        $needsOptimization = 0;

        foreach ($results as $result) {
            $issueCount += count($result['issues']);
            if ($result['score'] < 80) {
                $needsOptimization++;
            }
        }

        return [
            'total_images' => $totalImages,
            'average_score' => $averageScore,
            'total_issues' => $issueCount,
            'needs_optimization' => $needsOptimization,
            'optimization_percentage' => $totalImages > 0 ? round(($totalImages - $needsOptimization) / $totalImages * 100) : 100,
        ];
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
            case 'team':
                return \App\Models\TeamMember::find($id);
            case 'media':
                return \App\Models\MediaAsset::find($id);
            default:
                return null;
        }
    }

    /**
     * Bulk optimize alt text for content models
     */
    public function bulkOptimizeModels(Request $request)
    {
        $request->validate([
            'model_type' => 'required|string|in:portfolio,insight,service,team,media',
            'ids' => 'nullable|array',
            'ids.*' => 'integer',
        ]);

        try {
            $results = $this->imageSeoService->bulkOptimizeContentModels(
                $request->model_type,
                $request->ids ?? []
            );

            return response()->json([
                'success' => true,
                'results' => $results,
                'summary' => $this->generateOptimizationSummary($results),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to optimize models: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Bulk optimize filenames in directory
     */
    public function bulkOptimizeFilenames(Request $request)
    {
        $request->validate([
            'directory' => 'required|string',
            'description' => 'nullable|string',
            'keywords' => 'nullable|array',
            'apply_changes' => 'boolean',
        ]);

        try {
            $optimizations = $this->imageSeoService->bulkOptimizeFilenames(
                $request->directory,
                [
                    'description' => $request->description,
                    'keywords' => $request->keywords ?? [],
                ]
            );

            $results = ['optimizations' => $optimizations];

            // Apply changes if requested
            if ($request->apply_changes) {
                $results['applied'] = $this->imageSeoService->applyBulkFilenameOptimizations($optimizations);
            }

            return response()->json([
                'success' => true,
                'results' => $results,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to optimize filenames: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update model image SEO data
     */
    public function updateModelImageSeo(Request $request)
    {
        $request->validate([
            'model_type' => 'required|string|in:portfolio,insight,service,team,media',
            'model_id' => 'required|integer',
            'image_data' => 'required|array',
        ]);

        try {
            $model = $this->getModelInstance($request->model_type, $request->model_id);
            
            if (!$model) {
                return response()->json([
                    'success' => false,
                    'message' => 'Model not found',
                ], 404);
            }

            $success = $model->bulkUpdateImageSeo($request->image_data);

            return response()->json([
                'success' => $success,
                'message' => $success ? 'Image SEO data updated successfully' : 'No changes were made',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update image SEO: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate optimization summary
     */
    private function generateOptimizationSummary(array $results): array
    {
        $totalModels = count($results);
        $optimizedCount = count(array_filter($results, fn($r) => $r['optimized']));
        $totalImprovement = array_sum(array_column($results, 'improvement'));
        $averageImprovement = $totalModels > 0 ? round($totalImprovement / $totalModels, 1) : 0;

        return [
            'total_models' => $totalModels,
            'optimized_count' => $optimizedCount,
            'optimization_rate' => $totalModels > 0 ? round($optimizedCount / $totalModels * 100, 1) : 0,
            'average_improvement' => $averageImprovement,
            'total_improvement' => $totalImprovement,
        ];
    }
}