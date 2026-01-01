<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PreviewLink extends Model
{
    use HasFactory;

    protected $fillable = [
        'content_type',
        'content_id',
        'token',
        'password',
        'expires_at',
        'message',
        'created_by',
        'is_active',
        'view_count',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
        'view_count' => 'integer',
    ];

    protected $attributes = [
        'is_active' => true,
        'view_count' => 0,
    ];

    /**
     * Get the content that owns the preview link.
     */
    public function content(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the user who created the preview link.
     */
    public function creator()
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }

    /**
     * Get the full URL for the preview link.
     */
    public function getFullUrl(): string
    {
        return url("/preview/{$this->token}");
    }

    /**
     * Check if the preview link is expired.
     */
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    /**
     * Check if the preview link requires a password.
     */
    public function requiresPassword(): bool
    {
        return !empty($this->password);
    }

    /**
     * Scope to get active links.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
                    ->where('expires_at', '>', now());
    }
}
