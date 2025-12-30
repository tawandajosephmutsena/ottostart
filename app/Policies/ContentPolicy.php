<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ContentPolicy
{
    use HandlesAuthorization;

    /**
     * Determine if the user can manage portfolio items.
     */
    public function managePortfolio(User $user): bool
    {
        return in_array($user->role, ['admin', 'editor']);
    }

    /**
     * Determine if the user can manage services.
     */
    public function manageServices(User $user): bool
    {
        return in_array($user->role, ['admin', 'editor']);
    }

    /**
     * Determine if the user can manage insights/blog posts.
     */
    public function manageInsights(User $user): bool
    {
        return in_array($user->role, ['admin', 'editor']);
    }

    /**
     * Determine if the user can manage team members.
     */
    public function manageTeam(User $user): bool
    {
        return $user->role === 'admin'; // Only admins can manage team
    }

    /**
     * Determine if the user can manage media assets.
     */
    public function manageMedia(User $user): bool
    {
        return in_array($user->role, ['admin', 'editor']);
    }

    /**
     * Determine if the user can view admin dashboard.
     */
    public function viewAdminDashboard(User $user): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine if the user can manage site settings.
     */
    public function manageSettings(User $user): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine if the user can manage users.
     */
    public function manageUsers(User $user): bool
    {
        return $user->role === 'admin';
    }
}