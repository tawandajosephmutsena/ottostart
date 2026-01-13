<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackVisits
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Don't track admin routes, API routes, or assets
        if ($request->is('admin*', 'api*', 'build*', 'storage*', 'telescope*')) {
            return $next($request);
        }

        // Don't track AJAX requests unless specific page views
        if ($request->ajax() && !$request->headers->has('X-Inertia')) {
            return $next($request);
        }

        $userAgent = $request->header('User-Agent');
        $isRobot = false;
        
        // Simple bot detection
        if (preg_match('/bot|crawl|slurp|spider|mediapartners/i', $userAgent)) {
            $isRobot = true;
        }

        try {
            \App\Models\Visit::create([
                'ip' => $request->ip(),
                'url' => $request->fullUrl(),
                'referer' => $request->header('referer'),
                'user_agent' => $userAgent,
                'user_id' => auth()->id(),
                'session_id' => session()->getId(),
                'method' => $request->method(),
                'is_robot' => $isRobot,
            ]);
        } catch (\Exception $e) {
            // calculated risk: don't block request if tracking fails
            // Log::error($e->getMessage());
        }

        return $next($request);
    }
}
