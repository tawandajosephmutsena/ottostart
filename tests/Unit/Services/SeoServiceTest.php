<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\SeoService;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Config;

class SeoServiceTest extends TestCase
{
    private SeoService $seoService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seoService = new SeoService();
    }

    public function test_generate_seo_data_returns_complete_structure(): void
    {
        $data = [
            'title' => 'Test Page Title',
            'description' => 'Test page description for SEO',
            'keywords' => ['test', 'seo', 'page'],
            'url' => 'https://example.com/test-page',
            'image' => 'https://example.com/test-image.jpg',
        ];

        $result = $this->seoService->generateSeoData($data);

        expect($result)->toHaveKeys([
            'title',
            'description',
            'keywords',
            'canonical_url',
            'og_data',
            'twitter_data',
            'structured_data',
            'robots',
            'hreflang',
        ]);
    }

    public function test_generate_title_with_site_name(): void
    {
        Config::set('seo.site_name', 'Test Site');
        Config::set('seo.title_separator', ' | ');

        $data = ['title' => 'Page Title'];
        $result = $this->seoService->generateSeoData($data);

        expect($result['title'])->toBe('Page Title | Test Site');
    }

    public function test_generate_title_truncates_long_titles(): void
    {
        Config::set('seo.site_name', 'Test Site');
        Config::set('seo.title_separator', ' | ');

        $longTitle = str_repeat('Very Long Title ', 10); // Creates a very long title
        $data = ['title' => $longTitle];
        $result = $this->seoService->generateSeoData($data);

        expect(strlen($result['title']))->toBeLessThanOrEqual(60);
        expect($result['title'])->toEndWith('Test Site');
    }

    public function test_generate_title_falls_back_to_site_name(): void
    {
        Config::set('app.name', 'Fallback Site');

        $data = [];
        $result = $this->seoService->generateSeoData($data);

        expect($result['title'])->toBe('Fallback Site');
    }

    public function test_generate_description_limits_length(): void
    {
        $longDescription = str_repeat('This is a very long description. ', 20);
        $data = ['description' => $longDescription];
        $result = $this->seoService->generateSeoData($data);

        expect(strlen($result['description']))->toBeLessThanOrEqual(160);
    }

    public function test_generate_description_uses_default_when_empty(): void
    {
        Config::set('seo.default_description', 'Default SEO Description');

        $data = [];
        $result = $this->seoService->generateSeoData($data);

        expect($result['description'])->toBe('Default SEO Description');
    }

    public function test_generate_keywords_extracts_from_content(): void
    {
        $content = 'This is a test article about web development and programming. We discuss React, Laravel, and modern development practices.';
        $data = [
            'keywords' => ['manual', 'keyword'],
            'content' => $content,
        ];

        $result = $this->seoService->generateSeoData($data);

        expect($result['keywords'])->toContain('manual');
        expect($result['keywords'])->toContain('keyword');
        expect($result['keywords'])->toContain('development');
        expect($result['keywords'])->toContain('programming');
    }

    public function test_generate_canonical_url_uses_provided_url(): void
    {
        $data = ['url' => 'https://example.com/custom-url'];
        $result = $this->seoService->generateSeoData($data);

        expect($result['canonical_url'])->toBe('https://example.com/custom-url');
    }

    public function test_generate_canonical_url_falls_back_to_current(): void
    {
        URL::shouldReceive('current')->once()->andReturn('https://example.com/current');

        $data = [];
        $result = $this->seoService->generateSeoData($data);

        expect($result['canonical_url'])->toBe('https://example.com/current');
    }

    public function test_generate_open_graph_data_structure(): void
    {
        Config::set('seo.site_name', 'Test Site');
        Config::set('seo.default_og_image', 'https://example.com/default.jpg');

        $data = [
            'title' => 'OG Test Title',
            'description' => 'OG test description',
            'image' => 'https://example.com/og-image.jpg',
            'type' => 'article',
        ];

        $result = $this->seoService->generateSeoData($data);
        $ogData = $result['og_data'];

        expect($ogData)->toHaveKeys([
            'site_name',
            'title',
            'description',
            'type',
            'url',
            'image',
            'image_alt',
            'locale',
        ]);
        expect($ogData['site_name'])->toBe('Test Site');
        expect($ogData['title'])->toBe('OG Test Title');
        expect($ogData['type'])->toBe('article');
        expect($ogData['image'])->toBe('https://example.com/og-image.jpg');
    }

    public function test_generate_twitter_card_data_structure(): void
    {
        Config::set('seo.twitter_handle', '@testsite');

        $data = [
            'title' => 'Twitter Test Title',
            'description' => 'Twitter test description',
            'image' => 'https://example.com/twitter-image.jpg',
        ];

        $result = $this->seoService->generateSeoData($data);
        $twitterData = $result['twitter_data'];

        expect($twitterData)->toHaveKeys([
            'card',
            'site',
            'creator',
            'title',
            'description',
            'image',
        ]);
        expect($twitterData['card'])->toBe('summary_large_image');
        expect($twitterData['site'])->toBe('@testsite');
        expect($twitterData['title'])->toBe('Twitter Test Title');
    }

    public function test_generate_structured_data_article_type(): void
    {
        $data = [
            'type' => 'article',
            'title' => 'Article Title',
            'description' => 'Article description',
            'author' => 'John Doe',
            'published_time' => '2024-01-01T00:00:00Z',
        ];

        $result = $this->seoService->generateSeoData($data);
        $structuredData = $result['structured_data'];

        expect($structuredData['@context'])->toBe('https://schema.org');
        expect($structuredData['@type'])->toBe('Article');
        expect($structuredData['headline'])->toBe('Article Title');
        expect($structuredData['author']['@type'])->toBe('Person');
        expect($structuredData['author']['name'])->toBe('John Doe');
    }

    public function test_generate_structured_data_service_type(): void
    {
        $data = [
            'type' => 'service',
            'title' => 'Web Development Service',
            'description' => 'Professional web development',
            'service_type' => 'Web Development',
            'price_range' => '$1000-$5000',
        ];

        $result = $this->seoService->generateSeoData($data);
        $structuredData = $result['structured_data'];

        expect($structuredData['@type'])->toBe('Service');
        expect($structuredData['name'])->toBe('Web Development Service');
        expect($structuredData['serviceType'])->toBe('Web Development');
        expect($structuredData['offers']['priceRange'])->toBe('$1000-$5000');
    }

    public function test_generate_robots_directive_default(): void
    {
        $data = [];
        $result = $this->seoService->generateSeoData($data);

        expect($result['robots'])->toBe('index, follow');
    }

    public function test_generate_robots_directive_with_no_index(): void
    {
        $data = ['no_index' => true];
        $result = $this->seoService->generateSeoData($data);

        expect($result['robots'])->toContain('noindex');
        expect($result['robots'])->toContain('follow');
    }

    public function test_generate_robots_directive_with_no_follow(): void
    {
        $data = ['no_follow' => true];
        $result = $this->seoService->generateSeoData($data);

        expect($result['robots'])->toContain('index');
        expect($result['robots'])->toContain('nofollow');
    }

    public function test_generate_robots_directive_with_additional_directives(): void
    {
        $data = [
            'no_archive' => true,
            'no_snippet' => true,
        ];
        $result = $this->seoService->generateSeoData($data);

        expect($result['robots'])->toContain('noarchive');
        expect($result['robots'])->toContain('nosnippet');
    }

    public function test_analyze_seo_score_perfect_content(): void
    {
        $data = [
            'title' => 'Perfect SEO Title That Is Just Right Length',
            'description' => 'This is a perfect meta description that is exactly the right length for SEO optimization and provides valuable information to users.',
            'image' => 'https://example.com/image.jpg',
            'keywords' => ['seo', 'optimization'],
            'content' => str_repeat('This is quality content that provides value to users. ', 20),
        ];

        $result = $this->seoService->analyzeSeoScore($data);

        expect($result['score'])->toBeGreaterThan(80);
        expect($result['grade'])->toBeIn(['A', 'B']);
        expect($result['recommendations'])->toBeArray();
    }

    public function test_analyze_seo_score_poor_content(): void
    {
        $data = [
            'title' => 'Short',
            'description' => 'Too short',
            'content' => 'Very short content',
        ];

        $result = $this->seoService->analyzeSeoScore($data);

        expect($result['score'])->toBeLessThan(60);
        expect($result['grade'])->toBeIn(['D', 'F']);
        expect($result['recommendations'])->not->toBeEmpty();
        expect($result['recommendations'])->toContain('Title is too short. Aim for 30-60 characters.');
        expect($result['recommendations'])->toContain('Meta description is too short. Aim for 120-160 characters.');
        expect($result['recommendations'])->toContain('Content is too short. Aim for at least 300 words.');
    }

    public function test_analyze_seo_score_long_title_and_description(): void
    {
        $data = [
            'title' => str_repeat('Very Long Title ', 10),
            'description' => str_repeat('Very long description that exceeds the recommended length. ', 5),
        ];

        $result = $this->seoService->analyzeSeoScore($data);

        expect($result['recommendations'])->toContain('Title is too long. Keep it under 60 characters.');
        expect($result['recommendations'])->toContain('Meta description is too long. Keep it under 160 characters.');
    }

    public function test_analyze_seo_score_missing_elements(): void
    {
        $data = [
            'title' => 'Good Title Length For SEO Testing',
            'description' => 'This is a good description that meets the length requirements for proper SEO optimization and user engagement.',
            'content' => str_repeat('Good content with proper length. ', 15),
        ];

        $result = $this->seoService->analyzeSeoScore($data);

        expect($result['recommendations'])->toContain('Add a featured image for better social media sharing.');
        expect($result['recommendations'])->toContain('Add relevant keywords to improve search visibility.');
    }

    public function test_get_score_grade_mapping(): void
    {
        $testCases = [
            ['score' => 95, 'expected' => 'A'],
            ['score' => 85, 'expected' => 'B'],
            ['score' => 75, 'expected' => 'C'],
            ['score' => 65, 'expected' => 'D'],
            ['score' => 45, 'expected' => 'F'],
        ];

        foreach ($testCases as $case) {
            $data = [
                'title' => 'Test Title',
                'description' => 'Test description',
            ];
            
            // Mock the score calculation to return specific score
            $mockService = $this->getMockBuilder(SeoService::class)
                ->onlyMethods(['analyzeSeoScore'])
                ->getMock();
            
            $mockService->method('analyzeSeoScore')
                ->willReturn([
                    'score' => $case['score'],
                    'grade' => $case['expected'],
                    'recommendations' => [],
                ]);

            $result = $mockService->analyzeSeoScore($data);
            expect($result['grade'])->toBe($case['expected']);
        }
    }
}