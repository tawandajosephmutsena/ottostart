<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'type',
        'group_name',
    ];

    protected $casts = [
        'value' => 'array',
    ];

    protected $attributes = [
        'type' => 'text',
        'group_name' => 'general',
    ];

    public function scopeByGroup($query, $group)
    {
        return $query->where('group_name', $group);
    }

    public function scopeByKey($query, $key)
    {
        return $query->where('key', $key);
    }

    public static function get($key, $default = null)
    {
        $setting = static::where('key', $key)->first();
        
        if (!$setting) {
            return $default;
        }

        return match ($setting->type) {
            'boolean' => (bool) $setting->value,
            'number' => (float) $setting->value,
            'json' => $setting->value,
            default => is_array($setting->value) ? $setting->value[0] ?? $default : $setting->value,
        };
    }

    public static function set($key, $value, $type = 'text', $group = 'general')
    {
        return static::updateOrCreate(
            ['key' => $key],
            [
                'value' => is_array($value) ? $value : [$value],
                'type' => $type,
                'group_name' => $group,
            ]
        );
    }
}
