import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface HorizontalItem {
    title: string;
    description: string;
    image?: string;
    tag?: string;
    link?: string;
}

interface GSAPHorizontalScrollBlockProps {
    title?: string;
    subtitle?: string;
    items?: HorizontalItem[];
    className?: string;
    backgroundColor?: string;
}

export const GSAPHorizontalScrollBlock: React.FC<GSAPHorizontalScrollBlockProps> = ({
    title,
    subtitle,
    items = [],
    className,
    backgroundColor
}) => {
    const triggerRef = useRef<HTMLDivElement>(null);
    const pinRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (triggerRef.current && backgroundColor) {
            triggerRef.current.style.setProperty('--bg-color', backgroundColor);
        }
    }, [backgroundColor]);

    useEffect(() => {
        const trigger = triggerRef.current;
        const pin = pinRef.current;
        if (!pin || !trigger || items.length === 0) return;
        
        const ctx = gsap.context(() => {
            gsap.to(pin, {
                x: () => -(pin.scrollWidth - window.innerWidth),
                ease: 'none',
                scrollTrigger: {
                    trigger: trigger,
                    pin: true,
                    pinSpacing: true, // Explicitly reserve space
                    scrub: 1,
                    start: 'top top',
                    end: () => `+=${pin.scrollWidth}`,
                    invalidateOnRefresh: true,
                    anticipatePin: 1,
                    refreshPriority: 1, // Calculate this before elements below it
                    onUpdate: (self) => {
                        // Ensure high z-index when active to prevent overlapping
                        if (self.isActive) {
                            trigger.style.zIndex = '50';
                        } else {
                            trigger.style.zIndex = 'auto';
                        }
                    }
                }
            });

            // Animate headers partially
            gsap.from('.horizontal-header', {
                opacity: 0,
                y: 100,
                duration: 1,
                scrollTrigger: {
                    trigger: trigger,
                    start: 'top 80%',
                }
            });

            // Refresh ScrollTrigger when images load to ensure correct width calculations
            const images = pin.querySelectorAll('img');
            let loadedCount = 0;
            const handleImageLoad = () => {
                loadedCount++;
                if (loadedCount === images.length) {
                    ScrollTrigger.refresh();
                }
            };

            images.forEach(img => {
                if (img.complete) {
                    handleImageLoad();
                } else {
                    img.addEventListener('load', handleImageLoad, { once: true });
                }
            });

            // Final refresh after a short delay to catch any late layout shifts
            const timer = setTimeout(() => ScrollTrigger.refresh(), 1000);
            return () => clearTimeout(timer);
        }, triggerRef);

        return () => {
            ctx.revert();
            const images = pin.querySelectorAll('img');
            images.forEach(img => img.removeEventListener('load', () => {}));
        };
    }, [items]);

    return (
        <section 
            ref={triggerRef}
            className={cn("relative overflow-hidden", className)}
        >
            <div className="min-h-screen flex flex-col justify-center bg-[var(--bg-color)]">
                {(title || subtitle) && (
                    <div className="horizontal-header container mx-auto px-4 md:px-8 mb-12">
                        {subtitle && (
                            <span className="text-primary font-bold uppercase tracking-widest text-xs mb-4 block">
                                {subtitle}
                            </span>
                        )}
                        {title && (
                            <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none">
                                {title}
                            </h2>
                        )}
                    </div>
                )}

                <div ref={pinRef} className="flex gap-8 px-4 md:px-8 w-max flex-nowrap pb-20">
                    {items.map((item, index) => (
                        <div 
                            key={index}
                            className="w-[300px] md:w-[600px] shrink-0 group relative overflow-hidden rounded-3xl bg-muted aspect-[16/10]"
                        >
                            {item.image ? (
                                <img 
                                    src={item.image} 
                                    alt={item.title}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
                            )}
                            
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-8 flex flex-col justify-end transform transition-transform duration-500 group-hover:translate-y-[-10px]">
                                {item.tag && (
                                    <span className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
                                        {item.tag}
                                    </span>
                                )}
                                <h3 className="text-2xl md:text-4xl font-bold text-white mb-4">
                                    {item.title}
                                </h3>
                                <p className="text-white/70 line-clamp-2 mb-6 max-w-md hidden md:block">
                                    {item.description}
                                </p>
                                <a 
                                    href={item.link || '#'}
                                    className="flex items-center gap-2 text-white font-bold group/btn"
                                >
                                    View Details
                                    <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center transition-all group-hover/btn:bg-white group-hover/btn:text-black">
                                        <ArrowRight className="h-4 w-4" />
                                    </div>
                                </a>
                            </div>
                        </div>
                    ))}
                    
                    {/* Final call to action or spacer */}
                    <div className="w-[300px] md:w-[600px] shrink-0 flex items-center justify-center">
                        <div className="text-center group cursor-pointer">
                            <h3 className="text-3xl md:text-6xl font-black uppercase transition-colors group-hover:text-primary">
                                See All <br /> Projects
                            </h3>
                            <div className="mt-8 mx-auto w-20 h-20 rounded-full bg-primary flex items-center justify-center transition-transform group-hover:scale-125">
                                <ArrowRight className="h-8 w-8 text-primary-foreground" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default GSAPHorizontalScrollBlock;
