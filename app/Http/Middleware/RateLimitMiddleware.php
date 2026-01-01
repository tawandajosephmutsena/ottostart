<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class RateLimitMiddleware
{
    /**
     * Rate limiting configuration
     */
    private array $config = [
        'login' => [
            'max_attempts' => 5,
            'decay_minutes' => 15,
            'key_prefix' => 'login_rate_limit',
        ],
        'api' => [
            'max_attempts' => 100,
            'decay_minutes' => 1,
            'key_prefix' => 'api_rate_limit',
        ],
        'contact' => [
            'max_attempts' => 3,
            'decay_minutes' => 60,
            'key_prefix' => 'contact_rate_limit',
        ],
        'password_reset' => [
            'max_attempts' => 3,
            'decay_minutes' => 60,
            'key_prefix' => 'password_reset_rate_limit',
        ],
        'registration' => [
            'max_attempts' => 3,
            'decay_minutes' => 60,
            'key_prefix' => 'registration_rate_limit',
        ],
    ];

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $type = 'api'): Response
    {
        if (!isset($this->config[$type])) {
            return $next($request);
        }

        $config = $this->config[$type];
        $key = $this->buildRateLimitKey($request, $config['key_prefix']);
        
        // Get current attempt count
        $attempts = Cache::get($key, 0);
        
        // Check if rate limit exceeded
        if ($attempts >= $config['max_attempts']) {
            $this->logRateLimitExceeded($request, $type, $attempts);
            
            return response()->json([
                'message' => 'Too many requests. Please try again later.',
                'retry_after' => $config['decay_minutes'] * 60,
                'type' => 'rate_limit_exceeded',
            ], 429);
        }
        
        // Increment attempt count
        $newAttempts = $attempts + 1;
        Cache::put($key, $newAttempts, now()->addMinutes($config['decay_minutes']));
        
        $response = $next($request);
        
        // Add rate limit headers
        $response->headers->set('X-RateLimit-Limit', $config['max_attempts']);
        $response->headers->set('X-RateLimit-Remaining', max(0, $config['max_attempts'] - $newAttempts));
        $response->headers->set('X-RateLimit-Reset', now()->addMinutes($config['decay_minutes'])->timestamp);
        
        return $response;
    }

    /**
     * Build rate limit cache key
     */
    private function buildRateLimitKey(Request $request, string $prefix): string
    {
        $identifier = $this->getIdentifier($request);
        return "{$prefix}:{$identifier}";
    }

    /**
     * Get unique identifier for rate limiting
     */
    private function getIdentifier(Request $request): string
    {
        // Use user ID if authenticated, otherwise use IP address
        if (auth()->check()) {
            return 'user:' . auth()->id();
        }
        
        return 'ip:' . $request->ip();
    }

    /**
     * Log rate limit exceeded event
     */
    private function logRateLimitExceeded(Request $request, string $type, int $attempts): void
    {
        Log::warning('Rate limit exceeded', [
            'type' => $type,
            'attempts' => $attempts,
            'ip_address' => $request->ip(),
            'user_id' => auth()->id(),
            'user_agent' => $request->userAgent(),
            'url' => $request->fullUrl(),
            'method' => $request->method(),
        ]);

        // Create security event if model exists
        if (class_exists(\App\Models\SecurityEvent::class)) {
            \App\Models\SecurityEvent::create([
                'type' => 'rate_limit_exceeded',
                'severity' => 'medium',
                'description' => "Rate limit exceeded for {$type}",
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'user_id' => auth()->id(),
                'metadata' => [
                    'rate_limit_type' => $type,
                    'attempts' => $attempts,
                    'url' => $request->fullUrl(),
                    'method' => $request->method(),
                ],
            ]);
        }
    }
}