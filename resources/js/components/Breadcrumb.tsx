import { Link } from '@inertiajs/react';
import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { BreadcrumbStructuredData } from './StructuredData';

interface BreadcrumbItem {
    title: string;
    url?: string | null;
    active?: boolean;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
    showHome?: boolean;
    showStructuredData?: boolean;
    separator?: React.ReactNode;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
    items,
    className = '',
    showHome = true,
    showStructuredData = true,
    separator = <ChevronRight className="w-4 h-4 text-gray-400" />
}) => {
    // Ensure we have at least home if showHome is true
    const breadcrumbItems = showHome && items[0]?.title !== 'Home' 
        ? [{ title: 'Home', url: '/', active: false }, ...items]
        : items;

    // Filter out items without titles
    const validItems = breadcrumbItems.filter(item => item.title);

    if (validItems.length === 0) {
        return null;
    }

    return (
        <>
            {/* Structured Data */}
            {showStructuredData && (
                <BreadcrumbStructuredData 
                    items={validItems.map(item => ({
                        name: item.title,
                        url: item.url || window.location.href
                    }))}
                />
            )}

            {/* Breadcrumb Navigation */}
            <nav 
                aria-label="Breadcrumb" 
                className={`flex items-center space-x-2 text-sm ${className}`}
            >
                <ol className="flex items-center space-x-2">
                    {validItems.map((item, index) => (
                        <li key={index} className="flex items-center">
                            {index > 0 && (
                                <span className="mx-2 flex-shrink-0">
                                    {separator}
                                </span>
                            )}
                            
                            {item.active || !item.url ? (
                                <span 
                                    className="text-gray-900 dark:text-white font-medium"
                                    aria-current={item.active ? 'page' : undefined}
                                >
                                    {index === 0 && showHome && item.title === 'Home' ? (
                                        <Home className="w-4 h-4" />
                                    ) : (
                                        item.title
                                    )}
                                </span>
                            ) : (
                                <Link
                                    href={item.url}
                                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                                >
                                    {index === 0 && showHome && item.title === 'Home' ? (
                                        <Home className="w-4 h-4" />
                                    ) : (
                                        item.title
                                    )}
                                </Link>
                            )}
                        </li>
                    ))}
                </ol>
            </nav>
        </>
    );
};

// Specialized breadcrumb components for different contexts

interface PageBreadcrumbProps {
    title: string;
    parentPages?: Array<{ title: string; url: string }>;
    className?: string;
}

export const PageBreadcrumb: React.FC<PageBreadcrumbProps> = ({
    title,
    parentPages = [],
    className
}) => {
    const items = [
        ...parentPages.map(page => ({ ...page, active: false })),
        { title, active: true }
    ];

    return <Breadcrumb items={items} className={className} />;
};

interface AdminBreadcrumbProps {
    section: string;
    action?: string;
    itemTitle?: string;
    className?: string;
}

export const AdminBreadcrumb: React.FC<AdminBreadcrumbProps> = ({
    section,
    action,
    itemTitle,
    className
}) => {
    const items = [
        { title: 'Admin', url: '/admin', active: false },
        { title: section, url: `/admin/${section.toLowerCase()}`, active: !action },
    ];

    if (action) {
        const actionTitle = action === 'create' ? 'Create' : 
                          action === 'edit' ? (itemTitle || 'Edit') :
                          action === 'show' ? (itemTitle || 'View') :
                          action;
        
        items.push({ title: actionTitle, active: true });
    }

    return <Breadcrumb items={items} className={className} />;
};

interface BlogBreadcrumbProps {
    postTitle?: string;
    categoryName?: string;
    categorySlug?: string;
    className?: string;
}

export const BlogBreadcrumb: React.FC<BlogBreadcrumbProps> = ({
    postTitle,
    categoryName,
    categorySlug,
    className
}) => {
    const items = [
        { title: 'Blog', url: '/blog', active: !postTitle }
    ];

    if (categoryName && categorySlug && postTitle) {
        items.push({
            title: categoryName,
            url: `/blog?category=${categorySlug}`,
            active: false
        });
    }

    if (postTitle) {
        items.push({ title: postTitle, active: true });
    }

    return <Breadcrumb items={items} className={className} />;
};

interface PortfolioBreadcrumbProps {
    projectTitle?: string;
    className?: string;
}

export const PortfolioBreadcrumb: React.FC<PortfolioBreadcrumbProps> = ({
    projectTitle,
    className
}) => {
    const items = [
        { title: 'Portfolio', url: '/portfolio', active: !projectTitle }
    ];

    if (projectTitle) {
        items.push({ title: projectTitle, active: true });
    }

    return <Breadcrumb items={items} className={className} />;
};

interface ServicesBreadcrumbProps {
    serviceTitle?: string;
    className?: string;
}

export const ServicesBreadcrumb: React.FC<ServicesBreadcrumbProps> = ({
    serviceTitle,
    className
}) => {
    const items = [
        { title: 'Services', url: '/services', active: !serviceTitle }
    ];

    if (serviceTitle) {
        items.push({ title: serviceTitle, active: true });
    }

    return <Breadcrumb items={items} className={className} />;
};