import { useEffect, useState, useCallback } from 'react';
import { browserCompatibilityManager } from '@/lib/browserCompatibilityManager';

/**
 * Hook for browser compatibility detection and fallbacks
 */
export const useBrowserCompatibility = () => {
    const [browserInfo, setBrowserInfo] = useState(browserCompatibilityManager.getBrowserInfo());
    const [supportedFeatures, setSupportedFeatures] = useState(browserCompatibilityManager.getSupportedFeatures());

    useEffect(() => {
        // Browser info is static, but we set it for consistency
        setBrowserInfo(browserCompatibilityManager.getBrowserInfo());
        setSupportedFeatures(browserCompatibilityManager.getSupportedFeatures());
    }, []);

    const isSupported = useCallback((feature: string) => {
        return browserCompatibilityManager.isSupported(feature as any);
    }, []);

    const getAnimationConfig = useCallback(() => {
        return browserCompatibilityManager.getAnimationConfig();
    }, []);

    const applyFallback = useCallback((element: HTMLElement, fallbackType: string) => {
        browserCompatibilityManager.applyFallback(element, fallbackType);
    }, []);

    return {
        browserInfo,
        supportedFeatures,
        isSupported,
        getAnimationConfig,
        applyFallback,
        isModernBrowser: browserInfo.isModern,
        supportsES6: browserInfo.supportsES6,
    };
};

/**
 * Hook for progressive enhancement animations
 */
export const useProgressiveAnimation = (
    elementRef: React.RefObject<HTMLElement>,
    modernAnimation: () => void,
    fallbackAnimation: () => void,
    options: {
        autoApply?: boolean;
        threshold?: 'modern' | 'transforms3d' | 'transitions';
    } = {}
) => {
    const { autoApply = true, threshold = 'modern' } = options;
    const { browserInfo, supportedFeatures } = useBrowserCompatibility();

    const shouldUseModern = useCallback(() => {
        switch (threshold) {
            case 'modern':
                return browserInfo.isModern;
            case 'transforms3d':
                return supportedFeatures.transforms3d;
            case 'transitions':
                return supportedFeatures.transitions;
            default:
                return browserInfo.isModern;
        }
    }, [browserInfo, supportedFeatures, threshold]);

    const applyAnimation = useCallback(() => {
        if (shouldUseModern()) {
            modernAnimation();
        } else {
            fallbackAnimation();
        }
    }, [shouldUseModern, modernAnimation, fallbackAnimation]);

    useEffect(() => {
        if (autoApply && elementRef.current) {
            applyAnimation();
        }
    }, [autoApply, elementRef, applyAnimation]);

    return {
        applyAnimation,
        shouldUseModern: shouldUseModern(),
    };
};

/**
 * Hook for fallback animations
 */
export const useFallbackAnimation = (
    elementRef: React.RefObject<HTMLElement>,
    animationType: 'fade' | 'slide' | 'scale',
    options: {
        duration?: number;
        delay?: number;
        easing?: string;
        autoStart?: boolean;
    } = {}
) => {
    const { duration = 300, delay = 0, easing = 'ease', autoStart = false } = options;
    const [animation, setAnimation] = useState<any>(null);

    useEffect(() => {
        if (!elementRef.current) return;

        const fallbackAnimation = browserCompatibilityManager.createFallbackAnimation(
            elementRef.current,
            animationType,
            { duration, delay, easing }
        );

        setAnimation(fallbackAnimation);

        if (autoStart) {
            fallbackAnimation.start();
        }

        return () => {
            if (fallbackAnimation) {
                fallbackAnimation.stop();
            }
        };
    }, [elementRef, animationType, duration, delay, easing, autoStart]);

    const startAnimation = useCallback(() => {
        if (animation) {
            animation.start();
        }
    }, [animation]);

    const stopAnimation = useCallback(() => {
        if (animation) {
            animation.stop();
        }
    }, [animation]);

    return {
        startAnimation,
        stopAnimation,
        isActive: animation?.isActive || false,
    };
};

/**
 * Hook for feature detection
 */
export const useFeatureDetection = () => {
    const { supportedFeatures } = useBrowserCompatibility();

    const checkFeature = useCallback((feature: string) => {
        return browserCompatibilityManager.isSupported(feature as any);
    }, []);

    return {
        supportedFeatures,
        checkFeature,
        hasTransforms3D: supportedFeatures.transforms3d,
        hasTransitions: supportedFeatures.transitions,
        hasAnimations: supportedFeatures.animations,
        hasFlexbox: supportedFeatures.flexbox,
        hasGrid: supportedFeatures.grid,
        hasWillChange: supportedFeatures.willChange,
        hasIntersectionObserver: supportedFeatures.intersectionObserver,
        hasRequestAnimationFrame: supportedFeatures.requestAnimationFrame,
        hasWebGL: supportedFeatures.webGL,
    };
};

/**
 * Hook for adaptive animation configuration
 */
export const useAdaptiveAnimation = () => {
    const [config, setConfig] = useState(browserCompatibilityManager.getAnimationConfig());

    useEffect(() => {
        setConfig(browserCompatibilityManager.getAnimationConfig());
    }, []);

    const getOptimalDuration = useCallback((baseDuration: number) => {
        const multiplier = config.complexity === 'low' ? 0.5 : config.complexity === 'medium' ? 0.75 : 1;
        return baseDuration * multiplier;
    }, [config]);

    const getOptimalEasing = useCallback((preferredEasing?: string) => {
        if (preferredEasing && config.complexity === 'high') {
            return preferredEasing;
        }
        return config.easing;
    }, [config]);

    const shouldUseTransforms = useCallback(() => {
        return config.useTransforms;
    }, [config]);

    const shouldUseOpacity = useCallback(() => {
        return config.useOpacity;
    }, [config]);

    return {
        config,
        getOptimalDuration,
        getOptimalEasing,
        shouldUseTransforms,
        shouldUseOpacity,
    };
};

/**
 * Hook for legacy browser support
 */
export const useLegacySupport = (
    elementRef: React.RefObject<HTMLElement>,
    fallbackTypes: string[] = []
) => {
    const { browserInfo } = useBrowserCompatibility();

    useEffect(() => {
        if (!elementRef.current || browserInfo.isModern) return;

        const element = elementRef.current;
        
        fallbackTypes.forEach((fallbackType) => {
            browserCompatibilityManager.applyFallback(element, fallbackType);
        });
    }, [elementRef, browserInfo.isModern, fallbackTypes]);

    return {
        isLegacyBrowser: !browserInfo.isModern,
        browserName: browserInfo.name,
        browserVersion: browserInfo.version,
    };
};