<?php

namespace App\Traits;

use App\Services\WebCoreVitalsService;

trait HasWebCoreVitals
{
    /**
     * Get Web Core Vitals analysis for this model's page
     */
    public function getWebCoreVitalsAnalysis(): array
    {
        $webCoreVitalsService = app(WebCoreVitalsService::class);
        
        // Get the URL for this model
        $url = $this->getModelUrl();
        
        // Get content-specific options
        $options = $this->getWebCoreVitalsOptions();
        
        return $webCoreVitalsService->analyzeWebCoreVitals($url, $options);
    }

    /**
     * Get Web Core Vitals score for this model
     */
    public function getWebCoreVitalsScore(): int
    {
        $analysis = $this->getWebCoreVitalsAnalysis();
        return $analysis['overall_score'];
    }

    /**
     * Get Web Core Vitals recommendations for this model
     */
    public function getWebCoreVitalsRecommendations(): array
    {
        $analysis = $this->getWebCoreVitalsAnalysis();
        return $analysis['recommendations'];
    }

    /**
     * Get LCP (Largest Contentful Paint) analysis
     */
    public function getLCPAnalysis(): array
    {
        $analysis = $this->getWebCoreVitalsAnalysis();
        return $analysis['lcp'];
    }

    /**
     * Get FID (First Input Delay) analysis
     */
    public function getFIDAnalysis(): array
    {
        $analysis = $this->getWebCoreVitalsAnalysis();
        return $analysis['fid'];
    }

    /**
     * Get CLS (Cumulative Layout Shift) analysis
     */
    public function getCLSAnalysis(): array
    {
        $analysis = $this->getWebCoreVitalsAnalysis();
        return $analysis['cls'];
    }

    /**
     * Check if Web Core Vitals are optimized
     */
    public function hasOptimizedWebCoreVitals(): bool
    {
        $score = $this->getWebCoreVitalsScore();
        return $score >= 80; // 80+ is considered good
    }

    /**
     * Get Web Core Vitals issues that need attention
     */
    public function getWebCoreVitalsIssues(): array
    {
        $analysis = $this->getWebCoreVitalsAnalysis();
        $issues = [];

        // Collect issues from all metrics
        foreach (['lcp', 'fid', 'cls'] as $metric) {
            foreach ($analysis[$metric]['issues'] as $issue) {
                $issues[] = [
                    'metric' => strtoupper($metric),
                    'issue' => $issue,
                    'score' => $analysis[$metric]['score'],
                ];
            }
        }

        return $issues;
    }

    /**
     * Get Web Core Vitals optimization suggestions
     */
    public function getWebCoreVitalsOptimizations(): array
    {
        $analysis = $this->getWebCoreVitalsAnalysis();
        return $analysis['optimizations'];
    }

    /**
     * Get content-specific Web Core Vitals recommendations
     */
    public function getContentSpecificRecommendations(): array
    {
        $webCoreVitalsService = app(WebCoreVitalsService::class);
        $contentType = $this->getContentType();
        
        return $webCoreVitalsService->getContentTypeRecommendations($contentType);
    }

    /**
     * Get the URL for this model (should be overridden in models)
     */
    protected function getModelUrl(): ?string
    {
        // Try to generate URL based on common patterns
        if (method_exists($this, 'getRouteKeyName') && isset($this->attributes[$this->getRouteKeyName()])) {
            $routeKey = $this->attributes[$this->getRouteKeyName()];
            
            // Try common route patterns
            $contentType = $this->getContentType();
            $routes = [
                'portfolio' => 'portfolio.show',
                'insight' => 'blog.show',
                'service' => 'services.show',
                'page' => 'pages.show',
            ];

            if (isset($routes[$contentType])) {
                try {
                    return route($routes[$contentType], $routeKey);
                } catch (\Exception $e) {
                    // Route doesn't exist, return null
                }
            }
        }

        return null;
    }

    /**
     * Get content type for this model
     */
    protected function getContentType(): string
    {
        $className = class_basename($this);
        
        return match($className) {
            'PortfolioItem' => 'portfolio',
            'Insight' => 'insight',
            'Service' => 'service',
            'Page' => 'page',
            default => strtolower($className),
        };
    }

