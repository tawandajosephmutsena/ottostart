import AdminLayout from '@/layouts/AdminLayout';
import PortfolioForm from './Form';
import { PortfolioItem } from '@/types';
import React from 'react';

interface Props {
    portfolioItem: PortfolioItem;
}

export default function Edit({ portfolioItem }: Props) {
    console.log('Edit Page portfolioItem:', portfolioItem);
    
    const breadcrumbs = [
        { title: 'Admin', href: '/admin' },
        { title: 'Portfolio', href: '/admin/portfolio' },
        { title: 'Edit', href: `/admin/portfolio/${portfolioItem.id}/edit` },
    ];

    return (
        <AdminLayout title={`Edit: ${portfolioItem.title}`} breadcrumbs={breadcrumbs}>
            <PortfolioForm portfolioItem={portfolioItem} />
        </AdminLayout>
    );
}
