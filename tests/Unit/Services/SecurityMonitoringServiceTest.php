<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\SecurityMonitoringService;
use App\Models\SecurityEvent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Http\Request;
use Mockery;

class SecurityMonitoringServiceTest extends TestCase
{
    use RefreshDatabase;

    private SecurityMonitoringService $securityService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->securityService = new SecurityMonitoringService();
        
        // Mock request data
        $this->app->instance('request', Request::create('/', 'GET', [], [], [], [
            'REMOTE_ADDR' => '192.168.1.1',
            'HTTP_USER_AGENT' => 'Test User Agent',
        ]));
    }

    public function test_log_security_event_creates_event_record(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $event = $this->securityService->logSecurityEvent(
            'failed_login',
            'medium',
            'Failed login attempt',
            ['username' => 'testuser']
        );

        expect($event)->toBeInstanceOf(SecurityEvent::class);
        expect($event->type)->toBe('failed_login');
        expect($event->severity)->toBe('medium');
        expect($event->description)->toBe('Failed login attempt');
        expect($event->ip_address)->toBe('192.168.1.1');
        expect($event->user_id)->toBe($user->id);
        expect($event->metadata)->toHaveKey('username');
        expect($event->metadata['username'])->toBe('testuser');
    }

    public function test_log_security_event_logs_to_laravel_log(): void
    {
        Log::shouldReceive('channel')
            ->with('security')
            ->once()
            ->andReturnSelf();

        Log::shouldReceive('log')
            ->with('warning', 'Security Event: Test security event', Mockery::type('array'))
            ->once();

        $this->securityService->logSecurityEvent(
            'test_event',
            'medium',
            'Test security event'
        );
    }

    public function test_log_security_event_handles_anonymous_user(): void
    {
        $event = $this->securityService->logSecurityEvent(
            'anonymous_event',
            'low',
            'Anonymous security event'
        );

        expect($event->user_id)->toBeNull();
        expect($event->ip_address)->toBe('192.168.1.1');
    }

    public function test_log_security_event_includes_request_metadata(): void
    {
        $event = $this->securityService->logSecurityEvent(
            'test_event',
            'low',
            'Test event'
        );

        expect($event->metadata)->toHaveKey('url');
        expect($event->metadata)->toHaveKey('method');
        expect($event->metadata)->toHaveKey('timestamp');
        expect($event->metadata['method'])->toBe('GET');
    }

    public function test_critical_event_triggers_immediate_alert(): void
    {
        Log::shouldReceive('channel')->andReturnSelf();
        Log::shouldReceive('log')->twice(); // Once for event, once for critical alert
        Log::shouldReceive('critical')->once();

        $this->securityService->logSecurityEvent(
            'critical_breach',
            'critical',
            'Critical security breach detected'
        );

        // Verify critical alert was logged
        $this->assertDatabaseHas('security_events', [
            'type' => 'security_alert',
            'severity' => 'critical',
        ]);
    }

    public function test_hourly_threshold_triggers_alert(): void
    {
        Log::shouldReceive('channel')->andReturnSelf();
        Log::shouldReceive('log')->times(51); // 50 events + 1 alert
        Log::shouldReceive('critical')->once();

        // Create 50 failed login events in the last hour
        for ($i = 0; $i < 50; $i++) {
            SecurityEvent::create([
                'type' => 'failed_logins',
                'severity' => 'medium',
                'description' => "Failed login attempt $i",
                'ip_address' => '192.168.1.1',
                'user_agent' => 'Test Agent',
                'created_at' => now()->subMinutes(rand(1, 59)),
            ]);
        }

        // This should trigger the alert
        $this->securityService->logSecurityEvent(
            'failed_logins',
            'medium',
            'Failed login attempt that triggers alert'
        );

        // Verify alert was created
        $this->assertDatabaseHas('security_events', [
            'type' => 'security_alert',
            'severity' => 'critical',
        ]);
    }

    public function test_potential_attack_detection_from_same_ip(): void
    {
        Log::shouldReceive('channel')->andReturnSelf();
        Log::shouldReceive('log')->times(11); // 10 events + 1 attack detection

        // Create 9 events from same IP in last 10 minutes
        for ($i = 0; $i < 9; $i++) {
            SecurityEvent::create([
                'type' => 'suspicious_activity',
                'severity' => 'medium',
                'description' => "Suspicious activity $i",
                'ip_address' => '192.168.1.100',
                'user_agent' => 'Test Agent',
                'created_at' => now()->subMinutes(rand(1, 9)),
            ]);
        }

        // This should trigger attack detection
        $this->securityService->logSecurityEvent(
            'suspicious_activity',
            'medium',
            'Suspicious activity that triggers detection'
        );

        // Verify potential attack was detected
        $this->assertDatabaseHas('security_events', [
            'type' => 'potential_attack',
            'severity' => 'high',
        ]);
    }

    public function test_coordinated_attack_detection(): void
    {
        Log::shouldReceive('channel')->andReturnSelf();
        Log::shouldReceive('log')->times(6); // 5 events + 1 coordinated attack detection

        // Create events from 4 different IPs in last 5 minutes
        $ips = ['192.168.1.1', '192.168.1.2', '192.168.1.3', '192.168.1.4'];
        foreach ($ips as $ip) {
            SecurityEvent::create([
                'type' => 'brute_force',
                'severity' => 'medium',
                'description' => 'Brute force attempt',
                'ip_address' => $ip,
                'user_agent' => 'Test Agent',
                'created_at' => now()->subMinutes(rand(1, 4)),
            ]);
        }

        // This should trigger coordinated attack detection (5th IP)
        $this->app->instance('request', Request::create('/', 'GET', [], [], [], [
            'REMOTE_ADDR' => '192.168.1.5',
            'HTTP_USER_AGENT' => 'Test User Agent',
        ]));

        $this->securityService->logSecurityEvent(
            'brute_force',
            'medium',
            'Brute force attempt from 5th IP'
        );

        // Verify coordinated attack was detected
        $this->assertDatabaseHas('security_events', [
            'type' => 'coordinated_attack',
            'severity' => 'critical',
        ]);
    }

    public function test_get_dashboard_data_returns_complete_structure(): void
    {
        $this->createTestSecurityEvents();

        $data = $this->securityService->getDashboardData();

        expect($data)->toHaveKeys([
            'recent_events',
            'event_counts',
            'top_threats',
            'geographic_data',
            'timeline_data',
            'system_health',
        ]);
        expect($data['recent_events'])->toBeArray();
        expect($data['system_health'])->toHaveKey('status');
    }

    public function test_get_dashboard_data_caches_results(): void
    {
        Cache::shouldReceive('remember')
            ->with('security_dashboard_data', 300, Mockery::type('callable'))
            ->once()
            ->andReturn([
                'recent_events' => [],
                'event_counts' => [],
                'top_threats' => [],
                'geographic_data' => [],
                'timeline_data' => [],
                'system_health' => ['status' => 'healthy'],
            ]);

        $data = $this->securityService->getDashboardData();

        expect($data['system_health']['status'])->toBe('healthy');
    }

    public function test_system_health_status_critical_with_critical_events(): void
    {
        // Create critical event in last hour
        SecurityEvent::create([
            'type' => 'critical_breach',
            'severity' => 'critical',
            'description' => 'Critical security breach',
            'ip_address' => '192.168.1.1',
            'created_at' => now()->subMinutes(30),
        ]);

        $data = $this->securityService->getDashboardData();

        expect($data['system_health']['status'])->toBe('critical');
        expect($data['system_health']['critical_events_last_hour'])->toBe(1);
    }

    public function test_system_health_status_warning_with_high_events(): void
    {
        // Create 6 high severity events in last hour
        for ($i = 0; $i < 6; $i++) {
            SecurityEvent::create([
                'type' => 'high_risk_activity',
                'severity' => 'high',
                'description' => 'High risk security activity',
                'ip_address' => '192.168.1.1',
                'created_at' => now()->subMinutes(rand(1, 59)),
            ]);
        }

        $data = $this->securityService->getDashboardData();

        expect($data['system_health']['status'])->toBe('warning');
        expect($data['system_health']['high_events_last_hour'])->toBe(6);
    }

    public function test_system_health_status_healthy_with_few_events(): void
    {
        // Create only low/medium severity events
        SecurityEvent::create([
            'type' => 'low_risk_activity',
            'severity' => 'low',
            'description' => 'Low risk security activity',
            'ip_address' => '192.168.1.1',
            'created_at' => now()->subMinutes(30),
        ]);

        $data = $this->securityService->getDashboardData();

        expect($data['system_health']['status'])->toBe('healthy');
    }

    public function test_cleanup_old_events_removes_old_records(): void
    {
        // Create old events (older than 90 days)
        SecurityEvent::create([
            'type' => 'old_event',
            'severity' => 'low',
            'description' => 'Old security event',
            'ip_address' => '192.168.1.1',
            'created_at' => now()->subDays(100),
        ]);

        // Create recent event (should not be deleted)
        SecurityEvent::create([
            'type' => 'recent_event',
            'severity' => 'low',
            'description' => 'Recent security event',
            'ip_address' => '192.168.1.1',
            'created_at' => now()->subDays(30),
        ]);

        Log::shouldReceive('info')
            ->with('Security events cleanup completed', Mockery::type('array'))
            ->once();

        $deletedCount = $this->securityService->cleanupOldEvents(90);

        expect($deletedCount)->toBe(1);
        $this->assertDatabaseMissing('security_events', [
            'type' => 'old_event',
        ]);
        $this->assertDatabaseHas('security_events', [
            'type' => 'recent_event',
        ]);
    }

    public function test_email_notification_sends_to_admin_emails(): void
    {
        Mail::shouldReceive('raw')
            ->once()
            ->with(Mockery::type('string'), Mockery::type('callable'));

        Log::shouldReceive('channel')->andReturnSelf();
        Log::shouldReceive('log')->once();
        Log::shouldReceive('critical')->once();

        $this->securityService->logSecurityEvent(
            'critical_test',
            'critical',
            'Critical test event'
        );
    }

    private function createTestSecurityEvents(): void
    {
        $types = ['failed_login', 'suspicious_query', 'rate_limit_violation'];
        $severities = ['low', 'medium', 'high', 'critical'];

        for ($i = 0; $i < 10; $i++) {
            SecurityEvent::create([
                'type' => $types[array_rand($types)],
                'severity' => $severities[array_rand($severities)],
                'description' => "Test security event $i",
                'ip_address' => '192.168.1.' . rand(1, 100),
                'user_agent' => 'Test Agent',
                'created_at' => now()->subDays(rand(0, 7)),
            ]);
        }
    }
}