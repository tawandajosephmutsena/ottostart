import AdminLayout from '@/layouts/AdminLayout';
import TeamMemberForm from './Form';
import React from 'react';

export default function Create() {
    const breadcrumbs = [
        { title: 'Admin', href: '/admin' },
        { title: 'Team', href: '/admin/team' },
        { title: 'Add Member', href: '/admin/team/create' },
    ];

    return (
        <AdminLayout title="Add New Tribe Member" breadcrumbs={breadcrumbs}>
            <TeamMemberForm />
        </AdminLayout>
    );
}
