import AnimatedSection from '@/components/AnimatedSection';
import MainLayout from '@/layouts/MainLayout';
import { Link } from '@inertiajs/react';

export default function Services() {
    const services = [
        {
            title: 'UI/UX Design',
            description: 'Creating intuitive and beautiful user experiences that engage and convert.',
            features: ['User Research', 'Wireframing', 'Prototyping', 'Visual Design', 'Usability Testing'],
            icon: '🎨'
        },
        {
            title: 'Web Development',
            description: 'Building fast, scalable, and modern web applications with cutting-edge technology.',
            features: ['Frontend Development', 'Backend Development', 'API Integration', 'Performance Optimization', 'SEO'],
            icon: '💻'
        },
        {
            title: 'Mobile Apps',
            description: 'Native and cross-platform mobile solutions for iOS and Android.',
            features: ['iOS Development', 'Android Development', 'React Native', 'Flutter', 'App Store Optimization'],
            icon: '📱'
        },
        {
            title: 'E-commerce',
            description: 'Complete e-commerce solutions that drive sales and enhance customer experience.',
            features: ['Online Stores', 'Payment Integration', 'Inventory Management', 'Analytics', 'Marketing Tools'],
            icon: '🛒'
        },
        {
            title: 'Branding',
            description: 'Comprehensive brand identity design that makes your business stand out.',
            features: ['Logo Design', 'Brand Guidelines', 'Marketing Materials', 'Brand Strategy', 'Visual Identity'],
            icon: '🎯'
        },
        {
            title: 'Digital Marketing',
            description: 'Strategic digital marketing campaigns that grow your online presence.',
            features: ['SEO/SEM', 'Social Media', 'Content Marketing', 'Email Marketing', 'Analytics'],
            icon: '📈'
        }
    ];

    return (
        <MainLayout title="Our Services - Avant-Garde">
            {/* Immersive Hero Section */}
            <section className="bg-white dark:bg-agency-dark pt-40 pb-32 relative overflow-hidden">
                {/* Background Branding Marquee */}
                <div className="absolute top-20 left-0 w-full overflow-hidden opacity-[0.03] select-none pointer-events-none">
                    <span className="text-[20vw] font-black uppercase whitespace-nowrap leading-none block marquee">
                        SERVICES SERVICES SERVICES SERVICES
                    </span>
                </div>

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="max-w-4xl">
                        <span className="text-agency-accent font-bold uppercase tracking-[0.4em] text-xs mb-8 block">Our Expertise</span>
                        <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-[0.85] text-agency-primary dark:text-white mb-12">
                            Digital <br/>
                            <span className="opacity-30 italic">Artistry.</span>
                        </h1>
                        <p className="text-xl md:text-3xl text-agency-primary/60 dark:text-white/60 leading-relaxed font-light">
                            We provide a comprehensive suite of digital services designed to 
                            propel your brand into the future. From concept to code, we deliver excellence.
                        </p>
                    </div>
                </div>
            </section>

            {/* Services Artistic Grid */}
            <section className="bg-agency-secondary dark:bg-[#0a0a0a] py-40 border-t border-agency-primary/5">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.map((service, i) => (
                            <AnimatedSection 
                                key={service.title} 
                                animation="slide-up" 
                                delay={i * 100}
                                className="group relative p-12 rounded-[40px] bg-white dark:bg-black/20 border border-agency-primary/5 dark:border-white/5 hover:border-agency-accent transition-all duration-500 hover:-translate-y-2 overflow-hidden"
                            >
                                {/* Decorative Number */}
                                <span className="absolute top-8 right-8 text-4xl font-black opacity-5 group-hover:opacity-20 transition-opacity">0{i + 1}</span>
                                
                                <div className="size-16 rounded-2xl bg-agency-accent/10 flex items-center justify-center text-4xl mb-8 group-hover:scale-110 transition-transform duration-500">
                                    {service.icon}
                                </div>
                                <h3 className="text-3xl font-black uppercase tracking-tighter text-agency-primary dark:text-white mb-6">
                                    {service.title}
                                </h3>
                                <p className="text-agency-primary/60 dark:text-white/60 mb-8 font-light leading-relaxed">
                                    {service.description}
                                </p>
                                <ul className="space-y-3 pt-8 border-t border-agency-primary/5 dark:border-white/5">
                                    {service.features.map(f => (
                                        <li key={f} className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-agency-primary/40 dark:text-white/40 group-hover:text-agency-accent transition-colors">
                                            <span className="size-1.5 rounded-full bg-agency-accent"></span>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* Premium Process Section */}
            <section className="bg-white dark:bg-agency-dark py-40">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row justify-between items-end gap-12 mb-32">
                        <div className="max-w-2xl">
                            <span className="text-agency-accent font-bold uppercase tracking-[0.4em] text-xs mb-4 block">Workflow</span>
                            <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-agency-primary dark:text-white">
                                The <span className="opacity-30 italic">Process.</span>
                            </h2>
                        </div>
                        <p className="text-xl text-agency-primary/60 dark:text-white/60 max-w-md text-right">
                            Our methodology is as refined as our output, ensuring a seamless journey from idea to impact.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                        {[
                            { step: '01', title: 'Discovery', desc: 'Decoding your vision and user needs.' },
                            { step: '02', title: 'Strategy', desc: 'Crafting the blueprint for success.' },
                            { step: '03', title: 'Artistry', desc: 'Building perfection through design & code.' },
                            { step: '04', title: 'Infinity', desc: 'Launching and evolving your digital asset.' }
                        ].map((p, i) => (
                            <AnimatedSection key={i} animation="slide-up" delay={i * 100} className="relative pt-12">
                                <span className="text-9xl font-black absolute top-0 left-0 leading-none opacity-[0.03] select-none">{p.step}</span>
                                <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 relative z-10">{p.title}</h3>
                                <p className="text-agency-primary/60 dark:text-white/60 relative z-10 leading-relaxed">{p.desc}</p>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Shared Component/Style */}
            <section className="bg-agency-primary dark:bg-white text-white dark:text-agency-primary py-40 text-center relative overflow-hidden">
                <div className="mx-auto max-w-4xl px-4 relative z-10">
                    <h2 className="text-6xl md:text-9xl font-black uppercase tracking-tighter mb-12">
                        Get <br/>
                        <span className="italic opacity-30">Started.</span>
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
