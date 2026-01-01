<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\SecurityMonitoringService;
use App\Models\SecurityEvent;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class SecurityDashboardController extends Controller
{
    private SecurityMonitoringService $securityService;

    public function __construct(SecurityMonitoringService $securityService)
    {
        $this->securityService = $securityService;
    }

    /**
     * Display security dashboard
     */
    public function index(): Response
    {
        $dashboardData = $this->securityService->getDashboardData();

        return Inertia::render('admin/security/Dashboard', [
            'dashboardData' => $dashboardData,
        ]);
    }

    /**
     * Get security events with filtering
     */
    public function events(Request $request): JsonResponse
    {
        $query = SecurityEvent::with('user:id,name,email');

        // Apply filters
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('severity')) {
            $query->where('severity', $request->severity);
        }

        if ($request->filled('ip_address')) {
            $query->where('ip_address', $request->ip_address);
        }

        if ($request->filled('date_from')) {
            $query->where('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('created_at', '<=', $request->date_to);
        }

        if ($request->filled('resolved')) {
            if ($request->resolved === 'true') {
                $query->whereNotNull('resolved_at');
            } else {
                $query->whereNull('resolved_at');
            }
        }

        $events = $query->latest()
            ->paginate(50)
            ->withQueryString();

        return response()->json($events);
    }

    /**
     * Get security statistics
     */
    public function statistics(Request $request): JsonResponse
    {
        $period = $request->get('period', '7d');
        
        $startDate = match ($period) {
            '24h' => now()->subDay(),
            '7d' => now()->subWeek(),
            '30d' => now()->subMonth(),
            '90d' => now()->subDays(90),
            default => now()->subWeek(),
        };

        $stats = [
            'total_events' => SecurityEvent::where('created_at', '>=', $startDate)->count(),
            'by_severity' => SecurityEvent::where('created_at', '>=', $startDate)
                ->selectRaw('severity, COUNT(*) as count')
                ->groupBy('severity')
                ->pluck('count', 'severity'),
            'by_type' => SecurityEvent::where('created_at', '>=', $startDate)
                ->selectRaw('type, COUNT(*) as count')
                ->groupBy('type')
                ->orderByDesc('count')
                ->limit(10)
                ->pluck('count', 'type'),
            'top_ips' => SecurityEvent::where('created_at', '>=', $startDate)
                ->selectRaw('ip_address, COUNT(*) as count')
                ->groupBy('ip_address')
                ->orderByDesc('count')
                ->limit(10)
                ->get(),
            'timeline' => SecurityEvent::where('created_at', '>=', $startDate)
                ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->groupBy('date')
                ->orderBy('date')
                ->pluck('count', 'date'),
        ];

        return response()->json($stats);
    }

    /**
     * Resolve security event
     */
    public function resolveEvent(SecurityEvent $event): JsonResponse
    {
        $event->resolve();

        $this->securityService->logSecurityEvent(
            'event_resolved',
            'low',
            "Security event #{$event->id} resolved by " . auth()->user()->name,
            [
                'resolved_event_id' => $event->id,
                'resolved_by' => auth()->id(),
            ]
        );

        return response()->json([
            'message' => 'Security event resolved successfully.',
            'event' => $event->fresh(),
        ]);
    }

    /**
     * Bulk resolve security events
     */
    public function bulkResolve(Request $request): JsonResponse
    {
        $request->validate([
            'event_ids' => 'required|array',
            'event_ids.*' => 'exists:security_events,id',
        ]);

        $events = SecurityEvent::whereIn('id', $request->event_ids)
            ->whereNull('resolved_at')
            ->get();

        foreach ($events as $event) {
            $event->resolve();
        }

        $this->securityService->logSecurityEvent(
            'bulk_events_resolved',
            'medium',
            count($events) . " security events bulk resolved by " . auth()->user()->name,
            [
                'resolved_event_ids' => $request->event_ids,
                'resolved_by' => auth()->id(),
                'count' => count($events),
            ]
        );

        return response()->json([
            'message' => count($events) . ' security events resolved successfully.',
            'resolved_count' => count($events),
        ]);
    }

    /**
     * Export security events
     */
    public function export(Request $request): JsonResponse
    {
        $request->validate([
            'format' => 'required|in:csv,json',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
            'type' => 'nullable|string',
            'severity' => 'nullable|string',
        ]);

        $query = SecurityEvent::with('user:id,name,email');

        if ($request->filled('date_from')) {
            $query->where('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('created_at', '<=', $request->date_to);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('severity')) {
            $query->where('severity', $request->severity);
        }

        $events = $query->latest()->get();

        $filename = 'security_events_' . now()->format('Y-m-d_H-i-s');

        if ($request->format === 'csv') {
            return $this->exportCsv($events, $filename);
        } else {
            return $this->exportJson($events, $filename);
        }
    }

    /**
     * Export events as CSV
     */
    private function exportCsv($events, string $filename): JsonResponse
    {
        $csv = "ID,Type,Severity,Description,IP Address,User,Created At,Resolved At\n";
        
        foreach ($events as $event) {
            $csv .= implode(',', [
                $event->id,
                $event->type,
                $event->severity,
                '"' . str_replace('"', '""', $event->description) . '"',
                $event->ip_address,
                $event->user ? $event->user->name : 'Anonymous',
                $event->created_at->toISOString(),
                $event->resolved_at ? $event->resolved_at->toISOString() : '',
            ]) . "\n";
        }

        return response()->json([
            'filename' => $filename . '.csv',
            'content' => base64_encode($csv),
            'mime_type' => 'text/csv',
        ]);
    }

    /**
     * Export events as JSON
     */
    private function exportJson($events, string $filename): JsonResponse
    {
        $data = $events->map(function ($event) {
            return [
                'id' => $event->id,
                'type' => $event->type,
                'severity' => $event->severity,
                'description' => $event->description,
                'ip_address' => $event->ip_address,
                'user_agent' => $event->user_agent,
                'user' => $event->user ? $event->user->name : null,
                'metadata' => $event->metadata,
                'created_at' => $event->created_at->toISOString(),
                'resolved_at' => $event->resolved_at?->toISOString(),
            ];
        });

        return response()->json([
            'filename' => $filename . '.json',
            'content' => base64_encode(json_encode($data, JSON_PRETTY_PRINT)),
            'mime_type' => 'application/json',
        ]);
    }
}