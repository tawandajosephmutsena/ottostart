import React from 'react';
import { Link } from '@inertiajs/react';

interface CtaBlockProps {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaHref: string;
    email: string;
}

const CtaBlock: React.FC<CtaBlockProps> = ({ title, subtitle, ctaText, ctaHref, email }) => {
    return (
        <section className="bg-white dark:bg-[#0a0a0a] py-40 relative overflow-hidden border-t">
            <div className="mx-auto max-w-7xl px-4 flex flex-col items-center text-center relative z-10">
                <span className="text-agency-accent font-bold uppercase tracking-[0.4em] text-xs mb-8 block">{subtitle}</span>
                <h2 className="text-6xl md:text-9xl font-black uppercase tracking-tighter text-agency-primary dark:text-white leading-[0.8] mb-12">
                    {title}
                </h2>
                <div className="flex flex-col sm:flex-row items-center gap-8">
                    <Link href={ctaHref} className="group relative inline-flex items-center justify-center size-48 md:size-64 rounded-full bg-agency-accent text-agency-primary font-black text-xl tracking-tighter hover:scale-105 transition-all shadow-2xl shadow-agency-accent/30">
                        <span className="relative z-10">{ctaText}</span>
                    </Link>
                    <div className="text-left">
                        <p className="text-agency-primary/60 dark:text-white/60 mb-2 font-mono uppercase tracking-widest text-xs">Email us at</p>
                        <a href={`mailto:${email}`} className="text-2xl md:text-3xl font-bold dark:text-white hover:text-agency-accent transition-colors">{email}</a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CtaBlock;
