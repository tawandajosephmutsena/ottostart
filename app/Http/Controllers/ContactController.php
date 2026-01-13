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
            
            // Format all fields for clean display
            $formattedFields = [];
            foreach ($data as $fieldName => $value) {
                // Convert field names to readable format (e.g., 'full_name' -> 'Full Name')
                $readableKey = ucwords(str_replace(['-', '_'], ' ', preg_replace('/([a-z])([A-Z])/', '$1 $2', $fieldName)));
                $formattedFields[$readableKey] = $value;
            }
            
            // Try to find name and email from dynamic field names
            $name = null;
            $email = null;
            $message = null;
            
            foreach ($data as $fieldKey => $value) {
                if (is_string($value)) {
                    $lowerKey = strtolower($fieldKey);
                    // Check if field name suggests it's an email field
                    if (!$email && (str_contains($lowerKey, 'email') || filter_var($value, FILTER_VALIDATE_EMAIL))) {
                        $email = $value;
                    }
                    // Check if field name suggests it's a name field
                    elseif (!$name && (str_contains($lowerKey, 'name') || str_contains($lowerKey, 'full'))) {
                        $name = $value;
                    }
                    // Check if field name suggests it's a message field
                    elseif (!$message && (str_contains($lowerKey, 'message') || str_contains($lowerKey, 'comment') || str_contains($lowerKey, 'description'))) {
                        $message = $value;
                    }
                }
            }
            
            // Fallback values
            $name = $name ?? 'Form Submission';
            $email = $email ?? 'no-email@provided.com';
            $type = $request->input('form_title', 'Multi-step Form');
            
            // Create a readable summary of all fields if no message was found
            if (!$message) {
                $summaryLines = [];
                foreach ($formattedFields as $label => $value) {
                    if (is_array($value)) {
                        $summaryLines[] = $label . ': ' . implode(', ', array_map(fn($v) => ucwords(str_replace('-', ' ', $v)), $value));
                    } else {
                        $summaryLines[] = $label . ': ' . $value;
                    }
                }
                $message = implode("\n", $summaryLines);
            }

            // Store with additional security metadata
            ContactInquiry::create([
                'name' => strip_tags($name),
                'email' => $email,
                'subject' => $type . ' Submission',
                'message' => strip_tags($message),
                'status' => 'new',
                'metadata' => [
                    'all_fields' => $data,
                    'formatted_fields' => $formattedFields,
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
