<?php

namespace App\Http\Controllers;

use App\Models\ContactInquiry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ContactController extends Controller
{
    public function show()
    {
        return Inertia::render('Contact');
    }

    public function store(Request $request)
    {
        try {
            // Rate limiting check (5 submissions per 5 minutes per IP)
            $key = 'contact_form_' . $request->ip();
            if (Cache::has($key)) {
                return back()->withErrors([
                    'message' => 'Please wait before submitting another message.'
                ])->with('error', 'Rate limit exceeded');
            }

            // Flexible validation: accept dynamic form fields
            $request->validate([
                'email' => 'required_without:tel|email|nullable|max:255',
                'name' => 'required|string|max:255|regex:/^[\pL\s\-]+$/u',
                'message' => 'sometimes|string|max:5000|min:10',
            ]);

            $data = $request->except(['_token', 'form_title']);
            
            // Extract common fields with fallbacks
            $name = $data['name'] ?? $data['full_name'] ?? 'Anonymous';
            $email = $data['email'] ?? $data['email_address'] ?? 'no-email@provided.com';
            $message = $data['message'] ?? $data['comments'] ?? json_encode($data);
            $type = $request->input('form_title', 'General');

            // Store with additional security metadata
            ContactInquiry::create([
                'name' => strip_tags($name),
                'email' => $email,
                'subject' => $type . ' Submission',
                'message' => strip_tags($message),
                'status' => 'new',
                'metadata' => [
                    'all_fields' => $data,
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'submitted_at' => now()->toDateTimeString(),
                    'referer' => $request->header('referer'),
                ],
            ]);

            // Set rate limit (5 minutes)
            Cache::put($key, true, now()->addMinutes(5));

            return back()->with('success', 'Thank you for your message. We\'ll get back to you soon!');
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Contact form submission failed', [
                'error' => $e->getMessage(),
                'ip' => $request->ip(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors([
                'message' => 'An error occurred while processing your request. Please try again later.'
            ])->with('error', 'Submission failed');
        }
    }
}
