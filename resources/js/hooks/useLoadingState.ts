import { useEffect, useState, useCallback, useRef } from 'react';
import { loadingStateManager } from '@/lib/loadingStateManager';

/**
 * Hook for managing loading states
 */
export const useLoadingState = (key?: string) => {
    const [isLoading, setIsLoading] = useState(false);
    const [globalLoading, setGlobalLoading] = useState(loadingStateManager.isLoading());
    const keyRef = useRef(key || `loading-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

    useEffect(() => {
        // Subscribe to global loading state changes
        const unsubscribe = loadingStateManager.onLoadingStateChange(setGlobalLoading);
        
        return unsubscribe;
    }, []);

    const startLoading = useCallback((metadata?: any) => {
        loadingStateManager.setLoadingState(keyRef.current, true, metadata);
        setIsLoading(true);
    }, []);

    const stopLoading = useCallback(() => {
        loadingStateManager.setLoadingState(keyRef.current, false);
        setIsLoading(false);
    }, []);

    const getLoadingState = useCallback(() => {
        return loadingStateManager.getLoadingState(keyRef.current);
    }, []);

    return {
        isLoading,
        globalLoading,
        startLoading,
        stopLoading,
        getLoadingState,
        key: keyRef.current,
    };
};

/**
 * Hook for progressive loading
 */
export const useProgressiveLoading = (
    stages: Array<{ name: string; duration?: number; action?: () => void }>,
    options?: { autoAdvance?: boolean; showProgress?: boolean }
) => {
    const [currentStage, setCurrentStage] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const keyRef = useRef(`progressive-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

    const startProgressiveLoading = useCallback(() => {
        const loader = loadingStateManager.createProgressiveLoader(
            keyRef.current,
            stages,
            options
        );
        
        loadingStateManager.startProgressiveLoader(keyRef.current);
        setIsActive(true);
        setCurrentStage(0);
        setProgress(0);
    }, [stages, options]);

    const advanceStage = useCallback(() => {
        loadingStateManager.advanceProgressiveLoader(keyRef.current);
        const newProgress = loadingStateManager.getProgressiveLoaderProgress(keyRef.current);
        setProgress(newProgress);
        
        if (newProgress >= 100) {
            setIsActive(false);
        } else {
            setCurrentStage(prev => prev + 1);
        }
    }, []);

    const completeLoading = useCallback(() => {
        loadingStateManager.completeProgressiveLoader(keyRef.current);
        setIsActive(false);
        setProgress(100);
    }, []);

    return {
        currentStage,
        progress,
        isActive,
        startProgressiveLoading,
        advanceStage,
        completeLoading,
        currentStageName: stages[currentStage]?.name || '',
    };
};

/**
 * Hook for skeleton loading transitions
 */
export const useSkeletonTransition = () => {
    const [isTransitioning, setIsTransitioning] = useState(false);

    const transitionFromSkeleton = useCallback((
        skeletonElement: HTMLElement,
        contentElement: HTMLElement,
        options?: {
            duration?: number;
            fadeOut?: boolean;
            slideUp?: boolean;
        }
    ) => {
        setIsTransitioning(true);
        
        loadingStateManager.createSkeletonTransition(
            skeletonElement,
            contentElement,
            {
                ...options,
                onComplete: () => setIsTransitioning(false),
            } as any
        );
    }, []);

    return {
        isTransitioning,
        transitionFromSkeleton,
    };
};

/**
 * Hook for loading spinner management
 */
export const useLoadingSpinner = () => {
    const spinnerRef = useRef<HTMLElement | null>(null);

    const showSpinner = useCallback((
        container: HTMLElement,
        options?: {
            size?: 'small' | 'medium' | 'large';
            color?: 'blue' | 'gray' | 'green' | 'red';
            text?: string;
            showText?: boolean;
        }
    ) => {
        if (spinnerRef.current) {
            hideSpinner();
        }
        
        spinnerRef.current = loadingStateManager.createLoadingSpinner(container, options);
    }, []);

    const hideSpinner = useCallback(() => {
        if (spinnerRef.current) {
            loadingStateManager.removeLoadingSpinner(spinnerRef.current);
            spinnerRef.current = null;
        }
    }, []);

    useEffect(() => {
        return () => {
            hideSpinner();
        };
    }, [hideSpinner]);

    return {
        showSpinner,
        hideSpinner,
        isVisible: !!spinnerRef.current,
    };
};

/**
 * Hook for async operation loading states
 */
export const useAsyncLoading = <T>(
    asyncFunction: () => Promise<T>,
    dependencies: any[] = []
) => {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const { isLoading, startLoading, stopLoading } = useLoadingState();

    const execute = useCallback(async () => {
        try {
            setError(null);
            startLoading();
            const result = await asyncFunction();
            setData(result);
            return result;
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            stopLoading();
        }
    }, [asyncFunction, startLoading, stopLoading]);

    useEffect(() => {
        execute();
    }, dependencies);

    const retry = useCallback(() => {
        execute();
    }, [execute]);

    return {
        data,
        error,
        isLoading,
        retry,
        execute,
    };
};

/**
 * Hook for loading state statistics
 */
export const useLoadingStats = () => {
    const [stats, setStats] = useState(loadingStateManager.getLoadingStats());

    useEffect(() => {
        const interval = setInterval(() => {
            setStats(loadingStateManager.getLoadingStats());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return stats;
};

/**
 * Hook for content loading with skeleton
 */
export const useContentLoading = <T>(
    loadFunction: () => Promise<T>,
    options: {
        showSkeleton?: boolean;
        skeletonDuration?: number;
        retryAttempts?: number;
    } = {}
) => {
    const {
        showSkeleton = true,
        skeletonDuration = 500,
        retryAttempts = 3,
    } = options;

    const [content, setContent] = useState<T | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [showSkeletonState, setShowSkeletonState] = useState(showSkeleton);
    const [retryCount, setRetryCount] = useState(0);
    const { isLoading, startLoading, stopLoading } = useLoadingState();

    const loadContent = useCallback(async () => {
        try {
            setError(null);
            startLoading();
            
            if (showSkeleton) {
                setShowSkeletonState(true);
                // Minimum skeleton display time for better UX
                await new Promise(resolve => setTimeout(resolve, skeletonDuration));
            }

            const result = await loadFunction();
            setContent(result);
            setShowSkeletonState(false);
            setRetryCount(0);
            
        } catch (err) {
            setError(err as Error);
            setShowSkeletonState(false);
            
            // Auto-retry if attempts remaining
            if (retryCount < retryAttempts) {
                setTimeout(() => {
                    setRetryCount(prev => prev + 1);
                    loadContent();
                }, 1000 * Math.pow(2, retryCount)); // Exponential backoff
            }
        } finally {
            stopLoading();
        }
    }, [loadFunction, showSkeleton, skeletonDuration, retryCount, retryAttempts, startLoading, stopLoading]);

    const retry = useCallback(() => {
        setRetryCount(0);
        loadContent();
    }, [loadContent]);

    useEffect(() => {
        loadContent();
    }, []);

    return {
        content,
        error,
        isLoading,
        showSkeleton: showSkeletonState,
        retryCount,
        canRetry: retryCount < retryAttempts,
        retry,
    };
};