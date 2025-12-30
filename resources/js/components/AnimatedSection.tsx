import { useIntersectionAnimation, useTextReveal } from '@/hooks/useAnimations';
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
 * Wrapper component for animated sections
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

    // Apply text reveal animations if enabled
    useTextReveal(containerRef, {
        splitType: textRevealType,
        stagger: 0.05,
    });

    // Apply intersection-based animations for immediate trigger
    useIntersectionAnimation(
        containerRef as React.RefObject<HTMLElement>,
        {
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1,
            duration: 0.8,
            delay: delay / 1000,
            ease: animation === 'scale' ? 'back.out(1.7)' : 'power2.out',
        },
        {
            threshold: 0.1,
            once: true,
        },
    );

    useEffect(() => {
        if (!containerRef.current || trigger === 'immediate') return;

        const container = containerRef.current;

        // Set initial state based on animation type
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

        // Add data attribute for text reveal if enabled
        if (textReveal) {
            container.setAttribute('data-text-reveal', animation);
        }

        return () => {
            // Cleanup
            if (textReveal) {
                container.removeAttribute('data-text-reveal');
            }
        };
    }, [animation, delay, trigger, textReveal]);

    return (
        <div
            ref={containerRef}
            className={cn('will-change-transform', className)}
        >
            {children}
        </div>
    );
};

export default AnimatedSection;
