<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Interaction extends Model
{
    protected $fillable = [
        'visit_id',
        'type',
        'url',
        'x',
        'y',
        'viewport_width',
        'viewport_height',
        'element_selector',
        'scroll_depth',
    ];

    public function visit()
    {
        return $this->belongsTo(Visit::class);
    }
}
