import AdminLayout from '@/layouts/AdminLayout';
import PortfolioForm from './Form';
import React from 'react';

export default function Create() {
    const breadcrumbs = [
        { title: 'Admin', href: '/admin' },
        { title: 'Portfolio', href: '/admin/portfolio' },
        { title: 'Create', href: '/admin/portfolio/create' },
    ];

    return (
        <AdminLayout title="Add New Project" breadcrumbs={breadcrumbs}>
            <PortfolioForm />
        </AdminLayout>
    );
}
