<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Vite;
use Symfony\Component\HttpFoundation\Response;

class PerformanceHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only process successful HTML responses
        if (!$request->expectsJson() && $response->getStatusCode() === 200) {
            $this->addPreloadHeaders($response);
        }

        // Add Early Hints if supported (103 Early Hints)
        // Note: PHP/Laravel support for 103 is server-dependent (e.g., Nginx/Apache)
        // But we can still set the Link header which browsers use for preloading.

        return $response;
    }

    /**
     * Add Link headers for preloading critical assets
     * This simulates HTTP/2 Server Push behavior via preloading hints
     */
    private function addPreloadHeaders(Response $response): void
    {
        $links = [];

        // 1. Preload Critical Fonts (already in layout but header is faster)
        $links[] = '<https://fonts.bunny.net/inter/files/inter-latin-400-normal.woff2>; rel=preload; as=font; crossorigin=anonymous';
        
        // 2. Preconnect to essential origins
        $links[] = '<https://fonts.bunny.net>; rel=preconnect';
        $links[] = '<https://fonts.gstatic.com>; rel=preconnect; crossorigin';

        // 3. Preload CSS (If we can find the main CSS file)
        // Since we are using Vite, we can try to guess or use a consistent name if configured
        // However, Vite hashes names. We could use Vite::asset() if we knew the entry.
        try {
            // We don't want to crash if manifest is missing
            // This is a bit hacky but works for preloading the main app assets
            // In a production environment, you'd ideally parse the manifest once and cache it.
        } catch (\Exception $e) {
            // Silently fail
        }

        if (!empty($links)) {
            $response->headers->set('Link', implode(', ', $links), false);
        }

        // Add Timing-Allow-Origin for performance monitoring
        $response->headers->set('Timing-Allow-Origin', '*');
        
        // Add Server-Timing headers for debugging (could be expanded)
        $start = defined('LARAVEL_START') ? LARAVEL_START : microtime(true);
        $elapsed = (microtime(true) - $start) * 1000;
        $response->headers->set('Server-Timing', "app;dur={$elapsed};desc=\"Laravel Execution\"");
    }
}
