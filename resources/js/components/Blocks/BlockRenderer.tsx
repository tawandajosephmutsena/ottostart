import React from 'react';
import DOMPurify from 'dompurify';
import AnimatedSection from '@/components/AnimatedSection';
import CinematicHero from './CinematicHero';
import VideoPlayer from '@/components/ui/video-player';
import { PageBlock, VideoBlock as VideoBlockType, TextBlock as TextBlockType, ImageBlock as ImageBlockType, FeaturesBlock as FeaturesBlockType } from '@/types/page-blocks';
import { cn } from '@/lib/utils';

import AnimatedShaderHero from '@/components/ui/animated-shader-hero';

// Import all block components
import HeroSection from '@/components/HeroSection';
import StatsSection from '@/components/StatsSection';
import ServicesSection from '@/components/ServicesSection';
import FeaturedProjects from '@/components/FeaturedProjects';
import RecentInsights from '@/components/RecentInsights';
import FormSection from '@/components/FormSection';
import StoryBlock from './StoryBlock';
import ManifestoBlock from './ManifestoBlock';
import ProcessBlock from './ProcessBlock';
import ContactInfoBlock from './ContactInfoBlock';
import FAQBlock from './FAQBlock';
import CtaBlock from './CtaBlock';
import TestimonialBlock from './TestimonialBlock';
import LogoCloudBlock from './LogoCloudBlock';
import AppleCardsCarouselBlock from './AppleCardsCarouselBlock';
import CoverDemoBlock from './CoverDemoBlock';
import VideoBackgroundHero from './VideoBackgroundHero';

// Type definitions for external data
interface ServiceItem {
    id: number;
    title: string;
    slug: string;
    description: string;
    icon?: string | null;
    featured_image?: string | null;
    price_range?: string | null;
}

interface ProjectItem {
    id: number;
    title: string;
    slug: string;
    description: string;
    featured_image?: string | null;
    client?: string | null;
    technologies?: string[] | null;
}

interface InsightItem {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    featured_image?: string | null;
    author?: { name: string; avatar?: string | null };
    category?: { name: string; slug: string };
    published_at: string | null;
    reading_time?: number | null;
}

// Column content type for text blocks
interface ColumnContent {
    body?: string;
    textSize?: string;
    textAlign?: string;
    url?: string;
    alt?: string;
    caption?: string;
    text?: string;
    style?: string;
}

interface BlockRendererProps {
    blocks: PageBlock[];
    featuredServices?: ServiceItem[];
    featuredProjects?: ProjectItem[];
    recentInsights?: InsightItem[];
}

const VideoBlock = ({ content }: { content: VideoBlockType['content'] }) => {
    const { url } = content;
    if (!url) return null;
    return (
        <section className="py-20 bg-background overflow-hidden px-4 md:px-8">
            <div className="mx-auto max-w-7xl">
                <AnimatedSection animation="fade-up">
                    <VideoPlayer src={url} />
                </AnimatedSection>
            </div>
        </section>
    );
};

// Helper functions for TextBlock
const getGridClass = (layout: string): string => {
    switch (layout) {
        case '1':     return 'grid grid-cols-1 gap-8';
        case '1-1':   return 'grid grid-cols-1 md:grid-cols-2 gap-8';
        case '1-1-1': return 'grid grid-cols-1 md:grid-cols-3 gap-8';
        case '2-1':   return 'grid grid-cols-1 md:grid-cols-3 gap-8 [&>*:first-child]:md:col-span-2';
        case '1-2':   return 'grid grid-cols-1 md:grid-cols-3 gap-8 [&>*:last-child]:md:col-span-2';
        default:      return 'grid grid-cols-1 gap-8';
    }
};

const getTextSizeClass = (size: string): string => {
    switch (size) {
        case 'sm':   return 'prose-sm';
        case 'base': return 'prose-base';
        case 'lg':   return 'prose-lg';
        case 'xl':   return 'prose-xl';
        case '2xl':  return 'prose-2xl';
        default:     return 'prose-base';
    }
};

const getTextAlignClass = (align: string): string => {
    switch (align) {
        case 'left':   return 'text-left';
        case 'center': return 'text-center';
        case 'right':  return 'text-right';
        default:       return 'text-left';
    }
};

