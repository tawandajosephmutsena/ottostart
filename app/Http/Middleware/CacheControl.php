<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CacheControl
{
    /**
     * Cache durations for different content types (in seconds)
     */
    private const CACHE_DURATIONS = [
        'static' => 31536000,  // 1 year for static assets
        'page' => 3600,        // 1 hour for pages
        'api' => 60,           // 1 minute for API responses
        'dynamic' => 0,        // No cache for dynamic content
    ];

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $type = 'page'): Response
    {
        $response = $next($request);

        // Don't cache for authenticated users or POST/PUT/DELETE requests
        if ($request->user() || !$request->isMethodSafe()) {
            return $this->setNoCache($response);
        }

        // Don't cache if there are flash messages
        if ($request->session()->has('success') || $request->session()->has('error')) {
            return $this->setNoCache($response);
        }

        $duration = self::CACHE_DURATIONS[$type] ?? self::CACHE_DURATIONS['page'];

        if ($duration > 0) {
            $response->headers->set('Cache-Control', "public, max-age={$duration}, s-maxage={$duration}");
            $response->headers->set('Vary', 'Accept-Encoding');
            
            // Add ETag for cache validation
            $etag = md5($response->getContent() . $request->getRequestUri());
            $response->headers->set('ETag', "\"{$etag}\"");
        }

        return $response;
    }

    /**
     * Set no-cache headers for dynamic content
     */
    private function setNoCache(Response $response): Response
    {
        $response->headers->set('Cache-Control', 'no-cache, no-store, must-revalidate');
        $response->headers->set('Pragma', 'no-cache');
        $response->headers->set('Expires', '0');

        return $response;
    }
}
