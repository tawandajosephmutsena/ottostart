import { useEffect, useCallback, useRef } from 'react';
import { hardwareAccelerationOptimizer } from '@/lib/hardwareAccelerationOptimizer';

/**
 * Hook for hardware acceleration optimization
 */
export const useHardwareAcceleration = (
    elementRef: React.RefObject<HTMLElement>,
    options: {
        forceLayer?: boolean;
        optimizeTransforms?: boolean;
        optimizeOpacity?: boolean;
        preventLayoutShift?: boolean;
        useWillChange?: boolean;
        autoOptimize?: boolean;
    } = {}
) => {
    const { autoOptimize = true, ...accelerationOptions } = options;
    const isOptimizedRef = useRef(false);

    useEffect(() => {
        if (!elementRef.current || !autoOptimize) return;

        const element = elementRef.current;
        const result = hardwareAccelerationOptimizer.optimizeElement(element, accelerationOptions);
        isOptimizedRef.current = result.success;

        return () => {
            if (isOptimizedRef.current) {
                hardwareAccelerationOptimizer.removeAcceleration(element);
                isOptimizedRef.current = false;
            }
        };
    }, [elementRef, autoOptimize, accelerationOptions]);

    const optimize = useCallback(() => {
        if (!elementRef.current) return null;
        
        const result = hardwareAccelerationOptimizer.optimizeElement(
            elementRef.current,
            accelerationOptions
        );
        isOptimizedRef.current = result.success;
        return result;
    }, [elementRef, accelerationOptions]);

    const removeOptimization = useCallback(() => {
        if (!elementRef.current) return;
        
        hardwareAccelerationOptimizer.removeAcceleration(elementRef.current);
        isOptimizedRef.current = false;
    }, [elementRef]);

    const setWillChange = useCallback((properties: string[]) => {
        if (!elementRef.current) return;
        
        hardwareAccelerationOptimizer.setWillChange(elementRef.current, properties);
    }, [elementRef]);

    const removeWillChange = useCallback((properties?: string[]) => {
        if (!elementRef.current) return;
        
        hardwareAccelerationOptimizer.removeWillChange(elementRef.current, properties);
    }, [elementRef]);

    const isAccelerated = useCallback(() => {
        if (!elementRef.current) return false;
        
        return hardwareAccelerationOptimizer.isAccelerated(elementRef.current);
    }, [elementRef]);

    return {
        optimize,
        removeOptimization,
        setWillChange,
        removeWillChange,
        isAccelerated,
        isOptimized: isOptimizedRef.current,
    };
};

/**
 * Hook for optimized animations with hardware acceleration
 */
export const useOptimizedAnimation = (
    elementRef: React.RefObject<HTMLElement>,
    animationConfig: {
        properties: string[];
        duration: number;
        easing: string;
        useGPU?: boolean;
        forceLayer?: boolean;
    }
) => {
    const optimizeForAnimation = useCallback(() => {
        if (!elementRef.current) return null;

        return hardwareAccelerationOptimizer.optimizeAnimation(
            elementRef.current,
            {
                ...animationConfig,
                onStart: () => {
                    // Animation started
                },
                onComplete: () => {
                    // Animation completed
                },
            }
        );
    }, [elementRef, animationConfig]);

    return {
        optimizeForAnimation,
    };
};

/**
 * Hook for scroll performance optimization
 */
export const useScrollOptimization = (
    containerRef: React.RefObject<HTMLElement>,
    options: {
        autoOptimize?: boolean;
    } = {}
) => {
    const { autoOptimize = true } = options;

    useEffect(() => {
        if (!containerRef.current || !autoOptimize) return;

        hardwareAccelerationOptimizer.optimizeScrollPerformance(containerRef.current);
    }, [containerRef, autoOptimize]);

    const optimizeScroll = useCallback(() => {
        if (!containerRef.current) return;
        
        hardwareAccelerationOptimizer.optimizeScrollPerformance(containerRef.current);
    }, [containerRef]);

    return {
        optimizeScroll,
    };
};

/**
 * Hook for GPU layer management
 */
export const useGPULayers = () => {
    const getLayerInfo = useCallback(() => {
        return hardwareAccelerationOptimizer.getLayerInfo();
    }, []);

    const getRecommendations = useCallback(() => {
        return hardwareAccelerationOptimizer.getOptimizationRecommendations();
    }, []);

    return {
        getLayerInfo,
        getRecommendations,
    };
};

/**
 * Hook for will-change property management
 */
export const useWillChange = (
    elementRef: React.RefObject<HTMLElement>,
    properties: string[],
    options: {
        autoSet?: boolean;
        removeOnUnmount?: boolean;
    } = {}
) => {
    const { autoSet = true, removeOnUnmount = true } = options;

    useEffect(() => {
        if (!elementRef.current || !autoSet) return;

        const element = elementRef.current;
        hardwareAccelerationOptimizer.setWillChange(element, properties);

        return () => {
            if (removeOnUnmount) {
                hardwareAccelerationOptimizer.removeWillChange(element, properties);
            }
        };
    }, [elementRef, properties, autoSet, removeOnUnmount]);

    const setWillChange = useCallback((newProperties: string[]) => {
        if (!elementRef.current) return;
        
        hardwareAccelerationOptimizer.setWillChange(elementRef.current, newProperties);
    }, [elementRef]);

    const removeWillChange = useCallback((propertiesToRemove?: string[]) => {
        if (!elementRef.current) return;
        
        hardwareAccelerationOptimizer.removeWillChange(elementRef.current, propertiesToRemove);
    }, [elementRef]);

    return {
        setWillChange,
        removeWillChange,
    };
};

/**
 * Hook for composite layer optimization
 */
export const useCompositeLayer = (
    elementRef: React.RefObject<HTMLElement>,
    options: {
        forceLayer?: boolean;
        autoPromote?: boolean;
    } = {}
) => {
    const { forceLayer = false, autoPromote = false } = options;

    useEffect(() => {
        if (!elementRef.current || !autoPromote) return;

        const element = elementRef.current;
        const result = hardwareAccelerationOptimizer.optimizeElement(element, {
            forceLayer,
            optimizeTransforms: true,
            optimizeOpacity: true,
        });

        return () => {
            if (result.success) {
                hardwareAccelerationOptimizer.removeAcceleration(element);
            }
        };
    }, [elementRef, forceLayer, autoPromote]);

    const promoteToLayer = useCallback(() => {
        if (!elementRef.current) return null;
        
        return hardwareAccelerationOptimizer.optimizeElement(elementRef.current, {
            forceLayer: true,
            optimizeTransforms: true,
            optimizeOpacity: true,
        });
    }, [elementRef]);

    return {
        promoteToLayer,
    };
};