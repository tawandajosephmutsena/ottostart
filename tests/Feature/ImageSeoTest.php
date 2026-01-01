<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Service;
use App\Models\PortfolioItem;
use App\Models\Insight;
use App\Models\TeamMember;
use App\Models\MediaAsset;
use App\Services\ImageSeoService;

class ImageSeoTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create test data
        Service::factory()->create([
            'title' => 'Web Development',
            'featured_image' => 'uploads/web-development.jpg',
            'featured_image_alt' => null,
        ]);

        PortfolioItem::factory()->create([
            'title' => 'E-commerce Website',
            'featured_image' => 'uploads/ecommerce-site.jpg',
            'featured_image_alt' => 'Modern e-commerce website design',
        ]);
    }

    public function test_image_seo_score_calculation()
    {
        $service = Service::first();
        
        // Should have low score without alt text
        $this->assertLessThan(60, $service->getImageSeoScore());
        
        // Should not have proper alt text
        $this->assertFalse($service->hasProperImageAltText());
    }

    public function test_auto_generate_alt_text()
    {
        $service = Service::first();
        
        $beforeScore = $service->getImageSeoScore();
        $optimized = $service->autoGenerateAltText();
        $afterScore = $service->getImageSeoScore();
        
        $this->assertTrue($optimized);
        $this->assertGreaterThan($beforeScore, $afterScore);
        $this->assertNotNull($service->fresh()->featured_image_alt);
    }

    public function test_bulk_update_image_seo()
    {
        $service = Service::first();
        
        $imageData = [
            'featured_image' => [
                'alt_text' => 'Professional web development services',
                'title' => 'Web Development Service Image',
            ]
        ];
        
        $updated = $service->bulkUpdateImageSeo($imageData);
        
        $this->assertTrue($updated);
        $this->assertEquals('Professional web development services', $service->fresh()->featured_image_alt);
        $this->assertEquals('Web Development Service Image', $service->fresh()->featured_image_title);
    }

    public function test_image_seo_analysis()
    {
        $imageSeoService = new ImageSeoService();
        
        $analysis = $imageSeoService->analyzeImageSeo(
            'uploads/test-image.jpg',
            'Test image description',
            'Test Image Title'
        );
        
        $this->assertIsArray($analysis);
        $this->assertArrayHasKey('score', $analysis);
        $this->assertArrayHasKey('filename_seo', $analysis);
        $this->assertArrayHasKey('file_optimization', $analysis);
        $this->assertArrayHasKey('accessibility', $analysis);
        $this->assertArrayHasKey('recommendations', $analysis);
    }

    public function test_seo_filename_generation()
    {
        $imageSeoService = new ImageSeoService();
        
        $filename = $imageSeoService->generateSeoFilename(
            'IMG_12345.jpg',
            'Modern web development project',
            ['responsive', 'design']
        );
        
        $this->assertStringContainsString('modern-web-development', $filename);
        $this->assertStringContainsString('responsive', $filename);
        $this->assertStringContainsString('design', $filename);
        $this->assertGreaterThanOrEqual(10, strlen($filename));
        $this->assertLessThanOrEqual(60, strlen($filename));
    }

    public function test_alt_text_suggestions()
    {
        $imageSeoService = new ImageSeoService();
        
        $suggestions = $imageSeoService->generateAltTextSuggestions(
            'uploads/web-development-project.jpg',
            'Modern responsive website for e-commerce business'
        );
        
        $this->assertIsArray($suggestions);
        $this->assertNotEmpty($suggestions);
        
        foreach ($suggestions as $suggestion) {
            $this->assertIsString($suggestion);
            $this->assertGreaterThanOrEqual(10, strlen($suggestion));
            $this->assertLessThanOrEqual(125, strlen($suggestion));
        }
    }

    public function test_portfolio_item_image_seo()
    {
        $portfolio = PortfolioItem::first();
        
        // Should have better score with alt text
        $this->assertGreaterThan(50, $portfolio->getImageSeoScore());
        
        // Should have proper alt text
        $this->assertTrue($portfolio->hasProperImageAltText());
        
        // Should get image analysis
        $analysis = $portfolio->getImageSeoAnalysis();
        $this->assertIsArray($analysis);
        $this->assertNotEmpty($analysis);
    }

    public function test_image_seo_recommendations()
    {
        $service = Service::first();
        
        $recommendations = $service->getImageSeoRecommendations();
        
        $this->assertIsArray($recommendations);
        
        if (!empty($recommendations)) {
            foreach ($recommendations as $recommendation) {
                $this->assertArrayHasKey('image', $recommendation);
                $this->assertArrayHasKey('field', $recommendation);
                $this->assertArrayHasKey('recommendation', $recommendation);
                $this->assertArrayHasKey('score', $recommendation);
            }
        }
    }

    public function test_images_needing_optimization()
    {
        $service = Service::first();
        
        $needingOptimization = $service->getImagesNeedingOptimization();
        
        $this->assertIsArray($needingOptimization);
        
        // Service without alt text should need optimization
        $this->assertNotEmpty($needingOptimization);
    }
}