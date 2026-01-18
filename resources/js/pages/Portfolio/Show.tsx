import AnimatedSection from '@/components/AnimatedSection';
import MainLayout from '@/layouts/MainLayout';
import { PortfolioItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import React from 'react';
import { ArrowLeft, Zap, ArrowUpRight } from 'lucide-react';
import { Carousel, Card } from '@/components/ui/apple-cards-carousel';

interface Props {
    portfolioItem: PortfolioItem;
}

export default function PortfolioShow({ portfolioItem }: Props) {
    const galleryCards = portfolioItem.gallery?.map((img, index) => (
        <Card
            key={index}
            card={{
                src: img,
                title: `Gallery Image ${index + 1}`,
                category: portfolioItem.title,
                content: (
                    <div className="flex justify-center items-center h-full">
                         <img src={img} alt={`Gallery view ${index + 1}`} className="max-h-[80vh] w-auto object-contain rounded-xl" />
                    </div>
                ),
            }}
            index={index}
            layout={true}
        />
    )) || [];

    return (
        <MainLayout title={`${portfolioItem.title} - Avant-Garde Portfolio`}>
            <Head title={portfolioItem.title}>
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "CreativeWork",
                        "name": portfolioItem.title,
                        "description": portfolioItem.description,
                        "image": portfolioItem.featured_image,
                        "dateCreated": portfolioItem.project_date,
                        "author": {
                            "@type": "Organization",
                            "name": "Avant-Garde Creative"
                        },
                        "copyrightHolder": {
                            "@type": "Organization",
                            "name": portfolioItem.client || "Avant-Garde Creative" 
                        },
                        "keywords": portfolioItem.technologies?.join(', ')
                    })}
                </script>
            </Head>

            {/* Immersive Hero Section - Service Style */}
            <section className="relative pt-32 pb-20 overflow-hidden bg-background">
                {/* Animated Grid Pattern */}
                <div className="absolute inset-0 opacity-[0.15]"
                    style={{
                        backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`,
                        backgroundSize: '40px 40px',
                        maskImage: 'radial-gradient(circle at center, black 60%, transparent 100%)',
                        color: 'var(--foreground)'
                    }}
                />
                
                {/* Floating Elements for depth */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse mix-blend-multiply dark:mix-blend-screen" />
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/20 rounded-full blur-[80px] animate-pulse delay-1000 mix-blend-multiply dark:mix-blend-screen" />

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-20 w-full text-center">
                    <Link href="/portfolio" className="inline-flex items-center gap-2 text-muted-foreground font-bold uppercase tracking-widest text-xs mb-8 hover:text-primary hover:gap-4 transition-all">
                        <ArrowLeft className="h-4 w-4" /> Back to Works
                    </Link>

                    <AnimatedSection animation="slide-up">
                        {/* Tags */}
                        <div className="flex flex-wrap justify-center gap-3 mb-8">
                            {portfolioItem.technologies?.map((tech, i) => (
                                <span key={tech} className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-colors ${i === 0 ? 'bg-agency-accent text-agency-primary border-agency-accent' : 'border-agency-primary/20 dark:border-white/20 text-agency-primary/60 dark:text-white/60'}`}>
                                    {tech}
                                </span>
                            ))}
                        </div>

                        {/* Title - Reduced Size */}
                        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] text-agency-primary dark:text-white mb-8">
                             {portfolioItem.title}
                        </h1>
                        
                        {/* Project Meta Grid - Centered & Compact */}
                        <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 pt-4 text-left md:text-center">
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-agency-primary/40 dark:text-white/40 block">Client</span>
                                <p className="text-lg font-medium text-agency-primary dark:text-white">
                                    {portfolioItem.client || 'Internal Project'}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-agency-primary/40 dark:text-white/40 block">Timeline</span>
                                <p className="text-lg font-medium text-agency-primary dark:text-white">
                                    {portfolioItem.project_date ? new Date(portfolioItem.project_date).getFullYear() : '2025'}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-agency-primary/40 dark:text-white/40 block">Impact</span>
                                <p className="text-lg font-medium text-agency-primary dark:text-white flex items-center gap-2 justify-center">
                                    High Conversion
                                </p>
                            </div>
                             <div className="flex items-end">
                                {portfolioItem.project_url && (
                                    <a 
                                        href={portfolioItem.project_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="group inline-flex items-center gap-2 text-agency-accent font-black uppercase tracking-widest text-sm hover:underline"
                                    >
                                        Visit Site <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </AnimatedSection>
                </div>
            </section>

             {/* Featured Image - Overlapping */}
             {portfolioItem.featured_image && (
                <section className="bg-transparent relative z-30 mb-[-100px] pointer-events-none">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <AnimatedSection animation="scale" className="aspect-[21/9] rounded-[40px] overflow-hidden shadow-2xl border-8 border-white dark:border-[#1a1a1a]">
                            <img 
                                src={portfolioItem.featured_image} 
                                alt={portfolioItem.title} 
                                className="w-full h-full object-cover grayscale-[0.2]"
                            />
                        </AnimatedSection>
                    </div>
                </section>
            )}

            {/* Content Section - Compact Spacing */}
            <section className="bg-white dark:bg-[#0a0a0a] pt-40 pb-20 relative z-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                        {/* Sticky Brief Sidebar */}
                        <aside className="lg:col-span-4">
                            <div className="sticky top-32 space-y-8">
                                <div className="p-8 rounded-[30px] bg-agency-secondary dark:bg-white/5 border border-agency-primary/5 dark:border-white/5 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Zap className="w-20 h-20 text-agency-accent rotate-12" />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-agency-primary/40 dark:text-white/40 mb-4 block">The Brief</span>
                                    <p className="text-lg font-medium text-agency-primary/90 dark:text-white/90 leading-relaxed">
                                        "{portfolioItem.description}"
                                    </p>
                                </div>
                            </div>
                        </aside>

                        {/* Main Narrative - Compact */}
                        <main className="lg:col-span-8 space-y-20">
                            {/* Vision */}
                            {portfolioItem.content?.overview && (
                                <AnimatedSection className="space-y-6">
                                    <span className="text-agency-accent font-bold uppercase tracking-[0.4em] text-xs pl-1">Overview</span>
                                    <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-agency-primary dark:text-white">
                                        The Vision.
                                    </h2>
                                    <div className="prose prose-xl prose-agency dark:prose-invert max-w-none text-agency-primary/60 dark:text-white/60 font-light leading-relaxed">
                                        {portfolioItem.content.overview}
                                    </div>
                                </AnimatedSection>
                            )}

                            {/* Challenge / Solution Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {portfolioItem.content?.challenge && (
                                    <AnimatedSection delay={100} className="p-8 rounded-[30px] bg-agency-secondary dark:bg-white/5 border border-agency-primary/5 dark:border-white/5 group">
                                        <span className="text-red-500 font-bold uppercase tracking-[0.3em] text-[10px] mb-4 block">The Challenge</span>
                                        <p className="text-base text-agency-primary/70 dark:text-white/70 leading-relaxed">
                                            {portfolioItem.content.challenge}
                                        </p>
                                    </AnimatedSection>
                                )}
                                {portfolioItem.content?.solution && (
                                    <AnimatedSection delay={200} className="p-8 rounded-[30px] bg-agency-secondary dark:bg-white/5 border border-agency-primary/5 dark:border-white/5 group">
                                        <span className="text-agency-accent font-bold uppercase tracking-[0.3em] text-[10px] mb-4 block">Our Solution</span>
                                        <p className="text-base text-agency-primary/70 dark:text-white/70 leading-relaxed">
                                            {portfolioItem.content.solution}
                                        </p>
                                    </AnimatedSection>
                                )}
                            </div>

                            {/* Gallery Carousel */}
                            {portfolioItem.gallery && portfolioItem.gallery.length > 0 && (
                                <div className="space-y-8">
                                     <span className="text-agency-accent font-bold uppercase tracking-[0.4em] text-xs pl-1">Gallery Showcase</span>
                                     <div className="-mx-4 md:-mx-0">
                                        <Carousel items={galleryCards} />
                                     </div>
                                </div>
                            )}

                            {/* Results Card - Fixed Dark Mode */}
                            {portfolioItem.content?.results && (
                                <AnimatedSection className="relative p-10 md:p-12 rounded-[30px] bg-neutral-900 border border-white/10 text-white overflow-hidden">
                                     <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-br from-agency-accent/20 to-transparent opacity-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                                     
                                     <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                                        <div className="max-w-md">
                                            <span className="text-agency-accent font-bold uppercase tracking-[0.4em] text-xs mb-4 block">Project Outcomes</span>
                                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 leading-[0.9] text-white">
                                                Measured <br/>
                                                <span className="opacity-40 italic">Success.</span>
                                            </h2>
                                            <div className="text-lg font-medium opacity-80 leading-relaxed text-white/80">
                                                {portfolioItem.content.results}
                                            </div>
                                        </div>
                                        
                                        {/* Dynamic Stats Visualization (Static Mock for layout) */}
                                        <div className="flex flex-col gap-6">
                                            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 min-w-[200px]">
                                                <div className="text-4xl font-black text-agency-accent mb-1">+85%</div>
                                                <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">Mobile Traffic</div>
                                            </div>
                                            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 min-w-[200px]">
                                                <div className="text-4xl font-black text-white mb-1">-25%</div>
                                                <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">Bounce Rate</div>
                                            </div>
                                        </div>
                                     </div>
                                </AnimatedSection>
                            )}
                        </main>
                    </div>
                </div>
            </section>

            {/* Footer CTA - Compact */}
            <section className="bg-agency-secondary dark:bg-[#050505] py-24 border-t border-agency-primary/5 dark:border-white/5">
                <div className="mx-auto max-w-4xl px-4 text-center">
                    <span className="text-agency-accent font-bold uppercase tracking-[0.4em] text-xs mb-6 block">Ready for your project?</span>
                    <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-agency-primary dark:text-white mb-8">
                        Let's Create <br/>
                        <span className="italic opacity-30">The Future.</span>
                    </h2>
                    <Link
                        href="/contact"
                        className="inline-flex h-16 px-10 items-center justify-center rounded-full bg-agency-accent text-agency-primary text-lg font-black uppercase tracking-tighter hover:scale-105 transition-all shadow-lg"
                    >
                        START A CONVERSATION
                    </Link>
                </div>
            </section>
        </MainLayout>
    );
}
