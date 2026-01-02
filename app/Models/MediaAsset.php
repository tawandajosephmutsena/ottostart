<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\HasImageSeo;

class MediaAsset extends Model
{
    use HasFactory, HasImageSeo;

    protected $fillable = [
        'filename',
        'original_name',
        'mime_type',
        'size',
        'path',
        'alt_text',
        'title',
        'caption',
        'folder',
        'tags',
        'seo_metadata',
    ];

    protected $casts = [
        'tags' => 'array',
        'size' => 'integer',
        'seo_metadata' => 'array',
    ];

    protected $appends = [
        'url',
        'is_image',
        'is_video',
    ];

    public function scopeByFolder($query, $folder)
    {
        return $query->where('folder', $folder);
    }

    public function scopeByMimeType($query, $mimeType)
    {
        return $query->where('mime_type', 'like', $mimeType . '%');
    }

    public function scopeImages($query)
    {
        return $query->where('mime_type', 'like', 'image/%');
    }

    public function scopeVideos($query)
    {
        return $query->where('mime_type', 'like', 'video/%');
    }

    public function getUrlAttribute()
    {
        return asset('storage/' . $this->path);
    }

    public function getIsImageAttribute()
    {
        return str_starts_with($this->mime_type, 'image/');
    }

    public function getIsVideoAttribute()
    {
        return str_starts_with($this->mime_type, 'video/');
    }

    /**
     * Override getModelImages for MediaAsset specific structure
     */
    protected function getModelImages(): array
    {
        if (!$this->is_image) {
            return [];
        }

        return [
            [
                'field' => 'path',
                'path' => $this->path,
                'alt_text' => $this->alt_text,
                'title' => $this->title,
                'context' => $this->getImageContext('path'),
            ]
        ];
    }

    /**
     * Get context for MediaAsset images
     */
    protected function getImageContext(string $field): ?string
    {
        $context = '';

        if ($this->original_name) {
            $context .= pathinfo($this->original_name, PATHINFO_FILENAME) . ' ';
        }

        if ($this->caption) {
            $context .= $this->caption . ' ';
        }

        if ($this->folder) {
            $context .= $this->folder . ' ';
        }

        return trim($context) ?: null;
    }
}
