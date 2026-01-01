<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ContentVersion extends Model
{
    use HasFactory;

    protected $fillable = [
        'versionable_type',
        'versionable_id',
        'version_number',
        'content_data',
        'author_id',
        'change_summary',
        'change_notes',
        'is_published',
        'is_current',
        'published_at',
    ];

    protected $casts = [
        'content_data' => 'array',
        'is_published' => 'boolean',
        'is_current' => 'boolean',
        'published_at' => 'datetime',
    ];

    /**
     * Get the versionable model (polymorphic relationship).
     */
    public function versionable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the author who created this version.
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /**
     * Scope to get only current versions.
     */
    public function scopeCurrent($query)
    {
        return $query->where('is_current', true);
    }

    /**
     * Scope to get only published versions.
     */
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    /**
     * Scope to get versions for a specific content item.
     */
    public function scopeForContent($query, $type, $id)
    {
        return $query->where('versionable_type', $type)
                    ->where('versionable_id', $id);
    }

    /**
     * Get the next version number for a content item.
     */
    public static function getNextVersionNumber($type, $id): int
    {
        $lastVersion = static::forContent($type, $id)
            ->orderBy('version_number', 'desc')
            ->first();

        return $lastVersion ? $lastVersion->version_number + 1 : 1;
    }

    /**
     * Create a new version from a model.
     */
    public static function createFromModel(Model $model, string $changeSummary = null, string $changeNotes = null): self
    {
        $versionNumber = static::getNextVersionNumber(get_class($model), $model->id);

        // Mark all previous versions as not current
        static::forContent(get_class($model), $model->id)
            ->update(['is_current' => false]);

        return static::create([
            'versionable_type' => get_class($model),
            'versionable_id' => $model->id,
            'version_number' => $versionNumber,
            'content_data' => $model->toArray(),
            'author_id' => auth()->id(),
            'change_summary' => $changeSummary,
            'change_notes' => $changeNotes,
            'is_current' => true,
            'is_published' => $model->is_published ?? false,
            'published_at' => $model->published_at ?? ($model->is_published ? now() : null),
        ]);
    }

    /**
     * Restore this version to the original model.
     */
    public function restore(): bool
    {
        $model = $this->versionable;
        if (!$model) {
            return false;
        }

        // Update the model with version data
        $model->fill($this->content_data);
        $model->save();

        // Mark this version as current
        static::forContent($this->versionable_type, $this->versionable_id)
            ->update(['is_current' => false]);
        
        $this->update(['is_current' => true]);

        return true;
    }

    /**
     * Get differences between this version and another.
     */
    public function getDifferences(ContentVersion $otherVersion): array
    {
        $thisData = $this->content_data;
        $otherData = $otherVersion->content_data;
        $differences = [];

        // Find changed fields
        foreach ($thisData as $key => $value) {
            if (!array_key_exists($key, $otherData) || $otherData[$key] !== $value) {
                $differences[$key] = [
                    'old' => $otherData[$key] ?? null,
                    'new' => $value,
                ];
            }
        }

        // Find removed fields
        foreach ($otherData as $key => $value) {
            if (!array_key_exists($key, $thisData)) {
                $differences[$key] = [
                    'old' => $value,
                    'new' => null,
                ];
            }
        }

        return $differences;
    }

    /**
     * Get a human-readable summary of changes.
     */
    public function getChangesSummary(): string
    {
        if ($this->change_summary) {
            return $this->change_summary;
        }

        // Try to generate a summary from the previous version
        $previousVersion = static::forContent($this->versionable_type, $this->versionable_id)
            ->where('version_number', '<', $this->version_number)
            ->orderBy('version_number', 'desc')
            ->first();

        if (!$previousVersion) {
            return 'Initial version';
        }

        $differences = $this->getDifferences($previousVersion);
        $changes = [];

        foreach ($differences as $field => $change) {
            if ($change['old'] === null) {
                $changes[] = "Added {$field}";
            } elseif ($change['new'] === null) {
                $changes[] = "Removed {$field}";
            } else {
                $changes[] = "Updated {$field}";
            }
        }

        return empty($changes) ? 'No changes detected' : implode(', ', $changes);
    }
}