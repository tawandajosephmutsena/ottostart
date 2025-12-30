import AdminLayout from '@/layouts/AdminLayout';
import ServiceForm from './Form';
import React from 'react';

export default function Create() {
    const breadcrumbs = [
        { title: 'Admin', href: '/admin' },
        { title: 'Services', href: '/admin/services' },
        { title: 'Create', href: '/admin/services/create' },
    ];

    return (
        <AdminLayout title="Add New Service" breadcrumbs={breadcrumbs}>
            <ServiceForm />
        </AdminLayout>
    );
}
