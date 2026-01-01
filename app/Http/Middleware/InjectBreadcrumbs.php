<?php

namespace App\Http\Middleware;

use App\Services\BreadcrumbService;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InjectBreadcrumbs
{
    private BreadcrumbService $breadcrumbService;

    public function __construct(BreadcrumbService $breadcrumbService)
    {
        $this->breadcrumbService = $breadcrumbService;
    }

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        // Generate breadcrumbs for the current request
        $breadcrumbs = $this->breadcrumbService->generateBreadcrumbs($request);
        
        // Generate structured data for breadcrumbs
        $breadcrumbStructuredData = $this->breadcrumbService->generateBreadcrumbStructuredData($breadcrumbs);

        // Share breadcrumb data with all Inertia responses
        Inertia::share([
            'breadcrumbs' => $breadcrumbs,
            'breadcrumbStructuredData' => $breadcrumbStructuredData,
        ]);

        return $next($request);
    }
}