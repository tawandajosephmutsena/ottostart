import AdminLayout from '@/layouts/AdminLayout';
import MediaUpload from '@/components/admin/MediaUpload';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';
import React from 'react';

export default function UploadPage() {
    const breadcrumbs = [
        { title: 'Admin', href: '/admin' },
        { title: 'Media Library', href: '/admin/media' },
        { title: 'Upload', href: '/admin/media/create' },
    ];

    return (
        <AdminLayout title="Upload Media" breadcrumbs={breadcrumbs}>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/media">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">Upload Assets</h1>
                </div>

                <MediaUpload 
                    onSuccess={() => {
                        // Optional: show toast or redirect
                    }}
                />
                
                <div className="flex justify-center">
                    <Link href="/admin/media">
                        <Button variant="outline">Back to Library</Button>
                    </Link>
                </div>
            </div>
        </AdminLayout>
    );
}
