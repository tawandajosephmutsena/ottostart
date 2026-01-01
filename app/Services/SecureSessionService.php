<?php

namespace App\Services;

use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SecureSessionService
{
    /**
     * Session security configuration
     */
    private array $config = [
        'max_concurrent_sessions' => 3,
        'session_timeout' => 7200, // 2 hours
        'idle_timeout' => 1800,    // 30 minutes
        'regenerate_interval' => 300, // 5 minutes
        'track_user_agent' => true,
        'track_ip_address' => true,
        'require_https' => true,
    ];

    /**
     * Initialize secure session for user
     */
    public function initializeSession(int $userId): string
    {
        $sessionId = $this->generateSecureSessionId();
        
        // Store session data
        $sessionData = [
            'user_id' => $userId,
            'session_id' => $sessionId,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'created_at' => now(),
            'last_activity' => now(),
            'is_active' => true,
        ];
        
        // Store in cache with expiration
        Cache::put(
            "user_session:{$userId}:{$sessionId}",
            $sessionData,
            now()->addSeconds($this->config['session_timeout'])
        );
        
        // Track active sessions for user
        $this->addToActiveSessions($userId, $sessionId);
        
        // Enforce concurrent session limit
        $this->enforceConcurrentSessionLimit($userId);
        
        // Set session regeneration timer
        Session::put('last_regeneration', now());
        
        Log::info('Secure session initialized', [
            'user_id' => $userId,
            'session_id' => $sessionId,
            'ip_address' => request()->ip(),
        ]);
        
        return $sessionId;
    }

    /**
     * Validate session security
     */
    public function validateSession(int $userId, string $sessionId): bool
    {
        $sessionKey = "user_session:{$userId}:{$sessionId}";
        $sessionData = Cache::get($sessionKey);
        
        if (!$sessionData || !$sessionData['is_active']) {
            return false;
        }
        
        // Check session timeout
        if (now()->diffInSeconds($sessionData['created_at']) > $this->config['session_timeout']) {
            $this->invalidateSession($userId, $sessionId, 'timeout');
            return false;
        }
        
        // Check idle timeout
        if (now()->diffInSeconds($sessionData['last_activity']) > $this->config['idle_timeout']) {
            $this->invalidateSession($userId, $sessionId, 'idle_timeout');
            return false;
        }
        
        // Validate IP address if tracking is enabled
        if ($this->config['track_ip_address'] && 
            $sessionData['ip_address'] !== request()->ip()) {
            $this->invalidateSession($userId, $sessionId, 'ip_mismatch');
            return false;
        }
        
        // Validate user agent if tracking is enabled
        if ($this->config['track_user_agent'] && 
            $sessionData['user_agent'] !== request()->userAgent()) {
            $this->invalidateSession($userId, $sessionId, 'user_agent_mismatch');
            return false;
        }
        
        // Check if HTTPS is required
        if ($this->config['require_https'] && !request()->isSecure()) {
            $this->invalidateSession($userId, $sessionId, 'insecure_connection');
            return false;
        }
        
        // Update last activity
        $sessionData['last_activity'] = now();
        Cache::put($sessionKey, $sessionData, now()->addSeconds($this->config['session_timeout']));
        
        // Check if session regeneration is needed
        $this->checkSessionRegeneration();
        
        return true;
    }

    /**
     * Invalidate session
     */
    public function invalidateSession(int $userId, string $sessionId, string $reason = 'manual'): void
    {
        $sessionKey = "user_session:{$userId}:{$sessionId}";
        
        // Mark session as inactive
        $sessionData = Cache::get($sessionKey);
        if ($sessionData) {
            $sessionData['is_active'] = false;
            $sessionData['invalidated_at'] = now();
            $sessionData['invalidation_reason'] = $reason;
            
            Cache::put($sessionKey, $sessionData, now()->addHours(24)); // Keep for audit
        }
        
        // Remove from active sessions
        $this->removeFromActiveSessions($userId, $sessionId);
        
        Log::info('Session invalidated', [
            'user_id' => $userId,
            'session_id' => $sessionId,
            'reason' => $reason,
            'ip_address' => request()->ip(),
        ]);
    }

    /**
     * Invalidate all sessions for user
     */
    public function invalidateAllUserSessions(int $userId, string $reason = 'security'): void
    {
        $activeSessions = $this->getActiveSessions($userId);
        
        foreach ($activeSessions as $sessionId) {
            $this->invalidateSession($userId, $sessionId, $reason);
        }
        
        // Clear active sessions list
        Cache::forget("active_sessions:{$userId}");
        
        Log::warning('All user sessions invalidated', [
            'user_id' => $userId,
            'reason' => $reason,
            'session_count' => count($activeSessions),
        ]);
    }

    /**
     * Get active sessions for user
     */
    public function getActiveSessions(int $userId): array
    {
        return Cache::get("active_sessions:{$userId}", []);
    }

    /**
     * Get session information
     */
    public function getSessionInfo(int $userId, string $sessionId): ?array
    {
        $sessionKey = "user_session:{$userId}:{$sessionId}";
        return Cache::get($sessionKey);
    }

    /**
     * Generate secure session ID
     */
    private function generateSecureSessionId(): string
    {
        return Str::random(64);
    }

    /**
     * Add session to active sessions list
     */
    private function addToActiveSessions(int $userId, string $sessionId): void
    {
        $activeSessions = $this->getActiveSessions($userId);
        $activeSessions[] = $sessionId;
        
        Cache::put(
            "active_sessions:{$userId}",
            array_unique($activeSessions),
            now()->addHours(24)
        );
    }

    /**
     * Remove session from active sessions list
     */
    private function removeFromActiveSessions(int $userId, string $sessionId): void
    {
        $activeSessions = $this->getActiveSessions($userId);
        $activeSessions = array_filter($activeSessions, fn($id) => $id !== $sessionId);
        
        Cache::put(
            "active_sessions:{$userId}",
            array_values($activeSessions),
            now()->addHours(24)
        );
    }

    /**
     * Enforce concurrent session limit
     */
    private function enforceConcurrentSessionLimit(int $userId): void
    {
        $activeSessions = $this->getActiveSessions($userId);
        
        if (count($activeSessions) > $this->config['max_concurrent_sessions']) {
            // Remove oldest sessions
            $sessionsToRemove = array_slice(
                $activeSessions,
                0,
                count($activeSessions) - $this->config['max_concurrent_sessions']
            );
            
            foreach ($sessionsToRemove as $sessionId) {
                $this->invalidateSession($userId, $sessionId, 'concurrent_limit');
            }
        }
    }

    /**
     * Check if session regeneration is needed
     */
    private function checkSessionRegeneration(): void
    {
        $lastRegeneration = Session::get('last_regeneration');
        
        if (!$lastRegeneration || 
            now()->diffInSeconds($lastRegeneration) > $this->config['regenerate_interval']) {
            
            Session::regenerate(true);
            Session::put('last_regeneration', now());
            
            Log::debug('Session ID regenerated for security');
        }
    }

    /**
     * Clean up expired sessions
     */
    public function cleanupExpiredSessions(): int
    {
        // This would typically be run as a scheduled job
        $cleanedCount = 0;
        
        // Implementation would depend on your cache driver
        // For Redis, you could scan for session keys and check expiration
        
        Log::info('Session cleanup completed', [
            'cleaned_sessions' => $cleanedCount,
        ]);
        
        return $cleanedCount;
    }
}