import { Head } from '@inertiajs/react';
import React from 'react';

interface StructuredDataProps {
    data: Record<string, any> | Record<string, any>[];
    id?: string;
}

export const StructuredData: React.FC<StructuredDataProps> = ({ data, id }) => {
    // Ensure data is properly formatted
    const jsonLd = Array.isArray(data) ? data : [data];
    
    // Filter out any null or undefined items
    const validData = jsonLd.filter(item => item && typeof item === 'object');
    
    if (validData.length === 0) {
        return null;
    }

    // If we have multiple items, wrap them in @graph
    const structuredData = validData.length === 1 
        ? validData[0] 
        : {
            '@context': 'https://schema.org',
            '@graph': validData
        };

    return (
        <Head>
            <script
                type="application/ld+json"
                id={id}
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(structuredData, null, 0)
                }}
            />
        </Head>
    );
};

// Specific structured data components for common use cases

interface ArticleStructuredDataProps {
    title: string;
    description: string;
    url: string;
    publishedAt: string;
    modifiedAt?: string;
    author: {
        name: string;
        url?: string;
    };
    image?: string;
    keywords?: string[];
    readingTime?: number;
    category?: string;
}

export const ArticleStructuredData: React.FC<ArticleStructuredDataProps> = ({
    title,
    description,
    url,
    publishedAt,
    modifiedAt,
    author,
    image,
    keywords,
    readingTime,
    category
}) => {
    const data = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title,
        description: description,
        url: url,
        datePublished: publishedAt,
        dateModified: modifiedAt || publishedAt,
        author: {
            '@type': 'Person',
            name: author.name,
            ...(author.url && { url: author.url })
        },
        publisher: {
            '@type': 'Organization',
            name: 'Avant-Garde CMS',
            logo: {
                '@type': 'ImageObject',
                url: '/images/logo.png'
            }
        },
        ...(image && {
            image: {
                '@type': 'ImageObject',
                url: image,
                width: 1200,
                height: 630
            }
        }),
        ...(keywords && { keywords: keywords.join(', ') }),
        ...(readingTime && { timeRequired: `PT${readingTime}M` }),
        ...(category && { articleSection: category })
    };

    return <StructuredData data={data} id="article-structured-data" />;
};

interface OrganizationStructuredDataProps {
    name: string;
    url: string;
    logo: string;
    description?: string;
    contactPoint?: {
        telephone?: string;
        email?: string;
    };
    address?: {
        street?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
    };
    socialLinks?: string[];
}

export const OrganizationStructuredData: React.FC<OrganizationStructuredDataProps> = ({
    name,
    url,
    logo,
    description,
    contactPoint,
    address,
    socialLinks
}) => {
    const data = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: name,
        url: url,
        logo: {
            '@type': 'ImageObject',
            url: logo
        },
        ...(description && { description }),
        ...(contactPoint && {
            contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer service',
                ...(contactPoint.telephone && { telephone: contactPoint.telephone }),
                ...(contactPoint.email && { email: contactPoint.email })
            }
        }),
        ...(address && {
            address: {
                '@type': 'PostalAddress',
                streetAddress: address.street || '',
                addressLocality: address.city || '',
                addressRegion: address.state || '',
                postalCode: address.postalCode || '',
                addressCountry: address.country || ''
            }
        }),
        ...(socialLinks && socialLinks.length > 0 && { sameAs: socialLinks })
    };

    return <StructuredData data={data} id="organization-structured-data" />;
};

interface BreadcrumbStructuredDataProps {
    items: Array<{
        name: string;
        url: string;
    }>;
}

export const BreadcrumbStructuredData: React.FC<BreadcrumbStructuredDataProps> = ({ items }) => {
    const data = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url
        }))
    };

    return <StructuredData data={data} id="breadcrumb-structured-data" />;
};

interface ServiceStructuredDataProps {
    name: string;
    description: string;
    url: string;
    serviceType?: string;
    provider: {
        name: string;
        url: string;
    };
    offers?: {
        priceRange?: string;
        currency?: string;
    };
    image?: string;
}

export const ServiceStructuredData: React.FC<ServiceStructuredDataProps> = ({
    name,
    description,
    url,
    serviceType,
    provider,
    offers,
    image
}) => {
    const data = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: name,
        description: description,
        url: url,
        ...(serviceType && { serviceType }),
        provider: {
            '@type': 'Organization',
            name: provider.name,
            url: provider.url
        },
        ...(offers && {
            offers: {
                '@type': 'Offer',
                ...(offers.priceRange && { priceRange: offers.priceRange }),
                ...(offers.currency && { priceCurrency: offers.currency })
            }
        }),
        ...(image && {
            image: {
                '@type': 'ImageObject',
                url: image
            }
        })
    };

    return <StructuredData data={data} id="service-structured-data" />;
};

interface FAQStructuredDataProps {
    faqs: Array<{
        question: string;
        answer: string;
    }>;
}

export const FAQStructuredData: React.FC<FAQStructuredDataProps> = ({ faqs }) => {
    const data = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(faq => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer
            }
        }))
    };

    return <StructuredData data={data} id="faq-structured-data" />;
};