import Footer from '@/components/Footer';
import Navigation from '@/components/Navigation';
import { Breadcrumb } from '@/components/Breadcrumb';
import { useGSAPInit, useSmoothScroll } from '@/hooks/useAnimations';
import { usePerformanceMonitoring } from '@/lib/performanceMonitor';
import { cn } from '@/lib/utils';
import { Head, usePage } from '@inertiajs/react';
import { SharedData } from '@/types';
import React, { useEffect } from 'react';

interface MainLayoutProps {
    children: React.ReactNode;
    title?: string;
    className?: string;
    showNavigation?: boolean;
    showFooter?: boolean;
    showBreadcrumbs?: boolean;
    customBreadcrumbs?: Array<{
        title: string;
        url?: string | null;
        active?: boolean;
    }>;
}

interface CustomWindow extends Window {
    scrollControls?: {
        scrollTo: (target: string | number, options?: { offset?: number; duration?: number }) => void;
        stop: () => void;
        start: () => void;
    };
}

/**
 * Main layout component for the avant-garde CMS frontend
 * Includes navigation, footer, smooth scrolling, animation initialization, and Web Core Vitals optimization
 */
export const MainLayout: React.FC<MainLayoutProps> = ({
    children,
    title,
    className,
    showNavigation = true,
    showFooter = true,
    showBreadcrumbs = false,
    customBreadcrumbs,
}) => {
    // Get breadcrumb data from shared props
    const { breadcrumbs } = usePage<SharedData>().props;
    
    // Initialize smooth scrolling with enhanced controls
    const { scrollTo, stop, start } = useSmoothScroll();

    // Initialize GSAP system
    useGSAPInit();

    // Web Core Vitals: Initialize performance monitoring
    const { startMonitoring, mark, getCoreWebVitalsScore } = usePerformanceMonitoring();

    // Web Core Vitals: Performance monitoring and optimization
    useEffect(() => {
        // Mark layout initialization
        mark('layout-init-start');
        
        // Start performance monitoring
        startMonitoring();
        
        // Mark layout ready
        mark('layout-init-end');
        
        // Web Core Vitals: Report performance metrics after layout is ready
        const reportMetrics = () => {
            const metrics = getCoreWebVitalsScore();
            console.log('Web Core Vitals Score:', metrics);
            
            // Send to analytics if available
            if (typeof gtag !== 'undefined') {
                gtag('event', 'web_vitals_layout', {
                    event_category: 'Performance',
                    score: metrics.score,
                    grade: metrics.grade,
                });
            }
        };

        // Report metrics after a short delay to ensure all measurements are captured
        const timeoutId = setTimeout(reportMetrics, 2000);
        
        return () => clearTimeout(timeoutId);
    }, [startMonitoring, mark, getCoreWebVitalsScore]);

    // Provide scroll controls to child components via context or global
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Make scroll controls available globally for components that need them
            (window as unknown as CustomWindow).scrollControls = { scrollTo, stop, start };
        }
    }, [scrollTo, stop, start]);

    // Web Core Vitals: Preload critical resources
    useEffect(() => {
        // Preload critical fonts if not already preloaded
        const preloadCriticalFonts = () => {
            const fontLinks = document.querySelectorAll('link[rel="preload"][as="font"]');
            if (fontLinks.length === 0) {
                // Create preload link for critical font
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'font';
                link.type = 'font/woff2';
                link.crossOrigin = 'anonymous';
                link.href = 'https://fonts.bunny.net/inter/files/inter-latin-400-normal.woff2';
                document.head.appendChild(link);
            }
        };

        preloadCriticalFonts();
    }, []);

    // Determine which breadcrumbs to show
    const breadcrumbsToShow = customBreadcrumbs || breadcrumbs;
    const shouldShowBreadcrumbs = showBreadcrumbs && breadcrumbsToShow && breadcrumbsToShow.length > 1;

    return (
        <>
            <Head title={title} />
            <div
                className={cn(
                    'min-h-screen bg-background font-sans text-foreground',
                    'antialiased selection:bg-agency-accent/20',
                    // Web Core Vitals: Optimize rendering performance
                    'contain-layout',
                    className,
                )}
            >
                {/* Web Core Vitals: Navigation with fixed height to prevent CLS */}
                {showNavigation && (
                    <div className="h-16 w-full">
                        <Navigation />
                    </div>
                )}

                {/* Web Core Vitals: Breadcrumbs with proper spacing to prevent CLS */}
                {shouldShowBreadcrumbs && (
                    <div className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
                        <div className="max-w-7xl mx-auto px-4 py-3">
                            <Breadcrumb 
                                items={breadcrumbsToShow} 
                                className="text-sm"
                            />
                        </div>
                    </div>
                )}

                {/* Web Core Vitals: Main content with optimized rendering */}
                <main
                    className={cn(
                        'relative',
                        // Web Core Vitals: Ensure proper spacing without layout shift
                        !showNavigation && 'pt-0',
                        // Web Core Vitals: Optimize paint containment
                        'contain-paint',
                    )}
                    style={{
                        // Web Core Vitals: Prevent layout shift with min-height
                        minHeight: showNavigation ? 'calc(100vh - 4rem)' : '100vh',
                    }}
                >
                    {/* Web Core Vitals: Loading indicator for dynamic content */}
                    <div 
                        id="main-content-loader" 
                        className="hidden skeleton w-full h-4 mb-4"
                        aria-hidden="true"
                    />
                    
                    {children}
                </main>

                {/* Web Core Vitals: Footer with proper spacing */}
                {showFooter && (
                    <div className="mt-auto">
                        <Footer />
                    </div>
                )}
            </div>

            {/* Web Core Vitals: Performance monitoring script */}
            <script
                dangerouslySetInnerHTML={{
                    __html: `
                        // Web Core Vitals: Enhanced performance monitoring
                        if ('performance' in window && 'PerformanceObserver' in window) {
                            // Track layout shifts specifically for this layout
                            let layoutShiftScore = 0;
                            const clsObserver = new PerformanceObserver((list) => {
                                for (const entry of list.getEntries()) {
                                    if (!entry.hadRecentInput) {
                                        layoutShiftScore += entry.value;
                                        if (entry.value > 0.1) {
                                            console.warn('Significant layout shift detected in MainLayout:', entry);
                                        }
                                    }
                                }
                            });
                            
                            try {
                                clsObserver.observe({ type: 'layout-shift', buffered: true });
                            } catch (e) {
                                // Layout shift observer not supported
                            }
                            
                            // Track LCP elements
                            const lcpObserver = new PerformanceObserver((list) => {
                                const entries = list.getEntries();
                                const lastEntry = entries[entries.length - 1];
                                if (lastEntry && lastEntry.element) {
                                    console.log('LCP element detected:', {
                                        element: lastEntry.element.tagName,
                                        time: lastEntry.startTime,
                                        size: lastEntry.size,
                                        id: lastEntry.element.id,
                                        className: lastEntry.element.className
                                    });
                                }
                            });
                            
                            try {
                                lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
                            } catch (e) {
                                // LCP observer not supported
                            }
                        }
                    `,
                }}
            />
        </>
    );
};

export default MainLayout;
