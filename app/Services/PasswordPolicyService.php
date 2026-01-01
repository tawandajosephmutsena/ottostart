<?php

namespace App\Services;

class PasswordPolicyService
{
    /**
     * Password policy configuration
     */
    private array $config = [
        'min_length' => 12,
        'max_length' => 128,
        'require_uppercase' => true,
        'require_lowercase' => true,
        'require_numbers' => true,
        'require_symbols' => true,
        'min_unique_chars' => 8,
        'max_consecutive_chars' => 2,
        'prevent_common_passwords' => true,
        'prevent_personal_info' => true,
        'password_history_count' => 5,
    ];

    /**
     * Common weak passwords to reject
     */
    private array $commonPasswords = [
        'password', 'password123', '123456', '123456789', 'qwerty', 'abc123',
        'password1', 'admin', 'letmein', 'welcome', 'monkey', '1234567890',
        'dragon', 'master', 'shadow', 'superman', 'michael', 'football',
        'baseball', 'liverpool', 'jordan', 'harley', 'robert', 'matthew',
        'daniel', 'andrew', 'joshua', 'anthony', 'william', 'david',
        'richard', 'charles', 'thomas', 'christopher', 'daniel', 'paul',
        'mark', 'donald', 'george', 'kenneth', 'steven', 'edward',
        'brian', 'ronald', 'anthony', 'kevin', 'jason', 'matthew',
    ];

    /**
     * Validate password against policy
     */
    public function validatePassword(string $password, ?array $userInfo = null): array
    {
        $errors = [];

        // Check length
        if (strlen($password) < $this->config['min_length']) {
            $errors[] = "Password must be at least {$this->config['min_length']} characters long.";
        }

        if (strlen($password) > $this->config['max_length']) {
            $errors[] = "Password cannot exceed {$this->config['max_length']} characters.";
        }

        // Check character requirements
        if ($this->config['require_uppercase'] && !preg_match('/[A-Z]/', $password)) {
            $errors[] = 'Password must contain at least one uppercase letter.';
        }

        if ($this->config['require_lowercase'] && !preg_match('/[a-z]/', $password)) {
            $errors[] = 'Password must contain at least one lowercase letter.';
        }

        if ($this->config['require_numbers'] && !preg_match('/[0-9]/', $password)) {
            $errors[] = 'Password must contain at least one number.';
        }

        if ($this->config['require_symbols'] && !preg_match('/[^a-zA-Z0-9]/', $password)) {
            $errors[] = 'Password must contain at least one special character.';
        }

        // Check unique characters
        $uniqueChars = count(array_unique(str_split($password)));
        if ($uniqueChars < $this->config['min_unique_chars']) {
            $errors[] = "Password must contain at least {$this->config['min_unique_chars']} unique characters.";
        }

        // Check consecutive characters
        if ($this->hasConsecutiveChars($password, $this->config['max_consecutive_chars'])) {
            $errors[] = "Password cannot have more than {$this->config['max_consecutive_chars']} consecutive identical characters.";
        }

        // Check against common passwords
        if ($this->config['prevent_common_passwords'] && $this->isCommonPassword($password)) {
            $errors[] = 'Password is too common. Please choose a more unique password.';
        }

        // Check against personal information
        if ($this->config['prevent_personal_info'] && $userInfo && $this->containsPersonalInfo($password, $userInfo)) {
            $errors[] = 'Password cannot contain personal information such as name or email.';
        }

        // Check for keyboard patterns
        if ($this->hasKeyboardPattern($password)) {
            $errors[] = 'Password cannot contain common keyboard patterns.';
        }

        // Check for dictionary words
        if ($this->containsDictionaryWords($password)) {
            $errors[] = 'Password should not contain common dictionary words.';
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors,
            'strength' => $this->calculatePasswordStrength($password),
        ];
    }

    /**
     * Check for consecutive identical characters
     */
    private function hasConsecutiveChars(string $password, int $maxConsecutive): bool
    {
        $count = 1;
        $prevChar = '';

        foreach (str_split($password) as $char) {
            if ($char === $prevChar) {
                $count++;
                if ($count > $maxConsecutive) {
                    return true;
                }
            } else {
                $count = 1;
            }
            $prevChar = $char;
        }

        return false;
    }

