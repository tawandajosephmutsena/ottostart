<?php

namespace App\Http\Controllers;

use App\Models\PortfolioItem;
use App\Models\Service;
use App\Models\Insight;
use App\Models\Setting;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    /**
     * Display the homepage with featured content
     */
    public function index(): Response
    {
        // Fetch featured content for homepage
        $featuredProjects = PortfolioItem::published()
            ->featured()
            ->ordered()
            ->limit(6)
            ->select(['id', 'title', 'slug', 'description', 'featured_image', 'client', 'technologies', 'is_featured'])
            ->get();

        $featuredServices = Service::published()
            ->featured()
            ->ordered()
            ->limit(6)
            ->select(['id', 'title', 'slug', 'description', 'icon', 'featured_image', 'price_range', 'is_featured'])
            ->get();

        $recentInsights = Insight::published()
            ->with(['author:id,name', 'category:id,name,slug'])
            ->orderBy('published_at', 'desc')
            ->limit(6)
            ->select(['id', 'title', 'slug', 'excerpt', 'featured_image', 'author_id', 'category_id', 'published_at', 'reading_time'])
            ->get();

        // Get homepage stats from settings or use defaults
        $stats = $this->getHomepageStats();

        return Inertia::render('Home', [
            'featuredProjects' => $featuredProjects,
            'featuredServices' => $featuredServices,
            'recentInsights' => $recentInsights,
            'stats' => $stats,
            'canRegister' => \Laravel\Fortify\Features::enabled(\Laravel\Fortify\Features::registration()),
        ]);
    }

    /**
     * Get homepage statistics from settings or return defaults
     */
    private function getHomepageStats(): array
    {
        // Try to get stats from settings table
        $statsSettings = Setting::where('key', 'homepage_stats')->first();
        
        if ($statsSettings && $statsSettings->value) {
            return $statsSettings->value;
        }

        // Return default stats if not found in settings
        return [
            [
                'value' => '150',
                'label' => 'Projects Completed',
                'suffix' => '+',
            ],
            [
                'value' => '50',
                'label' => 'Happy Clients',
                'suffix' => '+',
            ],
            [
                'value' => '5',
                'label' => 'Years Experience',
                'suffix' => '+',
            ],
            [
                'value' => '24/7',
                'label' => 'Support',
            ],
        ];
    }
}