<?php

namespace App\Services;

use App\Models\User;
use App\Models\SecurityEvent;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class AccountLockoutService
{
    /**
     * Lockout configuration
     */
    private array $config = [
        'max_attempts' => 5,
        'lockout_duration' => 900, // 15 minutes in seconds
        'progressive_lockout' => true,
        'ip_lockout_enabled' => true,
        'ip_max_attempts' => 20,
        'ip_lockout_duration' => 3600, // 1 hour
        'permanent_lockout_threshold' => 10, // Permanent lockout after 10 lockouts
    ];

    /**
     * Record failed login attempt
     */
    public function recordFailedAttempt(string $identifier, string $ipAddress): void
    {
        $userKey = "login_attempts:user:{$identifier}";
        $ipKey = "login_attempts:ip:{$ipAddress}";
        
        // Increment user attempts
        $userAttempts = Cache::get($userKey, 0) + 1;
        Cache::put($userKey, $userAttempts, now()->addMinutes(30));
        
        // Increment IP attempts
        $ipAttempts = Cache::get($ipKey, 0) + 1;
        Cache::put($ipKey, $ipAttempts, now()->addHour());
        
        // Log the failed attempt
        Log::warning('Failed login attempt', [
            'identifier' => $identifier,
            'ip_address' => $ipAddress,
            'user_attempts' => $userAttempts,
            'ip_attempts' => $ipAttempts,
            'user_agent' => request()->userAgent(),
        ]);
        
        // Create security event
        SecurityEvent::create([
            'type' => 'failed_login',
            'severity' => $userAttempts >= $this->config['max_attempts'] ? 'high' : 'medium',
            'description' => "Failed login attempt for identifier: {$identifier}",
            'ip_address' => $ipAddress,
            'user_agent' => request()->userAgent(),
            'metadata' => [
                'identifier' => $identifier,
                'user_attempts' => $userAttempts,
                'ip_attempts' => $ipAttempts,
            ],
        ]);
        
        // Check if lockout is needed
        if ($userAttempts >= $this->config['max_attempts']) {
            $this->lockoutUser($identifier, $userAttempts);
        }
        
        if ($this->config['ip_lockout_enabled'] && $ipAttempts >= $this->config['ip_max_attempts']) {
            $this->lockoutIp($ipAddress, $ipAttempts);
        }
    }

    /**
     * Record successful login
     */
    public function recordSuccessfulLogin(string $identifier, string $ipAddress): void
    {
        // Clear failed attempts for user
        Cache::forget("login_attempts:user:{$identifier}");
        
        // Log successful login
        Log::info('Successful login', [
            'identifier' => $identifier,
            'ip_address' => $ipAddress,
            'user_agent' => request()->userAgent(),
        ]);
        
        // Create security event for successful login after failed attempts
        $userKey = "login_attempts:user:{$identifier}";
        if (Cache::has($userKey)) {
            SecurityEvent::create([
                'type' => 'successful_login_after_failures',
                'severity' => 'medium',
                'description' => "Successful login after failed attempts for identifier: {$identifier}",
                'ip_address' => $ipAddress,
                'user_agent' => request()->userAgent(),
                'metadata' => [
                    'identifier' => $identifier,
                ],
            ]);
        }
    }

    /**
     * Check if user is locked out
     */
    public function isUserLockedOut(string $identifier): bool
    {
        $lockoutKey = "user_lockout:{$identifier}";
        return Cache::has($lockoutKey);
    }

    /**
     * Check if IP is locked out
     */
    public function isIpLockedOut(string $ipAddress): bool
    {
        $lockoutKey = "ip_lockout:{$ipAddress}";
        return Cache::has($lockoutKey);
    }

    /**
     * Get user lockout info
     */
    public function getUserLockoutInfo(string $identifier): ?array
    {
        $lockoutKey = "user_lockout:{$identifier}";
        $lockoutData = Cache::get($lockoutKey);
        
        if (!$lockoutData) {
            return null;
        }
        
        return [
            'locked_until' => $lockoutData['locked_until'],
            'attempt_count' => $lockoutData['attempt_count'],
            'lockout_count' => $lockoutData['lockout_count'],
            'is_permanent' => $lockoutData['is_permanent'] ?? false,
        ];
    }

    /**
     * Get IP lockout info
     */
    public function getIpLockoutInfo(string $ipAddress): ?array
    {
        $lockoutKey = "ip_lockout:{$ipAddress}";
        $lockoutData = Cache::get($lockoutKey);
        
        if (!$lockoutData) {
            return null;
        }
        
        return [
            'locked_until' => $lockoutData['locked_until'],
            'attempt_count' => $lockoutData['attempt_count'],
        ];
    }

    /**
     * Lockout user account
     */
    private function lockoutUser(string $identifier, int $attemptCount): void
    {
        $lockoutCountKey = "lockout_count:{$identifier}";
        $lockoutCount = Cache::get($lockoutCountKey, 0) + 1;
        
        // Calculate lockout duration (progressive lockout)
        $duration = $this->config['lockout_duration'];
        if ($this->config['progressive_lockout']) {
            $duration = $duration * pow(2, min($lockoutCount - 1, 5)); // Max 32x original duration
        }
        
        // Check for permanent lockout
        $isPermanent = $lockoutCount >= $this->config['permanent_lockout_threshold'];
        
        $lockoutData = [
            'locked_until' => $isPermanent ? null : now()->addSeconds($duration),
            'attempt_count' => $attemptCount,
            'lockout_count' => $lockoutCount,
            'is_permanent' => $isPermanent,
        ];
        
        $lockoutKey = "user_lockout:{$identifier}";
        
        if ($isPermanent) {
            // Permanent lockout
            Cache::forever($lockoutKey, $lockoutData);
            Cache::forever($lockoutCountKey, $lockoutCount);
            
            // Disable user account if it exists
            $user = User::where('email', $identifier)->orWhere('name', $identifier)->first();
            if ($user) {
                $user->update(['is_active' => false]);
            }
        } else {
            // Temporary lockout
            Cache::put($lockoutKey, $lockoutData, now()->addSeconds($duration));
            Cache::put($lockoutCountKey, $lockoutCount, now()->addDays(30));
        }
        
        // Log lockout
        Log::warning('User account locked out', [
            'identifier' => $identifier,
            'attempt_count' => $attemptCount,
            'lockout_count' => $lockoutCount,
            'duration' => $isPermanent ? 'permanent' : $duration,
            'ip_address' => request()->ip(),
        ]);
        
        // Create security event
        SecurityEvent::create([
            'type' => 'account_lockout',
            'severity' => $isPermanent ? 'critical' : 'high',
            'description' => $isPermanent 
                ? "Permanent account lockout for identifier: {$identifier}"
                : "Account locked out for {$duration} seconds for identifier: {$identifier}",
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'metadata' => [
                'identifier' => $identifier,
                'attempt_count' => $attemptCount,
                'lockout_count' => $lockoutCount,
                'duration' => $duration,
                'is_permanent' => $isPermanent,
            ],
        ]);
    }

    /**
     * Lockout IP address
     */
    private function lockoutIp(string $ipAddress, int $attemptCount): void
    {
        $duration = $this->config['ip_lockout_duration'];
        
        $lockoutData = [
            'locked_until' => now()->addSeconds($duration),
            'attempt_count' => $attemptCount,
        ];
        
        $lockoutKey = "ip_lockout:{$ipAddress}";
        Cache::put($lockoutKey, $lockoutData, now()->addSeconds($duration));
        
        // Log IP lockout
        Log::warning('IP address locked out', [
            'ip_address' => $ipAddress,
            'attempt_count' => $attemptCount,
            'duration' => $duration,
        ]);
        
        // Create security event
        SecurityEvent::create([
            'type' => 'ip_lockout',
            'severity' => 'high',
            'description' => "IP address locked out for {$duration} seconds: {$ipAddress}",
            'ip_address' => $ipAddress,
            'user_agent' => request()->userAgent(),
            'metadata' => [
                'attempt_count' => $attemptCount,
                'duration' => $duration,
            ],
        ]);
    }

    /**
     * Manually unlock user account
     */
    public function unlockUser(string $identifier): bool
    {
        $lockoutKey = "user_lockout:{$identifier}";
        $attemptsKey = "login_attempts:user:{$identifier}";
        
        Cache::forget($lockoutKey);
        Cache::forget($attemptsKey);
        
        // Re-enable user account if it was disabled
        $user = User::where('email', $identifier)->orWhere('name', $identifier)->first();
        if ($user && !$user->is_active) {
            $user->update(['is_active' => true]);
        }
        
        Log::info('User account manually unlocked', [
            'identifier' => $identifier,
            'admin_user_id' => auth()->id(),
        ]);
        
        return true;
    }

    /**
     * Manually unlock IP address
     */
    public function unlockIp(string $ipAddress): bool
    {
        $lockoutKey = "ip_lockout:{$ipAddress}";
        $attemptsKey = "login_attempts:ip:{$ipAddress}";
        
        Cache::forget($lockoutKey);
        Cache::forget($attemptsKey);
        
        Log::info('IP address manually unlocked', [
            'ip_address' => $ipAddress,
            'admin_user_id' => auth()->id(),
        ]);
        
        return true;
    }

    /**
     * Get failed attempt count for user
     */
    public function getFailedAttemptCount(string $identifier): int
    {
        $userKey = "login_attempts:user:{$identifier}";
        return Cache::get($userKey, 0);
    }

    /**
     * Get failed attempt count for IP
     */
    public function getIpFailedAttemptCount(string $ipAddress): int
    {
        $ipKey = "login_attempts:ip:{$ipAddress}";
        return Cache::get($ipKey, 0);
    }
}