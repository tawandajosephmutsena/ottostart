<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DatabaseSecurityService
{
    /**
     * Patterns that indicate potential SQL injection attempts
     */
    private array $suspiciousPatterns = [
        '/union\s+select/i',
        '/drop\s+table/i',
        '/delete\s+from/i',
        '/insert\s+into/i',
        '/update\s+.*\s+set/i',
        '/exec\s*\(/i',
        '/execute\s*\(/i',
        '/sp_/i',
        '/xp_/i',
        '/--/i',
        '/\/\*/i',
        '/\*\//i',
        '/;\s*drop/i',
        '/;\s*delete/i',
        '/;\s*insert/i',
        '/;\s*update/i',
        '/information_schema/i',
        '/sys\./i',
        '/mysql\./i',
        '/pg_/i',
        '/waitfor\s+delay/i',
        '/benchmark\s*\(/i',
        '/sleep\s*\(/i',
        '/load_file\s*\(/i',
        '/into\s+outfile/i',
        '/into\s+dumpfile/i',
    ];

    /**
     * Initialize database security monitoring
     */
    public function initialize(): void
    {
        // Listen for database queries
        DB::listen(function ($query) {
            $this->analyzeQuery($query);
        });
    }

    /**
     * Analyze a database query for security issues
     */
    private function analyzeQuery($query): void
    {
        $sql = $query->sql;
        $bindings = $query->bindings;
        $time = $query->time;

        // Check for suspicious patterns in the SQL
        if ($this->containsSuspiciousPatterns($sql)) {
            $this->logSuspiciousQuery($sql, $bindings, $time);
        }

        // Check for long-running queries (potential DoS)
        if ($time > 5000) { // 5 seconds
            $this->logSlowQuery($sql, $bindings, $time);
        }

        // Check for queries without proper parameterization
        if ($this->hasUnparameterizedInput($sql)) {
            $this->logUnparameterizedQuery($sql, $bindings);
        }
    }

    /**
     * Check if SQL contains suspicious patterns
     */
    private function containsSuspiciousPatterns(string $sql): bool
    {
        foreach ($this->suspiciousPatterns as $pattern) {
            if (preg_match($pattern, $sql)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if SQL has unparameterized input (potential injection point)
     */
    private function hasUnparameterizedInput(string $sql): bool
    {
        // Look for string concatenation patterns that might indicate unparameterized queries
        $dangerousPatterns = [
            '/\'\s*\+\s*\'/i', // String concatenation
            '/"\s*\+\s*"/i',
            '/\'\s*\|\|\s*\'/i', // SQL concatenation
            '/"\s*\|\|\s*"/i',
            '/\'\s*concat\s*\(/i', // CONCAT function
            '/"\s*concat\s*\(/i',
        ];

        foreach ($dangerousPatterns as $pattern) {
            if (preg_match($pattern, $sql)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Log suspicious database query
     */
    private function logSuspiciousQuery(string $sql, array $bindings, float $time): void
    {
        Log::warning('Suspicious database query detected', [
            'sql' => $sql,
            'bindings' => $bindings,
            'execution_time' => $time,
            'user_id' => auth()->id(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'url' => request()->fullUrl(),
            'timestamp' => now(),
        ]);

        // Also log to security events if the model exists and table exists
        if (class_exists(\App\Models\SecurityEvent::class)) {
            try {
                // Only log if the table exists (prevents migration failures)
                if (\Illuminate\Support\Facades\Schema::hasTable('security_events')) {
                    \App\Models\SecurityEvent::create([
                        'type' => 'suspicious_query',
                        'severity' => 'high',
                        'description' => 'Suspicious database query pattern detected',
                        'ip_address' => request()->ip(),
                        'user_agent' => request()->userAgent(),
                        'user_id' => auth()->id(),
                        'metadata' => [
                            'sql' => $sql,
                            'bindings' => $bindings,
                            'execution_time' => $time,
                            'url' => request()->fullUrl(),
                        ],
                    ]);
                }
            } catch (\Throwable $e) {
                // Silently fail if table doesn't exist during migrations
            }
        }
    }

    /**
     * Log slow database query
     */
    private function logSlowQuery(string $sql, array $bindings, float $time): void
    {
        Log::info('Slow database query detected', [
            'sql' => $sql,
            'bindings' => $bindings,
            'execution_time' => $time,
            'user_id' => auth()->id(),
            'timestamp' => now(),
        ]);
    }

    /**
     * Log unparameterized query
     */
    private function logUnparameterizedQuery(string $sql, array $bindings): void
    {
        Log::warning('Potentially unparameterized query detected', [
            'sql' => $sql,
            'bindings' => $bindings,
            'user_id' => auth()->id(),
            'ip_address' => request()->ip(),
            'timestamp' => now(),
        ]);
    }

    /**
     * Validate query parameters for potential injection
     */
    public function validateQueryParameters(array $parameters): bool
    {
        foreach ($parameters as $parameter) {
            if (is_string($parameter) && $this->containsSuspiciousPatterns($parameter)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Sanitize input for database queries
     */
    public function sanitizeInput(string $input): string
    {
        // Remove null bytes
        $input = str_replace("\0", '', $input);
        
        // Remove or escape dangerous characters
        $input = str_replace(['--', '/*', '*/', ';'], '', $input);
        
        // Normalize Unicode to prevent bypass attempts
        if (function_exists('normalizer_normalize')) {
            $input = normalizer_normalize($input, \Normalizer::FORM_C);
        }
        
        return trim($input);
    }

    /**
     * Create a secure query builder with additional validation
     */
    public function createSecureQueryBuilder(string $table)
    {
        return DB::table($table)->tap(function ($query) {
            // Add query validation middleware
            $query->macro('secureWhere', function ($column, $operator = null, $value = null) {
                // Validate column name
                if (!preg_match('/^[a-zA-Z_][a-zA-Z0-9_]*$/', $column)) {
                    throw new \InvalidArgumentException('Invalid column name');
                }
                
                // Validate operator
                $allowedOperators = ['=', '!=', '<>', '<', '>', '<=', '>=', 'like', 'not like', 'in', 'not in', 'between', 'not between'];
                if ($operator && !in_array(strtolower($operator), $allowedOperators)) {
                    throw new \InvalidArgumentException('Invalid operator');
                }
                
                return $this->where($column, $operator, $value);
            });
        });
    }
}