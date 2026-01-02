import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { setupCsrfProtection } from './lib/csrf';
import { initPerformanceMonitoring } from './lib/performanceMonitor';
import { registerServiceWorker, showUpdateAvailableNotification } from './lib/serviceWorker';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Initialize GSAP and animation system
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Set GSAP defaults for the avant-garde theme
    gsap.defaults({
        ease: 'power2.out',
        duration: 0.6,
    });

    // Configure ScrollTrigger defaults
    ScrollTrigger.defaults({
        toggleActions: 'play none none reverse',
        scroller: window,
    });

    // Set up CSRF protection for all requests
    setupCsrfProtection();
}

const appName = import.meta.env.VITE_APP_NAME || 'Avant-Garde CMS';

// Initialize performance monitoring
const performanceMonitor = initPerformanceMonitoring();

// Register service worker in production
if (import.meta.env.PROD) {
    registerServiceWorker({
        onUpdate: (registration) => {
            showUpdateAvailableNotification(
                () => {
                    // Skip waiting and reload
                    if (registration.waiting) {
                        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                        window.location.reload();
                    }
                },
                () => {
                    console.log('Update dismissed by user');
                }
            );
        },
        onSuccess: (registration) => {
            console.log('Service worker registered successfully');
        },
        onError: (error) => {
            console.error('Service worker registration failed:', error);
        },
    });
}

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        // Mark performance milestone
        performanceMonitor.mark('app-render-start');

        root.render(
            <ErrorBoundary>
                <StrictMode>
                    <App {...props} />
                </StrictMode>
            </ErrorBoundary>,
        );

        // Mark performance milestone after render
        setTimeout(() => {
            performanceMonitor.mark('app-render-end');
            performanceMonitor.measure('app-render-time', 'app-render-start', 'app-render-end');
            
            // Log performance metrics in development
            if (import.meta.env.DEV) {
                setTimeout(() => {
                    const metrics = performanceMonitor.getMetrics();
                    const score = performanceMonitor.getCoreWebVitalsScore();
                    console.log('Performance Metrics:', metrics);
                    console.log('Core Web Vitals Score:', score);
                }, 2000);
            }
        }, 0);
    },
    progress: {
        color: 'oklch(0.65 0.15 45)', // Agency accent color
        showSpinner: true,
    },
});

// Initialize theme system
initializeTheme();
