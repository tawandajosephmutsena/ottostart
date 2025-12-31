import AnimatedSection from '@/components/AnimatedSection';
import MainLayout from '@/layouts/MainLayout';
import { PortfolioItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import React from 'react';
import { ArrowLeft, ExternalLink, Calendar, User, Zap } from 'lucide-react';

interface Props {
    portfolioItem: PortfolioItem;
}

export default function PortfolioShow({ portfolioItem }: Props) {
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

            {/* Back Button */}
            <div className="fixed top-32 left-8 z-50 hidden xl:block">
                <Link 
                    href="/portfolio" 
                    className="group flex flex-col items-center gap-4 text-agency-primary/40 dark:text-white/40 hover:text-agency-accent transition-colors"
                >
                    <div className="size-12 rounded-full border border-current flex items-center justify-center group-hover:bg-agency-accent group-hover:border-transparent group-hover:text-agency-primary transition-all">
                        <ArrowLeft className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] [writing-mode:vertical-rl] rotate-180">Back to Works</span>
                </Link>
            </div>

            {/* Project Hero */}
            <section className="relative min-h-[90vh] flex flex-col justify-end pt-40 pb-20 bg-agency-primary overflow-hidden">
                {/* Immersive Background Image */}
                <div className="absolute inset-0 z-0">
                    {portfolioItem.featured_image ? (
                        <>
                            <img 
                                src={portfolioItem.featured_image} 
                                alt={portfolioItem.title} 
                                className="w-full h-full object-cover opacity-40 scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-agency-primary via-agency-primary/60 to-transparent"></div>
                        </>
                    ) : (
                        <div className="w-full h-full bg-agency-accent/5"></div>
                    )}
                </div>

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                    <AnimatedSection animation="slide-up">
                        <div className="flex flex-wrap gap-4 mb-8">
                            {portfolioItem.technologies?.map(tech => (
                                <span key={tech} className="px-4 py-1.5 rounded-full border border-agency-accent/30 bg-agency-accent/10 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest text-agency-accent">
                                    {tech}
                                </span>
                            ))}
                        </div>
                        <h1 className="text-6xl md:text-[10vw] font-black uppercase tracking-tighter leading-[0.85] text-white mb-12">
                            {portfolioItem.title.split(' ')[0]} <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-agency-accent to-agency-accent/50 italic">
                                {portfolioItem.title.split(' ').slice(1).join(' ')}
                            </span>
                        </h1>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/10 pt-12">
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Client</span>
                                <p className="text-lg text-white flex items-center gap-2">
                                    <User className="h-4 w-4 text-agency-accent" />
                                    {portfolioItem.client || 'Internal Project'}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Date</span>
                                <p className="text-lg text-white flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-agency-accent" />
                                    {portfolioItem.project_date ? new Date(portfolioItem.project_date).toLocaleDateString() : 'Active Development'}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Impact</span>
                                <p className="text-lg text-white flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-agency-accent" />
                                    High Conversion
                                </p>
                            </div>
                            <div className="flex items-end">
                                {portfolioItem.project_url && (
                                    <a 
                                        href={portfolioItem.project_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-3 text-agency-accent font-bold uppercase tracking-widest text-sm hover:underline"
                                    >
                                        Visit Live Site <ExternalLink className="h-4 w-4" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            {/* Case Study Content */}
            <section className="bg-white dark:bg-agency-dark py-32 border-b border-agency-primary/5">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                        {/* Sidebar */}
                        <aside className="lg:col-span-4 space-y-12">
                            <div className="sticky top-40">
                                <div className="p-8 rounded-[30px] bg-agency-secondary dark:bg-white/5 border border-agency-primary/5 dark:border-white/5">
                                    <h3 className="text-2xl font-black uppercase tracking-tighter mb-6">Brief</h3>
                                    <p className="text-agency-primary/70 dark:text-white/70 leading-relaxed italic">
                                        "{portfolioItem.description}"
                                    </p>
                                </div>
                            </div>
                        </aside>

                        {/* Main Content */}
                        <main className="lg:col-span-8 space-y-24">
                            {/* Overview */}
                            {portfolioItem.content?.overview && (
                                <div className="space-y-6">
                                    <span className="text-agency-accent font-bold uppercase tracking-[0.4em] text-xs">Overview</span>
                                    <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">The Vision.</h2>
                                    <div className="prose prose-xl dark:prose-invert max-w-none text-agency-primary/70 dark:text-white/70 leading-relaxed">
                                        {portfolioItem.content.overview}
                                    </div>
                                </div>
                            )}

                            {/* Challenge & Solution Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                {portfolioItem.content?.challenge && (
                                    <div className="p-10 rounded-[40px] bg-red-500/5 border border-red-500/10">
                                        <span className="text-red-500 font-bold uppercase tracking-[0.4em] text-[10px] mb-4 block">The Challenge</span>
                                        <p className="text-agency-primary/80 dark:text-white/80 leading-relaxed font-medium">
                                            {portfolioItem.content.challenge}
                                        </p>
                                    </div>
                                )}
                                {portfolioItem.content?.solution && (
                                    <div className="p-10 rounded-[40px] bg-agency-accent/5 border border-agency-accent/10">
                                        <span className="text-agency-accent font-bold uppercase tracking-[0.4em] text-[10px] mb-4 block">Our Solution</span>
                                        <p className="text-agency-primary/80 dark:text-white/80 leading-relaxed font-medium">
                                            {portfolioItem.content.solution}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Gallery Showcase */}
                            {portfolioItem.gallery && portfolioItem.gallery.length > 0 && (
                                <div className="space-y-12">
                                    <span className="text-agency-accent font-bold uppercase tracking-[0.4em] text-xs">Gallery Showcase</span>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {portfolioItem.gallery.map((img, i) => (
                                            <div key={i} className={`rounded-[40px] overflow-hidden bg-agency-secondary dark:bg-white/5 ${i % 3 === 0 ? 'md:col-span-2' : ''}`}>
                                                <img 
                                                    src={img} 
                                                    alt={`${portfolioItem.title} screenshot ${i + 1}`} 
                                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Results */}
                            {portfolioItem.content?.results && (
                                <div className="p-12 md:p-20 rounded-[60px] bg-agency-primary text-white text-center relative overflow-hidden">
                                     <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-agency-accent/20 to-transparent opacity-50"></div>
                                     <span className="relative z-10 text-agency-accent font-bold uppercase tracking-[0.4em] text-xs mb-8 block">Project Outcomes</span>
                                     <h2 className="relative z-10 text-4xl md:text-7xl font-black uppercase tracking-tighter mb-10 leading-none">Measured <br/> <span className="italic opacity-40">Success.</span></h2>
                                     <div className="relative z-10 text-xl md:text-2xl text-white/70 font-light leading-relaxed max-w-2xl mx-auto">
                                        {portfolioItem.content.results}
                                     </div>
                                </div>
                            )}
                        </main>
                    </div>
                </div>
            </section>

            {/* Next Project / Footer CTA */}
            <section className="bg-agency-secondary dark:bg-[#0a0a0a] py-40 text-center">
                <div className="mx-auto max-w-4xl px-4">
                    <span className="text-agency-accent font-bold uppercase tracking-[0.4em] text-xs mb-8 block">Ready for your project?</span>
                    <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-12">
                        Let's Create <br/>
                        <span className="italic opacity-30">The Future.</span>
                    </h2>
                    <Link
                        href="/contact"
                        className="inline-flex h-20 px-12 items-center justify-center rounded-full bg-agency-accent text-agency-primary text-xl font-black uppercase tracking-tighter hover:scale-105 transition-all shadow-2xl"
                    >
                        START A CONVERSATION
                    </Link>
                </div>
            </section>
        </MainLayout>
    );
}