// Column content renderer for TextBlock
const ColumnRenderer = ({ column }: { column: NonNullable<TextBlockType['content']['columns']>[number] }) => {
    const { type, content: rawContent } = column;
    // Cast to ColumnContent for proper type access
    const content = rawContent as ColumnContent;

    switch (type) {
        case 'text': {
            const body = (content?.body as string) || '';
            const sanitizedHTML = DOMPurify.sanitize(body, {
                ALLOWED_TAGS: [
                    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del',
                    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                    'ul', 'ol', 'li',
                    'a', 'blockquote', 'code', 'pre',
                    'mark', 'span', 'div',
                    'img', 'figure', 'figcaption',
                    'table', 'thead', 'tbody', 'tr', 'th', 'td',
                    'hr'
                ],
                ALLOWED_ATTR: [
                    'href', 'target', 'rel', 'class', 'style',
                    'src', 'alt', 'title', 'width', 'height',
                    'data-*', 'id'
                ],
                ALLOW_DATA_ATTR: true
            });
            const sizeClass = getTextSizeClass(content?.textSize || 'base');
            const alignClass = getTextAlignClass(content?.textAlign || 'left');
            return (
                <div className={cn('prose dark:prose-invert max-w-none', sizeClass, alignClass)}>
                    <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />
                </div>
            );
        }
        case 'image': {
            const url = content?.url as string;
            if (!url) return null;
            return (
                <figure className="relative">
                    <img 
                        src={url} 
                        alt={(content?.alt as string) || 'Image'} 
                        className="w-full rounded-2xl shadow-lg object-cover" 
                    />
                    {content?.caption && (
                        <figcaption className="mt-3 text-center text-sm text-muted-foreground">
                            {content.caption as string}
                        </figcaption>
                    )}
                </figure>
            );
        }
        case 'video': {
            const url = content?.url as string;
            if (!url) return null;
            return <VideoPlayer src={url} />;
        }
        case 'button': {
            const text = content?.text as string;
            if (!text) return null;
            const getButtonClasses = (style: string) => {
                const baseClasses = "inline-flex items-center justify-center rounded-lg px-6 py-3 font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
                switch (style) {
                    case 'primary':
                        return `${baseClasses} bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg`;
                    case 'secondary':
                        return `${baseClasses} bg-secondary text-secondary-foreground hover:bg-secondary/80`;
                    case 'outline':
                        return `${baseClasses} border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground`;
                    case 'ghost':
                        return `${baseClasses} text-primary hover:bg-primary/10 underline-offset-4 hover:underline`;
                    default:
                        return `${baseClasses} bg-primary text-primary-foreground hover:bg-primary/90`;
                }
            };
            return (
                <div className="flex items-center">
                    <a 
                        href={(content?.url as string) || '#'} 
                        className={getButtonClasses((content?.style as string) || 'primary')}
                    >
                        {text}
                    </a>
                </div>
            );
        }
        default:
            return null;
    }
};

const TextBlock = ({ content }: { content: TextBlockType['content'] }) => {
    const { title, layout, columns, body } = content;
    
    // Legacy support: if no columns exist, render old-style text block
    if (!columns || columns.length === 0) {
        const sanitizedHTML = DOMPurify.sanitize(body || '', {
            ALLOWED_TAGS: [
                'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del',
                'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                'ul', 'ol', 'li',
                'a', 'blockquote', 'code', 'pre',
                'mark', 'span', 'div',
                'img', 'figure', 'figcaption',
                'table', 'thead', 'tbody', 'tr', 'th', 'td',
                'hr'
            ],
            ALLOWED_ATTR: [
                'href', 'target', 'rel', 'class', 'style',
                'src', 'alt', 'title', 'width', 'height',
                'data-*', 'id'
            ],
            ALLOW_DATA_ATTR: true
        });

        return (
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto prose dark:prose-invert">
                    {title && <h2>{title}</h2>}
                    <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />
                </div>
            </section>
        );
    }

    // New multi-column layout
    const gridClass = getGridClass(layout || '1');
    
    return (
        <section className="py-20 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                {title && (
                    <AnimatedSection animation="fade-up" className="mb-12 text-center">
                        <h2 className="text-4xl font-black uppercase tracking-tight">{title}</h2>
                    </AnimatedSection>
                )}
                <div className={gridClass}>
                    {columns.map((col: unknown, idx: number) => (
                        <AnimatedSection key={(col as any).id || idx} animation="fade-up" delay={idx * 100}>
                            <ColumnRenderer column={col as any} />
                        </AnimatedSection>
                    ))}
                </div>
            </div>
        </section>
    );
};

const ImageBlock = ({ content }: { content: ImageBlockType['content'] }) => {
    const { url, alt, caption } = content;
    return (
        <section className="py-20 bg-background px-4">
            <div className="mx-auto max-w-7xl">
                <AnimatedSection animation="scale">
                    <figure className="relative">
                        <img 
                            src={url} 
                            alt={alt || 'Image'} 
                            className="w-full rounded-[40px] shadow-2xl" 
                        />
                        {caption && (
                            <figcaption className="mt-4 text-center text-sm text-muted-foreground">
                                {caption}
                            </figcaption>
                        )}
                    </figure>
                </AnimatedSection>
            </div>
        </section>
    );
};

