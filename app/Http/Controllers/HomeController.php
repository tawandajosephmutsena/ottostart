<?php

namespace App\Http\Controllers;

use App\Models\PortfolioItem;
use App\Models\Service;
use App\Models\Insight;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    /**
     * Display the homepage with featured content
     */
    public function index(): Response
    {
        // Simple direct queries for now
        $featuredProjects = PortfolioItem::where('is_featured', true)
            ->where('is_published', true)
            ->latest()
            ->take(3)
            ->get();

        $featuredServices = Service::where('is_featured', true)
            ->where('is_active', true)
            ->latest()
            ->take(3)
            ->get();

        $recentInsights = Insight::where('is_published', true)
            ->latest('published_at')
            ->take(3)
            ->get();

        $stats = [
            'projects_completed' => PortfolioItem::where('is_published', true)->count(),
            'services_offered' => Service::where('is_active', true)->count(),
            'insights_published' => Insight::where('is_published', true)->count(),
            'years_experience' => 5,
        ];

        return Inertia::render('Home', [
            'featuredProjects' => $featuredProjects,
            'featuredServices' => $featuredServices,
            'recentInsights' => $recentInsights,
            'stats' => $stats,
            'canRegister' => \Laravel\Fortify\Features::enabled(\Laravel\Fortify\Features::registration()),
        ]);
    }
}