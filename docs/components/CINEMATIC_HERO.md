# Cinematic Hero Slider Documentation

This document contains all the code and configurations related to the **Cinematic Hero Slider** component.

## 1. Main Component (Logic & Structure)
**File Path:** `/resources/js/components/Blocks/CinematicHero.tsx`

```tsx
import React, { useRef, useState, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAPInit } from '@/hooks/useAnimations';
import { cn } from '@/lib/utils';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface Slide {
    title: string;
    subtitle: string;
    tagline: string;
    image: string;
}

interface CinematicHeroProps {
    slides: Slide[];
}

export const CinematicHero: React.FC<CinematicHeroProps> = ({ slides = [] }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const stickyRef = useRef<HTMLDivElement>(null);
    const topTextRef = useRef<HTMLDivElement>(null);
    const bottomTextRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    // Initial GSAP setup
    useGSAPInit();

    const currentSlide = slides[activeIndex] || slides[0];
    const titleWords = useMemo(() => currentSlide?.title?.split(' ') || [], [currentSlide?.title]);

    React.useEffect(() => {
        if (!containerRef.current || !stickyRef.current || !slides?.length) return;

        const images = gsap.utils.toArray<HTMLElement>(containerRef.current.querySelectorAll('.slide-image'));
        if (!images || images.length === 0) return;
        
        const slideCount = slides.length;
        
        // Create context for GSAP to handle scoping and cleanup
        const ctx = gsap.context(() => {
            // Set initial states FIRST before creating timeline
            images.forEach((img, i) => {
                if (i === 0) {
                    gsap.set(img, { opacity: 1, scale: 1, zIndex: 1 });
                } else {
                    gsap.set(img, { opacity: 0, scale: 1.05, zIndex: 0 });
                }
            });

            // FIXED: Proper scroll distance to keep section pinned
            // The page stays locked until all transitions complete
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top top',
                    end: () => `+=${window.innerHeight * slideCount * 2}`, // 2 viewport heights per slide
                    pin: stickyRef.current,
                    pinSpacing: true,
                    scrub: 1,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                    onUpdate: (self) => {
                        const p = self.progress;
                        const nextIndex = Math.min(Math.floor(p * slideCount), slideCount - 1);
                        setActiveIndex(prev => (nextIndex !== prev ? nextIndex : prev));
                    },
                },
            });

            // Parallax drift for text layers
            tl.to(topTextRef.current, { y: -80, opacity: 0.6, ease: 'none' }, 0);
            tl.to(bottomTextRef.current, { y: 40, opacity: 0.6, ease: 'none' }, 0);

            // Create smooth cross-fades spread across the entire timeline
            const transitionDuration = 1 / slideCount; // Each transition gets equal timeline space
            
            for (let i = 1; i < slideCount; i++) {
                const startPos = ((i - 1) / slideCount);
                // const endPos = (i / slideCount);
                const fadeStart = startPos + (transitionDuration * 0.3);

                // Fade out previous image
                tl.to(images[i - 1], {
                    opacity: 0,
                    scale: 1.1,
                    ease: 'power2.inOut',
                }, fadeStart);

                // Fade in current image
                tl.fromTo(images[i], {
                    opacity: 0,
                    scale: 1.05,
                }, {
                    opacity: 1,
                    scale: 1,
                    ease: 'power2.inOut',
                }, fadeStart);
            }

            // FIXED: Slower, more subtle breathing effect
            images.forEach((img, i) => {
                gsap.to(img, {
                    scale: '+=0.02', // Reduced from 0.04 for subtlety
                    duration: 20 + (i * 2), // Longer duration
                    ease: 'sine.inOut',
                    repeat: -1,
                    yoyo: true,
                });
            });
        }, containerRef);

        return () => ctx.revert();
    }, [slides]); 


    // Safety check for empty slides - AFTER all hooks
    if (!slides || slides.length === 0) {
        return null;
    }


    return (
        <div 
            ref={containerRef} 
            className="relative w-full bg-black overflow-hidden" 
        >
            <div ref={stickyRef} className="w-full h-screen overflow-hidden flex flex-col relative">
                {/* Background Layer */}
                <div className="absolute inset-0 z-0 bg-black">
                    {slides.map((slide, idx) => (
                        <div
                            key={idx}
                            className="slide-image absolute inset-0 w-full h-full"
                            style={{ 
                                backgroundImage: `url('${slide.image}')`, 
                                backgroundSize: 'cover',
                                backgroundPosition: 'center 40%',
                                opacity: idx === 0 ? 1 : 0,
                                transform: idx === 0 ? 'scale(1)' : 'scale(1.05)' // FIXED: Reduced initial scale
                            }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/90" />
                            <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/50" />
                        </div>
                    ))}
                </div>

                {/* Content Layer */}
                <div className="relative z-10 h-full w-full max-w-[1920px] mx-auto p-8 md:p-24 flex flex-col justify-between pointer-events-none">
                    
                    {/* Header: Title + Tagline */}
                    <div ref={topTextRef} className="flex flex-col md:flex-row justify-between items-start w-full gap-8">
                        <div className="overflow-visible">
                            <h1 className="font-display font-black text-5xl md:text-7xl lg:text-8xl text-primary leading-[0.85] tracking-tighter uppercase max-w-5xl drop-shadow-2xl flex flex-wrap gap-x-6">
                                {titleWords.map((word, i) => (
                                    <span 
                                        key={`${activeIndex}-${i}`} 
                                        className="inline-block transition-all duration-1000"
                                        style={{ 
                                            animation: `smoke-reveal 1.2s cubic-bezier(0.2, 0, 0.2, 1) ${i * 0.1}s both`,
                                            filter: 'drop-shadow(0 0 20px rgba(var(--primary), 0.3))'
                                        }}
                                    >
                                        {word}
                                    </span>
                                ))}
                            </h1>
                        </div>

                        <div className="mt-4 md:mt-12 border-l-4 border-primary pl-6 py-2 shrink-0">
                             <div className="font-sans font-bold text-xl md:text-2xl text-white tracking-[0.2em] uppercase opacity-90 transition-all duration-1000" style={{ animation: 'smoke-reveal 1.2s cubic-bezier(0.2, 0, 0.2, 1) 0.5s both' }}>
                                {currentSlide.tagline}
                            </div>
                        </div>
                    </div>

                    {/* Footer: Progress + Narrative */}
                    <div ref={bottomTextRef} className="flex flex-col md:flex-row justify-between items-end w-full gap-12">
                        {/* Custom Progress Indicator */}
                        <div className="hidden md:flex flex-col gap-6 mb-12">
                            {slides.map((_, idx) => (
                                <div key={idx} className="flex items-center gap-6">
                                    <span className={cn(
                                        "font-mono text-xs transition-all duration-700", 
                                        idx === activeIndex ? "text-primary scale-110 font-bold" : "text-white/20"
                                    )}>
                                        0{idx + 1}
                                    </span>
                                    <div className="h-10 w-[1px] bg-white/10 relative overflow-hidden">
                                        <div 
                                            className="absolute top-0 left-0 w-full bg-primary transition-all duration-700 ease-out" 
                                            style={{ height: idx === activeIndex ? '100%' : '0%' }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Slide Subtitle */}
                        <div className="max-w-2xl text-right">
                            <p className="font-sans text-xl md:text-3xl text-white/90 font-light leading-tight tracking-tight transition-all duration-1000" style={{ animation: 'smoke-reveal 1.2s cubic-bezier(0.2, 0, 0.2, 1) 0.7s both' }}>
                                {currentSlide.subtitle}
                            </p>
                            <div className="h-[1px] bg-primary/30 mt-8 w-full ml-auto transition-all duration-1000" style={{ animation: 'smoke-reveal 1.2s cubic-bezier(0.2, 0, 0.2, 1) 1s both' }} />
                        </div>
                    </div>

                    {/* Scroll Hint */}
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-30 hover:opacity-100 transition-opacity duration-500">
                        <div className="w-[1px] h-12 bg-primary relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse" />
                        </div>
                        <span className="font-mono text-[10px] text-white uppercase tracking-[0.6em]">Scroll to Witness</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CinematicHero;
```

