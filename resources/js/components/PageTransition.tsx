import { AnimatePresence, motion } from 'framer-motion';
import { usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';

/**
 * Scroll Progress Indicator
 * Displays a subtle bar at the top of the viewport
 */
export const ScrollProgressIndicator: React.FC = () => {
    const { url } = usePage();
    const [progress, setProgress] = useState(0);
    
    useEffect(() => {
        const handleScroll = () => {
            if (typeof document === 'undefined') return;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = document.documentElement.clientHeight;
            const total = scrollHeight - clientHeight;
            if (total <= 0) {
                setProgress(100);
                return;
            }
            const current = window.scrollY;
            setProgress((current / total) * 100);
        };
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        
        return () => window.removeEventListener('scroll', handleScroll);
    }, [url]);

    return (
        <div className="fixed top-0 left-0 right-0 h-[3px] z-[9999] pointer-events-none">
            <motion.div 
                className="h-full bg-primary"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ type: 'spring', stiffness: 100, damping: 20, mass: 0.5 }}
            />
        </div>
    );
};

/**
 * Page Loading Indicator
 * Shows a higher-tier progress bar when Inertia is navigating
 */
export const PageLoadingIndicator: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed top-0 left-0 right-0 h-[3px] z-[10000] bg-primary overflow-hidden"
                >
                    <motion.div 
                        className="h-full bg-white/20"
                        animate={{ 
                            x: ['-100%', '100%']
                        }}
                        transition={{ 
                            repeat: Infinity, 
                            duration: 1, 
                            ease: 'linear' 
                        }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

interface PageTransitionProps {
    children: React.ReactNode;
    mode?: 'fade' | 'slideUp' | 'slideLeft';
}

/**
 * Page Transition Wrapper
 * Handles entrance/exit animations for page components
 */
export const PageTransition: React.FC<PageTransitionProps> = ({ 
    children, 
    mode = 'fade' 
}) => {
    const { url } = usePage();

    const variants = {
        fade: {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 }
        },
        slideUp: {
            initial: { opacity: 0 }, // Changed from y: 20 to opacity only to fix GSAP pinning
            animate: { opacity: 1 },
            exit: { opacity: 0 }
        },
        slideLeft: {
            initial: { opacity: 0 }, // Changed to opacity only
            animate: { opacity: 1 },
            exit: { opacity: 0 }
        }
    };

    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                key={url}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={variants[mode]}
                transition={{ 
                    duration: 0.4, 
                    ease: [0.22, 1, 0.36, 1] 
                }}
                className="w-full flex-grow flex flex-col overflow-x-hidden"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
};

export default PageTransition;
