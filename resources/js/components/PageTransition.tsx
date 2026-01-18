/**
 * Page Transition Component
 * Provides smooth, award-winning page transitions using Framer Motion
 */

import { usePage } from '@inertiajs/react';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import React, { useEffect, useState } from 'react';

interface PageTransitionProps {
    children: React.ReactNode;
    mode?: 'fade' | 'slide' | 'scale' | 'slideUp';
    duration?: number;
}

// Transition variants for different animation styles
const variants: Record<string, Variants> = {
    fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
    },
    slide: {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 },
    },
    slideUp: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
    },
    scale: {
        initial: { opacity: 0, scale: 0.98 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 1.02 },
    },
};

/**
 * Page Transition wrapper component
 * Wraps page content to provide smooth transitions between routes
 */
export const PageTransition: React.FC<PageTransitionProps> = ({
    children,
    mode = 'slideUp',
    duration = 0.3,
}) => {
    const { url } = usePage();
    const isFirstRender = React.useRef(true);
    const [shouldAnimate, setShouldAnimate] = useState(false);

    useEffect(() => {
        // Only enable animation after first render is stable
        if (isFirstRender.current) {
            isFirstRender.current = false;
            // Delay enabling transitions slightly to ensure initial layout is paints
            const timer = setTimeout(() => setShouldAnimate(true), 100);
            return () => clearTimeout(timer);
        }
    }, []);

    // Respect reduced motion preference
    const prefersReducedMotion = typeof window !== 'undefined' 
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
        : false;

    if (prefersReducedMotion || !shouldAnimate) {
        return <>{children}</>;
    }

    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                key={url}
                variants={variants[mode]}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{
                    duration,
                    ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for smooth feel
                }}
                className="w-full"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
};

/**
 * Scroll Progress Indicator
 * Shows reading progress at the top of the page
 */
export const ScrollProgressIndicator: React.FC = () => {
    const [progress, setProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            
            setProgress(Math.min(100, Math.max(0, scrollPercent)));
            setIsVisible(scrollTop > 100); // Only show after scrolling 100px
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial check

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!isVisible) return null;

    return (
        <motion.div
            className="fixed top-0 left-0 right-0 h-0.5 z-[9999] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="h-full bg-gradient-to-r from-agency-accent via-agency-accent to-agency-accent-soft"
                style={{ 
                    width: `${progress}%`,
                    boxShadow: '0 0 10px var(--agency-accent)',
                }}
                transition={{ duration: 0.1 }}
            />
        </motion.div>
    );
};

/**
 * Page Loading Indicator
 * Shows a loading bar during page transitions
 */
export const PageLoadingIndicator: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    className="fixed top-0 left-0 right-0 h-1 z-[9999] pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="h-full bg-agency-accent"
                        initial={{ width: '0%' }}
                        animate={{ 
                            width: ['0%', '30%', '60%', '80%'],
                        }}
                        transition={{
                            duration: 2,
                            ease: 'easeOut',
                            times: [0, 0.1, 0.5, 1],
                        }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PageTransition;
