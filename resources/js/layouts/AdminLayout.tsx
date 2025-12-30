import { AppShell } from '@/components/app-shell';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { cn } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import React from 'react';
import { BreadcrumbItem } from '@/types';

interface AdminLayoutProps {
    children: React.ReactNode;
    title?: string;
    className?: string;
    breadcrumbs?: BreadcrumbItem[];
}

/**
 * Admin layout component for the CMS backend
 * Includes sidebar navigation, header with breadcrumbs, and main content area
 */
export const AdminLayout: React.FC<AdminLayoutProps> = ({
    children,
    title,
    className,
    breadcrumbs = [],
}) => {
    return (
        <>
            <Head title={title ? `${title} - Admin` : 'Admin'} />
            <AppShell variant="sidebar">
                <AdminSidebar />
                <SidebarInset>
                    {/* Header with trigger and breadcrumbs */}
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        {breadcrumbs.length > 0 && (
                            <Breadcrumbs breadcrumbs={breadcrumbs} />
                        )}
                    </header>

                    {/* Main content */}
                    <main
                        className={cn(
                            'flex flex-1 flex-col gap-4 p-4',
                            className,
                        )}
                    >
                        {children}
                    </main>
                </SidebarInset>
            </AppShell>
        </>
    );
};

export default AdminLayout;