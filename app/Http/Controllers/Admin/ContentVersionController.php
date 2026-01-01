<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContentVersion;
use App\Models\Insight;
use App\Models\PortfolioItem;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ContentVersionController extends Controller
{
    /**
     * Get version history for a content item.
     */
    public function index(Request $request, string $contentType, int $contentId): JsonResponse
    {
        $model = $this->getModelInstance($contentType, $contentId);
        
        if (!$model) {
            return response()->json(['error' => 'Content not found'], 404);
        }

        $versions = $model->getVersionHistory();

        return response()->json([
            'versions' => $versions,
            'total' => $versions->count(),
        ]);
    }

    /**
     * Restore a specific version.
     */
    public function restore(Request $request, string $contentType, int $contentId): JsonResponse
    {
        $validated = $request->validate([
            'version_number' => 'required|integer|min:1',
            'notes' => 'nullable|string|max:1000',
        ]);

        $model = $this->getModelInstance($contentType, $contentId);
        
        if (!$model) {
            return response()->json(['error' => 'Content not found'], 404);
        }

        $success = $model->restoreToVersion($validated['version_number']);

        if ($success) {
            // Create a new version to document the restoration
            if ($validated['notes']) {
                $model->createVersion(
                    "Restored to version {$validated['version_number']}", 
                    $validated['notes']
                );
            }

            return response()->json([
                'message' => 'Version restored successfully',
                'current_version' => $model->currentVersion(),
            ]);
        }

        return response()->json(['error' => 'Failed to restore version'], 400);
    }

    /**
     * Publish a specific version.
     */
    public function publish(Request $request, string $contentType, int $contentId): JsonResponse
    {
        $validated = $request->validate([
            'version_number' => 'required|integer|min:1',
        ]);

        $model = $this->getModelInstance($contentType, $contentId);
        
        if (!$model) {
            return response()->json(['error' => 'Content not found'], 404);
        }

        $success = $model->publishVersion($validated['version_number']);

        if ($success) {
            return response()->json([
                'message' => 'Version published successfully',
                'published_version' => $model->latestPublishedVersion(),
            ]);
        }

        return response()->json(['error' => 'Failed to publish version'], 400);
    }

    /**
     * Compare two versions.
     */
    public function compare(Request $request, string $contentType, int $contentId): JsonResponse
    {
        $validated = $request->validate([
            'v1' => 'required|integer|min:1',
            'v2' => 'required|integer|min:1',
        ]);

        $model = $this->getModelInstance($contentType, $contentId);
        
        if (!$model) {
            return response()->json(['error' => 'Content not found'], 404);
        }

        $version1 = $model->versions()->where('version_number', $validated['v1'])->with('author:id,name,email')->first();
        $version2 = $model->versions()->where('version_number', $validated['v2'])->with('author:id,name,email')->first();

        if (!$version1 || !$version2) {
            return response()->json(['error' => 'One or both versions not found'], 404);
        }

        $differences = $this->calculateDifferences($version1->content_data, $version2->content_data);

        return response()->json([
            'version1' => [
                'version_number' => $version1->version_number,
                'author' => $version1->author,
                'created_at' => $version1->created_at,
                'change_summary' => $version1->getChangesSummary(),
            ],
            'version2' => [
                'version_number' => $version2->version_number,
                'author' => $version2->author,
                'created_at' => $version2->created_at,
                'change_summary' => $version2->getChangesSummary(),
            ],
            'differences' => $differences,
        ]);
    }

    /**
     * Create a draft version.
     */
    public function createDraft(Request $request, string $contentType, int $contentId): JsonResponse
    {
        $model = $this->getModelInstance($contentType, $contentId);
        
        if (!$model) {
            return response()->json(['error' => 'Content not found'], 404);
        }

        $validated = $request->validate([
            'data' => 'required|array',
            'change_notes' => 'nullable|string|max:1000',
        ]);

        if (method_exists($model, 'createDraft')) {
            $draft = $model->createDraft($validated['data'], $validated['change_notes'] ?? null);

            return response()->json([
                'message' => 'Draft created successfully',
                'draft' => $draft,
            ]);
        }

        return response()->json(['error' => 'Draft creation not supported for this content type'], 400);
    }

    /**
     * Get a specific version's content.
     */
    public function show(Request $request, string $contentType, int $contentId, int $versionNumber): JsonResponse
    {
        $model = $this->getModelInstance($contentType, $contentId);
        
        if (!$model) {
            return response()->json(['error' => 'Content not found'], 404);
        }

        $version = $model->versions()->where('version_number', $versionNumber)->with('author:id,name,email')->first();

        if (!$version) {
            return response()->json(['error' => 'Version not found'], 404);
        }

        return response()->json([
            'version' => [
                'id' => $version->id,
                'version_number' => $version->version_number,
                'content_data' => $version->content_data,
                'author' => $version->author,
                'change_summary' => $version->getChangesSummary(),
                'change_notes' => $version->change_notes,
                'is_current' => $version->is_current,
                'is_published' => $version->is_published,
                'created_at' => $version->created_at,
                'published_at' => $version->published_at,
            ],
        ]);
    }

    /**
     * Get model instance by type and ID.
     */
    private function getModelInstance(string $contentType, int $contentId)
    {
        switch ($contentType) {
            case 'insight':
            case 'insights':
                return Insight::find($contentId);
            case 'portfolio':
            case 'portfolio-item':
                return PortfolioItem::find($contentId);
            case 'service':
            case 'services':
                return Service::find($contentId);
            default:
                return null;
        }
    }

    /**
     * Calculate differences between two data arrays.
     */
    private function calculateDifferences(array $data1, array $data2): array
    {
        $differences = [];

        // Find changed and added fields
        foreach ($data2 as $key => $value) {
            if (!array_key_exists($key, $data1)) {
                $differences[] = [
                    'field' => $key,
                    'old_value' => null,
                    'new_value' => $value,
                    'type' => 'added',
                ];
            } elseif ($data1[$key] !== $value) {
                $differences[] = [
                    'field' => $key,
                    'old_value' => $data1[$key],
                    'new_value' => $value,
                    'type' => 'modified',
                ];
            }
        }

        // Find removed fields
        foreach ($data1 as $key => $value) {
            if (!array_key_exists($key, $data2)) {
                $differences[] = [
                    'field' => $key,
                    'old_value' => $value,
                    'new_value' => null,
                    'type' => 'removed',
                ];
            }
        }

        return $differences;
    }
}