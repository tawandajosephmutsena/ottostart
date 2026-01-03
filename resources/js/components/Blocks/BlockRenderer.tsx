import React from 'react';
import ReactMarkdown from 'react-markdown';
import AnimatedSection from '@/components/AnimatedSection';
import CinematicHero from './CinematicHero';
import VideoPlayer from '@/components/ui/video-player';

export type BlockType = 'hero' | 'text' | 'image' | 'features' | 'cinematic_hero' | 'video';

export interface Block {
    id: string;
    type: BlockType;
    content: Record<string, unknown>;
}

const VideoBlock = ({ content }: { content: Record<string, unknown> }) => {
    const { url } = content as { url?: string };
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

const HeroBlock = ({ content }: { content: Record<string, unknown> }) => {
    const { image, subtitle, title } = content as { image?: string; subtitle?: string; title?: string };
    return (
        <section className="relative overflow-hidden bg-agency-secondary dark:bg-agency-dark py-40">
            {image && (
                <div className="absolute inset-0 z-0">
                    <img 
                        src={image} 
                        alt="Hero" 
                        className="h-full w-full object-cover opacity-20" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-agency-secondary to-transparent" />
                </div>
            )}
            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <AnimatedSection animation="fade-up">
                    {subtitle && (
                        <span className="mb-8 block text-xs font-bold uppercase tracking-[0.4em] text-agency-accent">
                            {subtitle}
                        </span>
                    )}
                    <h1 className="mb-6 text-6xl font-black uppercase tracking-tighter text-agency-primary dark:text-white md:text-8xl">
                        {title}
                    </h1>
                </AnimatedSection>
            </div>
        </section>
    );
};

const TextBlock = ({ content }: { content: Record<string, unknown> }) => {
    const { body } = content as { body?: string };
    return (
        <section className="py-20 bg-background">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                <AnimatedSection animation="fade">
                    <div className="prose prose-lg dark:prose-invert">
                        <ReactMarkdown>{body || ''}</ReactMarkdown>
                    </div>
                </AnimatedSection>
            </div>
        </section>
    );
};

const ImageBlock = ({ content }: { content: Record<string, unknown> }) => {
    const { url, alt, caption } = content as { url?: string; alt?: string; caption?: string };
    return (
        <section className="py-20 bg-background">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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

const FeaturesBlock = ({ content }: { content: Record<string, unknown> }) => {
    const { title, items } = content as { title?: string; items?: Array<{ title: string; desc: string }> };
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
                    {(items || []).map((item, i: number) => (
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

export default function BlockRenderer({ blocks }: { blocks: Block[] }) {
    if (!blocks || blocks.length === 0) return null;

    return (
        <div className="flex flex-col">
            {blocks.map((block) => {
                switch (block.type) {
                    case 'hero':
                        return <HeroBlock key={block.id} content={block.content} />;
                    case 'text':
                        return <TextBlock key={block.id} content={block.content} />;
                    case 'image':
                        return <ImageBlock key={block.id} content={block.content} />;
                    case 'features':
                        return <FeaturesBlock key={block.id} content={block.content} />;
                    case 'cinematic_hero':
                        return <CinematicHero key={block.id} slides={(block.content.slides as any) || []} />;
                    case 'video':
                        return <VideoBlock key={block.id} content={block.content} />;
                    default:
                        return null;
                }
            })}
        </div>
    );
}
