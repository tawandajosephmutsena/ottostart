import React from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { UserForm } from './UserForm';

interface Role {
    id: number;
    name: string;
    slug: string;
    description?: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    roles: { id: number }[];
}

interface EditProps {
    user: User;
    roles: Role[];
}


export default function Edit({ user, roles }: EditProps) {
    return (
        <AdminLayout
            title={`Edit User: ${user.name}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin' },
                { title: 'Users', href: '/admin/users' },
                { title: 'Edit', href: '#' },
            ]}
        >
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Edit User</h1>
                    <p className="text-muted-foreground">Update user details and access.</p>
                </div>
                <UserForm user={user} roles={roles} mode="edit" />
            </div>
        </AdminLayout>
    );
}
