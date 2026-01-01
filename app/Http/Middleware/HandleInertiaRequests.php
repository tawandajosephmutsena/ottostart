<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
            ],
            'csrf_token' => $request->session()->token(),
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'site' => [
                'name' => 'Avant-Garde CMS',
                'tagline' => 'Digital Innovation Redefined',
                'description' => 'We create avant-garde digital experiences that push boundaries and inspire innovation through cutting-edge design and technology.',
                'url' => config('app.url'),
                'logo' => '/logo.svg',
                'social' => [
                    'twitter' => 'https://twitter.com/avantgarde',
                    'linkedin' => 'https://linkedin.com/company/avantgarde',
                    'github' => 'https://github.com/avantgarde',
                    'instagram' => 'https://instagram.com/avantgarde',
                ],
                'contact' => [
                    'email' => 'hello@avant-garde.com',
                    'phone' => '+1 (555) 123-4567',
                    'address' => 'San Francisco, CA',
                ],
            ],
            'theme' => [
                'colors' => [
                    'primary' => '#1a1a1a',
                    'secondary' => '#666666',
                    'accent' => '#ff6b35',
                    'neutral' => '#f5f5f5',
                    'dark' => '#0a0a0a',
                ],
                'fonts' => [
                    'display' => 'Inter',
                    'body' => 'Inter',
                ],
            ],
        ];
    }
}
