<?php

namespace App\Services;

use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Facades\Image;

class ImageSeoService
{
    /**
     * Analyze image SEO optimization
     */
    public function analyzeImageSeo(string $imagePath, ?string $altText = null, ?string $title = null): array
    {
        $analysis = [
            'path' => $imagePath,
            'alt_text' => $altText,
            'title' => $title,
            'filename_seo' => $this->analyzeFilename($imagePath),
            'file_optimization' => $this->analyzeFileOptimization($imagePath),
            'accessibility' => $this->analyzeAccessibility($altText, $title),
            'score' => 0,
            'issues' => [],
            'recommendations' => [],
        ];

        // Calculate overall score
        $analysis['score'] = $this->calculateImageSeoScore($analysis);
        
        // Generate issues and recommendations
        $this->generateImageSeoRecommendations($analysis);

        return $analysis;
    }

    /**
     * Analyze filename for SEO
     */
    private function analyzeFilename(string $imagePath): array
    {
        $filename = pathinfo($imagePath, PATHINFO_FILENAME);
        $extension = pathinfo($imagePath, PATHINFO_EXTENSION);
        
        $analysis = [
            'original' => $filename,
            'extension' => $extension,
            'is_descriptive' => false,
            'has_keywords' => false,
            'uses_hyphens' => false,
            'length_appropriate' => false,
            'issues' => [],
            'score' => 0,
        ];

        // Check if filename is descriptive (not generic)
        $genericNames = ['image', 'img', 'photo', 'picture', 'untitled', 'screenshot', 'scan'];
        $isGeneric = false;
        foreach ($genericNames as $generic) {
            if (stripos($filename, $generic) !== false && strlen($filename) < 15) {
                $isGeneric = true;
                break;
            }
        }
        $analysis['is_descriptive'] = !$isGeneric;

        // Check for keyword usage (contains meaningful words)
        $wordCount = str_word_count($filename);
        $analysis['has_keywords'] = $wordCount >= 2;

        // Check for proper separator usage
        $analysis['uses_hyphens'] = strpos($filename, '-') !== false || strpos($filename, '_') !== false;

        // Check filename length
        $length = strlen($filename);
        $analysis['length_appropriate'] = $length >= 10 && $length <= 60;

        // Generate issues
        if (!$analysis['is_descriptive']) {
            $analysis['issues'][] = 'Filename is not descriptive';
        }
        if (!$analysis['has_keywords']) {
            $analysis['issues'][] = 'Filename lacks meaningful keywords';
        }
        if (!$analysis['uses_hyphens']) {
            $analysis['issues'][] = 'Filename should use hyphens or underscores to separate words';
        }
        if (!$analysis['length_appropriate']) {
            $analysis['issues'][] = 'Filename length should be between 10-60 characters';
        }

        // Calculate score
        $score = 0;
        if ($analysis['is_descriptive']) $score += 40;
        if ($analysis['has_keywords']) $score += 30;
        if ($analysis['uses_hyphens']) $score += 20;
        if ($analysis['length_appropriate']) $score += 10;
        
        $analysis['score'] = $score;

        return $analysis;
    }

    /**
     * Analyze file optimization
     */
    private function analyzeFileOptimization(string $imagePath): array
    {
        $analysis = [
            'file_size' => 0,
            'dimensions' => ['width' => 0, 'height' => 0],
            'format' => '',
            'is_optimized' => false,
            'is_responsive' => false,
            'has_webp_version' => false,
            'compression_ratio' => 0,
            'issues' => [],
            'score' => 0,
        ];

        try {
            // Get file information
            if (Storage::exists($imagePath)) {
                $fullPath = Storage::path($imagePath);
                $analysis['file_size'] = filesize($fullPath);
                
                // Get image dimensions and format
                $imageInfo = getimagesize($fullPath);
                if ($imageInfo) {
                    $analysis['dimensions'] = [
                        'width' => $imageInfo[0],
                        'height' => $imageInfo[1],
                    ];
                    $analysis['format'] = image_type_to_extension($imageInfo[2], false);
                }
            }

            // Check if file size is optimized
            $maxSize = 500 * 1024; // 500KB
            $analysis['is_optimized'] = $analysis['file_size'] <= $maxSize;

            // Check for WebP version
            $webpPath = preg_replace('/\.[^.]+$/', '.webp', $imagePath);
            $analysis['has_webp_version'] = Storage::exists($webpPath);

            // Check if dimensions are reasonable for web
            $width = $analysis['dimensions']['width'];
            $height = $analysis['dimensions']['height'];
            $analysis['is_responsive'] = $width <= 1920 && $height <= 1080;

            // Generate issues
            if (!$analysis['is_optimized']) {
                $analysis['issues'][] = 'File size is too large (over 500KB)';
            }
            if (!$analysis['has_webp_version']) {
                $analysis['issues'][] = 'No WebP version available for better compression';
            }
            if (!$analysis['is_responsive']) {
                $analysis['issues'][] = 'Image dimensions may be too large for web use';
            }
            if (!in_array($analysis['format'], ['jpg', 'jpeg', 'png', 'webp'])) {
                $analysis['issues'][] = 'Image format not optimized for web';
            }

            // Calculate score
            $score = 0;
            if ($analysis['is_optimized']) $score += 40;
            if ($analysis['has_webp_version']) $score += 30;
            if ($analysis['is_responsive']) $score += 20;
            if (in_array($analysis['format'], ['jpg', 'jpeg', 'png', 'webp'])) $score += 10;
            
            $analysis['score'] = $score;

        } catch (\Exception $e) {
            $analysis['issues'][] = 'Could not analyze image file: ' . $e->getMessage();
        }

        return $analysis;
    }

