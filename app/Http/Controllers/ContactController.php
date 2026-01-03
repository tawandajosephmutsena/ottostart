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

            $data = $request->except(['_token', 'form_title']);
            
            // Try to find name and email from dynamic field names
            $name = null;
            $email = null;
            $message = null;
            
            foreach ($data as $key => $value) {
                if (is_string($value)) {
                    // Check if this looks like an email
                    if (!$email && filter_var($value, FILTER_VALIDATE_EMAIL)) {
                        $email = $value;
                    }
                    // Check if this could be a name (no @ symbol, reasonable length)
                    elseif (!$name && !str_contains($value, '@') && strlen($value) > 2 && strlen($value) < 100) {
                        $name = $value;
                    }
                    // Use longer text as message
                    elseif (!$message && strlen($value) > 20) {
                        $message = $value;
                    }
                }
            }
            
            // Fallback to explicit field names if dynamic detection didn't work
            $name = $name ?? $data['name'] ?? $data['full_name'] ?? 'Form Submission';
            $email = $email ?? $data['email'] ?? $data['email_address'] ?? 'no-email@provided.com';
            $message = $message ?? $data['message'] ?? $data['comments'] ?? json_encode($data, JSON_PRETTY_PRINT);
            $type = $request->input('form_title', 'Multi-step Form');

            // Store with additional security metadata
            ContactInquiry::create([
                'name' => strip_tags($name),
                'email' => $email,
                'subject' => $type . ' Submission',
                'message' => is_string($message) ? strip_tags($message) : json_encode($data, JSON_PRETTY_PRINT),
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
