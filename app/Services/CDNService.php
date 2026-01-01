<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class CDNService
{
    private string $cdnUrl;
    private string $cdnZone;
    private bool $enabled;

    public function __construct()
    {
        $this->cdnUrl = config('cdn.url', '');
        $this->cdnZone = config('cdn.zone', '');
        $this->enabled = config('cdn.enabled', false);
    }

    /**
     * Get CDN URL for an asset
     */
    public function getAssetUrl(string $path): string
    {
        if (!$this->enabled || empty($this->cdnUrl)) {
            return Storage::url($path);
        }

        // Remove leading slash if present
        $path = ltrim($path, '/');
        
        return rtrim($this->cdnUrl, '/') . '/' . $path;
    }

    /**
     * Upload file to CDN
     */
    public function uploadToCDN(string $localPath, string $cdnPath): bool
    {
        if (!$this->enabled) {
            return true; // Skip if CDN is disabled
        }

        try {
            // This is a placeholder for actual CDN upload implementation
            // You would implement specific CDN provider logic here (AWS CloudFront, Cloudflare, etc.)
            
            Log::info('CDN upload simulated', [
                'local_path' => $localPath,
                'cdn_path' => $cdnPath,
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('CDN upload failed', [
                'local_path' => $localPath,
                'cdn_path' => $cdnPath,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Purge CDN cache for specific files
     */
    public function purgeCache(array $paths): bool
    {
        if (!$this->enabled || empty($this->cdnZone)) {
            return true;
        }

        try {
            // Placeholder for CDN cache purging
            // Implementation would depend on CDN provider (Cloudflare, AWS CloudFront, etc.)
            
            Log::info('CDN cache purge simulated', [
                'paths' => $paths,
                'zone' => $this->cdnZone,
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('CDN cache purge failed', [
                'paths' => $paths,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Get optimized image URL with transformations
     */
    public function getOptimizedImageUrl(string $path, array $options = []): string
    {
        $baseUrl = $this->getAssetUrl($path);

        if (!$this->enabled || empty($options)) {
            return $baseUrl;
        }

        // Build query parameters for image transformations
        $params = [];

        if (isset($options['width'])) {
            $params['w'] = $options['width'];
        }

        if (isset($options['height'])) {
            $params['h'] = $options['height'];
        }

        if (isset($options['quality'])) {
            $params['q'] = $options['quality'];
        }

        if (isset($options['format'])) {
            $params['f'] = $options['format'];
        }

        if (isset($options['fit'])) {
            $params['fit'] = $options['fit']; // cover, contain, fill, etc.
        }

        if (!empty($params)) {
            $baseUrl .= '?' . http_build_query($params);
        }

        return $baseUrl;
    }

    /**
     * Generate responsive image URLs
     */
    public function getResponsiveImageUrls(string $path, array $sizes = []): array
    {
        $urls = [];
        
        $defaultSizes = [
            'thumbnail' => ['width' => 300, 'height' => 300],
            'small' => ['width' => 600, 'height' => 400],
            'medium' => ['width' => 1200, 'height' => 800],
            'large' => ['width' => 1920, 'height' => 1280],
        ];

        $sizesToGenerate = !empty($sizes) ? $sizes : $defaultSizes;

        foreach ($sizesToGenerate as $sizeName => $dimensions) {
            $urls[$sizeName] = $this->getOptimizedImageUrl($path, [
                'width' => $dimensions['width'],
                'height' => $dimensions['height'],
                'quality' => 85,
                'fit' => 'cover',
            ]);
        }

        return $urls;
    }

    /**
     * Preload critical assets
     */
    public function preloadAssets(array $assets): array
    {
        $preloadLinks = [];

        foreach ($assets as $asset) {
            $url = $this->getAssetUrl($asset['path']);
            $type = $asset['type'] ?? 'image';
            $as = $asset['as'] ?? $type;

            $preloadLinks[] = [
                'url' => $url,
                'as' => $as,
                'type' => $type,
                'crossorigin' => $asset['crossorigin'] ?? null,
            ];
        }

        return $preloadLinks;
    }

    /**
     * Get cache headers for static assets
     */
    public function getCacheHeaders(string $assetType): array
    {
        $headers = [
            'Cache-Control' => 'public, max-age=31536000', // 1 year
            'Expires' => gmdate('D, d M Y H:i:s', time() + 31536000) . ' GMT',
        ];

        // Specific cache settings for different asset types
        switch ($assetType) {
            case 'image':
                $headers['Cache-Control'] = 'public, max-age=2592000'; // 30 days
                break;
            case 'css':
            case 'js':
                $headers['Cache-Control'] = 'public, max-age=31536000, immutable'; // 1 year, immutable
                break;
            case 'font':
                $headers['Cache-Control'] = 'public, max-age=31536000, immutable';
                $headers['Access-Control-Allow-Origin'] = '*';
                break;
        }

        return $headers;
    }

    /**
     * Check CDN health and performance
     */
    public function checkCDNHealth(): array
    {
        if (!$this->enabled) {
            return [
                'status' => 'disabled',
                'message' => 'CDN is disabled',
            ];
        }

        try {
            $testUrl = $this->cdnUrl . '/health-check';
            $startTime = microtime(true);
            
            $response = Http::timeout(5)->get($testUrl);
            
            $responseTime = (microtime(true) - $startTime) * 1000;

            return [
                'status' => $response->successful() ? 'healthy' : 'error',
                'response_time' => round($responseTime, 2),
                'status_code' => $response->status(),
                'cdn_url' => $this->cdnUrl,
            ];

        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
                'cdn_url' => $this->cdnUrl,
            ];
        }
    }

    /**
     * Get CDN statistics
     */
    public function getCDNStats(): array
    {
        return [
            'enabled' => $this->enabled,
            'cdn_url' => $this->cdnUrl,
            'zone' => $this->cdnZone,
            'health' => $this->checkCDNHealth(),
        ];
    }

    /**
     * Generate WebP URLs if supported
     */
    public function getWebPUrl(string $path): string
    {
        if (!$this->enabled) {
            return $this->getAssetUrl($path);
        }

        // Check if browser supports WebP (this would be done client-side)
        // For server-side, we can generate WebP URLs and let the client decide
        return $this->getOptimizedImageUrl($path, ['format' => 'webp']);
    }

    /**
     * Batch upload multiple files to CDN
     */
    public function batchUpload(array $files): array
    {
        $results = [];

        foreach ($files as $localPath => $cdnPath) {
            $results[$localPath] = $this->uploadToCDN($localPath, $cdnPath);
        }

        $successCount = count(array_filter($results));
        $totalCount = count($results);

        Log::info('CDN batch upload completed', [
            'total_files' => $totalCount,
            'successful_uploads' => $successCount,
            'failed_uploads' => $totalCount - $successCount,
        ]);

        return $results;
    }
}