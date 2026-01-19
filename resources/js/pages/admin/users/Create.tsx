import React from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { UserForm } from './UserForm';

interface Role {

    id: number;
    name: string;
    slug: string;
    description?: string;
}

interface CreateProps {
    roles: Role[];
}


export default function Create({ roles }: CreateProps) {
    return (
        <AdminLayout
            title="Create User"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin' },
                { title: 'Users', href: '/admin/users' },
                { title: 'Create', href: '#' },
            ]}
        >
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Create User</h1>
                    <p className="text-muted-foreground">Add a new user to the system.</p>
                </div>
                <UserForm roles={roles} mode="create" />
            </div>
        </AdminLayout>
    );
}
