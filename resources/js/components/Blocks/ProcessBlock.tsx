import React from 'react';
import AnimatedSection from '@/components/AnimatedSection';

interface ProcessBlockProps {
    title: string;
    subtitle: string;
    items: Array<{
        step: string;
        title: string;
        desc: string;
    }>;
}

const ProcessBlock: React.FC<ProcessBlockProps> = ({ title, subtitle, items }) => {
    return (
        <section className="py-24 bg-white dark:bg-black px-4">
            <div className="max-w-7xl mx-auto">
                <AnimatedSection animation="fade-up" className="mb-20">
                    <span className="text-agency-accent font-bold uppercase tracking-[0.4em] text-xs mb-8 block">{subtitle}</span>
                    <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-agency-primary dark:text-white leading-none">
                        {title}
                    </h2>
                </AnimatedSection>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-20">
                    {(items || []).map((item, i) => (
                        <AnimatedSection key={i} animation="fade-up" delay={i * 100}>
                            <div className="relative group">
                                <div className="text-8xl font-black text-agency-primary/5 dark:text-white/5 absolute -top-12 -left-4 group-hover:text-agency-accent/10 transition-colors duration-500">{item.step}</div>
                                <div className="relative pt-4">
                                    <h3 className="text-2xl font-black uppercase tracking-tighter text-agency-primary dark:text-white mb-4 group-hover:text-agency-accent transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="text-agency-primary/60 dark:text-white/60 font-medium leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        </AnimatedSection>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProcessBlock;
