<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;
use Inertia\Inertia;

class InjectSeoData
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        // Share SEO configuration with all Inertia responses
        Inertia::share([
            'seo' => function () {
                return [
                    'site_name' => config('seo.site_name'),
                    'default_description' => config('seo.default_description'),
                    'title_separator' => config('seo.title_separator'),
                    'default_og_image' => asset(config('seo.default_og_image')),
                    'site_url' => config('app.url'),
                    'twitter_handle' => config('seo.twitter_handle'),
                    'facebook_app_id' => config('seo.facebook_app_id'),
                    'verification' => config('seo.verification'),
                    'analytics' => config('seo.analytics'),
                    'organization' => config('seo.organization'),
                ];
            },
        ]);

        return $next($request);
    }
}