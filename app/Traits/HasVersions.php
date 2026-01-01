<?php

namespace App\Traits;

use App\Models\ContentVersion;
use Illuminate\Database\Eloquent\Relations\MorphMany;

trait HasVersions
{
    /**
     * Boot the trait.
     */
    protected static function bootHasVersions()
    {
        // Create a version when the model is created
        static::created(function ($model) {
            if ($model->shouldCreateVersion()) {
                $model->createVersion('Initial version');
            }
        });

        // Create a version when the model is updated
        static::updated(function ($model) {
            if ($model->shouldCreateVersion()) {
                $model->createVersion();
            }
        });
    }

    /**
     * Get all versions for this model.
     */
    public function versions(): MorphMany
    {
        return $this->morphMany(ContentVersion::class, 'versionable')
                    ->orderBy('version_number', 'desc');
    }

    /**
     * Get the current version.
     */
    public function currentVersion()
    {
        return $this->versions()->where('is_current', true)->first();
    }

    /**
     * Get the latest published version.
     */
    public function latestPublishedVersion()
    {
        return $this->versions()->where('is_published', true)->first();
    }

    /**
     * Create a new version of this model.
     */
    public function createVersion(string $changeSummary = null, string $changeNotes = null): ContentVersion
    {
        return ContentVersion::createFromModel($this, $changeSummary, $changeNotes);
    }

    /**
     * Restore to a specific version.
     */
    public function restoreToVersion(int $versionNumber): bool
    {
        $version = $this->versions()->where('version_number', $versionNumber)->first();
        
        if (!$version) {
            return false;
        }

        return $version->restore();
    }

    /**
     * Get version history with author information.
     */
    public function getVersionHistory()
    {
        return $this->versions()
                    ->with('author:id,name,email')
                    ->get()
                    ->map(function ($version) {
                        return [
                            'id' => $version->id,
                            'version_number' => $version->version_number,
                            'author' => $version->author,
                            'change_summary' => $version->getChangesSummary(),
                            'change_notes' => $version->change_notes,
                            'is_current' => $version->is_current,
                            'is_published' => $version->is_published,
                            'created_at' => $version->created_at,
                            'published_at' => $version->published_at,
                        ];
                    });
    }

    /**
     * Compare two versions and get differences.
     */
    public function compareVersions(int $version1, int $version2): array
    {
        $v1 = $this->versions()->where('version_number', $version1)->first();
        $v2 = $this->versions()->where('version_number', $version2)->first();

        if (!$v1 || !$v2) {
            return [];
        }

        return $v1->getDifferences($v2);
    }

    /**
     * Determine if a version should be created.
     * Override this method in your model to customize versioning behavior.
     */
    protected function shouldCreateVersion(): bool
    {
        // Don't create versions for minor updates like view counts, etc.
        $ignoredFields = $this->getVersionIgnoredFields();
        
        if (empty($this->getDirty())) {
            return false;
        }

        // Check if any significant fields were changed
        $changedFields = array_keys($this->getDirty());
        $significantChanges = array_diff($changedFields, $ignoredFields);

        return !empty($significantChanges);
    }

    /**
     * Get fields that should be ignored when creating versions.
     * Override this method in your model to customize.
     */
    protected function getVersionIgnoredFields(): array
    {
        return [
            'updated_at',
            'views_count',
            'last_viewed_at',
        ];
    }

    /**
     * Publish a specific version.
     */
    public function publishVersion(int $versionNumber): bool
    {
        $version = $this->versions()->where('version_number', $versionNumber)->first();
        
        if (!$version) {
            return false;
        }

        // Unpublish all other versions
        $this->versions()->update(['is_published' => false]);

        // Publish this version
        $version->update([
            'is_published' => true,
            'published_at' => now(),
        ]);

        // Update the main model
        $this->update([
            'is_published' => true,
            'published_at' => now(),
        ]);

        return true;
    }

    /**
     * Get the total number of versions.
     */
    public function getVersionCount(): int
    {
        return $this->versions()->count();
    }

    /**
     * Check if the model has multiple versions.
     */
    public function hasMultipleVersions(): bool
    {
        return $this->getVersionCount() > 1;
    }
}