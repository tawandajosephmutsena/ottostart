import Footer from '@/components/Footer';
import Navigation from '@/components/Navigation';
import { useGSAPInit, useSmoothScroll } from '@/hooks/useAnimations';
import { cn } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import React, { useEffect } from 'react';

interface MainLayoutProps {
    children: React.ReactNode;
    title?: string;
    className?: string;
    showNavigation?: boolean;
    showFooter?: boolean;
}

/**
 * Main layout component for the avant-garde CMS frontend
 * Includes navigation, footer, smooth scrolling and animation initialization
 */
export const MainLayout: React.FC<MainLayoutProps> = ({
    children,
    title,
    className,
    showNavigation = true,
    showFooter = true,
}) => {
    // Initialize smooth scrolling with enhanced controls
    const { scrollTo, stop, start } = useSmoothScroll();

    // Initialize GSAP system
    useGSAPInit();

    // Provide scroll controls to child components via context or global
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Make scroll controls available globally for components that need them
            (window as any).scrollControls = { scrollTo, stop, start };
        }
    }, [scrollTo, stop, start]);

    return (
        <>
            <Head title={title} />
            <div
                className={cn(
                    'min-h-screen bg-background font-sans text-foreground',
                    'antialiased selection:bg-agency-accent/20',
                    className,
                )}
            >
                {/* Navigation */}
                {showNavigation && <Navigation />}

                {/* Main content */}
                <main
                    className={cn(
                        'relative',
                        showNavigation && 'pt-16', // Add top padding when navigation is shown
                    )}
                >
                    {children}
                </main>

                {/* Footer */}
                {showFooter && <Footer />}
            </div>
        </>
    );
};

export default MainLayout;
