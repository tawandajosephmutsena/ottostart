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

interface CreateProps {
    permissions: Permission[];
}

export default function Create({ permissions }: CreateProps) {
    return (
        <AdminLayout
            title="Create Role"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin' },
                { title: 'Roles', href: '/admin/roles' },
                { title: 'Create', href: '/admin/roles/create' },
            ]}
        >
            <div className="mx-auto max-w-4xl">
                <RoleForm permissions={permissions} />
            </div>
        </AdminLayout>
    );
}
