<?php

namespace App\Services;

use App\Models\SecurityEvent;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;

class SecurityMonitoringService
{
    /**
     * Security monitoring configuration
     */
    private array $config = [
        'alert_thresholds' => [
            'failed_logins_per_hour' => 50,
            'suspicious_queries_per_hour' => 10,
            'rate_limit_violations_per_hour' => 100,
            'file_upload_violations_per_hour' => 20,
            'xss_attempts_per_hour' => 5,
        ],
        'notification_channels' => ['log', 'email'],
        'admin_emails' => ['admin@example.com'],
        'dashboard_refresh_interval' => 300, // 5 minutes
    ];

    /**
     * Log security event
     */
    public function logSecurityEvent(
        string $type,
        string $severity,
        string $description,
        array $metadata = []
    ): SecurityEvent {
        $event = SecurityEvent::create([
            'type' => $type,
            'severity' => $severity,
            'description' => $description,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'user_id' => auth()->id(),
            'metadata' => array_merge($metadata, [
                'url' => request()->fullUrl(),
                'method' => request()->method(),
                'timestamp' => now()->toISOString(),
            ]),
        ]);

        // Log to Laravel log
        Log::channel('security')->log(
            $this->mapSeverityToLogLevel($severity),
            "Security Event: {$description}",
            [
                'event_id' => $event->id,
                'type' => $type,
                'severity' => $severity,
                'ip_address' => request()->ip(),
                'user_id' => auth()->id(),
                'metadata' => $metadata,
            ]
        );

        // Check for alert conditions
        $this->checkAlertConditions($type, $severity);

        return $event;
    }

    /**
     * Check if alert conditions are met
     */
    private function checkAlertConditions(string $type, string $severity): void
    {
        // Check hourly thresholds
        $hourlyCount = $this->getHourlyEventCount($type);
        $threshold = $this->config['alert_thresholds']["{$type}_per_hour"] ?? null;

        if ($threshold && $hourlyCount >= $threshold) {
            $this->triggerAlert($type, $hourlyCount, $threshold);
        }

        // Check for critical events
        if ($severity === 'critical') {
            $this->triggerCriticalAlert($type);
        }

        // Check for attack patterns
        $this->detectAttackPatterns($type);
    }

    /**
     * Get hourly event count for a specific type
     */
    private function getHourlyEventCount(string $type): int
    {
        $cacheKey = "security_events_hourly:{$type}:" . now()->format('Y-m-d-H');
        
        return Cache::remember($cacheKey, 3600, function () use ($type) {
            return SecurityEvent::where('type', $type)
                ->where('created_at', '>=', now()->subHour())
                ->count();
        });
    }

    /**
     * Trigger security alert
     */
    private function triggerAlert(string $type, int $count, int $threshold): void
    {
        $alertKey = "security_alert:{$type}:" . now()->format('Y-m-d-H');
        
        // Prevent duplicate alerts for the same hour
        if (Cache::has($alertKey)) {
            return;
        }

        Cache::put($alertKey, true, 3600);

        $message = "Security Alert: {$count} {$type} events in the last hour (threshold: {$threshold})";

        // Log alert
        Log::critical($message, [
            'type' => $type,
            'count' => $count,
            'threshold' => $threshold,
            'hour' => now()->format('Y-m-d H:00'),
        ]);

        // Send notifications
        $this->sendNotification('security_alert', $message, [
            'type' => $type,
            'count' => $count,
            'threshold' => $threshold,
        ]);

        // Create alert event
        $this->logSecurityEvent(
            'security_alert',
            'critical',
            $message,
            [
                'alert_type' => $type,
                'event_count' => $count,
                'threshold' => $threshold,
            ]
        );
    }

    /**
     * Trigger critical alert
     */
    private function triggerCriticalAlert(string $type): void
    {
        $message = "Critical Security Event: {$type}";

        Log::critical($message, [
            'type' => $type,
            'ip_address' => request()->ip(),
            'user_id' => auth()->id(),
        ]);

        $this->sendNotification('critical_alert', $message, [
            'type' => $type,
            'ip_address' => request()->ip(),
            'user_id' => auth()->id(),
        ]);
    }

    /**
     * Detect attack patterns
     */
    private function detectAttackPatterns(string $type): void
    {
        $ipAddress = request()->ip();
        
        // Check for distributed attacks from same IP
        $recentEvents = SecurityEvent::where('ip_address', $ipAddress)
            ->where('created_at', '>=', now()->subMinutes(10))
            ->count();

        if ($recentEvents >= 10) {
            $this->logSecurityEvent(
                'potential_attack',
                'high',
                "Potential attack detected from IP: {$ipAddress}",
                [
                    'recent_events' => $recentEvents,
                    'time_window' => '10 minutes',
                ]
            );
        }

        // Check for coordinated attacks across multiple IPs
        $this->detectCoordinatedAttacks($type);
    }

    /**
     * Detect coordinated attacks
     */
    private function detectCoordinatedAttacks(string $type): void
    {
        $recentIps = SecurityEvent::where('type', $type)
            ->where('created_at', '>=', now()->subMinutes(5))
            ->distinct('ip_address')
            ->count('ip_address');

        if ($recentIps >= 5) {
            $this->logSecurityEvent(
                'coordinated_attack',
                'critical',
                "Potential coordinated attack detected: {$type} from {$recentIps} different IPs",
                [
                    'attack_type' => $type,
                    'unique_ips' => $recentIps,
                    'time_window' => '5 minutes',
                ]
            );
        }
    }

