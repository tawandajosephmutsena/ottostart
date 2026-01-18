/**
 * Link Prefetching Utility
 * Intelligently prefetches pages on hover for near-instant navigation
 */

import { router } from '@inertiajs/react';

const prefetchedRoutes = new Set<string>();
const prefetchQueue: string[] = [];
let isPrefetching = false;

/**
 * Prefetch a route when user hovers over a link
 * Uses Inertia's built-in prefetch with caching
 */
export const prefetchOnHover = (href: string): void => {
    // Skip if already prefetched or external link
    if (prefetchedRoutes.has(href) || !href.startsWith('/')) return;
    
    // Skip admin routes for non-admin users
    if (href.startsWith('/admin') || href.startsWith('/dashboard')) return;
    
    // Add to queue
    prefetchQueue.push(href);
    prefetchedRoutes.add(href);
    
    // Process queue
    processQueue();
};

/**
 * Process the prefetch queue with rate limiting
 */
const processQueue = (): void => {
    if (isPrefetching || prefetchQueue.length === 0) return;
    
    isPrefetching = true;
    const href = prefetchQueue.shift()!;
    
    // Use requestIdleCallback for non-blocking prefetch
    const prefetch = () => {
        try {
            router.prefetch(href, {
                cacheFor: '30s',
            });
        } catch (error) {
            console.warn('Prefetch failed for:', href, error);
        }
        
        isPrefetching = false;
        
        // Continue processing queue after a small delay
        if (prefetchQueue.length > 0) {
            setTimeout(processQueue, 100);
        }
    };
    
    if ('requestIdleCallback' in window) {
        requestIdleCallback(prefetch, { timeout: 2000 });
    } else {
        setTimeout(prefetch, 50);
    }
};

/**
 * Initialize prefetching on document-level hover events
 * Uses event delegation for efficiency
 */
export const initPrefetching = (): void => {
    if (typeof window === 'undefined') return;
    
    // Debounce hover to avoid excessive prefetching on fast mouse movement
    let hoverTimeout: ReturnType<typeof setTimeout>;
    
    document.addEventListener('mouseover', (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const link = target.closest('a[href]') as HTMLAnchorElement | null;
        
        if (!link) return;
        
        const href = link.getAttribute('href');
        if (!href || !href.startsWith('/')) return;
        
        // Clear previous timeout
        clearTimeout(hoverTimeout);
        
        // Wait 100ms before prefetching (user must hover intentionally)
        hoverTimeout = setTimeout(() => {
            prefetchOnHover(href);
        }, 100);
    }, { passive: true });
    
    // Also prefetch on focus for keyboard navigation
    document.addEventListener('focusin', (e: FocusEvent) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'A') {
            const href = target.getAttribute('href');
            if (href?.startsWith('/')) {
                prefetchOnHover(href);
            }
        }
    }, { passive: true });
    
    // Prefetch visible links in viewport using Intersection Observer
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const href = (entry.target as HTMLAnchorElement).getAttribute('href');
                        if (href?.startsWith('/')) {
                            // Lower priority - use longer delay
                            setTimeout(() => prefetchOnHover(href), 500);
                        }
                        observer.unobserve(entry.target);
                    }
                });
            },
            { rootMargin: '50px' }
        );
        
        // Observe navigation links
        setTimeout(() => {
            document.querySelectorAll('nav a[href^="/"]').forEach((link) => {
                observer.observe(link);
            });
        }, 1000);
    }
};

/**
 * Manually prefetch critical routes on app load
 * Call this for routes users are likely to visit
 */
export const prefetchCriticalRoutes = (routes: string[]): void => {
    // Wait for initial page load to complete
    setTimeout(() => {
        routes.forEach((route) => {
            prefetchOnHover(route);
        });
    }, 2000);
};

/**
 * Clear prefetch cache (useful for testing or memory management)
 */
export const clearPrefetchCache = (): void => {
    prefetchedRoutes.clear();
    prefetchQueue.length = 0;
};

export default {
    prefetchOnHover,
    initPrefetching,
    prefetchCriticalRoutes,
    clearPrefetchCache,
};
