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

        return Inertia::render('admin/settings/Index', [
            'settings' => $settings,
            'themePresets' => $themePresets,
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
            'settings.*.type' => 'required|in:text,json,boolean,number,color',
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

        // Clear settings cache to propagate changes to all pages
        Cache::forget('site_settings_all');

        return back()->with('success', 'Settings updated successfully.');

    }
}
