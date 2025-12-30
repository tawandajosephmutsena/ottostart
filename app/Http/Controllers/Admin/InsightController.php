<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Insight;
use App\Models\Category;
use App\Models\User;
use App\Http\Requests\Admin\InsightRequest;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class InsightController extends Controller
{
    /**
     * Display a listing of insights.
     */
    public function index(Request $request): Response
    {
        $query = Insight::with(['author', 'category']);

        // Apply filters
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('excerpt', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('status')) {
            if ($request->status === 'published') {
                $query->published();
            } elseif ($request->status === 'draft') {
                $query->where('is_published', false);
            } elseif ($request->status === 'featured') {
                $query->featured();
            }
        }

        if ($request->filled('category')) {
            $query->byCategory($request->category);
        }

        if ($request->filled('author')) {
            $query->where('author_id', $request->author);
        }

        $insights = $query->latest()
            ->paginate(15)
            ->withQueryString();

        $categories = Category::where('type', 'insight')->get(['id', 'name']);
        $authors = User::whereIn('role', ['admin', 'editor'])->get(['id', 'name']);

        return Inertia::render('admin/insights/Index', [
            'insights' => $insights,
            'categories' => $categories,
            'authors' => $authors,
            'filters' => $request->only(['search', 'status', 'category', 'author']),
            'stats' => [
                'total' => Insight::count(),
                'published' => Insight::published()->count(),
                'featured' => Insight::featured()->count(),
            ],
        ]);
    }

    /**
     * Show the form for creating a new insight.
     */
    public function create(): Response
    {
        $categories = Category::where('type', 'insight')->get(['id', 'name']);
        $authors = User::whereIn('role', ['admin', 'editor'])->get(['id', 'name']);

        return Inertia::render('admin/insights/Create', [
            'categories' => $categories,
            'authors' => $authors,
        ]);
    }

    /**
     * Store a newly created insight.
     */
    public function store(InsightRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $insight = Insight::create($validated);

        return redirect()->route('admin.insights.show', $insight)
            ->with('success', 'Insight created successfully.');
    }

    /**
     * Display the specified insight.
     */
    public function show(Insight $insight): Response
    {
        $insight->load(['author', 'category']);

        return Inertia::render('admin/insights/Show', [
            'insight' => $insight,
        ]);
    }

    /**
     * Show the form for editing the specified insight.
     */
    public function edit(Insight $insight): Response
    {
        $insight->load(['author', 'category']);
        $categories = Category::where('type', 'insight')->get(['id', 'name']);
        $authors = User::whereIn('role', ['admin', 'editor'])->get(['id', 'name']);

        return Inertia::render('admin/insights/Edit', [
            'insight' => $insight,
            'categories' => $categories,
            'authors' => $authors,
        ]);
    }

    /**
     * Update the specified insight.
     */
    public function update(InsightRequest $request, Insight $insight): RedirectResponse
    {
        $validated = $request->validated();

        $insight->update($validated);

        return redirect()->route('admin.insights.show', $insight)
            ->with('success', 'Insight updated successfully.');
    }

    /**
     * Remove the specified insight.
     */
    public function destroy(Insight $insight): RedirectResponse
    {
        $insight->delete();

        return redirect()->route('admin.insights.index')
            ->with('success', 'Insight deleted successfully.');
    }

    /**
     * Toggle the featured status of an insight.
     */
    public function toggleFeatured(Insight $insight): RedirectResponse
    {
        $insight->update([
            'is_featured' => !$insight->is_featured,
        ]);

        $status = $insight->is_featured ? 'featured' : 'unfeatured';
        
        return back()->with('success', "Insight {$status} successfully.");
    }

    /**
     * Toggle the published status of an insight.
     */
    public function togglePublished(Insight $insight): RedirectResponse
    {
        $updateData = [
            'is_published' => !$insight->is_published,
        ];

        // Set published_at if publishing for the first time
        if (!$insight->is_published && !$insight->published_at) {
            $updateData['published_at'] = now();
        }

        $insight->update($updateData);

        $status = $insight->is_published ? 'published' : 'unpublished';
        
        return back()->with('success', "Insight {$status} successfully.");
    }

    /**
     * Bulk actions for insights.
     */
    public function bulkAction(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'action' => 'required|in:publish,unpublish,feature,unfeature,delete',
            'items' => 'required|array|min:1',
            'items.*' => 'exists:insights,id',
        ]);

        $items = Insight::whereIn('id', $validated['items']);

        switch ($validated['action']) {
            case 'publish':
                $items->update([
                    'is_published' => true,
                    'published_at' => now(),
                ]);
                $message = 'Insights published successfully.';
                break;
            case 'unpublish':
                $items->update(['is_published' => false]);
                $message = 'Insights unpublished successfully.';
                break;
            case 'feature':
                $items->update(['is_featured' => true]);
                $message = 'Insights featured successfully.';
                break;
            case 'unfeature':
                $items->update(['is_featured' => false]);
                $message = 'Insights unfeatured successfully.';
                break;
            case 'delete':
                $items->delete();
                $message = 'Insights deleted successfully.';
                break;
        }

        return back()->with('success', $message);
    }
}