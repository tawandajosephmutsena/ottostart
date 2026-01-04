import React from 'react';
import DOMPurify from 'dompurify';
import AnimatedSection from '@/components/AnimatedSection';
import CinematicHero from './CinematicHero';
import VideoPlayer from '@/components/ui/video-player';
import { PageBlock } from '@/types/page-blocks';

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

interface BlockRendererProps {
    blocks: PageBlock[];
    featuredServices?: any[];
    featuredProjects?: any[];
    recentInsights?: any[];
}

const VideoBlock = ({ content }: { content: any }) => {
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

const TextBlock = ({ content }: { content: any }) => {
    const { body, title } = content;
    
    // Sanitize HTML content to prevent XSS attacks
    const sanitizedHTML = DOMPurify.sanitize(body || '', {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre'],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
    });

    return (
        <section className="py-20 px-4">
            <div className="max-w-4xl mx-auto prose dark:prose-invert">
                {title && <h2>{title}</h2>}
                <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />
            </div>
        </section>
    );
};

const ImageBlock = ({ content }: { content: any }) => {
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

const FeaturesBlock = ({ content }: { content: any }) => {
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
                    {(items || []).map((item: any, i: number) => (
                        <AnimatedSection key={i} animation="fade-up" delay={i * 100} className="rounded-2xl border bg-card p-8 shadow-sm">
                            <h3 className="mb-4 text-xl font-bold">{item.title}</h3>
                            <p className="text-muted-foreground">{item.desc}</p>
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
                    case 'hero':
                        return (
                            <HeroSection
                                key={block.id}
                                title={block.content.title}
                                subtitle={block.content.subtitle}
                                description={block.content.description}
                                ctaText={block.content.ctaText}
                                ctaHref={block.content.ctaHref}
                                marqueeText={block.content.marqueeText}
                                backgroundImages={block.content.backgroundImages}
                            />
                        );
                    case 'text':
                        return <TextBlock key={block.id} content={block.content} />;
                    case 'image':
                        return <ImageBlock key={block.id} content={block.content} />;
                    case 'features':
                        return <FeaturesBlock key={block.id} content={block.content} />;
                    case 'stats':
                        return <StatsSection key={block.id} stats={block.content.items} />;
                    case 'services':
                        return <ServicesSection key={block.id} title={block.content.title} services={featuredServices?.slice(0, block.content.limit || 3)} useStackedCards={block.content.useStackedCards} />;
                    case 'portfolio':
                        return <FeaturedProjects key={block.id} title={block.content.title} projects={featuredProjects?.slice(0, block.content.limit || 3)} />;
                    case 'insights':
                        return <RecentInsights key={block.id} title={block.content.title} insights={recentInsights?.slice(0, block.content.limit || 3)} />;
                    case 'cta':
                        return (
                            <CtaBlock 
                                key={block.id}
                                title={block.content.title}
                                subtitle={block.content.subtitle}
                                ctaText={block.content.ctaText}
                                ctaHref={block.content.ctaHref}
                                email={block.content.email}
                            />
                        );
                    case 'cinematic_hero':
                        return <CinematicHero key={block.id} slides={block.content.slides || []} />;
                    case 'video':
                        return <VideoBlock key={block.id} content={block.content} />;
                    case 'form':
                        return (
                            <FormSection 
                                key={block.id}
                                title={block.content.title}
                                description={block.content.description}
                                steps={(block.content.steps || []).map((step: any) => ({
                                    ...step,
                                    id: step.id || Math.random().toString(36).substr(2, 9),
                                    title: step.title || '',
                                    fields: step.fields || [],
                                }))}
                                submitText={block.content.submitText}
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
                    default:
                        return null;
                }
            })}
        </div>
    );
}
