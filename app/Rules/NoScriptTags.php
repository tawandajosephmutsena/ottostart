<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class NoScriptTags implements ValidationRule
{
    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!is_string($value)) {
            return;
        }

        // Check for script tags (case insensitive)
        if (preg_match('/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/mi', $value)) {
            $fail('The :attribute contains script tags which are not allowed.');
            return;
        }

        // Check for javascript: protocol
        if (preg_match('/javascript\s*:/i', $value)) {
            $fail('The :attribute contains javascript protocol which is not allowed.');
            return;
        }

        // Check for on* event handlers
        if (preg_match('/\bon\w+\s*=/i', $value)) {
            $fail('The :attribute contains event handlers which are not allowed.');
            return;
        }

        // Check for data: protocol with base64 (potential XSS vector)
        if (preg_match('/data\s*:\s*[^;]*;base64/i', $value)) {
            $fail('The :attribute contains base64 data URLs which are not allowed.');
            return;
        }

        // Check for vbscript: protocol
        if (preg_match('/vbscript\s*:/i', $value)) {
            $fail('The :attribute contains vbscript protocol which is not allowed.');
            return;
        }
    }
}