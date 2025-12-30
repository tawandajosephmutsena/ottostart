import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

/**
 * Animation utility functions for the avant-garde CMS
 */

export const animationUtils = {
    /**
     * Fade in animation
     */
    fadeIn: (element: HTMLElement | string, options: gsap.TweenVars = {}) => {
        return gsap.fromTo(
            element,
            { opacity: 0, y: 30 },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power2.out',
                ...options,
            },
        );
    },

    /**
     * Slide in from left
     */
    slideInLeft: (
        element: HTMLElement | string,
        options: gsap.TweenVars = {},
    ) => {
        return gsap.fromTo(
            element,
            { opacity: 0, x: -50 },
            {
                opacity: 1,
                x: 0,
                duration: 0.8,
                ease: 'power2.out',
                ...options,
            },
        );
    },

    /**
     * Slide in from right
     */
    slideInRight: (
        element: HTMLElement | string,
        options: gsap.TweenVars = {},
    ) => {
        return gsap.fromTo(
            element,
            { opacity: 0, x: 50 },
            {
                opacity: 1,
                x: 0,
                duration: 0.8,
                ease: 'power2.out',
                ...options,
            },
        );
    },

    /**
     * Scale in animation
     */
    scaleIn: (element: HTMLElement | string, options: gsap.TweenVars = {}) => {
        return gsap.fromTo(
            element,
            { opacity: 0, scale: 0.8 },
            {
                opacity: 1,
                scale: 1,
                duration: 0.6,
                ease: 'back.out(1.7)',
                ...options,
            },
        );
    },

    /**
     * Stagger animation for multiple elements
     */
    staggerIn: (
        elements: HTMLElement[] | string,
        options: gsap.TweenVars = {},
    ) => {
        return gsap.fromTo(
            elements,
            { opacity: 0, y: 30 },
            {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: 'power2.out',
                stagger: 0.1,
                ...options,
            },
        );
    },

    /**
     * Parallax effect
     */
    parallax: (element: HTMLElement | string, speed: number = 0.5) => {
        return ScrollTrigger.create({
            trigger: element,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
            onUpdate: (self) => {
                const progress = self.progress;
                gsap.set(element, {
                    y: progress * speed * 100,
                });
            },
        });
    },

    /**
     * Pin element during scroll
     */
    pinElement: (
        element: HTMLElement | string,
        options: ScrollTrigger.Vars = {},
    ) => {
        return ScrollTrigger.create({
            trigger: element,
            start: 'top top',
            end: 'bottom bottom',
            pin: true,
            pinSpacing: false,
            ...options,
        });
    },

    /**
     * Text reveal animation with split text effect
     */
    textReveal: (
        element: HTMLElement | string,
        options: gsap.TweenVars = {},
    ) => {
        const el =
            typeof element === 'string'
                ? document.querySelector(element)
                : element;
        if (!el) return;

        const text = el.textContent || '';
        const words = text.split(' ');

        el.innerHTML = words
            .map(
                (word) =>
                    `<span class="inline-block overflow-hidden"><span class="inline-block">${word}</span></span>`,
            )
            .join(' ');

        const spans = el.querySelectorAll('span span');

        gsap.set(spans, { y: '100%' });

        return gsap.to(spans, {
            y: '0%',
            duration: 0.8,
            ease: 'power2.out',
            stagger: 0.05,
            ...options,
        });
    },

    /**
     * Smooth scroll to element
     */
    scrollTo: (target: HTMLElement | string, options: gsap.TweenVars = {}) => {
        return gsap.to(window, {
            duration: 1.5,
            scrollTo: {
                y: target,
                offsetY: 0,
            },
            ease: 'power2.inOut',
            ...options,
        });
    },

    /**
     * Cleanup all ScrollTriggers
     */
    cleanup: () => {
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    },

    /**
     * Refresh ScrollTrigger (useful after DOM changes)
     */
    refresh: () => {
        ScrollTrigger.refresh();
    },
};

/**
 * Animation presets for common UI elements
 */
export const animationPresets = {
    hero: {
        title: { opacity: 0, y: 50, duration: 1, ease: 'power2.out' },
        subtitle: {
            opacity: 0,
            y: 30,
            duration: 0.8,
            ease: 'power2.out',
            delay: 0.2,
        },
        cta: {
            opacity: 0,
            scale: 0.9,
            duration: 0.6,
            ease: 'back.out(1.7)',
            delay: 0.4,
        },
    },

    card: {
        container: { opacity: 0, y: 30, duration: 0.6, ease: 'power2.out' },
        image: { opacity: 0, scale: 1.1, duration: 0.8, ease: 'power2.out' },
        content: {
            opacity: 0,
            y: 20,
            duration: 0.6,
            ease: 'power2.out',
            delay: 0.2,
        },
    },

    navigation: {
        menu: { opacity: 0, x: -20, duration: 0.4, ease: 'power2.out' },
        overlay: { opacity: 0, duration: 0.3, ease: 'power2.inOut' },
        items: {
            opacity: 0,
            y: 20,
            duration: 0.4,
            ease: 'power2.out',
            stagger: 0.1,
        },
    },

    section: {
        fadeIn: { opacity: 0, y: 50, duration: 0.8, ease: 'power2.out' },
        slideUp: { opacity: 0, y: 100, duration: 1, ease: 'power2.out' },
        scaleIn: { opacity: 0, scale: 0.95, duration: 0.8, ease: 'power2.out' },
    },
};

export default animationUtils;
