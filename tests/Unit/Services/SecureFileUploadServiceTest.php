<?php

namespace Tests\Unit\Services;

use App\Services\SecureFileUploadService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SecureFileUploadServiceTest extends TestCase
{
    private SecureFileUploadService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new SecureFileUploadService();
        Storage::fake('public');
    }

    public function test_it_validates_valid_image_file()
    {
        $file = UploadedFile::fake()->image('test.jpg');
        $result = $this->service->validateFile($file, 'image');

        $this->assertTrue($result['valid']);
    }

    public function test_it_rejects_file_exceeding_max_size()
    {
        // 6MB image (limit is 5MB)
        $file = UploadedFile::fake()->create('large.jpg', 6000); 
        $result = $this->service->validateFile($file, 'image');

        $this->assertFalse($result['valid']);
        $this->assertStringContainsString('File size exceeds', $result['error']);
    }

    public function test_it_rejects_invalid_mime_type()
    {
        $file = UploadedFile::fake()->create('test.txt', 100, 'text/plain');
        $result = $this->service->validateFile($file, 'image');

        $this->assertFalse($result['valid']);
        $this->assertEquals('File type not allowed', $result['error']);
    }

    public function test_it_rejects_dangerous_extensions()
    {
        $file = UploadedFile::fake()->create('malware.php', 100);
        $result = $this->service->validateFile($file, 'image');

        // Note: checking valid false or specific error based on implementation order
        // In implementation: Mime check is before extension check.
        // fake()->create defaults mime to application/octet-stream if not specified/guessed from ext?
        // Let's force a valid mime for image but invalid extension to hit the extension check
        $file = UploadedFile::fake()->create('malware.php', 100, 'image/jpeg');
        
        $result = $this->service->validateFile($file, 'image');

        $this->assertFalse($result['valid']);
        $this->assertStringContainsString('File extension not allowed', $result['error']);
    }

    public function test_it_uploads_valid_file()
    {
        $file = UploadedFile::fake()->image('test.jpg');
        
        $result = $this->service->upload($file, 'image');

        $this->assertArrayHasKey('path', $result);
        $this->assertArrayHasKey('url', $result);
        Storage::disk('public')->assertExists($result['path']);
    }

    public function test_it_sanitizes_filename()
    {
        $file = UploadedFile::fake()->image('test@file#name.jpg');
        $result = $this->service->upload($file, 'image');

        $this->assertStringNotContainsString('@', $result['filename']);
        $this->assertStringNotContainsString('#', $result['filename']);
        $this->assertMatchesRegularExpression('/^[a-zA-Z0-9\-_]+_[a-zA-Z0-9]{16}\.jpg$/', $result['filename']);
    }
}
