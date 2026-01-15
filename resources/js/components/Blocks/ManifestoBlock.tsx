import React from 'react';
import AnimatedSection from '@/components/AnimatedSection';

interface ManifestoBlockProps {
    title: string;
    subtitle: string;
    items: Array<{
        emoji: string;
        title: string;
        desc: string;
    }>;
}

const ManifestoBlock: React.FC<ManifestoBlockProps> = ({ title, subtitle, items }) => {
    return (
        <section className="py-24 bg-muted/20 dark:bg-black/40 px-4">
            <div className="max-w-7xl mx-auto">
                <AnimatedSection animation="fade-up" className="text-center mb-20">
                    <span className="inline-block px-4 py-1.5 mb-8 text-xs font-bold uppercase tracking-[0.3em] text-primary bg-primary/10 rounded-full border border-primary/20">
                        {subtitle}
                    </span>
                    <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-foreground leading-none">
                        {title}
                    </h2>
                </AnimatedSection>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {(items || []).map((pillar, i) => (
                        <AnimatedSection key={i} animation="fade-up" delay={i * 200}>
                            <div className="group h-full p-10 rounded-[40px] bg-white dark:bg-white/5 border border-border/50 dark:border-white/5 hover:bg-primary dark:hover:bg-primary transition-all duration-500 overflow-hidden relative">
                                <div className="text-5xl mb-8 group-hover:scale-110 transition-transform duration-500">{pillar.emoji}</div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter text-foreground group-hover:text-primary-foreground mb-4 transition-colors duration-300">{pillar.title}</h3>
                                <p className="text-muted-foreground group-hover:text-primary-foreground/80 font-medium leading-relaxed transition-colors duration-300">
                                    {pillar.desc}
                                </p>
                            </div>
                        </AnimatedSection>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ManifestoBlock;
