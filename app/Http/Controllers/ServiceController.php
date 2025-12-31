<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller
{
    /**
     * Display a listing of the services.
     */
    public function index(): Response
    {
        $version = \Illuminate\Support\Facades\Cache::get('services.cache_version', 1);
        $cacheKey = 'services.index.' . $version;

        $services = \Illuminate\Support\Facades\Cache::remember($cacheKey, 60 * 60 * 24, function () {
            return Service::published()
                ->ordered()
                ->get();
        });

        return Inertia::render('Services', [
            'services' => $services,
        ]);
    }

    /**
     * Display the specified service.
     */
    public function show(string $slug): Response
    {
        $service = Service::published()
            ->where('slug', $slug)
            ->firstOrFail();

        return Inertia::render('Services/Show', [
            'service' => $service,
        ]);
    }
}