    /**
     * Analyze accessibility features
     */
    private function analyzeAccessibility(?string $altText, ?string $title): array
    {
        $analysis = [
            'has_alt_text' => !empty($altText),
            'alt_text_quality' => 0,
            'has_title' => !empty($title),
            'title_quality' => 0,
            'issues' => [],
            'score' => 0,
        ];

        // Analyze alt text
        if (empty($altText)) {
            $analysis['issues'][] = 'Missing alt text';
        } else {
            $altLength = strlen($altText);
            $altWords = str_word_count($altText);
            
            if ($altLength < 10) {
                $analysis['issues'][] = 'Alt text is too short (less than 10 characters)';
                $analysis['alt_text_quality'] = 25;
            } elseif ($altLength > 125) {
                $analysis['issues'][] = 'Alt text is too long (over 125 characters)';
                $analysis['alt_text_quality'] = 50;
            } elseif ($altWords < 3) {
                $analysis['issues'][] = 'Alt text should be more descriptive (at least 3 words)';
                $analysis['alt_text_quality'] = 60;
            } else {
                $analysis['alt_text_quality'] = 100;
            }

            // Check for bad alt text patterns
            $badPatterns = ['image of', 'picture of', 'photo of', 'graphic of'];
            foreach ($badPatterns as $pattern) {
                if (stripos($altText, $pattern) === 0) {
                    $analysis['issues'][] = 'Alt text should not start with "' . $pattern . '"';
                    $analysis['alt_text_quality'] = max(0, $analysis['alt_text_quality'] - 20);
                    break;
                }
            }
        }

        // Analyze title attribute
        if (!empty($title)) {
            $titleLength = strlen($title);
            if ($titleLength < 5) {
                $analysis['issues'][] = 'Title attribute is too short';
                $analysis['title_quality'] = 50;
            } elseif ($titleLength > 100) {
                $analysis['issues'][] = 'Title attribute is too long';
                $analysis['title_quality'] = 50;
            } else {
                $analysis['title_quality'] = 100;
            }
        }

        // Calculate score
        $score = 0;
        if ($analysis['has_alt_text']) {
            $score += ($analysis['alt_text_quality'] * 0.8); // Alt text is 80% of accessibility score
        }
        if ($analysis['has_title']) {
            $score += ($analysis['title_quality'] * 0.2); // Title is 20% of accessibility score
        }
        
        $analysis['score'] = round($score);

        return $analysis;
    }

    /**
     * Calculate overall image SEO score
     */
    private function calculateImageSeoScore(array $analysis): int
    {
        $filenameScore = $analysis['filename_seo']['score'] * 0.3; // 30%
        $optimizationScore = $analysis['file_optimization']['score'] * 0.4; // 40%
        $accessibilityScore = $analysis['accessibility']['score'] * 0.3; // 30%

        return round($filenameScore + $optimizationScore + $accessibilityScore);
    }

    /**
     * Generate recommendations for image SEO
     */
    private function generateImageSeoRecommendations(array &$analysis): void
    {
        // Filename recommendations
        foreach ($analysis['filename_seo']['issues'] as $issue) {
            $analysis['issues'][] = $issue;
            $analysis['recommendations'][] = $this->getFilenameRecommendation($issue);
        }

        // File optimization recommendations
        foreach ($analysis['file_optimization']['issues'] as $issue) {
            $analysis['issues'][] = $issue;
            $analysis['recommendations'][] = $this->getOptimizationRecommendation($issue);
        }

        // Accessibility recommendations
        foreach ($analysis['accessibility']['issues'] as $issue) {
            $analysis['issues'][] = $issue;
            $analysis['recommendations'][] = $this->getAccessibilityRecommendation($issue);
        }
    }

