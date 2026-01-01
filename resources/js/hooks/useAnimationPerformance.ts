import { useEffect, useState, useCallback } from 'react';
import { animationPerformanceMonitor } from '@/lib/animationPerformanceMonitor';

/**
 * Hook for monitoring animation performance
 */
export const useAnimationPerformance = (options: {
    autoStart?: boolean;
    reportInterval?: number;
} = {}) => {
    const { autoStart = true, reportInterval = 5000 } = options;
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [performanceReport, setPerformanceReport] = useState<any>(null);

    useEffect(() => {
        if (autoStart) {
            animationPerformanceMonitor.startMonitoring();
            setIsMonitoring(true);
        }

        // Update performance report periodically
        const interval = setInterval(() => {
            if (animationPerformanceMonitor) {
                setPerformanceReport(animationPerformanceMonitor.getPerformanceReport());
            }
        }, reportInterval);

        return () => {
            clearInterval(interval);
            if (autoStart) {
                animationPerformanceMonitor.stopMonitoring();
                setIsMonitoring(false);
            }
        };
    }, [autoStart, reportInterval]);

    const startMonitoring = useCallback(() => {
        animationPerformanceMonitor.startMonitoring();
        setIsMonitoring(true);
    }, []);

    const stopMonitoring = useCallback(() => {
        animationPerformanceMonitor.stopMonitoring();
        setIsMonitoring(false);
    }, []);

    const measureAnimation = useCallback((name: string) => {
        return {
            start: () => animationPerformanceMonitor.startAnimationMeasure(name),
            end: (metadata?: any) => animationPerformanceMonitor.endAnimationMeasure(name, metadata),
        };
    }, []);

    const getRecommendations = useCallback(() => {
        return animationPerformanceMonitor.getPerformanceRecommendations();
    }, []);

    const exportData = useCallback(() => {
        return animationPerformanceMonitor.exportPerformanceData();
    }, []);

    return {
        isMonitoring,
        performanceReport,
        startMonitoring,
        stopMonitoring,
        measureAnimation,
        getRecommendations,
        exportData,
        isPerformanceAcceptable: animationPerformanceMonitor.isPerformanceAcceptable(),
    };
};

/**
 * Hook for measuring individual animation performance
 */
export const useAnimationMeasure = (animationName: string) => {
    const measureRef = useCallback(() => {
        return {
            start: () => animationPerformanceMonitor.startAnimationMeasure(animationName),
            end: (metadata?: any) => animationPerformanceMonitor.endAnimationMeasure(animationName, metadata),
        };
    }, [animationName]);

    return measureRef;
};

/**
 * Hook for performance debugging in development
 */
export const usePerformanceDebugger = () => {
    const [debugInfo, setDebugInfo] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (process.env.NODE_ENV !== 'development') return;

        const updateDebugInfo = () => {
            setDebugInfo(animationPerformanceMonitor.getPerformanceReport());
        };

        const interval = setInterval(updateDebugInfo, 1000);
        updateDebugInfo();

        // Toggle debug panel with keyboard shortcut
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'P') {
                setIsVisible(prev => !prev);
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            clearInterval(interval);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return {
        debugInfo,
        isVisible,
        setIsVisible,
        recommendations: animationPerformanceMonitor.getPerformanceRecommendations(),
    };
};