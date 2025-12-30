import AdminLayout from '@/layouts/AdminLayout';
import { AdvancedDataTable } from '@/components/admin/AdvancedDataTable';
import { TeamMember, PaginatedData } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash, User, Linkedin, Github, Globe } from 'lucide-react';
import { router } from '@inertiajs/react';
import React from 'react';

interface Props {
    teamMembers: PaginatedData<TeamMember>;
    filters: {
        search?: string;
        status?: string;
    };
    stats: {
        total: number;
        active: number;
        featured: number;
    };
}

export default function Index({ teamMembers }: Props) {
    const breadcrumbs = [
        { title: 'Admin', href: '/admin' },
        { title: 'Team', href: '/admin/team' },
    ];

    const columns = [
        {
            header: 'Member',
            cell: (item: TeamMember) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted overflow-hidden flex-shrink-0">
                        {item.avatar ? (
                            <img src={item.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <User className="h-5 w-5" />
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.position}</div>
                    </div>
                </div>
            ),
        },
        {
            header: 'Status',
            cell: (item: TeamMember) => (
                <div className="flex gap-2">
                    <Badge variant={item.is_active ? 'default' : 'secondary'}>
                        {item.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    {item.is_featured && (
                        <Badge variant="outline" className="border-agency-accent text-agency-accent">
                            Featured
                        </Badge>
                    )}
                </div>
            ),
        },
        {
            header: 'Social',
            cell: (item: TeamMember) => (
                <div className="flex gap-1.5 grayscale opacity-60">
                    {item.social_links?.linkedin && <Linkedin className="h-3.5 w-3.5" />}
                    {item.social_links?.github && <Github className="h-3.5 w-3.5" />}
                    {item.social_links?.website && <Globe className="h-3.5 w-3.5" />}
                </div>
            ),
        },
    ];

    const renderGridItem = (item: TeamMember) => (
        <Card className="overflow-hidden group flex flex-col items-center p-6 text-center">
            <div className="relative size-24 rounded-full bg-muted overflow-hidden mb-4 border-2 border-white/50 dark:border-white/5">
                {item.avatar ? (
                    <img src={item.avatar} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-agency-accent/5">
                        <User className="h-10 w-10 text-agency-accent/20" />
                    </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={() => router.get(`/admin/team/${item.id}/edit`)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            
            <h3 className="font-bold text-lg">{item.name}</h3>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-4">{item.position}</p>
            
            <div className="flex gap-4 mt-auto">
                <Badge variant={item.is_active ? 'default' : 'secondary'} className="text-[10px]">
                    {item.is_active ? 'Active' : 'Inactive'}
                </Badge>
                {item.is_featured && (
                    <Badge variant="outline" className="border-agency-accent text-agency-accent text-[10px]">
                        Featured
                    </Badge>
                )}
            </div>

            <div className="mt-4 pt-4 border-t w-full flex justify-center gap-2">
                 <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => {
                        if(confirm('Remove Member?')) router.delete(`/admin/team/${item.id}`)
                }}>
                    <Trash className="h-4 w-4" />
                </Button>
            </div>
        </Card>
    );

    return (
        <AdminLayout title="Team Management" breadcrumbs={breadcrumbs}>
            <div className="space-y-6">
                 <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
                        <p className="text-muted-foreground">Manage your creative tribe</p>
                    </div>
                </div>

                <AdvancedDataTable
                    data={teamMembers.data}
                    columns={columns}
                    pagination={teamMembers}
                    renderGridItem={renderGridItem}
                    createUrl="/admin/team/create"
                    createLabel="Add Member"
                    searchPlaceholder="Search members..."
                    onSearch={(query) => router.get('/admin/team', { search: query }, { preserveState: true })}
                />
            </div>
        </AdminLayout>
    );
}
