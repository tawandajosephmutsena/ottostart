<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PreviewLink;
use App\Models\Insight;
use App\Models\PortfolioItem;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Carbon\Carbon;

class PreviewLinkController extends Controller
{
    /**
     * Get all preview links for a content item.
     */
    public function index(Request $request, string $contentType, int $contentId): JsonResponse
    {
        $model = $this->getModelInstance($contentType, $contentId);
        
        if (!$model) {
            return response()->json(['error' => 'Content not found'], 404);
        }

        $links = PreviewLink::where('content_type', get_class($model))
            ->where('content_id', $contentId)
            ->where('expires_at', '>', now())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'links' => $links->map(function ($link) {
                return [
                    'id' => $link->id,
                    'url' => $link->getFullUrl(),
                    'token' => $link->token,
                    'expires_at' => $link->expires_at,
                    'password' => $link->password ? '••••••••' : null,
                    'is_active' => $link->is_active,
                    'view_count' => $link->view_count,
                    'created_at' => $link->created_at,
                ];
            }),
        ]);
    }

    /**
     * Create a new preview link.
     */
    public function store(Request $request, string $contentType, int $contentId): JsonResponse
    {
        $validated = $request->validate([
            'expires_in' => 'required|integer|min:1|max:30', // days
            'password' => 'nullable|string|min:4|max:50',
            'require_password' => 'boolean',
            'message' => 'nullable|string|max:1000',
        ]);

        $model = $this->getModelInstance($contentType, $contentId);
        
        if (!$model) {
            return response()->json(['error' => 'Content not found'], 404);
        }

        $expiresAt = Carbon::now()->addDays($validated['expires_in']);
        $token = Str::random(32);

        $link = PreviewLink::create([
            'content_type' => get_class($model),
            'content_id' => $contentId,
            'token' => $token,
            'password' => $validated['require_password'] ? bcrypt($validated['password']) : null,
            'expires_at' => $expiresAt,
            'message' => $validated['message'] ?? null,
            'created_by' => auth()->id(),
        ]);

        return response()->json([
            'message' => 'Preview link created successfully',
            'link' => [
                'id' => $link->id,
                'url' => $link->getFullUrl(),
                'token' => $link->token,
                'expires_at' => $link->expires_at,
                'password' => $link->password ? '••••••••' : null,
                'is_active' => $link->is_active,
                'view_count' => $link->view_count,
                'created_at' => $link->created_at,
            ],
        ]);
    }

    /**
     * Delete/revoke a preview link.
     */
    public function destroy(string $linkId): JsonResponse
    {
        $link = PreviewLink::find($linkId);
        
        if (!$link) {
            return response()->json(['error' => 'Preview link not found'], 404);
        }

        // Check if user has permission to delete this link
        if ($link->created_by !== auth()->id() && !auth()->user()->isAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $link->delete();

        return response()->json([
            'message' => 'Preview link revoked successfully',
        ]);
    }

    /**
     * Access a preview link.
     */
    public function show(Request $request, string $token): JsonResponse
    {
        $link = PreviewLink::where('token', $token)
            ->where('expires_at', '>', now())
            ->where('is_active', true)
            ->first();

        if (!$link) {
            return response()->json(['error' => 'Preview link not found or expired'], 404);
        }

        // Check password if required
        if ($link->password) {
            $password = $request->input('password');
            if (!$password || !password_verify($password, $link->password)) {
                return response()->json(['error' => 'Password required', 'requires_password' => true], 401);
            }
        }

        // Increment view count
        $link->increment('view_count');

        // Get the content
        $content = $link->content;
        if (!$content) {
            return response()->json(['error' => 'Content not found'], 404);
        }

        return response()->json([
            'content' => $content,
            'message' => $link->message,
            'expires_at' => $link->expires_at,
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
}