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
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
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
        $uploadService = app(\App\Services\SecureFileUploadService::class);

        foreach ($request->file('files') as $file) {
            try {
                // Determine file category securely
                $category = $uploadService->getCategoryByFile($file);

                // Upload file securely
                $uploadResult = $uploadService->upload(
                    $file, 
                    $category, 
                    $validated['folder'] ?? 'uploads'
                );

                // Create media asset record
                $mediaAsset = MediaAsset::create([
                    'filename' => $uploadResult['filename'],
                    'original_name' => $uploadResult['original_name'],
                    'mime_type' => $uploadResult['mime_type'],
                    'size' => $uploadResult['size'],
                    'path' => $uploadResult['path'],
                    'alt_text' => $validated['alt_text'] ?? null,
                    'caption' => $validated['caption'] ?? null,
                    'folder' => $validated['folder'] ?? 'uploads',
                    'tags' => $validated['tags'] ?? [],
                ]);

                $uploadedFiles[] = $mediaAsset;
                
            } catch (\Exception $e) {
                Log::error('File upload failed', [
                    'file' => $file->getClientOriginalName(),
                    'error' => $e->getMessage(),
                    'user_id' => Auth::id(),
                ]);
                
                return response()->json([
                    'message' => 'Upload failed: ' . $e->getMessage(),
                    'error' => true,
                ], 422);
            }
        }

        return response()->json([
            'message' => 'Files uploaded successfully.',
            'files' => $uploadedFiles,
        ]);
    }

    /**
     * Display the specified media asset.
     */
    public function show(MediaAsset $medium): Response
    {
        return Inertia::render('admin/media/Show', [
            'mediaAsset' => $medium,
        ]);
    }

    /**
     * Show the form for editing the specified media asset.
     */
    public function edit(MediaAsset $medium): Response
    {
        $folders = MediaAsset::whereNotNull('folder')
            ->distinct()
            ->pluck('folder')
            ->filter()
            ->sort()
            ->values();

        return Inertia::render('admin/media/Edit', [
            'mediaAsset' => $medium,
            'folders' => $folders,
        ]);
    }

    /**
     * Update the specified media asset.
     */
    public function update(MediaAssetRequest $request, MediaAsset $medium): RedirectResponse
    {
        $validated = $request->validated();

        // If folder is changed, move the file
        if (isset($validated['folder']) && $validated['folder'] !== $medium->folder) {
            $oldPath = 'public/' . $medium->path;
            $newPath = 'public/' . $validated['folder'] . '/' . $medium->filename;

            if (Storage::exists($oldPath)) {
                Storage::move($oldPath, $newPath);
                $validated['path'] = str_replace('public/', '', $newPath);
            }
        }

        $medium->update($validated);

        return redirect()->route('admin.media.show', $medium)
            ->with('success', 'Media asset updated successfully.');
    }

    /**
     * Remove the specified media asset.
     */
    public function destroy(MediaAsset $medium): RedirectResponse
    {
        // Delete the physical file
        $filePath = 'public/' . $medium->path;
        if (Storage::exists($filePath)) {
            Storage::delete($filePath);
        }

        // Delete the database record
        $medium->delete();

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
     * Search media assets for selection with advanced filtering.
     */
    public function search(Request $request): JsonResponse
    {
        $query = MediaAsset::query();

        // Text search
        if ($request->filled('q')) {
            $query->where(function ($q) use ($request) {
                $q->where('original_name', 'like', '%' . $request->q . '%')
                  ->orWhere('alt_text', 'like', '%' . $request->q . '%')
                  ->orWhere('caption', 'like', '%' . $request->q . '%')
                  ->orWhereJsonContains('tags', $request->q);
            });
        }

        // Type filtering
        if ($request->filled('type') && $request->type !== 'all') {
            $query->byMimeType($request->type);
        }

        // Filter type (more specific than mime type)
        if ($request->filled('filter_type') && $request->filter_type !== 'all') {
            switch ($request->filter_type) {
                case 'image':
                    $query->images();
                    break;
                case 'video':
                    $query->videos();
                    break;
                case 'document':
                    $query->where(function ($q) {
                        $q->where('mime_type', 'like', 'application/%')
                          ->orWhere('mime_type', 'like', 'text/%');
                    });
                    break;
            }
        }

        // Tag filtering
        if ($request->filled('tags')) {
            $tags = explode(',', $request->tags);
            foreach ($tags as $tag) {
                $query->whereJsonContains('tags', trim($tag));
            }
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'date');
        $sortOrder = $request->get('sort_order', 'desc');

        switch ($sortBy) {
            case 'name':
                $query->orderBy('original_name', $sortOrder);
                break;
            case 'size':
                $query->orderBy('size', $sortOrder);
                break;
            case 'date':
            default:
                $query->orderBy('created_at', $sortOrder);
                break;
        }

        $mediaAssets = $query->take(50)->get();

        // Get available tags for filtering
        $availableTags = MediaAsset::whereNotNull('tags')
            ->get()
            ->pluck('tags')
            ->flatten()
            ->unique()
            ->filter()
            ->sort()
            ->values();

        return response()->json([
            'assets' => $mediaAssets,
            'tags' => $availableTags,
        ]);
    }

    /**
     * Bulk delete media assets.
     */
    public function bulkDelete(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'exists:media_assets,id',
        ]);

        $items = MediaAsset::whereIn('id', $validated['ids'])->get();

        foreach ($items as $item) {
            // Delete the physical file
            $filePath = 'public/' . $item->path;
            if (Storage::exists($filePath)) {
                Storage::delete($filePath);
            }

            // Delete the database record
            $item->delete();
        }

        return response()->json([
            'message' => 'Media assets deleted successfully',
            'deleted_count' => count($items),
        ]);
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