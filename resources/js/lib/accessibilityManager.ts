/**
 * Accessibility Manager for animation and interaction accessibility
 * Handles reduced motion preferences, keyboard navigation, and screen reader compatibility
 */
export class AccessibilityManager {
    private static instance: AccessibilityManager;
    private reducedMotionQuery: MediaQueryList | null = null;
    private focusableElements: Set<HTMLElement> = new Set();
    private keyboardNavigationEnabled: boolean = true;
    private screenReaderAnnouncements: HTMLElement | null = null;

    private constructor() {
        this.initializeReducedMotion();
        this.initializeKeyboardNavigation();
        this.initializeScreenReaderSupport();
    }

    public static getInstance(): AccessibilityManager {
        if (!AccessibilityManager.instance) {
            AccessibilityManager.instance = new AccessibilityManager();
        }
        return AccessibilityManager.instance;
    }

    /**
     * Initialize reduced motion detection and handling
     */
    private initializeReducedMotion(): void {
        if (typeof window === 'undefined') return;

        this.reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        // Apply reduced motion styles
        this.applyReducedMotionStyles();
        
        // Listen for changes
        this.reducedMotionQuery.addEventListener('change', () => {
            this.applyReducedMotionStyles();
        });
    }

    /**
     * Apply CSS for reduced motion preferences
     */
    private applyReducedMotionStyles(): void {
        if (!this.reducedMotionQuery) return;

        const styleId = 'accessibility-reduced-motion';
        const existingStyle = document.getElementById(styleId);

        if (this.reducedMotionQuery.matches) {
            if (!existingStyle) {
                const style = document.createElement('style');
                style.id = styleId;
                style.textContent = `
                    @media (prefers-reduced-motion: reduce) {
                        *,
                        *::before,
                        *::after {
                            animation-duration: 0.01ms !important;
                            animation-iteration-count: 1 !important;
                            transition-duration: 0.01ms !important;
                            scroll-behavior: auto !important;
                        }
                        
                        .gsap-animation {
                            transform: none !important;
                            opacity: 1 !important;
                        }
                        
                        .parallax-element {
                            transform: none !important;
                        }
                        
                        .animated-element {
                            animation: none !important;
                            transition: none !important;
                        }
                    }
                `;
                document.head.appendChild(style);
            }
        } else if (existingStyle) {
            existingStyle.remove();
        }
    }

