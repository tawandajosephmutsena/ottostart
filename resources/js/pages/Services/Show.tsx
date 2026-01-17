import AnimatedSection from '@/components/AnimatedSection';
import MainLayout from '@/layouts/MainLayout';
import { Service } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, ArrowRight } from 'lucide-react';
import React from 'react';
import ReactMarkdown from 'react-markdown';

interface Props {
    service: Service;
}

export default function ServiceShow({ service }: Props) {
    const content = (service.content as unknown as Record<string, unknown>) || {};
    const scope = (content.scope as string) || '';
    const body = (content.body as string) || '';

    return (
        <MainLayout title={`${service.title} - Avant-Garde Services`}>
            <Head title={service.title}>
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Service",
                        "name": service.title,
                        "description": service.description,
                        "image": service.featured_image,
                        "provider": {
                            "@type": "Organization",
                            "name": "Avant-Garde Creative",
                            "url": "https://avantgarde.test"
                        },
                        "offers": {
                            "@type": "Offer",
                            "priceCurrency": "USD",
                            "price": service.price_range || "Custom Quote"
                        }
                    })}
                </script>
            </Head>

            {/* Service Hero - Clean Version */}
            <section className="relative pt-48 pb-20 overflow-hidden bg-agency-primary text-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <Link href="/services" className="inline-flex items-center gap-2 text-agency-accent font-bold uppercase tracking-widest text-xs mb-12 hover:gap-4 transition-all">
                        <ArrowLeft className="h-4 w-4" /> Back to Services
                    </Link>
                    
                    <AnimatedSection animation="slide-up">
                        <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-[0.85] mb-8">
                            {service.title}
                        </h1>
                        <p className="text-2xl md:text-3xl text-white/60 font-light leading-relaxed max-w-3xl mx-auto">
                            {service.description}
                        </p>
                    </AnimatedSection>
                </div>
            </section>

            {/* Main Featured Image - Prominent Placement */}
            {service.featured_image && (
                <section className="bg-white dark:bg-agency-dark">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
                        <AnimatedSection animation="scale" className="aspect-[21/9] rounded-[40px] overflow-hidden shadow-2xl border-8 border-white dark:border-agency-dark">
                            <img src={service.featured_image} alt={service.title} className="w-full h-full object-cover" />
                        </AnimatedSection>
                    </div>
                </section>
            )}

            {/* Service Details */}
            <section className="bg-white dark:bg-agency-dark py-32">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
                        <div className="lg:col-span-2 space-y-20">
                            {/* The Scope Section */}
                            <div className="space-y-12">
                                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">The Scope.</h2>
                                <div className="prose prose-xl prose-agency dark:prose-invert max-w-none">
                                    {scope ? (
                                        <div className="text-agency-primary/80 dark:text-white/80">
                                            <ReactMarkdown>
                                                {scope}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        <p className="text-agency-primary/60 dark:text-white/60 italic">Detailed scope details coming soon...</p>
                                    )}
                                </div>
                            </div>

                            {/* Main Content Section */}
                            {body && (
                                <div className="space-y-12">
                                    <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Details.</h2>
                                    <div className="prose prose-xl prose-agency dark:prose-invert max-w-none">
                                        <div className="text-agency-primary/80 dark:text-white/80">
                                            <ReactMarkdown>
                                                {body}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar Info */}
                        <div className="space-y-12">
                            <div className="p-10 rounded-[40px] bg-agency-secondary dark:bg-white/5 border border-agency-primary/5 dark:border-white/5 sticky top-32">
                                <h3 className="text-3xl font-black uppercase tracking-tighter mb-8">What's Included</h3>
                                <ul className="space-y-6">
                                    {(content.features as string[] || [
                                        'Deep Strategic Analysis',
                                        'Custom Design Concepts',
                                        'Technical Implementation',
                                        'Performance Optimization',
                                        'Post-launch Support'
                                    ]).map((item, i) => (
                                        <li key={i} className="flex items-start gap-4 text-agency-primary/80 dark:text-white/80">
                                            <CheckCircle2 className="h-6 w-6 text-agency-accent shrink-0 mt-1" />
                                            <span className="font-medium text-lg">{item}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-12 pt-12 border-t border-agency-primary/10 dark:border-white/10">
                                    <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 text-agency-accent">Investment</h3>
                                    <p className="text-5xl font-black mb-8 dark:text-white">{service.price_range || 'Custom Quote'}</p>
                                    <Link 
                                        href="/contact" 
                                        className="flex h-16 w-full items-center justify-center rounded-full bg-agency-primary dark:bg-agency-accent text-white dark:text-agency-primary font-black uppercase tracking-widest text-sm hover:scale-[1.02] transition-all shadow-xl"
                                    >
                                        Inquire Now
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Success Stories Related CTA */}
            <section className="bg-agency-secondary dark:bg-[#0a0a0a] py-40">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-12 flex flex-col items-center">
                        See it in <br/>
                        <span className="italic opacity-30">Action.</span>
                    </h2>
                    <Link href="/portfolio" className="group inline-flex items-center gap-4 text-xl font-black uppercase tracking-tighter text-agency-primary dark:text-white hover:text-agency-accent transition-colors">
                        Browse our success stories <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                    </Link>
                </div>
            </section>
        </MainLayout>
    );
}
