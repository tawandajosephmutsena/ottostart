import { useIntersectionAnimation, useTextReveal } from '@/hooks/useAnimations';
import { useAccessibility, useReducedMotion } from '@/hooks/useAccessibility';
import { cn } from '@/lib/utils';
import React, { useEffect, useRef } from 'react';

interface AnimatedSectionProps {
    children: React.ReactNode;
    className?: string;
    animation?:
        | 'fade'
        | 'fade-in'
        | 'fade-up'
        | 'slide-left'
        | 'slide-right'
        | 'slide-up'
        | 'scale'
        | 'none';
    delay?: number;
    trigger?: 'viewport' | 'scroll' | 'immediate';
    textReveal?: boolean;
    textRevealType?: 'words' | 'chars' | 'lines';
}

/**
 * Wrapper component for animated sections with accessibility support
 * Provides consistent animation behavior across the application
 */
export const AnimatedSection: React.FC<AnimatedSectionProps> = ({
    children,
    className,
    animation = 'fade',
    delay = 0,
    trigger = 'viewport',
    textReveal = false,
    textRevealType = 'words',
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const prefersReducedMotion = useReducedMotion();
    const { announceToScreenReader } = useAccessibility();

    // Apply text reveal animations if enabled and motion is allowed
    useTextReveal(containerRef, {
        splitType: textRevealType,
        stagger: prefersReducedMotion ? 0 : 0.05,
    });

    // Apply intersection-based animations for immediate trigger
    useIntersectionAnimation(
        containerRef as React.RefObject<HTMLElement>,
        {
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1,
            duration: prefersReducedMotion ? 0 : 0.8,
            delay: prefersReducedMotion ? 0 : delay / 1000,
            ease: animation === 'scale' ? 'back.out(1.7)' : 'power2.out',
            onComplete: () => {
                // Announce to screen readers when animation completes
                if (textReveal) {
                    announceToScreenReader('Content loaded', 'polite');
                }
            },
        },
        {
            threshold: 0.1,
            once: true,
        },
    );

    useEffect(() => {
        if (!containerRef.current || trigger === 'immediate') return;

        const container = containerRef.current;

        // Set initial state based on animation type (only if motion is allowed)
        if (!prefersReducedMotion) {
            const initialState: Record<string, string | number> = {
                opacity: 0,
            };

            switch (animation) {
                case 'fade-up':
                    initialState.y = 30;
                    break;
                case 'fade':
                case 'fade-in':
                    initialState.y = 30;
                    break;
                case 'slide-left':
                    initialState.x = -30;
                    break;
                case 'slide-right':
                    initialState.x = 30;
                    break;
                case 'slide-up':
                    initialState.y = 50;
                    break;
                case 'scale':
                    initialState.scale = 0.8;
                    break;
            }

            // Apply initial state
            Object.assign(container.style, {
                opacity: '0',
                transform: `translate3d(${initialState.x || 0}px, ${initialState.y || 0}px, 0) scale(${initialState.scale || 1})`,
            });
        } else {
            // For reduced motion, ensure content is visible immediately
            Object.assign(container.style, {
                opacity: '1',
                transform: 'none',
            });
        }

        // Add data attribute for text reveal if enabled
        if (textReveal && !prefersReducedMotion) {
            container.setAttribute('data-text-reveal', animation);
        }

        // Add accessibility attributes
        container.setAttribute('aria-hidden', prefersReducedMotion ? 'false' : 'true');

        return () => {
            // Cleanup
            if (textReveal) {
                container.removeAttribute('data-text-reveal');
            }
            container.removeAttribute('aria-hidden');
        };
    }, [animation, delay, trigger, textReveal, prefersReducedMotion]);

    return (
        <div
            ref={containerRef}
            className={cn(
                'will-change-transform',
                prefersReducedMotion && 'motion-reduce:transform-none motion-reduce:opacity-100',
                className
            )}
            role="region"
            aria-label={textReveal ? 'Animated content section' : undefined}
        >
            {children}
        </div>
    );
};

export default AnimatedSection;
