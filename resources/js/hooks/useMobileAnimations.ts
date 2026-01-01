import { useEffect, useState, useCallback } from 'react';
import { mobileAnimationOptimizer } from '@/lib/mobileAnimationOptimizer';

/**
 * Hook for mobile-optimized animations
 */
export const useMobileAnimations = () => {
    const [deviceInfo, setDeviceInfo] = useState(mobileAnimationOptimizer.getDeviceInfo());
    const [shouldReduceAnimations, setShouldReduceAnimations] = useState(
        mobileAnimationOptimizer.shouldUseReducedAnimations()
    );

    useEffect(() => {
        // Update device info periodically (for battery level changes)
        const interval = setInterval(() => {
            setDeviceInfo(mobileAnimationOptimizer.getDeviceInfo());
            setShouldReduceAnimations(mobileAnimationOptimizer.shouldUseReducedAnimations());
        }, 30000); // Every 30 seconds

        return () => clearInterval(interval);
    }, []);

    const getOptimizedSettings = useCallback(() => {
        return mobileAnimationOptimizer.getMobileOptimizedSettings();
    }, []);

    const optimizeElement = useCallback((element: HTMLElement) => {
        mobileAnimationOptimizer.optimizeElementForMobile(element);
    }, []);

    const createTouchOptimizedAnimation = useCallback((
        element: HTMLElement,
        animation: any,
        options?: { touchFeedback?: boolean; preventScrolling?: boolean }
    ) => {
        return mobileAnimationOptimizer.createTouchOptimizedAnimation(element, animation, options);
    }, []);

    return {
        deviceInfo,
        shouldReduceAnimations,
        isMobile: deviceInfo.isMobile,
        isLowPowered: deviceInfo.isLowPowered,
        touchSupported: deviceInfo.touchSupported,
        getOptimizedSettings,
        optimizeElement,
        createTouchOptimizedAnimation,
    };
};

/**
 * Hook for touch-optimized interactive elements
 */
export const useTouchOptimized = (
    elementRef: React.RefObject<HTMLElement>,
    options: {
        touchFeedback?: boolean;
        preventScrolling?: boolean;
        onClick?: () => void;
    } = {}
) => {
    const { touchFeedback = true, preventScrolling = false, onClick } = options;
    const { touchSupported, optimizeElement } = useMobileAnimations();

    useEffect(() => {
        if (!elementRef.current || !touchSupported) return;

        const element = elementRef.current;
        
        // Optimize element for mobile
        optimizeElement(element);

        // Add touch feedback
        if (touchFeedback) {
            let isPressed = false;

            const handleTouchStart = () => {
                if (!isPressed) {
                    isPressed = true;
                    element.style.transform = 'scale(0.95)';
                    element.style.transition = 'transform 0.1s ease-out';
                }
            };

            const handleTouchEnd = () => {
                if (isPressed) {
                    isPressed = false;
                    element.style.transform = '';
                    setTimeout(() => {
                        element.style.transition = '';
                    }, 100);
                }
            };

            const handleClick = () => {
                if (onClick) {
                    onClick();
                }
            };

            element.addEventListener('touchstart', handleTouchStart, { passive: true });
            element.addEventListener('touchend', handleTouchEnd, { passive: true });
            element.addEventListener('touchcancel', handleTouchEnd, { passive: true });
            
            if (onClick) {
                element.addEventListener('click', handleClick);
            }

            // Prevent scrolling if requested
            if (preventScrolling) {
                const handleTouchMove = (e: TouchEvent) => {
                    e.preventDefault();
                };
                element.addEventListener('touchmove', handleTouchMove, { passive: false });
            }

            return () => {
                element.removeEventListener('touchstart', handleTouchStart);
                element.removeEventListener('touchend', handleTouchEnd);
                element.removeEventListener('touchcancel', handleTouchEnd);
                
                if (onClick) {
                    element.removeEventListener('click', handleClick);
                }
            };
        }
    }, [elementRef, touchFeedback, preventScrolling, onClick, touchSupported, optimizeElement]);
};

/**
 * Hook for mobile-aware animation settings
 */
export const useMobileAwareAnimation = (baseAnimation: any) => {
    const { getOptimizedSettings, shouldReduceAnimations } = useMobileAnimations();

    const optimizedAnimation = useCallback(() => {
        if (shouldReduceAnimations) {
            return {
                ...baseAnimation,
                duration: 0.1,
                ease: 'none',
            };
        }

        const settings = getOptimizedSettings();
        return {
            ...baseAnimation,
            duration: settings.duration,
            ease: settings.ease,
            force3D: settings.useHardwareAcceleration,
        };
    }, [baseAnimation, shouldReduceAnimations, getOptimizedSettings]);

    return optimizedAnimation();
};

/**
 * Hook for detecting mobile device capabilities
 */
export const useMobileDetection = () => {
    const [deviceInfo, setDeviceInfo] = useState(mobileAnimationOptimizer.getDeviceInfo());

    useEffect(() => {
        // Update device info on orientation change
        const handleOrientationChange = () => {
            setTimeout(() => {
                setDeviceInfo(mobileAnimationOptimizer.getDeviceInfo());
            }, 100);
        };

        window.addEventListener('orientationchange', handleOrientationChange);
        window.addEventListener('resize', handleOrientationChange);

        return () => {
            window.removeEventListener('orientationchange', handleOrientationChange);
            window.removeEventListener('resize', handleOrientationChange);
        };
    }, []);

    return deviceInfo;
};

/**
 * Hook for battery-aware animations
 */
export const useBatteryAwareAnimations = () => {
    const [batteryLevel, setBatteryLevel] = useState(1);
    const [isCharging, setIsCharging] = useState(true);

    useEffect(() => {
        if (typeof navigator === 'undefined' || !(navigator as any).getBattery) return;

        (navigator as any).getBattery().then((battery: any) => {
            setBatteryLevel(battery.level);
            setIsCharging(battery.charging);

            const updateBattery = () => {
                setBatteryLevel(battery.level);
                setIsCharging(battery.charging);
            };

            battery.addEventListener('levelchange', updateBattery);
            battery.addEventListener('chargingchange', updateBattery);

            return () => {
                battery.removeEventListener('levelchange', updateBattery);
                battery.removeEventListener('chargingchange', updateBattery);
            };
        }).catch(() => {
            // Battery API not supported
        });
    }, []);

    const shouldUsePowerSavingMode = batteryLevel < 0.2 && !isCharging;

    return {
        batteryLevel,
        isCharging,
        shouldUsePowerSavingMode,
    };
};