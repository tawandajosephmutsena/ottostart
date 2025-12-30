import AdminLayout from '@/layouts/AdminLayout';
import InsightForm from './Form';
import { Insight, Category, User } from '@/types';
import React from 'react';

interface Props {
    insight: Insight;
    categories: Category[];
    authors: User[];
}

export default function Edit({ insight, categories, authors }: Props) {
    const breadcrumbs = [
        { title: 'Admin', href: '/admin' },
        { title: 'Insights', href: '/admin/insights' },
        { title: 'Edit', href: `/admin/insights/${insight.id}/edit` },
    ];

    return (
        <AdminLayout title={`Edit: ${insight.title}`} breadcrumbs={breadcrumbs}>
            <InsightForm insight={insight} categories={categories} authors={authors} />
        </AdminLayout>
    );
}
