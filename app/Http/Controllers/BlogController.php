<?php

namespace App\Http\Controllers;

use App\Models\Insight;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BlogController extends Controller
{
    /**
     * Display a listing of the blog posts.
     */
    public function index(Request $request): Response
    {
        $page = $request->get('page', 1);
        $category = $request->get('category', 'all');
        $search = $request->get('search', '');
        
        $version = \Illuminate\Support\Facades\Cache::get('blog.cache_version', 1);
        $cacheKey = "blog.index.{$version}.{$page}.{$category}.{$search}";

        $insights = \Illuminate\Support\Facades\Cache::remember($cacheKey, 60 * 60, function () use ($request) {
            $query = Insight::published()
                ->with(['author:id,name', 'category:id,name,slug']);

            if ($request->filled('category')) {
                $query->whereHas('category', function ($q) use ($request) {
                    $q->where('slug', $request->category);
                });
            }

            if ($request->filled('search')) {
                $query->where(function ($q) use ($request) {
                    $q->where('title', 'like', '%' . $request->search . '%')
                      ->orWhere('excerpt', 'like', '%' . $request->search . '%');
                });
            }

            return $query->orderBy('published_at', 'desc')
                ->paginate(9);
        });

        $categories = \Illuminate\Support\Facades\Cache::remember('blog.categories', 60 * 60 * 24, function () {
            return Category::where('type', 'insight')->get(['id', 'name', 'slug']);
        });

        return Inertia::render('Blog', [
            'insights' => $insights,
            'categories' => $categories,
            'filters' => $request->only(['category', 'search']),
        ]);
    }

    /**
     * Display the specified blog post.
     */
    public function show(string $slug): Response
    {
        $insight = Insight::published()
            ->with(['author', 'category'])
            ->where('slug', $slug)
            ->firstOrFail();

        $relatedInsights = Insight::published()
            ->where('id', '!=', $insight->id)
            ->where('category_id', $insight->category_id)
            ->limit(3)
            ->get();

        return Inertia::render('Blog/Show', [
            'insight' => $insight,
            'relatedInsights' => $relatedInsights,
        ]);
    }
}
