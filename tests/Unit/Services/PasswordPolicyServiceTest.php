<?php

namespace Tests\Unit\Services;

use App\Services\PasswordPolicyService;
use Tests\TestCase;

class PasswordPolicyServiceTest extends TestCase
{
    private PasswordPolicyService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new PasswordPolicyService();
    }

    public function test_it_validates_strong_password()
    {
        $password = 'S7rongP@ssw0rd!Secure';
        $result = $this->service->validatePassword($password);

        $this->assertTrue($result['valid']);
        $this->assertEmpty($result['errors']);
    }

    public function test_it_validates_password_too_short()
    {
        $password = 'Short1!';
        $result = $this->service->validatePassword($password);

        $this->assertFalse($result['valid']);
        $this->assertStringContainsString('Password must be at least', $result['errors'][0]);
    }

    public function test_it_validates_missing_requirements()
    {
        // Missing uppercase
        $result = $this->service->validatePassword('lowercase123!@#');
        $this->assertFalse($result['valid']);
        $this->assertStringContainsString('uppercase', implode(',', $result['errors']));

        // Missing number
        $result = $this->service->validatePassword('NoNumbersHere!@#');
        $this->assertFalse($result['valid']);
        $this->assertStringContainsString('number', implode(',', $result['errors']));

        // Missing symbol
        $result = $this->service->validatePassword('NoSymbols123456');
        $this->assertFalse($result['valid']);
        $this->assertStringContainsString('special character', implode(',', $result['errors']));
    }

    public function test_it_rejects_common_passwords()
    {
        $result = $this->service->validatePassword('password123'); // This is also too short probably, but let's check common password logic
        // "password123" is 11 chars, so it fails length too. But let's check for common password error.
        
        // Let's use a long common password if any, or just accept that it fails for multiple reasons.
        // The service checks common passwords: 'password123' is in the list.
        
        $this->assertFalse($result['valid']);
        $this->assertStringContainsString('Password is too common', implode(',', $result['errors']));
    }

    public function test_it_rejects_consecutive_characters()
    {
        $result = $this->service->validatePassword('Aaaabbbb1111!!!!');
        $this->assertFalse($result['valid']);
        $this->assertStringContainsString('consecutive', implode(',', $result['errors']));
    }

    public function test_it_rejects_personal_info()
    {
        $userInfo = [
            'name' => 'John Doe',
            'email' => 'john.doe@example.com',
            'username' => 'johndoe',
        ];

        // Password containing "johndoe"
        $result = $this->service->validatePassword('Johndoe123!@#Secure', $userInfo);
        
        $this->assertFalse($result['valid']);
        $this->assertStringContainsString('personal information', implode(',', $result['errors']));
    }

    public function test_it_generates_valid_suggestions()
    {
        $suggestions = $this->service->generatePasswordSuggestions(3);
        
        $this->assertCount(3, $suggestions);
        
        foreach ($suggestions as $suggestion) {
            $result = $this->service->validatePassword($suggestion);
            $this->assertTrue($result['valid'], "Generated suggestion '$suggestion' should be valid");
        }
    }
}
