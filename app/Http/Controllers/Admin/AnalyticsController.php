<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Visit;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    /**
     * Display the analytics dashboard.
     */
    public function index(): Response
    {
        $days = 30;
        $startDate = now()->subDays($days - 1)->startOfDay();
        $endDate = now()->endOfDay();

        // 1. Page views over time (Last 30 days)
        $viewsOverTime = Visit::excludeBots()
            ->selectRaw('DATE(created_at) as date, count(*) as count')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->pluck('count', 'date');

        $chartData = [];
        for ($i = 0; $i < $days; $i++) {
            $date = $startDate->clone()->addDays($i)->format('Y-m-d');
            $chartData[] = [
                'date' => $date,
                'views' => $viewsOverTime->get($date, 0)
            ];
        }

        // 2. Top Pages
        $topPages = Visit::excludeBots()
            ->select('url', DB::raw('count(*) as count'))
            ->groupBy('url')
            ->orderByDesc('count')
            ->limit(10)
            ->get();

        // 3. Top Referrers
        $topReferrers = Visit::excludeBots()
            ->whereNotNull('referer')
            ->select('referer', DB::raw('count(*) as count'))
            ->groupBy('referer')
            ->orderByDesc('count')
            ->limit(10)
            ->get();

        // 4. Device Breakdown
        $visits = Visit::excludeBots()->get();
        $devices = [
            'Mobile' => 0,
            'Desktop' => 0,
            'Tablet' => 0,
            'Other' => 0
        ];

        foreach ($visits as $visit) {
            $ua = strtolower($visit->user_agent);
            if (str_contains($ua, 'mobile') || str_contains($ua, 'android') || str_contains($ua, 'iphone')) {
                $devices['Mobile']++;
            } elseif (str_contains($ua, 'tablet') || str_contains($ua, 'ipad')) {
                $devices['Tablet']++;
            } else {
                $devices['Desktop']++;
            }
        }

        // Normalize device stats
        $deviceData = [];
        foreach ($devices as $name => $count) {
            if ($count > 0) {
                $deviceData[] = ['name' => $name, 'value' => $count];
            }
        }

        // 5. Browser Breakdown
        $browsers = [];
        foreach ($visits as $visit) {
            $ua = strtolower($visit->user_agent);
            $browser = 'Other';
            if (str_contains($ua, 'chrome')) $browser = 'Chrome';
            elseif (str_contains($ua, 'firefox')) $browser = 'Firefox';
            elseif (str_contains($ua, 'safari') && !str_contains($ua, 'chrome')) $browser = 'Safari';
            elseif (str_contains($ua, 'edge')) $browser = 'Edge';
            
            $browsers[$browser] = ($browsers[$browser] ?? 0) + 1;
        }

        $browserData = [];
        foreach ($browsers as $name => $count) {
            $browserData[] = ['name' => $name, 'value' => $count];
        }

        // 6. Interaction Density (Heatmap-ish)
        $topInteractions = \App\Models\Interaction::where('type', 'click')
            ->select('element_selector', DB::raw('count(*) as count'))
            ->groupBy('element_selector')
            ->orderByDesc('count')
            ->limit(5)
            ->get();

        // 7. Active Now (last 5 minutes)
        $activeNow = Visit::excludeBots()
            ->where('created_at', '>=', now()->subMinutes(5))
            ->distinct('session_id')
            ->count();

        return Inertia::render('admin/Analytics', [
            'chartData' => $chartData,
            'topPages' => $topPages,
            'topReferrers' => $topReferrers,
            'deviceData' => $deviceData,
            'browserData' => $browserData,
            'topInteractions' => $topInteractions,
            'activeNow' => $activeNow,
            'totalVisits' => Visit::excludeBots()->count(),
            'uniqueVisitors' => Visit::excludeBots()->distinct('session_id')->count(),
        ]);
    }
}
