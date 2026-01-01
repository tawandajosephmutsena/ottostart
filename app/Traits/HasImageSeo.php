<?php

namespace App\Traits;

use App\Services\ImageSeoService;
use Illuminate\Support\Facades\Storage;

trait HasImageSeo
{
    /**
     * Get image SEO analysis for this model's images
     */
    public function getImageSeoAnalysis(): array
    {
        $imageSeoService = app(ImageSeoService::class);
        $images = $this->getModelImages();
        $results = [];

        foreach ($images as $image) {
            $analysis = $imageSeoService->analyzeImageSeo(
                $image['path'],
                $image['alt_text'] ?? null,
                $image['title'] ?? null
            );
            
            $analysis['field'] = $image['field'];
            $analysis['context'] = $image['context'] ?? null;
            $results[] = $analysis;
        }

        return $results;
    }

    /**
     * Get overall image SEO score for this model
     */
    public function getImageSeoScore(): int
    {
        $analyses = $this->getImageSeoAnalysis();
        
        if (empty($analyses)) {
            return 100; // No images means no image SEO issues
        }

        $totalScore = array_sum(array_column($analyses, 'score'));
        return round($totalScore / count($analyses));
    }

    /**
     * Get image SEO recommendations for this model
     */
    public function getImageSeoRecommendations(): array
    {
        $analyses = $this->getImageSeoAnalysis();
        $recommendations = [];

        foreach ($analyses as $analysis) {
            foreach ($analysis['recommendations'] as $recommendation) {
                $recommendations[] = [
                    'image' => basename($analysis['path']),
                    'field' => $analysis['field'],
                    'recommendation' => $recommendation,
                    'score' => $analysis['score'],
                ];
            }
        }

        // Sort by score (lowest first - most urgent)
        usort($recommendations, fn($a, $b) => $a['score'] <=> $b['score']);

        return $recommendations;
    }

