<?php

namespace App\Http\Controllers;

use App\Models\ContactInquiry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class ContactController extends Controller
{
    /**
     * Submit a contact inquiry.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'type' => 'required|string',
            'message' => 'required|string|min:10',
        ]);

        ContactInquiry::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'subject' => ucfirst($validated['type']) . ' Inquiry',
            'message' => $validated['message'],
            'status' => 'new',
            'metadata' => [
                'type' => $validated['type'],
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ],
        ]);

        return Redirect::back()->with('success', 'Thank you for your inquiry. We will get back to you soon.');
    }
}