    /**
     * Get filename recommendation
     */
    private function getFilenameRecommendation(string $issue): string
    {
        if (str_contains($issue, 'not descriptive')) {
            return 'Use descriptive filenames that describe the image content (e.g., "red-sports-car-sunset.jpg")';
        }
        if (str_contains($issue, 'keywords')) {
            return 'Include relevant keywords in the filename separated by hyphens';
        }
        if (str_contains($issue, 'hyphens')) {
            return 'Use hyphens (-) to separate words in filenames for better SEO';
        }
        if (str_contains($issue, 'length')) {
            return 'Keep filenames between 10-60 characters for optimal SEO';
        }
        return 'Optimize filename for better SEO';
    }

    /**
     * Get optimization recommendation
     */
    private function getOptimizationRecommendation(string $issue): string
    {
        if (str_contains($issue, 'file size')) {
            return 'Compress images to under 500KB using tools like TinyPNG or ImageOptim';
        }
        if (str_contains($issue, 'WebP')) {
            return 'Create WebP versions of images for better compression and faster loading';
        }
        if (str_contains($issue, 'dimensions')) {
            return 'Resize images to appropriate dimensions for web use (max 1920x1080)';
        }
        if (str_contains($issue, 'format')) {
            return 'Use web-optimized formats: JPEG for photos, PNG for graphics, WebP for best compression';
        }
        return 'Optimize image file for better web performance';
    }

    /**
     * Get accessibility recommendation
     */
    private function getAccessibilityRecommendation(string $issue): string
    {
        if (str_contains($issue, 'Missing alt text')) {
            return 'Add descriptive alt text that explains what the image shows';
        }
        if (str_contains($issue, 'too short')) {
            return 'Make alt text more descriptive (at least 10 characters)';
        }
        if (str_contains($issue, 'too long')) {
            return 'Keep alt text concise (under 125 characters)';
        }
        if (str_contains($issue, 'more descriptive')) {
            return 'Use at least 3 words to describe the image content';
        }
        if (str_contains($issue, 'should not start')) {
            return 'Start alt text with the actual description, not "image of" or "picture of"';
        }
        if (str_contains($issue, 'Title attribute')) {
            return 'Keep title attributes between 5-100 characters';
        }
        return 'Improve image accessibility';
    }

    /**
     * Generate SEO-friendly filename
     */
    public function generateSeoFilename(string $originalName, ?string $description = null, array $keywords = []): string
    {
        // Start with description or original name
        $base = $description ?? pathinfo($originalName, PATHINFO_FILENAME);
        
        // Clean and normalize
        $filename = Str::slug($base, '-');
        
        // Add keywords if provided
        if (!empty($keywords)) {
            $keywordString = implode('-', array_map(fn($k) => Str::slug($k), $keywords));
            $filename = $filename . '-' . $keywordString;
        }

        // Ensure reasonable length
        if (strlen($filename) > 60) {
            $filename = substr($filename, 0, 60);
            $filename = rtrim($filename, '-');
        }

        // Ensure minimum length
        if (strlen($filename) < 10) {
            $filename = $filename . '-image';
        }

        return $filename;
    }

    /**
     * Optimize existing image filename for SEO
     */
    public function optimizeExistingFilename(string $currentPath, ?string $description = null, array $keywords = []): array
    {
        $pathInfo = pathinfo($currentPath);
        $directory = $pathInfo['dirname'];
        $extension = $pathInfo['extension'];
        $currentFilename = $pathInfo['filename'];
        
        // Generate new SEO-friendly filename
        $newFilename = $this->generateSeoFilename($currentPath, $description, $keywords);
        $newPath = $directory . '/' . $newFilename . '.' . $extension;
        
        // Check if filename actually changed
        if ($currentFilename === $newFilename) {
            return [
                'changed' => false,
                'current_path' => $currentPath,
                'new_path' => $currentPath,
                'filename_score' => $this->analyzeFilename($currentPath)['score'],
            ];
        }
        
        return [
            'changed' => true,
            'current_path' => $currentPath,
            'new_path' => $newPath,
            'old_filename' => $currentFilename,
            'new_filename' => $newFilename,
            'old_score' => $this->analyzeFilename($currentPath)['score'],
            'new_score' => $this->analyzeFilename($newPath)['score'],
        ];
    }

