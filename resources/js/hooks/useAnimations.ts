import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { useCallback, useEffect, useRef } from 'react';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
}

/**
 * Hook for initializing smooth scroll with Lenis
 * Provides smooth scrolling functionality with GSAP integration
 */
export const useSmoothScroll = () => {
    const lenisRef = useRef<Lenis | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Initialize Lenis with optimized settings
        lenisRef.current = new Lenis({
            duration: 1.2,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
            infinite: false,
            autoResize: true,
        });

        // Connect Lenis with GSAP ScrollTrigger
        lenisRef.current.on('scroll', ScrollTrigger.update);

        // Add to GSAP ticker for smooth animation
        const ticker = (time: number) => {
            lenisRef.current?.raf(time * 1000);
        };

        gsap.ticker.add(ticker);
        gsap.ticker.lagSmoothing(0);

        // Cleanup function
        return () => {
            lenisRef.current?.destroy();
            gsap.ticker.remove(ticker);
        };
    }, []);

    // Return methods for external control
    return {
        scrollTo: useCallback(
            (
                target: string | number,
                options?: { offset?: number; duration?: number },
            ) => {
                if (lenisRef.current) {
                    lenisRef.current.scrollTo(target, {
                        offset: options?.offset || 0,
                        duration: options?.duration || 1.2,
                    });
                }
            },
            [],
        ),
        stop: useCallback(() => {
            lenisRef.current?.stop();
        }, []),
        start: useCallback(() => {
            lenisRef.current?.start();
        }, []),
    };
};

/**
 * Hook for hero parallax effects
 * Provides mouse-based and scroll-based parallax animations
 */
export const useHeroParallax = (
    containerRef: React.RefObject<HTMLElement>,
    imageRefs: React.RefObject<HTMLElement>[],
    options: {
        mouseParallax?: boolean;
        scrollParallax?: boolean;
        intensity?: number;
    } = {},
) => {
    const {
        mouseParallax = true,
        scrollParallax = true,
        intensity = 1,
    } = options;

    useEffect(() => {
        if (typeof window === 'undefined' || !containerRef.current) return;

        const container = containerRef.current;
        const images = imageRefs.map((ref) => ref.current).filter(Boolean);

        if (images.length === 0) return;

        const cleanupFunctions: (() => void)[] = [];

        // Mouse move parallax
        if (mouseParallax) {
            const handleMouseMove = (e: MouseEvent) => {
                const rect = container.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                const xPos = ((e.clientX - centerX) / rect.width) * intensity;
                const yPos = ((e.clientY - centerY) / rect.height) * intensity;

                images.forEach((image, index) => {
                    const speed = (index + 1) * 0.5;
                    gsap.to(image, {
                        duration: 1.5,
                        x: xPos * speed * 20,
                        y: yPos * speed * 10,
                        ease: 'power2.out',
                    });
                });
            };

            container.addEventListener('mousemove', handleMouseMove);
            cleanupFunctions.push(() =>
                container.removeEventListener('mousemove', handleMouseMove),
            );
        }

        // Scroll parallax
        if (scrollParallax) {
            const scrollTrigger = ScrollTrigger.create({
                trigger: container,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
                onUpdate: (self) => {
                    const progress = self.progress;
                    images.forEach((image, index) => {
                        const speed = (index + 1) * 0.3 * intensity;
                        gsap.set(image, {
                            y: progress * speed * 100,
                        });
                    });
                },
            });

            cleanupFunctions.push(() => scrollTrigger.kill());
        }

        return () => {
            cleanupFunctions.forEach((cleanup) => cleanup());
        };
    }, [containerRef, imageRefs, mouseParallax, scrollParallax, intensity]);
};

/**
 * Hook for text reveal animations
 * Provides scroll-triggered text animations with various effects
 */