    /**
     * Check if all images have proper alt text
     */
    public function hasProperImageAltText(): bool
    {
        $images = $this->getModelImages();
        
        foreach ($images as $image) {
            if (empty($image['alt_text']) || strlen($image['alt_text']) < 10) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get images that need SEO optimization
     */
    public function getImagesNeedingOptimization(): array
    {
        $analyses = $this->getImageSeoAnalysis();
        
        return array_filter($analyses, function ($analysis) {
            return $analysis['score'] < 80; // Images with score below 80 need optimization
        });
    }

    /**
     * Generate alt text suggestions for model images
     */
    public function generateImageAltTextSuggestions(): array
    {
        $imageSeoService = app(ImageSeoService::class);
        $images = $this->getModelImages();
        $suggestions = [];

        foreach ($images as $image) {
            $context = $this->getImageContext($image['field']);
            $imageSuggestions = $imageSeoService->generateAltTextSuggestions(
                $image['path'],
                $context
            );
            
            $suggestions[$image['field']] = [
                'current_alt' => $image['alt_text'] ?? '',
                'suggestions' => $imageSuggestions,
                'path' => $image['path'],
            ];
        }

        return $suggestions;
    }

    /**
     * Get model images with metadata
     * This method should be overridden in models that use this trait
     */
    protected function getModelImages(): array
    {
        $images = [];

        // Check for common image fields with their alt text counterparts
        $imageFields = [
            'image' => ['alt' => 'image_alt', 'title' => 'image_title'],
            'featured_image' => ['alt' => 'featured_image_alt', 'title' => 'featured_image_title'],
            'thumbnail' => ['alt' => 'thumbnail_alt', 'title' => 'thumbnail_title'],
            'logo' => ['alt' => 'logo_alt', 'title' => 'logo_title'],
            'avatar' => ['alt' => 'avatar_alt', 'title' => 'avatar_title'],
            'cover_image' => ['alt' => 'cover_image_alt', 'title' => 'cover_image_title'],
        ];
        
        foreach ($imageFields as $field => $altFields) {
            if (isset($this->attributes[$field]) && !empty($this->attributes[$field])) {
                $imagePath = $this->attributes[$field];
                
                // Skip if not a valid image path
                if (!$this->isValidImagePath($imagePath)) {
                    continue;
                }

                $images[] = [
                    'field' => $field,
                    'path' => $imagePath,
                    'alt_text' => $this->attributes[$altFields['alt']] ?? null,
                    'title' => $this->attributes[$altFields['title']] ?? null,
                    'context' => $this->getImageContext($field),
                ];
            }
        }

        // Check for images in content fields (JSON or HTML)
        if (isset($this->attributes['content'])) {
            $contentImages = $this->extractImagesFromContent($this->attributes['content']);
            $images = array_merge($images, $contentImages);
        }

        // Check for gallery images
        if (isset($this->attributes['gallery']) && is_array($this->attributes['gallery'])) {
            foreach ($this->attributes['gallery'] as $index => $galleryImage) {
                if (is_string($galleryImage) && $this->isValidImagePath($galleryImage)) {
                    $images[] = [
                        'field' => "gallery[{$index}]",
                        'path' => $galleryImage,
                        'alt_text' => null,
                        'title' => null,
                        'context' => $this->getImageContext('gallery'),
                    ];
                } elseif (is_array($galleryImage) && isset($galleryImage['path'])) {
                    $images[] = [
                        'field' => "gallery[{$index}]",
                        'path' => $galleryImage['path'],
                        'alt_text' => $galleryImage['alt_text'] ?? null,
                        'title' => $galleryImage['title'] ?? null,
                        'context' => $this->getImageContext('gallery'),
                    ];
                }
            }
        }

        return $images;
    }

    /**
     * Get context for image based on field and model data
     */
    protected function getImageContext(string $field): ?string
    {
        $context = '';

        // Add title/name if available
        if (isset($this->attributes['title'])) {
            $context .= $this->attributes['title'] . ' ';
        } elseif (isset($this->attributes['name'])) {
            $context .= $this->attributes['name'] . ' ';
        }

        // Add description/excerpt if available
        if (isset($this->attributes['description'])) {
            $context .= $this->attributes['description'] . ' ';
        } elseif (isset($this->attributes['excerpt'])) {
            $context .= $this->attributes['excerpt'] . ' ';
        }

        // Add field-specific context
        switch ($field) {
            case 'featured_image':
            case 'cover_image':
                $context .= 'featured image ';
                break;
            case 'thumbnail':
                $context .= 'thumbnail image ';
                break;
            case 'logo':
                $context .= 'logo ';
                break;
            case 'avatar':
                $context .= 'profile picture ';
                break;
        }

        return trim($context) ?: null;
    }

    /**
     * Extract images from content (HTML or JSON)
     */
    protected function extractImagesFromContent($content): array
    {
        $images = [];

        if (is_string($content)) {
            // Extract from HTML content
            preg_match_all('/<img[^>]+src=["\']([^"\']+)["\'][^>]*>/i', $content, $matches, PREG_SET_ORDER);
            
            foreach ($matches as $match) {
                $src = $match[1];
                
                if (!$this->isValidImagePath($src)) {
                    continue;
                }

                // Extract alt text
                preg_match('/alt=["\']([^"\']*)["\']/', $match[0], $altMatch);
                $altText = $altMatch[1] ?? null;

                // Extract title
                preg_match('/title=["\']([^"\']*)["\']/', $match[0], $titleMatch);
                $title = $titleMatch[1] ?? null;

                $images[] = [
                    'field' => 'content',
                    'path' => $src,
                    'alt_text' => $altText,
                    'title' => $title,
                    'context' => $this->getImageContext('content'),
                ];
            }
        } elseif (is_array($content)) {
            // Extract from JSON content structure
            $this->extractImagesFromArray($content, $images);
        }

        return $images;
    }

    /**
     * Recursively extract images from array content
     */
    protected function extractImagesFromArray(array $content, array &$images): void
    {
        foreach ($content as $key => $value) {
            if (is_array($value)) {
                $this->extractImagesFromArray($value, $images);
            } elseif (is_string($value) && $this->isValidImagePath($value)) {
                $images[] = [
                    'field' => 'content',
                    'path' => $value,
                    'alt_text' => null,
                    'title' => null,
                    'context' => $this->getImageContext('content'),
                ];
            }
        }
    }

    /**
     * Check if path is a valid image
     */
    protected function isValidImagePath(string $path): bool
    {
        // Skip external URLs for now
        if (str_starts_with($path, 'http')) {
            return false;
        }

        $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        $validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];

        return in_array($extension, $validExtensions);
    }

    /**
     * Update image alt text
     */
    public function updateImageAltText(string $field, string $altText): bool
    {
        $altField = $field . '_alt';
        
        if (isset($this->attributes[$field])) {
            $this->attributes[$altField] = $altText;
            return $this->save();
        }

        return false;
    }

    /**
     * Optimize image filename for SEO
     */
    public function optimizeImageFilename(string $field, ?string $description = null, array $keywords = []): bool
    {
        if (!isset($this->attributes[$field])) {
            return false;
        }

        $imageSeoService = app(ImageSeoService::class);
        $currentPath = $this->attributes[$field];
        
        $newFilename = $imageSeoService->generateSeoFilename(
            $currentPath,
            $description,
            $keywords
        );

        $extension = pathinfo($currentPath, PATHINFO_EXTENSION);
        $newPath = dirname($currentPath) . '/' . $newFilename . '.' . $extension;

        // Move the file
        if (Storage::exists($currentPath) && Storage::move($currentPath, $newPath)) {
            $this->attributes[$field] = $newPath;
            return $this->save();
        }

        return false;
    }

    /**
     * Bulk update image alt text and titles
     */
    public function bulkUpdateImageSeo(array $imageData): bool
    {
        $updated = false;
        
        foreach ($imageData as $field => $data) {
            if (isset($this->attributes[$field])) {
                // Update alt text
                if (isset($data['alt_text'])) {
                    $altField = $this->getAltTextField($field);
                    if ($altField) {
                        $this->attributes[$altField] = $data['alt_text'];
                        $updated = true;
                    }
                }
                
                // Update title
                if (isset($data['title'])) {
                    $titleField = $this->getTitleField($field);
                    if ($titleField) {
                        $this->attributes[$titleField] = $data['title'];
                        $updated = true;
                    }
                }
            }
        }
        
        return $updated ? $this->save() : false;
    }

    /**
     * Get the alt text field name for an image field
     */
    protected function getAltTextField(string $imageField): ?string
    {
        $altFields = [
            'image' => 'image_alt',
            'featured_image' => 'featured_image_alt',
            'thumbnail' => 'thumbnail_alt',
            'logo' => 'logo_alt',
            'avatar' => 'avatar_alt',
            'cover_image' => 'cover_image_alt',
        ];
        
        return $altFields[$imageField] ?? null;
    }

    /**
     * Get the title field name for an image field
     */
    protected function getTitleField(string $imageField): ?string
    {
        $titleFields = [
            'image' => 'image_title',
            'featured_image' => 'featured_image_title',
            'thumbnail' => 'thumbnail_title',
            'logo' => 'logo_title',
            'avatar' => 'avatar_title',
            'cover_image' => 'cover_image_title',
        ];
        
        return $titleFields[$imageField] ?? null;
    }

    /**
     * Auto-generate alt text for all images
     */
    public function autoGenerateAltText(): bool
    {
        $imageSeoService = app(ImageSeoService::class);
        $images = $this->getModelImages();
        $updated = false;
        
        foreach ($images as $image) {
            // Skip if alt text already exists and is good quality
            if (!empty($image['alt_text']) && strlen($image['alt_text']) >= 10) {
                continue;
            }
            
            $context = $image['context'];
            $suggestions = $imageSeoService->generateAltTextSuggestions($image['path'], $context);
            
            if (!empty($suggestions)) {
                $altField = $this->getAltTextField($image['field']);
                if ($altField) {
                    $this->attributes[$altField] = $suggestions[0]; // Use first suggestion
                    $updated = true;
                }
            }
        }
        
        return $updated ? $this->save() : false;
    }
}