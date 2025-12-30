import AnimatedSection from '@/components/AnimatedSection';
import MainLayout from '@/layouts/MainLayout';
import { Insight } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Clock, User, Facebook, Twitter, Linkedin, Share2 } from 'lucide-react';
import React from 'react';

interface Props {
    insight: Insight;
    relatedInsights?: Insight[];
}

export default function BlogShow({ insight, relatedInsights = [] }: Props) {
    return (
        <MainLayout title={`${insight.title} - Avant-Garde Insights`}>
            <Head title={insight.title} />

            {/* Reading Progress Bar (Fixed at top) */}
            <div className="fixed top-[80px] left-0 w-full h-1 z-50 bg-agency-accent/20">
                <div className="h-full bg-agency-accent w-0 transition-all duration-300 transition-all" id="reading-progress"></div>
            </div>

            {/* Article Hero */}
            <article className="bg-white dark:bg-agency-dark">
                <header className="pt-48 pb-20 border-b border-agency-primary/5 dark:border-white/5">
                    <div className="mx-auto max-w-4xl px-4 text-center">
                        <Link href="/blog" className="inline-flex items-center gap-2 text-agency-accent font-bold uppercase tracking-widest text-[10px] mb-12 hover:gap-4 transition-all">
                            <ArrowLeft className="h-3 w-3" /> Back to Insights
                        </Link>
                        
                        <AnimatedSection animation="slide-up">
                            <div className="flex items-center justify-center gap-4 mb-8">
                                <span className="px-4 py-1.5 rounded-full bg-agency-accent/10 text-agency-accent text-[10px] font-black uppercase tracking-widest border border-agency-accent/20">
                                    {insight.category?.name || 'Article'}
                                </span>
                                <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest opacity-40">
                                    <div className="flex items-center gap-2"><Clock className="size-3" /> {insight.reading_time || 5} min read</div>
                                    <div className="flex items-center gap-2"><User className="size-3" /> {insight.author?.name || 'Avant-Garde'}</div>
                                </div>
                            </div>
                            
                            <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-tight mb-12">
                                {insight.title}
                            </h1>
                            
                            <p className="text-xl md:text-2xl text-agency-primary/60 dark:text-white/60 font-light leading-relaxed italic max-w-3xl mx-auto border-l-4 border-agency-accent pl-8 text-left">
                                {insight.excerpt}
                            </p>
                        </AnimatedSection>
                    </div>
                </header>

                {/* Featured Image - Wide Layout */}
                {insight.featured_image && (
                    <div className="w-full h-[70vh] relative overflow-hidden">
                        <img 
                            src={insight.featured_image} 
                            alt={insight.title} 
                            className="w-full h-full object-cover scale-105"
                        />
                    </div>
                )}

                {/* Article Content */}
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-32">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                        {/* Social Share Stickiness */}
                        <aside className="lg:col-span-1 hidden lg:block">
                            <div className="sticky top-48 space-y-8 flex flex-col items-center">
                                <span className="text-[10px] font-black uppercase tracking-widest [writing-mode:vertical-rl] opacity-20">Share Article</span>
                                <button title="Share on Facebook" aria-label="Share on Facebook" className="size-10 rounded-full bg-agency-primary/5 dark:bg-white/5 flex items-center justify-center hover:bg-agency-accent hover:text-white transition-all"><Facebook className="size-4" /></button>
                                <button title="Share on Twitter" aria-label="Share on Twitter" className="size-10 rounded-full bg-agency-primary/5 dark:bg-white/5 flex items-center justify-center hover:bg-agency-accent hover:text-white transition-all"><Twitter className="size-4" /></button>
                                <button title="Share on LinkedIn" aria-label="Share on LinkedIn" className="size-10 rounded-full bg-agency-primary/5 dark:bg-white/5 flex items-center justify-center hover:bg-agency-accent hover:text-white transition-all"><Linkedin className="size-4" /></button>
                                <button title="Copy Link" aria-label="Copy Link" className="size-10 rounded-full bg-agency-primary/5 dark:bg-white/5 flex items-center justify-center hover:bg-agency-accent hover:text-white transition-all"><Share2 className="size-4" /></button>
                            </div>
                        </aside>

                        <div className="lg:col-span-8 lg:col-offset-1">
                            <div className="prose prose-xl md:prose-2xl dark:prose-invert max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-a:text-agency-accent prose-strong:text-agency-primary dark:prose-strong:text-white">
                                {/* Using dangerouslySetInnerHTML because we expect rich text from the CMS */}
                                {insight.content?.body ? (
                                    <div dangerouslySetInnerHTML={{ __html: String(insight.content.body) }} />
                                ) : (
                                    <p className="italic opacity-40">Article content is being developed...</p>
                                )}
                            </div>

                            {/* Tags */}
                            {insight.tags && insight.tags.length > 0 && (
                                <div className="mt-20 pt-10 border-t border-agency-primary/5 dark:border-white/5">
                                    <div className="flex flex-wrap gap-3">
                                        {insight.tags.map(tag => (
                                            <span key={tag} className="px-5 py-2 rounded-full bg-agency-secondary dark:bg-white/5 text-[10px] font-bold uppercase tracking-widest">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Author Bio */}
                            <div className="mt-24 p-12 rounded-[50px] bg-agency-secondary dark:bg-white/5 flex flex-col md:flex-row items-center gap-10">
                                <div className="size-24 rounded-full overflow-hidden shrink-0 border-2 border-agency-accent p-1">
                                    <img 
                                        src={insight.author?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2574&auto=format&fit=crop'} 
                                        alt={insight.author?.name} 
                                        className="w-full h-full object-cover rounded-full"
                                    />
                                </div>
                                <div className="text-center md:text-left">
                                    <span className="text-agency-accent font-bold uppercase tracking-widest text-xs mb-2 block">Written by</span>
                                    <h4 className="text-2xl font-black uppercase tracking-tighter mb-4">{insight.author?.name || 'Avant-Garde Collective'}</h4>
                                    <p className="text-agency-primary/60 dark:text-white/60 leading-relaxed font-light">
                                        Thought leader and creative visionary at Avant-Garde, exploring the intersection of design, technology, and human experience.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </article>

            {/* Related Insights Grid */}
            {relatedInsights.length > 0 && (
                <section className="bg-agency-secondary dark:bg-black/40 py-40">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <header className="mb-20 flex justify-between items-end">
                            <div>
                                <span className="text-agency-accent font-bold uppercase tracking-[0.4em] text-xs mb-4 block">Keep Reading</span>
                                <h2 className="text-5xl font-black uppercase tracking-tighter">More <span className="italic opacity-30">Insights.</span></h2>
                            </div>
                            <Link href="/blog" className="text-xs font-black uppercase tracking-widest hover:text-agency-accent transition-colors">See all articles</Link>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {relatedInsights.map((post, i) => (
                                <AnimatedSection key={post.id} animation="slide-up" delay={i * 100} className="group flex flex-col">
                                    <Link href={`/blog/${post.slug}`} className="block">
                                        <div className="relative aspect-video rounded-[40px] overflow-hidden mb-8 shadow-xl bg-agency-primary/5 dark:bg-white/5">
                                            {post.featured_image && (
                                                <img 
                                                    src={post.featured_image} 
                                                    alt={post.title} 
                                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000 ease-out"
                                                />
                                            )}
                                        </div>
                                        <h3 className="text-2xl font-black uppercase tracking-tighter text-agency-primary dark:text-white group-hover:text-agency-accent transition-colors duration-500">
                                            {post.title}
                                        </h3>
                                    </Link>
                                </AnimatedSection>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA Shared Component */}
            <section className="bg-agency-primary dark:bg-white text-white dark:text-agency-primary py-40 text-center relative overflow-hidden">
                <div className="mx-auto max-w-4xl px-4 relative z-10">
                    <h2 className="text-6xl md:text-9xl font-black uppercase tracking-tighter mb-12 leading-none">
                        Have a <br/>
                        <span className="italic opacity-30">Vision?</span>
                    </h2>
                    <Link
                        href="/contact"
                        className="inline-flex h-20 px-12 items-center justify-center rounded-full bg-agency-accent text-agency-primary text-xl font-black uppercase tracking-tighter hover:scale-105 transition-all shadow-2xl"
                    >
                        LET'S TALK
                    </Link>
                </div>
            </section>
        </MainLayout>
    );
}
