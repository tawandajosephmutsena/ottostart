<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\PortfolioItem;
use App\Models\Insight;
use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class SearchController extends Controller
{
    /**
     * Search across all major content types
     */
    public function index(Request $request)
    {
        $query = $request->get('q');

        if (empty($query) || strlen($query) < 2) {
            return response()->json([
                'results' => []
            ]);
        }

        $results = new Collection();

        // 1. Search Services
        $services = Service::published()
            ->where(function ($q) use ($query) {
                $q->where('title', 'like', "%{$query}%")
                  ->orWhere('excerpt', 'like', "%{$query}%");
            })
            ->take(5)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'title' => $item->title,
                    'type' => 'Service',
                    'url' => route('services.show', $item->slug),
                    'icon' => 'Sparkles',
                ];
            });
        $results = $results->concat($services);

        // 2. Search Portfolio (Works)
        $portfolio = PortfolioItem::published()
            ->where(function ($q) use ($query) {
                $q->where('title', 'like', "%{$query}%")
                  ->orWhere('client_name', 'like', "%{$query}%")
                  ->orWhere('description', 'like', "%{$query}%");
            })
            ->take(5)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'title' => $item->title,
                    'type' => 'Project',
                    'url' => route('portfolio.show', $item->slug),
                    'icon' => 'Briefcase',
                ];
            });
        $results = $results->concat($portfolio);

        // 3. Search Insights (Blog)
        $insights = Insight::published()
            ->where(function ($q) use ($query) {
                $q->where('title', 'like', "%{$query}%")
                  ->orWhere('excerpt', 'like', "%{$query}%");
            })
            ->take(5)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'title' => $item->title,
                    'type' => 'Insight',
                    'url' => route('blog.show', $item->slug),
                    'icon' => 'Newspaper',
                ];
            });
        $results = $results->concat($insights);

        // 4. Search Pages
        $pages = Page::published()
            ->where('title', 'like', "%{$query}%")
            ->take(3)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'title' => $item->title,
                    'type' => 'Page',
                    'url' => route('pages.show', $item->slug),
                    'icon' => 'FileText',
                ];
            });
        $results = $results->concat($pages);

        return response()->json([
            'results' => $results->values()->all()
        ]);
    }
}
