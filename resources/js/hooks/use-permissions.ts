import { usePage } from '@inertiajs/react';
import { PageProps } from '@inertiajs/core';

interface User {
    id: number;
    name: string;
    email: string;
    roles?: { slug: string }[];
    permissions?: { slug: string }[];
    // Include existing fields if necessary
    [key: string]: any;
}

interface AuthInfo {
    user: User;
}

interface IndexProps extends PageProps {
    auth: AuthInfo;
}

export function usePermissions() {
    const { auth } = usePage<IndexProps>().props;
    const user = auth.user;

    /**
     * Check if the user has a specific role
     */
    const hasRole = (roleParams: string | string[]) => {
        if (!user || !user.roles) return false;

        const roles = Array.isArray(roleParams) ? roleParams : [roleParams];
        
        // Super admin bypass
        if (user.roles.some(r => r.slug === 'super-admin')) return true;

        return user.roles.some(r => roles.includes(r.slug));
    };

    /**
     * Check if the user has a specific permission
     */
    const hasPermission = (permission: string) => {
        if (!user) return false;

        // Super admin bypass
        if (user.roles?.some(r => r.slug === 'super-admin')) return true;

        // Check direct permissions (if we implement direct user permissions later)
        if (user.permissions?.some(p => p.slug === permission)) return true;

        // If your backend sends a computed list of all permissions for the user, check that.
        // Assuming the backend 'permissions' on the user object is a flat list of authorized slugs
        // If the structure is different (e.g. nested in roles), we might need to flatten it here or in the backend resource.
        
        // Based on the User model modifications: 
        // We added a 'permissions' relationship that flattens role permissions.
        // We need to ensure Inertia passes this data.
        return user.permissions?.some(p => p.slug === permission) || false;
    };

    /**
     * Check if user can perform an action (alias for hasPermission, serves as a semantic readable helper)
     */
    const can = (permission: string) => hasPermission(permission);

    return { hasRole, hasPermission, can, user };
}
