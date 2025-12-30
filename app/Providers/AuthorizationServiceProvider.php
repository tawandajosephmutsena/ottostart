<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthorizationServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        //
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        // Admin gates - only admins can perform these actions
        Gate::define('manage-users', function (User $user) {
            return $user->isAdmin();
        });

        Gate::define('manage-settings', function (User $user) {
            return $user->isAdmin();
        });

        Gate::define('manage-system', function (User $user) {
            return $user->isAdmin();
        });

        // Editor gates - admins and editors can perform these actions
        Gate::define('manage-content', function (User $user) {
            return $user->isEditor();
        });

        Gate::define('create-content', function (User $user) {
            return $user->isEditor();
        });

        Gate::define('edit-content', function (User $user) {
            return $user->isEditor();
        });

        Gate::define('delete-content', function (User $user) {
            return $user->isEditor();
        });

        Gate::define('manage-media', function (User $user) {
            return $user->isEditor();
        });

        Gate::define('publish-content', function (User $user) {
            return $user->isEditor();
        });

        // Viewer gates - all authenticated users can perform these actions
        Gate::define('view-content', function (User $user) {
            return $user->isViewer();
        });

        Gate::define('view-dashboard', function (User $user) {
            return $user->isViewer();
        });

        // Content-specific gates
        Gate::define('manage-portfolio', function (User $user) {
            return $user->isEditor();
        });

        Gate::define('manage-services', function (User $user) {
            return $user->isEditor();
        });

        Gate::define('manage-insights', function (User $user) {
            return $user->isEditor();
        });

        Gate::define('manage-team', function (User $user) {
            return $user->isEditor();
        });

        Gate::define('manage-pages', function (User $user) {
            return $user->isEditor();
        });

        // Super admin gate for critical operations
        Gate::define('super-admin', function (User $user) {
            return $user->isAdmin() && $user->email === 'admin@example.com';
        });
    }
}
