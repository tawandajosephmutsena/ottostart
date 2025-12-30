import AdminLayout from '@/layouts/AdminLayout';
import { AdvancedDataTable } from '@/components/admin/AdvancedDataTable';
import { Insight, PaginatedData } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash, FileText, Calendar, User as UserIcon } from 'lucide-react';
import { router } from '@inertiajs/react';
import React from 'react';

interface Props {
    insights: PaginatedData<Insight>;
}

export default function Index({ insights }: Props) {
    const breadcrumbs = [
        { title: 'Admin', href: '/admin' },
        { title: 'Insights', href: '/admin/insights' },
    ];

    const columns = [
        {
            header: 'Article',
            cell: (item: Insight) => (
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded bg-muted overflow-hidden flex-shrink-0">
                        {item.featured_image ? (
                            <img src={item.featured_image} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <FileText className="h-4 w-4" />
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="font-medium truncate max-w-[200px]" title={item.title}>{item.title}</div>
                        <div className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-2.5 w-2.5" />
                            {item.published_at ? new Date(item.published_at).toLocaleDateString() : 'Unpublished'}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            header: 'Details',
            cell: (item: Insight) => (
                <div className="space-y-1">
                     <div className="text-xs font-medium flex items-center gap-1">
                        <UserIcon className="h-3 w-3" />
                        {item.author?.name || 'Unknown'}
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                        {item.category?.name || 'Uncategorized'}
                    </Badge>
                </div>
            ),
        },
        {
            header: 'Status',
            cell: (item: Insight) => (
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
    ];

    const renderGridItem = (item: Insight) => (
        <Card className="overflow-hidden group flex flex-col h-full">
            <div className="relative aspect-video bg-muted overflow-hidden">
                {item.featured_image && (
                    <img 
                        src={item.featured_image} 
                        alt="" 
                        className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                    />
                )}
                <div className="absolute top-2 right-2">
                    <Badge variant={item.is_published ? 'default' : 'secondary'} className="shadow-sm">
                        {item.is_published ? 'Published' : 'Draft'}
                    </Badge>
                </div>
            </div>
            <CardHeader className="p-4 space-y-1">
                <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-sm line-clamp-2" title={item.title}>{item.title}</h3>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{item.category?.name}</span>
                    <span>•</span>
                    <span>{item.reading_time} min read</span>
                </div>
            </CardHeader>
            <CardFooter className="p-4 pt-0 mt-auto flex justify-between items-center border-t border-t-muted pt-3">
                <span className="text-[10px] font-medium">{item.author?.name}</span>
                <div className="flex gap-2">
                     <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => router.get(`/admin/insights/${item.id}/edit`)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => {
                        if(confirm('Delete Post?')) router.delete(`/admin/insights/${item.id}`)
                    }}>
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );

    return (
        <AdminLayout title="Blog Management" breadcrumbs={breadcrumbs}>
            <div className="space-y-6">
                 <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Insights</h1>
                        <p className="text-muted-foreground">Manage your blog posts and articles</p>
                    </div>
                </div>

                <AdvancedDataTable
                    data={insights.data}
                    columns={columns}
                    pagination={insights}
                    renderGridItem={renderGridItem}
                    createUrl="/admin/insights/create"
                    createLabel="Write Article"
                    searchPlaceholder="Search articles..."
                    onSearch={(query) => router.get('/admin/insights', { search: query }, { preserveState: true })}
                />
            </div>
        </AdminLayout>
    );
}
