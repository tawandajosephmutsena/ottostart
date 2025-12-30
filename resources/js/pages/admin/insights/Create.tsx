import AdminLayout from '@/layouts/AdminLayout';
import InsightForm from './Form';
import { Category, User } from '@/types';
import React from 'react';

interface Props {
    categories: Category[];
    authors: User[];
}

export default function Create({ categories, authors }: Props) {
    const breadcrumbs = [
        { title: 'Admin', href: '/admin' },
        { title: 'Insights', href: '/admin/insights' },
        { title: 'Write Article', href: '/admin/insights/create' },
    ];

    return (
        <AdminLayout title="Add New Article" breadcrumbs={breadcrumbs}>
            <InsightForm categories={categories} authors={authors} />
        </AdminLayout>
    );
}
