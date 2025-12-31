<?php

namespace Database\Seeders;

use App\Models\PortfolioItem;
use App\Models\Service;
use App\Models\Insight;
use App\Models\Category;
use App\Models\User;
use App\Models\Setting;
use App\Models\MediaAsset;
use Illuminate\Database\Seeder;

class SampleContentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create categories
        $portfolioCategory = Category::firstOrCreate([
            'slug' => 'web-development'
        ], [
            'name' => 'Web Development',
            'description' => 'Web development projects',
            'type' => 'portfolio'
        ]);

        $serviceCategory = Category::firstOrCreate([
            'slug' => 'digital-services'
        ], [
            'name' => 'Digital Services',
            'description' => 'Digital service offerings',
            'type' => 'service'
        ]);

        $insightCategory = Category::firstOrCreate([
            'slug' => 'technology'
        ], [
            'name' => 'Technology',
            'description' => 'Technology insights and articles',
            'type' => 'insight'
        ]);

        // Get or create an author
        $author = User::firstOrCreate([
            'email' => 'author@example.com'
        ], [
            'name' => 'John Doe',
            'password' => 'password',
            'email_verified_at' => now(),
            'role' => 'admin'
        ]);

        // Create sample portfolio items
        $portfolioItems = [
            [
                'title' => 'E-commerce Platform Redesign',
                'slug' => 'ecommerce-platform-redesign',
                'description' => 'Complete redesign of a modern e-commerce platform with improved UX and performance.',
                'content' => [
                    'overview' => 'A comprehensive redesign project for a leading e-commerce platform.',
                    'challenge' => 'The existing platform had poor user experience and slow performance.',
                    'solution' => 'We implemented a modern design system with optimized performance.',
                    'results' => 'Increased conversion rates by 40% and improved page load times by 60%.'
                ],
                'featured_image' => '/images/portfolio/ecommerce-redesign.jpg',
                'gallery' => ['/images/portfolio/ecommerce-1.jpg', '/images/portfolio/ecommerce-2.jpg'],
                'client' => 'TechCorp Inc.',
                'project_date' => '2024-01-15',
                'project_url' => 'https://example.com',
                'technologies' => ['React', 'Laravel', 'Tailwind CSS', 'MySQL'],
                'is_featured' => true,
                'is_published' => true,
                'sort_order' => 1
            ],
            [
                'title' => 'Mobile Banking App',
                'slug' => 'mobile-banking-app',
                'description' => 'Secure and intuitive mobile banking application with advanced features.',
                'content' => [
                    'overview' => 'Development of a secure mobile banking application.',
                    'challenge' => 'Creating a secure yet user-friendly banking experience.',
                    'solution' => 'Implemented biometric authentication and intuitive UI design.',
                    'results' => 'Successfully launched with 100k+ downloads in first month.'
                ],
                'featured_image' => '/images/portfolio/banking-app.jpg',
                'gallery' => ['/images/portfolio/banking-1.jpg', '/images/portfolio/banking-2.jpg'],
                'client' => 'SecureBank',
                'project_date' => '2024-02-20',
                'technologies' => ['React Native', 'Node.js', 'PostgreSQL', 'AWS'],
                'is_featured' => true,
                'is_published' => true,
                'sort_order' => 2
            ],
            [
                'title' => 'Corporate Website Redesign',
                'slug' => 'corporate-website-redesign',
                'description' => 'Modern corporate website with CMS integration and responsive design.',
                'content' => [
                    'overview' => 'Complete redesign of corporate website with modern aesthetics.',
                    'challenge' => 'Outdated design and poor mobile experience.',
                    'solution' => 'Responsive design with custom CMS integration.',
                    'results' => 'Improved mobile traffic by 80% and reduced bounce rate by 35%.'
                ],
                'featured_image' => '/images/portfolio/corporate-website.jpg',
                'gallery' => ['/images/portfolio/corporate-1.jpg'],
                'client' => 'Global Industries',
                'project_date' => '2024-03-10',
                'technologies' => ['Vue.js', 'Laravel', 'Bootstrap', 'MySQL'],
                'is_featured' => true,
                'is_published' => true,
                'sort_order' => 3
            ]
        ];

        foreach ($portfolioItems as $item) {
            PortfolioItem::firstOrCreate(['slug' => $item['slug']], $item);
        }

        // Create sample services
        $services = [
            [
                'title' => 'Web Development',
                'slug' => 'web-development',
                'description' => 'Custom web applications built with modern technologies and best practices.',
                'content' => [
                    'overview' => 'We create custom web applications tailored to your business needs.',
                    'features' => ['Responsive Design', 'Performance Optimization', 'SEO Ready', 'Security First'],
                    'technologies' => ['React', 'Laravel', 'Vue.js', 'Node.js']
                ],
                'icon' => 'code',
                'featured_image' => '/images/services/web-development.jpg',
                'price_range' => '$5,000 - $50,000',
                'is_featured' => true,
                'is_published' => true,
                'sort_order' => 1
            ],
            [
                'title' => 'Mobile App Development',
                'slug' => 'mobile-app-development',
                'description' => 'Native and cross-platform mobile applications for iOS and Android.',
                'content' => [
                    'overview' => 'Professional mobile app development for all platforms.',
                    'features' => ['Native Performance', 'Cross-Platform', 'App Store Optimization', 'Push Notifications'],
                    'technologies' => ['React Native', 'Flutter', 'Swift', 'Kotlin']
                ],
                'icon' => 'mobile',
                'featured_image' => '/images/services/mobile-development.jpg',
                'price_range' => '$10,000 - $100,000',
                'is_featured' => true,
                'is_published' => true,
                'sort_order' => 2
            ],
            [
                'title' => 'UI/UX Design',
                'slug' => 'ui-ux-design',
                'description' => 'User-centered design solutions that enhance user experience and engagement.',
                'content' => [
                    'overview' => 'Creating intuitive and beautiful user interfaces.',
                    'features' => ['User Research', 'Wireframing', 'Prototyping', 'Design Systems'],
                    'technologies' => ['Figma', 'Adobe XD', 'Sketch', 'InVision']
                ],
                'icon' => 'design',
                'featured_image' => '/images/services/ui-ux-design.jpg',
                'price_range' => '$3,000 - $25,000',
                'is_featured' => true,
                'is_published' => true,
                'sort_order' => 3
            ]
        ];

        foreach ($services as $service) {
            Service::firstOrCreate(['slug' => $service['slug']], $service);
        }

        // Create sample insights
        $insights = [
            [
                'title' => 'The Future of Web Development in 2024',
                'slug' => 'future-of-web-development-2024',
                'excerpt' => 'Exploring the latest trends and technologies shaping the future of web development.',
                'content' => [
                    'introduction' => 'Web development continues to evolve at a rapid pace...',
                    'sections' => [
                        ['heading' => 'AI Integration', 'content' => 'AI is becoming increasingly important...'],
                        ['heading' => 'Performance Optimization', 'content' => 'Speed and performance remain crucial...'],
                        ['heading' => 'Security Considerations', 'content' => 'Security is more important than ever...']
                    ]
                ],
                'featured_image' => '/images/insights/web-development-future.jpg',
                'author_id' => $author->id,
                'category_id' => $insightCategory->id,
                'tags' => ['Web Development', 'Technology', 'Trends', '2024'],
                'reading_time' => 8,
                'is_featured' => true,
                'is_published' => true,
                'published_at' => now()->subDays(2)
            ],
            [
                'title' => 'Building Scalable React Applications',
                'slug' => 'building-scalable-react-applications',
                'excerpt' => 'Best practices and patterns for creating maintainable and scalable React applications.',
                'content' => [
                    'introduction' => 'React has become the go-to framework for modern web applications...',
                    'sections' => [
                        ['heading' => 'Component Architecture', 'content' => 'Proper component structure is essential...'],
                        ['heading' => 'State Management', 'content' => 'Choosing the right state management solution...'],
                        ['heading' => 'Performance Optimization', 'content' => 'Optimizing React apps for better performance...']
                    ]
                ],
                'featured_image' => '/images/insights/react-scalability.jpg',
                'author_id' => $author->id,
                'category_id' => $insightCategory->id,
                'tags' => ['React', 'JavaScript', 'Frontend', 'Architecture'],
                'reading_time' => 12,
                'is_featured' => false,
                'is_published' => true,
                'published_at' => now()->subDays(5)
            ],
            [
                'title' => 'Modern CSS Techniques for Better UX',
                'slug' => 'modern-css-techniques-better-ux',
                'excerpt' => 'Discover advanced CSS techniques that can significantly improve user experience.',
                'content' => [
                    'introduction' => 'CSS has evolved significantly in recent years...',
                    'sections' => [
                        ['heading' => 'CSS Grid and Flexbox', 'content' => 'Modern layout techniques...'],
                        ['heading' => 'Custom Properties', 'content' => 'CSS variables for better maintainability...'],
                        ['heading' => 'Animation and Transitions', 'content' => 'Creating smooth user interactions...']
                    ]
                ],
                'featured_image' => '/images/insights/modern-css.jpg',
                'author_id' => $author->id,
                'category_id' => $insightCategory->id,
                'tags' => ['CSS', 'Frontend', 'UX', 'Design'],
                'reading_time' => 6,
                'is_featured' => true,
                'is_published' => true,
                'published_at' => now()->subDays(7)
            ]
        ];

        foreach ($insights as $insight) {
            Insight::firstOrCreate(['slug' => $insight['slug']], $insight);
        }

        // Create homepage stats setting
        Setting::firstOrCreate(['key' => 'homepage_stats'], [
            'value' => [
                [
                    'value' => '150',
                    'label' => 'Projects Completed',
                    'suffix' => '+',
                ],
                [
                    'value' => '50',
                    'label' => 'Happy Clients',
                    'suffix' => '+',
                ],
                [
                    'value' => '5',
                    'label' => 'Years Experience',
                    'suffix' => '+',
                ],
                [
                    'value' => '24/7',
                    'label' => 'Support',
                ],
            ],
            'type' => 'json',
            'group_name' => 'homepage'
        ]);

        // Seed Media Assets for all the images used above
        $images = [
            '/images/portfolio/ecommerce-redesign.jpg',
            '/images/portfolio/ecommerce-1.jpg',
            '/images/portfolio/ecommerce-2.jpg',
            '/images/portfolio/banking-app.jpg',
            '/images/portfolio/banking-1.jpg',
            '/images/portfolio/banking-2.jpg',
            '/images/portfolio/corporate-website.jpg',
            '/images/portfolio/corporate-1.jpg',
            '/images/services/web-development.jpg',
            '/images/services/mobile-development.jpg',
            '/images/services/ui-ux-design.jpg',
            '/images/insights/web-development-future.jpg',
            '/images/insights/react-scalability.jpg',
            '/images/insights/modern-css.jpg',
            '/images/hero-bg.jpg',
        ];

        foreach ($images as $path) {
            $filename = basename($path);
            MediaAsset::firstOrCreate(['path' => $path], [
                'filename' => $filename,
                'original_name' => $filename,
                'mime_type' => 'image/jpeg',
                'size' => 1024 * rand(100, 2000), // Random size between 100KB and 2MB
                'alt_text' => ucwords(str_replace(['-', '.jpg'], [' ', ''], $filename)),
                'caption' => '',
                'folder' => 'uploads',
            ]);
        }
    }
}