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
        // Fetch all settings and theme presets from cache (processed together for performance)
        $cachedData = \Illuminate\Support\Facades\Cache::remember('site_settings_all', 60 * 60, function () {
            $allSettings = \App\Models\Setting::all();
            
            // Flat format for easy access
            $flatSettings = $allSettings->pluck('value', 'key')->map(function ($value) {
                return is_array($value) ? $value[0] ?? null : $value;
            })->toArray();

            // Grouped format for ThemeStyles component
            $groupedSettings = $allSettings->groupBy('group_name')->map(function ($items) {
                return $items->map(function ($item) {
                    return [
                        'key' => $item->key,
                        'value' => $item->value,
                    ];
                })->values();
            })->toArray();

            return [
                'flat' => $flatSettings,
                'grouped' => $groupedSettings,
                'themePresets' => config('theme-presets'),
            ];
        });

        $settings = $cachedData['flat'];
        $groupedSettings = $cachedData['grouped'];
        $themePresets = $cachedData['themePresets'];


        return [
            ...parent::share($request),
            'name' => config('app.name'),

            'auth' => [
                'user' => $request->user(),
            ],
            'csrf_token' => $request->session()->token(),
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'site' => [
                'name' => $settings['site_name'] ?? 'Avant-Garde CMS',
                'tagline' => $settings['site_tagline'] ?? 'Digital Innovation Redefined',
                'description' => $settings['site_description'] ?? 'We create avant-garde digital experiences that push boundaries and inspire innovation through cutting-edge design and technology.',
                'url' => config('app.url'),
                'logo' => ($settings['site_logo'] ?? null) 
                    ? (str_starts_with($settings['site_logo'], 'http') || str_starts_with($settings['site_logo'], '/') 
                        ? $settings['site_logo'] 
                        : '/' . $settings['site_logo']) 
                    : asset('logo.svg'),
                'social' => [
                    'twitter' => $settings['twitter_url'] ?? 'https://twitter.com/avantgarde',
                    'linkedin' => $settings['linkedin_url'] ?? 'https://linkedin.com/company/avantgarde',
                    'github' => $settings['github_url'] ?? 'https://github.com/avantgarde',
                    'instagram' => $settings['instagram_url'] ?? 'https://instagram.com/avantgarde',
                ],
                'contact' => [
                    'email' => $settings['contact_email'] ?? 'hello@avant-garde.com',
                    'phone' => $settings['contact_phone'] ?? '+1 (555) 123-4567',
                    'address' => $settings['contact_address'] ?? 'San Francisco, CA',
                ],
            ],
            'theme' => [
                'preset' => $settings['theme_preset'] ?? config('theme-presets.default'),
                'colors' => [
                    'primary' => $settings['brand_primary'] ?? '#1a1a1a',
                    'secondary' => $settings['brand_secondary'] ?? '#666666',
                    'accent' => $settings['brand_accent'] ?? '#ff6b35',
                    'neutral' => $settings['brand_neutral'] ?? '#f5f5f5',
                    'dark' => $settings['brand_dark'] ?? '#0a0a0a',
                ],
                'fonts' => [
                    'display' => $settings['font_display'] ?? 'Inter',
                    'body' => $settings['font_body'] ?? 'Inter',
                ],
            ],
            'ai' => [
                'citationPreference' => config('seo.ai_optimization.citation_preference', 'with-attribution'),
                'contentRating' => config('seo.ai_optimization.content_rating', 'safe'),
                'llmsTxtUrl' => url('/llms.txt'),
            ],
            'nonce' => \Illuminate\Support\Facades\Vite::cspNonce(),
            'themePresets' => $themePresets,
            'settings' => $groupedSettings,
            'menus' => \Illuminate\Support\Facades\Cache::remember('navigation_menus', 60 * 60, function () {

                $mainMenu = \App\Models\NavigationMenu::where('slug', 'main-menu')
                    ->where('is_active', true)
                    ->with(['items' => function ($query) {
                        $query->where('is_visible', true)
                            ->orderBy('order')
                            ->with('page:id,title,slug');
                    }, 'items.children' => function ($query) {
                        $query->where('is_visible', true)
                            ->orderBy('order')
                            ->with('page:id,title,slug');
                    }])
                    ->first();

                return [
                    'main' => $mainMenu ? $mainMenu->items->map(function ($item) {
                        return [
                            'name' => $item->title,
                            'href' => $item->resolved_url,
                            'target' => $item->open_in_new_tab ? '_blank' : '_self',
                            'children' => $item->children->map(function ($child) {
                                return [
                                    'name' => $child->title,
                                    'href' => $child->resolved_url,
                                    'target' => $child->open_in_new_tab ? '_blank' : '_self',
                                ];
                            }),
                        ];
                    }) : [],
                ];
            }),
        ];
    }
}
