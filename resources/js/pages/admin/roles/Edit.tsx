import React from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { RoleForm } from './RoleForm';

interface Permission {
    id: number;
    name: string;
    slug: string;
    category: string;
    description?: string;
}

interface Role {
    id: number;
    name: string;
    slug: string;
    description?: string;
    permissions: Permission[];
}

interface EditProps {
    role: Role;
    permissions: Permission[];
}

export default function Edit({ role, permissions }: EditProps) {
    return (
        <AdminLayout
            title="Edit Role"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin' },
                { title: 'Roles', href: '/admin/roles' },
                { title: role.name, href: `/admin/roles/${role.id}/edit` },
            ]}
        >
            <div className="mx-auto max-w-4xl">
                <RoleForm role={role} permissions={permissions} isEditing />
            </div>
        </AdminLayout>
    );
}