export const useTextReveal = (
    containerRef: React.RefObject<HTMLElement | null>,
    options: {
        trigger?: string;
        start?: string;
        end?: string;
        stagger?: number;
        splitType?: 'words' | 'chars' | 'lines';
    } = {},
) => {
    const {
        trigger = 'top 80%',
        start = 'top 80%',
        end = 'bottom 20%',
        stagger = 0.05,
        splitType = 'words',
    } = options;

    useEffect(() => {
        if (typeof window === 'undefined' || !containerRef.current) return;

        const container = containerRef.current;
        const textElements = container.querySelectorAll('[data-text-reveal]');

        const scrollTriggers: ScrollTrigger[] = [];

        textElements.forEach((element) => {
            const htmlElement = element as HTMLElement;
            const animationType = htmlElement.dataset.textReveal || 'fade-up';

            // Split text based on type
            const originalText = htmlElement.textContent || '';
            let splitElements: HTMLElement[] = [];

            if (splitType === 'words') {
                const words = originalText.split(' ');
                htmlElement.innerHTML = words
                    .map(
                        (word) =>
                            `<span class="inline-block overflow-hidden"><span class="inline-block word-span">${word}</span></span>`,
                    )
                    .join(' ');
                splitElements = Array.from(
                    htmlElement.querySelectorAll('.word-span'),
                );
            } else if (splitType === 'chars') {
                const chars = originalText.split('');
                htmlElement.innerHTML = chars
                    .map((char) =>
                        char === ' '
                            ? ' '
                            : `<span class="inline-block char-span">${char}</span>`,
                    )
                    .join('');
                splitElements = Array.from(
                    htmlElement.querySelectorAll('.char-span'),
                );
            }

            // Set initial state based on animation type
            const initialState: gsap.TweenVars = {};
            const animateState: gsap.TweenVars = {
                duration: 0.8,
                ease: 'power2.out',
                stagger: stagger,
            };

            switch (animationType) {
                case 'fade-up':
                    initialState.opacity = 0;
                    initialState.y = 30;
                    animateState.opacity = 1;
                    animateState.y = 0;
                    break;
                case 'fade-in':
                    initialState.opacity = 0;
                    animateState.opacity = 1;
                    break;
                case 'slide-left':
                    initialState.opacity = 0;
                    initialState.x = -30;
                    animateState.opacity = 1;
                    animateState.x = 0;
                    break;
                case 'slide-right':
                    initialState.opacity = 0;
                    initialState.x = 30;
                    animateState.opacity = 1;
                    animateState.x = 0;
                    break;
                case 'scale-in':
                    initialState.opacity = 0;
                    initialState.scale = 0.8;
                    animateState.opacity = 1;
                    animateState.scale = 1;
                    animateState.ease = 'back.out(1.7)';
                    break;
            }

            // Apply initial state
            if (splitElements.length > 0) {
                gsap.set(splitElements, initialState);
            } else {
                gsap.set(htmlElement, initialState);
            }

            // Create scroll trigger
            const scrollTrigger = ScrollTrigger.create({
                trigger: htmlElement,
                start: start,
                end: end,
                onEnter: () => {
                    if (splitElements.length > 0) {
                        gsap.to(splitElements, animateState);
                    } else {
                        gsap.to(htmlElement, animateState);
                    }
                },
            });

            scrollTriggers.push(scrollTrigger);
        });

        return () => {
            scrollTriggers.forEach((trigger) => trigger.kill());
        };
    }, [containerRef, trigger, start, end, stagger, splitType]);
};

/**
 * Hook for pinned sections during scroll
 * Provides sticky/pinned section effects with customizable options
 */
export const usePinnedSection = (
    containerRef: React.RefObject<HTMLElement>,
    options: {
        start?: string;
        end?: string;
        pinSpacing?: boolean;
        scrub?: boolean | number;
        onUpdate?: (progress: number) => void;
    } = {},
) => {
    const {
        start = 'top top',
        end = 'bottom bottom',
        pinSpacing = false,
        scrub = 1,
        onUpdate,
    } = options;

    useEffect(() => {
        if (typeof window === 'undefined' || !containerRef.current) return;

        const container = containerRef.current;

        const scrollTrigger = ScrollTrigger.create({
            trigger: container,
            start,
            end,
            pin: true,
            pinSpacing,
            scrub,
            onUpdate: (self) => {
                if (onUpdate) {
                    onUpdate(self.progress);
                }
            },
        });

        return () => {
            scrollTrigger.kill();
        };
    }, [containerRef, start, end, pinSpacing, scrub, onUpdate]);
};

/**
 * Hook for stacked card animations
 * Provides stacked card scroll effects with pinning and scaling
 */
export const useStackedCards = (
    containerRef: React.RefObject<HTMLElement>,
    cardRefs: React.RefObject<HTMLElement>[],
    options: {
        spacing?: number;
        scaleAmount?: number;
        rotationAmount?: number;
        start?: string;
        end?: string;
    } = {},
) => {
    const {
        spacing = 50,
        scaleAmount = 0.1,
        rotationAmount = 0,
        start = 'top center',
        end = 'bottom top',
    } = options;

    useEffect(() => {
        if (typeof window === 'undefined' || !containerRef.current) return;

        const container = containerRef.current;
        const cards = cardRefs.map((ref) => ref.current).filter(Boolean);

        if (cards.length === 0) return;

        const scrollTriggers: ScrollTrigger[] = [];

        cards.forEach((card, index) => {
            const isLast = index === cards.length - 1;

            const scrollTrigger = ScrollTrigger.create({
                trigger: card,
                start: start,
                end: isLast ? 'bottom center' : end,
                pin: !isLast,
                pinSpacing: false,
                scrub: 1,
                onUpdate: (self) => {
                    if (!isLast) {
                        const progress = self.progress;
                        const scale = 1 - progress * scaleAmount;
                        const y = progress * -spacing;
                        const rotation = progress * rotationAmount;

                        gsap.set(card, {
                            scale: scale,
                            y: y,
                            rotation: rotation,
                            transformOrigin: 'center center',
                        });
                    }
                },
            });

            scrollTriggers.push(scrollTrigger);
        });

        return () => {
            scrollTriggers.forEach((trigger) => trigger.kill());
        };
    }, [
        containerRef,
        cardRefs,
        spacing,
        scaleAmount,
        rotationAmount,
        start,
        end,
    ]);
};

