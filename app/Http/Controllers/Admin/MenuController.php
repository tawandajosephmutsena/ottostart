<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\NavigationMenu;
use App\Models\NavigationMenuItem;
use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class MenuController extends Controller
{
    /**
     * Display the menu builder page.
     */
    public function index(): Response
    {
        $menus = NavigationMenu::with(['items.children', 'items.page'])->get();
        $pages = Page::where('is_published', true)->orderBy('title')->get(['id', 'title', 'slug']);

        return Inertia::render('admin/menus/Index', [
            'menus' => $menus,
            'pages' => $pages,
        ]);
    }

    /**
     * Get a specific menu with its items.
     */
    public function show(NavigationMenu $menu): Response
    {
        $menu->load(['items.children', 'items.page']);
        $pages = Page::where('is_published', true)->orderBy('title')->get(['id', 'title', 'slug']);

        return Inertia::render('admin/menus/Index', [
            'menus' => NavigationMenu::with(['items.children', 'items.page'])->get(),
            'pages' => $pages,
            'activeMenu' => $menu,
        ]);
    }

    /**
     * Update the menu items.
     */
    public function update(Request $request, NavigationMenu $menu)
    {
        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'nullable|integer',
            'items.*.title' => 'required|string|max:255',
            'items.*.url' => 'nullable|string|max:255',
            'items.*.page_id' => 'nullable|integer|exists:pages,id',
            'items.*.order' => 'required|integer',
            'items.*.is_visible' => 'required|boolean',
            'items.*.open_in_new_tab' => 'boolean',
            'items.*.icon' => 'nullable|string|max:100',
        ]);

        DB::transaction(function () use ($menu, $validated) {
            // Get existing item IDs
            $existingIds = $menu->allItems()->pluck('id')->toArray();
            $updatedIds = [];

            foreach ($validated['items'] as $itemData) {
                if (!empty($itemData['id'])) {
                    // Update existing item
                    $item = NavigationMenuItem::find($itemData['id']);
                    if ($item && $item->menu_id === $menu->id) {
                        $item->update([
                            'title' => $itemData['title'],
                            'url' => $itemData['url'] ?? null,
                            'page_id' => $itemData['page_id'] ?? null,
                            'order' => $itemData['order'],
                            'is_visible' => $itemData['is_visible'],
                            'open_in_new_tab' => $itemData['open_in_new_tab'] ?? false,
                            'icon' => $itemData['icon'] ?? null,
                        ]);
                        $updatedIds[] = $item->id;
                    }
                } else {
                    // Create new item
                    $item = NavigationMenuItem::create([
                        'menu_id' => $menu->id,
                        'title' => $itemData['title'],
                        'url' => $itemData['url'] ?? null,
                        'page_id' => $itemData['page_id'] ?? null,
                        'order' => $itemData['order'],
                        'is_visible' => $itemData['is_visible'],
                        'open_in_new_tab' => $itemData['open_in_new_tab'] ?? false,
                        'icon' => $itemData['icon'] ?? null,
                    ]);
                    $updatedIds[] = $item->id;
                }
            }

            // Delete items that were removed
            $toDelete = array_diff($existingIds, $updatedIds);
            if (!empty($toDelete)) {
                NavigationMenuItem::whereIn('id', $toDelete)->delete();
            }
        });

        // Clear the navigation menu cache so frontend reflects changes
        Cache::forget('navigation_menus');

        return back()->with('success', 'Menu updated successfully.');
    }

    /**
     * Add a new menu item.
     */
    public function storeItem(Request $request, NavigationMenu $menu)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'url' => 'nullable|string|max:255',
            'page_id' => 'nullable|integer|exists:pages,id',
            'is_visible' => 'boolean',
            'open_in_new_tab' => 'boolean',
        ]);

        $maxOrder = $menu->allItems()->max('order') ?? -1;

        NavigationMenuItem::create([
            'menu_id' => $menu->id,
            'title' => $validated['title'],
            'url' => $validated['url'] ?? null,
            'page_id' => $validated['page_id'] ?? null,
            'order' => $maxOrder + 1,
            'is_visible' => $validated['is_visible'] ?? true,
            'open_in_new_tab' => $validated['open_in_new_tab'] ?? false,
        ]);

        // Clear the navigation menu cache so frontend reflects changes
        Cache::forget('navigation_menus');

        return back()->with('success', 'Menu item added.');
    }

    /**
     * Remove a menu item.
     */
    public function destroyItem(NavigationMenu $menu, NavigationMenuItem $item)
    {
        if ($item->menu_id !== $menu->id) {
            abort(404);
        }

        $item->delete();

        // Clear the navigation menu cache so frontend reflects changes
        Cache::forget('navigation_menus');

        return back()->with('success', 'Menu item removed.');
    }

    /**
     * Reorder menu items.
     */
    public function reorderItems(Request $request, NavigationMenu $menu)
    {
        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|integer|exists:navigation_menu_items,id',
            'items.*.order' => 'required|integer',
        ]);

        DB::transaction(function () use ($menu, $validated) {
            foreach ($validated['items'] as $itemData) {
                NavigationMenuItem::where('id', $itemData['id'])
                    ->where('menu_id', $menu->id)
                    ->update(['order' => $itemData['order']]);
            }
        });

        // Clear the navigation menu cache so frontend reflects changes
        Cache::forget('navigation_menus');

        return back()->with('success', 'Menu order updated.');
    }

    /**
     * Reset a menu to its default items.
     */
    public function resetToDefault(NavigationMenu $menu)
    {
        DB::transaction(function () use ($menu) {
            // Delete all existing items for this menu
            $menu->allItems()->delete();

            // Default navigation items
            $defaultItems = [
                ['title' => 'Home', 'url' => '/', 'order' => 0],
                ['title' => 'About', 'url' => '/about', 'order' => 1],
                ['title' => 'Services', 'url' => '/services', 'order' => 2],
                ['title' => 'Portfolio', 'url' => '/portfolio', 'order' => 3],
                ['title' => 'Team', 'url' => '/team', 'order' => 4],
                ['title' => 'Blog', 'url' => '/blog', 'order' => 5],
                ['title' => 'Contact', 'url' => '/contact', 'order' => 6],
            ];

            foreach ($defaultItems as $item) {
                NavigationMenuItem::create([
                    'menu_id' => $menu->id,
                    'title' => $item['title'],
                    'url' => $item['url'],
                    'order' => $item['order'],
                    'is_visible' => true,
                ]);
            }
        });

        // Clear the navigation menu cache so frontend reflects changes
        Cache::forget('navigation_menus');

        return back()->with('success', 'Menu reset to default.');
    }
}