## 2. Text Animation (CSS Keyframes)
**File Path:** `/resources/css/app.css`

```css
@keyframes smoke-reveal {
    0% {
        opacity: 0;
        filter: blur(40px);
        transform: translate3d(50px, 20px, 0) scale(1.1) skewX(-10deg);
    }
    30% {
        opacity: 0.5;
        filter: blur(20px);
    }
    100% {
        opacity: 1;
        filter: blur(0);
        transform: translate3d(0, 0, 0) scale(1) skewX(0);
    }
}
```

## 3. Block Structure Type Definition
**File Path:** `/resources/js/types/page-blocks.d.ts`

```typescript
export interface CinematicHeroBlock extends BaseBlock {
    type: 'cinematic_hero';
    content: {
        slides: Array<{
            title: string;
            subtitle: string;
            tagline: string;
            image: string;
        }>;
    };
}
```

## 4. Integration Logic
**File Path:** `/resources/js/components/Blocks/BlockRenderer.tsx`

```tsx
case 'cinematic_hero':
    return <CinematicHero key={block.id} slides={(block.content.slides as any) || []} />;
```

## 5. Animation Helper Dependency
**File Path:** `/resources/js/hooks/useAnimations.ts`

```typescript
export const useGSAPInit = () => {
    useEffect(() => {
        if (typeof window === 'undefined') return;
        gsap.defaults({
            ease: 'power2.out',
            duration: 0.6,
        });
        const handleResize = () => ScrollTrigger.refresh();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
};
```
