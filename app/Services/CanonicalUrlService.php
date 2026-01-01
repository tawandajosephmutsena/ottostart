<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

class CanonicalUrlService
{
    /**
     * Generate canonical URL for the current request
     */
    public function generateCanonicalUrl(Request $request, ?string $customUrl = null): string
    {
        if ($customUrl) {
            return $this->normalizeUrl($customUrl);
        }

        // Get the current URL without query parameters
        $url = $request->url();
        
        // Normalize the URL
        return $this->normalizeUrl($url);
    }

    /**
     * Generate canonical URL for a specific route
     */
    public function generateRouteCanonicalUrl(string $routeName, array $parameters = []): string
    {
        $url = route($routeName, $parameters);
        return $this->normalizeUrl($url);
    }

    /**
     * Generate canonical URL for a model
     */
    public function generateModelCanonicalUrl($model): string
    {
        // Determine the route based on model type
        $routeName = $this->getModelRouteName($model);
        
        if (!$routeName) {
            return config('app.url');
        }

        $url = route($routeName, $model->slug ?? $model->id);
        return $this->normalizeUrl($url);
    }

    /**
     * Normalize URL to ensure consistency
     */
    private function normalizeUrl(string $url): string
    {
        // Parse the URL
        $parsed = parse_url($url);
        
        // Rebuild URL with normalized components
        $scheme = $parsed['scheme'] ?? 'https';
        $host = $parsed['host'] ?? '';
        $port = isset($parsed['port']) && !in_array($parsed['port'], [80, 443]) ? ':' . $parsed['port'] : '';
        $path = $parsed['path'] ?? '/';
        
        // Remove trailing slash except for root
        if ($path !== '/' && str_ends_with($path, '/')) {
            $path = rtrim($path, '/');
        }
        
        // Convert to lowercase for consistency
        $host = strtolower($host);
        
        return $scheme . '://' . $host . $port . $path;
    }

    /**
     * Get route name for a model
     */
    private function getModelRouteName($model): ?string
    {
        $modelClass = get_class($model);
        
        $routeMap = [
            'App\Models\Insight' => 'blog.show',
            'App\Models\PortfolioItem' => 'portfolio.show',
            'App\Models\Service' => 'services.show',
            'App\Models\Page' => 'pages.show',
            'App\Models\TeamMember' => 'team.show',
        ];

        return $routeMap[$modelClass] ?? null;
    }

    /**
     * Check if URL needs redirect to canonical version
     */
    public function needsCanonicalRedirect(Request $request): ?string
    {
        $currentUrl = $request->fullUrl();
        $canonicalUrl = $this->generateCanonicalUrl($request);
        
        // Check for common issues that need redirects
        $issues = [
            $this->checkTrailingSlash($currentUrl, $canonicalUrl),
            $this->checkHttpsRedirect($currentUrl, $canonicalUrl),
            $this->checkWwwRedirect($currentUrl, $canonicalUrl),
            $this->checkCaseRedirect($currentUrl, $canonicalUrl),
        ];

        foreach ($issues as $redirectUrl) {
            if ($redirectUrl) {
                return $redirectUrl;
            }
        }

        return null;
    }

    /**
     * Check for trailing slash issues
     */
    private function checkTrailingSlash(string $currentUrl, string $canonicalUrl): ?string
    {
        $current = parse_url($currentUrl);
        $canonical = parse_url($canonicalUrl);
        
        if (($current['path'] ?? '/') !== ($canonical['path'] ?? '/')) {
            return $canonicalUrl;
        }

        return null;
    }

    /**
     * Check for HTTPS redirect
     */
    private function checkHttpsRedirect(string $currentUrl, string $canonicalUrl): ?string
    {
        if (config('app.force_https', env('APP_FORCE_HTTPS', false)) && str_starts_with($currentUrl, 'http://')) {
            return str_replace('http://', 'https://', $currentUrl);
        }

        return null;
    }

    /**
     * Check for www redirect
     */
    private function checkWwwRedirect(string $currentUrl, string $canonicalUrl): ?string
    {
        $forceWww = config('seo.force_www', false);
        $removeWww = config('seo.remove_www', true);
        
        $currentHost = parse_url($currentUrl, PHP_URL_HOST);
        $canonicalHost = parse_url($canonicalUrl, PHP_URL_HOST);
        
        if ($forceWww && !str_starts_with($currentHost, 'www.')) {
            return str_replace($currentHost, 'www.' . $currentHost, $currentUrl);
        }
        
        if ($removeWww && str_starts_with($currentHost, 'www.')) {
            return str_replace('www.' . substr($currentHost, 4), substr($currentHost, 4), $currentUrl);
        }

        return null;
    }

    /**
     * Check for case redirect
     */
    private function checkCaseRedirect(string $currentUrl, string $canonicalUrl): ?string
    {
        $currentPath = parse_url($currentUrl, PHP_URL_PATH);
        $canonicalPath = parse_url($canonicalUrl, PHP_URL_PATH);
        
        if ($currentPath !== $canonicalPath && strtolower($currentPath) === strtolower($canonicalPath)) {
            return str_replace($currentPath, $canonicalPath, $currentUrl);
        }

        return null;
    }

    /**
     * Generate hreflang URLs for internationalization
     */
    public function generateHreflangUrls(Request $request, array $locales = []): array
    {
        $hreflangUrls = [];
        $baseUrl = $this->generateCanonicalUrl($request);
        
        foreach ($locales as $locale => $url) {
            $hreflangUrls[] = [
                'hreflang' => $locale,
                'url' => $this->normalizeUrl($url),
            ];
        }
        
        // Add x-default if not present
        if (!isset($locales['x-default'])) {
            $hreflangUrls[] = [
                'hreflang' => 'x-default',
                'url' => $baseUrl,
            ];
        }

        return $hreflangUrls;
    }

    /**
     * Get alternate URLs for pagination
     */
    public function getPaginationUrls(Request $request, int $currentPage, int $lastPage): array
    {
        $urls = [];
        $baseUrl = $request->url();
        
        // Previous page
        if ($currentPage > 1) {
            $prevPage = $currentPage - 1;
            $urls['prev'] = $prevPage === 1 
                ? $baseUrl 
                : $baseUrl . '?page=' . $prevPage;
        }
        
        // Next page
        if ($currentPage < $lastPage) {
            $urls['next'] = $baseUrl . '?page=' . ($currentPage + 1);
        }
        
        // First page (canonical)
        $urls['canonical'] = $baseUrl;
        
        return $urls;
    }
}