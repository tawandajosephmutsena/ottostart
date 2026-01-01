<?php

namespace App\Http\Controllers;

use App\Services\SitemapService;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    private SitemapService $sitemapService;

    public function __construct(SitemapService $sitemapService)
    {
        $this->sitemapService = $sitemapService;
    }

    /**
     * Generate and return the XML sitemap
     */
    public function index(): Response
    {
        $sitemapXml = $this->sitemapService->generateSitemap();

        return response($sitemapXml, 200, [
            'Content-Type' => 'application/xml',
            'Cache-Control' => 'public, max-age=3600', // Cache for 1 hour
        ]);
    }

    /**
     * Get sitemap statistics (for admin use)
     */
    public function stats(): array
    {
        return $this->sitemapService->getSitemapStats();
    }

    /**
     * Clear sitemap cache
     */
    public function clearCache(): array
    {
        $this->sitemapService->clearCache();
        
        return [
            'success' => true,
            'message' => 'Sitemap cache cleared successfully',
        ];
    }

    /**
     * Submit sitemap to search engines
     */
    public function submit(): array
    {
        // First generate/update the sitemap
        $this->sitemapService->generateAndSaveSitemap();
        
        // Then submit to search engines
        $results = $this->sitemapService->submitToSearchEngines();
        
        return [
            'success' => true,
            'results' => $results,
        ];
    }
}