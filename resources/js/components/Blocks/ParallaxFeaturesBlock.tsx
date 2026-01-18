import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

interface FeatureItem {
    title: string;
    description: string;
    image?: string;
    icon?: string;
}

interface ParallaxFeaturesBlockProps {
    title?: string;
    subtitle?: string;
    items?: FeatureItem[];
    className?: string;
}

export const ParallaxFeaturesBlock: React.FC<ParallaxFeaturesBlockProps> = ({
    title,
    subtitle,
    items = [],
    className
}) => {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!sectionRef.current || items.length === 0) return;

        const ctx = gsap.context(() => {
            // Parallax effect for images
            const images = sectionRef.current?.querySelectorAll('.parallax-image');
            images?.forEach((img) => {
                gsap.fromTo(img, 
                    { y: -30 },
                    { 
                        y: 30,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: img,
                            start: 'top bottom',
                            end: 'bottom top',
                            scrub: true
                        }
                    }
                );
            });

            // Text reveal animation
            const textBlocks = sectionRef.current?.querySelectorAll('.text-reveal');
            textBlocks?.forEach((block) => {
                gsap.from(block, {
                    opacity: 0,
                    y: 50,
                    duration: 1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: block,
                        start: 'top 85%',
                        toggleActions: 'play none none reverse'
                    }
                });
            });
        }, sectionRef);

        return () => ctx.revert();
    }, [items]);

    return (
        <section 
            ref={sectionRef}
            className={cn("py-24 md:py-32 overflow-hidden bg-background", className)}
        >
            <div className="container mx-auto px-4 md:px-8">
                {(title || subtitle) && (
                    <div className="mb-20 text-center max-w-3xl mx-auto">
                        {subtitle && (
                            <span className="inline-block text-primary font-bold uppercase tracking-widest text-xs mb-4">
                                {subtitle}
                            </span>
                        )}
                        {title && (
                            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-6">
                                {title}
                            </h2>
                        )}
                    </div>
                )}

                <div className="space-y-32">
                    {items.map((item, index) => (
                        <div 
                            key={index}
                            className={cn(
                                "flex flex-col md:items-center gap-12 md:gap-24",
                                index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                            )}
                        >
                            {/* Image Part */}
                            <div className="flex-1 relative group">
                                <div className="relative aspect-[4/5] md:aspect-square overflow-hidden rounded-3xl bg-muted">
                                    {item.image ? (
                                        <img 
                                            src={item.image} 
                                            alt={item.title}
                                            className="parallax-image absolute inset-0 w-full h-[120%] object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                                            <div className="w-24 h-24 border-4 border-current rounded-full" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
                                </div>
                                <div 
                                    className={cn(
                                        "absolute -z-10 w-full h-full bg-primary/10 blur-3xl rounded-full opacity-50",
                                        index % 2 === 0 ? "-left-1/4 -top-1/4" : "-right-1/4 -bottom-1/4"
                                    )}
                                />
                            </div>

                            {/* Text Part */}
                            <div className="flex-1 space-y-8 text-reveal">
                                <div className="space-y-4">
                                    <div className="text-5xl md:text-7xl font-outline text-transparent opacity-10 font-black">
                                        0{index + 1}
                                    </div>
                                    <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
                                        {item.title}
                                    </h3>
                                </div>
                                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
                                    {item.description}
                                </p>
                                <div className="pt-4">
                                    <button className="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors">
                                        Learn More
                                        <div className="w-8 h-[2px] bg-foreground group-hover:bg-primary group-hover:w-12 transition-all duration-300" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ParallaxFeaturesBlock;
