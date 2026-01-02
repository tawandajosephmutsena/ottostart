<?php

namespace Tests\Unit\Services;

use App\Services\AccountLockoutService;
use App\Models\SecurityEvent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

class AccountLockoutServiceTest extends TestCase
{
    use RefreshDatabase;

    private AccountLockoutService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new AccountLockoutService();
        Cache::flush(); // Ensure clean cache for each test
    }

    public function test_it_records_failed_attempts()
    {
        $identifier = 'test@example.com';
        $ip = '127.0.0.1';

        $this->service->recordFailedAttempt($identifier, $ip);

        // Check if cache has attempts
        $this->assertEquals(1, $this->service->getFailedAttemptCount($identifier));
        $this->assertEquals(1, $this->service->getIpFailedAttemptCount($ip));

        // Check if security event created
        $this->assertDatabaseHas('security_events', [
            'type' => 'failed_login',
            'metadata->identifier' => $identifier,
        ]);
    }

    public function test_it_locks_out_user_after_max_attempts()
    {
        $identifier = 'test@example.com';
        $ip = '127.0.0.1';

        // 5 is max attempts in config
        for ($i = 0; $i < 5; $i++) {
            $this->service->recordFailedAttempt($identifier, $ip);
        }

        $this->assertTrue($this->service->isUserLockedOut($identifier));
        
        $lockoutInfo = $this->service->getUserLockoutInfo($identifier);
        $this->assertNotNull($lockoutInfo);
        $this->assertEquals(5, $lockoutInfo['attempt_count']);
    }

    public function test_it_locks_out_ip_after_max_attempts()
    {
        $identifier = 'test@example.com';
        $ip = '127.0.0.1';

        // 20 is max IP attempts in config
        for ($i = 0; $i < 20; $i++) {
            $this->service->recordFailedAttempt($identifier, $ip);
        }

        $this->assertTrue($this->service->isIpLockedOut($ip));

        $lockoutInfo = $this->service->getIpLockoutInfo($ip);
        $this->assertNotNull($lockoutInfo);
        $this->assertEquals(20, $lockoutInfo['attempt_count']);
    }

    public function test_it_resets_attempts_on_successful_login()
    {
        $identifier = 'test@example.com';
        $ip = '127.0.0.1';

        $this->service->recordFailedAttempt($identifier, $ip);
        $this->assertEquals(1, $this->service->getFailedAttemptCount($identifier));

        $this->service->recordSuccessfulLogin($identifier, $ip);
        $this->assertEquals(0, $this->service->getFailedAttemptCount($identifier));
    }

    public function test_it_can_unlock_user_manually()
    {
        $identifier = 'test@example.com';
        $ip = '127.0.0.1';

        // Lockout
        for ($i = 0; $i < 5; $i++) {
            $this->service->recordFailedAttempt($identifier, $ip);
        }
        $this->assertTrue($this->service->isUserLockedOut($identifier));

        // Unlock
        $this->service->unlockUser($identifier);
        $this->assertFalse($this->service->isUserLockedOut($identifier));
        $this->assertEquals(0, $this->service->getFailedAttemptCount($identifier));
    }

    public function test_it_permanently_locks_user_after_threshold()
    {
        // 10 is permanent lockout threshold in config
        // But logic relies on previous lockout entries in cache or some counter?
        // logic: $lockoutCount = Cache::get($lockoutCountKey, 0) + 1;
        // So we need to trigger lockout 10 times.
        
        $identifier = 'permanent@example.com';
        $ip = '127.0.0.1';

        for ($j = 0; $j < 10; $j++) {
            // Simulate 5 failed attempts to trigger 1 lockout
             for ($i = 0; $i < 5; $i++) {
                $this->service->recordFailedAttempt($identifier, $ip);
            }
            
            // Should be locked out now.
            // But to trigger next lockout, we need to wait until lockout expires OR clear lockout manually?
            // Logic only checks failed attempts count.
            // If locked out, usually login is prevented before calling recordFailedAttempt, but here we test the service logic.
            // We need to wait for lockout to expire to record more failed attempts?
            // Actually, `recordFailedAttempt` doesn't check isUserLockedOut at the start.
            // But `lockoutUser` increments `lockout_count`.
            
            // To be clean, let's manually clear the current lockout so we can trigger another one, 
            // but keep the lockout count which is stored separately in `lockout_count:{identifier}`.
            // Wait, `unlockUser` calling `Cache::forget($lockoutKey)` but NOT clearing `lockout_count:{identifier}`?
            // Code: `unlockUser` forgets `user_lockout:{identifier}` and `login_attempts:user:{identifier}`.
            // It does NOT forget `lockout_count:{identifier}`.
            
            $this->service->unlockUser($identifier);
        }

        // Now we should have triggered 10 lockouts. The 10th one should be permanent.
        // Wait, I just unlocked the 10th one in the loop.
        // Let's do 9 unlocks, then force the 10th lockout.
        
        Cache::flush();
        
        $identifier = 'permanent_real@example.com';
        // Build up 9 prior lockouts
        $lockoutCountKey = "lockout_count:{$identifier}";
        Cache::put($lockoutCountKey, 9);
        
        // Now trigger 10th
        for ($i = 0; $i < 5; $i++) {
            $this->service->recordFailedAttempt($identifier, $ip);
        }

        $lockoutInfo = $this->service->getUserLockoutInfo($identifier);
        $this->assertTrue($lockoutInfo['is_permanent']);
        
        // Also check if user model is updated
        $user = User::factory()->create(['email' => $identifier, 'is_active' => true]);
        
        // Because the lockout happened before user creation in this test flow (user created after),
        // the service code `User::where(...)` wouldn't have found the user.
        // We should create user first.
        
        $identifier = 'user_permanent@example.com';
        $user = User::factory()->create(['email' => $identifier, 'is_active' => true]);
        
        Cache::put("lockout_count:{$identifier}", 9);
        for ($i = 0; $i < 5; $i++) {
            $this->service->recordFailedAttempt($identifier, $ip);
        }
        
        $user->refresh();
        $this->assertFalse((bool)$user->is_active); // Should be deactivated
    }
}
