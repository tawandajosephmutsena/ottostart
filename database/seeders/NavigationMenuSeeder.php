<?php

namespace Database\Seeders;

use App\Models\NavigationMenu;
use App\Models\NavigationMenuItem;
use Illuminate\Database\Seeder;

class NavigationMenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create main menu (used for both header and footer)
        $mainMenu = NavigationMenu::firstOrCreate(
            ['slug' => 'main-menu'],
            [
                'name' => 'Main Menu',
                'location' => 'header',
                'is_active' => true,
            ]
        );

        // Default navigation items
        $items = [
            ['title' => 'Home', 'url' => '/', 'order' => 0],
            ['title' => 'About', 'url' => '/about', 'order' => 1],
            ['title' => 'Services', 'url' => '/services', 'order' => 2],
            ['title' => 'Portfolio', 'url' => '/portfolio', 'order' => 3],
            ['title' => 'Team', 'url' => '/team', 'order' => 4],
            ['title' => 'Blog', 'url' => '/blog', 'order' => 5],
            ['title' => 'Contact', 'url' => '/contact', 'order' => 6],
        ];

        foreach ($items as $item) {
            NavigationMenuItem::firstOrCreate(
                [
                    'menu_id' => $mainMenu->id,
                    'url' => $item['url'],
                ],
                [
                    'title' => $item['title'],
                    'order' => $item['order'],
                    'is_visible' => true,
                ]
            );
        }
    }
}
