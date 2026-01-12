<?php

namespace Tests\Feature\Admin;

use App\Models\NavigationMenu;
use App\Models\NavigationMenuItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NavigationMenuTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $menu;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create(['role' => 'admin']);
        
        $this->menu = NavigationMenu::create([
            'name' => 'Main Menu',
            'slug' => 'main-menu',
            'location' => 'header',
            'is_active' => true,
        ]);
    }

    public function test_admin_can_view_menus_index()
    {
        $response = $this->actingAs($this->user)
            ->get(route('admin.menus.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('admin/menus/Index')
            ->has('menus')
        );
    }

    public function test_admin_can_add_menu_item()
    {
        $response = $this->actingAs($this->user)
            ->post(route('admin.menus.items.store', $this->menu), [
                'title' => 'New Item',
                'url' => '/new-item',
                'is_visible' => true,
                'open_in_new_tab' => false,
            ]);

        $response->assertRedirect();
        
        $this->assertDatabaseHas('navigation_menu_items', [
            'menu_id' => $this->menu->id,
            'title' => 'New Item',
            'url' => '/new-item',
        ]);
    }

    public function test_admin_can_remove_menu_item()
    {
        $item = NavigationMenuItem::create([
            'menu_id' => $this->menu->id,
            'title' => 'Item to Delete',
            'url' => '/delete-me',
            'order' => 0,
        ]);

        $response = $this->actingAs($this->user)
            ->delete(route('admin.menus.items.destroy', [$this->menu, $item]));

        $response->assertRedirect();
        $this->assertDatabaseMissing('navigation_menu_items', ['id' => $item->id]);
    }

    public function test_admin_can_reorder_menu_items()
    {
        $item1 = NavigationMenuItem::create([
            'menu_id' => $this->menu->id,
            'title' => 'Item 1',
            'order' => 0,
        ]);
        
        $item2 = NavigationMenuItem::create([
            'menu_id' => $this->menu->id,
            'title' => 'Item 2',
            'order' => 1,
        ]);

        $response = $this->actingAs($this->user)
            ->post(route('admin.menus.items.reorder', $this->menu), [
                'items' => [
                    ['id' => $item1->id, 'order' => 1],
                    ['id' => $item2->id, 'order' => 0],
                ]
            ]);

        $response->assertRedirect();
        
        $this->assertEquals(1, $item1->fresh()->order);
        $this->assertEquals(0, $item2->fresh()->order);
    }
}
