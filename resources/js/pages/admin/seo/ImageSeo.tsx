import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { ImageSeoAnalyzer } from '@/components/admin/ImageSeoAnalyzer';

interface ImageSeoProps {
    title: string;
}

const ImageSeo: React.FC<ImageSeoProps> = ({ title }) => {
    return (
        <AdminLayout>
            <Head title={title} />
            
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Image SEO Optimization</h1>
                    <p className="text-gray-600">
                        Analyze and optimize your images for better search engine visibility and accessibility.
                    </p>
                </div>

                <ImageSeoAnalyzer />
            </div>
        </AdminLayout>
    );
};

export default ImageSeo;