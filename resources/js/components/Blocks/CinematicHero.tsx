import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface Slide {
    title: string;
    subtitle: string;
    tagline: string;
    image: string;
}

interface CinematicHeroProps {
    slides: Slide[];
    autoPlayInterval?: number;
}

/**
 * Premium Cinematic Hero Slider
 * - Smooth crossfade transitions with Ken Burns effect
 * - Elegant text animations with blur and slide effects
 * - Auto-plays with pause on hover
 * - Click/tap navigation
 */
export const CinematicHero: React.FC<CinematicHeroProps> = ({ 
    slides = [], 
    autoPlayInterval = 6000 
}) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [previousIndex, setPreviousIndex] = useState<number | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [textVisible, setTextVisible] = useState(true);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    
    const slideCount = slides.length || 1;
    const currentSlide = slides[activeIndex] || slides[0];
    const titleWords = useMemo(() => currentSlide?.title?.split(' ') || [], [currentSlide?.title]);

    // Go to specific slide with smooth text transition
    const goToSlide = useCallback((index: number) => {
        if (isAnimating || index === activeIndex) return;
        
        setIsAnimating(true);
        setTextVisible(false); // Fade out text first
        
        // Wait for text to fade out, then switch slide
        setTimeout(() => {
            setPreviousIndex(activeIndex);
            setActiveIndex(index);
            
            // Fade text back in after image starts transitioning
            setTimeout(() => {
                setTextVisible(true);
                setTimeout(() => setIsAnimating(false), 1200);
            }, 400);
        }, 500);
    }, [isAnimating, activeIndex]);

    // Go to next slide
    const nextSlide = useCallback(() => {
        goToSlide((activeIndex + 1) % slideCount);
    }, [activeIndex, slideCount, goToSlide]);

    // Auto-play functionality
    useEffect(() => {
        if (slides.length <= 1) return;
        
        intervalRef.current = setInterval(nextSlide, autoPlayInterval);
        
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [nextSlide, autoPlayInterval, slides.length]);

    // Pause auto-play on hover
    const handleMouseEnter = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const handleMouseLeave = () => {
        if (slides.length > 1 && !intervalRef.current) {
            intervalRef.current = setInterval(nextSlide, autoPlayInterval);
        }
    };

    if (!slides || slides.length === 0) {
        return null;
    }

    return (
        <section 
            className="relative w-full h-screen overflow-hidden bg-black"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Background Images with Premium Crossfade + Ken Burns */}
            <div className="absolute inset-0">
                {slides.map((slide, idx) => {
                    const isActive = idx === activeIndex;
                    const isPrevious = idx === previousIndex;
                    
                    return (
                        <div
                            key={idx}
                            className={cn(
                                "absolute inset-0 w-full h-full",
                                "transition-all duration-[1800ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
                                isActive && "opacity-100 z-20",
                                isPrevious && "opacity-0 z-10",
                                !isActive && !isPrevious && "opacity-0 z-0"
                            )}
                            style={{ 
                                backgroundImage: `url('${slide.image}')`, 
                                backgroundSize: 'cover',
                                backgroundPosition: 'center 40%',
                                transform: isActive ? 'scale(1.02)' : 'scale(1.08)',
                            }}
                        >
                            {/* Multi-layer cinematic overlays */}
                            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black/90" />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
                            <div className="absolute inset-0 bg-black/10" style={{ backdropFilter: 'saturate(1.2)' }} />
                        </div>
                    );
                })}
            </div>

            {/* Animated Vignette Effect */}
            <div className="absolute inset-0 z-30 pointer-events-none">
                <div className="absolute inset-0 shadow-[inset_0_0_200px_rgba(0,0,0,0.8)]" />
            </div>

            {/* Content Layer */}
            <div 
                className={cn(
                    "relative z-40 h-full w-full max-w-[1920px] mx-auto p-8 md:p-24 flex flex-col justify-between pointer-events-none",
                    "transition-all duration-700 ease-out",
                    textVisible ? "opacity-100" : "opacity-0"
                )}
            >
                {/* Header: Title + Tagline */}
                <div className="flex flex-col md:flex-row justify-between items-start w-full gap-8">
                    <div className="overflow-visible">
                        <h1 
                            key={`title-${activeIndex}`}
                            className="font-display font-black text-4xl md:text-6xl lg:text-7xl text-primary leading-[0.9] tracking-tighter uppercase max-w-4xl drop-shadow-2xl flex flex-wrap gap-x-4"
                        >
                            {titleWords.map((word, i) => (
                                <span 
                                    key={`${activeIndex}-${i}`} 
                                    className={cn(
                                        "inline-block",
                                        textVisible && "animate-text-reveal"
                                    )}
                                    style={{ 
                                        animationDelay: `${i * 0.12}s`,
                                        textShadow: '0 4px 30px rgba(0,0,0,0.5), 0 0 60px rgba(var(--primary-rgb), 0.3)'
                                    }}
                                >
                                    {word}
                                </span>
                            ))}
                        </h1>
                    </div>

                    <div 
                        key={`tagline-${activeIndex}`}
                        className={cn(
                            "mt-4 md:mt-12 border-l-4 border-primary pl-6 py-2 shrink-0",
                            textVisible && "animate-slide-fade-in"
                        )}
                        style={{ animationDelay: '0.4s' }}
                    >
                        <div 
                            className="font-sans font-bold text-lg md:text-xl text-white tracking-[0.2em] uppercase"
                            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
                        >
                            {currentSlide.tagline}
                        </div>
                    </div>
                </div>

                {/* Footer: Progress + Subtitle */}
                <div className="flex flex-col md:flex-row justify-between items-end w-full gap-12">
                    {/* Navigation Dots */}
                    <div className="hidden md:flex flex-col gap-4 mb-12 pointer-events-auto">
                        {slides.map((_, idx) => (
                            <button 
                                key={idx} 
                                className="flex items-center gap-4 group cursor-pointer transition-transform duration-300 hover:translate-x-1"
                                onClick={() => goToSlide(idx)}
                                aria-label={`Go to slide ${idx + 1}`}
                            >
                                <span className={cn(
                                    "font-mono text-xs transition-all duration-500", 
                                    idx === activeIndex 
                                        ? "text-primary scale-110 font-bold" 
                                        : "text-white/30 group-hover:text-white/70"
                                )}>
                                    0{idx + 1}
                                </span>
                                <div className="h-10 w-[3px] bg-white/10 relative overflow-hidden rounded-full">
                                    <div 
                                        className={cn(
                                            "absolute top-0 left-0 w-full bg-primary rounded-full",
                                            "transition-all duration-700 ease-out"
                                        )}
                                        style={{ 
                                            height: idx === activeIndex ? '100%' : '0%',
                                            boxShadow: idx === activeIndex ? '0 0 12px rgba(var(--primary-rgb), 0.6)' : 'none'
                                        }}
                                    />
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Subtitle */}
                    <div 
                        key={`subtitle-${activeIndex}`}
                        className={cn(
                            "max-w-xl text-right",
                            textVisible && "animate-slide-fade-in"
                        )}
                        style={{ animationDelay: '0.6s' }}
                    >
                        <p 
                            className="font-sans text-lg md:text-2xl text-white/90 font-light leading-relaxed tracking-tight"
                            style={{ textShadow: '0 2px 15px rgba(0,0,0,0.4)' }}
                        >
                            {currentSlide.subtitle}
                        </p>
                        <div 
                            className={cn(
                                "h-[2px] mt-6 w-full rounded-full",
                                "bg-gradient-to-r from-transparent via-primary/60 to-primary",
                                textVisible && "animate-line-expand"
                            )}
                            style={{ 
                                animationDelay: '0.9s',
                                boxShadow: '0 0 20px rgba(var(--primary-rgb), 0.4)'
                            }}
                        />
                    </div>
                </div>

                {/* Mobile Navigation Dots */}
                <div className="flex md:hidden justify-center gap-3 absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-auto">
                    {slides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => goToSlide(idx)}
                            className={cn(
                                "h-2 rounded-full transition-all duration-500",
                                idx === activeIndex 
                                    ? "bg-primary w-10 shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" 
                                    : "bg-white/25 w-2 hover:bg-white/50"
                            )}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
            </div>

            {/* Premium CSS Animations */}
            <style>{`
                @keyframes text-reveal {
                    0% {
                        opacity: 0;
                        transform: translateY(40px) rotateX(15deg);
                        filter: blur(12px);
                    }
                    50% {
                        filter: blur(4px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0) rotateX(0deg);
                        filter: blur(0);
                    }
                }
                
                @keyframes slide-fade-in {
                    0% {
                        opacity: 0;
                        transform: translateX(30px);
                        filter: blur(8px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateX(0);
                        filter: blur(0);
                    }
                }
                
                @keyframes line-expand {
                    0% {
                        opacity: 0;
                        transform: scaleX(0);
                        transform-origin: right;
                    }
                    100% {
                        opacity: 1;
                        transform: scaleX(1);
                        transform-origin: right;
                    }
                }
                
                .animate-text-reveal {
                    opacity: 0;
                    animation: text-reveal 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                
                .animate-slide-fade-in {
                    opacity: 0;
                    animation: slide-fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                
                .animate-line-expand {
                    opacity: 0;
                    animation: line-expand 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </section>
    );
};

export default CinematicHero;
