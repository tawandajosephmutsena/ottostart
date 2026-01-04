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
                'title' => 'About Us',
                'slug' => 'about',
                'meta_title' => 'About Us - Avant-Garde',
                'meta_description' => 'Our mission is defining future standards. We are a collective of visionaries dedicated to crafting digital experiences that transcend the ordinary.',
                'template' => 'about',
                'is_published' => true,
                'content' => [
                    'blocks' => [
                        [
                            'id' => 'hero-about',
                            'type' => 'hero',
                            'content' => [
                                'title' => 'Defining Future Standards',
                                'subtitle' => 'Our Mission',
                                'image' => '/images/hero-bg.jpg'
                            ]
                        ],
                        [
                            'id' => 'story-1',
                            'type' => 'story',
                            'content' => [
                                'title' => 'A journey of obsession.',
                                'body' => "Founded in 2019, Avant-Garde emerged from a singular conviction: that the digital world deserved more than \"good enough.\" We saw a landscape cluttered with templates and decided to build a sanctuary for custom, high-end digital craft.\n\nWhat started as a boutique design studio has evolved into a full-scale digital innovation house. We don't just build websites; we build competitive advantages for brands that dare to lead.",
                                'stats' => [
                                    ['label' => 'Years of Craft', 'value' => '5+'],
                                    ['label' => 'Successes', 'value' => '50+']
                                ]
                            ]
                        ],
                        [
                            'id' => 'manifesto-1',
                            'type' => 'manifesto',
                            'content' => [
                                'title' => 'Our Core Pillars',
                                'subtitle' => 'Manifesto',
                                'items' => [
                                    ['title' => 'Radical Innovation', 'description' => 'We don\'t follow trends; we set them through meticulous research and bold creative risks.', 'emoji' => '🚀'],
                                    ['title' => 'Obsessive Detail', 'description' => 'Every pixel, every line of code, and every interaction is scrutinized for absolute perfection.', 'emoji' => '🎯'],
                                    ['title' => 'Transparent Partnership', 'description' => 'We integrate with your team as partners, ensuring our results are perfectly aligned with your vision.', 'emoji' => '🤝']
                                ]
                            ]
                        ]
                    ]
                ]
            ],
            [
                'title' => 'Services',
                'slug' => 'services',
                'meta_title' => 'Our Services - Avant-Garde',
                'meta_description' => 'We offer a wide range of digital services tailored to your needs.',
                'template' => 'services',
                'is_published' => true,
                'content' => [
                    'blocks' => [
                        [
                            'id' => 'hero-services',
                            'type' => 'hero',
                            'content' => [
                                'title' => 'Precision Managed.',
                                'subtitle' => 'Knowledge Hub',
                                'image' => '/images/hero-bg.jpg'
                            ]
                        ],
                        [
                            'id' => 'services-grid',
                            'type' => 'services',
                            'content' => [
                                'title' => 'Crafting Excellence',
                                'subtitle' => 'What we do'
                            ]
                        ],
                        [
                            'id' => 'process-1',
                            'type' => 'process',
                            'content' => [
                                'title' => 'Our Method',
                                'subtitle' => 'The Forge',
                                'steps' => [
                                    ['title' => 'Discovery', 'description' => 'We dive deep into your brand, audience, and goals to build a foundation for success.'],
                                    ['title' => 'Strategy', 'description' => 'A comprehensive roadmap designed to navigate the digital landscape and achieve measurable results.'],
                                    ['title' => 'Execution', 'description' => 'Meticulous craft meets cutting-edge technology to bring your vision to life.'],
                                    ['title' => 'Evolution', 'description' => 'Continuous optimization and scaling to ensure long-term dominance.'],
                                ]
                            ]
                        ]
                    ]
                ]
            ],
            [
                'title' => 'Portfolio',
                'slug' => 'portfolio',
                'meta_title' => 'Portfolio - Our Best Work',
                'meta_description' => 'A showcase of our most innovative digital projects.',
                'template' => 'portfolio',
                'is_published' => true,
                'content' => [
                    'blocks' => [
                        [
                            'id' => 'hero-portfolio',
                            'type' => 'hero',
                            'content' => [
                                'title' => 'Digital Artifacts.',
                                'subtitle' => 'Showcase',
                                'image' => '/images/hero-bg.jpg'
                            ]
                        ],
                        [
                            'id' => 'portfolio-grid',
                            'type' => 'portfolio',
                            'content' => [
                                'title' => 'Curated Success',
                                'subtitle' => 'Recent Work'
                            ]
                        ]
                    ]
                ]
            ],
            [
                'title' => 'Blog',
                'slug' => 'blog',
                'meta_title' => 'Blog - Insights & Thoughts',
                'meta_description' => 'Stay ahead with our curated insights and thought leadership.',
                'template' => 'blog',
                'is_published' => true,
                'content' => [
                    'blocks' => [
                        [
                            'id' => 'hero-blog',
                            'type' => 'hero',
                            'content' => [
                                'title' => 'Curated Insights.',
                                'subtitle' => 'Knowledge Hub',
                                'image' => '/images/hero-bg.jpg'
                            ]
                        ],
                        [
                            'id' => 'blog-grid',
                            'type' => 'blog',
                            'content' => [
                                'title' => 'Deep Dives',
                                'subtitle' => 'Recent Articles'
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
                    'blocks' => [
                        [
                            'id' => 'hero-contact',
                            'type' => 'hero',
                            'content' => [
                                'title' => 'Start the Dialogue.',
                                'subtitle' => 'Connect With Us',
                                'image' => '/images/hero-bg.jpg'
                            ]
                        ],
                        [
                            'id' => 'contact-info-1',
                            'type' => 'contact_info',
                            'content' => [
                                'title' => 'We\'re Listening.',
                                'subtitle' => 'Inquiries',
                                'items' => [
                                    ['label' => 'Email', 'value' => 'hello@avant-garde.com', 'href' => 'mailto:hello@avant-garde.com'],
                                    ['label' => 'Phone', 'value' => '+1 (555) 123-4567', 'href' => 'tel:+15551234567'],
                                    ['label' => 'Address', 'value' => 'San Francisco, CA', 'href' => '']
                                ]
                            ]
                        ],
                        [
                            'id' => 'contact-form-1',
                            'type' => 'form',
                            'content' => [
                                'title' => 'Get in Touch',
                                'description' => 'Tell us about your project.',
                                'submitText' => 'Send Message',
                                'steps' => [
                                    [
                                        'id' => 'step-1',
                                        'title' => 'Your Details',
                                        'fields' => [
                                            ['name' => 'name', 'label' => 'Full Name', 'type' => 'text', 'required' => true, 'placeholder' => 'WHAT IS YOUR NAME?'],
                                            ['name' => 'email', 'label' => 'Email Address', 'type' => 'email', 'required' => true, 'placeholder' => 'HOW CAN WE REACH YOU?'],
                                            ['name' => 'type', 'label' => 'Inquiry Type', 'type' => 'select', 'options' => ['General Inquiry', 'New Project', 'Career Opportunity']],
                                            ['name' => 'message', 'label' => 'Your Message', 'type' => 'textarea', 'required' => true, 'placeholder' => 'TELL US ABOUT YOUR VISION...'],
                                        ]
                                    ]
                                ]
                            ]
                        ]
                    ]
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
