<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    /**
     * Display the settings page.
     */
    public function index(): Response
    {
        $settings = Setting::all()->groupBy('group_name');
        $themePresets = config('theme-presets');
        $pages = \App\Models\Page::where('is_published', true)
            ->orderBy('title')
            ->get(['id', 'title', 'slug']);

        return Inertia::render('admin/settings/Index', [
            'settings' => $settings,
            'themePresets' => $themePresets,
            'pages' => $pages,
        ]);
    }

    /**
     * Update settings.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'nullable',
            'settings.*.type' => 'required|in:text,json,boolean,number,color,select',
            'settings.*.group_name' => 'required|string',
        ]);

        foreach ($validated['settings'] as $item) {
            Setting::updateOrCreate(
                ['key' => $item['key']],
                [
                    'value' => $item['value'],
                    'type' => $item['type'],
                    'group_name' => $item['group_name'],
                ]
            );
        }

        // Clear all settings-related caches
        Cache::forget('site_settings_all');
        Cache::forget('navigation_menus');

        return back()->with('success', 'Settings updated successfully.');

    }
}
