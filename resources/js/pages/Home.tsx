import FeaturedProjects from '@/components/FeaturedProjects';
import HeroSection from '@/components/HeroSection';
import RecentInsights from '@/components/RecentInsights';
import ServicesSection from '@/components/ServicesSection';
import StatsSection from '@/components/StatsSection';
import { StructuredData } from '@/components/StructuredData';
import MainLayout from '@/layouts/MainLayout';
import { Link, usePage } from '@inertiajs/react';
import FormSection from '@/components/FormSection';
import CinematicHero from '@/components/Blocks/CinematicHero';
import { SeoHead } from '@/components/SeoHead';
import { SharedData } from '@/types';
import { HomePageProps } from '@/types/page-props';
import { PageBlock } from '@/types/page-blocks';
import DOMPurify from 'dompurify';

export default function Home() {
    // Get page props with typed data
    const { 
        page, 
        featuredProjects = [], 
        featuredServices = [], 
        recentInsights = [], 
        stats: defaultStats, 
        structuredData 
    } = usePage<SharedData & HomePageProps>().props;

    const blocks = page?.content?.blocks || [];

    // Fallback if no blocks defined
    if (blocks.length === 0) {
        return (
            <MainLayout>
                <SeoHead 
                    title={page?.meta_title || "Digital Innovation Agency"}
                    description={page?.meta_description || "Avant-Garde CMS creates avant-garde digital experiences."}
                    type="website"
                    structuredData={structuredData}
                />
                <HeroSection
                    title="Digital Innovation Redefined"
                    subtitle="Avant-Garde Agency"
                    description="We create avant-garde digital experiences that push boundaries and inspire innovation through cutting-edge design and technology."
                    ctaText="View Our Work"
                    ctaHref="/portfolio"
                />
                <StatsSection stats={defaultStats} />
                <ServicesSection services={featuredServices} />
                <FeaturedProjects projects={featuredProjects} />
                <RecentInsights insights={recentInsights} />
                <section className="bg-white dark:bg-[#0a0a0a] py-40 relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-agency-primary/10 to-transparent"></div>
                    <div className="mx-auto max-w-7xl px-4 flex flex-col items-center text-center relative z-10">
                        <span className="text-agency-accent font-bold uppercase tracking-[0.4em] text-xs mb-8 block">Project Inquiry</span>
                        <h2 className="text-6xl md:text-9xl font-black uppercase tracking-tighter text-agency-primary dark:text-white leading-[0.8] mb-12">
                            Let's build <br/>
                            <span className="italic opacity-30">the future.</span>
                        </h2>
                        <div className="flex flex-col sm:flex-row items-center gap-8">
                            <Link href="/contact" className="group relative inline-flex items-center justify-center size-48 md:size-64 rounded-full bg-agency-accent text-agency-primary font-black text-xl tracking-tighter hover:scale-105 transition-all shadow-2xl shadow-agency-accent/30">
                                <span className="relative z-10">START NOW</span>
                            </Link>
                            <div className="text-left">
                                <p className="text-agency-primary/60 dark:text-white/60 mb-2 font-mono uppercase tracking-widest text-xs">Email us at</p>
                                <a href="mailto:hello@avant-garde.com" className="text-2xl md:text-3xl font-bold dark:text-white hover:text-agency-accent transition-colors">hello@avant-garde.com</a>
                            </div>
                        </div>
                    </div>
                </section>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <SeoHead 
                title={page.meta_title ?? undefined}
                description={page.meta_description ?? undefined}
                type="website"
                structuredData={structuredData}
            />
            
            {structuredData && <StructuredData data={structuredData} />}

            {blocks.map((block: PageBlock) => {
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
                            <section key={block.id} className="bg-white dark:bg-[#0a0a0a] py-40 relative overflow-hidden border-t">
                                <div className="mx-auto max-w-7xl px-4 flex flex-col items-center text-center relative z-10">
                                    <span className="text-agency-accent font-bold uppercase tracking-[0.4em] text-xs mb-8 block">{block.content.subtitle}</span>
                                    <h2 className="text-6xl md:text-9xl font-black uppercase tracking-tighter text-agency-primary dark:text-white leading-[0.8] mb-12">
                                        {block.content.title}
                                    </h2>
                                    <div className="flex flex-col sm:flex-row items-center gap-8">
                                        <Link href={block.content.ctaHref} className="group relative inline-flex items-center justify-center size-48 md:size-64 rounded-full bg-agency-accent text-agency-primary font-black text-xl tracking-tighter hover:scale-105 transition-all shadow-2xl shadow-agency-accent/30">
                                            <span className="relative z-10">{block.content.ctaText}</span>
                                        </Link>
                                        <div className="text-left">
                                            <p className="text-agency-primary/60 dark:text-white/60 mb-2 font-mono uppercase tracking-widest text-xs">Email us at</p>
                                            <a href={`mailto:${block.content.email}`} className="text-2xl md:text-3xl font-bold dark:text-white hover:text-agency-accent transition-colors">{block.content.email}</a>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        );
                    case 'text': {
                        // Sanitize HTML content to prevent XSS attacks
                        const sanitizedHTML = DOMPurify.sanitize(block.content.body, {
                            ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre'],
                            ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
                        });
                        
                        return (
                            <section key={block.id} className="py-20 px-4">
                                <div className="max-w-4xl mx-auto prose dark:prose-invert">
                                    {block.content.title && <h2>{block.content.title}</h2>}
                                    <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />
                                </div>
                            </section>
                        );
                    }
                    case 'image':
                        return (
                            <section key={block.id} className="py-20 px-4">
                                <div className="max-w-6xl mx-auto">
                                    <img src={block.content.url} alt={block.content.alt} className="w-full rounded-2xl" />
                                    {block.content.caption && <p className="text-center mt-4 text-muted-foreground">{block.content.caption}</p>}
                                </div>
                            </section>
                        );
                    case 'cinematic_hero':
                        return <CinematicHero key={block.id} slides={block.content.slides || []} />;
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
                    default:
                        return null;
                }
            })}
        </MainLayout>
    );
}
