<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class RBACSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define core permissions
        $permissions = [
            // User Management
            'users.view' => 'Can view users',
            'users.manage' => 'Can create, edit, and delete users',
            'roles.manage' => 'Can manage roles and permissions',
            
            // Content Management
            'services.view' => 'Can view services',
            'services.manage' => 'Can manage services',
            'portfolio.view' => 'Can view portfolio items',
            'portfolio.manage' => 'Can manage portfolio items',
            'insights.view' => 'Can view insights',
            'insights.manage' => 'Can manage insights',
            'pages.manage' => 'Can manage dynamic pages',
            
            // System
            'analytics.view' => 'Can view analytics dashboard',
            'settings.manage' => 'Can manage site settings',
            'media.manage' => 'Can manage media library',
        ];

        $permissionModels = [];
        foreach ($permissions as $slug => $name) {
            $permissionModels[$slug] = Permission::firstOrCreate(
                ['slug' => $slug],
                ['name' => $name, 'description' => $name]
            );
        }

        // Define core roles
        $roles = [
            'super-admin' => [
                'name' => 'Super Administrator',
                'description' => 'Full system access. Immunity from most restrictions.',
                'permissions' => array_keys($permissions),
            ],
            'admin' => [
                'name' => 'Administrator',
                'description' => 'Standard administrator access.',
                'permissions' => array_keys($permissions),
            ],
            'editor' => [
                'name' => 'Editor',
                'description' => 'Can manage content but not system settings.',
                'permissions' => [
                    'services.view', 'services.manage',
                    'portfolio.view', 'portfolio.manage',
                    'insights.view', 'insights.manage',
                    'pages.manage',
                    'media.manage',
                    'analytics.view',
                ],
            ],
            'viewer' => [
                'name' => 'Viewer',
                'description' => 'Read-only access to most areas.',
                'permissions' => [
                    'services.view',
                    'portfolio.view',
                    'insights.view',
                    'analytics.view',
                ],
            ],
        ];

        foreach ($roles as $slug => $data) {
            $role = Role::firstOrCreate(
                ['slug' => $slug],
                ['name' => $data['name'], 'description' => $data['description']]
            );

            // Sync permissions
            $ids = [];
            foreach ($data['permissions'] as $pSlug) {
                if (isset($permissionModels[$pSlug])) {
                    $ids[] = $permissionModels[$pSlug]->id;
                }
            }
            $role->permissions()->sync($ids);
        }

        // Assign super-admin role to first user if exists
        $user = User::first();
        if ($user) {
            $superAdminRole = Role::where('slug', 'super-admin')->first();
            if ($superAdminRole) {
                $user->roles()->syncWithoutDetaching([$superAdminRole->id]);
            }
        }
    }
}
