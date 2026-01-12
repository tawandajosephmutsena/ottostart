<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NavigationMenuItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'menu_id',
        'page_id',
        'parent_id',
        'title',
        'url',
        'order',
        'is_visible',
        'open_in_new_tab',
        'icon',
    ];

    protected $casts = [
        'is_visible' => 'boolean',
        'open_in_new_tab' => 'boolean',
        'order' => 'integer',
    ];

    /**
     * Get the menu this item belongs to.
     */
    public function menu(): BelongsTo
    {
        return $this->belongsTo(NavigationMenu::class, 'menu_id');
    }

    /**
     * Get the page this item links to (if any).
     */
    public function page(): BelongsTo
    {
        return $this->belongsTo(Page::class);
    }

    /**
     * Get the parent menu item.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(NavigationMenuItem::class, 'parent_id');
    }

    /**
     * Get child menu items.
     */
    public function children(): HasMany
    {
        return $this->hasMany(NavigationMenuItem::class, 'parent_id')->orderBy('order');
    }

    /**
     * Get the resolved URL for this menu item.
     */
    public function getResolvedUrlAttribute(): string
    {
        if ($this->url) {
            return $this->url;
        }

        if ($this->page) {
            return '/' . $this->page->slug;
        }

        return '#';
    }

    /**
     * Scope to only visible items.
     */
    public function scopeVisible($query)
    {
        return $query->where('is_visible', true);
    }
}
