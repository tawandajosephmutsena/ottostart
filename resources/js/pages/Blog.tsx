import AnimatedSection from '@/components/AnimatedSection';
import MainLayout from '@/layouts/MainLayout';
import { Insight, PaginatedData, Category, Page } from '@/types';
import { Link, Head, useForm } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { Clock, User as UserIcon, ArrowRight, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import React, { useState } from 'react';
import BlockRenderer from '@/components/Blocks/BlockRenderer';

interface Props {
    insights: PaginatedData<Insight>;
    categories: Category[];
    page?: Page;
}

export default function Blog({ insights, categories, page }: Props) {
    const [activeCategoryId, setActiveCategoryId] = useState<number | 'all'>('all');
    const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
    
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        form_title: 'Newsletter Subscription',
    });
    
    const handleNewsletterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/contact', {
            onSuccess: () => {
                setNewsletterSubmitted(true);
                setData('email', '');
                setTimeout(() => setNewsletterSubmitted(false), 5000);
            },
        });
    };

    const posts = insights.data;

    const filteredPosts = activeCategoryId === 'all' 
        ? posts 
        : posts.filter(post => post.category_id === activeCategoryId);

    return (
        <MainLayout title={page?.title ? `${page.title} - Avant-Garde` : "Blog - Avant-Garde"}>
            <Head title={page?.title || "Insights & Thoughts"} />
            
            {(page?.content?.blocks && page.content.blocks.length > 0) ? (
                <BlockRenderer 
                    blocks={page.content.blocks} 
                    recentInsights={posts}
                />
            ) : (
                <>
                    {/* Immersive Hero Section */}
                    <section className="bg-white dark:bg-agency-dark pt-40 pb-20 relative overflow-hidden">
                        <div className="absolute top-20 left-0 w-full overflow-hidden opacity-[0.03] select-none pointer-events-none">
                            <span className="text-[20vw] font-black uppercase whitespace-nowrap leading-none block marquee">
                                THOUGHT LEADERSHIP THOUGHT LEADERSHIP
                            </span>
                        </div>

                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                            <div className="max-w-4xl mx-auto">
                                <span className="text-agency-accent font-bold uppercase tracking-[0.4em] text-xs mb-8 block">Knowledge Hub</span>
                                <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-[0.85] text-agency-primary dark:text-white mb-12">
                                    Curated <br/>
                                    <span className="opacity-30 italic">Insights.</span>
                                </h1>
                            </div>
                        </div>
                    </section>

                    {/* Filter Bar */}
                    <div className="sticky top-24 z-30 py-6 bg-white/80 dark:bg-agency-dark/80 backdrop-blur-xl border-y border-agency-primary/5 dark:border-white/5">
                        <div className="mx-auto max-w-7xl px-4 flex justify-center gap-4 overflow-x-auto no-scrollbar">
                            <button
                                onClick={() => setActiveCategoryId('all')}
                                className={cn(
                                    'px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-500 whitespace-nowrap',
                                    activeCategoryId === 'all' 
                                        ? 'bg-agency-accent text-agency-primary shadow-lg shadow-agency-accent/20 scale-105' 
                                        : 'bg-agency-primary/5 dark:bg-white/5 text-agency-primary/40 dark:text-white/40 hover:bg-agency-accent/10 hover:text-agency-accent'
                                )}
                            >
                                All Articles
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategoryId(cat.id)}
                                    className={cn(
                                        'px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-500 whitespace-nowrap',
                                        activeCategoryId === cat.id 
                                            ? 'bg-agency-accent text-agency-primary shadow-lg shadow-agency-accent/20 scale-105' 
                                            : 'bg-agency-primary/5 dark:bg-white/5 text-agency-primary/40 dark:text-white/40 hover:bg-agency-accent/10 hover:text-agency-accent'
                                    )}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Creative Blog Grid - Asymmetrical Layout */}
                    <section className="bg-agency-secondary dark:bg-[#0a0a0a] py-40">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-24">
                                {filteredPosts.length > 0 ? (
                                    filteredPosts.map((post, i) => (
                                        <AnimatedSection 
                                            key={post.id} 
                                            animation="slide-up" 
                                            delay={i * 100}
                                            className={cn(
                                                'group flex flex-col h-full transform transition-all duration-500 hover:-translate-y-2',
                                                i % 3 === 0 ? 'lg:col-span-8' : 'lg:col-span-4',
                                                i % 2 !== 0 ? 'lg:translate-y-24' : ''
                                            )}
                                        >
                                            <Link href={`/blog/${post.slug}`} className="block relative h-full flex flex-col">
                                                <div className="relative aspect-[16/10] rounded-[40px] overflow-hidden mb-8 shadow-2xl bg-agency-primary/5 dark:bg-white/5">
                                                    {post.featured_image ? (
                                                        <img 
                                                            src={post.featured_image} 
                                                            alt={post.title} 
                                                            className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700 ease-out scale-100 group-hover:scale-105"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-agency-accent/5 flex items-center justify-center">
                                                            <div className="w-20 h-20 rounded-full bg-agency-accent/20 animate-pulse"></div>
                                                        </div>
                                                    )}
                                                    <div className="absolute top-6 left-6 z-10">
                                                        <span className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-widest shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-500 transform -translate-y-2 group-hover:translate-y-0">
                                                            {post.category?.name || 'Insight'}
                                                        </span>
                                                    </div>
                                                    <div className="absolute bottom-6 right-6 z-10 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                                                        <div className="size-16 rounded-full bg-white dark:bg-agency-accent flex items-center justify-center text-agency-primary shadow-xl">
                                                            <ArrowUpRight className="size-6 transform group-hover:rotate-45 transition-transform duration-500" />
                                                        </div>
                                                    </div>
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                                </div>

                                                <div className="px-2 flex-grow">
                                                    <div className="flex items-center gap-6 mb-6 opacity-40 text-[10px] font-bold uppercase tracking-widest group-hover:opacity-100 transition-opacity duration-500">
                                                        <div className="flex items-center gap-2"><UserIcon className="size-3" /> {post.author?.name || 'Avant-Garde'}</div>
                                                        <div className="flex items-center gap-2"><Clock className="size-3" /> {post.reading_time || 5} min read</div>
                                                    </div>
                                                    <h2 className={cn(
                                                        'font-black uppercase tracking-tighter text-agency-primary dark:text-white mb-6 group-hover:text-agency-accent transition-colors duration-500',
                                                        i % 3 === 0 ? 'text-4xl md:text-6xl' : 'text-3xl md:text-4xl'
                                                    )}>
                                                        {post.title}
                                                    </h2>
                                                    <p className="text-lg text-agency-primary/60 dark:text-white/60 leading-relaxed max-w-2xl font-light line-clamp-3 group-hover:text-agency-primary/80 dark:group-hover:text-white/80 transition-colors duration-500">
                                                        {post.excerpt}
                                                    </p>
                                                </div>
                                            </Link>
                                        </AnimatedSection>
                                    ))
                                ) : (
                                    <div className="col-span-full py-20 text-center">
                                        <div className="inline-block p-8 rounded-full bg-agency-primary/5 dark:bg-white/5 mb-8">
                                            <UserIcon className="size-16 opacity-20" />
                                        </div>
                                        <h3 className="text-3xl font-black uppercase tracking-tighter mb-4 opacity-50">No insights found</h3>
                                        <p className="text-lg opacity-40 max-w-md mx-auto">
                                            We couldn't find any articles matching your selection. Try selecting a different category.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            {insights.links.length > 3 && (
                                <div className="mt-40 flex justify-center gap-4">
                                    {insights.links.map((link, i) => (
                                        <Link
                                            key={i}
                                            href={link.url || '#'}
                                            className={`px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                                                link.active 
                                                    ? 'bg-agency-accent text-agency-primary' 
                                                    : 'bg-white dark:bg-white/5 text-agency-primary/40 dark:text-white/40 hover:bg-agency-accent hover:text-agency-primary'
                                            } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Newsletter Integration */}
                    <section className="bg-white dark:bg-agency-dark py-40 border-t border-agency-primary/5 dark:border-white/5">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="bg-agency-primary dark:bg-neutral-900 rounded-[80px] p-12 md:p-32 flex flex-col md:flex-row items-center justify-between gap-16 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-full opacity-[0.05] pointer-events-none agency-grid-overlay"></div>
                                
                                <div className="relative z-10 max-w-xl text-center md:text-left">
                                    <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none mb-8">
                                        Stay <span className="text-agency-accent italic">Ahead.</span>
                                    </h2>
                                    <p className="text-white/70 text-lg md:text-xl font-light">
                                        Subscribe to our newsletter for weekly doses of 
                                        unconventional wisdom and digital foresight.
                                    </p>
                                </div>

                                <div className="relative z-10 w-full max-w-md">
                                    {newsletterSubmitted ? (
                                        <div className="flex items-center gap-4 p-6 rounded-3xl bg-green-500/20 border border-green-500/30">
                                            <CheckCircle2 className="size-8 text-green-400" />
                                            <p className="text-green-300 font-bold text-lg">Thanks for subscribing!</p>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleNewsletterSubmit} className="relative flex items-center">
                                            <input 
                                                type="email" 
                                                value={data.email}
                                                onChange={e => setData('email', e.target.value)}
                                                required
                                                placeholder="YOUR@EMAIL.COM" 
                                                className="w-full h-20 rounded-full bg-white/10 dark:bg-white/10 border border-white/20 px-8 text-xs font-bold uppercase tracking-widest text-white placeholder:text-white/50 focus:ring-2 focus:ring-agency-accent focus:border-transparent transition-all"
                                            />
                                            <button 
                                                type="submit"
                                                disabled={processing}
                                                className="absolute right-2 size-16 rounded-full bg-agency-accent text-agency-primary flex items-center justify-center hover:scale-105 transition-all shadow-xl shadow-agency-accent/20 disabled:opacity-50"
                                                title="Subscribe to Newsletter"
                                                aria-label="Subscribe to Newsletter"
                                            >
                                                <ArrowRight className="size-6" />
                                            </button>
                                        </form>
                                    )}
                                    {errors.email && <p className="mt-3 text-sm text-red-400">{errors.email}</p>}
                                </div>
                            </div>
                        </div>
                    </section>
                </>
            )}
        </MainLayout>
    );
}
