<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\PortfolioItem;
use App\Models\Service;
use App\Models\Insight;
use App\Models\User;
use App\Models\Category;

class HomepageTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create test data
        $this->createTestData();
    }

    public function test_homepage_loads_successfully(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Home')
                ->has('featuredProjects')
                ->has('featuredServices')
                ->has('recentInsights')
                ->has('stats')
                ->has('canRegister')
        );
    }

    public function test_homepage_has_required_data_structure(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Home')
                ->has('stats', 4) // Check that stats array has 4 items
                ->has('featuredProjects') // Check that featuredProjects exists (can be empty array)
                ->has('featuredServices') // Check that featuredServices exists (can be empty array)
                ->has('recentInsights') // Check that recentInsights exists (can be empty array)
                ->has('canRegister')
        );
    }

    public function test_homepage_stats_have_correct_structure(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Home')
                ->where('stats.0.value', '150')
                ->where('stats.0.label', 'Projects Completed')
                ->where('stats.0.suffix', '+')
                ->where('stats.1.value', '50')
                ->where('stats.1.label', 'Happy Clients')
                ->where('stats.1.suffix', '+')
                ->where('stats.2.value', '5')
                ->where('stats.2.label', 'Years Experience')
                ->where('stats.2.suffix', '+')
                ->where('stats.3.value', '24/7')
                ->where('stats.3.label', 'Support')
        );
    }

    public function test_homepage_returns_featured_portfolio_items(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Home')
                ->has('featuredProjects', 2) // Should have 2 featured portfolio items
                ->where('featuredProjects.0.title', 'Featured Project 1')
                ->where('featuredProjects.0.is_featured', true)
                ->where('featuredProjects.1.title', 'Featured Project 2')
                ->where('featuredProjects.1.is_featured', true)
        );
    }

    public function test_homepage_returns_featured_services(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Home')
                ->has('featuredServices', 2) // Should have 2 featured services
                ->where('featuredServices.0.title', 'Featured Service 1')
                ->where('featuredServices.0.is_featured', true)
                ->where('featuredServices.1.title', 'Featured Service 2')
                ->where('featuredServices.1.is_featured', true)
        );
    }

    public function test_homepage_returns_recent_insights_with_relationships(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Home')
                ->has('recentInsights', 2) // Should have 2 recent insights
                ->where('recentInsights.0.title', 'Recent Insight 2')
                ->has('recentInsights.0.author')
                ->where('recentInsights.0.author.name', 'Test Author')
                ->has('recentInsights.0.category')
                ->where('recentInsights.0.category.name', 'Technology')
                ->where('recentInsights.1.title', 'Recent Insight 1')
        );
    }

    public function test_homepage_only_returns_published_content(): void
    {
        // Create unpublished content
        PortfolioItem::create([
            'title' => 'Unpublished Project',
            'slug' => 'unpublished-project',
            'description' => 'This should not appear',
            'is_featured' => true,
            'is_published' => false,
        ]);

        Service::create([
            'title' => 'Unpublished Service',
            'slug' => 'unpublished-service',
            'description' => 'This should not appear',
            'is_featured' => true,
            'is_published' => false,
        ]);

        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Home')
                ->has('featuredProjects', 2) // Still only 2 published projects
                ->has('featuredServices', 2) // Still only 2 published services
                ->missing('featuredProjects.2') // No third project
                ->missing('featuredServices.2') // No third service
        );
    }

    public function test_homepage_limits_content_correctly(): void
    {
        // Create additional featured content beyond the limit
        for ($i = 3; $i <= 8; $i++) {
            PortfolioItem::create([
                'title' => "Featured Project $i",
                'slug' => "featured-project-$i",
                'description' => "Description $i",
                'is_featured' => true,
                'is_published' => true,
                'sort_order' => $i,
            ]);

            Service::create([
                'title' => "Featured Service $i",
                'slug' => "featured-service-$i",
                'description' => "Description $i",
                'is_featured' => true,
                'is_published' => true,
                'sort_order' => $i,
            ]);
        }

        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Home')
                ->has('featuredProjects', 6) // Limited to 6 projects
                ->has('featuredServices', 6) // Limited to 6 services
                ->has('recentInsights', 2) // Still 2 insights (we only created 2)
        );
    }

    private function createTestData(): void
    {
        // Create a test user for insights
        $author = User::create([
            'name' => 'Test Author',
            'email' => 'author@test.com',
            'password' => 'password',
            'email_verified_at' => now(),
        ]);

        // Create a test category
        $category = Category::create([
            'name' => 'Technology',
            'slug' => 'technology',
            'type' => 'insight',
        ]);

        // Create featured portfolio items
        PortfolioItem::create([
            'title' => 'Featured Project 1',
            'slug' => 'featured-project-1',
            'description' => 'First featured project',
            'client' => 'Test Client 1',
            'technologies' => ['React', 'Laravel'],
            'is_featured' => true,
            'is_published' => true,
            'sort_order' => 1,
        ]);

        PortfolioItem::create([
            'title' => 'Featured Project 2',
            'slug' => 'featured-project-2',
            'description' => 'Second featured project',
            'client' => 'Test Client 2',
            'technologies' => ['Vue.js', 'Node.js'],
            'is_featured' => true,
            'is_published' => true,
            'sort_order' => 2,
        ]);

        // Create featured services
        Service::create([
            'title' => 'Featured Service 1',
            'slug' => 'featured-service-1',
            'description' => 'First featured service',
            'price_range' => '$1000-$5000',
            'is_featured' => true,
            'is_published' => true,
            'sort_order' => 1,
        ]);

        Service::create([
            'title' => 'Featured Service 2',
            'slug' => 'featured-service-2',
            'description' => 'Second featured service',
            'price_range' => '$2000-$10000',
            'is_featured' => true,
            'is_published' => true,
            'sort_order' => 2,
        ]);

        // Create recent insights
        Insight::create([
            'title' => 'Recent Insight 1',
            'slug' => 'recent-insight-1',
            'excerpt' => 'First recent insight',
            'content' => ['body' => 'Content 1'],
            'author_id' => $author->id,
            'category_id' => $category->id,
            'reading_time' => 5,
            'is_published' => true,
            'published_at' => now()->subDays(2),
        ]);

        Insight::create([
            'title' => 'Recent Insight 2',
            'slug' => 'recent-insight-2',
            'excerpt' => 'Second recent insight',
            'content' => ['body' => 'Content 2'],
            'author_id' => $author->id,
            'category_id' => $category->id,
            'reading_time' => 7,
            'is_published' => true,
            'published_at' => now()->subDays(1), // More recent
        ]);
    }
}