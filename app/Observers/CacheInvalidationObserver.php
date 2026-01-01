<?php

namespace App\Observers;

use App\Services\CacheManager;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class CacheInvalidationObserver
{
    private CacheManager $cacheManager;

    public function __construct(CacheManager $cacheManager)
    {
        $this->cacheManager = $cacheManager;
    }

    /**
     * Handle the model "created" event.
     */
    public function created(Model $model): void
    {
        $this->invalidateModelCache($model, 'created');
    }

    /**
     * Handle the model "updated" event.
     */
    public function updated(Model $model): void
    {
        $this->invalidateModelCache($model, 'updated');
    }

    /**
     * Handle the model "deleted" event.
     */
    public function deleted(Model $model): void
    {
        $this->invalidateModelCache($model, 'deleted');
    }

    /**
     * Handle the model "restored" event.
     */
    public function restored(Model $model): void
    {
        $this->invalidateModelCache($model, 'restored');
    }

    /**
     * Handle the model "force deleted" event.
     */
    public function forceDeleted(Model $model): void
    {
        $this->invalidateModelCache($model, 'force_deleted');
    }

    /**
     * Invalidate appropriate cache based on model type
     */
    private function invalidateModelCache(Model $model, string $action): void
    {
        try {
            $modelClass = class_basename($model);
            
            Log::info('Cache invalidation triggered', [
                'model' => $modelClass,
                'id' => $model->getKey(),
                'action' => $action,
            ]);

            switch ($modelClass) {
                case 'PortfolioItem':
                    $this->cacheManager->invalidatePortfolioCache();
                    break;
                    
                case 'Service':
                    $this->cacheManager->invalidateServicesCache();
                    break;
                    
                case 'Insight':
                    $this->cacheManager->invalidateInsightsCache();
                    break;
                    
                case 'Setting':
                    // Settings affect homepage stats and other global data
                    $this->cacheManager->invalidateByTags([
                        CacheManager::TAGS['settings'],
                        CacheManager::TAGS['homepage'],
                    ]);
                    break;
                    
                default:
                    // For other models, invalidate general content cache
                    $this->cacheManager->invalidateContentCache();
                    break;
            }
        } catch (\Exception $e) {
            Log::error('Cache invalidation failed', [
                'model' => class_basename($model),
                'id' => $model->getKey(),
                'action' => $action,
                'error' => $e->getMessage(),
            ]);
        }
    }
}