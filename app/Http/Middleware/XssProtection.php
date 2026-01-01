<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class XssProtection
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Clean input data
        $input = $request->all();
        
        if (!empty($input)) {
            array_walk_recursive($input, function (&$value) {
                if (is_string($value)) {
                    $value = $this->cleanInput($value);
                }
            });
            
            $request->merge($input);
        }

        $response = $next($request);

        // Add XSS protection headers
        if ($response instanceof \Illuminate\Http\Response || 
            $response instanceof \Illuminate\Http\JsonResponse) {
            
            $response->headers->set('X-Content-Type-Options', 'nosniff');
            $response->headers->set('X-Frame-Options', 'DENY');
            $response->headers->set('X-XSS-Protection', '1; mode=block');
            $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        }

        return $response;
    }

    /**
     * Clean input to prevent XSS attacks
     */
    private function cleanInput(string $input): string
    {
        // Remove null bytes
        $input = str_replace("\0", '', $input);
        
        // Remove or encode potentially dangerous characters
        $input = str_replace(['<script', '</script>', 'javascript:', 'vbscript:', 'onload=', 'onerror='], '', $input);
        
        // Normalize Unicode characters to prevent bypass attempts
        if (function_exists('normalizer_normalize')) {
            $input = normalizer_normalize($input, \Normalizer::FORM_C);
        }
        
        return $input;
    }

    /**
     * Check if the input contains potentially dangerous content
     */
    private function containsDangerousContent(string $input): bool
    {
        $dangerousPatterns = [
            '/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/mi',
            '/javascript\s*:/i',
            '/vbscript\s*:/i',
            '/data\s*:\s*[^;]*;base64/i',
            '/\bon\w+\s*=/i', // Event handlers like onclick, onload, etc.
            '/<iframe\b/i',
            '/<object\b/i',
            '/<embed\b/i',
            '/<form\b/i',
            '/<input\b/i',
            '/<meta\b/i',
            '/<link\b/i',
        ];

        foreach ($dangerousPatterns as $pattern) {
            if (preg_match($pattern, $input)) {
                return true;
            }
        }

        return false;
    }
}