<?php

namespace App\Traits;

use App\Models\SecurityEvent;
use Illuminate\Support\Facades\Log;

trait AuditLogging
{
    /**
     * Boot the audit logging trait
     */
    protected static function bootAuditLogging(): void
    {
        static::created(function ($model) {
            $model->logAuditEvent('created');
        });

        static::updated(function ($model) {
            $model->logAuditEvent('updated');
        });

        static::deleted(function ($model) {
            $model->logAuditEvent('deleted');
        });
    }

    /**
     * Log audit event
     */
    protected function logAuditEvent(string $action): void
    {
        $modelName = class_basename($this);
        
        $changes = [];
        if ($action === 'updated') {
            $changes = [
                'old' => $this->getOriginal(),
                'new' => $this->getAttributes(),
            ];
        }

        // Log to security log
        Log::channel('security')->info("Model {$action}: {$modelName}", [
            'model' => $modelName,
            'model_id' => $this->getKey(),
            'action' => $action,
            'user_id' => auth()->id(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'changes' => $changes,
            'timestamp' => now()->toISOString(),
        ]);

        // Create security event for sensitive models
        if ($this->isSensitiveModel()) {
            SecurityEvent::create([
                'type' => 'model_' . $action,
                'severity' => $this->getAuditSeverity($action),
                'description' => "{$modelName} {$action} by " . (auth()->user()->name ?? 'system'),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'user_id' => auth()->id(),
                'metadata' => [
                    'model' => $modelName,
                    'model_id' => $this->getKey(),
                    'action' => $action,
                    'changes' => $changes,
                ],
            ]);
        }
    }

    /**
     * Check if this is a sensitive model that requires security event logging
     */
    protected function isSensitiveModel(): bool
    {
        $sensitiveModels = [
            'User',
            'SecurityEvent',
            'MediaAsset',
            'Setting',
        ];

        return in_array(class_basename($this), $sensitiveModels);
    }

    /**
     * Get audit severity based on action
     */
    protected function getAuditSeverity(string $action): string
    {
        return match ($action) {
            'deleted' => 'high',
            'updated' => 'medium',
            'created' => 'low',
            default => 'low',
        };
    }
}