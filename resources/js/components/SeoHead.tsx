import { Head, usePage } from '@inertiajs/react';
import React from 'react';
import { SharedData } from '@/types';

interface SeoHeadProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: string;
    publishedTime?: string;
    author?: string;
}

export const SeoHead: React.FC<SeoHeadProps> = ({
    title,
    description,
    image,
    url,
    type = 'website',
    publishedTime,
    author,
}) => {
    // @ts-ignore
    const { site } = usePage<SharedData>().props;
    
    // Fallback defaults
    const siteName = site?.name || 'Avant-Garde CMS';
    const siteDescription = site?.description || 'Digital Innovation Redefined';
    const siteUrl = site?.url || 'https://avant-garde.com';
    const defaultImage = site?.logo || '/og-image.jpg';

    // Computed values
    const metaTitle = title ? `${title} | ${siteName}` : siteName;
    const metaDescription = description || siteDescription;
    const metaImage = image || defaultImage;
    const metaUrl = url || typeof window !== 'undefined' ? window.location.href : siteUrl;

    return (
        <Head>
            <title>{metaTitle}</title>
            <meta name="description" content={metaDescription} />
            
            {/* Open Graph */}
            <meta property="og:site_name" content={siteName} />
            <meta property="og:title" content={metaTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:type" content={type} />
            <meta property="og:url" content={metaUrl} />
            <meta property="og:image" content={metaImage} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={metaTitle} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={metaImage} />

            {/* Articles */}
            {publishedTime && <meta property="article:published_time" content={publishedTime} />}
            {author && <meta name="author" content={author} />}
        </Head>
    );
};
