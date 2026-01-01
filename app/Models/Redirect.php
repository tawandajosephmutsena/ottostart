<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Redirect extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'from_url',
        'to_url',
        'status_code',
        'is_active',
        'hit_count',
        'last_hit_at',
        'notes',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'hit_count' => 'integer',
        'last_hit_at' => 'datetime',
    ];

    /**
     * Scope for active redirects
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for finding redirect by from URL
     */
    public function scopeForUrl($query, string $url)
    {
        return $query->where('from_url', $url);
    }

    /**
     * Record a hit for this redirect
     */
    public function recordHit(): void
    {
        $this->increment('hit_count');
        $this->update(['last_hit_at' => now()]);
    }

    /**
     * Get the redirect type based on status code
     */
    public function getTypeAttribute(): string
    {
        return match ($this->status_code) {
            301 => 'Permanent',
            302 => 'Temporary',
            307 => 'Temporary (Preserve Method)',
            308 => 'Permanent (Preserve Method)',
            default => 'Unknown',
        };
    }

    /**
     * Validate redirect URLs
     */
    public static function validateUrls(string $fromUrl, string $toUrl): array
    {
        $errors = [];

        // Check if from_url is valid
        if (!filter_var($fromUrl, FILTER_VALIDATE_URL) && !str_starts_with($fromUrl, '/')) {
            $errors[] = 'From URL must be a valid URL or path starting with /';
        }

        // Check if to_url is valid
        if (!filter_var($toUrl, FILTER_VALIDATE_URL) && !str_starts_with($toUrl, '/')) {
            $errors[] = 'To URL must be a valid URL or path starting with /';
        }

        // Check for circular redirects
        if ($fromUrl === $toUrl) {
            $errors[] = 'From URL and To URL cannot be the same';
        }

        // Check for existing redirect
        $existing = self::active()->forUrl($fromUrl)->first();
        if ($existing) {
            $errors[] = 'A redirect for this URL already exists';
        }

        return $errors;
    }
}