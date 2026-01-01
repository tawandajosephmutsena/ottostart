<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\HasSeoOptimization;
use App\Traits\HasSemanticAnalysis;

class Page extends Model
{
    use HasFactory, HasSeoOptimization, HasSemanticAnalysis;

    protected $fillable = [
        'title',
        'slug',
        'content',
        'meta_title',
        'meta_description',
        'is_published',
        'template',
    ];

    protected $casts = [
        'content' => 'array',
        'is_published' => 'boolean',
    ];

    protected $attributes = [
        'is_published' => false,
        'template' => 'default',
    ];

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function getRouteKeyName()
    {
        return 'slug';
    }
}