    /**
     * Check if password is in common passwords list
     */
    private function isCommonPassword(string $password): bool
    {
        $lowerPassword = strtolower($password);
        
        foreach ($this->commonPasswords as $commonPassword) {
            if ($lowerPassword === $commonPassword || 
                levenshtein($lowerPassword, $commonPassword) <= 2) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if password contains personal information
     */
    private function containsPersonalInfo(string $password, array $userInfo): bool
    {
        $lowerPassword = strtolower($password);
        
        $personalData = [
            $userInfo['name'] ?? '',
            $userInfo['email'] ?? '',
            $userInfo['username'] ?? '',
            $userInfo['first_name'] ?? '',
            $userInfo['last_name'] ?? '',
        ];

        foreach ($personalData as $data) {
            if (empty($data)) continue;
            
            $lowerData = strtolower($data);
            
            // Check if personal data is contained in password
            if (strlen($lowerData) >= 3 && strpos($lowerPassword, $lowerData) !== false) {
                return true;
            }
            
            // Check email username part
            if (strpos($data, '@') !== false) {
                $emailParts = explode('@', $lowerData);
                if (strlen($emailParts[0]) >= 3 && strpos($lowerPassword, $emailParts[0]) !== false) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Check for keyboard patterns
     */
    private function hasKeyboardPattern(string $password): bool
    {
        $patterns = [
            'qwerty', 'asdf', 'zxcv', '1234', '4321', 'abcd', 'dcba',
            'qwertyuiop', 'asdfghjkl', 'zxcvbnm', '1234567890',
            '0987654321', 'abcdefghijklmnopqrstuvwxyz',
        ];

        $lowerPassword = strtolower($password);

        foreach ($patterns as $pattern) {
            if (strpos($lowerPassword, $pattern) !== false || 
                strpos($lowerPassword, strrev($pattern)) !== false) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check for common dictionary words
     */
    private function containsDictionaryWords(string $password): bool
    {
        $commonWords = [
            'admin', 'user', 'login', 'system', 'computer', 'internet',
            'website', 'security', 'access', 'account', 'welcome',
            'hello', 'world', 'test', 'demo', 'sample', 'example',
        ];

        $lowerPassword = strtolower($password);

        foreach ($commonWords as $word) {
            if (strpos($lowerPassword, $word) !== false) {
                return true;
            }
        }

        return false;
    }

    /**
     * Calculate password strength score (0-100)
     */
    private function calculatePasswordStrength(string $password): int
    {
        $score = 0;
        $length = strlen($password);

        // Length score (0-25 points)
        if ($length >= 8) $score += 5;
        if ($length >= 12) $score += 10;
        if ($length >= 16) $score += 10;

        // Character variety (0-40 points)
        if (preg_match('/[a-z]/', $password)) $score += 5;
        if (preg_match('/[A-Z]/', $password)) $score += 5;
        if (preg_match('/[0-9]/', $password)) $score += 5;
        if (preg_match('/[^a-zA-Z0-9]/', $password)) $score += 10;

        // Unique characters (0-15 points)
        $uniqueChars = count(array_unique(str_split($password)));
        $score += min(15, $uniqueChars);

        // Complexity patterns (0-20 points)
        if (!$this->hasKeyboardPattern($password)) $score += 5;
        if (!$this->isCommonPassword($password)) $score += 10;
        if (!$this->hasConsecutiveChars($password, 2)) $score += 5;

        return min(100, $score);
    }

    /**
     * Generate password suggestions
     */
    public function generatePasswordSuggestions(int $count = 3): array
    {
        $suggestions = [];
        
        for ($i = 0; $i < $count; $i++) {
            $suggestions[] = $this->generateSecurePassword();
        }
        
        return $suggestions;
    }

    /**
     * Generate a secure password
     */
    private function generateSecurePassword(int $length = 16): string
    {
        $lowercase = 'abcdefghijklmnopqrstuvwxyz';
        $uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $numbers = '0123456789';
        $symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        
        $password = '';
        
        // Ensure at least one character from each required set
        $password .= $lowercase[random_int(0, strlen($lowercase) - 1)];
        $password .= $uppercase[random_int(0, strlen($uppercase) - 1)];
        $password .= $numbers[random_int(0, strlen($numbers) - 1)];
        $password .= $symbols[random_int(0, strlen($symbols) - 1)];
        
        // Fill the rest randomly
        $allChars = $lowercase . $uppercase . $numbers . $symbols;
        for ($i = 4; $i < $length; $i++) {
            $password .= $allChars[random_int(0, strlen($allChars) - 1)];
        }
        
        // Shuffle the password
        return str_shuffle($password);
    }

    /**
     * Get password policy requirements as array
     */
    public function getPolicyRequirements(): array
    {
        return [
            'min_length' => $this->config['min_length'],
            'max_length' => $this->config['max_length'],
            'require_uppercase' => $this->config['require_uppercase'],
            'require_lowercase' => $this->config['require_lowercase'],
            'require_numbers' => $this->config['require_numbers'],
            'require_symbols' => $this->config['require_symbols'],
            'min_unique_chars' => $this->config['min_unique_chars'],
            'max_consecutive_chars' => $this->config['max_consecutive_chars'],
        ];
    }
}