<?php

namespace App\Http\Middleware;

use App\Services\CanonicalUrlService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CanonicalRedirect
{
    private CanonicalUrlService $canonicalUrlService;

    public function __construct(CanonicalUrlService $canonicalUrlService)
    {
        $this->canonicalUrlService = $canonicalUrlService;
    }

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip redirects for non-GET requests
        if (!$request->isMethod('GET')) {
            return $next($request);
        }

        // Skip redirects for admin, API, and preview routes
        if ($this->shouldSkipRedirect($request)) {
            return $next($request);
        }

        // Check if canonical redirect is needed
        $redirectUrl = $this->canonicalUrlService->needsCanonicalRedirect($request);
        
        if ($redirectUrl) {
            return redirect($redirectUrl, 301);
        }

        return $next($request);
    }

    /**
     * Determine if redirect should be skipped for this request
     */
    private function shouldSkipRedirect(Request $request): bool
    {
        $path = $request->path();
        
        $skipPaths = [
            'admin',
            'cms',
            'api',
            'preview',
            'sitemap.xml',
            'robots.txt',
            '_debugbar',
            'telescope',
        ];

        foreach ($skipPaths as $skipPath) {
            if (str_starts_with($path, $skipPath)) {
                return true;
            }
        }

        return false;
    }
}