<?php

namespace App\Http\Controllers;

use App\Models\PortfolioItem;
use App\Models\Page;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PortfolioController extends Controller
{
    /**
     * Display a listing of the portfolio items.
     */
    public function index(Request $request): Response
    {
        $page = $request->get('page', 1);
        $version = \Illuminate\Support\Facades\Cache::get('portfolio.cache_version', 1);
        $cacheKey = 'portfolio.index.' . $version . '.' . $page;

        $portfolioItems = \Illuminate\Support\Facades\Cache::remember($cacheKey, 60 * 60, function () {
            return PortfolioItem::published()
                ->ordered()
                ->paginate(12);
        });

        $dynamicPage = Page::published()->where('slug', 'portfolio')->first();

        return Inertia::render('Portfolio', [
            'portfolioItems' => $portfolioItems,
            'page' => $dynamicPage,
        ]);
    }

    /**
     * Display the specified portfolio item.
     */
    public function show(string $slug): Response
    {
        $portfolioItem = PortfolioItem::published()
            ->where('slug', $slug)
            ->firstOrFail();

        return Inertia::render('Portfolio/Show', [
            'portfolioItem' => $portfolioItem,
        ]);
    }
}
