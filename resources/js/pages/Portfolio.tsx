import AnimatedSection from '@/components/AnimatedSection';
import MainLayout from '@/layouts/MainLayout';
import { Link } from '@inertiajs/react';
import React, { useState } from 'react';

export default function Portfolio() {
    const projects = [
        {
            title: 'E-commerce Platform',
            category: 'Web Development',
            description: 'A modern e-commerce platform with advanced features and seamless user experience.',
            image: '/placeholder-project-1.jpg',
            tags: ['React', 'Node.js', 'MongoDB', 'Stripe'],
        },
        {
            title: 'Mobile Banking App',
            category: 'Mobile Development',
            description: 'Secure and intuitive mobile banking application with biometric authentication.',
            image: '/placeholder-project-2.jpg',
            tags: ['React Native', 'Firebase', 'Biometrics', 'Security'],
        },
        {
            title: 'Brand Identity System',
            category: 'Branding',
            description: 'Complete brand identity redesign for a tech startup including logo and guidelines.',
            image: '/placeholder-project-3.jpg',
            tags: ['Logo Design', 'Brand Guidelines', 'Visual Identity'],
        },
        {
            title: 'SaaS Dashboard',
            category: 'UI/UX Design',
            description: 'Analytics dashboard for a SaaS platform with complex data visualization.',
            image: '/placeholder-project-4.jpg',
            tags: ['Dashboard', 'Data Viz', 'UX Research', 'Prototyping'],
        },
        {
            title: 'Restaurant Website',
            category: 'Web Development',
            description: 'Responsive website with online ordering system and reservation management.',
            image: '/placeholder-project-5.jpg',
            tags: ['WordPress', 'Online Ordering', 'Responsive Design'],
        },
        {
            title: 'Fitness App',
            category: 'Mobile Development',
            description: 'Comprehensive fitness tracking app with workout plans and progress monitoring.',
            image: '/placeholder-project-6.jpg',
            tags: ['Flutter', 'Health Kit', 'Wearables', 'Analytics'],
        },
    ];

    const categories = [
        'All',
        'Web Development',
        'Mobile Development',
        'UI/UX Design',
        'Branding',
    ];

    const [activeCategory, setActiveCategory] = useState('All');

    const filteredProjects = activeCategory === 'All' 
        ? projects 
        : projects.filter(p => p.category === activeCategory);

    return (
        <MainLayout title="Portfolio - Avant-Garde">
            {/* Immersive Hero Section */}
            <section className="bg-white dark:bg-agency-dark pt-40 pb-32 relative overflow-hidden">
                {/* Background Branding Marquee */}
                <div className="absolute top-20 left-0 w-full overflow-hidden opacity-[0.03] select-none pointer-events-none">
                    <span className="text-[20vw] font-black uppercase whitespace-nowrap leading-none block marquee">
                        PORTFOLIO PORTFOLIO PORTFOLIO PORTFOLIO
                    </span>
                </div>

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center md:text-left">
                    <div className="max-w-4xl">
                        <span className="text-agency-accent font-bold uppercase tracking-[0.4em] text-xs mb-8 block">Selected Works</span>
                        <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-[0.85] text-agency-primary dark:text-white mb-12">
                            Digital <br/>
                            <span className="opacity-30 italic">Showcase.</span>
                        </h1>
                        <p className="text-xl md:text-3xl text-agency-primary/60 dark:text-white/60 leading-relaxed font-light">
                            Explore our latest projects and see how we've helped 
                            businesses transform their digital presence through innovative design and code.
                        </p>
                    </div>
                </div>
            </section>

            {/* Filter Bar - Premium Pill Style */}
            <section className="bg-white dark:bg-[#0a0a0a] border-y border-agency-primary/5 dark:border-white/5 py-8 sticky top-[80px] z-50 backdrop-blur-xl bg-white/80 dark:bg-black/80">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap justify-center gap-4">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-[0.2em] transition-all duration-500 border ${
                                    activeCategory === cat 
                                        ? 'bg-agency-accent border-agency-accent text-agency-primary shadow-lg shadow-agency-accent/20' 
                                        : 'bg-transparent border-agency-primary/10 dark:border-white/10 text-agency-primary/40 dark:text-white/40 hover:border-agency-accent hover:text-agency-accent'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Projects Artistic Grid */}
            <section className="bg-agency-secondary dark:bg-[#0a0a0a] py-40">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {filteredProjects.map((project, i) => (
                            <AnimatedSection 
                                key={project.title} 
                                animation="slide-up" 
                                delay={i * 50}
                                className="group cursor-pointer"
                            >
                                <div className="relative aspect-video rounded-[40px] overflow-hidden bg-agency-primary/5 dark:bg-white/5 mb-8">
                                    {/* Project Placeholder with Reveal Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-agency-accent/20 to-agency-primary/20 group-hover:scale-110 transition-transform duration-700 ease-out"></div>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-md bg-agency-primary/20">
                                        <div className="size-24 rounded-full bg-agency-accent flex items-center justify-center text-agency-primary font-black text-xs uppercase tracking-tighter scale-50 group-hover:scale-100 transition-transform duration-500">
                                            VIEW WORK
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="px-4">
                                    <span className="text-agency-accent font-bold uppercase tracking-[0.3em] text-[10px] mb-4 block">
                                        {project.category}
                                    </span>
                                    <h3 className="text-4xl font-black uppercase tracking-tighter text-agency-primary dark:text-white mb-4 transition-colors group-hover:text-agency-accent">
                                        {project.title}
                                    </h3>
                                    <p className="text-agency-primary/60 dark:text-white/60 mb-6 font-light leading-relaxed max-w-lg">
                                        {project.description}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {project.tags.map(tag => (
                                            <span key={tag} className="text-[10px] font-bold uppercase tracking-widest text-agency-primary/30 dark:text-white/30 border border-agency-primary/10 dark:border-white/10 px-3 py-1 rounded-full group-hover:border-agency-accent/30 transition-colors">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* Results / Stats Section */}
            <section className="bg-white dark:bg-agency-dark py-40 border-t border-agency-primary/5">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    <span className="text-agency-accent font-bold uppercase tracking-[0.4em] text-xs mb-8 block">Project Impact</span>
                    <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-24 leading-none">
                        Our work <br/>
                        <span className="opacity-30 italic">by the numbers.</span>
                    </h2>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                        {[
                            { label: 'Completed Works', value: '150+' },
                            { label: 'Global Clients', value: '50+' },
                            { label: 'Design Awards', value: '12' },
                            { label: 'Conversion Lift', value: '85%' }
                        ].map((stat, i) => (
                            <div key={i} className="group">
                                <div className="text-6xl md:text-8xl font-black text-agency-primary dark:text-white mb-4 group-hover:text-agency-accent transition-colors duration-500">
                                    {stat.value}
                                </div>
                                <div className="text-xs font-bold uppercase tracking-widest opacity-40">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Shared Component/Style */}
            <section className="bg-agency-primary dark:bg-white text-white dark:text-agency-primary py-40 text-center relative overflow-hidden">
                <div className="mx-auto max-w-4xl px-4 relative z-10">
                    <h2 className="text-6xl md:text-9xl font-black uppercase tracking-tighter mb-12">
                        Start <br/>
                        <span className="italic opacity-30">Fresh.</span>
                    </h2>
                    <Link
                        href="/contact"
                        className="inline-flex h-20 px-12 items-center justify-center rounded-full bg-agency-accent text-agency-primary text-xl font-black uppercase tracking-tighter hover:scale-105 transition-all shadow-2xl"
                    >
                        TRANSFORM YOUR BRAND
                    </Link>
                </div>
                {/* Background Large Text */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full opacity-[0.05] pointer-events-none select-none">
                    <span className="text-[30vw] font-black uppercase whitespace-nowrap leading-none">BUILD WITH US</span>
                </div>
            </section>
        </MainLayout>
    );
}
