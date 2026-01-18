import { router } from '@inertiajs/react';

/**
 * Advanced Analytics Tracker
 * Handles visit tracking, scroll depth, and interaction heatmaps
 */
class AnalyticsTracker {
    private isInitialized = false;
    private lastScrollDepth = 0;
    private throttleTimer: ReturnType<typeof setTimeout> | null = null;

    /**
     * Initialize tracking
     */
    public init() {
        if (this.isInitialized || typeof window === 'undefined') return;

        this.setupClickTracking();
        this.setupScrollTracking();
        this.isInitialized = true;
    }

    /**
     * Tracks user clicks for heatmap generation
     */
    private setupClickTracking() {
        document.addEventListener('click', (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Don't track clicks on administrative elements
            if (target.closest('[data-no-track]') || target.closest('.admin-ui')) return;

            const data = {
                type: 'click',
                url: window.location.href,
                x: e.pageX,
                y: e.pageY,
                viewport_width: window.innerWidth,
                viewport_height: window.innerHeight,
                element_selector: this.getSelector(target),
            };

            this.sendInteraction(data);
        }, { passive: true });
    }

    /**
     * Tracks scroll depth in 25% increments
     */
    private setupScrollTracking() {
        window.addEventListener('scroll', () => {
            if (this.throttleTimer) return;

            this.throttleTimer = setTimeout(() => {
                const scrollHeight = document.documentElement.scrollHeight;
                const clientHeight = document.documentElement.clientHeight;
                const scrollTop = window.scrollY;
                const depth = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100);

                // Only track milestones (25, 50, 75, 100)
                const milestones = [25, 50, 75, 100];
                const reached = milestones.find(m => depth >= m && this.lastScrollDepth < m);

                if (reached) {
                    this.lastScrollDepth = reached;
                    this.sendInteraction({
                        type: 'scroll',
                        url: window.location.href,
                        scroll_depth: reached
                    });
                }

                this.throttleTimer = null;
            }, 1000);
        }, { passive: true });
    }

    /**
     * Sends the interaction data to the server
     */
    private async sendInteraction(data: any) {
        try {
            // Using navigator.sendBeacon for better reliability on page unload
            // but fallback to fetch for standard interactions
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            fetch('/interactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': token || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(data),
            });
        } catch (error) {
            // Silently fail to not interrupt user experience
        }
    }

    /**
     * Generates a unique CSS selector for an element
     */
    private getSelector(el: HTMLElement): string {
        if (el.id) return `#${el.id}`;
        if (el === document.body) return 'body';
        
        let path = el.tagName.toLowerCase();
        if (el.className) {
            path += `.${el.className.split(' ').join('.')}`;
        }
        
        return el.parentElement ? `${this.getSelector(el.parentElement as HTMLElement)} > ${path}` : path;
    }
}

export const analytics = new AnalyticsTracker();
