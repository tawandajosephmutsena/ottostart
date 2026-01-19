import React from 'react';
import { usePermissions } from '@/hooks/use-permissions';

interface CanProps {
    permission?: string;
    role?: string | string[];
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

const Can: React.FC<CanProps> = ({ permission, role, children, fallback = null }) => {
    const { hasPermission, hasRole } = usePermissions();

    if (role && hasRole(role)) {
        return <>{children}</>;
    }

    if (permission && hasPermission(permission)) {
        return <>{children}</>;
    }

    // specific case where we might check both? For now OR logic seems safest if separate props.
    // If both are provided, let's enforce both (AND logic) for "Strict" checks, 
    // BUT usually users pass one or the other.
    // Let's stick to: if role match OR permission match, show it. 
    // If both provided, and only one matches? 
    // Implementing AND logic if both are present:
    if (role && permission) {
        if (hasRole(role) && hasPermission(permission)) {
             return <>{children}</>;
        }
        return <>{fallback}</>;
    }

    // If only one was checked above and failed (because we returned early on success)
    // we would have returned already.
    // Wait, the logic above:
    // 1. If role is passed and matches -> return children.
    // 2. If permission is passed and matches -> return children.
    // This allows "Role OR Permission".
    
    return <>{fallback}</>;
};

export default Can;
