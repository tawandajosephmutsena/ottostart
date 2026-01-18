<?php

namespace App\Http\Controllers;

use App\Models\Interaction;
use App\Models\Visit;
use Illuminate\Http\Request;

class InteractionController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|string',
            'url' => 'required|string',
            'x' => 'nullable|integer',
            'y' => 'nullable|integer',
            'viewport_width' => 'nullable|integer',
            'viewport_height' => 'nullable|integer',
            'element_selector' => 'nullable|string',
            'scroll_depth' => 'nullable|integer',
        ]);

        // Find the current visit for this session and URL
        $visit = Visit::where('session_id', session()->getId())
            ->where('url', $request->url)
            ->latest()
            ->first();

        if (!$visit) {
            return response()->json(['status' => 'error', 'message' => 'Visit not found'], 404);
        }

        Interaction::create([
            'visit_id' => $visit->id,
            'type' => $request->type,
            'url' => $request->url,
            'x' => $request->x,
            'y' => $request->y,
            'viewport_width' => $request->viewport_width,
            'viewport_height' => $request->viewport_height,
            'element_selector' => $request->element_selector,
            'scroll_depth' => $request->scroll_depth,
        ]);

        return response()->json(['status' => 'success']);
    }
}
