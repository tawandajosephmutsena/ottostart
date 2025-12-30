import AnimatedSection from '@/components/AnimatedSection';
import MainLayout from '@/layouts/MainLayout';
import { Link } from '@inertiajs/react';
import { Clock, User, ArrowRight } from 'lucide-react';
import React, { useState } from 'react';

export default function Blog() {
    const blogPosts = [
        {
            title: 'The Future of Web Design: Trends to Watch in 2024',
            excerpt: 'Explore the latest trends shaping the future of web design, from AI-powered interfaces to immersive experiences.',
            author: 'Sarah Johnson',
            date: '2024-01-15',
            readTime: '5 min read',
            category: 'Design',
            image: '/placeholder-blog-1.jpg',
        },
        {
            title: 'Building Scalable React Applications: Best Practices',
            excerpt: 'Learn how to structure and optimize React applications for better performance and maintainability.',
            author: 'Michael Chen',
            date: '2024-01-10',
            readTime: '8 min read',
            category: 'Development',
            image: '/placeholder-blog-2.jpg',
        },
        {
            title: 'UX Research Methods That Actually Work',
            excerpt: 'Discover proven UX research methods that help create user-centered designs and improve conversion rates.',
            author: 'Emily Rodriguez',
            date: '2024-01-05',
            readTime: '6 min read',
            category: 'UX Research',
            image: '/placeholder-blog-3.jpg',
        },
        {
            title: 'Mobile-First Design: Why It Matters More Than Ever',
            excerpt: 'Understanding the importance of mobile-first approach in modern web development and design.',
            author: 'David Kim',
            date: '2023-12-28',
            readTime: '4 min read',
            category: 'Mobile',
            image: '/placeholder-blog-4.jpg',
        },
        {
            title: 'The Art of Minimalist Web Design',
            excerpt: 'How to create beautiful, functional websites using minimalist design principles and clean aesthetics.',
            author: 'Sarah Johnson',
            date: '2023-12-20',
            readTime: '7 min read',
            category: 'Design',
            image: '/placeholder-blog-5.jpg',
        },
        {
            title: 'API Design Best Practices for Modern Applications',
            excerpt: 'Essential guidelines for designing robust, scalable APIs that developers love to work with.',
            author: 'Michael Chen',
            date: '2023-12-15',
            readTime: '9 min read',
            category: 'Development',
            image: '/placeholder-blog-6.jpg',
        },
    ];

    const categories = ['All', 'Design', 'Development', 'UX Research', 'Mobile'];
    const [activeCategory, setActiveCategory] = useState('All');

    const filteredPosts = activeCategory === 'All' 
        ? blogPosts 
        : blogPosts.filter(p => p.category === activeCategory);

    return (
        <MainLayout title="Insights - Avant-Garde">
            {/* Immersive Hero Section */}
            <section className="bg-white dark:bg-agency-dark pt-40 pb-32 relative overflow-hidden">
                {/* Background Branding Marquee */}
                <div className="absolute top-20 left-0 w-full overflow-hidden opacity-[0.03] select-none pointer-events-none">
                    <span className="text-[20vw] font-black uppercase whitespace-nowrap leading-none block marquee">
                        INSIGHTS INSIGHTS INSIGHTS INSIGHTS
                    </span>
                </div>

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="max-w-4xl">
                        <span className="text-agency-accent font-bold uppercase tracking-[0.4em] text-xs mb-8 block">Knowledge Base</span>
                        <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-[0.85] text-agency-primary dark:text-white mb-12">
                            Fresh <br/>
                            <span className="opacity-30 italic">Thinking.</span>
                        </h1>
                        <p className="text-xl md:text-3xl text-agency-primary/60 dark:text-white/60 leading-relaxed font-light">
                            Deep dives into design, development, and digital strategy. 
                            We share what we learn at the intersection of craft and technology.
                        </p>
                    </div>
                </div>
            </section>

            {/* Filter Bar */}
            <section className="bg-white dark:bg-[#0a0a0a] border-y border-agency-primary/5 dark:border-white/5 py-8 sticky top-[80px] z-50 backdrop-blur-xl bg-white/80 dark:bg-black/80">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap justify-center gap-4">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-[0.2em] transition-all duration-500 border ${
                                    activeCategory === cat 
                                        ? 'bg-agency-accent border-agency-accent text-agency-primary' 
                                        : 'bg-transparent border-agency-primary/10 dark:border-white/10 text-agency-primary/40 dark:text-white/40 hover:border-agency-accent hover:text-agency-accent'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Post - Large Artistic Layout */}
            <section className="bg-agency-secondary dark:bg-[#0a0a0a] py-40">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <AnimatedSection animation="slide-up" className="mb-32">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div className="aspect-[16/10] bg-agency-primary/5 dark:bg-white/5 rounded-[40px] overflow-hidden relative group">
                                <div className="absolute inset-0 bg-gradient-to-br from-agency-accent/20 to-transparent group-hover:scale-105 transition-transform duration-700"></div>
                            </div>
                            <div>
                                <span className="text-agency-accent font-bold uppercase tracking-[0.4em] text-xs mb-6 block">Featured Thinking</span>
                                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-agency-primary dark:text-white mb-8 leading-tight">
                                    {blogPosts[0].title}
                                </h2>
                                <p className="text-xl text-agency-primary/70 dark:text-white/70 mb-12 font-light leading-relaxed">
                                    {blogPosts[0].excerpt}
                                </p>
                                <div className="flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-agency-primary/40 dark:text-white/40 mb-12">
                                    <span className="flex items-center gap-2"><User className="size-4 text-agency-accent" /> {blogPosts[0].author}</span>
                                    <span className="flex items-center gap-2"><Clock className="size-4 text-agency-accent" /> {blogPosts[0].readTime}</span>
                                </div>
                                <Link
                                    href={`/blog/${blogPosts[0].title.toLowerCase().replace(/ /g, '-')}`}
                                    className="inline-flex h-16 px-10 items-center justify-center rounded-full bg-agency-primary dark:bg-white text-white dark:text-agency-primary text-sm font-black uppercase tracking-tighter hover:bg-agency-accent dark:hover:bg-agency-accent hover:text-agency-primary transition-colors"
                                >
                                    READ ARTICLE <ArrowRight className="ml-2 size-4" />
                                </Link>
                            </div>
                        </div>
                    </AnimatedSection>

                    {/* Blog Posts Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {filteredPosts.slice(1).map((post, i) => (
                            <AnimatedSection
                                key={post.title}
                                animation="slide-up"
                                delay={i * 50}
                                className="group cursor-pointer"
                            >
                                <div className="aspect-[4/3] bg-agency-primary/5 dark:bg-white/5 rounded-[30px] overflow-hidden mb-8 relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-agency-accent/10 to-transparent group-hover:scale-110 transition-transform duration-700"></div>
                                </div>
                                <div className="px-4">
                                    <span className="text-agency-accent font-bold uppercase tracking-[0.3em] text-[10px] mb-4 block">
                                        {post.category}
                                    </span>
                                    <h3 className="text-2xl font-black uppercase tracking-tighter text-agency-primary dark:text-white mb-6 group-hover:text-agency-accent transition-colors leading-tight">
                                        {post.title}
                                    </h3>
                                    <div className="flex items-center justify-between pt-6 border-t border-agency-primary/5 dark:border-white/5">
                                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">{post.date}</span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">{post.readTime}</span>
                                    </div>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* Premium Newsletter Section */}
            <section className="bg-white dark:bg-agency-dark py-40">
                <div className="mx-auto max-w-4xl px-4 text-center">
                    <span className="text-agency-accent font-bold uppercase tracking-[0.4em] text-xs mb-8 block">Stay Connected</span>
                    <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-12">
                        Curated <br/>
                        <span className="opacity-30 italic">Intelligence.</span>
                    </h2>
                    <p className="text-xl text-agency-primary/60 dark:text-white/60 mb-16 max-w-2xl mx-auto font-light">
                        Subscribe to our periodic dispatch of digital wisdom. 
                        No spam, just pure signal from our laboratory to your inbox.
                    </p>
                    
                    <form className="relative max-w-lg mx-auto">
                        <input
                            type="email"
                            placeholder="EMAIL ADDRESS"
                            className="w-full h-20 rounded-full bg-agency-secondary dark:bg-white/5 border-none px-10 text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-agency-accent transition-all"
                        />
                        <button className="absolute right-2 top-2 h-16 px-10 rounded-full bg-agency-primary dark:bg-white text-white dark:text-agency-primary text-xs font-black uppercase tracking-widest hover:bg-agency-accent dark:hover:bg-agency-accent hover:text-agency-primary transition-colors">
                            SUBSCRIBE
                        </button>
                    </form>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-agency-primary dark:bg-white text-white dark:text-agency-primary py-40 text-center relative overflow-hidden">
                <div className="mx-auto max-w-4xl px-4 relative z-10">
                    <h2 className="text-6xl md:text-9xl font-black uppercase tracking-tighter mb-12">
                        Let's <br/>
                        <span className="italic opacity-30">Talk.</span>
                    </h2>
                    <Link
                        href="/contact"
                        className="inline-flex h-20 px-12 items-center justify-center rounded-full bg-agency-accent text-agency-primary text-xl font-black uppercase tracking-tighter hover:scale-105 transition-all shadow-2xl"
                    >
                        GET IN TOUCH
                    </Link>
                </div>
                {/* Background Large Text */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full opacity-[0.05] pointer-events-none select-none">
                    <span className="text-[30vw] font-black uppercase whitespace-nowrap leading-none">WORK WITH US</span>
                </div>
            </section>
        </MainLayout>
    );
}