    /**
     * Send notification
     */
    private function sendNotification(string $type, string $message, array $data = []): void
    {
        foreach ($this->config['notification_channels'] as $channel) {
            switch ($channel) {
                case 'email':
                    $this->sendEmailNotification($type, $message, $data);
                    break;
                case 'slack':
                    $this->sendSlackNotification($type, $message, $data);
                    break;
                case 'webhook':
                    $this->sendWebhookNotification($type, $message, $data);
                    break;
            }
        }
    }

    /**
     * Send email notification
     */
    private function sendEmailNotification(string $type, string $message, array $data): void
    {
        try {
            foreach ($this->config['admin_emails'] as $email) {
                Mail::raw($message, function ($mail) use ($email, $type) {
                    $mail->to($email)
                         ->subject("Security Alert: {$type}")
                         ->from(config('mail.from.address'), config('app.name'));
                });
            }
        } catch (\Exception $e) {
            Log::error('Failed to send security notification email', [
                'error' => $e->getMessage(),
                'type' => $type,
                'message' => $message,
            ]);
        }
    }

    /**
     * Send Slack notification (placeholder)
     */
    private function sendSlackNotification(string $type, string $message, array $data): void
    {
        // Implementation would depend on Slack webhook configuration
        Log::info('Slack notification would be sent', [
            'type' => $type,
            'message' => $message,
            'data' => $data,
        ]);
    }

    /**
     * Send webhook notification (placeholder)
     */
    private function sendWebhookNotification(string $type, string $message, array $data): void
    {
        // Implementation would depend on webhook configuration
        Log::info('Webhook notification would be sent', [
            'type' => $type,
            'message' => $message,
            'data' => $data,
        ]);
    }

    /**
     * Get security dashboard data
     */
    public function getDashboardData(): array
    {
        $cacheKey = 'security_dashboard_data';
        
        return Cache::remember($cacheKey, $this->config['dashboard_refresh_interval'], function () {
            return [
                'recent_events' => $this->getRecentEvents(),
                'event_counts' => $this->getEventCounts(),
                'top_threats' => $this->getTopThreats(),
                'geographic_data' => $this->getGeographicData(),
                'timeline_data' => $this->getTimelineData(),
                'system_health' => $this->getSystemHealth(),
            ];
        });
    }

    /**
     * Get recent security events
     */
    private function getRecentEvents(int $limit = 50): array
    {
        return SecurityEvent::with('user:id,name,email')
            ->latest()
            ->limit($limit)
            ->get()
            ->map(function ($event) {
                return [
                    'id' => $event->id,
                    'type' => $event->type,
                    'severity' => $event->severity,
                    'description' => $event->description,
                    'ip_address' => $event->ip_address,
                    'user' => $event->user ? $event->user->name : 'Anonymous',
                    'created_at' => $event->created_at->toISOString(),
                    'is_resolved' => $event->isResolved(),
                ];
            })
            ->toArray();
    }

    /**
     * Get event counts by type and severity
     */
    private function getEventCounts(): array
    {
        $counts = SecurityEvent::selectRaw('type, severity, COUNT(*) as count')
            ->where('created_at', '>=', now()->subDays(7))
            ->groupBy('type', 'severity')
            ->get();

        $result = [];
        foreach ($counts as $count) {
            $result[$count->type][$count->severity] = $count->count;
        }

        return $result;
    }

    /**
     * Get top threats by IP address
     */
    private function getTopThreats(int $limit = 10): array
    {
        return SecurityEvent::selectRaw('ip_address, COUNT(*) as event_count, MAX(severity) as max_severity')
            ->where('created_at', '>=', now()->subDays(7))
            ->groupBy('ip_address')
            ->orderByDesc('event_count')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    /**
     * Get geographic data (placeholder)
     */
    private function getGeographicData(): array
    {
        // This would require IP geolocation service
        return [];
    }

    /**
     * Get timeline data for charts
     */
    private function getTimelineData(): array
    {
        $timeline = SecurityEvent::selectRaw('DATE(created_at) as date, type, COUNT(*) as count')
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('date', 'type')
            ->orderBy('date')
            ->get();

        $result = [];
        foreach ($timeline as $item) {
            $result[$item->date][$item->type] = $item->count;
        }

        return $result;
    }

    /**
     * Get system health indicators
     */
    private function getSystemHealth(): array
    {
        $criticalEvents = SecurityEvent::where('severity', 'critical')
            ->where('created_at', '>=', now()->subHour())
            ->count();

        $highEvents = SecurityEvent::where('severity', 'high')
            ->where('created_at', '>=', now()->subHour())
            ->count();

        return [
            'status' => $criticalEvents > 0 ? 'critical' : ($highEvents > 5 ? 'warning' : 'healthy'),
            'critical_events_last_hour' => $criticalEvents,
            'high_events_last_hour' => $highEvents,
            'total_events_today' => SecurityEvent::whereDate('created_at', today())->count(),
            'unresolved_events' => SecurityEvent::unresolved()->count(),
        ];
    }

    /**
     * Map severity to log level
     */
    private function mapSeverityToLogLevel(string $severity): string
    {
        return match ($severity) {
            'critical' => 'critical',
            'high' => 'error',
            'medium' => 'warning',
            'low' => 'info',
            default => 'info',
        };
    }

    /**
     * Clean up old security events
     */
    public function cleanupOldEvents(int $daysToKeep = 90): int
    {
        $deletedCount = SecurityEvent::where('created_at', '<', now()->subDays($daysToKeep))
            ->delete();

        Log::info('Security events cleanup completed', [
            'deleted_count' => $deletedCount,
            'days_kept' => $daysToKeep,
        ]);

        return $deletedCount;
    }
}