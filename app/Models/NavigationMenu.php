<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NavigationMenu extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'location',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the menu items for this menu.
     */
    public function items(): HasMany
    {
        return $this->hasMany(NavigationMenuItem::class, 'menu_id')
            ->whereNull('parent_id')
            ->orderBy('order');
    }

    /**
     * Get all menu items including nested ones.
     */
    public function allItems(): HasMany
    {
        return $this->hasMany(NavigationMenuItem::class, 'menu_id')->orderBy('order');
    }

    /**
     * Get the menu by its slug.
     */
    public static function findBySlug(string $slug): ?self
    {
        return static::where('slug', $slug)->where('is_active', true)->first();
    }

    /**
     * Get the main navigation menu.
     */
    public static function getMainMenu(): ?self
    {
        return static::findBySlug('main-menu');
    }
}