    /**
     * Initialize keyboard navigation support
     */
    private initializeKeyboardNavigation(): void {
        if (typeof window === 'undefined') return;

        // Track keyboard usage
        let isUsingKeyboard = false;

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                isUsingKeyboard = true;
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            isUsingKeyboard = false;
            document.body.classList.remove('keyboard-navigation');
        });

        // Add keyboard navigation styles
        this.addKeyboardNavigationStyles();
    }

    /**
     * Add CSS for keyboard navigation
     */
    private addKeyboardNavigationStyles(): void {
        const styleId = 'accessibility-keyboard-navigation';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* Hide focus outline by default */
            * {
                outline: none;
            }
            
            /* Show focus outline when using keyboard */
            .keyboard-navigation *:focus {
                outline: 2px solid #007acc;
                outline-offset: 2px;
            }
            
            /* Enhanced focus styles for interactive elements */
            .keyboard-navigation button:focus,
            .keyboard-navigation a:focus,
            .keyboard-navigation input:focus,
            .keyboard-navigation textarea:focus,
            .keyboard-navigation select:focus {
                outline: 2px solid #007acc;
                outline-offset: 2px;
                box-shadow: 0 0 0 4px rgba(0, 122, 204, 0.2);
            }
            
            /* Skip link styles */
            .skip-link {
                position: absolute;
                top: -40px;
                left: 6px;
                background: #000;
                color: #fff;
                padding: 8px;
                text-decoration: none;
                z-index: 10000;
                border-radius: 4px;
            }
            
            .skip-link:focus {
                top: 6px;
            }
            
            /* Ensure interactive elements are keyboard accessible */
            .keyboard-accessible {
                cursor: pointer;
            }
            
            .keyboard-accessible:focus {
                outline: 2px solid #007acc;
                outline-offset: 2px;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Initialize screen reader support
     */
    private initializeScreenReaderSupport(): void {
        if (typeof window === 'undefined') return;

        // Create live region for announcements
        this.screenReaderAnnouncements = document.createElement('div');
        this.screenReaderAnnouncements.setAttribute('aria-live', 'polite');
        this.screenReaderAnnouncements.setAttribute('aria-atomic', 'true');
        this.screenReaderAnnouncements.className = 'sr-only';
        this.screenReaderAnnouncements.style.cssText = `
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        `;
        document.body.appendChild(this.screenReaderAnnouncements);

        // Add skip link
        this.addSkipLink();
    }

    /**
     * Add skip link for keyboard navigation
     */
    private addSkipLink(): void {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Skip to main content';
        
        skipLink.addEventListener('click', (e) => {
            e.preventDefault();
            const mainContent = document.getElementById('main-content') || document.querySelector('main');
            if (mainContent) {
                mainContent.focus();
                mainContent.scrollIntoView({ behavior: 'smooth' });
            }
        });

        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    /**
     * Check if reduced motion is preferred
     */
    public prefersReducedMotion(): boolean {
        return this.reducedMotionQuery?.matches || false;
    }

    /**
     * Make an element keyboard accessible
     */
    public makeKeyboardAccessible(
        element: HTMLElement,
        options: {
            role?: string;
            tabIndex?: number;
            ariaLabel?: string;
            onClick?: () => void;
            onKeyDown?: (e: KeyboardEvent) => void;
        } = {}
    ): void {
        const {
            role = 'button',
            tabIndex = 0,
            ariaLabel,
            onClick,
            onKeyDown,
        } = options;

        // Set ARIA attributes
        element.setAttribute('role', role);
        element.setAttribute('tabindex', tabIndex.toString());
        
        if (ariaLabel) {
            element.setAttribute('aria-label', ariaLabel);
        }

        // Add keyboard accessible class
        element.classList.add('keyboard-accessible');

        // Handle keyboard events
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (onClick) {
                    onClick();
                } else {
                    element.click();
                }
            }
            
            if (onKeyDown) {
                onKeyDown(e);
            }
        };

        element.addEventListener('keydown', handleKeyDown);
        
        // Track focusable element
        this.focusableElements.add(element);

        // Cleanup function
        const cleanup = () => {
            element.removeEventListener('keydown', handleKeyDown);
            this.focusableElements.delete(element);
        };

        // Store cleanup function on element for later use
        (element as any).__accessibilityCleanup = cleanup;
    }

    /**
     * Remove keyboard accessibility from element
     */
    public removeKeyboardAccessibility(element: HTMLElement): void {
        const cleanup = (element as any).__accessibilityCleanup;
        if (cleanup) {
            cleanup();
            delete (element as any).__accessibilityCleanup;
        }
    }

    /**
     * Announce message to screen readers
     */
    public announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
        if (!this.screenReaderAnnouncements) return;

        this.screenReaderAnnouncements.setAttribute('aria-live', priority);
        this.screenReaderAnnouncements.textContent = message;

        // Clear after announcement
        setTimeout(() => {
            if (this.screenReaderAnnouncements) {
                this.screenReaderAnnouncements.textContent = '';
            }
        }, 1000);
    }

    /**
     * Set up focus management for modal/overlay
     */
    public setupFocusTrap(container: HTMLElement): () => void {
        const focusableSelectors = [
            'button',
            '[href]',
            'input',
            'select',
            'textarea',
            '[tabindex]:not([tabindex="-1"])',
        ].join(', ');

        const focusableElements = container.querySelectorAll(focusableSelectors) as NodeListOf<HTMLElement>;
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        e.preventDefault();
                        lastFocusable.focus();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        e.preventDefault();
                        firstFocusable.focus();
                    }
                }
            }

            if (e.key === 'Escape') {
                // Allow escape to close modal
                const closeButton = container.querySelector('[data-close]') as HTMLElement;
                if (closeButton) {
                    closeButton.click();
                }
            }
        };

        container.addEventListener('keydown', handleKeyDown);

        // Focus first element
        if (firstFocusable) {
            firstFocusable.focus();
        }

        // Return cleanup function
        return () => {
            container.removeEventListener('keydown', handleKeyDown);
        };
    }

    /**
     * Add ARIA live region for dynamic content updates
     */
    public createLiveRegion(
        container: HTMLElement,
        options: {
            level?: 'polite' | 'assertive';
            atomic?: boolean;
            relevant?: string;
        } = {}
    ): HTMLElement {
        const {
            level = 'polite',
            atomic = true,
            relevant = 'additions text',
        } = options;

        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', level);
        liveRegion.setAttribute('aria-atomic', atomic.toString());
        liveRegion.setAttribute('aria-relevant', relevant);
        liveRegion.className = 'sr-only';
        liveRegion.style.cssText = `
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        `;

        container.appendChild(liveRegion);
        return liveRegion;
    }

    /**
     * Enhance form accessibility
     */
    public enhanceFormAccessibility(form: HTMLFormElement): void {
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach((input) => {
            const htmlInput = input as HTMLInputElement;
            
            // Associate labels
            const label = form.querySelector(`label[for="${htmlInput.id}"]`) as HTMLLabelElement;
            if (!label && htmlInput.id) {
                // Create label if missing
                const newLabel = document.createElement('label');
                newLabel.setAttribute('for', htmlInput.id);
                newLabel.textContent = htmlInput.placeholder || htmlInput.name || 'Input field';
                newLabel.className = 'sr-only';
                htmlInput.parentNode?.insertBefore(newLabel, htmlInput);
            }

            // Add error handling
            const errorContainer = document.createElement('div');
            errorContainer.id = `${htmlInput.id}-error`;
            errorContainer.className = 'sr-only';
            errorContainer.setAttribute('role', 'alert');
            htmlInput.parentNode?.appendChild(errorContainer);
            
            htmlInput.setAttribute('aria-describedby', errorContainer.id);

            // Validate on blur
            htmlInput.addEventListener('blur', () => {
                const isValid = htmlInput.checkValidity();
                if (!isValid) {
                    errorContainer.textContent = htmlInput.validationMessage;
                    errorContainer.classList.remove('sr-only');
                    htmlInput.setAttribute('aria-invalid', 'true');
                } else {
                    errorContainer.textContent = '';
                    errorContainer.classList.add('sr-only');
                    htmlInput.removeAttribute('aria-invalid');
                }
            });
        });
    }

    /**
     * Get accessibility statistics
     */
    public getStats(): {
        reducedMotionEnabled: boolean;
        keyboardNavigationEnabled: boolean;
        focusableElementsCount: number;
        hasScreenReaderSupport: boolean;
    } {
        return {
            reducedMotionEnabled: this.prefersReducedMotion(),
            keyboardNavigationEnabled: this.keyboardNavigationEnabled,
            focusableElementsCount: this.focusableElements.size,
            hasScreenReaderSupport: !!this.screenReaderAnnouncements,
        };
    }

    /**
     * Cleanup all accessibility features
     */
    public cleanup(): void {
        // Remove event listeners
        if (this.reducedMotionQuery) {
            this.reducedMotionQuery.removeEventListener('change', this.applyReducedMotionStyles);
        }

        // Cleanup focusable elements
        this.focusableElements.forEach((element) => {
            this.removeKeyboardAccessibility(element);
        });
        this.focusableElements.clear();

        // Remove screen reader announcements
        if (this.screenReaderAnnouncements) {
            this.screenReaderAnnouncements.remove();
            this.screenReaderAnnouncements = null;
        }

        // Remove added styles
        const styles = ['accessibility-reduced-motion', 'accessibility-keyboard-navigation'];
        styles.forEach((id) => {
            const style = document.getElementById(id);
            if (style) {
                style.remove();
            }
        });
    }
}

// Export singleton instance
export const accessibilityManager = AccessibilityManager.getInstance();

// Cleanup on page unload
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        accessibilityManager.cleanup();
    });
}