/**
 * Hook for scale-in animations
 */
export const useScaleIn = (
    containerRef: React.RefObject<HTMLElement | null>,
) => {
    useEffect(() => {
        if (typeof window === 'undefined' || !containerRef.current) return;

        const container = containerRef.current;
        const scaleElements = container.querySelectorAll('.gsap-scale-in');

        scaleElements.forEach((element) => {
            ScrollTrigger.create({
                trigger: element,
                start: 'top 80%',
                end: 'bottom 20%',
                onEnter: () => {
                    gsap.to(element, {
                        opacity: 1,
                        scale: 1,
                        duration: 0.6,
                        ease: 'back.out(1.7)',
                    });
                },
            });
        });

        return () => {
            ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        };
    }, [containerRef]);
};

/**
 * Hook for general GSAP animations initialization
 * Sets up GSAP defaults and handles window resize events
 */
export const useGSAPInit = () => {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Set default GSAP settings
        gsap.defaults({
            ease: 'power2.out',
            duration: 0.6,
        });

        // Refresh ScrollTrigger on window resize with debouncing
        let resizeTimeout: NodeJS.Timeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                ScrollTrigger.refresh();
            }, 100);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimeout);
        };
    }, []);
};

/**
 * Hook for scroll-triggered animations
 * Provides a flexible way to animate elements on scroll
 */
export const useScrollAnimation = (
    elementRef: React.RefObject<HTMLElement>,
    animation: gsap.TweenVars,
    options: {
        trigger?: string | HTMLElement;
        start?: string;
        end?: string;
        scrub?: boolean | number;
        toggleActions?: string;
    } = {},
) => {
    const {
        trigger,
        start = 'top 80%',
        end = 'bottom 20%',
        scrub = false,
        toggleActions = 'play none none reverse',
    } = options;

    useEffect(() => {
        if (typeof window === 'undefined' || !elementRef.current) return;

        const element = elementRef.current;
        const triggerElement = trigger || element;

        const scrollTrigger = ScrollTrigger.create({
            trigger: triggerElement,
            start,
            end,
            scrub,
            toggleActions,
            animation: gsap.to(element, animation),
        });

        return () => {
            scrollTrigger.kill();
        };
    }, [elementRef, animation, trigger, start, end, scrub, toggleActions]);
};

/**
 * Hook for intersection-based animations
 * Triggers animations when elements enter the viewport
 */
export const useIntersectionAnimation = (
    elementRef: React.RefObject<HTMLElement>,
    animation: gsap.TweenVars,
    options: {
        threshold?: number;
        rootMargin?: string;
        once?: boolean;
    } = {},
) => {
    const {
        threshold = 0.1,
        rootMargin = '0px 0px -10% 0px',
        once = true,
    } = options;

    useEffect(() => {
        if (typeof window === 'undefined' || !elementRef.current) return;

        const element = elementRef.current;
        let hasAnimated = false;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && (!once || !hasAnimated)) {
                        gsap.to(element, animation);
                        hasAnimated = true;

                        if (once) {
                            observer.unobserve(element);
                        }
                    }
                });
            },
            {
                threshold,
                rootMargin,
            },
        );

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [elementRef, animation, threshold, rootMargin, once]);
};

/**
 * Hook for magnetic button effects
 * Creates magnetic attraction effect for interactive elements
 */
export const useMagneticEffect = (
    elementRef: React.RefObject<HTMLElement>,
    options: {
        strength?: number;
        speed?: number;
    } = {},
) => {
    const { strength = 0.3, speed = 0.3 } = options;

    useEffect(() => {
        if (typeof window === 'undefined' || !elementRef.current) return;

        const element = elementRef.current;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const deltaX = (e.clientX - centerX) * strength;
            const deltaY = (e.clientY - centerY) * strength;

            gsap.to(element, {
                x: deltaX,
                y: deltaY,
                duration: speed,
                ease: 'power2.out',
            });
        };

        const handleMouseLeave = () => {
            gsap.to(element, {
                x: 0,
                y: 0,
                duration: speed * 2,
                ease: 'elastic.out(1, 0.3)',
            });
        };

        element.addEventListener('mousemove', handleMouseMove);
        element.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            element.removeEventListener('mousemove', handleMouseMove);
            element.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [elementRef, strength, speed]);
};
