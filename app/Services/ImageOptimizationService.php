<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class ImageOptimizationService
{
    private ImageManager $imageManager;
    
    /**
     * Image size configurations
     */
    const SIZES = [
        'thumbnail' => ['width' => 300, 'height' => 300],
        'small' => ['width' => 600, 'height' => 400],
        'medium' => ['width' => 1200, 'height' => 800],
        'large' => ['width' => 1920, 'height' => 1280],
        'hero' => ['width' => 2560, 'height' => 1440],
    ];

    /**
     * Quality settings for different formats
     */
    const QUALITY = [
        'webp' => 85,
        'jpeg' => 85,
        'png' => 9, // PNG compression level (0-9)
    ];

    /**
     * Maximum file sizes (in bytes)
     */
    const MAX_SIZES = [
        'thumbnail' => 50 * 1024,    // 50KB
        'small' => 150 * 1024,       // 150KB
        'medium' => 500 * 1024,      // 500KB
        'large' => 1024 * 1024,      // 1MB
        'hero' => 2 * 1024 * 1024,   // 2MB
    ];

    public function __construct()
    {
        $this->imageManager = new ImageManager(new Driver());
    }

    /**
     * Optimize and generate multiple sizes for an uploaded image
     */
    public function optimizeImage(UploadedFile $file, string $directory = 'images'): array
    {
        try {
            $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $slug = Str::slug($originalName);
            $timestamp = now()->format('Y/m/d');
            $basePath = "{$directory}/{$timestamp}/{$slug}";

            $results = [
                'original' => $this->storeOriginal($file, $basePath),
                'sizes' => [],
                'webp_sizes' => [],
            ];

            // Load the image
            $image = $this->imageManager->read($file->getPathname());
            $originalWidth = $image->width();
            $originalHeight = $image->height();

            // Generate different sizes
            foreach (self::SIZES as $sizeName => $dimensions) {
                // Skip if original is smaller than target size
                if ($originalWidth < $dimensions['width'] && $originalHeight < $dimensions['height']) {
                    continue;
                }

                // Generate JPEG version
                $jpegPath = $this->generateResizedImage(
                    $image, 
                    $basePath, 
                    $sizeName, 
                    $dimensions, 
                    'jpeg'
                );
                if ($jpegPath) {
                    $results['sizes'][$sizeName] = $jpegPath;
                }

                // Generate WebP version
                $webpPath = $this->generateResizedImage(
                    $image, 
                    $basePath, 
                    $sizeName, 
                    $dimensions, 
                    'webp'
                );
                if ($webpPath) {
                    $results['webp_sizes'][$sizeName] = $webpPath;
                }
            }

            // Generate lazy loading placeholder (tiny blurred version)
            $results['placeholder'] = $this->generatePlaceholder($image, $basePath);

            Log::info('Image optimization completed', [
                'original_file' => $file->getClientOriginalName(),
                'sizes_generated' => count($results['sizes']),
                'webp_sizes_generated' => count($results['webp_sizes']),
            ]);

            return $results;

        } catch (\Exception $e) {
            Log::error('Image optimization failed', [
                'file' => $file->getClientOriginalName(),
                'error' => $e->getMessage(),
            ]);

            throw new \Exception('Image optimization failed: ' . $e->getMessage());
        }
    }

    /**
     * Store the original image
     */
    private function storeOriginal(UploadedFile $file, string $basePath): string
    {
        $extension = $file->getClientOriginalExtension();
        $path = "{$basePath}/original.{$extension}";
        
        Storage::disk('public')->put($path, file_get_contents($file->getPathname()));
        
        return $path;
    }

    /**
     * Generate a resized image in specified format
     */
    private function generateResizedImage($image, string $basePath, string $sizeName, array $dimensions, string $format): ?string
    {
        try {
            // Create a copy of the image for resizing
            $resizedImage = clone $image;
            
            // Resize maintaining aspect ratio
            $resizedImage->scaleDown(
                width: $dimensions['width'],
                height: $dimensions['height']
            );

            // Apply format-specific optimizations
            $quality = self::QUALITY[$format] ?? 85;
            
            $filename = "{$basePath}/{$sizeName}.{$format}";
            
            // Encode based on format
            switch ($format) {
                case 'webp':
                    $encoded = $resizedImage->toWebp($quality);
                    break;
                case 'jpeg':
                    $encoded = $resizedImage->toJpeg($quality);
                    break;
                case 'png':
                    $encoded = $resizedImage->toPng();
                    break;
                default:
                    throw new \Exception("Unsupported format: {$format}");
            }

            // Check if file size is within limits
            $maxSize = self::MAX_SIZES[$sizeName] ?? 1024 * 1024;
            if (strlen($encoded) > $maxSize) {
                // Reduce quality and try again
                $reducedQuality = max(60, $quality - 15);
                
                switch ($format) {
                    case 'webp':
                        $encoded = $resizedImage->toWebp($reducedQuality);
                        break;
                    case 'jpeg':
                        $encoded = $resizedImage->toJpeg($reducedQuality);
                        break;
                }
            }

            Storage::disk('public')->put($filename, $encoded);
            
            return $filename;

        } catch (\Exception $e) {
            Log::warning('Failed to generate resized image', [
                'size' => $sizeName,
                'format' => $format,
                'error' => $e->getMessage(),
            ]);
            
            return null;
        }
    }

    /**
     * Generate a tiny placeholder for lazy loading
     */
    private function generatePlaceholder($image, string $basePath): string
    {
        try {
            $placeholder = clone $image;
            
            // Create tiny version (20px wide)
            $placeholder->scaleDown(width: 20);
            
            // Apply blur effect
            $placeholder->blur(5);
            
            // Convert to base64 data URL for inline embedding
            $encoded = $placeholder->toJpeg(60);
            $base64 = base64_encode($encoded);
            
            return "data:image/jpeg;base64,{$base64}";

        } catch (\Exception $e) {
            Log::warning('Failed to generate placeholder', [
                'error' => $e->getMessage(),
            ]);
            
            // Return a default placeholder
            return 'data:image/svg+xml;base64,' . base64_encode(
                '<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f3f4f6"/></svg>'
            );
        }
    }

    /**
     * Get responsive image HTML with WebP support
     */
    public function getResponsiveImageHtml(array $imageData, string $alt = '', array $classes = []): string
    {
        if (empty($imageData['sizes']) && empty($imageData['webp_sizes'])) {
            return '';
        }

        $classString = !empty($classes) ? ' class="' . implode(' ', $classes) . '"' : '';
        $placeholder = $imageData['placeholder'] ?? '';
        
        // Build srcset for WebP
        $webpSrcset = [];
        if (!empty($imageData['webp_sizes'])) {
            foreach ($imageData['webp_sizes'] as $size => $path) {
                $width = self::SIZES[$size]['width'];
                $webpSrcset[] = Storage::url($path) . " {$width}w";
            }
        }

        // Build srcset for fallback (JPEG)
        $jpegSrcset = [];
        if (!empty($imageData['sizes'])) {
            foreach ($imageData['sizes'] as $size => $path) {
                $width = self::SIZES[$size]['width'];
                $jpegSrcset[] = Storage::url($path) . " {$width}w";
            }
        }

        // Default src (largest available or original)
        $defaultSrc = '';
        if (!empty($imageData['sizes'])) {
            $defaultSrc = Storage::url(end($imageData['sizes']));
        } elseif (!empty($imageData['original'])) {
            $defaultSrc = Storage::url($imageData['original']);
        }

        $html = '<picture>';
        
        // WebP source
        if (!empty($webpSrcset)) {
            $html .= '<source type="image/webp" srcset="' . implode(', ', $webpSrcset) . '" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw">';
        }
        
        // Fallback image
        $html .= '<img';
        if (!empty($jpegSrcset)) {
            $html .= ' srcset="' . implode(', ', $jpegSrcset) . '"';
            $html .= ' sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"';
        }
        $html .= ' src="' . $defaultSrc . '"';
        $html .= ' alt="' . htmlspecialchars($alt) . '"';
        $html .= ' loading="lazy"';
        if ($placeholder) {
            $html .= ' data-placeholder="' . $placeholder . '"';
        }
        $html .= $classString;
        $html .= '>';
        
        $html .= '</picture>';

        return $html;
    }

    /**
     * Get image metadata
     */
    public function getImageMetadata(string $path): array
    {
        try {
            $fullPath = Storage::disk('public')->path($path);
            
            if (!file_exists($fullPath)) {
                return [];
            }

            $image = $this->imageManager->read($fullPath);
            
            return [
                'width' => $image->width(),
                'height' => $image->height(),
                'size' => filesize($fullPath),
                'mime_type' => mime_content_type($fullPath),
                'aspect_ratio' => round($image->width() / $image->height(), 2),
            ];

        } catch (\Exception $e) {
            Log::error('Failed to get image metadata', [
                'path' => $path,
                'error' => $e->getMessage(),
            ]);
            
            return [];
        }
    }

    /**
     * Clean up old image files
     */
    public function cleanupOldImages(array $imageData): void
    {
        try {
            $filesToDelete = [];
            
            // Add original file
            if (!empty($imageData['original'])) {
                $filesToDelete[] = $imageData['original'];
            }
            
            // Add all size variants
            if (!empty($imageData['sizes'])) {
                $filesToDelete = array_merge($filesToDelete, array_values($imageData['sizes']));
            }
            
            if (!empty($imageData['webp_sizes'])) {
                $filesToDelete = array_merge($filesToDelete, array_values($imageData['webp_sizes']));
            }
            
            // Delete files
            foreach ($filesToDelete as $file) {
                if (Storage::disk('public')->exists($file)) {
                    Storage::disk('public')->delete($file);
                }
            }
            
            Log::info('Cleaned up old image files', [
                'files_deleted' => count($filesToDelete),
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to cleanup old images', [
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Validate image file
     */
    public function validateImage(UploadedFile $file): array
    {
        $errors = [];
        
        // Check file type
        $allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!in_array($file->getMimeType(), $allowedTypes)) {
            $errors[] = 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.';
        }
        
        // Check file size (max 10MB)
        $maxSize = 10 * 1024 * 1024;
        if ($file->getSize() > $maxSize) {
            $errors[] = 'File size too large. Maximum size is 10MB.';
        }
        
        // Check image dimensions
        try {
            $image = $this->imageManager->read($file->getPathname());
            $width = $image->width();
            $height = $image->height();
            
            // Minimum dimensions
            if ($width < 100 || $height < 100) {
                $errors[] = 'Image dimensions too small. Minimum size is 100x100 pixels.';
            }
            
            // Maximum dimensions
            if ($width > 5000 || $height > 5000) {
                $errors[] = 'Image dimensions too large. Maximum size is 5000x5000 pixels.';
            }
            
        } catch (\Exception $e) {
            $errors[] = 'Invalid image file or corrupted data.';
        }
        
        return $errors;
    }
}