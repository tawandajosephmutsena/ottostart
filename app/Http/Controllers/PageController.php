<?php

namespace App\Http\Controllers;

use App\Models\Page;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PageController extends Controller
{
    public function show($slug)
    {
        $page = Page::published()
            ->where('slug', $slug)
            ->firstOrFail();

        // Fetch collections for dynamic blocks
        $featuredServices = \App\Models\Service::orderBy('order')->take(10)->get();
        $featuredProjects = \App\Models\PortfolioItem::orderBy('order')->take(10)->get();
        $recentInsights = \App\Models\Insight::published()->orderBy('published_at', 'desc')->take(10)->get();

        return Inertia::render('DynamicPage', [
            'page' => $page,
            'featuredServices' => $featuredServices,
            'featuredProjects' => $featuredProjects,
            'recentInsights' => $recentInsights,
        ]);
    }
}
