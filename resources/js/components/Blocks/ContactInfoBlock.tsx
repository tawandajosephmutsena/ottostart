import React from 'react';
import AnimatedSection from '@/components/AnimatedSection';
import { usePage } from '@inertiajs/react';
import { SharedData } from '@/types';

interface ContactInfoBlockProps {
    title: string;
    subtitle: string;
    items: Array<{
        label: string;
        value: string;
        href?: string;
    }>;
    office_hours: string[];
    show_map?: boolean;
    google_maps_url?: string;
}

const ContactInfoBlock: React.FC<ContactInfoBlockProps> = ({ title, subtitle, items, office_hours, show_map, google_maps_url }) => {
    const { props } = usePage<SharedData>();
    const site = props.site;
    
    // Resolve combined settings: Block settings override Global settings
    const blockShowMap = show_map as any;
    const activeShowMap = show_map != null ? blockShowMap : (site?.contact?.show_map ?? true);
    const activeMapsUrl = google_maps_url || site?.contact?.google_maps_url;
    
    // Convert to normalized boolean if they are strings
    const isVisible = activeShowMap === true || activeShowMap === 'true' || activeShowMap === 1 || activeShowMap === '1' || (activeShowMap === undefined && site?.contact?.show_map !== false);

    return (
        <div className="bg-white dark:bg-black">
            <section className="py-24 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                        <AnimatedSection animation="fade-right">
                            <span className="text-agency-accent font-bold uppercase tracking-[0.4em] text-xs mb-8 block">{subtitle}</span>
                            <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-agency-primary dark:text-white leading-none mb-12">
                                {title}
                            </h2>
                            <div className="space-y-12">
                                {(items || []).map((item, i) => (
                                    <div key={i}>
                                        <p className="text-xs font-bold uppercase tracking-widest text-agency-primary/40 dark:text-white/40 mb-4">{item.label}</p>
                                        {item.href ? (
                                            <a href={item.href} className="text-3xl md:text-4xl font-bold text-agency-primary dark:text-white hover:text-agency-accent transition-colors">
                                                {item.value}
                                            </a>
                                        ) : (
                                            <p className="text-3xl md:text-4xl font-bold text-agency-primary dark:text-white">
                                                {item.value}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </AnimatedSection>

                        <AnimatedSection animation="fade-left" delay={200}>
                            <div className="bg-muted/30 dark:bg-white/5 rounded-[40px] p-12 border border-black/5 dark:border-white/5">
                                <h3 className="text-xl font-black uppercase tracking-widest text-agency-primary dark:text-white mb-8 italic">Office Hours</h3>
                                <div className="space-y-4">
                                    {(office_hours || []).map((hour, i) => (
                                        <div key={i} className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-4">
                                            <span className="text-agency-primary/60 dark:text-white/60 font-medium">{hour}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </AnimatedSection>
                    </div>
                </div>
            </section>

            {/* Map Section */}
            {isVisible && activeMapsUrl && (
                <section className="pb-24 px-4 overflow-hidden">
                    <div className="max-w-7xl mx-auto">
                        <AnimatedSection animation="slide-up">
                            <div className="relative rounded-[60px] overflow-hidden h-[500px] border border-black/5 dark:border-white/5 shadow-2xl">
                                <iframe
                                    src={String(activeMapsUrl)}
                                    title="Google Maps"
                                    width="100%"
                                    height="100%"
                                    className="border-0"
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                />
                            </div>
                        </AnimatedSection>
                    </div>
                </section>
            )}
        </div>
    );
};

export default ContactInfoBlock;
