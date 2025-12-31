import AnimatedSection from '@/components/AnimatedSection';
import MainLayout from '@/layouts/MainLayout';
import { Link } from '@inertiajs/react';

import { SeoHead } from '@/components/SeoHead';

export default function About() {
    return (
        <MainLayout>
            <SeoHead 
                title="About Us - Avant-Garde"
                description="Our mission is defining future standards. We are a collective of visionaries dedicated to crafting digital experiences that transcend the ordinary."
            />
            {/* Immersive Hero Section */}
            <section className="bg-agency-secondary dark:bg-agency-dark pt-40 pb-32 relative overflow-hidden">
                {/* Background Branding Marquee */}
                <div className="absolute top-20 left-0 w-full overflow-hidden opacity-[0.03] select-none pointer-events-none">
                    <span className="text-[20vw] font-black uppercase whitespace-nowrap leading-none block marquee">
                        ABOUT AVANT-GARDE ABOUT AVANT-GARDE
                    </span>
                </div>

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="max-w-4xl">
                        <span className="text-agency-accent font-bold uppercase tracking-[0.4em] text-xs mb-8 block">Our Mission</span>
                        <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-[0.85] text-agency-primary dark:text-white mb-12">
                            Defining <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-agency-accent to-agency-accent/30 italic">Future</span> Standards.
                        </h1>
                        <p className="text-xl md:text-3xl text-agency-primary/60 dark:text-white/60 leading-relaxed font-light">
                            We are a collective of visionaries, designers, and engineers 
                            dedicated to crafting digital experiences that transcend the ordinary. 
                            Our work is fueled by curiosity and defined by excellence.
                        </p>
                    </div>
                </div>
            </section>

            {/* The Story Section - Large Typography & Image Grid Style */}
            <section className="bg-white dark:bg-[#0a0a0a] py-40">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <AnimatedSection animation="slide-up">
                            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-agency-primary dark:text-white mb-8">
                                A journey <br/> of <span className="opacity-30 italic">obsession.</span>
                            </h2>
                            <div className="space-y-6 text-lg md:text-xl text-agency-primary/70 dark:text-white/70 leading-relaxed">
                                <p>
                                    Founded in 2019, Avant-Garde emerged from a singular conviction: 
                                    that the digital world deserved more than "good enough." 
                                    We saw a landscape cluttered with templates and decided to build a sanctuary for custom, high-end digital craft.
                                </p>
                                <p>
                                    What started as a boutique design studio has evolved into a full-scale digital innovation house. 
                                    We don't just build websites; we build competitive advantages for brands that dare to lead.
                                </p>
                            </div>
                        </AnimatedSection>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="aspect-[3/4] rounded-[40px] bg-agency-accent flex items-center justify-center p-8 group">
                                <div className="text-center group-hover:scale-110 transition-transform duration-500">
                                    <div className="text-6xl md:text-8xl font-black text-agency-primary">5+</div>
                                    <div className="text-xs font-bold uppercase tracking-widest text-agency-primary opacity-60">Years of Craft</div>
                                </div>
                            </div>
                            <div className="aspect-[3/4] rounded-[40px] bg-agency-primary dark:bg-white flex items-center justify-center p-8 group translate-y-12">
                                <div className="text-center group-hover:scale-110 transition-transform duration-500">
                                    <div className="text-6xl md:text-8xl font-black text-white dark:text-agency-primary">50+</div>
                                    <div className="text-xs font-bold uppercase tracking-widest text-white dark:text-agency-primary opacity-60">Successes</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section - Premium Bento Style */}
            <section className="bg-agency-secondary dark:bg-agency-dark py-40 border-t border-agency-primary/5">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <header className="mb-24 text-center">
                        <span className="text-agency-accent font-bold uppercase tracking-[0.4em] text-xs mb-4 block">Manifesto</span>
                        <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-agency-primary dark:text-white">
                            Our Core <span className="opacity-30">Pillars</span>
                        </h2>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: 'Radical Innovation', desc: 'We don\'t follow trends; we set them through meticulous research and bold creative risks.', emoji: '🚀' },
                            { title: 'Obsessive Detail', desc: 'Every pixel, every line of code, and every interaction is scrutinized for absolute perfection.', emoji: '🎯' },
                            { title: 'Transparent Partnership', desc: 'We integrate with your team as partners, ensuring our results are perfectly aligned with your vision.', emoji: '🤝' }
                        ].map((value, i) => (
                            <AnimatedSection key={i} animation="slide-up" delay={i * 100} className="group p-10 rounded-[40px] border border-agency-primary/5 dark:border-white/5 bg-white dark:bg-black/20 hover:border-agency-accent transition-colors duration-500">
                                <span className="text-5xl mb-8 block">{value.emoji}</span>
                                <h3 className="text-2xl font-black uppercase tracking-tighter text-agency-primary dark:text-white mb-4 group-hover:text-agency-accent transition-colors">
                                    {value.title}
                                </h3>
                                <p className="text-agency-primary/60 dark:text-white/60 leading-relaxed">
                                    {value.desc}
                                </p>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section - Shared with Home Style */}
            <section className="bg-agency-primary dark:bg-white text-white dark:text-agency-primary py-40 text-center relative overflow-hidden">
                <div className="mx-auto max-w-4xl px-4 relative z-10">
                    <h2 className="text-6xl md:text-9xl font-black uppercase tracking-tighter mb-12">
                        Dream <br/>
                        <span className="italic opacity-30">Bigger.</span>
                    </h2>
                    <Link
                        href="/contact"
                        className="inline-flex h-20 px-12 items-center justify-center rounded-full bg-agency-accent text-agency-primary text-xl font-black uppercase tracking-tighter hover:scale-105 transition-all shadow-2xl"
                    >
                        START YOUR PROJECT
                    </Link>
                </div>
                
                {/* Background Large Text */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full opacity-[0.05] pointer-events-none select-none">
                    <span className="text-[30vw] font-black uppercase whitespace-nowrap">CONTACT US</span>
                </div>
            </section>
        </MainLayout>
    );
}
