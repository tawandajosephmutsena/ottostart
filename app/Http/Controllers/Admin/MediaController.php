<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MediaAsset;
use App\Http\Requests\Admin\MediaAssetRequest;
use App\Http\Traits\HandlesJsonErrors;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class MediaController extends Controller
{
    use HandlesJsonErrors;
    /**
     * Display the media library.
     */
    public function index(Request $request): Response
    {
        $query = MediaAsset::query();

        // Apply filters
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('original_name', 'like', '%' . $request->search . '%')
                  ->orWhere('alt_text', 'like', '%' . $request->search . '%')
                  ->orWhere('caption', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('type')) {
            $query->byMimeType($request->type);
        }

        if ($request->filled('folder')) {
            $query->byFolder($request->folder);
        }

        $mediaAssets = $query->latest()
            ->paginate(24)
            ->withQueryString();

        // Get available folders
        $folders = MediaAsset::whereNotNull('folder')
            ->distinct()
            ->pluck('folder')
            ->filter()
            ->sort()
            ->values();

        return Inertia::render('admin/media/Index', [
            'mediaAssets' => $mediaAssets,
            'folders' => $folders,
            'filters' => $request->only(['search', 'type', 'folder']),
            'stats' => [
                'total' => MediaAsset::count(),
                'images' => MediaAsset::images()->count(),
                'videos' => MediaAsset::videos()->count(),
                'total_size' => MediaAsset::sum('size'),
            ],
        ]);
    }

    /**
     * Show the upload form.
     */
    public function create(): Response
    {
        $folders = MediaAsset::whereNotNull('folder')
            ->distinct()
            ->pluck('folder')
            ->filter()
            ->sort()
            ->values();

        return Inertia::render('admin/media/Upload', [
            'folders' => $folders,
        ]);
    }

    /**
     * Handle file upload.
     */
    public function store(MediaAssetRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $uploadedFiles = [];

        foreach ($request->file('files') as $file) {
            // Generate unique filename
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            
            // Determine storage path
            $folder = $validated['folder'] ?? 'uploads';
            $path = $folder . '/' . $filename;

            // Store file
            $storedPath = $file->storeAs('public/' . $folder, $filename);

            // Create media asset record
            $mediaAsset = MediaAsset::create([
                'filename' => $filename,
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
                'path' => str_replace('public/', '', $storedPath),
                'alt_text' => $validated['alt_text'] ?? null,
                'caption' => $validated['caption'] ?? null,
                'folder' => $folder,
                'tags' => $validated['tags'] ?? [],
            ]);

            $uploadedFiles[] = $mediaAsset;
        }

        return response()->json([
            'message' => 'Files uploaded successfully.',
            'files' => $uploadedFiles,
        ]);
    }

    /**
     * Display the specified media asset.
     */
    public function show(MediaAsset $mediaAsset): Response
    {
        return Inertia::render('admin/media/Show', [
            'mediaAsset' => $mediaAsset,
        ]);
    }

    /**
     * Show the form for editing the specified media asset.
     */
    public function edit(MediaAsset $mediaAsset): Response
    {
        $folders = MediaAsset::whereNotNull('folder')
            ->distinct()
            ->pluck('folder')
            ->filter()
            ->sort()
            ->values();

        return Inertia::render('admin/media/Edit', [
            'mediaAsset' => $mediaAsset,
            'folders' => $folders,
        ]);
    }

    /**
     * Update the specified media asset.
     */
    public function update(MediaAssetRequest $request, MediaAsset $mediaAsset): RedirectResponse
    {
        $validated = $request->validated();

        // If folder is changed, move the file
        if (isset($validated['folder']) && $validated['folder'] !== $mediaAsset->folder) {
            $oldPath = 'public/' . $mediaAsset->path;
            $newPath = 'public/' . $validated['folder'] . '/' . $mediaAsset->filename;

            if (Storage::exists($oldPath)) {
                Storage::move($oldPath, $newPath);
                $validated['path'] = str_replace('public/', '', $newPath);
            }
        }

        $mediaAsset->update($validated);

        return redirect()->route('admin.media.show', $mediaAsset)
            ->with('success', 'Media asset updated successfully.');
    }

    /**
     * Remove the specified media asset.
     */
    public function destroy(MediaAsset $mediaAsset): RedirectResponse
    {
        // Delete the physical file
        $filePath = 'public/' . $mediaAsset->path;
        if (Storage::exists($filePath)) {
            Storage::delete($filePath);
        }

        // Delete the database record
        $mediaAsset->delete();

        return redirect()->route('admin.media.index')
            ->with('success', 'Media asset deleted successfully.');
    }

    /**
     * Bulk actions for media assets.
     */
    public function bulkAction(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'action' => 'required|in:move,tag,delete',
            'items' => 'required|array|min:1',
            'items.*' => 'exists:media_assets,id',
            'folder' => 'required_if:action,move|nullable|string|max:255',
            'tags' => 'required_if:action,tag|nullable|array',
        ]);

        $items = MediaAsset::whereIn('id', $validated['items']);

        switch ($validated['action']) {
            case 'move':
                foreach ($items->get() as $item) {
                    $oldPath = 'public/' . $item->path;
                    $newPath = 'public/' . $validated['folder'] . '/' . $item->filename;

                    if (Storage::exists($oldPath)) {
                        Storage::move($oldPath, $newPath);
                        $item->update([
                            'folder' => $validated['folder'],
                            'path' => str_replace('public/', '', $newPath),
                        ]);
                    }
                }
                $message = 'Media assets moved successfully.';
                break;
            case 'tag':
                $items->update(['tags' => $validated['tags']]);
                $message = 'Media assets tagged successfully.';
                break;
            case 'delete':
                foreach ($items->get() as $item) {
                    $filePath = 'public/' . $item->path;
                    if (Storage::exists($filePath)) {
                        Storage::delete($filePath);
                    }
                }
                $items->delete();
                $message = 'Media assets deleted successfully.';
                break;
        }

        return back()->with('success', $message);
    }

    /**
     * Search media assets for selection.
     */
    public function search(Request $request): JsonResponse
    {
        $query = MediaAsset::query();

        if ($request->filled('q')) {
            $query->where(function ($q) use ($request) {
                $q->where('original_name', 'like', '%' . $request->q . '%')
                  ->orWhere('alt_text', 'like', '%' . $request->q . '%');
            });
        }

        if ($request->filled('type')) {
            $query->byMimeType($request->type);
        }

        $mediaAssets = $query->latest()
            ->take(20)
            ->get();

        return response()->json($mediaAssets);
    }

    /**
     * Get media asset details for embedding.
     */
    public function embed(MediaAsset $mediaAsset): JsonResponse
    {
        return response()->json([
            'id' => $mediaAsset->id,
            'url' => $mediaAsset->url,
            'filename' => $mediaAsset->filename,
            'original_name' => $mediaAsset->original_name,
            'mime_type' => $mediaAsset->mime_type,
            'size' => $mediaAsset->size,
            'alt_text' => $mediaAsset->alt_text,
            'caption' => $mediaAsset->caption,
            'is_image' => $mediaAsset->is_image,
            'is_video' => $mediaAsset->is_video,
        ]);
    }
}