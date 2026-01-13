<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Visit extends Model
{
    //
    protected $fillable = [
        'ip',
        'url',
        'referer',
        'user_agent',
        'user_id',
        'session_id',
        'method',
        'payload',
        'is_robot',
    ];

    protected $casts = [
        'payload' => 'array',
        'is_robot' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scopeRecent($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    public function scopeExcludeBots($query)
    {
        return $query->where('is_robot', false);
    }
}
