<?php

namespace Database\Seeders;

use App\Models\Page;
use Illuminate\Database\Seeder;

class PageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $pages = [
            [
                'title' => 'Home',
                'slug' => 'home',
                'meta_title' => 'Avant-Garde - Digital Innovation Agency',
                'meta_description' => 'We create avant-garde digital experiences that push boundaries.',
                'template' => 'home',
                'is_published' => true,
                'content' => [
                    'blocks' => [
                        [
                            'id' => 'hero-1',
                            'type' => 'hero',
                            'content' => [
                                'title' => 'Digital Innovation Redefined',
                                'subtitle' => 'Avant-Garde Agency',
                                'image' => '/images/hero-bg.jpg'
                            ]
                        ]
                    ]
                ]
            ],
            [
                'title' => 'Contact Us',
                'slug' => 'contact',
                'meta_title' => 'Contact Us - Start Your Project',
                'meta_description' => 'Get in touch with us to discuss your next digital project.',
                'template' => 'contact',
                'is_published' => true,
                'content' => [
                    'blocks' => []
                ]
            ],
            [
                'title' => 'Privacy Policy',
                'slug' => 'privacy-policy',
                'meta_title' => 'Privacy Policy',
                'meta_description' => 'Our commitment to protecting your privacy.',
                'template' => 'default',
                'is_published' => true,
                'content' => [
                    'blocks' => [
                        [
                            'id' => 'text-1',
                            'type' => 'text',
                            'content' => [
                                'body' => "# Privacy Policy\n\nLast updated: " . now()->format('F j, Y') . "\n\nWe value your privacy very highly. Please read this policy carefully to understand how we collect, use, and share your personal information."
                            ]
                        ]
                    ]
                ]
            ],
            [
                'title' => 'Terms of Service',
                'slug' => 'terms-of-service',
                'meta_title' => 'Terms of Service',
                'meta_description' => 'The rules and regulations for using our website.',
                'template' => 'default',
                'is_published' => true,
                'content' => [
                    'blocks' => [
                        [
                            'id' => 'text-1',
                            'type' => 'text',
                            'content' => [
                                'body' => "# Terms of Service\n\nBy accessing this website we assume you accept these terms and conditions. Do not continue to use Avant-Garde CMS if you do not agree to take all of the terms and conditions stated on this page."
                            ]
                        ]
                    ]
                ]
            ]
        ];

        foreach ($pages as $page) {
            Page::firstOrCreate(
                ['slug' => $page['slug']],
                $page
            );
        }
    }
}
