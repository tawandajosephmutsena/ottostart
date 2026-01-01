<?php

namespace App\Services;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class AssetVersioningService
{
    private string $manifestPath;
    private array $manifest = [];
    private bool $manifestLoaded = false;

    public function __construct()
    {
        $this->manifestPath = public_path('build/manifest.json');
    }

    /**
     * Get versioned asset URL
     */
    public function asset(string $path): string
    {
        $this->loadManifest();

        // Remove leading slash
        $path = ltrim($path, '/');

        // Check if asset exists in manifest
        if (isset($this->manifest[$path])) {
            return $this->getAssetUrl($this->manifest[$path]['file']);
        }

        // Fallback: try to find the asset with hash
        $versionedPath = $this->findVersionedAsset($path);
        if ($versionedPath) {
            return $this->getAssetUrl($versionedPath);
        }

        // Final fallback: return original path
        return $this->getAssetUrl($path);
    }

    /**
     * Get asset URL with proper base URL
     */
    private function getAssetUrl(string $path): string
    {
        $baseUrl = config('app.asset_url', config('app.url'));
        return rtrim($baseUrl, '/') . '/build/' . ltrim($path, '/');
    }

    /**
     * Load Vite manifest file
     */
    private function loadManifest(): void
    {
        if ($this->manifestLoaded) {
            return;
        }

        if (!File::exists($this->manifestPath)) {
            $this->manifest = [];
            $this->manifestLoaded = true;
            return;
        }

        try {
            $content = File::get($this->manifestPath);
            $this->manifest = json_decode($content, true) ?: [];
        } catch (\Exception $e) {
            $this->manifest = [];
        }

        $this->manifestLoaded = true;
    }

    /**
     * Find versioned asset by scanning build directory
     */
    private function findVersionedAsset(string $originalPath): ?string
    {
        $buildPath = public_path('build');
        
        if (!is_dir($buildPath)) {
            return null;
        }

        $pathInfo = pathinfo($originalPath);
        $filename = $pathInfo['filename'];
        $extension = $pathInfo['extension'] ?? '';
        
        // Look for files with hash pattern: filename-[hash].extension
        $pattern = $filename . '-*.';
        if ($extension) {
            $pattern .= $extension;
        }

        $files = glob($buildPath . '/' . $pattern);
        
        if (!empty($files)) {
            $file = basename($files[0]);
            return $file;
        }

        return null;
    }

    /**
     * Get all CSS assets
     */
    public function getCssAssets(): array
    {
        $this->loadManifest();
        
        $cssAssets = [];
        
        foreach ($this->manifest as $key => $asset) {
            if (isset($asset['isEntry']) && $asset['isEntry'] && str_ends_with($asset['file'], '.css')) {
                $cssAssets[] = $this->getAssetUrl($asset['file']);
            }
            
            // Also check for CSS imports
            if (isset($asset['css'])) {
                foreach ($asset['css'] as $cssFile) {
                    $cssAssets[] = $this->getAssetUrl($cssFile);
                }
            }
        }
        
        return array_unique($cssAssets);
    }

    /**
     * Get all JavaScript assets
     */
    public function getJsAssets(): array
    {
        $this->loadManifest();
        
        $jsAssets = [];
        
        foreach ($this->manifest as $key => $asset) {
            if (isset($asset['isEntry']) && $asset['isEntry'] && str_ends_with($asset['file'], '.js')) {
                $jsAssets[] = $this->getAssetUrl($asset['file']);
            }
        }
        
        return array_unique($jsAssets);
    }

    /**
     * Get preload links for critical assets
     */
    public function getPreloadLinks(): array
    {
        $preloadLinks = [];
        
        // Preload critical CSS
        $cssAssets = $this->getCssAssets();
        foreach (array_slice($cssAssets, 0, 2) as $cssAsset) { // Only first 2 CSS files
            $preloadLinks[] = [
                'href' => $cssAsset,
                'rel' => 'preload',
                'as' => 'style',
            ];
        }
        
        // Preload critical JS
        $jsAssets = $this->getJsAssets();
        foreach (array_slice($jsAssets, 0, 1) as $jsAsset) { // Only first JS file
            $preloadLinks[] = [
                'href' => $jsAsset,
                'rel' => 'preload',
                'as' => 'script',
            ];
        }
        
        return $preloadLinks;
    }

    /**
     * Generate integrity hash for asset
     */
    public function getIntegrityHash(string $path): ?string
    {
        $fullPath = public_path('build/' . ltrim($path, '/'));
        
        if (!File::exists($fullPath)) {
            return null;
        }
        
        $content = File::get($fullPath);
        return 'sha384-' . base64_encode(hash('sha384', $content, true));
    }

    /**
     * Get asset with integrity hash
     */
    public function assetWithIntegrity(string $path): array
    {
        $url = $this->asset($path);
        $integrity = $this->getIntegrityHash($path);
        
        return [
            'url' => $url,
            'integrity' => $integrity,
        ];
    }

    /**
     * Generate cache-busting URL for non-versioned assets
     */
    public function cacheBust(string $path): string
    {
        $fullPath = public_path($path);
        
        if (!File::exists($fullPath)) {
            return $path;
        }
        
        $mtime = File::lastModified($fullPath);
        $separator = str_contains($path, '?') ? '&' : '?';
        
        return $path . $separator . 'v=' . $mtime;
    }

    /**
     * Get critical CSS inline
     */
    public function getCriticalCss(): string
    {
        $criticalCssPath = public_path('build/critical.css');
        
        if (File::exists($criticalCssPath)) {
            return File::get($criticalCssPath);
        }
        
        return '';
    }

    /**
     * Check if asset exists
     */
    public function assetExists(string $path): bool
    {
        $this->loadManifest();
        
        $path = ltrim($path, '/');
        
        // Check in manifest
        if (isset($this->manifest[$path])) {
            return true;
        }
        
        // Check in build directory
        $buildPath = public_path('build/' . $path);
        return File::exists($buildPath);
    }

    /**
     * Get asset size
     */
    public function getAssetSize(string $path): ?int
    {
        $buildPath = public_path('build/' . ltrim($path, '/'));
        
        if (!File::exists($buildPath)) {
            return null;
        }
        
        return File::size($buildPath);
    }

    /**
     * Get all assets with their metadata
     */
    public function getAllAssets(): array
    {
        $this->loadManifest();
        
        $assets = [];
        
        foreach ($this->manifest as $key => $asset) {
            $assets[$key] = [
                'file' => $asset['file'],
                'url' => $this->getAssetUrl($asset['file']),
                'size' => $this->getAssetSize($asset['file']),
                'integrity' => $this->getIntegrityHash($asset['file']),
                'is_entry' => $asset['isEntry'] ?? false,
                'imports' => $asset['imports'] ?? [],
                'css' => $asset['css'] ?? [],
            ];
        }
        
        return $assets;
    }

    /**
     * Clear asset cache
     */
    public function clearCache(): void
    {
        $this->manifest = [];
        $this->manifestLoaded = false;
        
        // Clear any cached asset data
        Cache::forget('asset_manifest');
        Cache::forget('critical_css');
    }
}