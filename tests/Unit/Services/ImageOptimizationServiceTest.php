<?php

namespace Tests\Unit\Services;

use App\Services\ImageOptimizationService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ImageOptimizationServiceTest extends TestCase
{
    private ImageOptimizationService $service;

    protected function setUp(): void
    {
        parent::setUp();
        ini_set('memory_limit', '512M');
        // Ensure proper config or environment if needed, but this service seems self-contained mostly
        $this->service = new ImageOptimizationService();
        Storage::fake('public');
    }

    public function test_it_validates_valid_image()
    {
        $file = UploadedFile::fake()->image('test.jpg', 800, 600);
        $errors = $this->service->validateImage($file);

        $this->assertEmpty($errors);
    }

    public function test_it_validates_image_dimensions_too_small()
    {
        $file = UploadedFile::fake()->image('small.jpg', 50, 50);
        $errors = $this->service->validateImage($file);

        $this->assertNotEmpty($errors);
        $this->assertStringContainsString('Image dimensions too small', $errors[0]);
    }

    public function test_it_validates_image_dimensions_too_large()
    {
        $file = UploadedFile::fake()->image('large.jpg', 6000, 6000);
        $errors = $this->service->validateImage($file);

        $this->assertNotEmpty($errors);
        $this->assertStringContainsString('Image dimensions too large', $errors[0]);
    }

    public function test_it_validates_invalid_mime_type()
    {
        $file = UploadedFile::fake()->create('text.txt', 100, 'text/plain');
        $errors = $this->service->validateImage($file);

        $this->assertNotEmpty($errors);
        $this->assertStringContainsString('Invalid file type', $errors[0]);
    }

    public function test_it_generates_responsive_image_html()
    {
        $imageData = [
            'original' => 'images/test/original.jpg',
            'sizes' => [
                'thumbnail' => 'images/test/thumbnail.jpg',
                'medium' => 'images/test/medium.jpg',
            ],
            'webp_sizes' => [
                'thumbnail' => 'images/test/thumbnail.webp',
                'medium' => 'images/test/medium.webp',
            ],
            'placeholder' => 'data:image/jpeg;base64,...'
        ];

        $html = $this->service->getResponsiveImageHtml($imageData, 'Test Alt');

        $this->assertStringContainsString('<picture>', $html);
        $this->assertStringContainsString('type="image/webp"', $html);
        $this->assertStringContainsString('srcset="', $html);
        $this->assertStringContainsString('alt="Test Alt"', $html);
        $this->assertStringContainsString('data-placeholder=', $html);
    }

    public function test_it_optimizes_image_generation()
    {
        // This test might be slow or flaky depending on GD library availability in the test environment.
        // We'll skip if GD is not available, or just try it.
        if (!extension_loaded('gd')) {
            $this->markTestSkipped('GD extension not loaded');
        }

        $file = UploadedFile::fake()->image('optimization_test.jpg', 1200, 800);
        
        // Mock storage is already set in setUp
        
        // We might want to try-catch specifically if ImageManager fails due to missing drivers in test env
        try {
            $result = $this->service->optimizeImage($file, 'test-images');
            
            $this->assertArrayHasKey('original', $result);
            $this->assertArrayHasKey('sizes', $result);
            $this->assertArrayHasKey('webp_sizes', $result);
            
            // Check if files were actually "stored" in the fake storage
            Storage::disk('public')->assertExists($result['original']);
            
            foreach ($result['sizes'] as $path) {
                Storage::disk('public')->assertExists($path);
            }
        } catch (\Exception $e) {
            // If it fails due to driver issues, we might want to know, but for now let's fail the test
            $this->fail('Optimization failed: ' . $e->getMessage());
        }
    }
}
