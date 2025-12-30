import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import React from 'react';

interface ServiceItem {
    id: number;
    title: string;
    slug: string;
    description: string;
    icon?: string;
    featured_image?: string;
    price_range?: string;
}

interface ServicesSectionProps {
    services?: ServiceItem[];
    title?: string;
    subtitle?: string;
    className?: string;
    showViewAll?: boolean;
    useStackedCards?: boolean;
}

const defaultServices: ServiceItem[] = [
    {
        id: 1,
        title: 'UI/UX Design',
        slug: 'ui-ux-design',
        description:
            'Creating intuitive and beautiful user experiences that captivate and convert your audience',
        icon: '🎨',
    },
    {
        id: 2,
        title: 'Web Development',
        slug: 'web-development',
        description:
            'Building fast, scalable, and modern web applications using cutting-edge technologies',
        icon: '💻',
    },
    {
        id: 3,
        title: 'Mobile Apps',
        slug: 'mobile-apps',
        description:
            'Native and cross-platform mobile solutions that deliver exceptional user experiences',
        icon: '📱',
    },
];

/**
 * Services Section component
 * Displays services either as stacked cards or regular grid
 */
export const ServicesSection: React.FC<ServicesSectionProps> = ({
    services = defaultServices,
    title = 'Our Services',
    subtitle = 'Expertise',
    className,
}) => {
    return (
        <section className={cn('bg-agency-primary text-agency-secondary dark:bg-white dark:text-agency-primary py-32 overflow-hidden', className)}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <header className="mb-24 flex flex-col md:flex-row justify-between items-end gap-8">
                    <div className="max-w-2xl">
                        <span className="text-agency-accent font-bold uppercase tracking-[0.2em] text-sm mb-6 block">
                            {subtitle}
                        </span>
                        <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85]">
                            {title.split(' ')[0]} <br/>
                            <span className="opacity-30 italic">{title.split(' ').slice(1).join(' ')}</span>
                        </h2>
                    </div>
                    <p className="text-xl md:text-2xl opacity-60 max-w-md font-light leading-relaxed">
                        We don't just build products. We create legacy-defining digital experiences.
                    </p>
                </header>

                <div className="flex flex-col border-t border-current/10">
                    {services.map((service, index) => (
                        <Link 
                            key={service.id}
                            href={`/services/${service.slug}`}
                            className="group flex flex-col md:flex-row items-start md:items-center justify-between py-12 border-b border-current/10 hover:bg-agency-accent hover:text-agency-primary transition-all duration-500 px-4 md:px-8 -mx-4 md:-mx-8 relative overflow-hidden"
                        >
                            <div className="flex items-center gap-8 relative z-10">
                                <span className="text-sm font-mono opacity-40">0{index + 1}</span>
                                <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter group-hover:translate-x-4 transition-transform duration-500">
                                    {service.title}
                                </h3>
                            </div>
                            
                            <div className="mt-4 md:mt-0 max-w-sm relative z-10 group-hover:translate-x-[-1rem] transition-transform duration-500">
                                <p className="text-lg opacity-60 group-hover:opacity-100 transition-opacity">
                                    {service.description}
                                </p>
                            </div>

                            <div className="absolute right-0 top-0 h-full aspect-square bg-agency-accent/20 flex items-center justify-center translate-x-full group-hover:translate-x-0 transition-transform duration-500">
                                <span className="material-symbols-outlined text-6xl">arrow_outward</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ServicesSection;
