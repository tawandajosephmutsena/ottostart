<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PortfolioItem;
use App\Http\Requests\Admin\PortfolioItemRequest;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PortfolioController extends Controller
{
    /**
     * Display a listing of portfolio items.
     */
    public function index(Request $request): Response
    {
        $query = PortfolioItem::query();

        // Apply filters
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%')
                  ->orWhere('client', 'like', '%' . $request->search . '%');
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

        $portfolioItems = $query->ordered()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/portfolio/Index', [
            'portfolioItems' => $portfolioItems,
            'filters' => $request->only(['search', 'status']),
            'stats' => [
                'total' => PortfolioItem::count(),
                'published' => PortfolioItem::published()->count(),
                'featured' => PortfolioItem::featured()->count(),
            ],
        ]);
    }

    /**
     * Show the form for creating a new portfolio item.
     */
    public function create(): Response
    {
        return Inertia::render('admin/portfolio/Create');
    }

    /**
     * Store a newly created portfolio item.
     */
    public function store(PortfolioItemRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $portfolioItem = PortfolioItem::create($validated);
        $this->clearCache();

        return redirect()->route('admin.portfolio.show', $portfolioItem)
            ->with('success', 'Portfolio item created successfully.');
    }

    /**
     * Display the specified portfolio item.
     */
    public function show(PortfolioItem $portfolioItem): Response
    {
        return Inertia::render('admin/portfolio/Show', [
            'portfolioItem' => $portfolioItem,
        ]);
    }

    /**
     * Show the form for editing the specified portfolio item.
     */
    public function edit(PortfolioItem $portfolioItem): Response
    {
        return Inertia::render('admin/portfolio/Edit', [
            'portfolioItem' => $portfolioItem,
        ]);
    }

    /**
     * Update the specified portfolio item.
     */
    public function update(PortfolioItemRequest $request, PortfolioItem $portfolioItem): RedirectResponse
    {
        $validated = $request->validated();

        $portfolioItem->update($validated);
        $this->clearCache();

        return redirect()->route('admin.portfolio.show', $portfolioItem)
            ->with('success', 'Portfolio item updated successfully.');
    }

    /**
     * Remove the specified portfolio item.
     */
    public function destroy(PortfolioItem $portfolioItem): RedirectResponse
    {
        $portfolioItem->delete();
        $this->clearCache();

        return redirect()->route('admin.portfolio.index')
            ->with('success', 'Portfolio item deleted successfully.');
    }

    /**
     * Toggle the featured status of a portfolio item.
     */
    public function toggleFeatured(PortfolioItem $portfolioItem): RedirectResponse
    {
        $portfolioItem->update([
            'is_featured' => !$portfolioItem->is_featured,
        ]);

        $status = $portfolioItem->is_featured ? 'featured' : 'unfeatured';
        
        $this->clearCache();
        return back()->with('success', "Portfolio item {$status} successfully.");
    }

    /**
     * Toggle the published status of a portfolio item.
     */
    public function togglePublished(PortfolioItem $portfolioItem): RedirectResponse
    {
        $portfolioItem->update([
            'is_published' => !$portfolioItem->is_published,
        ]);

        $status = $portfolioItem->is_published ? 'published' : 'unpublished';
        
        $this->clearCache();
        return back()->with('success', "Portfolio item {$status} successfully.");
    }

    /**
     * Bulk actions for portfolio items.
     */
    public function bulkAction(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'action' => 'required|in:publish,unpublish,feature,unfeature,delete',
            'items' => 'required|array|min:1',
            'items.*' => 'exists:portfolio_items,id',
        ]);

        $items = PortfolioItem::whereIn('id', $validated['items']);

        switch ($validated['action']) {
            case 'publish':
                $items->update(['is_published' => true]);
                $message = 'Portfolio items published successfully.';
                break;
            case 'unpublish':
                $items->update(['is_published' => false]);
                $message = 'Portfolio items unpublished successfully.';
                break;
            case 'feature':
                $items->update(['is_featured' => true]);
                $message = 'Portfolio items featured successfully.';
                break;
            case 'unfeature':
                $items->update(['is_featured' => false]);
                $message = 'Portfolio items unfeatured successfully.';
                break;
            case 'delete':
                $items->delete();
                $message = 'Portfolio items deleted successfully.';
                break;
        }

        $this->clearCache();

        return back()->with('success', $message);
    }

    /**
     * Clear the portfolio cache by incrementing the version.
     */
    private function clearCache(): void
    {
        \Illuminate\Support\Facades\Cache::increment('portfolio.cache_version');
    }
}