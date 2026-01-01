<?php

namespace App\Http\Middleware;

use App\Services\RedirectService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandleRedirects
{
    private RedirectService $redirectService;

    public function __construct(RedirectService $redirectService)
    {
        $this->redirectService = $redirectService;
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

        // Skip redirects for admin, API, and system routes
        if ($this->shouldSkipRedirect($request)) {
            return $next($request);
        }

        // Check for custom redirects
        $redirect = $this->redirectService->findRedirect($request->getPathInfo());
        
        if ($redirect) {
            $toUrl = $this->redirectService->processRedirect($redirect, $request);
            return redirect($toUrl, $redirect->status_code);
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
            'livewire',
        ];

        foreach ($skipPaths as $skipPath) {
            if (str_starts_with($path, $skipPath)) {
                return true;
            }
        }

        return false;
    }
}