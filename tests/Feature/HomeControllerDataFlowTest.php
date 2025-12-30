<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\PortfolioItem;
use App\Models\Service;
use App\Models\Insight;
use App\Models\User;
use App\Models\Category;
use App\Models\Setting;

class HomeControllerDataFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_home_controller_fetches_correct_data_structure(): void
    {
        // Create test data
        $this->createCompleteTestData();

        $response = $this->get('/');

        $response->assertStatus(200);
        
        // Verify the complete data structure matches requirements
        $response->assertInertia(fn ($page) => 
            $page->component('Home')
                // Verify featured projects structure
                ->has('featuredProjects')
                ->has('featuredProjects.0', fn ($project) =>
                    $project->has('id')
                        ->has('title')
                        ->has('slug')
                        ->has('description')
                        ->has('featured_image')
                        ->has('client')
                        ->has('technologies')
                        ->has('is_featured')
                )
                // Verify featured services structure
                ->has('featuredServices')
                ->has('featuredServices.0', fn ($service) =>
                    $service->has('id')
                        ->has('title')
                        ->has('slug')
                        ->has('description')
                        ->has('icon')
                        ->has('featured_image')
                        ->has('price_range')
                        ->has('is_featured')
                )
                // Verify recent insights structure with relationships
                ->has('recentInsights')
                ->has('recentInsights.0', fn ($insight) =>
                    $insight->has('id')
                        ->has('title')
                        ->has('slug')
                        ->has('excerpt')
                        ->has('featured_image')
                        ->has('author_id') // Foreign key field
                        ->has('category_id') // Foreign key field
                        ->has('author')
                        ->has('author.id')
                        ->has('author.name')
                        ->has('category')
                        ->has('category.id')
                        ->has('category.name')
                        ->has('category.slug')
                        ->has('published_at')
                        ->has('reading_time')
                )
                // Verify stats structure
                ->has('stats')
                ->has('stats.0', fn ($stat) =>
                    $stat->has('value')
                        ->has('label')
                        ->hasAny(['suffix'])
                )
        );
    }

    public function test_home_controller_respects_featured_and_published_filters(): void
    {
        // Create mix of featured/non-featured and published/unpublished content
        $author = User::create([
            'name' => 'Test Author',
            'email' => 'author@test.com',
            'password' => 'password',
            'email_verified_at' => now(),
        ]);

        $category = Category::create([
            'name' => 'Technology',
            'slug' => 'technology',
            'type' => 'insight',
        ]);

        // Featured and published (should appear)
        PortfolioItem::create([
            'title' => 'Featured Published Project',
            'slug' => 'featured-published-project',
            'description' => 'Should appear',
            'is_featured' => true,
            'is_published' => true,
        ]);

        // Featured but not published (should NOT appear)
        PortfolioItem::create([
            'title' => 'Featured Unpublished Project',
            'slug' => 'featured-unpublished-project',
            'description' => 'Should not appear',
            'is_featured' => true,
            'is_published' => false,
        ]);

        // Published but not featured (should NOT appear)
        PortfolioItem::create([
            'title' => 'Unfeatured Published Project',
            'slug' => 'unfeatured-published-project',
            'description' => 'Should not appear',
            'is_featured' => false,
            'is_published' => true,
        ]);

        // Same for services
        Service::create([
            'title' => 'Featured Published Service',
            'slug' => 'featured-published-service',
            'description' => 'Should appear',
            'is_featured' => true,
            'is_published' => true,
        ]);

        Service::create([
            'title' => 'Featured Unpublished Service',
            'slug' => 'featured-unpublished-service',
            'description' => 'Should not appear',
            'is_featured' => true,
            'is_published' => false,
        ]);

        // For insights, only published matters (recent, not featured)
        Insight::create([
            'title' => 'Published Insight',
            'slug' => 'published-insight',
            'excerpt' => 'Should appear',
            'content' => ['body' => 'Content'],
            'author_id' => $author->id,
            'category_id' => $category->id,
            'is_published' => true,
            'published_at' => now(),
        ]);

        Insight::create([
            'title' => 'Unpublished Insight',
            'slug' => 'unpublished-insight',
            'excerpt' => 'Should not appear',
            'content' => ['body' => 'Content'],
            'author_id' => $author->id,
            'category_id' => $category->id,
            'is_published' => false,
            'published_at' => now(),
        ]);

        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Home')
                ->has('featuredProjects', 1) // Only 1 featured and published
                ->where('featuredProjects.0.title', 'Featured Published Project')
                ->has('featuredServices', 1) // Only 1 featured and published
                ->where('featuredServices.0.title', 'Featured Published Service')
                ->has('recentInsights', 1) // Only 1 published
                ->where('recentInsights.0.title', 'Published Insight')
        );
    }

    public function test_home_controller_orders_content_correctly(): void
    {
        $author = User::create([
            'name' => 'Test Author',
            'email' => 'author@test.com',
            'password' => 'password',
            'email_verified_at' => now(),
        ]);

        $category = Category::create([
            'name' => 'Technology',
            'slug' => 'technology',
            'type' => 'insight',
        ]);

        // Create portfolio items with different sort orders
        PortfolioItem::create([
            'title' => 'Third Project',
            'slug' => 'third-project',
            'description' => 'Third',
            'is_featured' => true,
            'is_published' => true,
            'sort_order' => 3,
            'created_at' => now()->subDays(3),
        ]);

        PortfolioItem::create([
            'title' => 'First Project',
            'slug' => 'first-project',
            'description' => 'First',
            'is_featured' => true,
            'is_published' => true,
            'sort_order' => 1,
            'created_at' => now()->subDays(1),
        ]);

        PortfolioItem::create([
            'title' => 'Second Project',
            'slug' => 'second-project',
            'description' => 'Second',
            'is_featured' => true,
            'is_published' => true,
            'sort_order' => 2,
            'created_at' => now()->subDays(2),
        ]);

        // Create insights with different published dates
        Insight::create([
            'title' => 'Older Insight',
            'slug' => 'older-insight',
            'excerpt' => 'Older',
            'content' => ['body' => 'Content'],
            'author_id' => $author->id,
            'category_id' => $category->id,
            'is_published' => true,
            'published_at' => now()->subDays(3),
        ]);

        Insight::create([
            'title' => 'Newer Insight',
            'slug' => 'newer-insight',
            'excerpt' => 'Newer',
            'content' => ['body' => 'Content'],
            'author_id' => $author->id,
            'category_id' => $category->id,
            'is_published' => true,
            'published_at' => now()->subDays(1),
        ]);

        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Home')
                // Portfolio should be ordered by sort_order first
                ->where('featuredProjects.0.title', 'First Project')
                ->where('featuredProjects.1.title', 'Second Project')
                ->where('featuredProjects.2.title', 'Third Project')
                // Insights should be ordered by published_at desc (newest first)
                ->where('recentInsights.0.title', 'Newer Insight')
                ->where('recentInsights.1.title', 'Older Insight')
        );
    }

    private function createCompleteTestData(): void
    {
        // Create author and category
        $author = User::create([
            'name' => 'Test Author',
            'email' => 'author@test.com',
            'password' => 'password',
            'email_verified_at' => now(),
        ]);

        $category = Category::create([
            'name' => 'Technology',
            'slug' => 'technology',
            'type' => 'insight',
        ]);

        // Create complete portfolio item
        PortfolioItem::create([
            'title' => 'Complete Project',
            'slug' => 'complete-project',
            'description' => 'A complete project with all fields',
            'featured_image' => '/images/project.jpg',
            'client' => 'Test Client',
            'technologies' => ['React', 'Laravel', 'Tailwind'],
            'is_featured' => true,
            'is_published' => true,
            'sort_order' => 1,
        ]);

        // Create complete service
        Service::create([
            'title' => 'Complete Service',
            'slug' => 'complete-service',
            'description' => 'A complete service with all fields',
            'icon' => 'code',
            'featured_image' => '/images/service.jpg',
            'price_range' => '$1000-$5000',
            'is_featured' => true,
            'is_published' => true,
            'sort_order' => 1,
        ]);

        // Create complete insight
        Insight::create([
            'title' => 'Complete Insight',
            'slug' => 'complete-insight',
            'excerpt' => 'A complete insight with all fields',
            'content' => ['body' => 'Full content here'],
            'featured_image' => '/images/insight.jpg',
            'author_id' => $author->id,
            'category_id' => $category->id,
            'reading_time' => 5,
            'is_published' => true,
            'published_at' => now(),
        ]);

        // Create custom homepage stats
        Setting::create([
            'key' => 'homepage_stats',
            'value' => [
                [
                    'value' => '200',
                    'label' => 'Custom Projects',
                    'suffix' => '+',
                ],
                [
                    'value' => '75',
                    'label' => 'Custom Clients',
                    'suffix' => '+',
                ],
                [
                    'value' => '10',
                    'label' => 'Custom Years',
                    'suffix' => '+',
                ],
                [
                    'value' => '24/7',
                    'label' => 'Custom Support',
                ],
            ],
            'type' => 'json',
            'group_name' => 'homepage'
        ]);
    }
}