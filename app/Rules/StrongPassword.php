<?php

namespace App\Rules;

use App\Services\PasswordPolicyService;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class StrongPassword implements ValidationRule
{
    private ?array $userInfo;
    private PasswordPolicyService $passwordPolicy;

    public function __construct(?array $userInfo = null)
    {
        $this->userInfo = $userInfo;
        $this->passwordPolicy = app(PasswordPolicyService::class);
    }

    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!is_string($value)) {
            $fail('The :attribute must be a string.');
            return;
        }

        $validation = $this->passwordPolicy->validatePassword($value, $this->userInfo);
        
        if (!$validation['valid']) {
            foreach ($validation['errors'] as $error) {
                $fail($error);
            }
        }
    }
}