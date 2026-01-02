import React from 'react';
import OnboardingForm, { FormStep } from '@/components/ui/OnboardingForm';
import AnimatedSection from '@/components/AnimatedSection';
import { cn } from '@/lib/utils';

interface FormSectionProps {
    title: string;
    description?: string;
    steps: FormStep[];
    submitText?: string;
    className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
    title,
    description,
    steps,
    submitText,
    className,
}) => {
    return (
        <section className={cn('py-32 px-4 bg-agency-secondary/50 dark:bg-agency-secondary/5', className)}>
            <div className="mx-auto max-w-4xl">
                <AnimatedSection animation="fade">
                    <div className="mb-12 text-center">
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-agency-primary dark:text-white mb-4">
                            {title}
                        </h2>
                        {description && (
                            <p className="text-xl text-agency-primary/60 dark:text-white/60 max-w-2xl mx-auto italic">
                                "{description}"
                            </p>
                        )}
                    </div>
                </AnimatedSection>

                <AnimatedSection animation="slide-up" delay={200}>
                    <OnboardingForm steps={steps} submitText={submitText} />
                </AnimatedSection>
            </div>
        </section>
    );
};

export default FormSection;
