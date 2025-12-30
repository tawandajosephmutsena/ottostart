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

        $insights = $query->orderBy('published_at', 'desc')
            ->paginate(9)
            ->withQueryString();

        $categories = Category::where('type', 'insight')
            ->get(['id', 'name', 'slug']);

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
