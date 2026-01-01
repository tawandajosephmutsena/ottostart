<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SecurityEvent extends Model
{
    protected $fillable = [
        'type',
        'severity',
        'description',
        'ip_address',
        'user_agent',
        'user_id',
        'metadata',
        'resolved_at'
    ];

    protected $casts = [
        'metadata' => 'array',
        'resolved_at' => 'datetime',
    ];

    /**
     * Get the user associated with this security event
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for unresolved events
     */
    public function scopeUnresolved($query)
    {
        return $query->whereNull('resolved_at');
    }

    /**
     * Scope for high severity events
     */
    public function scopeHighSeverity($query)
    {
        return $query->where('severity', 'high');
    }

    /**
     * Scope for events by type
     */
    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Mark event as resolved
     */
    public function resolve(): void
    {
        $this->update(['resolved_at' => now()]);
    }

    /**
     * Check if event is resolved
     */
    public function isResolved(): bool
    {
        return !is_null($this->resolved_at);
    }
}