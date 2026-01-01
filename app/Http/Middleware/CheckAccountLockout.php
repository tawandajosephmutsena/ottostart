<?php

namespace App\Http\Middleware;

use App\Services\AccountLockoutService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckAccountLockout
{
    private AccountLockoutService $lockoutService;

    public function __construct(AccountLockoutService $lockoutService)
    {
        $this->lockoutService = $lockoutService;
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Only check lockout for login attempts
        if (!$this->isLoginAttempt($request)) {
            return $next($request);
        }

        $ipAddress = $request->ip();
        $identifier = $this->getLoginIdentifier($request);

        // Check IP lockout
        if ($this->lockoutService->isIpLockedOut($ipAddress)) {
            $lockoutInfo = $this->lockoutService->getIpLockoutInfo($ipAddress);
            
            return response()->json([
                'message' => 'Too many failed attempts from this IP address. Please try again later.',
                'locked_until' => $lockoutInfo['locked_until'] ?? null,
                'type' => 'ip_lockout',
            ], 429);
        }

        // Check user lockout if identifier is provided
        if ($identifier && $this->lockoutService->isUserLockedOut($identifier)) {
            $lockoutInfo = $this->lockoutService->getUserLockoutInfo($identifier);
            
            $message = $lockoutInfo['is_permanent'] ?? false
                ? 'This account has been permanently locked due to repeated security violations.'
                : 'Account temporarily locked due to too many failed login attempts. Please try again later.';
            
            return response()->json([
                'message' => $message,
                'locked_until' => $lockoutInfo['locked_until'] ?? null,
                'is_permanent' => $lockoutInfo['is_permanent'] ?? false,
                'type' => 'account_lockout',
            ], 423); // 423 Locked
        }

        return $next($request);
    }

    /**
     * Check if this is a login attempt
     */
    private function isLoginAttempt(Request $request): bool
    {
        return $request->is('login') || 
               $request->is('api/login') ||
               $request->is('auth/login') ||
               ($request->isMethod('POST') && $request->has(['email', 'password']));
    }

    /**
     * Get login identifier from request
     */
    private function getLoginIdentifier(Request $request): ?string
    {
        return $request->input('email') ?: $request->input('username');
    }
}