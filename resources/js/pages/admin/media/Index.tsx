import AdminLayout from '@/layouts/AdminLayout';
import { AdvancedDataTable } from '@/components/admin/AdvancedDataTable';
import { MediaAsset, PaginatedData } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    Video as VideoIcon, 
    FileText, 
    Trash, 
    Info
} from 'lucide-react';
import { router } from '@inertiajs/react';
import React from 'react';

interface Props {
    mediaAssets: PaginatedData<MediaAsset>;
    folders: string[];
    filters: {
        search?: string;
        type?: string;
        folder?: string;
    };
    stats: {
        total: number;
        images: number;
        videos: number;
        total_size: number;
    };
}

export default function Index({ mediaAssets, stats }: Props) {
    const breadcrumbs = [
        { title: 'Admin', href: '/admin' },
        { title: 'Media Library', href: '/admin/media' },
    ];

    const formatBytes = (bytes: number, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const columns = [
        {
            header: 'Asset',
            cell: (item: MediaAsset) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded border bg-muted overflow-hidden flex-shrink-0">
                        {item.is_image ? (
                            <img src={item.url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                {item.is_video ? <VideoIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                            </div>
                        )}
                    </div>
                    <div className="max-w-[300px]">
                        <div className="font-medium truncate" title={item.original_name}>{item.original_name}</div>
                        <div className="text-[10px] text-muted-foreground uppercase">{item.mime_type} • {formatBytes(item.size)}</div>
                    </div>
                </div>
            ),
        },
        {
            header: 'Folder',
            cell: (item: MediaAsset) => (
                <Badge variant="outline" className="text-[10px] uppercase">{item.folder}</Badge>
            ),
        },
        {
            header: 'Uploaded',
            cell: (item: MediaAsset) => (
                <span className="text-xs text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString()}
                </span>
            ),
        },
    ];

    const renderGridItem = (item: MediaAsset) => (
        <Card className="overflow-hidden group relative aspect-square flex flex-col bg-muted/40 border-agency-primary/10 hover:border-agency-accent/50 transition-colors">
            {item.is_image ? (
                <img src={item.url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    {item.is_video ? <VideoIcon className="h-8 w-8" /> : <FileText className="h-8 w-8" />}
                    <span className="text-[10px] font-bold uppercase tracking-widest">{item.mime_type.split('/')[1]}</span>
                </div>
            )}
            
            <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                <div className="text-[10px] text-white font-medium truncate mb-1">{item.original_name}</div>
                <div className="flex justify-between items-center">
                    <span className="text-[8px] text-white/60 font-bold uppercase">{formatBytes(item.size)}</span>
                    <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-6 w-6 text-white hover:text-agency-accent" onClick={() => router.get(`/admin/media/${item.id}`)}>
                            <Info className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-6 w-6 text-white hover:text-destructive" onClick={() => {
                            if(confirm('Delete permanently?')) router.delete(`/admin/media/${item.id}`)
                        }}>
                            <Trash className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );

    return (
        <AdminLayout title="Media Library" breadcrumbs={breadcrumbs}>
            <div className="space-y-6">
                 <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
                        <p className="text-muted-foreground">Manage your assets, images, and brand files</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-right">
                            <div className="text-xl font-bold">{stats.total}</div>
                            <div className="text-[10px] uppercase font-bold text-muted-foreground">Total Assets</div>
                        </div>
                        <div className="text-right">
                            <div className="text-xl font-bold text-agency-accent">{formatBytes(stats.total_size)}</div>
                            <div className="text-[10px] uppercase font-bold opacity-60">Storage Used</div>
                        </div>
                    </div>
                </div>

                <AdvancedDataTable
                    data={mediaAssets.data}
                    columns={columns}
                    pagination={mediaAssets}
                    renderGridItem={renderGridItem}
                    createUrl="/admin/media/create"
                    createLabel="Upload Files"
                    searchPlaceholder="Search files..."
                    onSearch={(query) => router.get('/admin/media', { search: query }, { preserveState: true })}
                />
            </div>
        </AdminLayout>
    );
}
