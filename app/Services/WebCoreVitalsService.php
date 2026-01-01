<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class WebCoreVitalsService
{
    /**
     * Analyze Web Core Vitals for a given URL or content
     */
    public function analyzeWebCoreVitals(string $url = null, array $options = []): array
    {
        $analysis = [
            'url' => $url,
            'timestamp' => now()->toISOString(),
            'lcp' => $this->analyzeLCP($options),
            'fid' => $this->analyzeFID($options),
            'cls' => $this->analyzeCLS($options),
            'overall_score' => 0,
            'recommendations' => [],
            'optimizations' => [],
        ];

        // Calculate overall score
        $analysis['overall_score'] = $this->calculateOverallScore($analysis);
        
        // Generate recommendations
        $analysis['recommendations'] = $this->generateRecommendations($analysis);
        
        // Generate optimization suggestions
        $analysis['optimizations'] = $this->generateOptimizations($analysis);

        return $analysis;
    }

    /**
     * Analyze Largest Contentful Paint (LCP)
     */
    private function analyzeLCP(array $options = []): array
    {
        $analysis = [
            'metric' => 'LCP',
            'description' => 'Largest Contentful Paint measures loading performance',
            'target' => '2.5s or less',
            'score' => 0,
            'issues' => [],
            'optimizations' => [],
        ];

        // Check image optimization
        $imageIssues = $this->checkImageOptimization();
        if (!empty($imageIssues)) {
            $analysis['issues'][] = 'Large unoptimized images detected';
            $analysis['optimizations'][] = 'Optimize images with WebP format and proper sizing';
            $analysis['score'] -= 20;
        }

        // Check font loading
        $fontIssues = $this->checkFontLoading();
        if (!empty($fontIssues)) {
            $analysis['issues'][] = 'Fonts not optimally loaded';
            $analysis['optimizations'][] = 'Use font-display: swap and preload critical fonts';
            $analysis['score'] -= 15;
        }

        // Check critical CSS
        $cssIssues = $this->checkCriticalCSS();
        if (!empty($cssIssues)) {
            $analysis['issues'][] = 'Critical CSS not inlined';
            $analysis['optimizations'][] = 'Inline critical CSS and defer non-critical styles';
            $analysis['score'] -= 15;
        }

        // Check server response time
        $serverIssues = $this->checkServerResponseTime();
        if (!empty($serverIssues)) {
            $analysis['issues'][] = 'Slow server response time';
            $analysis['optimizations'][] = 'Optimize server response time with caching and CDN';
            $analysis['score'] -= 25;
        }

        // Check resource loading
        $resourceIssues = $this->checkResourceLoading();
        if (!empty($resourceIssues)) {
            $analysis['issues'][] = 'Render-blocking resources detected';
            $analysis['optimizations'][] = 'Eliminate render-blocking resources';
            $analysis['score'] -= 15;
        }

        // Base score is 100, subtract penalties
        $analysis['score'] = max(0, 100 + $analysis['score']);

        return $analysis;
    }

    /**
     * Analyze First Input Delay (FID)
     */
    private function analyzeFID(array $options = []): array
    {
        $analysis = [
            'metric' => 'FID',
            'description' => 'First Input Delay measures interactivity',
            'target' => '100ms or less',
            'score' => 0,
            'issues' => [],
            'optimizations' => [],
        ];

        // Check JavaScript execution time
        $jsIssues = $this->checkJavaScriptExecution();
        if (!empty($jsIssues)) {
            $analysis['issues'][] = 'Long JavaScript execution times';
            $analysis['optimizations'][] = 'Split long tasks and use code splitting';
            $analysis['score'] -= 30;
        }

        // Check third-party scripts
        $thirdPartyIssues = $this->checkThirdPartyScripts();
        if (!empty($thirdPartyIssues)) {
            $analysis['issues'][] = 'Heavy third-party scripts';
            $analysis['optimizations'][] = 'Defer non-critical third-party scripts';
            $analysis['score'] -= 20;
        }

        // Check main thread blocking
        $mainThreadIssues = $this->checkMainThreadBlocking();
        if (!empty($mainThreadIssues)) {
            $analysis['issues'][] = 'Main thread blocking detected';
            $analysis['optimizations'][] = 'Use web workers for heavy computations';
            $analysis['score'] -= 25;
        }

        // Check event handler optimization
        $eventIssues = $this->checkEventHandlers();
        if (!empty($eventIssues)) {
            $analysis['issues'][] = 'Inefficient event handlers';
            $analysis['optimizations'][] = 'Optimize event handlers and use passive listeners';
            $analysis['score'] -= 15;
        }

        // Base score is 100, subtract penalties
        $analysis['score'] = max(0, 100 + $analysis['score']);

        return $analysis;
    }

    /**
     * Analyze Cumulative Layout Shift (CLS)
     */
    private function analyzeCLS(array $options = []): array
    {
        $analysis = [
            'metric' => 'CLS',
            'description' => 'Cumulative Layout Shift measures visual stability',
            'target' => '0.1 or less',
            'score' => 0,
            'issues' => [],
            'optimizations' => [],
        ];

        // Check image dimensions
        $imageDimensionIssues = $this->checkImageDimensions();
        if (!empty($imageDimensionIssues)) {
            $analysis['issues'][] = 'Images without explicit dimensions';
            $analysis['optimizations'][] = 'Set explicit width and height for all images';
            $analysis['score'] -= 25;
        }

        // Check font loading impact
        $fontLayoutIssues = $this->checkFontLayoutShift();
        if (!empty($fontLayoutIssues)) {
            $analysis['issues'][] = 'Font loading causes layout shift';
            $analysis['optimizations'][] = 'Use font-display: swap and size-adjust';
            $analysis['score'] -= 20;
        }

        // Check dynamic content insertion
        $dynamicContentIssues = $this->checkDynamicContent();
        if (!empty($dynamicContentIssues)) {
            $analysis['issues'][] = 'Dynamic content insertion without space reservation';
            $analysis['optimizations'][] = 'Reserve space for dynamic content';
            $analysis['score'] -= 20;
        }

        // Check ad and embed placement
        $adIssues = $this->checkAdPlacement();
        if (!empty($adIssues)) {
            $analysis['issues'][] = 'Ads or embeds cause layout shift';
            $analysis['optimizations'][] = 'Reserve space for ads and embeds';
            $analysis['score'] -= 15;
        }

        // Check animation performance
        $animationIssues = $this->checkAnimationLayoutShift();
        if (!empty($animationIssues)) {
            $analysis['issues'][] = 'Animations cause layout shift';
            $analysis['optimizations'][] = 'Use transform and opacity for animations';
            $analysis['score'] -= 10;
        }

        // Base score is 100, subtract penalties
        $analysis['score'] = max(0, 100 + $analysis['score']);

        return $analysis;
    }

    /**
     * Calculate overall Web Core Vitals score
     */
    private function calculateOverallScore(array $analysis): int
    {
        $lcpScore = $analysis['lcp']['score'];
        $fidScore = $analysis['fid']['score'];
        $clsScore = $analysis['cls']['score'];

        // Weighted average: LCP 40%, FID 30%, CLS 30%
        return round(($lcpScore * 0.4) + ($fidScore * 0.3) + ($clsScore * 0.3));
    }

    /**
     * Generate overall recommendations
     */
    private function generateRecommendations(array $analysis): array
    {
        $recommendations = [];

        // Collect all issues and optimizations
        foreach (['lcp', 'fid', 'cls'] as $metric) {
            foreach ($analysis[$metric]['issues'] as $issue) {
                $recommendations[] = [
                    'metric' => strtoupper($metric),
                    'type' => 'issue',
                    'description' => $issue,
                    'priority' => $this->getIssuePriority($issue),
                ];
            }
        }

        // Sort by priority
        usort($recommendations, function ($a, $b) {
            $priorities = ['high' => 3, 'medium' => 2, 'low' => 1];
            return $priorities[$b['priority']] <=> $priorities[$a['priority']];
        });

        return $recommendations;
    }

    /**
     * Generate optimization suggestions
     */
    private function generateOptimizations(array $analysis): array
    {
        $optimizations = [];

        foreach (['lcp', 'fid', 'cls'] as $metric) {
            foreach ($analysis[$metric]['optimizations'] as $optimization) {
                $optimizations[] = [
                    'metric' => strtoupper($metric),
                    'optimization' => $optimization,
                    'impact' => $this->getOptimizationImpact($optimization),
                    'difficulty' => $this->getOptimizationDifficulty($optimization),
                ];
            }
        }

        return $optimizations;
    }

    /**
     * Check image optimization issues
     */
    private function checkImageOptimization(): array
    {
        $issues = [];

        // Check for large images in uploads directory
        if (Storage::exists('uploads')) {
            $files = Storage::allFiles('uploads');
            $largeImages = 0;

            foreach ($files as $file) {
                $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
                if (in_array($extension, ['jpg', 'jpeg', 'png', 'gif'])) {
                    $size = Storage::size($file);
                    if ($size > 500 * 1024) { // 500KB
                        $largeImages++;
                    }
                }
            }

            if ($largeImages > 0) {
                $issues[] = "Found {$largeImages} large images over 500KB";
            }
        }

        return $issues;
    }

    /**
     * Check font loading optimization
     */
    private function checkFontLoading(): array
    {
        $issues = [];

        // Check if font-display is used in CSS
        $cssFiles = [
            'public/build/assets/app.css',
            'resources/css/app.css',
        ];

        foreach ($cssFiles as $cssFile) {
            if (file_exists($cssFile)) {
                $content = file_get_contents($cssFile);
                if (strpos($content, 'font-display') === false) {
                    $issues[] = 'font-display property not found in CSS';
                    break;
                }
            }
        }

        return $issues;
    }

    /**
     * Check critical CSS implementation
     */
    private function checkCriticalCSS(): array
    {
        $issues = [];

        // Check if critical CSS is inlined
        $layoutFiles = [
            'resources/views/layouts/app.blade.php',
            'resources/js/layouts/MainLayout.tsx',
        ];

        $hasCriticalCSS = false;
        foreach ($layoutFiles as $file) {
            if (file_exists($file)) {
                $content = file_get_contents($file);
                if (strpos($content, 'critical') !== false || strpos($content, 'inline') !== false) {
                    $hasCriticalCSS = true;
                    break;
                }
            }
        }

        if (!$hasCriticalCSS) {
            $issues[] = 'Critical CSS not detected';
        }

        return $issues;
    }

    /**
     * Check server response time
     */
    private function checkServerResponseTime(): array
    {
        $issues = [];

        // Check if caching is properly configured
        $cacheConfig = config('cache.default');
        if ($cacheConfig === 'file' || $cacheConfig === 'array') {
            $issues[] = 'Using slow cache driver: ' . $cacheConfig;
        }

        return $issues;
    }

    /**
     * Check resource loading optimization
     */
    private function checkResourceLoading(): array
    {
        $issues = [];

        // Check Vite configuration for optimization
        if (file_exists('vite.config.ts')) {
            $content = file_get_contents('vite.config.ts');
            if (strpos($content, 'splitVendorChunk') === false) {
                $issues[] = 'Vendor chunk splitting not configured';
            }
        }

        return $issues;
    }

    /**
     * Check JavaScript execution optimization
     */
    private function checkJavaScriptExecution(): array
    {
        $issues = [];

        // Check for large JavaScript bundles
        $buildDir = 'public/build/assets';
        if (is_dir($buildDir)) {
            $files = glob($buildDir . '/*.js');
            foreach ($files as $file) {
                $size = filesize($file);
                if ($size > 250 * 1024) { // 250KB
                    $issues[] = 'Large JavaScript bundle: ' . basename($file);
                }
            }
        }

        return $issues;
    }

    /**
     * Check third-party scripts
     */
    private function checkThirdPartyScripts(): array
    {
        $issues = [];

        // Check layout files for third-party scripts
        $layoutFiles = [
            'resources/views/layouts/app.blade.php',
            'resources/js/layouts/MainLayout.tsx',
        ];

        foreach ($layoutFiles as $file) {
            if (file_exists($file)) {
                $content = file_get_contents($file);
                // Check for common third-party domains
                $thirdPartyDomains = ['google-analytics', 'googletagmanager', 'facebook', 'twitter'];
                foreach ($thirdPartyDomains as $domain) {
                    if (strpos($content, $domain) !== false) {
                        $issues[] = 'Third-party script detected: ' . $domain;
                    }
                }
            }
        }

        return $issues;
    }

    /**
     * Check main thread blocking
     */
    private function checkMainThreadBlocking(): array
    {
        $issues = [];

        // Check for synchronous operations in JavaScript
        $jsFiles = glob('resources/js/**/*.{ts,tsx,js,jsx}', GLOB_BRACE);
        foreach ($jsFiles as $file) {
            if (file_exists($file)) {
                $content = file_get_contents($file);
                if (strpos($content, 'while(') !== false || strpos($content, 'for(') !== false) {
                    // This is a simplified check - in reality, you'd want more sophisticated analysis
                    $issues[] = 'Potential blocking loops detected in ' . basename($file);
                    break;
                }
            }
        }

        return $issues;
    }

    /**
     * Check event handler optimization
     */
    private function checkEventHandlers(): array
    {
        $issues = [];

        // Check for passive event listeners
        $jsFiles = glob('resources/js/**/*.{ts,tsx,js,jsx}', GLOB_BRACE);
        foreach ($jsFiles as $file) {
            if (file_exists($file)) {
                $content = file_get_contents($file);
                if (strpos($content, 'addEventListener') !== false && strpos($content, 'passive') === false) {
                    $issues[] = 'Event listeners without passive option detected';
                    break;
                }
            }
        }

        return $issues;
    }

    /**
     * Check image dimensions
     */
    private function checkImageDimensions(): array
    {
        $issues = [];

        // Check React components for images without dimensions
        $componentFiles = glob('resources/js/components/**/*.{tsx,jsx}', GLOB_BRACE);
        foreach ($componentFiles as $file) {
            if (file_exists($file)) {
                $content = file_get_contents($file);
                if (strpos($content, '<img') !== false) {
                    // Check if images have width and height attributes
                    preg_match_all('/<img[^>]*>/i', $content, $matches);
                    foreach ($matches[0] as $img) {
                        if (strpos($img, 'width') === false || strpos($img, 'height') === false) {
                            $issues[] = 'Images without dimensions in ' . basename($file);
                            break 2;
                        }
                    }
                }
            }
        }

        return $issues;
    }

    /**
     * Check font layout shift
     */
    private function checkFontLayoutShift(): array
    {
        $issues = [];

        // Check CSS for font-display and size-adjust
        $cssFiles = glob('resources/css/**/*.css');
        foreach ($cssFiles as $file) {
            if (file_exists($file)) {
                $content = file_get_contents($file);
                if (strpos($content, '@font-face') !== false) {
                    if (strpos($content, 'font-display: swap') === false) {
                        $issues[] = 'Custom fonts without font-display: swap';
                    }
                    if (strpos($content, 'size-adjust') === false) {
                        $issues[] = 'Custom fonts without size-adjust';
                    }
                }
            }
        }

        return $issues;
    }

    /**
     * Check dynamic content insertion
     */
    private function checkDynamicContent(): array
    {
        $issues = [];

        // Check for dynamic content loading without space reservation
        $componentFiles = glob('resources/js/components/**/*.{tsx,jsx}', GLOB_BRACE);
        foreach ($componentFiles as $file) {
            if (file_exists($file)) {
                $content = file_get_contents($file);
                if (strpos($content, 'useState') !== false && strpos($content, 'loading') !== false) {
                    if (strpos($content, 'skeleton') === false && strpos($content, 'placeholder') === false) {
                        $issues[] = 'Dynamic content without loading placeholders in ' . basename($file);
                        break;
                    }
                }
            }
        }

        return $issues;
    }

    /**
     * Check ad placement
     */
    private function checkAdPlacement(): array
    {
        $issues = [];

        // Check for ad-related code without space reservation
        $files = glob('resources/js/**/*.{tsx,jsx,ts,js}', GLOB_BRACE);
        foreach ($files as $file) {
            if (file_exists($file)) {
                $content = file_get_contents($file);
                if (strpos($content, 'adsense') !== false || strpos($content, 'advertisement') !== false) {
                    $issues[] = 'Ad placement detected - ensure space is reserved';
                    break;
                }
            }
        }

        return $issues;
    }

    /**
     * Check animation layout shift
     */
    private function checkAnimationLayoutShift(): array
    {
        $issues = [];

        // Check CSS and JavaScript for animations that might cause layout shift
        $files = array_merge(
            glob('resources/css/**/*.css'),
            glob('resources/js/**/*.{ts,tsx,js,jsx}', GLOB_BRACE)
        );

        foreach ($files as $file) {
            if (file_exists($file)) {
                $content = file_get_contents($file);
                // Check for animations that change layout properties
                $layoutProperties = ['width', 'height', 'top', 'left', 'margin', 'padding'];
                foreach ($layoutProperties as $property) {
                    if (strpos($content, "animate-{$property}") !== false || 
                        strpos($content, "transition: {$property}") !== false) {
                        $issues[] = 'Animation affecting layout properties detected';
                        break 2;
                    }
                }
            }
        }

        return $issues;
    }

    /**
     * Get issue priority
     */
    private function getIssuePriority(string $issue): string
    {
        $highPriorityKeywords = ['large', 'slow', 'blocking', 'shift'];
        $mediumPriorityKeywords = ['font', 'third-party', 'cache'];

        foreach ($highPriorityKeywords as $keyword) {
            if (stripos($issue, $keyword) !== false) {
                return 'high';
            }
        }

        foreach ($mediumPriorityKeywords as $keyword) {
            if (stripos($issue, $keyword) !== false) {
                return 'medium';
            }
        }

        return 'low';
    }

    /**
     * Get optimization impact
     */
    private function getOptimizationImpact(string $optimization): string
    {
        $highImpactKeywords = ['optimize', 'eliminate', 'compress'];
        $mediumImpactKeywords = ['defer', 'preload', 'split'];

        foreach ($highImpactKeywords as $keyword) {
            if (stripos($optimization, $keyword) !== false) {
                return 'high';
            }
        }

        foreach ($mediumImpactKeywords as $keyword) {
            if (stripos($optimization, $keyword) !== false) {
                return 'medium';
            }
        }

        return 'low';
    }

    /**
     * Get optimization difficulty
     */
    private function getOptimizationDifficulty(string $optimization): string
    {
        $hardKeywords = ['web workers', 'critical css', 'server'];
        $mediumKeywords = ['code splitting', 'preload', 'dimensions'];

        foreach ($hardKeywords as $keyword) {
            if (stripos($optimization, $keyword) !== false) {
                return 'hard';
            }
        }

        foreach ($mediumKeywords as $keyword) {
            if (stripos($optimization, $keyword) !== false) {
                return 'medium';
            }
        }

        return 'easy';
    }

    /**
     * Get Web Core Vitals recommendations for a specific content type
     */
    public function getContentTypeRecommendations(string $contentType): array
    {
        $recommendations = [];

        switch ($contentType) {
            case 'portfolio':
                $recommendations = [
                    'Optimize portfolio images with WebP format',
                    'Use lazy loading for portfolio galleries',
                    'Set explicit dimensions for all portfolio images',
                    'Implement skeleton loading for portfolio items',
                ];
                break;

            case 'insight':
                $recommendations = [
                    'Optimize featured images for blog posts',
                    'Use code splitting for blog components',
                    'Implement reading progress indicators',
                    'Defer non-critical blog widgets',
                ];
                break;

            case 'service':
                $recommendations = [
                    'Optimize service page images',
                    'Use progressive loading for service details',
                    'Implement smooth scrolling for service sections',
                    'Preload critical service page resources',
                ];
                break;

            default:
                $recommendations = [
                    'Optimize images with modern formats',
                    'Implement lazy loading',
                    'Use code splitting',
                    'Set explicit dimensions for media',
                ];
        }

        return $recommendations;
    }

    /**
     * Generate Web Core Vitals optimization report
     */
    public function generateOptimizationReport(): array
    {
        $analysis = $this->analyzeWebCoreVitals();
        
        return [
            'summary' => [
                'overall_score' => $analysis['overall_score'],
                'lcp_score' => $analysis['lcp']['score'],
                'fid_score' => $analysis['fid']['score'],
                'cls_score' => $analysis['cls']['score'],
                'total_issues' => count($analysis['recommendations']),
                'high_priority_issues' => count(array_filter($analysis['recommendations'], fn($r) => $r['priority'] === 'high')),
            ],
            'detailed_analysis' => $analysis,
            'action_plan' => $this->generateActionPlan($analysis),
        ];
    }

    /**
     * Generate action plan for Web Core Vitals optimization
     */
    private function generateActionPlan(array $analysis): array
    {
        $actionPlan = [];

        // Group optimizations by difficulty and impact
        $easyHighImpact = [];
        $mediumHighImpact = [];
        $hardHighImpact = [];

        foreach ($analysis['optimizations'] as $optimization) {
            if ($optimization['impact'] === 'high') {
                switch ($optimization['difficulty']) {
                    case 'easy':
                        $easyHighImpact[] = $optimization;
                        break;
                    case 'medium':
                        $mediumHighImpact[] = $optimization;
                        break;
                    case 'hard':
                        $hardHighImpact[] = $optimization;
                        break;
                }
            }
        }

        $actionPlan[] = [
            'phase' => 'Quick Wins',
            'description' => 'Easy optimizations with high impact',
            'optimizations' => $easyHighImpact,
            'estimated_time' => '1-2 days',
        ];

        $actionPlan[] = [
            'phase' => 'Medium Priority',
            'description' => 'Medium difficulty optimizations with high impact',
            'optimizations' => $mediumHighImpact,
            'estimated_time' => '1-2 weeks',
        ];

        $actionPlan[] = [
            'phase' => 'Long Term',
            'description' => 'Complex optimizations requiring significant changes',
            'optimizations' => $hardHighImpact,
            'estimated_time' => '2-4 weeks',
        ];

        return $actionPlan;
    }
}