const FeaturesBlock = ({ content }: { content: FeaturesBlockType['content'] }) => {
    const { title, items } = content;
    return (
        <section className="py-24 bg-muted/20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {title && (
                    <div className="mb-16 text-center">
                        <h2 className="text-4xl font-black uppercase tracking-tight md:text-6xl">
                            {title}
                        </h2>
                    </div>
                )}
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {(items || []).map((item: Record<string, unknown>, i: number) => (
                        <AnimatedSection key={i} animation="fade-up" delay={i * 100} className="rounded-2xl border bg-card p-8 shadow-sm">
                            <h3 className="mb-4 text-xl font-bold">{item.title as string}</h3>
                            <p className="text-muted-foreground">{item.desc as string}</p>
                        </AnimatedSection>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default function BlockRenderer({ 
    blocks, 
    featuredServices = [], 
    featuredProjects = [], 
    recentInsights = [] 
}: BlockRendererProps) {
    if (!blocks || blocks.length === 0) return null;

    return (
        <div className="flex flex-col">
            {blocks.map((block) => {
                if (block.is_enabled === false) return null;

                switch (block.type) {
                    case 'animated_shader_hero':
                        return (
                            <div key={block.id} className="relative z-0">
                                <AnimatedShaderHero
                                    trustBadge={block.content.trustBadge as any}
                                    headline={block.content.headline as any}
                                    subtitle={block.content.subtitle as string}
                                    buttons={{
                                        primary: { 
                                            text: (block.content.buttons as any)?.primary?.text || '', 
                                            onClick: () => window.location.href = (block.content.buttons as any)?.primary?.url || '#' 
                                        },
                                        secondary: { 
                                            text: (block.content.buttons as any)?.secondary?.text || '', 
                                            onClick: () => window.location.href = (block.content.buttons as any)?.secondary?.url || '#' 
                                        }
                                    }}
                                />
                            </div>
                        );
                    case 'hero':
                        return (
                            <HeroSection
                                key={block.id}
                                title={block.content.title as string}
                                subtitle={block.content.subtitle as string}
                                description={block.content.description as string}
                                ctaText={block.content.ctaText as string}
                                ctaHref={block.content.ctaHref as string}
                                marqueeText={block.content.marqueeText as string}
                                backgroundImages={block.content.backgroundImages as string[]}
                            />
                        );
                    case 'text':
                        return <TextBlock key={block.id} content={block.content as any} />;
                    case 'image':
                        return <ImageBlock key={block.id} content={block.content as any} />;
                    case 'features':
                        return <FeaturesBlock key={block.id} content={block.content as any} />;
                    case 'stats':
                        return <StatsSection key={block.id} stats={block.content.items as any} />;
                    case 'services':
                        return <ServicesSection key={block.id} title={block.content.title as string} services={featuredServices?.slice(0, Number(block.content.limit) || 3)} useStackedCards={block.content.useStackedCards as boolean} />;
                    case 'portfolio':
                        return <FeaturedProjects key={block.id} title={block.content.title as string} projects={featuredProjects?.slice(0, Number(block.content.limit) || 3)} />;
                    case 'insights':
                        return <RecentInsights key={block.id} title={block.content.title as string} insights={recentInsights?.slice(0, Number(block.content.limit) || 3)} />;
                    case 'cta':
                        return (
                            <CtaBlock 
                                key={block.id}
                                title={block.content.title as string}
                                subtitle={block.content.subtitle as string}
                                ctaText={block.content.ctaText as string}
                                ctaHref={block.content.ctaHref as string}
                                email={block.content.email as string}
                            />
                        );
                    case 'cinematic_hero':
                        return <CinematicHero key={block.id} slides={block.content.slides as any[] || []} />;
                    case 'video':
                        return <VideoBlock key={block.id} content={block.content as any} />;
                    case 'form':
                        return (
                            <FormSection 
                                key={block.id}
                                title={block.content.title as string}
                                description={block.content.description as string}
                                steps={(block.content.steps as any[] || []).map((step: any) => ({
                                    ...step,
                                    id: step.id || Math.random().toString(36).substr(2, 9),
                                    title: step.title || '',
                                    fields: step.fields || [],
                                }))}
                                submitText={block.content.submitText as string}
                            />
                        );
                    case 'story':
                        return <StoryBlock key={block.id} {...block.content} />;
                    case 'manifesto':
                        return <ManifestoBlock key={block.id} {...block.content} />;
                    case 'process':
                        return <ProcessBlock key={block.id} {...block.content} />;
                    case 'contact_info':
                        return <ContactInfoBlock key={block.id} {...block.content} />;
                    case 'faq':
                        return <FAQBlock key={block.id} {...block.content} />;
                    case 'testimonials':
                        return <TestimonialBlock key={block.id} {...block.content} />;
                    case 'logo_cloud':
                        return <LogoCloudBlock key={block.id} {...block.content} />;
                    case 'apple_cards_carousel':
                        return (
                            <AppleCardsCarouselBlock 
                                key={block.id} 
                                {...block.content} 
                                services={featuredServices}
                                portfolio={featuredProjects}
                                insights={recentInsights}
                            />
                        );
                    case 'cover_demo':
                        return <CoverDemoBlock key={block.id} {...block.content} />;
                    case 'video_background_hero':
                        return <VideoBackgroundHero key={block.id} {...block.content} />;
                    default:
                        return null;
                }
            })}
        </div>
    );
}
