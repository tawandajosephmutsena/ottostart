import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';

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
}

const appName = import.meta.env.VITE_APP_NAME || 'Avant-Garde CMS';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <App {...props} />
            </StrictMode>,
        );
    },
    progress: {
        color: 'oklch(0.65 0.15 45)', // Agency accent color
        showSpinner: true,
    },
});

// Initialize theme system
initializeTheme();
