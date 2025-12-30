import AdminLayout from '@/layouts/AdminLayout';
import TeamMemberForm from './Form';
import { TeamMember } from '@/types';
import React from 'react';

interface Props {
    teamMember: TeamMember;
}

export default function Edit({ teamMember }: Props) {
    const breadcrumbs = [
        { title: 'Admin', href: '/admin' },
        { title: 'Team', href: '/admin/team' },
        { title: 'Edit', href: `/admin/team/${teamMember.id}/edit` },
    ];

    return (
        <AdminLayout title={`Edit Tribe Member: ${teamMember.name}`} breadcrumbs={breadcrumbs}>
            <TeamMemberForm teamMember={teamMember} />
        </AdminLayout>
    );
}
