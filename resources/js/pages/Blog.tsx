import AnimatedSection from '@/components/AnimatedSection';
import MainLayout from '@/layouts/MainLayout';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { Clock, User, ArrowRight, ArrowUpRight } from 'lucide-react';
import React, { useState } from 'react';

export default function Blog() {
    const categories = ['All', 'Design', 'Tech', 'Culture', 'Strategy'];
    const [activeCategory, setActiveCategory] = useState('All');

    const posts = [
        {
            id: 1,
            title: 'Design as a Strategic Advantage',
            excerpt: 'How leading brands use design thinking to outpace competitors and create lasting value.',
            author: 'Sarah Johnson',
            date: 'May 12, 2024',
            readTime: '5 min',
            category: 'Strategy',
            image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=2564&auto=format&fit=crop'
        },
        {
            id: 2,
            title: 'The AI Revolution in Creative Workflows',
            excerpt: 'Exploring how generative AI is transforming the way we design, code, and innovate.',
            author: 'Michael Chen',
            date: 'May 10, 2024',
            readTime: '8 min',
            category: 'Tech',
            image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2664&auto=format&fit=crop'
        },
        {
            id: 3,
            title: 'Sustainable Digital Experiences',
            excerpt: 'Why eco-friendly web design is the next frontier of corporate responsibility.',
            author: 'Emily Rodriguez',
            date: 'May 08, 2024',
            readTime: '6 min',
            category: 'Culture',
            image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=2670&auto=format&fit=crop'
        },
        {
            id: 4,
            title: 'Minimalism: Less is Still More',
            excerpt: 'Revisiting the principles of minimalist design in the age of information overload.',
            author: 'David Kim',
            date: 'May 05, 2024',
            readTime: '4 min',
            category: 'Design',
            image: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=2667&auto=format&fit=crop'
        }
    ];

    const filteredPosts = activeCategory === 'All' 
        ? posts 
        : posts.filter(post => post.category === activeCategory);

    return (
        <MainLayout title="Blog - Avant-Garde">
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
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={cn(
                                'px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-500 whitespace-nowrap',
                                activeCategory === cat 
                                    ? 'bg-agency-accent text-agency-primary shadow-lg shadow-agency-accent/20 scale-105' 
                                    : 'bg-agency-primary/5 dark:bg-white/5 text-agency-primary/40 dark:text-white/40 hover:bg-agency-accent/10 hover:text-agency-accent'
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Creative Blog Grid - Asymmetrical Layout */}
            <section className="bg-agency-secondary dark:bg-[#0a0a0a] py-40">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-24">
                        {filteredPosts.map((post, i) => (
                            <AnimatedSection 
                                key={post.id} 
                                animation="slide-up" 
                                delay={i * 100}
                                className={cn(
                                    'group flex flex-col',
                                    i % 3 === 0 ? 'lg:col-span-8' : 'lg:col-span-4',
                                    i % 2 !== 0 ? 'lg:translate-y-24' : ''
                                )}
                            >
                                <Link href={`/blog/${post.id}`} className="block">
                                    <div className="relative aspect-[16/10] rounded-[60px] overflow-hidden mb-12 shadow-2xl bg-agency-primary/5 dark:bg-white/5">
                                        <img 
                                            src={post.image} 
                                            alt={post.title} 
                                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000 ease-out"
                                        />
                                        <div className="absolute top-8 left-8">
                                            <span className="px-4 py-2 rounded-full bg-agency-accent text-agency-primary text-[10px] font-black uppercase tracking-widest shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                                {post.category}
                                            </span>
                                        </div>
                                        <div className="absolute bottom-10 right-10 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-10 group-hover:translate-x-0">
                                            <div className="size-20 rounded-full bg-white dark:bg-agency-accent flex items-center justify-center text-agency-primary dark:text-agency-primary">
                                                <ArrowUpRight className="size-10" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-4">
                                        <div className="flex items-center gap-6 mb-6 opacity-40 text-[10px] font-bold uppercase tracking-widest">
                                            <div className="flex items-center gap-2"><User className="size-3" /> {post.author}</div>
                                            <div className="flex items-center gap-2"><Clock className="size-3" /> {post.readTime}</div>
                                        </div>
                                        <h2 className={cn(
                                            'font-black uppercase tracking-tighter text-agency-primary dark:text-white group-hover:text-agency-accent transition-colors duration-500',
                                            i % 3 === 0 ? 'text-4xl md:text-7xl' : 'text-3xl md:text-5xl'
                                        )}>
                                            {post.title}
                                        </h2>
                                        <p className="mt-8 text-lg text-agency-primary/60 dark:text-white/60 leading-relaxed max-w-2xl font-light line-clamp-2 italic border-l-2 border-agency-accent pl-6">
                                            {post.excerpt}
                                        </p>
                                    </div>
                                </Link>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* Newsletter Integration */}
            <section className="bg-white dark:bg-agency-dark py-40 border-t border-agency-primary/5 dark:border-white/5">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="bg-agency-primary dark:bg-black rounded-[80px] p-12 md:p-32 flex flex-col md:flex-row items-center justify-between gap-16 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full opacity-[0.05] pointer-events-none agency-grid-overlay"></div>
                        
                        <div className="relative z-10 max-w-xl text-center md:text-left">
                            <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none mb-8">
                                Stay <span className="text-agency-accent italic">Ahead.</span>
                            </h2>
                            <p className="text-white/60 text-lg md:text-xl font-light">
                                Subscribe to our newsletter for weekly doses of 
                                unconventional wisdom and digital foresight.
                            </p>
                        </div>

                        <div className="relative z-10 w-full max-w-md">
                            <form className="relative flex items-center">
                                <input 
                                    type="email" 
                                    placeholder="YOUR@EMAIL.COM" 
                                    className="w-full h-20 rounded-full bg-white/5 border border-white/10 px-8 text-xs font-bold uppercase tracking-widest text-white focus:ring-2 focus:ring-agency-accent focus:border-transparent transition-all"
                                />
                                <button 
                                    className="absolute right-2 size-16 rounded-full bg-agency-accent text-agency-primary flex items-center justify-center hover:scale-105 transition-all shadow-xl shadow-agency-accent/20"
                                    title="Subscribe to Newsletter"
                                    aria-label="Subscribe to Newsletter"
                                >
                                    <ArrowRight className="size-6" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </MainLayout>
    );
}


