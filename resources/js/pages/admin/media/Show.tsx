import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MediaAsset } from '@/types';
import { Link, router } from '@inertiajs/react';
import { 
    ArrowLeft, 
    Download, 
    Pencil, 
    Trash, 
    Calendar, 
    HardDrive, 
    Folder, 
    FileType, 
    Tag as TagIcon 
} from 'lucide-react';
import React from 'react';

interface Props {
    mediaAsset: MediaAsset;
}

export default function Show({ mediaAsset }: Props) {
    console.log('Show Page mediaAsset:', mediaAsset);

    const breadcrumbs = [
        { title: 'Admin', href: '/admin' },
        { title: 'Media Library', href: '/admin/media' },
        { title: mediaAsset.original_name, href: `/admin/media/${mediaAsset.id}` },
    ];

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this asset permanently?')) {
            router.delete(`/admin/media/${mediaAsset.id}`);
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <AdminLayout title={`Viewing ${mediaAsset.original_name}`} breadcrumbs={breadcrumbs}>
            <div className="max-w-5xl mx-auto w-full space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/admin/media">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold truncate max-w-md" title={mediaAsset.original_name}>{mediaAsset.original_name}</h1>
                            <p className="text-muted-foreground text-sm flex items-center gap-2">
                                <span className="uppercase">{mediaAsset.mime_type}</span>
                                <span>•</span>
                                <span>Uploaded {new Date(mediaAsset.created_at).toLocaleDateString()}</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <a href={mediaAsset.url} download target="_blank" rel="noreferrer">
                                <Download className="h-4 w-4 mr-2" />
                                Download
                            </a>
                        </Button>
                        <Button variant="default" asChild>
                            <Link href={`/admin/media/${mediaAsset.id}/edit`}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit Details
                            </Link>
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Preview Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="overflow-hidden bg-muted/30">
                            <CardContent className="p-0 flex items-center justify-center min-h-[400px]">
                                {mediaAsset.is_image ? (
                                    <img 
                                        src={mediaAsset.url} 
                                        alt={mediaAsset.alt_text || mediaAsset.original_name} 
                                        className="max-w-full max-h-[600px] object-contain" 
                                    />
                                ) : mediaAsset.is_video ? (
                                    <video controls className="max-w-full max-h-[600px]">
                                        <source src={mediaAsset.url} type={mediaAsset.mime_type} />
                                        Your browser does not support the video tag.
                                    </video>
                                ) : (
                                    <div className="flex flex-col items-center gap-4 py-20 text-muted-foreground">
                                        <FileType className="h-24 w-24" />
                                        <p className="text-xl">Preview not available for this file type</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Metadata Column */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">Original Filename</label>
                                    <p className="text-sm font-medium break-all">{mediaAsset.original_name}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                        <Folder className="h-3 w-3" /> Folder
                                    </label>
                                    <p className="text-sm">/{mediaAsset.folder}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                        <HardDrive className="h-3 w-3" /> File Size
                                    </label>
                                    <p className="text-sm">{formatBytes(mediaAsset.size)}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                        <FileType className="h-3 w-3" /> Type
                                    </label>
                                    <p className="text-sm">{mediaAsset.mime_type}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                        <Calendar className="h-3 w-3" /> Uploaded
                                    </label>
                                    <p className="text-sm">
                                        {new Date(mediaAsset.created_at).toLocaleString()}
                                    </p>
                                </div>
                                
                                <div className="pt-4 border-t">
                                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-2">
                                        <TagIcon className="h-3 w-3" /> Tags
                                    </label>
                                    {mediaAsset.tags && mediaAsset.tags.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                            {mediaAsset.tags.map(tag => (
                                                <Badge key={tag} variant="secondary" className="text-xs">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic">No tags</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {(mediaAsset.alt_text || mediaAsset.caption) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Metadata</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {mediaAsset.alt_text && (
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-muted-foreground">Alt Text</label>
                                            <p className="text-sm">{mediaAsset.alt_text}</p>
                                        </div>
                                    )}
                                    {mediaAsset.caption && (
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-muted-foreground">Caption</label>
                                            <p className="text-sm">{mediaAsset.caption}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
