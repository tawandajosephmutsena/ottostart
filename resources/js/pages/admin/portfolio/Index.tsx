import AdminLayout from '@/layouts/AdminLayout';
import { AdvancedDataTable } from '@/components/admin/AdvancedDataTable';
import { PortfolioItem, PaginatedData } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Eye, Edit, Trash } from 'lucide-react';
import { router } from '@inertiajs/react';
import React from 'react';

interface Props {
    portfolioItems: PaginatedData<PortfolioItem>;
    filters: {
        search?: string;
        status?: string;
    };
    stats: {
        total: number;
        published: number;
        featured: number;
    };
}

export default function Index({ portfolioItems }: Props) {
    const breadcrumbs = [
        { title: 'Admin', href: '/admin' },
        { title: 'Portfolio', href: '/admin/portfolio' },
    ];

    const columns = [
        {
            header: 'Project',
            cell: (item: PortfolioItem) => (
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded bg-muted overflow-hidden flex-shrink-0">
                        {item.featured_image ? (
                            <img src={item.featured_image} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <Star className="h-4 w-4" />
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-xs text-muted-foreground">{item.client || 'Internal Project'}</div>
                    </div>
                </div>
            ),
        },
        {
            header: 'Status',
            cell: (item: PortfolioItem) => (
                <div className="flex gap-2">
                    <Badge variant={item.is_published ? 'default' : 'secondary'}>
                        {item.is_published ? 'Published' : 'Draft'}
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
            header: 'Date',
            cell: (item: PortfolioItem) => (
                <div className="text-sm">
                    {item.project_date ? new Date(item.project_date).toLocaleDateString() : 'N/A'}
                </div>
            ),
        },
    ];

    const renderGridItem = (item: PortfolioItem) => (
        <Card className="overflow-hidden group flex flex-col h-full">
            <div className="relative aspect-video bg-muted overflow-hidden">
                {item.featured_image && (
                    <img 
                        src={item.featured_image} 
                        alt="" 
                        className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                    />
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                    {item.is_featured && (
                        <div className="bg-white dark:bg-black p-1 rounded-full shadow-sm text-agency-accent">
                            <Star className="h-4 w-4 fill-current" />
                        </div>
                    )}
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => router.get(`/admin/portfolio/${item.id}`)}>
                        <Eye className="h-4 w-4 mr-2" /> View
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => router.get(`/admin/portfolio/${item.id}/edit`)}>
                        <Edit className="h-4 w-4 mr-2" /> Edit
                    </Button>
                </div>
            </div>
            <CardHeader className="p-4 space-y-1">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold truncate text-sm" title={item.title}>{item.title}</h3>
                    <Badge variant={item.is_published ? 'default' : 'secondary'} className="text-[10px] px-1 h-4">
                        {item.is_published ? 'PUB' : 'DFT'}
                    </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">{item.client || 'No Client'}</p>
            </CardHeader>
            <CardFooter className="p-4 pt-0 mt-auto flex justify-between items-center border-t text-xs pt-3">
                <div className="flex gap-1 overflow-hidden">
                    {item.technologies?.slice(0, 2).map((tech, i) => (
                        <span key={i} className="bg-muted px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-tighter">{tech}</span>
                    ))}
                    {(item.technologies?.length ?? 0) > 2 && (
                        <span className="bg-muted px-1.5 py-0.5 rounded text-[10px]">+{item.technologies!.length - 2}</span>
                    )}
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => {
                        if(confirm('Delete Project?')) router.delete(`/admin/portfolio/${item.id}`)
                    }}>
                        <Trash className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );

    return (
        <AdminLayout title="Portfolio Management" breadcrumbs={breadcrumbs}>
            <div className="space-y-6">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
                        <p className="text-muted-foreground">Manage your projects and case studies</p>
                    </div>
                </div>

                <AdvancedDataTable
                    data={portfolioItems.data}
                    columns={columns}
                    pagination={portfolioItems}
                    renderGridItem={renderGridItem}
                    createUrl="/admin/portfolio/create"
                    createLabel="Add Project"
                    searchPlaceholder="Search projects..."
                    onSearch={(query) => router.get('/admin/portfolio', { search: query }, { preserveState: true })}
                />
            </div>
        </AdminLayout>
    );
}
