<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\PluginService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PluginController extends Controller
{
    public function __construct(protected PluginService $pluginService)
    {
    }

    public function index(): Response
    {
        return Inertia::render('admin/plugins/Index', [
            'plugins' => $this->pluginService->all(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'plugin' => ['required', 'file', 'mimes:zip'],
        ]);

        $this->pluginService->install($request->file('plugin'));

        return back()->with('success', 'Plugin installed successfully.');
    }

    public function update(Request $request, string $plugin): RedirectResponse
    {
        $this->pluginService->toggle($plugin);

        return back();
    }

    public function destroy(string $plugin): RedirectResponse
    {
        $this->pluginService->remove($plugin);

        return back()->with('success', 'Plugin removed successfully.');
    }
}
