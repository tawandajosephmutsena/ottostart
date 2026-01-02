import AnimatedSection from '@/components/AnimatedSection';
import { cn } from '@/lib/utils';
import React from 'react';

interface StatItem {
    value: string;
    label: string;
    suffix?: string;
}

interface StatsSectionProps {
    stats?: StatItem[] | {
        projects_completed?: number;
        services_offered?: number;
        insights_published?: number;
        years_experience?: number;
    };
    title?: string;
    subtitle?:string;
    className?: string;
}

const defaultStats: StatItem[] = [
    { value: '150', label: 'Projects Completed', suffix: '+' },
    { value: '50', label: 'Happy Clients', suffix: '+' },
    { value: '5', label: 'Years Experience', suffix: '+' },
    { value: '24/7', label: 'Support' },
];

/**
 * Stats Section component with animated counters
 * Displays key statistics with scroll-triggered animations
 */
export const StatsSection: React.FC<StatsSectionProps> = ({
    stats = [],
    title = 'By The Numbers',
    subtitle = 'Our Impact',
    className,
}) => {
    // Convert stats object to array if needed
    const statsArray: StatItem[] = Array.isArray(stats) 
        ? stats 
        : [
            { value: String(stats?.projects_completed || 0), label: 'Projects Completed', suffix: '+' },
            { value: String(stats?.services_offered || 0), label: 'Services Offered', suffix: '+' },
            { value: String(stats?.insights_published || 0), label: 'Insights Published', suffix: '+' },
            { value: String(stats?.years_experience || 5), label: 'Years Experience', suffix: '+' },
          ];

    // Ensure we have 4 stats by merging with defaults
    const displayStats = [
        ...statsArray,
        ...defaultStats.slice(statsArray.length)
    ].slice(0, 4);
    return (
        <section className={cn('bg-agency-secondary py-32 dark:bg-card/50', className)}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <header className="mb-16">
                    <span className="text-agency-accent font-bold uppercase tracking-widest text-sm mb-2 block animate-[bloom_1s_ease-out_0.2s_both]">
                        {subtitle}
                    </span>
                    <h2 className="text-5xl md:text-7xl font-bold text-agency-primary dark:text-white animate-[bloom_1s_ease-out_0.4s_both]">
                        {title} <br/>
                        <span className="opacity-40">defined by data.</span>
                    </h2>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
                    {/* Large Stat Box */}
                    <AnimatedSection 
                        animation="scale"
                        className="lg:col-span-7 bg-white dark:bg-[#161616] border border-current/5 p-12 rounded-3xl flex flex-col justify-between min-h-[400px] relative overflow-hidden group cursor-default"
                    >
                        <div className="relative z-10">
                            <div className="size-16 rounded-full bg-agency-accent/10 flex items-center justify-center text-agency-accent mb-8">
                                <span className="material-symbols-outlined text-4xl">groups</span>
                            </div>
                            <h3 className="text-xl uppercase tracking-widest opacity-40 font-bold mb-4">{displayStats[0].label}</h3>
                            <div className="text-9xl font-black text-agency-primary dark:text-white group-hover:scale-110 transition-transform origin-left duration-700">
                                {displayStats[0].value}<span className="text-agency-accent">{displayStats[0].suffix || '+'}</span>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-agency-accent/5 to-transparent pointer-none"></div>
                    </AnimatedSection>

                    {/* Accent Stat Box */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                        <AnimatedSection 
                            animation="scale"
                            delay={200}
                            className="flex-1 bg-agency-accent text-agency-primary p-12 rounded-3xl flex flex-col justify-between min-h-[250px] group transition-transform hover:-translate-y-2 cursor-default"
                        >
                            <div>
                                <span className="material-symbols-outlined text-4xl mb-4">bolt</span>
                                <h3 className="text-xl uppercase tracking-widest opacity-60 font-bold">{displayStats[1].label}</h3>
                            </div>
                            <div className="text-8xl font-black">{displayStats[1].value}{displayStats[1].suffix || '%'}</div>
                        </AnimatedSection>

                        <div className="grid grid-cols-2 gap-6">
                            <AnimatedSection 
                                animation="scale"
                                delay={400}
                                className="bg-white dark:bg-[#161616] border border-current/5 p-8 rounded-3xl group hover:shadow-2xl transition-all cursor-default"
                            >
                                <h3 className="text-sm uppercase tracking-widest opacity-40 font-bold mb-4 leading-tight">{displayStats[2].label}</h3>
                                <div className="text-5xl font-black text-agency-primary dark:text-white group-hover:text-agency-accent transition-colors">
                                    {displayStats[2].value}<span className="text-agency-accent">{displayStats[2].suffix || '+'}</span>
                                </div>
                            </AnimatedSection>

                            <AnimatedSection 
                                animation="scale"
                                delay={600}
                                className="bg-agency-primary text-agency-secondary p-8 rounded-3xl group hover:scale-105 transition-all cursor-default"
                            >
                                <h3 className="text-sm uppercase tracking-widest opacity-60 font-bold mb-4 leading-tight">{displayStats[3].label}</h3>
                                <div className="text-5xl font-black">{displayStats[3].value}</div>
                            </AnimatedSection>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default StatsSection;
