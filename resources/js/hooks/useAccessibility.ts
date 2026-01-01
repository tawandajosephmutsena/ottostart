import { useEffect, useRef, useState } from 'react';
import { accessibilityManager } from '@/lib/accessibilityManager';

/**
 * Hook for managing accessibility features in React components
 */
export const useAccessibility = () => {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    const [isKeyboardNavigation, setIsKeyboardNavigation] = useState(false);

    useEffect(() => {
        // Initialize accessibility manager
        setPrefersReducedMotion(accessibilityManager.prefersReducedMotion());

        // Listen for reduced motion changes
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
        mediaQuery.addEventListener('change', handleChange);

        // Listen for keyboard navigation
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Tab') {
                setIsKeyboardNavigation(true);
            }
        };

        const handleMouseDown = () => {
            setIsKeyboardNavigation(false);
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleMouseDown);

        return () => {
            mediaQuery.removeEventListener('change', handleChange);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleMouseDown);
        };
    }, []);

    return {
        prefersReducedMotion,
        isKeyboardNavigation,
        announceToScreenReader: accessibilityManager.announceToScreenReader.bind(accessibilityManager),
        makeKeyboardAccessible: accessibilityManager.makeKeyboardAccessible.bind(accessibilityManager),
        removeKeyboardAccessibility: accessibilityManager.removeKeyboardAccessibility.bind(accessibilityManager),
        setupFocusTrap: accessibilityManager.setupFocusTrap.bind(accessibilityManager),
        createLiveRegion: accessibilityManager.createLiveRegion.bind(accessibilityManager),
        enhanceFormAccessibility: accessibilityManager.enhanceFormAccessibility.bind(accessibilityManager),
    };
};

/**
 * Hook for making an element keyboard accessible
 */
export const useKeyboardAccessible = (
    elementRef: React.RefObject<HTMLElement>,
    options: {
        role?: string;
        tabIndex?: number;
        ariaLabel?: string;
        onClick?: () => void;
        onKeyDown?: (e: KeyboardEvent) => void;
    } = {}
) => {
    useEffect(() => {
        if (!elementRef.current) return;

        accessibilityManager.makeKeyboardAccessible(elementRef.current, options);

        return () => {
            if (elementRef.current) {
                accessibilityManager.removeKeyboardAccessibility(elementRef.current);
            }
        };
    }, [elementRef, options]);
};

/**
 * Hook for focus trap management (modals, overlays)
 */
export const useFocusTrap = (
    containerRef: React.RefObject<HTMLElement>,
    isActive: boolean = true
) => {
    const cleanupRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        if (!containerRef.current || !isActive) return;

        cleanupRef.current = accessibilityManager.setupFocusTrap(containerRef.current);

        return () => {
            if (cleanupRef.current) {
                cleanupRef.current();
                cleanupRef.current = null;
            }
        };
    }, [containerRef, isActive]);

    return {
        cleanup: () => {
            if (cleanupRef.current) {
                cleanupRef.current();
                cleanupRef.current = null;
            }
        },
    };
};

/**
 * Hook for screen reader announcements
 */
export const useScreenReaderAnnouncements = () => {
    const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
        accessibilityManager.announceToScreenReader(message, priority);
    };

    return { announce };
};

/**
 * Hook for live region management
 */
export const useLiveRegion = (
    containerRef: React.RefObject<HTMLElement>,
    options: {
        level?: 'polite' | 'assertive';
        atomic?: boolean;
        relevant?: string;
    } = {}
) => {
    const liveRegionRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        liveRegionRef.current = accessibilityManager.createLiveRegion(
            containerRef.current,
            options
        );

        return () => {
            if (liveRegionRef.current) {
                liveRegionRef.current.remove();
                liveRegionRef.current = null;
            }
        };
    }, [containerRef, options]);

    const updateContent = (content: string) => {
        if (liveRegionRef.current) {
            liveRegionRef.current.textContent = content;
        }
    };

    return { updateContent };
};

/**
 * Hook for form accessibility enhancement
 */
export const useFormAccessibility = (formRef: React.RefObject<HTMLFormElement>) => {
    useEffect(() => {
        if (!formRef.current) return;

        accessibilityManager.enhanceFormAccessibility(formRef.current);
    }, [formRef]);
};

/**
 * Hook for reduced motion detection
 */
export const useReducedMotion = () => {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mediaQuery.matches);

        const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
        mediaQuery.addEventListener('change', handleChange);

        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    return prefersReducedMotion;
};