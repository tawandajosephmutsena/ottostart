import React from 'react';
import AnimatedSection from '@/components/AnimatedSection';

interface StoryBlockProps {
    title: string;
    subtitle: string;
    body: string;
    items: Array<{
        value: string;
        label: string;
    }>;
}

const StoryBlock: React.FC<StoryBlockProps> = ({ title, subtitle, body, items }) => {
    return (
        <section className="py-24 bg-white dark:bg-black overflow-hidden px-4">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <AnimatedSection animation="fade-right">
                        <span className="text-agency-accent font-bold uppercase tracking-[0.4em] text-xs mb-8 block">{subtitle}</span>
                        <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-agency-primary dark:text-white leading-none mb-10">
                            {title}
                        </h2>
                        <div className="grid grid-cols-2 gap-12">
                            {(items || []).map((item, i) => (
                                <div key={i}>
                                    <div className="text-4xl md:text-5xl font-black text-agency-primary dark:text-white mb-2">{item.value}</div>
                                    <p className="text-sm uppercase tracking-widest text-agency-primary/60 dark:text-white/60 font-bold">{item.label}</p>
                                </div>
                            ))}
                        </div>
                    </AnimatedSection>
                    
                    <AnimatedSection animation="fade-left" delay={200}>
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-agency-accent/5 rounded-[40px] blur-2xl group-hover:bg-agency-accent/10 transition-colors"></div>
                            <div className="relative space-y-8 text-xl md:text-2xl leading-relaxed text-agency-primary/80 dark:text-white/80 font-light italic">
                                <p>{body}</p>
                            </div>
                        </div>
                    </AnimatedSection>
                </div>
            </div>
        </section>
    );
};

export default StoryBlock;
