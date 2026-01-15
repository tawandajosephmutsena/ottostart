import React from 'react';
import AnimatedSection from '@/components/AnimatedSection';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface FAQBlockProps {
    title: string;
    subtitle: string;
    items: Array<{
        q: string;
        a: string;
    }>;
}

const FAQBlock: React.FC<FAQBlockProps> = ({ title, subtitle, items }) => {
    return (
        <section className="py-24 bg-muted/20 dark:bg-black/40 px-4">
            <div className="max-w-4xl mx-auto">
                <AnimatedSection animation="fade-up" className="text-center mb-16">
                    <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold uppercase tracking-[0.3em] text-primary bg-primary/10 rounded-full border border-primary/20">
                        {subtitle}
                    </span>
                    <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-foreground leading-none">
                        {title}
                    </h2>
                </AnimatedSection>

                <AnimatedSection animation="fade-up" delay={200}>
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {(items || []).map((item, i) => (
                            <AccordionItem key={i} value={`item-${i}`} className="border border-border/50 dark:border-white/5 bg-white dark:bg-white/5 rounded-[2rem] px-8 py-2 overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                                <AccordionTrigger className="text-xl md:text-2xl font-bold text-foreground hover:no-underline text-left leading-tight py-6 group">
                                    <span className="group-data-[state=open]:text-primary transition-colors">{item.q}</span>
                                </AccordionTrigger>
                                <AccordionContent className="text-lg text-muted-foreground font-medium pb-8 pt-2 leading-relaxed">
                                    {item.a}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </AnimatedSection>
            </div>
        </section>
    );
};

export default FAQBlock;