    /**
     * Get Web Core Vitals analysis options for this model
     */
    protected function getWebCoreVitalsOptions(): array
    {
        $options = [
            'content_type' => $this->getContentType(),
            'has_images' => $this->hasImages(),
            'has_animations' => $this->hasAnimations(),
            'has_dynamic_content' => $this->hasDynamicContent(),
        ];

        // Add model-specific options
        if (isset($this->attributes['featured_image'])) {
            $options['featured_image'] = $this->attributes['featured_image'];
        }

        if (isset($this->attributes['gallery'])) {
            $options['gallery'] = $this->attributes['gallery'];
        }

        return $options;
    }

    /**
     * Check if model has images
     */
    protected function hasImages(): bool
    {
        $imageFields = ['image', 'featured_image', 'thumbnail', 'gallery'];
        
        foreach ($imageFields as $field) {
            if (isset($this->attributes[$field]) && !empty($this->attributes[$field])) {
                return true;
            }
        }

        // Check content for images
        if (isset($this->attributes['content'])) {
            $content = is_array($this->attributes['content']) 
                ? json_encode($this->attributes['content']) 
                : $this->attributes['content'];
                
            return strpos($content, '<img') !== false || strpos($content, 'image') !== false;
        }

        return false;
    }

    /**
     * Check if model has animations
     */
    protected function hasAnimations(): bool
    {
        // Check content for animation-related keywords
        if (isset($this->attributes['content'])) {
            $content = is_array($this->attributes['content']) 
                ? json_encode($this->attributes['content']) 
                : $this->attributes['content'];
                
            $animationKeywords = ['animate', 'transition', 'gsap', 'motion'];
            foreach ($animationKeywords as $keyword) {
                if (stripos($content, $keyword) !== false) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Check if model has dynamic content
     */
    protected function hasDynamicContent(): bool
    {
        // Check if content is structured (JSON) which usually indicates dynamic content
        if (isset($this->attributes['content']) && is_array($this->attributes['content'])) {
            return true;
        }

        // Check for dynamic content indicators
        if (isset($this->attributes['content'])) {
            $content = $this->attributes['content'];
            $dynamicKeywords = ['loading', 'fetch', 'api', 'dynamic'];
            
            foreach ($dynamicKeywords as $keyword) {
                if (stripos($content, $keyword) !== false) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Get Web Core Vitals performance grade
     */
    public function getWebCoreVitalsGrade(): string
    {
        $score = $this->getWebCoreVitalsScore();
        
        if ($score >= 90) return 'A';
        if ($score >= 80) return 'B';
        if ($score >= 70) return 'C';
        if ($score >= 60) return 'D';
        return 'F';
    }

    /**
     * Get Web Core Vitals summary
     */
    public function getWebCoreVitalsSummary(): array
    {
        $analysis = $this->getWebCoreVitalsAnalysis();
        
        return [
            'overall_score' => $analysis['overall_score'],
            'grade' => $this->getWebCoreVitalsGrade(),
            'lcp_score' => $analysis['lcp']['score'],
            'fid_score' => $analysis['fid']['score'],
            'cls_score' => $analysis['cls']['score'],
            'total_issues' => count($this->getWebCoreVitalsIssues()),
            'needs_optimization' => !$this->hasOptimizedWebCoreVitals(),
            'url' => $this->getModelUrl(),
        ];
    }

    /**
     * Get Web Core Vitals metrics status
     */
    public function getWebCoreVitalsStatus(): array
    {
        $analysis = $this->getWebCoreVitalsAnalysis();
        
        return [
            'lcp' => [
                'score' => $analysis['lcp']['score'],
                'status' => $analysis['lcp']['score'] >= 80 ? 'good' : ($analysis['lcp']['score'] >= 60 ? 'needs-improvement' : 'poor'),
                'issues_count' => count($analysis['lcp']['issues']),
            ],
            'fid' => [
                'score' => $analysis['fid']['score'],
                'status' => $analysis['fid']['score'] >= 80 ? 'good' : ($analysis['fid']['score'] >= 60 ? 'needs-improvement' : 'poor'),
                'issues_count' => count($analysis['fid']['issues']),
            ],
            'cls' => [
                'score' => $analysis['cls']['score'],
                'status' => $analysis['cls']['score'] >= 80 ? 'good' : ($analysis['cls']['score'] >= 60 ? 'needs-improvement' : 'poor'),
                'issues_count' => count($analysis['cls']['issues']),
            ],
        ];
    }
}