import { Head, usePage } from '@inertiajs/react';
import React from 'react';
import { SharedData } from '@/types';

interface SeoData {
    title?: string;
    description?: string;
    keywords?: string[];
    image?: string;
    imageAlt?: string;
    url?: string;
    canonicalUrl?: string;
    type?: string;
    locale?: string;
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
    twitterCreator?: string;
    robots?: string;
    noIndex?: boolean;
    noFollow?: boolean;
    noArchive?: boolean;
    noSnippet?: boolean;
    structuredData?: Record<string, any>;
    hreflang?: Array<{ lang: string; url: string }>;
}

interface SeoHeadProps extends SeoData {
    // Legacy props for backward compatibility
}

export const SeoHead: React.FC<SeoHeadProps> = ({
    title,
    description,
    keywords = [],
    image,
    imageAlt,
    url,
    canonicalUrl,
    type = 'website',
    locale = 'en_US',
    publishedTime,
    modifiedTime,
    author,
    twitterCard = 'summary_large_image',
    twitterCreator,
    robots,
    noIndex = false,
    noFollow = false,
    noArchive = false,
    noSnippet = false,
    structuredData,
    hreflang = [],
}) => {
    const { site, seo } = usePage<SharedData & { seo?: any }>().props;
    
    // Fallback defaults from config or site data
    const siteName = seo?.site_name || site?.name || 'Avant-Garde CMS';
    const siteDescription = seo?.default_description || site?.description || 'Digital Innovation Redefined';
    const siteUrl = seo?.site_url || site?.url || 'https://avant-garde.com';
    const defaultImage = seo?.default_og_image || site?.logo || '/images/og-default.jpg';
    const titleSeparator = seo?.title_separator || ' | ';
    const twitterHandle = seo?.twitter_handle;
    const facebookAppId = seo?.facebook_app_id;

    // Computed values
    const metaTitle = title ? `${title}${titleSeparator}${siteName}` : siteName;
    const metaDescription = description || siteDescription;
    const metaImage = image || defaultImage;
    const metaImageAlt = imageAlt || title || siteName;
    const metaUrl = canonicalUrl || url || (typeof window !== 'undefined' ? window.location.href : siteUrl);
    
    // Generate robots directive
    const robotsDirective = robots || (() => {
        const directives = [];
        directives.push(noIndex ? 'noindex' : 'index');
        directives.push(noFollow ? 'nofollow' : 'follow');
        if (noArchive) directives.push('noarchive');
        if (noSnippet) directives.push('nosnippet');
        return directives.join(', ');
    })();

    // Generate keywords meta tag
    const keywordsString = keywords.length > 0 ? keywords.join(', ') : undefined;

    return (
        <Head>
            {/* Basic Meta Tags */}
            <title>{metaTitle}</title>
            <meta name="description" content={metaDescription} />
            {keywordsString && <meta name="keywords" content={keywordsString} />}
            <meta name="robots" content={robotsDirective} />
            {author && <meta name="author" content={author} />}
            
            {/* Canonical URL */}
            <link rel="canonical" href={canonicalUrl || metaUrl} />
            
            {/* Open Graph */}
            <meta property="og:site_name" content={siteName} />
            <meta property="og:title" content={title || siteName} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:type" content={type} />
            <meta property="og:url" content={metaUrl} />
            <meta property="og:image" content={metaImage} />
            <meta property="og:image:alt" content={metaImageAlt} />
            <meta property="og:locale" content={locale} />
            {facebookAppId && <meta property="fb:app_id" content={facebookAppId} />}

            {/* Twitter Card */}
            <meta name="twitter:card" content={twitterCard} />
            <meta name="twitter:title" content={title || siteName} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={metaImage} />
            <meta name="twitter:image:alt" content={metaImageAlt} />
            {twitterHandle && <meta name="twitter:site" content={twitterHandle} />}
            {twitterCreator && <meta name="twitter:creator" content={twitterCreator} />}

            {/* Article/Blog specific */}
            {type === 'article' && (
                <>
                    {publishedTime && <meta property="article:published_time" content={publishedTime} />}
                    {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
                    {author && <meta property="article:author" content={author} />}
                </>
            )}

            {/* Hreflang for internationalization */}
            {hreflang.map(({ lang, url }) => (
                <link key={lang} rel="alternate" hrefLang={lang} href={url} />
            ))}

            {/* Structured Data (JSON-LD) */}
            {structuredData && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(structuredData)
                    }}
                />
            )}

            {/* Verification Meta Tags */}
            {seo?.verification?.google && (
                <meta name="google-site-verification" content={seo.verification.google} />
            )}
            {seo?.verification?.bing && (
                <meta name="msvalidate.01" content={seo.verification.bing} />
            )}
            {seo?.verification?.yandex && (
                <meta name="yandex-verification" content={seo.verification.yandex} />
            )}
            {seo?.verification?.pinterest && (
                <meta name="p:domain_verify" content={seo.verification.pinterest} />
            )}

            {/* Analytics */}
            {seo?.analytics?.google_analytics_id && (
                <>
                    <script async src={`https://www.googletagmanager.com/gtag/js?id=${seo.analytics.google_analytics_id}`} />
                    <script
                        dangerouslySetInnerHTML={{
                            __html: `
                                window.dataLayer = window.dataLayer || [];
                                function gtag(){dataLayer.push(arguments);}
                                gtag('js', new Date());
                                gtag('config', '${seo.analytics.google_analytics_id}');
                            `
                        }}
                    />
                </>
            )}

            {seo?.analytics?.google_tag_manager_id && (
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                            })(window,document,'script','dataLayer','${seo.analytics.google_tag_manager_id}');
                        `
                    }}
                />
            )}
        </Head>
    );
};
