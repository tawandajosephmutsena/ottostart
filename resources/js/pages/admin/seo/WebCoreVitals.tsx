import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { WebCoreVitalsAnalyzer } from '@/components/admin/WebCoreVitalsAnalyzer';

interface WebCoreVitalsProps {
    title: string;
}

const WebCoreVitals: React.FC<WebCoreVitalsProps> = ({ title }) => {
    return (
        <AdminLayout>
            <Head title={title} />
            
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Web Core Vitals Optimization</h1>
                    <p className="text-gray-600">
                        Monitor and optimize your website's Core Web Vitals for better user experience and search rankings.
                    </p>
                </div>

                <WebCoreVitalsAnalyzer />
            </div>
        </AdminLayout>
    );
};

export default WebCoreVitals;