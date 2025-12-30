import AnimatedSection from '@/components/AnimatedSection';
import MainLayout from '@/layouts/MainLayout';
import { Link } from '@inertiajs/react';
import { ArrowRight, Code, Cpu, Layout, Palette } from 'lucide-react';
import React from 'react';

export default function Services() {
    const services = [
        {
            title: 'Digital Branding',
            description: 'We craft unique digital identities that resonate with your audience and stand out in a crowded market.',
            icon: Palette,
            features: ['Visual Identity', 'Brand Voice', 'Design Systems', 'Logo Design'],
            color: 'bg-blue-500',
            image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=2671&auto=format&fit=crop'
        },
        {
            title: 'Experience Design',
            description: 'Creating intuitive, engaging, and memorable user experiences across all digital touchpoints.',
            icon: Layout,
            features: ['UX Research', 'UI Design', 'Prototyping', 'User Testing'],
            color: 'bg-agency-accent',
            image: 'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?q=80&w=2670&auto=format&fit=crop'
        },
        {
            title: 'Tech Architectures',
            description: 'Building robust, scalable, and high-performance technical foundations for your digital products.',
            icon: Code,
            features: ['Frontend Dev', 'Backend Systems', 'Mobile Apps', 'Cloud Infra'],
            color: 'bg-purple-500',
            image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2670&auto=format&fit=crop'
        },
        {
            title: 'AI Integration',
            description: 'Leveraging cutting-edge artificial intelligence to automate processes and enhance user experiences.',
            icon: Cpu,
            features: ['Machine Learning', 'NLP', 'Data Science', 'Automations'],
            color: 'bg-orange-500',
            image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2664&auto=format&fit=crop'
        }
    ];

    return (
        <MainLayout title="Services - Avant-Garde">
            {/* Artistic Hero Section */}
            <section className="relative min-h-[80vh] flex flex-col items-center justify-center overflow-hidden bg-agency-secondary dark:bg-agency-dark pt-32">
                <div className="absolute inset-0 z-0 opacity-[0.03] select-none pointer-events-none">
                    <span className="text-[25vw] font-black uppercase whitespace-nowrap leading-none block marquee">
                        CREATIVITY TECHNOLOGY INNOVATION
                    </span>
                </div>

                <div className="relative z-10 max-w-5xl px-4 text-center">
                    <AnimatedSection animation="slide-up">
                        <span className="text-agency-accent font-bold uppercase tracking-[0.4em] text-xs mb-8 block">Our Expertise</span>
                        <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter leading-[0.85] text-agency-primary dark:text-white mb-12">
                            Elevating <br/>
                            <span className="opacity-30 italic">Interfaces.</span>
                        </h1>
                    </AnimatedSection>
                </div>
            </section>

            {/* Out-of-the-box Services Grid */}
            <section className="bg-white dark:bg-black/20 py-40">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-agency-primary/5 dark:bg-white/5 border border-agency-primary/5 dark:border-white/5 overflow-hidden rounded-[40px]">
                        {services.map((service, i) => (
                            <div key={i} className="group relative bg-white dark:bg-agency-dark p-12 md:p-20 overflow-hidden min-h-[500px] flex flex-col justify-between transition-all duration-700 hover:bg-agency-primary dark:hover:bg-agency-accent">
                                {/* Image Reveal on Hover */}
                                <div className="absolute inset-x-0 bottom-0 top-0 opacity-0 group-hover:opacity-20 transition-all duration-700 scale-110 group-hover:scale-100 pointer-events-none">
                                    <img src={service.image} alt={service.title} className="w-full h-full object-cover filter grayscale" />
                                </div>

                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="size-16 rounded-2xl bg-agency-primary/5 dark:bg-white/5 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                            <service.icon className="size-8 text-agency-accent group-hover:text-white dark:group-hover:text-agency-primary" />
                                        </div>
                                        <span className="text-5xl font-black opacity-10 font-display group-hover:text-white dark:group-hover:text-agency-primary group-hover:opacity-30">0{i + 1}</span>
                                    </div>
                                    
                                    <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-agency-primary dark:text-white group-hover:text-white dark:group-hover:text-agency-primary mb-6 transition-all group-hover:translate-x-4">
                                        {service.title}
                                    </h2>
                                    
                                    <p className="text-lg text-agency-primary/60 dark:text-white/60 group-hover:text-white/80 dark:group-hover:text-agency-primary/80 leading-relaxed mb-12 max-w-sm transition-all group-hover:translate-x-4">
                                        {service.description}
                                    </p>
                                </div>

                                <div className="relative z-10">
                                    <div className="flex flex-wrap gap-2 mb-10 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                                        {service.features.map((feature, j) => (
                                            <span key={j} className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-current/20">
                                                {feature}
                                            </span>
                                        ))}
                                    </div>
                                    
                                    <Link href="/contact" className="inline-flex items-center gap-4 text-xs font-black uppercase tracking-widest text-agency-accent group-hover:text-white dark:group-hover:text-agency-primary">
                                        Explore Scope <ArrowRight className="size-4 group-hover:translate-x-2 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Process Section - Horizontal Flow */}
            <section className="bg-agency-secondary dark:bg-agency-dark py-40 overflow-hidden">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <header className="mb-24">
                        <span className="text-agency-accent font-bold uppercase tracking-[0.4em] text-xs mb-4 block">Our Process</span>
                        <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-agency-primary dark:text-white">
                            From Vision <br/>
                            <span className="opacity-30 italic">to Reality.</span>
                        </h2>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                        {[
                            { step: '01', title: 'Discovery', desc: 'In-depth research and strategy to define the project foundations.' },
                            { step: '02', title: 'Ideation', desc: 'Creative brainstorming and conceptual design to explore possibilities.' },
                            { step: '03', title: 'Realization', desc: 'Technical execution and design refinement with iterative feedback.' },
                            { step: '04', title: 'Infinity', desc: 'Launch and continuous optimization for long-term project success.' }
                        ].map((item, i) => (
                            <AnimatedSection key={i} animation="slide-up" delay={i * 200} className="relative group">
                                <div className="text-[8rem] font-black text-agency-primary/5 dark:text-white/5 absolute -top-12 -left-4 pointer-events-none select-none group-hover:text-agency-accent/10 transition-colors">
                                    {item.step}
                                </div>
                                <div className="relative z-10 pt-16">
                                    <h3 className="text-2xl font-black uppercase tracking-tighter text-agency-primary dark:text-white mb-4">
                                        {item.title}
                                    </h3>
                                    <p className="text-agency-primary/60 dark:text-white/60 leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* shared CTA */}
            <section className="bg-agency-primary dark:bg-black py-40 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-agency-accent/5 blur-[120px] rounded-full pointer-events-none"></div>
                <div className="mx-auto max-w-5xl px-4 text-center relative z-10">
                    <h2 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-tight mb-12">
                        Ready to <span className="text-agency-accent italic">Evolve?</span>
                    </h2>
                    <Link href="/contact" className="inline-flex h-20 px-12 items-center justify-center rounded-full bg-agency-accent text-agency-primary font-black text-lg uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-agency-accent/20">
                        Start your journey <ArrowRight className="ml-4 size-6" />
                    </Link>
                </div>
            </section>
        </MainLayout>
    );
}
