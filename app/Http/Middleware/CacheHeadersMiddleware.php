<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CacheHeadersMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $cacheProfile = 'default'): Response
    {
        $response = $next($request);

        // Don't cache error responses or redirects
        if ($response->getStatusCode() >= 300) {
            return $response;
        }

        // Don't cache authenticated requests by default
        if ($request->user() && $cacheProfile === 'default') {
            return $this->setNoCacheHeaders($response);
        }

        // Apply cache headers based on profile
        return $this->applyCacheProfile($response, $cacheProfile, $request);
    }

    /**
     * Apply cache profile to response
     */
    private function applyCacheProfile(Response $response, string $profile, Request $request): Response
    {
        switch ($profile) {
            case 'static':
                return $this->setStaticAssetHeaders($response);
            
            case 'images':
                return $this->setImageHeaders($response);
            
            case 'api':
                return $this->setApiHeaders($response);
            
            case 'public':
                return $this->setPublicPageHeaders($response);
            
            case 'short':
                return $this->setShortCacheHeaders($response);
            
            case 'long':
                return $this->setLongCacheHeaders($response);
            
            case 'no-cache':
                return $this->setNoCacheHeaders($response);
            
            default:
                return $this->setDefaultHeaders($response, $request);
        }
    }

    /**
     * Set headers for static assets (CSS, JS, fonts)
     */
    private function setStaticAssetHeaders(Response $response): Response
    {
        $maxAge = 31536000; // 1 year
        
        return $response->withHeaders([
            'Cache-Control' => "public, max-age={$maxAge}, immutable",
            'Expires' => gmdate('D, d M Y H:i:s', time() + $maxAge) . ' GMT',
            'Vary' => 'Accept-Encoding',
        ]);
    }

    /**
     * Set headers for images
     */
    private function setImageHeaders(Response $response): Response
    {
        $maxAge = 2592000; // 30 days
        
        return $response->withHeaders([
            'Cache-Control' => "public, max-age={$maxAge}",
            'Expires' => gmdate('D, d M Y H:i:s', time() + $maxAge) . ' GMT',
            'Vary' => 'Accept-Encoding',
        ]);
    }

    /**
     * Set headers for API responses
     */
    private function setApiHeaders(Response $response): Response
    {
        $maxAge = 300; // 5 minutes
        
        return $response->withHeaders([
            'Cache-Control' => "public, max-age={$maxAge}, must-revalidate",
            'Expires' => gmdate('D, d M Y H:i:s', time() + $maxAge) . ' GMT',
            'Vary' => 'Accept-Encoding, Accept',
            'ETag' => '"' . md5($response->getContent()) . '"',
        ]);
    }

    /**
     * Set headers for public pages
     */
    private function setPublicPageHeaders(Response $response): Response
    {
        $maxAge = 3600; // 1 hour
        
        return $response->withHeaders([
            'Cache-Control' => "public, max-age={$maxAge}, must-revalidate",
            'Expires' => gmdate('D, d M Y H:i:s', time() + $maxAge) . ' GMT',
            'Vary' => 'Accept-Encoding, Accept',
            'ETag' => '"' . md5($response->getContent()) . '"',
        ]);
    }

    /**
     * Set short cache headers (5 minutes)
     */
    private function setShortCacheHeaders(Response $response): Response
    {
        $maxAge = 300; // 5 minutes
        
        return $response->withHeaders([
            'Cache-Control' => "public, max-age={$maxAge}",
            'Expires' => gmdate('D, d M Y H:i:s', time() + $maxAge) . ' GMT',
            'Vary' => 'Accept-Encoding',
        ]);
    }

    /**
     * Set long cache headers (1 day)
     */
    private function setLongCacheHeaders(Response $response): Response
    {
        $maxAge = 86400; // 1 day
        
        return $response->withHeaders([
            'Cache-Control' => "public, max-age={$maxAge}",
            'Expires' => gmdate('D, d M Y H:i:s', time() + $maxAge) . ' GMT',
            'Vary' => 'Accept-Encoding',
        ]);
    }

    /**
     * Set no-cache headers
     */
    private function setNoCacheHeaders(Response $response): Response
    {
        return $response->withHeaders([
            'Cache-Control' => 'no-cache, no-store, must-revalidate, private',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ]);
    }

    /**
     * Set default headers based on request type
     */
    private function setDefaultHeaders(Response $response, Request $request): Response
    {
        // Check if it's an API request
        if ($request->is('api/*') || $request->wantsJson()) {
            return $this->setApiHeaders($response);
        }

        // Check if it's a static asset based on URL
        if ($this->isStaticAsset($request->getPathInfo())) {
            return $this->setStaticAssetHeaders($response);
        }

        // Check if it's an image
        if ($this->isImage($request->getPathInfo())) {
            return $this->setImageHeaders($response);
        }

        // Default to short cache for other requests
        return $this->setShortCacheHeaders($response);
    }

    /**
     * Check if request is for a static asset
     */
    private function isStaticAsset(string $path): bool
    {
        return preg_match('/\.(css|js|woff2?|ttf|eot)$/i', $path);
    }

    /**
     * Check if request is for an image
     */
    private function isImage(string $path): bool
    {
        return preg_match('/\.(png|jpg|jpeg|gif|webp|svg|ico)$/i', $path);
    }
}
