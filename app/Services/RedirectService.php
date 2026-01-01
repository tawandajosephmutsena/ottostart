<?php

namespace App\Services;

use App\Models\Redirect;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class RedirectService
{
    private const CACHE_KEY = 'redirects_map';
    private const CACHE_DURATION = 3600; // 1 hour

    /**
     * Find redirect for a given URL
     */
    public function findRedirect(string $url): ?Redirect
    {
        $redirectsMap = $this->getRedirectsMap();
        
        // Normalize URL for lookup
        $normalizedUrl = $this->normalizeUrl($url);
        
        // Check exact match first
        if (isset($redirectsMap[$normalizedUrl])) {
            $redirect = Redirect::find($redirectsMap[$normalizedUrl]);
            if ($redirect && $redirect->is_active) {
                return $redirect;
            }
        }

        // Check for pattern matches (wildcards, etc.)
        return $this->findPatternRedirect($normalizedUrl);
    }

    /**
     * Get cached redirects map for performance
     */
    private function getRedirectsMap(): array
    {
        return Cache::remember(self::CACHE_KEY, self::CACHE_DURATION, function () {
            return Redirect::active()
                ->pluck('id', 'from_url')
                ->toArray();
        });
    }

    /**
     * Find redirect using pattern matching
     */
    private function findPatternRedirect(string $url): ?Redirect
    {
        // Get all active redirects with wildcards
        $patternRedirects = Redirect::active()
            ->where('from_url', 'LIKE', '%*%')
            ->get();

        foreach ($patternRedirects as $redirect) {
            if ($this->matchesPattern($url, $redirect->from_url)) {
                return $redirect;
            }
        }

        return null;
    }

    /**
     * Check if URL matches a pattern with wildcards
     */
    private function matchesPattern(string $url, string $pattern): bool
    {
        // Convert wildcard pattern to regex
        $regex = str_replace(['*', '/'], ['.+', '\/'], $pattern);
        $regex = '/^' . $regex . '$/i';
        
        return preg_match($regex, $url);
    }

    /**
     * Process redirect and record hit
     */
    public function processRedirect(Redirect $redirect, Request $request): string
    {
        // Record the hit
        $redirect->recordHit();
        
        // Process dynamic redirects (with placeholders)
        $toUrl = $this->processDynamicRedirect($redirect, $request);
        
        return $toUrl;
    }

    /**
     * Process dynamic redirects with placeholders
     */
    private function processDynamicRedirect(Redirect $redirect, Request $request): string
    {
        $toUrl = $redirect->to_url;
        
        // Replace common placeholders
        $replacements = [
            '{query}' => $request->getQueryString() ? '?' . $request->getQueryString() : '',
            '{path}' => $request->path(),
            '{host}' => $request->getHost(),
            '{scheme}' => $request->getScheme(),
        ];

        foreach ($replacements as $placeholder => $value) {
            $toUrl = str_replace($placeholder, $value, $toUrl);
        }

        return $toUrl;
    }

    /**
     * Create a new redirect
     */
    public function createRedirect(array $data): Redirect
    {
        // Validate URLs
        $errors = Redirect::validateUrls($data['from_url'], $data['to_url']);
        if (!empty($errors)) {
            throw new \InvalidArgumentException(implode(', ', $errors));
        }

        $redirect = Redirect::create([
            'from_url' => $this->normalizeUrl($data['from_url']),
            'to_url' => $data['to_url'],
            'status_code' => $data['status_code'] ?? 301,
            'is_active' => $data['is_active'] ?? true,
            'notes' => $data['notes'] ?? null,
        ]);

        // Clear cache
        $this->clearCache();

        return $redirect;
    }

    /**
     * Update an existing redirect
     */
    public function updateRedirect(Redirect $redirect, array $data): Redirect
    {
        // Validate URLs if they're being changed
        if (isset($data['from_url']) || isset($data['to_url'])) {
            $fromUrl = $data['from_url'] ?? $redirect->from_url;
            $toUrl = $data['to_url'] ?? $redirect->to_url;
            
            $errors = Redirect::validateUrls($fromUrl, $toUrl);
            if (!empty($errors)) {
                throw new \InvalidArgumentException(implode(', ', $errors));
            }
        }

        $redirect->update($data);

        // Clear cache
        $this->clearCache();

        return $redirect;
    }

    /**
     * Delete a redirect
     */
    public function deleteRedirect(Redirect $redirect): bool
    {
        $result = $redirect->delete();
        
        // Clear cache
        $this->clearCache();

        return $result;
    }

    /**
     * Bulk import redirects from CSV
     */
    public function importRedirects(array $redirectsData): array
    {
        $results = [
            'success' => 0,
            'errors' => [],
        ];

        foreach ($redirectsData as $index => $data) {
            try {
                $this->createRedirect($data);
                $results['success']++;
            } catch (\Exception $e) {
                $results['errors'][] = "Row {$index}: " . $e->getMessage();
            }
        }

        return $results;
    }

    /**
     * Get redirect statistics
     */
    public function getRedirectStats(): array
    {
        return [
            'total_redirects' => Redirect::count(),
            'active_redirects' => Redirect::active()->count(),
            'inactive_redirects' => Redirect::where('is_active', false)->count(),
            'total_hits' => Redirect::sum('hit_count'),
            'most_used' => Redirect::active()
                ->orderBy('hit_count', 'desc')
                ->limit(10)
                ->get(['from_url', 'to_url', 'hit_count']),
            'recent_hits' => Redirect::active()
                ->whereNotNull('last_hit_at')
                ->orderBy('last_hit_at', 'desc')
                ->limit(10)
                ->get(['from_url', 'to_url', 'last_hit_at']),
        ];
    }

    /**
     * Clear redirects cache
     */
    public function clearCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    /**
     * Normalize URL for consistent matching
     */
    private function normalizeUrl(string $url): string
    {
        // Remove query parameters and fragments for matching
        $parsed = parse_url($url);
        $path = $parsed['path'] ?? '/';
        
        // Remove trailing slash except for root
        if ($path !== '/' && str_ends_with($path, '/')) {
            $path = rtrim($path, '/');
        }
        
        return $path;
    }

    /**
     * Check for redirect chains and loops
     */
    public function validateRedirectChain(string $fromUrl, string $toUrl, int $maxDepth = 5): array
    {
        $chain = [$fromUrl];
        $currentUrl = $toUrl;
        $depth = 0;

        while ($depth < $maxDepth) {
            $redirect = $this->findRedirect($currentUrl);
            
            if (!$redirect) {
                break; // No more redirects in chain
            }

            if (in_array($redirect->to_url, $chain)) {
                return [
                    'valid' => false,
                    'error' => 'Redirect loop detected',
                    'chain' => $chain,
                ];
            }

            $chain[] = $redirect->to_url;
            $currentUrl = $redirect->to_url;
            $depth++;
        }

        if ($depth >= $maxDepth) {
            return [
                'valid' => false,
                'error' => 'Redirect chain too long (max ' . $maxDepth . ')',
                'chain' => $chain,
            ];
        }

        return [
            'valid' => true,
            'chain' => $chain,
            'depth' => $depth,
        ];
    }
}