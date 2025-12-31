<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Http\Requests\Admin\ServiceRequest;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller
{
    /**
     * Display a listing of services.
     */
    public function index(Request $request): Response
    {
        $query = Service::query();

        // Apply filters
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
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

        $services = $query->ordered()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/services/Index', [
            'services' => $services,
            'filters' => $request->only(['search', 'status']),
            'stats' => [
                'total' => Service::count(),
                'published' => Service::published()->count(),
                'featured' => Service::featured()->count(),
            ],
        ]);
    }

    /**
     * Show the form for creating a new service.
     */
    public function create(): Response
    {
        return Inertia::render('admin/services/Create');
    }

    /**
     * Store a newly created service.
     */
    public function store(ServiceRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $service = Service::create($validated);
        $this->clearCache();

        return redirect()->route('admin.services.show', $service)
            ->with('success', 'Service created successfully.');
    }

    /**
     * Display the specified service.
     */
    public function show(Service $service): Response
    {
        return Inertia::render('admin/services/Show', [
            'service' => $service,
        ]);
    }

    /**
     * Show the form for editing the specified service.
     */
    public function edit(Service $service): Response
    {
        return Inertia::render('admin/services/Edit', [
            'service' => $service,
        ]);
    }

    /**
     * Update the specified service.
     */
    public function update(ServiceRequest $request, Service $service): RedirectResponse
    {
        $validated = $request->validated();

        $service->update($validated);
        $this->clearCache();

        return redirect()->route('admin.services.show', $service)
            ->with('success', 'Service updated successfully.');
    }

    /**
     * Remove the specified service.
     */
    public function destroy(Service $service): RedirectResponse
    {
        $service->delete();
        $this->clearCache();

        return redirect()->route('admin.services.index')
            ->with('success', 'Service deleted successfully.');
    }

    /**
     * Toggle the featured status of a service.
     */
    public function toggleFeatured(Service $service): RedirectResponse
    {
        $service->update([
            'is_featured' => !$service->is_featured,
        ]);

        $status = $service->is_featured ? 'featured' : 'unfeatured';
        
        $this->clearCache();
        return back()->with('success', "Service {$status} successfully.");
    }

    /**
     * Toggle the published status of a service.
     */
    public function togglePublished(Service $service): RedirectResponse
    {
        $service->update([
            'is_published' => !$service->is_published,
        ]);

        $status = $service->is_published ? 'published' : 'unpublished';
        
        $this->clearCache();
        return back()->with('success', "Service {$status} successfully.");
    }

    /**
     * Bulk actions for services.
     */
    public function bulkAction(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'action' => 'required|in:publish,unpublish,feature,unfeature,delete',
            'items' => 'required|array|min:1',
            'items.*' => 'exists:services,id',
        ]);

        $items = Service::whereIn('id', $validated['items']);

        switch ($validated['action']) {
            case 'publish':
                $items->update(['is_published' => true]);
                $message = 'Services published successfully.';
                break;
            case 'unpublish':
                $items->update(['is_published' => false]);
                $message = 'Services unpublished successfully.';
                break;
            case 'feature':
                $items->update(['is_featured' => true]);
                $message = 'Services featured successfully.';
                break;
            case 'unfeature':
                $items->update(['is_featured' => false]);
                $message = 'Services unfeatured successfully.';
                break;
            case 'delete':
                $items->delete();
                $message = 'Services deleted successfully.';
                break;
        }

        $this->clearCache();

        return back()->with('success', $message);
    }

    /**
     * Clear the services cache.
     */
    private function clearCache(): void
    {
        \Illuminate\Support\Facades\Cache::forget('services.index');
    }
}