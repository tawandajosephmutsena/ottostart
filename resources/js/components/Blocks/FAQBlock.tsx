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
                    <span className="text-agency-accent font-bold uppercase tracking-[0.4em] text-xs mb-8 block">{subtitle}</span>
                    <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-agency-primary dark:text-white leading-none">
                        {title}
                    </h2>
                </AnimatedSection>

                <AnimatedSection animation="fade-up" delay={200}>
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {(items || []).map((item, i) => (
                            <AccordionItem key={i} value={`item-${i}`} className="border border-black/5 dark:border-white/5 bg-white dark:bg-white/5 rounded-3xl px-8 py-2 overflow-hidden">
                                <AccordionTrigger className="text-xl md:text-2xl font-bold text-agency-primary dark:text-white hover:no-underline text-left leading-tight py-6">
                                    {item.q}
                                </AccordionTrigger>
                                <AccordionContent className="text-lg text-agency-primary/60 dark:text-white/60 font-medium pb-8 pt-2">
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
