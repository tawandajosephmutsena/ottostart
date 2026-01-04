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
 * Ultra-Premium Cinematic Hero Slider
 * - IntersectionObserver based entry and performance management
 * - Mouse-parallax for depth perception
 * - Smooth 3D text reveals with blur and staggering
 * - Auto-playing lifecycle tied to visibility
 * - Cinematic film grain and vignette effects
 */
export const CinematicHero: React.FC<CinematicHeroProps> = ({ 
    slides = [], 
    autoPlayInterval = 7000 
}) => {
    const sectionRef = useRef<HTMLElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [previousIndex, setPreviousIndex] = useState<number | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [textVisible, setTextVisible] = useState(true);
    const [isInView, setIsInView] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    
    const slideCount = slides.length || 1;
    const currentSlide = slides[activeIndex] || slides[0];
    const titleWords = useMemo(() => currentSlide?.title?.split(' ') || [], [currentSlide?.title]);

    // Intersection Observer to manage lifecycle
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsInView(entry.isIntersecting);
            },
            { threshold: 0.1 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // Mouse Parallax logic
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isInView) return;
        const { clientX, clientY } = e;
        const x = (clientX / window.innerWidth - 0.5) * 20; // max 20px move
        const y = (clientY / window.innerHeight - 0.5) * 20;
        setMousePos({ x, y });
    }, [isInView]);

    // Go to specific slide with fluid transition
    const goToSlide = useCallback((index: number) => {
        if (isAnimating || index === activeIndex) return;
        
        setIsAnimating(true);
        setTextVisible(false);
        
        setTimeout(() => {
            setPreviousIndex(activeIndex);
            setActiveIndex(index);
            
            setTimeout(() => {
                setTextVisible(true);
                setTimeout(() => setIsAnimating(false), 1200);
            }, 500);
        }, 600);
    }, [isAnimating, activeIndex]);

    const nextSlide = useCallback(() => {
        goToSlide((activeIndex + 1) % slideCount);
    }, [activeIndex, slideCount, goToSlide]);

    // Auto-play synced with visibility
    useEffect(() => {
        if (!isInView || slides.length <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }
        
        intervalRef.current = setInterval(nextSlide, autoPlayInterval);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isInView, nextSlide, autoPlayInterval, slides.length]);

    if (!slides || slides.length === 0) return null;

    return (
        <section 
            ref={sectionRef}
            className="relative w-full h-screen overflow-hidden bg-black"
            onMouseMove={handleMouseMove}
        >
            {/* Cinematic Noise/Grain Overlay */}
            <div className="absolute inset-0 z-50 pointer-events-none opacity-[0.03] mix-blend-overlay animate-grain" />

            {/* Background Layers with Mouse Parallax */}
            <div 
                className="absolute inset-[-5%] w-[110%] h-[110%] transition-transform duration-700 ease-out"
                style={{ 
                    transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0)`,
                }}
            >
                {slides.map((slide, idx) => {
                    const isActive = idx === activeIndex;
                    const isPrevious = idx === previousIndex;
                    
                    return (
                        <div
                            key={idx}
                            className={cn(
                                "absolute inset-0 w-full h-full",
                                "transition-all duration-[2000ms] ease-[cubic-bezier(0.23,1,0.32,1)]",
                                isActive && "opacity-100 z-20 scale-100",
                                isPrevious && "opacity-0 z-10 scale-105 blur-sm",
                                !isActive && !isPrevious && "opacity-0 z-0 scale-110"
                            )}
                            style={{ 
                                backgroundImage: `url('${slide.image}')`, 
                                backgroundSize: 'cover',
                                backgroundPosition: 'center 45%',
                            }}
                        >
                            {/* Sophisticated Cinematic Gradients */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/60" />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50" />
                            <div className="absolute inset-0 bg-black/5" style={{ backdropFilter: 'contrast(1.1) saturate(1.1)' }} />
                        </div>
                    );
                })}
            </div>

            {/* Content Layer (Inverse Parallax for Depth) */}
            <div 
                className={cn(
                    "relative z-40 h-full w-full max-w-[1920px] mx-auto p-8 md:p-24 pt-32 md:pt-40 flex flex-col justify-between pointer-events-none transition-all duration-1000",
                    isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                )}
                style={{
                    transform: `translate3d(${-mousePos.x * 0.5}px, ${-mousePos.y * 0.5}px, 0)`
                }}
            >
                {/* Header: Title + Tagline */}
                <div className="flex flex-col md:flex-row justify-between items-start w-full gap-8">
                    <div className="overflow-visible">
                        <h1 
                            key={`title-${activeIndex}`}
                            className="font-display font-black text-4xl md:text-6xl lg:text-8xl text-agency-accent leading-[0.85] tracking-tighter uppercase max-w-5xl drop-shadow-2xl flex flex-wrap gap-x-6"
                        >
                            {titleWords.map((word, i) => (
                                <span 
                                    key={`${activeIndex}-${i}`} 
                                    className={cn(
                                        "inline-block",
                                        textVisible && "animate-epic-reveal"
                                    )}
                                    style={{ 
                                        animationDelay: `${i * 0.15}s`,
                                        textShadow: '0 10px 40px rgba(0,0,0,0.6)'
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
                            "mt-4 md:mt-20 border-l-[6px] border-agency-accent pl-8 py-3 shrink-0",
                            textVisible && "animate-slide-left-reveal"
                        )}
                        style={{ animationDelay: '0.6s' }}
                    >
                        <div className="font-sans font-bold text-xl md:text-2xl text-white tracking-[0.3em] uppercase opacity-90">
                            {currentSlide.tagline}
                        </div>
                    </div>
                </div>

                {/* Footer: Progress + Subtitle */}
                <div className="flex flex-col md:flex-row justify-between items-end w-full gap-16">
                    {/* Navigation Dashboard */}
                    <div className="hidden md:flex flex-col gap-6 mb-12 pointer-events-auto">
                        {slides.map((_, idx) => (
                            <button 
                                key={idx} 
                                className="flex items-center gap-6 group cursor-pointer transition-all duration-300"
                                onClick={() => goToSlide(idx)}
                                aria-label={`Go to slide ${idx + 1}`}
                            >
                                <span className={cn(
                                    "font-mono text-sm transition-all duration-700", 
                                    idx === activeIndex 
                                        ? "text-agency-accent scale-125 font-bold translate-x-2" 
                                        : "text-white/20 group-hover:text-white/60"
                                )}>
                                    {String(idx + 1).padStart(2, '0')}
                                </span>
                                <div className="h-12 w-[4px] bg-white/5 relative overflow-hidden rounded-full">
                                    <div 
                                        className={cn(
                                            "absolute top-0 left-0 w-full bg-agency-accent rounded-full transition-all duration-1000 ease-out",
                                            idx === activeIndex ? "height-100 shadow-[0_0_20px_rgba(var(--agency-accent-rgb),0.8)]" : "height-0"
                                        )}
                                        style={{ height: idx === activeIndex ? '100%' : '0%' }}
                                    />
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Subtitle with elegant underline */}
                    <div 
                        key={`subtitle-${activeIndex}`}
                        className={cn(
                            "max-w-2xl text-right",
                            textVisible && "animate-slide-up-reveal"
                        )}
                        style={{ animationDelay: '0.8s' }}
                    >
                        <p className="font-sans text-xl md:text-3xl text-white/80 font-light leading-relaxed tracking-tight italic">
                            {currentSlide.subtitle}
                        </p>
                        <div className="mt-8 relative h-[3px] w-full bg-white/5 self-end overflow-hidden">
                            <div 
                                className={cn(
                                    "absolute inset-0 bg-gradient-to-r from-transparent via-agency-accent to-agency-accent transition-transform duration-[1.5s] ease-out-expo origin-right",
                                    textVisible ? "scale-x-100" : "scale-x-0"
                                )}
                            />
                        </div>
                    </div>
                </div>

                {/* Mobile Dash */}
                <div className="flex md:hidden justify-center gap-4 absolute bottom-12 left-1/2 -translate-x-1/2 pointer-events-auto">
                    {slides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => goToSlide(idx)}
                            className={cn(
                                "h-[3px] transition-all duration-700",
                                idx === activeIndex 
                                    ? "bg-agency-accent w-12" 
                                    : "bg-white/20 w-4"
                            )}
                        />
                    ))}
                </div>
            </div>

            {/* Premium Styles */}
            <style>{`
                @keyframes epic-reveal {
                    0% {
                        opacity: 0;
                        transform: translateY(100px) scale(1.1) rotateX(-20deg);
                        filter: blur(20px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0) scale(1) rotateX(0deg);
                        filter: blur(0);
                    }
                }
                
                @keyframes slide-left-reveal {
                    0% { opacity: 0; transform: translateX(50px); filter: blur(10px); }
                    100% { opacity: 1; transform: translateX(0); filter: blur(0); }
                }
                
                @keyframes slide-up-reveal {
                    0% { opacity: 0; transform: translateY(30px); filter: blur(5px); }
                    100% { opacity: 1; transform: translateY(0); filter: blur(0); }
                }

                @keyframes grain {
                    0%, 100% { transform: translate(0, 0); }
                    10% { transform: translate(-1%, -1%); }
                    30% { transform: translate(1%, 1%); }
                    50% { transform: translate(-1%, 1%); }
                    70% { transform: translate(1%, -1%); }
                }

                .animate-epic-reveal {
                    opacity: 0;
                    animation: epic-reveal 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                
                .animate-slide-left-reveal {
                    opacity: 0;
                    animation: slide-left-reveal 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                
                .animate-slide-up-reveal {
                    opacity: 0;
                    animation: slide-up-reveal 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }

                .animate-grain {
                    background-image: url('https://grainy-gradients.vercel.app/noise.svg');
                    animation: grain 0.5s steps(10) infinite;
                }

                .ease-out-expo {
                    transition-timing-function: cubic-bezier(0.19, 1, 0.22, 1);
                }
            `}</style>
        </section>
    );
};

export default CinematicHero;