    /**
     * Generate alt text suggestions
     */
    public function generateAltTextSuggestions(string $imagePath, ?string $context = null): array
    {
        $suggestions = [];
        $filename = pathinfo($imagePath, PATHINFO_FILENAME);
        
        // Basic suggestion from filename
        $basicSuggestion = str_replace(['-', '_'], ' ', $filename);
        $basicSuggestion = ucfirst(trim($basicSuggestion));
        
        if (strlen($basicSuggestion) > 10) {
            $suggestions[] = $basicSuggestion;
        }

        // Context-based suggestions
        if ($context) {
            $contextWords = explode(' ', $context);
            $relevantWords = array_slice($contextWords, 0, 8); // First 8 words
            $contextSuggestion = implode(' ', $relevantWords);
            
            if (strlen($contextSuggestion) >= 10 && strlen($contextSuggestion) <= 125) {
                $suggestions[] = $contextSuggestion;
            }
        }

        // Template suggestions based on common patterns
        $templates = [
            'A detailed view of ' . str_replace(['-', '_'], ' ', $filename),
            'Professional image showing ' . str_replace(['-', '_'], ' ', $filename),
            str_replace(['-', '_'], ' ', $filename) . ' in high quality',
        ];

        foreach ($templates as $template) {
            if (strlen($template) >= 10 && strlen($template) <= 125) {
                $suggestions[] = $template;
            }
        }

        return array_unique($suggestions);
    }

    /**
     * Bulk analyze images in a directory
     */
    public function bulkAnalyzeImages(string $directory): array
    {
        $results = [];
        $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        
        $files = Storage::files($directory);
        
        foreach ($files as $file) {
            $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
            
            if (in_array($extension, $imageExtensions)) {
                $results[] = $this->analyzeImageSeo($file);
            }
        }

        return $results;
    }

    /**
     * Bulk optimize alt text for content models
     */
    public function bulkOptimizeContentModels(string $modelType, array $ids = []): array
    {
        $results = [];
        
        switch ($modelType) {
            case 'portfolio':
                $query = \App\Models\PortfolioItem::query();
                break;
            case 'insight':
                $query = \App\Models\Insight::query();
                break;
            case 'service':
                $query = \App\Models\Service::query();
                break;
            case 'team':
                $query = \App\Models\TeamMember::query();
                break;
            case 'media':
                $query = \App\Models\MediaAsset::images();
                break;
            default:
                return ['error' => 'Invalid model type'];
        }
        
        if (!empty($ids)) {
            $query->whereIn('id', $ids);
        }
        
        $models = $query->get();
        
        foreach ($models as $model) {
            $beforeScore = $model->getImageSeoScore();
            $optimized = $model->autoGenerateAltText();
            $afterScore = $model->getImageSeoScore();
            
            $results[] = [
                'id' => $model->id,
                'title' => $model->title ?? $model->name ?? 'Untitled',
                'optimized' => $optimized,
                'before_score' => $beforeScore,
                'after_score' => $afterScore,
                'improvement' => $afterScore - $beforeScore,
            ];
        }
        
        return $results;
    }

    /**
     * Generate bulk alt text suggestions for multiple images
     */
    public function bulkGenerateAltText(array $imagePaths, ?string $context = null): array
    {
        $results = [];
        
        foreach ($imagePaths as $path) {
            $suggestions = $this->generateAltTextSuggestions($path, $context);
            $results[$path] = $suggestions;
        }
        
        return $results;
    }

    /**
     * Bulk optimize filenames in a directory
     */
    public function bulkOptimizeFilenames(string $directory, array $options = []): array
    {
        $results = [];
        $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        
        $files = Storage::files($directory);
        
        foreach ($files as $file) {
            $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
            
            if (in_array($extension, $imageExtensions)) {
                $optimization = $this->optimizeExistingFilename(
                    $file,
                    $options['description'] ?? null,
                    $options['keywords'] ?? []
                );
                
                if ($optimization['changed']) {
                    // Only include files that would actually change
                    $results[] = $optimization;
                }
            }
        }
        
        return $results;
    }

    /**
     * Apply bulk filename optimizations
     */
    public function applyBulkFilenameOptimizations(array $optimizations): array
    {
        $results = [];
        
        foreach ($optimizations as $optimization) {
            try {
                if (Storage::exists($optimization['current_path'])) {
                    $success = Storage::move(
                        $optimization['current_path'],
                        $optimization['new_path']
                    );
                    
                    $results[] = [
                        'path' => $optimization['current_path'],
                        'new_path' => $optimization['new_path'],
                        'success' => $success,
                        'error' => $success ? null : 'Failed to move file',
                    ];
                } else {
                    $results[] = [
                        'path' => $optimization['current_path'],
                        'success' => false,
                        'error' => 'File not found',
                    ];
                }
            } catch (\Exception $e) {
                $results[] = [
                    'path' => $optimization['current_path'],
                    'success' => false,
                    'error' => $e->getMessage(),
                ];
            }
        }
        
        return $results;
    }
}