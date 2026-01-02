import AdminLayout from '@/layouts/AdminLayout';
import { AdvancedDataTable } from '@/components/admin/AdvancedDataTable';
import { Page, PaginatedData } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Eye, Edit, Trash } from 'lucide-react';
import { router } from '@inertiajs/react';
import React from 'react';

interface Props {
    pages: PaginatedData<Page>;
    filters: {
        search?: string;
        status?: string;
    };
}

export default function Index({ pages }: Props) {
    const breadcrumbs = [
        { title: 'Admin', href: '/admin' },
        { title: 'Pages', href: '/admin/pages' },
    ];

    const columns = [
        {
            header: 'Page Title',
            cell: (page: Page) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-muted flex items-center justify-center text-muted-foreground flex-shrink-0">
                        <FileText className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="font-medium">{page.title}</div>
                        <div className="text-xs text-muted-foreground">/{page.slug}</div>
                    </div>
                </div>
            ),
        },
        {
            header: 'Template',
            cell: (page: Page) => (
                <Badge variant="outline" className="capitalize">
                    {page.template}
                </Badge>
            ),
        },
        {
            header: 'Status',
            cell: (page: Page) => (
                <Badge variant={page.is_published ? 'default' : 'secondary'}>
                    {page.is_published ? 'Published' : 'Draft'}
                </Badge>
            ),
        },
        {
            header: 'Last Modified',
            cell: (page: Page) => (
                <div className="text-sm">
                    {new Date(page.updated_at).toLocaleDateString()}
                </div>
            ),
        },
    ];

    const renderGridItem = (page: Page) => (
        <Card className="overflow-hidden group flex flex-col h-full">
            <div className="relative aspect-[4/3] bg-muted flex items-center justify-center p-8">
                <FileText className="h-16 w-16 text-muted-foreground/30" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => window.open(`/${page.slug === 'home' ? '' : page.slug}`, '_blank')}>
                        <Eye className="h-4 w-4 mr-2" /> View
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => router.get(`/admin/pages/${page.slug}/edit`)}>
                        <Edit className="h-4 w-4 mr-2" /> Edit
                    </Button>
                </div>
            </div>
            <CardHeader className="p-4 space-y-1">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold truncate text-sm" title={page.title}>{page.title}</h3>
                    <Badge variant={page.is_published ? 'default' : 'secondary'} className="text-[10px] px-1 h-4">
                        {page.is_published ? 'PUB' : 'DFT'}
                    </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">/{page.slug}</p>
            </CardHeader>
            <CardFooter className="p-4 pt-0 mt-auto flex justify-between items-center border-t text-xs pt-3">
                <div className="text-muted-foreground capitalize">
                    {page.template} Template
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => {
                        if(confirm('Delete Page?')) router.delete(`/admin/pages/${page.slug}`)
                    }}>
                        <Trash className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );

    return (
        <AdminLayout title="Page Management" breadcrumbs={breadcrumbs}>
            <div className="space-y-6">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Pages</h1>
                        <p className="text-muted-foreground">Manage dynamic pages and content structure</p>
                    </div>
                </div>

                <AdvancedDataTable
                    data={pages.data}
                    columns={columns}
                    pagination={pages}
                    renderGridItem={renderGridItem}
                    createUrl="/admin/pages/create"
                    createLabel="Create Page"
                    searchPlaceholder="Search pages..."
                    routeKey="slug"
                    onSearch={(query) => router.get('/admin/pages', { search: query }, { preserveState: true })}
                />
            </div>
        </AdminLayout>
    );
}
