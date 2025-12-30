import AdminLayout from '@/layouts/AdminLayout';
import ServiceForm from './Form';
import { Service } from '@/types';
import React from 'react';

interface Props {
    service: Service;
}

export default function Edit({ service }: Props) {
    const breadcrumbs = [
        { title: 'Admin', href: '/admin' },
        { title: 'Services', href: '/admin/services' },
        { title: 'Edit', href: `/admin/services/${service.id}/edit` },
    ];

    return (
        <AdminLayout title={`Edit: ${service.title}`} breadcrumbs={breadcrumbs}>
            <ServiceForm service={service} />
        </AdminLayout>
    );
}
